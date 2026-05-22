import { assessMaterial } from "../stage1/process-window.js";
import { applicationHints } from "../core/aliases.js";
import { recommendBrazingWire } from "../core/brazing-wire.js";
import {
  buildBomLineItems,
  buildLineLayout,
  summarizeBom,
  type BomBuildContext,
} from "../stage4/bom-builder.js";
import {
  getMaterialById,
  isHeadCompatible,
  loadLasers,
  resolveLaserHead,
  resolveMotionPlatform,
} from "../core/data-loader.js";
import { effectiveTransmittance, resolveWeldMode } from "../core/polymer.js";
import {
  buildAcceptanceCriteria,
  buildAssumptions,
  buildMissingInputs,
  buildValidationPlan,
  inferRiskLevel,
} from "../core/presales.js";
import { recommendWireFeedHead } from "../core/wire-feed-head.js";
import { MaterialNotFoundError, ValidationError } from "../core/errors.js";
import {
  type ApplicationScenario,
  type AutomationLevel,
  type BrazingWireFamily,
  type BudgetLevel,
  DISCLAIMER,
  type DeliveryScope,
  isPolymerCategory,
  type HardwareRecommendResult,
  type LaserHeadId,
  type LaserRecord,
  type LaserType,
  type MotionPlatformId,
  type QualityTarget,
  type WireFeedMode,
  type WireFeedOrientation,
} from "../core/types.js";
import { spotDiameterMm } from "../core/units.js";
import { computeWobble, computeBesselHint } from "./optics.js";

export interface HardwareRecommendInput {
  material: string;
  thicknessMm: number;
  application?: string;
  motionPlatform?: string;
  laserHead?: string;
  preferredLaserType?: LaserType;
  lightTransmittance?: number;
  applicationScenario?: ApplicationScenario;
  deliveryScope?: DeliveryScope;
  automationLevel?: AutomationLevel;
  targetTaktSec?: number;
  annualVolume?: number;
  partsPerHour?: number;
  stationCount?: number;
  preferredBrands?: string[];
  forbiddenBrands?: string[];
  budgetLevel?: BudgetLevel;
  inspectionMethods?: string[];
  seamTrackingRequired?: boolean;
  preheatRequired?: boolean;
  wireFeedMode?: WireFeedMode;
  wireFeedOrientation?: WireFeedOrientation;
  wireFeedAngleDeg?: number;
  wireNozzleOffsetMm?: number;
  wireSpeedMmPerS?: number;
  headCoolingRequired?: boolean;
  collisionEnvelopeNotes?: string;
  brazingWireFamily?: BrazingWireFamily;
  baseMaterialB?: string;
  thicknessBMm?: number;
  jointType?: string;
  seamType?: string;
  seamLengthMm?: number;
  qualityTargets?: QualityTarget[];
  sealingRequired?: boolean;
  coating?: string;
  surfaceCondition?: string;
  wireFill?: boolean;
  gapMm?: number;
  fieldbusProtocol?: "opc-ua" | "profinet" | "ethercat";
  includeVision?: boolean;
  mesIntegrationRequired?: boolean;
}

function scoreLaser(
  laser: LaserRecord,
  wavelengthNm: number,
  highReflect: boolean,
  wantsBrazing: boolean,
  preferredTypes: LaserType[],
): number {
  let score = 0;
  if (laser.wavelengthNm === wavelengthNm) score += 3;
  if (preferredTypes.includes(laser.laserType)) score += 4;
  if (highReflect && laser.applications.some((a) => a.includes("copper") || a.includes("wobble")))
    score += 2;
  if (wantsBrazing && laser.processModes.includes("brazing")) score += 5;
  if (wantsBrazing && laser.capabilities.includes("laser-brazing")) score += 2;
  return score;
}

