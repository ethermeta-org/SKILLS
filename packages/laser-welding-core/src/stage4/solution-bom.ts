import { applicationHints } from "../core/aliases.js";
import { assessMaterial, type MaterialAssessInput } from "../stage1/process-window.js";
import {
  recommendHardware,
  type HardwareRecommendInput,
} from "../stage2/laser-selector.js";
import { DISCLAIMER, type SolutionBomResult } from "../core/types.js";
import {
  buildAcceptanceCriteria,
  buildAssumptions,
  buildMissingInputs,
  buildValidationPlan,
  inferRiskLevel,
} from "../core/presales.js";
import {
  buildBomLineItems,
  buildLineLayout,
  turnkeyVendorsFromCatalog,
  type BomBuildContext,
} from "./bom-builder.js";

const CONCEPTUAL_BOM_CATEGORIES = new Set([
  "laser-source",
  "welding-head",
  "motion",
  "beam-delivery",
  "cooling",
  "safety",
  "fixture",
  "gas-delivery",
  "wire-feeder",
  "fume-extraction",
]);

export interface SolutionBomInput extends HardwareRecommendInput {
  fieldbusProtocol?: "opc-ua" | "profinet" | "ethercat";
  includeVision?: boolean;
  wireFill?: boolean;
  gapMm?: number;
  safetyLevel?: string;
  plantUtilities?: string[];
  fixtureComplexity?: "low" | "medium" | "high";
  mesIntegrationRequired?: boolean;
  plcPreference?: string;
}

export function composeSolutionBom(input: SolutionBomInput): SolutionBomResult {
  const hw = recommendHardware(input);

  const assessInput: MaterialAssessInput = {
    material: input.material,
    thicknessMm: input.thicknessMm,
    wireFill: input.wireFill,
    gapMm: input.gapMm,
    lightTransmittance: input.lightTransmittance,
    baseMaterialB: input.baseMaterialB,
    thicknessBMm: input.thicknessBMm,
    applicationScenario: input.applicationScenario,
    qualityTargets: input.qualityTargets,
    coating: input.coating,
    surfaceCondition: input.surfaceCondition,
    brazingWireFamily: input.brazingWireFamily,
  };
  const assess = assessMaterial(assessInput);

  const ctx: BomBuildContext = {
    materialId: hw.materialId,
    application: hw.application,
    estimatedPowerW: assess.powerW,
    weldMode: assess.weldMode,
    wireFill: input.wireFill,
    gapMm: input.gapMm,
    fieldbusProtocol: input.fieldbusProtocol,
    includeVision: input.includeVision,
    applicationScenario: input.applicationScenario,
    wireFeedHeadRequired: Boolean(hw.wireFeedHeadRecommendation),
    brazingWireRequired: Boolean(hw.brazingWireRecommendation ?? assess.brazingWireRecommendation),
    preheatRequired: input.preheatRequired,
    seamTrackingRequired: input.seamTrackingRequired,
    budgetLevel: input.budgetLevel,
    mesIntegrationRequired: input.mesIntegrationRequired,
  };

  const presalesCtx = {
    applicationScenario: input.applicationScenario,
    deliveryScope: input.deliveryScope,
    baseMaterialB: input.baseMaterialB,
    thicknessBMm: input.thicknessBMm,
    jointType: input.jointType,
    seamType: input.seamType,
    seamLengthMm: input.seamLengthMm,
    qualityTargets: input.qualityTargets,
    targetTaktSec: input.targetTaktSec,
    annualVolume: input.annualVolume,
    partsPerHour: input.partsPerHour,
    stationCount: input.stationCount,
    coating: input.coating,
    surfaceCondition: input.surfaceCondition,
    sealingRequired: input.sealingRequired,
  };
  const missingInputs = buildMissingInputs(presalesCtx);
  const assumptions = buildAssumptions(presalesCtx);
  const riskLevel = inferRiskLevel(missingInputs, assumptions);
  const validationPlan = buildValidationPlan(presalesCtx);
  const acceptanceCriteria = buildAcceptanceCriteria(presalesCtx);

  let lineItems = buildBomLineItems(hw, ctx);
  const warnings = [...hw.warnings];
  if (missingInputs.length > 0 && input.deliveryScope === "presales-solution") {
    warnings.unshift(
      "Presales solution incomplete: required inputs are missing. BOM is conceptual (core process equipment only) until intake is complete.",
    );
    lineItems = lineItems.filter((item) => CONCEPTUAL_BOM_CATEGORIES.has(item.category));
  }
  const lineLayout = buildLineLayout(lineItems, ctx);
  const vendors = turnkeyVendorsFromCatalog();
  const { wantsTurnkey } = applicationHints(input.application ?? hw.application);

  return {
    materialId: hw.materialId,
    thicknessMm: hw.thicknessMm,
    application: hw.application,
    lineItems,
    lineLayout,
    turnkeyVendors: wantsTurnkey ? vendors : undefined,
    assumptions,
    missingInputs,
    riskLevel,
    validationPlan,
    acceptanceCriteria,
    wireFeedHeadRecommendation: hw.wireFeedHeadRecommendation,
    brazingWireRecommendation: hw.brazingWireRecommendation ?? assess.brazingWireRecommendation,
    confidence: "heuristic",
    disclaimer: DISCLAIMER,
    warnings,
  };
}
