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
  wireFill?: boolean;
  gapMm?: number;
  wireDiameterMm?: number;
}

export function buildProcessParams(input: BuildProcessParamsInput): ProcessParams {
  const sign = defocusSignFromMm(input.defocusMm);
  const params: ProcessParams = {
    powerW: input.powerW,
    speedMmPerS: input.speedMmPerS,
    defocus: { valueMm: Math.abs(input.defocusMm), sign },
    penetrationDepthMm: estimatePenetrationDepthMm(input.lineEnergyJPerMm, input.materialFactor),
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
