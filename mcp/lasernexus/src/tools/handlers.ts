import {
  assessMaterial,
  recommendHardware,
  generateDoeMatrix,
  diagnoseDefect,
  generateTrajectory,
  mapFieldbus,
  composeSolutionBom,
  LaserWeldingError,
} from "@ethermeta/lasernexus-core";
import type { z } from "zod";
import type {
  materialAssessSchema,
  hardwareRecommendSchema,
  doeMatrixSchema,
  defectDiagnoseSchema,
  trajectorySchema,
  fieldbusMapSchema,
  solutionBomSchema,
} from "./schemas.js";

function jsonContent(data: unknown): { type: "text"; text: string }[] {
  return [{ type: "text", text: JSON.stringify(data, null, 2) }];
}

function handleError(err: unknown): { type: "text"; text: string }[] {
  const message =
    err instanceof LaserWeldingError
      ? JSON.stringify({ error: err.code, message: err.message })
      : JSON.stringify({ error: "INTERNAL", message: String(err) });
  return [{ type: "text", text: message }];
}

export function handleMaterialAssess(args: z.infer<typeof materialAssessSchema>) {
  try {
    return jsonContent(assessMaterial(args));
  } catch (e) {
    return handleError(e);
  }
}

export function handleHardwareRecommend(args: z.infer<typeof hardwareRecommendSchema>) {
  try {
    return jsonContent(recommendHardware(args));
  } catch (e) {
    return handleError(e);
  }
}

export function handleDoeMatrix(args: z.infer<typeof doeMatrixSchema>) {
  try {
    return jsonContent(generateDoeMatrix(args));
  } catch (e) {
    return handleError(e);
  }
}

export function handleDefectDiagnose(args: z.infer<typeof defectDiagnoseSchema>) {
  try {
    return jsonContent(diagnoseDefect(args));
  } catch (e) {
    return handleError(e);
  }
}

export function handleTrajectoryGenerate(args: z.infer<typeof trajectorySchema>) {
  try {
    return jsonContent(generateTrajectory(args));
  } catch (e) {
    return handleError(e);
  }
}

export function handleFieldbusMap(args: z.infer<typeof fieldbusMapSchema>) {
  try {
    return jsonContent(mapFieldbus(args.protocol));
  } catch (e) {
    return handleError(e);
  }
}

export function handleSolutionBom(args: z.infer<typeof solutionBomSchema>) {
  try {
    return jsonContent(composeSolutionBom(args));
  } catch (e) {
    return handleError(e);
  }
}
