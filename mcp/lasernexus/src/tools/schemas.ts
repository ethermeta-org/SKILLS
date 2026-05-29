import { z } from "zod";

const applicationScenarioSchema = z.enum([
  "metal-fusion",
  "laser-brazing",
  "push-pull-brazing",
  "polymer-transmission",
  "battery-tab",
  "busbar",
  "seal-welding",
  "custom",
]);

const deliveryScopeSchema = z.enum(["process-package", "equipment-package", "presales-solution"]);
const qualityTargetSchema = z.enum([
  "strength",
  "sealing",
  "conductivity",
  "appearance",
  "low-spatter",
  "low-heat-input",
]);
const automationLevelSchema = z.enum([
  "manual",
  "semi-auto",
  "robot",
  "gantry-line",
  "galvo-line",
  "turnkey-line",
]);
const wireFeedModeSchema = z.enum(["push-pull", "push", "pull", "manual-assist"]);
const wireFeedOrientationSchema = z.enum(["front", "rear", "side", "coaxial", "near-coaxial"]);
const brazingWireFamilySchema = z.enum([
  "CuSi",
  "AlSi",
  "Ni-based",
  "Cu-based",
  "stainless-filler",
  "custom",
]);
const budgetLevelSchema = z.enum(["low", "mid", "high"]);

const presalesFields = {
  baseMaterialB: z.string().optional(),
  thicknessBMm: z.number().positive().optional(),
  coating: z.string().optional(),
  surfaceCondition: z.string().optional(),
  applicationScenario: applicationScenarioSchema.optional(),
  deliveryScope: deliveryScopeSchema.optional(),
  qualityTargets: z.array(qualityTargetSchema).optional(),
  targetStrengthN: z.number().positive().optional(),
  targetShearN: z.number().positive().optional(),
  targetResistanceMicroOhm: z.number().positive().optional(),
  sealingRequired: z.boolean().optional(),
  appearanceGrade: z.string().optional(),
  brazingWireFamily: brazingWireFamilySchema.optional(),
  wireMaterialGrade: z.string().optional(),
  fluxRequired: z.boolean().optional(),
  automationLevel: automationLevelSchema.optional(),
  targetTaktSec: z.number().positive().optional(),
  annualVolume: z.number().positive().optional(),
  partsPerHour: z.number().positive().optional(),
  stationCount: z.number().int().positive().optional(),
  preferredBrands: z.array(z.string()).optional(),
  forbiddenBrands: z.array(z.string()).optional(),
  budgetLevel: budgetLevelSchema.optional(),
  inspectionMethods: z.array(z.string()).optional(),
  seamTrackingRequired: z.boolean().optional(),
  preheatRequired: z.boolean().optional(),
  wireFeedMode: wireFeedModeSchema.optional(),
  wireFeedOrientation: wireFeedOrientationSchema.optional(),
  wireFeedAngleDeg: z.number().min(0).max(90).optional(),
  wireNozzleOffsetMm: z.number().optional(),
  wireSpeedMmPerS: z.number().positive().optional(),
  headCoolingRequired: z.boolean().optional(),
  collisionEnvelopeNotes: z.string().optional(),
};

export const materialAssessSchema = z.object({
  material: z.string().describe("Material id or name, e.g. copper, pa66, 紫铜"),
  thicknessMm: z.number().positive(),
  jointType: z.string().optional(),
  targetSpeedMmPerS: z.number().positive().optional(),
  gapMm: z.number().positive().optional(),
  wireFill: z.boolean().optional(),
  wireDiameterMm: z.number().positive().optional(),
  targetPenetrationDepthMm: z.number().positive().optional(),
  lightTransmittance: z.number().min(0).max(1).optional(),
  seamType: z.string().optional(),
  seamLengthMm: z.number().positive().optional(),
  ...presalesFields,
});

export const processRecommendSchema = z.object({
  material: z.string().describe("Material id or name, e.g. copper, stainless-304, 铜"),
  thicknessMm: z.number().positive(),
  weldingMethod: z.string().describe("e.g. 叠焊, 拼焊, 角焊, lap, butt, fillet"),
  application: z.string().optional(),
  lightTransmittance: z.number().min(0).max(1).optional(),
  motionPlatform: z.enum(["gantry", "single-axis", "galvo-scanner"]).optional(),
  laserHead: z.enum(["galvo", "fixed-focus", "single-axis-rotation"]).optional(),
  preferredLaserType: z
    .enum(["fiber-1064", "fiber-2um", "fiber-green", "diode-blue", "diode-semiconductor"])
    .optional(),
  fieldbusProtocol: z.enum(["opc-ua", "profinet", "ethercat"]).optional(),
  includeVision: z.boolean().optional(),
  seamLengthMm: z.number().positive().optional(),
  targetSpeedMmPerS: z.number().positive().optional(),
  gapMm: z.number().positive().optional(),
  wireFill: z.boolean().optional(),
  wireDiameterMm: z.number().positive().optional(),
  targetPenetrationDepthMm: z.number().positive().optional(),
  baseMaterialB: z.string().optional(),
  thicknessBMm: z.number().positive().optional(),
  coating: z.string().optional(),
  surfaceCondition: z.string().optional(),
  applicationScenario: applicationScenarioSchema.optional(),
  deliveryScope: deliveryScopeSchema.optional(),
  qualityTargets: z.array(qualityTargetSchema).optional(),
  targetTaktSec: z.number().positive().optional(),
  partsPerHour: z.number().positive().optional(),
  stationCount: z.number().int().positive().optional(),
  preferredBrands: z.array(z.string()).optional(),
  forbiddenBrands: z.array(z.string()).optional(),
  budgetLevel: budgetLevelSchema.optional(),
  wireFeedMode: wireFeedModeSchema.optional(),
  wireFeedOrientation: wireFeedOrientationSchema.optional(),
  brazingWireFamily: brazingWireFamilySchema.optional(),
});

