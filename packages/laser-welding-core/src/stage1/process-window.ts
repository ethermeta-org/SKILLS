import { getMaterialById } from "../core/data-loader.js";
import { MaterialNotFoundError, ValidationError } from "../core/errors.js";
import { effectiveTransmittance, resolveWeldMode } from "../core/polymer.js";
import { buildProcessParams } from "../core/process-params.js";
import {
  DISCLAIMER,
  isPolymerCategory,
  type ProcessWindowResult,
  type WeldMode,
} from "../core/types.js";
import { lineEnergyDensityJPerMm, powerFromLineEnergy } from "../core/units.js";

export interface MaterialAssessInput {
  material: string;
  thicknessMm: number;
  jointType?: string;
  targetSpeedMmPerS?: number;
  gapMm?: number;
  wireFill?: boolean;
  wireDiameterMm?: number;
  targetPenetrationDepthMm?: number;
  lightTransmittance?: number;
}

export function assessMaterial(input: MaterialAssessInput): ProcessWindowResult {
  const { thicknessMm, jointType } = input;
  if (thicknessMm <= 0 || thicknessMm > 20) {
    throw new ValidationError("thicknessMm must be between 0 and 20 mm for this heuristic model");
  }

  const mat = getMaterialById(input.material);
  if (!mat) throw new MaterialNotFoundError(input.material);

  const warnings: string[] = [];
  const isPolymer = isPolymerCategory(mat.category);
  const transmittance = effectiveTransmittance(mat.lightTransmittance, input.lightTransmittance);
  let weldMode: WeldMode | undefined;
  if (isPolymer) {
    weldMode = resolveWeldMode(transmittance);
    if (weldMode === "transmission") {
      warnings.push("Transmission welding: use absorptive interface layer or blackened joint; validate with DOE.");
    }
  }

  const eTarget = mat.baseLineEnergyJPerMm * mat.materialFactor * Math.pow(thicknessMm, 0.7);

  let speedMmPerS = input.targetSpeedMmPerS ?? (isPolymer ? 8 : 3);
  if (isPolymer && speedMmPerS > 15) {
    warnings.push("Polymer speed capped conceptually; verify decomposition temperature.");
    speedMmPerS = 15;
  }

  let powerW = powerFromLineEnergy(eTarget, speedMmPerS);
  let powerMultiplier = 1;

  const recommendedWavelengthNm: number[] = [];
  if (isPolymer) {
    const preferred = mat.preferredWavelengthNm ?? [2000, 980];
    recommendedWavelengthNm.push(...preferred);
    if (weldMode === "transmission") {
      powerMultiplier *= 0.85;
    }
  } else if (mat.reflectivity1064 > 0.85 || mat.id === "copper-ofc") {
    powerMultiplier = Math.max(powerMultiplier, 1.35);
    recommendedWavelengthNm.push(515, 450);
    warnings.push("High reflectivity at 1064nm: consider green/blue laser or wobble/ring spot.");
  } else {
    recommendedWavelengthNm.push(1064);
  }

  powerW *= powerMultiplier;

  let gasType = "Ar";
  let shieldGasLpm = 15;
  if (mat.id === "stainless-304") {
    gasType = "N2";
    shieldGasLpm = 18;
  } else if (mat.id === "copper" || mat.id === "copper-ofc") {
    gasType = "Ar";
    shieldGasLpm = 20;
    if (jointType === "battery-tab") {
      warnings.push("Battery tab: verify polarity, fixturing, and pulse profile with vendor.");
    }
  } else if (isPolymer) {
    gasType = "N2";
    shieldGasLpm = 10;
    warnings.push("Polymer welding: confirm absorption at chosen wavelength and transmittance.");
  }

  const defocusMm = mat.category === "metal" ? (thicknessMm < 1.5 ? -0.5 : 0) : 0;
  const lineEnergy = lineEnergyDensityJPerMm(powerW, speedMmPerS);

  const processParams = buildProcessParams({
    powerW: Math.round(powerW),
    speedMmPerS: Math.round(speedMmPerS * 10) / 10,
    defocusMm,
    lineEnergyJPerMm: lineEnergy,
    materialFactor: mat.materialFactor,
    wireFill: input.wireFill,
    gapMm: input.gapMm,
    wireDiameterMm: input.wireDiameterMm,
  });

  if (input.targetPenetrationDepthMm !== undefined && processParams.penetrationDepthMm) {
    const delta = Math.abs(processParams.penetrationDepthMm - input.targetPenetrationDepthMm);
    if (delta > processParams.penetrationDepthMm * 0.25) {
      warnings.push(
        `Estimated penetration ${processParams.penetrationDepthMm} mm differs from target ${input.targetPenetrationDepthMm} mm — adjust power/speed via DOE.`,
      );
    }
  }

  return {
    materialId: mat.id,
    thicknessMm,
    powerW: Math.round(powerW),
    speedMmPerS: Math.round(speedMmPerS * 10) / 10,
    lineEnergyJPerMm: Math.round(lineEnergy * 10) / 10,
    defocusMm,
    shieldGasLpm,
    gasType,
    recommendedWavelengthNm,
    processParams,
    weldMode,
    effectiveTransmittance: isPolymer ? transmittance : undefined,
    confidence: "heuristic",
    disclaimer: DISCLAIMER,
    warnings,
  };
}
