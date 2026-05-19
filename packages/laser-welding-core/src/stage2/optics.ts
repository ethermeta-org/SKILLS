export function computeWobble(
  spotDiameterMm: number,
  materialId: string,
): { amplitudeMm: number; frequencyHz: number } {
  const ratio = materialId === "copper" ? 1.2 : 0.8;
  const amplitudeMm = Math.round(spotDiameterMm * ratio * 100) / 100;
  const frequencyHz = materialId === "copper" ? 400 : 250;
  return {
    amplitudeMm: Math.max(0.2, Math.min(amplitudeMm, 2.0)),
    frequencyHz,
  };
}

export function computeBesselHint(
  materialId: string,
  thicknessMm: number,
): { applicable: boolean; notes: string; annularRatio?: string } {
  if (materialId === "copper" && thicknessMm <= 2) {
    return {
      applicable: true,
      notes:
        "Bessel/annular beams can improve absorption on copper thin sheets; annular ratio often 0.6–0.8 of central spot (vendor-specific).",
      annularRatio: "0.6–0.8",
    };
  }
  return {
    applicable: false,
    notes: "Conventional Gaussian or wobble typically sufficient for this material/thickness.",
  };
}
