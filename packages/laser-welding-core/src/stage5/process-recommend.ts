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
  type MonitoringPlanItem,
  type ProcessRecommendInput,
  type ProcessRecommendResult,
  type ProcessWindowResult,
  type RecipeManagement,
  type SafetyInterlock,
  type TuningWorkflowStep,
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
  usesShieldingNozzle?: boolean;
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
    wobbleAmplitudeMin: 0.2,
    wobbleAmplitudeMax: 0.8,
    wobbleFrequencyMin: 150,
    wobbleFrequencyMax: 350,
    coolingWaterTempMin: 20,
    coolingWaterTempMax: 26,
    coolingFlowMin: 3,
    coolingFlowMax: 6,
  };

  if (seed.usesShieldingNozzle !== false) {
    input.nozzleDistanceMin = 8;
    input.nozzleDistanceMax = 14;
  }

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
            laser: base.processParams.laser
              ? {
                  ...base.processParams.laser,
                  powerW,
                  averagePowerW: powerW,
                }
              : base.processParams.laser,
            defocus: {
              valueMm: Math.abs(defocusMm),
              sign: defocusSignFromMm(defocusMm),
            },
            optics: base.processParams.optics
              ? {
                  ...base.processParams.optics,
                  defocus: {
                    valueMm: Math.abs(defocusMm),
                    sign: defocusSignFromMm(defocusMm),
                  },
                  focusPosition:
                    defocusMm < -0.01
                      ? "subsurface"
                      : defocusMm > 0.01
                        ? "above-surface"
                        : "surface",
                }
              : base.processParams.optics,
            motion: base.processParams.motion
              ? {
                  ...base.processParams.motion,
                  weldSpeedMmPerS: speedMmPerS,
                }
              : base.processParams.motion,
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

function usesShieldingNozzle(input: ProcessRecommendInput): boolean {
  return input.motionPlatform !== "galvo-scanner" && input.laserHead !== "galvo";
}

function applyShieldingNozzleApplicability(
  base: ProcessWindowResult,
  usesNozzle: boolean,
): ProcessWindowResult {
  if (usesNozzle || !base.processParams?.shielding) return base;
  const shielding = { ...base.processParams.shielding };
  delete shielding.nozzleDistanceMm;
  delete shielding.nozzleAngleDeg;
  return {
    ...base,
    processParams: {
      ...base.processParams,
      shielding,
    },
  };
}

function buildTuningWorkflow(
  input: ProcessRecommendInput,
  profile: JointProfile,
): TuningWorkflowStep[] {
  return [
    {
      stage: "target-and-joint",
      objective: "Confirm weld objective, material pair, thickness, joint form, and acceptance target.",
      primaryParameters: ["material", "thicknessMm", "weldingMethod", "qualityTargets"],
      checks: ["joint fit-up", "surface condition", "gap", "fixture repeatability"],
    },
    {
      stage: "energy-focus",
      objective: "Set the first stable energy input before fine tuning auxiliary variables.",
      primaryParameters: ["powerW", "speedMmPerS", "defocusMm", "spotDiameterMm"],
      checks: ["penetration", "weld width", "burn-through", "lack of fusion"],
    },
    {
      stage: "shielding-cooling",
      objective: "Stabilize weld pool protection and thermal state.",
      primaryParameters: ["gasType", "shieldGasLpm", "nozzleDistanceMm", "coolingWaterTempC"],
      checks: ["oxidation", "porosity", "temperature rise", "cooling alarm margin"],
    },
    {
      stage: "scan-motion",
      objective: "Distribute heat and correct path placement after the base energy window is stable.",
      primaryParameters: ["wobbleAmplitudeMm", "wobbleFrequencyHz", "scanWidthMm", "xOffsetMm", "yOffsetMm"],
      checks: [profile.defaultSeamType, "weld continuity", "edge alignment", "heat accumulation"],
    },
    {
      stage: "observe-and-refine",
      objective: "Use monitoring feedback to change one key variable at a time.",
      primaryParameters: ["vision-position", "power-feedback", "temperature", "reflected-light"],
      checks: ["process drift", "spot quality", "abnormal reflection", "weld bead consistency"],
    },
    {
      stage: "recipe-release",
      objective: "Lock the validated recipe and define who may edit critical process values.",
      primaryParameters: input.includeVision
        ? ["recipeId", "userRole", "lockedParameters", "visionRecipe"]
        : ["recipeId", "userRole", "lockedParameters"],
      checks: ["trial weld evidence", "operator permissions", "batch pre-check", "change record"],
    },
  ];
}