function pickBalancedBrands(
  candidates: LaserRecord[],
  maxTotal: number,
): Array<{ brand: string; modelSeries: string; powerRangeKW: [number, number] }> {
  const importLasers = candidates.filter((l) => l.region === "import");
  const domesticLasers = candidates.filter((l) => l.region === "domestic");
  const perRegion = Math.max(1, Math.floor(maxTotal / 2));
  const picked: LaserRecord[] = [];
  const seen = new Set<string>();

  for (const group of [importLasers, domesticLasers]) {
    let n = 0;
    for (const l of group) {
      const key = `${l.brand}:${l.modelSeries}`;
      if (seen.has(key) || n >= perRegion) continue;
      seen.add(key);
      picked.push(l);
      n++;
    }
  }

  for (const l of candidates) {
    if (picked.length >= maxTotal) break;
    const key = `${l.brand}:${l.modelSeries}`;
    if (!seen.has(key)) {
      seen.add(key);
      picked.push(l);
    }
  }

  return picked.slice(0, maxTotal).map((l) => ({
    brand: l.brand,
    modelSeries: l.modelSeries,
    powerRangeKW: l.powerRangeKW,
  }));
}

function laserTypesForMaterial(
  mat: ReturnType<typeof getMaterialById>,
  weldMode: ReturnType<typeof resolveWeldMode> | undefined,
): LaserType[] {
  if (!mat) return ["fiber-1064"];
  if (isPolymerCategory(mat.category)) {
    if (weldMode === "transmission") return ["fiber-2um"];
    if (weldMode === "hybrid") return ["fiber-2um", "diode-semiconductor"];
    return ["fiber-2um", "diode-semiconductor"];
  }
  if (mat.reflectivity1064 > 0.85) return ["fiber-green", "diode-blue"];
  return ["fiber-1064"];
}

