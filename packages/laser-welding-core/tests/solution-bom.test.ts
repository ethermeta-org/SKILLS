import { describe, expect, it } from "vitest";
import { recommendHardware } from "../src/stage2/laser-selector.js";
import { composeSolutionBom } from "../src/stage4/solution-bom.js";

describe("composeSolutionBom", () => {
  it("OFC copper + galvo has green/blue laser and no gantry motion", () => {
    const r = composeSolutionBom({
      material: "copper-ofc",
      thicknessMm: 1,
      motionPlatform: "galvo-scanner",
      laserHead: "galvo",
    });
    const ids = r.lineItems.map((i) => i.id);
    expect(ids.some((id) => id === "laser-green" || id === "laser-blue")).toBe(true);
    expect(ids).toContain("motion-galvo-stage");
    expect(ids).not.toContain("motion-gantry");
    expect(ids).toContain("head-galvo");
  });

  it("turnkey application includes integration and plc-hmi with multi-station layout", () => {
    const r = composeSolutionBom({
      material: "copper",
      thicknessMm: 1.2,
      application: "turnkey-automation-line",
    });
    const cats = r.lineItems.map((i) => i.category);
    expect(cats).toContain("integration");
    expect(cats).toContain("plc-hmi");
    expect(r.lineLayout.stations?.length).toBeGreaterThan(1);
    expect(r.turnkeyVendors?.length).toBeGreaterThan(0);
  });

  it("brazing includes wire-feeder and fume extraction", () => {
    const r = composeSolutionBom({
      material: "copper",
      thicknessMm: 1,
      application: "laser-brazing-push-pull",
    });
    const ids = r.lineItems.map((i) => i.id);
    expect(ids).toContain("wire-feeder");
    expect(ids.some((id) => id.startsWith("fume-"))).toBe(true);
  });

  it("hardware_recommend bomSummary itemCount matches solution_bom lineItems", () => {
    const input = { material: "stainless-304", thicknessMm: 2, application: "general-fusion" };
    const hw = recommendHardware(input);
    const bom = composeSolutionBom(input);
    expect(hw.bomSummary.itemCount).toBe(bom.lineItems.length);
    expect(hw.bomSummary.categories.sort()).toEqual(
      [...new Set(bom.lineItems.map((i) => i.category))].sort(),
    );
  });
});
