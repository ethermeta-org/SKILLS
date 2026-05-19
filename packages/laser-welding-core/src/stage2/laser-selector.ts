import { applicationHints } from "../core/aliases.js";
import {
  getMaterialById,
  isHeadCompatible,
  loadLasers,
  resolveLaserHead,
  resolveMotionPlatform,
} from "../core/data-loader.js";
import { effectiveTransmittance, resolveWeldMode } from "../core/polymer.js";
import { MaterialNotFoundError, ValidationError } from "../core/errors.js";
import {
  DISCLAIMER,
  isPolymerCategory,
  type HardwareRecommendResult,
  type LaserHeadId,
  type LaserRecord,
  type LaserType,
  type MotionPlatformId,
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

  const lasers = loadLasers();
  const ranked = lasers
    .map((l) => ({
      laser: l,
      score: scoreLaser(l, wavelengthNm, highReflect, wantsBrazing, preferredLaserTypes),
    }))
    .filter((x) => x.score > 0 || x.laser.wavelengthNm === wavelengthNm)
    .sort((a, b) => b.score - a.score);

  const recommendedBrands = pickBalancedBrands(
    ranked.map((x) => x.laser),
    4,
  );

  const rankedTypes = ranked.slice(0, 6).map((x) => x.laser.laserType);
  const recommendedLaserTypes = [
    ...new Set([...preferredLaserTypes, ...rankedTypes]),
  ].slice(0, 4) as LaserType[];

  const focalLengthMm = isBatteryTab ? 160 : 200;
  const beamDiameterMmVal = 0.6;
  const spotD = spotDiameterMm(wavelengthNm, focalLengthMm, beamDiameterMmVal);

  const wobble = beamDelivery === "wobble" ? computeWobble(spotD, mat.id) : undefined;
  const bessel = computeBesselHint(mat.id, input.thicknessMm);

  return {
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
    confidence: "heuristic",
    disclaimer: DISCLAIMER,
    warnings,
  };
}
