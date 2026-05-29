import type { AliasMap } from "./aliases.js";

export type MaterialCategory = "metal" | "polymer" | "engineering-polymer";
export type WeldMode = "absorption" | "transmission" | "hybrid";
export type DefocusSign = "positive" | "negative" | "on-focus";
export type LaserType =
  | "fiber-1064"
  | "fiber-2um"
  | "fiber-green"
  | "diode-blue"
  | "diode-semiconductor";
export type MotionPlatformId = "gantry" | "single-axis" | "galvo-scanner";
export type LaserHeadId = "galvo" | "fixed-focus" | "single-axis-rotation";
export type ApplicationScenario =
  | "metal-fusion"
  | "laser-brazing"
  | "push-pull-brazing"
  | "polymer-transmission"
  | "battery-tab"
  | "busbar"
  | "seal-welding"
  | "custom";
export type DeliveryScope =
  | "process-package"
  | "equipment-package"
  | "presales-solution";
export type QualityTarget =
  | "strength"
  | "sealing"
  | "conductivity"
  | "appearance"
  | "low-spatter"
  | "low-heat-input";
export type AutomationLevel =
  | "manual"
  | "semi-auto"
  | "robot"
  | "gantry-line"
  | "galvo-line"
  | "turnkey-line";
export type WireFeedMode = "push-pull" | "push" | "pull" | "manual-assist";
export type WireFeedOrientation = "front" | "rear" | "side" | "coaxial" | "near-coaxial";
export type BrazingWireFamily =
  | "CuSi"
  | "AlSi"
  | "Ni-based"
  | "Cu-based"
  | "stainless-filler"
  | "custom";
export type RiskLevel = "low" | "medium" | "high";
export type BudgetLevel = "low" | "mid" | "high";
export type WeldingMethod =
  | "lap"
  | "butt"
  | "fillet"
  | "t-joint"
  | "edge"
  | "seal"
  | "circular";

export interface JointProfile {
  method: WeldingMethod;
  displayName: { en: string; zh: string };
  aliases: string[];
  jointType: string;
  defaultSeamType: string;
  process: {
    powerFactor: number;
    speedFactor: number;
    defocusOffsetMm: number;
    doePowerSpread: number;
    doeSpeedSpread: number;
  };
  doe: {
    includeGapAxis: boolean;
    gapMinMm?: number;
    gapMaxMm?: number;
  };
  equipmentHints: string[];
  fixtureHints: string[];
  inspectionHints: string[];
  risks: string[];
  validationEmphasis: string[];
  acceptanceEmphasis: string[];
}

export interface WireFeedHeadRecommendation {
  headType: string;
  feedMode: WireFeedMode;
  orientation: WireFeedOrientation;
  compatibleMotion: MotionPlatformId[];
  coolingRequired: boolean;
  notes: string[];
  risks: string[];
}

export interface BrazingWireRecommendation {
  family: BrazingWireFamily;
  compatibleMaterials: string[];
  notes: string[];
  risks: string[];
  validation: string[];
}

export interface MaterialRecord {
  id: string;
  name: string;
  category: MaterialCategory;
  meltingPointK: number;
  reflectivity1064: number;
  reflectivity515: number;
  thermalConductivityWmk: number;
  absorptionNotes: string;
  baseLineEnergyJPerMm: number;
  materialFactor: number;
  aliases?: AliasMap;
  lightTransmittance?: number;
  referenceWavelengthNm?: number;
  preferredWavelengthNm?: number[];
  weldModeDefault?: WeldMode;
  reflectivity2000?: number;
}

export interface LaserRecord {
  brand: string;
  modelSeries: string;
  wavelengthNm: number;
  powerRangeKW: [number, number];
  applications: string[];
  region: "import" | "domestic";
  capabilities: string[];
  processModes: string[];
  laserType: LaserType;
  aliases?: AliasMap;
}

