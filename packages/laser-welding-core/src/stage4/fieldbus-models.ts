import { loadFieldbus } from "../core/data-loader.js";
import { DISCLAIMER, type FieldbusMapResult } from "../core/types.js";

export function mapFieldbus(protocol: string): FieldbusMapResult {
  const normalized = protocol.toLowerCase().replace(/_/g, "-");
  const data = loadFieldbus(normalized);
  return {
    protocol: data.protocol,
    statusWords: data.statusWords,
    controlWords: data.controlWords,
    confidence: "heuristic",
    disclaimer: DISCLAIMER,
  };
}
