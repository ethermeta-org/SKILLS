import type { WeldMode } from "./types.js";

export function resolveWeldMode(lightTransmittance: number): WeldMode {
  if (lightTransmittance < 0.3) return "absorption";
  if (lightTransmittance > 0.7) return "transmission";
  return "hybrid";
}

export function effectiveTransmittance(
  catalogDefault: number | undefined,
  override: number | undefined,
): number {
  if (override !== undefined) return Math.min(1, Math.max(0, override));
  return catalogDefault ?? 0.2;
}
