import { z } from "zod";

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

export const codegenStSchema = z.object({
  profile: z.string().optional(),
  preGasMs: z.number().int().positive().optional(),
  postGasMs: z.number().int().positive().optional(),
});

export const codegenCsharpSchema = z.object({
  profile: z.string().optional(),
  preGasMs: z.number().int().positive().optional(),
  postGasMs: z.number().int().positive().optional(),
});
