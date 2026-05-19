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
  confidence: "heuristic";
  disclaimer: string;
  warnings: string[];
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
  confidence: "heuristic";
  disclaimer: string;
  warnings: string[];
}

export interface DoeMatrixResult {
  matrix: Array<{
    sampleId: string;
    powerW: number;
    speedMmPerS: number;
    lineEnergyJPerMm: number;
    defocusMm?: number;
    gapMm?: number;
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

export interface CodegenResult {
  language: "st" | "csharp";
  code: string;
  profile: string;
  confidence: "heuristic";
  disclaimer: string;
}

export const DISCLAIMER =
  "Heuristic initial values only. Validate with DOE and trial welds per equipment manufacturer manual.";

export function isPolymerCategory(category: MaterialCategory): boolean {
  return category === "polymer" || category === "engineering-polymer";
}
