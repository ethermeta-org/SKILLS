import { describe, expect, it } from "vitest";
import { assessMaterial } from "../src/stage1/process-window.js";
import { recommendHardware } from "../src/stage2/laser-selector.js";
import { generateDoeMatrix } from "../src/stage3/doe-matrix.js";
import { composeSolutionBom } from "../src/stage4/solution-bom.js";
import {
  buildAcceptanceCriteria,
  buildMissingInputs,
  buildValidationPlan,
  inferRiskLevel,
} from "../src/core/presales.js";
import { recommendBrazingWire } from "../src/core/brazing-wire.js";
import { recommendWireFeedHead } from "../src/core/wire-feed-head.js";

describe("presales backward compatibility", () => {
  it("keeps classic material assessment input working", () => {
    const result = assessMaterial({ material: "copper", thicknessMm: 1 });
    expect(result.materialId).toBe("copper");
    expect(result.confidence).toBe("heuristic");
  });

  it("keeps classic hardware recommendation input working", () => {
    const result = recommendHardware({ material: "stainless-304", thicknessMm: 1 });
    expect(result.materialId).toBe("stainless-304");
    expect(result.recommendedLaserTypes).toContain("fiber-1064");
  });

  it("keeps classic solution BOM input working while adding presales fields", () => {
    const result = composeSolutionBom({ material: "copper", thicknessMm: 1 });
    expect(result.lineItems.length).toBeGreaterThan(0);
    expect(result.assumptions).toEqual(expect.any(Array));
    expect(result.missingInputs).toEqual(expect.any(Array));
    expect(result.riskLevel).toMatch(/low|medium|high/);
  });
});

describe("presales helpers", () => {
  it("marks missing presales inputs for full solution scope", () => {
    const missing = buildMissingInputs({
      deliveryScope: "presales-solution",
      applicationScenario: "push-pull-brazing",
    });
    expect(missing).toContain("baseMaterialB");
    expect(missing).toContain("jointType");
    expect(missing).toContain("targetTaktSec");
  });

  it("raises risk when required presales inputs are missing", () => {
    expect(inferRiskLevel(["baseMaterialB", "jointType"], ["coating unknown"])).toBe("high");
    expect(inferRiskLevel([], ["coating unknown"])).toBe("medium");
    expect(inferRiskLevel([], [])).toBe("low");
  });

  it("builds validation and acceptance text without pricing or simulation language", () => {
    const validation = buildValidationPlan({
      applicationScenario: "push-pull-brazing",
      qualityTargets: ["appearance", "strength"],
    });
    const acceptance = buildAcceptanceCriteria({
      qualityTargets: ["appearance", "strength"],
      sealingRequired: true,
    });
    const text = [...validation, ...acceptance].join(" ").toLowerCase();
    expect(text).toContain("trial weld");
    expect(text).toContain("wire");
    expect(text).not.toContain("price");
    expect(text).not.toContain("finite element");
    expect(text).not.toContain("simulation");
  });
});

describe("brazing wire family recommendation", () => {
  it("recommends CuSi for steel brazing appearance/wetting use cases", () => {
    const rec = recommendBrazingWire({
      baseMaterialA: "stainless-304",
      baseMaterialB: "stainless-304",
      applicationScenario: "push-pull-brazing",
      appearancePriority: true,
      wettingPriority: true,
    });
    expect(rec.family).toBe("CuSi");
    expect(rec.validation.join(" ")).toContain("trial weld");
  });

  it("uses custom when material pair is outside the heuristic catalog", () => {
    const rec = recommendBrazingWire({
      baseMaterialA: "unknown-alloy",
      baseMaterialB: "ceramic",
      applicationScenario: "laser-brazing",
    });
    expect(rec.family).toBe("custom");
    expect(rec.risks.join(" ")).toContain("outside");
  });
});

describe("wire-feed head recommendation", () => {
  it("recommends push-pull brazing head for push-pull brazing", () => {
    const rec = recommendWireFeedHead({
      applicationScenario: "push-pull-brazing",
      motionPlatform: "gantry",
      wireFeedMode: "push-pull",
      wireFeedOrientation: "front",
    });
    expect(rec.feedMode).toBe("push-pull");
    expect(rec.headType).toContain("push-pull");
    expect(rec.compatibleMotion).toContain("gantry");
  });

  it("flags galvo compatibility risk for wire-feed head", () => {
    const rec = recommendWireFeedHead({
      applicationScenario: "push-pull-brazing",
      motionPlatform: "galvo-scanner",
      wireFeedMode: "push-pull",
    });
    expect(rec.risks.join(" ")).toContain("galvo");
  });
});

describe("presales material assessment", () => {
  it("returns material-pair warnings for dissimilar metals", () => {
    const result = assessMaterial({
      material: "copper",
      thicknessMm: 1,
      baseMaterialB: "aluminum-6061",
      thicknessBMm: 1.5,
      applicationScenario: "busbar",
      qualityTargets: ["conductivity"],
      coating: "unknown",
      surfaceCondition: "oxidized",
    });
    expect(result.baseMaterialB).toBe("aluminum-6061");
    expect(result.materialPairWarnings?.join(" ")).toContain("Dissimilar");
    expect(result.warnings.join(" ")).toContain("coating");
    expect(result.warnings.join(" ")).toContain("surface");
  });

  it("returns brazing wire recommendation for push-pull brazing", () => {
    const result = assessMaterial({
      material: "stainless-304",
      thicknessMm: 0.8,
      baseMaterialB: "stainless-304",
      thicknessBMm: 0.8,
      applicationScenario: "push-pull-brazing",
      brazingWireFamily: "CuSi",
      wireFill: true,
      gapMm: 0.3,
    });
    expect(result.brazingWireRecommendation?.family).toBe("CuSi");
    expect(result.brazingWireRecommendation?.validation.join(" ")).toContain("trial weld");
  });
});

