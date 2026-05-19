import { ValidationError } from "./errors.js";

/** Line energy density E = P / v in J/mm (P in W, v in mm/s). */
export function lineEnergyDensityJPerMm(powerW: number, speedMmPerS: number): number {
  if (powerW <= 0) throw new ValidationError("Power must be positive");
  if (speedMmPerS <= 0) throw new ValidationError("Speed must be positive");
  return powerW / speedMmPerS;
}

export function powerFromLineEnergy(lineEnergyJPerMm: number, speedMmPerS: number): number {
  return lineEnergyJPerMm * speedMmPerS;
}

/** Spot diameter estimate: d ≈ 1.27 * λ * f / D (μm) — simplified mm output. */
export function spotDiameterMm(
  wavelengthNm: number,
  focalLengthMm: number,
  beamDiameterMm: number,
): number {
  if (beamDiameterMm <= 0) throw new ValidationError("Beam diameter must be positive");
  return (1.27 * wavelengthNm * focalLengthMm) / (beamDiameterMm * 1000);
}
