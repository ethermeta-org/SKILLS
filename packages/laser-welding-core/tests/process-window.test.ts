import { describe, expect, it } from "vitest";
import { assessMaterial } from "../src/stage1/process-window.js";
import { recommendHardware } from "../src/stage2/laser-selector.js";
import { generateDoeMatrix } from "../src/stage3/doe-matrix.js";
import { diagnoseDefect } from "../src/stage3/defect-expert.js";
describe("assessMaterial", () => {
  it("returns process window for copper 1mm", () => {
    const r = assessMaterial({ material: "copper", thicknessMm: 1, jointType: "battery-tab" });
    expect(r.materialId).toBe("copper");
    expect(r.powerW).toBeGreaterThan(0);
    expect(r.recommendedWavelengthNm).toContain(515);
    expect(r.confidence).toBe("heuristic");
  });
});

describe("recommendHardware", () => {
  it("recommends 515nm for battery tab copper", () => {
    const r = recommendHardware({
      material: "copper",
      thicknessMm: 1,
      application: "battery-tab",
    });
    expect(r.wavelengthNm).toBe(515);
    expect(r.beamDelivery).toBe("wobble");
    expect(r.recommendedBrands.length).toBeGreaterThan(0);
  });
});

describe("generateDoeMatrix", () => {
  it("builds matrix with line energy", () => {
    const r = generateDoeMatrix({
      powerMin: 800,
      powerMax: 2000,
      speedMin: 1,
      speedMax: 8,
      gridSize: 3,
    });
    expect(r.matrix.length).toBe(9);
    expect(r.csv).toContain("sampleId");
  });
});

describe("diagnoseDefect", () => {
  it("matches blowout rules for copper", () => {
    const r = diagnoseDefect({ symptom: "blowout", material: "copper", thicknessMm: 1 });
    expect(r.actions.length).toBeGreaterThan(0);
    expect(r.matchedRules).toContain("blowout-cu");
  });
});


import { resolveMaterialId, resolveSymptom } from "../src/core/aliases.js";

describe("aliases", () => {
  it("resolves Chinese material names", () => {
    expect(resolveMaterialId("铜")).toBe("copper");
    expect(resolveMaterialId("不锈钢")).toBe("stainless-304");
  });

  it("resolves Chinese defect symptoms", () => {
    expect(resolveSymptom("飞溅")).toBe("blowout");
    expect(resolveSymptom("气孔")).toBe("porosity");
  });
});

describe("recommendHardware brazing", () => {
  it("prioritizes brazing-capable brands for brazing application", () => {
    const r = recommendHardware({
      material: "copper",
      thicknessMm: 1,
      application: "laser-brazing-push-pull",
    });
    const brands = r.recommendedBrands.map((b) => b.brand);
    expect(brands.some((b) => b === "Oneshare")).toBe(true);
    expect(r.warnings.some((w) => w.includes("brazing") || w.includes("Brazing"))).toBe(true);
  });
});

describe("diagnoseDefect Chinese", () => {
  it("matches blowout from Chinese symptom", () => {
    const r = diagnoseDefect({ symptom: "飞溅", material: "copper", thicknessMm: 1 });
    expect(r.symptom).toBe("blowout");
    expect(r.actions.length).toBeGreaterThan(0);
  });
});