export interface ProcessParams {
  powerW: number;
  powerCurve?: { segments: { durationMs: number; powerW: number }[] };
  speedMmPerS: number;
  defocus: { valueMm: number; sign: DefocusSign };
  penetrationDepthMm: number;
  wireFill?: { gapMm: number; suggestedWireMm: number };
  laser?: {
    powerW: number;
    peakPowerW?: number;
    averagePowerW?: number;
    pulseWidthMs?: number;
    pulseFrequencyHz?: number;
    dutyCyclePct?: number;
  };
  optics?: {
    defocus: { valueMm: number; sign: DefocusSign };
    focusPosition: "surface" | "subsurface" | "above-surface";
    spotDiameterMm?: number;
    focalLengthMm?: number;
    beamQualityNote?: string;
  };
  motion?: {
    weldSpeedMmPerS: number;
    positioningSpeedMmPerS?: number;
    accelerationMmPerS2?: number;
    arcStartDelayMs?: number;
    arcEndDelayMs?: number;
    dwellTimeMs?: number;
    overlapMm?: number;
  };
  scan?: {
    wobbleMode?: "none" | "line" | "circle" | "spiral" | "custom";
    wobbleAmplitudeMm?: number;
    wobbleFrequencyHz?: number;
    scanWidthMm?: number;
    xOffsetMm?: number;
    yOffsetMm?: number;
  };
  shielding?: {
    gasType: string;
    flowLpm: number;
    nozzleDistanceMm?: number;
    nozzleAngleDeg?: number;
    preGasMs?: number;
    postGasMs?: number;
  };
  cooling?: {
    waterTempC?: number;
    flowLpm?: number;
    pressureBar?: number;
    preheatPowerW?: number;
    preheatTimeMs?: number;
  };
}

export interface ProcessWindowResult {
  materialId: string;
  thicknessMm: number;
  powerW: number;
  speedMmPerS: number;
  lineEnergyJPerMm: number;
  defocusMm: number;
  shieldGasLpm: number;
  gasType: string;
  recommendedWavelengthNm: number[];
  processParams?: ProcessParams;
  weldMode?: WeldMode;
  effectiveTransmittance?: number;
  baseMaterialB?: string;
  thicknessBMm?: number;
  materialPairWarnings?: string[];
  brazingWireRecommendation?: BrazingWireRecommendation;
  confidence: "heuristic";
  disclaimer: string;
  warnings: string[];
}

export type BomCategory =
  | "laser-source"
  | "beam-delivery"
  | "welding-head"
  | "motion"
  | "cooling"
  | "gas-delivery"
  | "fume-extraction"
  | "wire-feeder"
  | "plc-hmi"
  | "fieldbus"
  | "safety"
  | "fixture"
  | "vision-qa"
  | "integration";

export interface BomLineItem {
  id: string;
  category: BomCategory;
  name: { en: string; zh: string };
  qty: number;
  unit: "set" | "ea" | "line";
  required: boolean;
  oemHint?: string;
  specs?: Record<string, string | number>;
  notes?: string;
}

export interface LineLayout {
  workflow: string[];
  stations?: Array<{
    id: string;
    name: { en: string; zh: string };
    componentIds: string[];
  }>;
}

export interface BomSummary {
  itemCount: number;
  categories: BomCategory[];
  requiredCount: number;
}

export interface HardwareRecommendResult {
  materialId: string;
  thicknessMm: number;
  application: string;
  wavelengthNm: number;
  recommendedBrands: Array<{ brand: string; modelSeries: string; powerRangeKW: [number, number] }>;
  recommendedLaserTypes: LaserType[];
  motionPlatform?: MotionPlatformId;
  laserHead?: LaserHeadId;
  beamDelivery: "fiber" | "wobble" | "bessel" | "galvo-scanner";
  weldingHead: string;
  optics: {
    focalLengthMm: number;
    spotDiameterMm: number;
    wobble?: { amplitudeMm: number; frequencyHz: number };
    bessel?: { applicable: boolean; notes: string; annularRatio?: string };
  };
  bomSummary: BomSummary;
  lineLayout: LineLayout;
  assumptions?: string[];
  missingInputs?: string[];
  riskLevel?: RiskLevel;
  validationPlan?: string[];
  acceptanceCriteria?: string[];
  wireFeedHeadRecommendation?: WireFeedHeadRecommendation;
  brazingWireRecommendation?: BrazingWireRecommendation;
  confidence: "heuristic";
  disclaimer: string;
  warnings: string[];
}

export interface SolutionBomResult {
  materialId: string;
  thicknessMm: number;
  application: string;
  lineItems: BomLineItem[];
  lineLayout: LineLayout;
  turnkeyVendors?: string[];
  assumptions: string[];
  missingInputs: string[];
  riskLevel: RiskLevel;
  validationPlan: string[];
  acceptanceCriteria: string[];
  wireFeedHeadRecommendation?: WireFeedHeadRecommendation;
  brazingWireRecommendation?: BrazingWireRecommendation;
  confidence: "heuristic";
  disclaimer: string;
  warnings: string[];
}