describe("presales hardware recommendation", () => {
  it("filters forbidden brands and keeps preferred brands as weighting only", () => {
    const result = recommendHardware({
      material: "copper",
      thicknessMm: 1,
      applicationScenario: "busbar",
      preferredBrands: ["IPG"],
      forbiddenBrands: ["Raycus"],
    });
    expect(result.recommendedBrands.map((b) => b.brand)).not.toContain("Raycus");
    expect(result.warnings.join(" ").toLowerCase()).not.toContain("price");
  });

  it("adds wire-feed head and brazing wire recommendations for push-pull brazing", () => {
    const result = recommendHardware({
      material: "stainless-304",
      thicknessMm: 0.8,
      application: "laser-brazing-push-pull",
      applicationScenario: "push-pull-brazing",
      wireFeedMode: "push-pull",
      wireFeedOrientation: "front",
      brazingWireFamily: "CuSi",
      automationLevel: "gantry-line",
      targetTaktSec: 12,
    });
    expect(result.wireFeedHeadRecommendation?.feedMode).toBe("push-pull");
    expect(result.brazingWireRecommendation?.family).toBe("CuSi");
    expect(result.validationPlan?.join(" ")).toContain("trial weld");
  });
});

describe("budgetLevel BOM complexity", () => {
  const base = {
    material: "stainless-304",
    thicknessMm: 1,
    application: "turnkey-line",
  };

  it("omits automation stack items for low budget", () => {
    const low = composeSolutionBom({ ...base, budgetLevel: "low" });
    const high = composeSolutionBom({ ...base, budgetLevel: "high" });
    const lowIds = new Set(low.lineItems.map((i) => i.id));
    const highIds = new Set(high.lineItems.map((i) => i.id));
    expect(lowIds.has("line-integration")).toBe(false);
    expect(lowIds.has("plc-hmi")).toBe(false);
    expect(highIds.has("vision-qa")).toBe(true);
    expect(high.lineItems.length).toBeGreaterThan(low.lineItems.length);
  });
});

describe("presales solution BOM", () => {
  it("returns conceptual BOM when presales inputs are missing", () => {
    const result = composeSolutionBom({
      material: "copper",
      thicknessMm: 1,
      deliveryScope: "presales-solution",
      applicationScenario: "metal-fusion",
    });
    expect(result.missingInputs.length).toBeGreaterThan(0);
    expect(result.riskLevel).toBe("high");
    expect(result.warnings[0]).toContain("conceptual");
    expect(result.lineItems.map((i) => i.id)).not.toContain("line-integration");
    expect(result.lineItems.map((i) => i.id)).not.toContain("plc-hmi");
  });

  it("returns push-pull head, wire consumable, assumptions, risk, validation, and acceptance", () => {
    const result = composeSolutionBom({
      material: "stainless-304",
      thicknessMm: 0.8,
      application: "laser-brazing-push-pull",
      applicationScenario: "push-pull-brazing",
      deliveryScope: "presales-solution",
      baseMaterialB: "stainless-304",
      thicknessBMm: 0.8,
      jointType: "lap",
      seamType: "line",
      seamLengthMm: 120,
      qualityTargets: ["appearance", "strength"],
      targetTaktSec: 10,
      wireFeedMode: "push-pull",
      brazingWireFamily: "CuSi",
      preheatRequired: true,
      seamTrackingRequired: true,
      includeVision: true,
    });
    const ids = result.lineItems.map((i) => i.id);
    expect(ids).toContain("head-push-pull-brazing");
    expect(ids).toContain("wire-consumable-family");
    expect(ids).toContain("preheat-module");
    expect(ids).toContain("seam-tracking");
    expect(result.assumptions).toEqual(expect.any(Array));
    expect(result.missingInputs).toEqual([]);
    expect(result.riskLevel).toMatch(/low|medium|high/);
    expect(result.validationPlan.join(" ")).toContain("trial weld");
    expect(result.acceptanceCriteria.length).toBeGreaterThan(0);
    expect(result.wireFeedHeadRecommendation?.feedMode).toBe("push-pull");
    expect(result.brazingWireRecommendation?.family).toBe("CuSi");
    expect(JSON.stringify(result).toLowerCase()).not.toContain("quotation");
    expect(JSON.stringify(result).toLowerCase()).not.toContain("finite element");
  });
});

describe("presales DOE axes", () => {
  it("adds wire, preheat, gas, and clamp columns when ranges are provided", () => {
    const result = generateDoeMatrix({
      powerMin: 800,
      powerMax: 1000,
      speedMin: 2,
      speedMax: 4,
      gridSize: 2,
      wireSpeedMin: 20,
      wireSpeedMax: 40,
      wireFeedAngleMin: 25,
      wireFeedAngleMax: 45,
      preheatPowerMin: 100,
      preheatPowerMax: 300,
      shieldGasMin: 10,
      shieldGasMax: 18,
      clampForceMin: 50,
      clampForceMax: 120,
    });
    expect(result.csv).toContain("wireSpeedMmPerS");
    expect(result.csv).toContain("wireFeedAngleDeg");
    expect(result.csv).toContain("preheatPowerW");
    expect(result.csv).toContain("shieldGasLpm");
    expect(result.csv).toContain("clampForceN");
  });
});
