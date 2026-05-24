import { describe, expect, it } from "vitest";
import { handleProcessRecommend } from "../src/tools/handlers.js";
import { processRecommendSchema } from "../src/tools/schemas.js";
import { MCP_TOOLS } from "../src/tools/list-tools.js";

describe("process_recommend MCP tool", () => {
  it("accepts minimal Chinese welding method input", () => {
    const parsed = processRecommendSchema.parse({
      material: "copper",
      thicknessMm: 1,
      weldingMethod: "叠焊",
    });
    expect(parsed.weldingMethod).toBe("叠焊");
  });

  it("returns full recommendation sections through handler", () => {
    const content = handleProcessRecommend({
      material: "stainless-304",
      thicknessMm: 1,
      weldingMethod: "角焊",
    });
    const data = JSON.parse(content[0]?.text ?? "{}") as {
      processWindow?: unknown;
      hardware?: unknown;
      doe?: { matrix: unknown[] };
      bom?: { lineItems: unknown[] };
      risks?: string[];
      validationPlan?: string[];
    };
    expect(data.processWindow).toBeTruthy();
    expect(data.hardware).toBeTruthy();
    expect(data.doe?.matrix.length).toBeGreaterThan(0);
    expect(data.bom?.lineItems.length).toBeGreaterThan(0);
    expect(data.risks?.join(" ")).toContain("root lack of fusion");
    expect(data.validationPlan?.join(" ")).toContain("trial weld");
  });

  it("lists process_recommend with only simple required fields", () => {
    const tool = MCP_TOOLS.find((candidate) => candidate.name === "process_recommend");
    expect(tool).toBeTruthy();
    expect(tool?.inputSchema.required).toEqual(["material", "thicknessMm", "weldingMethod"]);
  });

  it("keeps process_recommend schema and advertised properties in parity", () => {
    const tool = MCP_TOOLS.find((candidate) => candidate.name === "process_recommend");
    const samples: Record<string, unknown> = {
      material: "copper",
      thicknessMm: 1,
      weldingMethod: "lap",
      application: "battery-tab",
      lightTransmittance: 0.8,
      motionPlatform: "gantry",
      laserHead: "fixed-focus",
      preferredLaserType: "fiber-1064",
      fieldbusProtocol: "opc-ua",
      includeVision: true,
      seamLengthMm: 10,
      targetSpeedMmPerS: 40,
      gapMm: 0.05,
      wireFill: true,
      wireDiameterMm: 0.8,
      targetPenetrationDepthMm: 0.6,
      baseMaterialB: "copper",
      thicknessBMm: 1,
      coating: "none",
      surfaceCondition: "clean",
      applicationScenario: "battery-tab",
      deliveryScope: "presales-solution",
      qualityTargets: ["strength"],
      brazingWireFamily: "CuSi",
      targetTaktSec: 30,
      partsPerHour: 120,
      stationCount: 1,
      preferredBrands: ["IPG"],
      forbiddenBrands: ["none"],
      budgetLevel: "mid",
      wireFeedMode: "push-pull",
      wireFeedOrientation: "front",
    };
    const advertisedKeys = Object.keys(tool?.inputSchema.properties ?? {});
    const schemaKeys = Object.keys(processRecommendSchema.shape);
    const payload = Object.fromEntries(
      advertisedKeys.map((key) => [key, samples[key]]),
    );
    const parsed = processRecommendSchema.parse({ ...payload, annualVolume: 1000, wireSpeedMmPerS: 20 });

    expect(advertisedKeys).toEqual(schemaKeys);
    expect(tool?.inputSchema.properties).not.toHaveProperty("annualVolume");
    expect(tool?.inputSchema.properties).not.toHaveProperty("wireSpeedMmPerS");
    expect(parsed).not.toHaveProperty("annualVolume");
    expect(() => processRecommendSchema.parse(payload)).not.toThrow();
  });
});
