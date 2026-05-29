import { describe, expect, it } from "vitest";
import {
  getJointProfile,
  listSupportedWeldingMethods,
  normalizeWeldingMethod,
} from "../src/core/joint-profile.js";
import { getMaterialById } from "../src/core/data-loader.js";
import { estimatePenetrationDepthMm } from "../src/core/process-params.js";
import * as core from "../src/index.js";
import {
  deriveRecommendationDoeInput,
  recommendProcess,
} from "../src/stage5/process-recommend.js";

describe("welding method normalization", () => {
  it("normalizes Chinese and English lap aliases", () => {
    expect(normalizeWeldingMethod("叠焊")).toBe("lap");
    expect(normalizeWeldingMethod("搭接焊")).toBe("lap");
    expect(normalizeWeldingMethod("lap-joint")).toBe("lap");
  });

  it("normalizes butt and fillet aliases", () => {
    expect(normalizeWeldingMethod("拼焊")).toBe("butt");
    expect(normalizeWeldingMethod("对接焊")).toBe("butt");
    expect(normalizeWeldingMethod("角焊")).toBe("fillet");
    expect(normalizeWeldingMethod("corner")).toBe("fillet");
  });

  it("returns profile behavior for fit-up sensitive joints", () => {
    const lap = getJointProfile("叠焊");
    expect(lap.method).toBe("lap");
    expect(lap.jointType).toBe("lap");
    expect(lap.doe.includeGapAxis).toBe(true);
    expect(lap.risks.join(" ")).toContain("burn-through");
  });

  it("rejects unknown welding methods with supported alternatives", () => {
    expect(() => getJointProfile("mystery-weld")).toThrow(/Unsupported weldingMethod/);
    expect(listSupportedWeldingMethods()).toContain("叠焊");
    expect(listSupportedWeldingMethods()).toContain("butt");
  });

  it("lists canonical methods and aliases without drifting from profiles", () => {
    expect(listSupportedWeldingMethods()).toEqual(
      expect.arrayContaining(["circular", "seal", "t-joint", "环焊", "密封焊", "T型焊"]),
    );
  });

  it("exports helper API from the package barrel", () => {
    expect(core.normalizeWeldingMethod("圆周焊")).toBe("circular");
    expect(core.getJointProfile("密封焊").method).toBe("seal");
    expect(core.listSupportedWeldingMethods()).toContain("t-joint");
  });

  it("returns independent profile objects", () => {
    const profile = getJointProfile("lap");
    profile.risks.push("consumer mutation");
    profile.doe.includeGapAxis = false;

    const nextProfile = getJointProfile("lap");
    expect(nextProfile.risks).not.toContain("consumer mutation");
    expect(nextProfile.doe.includeGapAxis).toBe(true);
  });
});

describe("recommendation DOE derivation", () => {
  it("centers DOE ranges around the adjusted process starting point", () => {
    const profile = getJointProfile("拼焊");
    const input = deriveRecommendationDoeInput({
      powerW: 1000,
      speedMmPerS: 10,
      defocusMm: -0.2,
      gasLpm: 15,
      profile,
      wantsWireFeed: false,
    });
    expect(input.powerMin).toBe(800);
    expect(input.powerMax).toBe(1200);
    expect(input.speedMin).toBe(8);
    expect(input.speedMax).toBe(12);
    expect(input.defocusMin).toBe(-0.7);
    expect(input.defocusMax).toBe(0.3);
    expect(input.includeGapAxis).toBe(true);
  });

  it("adds wire DOE axes only for wire-feed scenarios", () => {
    const profile = getJointProfile("角焊");
    const input = deriveRecommendationDoeInput({
      powerW: 1000,
      speedMmPerS: 10,
      defocusMm: 0,
      gasLpm: 18,
      profile,
      wantsWireFeed: true,
    });
    expect(input.includeGapAxis).toBeUndefined();
    expect(input.wireSpeedMin).toBe(20);
    expect(input.wireSpeedMax).toBe(60);
    expect(input.wireFeedAngleMin).toBe(25);
    expect(input.wireFeedAngleMax).toBe(45);
    expect(input.wobbleAmplitudeMin).toBeGreaterThan(0);
    expect(input.wobbleFrequencyMin).toBeGreaterThan(0);
  });

  it("exports DOE derivation from the package barrel", () => {
    const profile = getJointProfile("拼焊");
    expect(
      core.deriveRecommendationDoeInput({
        powerW: 500,
        speedMmPerS: 10,
        defocusMm: 0,
        gasLpm: 12,
        profile,
        wantsWireFeed: false,
      }).powerMin,
    ).toBe(400);
  });
});

