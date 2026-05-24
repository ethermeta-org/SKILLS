import { getJointProfile } from "../core/joint-profile.js";
import { getMaterialById } from "../core/data-loader.js";
import { defocusSignFromMm, estimatePenetrationDepthMm } from "../core/process-params.js";
import {
  buildAcceptanceCriteria,
  buildAssumptions,
  buildMissingInputs,
  buildValidationPlan,
} from "../core/presales.js";
import {
  DISCLAIMER,
  type JointProfile,
  type ProcessRecommendInput,
  type ProcessRecommendResult,
  type ProcessWindowResult,
} from "../core/types.js";
import { lineEnergyDensityJPerMm } from "../core/units.js";
import { assessMaterial } from "../stage1/process-window.js";
import { recommendHardware } from "../stage2/laser-selector.js";
import { generateDoeMatrix, type DoeMatrixInput } from "../stage3/doe-matrix.js";
import { composeSolutionBom } from "../stage4/solution-bom.js";

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function boundedMin(value: number, min: number): number {
  return Math.max(min, value);
}

function unique(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

export interface RecommendationDoeSeed {
  powerW: number;
  speedMmPerS: number;
  defocusMm: number;
  gasLpm: number;
  profile: JointProfile;
  wantsWireFeed: boolean;
}

export function deriveRecommendationDoeInput(seed: RecommendationDoeSeed): DoeMatrixInput {
  const powerSpread = seed.profile.process.doePowerSpread;
  const speedSpread = seed.profile.process.doeSpeedSpread;
  const input: DoeMatrixInput = {
    powerMin: Math.round(boundedMin(seed.powerW * (1 - powerSpread), 1)),
    powerMax: Math.round(seed.powerW * (1 + powerSpread)),
    speedMin: round(boundedMin(seed.speedMmPerS * (1 - speedSpread), 0.1), 1),
    speedMax: round(seed.speedMmPerS * (1 + speedSpread), 1),
    gridSize: 3,
    defocusMin: round(seed.defocusMm - 0.5, 2),
    defocusMax: round(seed.defocusMm + 0.5, 2),
    shieldGasMin: round(boundedMin(seed.gasLpm - 3, 1), 1),
    shieldGasMax: round(seed.gasLpm + 3, 1),
  };

  if (seed.profile.doe.includeGapAxis) {
    input.includeGapAxis = true;
    input.gapMin = seed.profile.doe.gapMinMm ?? 0.02;
    input.gapMax = seed.profile.doe.gapMaxMm ?? 0.2;
  }

  if (seed.wantsWireFeed) {
    input.wireSpeedMin = 20;
    input.wireSpeedMax = 60;
    input.wireFeedAngleMin = 25;
    input.wireFeedAngleMax = 45;
  }

  return input;
}

function applyJointProcessModifiers(
  base: ProcessWindowResult,
  profile: JointProfile,
): ProcessWindowResult {
  const powerW = Math.round(base.powerW * profile.process.powerFactor);
  const speedMmPerS = round(base.speedMmPerS * profile.process.speedFactor, 1);
  const defocusMm = round(base.defocusMm + profile.process.defocusOffsetMm, 2);
  const lineEnergyJPerMm = round(lineEnergyDensityJPerMm(powerW, speedMmPerS), 1);
  const materialFactor = getMaterialById(base.materialId)?.materialFactor;

  return {
    ...base,
    powerW,
    speedMmPerS,
    lineEnergyJPerMm,
    defocusMm,
    processParams: base.processParams
      ? {
          ...base.processParams,
          powerW,
          speedMmPerS,
          defocus: {
            valueMm: Math.abs(defocusMm),
            sign: defocusSignFromMm(defocusMm),
          },
          penetrationDepthMm:
            materialFactor !== undefined
              ? estimatePenetrationDepthMm(lineEnergyJPerMm, materialFactor)
              : base.processParams.penetrationDepthMm,
        }
      : base.processParams,
    warnings: unique([...base.warnings, ...profile.risks.map((risk) => `Joint risk: ${risk}.`)]),
  };
}

function wantsWireFeed(input: ProcessRecommendInput): boolean {
  return (
    input.wireFeedMode != null ||
    input.brazingWireFamily != null ||
    input.applicationScenario === "laser-brazing" ||
    input.applicationScenario === "push-pull-brazing"
  );
}

export function recommendProcess(input: ProcessRecommendInput): ProcessRecommendResult {
  const profile = getJointProfile(input.weldingMethod);
  const seamType = profile.defaultSeamType;
  const deliveryScope = input.deliveryScope ?? "presales-solution";
  const application = input.application ?? input.applicationScenario ?? profile.jointType;

  const processWindow = applyJointProcessModifiers(
    assessMaterial({
      material: input.material,
      thicknessMm: input.thicknessMm,
      jointType: profile.jointType,
      baseMaterialB: input.baseMaterialB,
      thicknessBMm: input.thicknessBMm,
      applicationScenario: input.applicationScenario,
      qualityTargets: input.qualityTargets,
      coating: input.coating,
      surfaceCondition: input.surfaceCondition,
      lightTransmittance: input.lightTransmittance,
      targetSpeedMmPerS: input.targetSpeedMmPerS,
      gapMm: input.gapMm,
      wireFill: input.wireFill,
      wireDiameterMm: input.wireDiameterMm,
      targetPenetrationDepthMm: input.targetPenetrationDepthMm,
      brazingWireFamily: input.brazingWireFamily,
    }),
    profile,
  );

  const shared = {
    material: input.material,
    thicknessMm: input.thicknessMm,
    application,
    applicationScenario: input.applicationScenario,
    deliveryScope,
    baseMaterialB: input.baseMaterialB,
    thicknessBMm: input.thicknessBMm,
    jointType: profile.jointType,
    seamType,
    seamLengthMm: input.seamLengthMm,
    qualityTargets: input.qualityTargets,
    coating: input.coating,
    surfaceCondition: input.surfaceCondition,
    lightTransmittance: input.lightTransmittance,
    wireFill: input.wireFill,
    gapMm: input.gapMm,
    targetTaktSec: input.targetTaktSec,
    partsPerHour: input.partsPerHour,
    stationCount: input.stationCount,
    motionPlatform: input.motionPlatform,
    laserHead: input.laserHead,
    preferredLaserType: input.preferredLaserType,
    wireFeedMode: input.wireFeedMode,
    wireFeedOrientation: input.wireFeedOrientation,
    brazingWireFamily: input.brazingWireFamily,
    fieldbusProtocol: input.fieldbusProtocol,
    includeVision: input.includeVision,
    preferredBrands: input.preferredBrands,
    forbiddenBrands: input.forbiddenBrands,
    budgetLevel: input.budgetLevel,
  };

  const hardware = recommendHardware(shared);
  const bom = composeSolutionBom(shared);
  const doe = generateDoeMatrix(
    deriveRecommendationDoeInput({
      powerW: processWindow.powerW,
      speedMmPerS: processWindow.speedMmPerS,
      defocusMm: processWindow.defocusMm,
      gasLpm: processWindow.shieldGasLpm,
      profile,
      wantsWireFeed: wantsWireFeed(input),
    }),
  );

  const presalesCtx = {
    applicationScenario: input.applicationScenario,
    deliveryScope,
    baseMaterialB: input.baseMaterialB,
    thicknessBMm: input.thicknessBMm,
    jointType: profile.jointType,
    seamType,
    seamLengthMm: input.seamLengthMm,
    qualityTargets: input.qualityTargets,
    targetTaktSec: input.targetTaktSec,
    partsPerHour: input.partsPerHour,
    stationCount: input.stationCount,
    coating: input.coating,
    surfaceCondition: input.surfaceCondition,
  };
  const missingInputs = buildMissingInputs(presalesCtx);
  const assumptions = unique([
    ...buildAssumptions(presalesCtx),
    ...bom.assumptions,
    input.baseMaterialB ? undefined : "Second material is assumed same or compatible until confirmed.",
    input.qualityTargets?.length
      ? undefined
      : "Quality target is assumed general strength and appearance until confirmed.",
  ]);
  const validationPlan = unique([
    ...profile.validationEmphasis,
    ...buildValidationPlan(presalesCtx),
    ...bom.validationPlan,
  ]);
  const acceptanceCriteria = unique([
    ...profile.acceptanceEmphasis,
    ...buildAcceptanceCriteria(presalesCtx),
    ...bom.acceptanceCriteria,
  ]);

  return {
    materialId: processWindow.materialId,
    thicknessMm: input.thicknessMm,
    weldingMethod: profile.method,
    weldingMethodName: profile.displayName,
    jointType: profile.jointType,
    seamType,
    processWindow,
    hardware,
    doe,
    bom,
    equipmentHints: profile.equipmentHints,
    fixtureHints: profile.fixtureHints,
    inspectionHints: profile.inspectionHints,
    risks: unique([
      ...profile.risks,
      ...processWindow.warnings.filter((warning) => !warning.startsWith("Joint risk: ")),
      ...bom.warnings,
    ]),
    validationPlan,
    acceptanceCriteria,
    assumptions,
    inputsToConfirm: unique(missingInputs.filter((field) => field !== "jointType" && field !== "seamType")),
    confidence: "heuristic",
    disclaimer: DISCLAIMER,
  };
}
