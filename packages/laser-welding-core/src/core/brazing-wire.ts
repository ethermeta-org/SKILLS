import { loadBrazingWires } from "./data-loader.js";
import type {
  ApplicationScenario,
  BrazingWireFamily,
  BrazingWireRecommendation,
} from "./types.js";

export interface BrazingWireInput {
  baseMaterialA: string;
  baseMaterialB?: string;
  applicationScenario?: ApplicationScenario;
  brazingWireFamily?: BrazingWireFamily;
  wireMaterialGrade?: string;
  wettingPriority?: boolean;
  appearancePriority?: boolean;
  strengthPriority?: boolean;
  corrosionRequirement?: string;
}

function materialMatches(material: string, compatible: string[]): boolean {
  const key = material.toLowerCase();
  return compatible.some((m) => key.includes(m.toLowerCase()) || m.toLowerCase().includes(key));
}

export function recommendBrazingWire(input: BrazingWireInput): BrazingWireRecommendation {
  const catalog = loadBrazingWires();
  const materials = [input.baseMaterialA, input.baseMaterialB].filter(Boolean) as string[];

  let family = input.brazingWireFamily;
  if (!family) {
    if (materials.some((m) => /aluminum|aluminium|al-/.test(m.toLowerCase()))) family = "AlSi";
    else if (materials.some((m) => /copper|cu|ofc/.test(m.toLowerCase()))) family = "Cu-based";
    else if (input.appearancePriority || input.wettingPriority) family = "CuSi";
    else if (materials.some((m) => /stainless|304/.test(m.toLowerCase()))) family = "stainless-filler";
    else family = "custom";
  }

  const record = catalog.families.find((f) => f.family === family);
  const pairCovered =
    record != null && materials.every((m) => materialMatches(m, record.compatibleMaterials));

  if (!record || !pairCovered) {
    return {
      family: family === "custom" ? "custom" : family,
      compatibleMaterials: materials,
      notes: [
        "Selected filler family is outside or only partially covered by the heuristic catalog.",
        "Final wire grade must be confirmed against customer material standards, corrosion requirements, and trial welds.",
      ],
      risks: [
        "Material pair is outside the validated heuristic catalog; use customer standards and supplier guidance.",
      ],
      validation: [
        "Confirm filler grade through trial weld, cross-section, wetting inspection, and customer acceptance tests.",
      ],
    };
  }

  return {
    family,
    compatibleMaterials: record.compatibleMaterials,
    notes: [
      ...record.notes,
      "Final wire grade must be confirmed against customer material standards, corrosion requirements, and trial welds.",
    ],
    risks: record.risks,
    validation: [
      "Confirm wire diameter, feed speed, wetting, bead appearance, and joint performance through trial weld DOE.",
      "Record rejected samples and final accepted parameter window before production release.",
    ],
  };
}