describe("process recommendation", () => {
  it("returns a full recommendation from minimal input", () => {
    const result = recommendProcess({
      material: "copper",
      thicknessMm: 1,
      weldingMethod: "叠焊",
    });
    expect(result.materialId).toBe("copper");
    expect(result.weldingMethod).toBe("lap");
    expect(result.jointType).toBe("lap");
    expect(result.processWindow.powerW).toBeGreaterThan(0);
    expect(result.hardware.recommendedLaserTypes.length).toBeGreaterThan(0);
    expect(result.doe.matrix.length).toBe(9);
    expect(result.doe.csv).toContain("gapMm");
    expect(result.bom.lineItems.length).toBeGreaterThan(0);
    expect(result.risks.join(" ")).toContain("burn-through");
    expect(result.validationPlan.join(" ")).toContain("trial weld");
    expect(result.assumptions.length).toBeGreaterThan(0);
    expect(result.tuningWorkflow.map((step) => step.stage)).toEqual([
      "target-and-joint",
      "energy-focus",
      "shielding-cooling",
      "scan-motion",
      "observe-and-refine",
      "recipe-release",
    ]);
    expect(result.monitoringPlan.map((item) => item.signal)).toEqual(
      expect.arrayContaining(["vision-position", "power-feedback", "temperature", "reflected-light"]),
    );
    expect(result.safetyInterlocks.map((item) => item.name)).toEqual(
      expect.arrayContaining(["door-interlock", "emergency-stop", "cooling-alarm", "gas-pressure-alarm"]),
    );
    expect(result.recipeManagement.parametersToLock).toEqual(
      expect.arrayContaining(["powerW", "speedMmPerS", "defocusMm", "shieldGasLpm"]),
    );
  });

  it("changes visible guidance by welding method", () => {
    const butt = recommendProcess({
      material: "stainless-304",
      thicknessMm: 1,
      weldingMethod: "拼焊",
    });
    const fillet = recommendProcess({
      material: "stainless-304",
      thicknessMm: 1,
      weldingMethod: "角焊",
    });
    expect(butt.doe.csv).toContain("gapMm");
    expect(fillet.doe.csv).not.toContain("gapMm");
    expect(fillet.risks.join(" ")).toContain("root lack of fusion");
    expect(fillet.equipmentHints.join(" ")).toContain("clearance");
  });

  it("keeps optional professional inputs optional while refining risk", () => {
    const result = recommendProcess({
      material: "stainless-304",
      thicknessMm: 0.8,
      weldingMethod: "角焊",
      applicationScenario: "push-pull-brazing",
      baseMaterialB: "stainless-304",
      thicknessBMm: 0.8,
      qualityTargets: ["appearance", "strength"],
      targetTaktSec: 12,
      wireFeedMode: "push-pull",
      brazingWireFamily: "CuSi",
    });
    expect(result.inputsToConfirm).not.toContain("weldingMethod");
    expect(result.hardware.wireFeedHeadRecommendation?.feedMode).toBe("push-pull");
    expect(result.doe.csv).toContain("wireSpeedMmPerS");
  });

  it("keeps nested penetration consistent with joint-adjusted line energy", () => {
    const result = recommendProcess({
      material: "stainless-304",
      thicknessMm: 1,
      weldingMethod: "角焊",
    });

    const materialFactor = getMaterialById("stainless-304")?.materialFactor;
    expect(materialFactor).toBeDefined();
    expect(result.processWindow.processParams?.penetrationDepthMm).toBe(
      estimatePenetrationDepthMm(result.processWindow.lineEnergyJPerMm, materialFactor!),
    );
  });

  it("forwards light transmittance to polymer process and hardware recommendations", () => {
    const result = recommendProcess({
      material: "pc",
      thicknessMm: 2,
      weldingMethod: "拼焊",
      lightTransmittance: 0.8,
    });

    expect(result.processWindow.weldMode).toBe("transmission");
    expect(result.processWindow.effectiveTransmittance).toBe(0.8);
    expect(result.hardware.wavelengthNm).toBe(2000);
    expect(result.hardware.recommendedLaserTypes).toContain("fiber-2um");
  });

  it("omits nozzle-specific parameters for galvo scanner recommendations", () => {
    const result = recommendProcess({
      material: "stainless-304",
      thicknessMm: 1,
      weldingMethod: "拼焊",
      motionPlatform: "galvo-scanner",
    });

    expect(result.hardware.beamDelivery).toBe("galvo-scanner");
    expect(result.doe.csv).not.toContain("nozzleDistanceMm");
    expect(result.doe.csv).not.toContain("nozzleAngleDeg");
    expect(result.processWindow.processParams?.shielding?.nozzleDistanceMm).toBeUndefined();
    expect(result.processWindow.processParams?.shielding?.nozzleAngleDeg).toBeUndefined();
  });
});
