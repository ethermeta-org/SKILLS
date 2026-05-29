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
  wireSpeedMin?: number;
  wireSpeedMax?: number;
  wireFeedAngleMin?: number;
  wireFeedAngleMax?: number;
  preheatPowerMin?: number;
  preheatPowerMax?: number;
  shieldGasMin?: number;
  shieldGasMax?: number;
  clampForceMin?: number;
  clampForceMax?: number;
  pulseFrequencyMin?: number;
  pulseFrequencyMax?: number;
  pulseWidthMin?: number;
  pulseWidthMax?: number;
  dutyCycleMin?: number;
  dutyCycleMax?: number;
  wobbleAmplitudeMin?: number;
  wobbleAmplitudeMax?: number;
  wobbleFrequencyMin?: number;
  wobbleFrequencyMax?: number;
  scanWidthMin?: number;
  scanWidthMax?: number;
  nozzleDistanceMin?: number;
  nozzleDistanceMax?: number;
  nozzleAngleMin?: number;
  nozzleAngleMax?: number;
  coolingWaterTempMin?: number;
  coolingWaterTempMax?: number;
  coolingFlowMin?: number;
  coolingFlowMax?: number;
  coolingPressureMin?: number;
  coolingPressureMax?: number;
}

export function generateDoeMatrix(input: DoeMatrixInput): DoeMatrixResult {
  const n = input.gridSize ?? 5;
  if (n < 2 || n > 10) throw new ValidationError("gridSize must be 2–10");
  if (input.powerMin >= input.powerMax) throw new ValidationError("powerMin must be < powerMax");
  if (input.speedMin >= input.speedMax) throw new ValidationError("speedMin must be < speedMax");

  const matrix: DoeMatrixResult["matrix"] = [];
  let idx = 0;
  const interpolate = (
    min: number | undefined,
    max: number | undefined,
    ratio: number,
  ): number | undefined => {
    if (min === undefined || max === undefined) return undefined;
    return Math.round((min + (max - min) * ratio) * 100) / 100;
  };

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
      const axisT = n === 1 ? 0 : (i + j) / (2 * (n - 1));
      row.wireSpeedMmPerS = interpolate(input.wireSpeedMin, input.wireSpeedMax, axisT);
      row.wireFeedAngleDeg = interpolate(input.wireFeedAngleMin, input.wireFeedAngleMax, axisT);
      row.preheatPowerW = interpolate(input.preheatPowerMin, input.preheatPowerMax, axisT);
      row.shieldGasLpm = interpolate(input.shieldGasMin, input.shieldGasMax, axisT);
      row.clampForceN = interpolate(input.clampForceMin, input.clampForceMax, axisT);
      row.pulseFrequencyHz = interpolate(input.pulseFrequencyMin, input.pulseFrequencyMax, axisT);
      row.pulseWidthMs = interpolate(input.pulseWidthMin, input.pulseWidthMax, axisT);
      row.dutyCyclePct = interpolate(input.dutyCycleMin, input.dutyCycleMax, axisT);
      row.wobbleAmplitudeMm = interpolate(input.wobbleAmplitudeMin, input.wobbleAmplitudeMax, axisT);
      row.wobbleFrequencyHz = interpolate(input.wobbleFrequencyMin, input.wobbleFrequencyMax, axisT);
      row.scanWidthMm = interpolate(input.scanWidthMin, input.scanWidthMax, axisT);
      row.nozzleDistanceMm = interpolate(input.nozzleDistanceMin, input.nozzleDistanceMax, axisT);
      row.nozzleAngleDeg = interpolate(input.nozzleAngleMin, input.nozzleAngleMax, axisT);
      row.coolingWaterTempC = interpolate(input.coolingWaterTempMin, input.coolingWaterTempMax, axisT);
      row.coolingFlowLpm = interpolate(input.coolingFlowMin, input.coolingFlowMax, axisT);
      row.coolingPressureBar = interpolate(input.coolingPressureMin, input.coolingPressureMax, axisT);
      matrix.push(row);
    }
  }

  let header = "sampleId,powerW,speedMmPerS,lineEnergyJPerMm";
  if (input.defocusMin !== undefined) header += ",defocusMm";
  if (input.includeGapAxis) header += ",gapMm";
  if (input.wireSpeedMin !== undefined && input.wireSpeedMax !== undefined) header += ",wireSpeedMmPerS";
  if (input.wireFeedAngleMin !== undefined && input.wireFeedAngleMax !== undefined)
    header += ",wireFeedAngleDeg";
  if (input.preheatPowerMin !== undefined && input.preheatPowerMax !== undefined) header += ",preheatPowerW";
  if (input.shieldGasMin !== undefined && input.shieldGasMax !== undefined) header += ",shieldGasLpm";
  if (input.clampForceMin !== undefined && input.clampForceMax !== undefined) header += ",clampForceN";
  if (input.pulseFrequencyMin !== undefined && input.pulseFrequencyMax !== undefined) header += ",pulseFrequencyHz";
  if (input.pulseWidthMin !== undefined && input.pulseWidthMax !== undefined) header += ",pulseWidthMs";
  if (input.dutyCycleMin !== undefined && input.dutyCycleMax !== undefined) header += ",dutyCyclePct";
  if (input.wobbleAmplitudeMin !== undefined && input.wobbleAmplitudeMax !== undefined)
    header += ",wobbleAmplitudeMm";
  if (input.wobbleFrequencyMin !== undefined && input.wobbleFrequencyMax !== undefined)
    header += ",wobbleFrequencyHz";
  if (input.scanWidthMin !== undefined && input.scanWidthMax !== undefined) header += ",scanWidthMm";
  if (input.nozzleDistanceMin !== undefined && input.nozzleDistanceMax !== undefined)
    header += ",nozzleDistanceMm";
  if (input.nozzleAngleMin !== undefined && input.nozzleAngleMax !== undefined) header += ",nozzleAngleDeg";
  if (input.coolingWaterTempMin !== undefined && input.coolingWaterTempMax !== undefined)
    header += ",coolingWaterTempC";
  if (input.coolingFlowMin !== undefined && input.coolingFlowMax !== undefined) header += ",coolingFlowLpm";
  if (input.coolingPressureMin !== undefined && input.coolingPressureMax !== undefined)
    header += ",coolingPressureBar";
  const rows = matrix.map(
    (r) => {
      let line = `${r.sampleId},${r.powerW},${r.speedMmPerS},${r.lineEnergyJPerMm}`;
      if (r.defocusMm !== undefined) line += `,${r.defocusMm}`;
      if (r.gapMm !== undefined) line += `,${r.gapMm}`;
      if (r.wireSpeedMmPerS !== undefined) line += `,${r.wireSpeedMmPerS}`;
      if (r.wireFeedAngleDeg !== undefined) line += `,${r.wireFeedAngleDeg}`;
      if (r.preheatPowerW !== undefined) line += `,${r.preheatPowerW}`;
      if (r.shieldGasLpm !== undefined) line += `,${r.shieldGasLpm}`;
      if (r.clampForceN !== undefined) line += `,${r.clampForceN}`;
      if (r.pulseFrequencyHz !== undefined) line += `,${r.pulseFrequencyHz}`;
      if (r.pulseWidthMs !== undefined) line += `,${r.pulseWidthMs}`;
      if (r.dutyCyclePct !== undefined) line += `,${r.dutyCyclePct}`;
      if (r.wobbleAmplitudeMm !== undefined) line += `,${r.wobbleAmplitudeMm}`;
      if (r.wobbleFrequencyHz !== undefined) line += `,${r.wobbleFrequencyHz}`;
      if (r.scanWidthMm !== undefined) line += `,${r.scanWidthMm}`;
      if (r.nozzleDistanceMm !== undefined) line += `,${r.nozzleDistanceMm}`;
      if (r.nozzleAngleDeg !== undefined) line += `,${r.nozzleAngleDeg}`;
      if (r.coolingWaterTempC !== undefined) line += `,${r.coolingWaterTempC}`;
      if (r.coolingFlowLpm !== undefined) line += `,${r.coolingFlowLpm}`;
      if (r.coolingPressureBar !== undefined) line += `,${r.coolingPressureBar}`;
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
