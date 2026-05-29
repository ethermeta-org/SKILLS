import type { DefocusSign, ProcessParams } from "./types.js";

export function defocusSignFromMm(defocusMm: number): DefocusSign {
  if (defocusMm < -0.01) return "negative";
  if (defocusMm > 0.01) return "positive";
  return "on-focus";
}

export function estimatePenetrationDepthMm(lineEnergyJPerMm: number, materialFactor: number): number {
  const k = 0.15;
  return Math.round(k * Math.sqrt(lineEnergyJPerMm / materialFactor) * 100) / 100;
}

export interface BuildProcessParamsInput {
  powerW: number;
  speedMmPerS: number;
  defocusMm: number;
  lineEnergyJPerMm: number;
  materialFactor: number;
  gasType?: string;
  shieldGasLpm?: number;
  spotDiameterMm?: number;
  focalLengthMm?: number;
  wireFill?: boolean;
  gapMm?: number;
  wireDiameterMm?: number;
}

export function buildProcessParams(input: BuildProcessParamsInput): ProcessParams {
  const sign = defocusSignFromMm(input.defocusMm);
  const focusPosition =
    sign === "negative" ? "subsurface" : sign === "positive" ? "above-surface" : "surface";
  const params: ProcessParams = {
    powerW: input.powerW,
    speedMmPerS: input.speedMmPerS,
    defocus: { valueMm: Math.abs(input.defocusMm), sign },
    penetrationDepthMm: estimatePenetrationDepthMm(input.lineEnergyJPerMm, input.materialFactor),
    laser: {
      powerW: input.powerW,
      averagePowerW: input.powerW,
    },
    optics: {
      defocus: { valueMm: Math.abs(input.defocusMm), sign },
      focusPosition,
      spotDiameterMm: input.spotDiameterMm,
      focalLengthMm: input.focalLengthMm,
      beamQualityNote: "Confirm spot symmetry and focus stability before production release.",
    },
    motion: {
      weldSpeedMmPerS: input.speedMmPerS,
      positioningSpeedMmPerS: Math.round(input.speedMmPerS * 3 * 10) / 10,
      accelerationMmPerS2: 500,
    },
    scan: {
      wobbleMode: "none",
    },
    shielding: {
      gasType: input.gasType ?? "Ar",
      flowLpm: input.shieldGasLpm ?? 15,
      nozzleDistanceMm: 10,
      nozzleAngleDeg: 45,
      preGasMs: 200,
      postGasMs: 300,
    },
    cooling: {
      waterTempC: 22,
      flowLpm: 4,
      pressureBar: 2,
    },
  };

  if (input.wireFill && input.gapMm !== undefined && input.gapMm > 0) {
    params.powerCurve = {
      segments: [
        { durationMs: 50, powerW: Math.round(input.powerW * 0.4) },
        { durationMs: 200, powerW: input.powerW },
      ],
    };
    const base = input.gapMm * 1.0;
    const suggested = input.wireDiameterMm ?? base;
    params.wireFill = {
      gapMm: input.gapMm,
      suggestedWireMm: Math.round(Math.max(base * 0.8, Math.min(base * 1.2, suggested)) * 100) / 100,
    };
  }

  return params;
}
