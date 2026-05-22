import { describe, expect, it } from "vitest";
import { handleMaterialAssess, handleSolutionBom } from "../src/tools/handlers.js";

describe("MCP handlers", () => {
  it("material_assess returns JSON", () => {
    const content = handleMaterialAssess({ material: "copper", thicknessMm: 1 });
    const text = content[0]?.text ?? "";
    const data = JSON.parse(text) as { materialId: string };
    expect(data.materialId).toBe("copper");
  });

  it("material_assess pc transmission", () => {
    const content = handleMaterialAssess({ material: "pc", thicknessMm: 2, lightTransmittance: 0.8 });
    const data = JSON.parse(content[0]?.text ?? "{}") as { weldMode: string };
    expect(data.weldMode).toBe("transmission");
  });

  it("solution_bom returns line items", () => {
    const content = handleSolutionBom({ material: "copper", thicknessMm: 1 });
    const data = JSON.parse(content[0]?.text ?? "{}") as { lineItems: unknown[] };
    expect(data.lineItems.length).toBeGreaterThan(0);
  });
});
