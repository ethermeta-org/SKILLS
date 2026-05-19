import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { AliasMap } from "./aliases.js";
import { matchesAlias, resolveMaterialId } from "./aliases.js";
import type { LaserRecord, MaterialRecord } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
let dataRoot = join(__dirname, "../../data");
const templateRoot = join(__dirname, "../../templates");

export function setDataRoot(root: string): void {
  dataRoot = root;
}

export function getDataRoot(): string {
  return dataRoot;
}

function loadJson<T>(filename: string): T {
  const raw = readFileSync(join(dataRoot, filename), "utf-8");
  return JSON.parse(raw) as T;
}

export function loadMaterials(): MaterialRecord[] {
  return loadJson<MaterialRecord[]>("materials.json");
}

export function loadLasers(): LaserRecord[] {
  return loadJson<LaserRecord[]>("lasers.json");
}

export function loadDefectRules(): Array<{
  id: string;
  symptom: string;
  aliases?: AliasMap;
  conditions: Array<{ field: string; op: string; value: string | number }>;
  actions: Array<{
    param: string;
    deltaPercent?: number;
    absolute?: string | number;
    rationale: string;
  }>;
}> {
  return loadJson("defects.json");
}

export function loadFieldbus(protocol: string): {
  protocol: string;
  statusWords: Record<string, string>;
  controlWords: Record<string, string>;
} {
  const map: Record<string, string> = {
    "opc-ua": "opc-ua.json",
    profinet: "profinet.json",
    ethercat: "ethercat.json",
  };
  const file = map[protocol];
  if (!file) throw new Error(`Unknown fieldbus protocol: ${protocol}`);
  return loadJson(join("fieldbus", file));
}

export function loadTemplateSync(name: string): string {
  return readFileSync(join(templateRoot, name), "utf-8");
}


export interface EquipmentCatalog {
  motionPlatforms: Array<{ id: string; aliases?: AliasMap }>;
  laserHeads: Array<{ id: string; compatibleMotion: string[]; aliases?: AliasMap }>;
}

export function loadEquipment(): EquipmentCatalog {
  return loadJson<EquipmentCatalog>("equipment.json");
}

export function resolveMotionPlatform(input: string): string | undefined {
  
  const eq = loadEquipment();
  for (const m of eq.motionPlatforms) {
    if (m.id === input || matchesAlias(input, m.aliases, m.id)) return m.id;
  }
  return undefined;
}

export function resolveLaserHead(input: string): string | undefined {
  const eq = loadEquipment();
  for (const h of eq.laserHeads) {
    const head = h as { id: string; aliases?: AliasMap };
    if (head.id === input || matchesAlias(input, head.aliases, head.id)) return head.id;
  }
  return undefined;
}

export function isHeadCompatible(headId: string, motionId: string): boolean {
  const head = loadEquipment().laserHeads.find((h) => h.id === headId);
  return head?.compatibleMotion.includes(motionId) ?? false;
}

export function getMaterialById(materialId: string): MaterialRecord | undefined {
  const resolved = resolveMaterialId(materialId);
  return loadMaterials().find(
    (m) =>
      m.id === resolved ||
      m.id === materialId ||
      m.name.toLowerCase() === materialId.toLowerCase() ||
      matchesAlias(materialId, m.aliases, m.id),
  );
}
