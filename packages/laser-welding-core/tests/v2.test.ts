import { describe, expect, it } from "vitest";
import { resolveMaterialId, resolveSymptom } from "../src/core/aliases.js";
import { resolveWeldMode } from "../src/core/polymer.js";
import { getMaterialById } from "../src/core/data-loader.js";
import { assessMaterial } from "../src/stage1/process-window.js";
import { recommendHardware } from "../src/stage2/laser-selector.js";

describe("v2 materials", () => {
  it("resolves copper-ofc separately from copper", () => {
    expect(resolveMaterialId("紫铜")).toBe("copper-ofc");
    expect(getMaterialById("copper-ofc")?.id).toBe("copper-ofc");
    expect(getMaterialById("copper")?.id).toBe("copper");
  });

  it("loads pa66 with lightTransmittance", () => {
    const m = getMaterialById("pa66");
    expect(m?.category).toBe("engineering-polymer");
    expect(m?.lightTransmittance).toBeLessThan(0.3);
  });
});

describe("v2 polymer", () => {
  it("resolveWeldMode thresholds", () => {
    expect(resolveWeldMode(0.85)).toBe("transmission");
    expect(resolveWeldMode(0.1)).toBe("absorption");
    expect(resolveWeldMode(0.5)).toBe("hybrid");
  });

  it("assess pa66 absorption mode", () => {
    const r = assessMaterial({ material: "pa66", thicknessMm: 2 });
    expect(r.weldMode).toBe("absorption");
    expect(r.processParams?.penetrationDepthMm).toBeGreaterThan(0);
  });

  it("assess pc with transmittance override", () => {
    const r = assessMaterial({ material: "pc", thicknessMm: 3, lightTransmittance: 0.85 });
    expect(r.weldMode).toBe("transmission");
    expect(r.effectiveTransmittance).toBe(0.85);
  });

  it("wireFill builds power curve", () => {
    const r = assessMaterial({
      material: "stainless-304",
      thicknessMm: 1,
      wireFill: true,
      gapMm: 0.5,
    });
    expect(r.processParams?.powerCurve?.segments.length).toBeGreaterThanOrEqual(2);
    expect(r.processParams?.wireFill?.gapMm).toBe(0.5);
  });
});

describe("v2 hardware", () => {
  it("recommends galvo for galvo-scanner motion", () => {
    const r = recommendHardware({
      material: "stainless-304",
      thicknessMm: 1,
      motionPlatform: "galvo-scanner",
    });
    expect(r.laserHead).toBe("galvo");
    expect(r.beamDelivery).toBe("galvo-scanner");
  });

  it("recommends fiber-2um for pmma", () => {
    const r = recommendHardware({ material: "pmma", thicknessMm: 2 });
    expect(r.recommendedLaserTypes).toContain("fiber-2um");
  });
});

describe("v2 aliases", () => {
  it("resolves Chinese defect symptom", () => {
    expect(resolveSymptom("飞溅")).toBe("blowout");
  });
});

import { generateDoeMatrix } from "../src/stage3/doe-matrix.js";
import { generateTrajectory } from "../src/stage4/trajectory.js";
import { resolveMotionPlatform } from "../src/core/data-loader.js";

describe("v2 doe and trajectory", () => {
  it("doe includes defocus and gap columns", () => {
    const r = generateDoeMatrix({
      powerMin: 800,
      powerMax: 1200,
      speedMin: 2,
      speedMax: 6,
      gridSize: 2,
      defocusMin: -1,
      defocusMax: 0,
      gapMin: 0.3,
      gapMax: 0.6,
      includeGapAxis: true,
    });
    expect(r.csv).toContain("defocusMm");
    expect(r.csv).toContain("gapMm");
  });

  it("trajectory galvo has scanner comment without leading blank line", () => {
    const r = generateTrajectory({
      pathType: "line",
      lengthMm: 5,
      speedMmPerS: 3,
      powerW: 1000,
      motionPlatform: "galvo-scanner",
    });
    expect(r.program.startsWith("; Galvo")).toBe(true);
  });

  it("resolveMotionPlatform 龙门", () => {
    expect(resolveMotionPlatform("龙门")).toBe("gantry");
  });
});

describe("v2 hardware extended", () => {
  it("stainless recommends fiber-1064", () => {
    const r = recommendHardware({ material: "stainless-304", thicknessMm: 1 });
    expect(r.recommendedLaserTypes).toContain("fiber-1064");
  });

  it("processParams defocus sign negative for thin metal", () => {
    const r = assessMaterial({ material: "copper-ofc", thicknessMm: 1 });
    expect(r.processParams?.defocus.sign).toBe("negative");
  });

  it("ABS resolves via alias", () => {
    expect(getMaterialById("ABS")?.id).toBe("abs");
  });
});