export function recommendHardware(input: HardwareRecommendInput): HardwareRecommendResult {
  const application = input.application ?? "general-fusion";
  if (input.thicknessMm <= 0) throw new ValidationError("thicknessMm must be positive");

  const mat = getMaterialById(input.material);
  if (!mat) throw new MaterialNotFoundError(input.material);

  const { wantsBrazing, wantsTurnkey } = applicationHints(application);
  const warnings: string[] = [];
  const forbiddenBrands = new Set((input.forbiddenBrands ?? []).map((b) => b.toLowerCase()));
  const preferredBrands = new Set((input.preferredBrands ?? []).map((b) => b.toLowerCase()));
  const highReflect = mat.reflectivity1064 > 0.85;
  const isBatteryTab = application === "battery-tab" || application.includes("tab");
  const isPolymer = isPolymerCategory(mat.category);
  const transmittance = effectiveTransmittance(mat.lightTransmittance, input.lightTransmittance);
  const weldMode = isPolymer ? resolveWeldMode(transmittance) : undefined;
  const preferredLaserTypes = laserTypesForMaterial(mat, weldMode);
  if (input.preferredLaserType) {
    preferredLaserTypes.unshift(input.preferredLaserType);
  }

  let wavelengthNm = 1064;
  let beamDelivery: HardwareRecommendResult["beamDelivery"] = "fiber";
  let weldingHead = "Standard collimation/focus welding head";

  const motionInput = input.motionPlatform ? resolveMotionPlatform(input.motionPlatform) : undefined;
  let motionPlatform: MotionPlatformId | undefined = motionInput as MotionPlatformId | undefined;
  let laserHead: LaserHeadId | undefined = input.laserHead
    ? (resolveLaserHead(input.laserHead) as LaserHeadId | undefined)
    : undefined;

  if (motionPlatform === "galvo-scanner") {
    beamDelivery = "galvo-scanner";
    laserHead = laserHead ?? "galvo";
    weldingHead = "Galvo scanner welding head";
  }

  if (highReflect || mat.id === "copper" || mat.id === "copper-ofc" || isBatteryTab) {
    wavelengthNm = 515;
    if (beamDelivery !== "galvo-scanner") {
      beamDelivery = "wobble";
      weldingHead = "Scan head or wobble welding head with galvo or mechanical oscillator";
    }
    warnings.push("High-reflectivity application: validate with 515nm or ring beam per OEM.");
  }

  if (isPolymer && weldMode === "transmission") {
    wavelengthNm = 2000;
    warnings.push("Polymer transmission weld: 2μm fiber typical; confirm absorptive interface.");
  } else if (isPolymer) {
    wavelengthNm = 2000;
  }

  if (wantsBrazing) {
    beamDelivery = "fiber";
    weldingHead = "Brazing head with push-pull wire feeder (equipment dependent)";
    warnings.push(
      "Laser brazing with push-pull wire: validate wire speed, preheat, and shield gas with DOE per OEM manual.",
    );
  }

  if (wantsTurnkey) {
    warnings.push(
      "Turnkey automation / line integration: use laser-welding-brainstorm to capture takt time, stations, and fieldbus before final OEM selection.",
    );
  }
  if (input.forbiddenBrands && input.forbiddenBrands.length > 0) {
    warnings.push(`Forbidden brands filtered: ${input.forbiddenBrands.join(", ")}.`);
  }
  if (input.budgetLevel) {
    warnings.push(
      `Budget level '${input.budgetLevel}' adjusts BOM/automation complexity only; no commercial values are produced.`,
    );
    if (input.budgetLevel === "low" && wantsTurnkey) {
      warnings.push(
        "Budget level 'low': turnkey PLC/MES/line-integration items are omitted unless fieldbus or vision are explicitly required.",
      );
    }
    if (input.budgetLevel === "high") {
      warnings.push(
        "Budget level 'high': vision QA and automation integration items are included where applicable.",
      );
    }
  }

  if (!motionPlatform && isPolymer && weldMode === "transmission") {
    motionPlatform = "galvo-scanner";
    beamDelivery = "galvo-scanner";
    laserHead = "galvo";
  }
  if (!motionPlatform) motionPlatform = "gantry";
  if (!laserHead) {
    laserHead = motionPlatform === "galvo-scanner" ? "galvo" : "fixed-focus";
  }

  if (motionPlatform && laserHead && !isHeadCompatible(laserHead, motionPlatform)) {
    warnings.push(`Laser head ${laserHead} may be incompatible with motion platform ${motionPlatform}.`);
  }

  const lasers = loadLasers().filter((l) => !forbiddenBrands.has(l.brand.toLowerCase()));
  const ranked = lasers
    .map((l) => ({
      laser: l,
      score: scoreLaser(l, wavelengthNm, highReflect, wantsBrazing, preferredLaserTypes),
    }))
    .filter((x) => x.score > 0 || x.laser.wavelengthNm === wavelengthNm)
    .sort((a, b) => b.score - a.score);
  const rankedWithPreference = ranked
    .map((x) => ({
      ...x,
      score: x.score + (preferredBrands.has(x.laser.brand.toLowerCase()) ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score);

  const recommendedBrands = pickBalancedBrands(
    rankedWithPreference.map((x) => x.laser),
    4,
  );

  const rankedTypes = rankedWithPreference.slice(0, 6).map((x) => x.laser.laserType);
  const recommendedLaserTypes = [
    ...new Set([...preferredLaserTypes, ...rankedTypes]),
  ].slice(0, 4) as LaserType[];

  const focalLengthMm = isBatteryTab ? 160 : 200;
  const beamDiameterMmVal = 0.6;
  const spotD = spotDiameterMm(wavelengthNm, focalLengthMm, beamDiameterMmVal);

  const wobble = beamDelivery === "wobble" ? computeWobble(spotD, mat.id) : undefined;
  const bessel = computeBesselHint(mat.id, input.thicknessMm);
  const scenario = input.applicationScenario;
  const wantsWireFeedHead =
    scenario === "push-pull-brazing" || wantsBrazing || input.wireFeedMode === "push-pull";

  const wireFeedHeadRecommendation = wantsWireFeedHead
    ? recommendWireFeedHead({
        applicationScenario: scenario,
        motionPlatform,
        wireFeedMode: input.wireFeedMode,
        wireFeedOrientation: input.wireFeedOrientation,
        headCoolingRequired: input.headCoolingRequired,
        seamTrackingRequired: input.seamTrackingRequired,
        preheatRequired: input.preheatRequired,
        collisionEnvelopeNotes: input.collisionEnvelopeNotes,
      })
    : undefined;

  const brazingWireRecommendation =
    wantsWireFeedHead || scenario === "laser-brazing" || input.brazingWireFamily
      ? recommendBrazingWire({
          baseMaterialA: mat.id,
          baseMaterialB: input.baseMaterialB,
          applicationScenario: scenario,
          brazingWireFamily: input.brazingWireFamily,
          appearancePriority: input.qualityTargets?.includes("appearance"),
          wettingPriority: scenario === "laser-brazing" || scenario === "push-pull-brazing",
          strengthPriority: input.qualityTargets?.includes("strength"),
        })
      : undefined;

  const presalesCtx = {
    applicationScenario: scenario,
    deliveryScope: input.deliveryScope,
    baseMaterialB: input.baseMaterialB,
    thicknessBMm: input.thicknessBMm,
    jointType: input.jointType,
    seamType: input.seamType,
    seamLengthMm: input.seamLengthMm,
    qualityTargets: input.qualityTargets,
    targetTaktSec: input.targetTaktSec,
    annualVolume: input.annualVolume,
    partsPerHour: input.partsPerHour,
    stationCount: input.stationCount,
    coating: input.coating,
    surfaceCondition: input.surfaceCondition,
    sealingRequired: input.sealingRequired,
  };
  const missingInputs = buildMissingInputs(presalesCtx);
  const assumptions = buildAssumptions(presalesCtx);
  const riskLevel = inferRiskLevel(missingInputs, assumptions);
  const validationPlan = buildValidationPlan(presalesCtx);
  const acceptanceCriteria = buildAcceptanceCriteria(presalesCtx);

  const hwBase = {
    materialId: mat.id,
    thicknessMm: input.thicknessMm,
    application,
    wavelengthNm,
    recommendedBrands,
    recommendedLaserTypes,
    motionPlatform,
    laserHead,
    beamDelivery,
    weldingHead,
    optics: {
      focalLengthMm,
      spotDiameterMm: Math.round(spotD * 100) / 100,
      wobble,
      bessel,
    },
    assumptions,
    missingInputs,
    riskLevel,
    validationPlan,
    acceptanceCriteria,
    wireFeedHeadRecommendation,
    brazingWireRecommendation,
    confidence: "heuristic" as const,
    disclaimer: DISCLAIMER,
    warnings,
  };

  const assess = assessMaterial({
    material: input.material,
    thicknessMm: input.thicknessMm,
    lightTransmittance: input.lightTransmittance,
    baseMaterialB: input.baseMaterialB,
    thicknessBMm: input.thicknessBMm,
    applicationScenario: input.applicationScenario,
    qualityTargets: input.qualityTargets,
    coating: input.coating,
    surfaceCondition: input.surfaceCondition,
    brazingWireFamily: input.brazingWireFamily,
  });

  const bomCtx: BomBuildContext = {
    materialId: mat.id,
    application,
    estimatedPowerW: assess.powerW,
    weldMode: assess.weldMode,
    wireFill: input.wireFill,
    gapMm: input.gapMm,
    fieldbusProtocol: input.fieldbusProtocol,
    includeVision: input.includeVision,
    applicationScenario: input.applicationScenario,
    wireFeedHeadRequired: Boolean(wireFeedHeadRecommendation),
    brazingWireRequired: Boolean(brazingWireRecommendation),
    preheatRequired: input.preheatRequired,
    seamTrackingRequired: input.seamTrackingRequired,
    budgetLevel: input.budgetLevel,
    mesIntegrationRequired: input.mesIntegrationRequired,
  };

  const lineItems = buildBomLineItems(hwBase as HardwareRecommendResult, bomCtx);

  return {
    ...hwBase,
    bomSummary: summarizeBom(lineItems),
    lineLayout: buildLineLayout(lineItems, bomCtx),
  };
}
