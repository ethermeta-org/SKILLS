export { assessMaterial, type MaterialAssessInput } from "./stage1/process-window.js";
export { recommendHardware, type HardwareRecommendInput } from "./stage2/laser-selector.js";
export { generateDoeMatrix, type DoeMatrixInput } from "./stage3/doe-matrix.js";
export { diagnoseDefect, type DefectDiagnoseInput } from "./stage3/defect-expert.js";
export { generateTrajectory, type TrajectoryInput } from "./stage4/trajectory.js";
export { mapFieldbus } from "./stage4/fieldbus-models.js";
export { composeSolutionBom, type SolutionBomInput } from "./stage4/solution-bom.js";
export {
  deriveRecommendationDoeInput,
  recommendProcess,
  type RecommendationDoeSeed,
} from "./stage5/process-recommend.js";
export {
  buildBomLineItems,
  buildLineLayout,
  summarizeBom,
  turnkeyVendorsFromCatalog,
  type BomBuildContext,
} from "./stage4/bom-builder.js";
export * from "./core/types.js";
export * from "./core/errors.js";
export {
  getJointProfile,
  listSupportedWeldingMethods,
  normalizeWeldingMethod,
} from "./core/joint-profile.js";
export { setDataRoot, getDataRoot } from "./core/data-loader.js";
export * from "./core/aliases.js";
