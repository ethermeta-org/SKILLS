import { DISCLAIMER, type DoeMatrixResult } from "../core/types.js";
import { lineEnergyDensityJPerMm } from "../core/units.js";
import { ValidationError } from "../core/errors.js";

export interface DoeMatrixInput {
  defocusMin?: number;
  defocusMax?: number;
  gapMin?: number;
  gapMax?: number;
  includeGapAxis?: boolean;
  powerMin: number;
  powerMax: number;
  speedMin: number;
  speedMax: number;
  gridSize?: number;
}

export function generateDoeMatrix(input: DoeMatrixInput): DoeMatrixResult {
  const n = input.gridSize ?? 5;
  if (n < 2 || n > 10) throw new ValidationError("gridSize must be 2–10");
  if (input.powerMin >= input.powerMax) throw new ValidationError("powerMin must be < powerMax");
  if (input.speedMin >= input.speedMax) throw new ValidationError("speedMin must be < speedMax");

  const matrix: DoeMatrixResult["matrix"] = [];
  let idx = 0;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const t = n === 1 ? 0 : i / (n - 1);
      const u = n === 1 ? 0 : j / (n - 1);
      // Diagonal bias: power and speed anti-correlated along diagonal samples
      const powerW = Math.round(input.powerMin + (input.powerMax - input.powerMin) * t);
      const speedMmPerS =
        Math.round((input.speedMax - (input.speedMax - input.speedMin) * u) * 10) / 10;
      const row: DoeMatrixResult["matrix"][number] = {
        sampleId: `S${String(++idx).padStart(2, "0")}`,
        powerW,
        speedMmPerS,
        lineEnergyJPerMm: Math.round(lineEnergyDensityJPerMm(powerW, speedMmPerS) * 10) / 10,
      };
      if (input.defocusMin !== undefined && input.defocusMax !== undefined) {
        const dt = n === 1 ? 0 : j / (n - 1);
        row.defocusMm = Math.round((input.defocusMin + (input.defocusMax - input.defocusMin) * dt) * 100) / 100;
      }
      if (input.includeGapAxis && input.gapMin !== undefined && input.gapMax !== undefined) {
        const gt = n === 1 ? 0 : i / (n - 1);
        row.gapMm = Math.round((input.gapMin + (input.gapMax - input.gapMin) * gt) * 100) / 100;
      }
      matrix.push(row);
    }
  }

  let header = "sampleId,powerW,speedMmPerS,lineEnergyJPerMm";
  if (input.defocusMin !== undefined) header += ",defocusMm";
  if (input.includeGapAxis) header += ",gapMm";
  const rows = matrix.map(
    (r) => {
      let line = `${r.sampleId},${r.powerW},${r.speedMmPerS},${r.lineEnergyJPerMm}`;
      if (r.defocusMm !== undefined) line += `,${r.defocusMm}`;
      if (r.gapMm !== undefined) line += `,${r.gapMm}`;
      return line;
    },
  );
  const csv = [header, ...rows].join("\n");

  return {
    matrix,
    csv,
    confidence: "heuristic",
    disclaimer: DISCLAIMER,
  };
}
