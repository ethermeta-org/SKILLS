import { applicationHints } from "../core/aliases.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getDataRoot, getMaterialById, loadLasers } from "../core/data-loader.js";
import {
  isPolymerCategory,
  type BomCategory,
  type BomLineItem,
  type BomSummary,
  type BudgetLevel,
  type HardwareRecommendResult,
  type LaserType,
  type LineLayout,
} from "../core/types.js";

interface BomCatalogComponent {
  id: string;
  category: BomCategory;
  name: { en: string; zh: string };
  qty: number;
  unit: "set" | "ea" | "line";
  required: boolean;
  tags: string[];
}

interface BomCatalog {
  components: BomCatalogComponent[];
}

export interface BomBuildContext {
  materialId: string;
  application: string;
  estimatedPowerW: number;
  weldMode?: "absorption" | "transmission" | "hybrid";
  wireFill?: boolean;
  gapMm?: number;
  fieldbusProtocol?: "opc-ua" | "profinet" | "ethercat";
  includeVision?: boolean;
  applicationScenario?: string;
  wireFeedHeadRequired?: boolean;
  brazingWireRequired?: boolean;
  preheatRequired?: boolean;
  seamTrackingRequired?: boolean;
  budgetLevel?: BudgetLevel;
  mesIntegrationRequired?: boolean;
}

function loadBomCatalog(): BomCatalog {
  const raw = readFileSync(join(getDataRoot(), "bom-catalog.json"), "utf-8");
  return JSON.parse(raw) as BomCatalog;
}

function laserSourceTag(laserType: LaserType): string {
  const map: Record<LaserType, string> = {
    "fiber-1064": "laser-fiber-1064",
    "fiber-2um": "laser-fiber-2um",
    "fiber-green": "laser-fiber-green",
    "diode-blue": "laser-diode-blue",
    "diode-semiconductor": "laser-diode-semiconductor",
  };
  return map[laserType];
}

function motionTag(motion: string): string {
  return `motion-${motion}`;
}

function headTag(head: string): string {
  return `head-${head}`;
}

function beamTag(beam: string): string {
  if (beam === "galvo-scanner") return "beam-galvo";
  if (beam === "wobble") return "beam-wobble";
  return "beam-fiber";
}

function collectActiveTags(
  hw: HardwareRecommendResult,
  ctx: BomBuildContext,
): Set<string> {
  const mat = getMaterialById(ctx.materialId);
  const { wantsBrazing, wantsTurnkey } = applicationHints(ctx.application);
  const isMetal = mat ? !isPolymerCategory(mat.category) : true;
  const isPolymer = mat ? isPolymerCategory(mat.category) : false;
  const highReflect =
    mat != null && (mat.reflectivity1064 > 0.85 || mat.id === "copper" || mat.id === "copper-ofc");

  const tags = new Set<string>(["always"]);

  const primaryLaserType = hw.recommendedLaserTypes[0] ?? "fiber-1064";
  tags.add(laserSourceTag(primaryLaserType));
  tags.add(beamTag(hw.beamDelivery));

  if (hw.motionPlatform) tags.add(motionTag(hw.motionPlatform));
  if (hw.laserHead) tags.add(headTag(hw.laserHead));

  if (isMetal) tags.add("metal");
  if (wantsBrazing) tags.add("brazing");

  const budget = ctx.budgetLevel ?? "mid";
  const allowTurnkey =
    budget !== "low" &&
    (wantsTurnkey || budget === "high" || ctx.mesIntegrationRequired === true);
  if (allowTurnkey) tags.add("turnkey");
  if (ctx.fieldbusProtocol || allowTurnkey) tags.add("fieldbus");
  if (highReflect) tags.add("high-reflect");
  if (wantsBrazing || ctx.wireFill) tags.add("wire-fill");
  if (ctx.includeVision || budget === "high") tags.add("vision");
  if (isPolymer && ctx.weldMode === "transmission") tags.add("polymer-transmission");
  if (ctx.wireFeedHeadRequired) tags.add("head-push-pull");
  if (ctx.brazingWireRequired) tags.add("brazing-wire");
  if (ctx.preheatRequired) tags.add("preheat");
  if (ctx.seamTrackingRequired) tags.add("seam-tracking");

  return tags;
}

function pickComponents(activeTags: Set<string>): BomCatalogComponent[] {
  const catalog = loadBomCatalog();
  const picked: BomCatalogComponent[] = [];
  let laserSourcePicked = false;

  for (const comp of catalog.components) {
    const matches = comp.tags.some((t) => activeTags.has(t));
    if (!matches) continue;

    if (comp.category === "laser-source") {
      if (laserSourcePicked) continue;
      const laserTags = comp.tags.filter((t) => t.startsWith("laser-"));
      if (!laserTags.some((t) => activeTags.has(t))) continue;
      laserSourcePicked = true;
    }

    if (comp.category === "motion") {
      const motionTags = comp.tags.filter((t) => t.startsWith("motion-"));
      if (activeTags.has("motion-galvo-scanner") && comp.id === "motion-gantry") continue;
      if (activeTags.has("motion-gantry") && comp.id === "motion-galvo-stage") continue;
      if (!motionTags.some((t) => activeTags.has(t))) continue;
    }

    if (comp.category === "welding-head" && comp.id !== "head-push-pull-brazing") {
      const headTags = comp.tags.filter((t) => t.startsWith("head-"));
      if (!headTags.some((t) => activeTags.has(t))) continue;
    }

    if (comp.category === "fume-extraction") {
      if (activeTags.has("polymer-transmission") && comp.id === "fume-standard") continue;
      if (activeTags.has("high-reflect") && comp.id === "fume-standard") continue;
      if (!activeTags.has("high-reflect") && comp.id === "fume-enhanced") continue;
      if (!activeTags.has("metal") && !activeTags.has("brazing") && comp.category === "fume-extraction")
        continue;
    }

    if (comp.category === "fixture" && comp.id === "fixture-transmission") {
      if (!activeTags.has("polymer-transmission")) continue;
    }
    if (comp.id === "fixture-clamp" && activeTags.has("polymer-transmission")) continue;

    picked.push(comp);
  }

  return picked;
}

