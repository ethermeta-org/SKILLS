import { describe, expect, it } from "vitest";
import { handleSolutionBom } from "../src/tools/handlers.js";
import { hardwareRecommendSchema, solutionBomSchema } from "../src/tools/schemas.js";

describe("presales MCP schemas", () => {
  it("accepts push-pull brazing hardware inputs", () => {
    const parsed = hardwareRecommendSchema.parse({
      material: "stainless-304",
      thicknessMm: 0.8,
      applicationScenario: "push-pull-brazing",
      deliveryScope: "presales-solution",
      automationLevel: "gantry-line",
      wireFeedMode: "push-pull",
      wireFeedOrientation: "front",
      brazingWireFamily: "CuSi",
      preferredBrands: ["IPG"],
      forbiddenBrands: ["Raycus"],
      budgetLevel: "mid",
    });
    expect(parsed.wireFeedMode).toBe("push-pull");
  });

  it("returns presales fields through solution_bom handler", () => {
    const content = handleSolutionBom({
      material: "stainless-304",
      thicknessMm: 0.8,
      application: "laser-brazing-push-pull",
      applicationScenario: "push-pull-brazing",
      deliveryScope: "presales-solution",
      baseMaterialB: "stainless-304",
      thicknessBMm: 0.8,
      jointType: "lap",
      seamType: "line",
      seamLengthMm: 100,
      qualityTargets: ["appearance"],
      targetTaktSec: 12,
      wireFeedMode: "push-pull",
      brazingWireFamily: "CuSi",
    });
    const data = JSON.parse(content[0]?.text ?? "{}") as {
      riskLevel: string;
      wireFeedHeadRecommendation?: { feedMode: string };
      brazingWireRecommendation?: { family: string };
    };
    expect(data.riskLevel).toMatch(/low|medium|high/);
    expect(data.wireFeedHeadRecommendation?.feedMode).toBe("push-pull");
    expect(data.brazingWireRecommendation?.family).toBe("CuSi");
  });

  it("rejects pricing-like budget values", () => {
    expect(() =>
      solutionBomSchema.parse({
        material: "copper",
        thicknessMm: 1,
        budgetLevel: "100000",
      }),
    ).toThrow();
  });
});