export interface ProcessRecommendInput {
  material: string;
  thicknessMm: number;
  weldingMethod: string;
  baseMaterialB?: string;
  thicknessBMm?: number;
  application?: string;
  applicationScenario?: ApplicationScenario;
  deliveryScope?: DeliveryScope;
  qualityTargets?: QualityTarget[];
  coating?: string;
  surfaceCondition?: string;
  lightTransmittance?: number;
  wireFill?: boolean;
  gapMm?: number;
  wireDiameterMm?: number;
  targetSpeedMmPerS?: number;
  targetPenetrationDepthMm?: number;
  targetTaktSec?: number;
  partsPerHour?: number;
  stationCount?: number;
  motionPlatform?: string;
  laserHead?: string;
  preferredLaserType?: LaserType;
  wireFeedMode?: WireFeedMode;
  wireFeedOrientation?: WireFeedOrientation;
  brazingWireFamily?: BrazingWireFamily;
  fieldbusProtocol?: "opc-ua" | "profinet" | "ethercat";
  includeVision?: boolean;
  seamLengthMm?: number;
  preferredBrands?: string[];
  forbiddenBrands?: string[];
  budgetLevel?: BudgetLevel;
}

export interface ProcessRecommendResult {
  materialId: string;
  thicknessMm: number;
  weldingMethod: WeldingMethod;
  weldingMethodName: { en: string; zh: string };
  jointType: string;
  seamType: string;
  processWindow: ProcessWindowResult;
  hardware: HardwareRecommendResult;
  doe: DoeMatrixResult;
  bom: SolutionBomResult;
  equipmentHints: string[];
  fixtureHints: string[];
  inspectionHints: string[];
  risks: string[];
  validationPlan: string[];
  acceptanceCriteria: string[];
  assumptions: string[];
  inputsToConfirm: string[];
  tuningWorkflow?: TuningWorkflowStep[];
  monitoringPlan?: MonitoringPlanItem[];
  safetyInterlocks?: SafetyInterlock[];
  recipeManagement?: RecipeManagement;
  confidence: "heuristic";
  disclaimer: string;
}

export interface TuningWorkflowStep {
  stage:
    | "target-and-joint"
    | "energy-focus"
    | "shielding-cooling"
    | "scan-motion"
    | "observe-and-refine"
    | "recipe-release";
  objective: string;
  primaryParameters: string[];
  checks: string[];
}

export interface MonitoringPlanItem {
  signal:
    | "vision-position"
    | "seam-tracking"
    | "ccd-health"
    | "coaxial-monitoring"
    | "power-feedback"
    | "temperature"
    | "spot-quality"
    | "reflected-light";
  purpose: string;
  feedbackAction: string;
}

export interface SafetyInterlock {
  name:
    | "door-interlock"
    | "emergency-stop"
    | "cooling-alarm"
    | "gas-pressure-alarm"
    | "fault-code";
  purpose: string;
  requiredAction: string;
}

export interface RecipeManagement {
  parametersToLock: string[];
  operatorEditableParameters: string[];
  reviewTriggers: string[];
}

export interface DoeMatrixResult {
  matrix: Array<{
    sampleId: string;
    powerW: number;
    speedMmPerS: number;
    lineEnergyJPerMm: number;
    defocusMm?: number;
    gapMm?: number;
    wireSpeedMmPerS?: number;
    wireFeedAngleDeg?: number;
    preheatPowerW?: number;
    shieldGasLpm?: number;
    clampForceN?: number;
    pulseFrequencyHz?: number;
    pulseWidthMs?: number;
    dutyCyclePct?: number;
    wobbleAmplitudeMm?: number;
    wobbleFrequencyHz?: number;
    scanWidthMm?: number;
    nozzleDistanceMm?: number;
    nozzleAngleDeg?: number;
    coolingWaterTempC?: number;
    coolingFlowLpm?: number;
    coolingPressureBar?: number;
  }>;
  csv: string;
  confidence: "heuristic";
  disclaimer: string;
}

export interface DefectAction {
  param: string;
  deltaPercent?: number;
  absolute?: string | number;
  rationale: string;
}

export interface DefectDiagnoseResult {
  symptom: string;
  matchedRules: string[];
  actions: DefectAction[];
  confidence: "heuristic";
  disclaimer: string;
}

export interface TrajectoryResult {
  dialect: string;
  program: string;
  confidence: "heuristic";
  disclaimer: string;
}

export interface FieldbusMapResult {
  protocol: string;
  statusWords: Record<string, string>;
  controlWords: Record<string, string>;
  confidence: "heuristic";
  disclaimer: string;
}

export const DISCLAIMER =
  "Heuristic initial values only. Validate with DOE and trial welds per equipment manufacturer manual.";

export function isPolymerCategory(category: MaterialCategory): boolean {
  return category === "polymer" || category === "engineering-polymer";
}
