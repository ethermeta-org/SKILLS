import { DISCLAIMER, type TrajectoryResult } from "../core/types.js";
import { ValidationError } from "../core/errors.js";

export interface TrajectoryInput {
  motionPlatform?: "gantry" | "single-axis" | "galvo-scanner";
  pathType: "line" | "circle" | "rectangle";
  lengthMm?: number;
  radiusMm?: number;
  widthMm?: number;
  heightMm?: number;
  speedMmPerS: number;
  powerW: number;
  dialect?: "gcode" | "fanuc";
}

export function generateTrajectory(input: TrajectoryInput): TrajectoryResult {
  const dialect = input.dialect ?? "gcode";
  if (input.speedMmPerS <= 0 || input.powerW <= 0) {
    throw new ValidationError("speed and power must be positive");
  }

  const lines: string[] = [];
  if (input.motionPlatform === "galvo-scanner") {
    lines.push("; Galvo scanner path — export via OEM field converter");
  }
  lines.push(
    `(Laser weld trajectory — heuristic)`,
    `(Power ${input.powerW} W, Speed ${input.speedMmPerS} mm/s)`,
    `G90`,
    `G21`,
  );

  if (dialect === "gcode") {
    lines.push(`M63 P0 ; laser enable macro (vendor-specific)`);
    lines.push(`F${Math.round(input.speedMmPerS * 60)} ; mm/min feed`);
  }

  switch (input.pathType) {
    case "line": {
      const len = input.lengthMm ?? 10;
      if (len <= 0) throw new ValidationError("lengthMm required for line");
      lines.push(`G0 X0 Y0`);
      lines.push(`G1 X${len} Y0 ; weld segment`);
      break;
    }
    case "circle": {
      const r = input.radiusMm ?? 5;
      lines.push(`G0 X${r} Y0`);
      lines.push(`G2 X${r} Y0 I${-r} J0 ; CW circle`);
      break;
    }
    case "rectangle": {
      const w = input.widthMm ?? 10;
      const h = input.heightMm ?? 5;
      lines.push(`G0 X0 Y0`);
      lines.push(`G1 X${w} Y0`);
      lines.push(`G1 X${w} Y${h}`);
      lines.push(`G1 X0 Y${h}`);
      lines.push(`G1 X0 Y0`);
      break;
    }
  }

  if (dialect === "gcode") {
    lines.push(`M64 P0 ; laser off`);
  } else {
    lines.push(`:! ; Fanuc laser off placeholder`);
  }

  return {
    dialect,
    program: lines.join("\n"),
    confidence: "heuristic",
    disclaimer: DISCLAIMER,
  };
}