const LOW_BUDGET_OPTIONAL_IDS = new Set([
  "vision-qa",
  "line-integration",
  "plc-hmi",
  "fieldbus-gateway",
  "seam-tracking",
  "preheat-module",
]);

function applyBudgetFilter(lineItems: BomLineItem[], ctx: BomBuildContext): BomLineItem[] {
  const budget = ctx.budgetLevel ?? "mid";
  if (budget !== "low") return lineItems;

  return lineItems.filter((item) => {
    if (!LOW_BUDGET_OPTIONAL_IDS.has(item.id)) return true;
    if (item.id === "fieldbus-gateway" && ctx.fieldbusProtocol) return true;
    if (item.id === "seam-tracking" && ctx.seamTrackingRequired) return true;
    if (item.id === "preheat-module" && ctx.preheatRequired) return true;
    if (item.id === "vision-qa" && ctx.includeVision) return true;
    return false;
  });
}

function toLineItem(
  comp: BomCatalogComponent,
  hw: HardwareRecommendResult,
  ctx: BomBuildContext,
): BomLineItem {
  const oemHint =
    comp.category === "laser-source" && hw.recommendedBrands[0]
      ? `${hw.recommendedBrands[0].brand} ${hw.recommendedBrands[0].modelSeries}`
      : undefined;

  const specs: Record<string, string | number> = {};
  if (comp.category === "cooling") {
    const powerKw = Math.max(1, Math.ceil(ctx.estimatedPowerW / 1000));
    specs.minCoolingCapacityKW = powerKw;
  }
  if (comp.category === "laser-source" && hw.recommendedBrands[0]) {
    specs.powerRangeKW = `${hw.recommendedBrands[0].powerRangeKW[0]}-${hw.recommendedBrands[0].powerRangeKW[1]}`;
  }
  if (comp.id === "fieldbus-gateway" && ctx.fieldbusProtocol) {
    specs.protocol = ctx.fieldbusProtocol;
  }

  let notes: string | undefined;
  if (comp.id === "wire-feeder" && ctx.gapMm != null) {
    notes = `Gap ${ctx.gapMm} mm — validate wire diameter with DOE.`;
  }
  if (comp.id === "head-push-pull-brazing") {
    notes = "Validate wire angle, nozzle offset, TCP clearance, and cooling with trial weld setup.";
  }
  if (comp.id === "wire-consumable-family") {
    notes =
      "Wire family is heuristic; final grade must follow customer material standards and trial weld validation.";
  }

  return {
    id: comp.id,
    category: comp.category,
    name: comp.name,
    qty: comp.qty,
    unit: comp.unit,
    required: comp.required,
    oemHint,
    specs: Object.keys(specs).length > 0 ? specs : undefined,
    notes,
  };
}

export function buildLineLayout(
  lineItems: BomLineItem[],
  ctx: BomBuildContext,
): LineLayout {
  const { wantsBrazing, wantsTurnkey } = applicationHints(ctx.application);
  const ids = new Set(lineItems.map((i) => i.id));

  if (wantsTurnkey) {
    const stations: LineLayout["stations"] = [
      {
        id: "load",
        name: { en: "Load / unload", zh: "上下料" },
        componentIds: ["fixture-clamp", "fixture-transmission"].filter((id) => ids.has(id)),
      },
      {
        id: "weld",
        name: { en: "Laser weld station", zh: "激光焊接工位" },
        componentIds: lineItems
          .filter((i) =>
            ["laser-source", "welding-head", "motion", "beam-delivery"].includes(i.category),
          )
          .map((i) => i.id),
      },
    ];
    if (wantsBrazing && ids.has("wire-feeder")) {
      stations.push({
        id: "preheat",
        name: { en: "Preheat / wire feed", zh: "预热 / 送丝" },
        componentIds: ["wire-feeder"],
      });
    }
    stations.push({
      id: "inspect",
      name: { en: "Inspection", zh: "检测" },
      componentIds: ids.has("vision-qa") ? ["vision-qa"] : [],
    });
    return {
      workflow: ["load", "preheat", "weld", "cool", "inspect", "unload"],
      stations,
    };
  }

  const workflow = ["load", "weld", "cool"];
  if (wantsBrazing) workflow.splice(1, 0, "preheat");
  if (ids.has("vision-qa")) workflow.push("inspect");
  workflow.push("unload");

  return { workflow };
}

export function buildBomLineItems(
  hw: HardwareRecommendResult,
  ctx: BomBuildContext,
): BomLineItem[] {
  const activeTags = collectActiveTags(hw, ctx);
  const components = pickComponents(activeTags);
  return applyBudgetFilter(components.map((c) => toLineItem(c, hw, ctx)), ctx);
}

export function summarizeBom(lineItems: BomLineItem[]): BomSummary {
  const categories = [...new Set(lineItems.map((i) => i.category))];
  return {
    itemCount: lineItems.length,
    categories,
    requiredCount: lineItems.filter((i) => i.required).length,
  };
}

export function turnkeyVendorsFromCatalog(): string[] {
  const lasers = loadLasers();
  const brands = new Set<string>();
  for (const l of lasers) {
    if (l.capabilities.includes("turnkey-automation")) brands.add(l.brand);
  }
  return [...brands].sort();
}
