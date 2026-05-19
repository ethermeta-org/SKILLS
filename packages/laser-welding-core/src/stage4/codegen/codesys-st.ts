import { loadTemplateSync } from "../../core/data-loader.js";
import { DISCLAIMER, type CodegenResult } from "../../core/types.js";

export interface CodegenStInput {
  profile?: string;
  preGasMs?: number;
  postGasMs?: number;
}

export function generateCodesysSt(input: CodegenStInput = {}): CodegenResult {
  const profile = input.profile ?? "default";
  const preGasMs = input.preGasMs ?? 200;
  const postGasMs = input.postGasMs ?? 500;

  let code = loadTemplateSync("FB_LaserControl.st.tpl");
  code = code.replace(/\{\{PRE_GAS_MS\}\}/g, String(preGasMs));
  code = code.replace(/\{\{POST_GAS_MS\}\}/g, String(postGasMs));

  return {
    language: "st",
    code,
    profile,
    confidence: "heuristic",
    disclaimer: DISCLAIMER,
  };
}
