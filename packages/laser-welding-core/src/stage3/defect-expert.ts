import { matchesAlias, resolveSymptom } from "../core/aliases.js";
import { getMaterialById, loadDefectRules } from "../core/data-loader.js";
import { MaterialNotFoundError } from "../core/errors.js";
import { DISCLAIMER, type DefectDiagnoseResult } from "../core/types.js";

export interface DefectDiagnoseInput {
  symptom: string;
  material: string;
  thicknessMm: number;
}

function normalizeSymptom(s: string): string {
  return resolveSymptom(s);
}

function matchCondition(
  cond: { field: string; op: string; value: string | number },
  materialId: string,
): boolean {
  if (cond.field === "material" && cond.op === "eq") {
    return materialId === cond.value;
  }
  return true;
}

export function diagnoseDefect(input: DefectDiagnoseInput): DefectDiagnoseResult {
  const mat = getMaterialById(input.material);
  if (!mat) throw new MaterialNotFoundError(input.material);

  const symptom = normalizeSymptom(input.symptom);
  const rules = loadDefectRules();
  const matched = rules.filter(
    (r) =>
      (normalizeSymptom(r.symptom) === symptom || matchesAlias(input.symptom, r.aliases, r.symptom)) &&
      r.conditions.every((c) => matchCondition(c, mat.id)),
  );

  const fallback = rules.filter(
    (r) =>
      (normalizeSymptom(r.symptom) === symptom || matchesAlias(input.symptom, r.aliases, r.symptom)) &&
      r.conditions.length === 0,
  );
  const use = matched.length > 0 ? matched : fallback;

  const actions = use.flatMap((r) => r.actions);

  return {
    symptom,
    matchedRules: use.map((r) => r.id),
    actions,
    confidence: "heuristic",
    disclaimer: DISCLAIMER,
  };
}