function buildMonitoringPlan(input: ProcessRecommendInput): MonitoringPlanItem[] {
  const plan: MonitoringPlanItem[] = [
    {
      signal: "vision-position",
      purpose: "Confirm the weld start position before energy is enabled.",
      feedbackAction: "Hold cycle and correct X/Y offset when fixture or part position drifts.",
    },
    {
      signal: "power-feedback",
      purpose: "Detect actual laser output deviation from the recipe.",
      feedbackAction: "Stop or quarantine samples when measured power deviates from the validated window.",
    },
    {
      signal: "temperature",
      purpose: "Watch heat accumulation across repeated welds.",
      feedbackAction: "Reduce duty, add cooling dwell, or widen scan only after position is confirmed.",
    },
    {
      signal: "reflected-light",
      purpose: "Detect abnormal reflection and keyhole instability.",
      feedbackAction: "Review focus, surface condition, and wavelength choice before increasing power.",
    },
  ];

  if (input.includeVision || input.applicationScenario === "battery-tab" || input.applicationScenario === "busbar") {
    plan.splice(1, 0, {
      signal: "seam-tracking",
      purpose: "Track seam drift during long or high-precision welds.",
      feedbackAction: "Adjust path offset or reject the part when tracking error exceeds the fixture capability.",
    });
  }

  return plan;
}

function buildSafetyInterlocks(): SafetyInterlock[] {
  return [
    {
      name: "door-interlock",
      purpose: "Prevent laser emission when the safety enclosure is open.",
      requiredAction: "Disable emission and require reset after door state returns safe.",
    },
    {
      name: "emergency-stop",
      purpose: "Stop motion and laser output during abnormal operation.",
      requiredAction: "Drop laser enable, stop axes, and require operator acknowledgement.",
    },
    {
      name: "cooling-alarm",
      purpose: "Protect laser source and optics from unstable water temperature or flow.",
      requiredAction: "Block cycle start until cooling temperature, flow, and pressure are within limits.",
    },
    {
      name: "gas-pressure-alarm",
      purpose: "Prevent welding without adequate shield gas protection.",
      requiredAction: "Hold cycle and inspect gas supply before retrying the recipe.",
    },
    {
      name: "fault-code",
      purpose: "Keep alarms diagnosable and traceable to process changes.",
      requiredAction: "Record fault source, timestamp, recipe id, and operator acknowledgement.",
    },
  ];
}

function buildRecipeManagement(input: ProcessRecommendInput): RecipeManagement {
  const parametersToLock = [
    "powerW",
    "speedMmPerS",
    "defocusMm",
    "shieldGasLpm",
    "wobbleAmplitudeMm",
    "wobbleFrequencyHz",
  ];
  if (wantsWireFeed(input)) {
    parametersToLock.push("wireSpeedMmPerS", "wireFeedAngleDeg");
  }

  return {
    parametersToLock,
    operatorEditableParameters: ["partId", "fixtureId", "batchId"],
    reviewTriggers: [
      "material batch change",
      "thickness or coating change",
      "fixture replacement",
      "laser head or optics maintenance",
      "monitoring alarm trend",
    ],
  };
}

export function recommendProcess(input: ProcessRecommendInput): ProcessRecommendResult {
  const profile = getJointProfile(input.weldingMethod);
  const seamType = profile.defaultSeamType;
  const deliveryScope = input.deliveryScope ?? "presales-solution";
  const application = input.application ?? input.applicationScenario ?? profile.jointType;

  const processWindow = applyShieldingNozzleApplicability(
    applyJointProcessModifiers(
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
    ),
    usesShieldingNozzle(input),
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
      usesShieldingNozzle: usesShieldingNozzle(input),
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
    tuningWorkflow: buildTuningWorkflow(input, profile),
    monitoringPlan: buildMonitoringPlan(input),
    safetyInterlocks: buildSafetyInterlocks(),
    recipeManagement: buildRecipeManagement(input),
    confidence: "heuristic",
    disclaimer: DISCLAIMER,
  };
}
