import { describe, expect, it } from "vitest";
import { handleProcessRecommend } from "../src/tools/handlers.js";

describe("process_recommend dual-pack MCP output", () => {
  it("returns dual-pack fields while preserving existing sections", () => {
    const content = handleProcessRecommend({
      material: "stainless-304",
      thicknessMm: 1,
      weldingMethod: "角焊",
      qualityTargets: ["strength", "appearance"],
    });
    const data = JSON.parse(content[0]?.text ?? "{}") as {
      decisionPack?: { decisionGate?: string; decisionSummary?: string };
      recommendationEvidence?: unknown[];
      missingInfoClosure?: unknown[];
      motionArchitectureCandidates?: unknown[];
      processWindow?: unknown;
      hardware?: unknown;
      doe?: unknown;
      bom?: unknown;
    };

    expect(data.processWindow).toBeTruthy();
    expect(data.hardware).toBeTruthy();
    expect(data.doe).toBeTruthy();
    expect(data.bom).toBeTruthy();
    expect(data.decisionPack?.decisionGate).toBe("CONDITIONAL GO");
    expect(data.decisionPack?.decisionSummary).toContain("条件可行");
    expect(data.recommendationEvidence?.length).toBeGreaterThan(0);
    expect(data.missingInfoClosure?.length).toBeGreaterThan(0);
    expect(data.motionArchitectureCandidates?.length).toBeGreaterThanOrEqual(2);
  });

  it("does not expose internal orchestration words in structured JSON", () => {
    const content = handleProcessRecommend({
      material: "copper",
      thicknessMm: 1,
      weldingMethod: "叠焊",
    });
    const text = content[0]?.text ?? "";

    expect(text.toLowerCase()).not.toContain("mcp");
    expect(text.toLowerCase()).not.toContain("tool call");
    expect(text.toLowerCase()).not.toContain("fallback mode");
    expect(text.toLowerCase()).not.toContain("internal orchestration");
  });
});