export const hardwareRecommendSchema = z.object({
  material: z.string(),
  thicknessMm: z.number().positive(),
  application: z.string().optional().describe("e.g. battery-tab, laser-brazing-push-pull"),
  lightTransmittance: z.number().min(0).max(1).optional(),
  motionPlatform: z.enum(["gantry", "single-axis", "galvo-scanner"]).optional(),
  laserHead: z.enum(["galvo", "fixed-focus", "single-axis-rotation"]).optional(),
  preferredLaserType: z
    .enum(["fiber-1064", "fiber-2um", "fiber-green", "diode-blue", "diode-semiconductor"])
    .optional(),
  jointType: z.string().optional(),
  seamType: z.string().optional(),
  seamLengthMm: z.number().positive().optional(),
  ...presalesFields,
});

export const doeMatrixSchema = z.object({
  powerMin: z.number().positive(),
  powerMax: z.number().positive(),
  speedMin: z.number().positive(),
  speedMax: z.number().positive(),
  gridSize: z.number().int().min(2).max(10).optional(),
  defocusMin: z.number().optional(),
  defocusMax: z.number().optional(),
  gapMin: z.number().positive().optional(),
  gapMax: z.number().positive().optional(),
  includeGapAxis: z.boolean().optional(),
  wireSpeedMin: z.number().positive().optional(),
  wireSpeedMax: z.number().positive().optional(),
  wireFeedAngleMin: z.number().min(0).max(90).optional(),
  wireFeedAngleMax: z.number().min(0).max(90).optional(),
  preheatPowerMin: z.number().positive().optional(),
  preheatPowerMax: z.number().positive().optional(),
  shieldGasMin: z.number().positive().optional(),
  shieldGasMax: z.number().positive().optional(),
  clampForceMin: z.number().positive().optional(),
  clampForceMax: z.number().positive().optional(),
  pulseFrequencyMin: z.number().positive().optional(),
  pulseFrequencyMax: z.number().positive().optional(),
  pulseWidthMin: z.number().positive().optional(),
  pulseWidthMax: z.number().positive().optional(),
  dutyCycleMin: z.number().min(0).max(100).optional(),
  dutyCycleMax: z.number().min(0).max(100).optional(),
  wobbleAmplitudeMin: z.number().positive().optional(),
  wobbleAmplitudeMax: z.number().positive().optional(),
  wobbleFrequencyMin: z.number().positive().optional(),
  wobbleFrequencyMax: z.number().positive().optional(),
  scanWidthMin: z.number().positive().optional(),
  scanWidthMax: z.number().positive().optional(),
  nozzleDistanceMin: z.number().positive().optional(),
  nozzleDistanceMax: z.number().positive().optional(),
  nozzleAngleMin: z.number().min(0).max(90).optional(),
  nozzleAngleMax: z.number().min(0).max(90).optional(),
  coolingWaterTempMin: z.number().positive().optional(),
  coolingWaterTempMax: z.number().positive().optional(),
  coolingFlowMin: z.number().positive().optional(),
  coolingFlowMax: z.number().positive().optional(),
  coolingPressureMin: z.number().positive().optional(),
  coolingPressureMax: z.number().positive().optional(),
});

export const defectDiagnoseSchema = z.object({
  symptom: z.string().describe("blowout, lack_of_fusion, porosity, cracking, 飞溅, 气孔"),
  material: z.string(),
  thicknessMm: z.number().positive(),
});

export const trajectorySchema = z.object({
  pathType: z.enum(["line", "circle", "rectangle"]),
  lengthMm: z.number().positive().optional(),
  radiusMm: z.number().positive().optional(),
  widthMm: z.number().positive().optional(),
  heightMm: z.number().positive().optional(),
  speedMmPerS: z.number().positive(),
  powerW: z.number().positive(),
  dialect: z.enum(["gcode", "fanuc"]).optional(),
  motionPlatform: z.enum(["gantry", "single-axis", "galvo-scanner"]).optional(),
});

export const fieldbusMapSchema = z.object({
  protocol: z.enum(["opc-ua", "profinet", "ethercat"]),
});

export const solutionBomSchema = z.object({
  material: z.string(),
  thicknessMm: z.number().positive(),
  application: z.string().optional(),
  lightTransmittance: z.number().min(0).max(1).optional(),
  motionPlatform: z.enum(["gantry", "single-axis", "galvo-scanner"]).optional(),
  laserHead: z.enum(["galvo", "fixed-focus", "single-axis-rotation"]).optional(),
  preferredLaserType: z
    .enum(["fiber-1064", "fiber-2um", "fiber-green", "diode-blue", "diode-semiconductor"])
    .optional(),
  fieldbusProtocol: z.enum(["opc-ua", "profinet", "ethercat"]).optional(),
  includeVision: z.boolean().optional(),
  wireFill: z.boolean().optional(),
  gapMm: z.number().positive().optional(),
  safetyLevel: z.string().optional(),
  plantUtilities: z.array(z.string()).optional(),
  fixtureComplexity: z.enum(["low", "medium", "high"]).optional(),
  mesIntegrationRequired: z.boolean().optional(),
  plcPreference: z.string().optional(),
  jointType: z.string().optional(),
  seamType: z.string().optional(),
  seamLengthMm: z.number().positive().optional(),
  ...presalesFields,
});
