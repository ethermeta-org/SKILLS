/** Bilingual alias resolution for materials, symptoms, and laser brands. */

export interface AliasMap {
  en?: string[];
  zh?: string[];
}

const MATERIAL_ALIASES: Record<string, string> = {
  copper: "copper",
  cu: "copper",
  "\u94dc": "copper",
  "\u7d2b\u94dc": "copper-ofc",
  "stainless-304": "stainless-304",
  "stainless steel": "stainless-304",
  stainless: "stainless-304",
  "\u4e0d\u9508\u94a2": "stainless-304",
  "304\u4e0d\u9508\u94a2": "stainless-304",
  "aluminum-6061": "aluminum-6061",
  aluminum: "aluminum-6061",
  aluminium: "aluminum-6061",
  "\u94dd": "aluminum-6061",
  "\u94dd\u5408\u91d1": "aluminum-6061",

  "copper-ofc": "copper-ofc",
  ofc: "copper-ofc",
  pa6: "pa6",
  pa66: "pa66",
  abs: "abs",
  pc: "pc",
  pmma: "pmma",
  pp: "pp",
  polypropylene: "pp",
  "\u805a\u4e19\u70ef": "pp",
};

const SYMPTOM_ALIASES: Record<string, string> = {
  blowout: "blowout",
  spatter: "blowout",
  "\u98de\u6e85": "blowout",
  "\u70b8\u5b54": "blowout",
  lack_of_fusion: "lack_of_fusion",
  "lack of fusion": "lack_of_fusion",
  "\u672a\u7194\u5408": "lack_of_fusion",
  "\u672a\u710a\u900f": "lack_of_fusion",
  porosity: "porosity",
  pores: "porosity",
  "\u6c14\u5b54": "porosity",
  "\u5b54\u9699": "porosity",
  cracking: "cracking",
  crack: "cracking",
  "\u88c2\u7eb9": "cracking",
  "\u5f00\u88c2": "cracking",
};

const APPLICATION_HINTS = {
  brazing: ["brazing", "braze", "\u94ca\u710a", "\u6fc0\u5149\u94ca\u710a", "\u63a8\u62c9\u4e1d", "push-pull", "push_pull"],
  turnkey: ["turnkey", "\u6210\u5957", "\u4ea7\u7ebf", "\u81ea\u52a8\u5316\u65b9\u6848", "\u96c6\u6210\u65b9\u6848", "automation-line"],
} as const;

export function normalizeKey(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, "-");
}

export function resolveMaterialId(input: string): string {
  const key = normalizeKey(input);
  const raw = input.trim();
  if (MATERIAL_ALIASES[key]) return MATERIAL_ALIASES[key];
  if (MATERIAL_ALIASES[raw]) return MATERIAL_ALIASES[raw];
  return key;
}

export function resolveSymptom(input: string): string {
  const key = normalizeKey(input).replace(/-/g, "_");
  const raw = input.trim();
  if (SYMPTOM_ALIASES[key]) return SYMPTOM_ALIASES[key];
  if (SYMPTOM_ALIASES[raw]) return SYMPTOM_ALIASES[raw];
  return key;
}

export function applicationHints(application: string): {
  wantsBrazing: boolean;
  wantsTurnkey: boolean;
} {
  const lower = application.toLowerCase();
  const raw = application;
  const wantsBrazing = APPLICATION_HINTS.brazing.some(
    (h) => lower.includes(h.toLowerCase()) || raw.includes(h),
  );
  const wantsTurnkey = APPLICATION_HINTS.turnkey.some(
    (h) => lower.includes(h.toLowerCase()) || raw.includes(h),
  );
  return { wantsBrazing, wantsTurnkey };
}

export function matchesAlias(input: string, aliases?: AliasMap, canonicalId?: string): boolean {
  const key = normalizeKey(input);
  if (canonicalId && (key === canonicalId || key === normalizeKey(canonicalId))) return true;
  if (!aliases) return false;
  const en = aliases.en?.map(normalizeKey) ?? [];
  const zh = aliases.zh ?? [];
  return en.includes(key) || zh.includes(input.trim()) || zh.some((z) => normalizeKey(z) === key);
}
