import type {
  ApplicationScenario,
  DeliveryScope,
  QualityTarget,
  RiskLevel,
} from "./types.js";

export interface PresalesContext {
  applicationScenario?: ApplicationScenario;
  deliveryScope?: DeliveryScope;
  baseMaterialB?: string;
  thicknessBMm?: number;
  jointType?: string;
  seamType?: string;
  seamLengthMm?: number;
  qualityTargets?: QualityTarget[];
  targetTaktSec?: number;
  annualVolume?: number;
  partsPerHour?: number;
  stationCount?: number;
  coating?: string;
  surfaceCondition?: string;
  sealingRequired?: boolean;
}

export function buildMissingInputs(ctx: PresalesContext): string[] {
  const missing: string[] = [];
  const wantsPresales = ctx.deliveryScope === "presales-solution";
  if (wantsPresales || ctx.applicationScenario != null) {
    if (!ctx.baseMaterialB) missing.push("baseMaterialB");
    if (ctx.thicknessBMm == null) missing.push("thicknessBMm");
    if (!ctx.jointType) missing.push("jointType");
    if (!ctx.seamType) missing.push("seamType");
    if (ctx.seamLengthMm == null) missing.push("seamLengthMm");
  }
  if (wantsPresales) {
    if (!ctx.qualityTargets || ctx.qualityTargets.length === 0) missing.push("qualityTargets");
    if (ctx.targetTaktSec == null && ctx.partsPerHour == null) missing.push("targetTaktSec");
  }
  return [...new Set(missing)];
}

export function buildAssumptions(ctx: PresalesContext): string[] {
  const assumptions: string[] = [];
  if (!ctx.coating) {
    assumptions.push(
      "No coating or plating details provided; coating risk must be confirmed before trial weld.",
    );
  }
  if (!ctx.surfaceCondition) {
    assumptions.push("Surface condition is assumed clean and oxide/oil controlled.");
  }
  if (ctx.stationCount == null && ctx.deliveryScope === "presales-solution") {
    assumptions.push(
      "Station count is estimated from takt during layout planning and must be confirmed with automation design.",
    );
  }
  return assumptions;
}

export function inferRiskLevel(missingInputs: string[], assumptions: string[]): RiskLevel {
  if (missingInputs.length > 0) return "high";
  if (assumptions.length > 0) return "medium";
  return "low";
}

export function buildValidationPlan(ctx: PresalesContext): string[] {
  const plan = [
    "Run trial welds before production release; all numeric settings are heuristic starting points.",
    "Use cross-section or destructive testing to confirm penetration and fusion/brazing quality.",
  ];
  if (ctx.applicationScenario === "push-pull-brazing" || ctx.applicationScenario === "laser-brazing") {
    plan.push(
      "Run DOE across laser power, travel speed, wire speed, wire angle, gap, and preheat where applicable.",
    );
  }
  if (ctx.qualityTargets?.includes("conductivity")) {
    plan.push("Measure joint resistance and confirm conductive performance against the customer limit.");
  }
  if (ctx.sealingRequired || ctx.qualityTargets?.includes("sealing")) {
    plan.push("Run leak or pressure testing against the sealing requirement.");
  }
  if (ctx.qualityTargets?.includes("appearance")) {
    plan.push("Inspect bead wetting, surface finish, discoloration, and spatter against appearance samples.");
  }
  return plan;
}

export function buildAcceptanceCriteria(ctx: PresalesContext): string[] {
  const criteria = [
    "Customer confirms material grades, thicknesses, joint design, and validation method before final process lock.",
    "DOE report records accepted parameter window, rejected samples, and observed defects.",
  ];
  if (ctx.qualityTargets?.includes("strength")) {
    criteria.push("Strength acceptance is based on customer-defined tensile, peel, or shear test limits.");
  }
  if (ctx.qualityTargets?.includes("conductivity")) {
    criteria.push(
      "Conductivity acceptance is based on measured micro-ohm resistance or customer electrical test method.",
    );
  }
  if (ctx.sealingRequired || ctx.qualityTargets?.includes("sealing")) {
    criteria.push("Sealing acceptance is based on customer leak rate or pressure hold criteria.");
  }
  return criteria;
}
