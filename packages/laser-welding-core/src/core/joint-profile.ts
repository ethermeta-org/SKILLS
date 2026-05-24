import { ValidationError } from "./errors.js";
import type { JointProfile, WeldingMethod } from "./types.js";

const JOINT_PROFILES: Record<WeldingMethod, JointProfile> = {
  lap: {
    method: "lap",
    displayName: { en: "Lap weld", zh: "叠焊 / 搭接焊" },
    aliases: ["lap", "lap-joint", "overlap", "叠焊", "搭接焊", "搭焊"],
    jointType: "lap",
    defaultSeamType: "line",
    process: {
      powerFactor: 1.08,
      speedFactor: 0.95,
      defocusOffsetMm: 0,
      doePowerSpread: 0.18,
      doeSpeedSpread: 0.18,
    },
    doe: { includeGapAxis: true, gapMinMm: 0.02, gapMaxMm: 0.2 },
    equipmentHints: ["Use stable clamping and overlap control; add seam tracking when overlap varies."],
    fixtureHints: ["Control upper-sheet contact, overlap width, and vertical pressure."],
    inspectionHints: ["Cross-section upper-sheet burn-through and lower-sheet fusion."],
    risks: ["upper-sheet burn-through", "lower-sheet lack of fusion", "gap-driven spatter"],
    validationEmphasis: ["Cross-section both sheets and verify fusion into the lower sheet."],
    acceptanceEmphasis: ["Confirm overlap width, nugget width, and strength or resistance target."],
  },
  butt: {
    method: "butt",
    displayName: { en: "Butt weld", zh: "拼焊 / 对接焊" },
    aliases: ["butt", "butt-joint", "拼焊", "对接焊"],
    jointType: "butt",
    defaultSeamType: "line",
    process: {
      powerFactor: 1,
      speedFactor: 1,
      defocusOffsetMm: 0,
      doePowerSpread: 0.2,
      doeSpeedSpread: 0.2,
    },
    doe: { includeGapAxis: true, gapMinMm: 0.02, gapMaxMm: 0.15 },
    equipmentHints: ["Use seam tracking or vision when gap and mismatch are not mechanically controlled."],
    fixtureHints: ["Control gap, edge preparation, and height mismatch along the seam."],
    inspectionHints: ["Cross-section root fusion and inspect mismatch-driven underfill."],
    risks: ["root lack of fusion", "edge mismatch", "gap-driven underfill"],
    validationEmphasis: ["DOE gap sensitivity and cross-section root fusion."],
    acceptanceEmphasis: ["Confirm weld continuity, root fusion, and tensile or bend acceptance."],
  },
  fillet: {
    method: "fillet",
    displayName: { en: "Fillet weld", zh: "角焊" },
    aliases: ["fillet", "corner", "角焊"],
    jointType: "fillet",
    defaultSeamType: "line",
    process: {
      powerFactor: 1.12,
      speedFactor: 0.9,
      defocusOffsetMm: 0.1,
      doePowerSpread: 0.18,
      doeSpeedSpread: 0.16,
    },
    doe: { includeGapAxis: false },
    equipmentHints: ["Check head access angle and TCP clearance; wobble can stabilize leg formation."],
    fixtureHints: ["Control part perpendicularity and root contact before welding."],
    inspectionHints: ["Cross-section root fusion and fillet leg consistency."],
    risks: ["root lack of fusion", "uneven fillet leg", "head access collision"],
    validationEmphasis: ["Validate root fusion and leg size by cross-section."],
    acceptanceEmphasis: ["Confirm leg size, throat, and strength target."],
  },
  "t-joint": {
    method: "t-joint",
    displayName: { en: "T-joint weld", zh: "T型焊" },
    aliases: ["t-joint", "tee", "t型焊", "t 形焊", "T型焊", "T 形焊"],
    jointType: "t-joint",
    defaultSeamType: "line",
    process: {
      powerFactor: 1.1,
      speedFactor: 0.9,
      defocusOffsetMm: 0.1,
      doePowerSpread: 0.18,
      doeSpeedSpread: 0.16,
    },
    doe: { includeGapAxis: false },
    equipmentHints: ["Check head clearance around the vertical member and fixture access."],
    fixtureHints: ["Control root contact and perpendicularity."],
    inspectionHints: ["Cross-section root fusion and throat size."],
    risks: ["root lack of fusion", "part fit-up variation", "fixture access limitation"],
    validationEmphasis: ["Validate fit-up sensitivity and root fusion."],
    acceptanceEmphasis: ["Confirm throat size and strength target."],
  },
  edge: {
    method: "edge",
    displayName: { en: "Edge weld", zh: "边焊" },
    aliases: ["edge", "边焊"],
    jointType: "edge",
    defaultSeamType: "line",
    process: {
      powerFactor: 0.92,
      speedFactor: 1.05,
      defocusOffsetMm: 0.1,
      doePowerSpread: 0.15,
      doeSpeedSpread: 0.15,
    },
    doe: { includeGapAxis: false },
    equipmentHints: ["Use stable shielding and conservative heat input to avoid edge burn-back."],
    fixtureHints: ["Support the edge and avoid unsupported melt-back."],
    inspectionHints: ["Inspect edge continuity, burn-back, and undercut."],
    risks: ["edge burn-back", "undercut", "shielding loss"],
    validationEmphasis: ["Validate heat input and edge continuity."],
    acceptanceEmphasis: ["Confirm edge profile and continuity."],
  },
  seal: {
    method: "seal",
    displayName: { en: "Seal weld", zh: "密封焊" },
    aliases: ["seal", "sealing", "密封焊"],
    jointType: "seal",
    defaultSeamType: "line",
    process: {
      powerFactor: 1,
      speedFactor: 0.92,
      defocusOffsetMm: 0,
      doePowerSpread: 0.16,
      doeSpeedSpread: 0.16,
    },
    doe: { includeGapAxis: true, gapMinMm: 0.01, gapMaxMm: 0.1 },
    equipmentHints: ["Prioritize path continuity and stable shielding; add vision when seam closure varies."],
    fixtureHints: ["Control seam contact and prevent leak paths at starts, stops, and corners."],
    inspectionHints: ["Add leak or pressure testing to visual and cross-section checks."],
    risks: ["porosity", "leak path", "start-stop discontinuity"],
    validationEmphasis: ["Run leak or pressure testing after trial welds."],
    acceptanceEmphasis: ["Confirm customer leak rate or pressure hold criteria."],
  },
  circular: {
    method: "circular",
    displayName: { en: "Circular weld", zh: "环焊 / 圆周焊" },
    aliases: ["circular", "circumferential", "环焊", "圆周焊"],
    jointType: "circular",
    defaultSeamType: "circle",
    process: {
      powerFactor: 1,
      speedFactor: 0.95,
      defocusOffsetMm: 0,
      doePowerSpread: 0.16,
      doeSpeedSpread: 0.16,
    },
    doe: { includeGapAxis: false },
    equipmentHints: ["Use rotary, synchronized gantry, or galvo path control depending on diameter."],
    fixtureHints: ["Control roundness, concentricity, and start-stop overlap."],
    inspectionHints: ["Inspect closure overlap and circumferential continuity."],
    risks: ["start-stop crater", "path closure mismatch", "roundness variation"],
    validationEmphasis: ["Validate start-stop overlap and full path continuity."],
    acceptanceEmphasis: ["Confirm circular continuity and dimensional tolerance."],
  },
};

function normalizeAlias(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

const ALIAS_TO_METHOD = new Map<string, WeldingMethod>();
for (const profile of Object.values(JOINT_PROFILES)) {
  ALIAS_TO_METHOD.set(normalizeAlias(profile.method), profile.method);
  for (const alias of profile.aliases) {
    ALIAS_TO_METHOD.set(normalizeAlias(alias), profile.method);
  }
}

export function normalizeWeldingMethod(input: string): WeldingMethod {
  const method = ALIAS_TO_METHOD.get(normalizeAlias(input));
  if (!method) {
    throw new ValidationError(
      `Unsupported weldingMethod '${input}'. Supported examples: ${listSupportedWeldingMethods().join(", ")}`,
    );
  }
  return method;
}

export function getJointProfile(input: string): JointProfile {
  return cloneJointProfile(JOINT_PROFILES[normalizeWeldingMethod(input)]);
}

export function listSupportedWeldingMethods(): string[] {
  return [...new Set(Object.values(JOINT_PROFILES).flatMap((profile) => [profile.method, ...profile.aliases]))];
}

function cloneJointProfile(profile: JointProfile): JointProfile {
  return {
    ...profile,
    displayName: { ...profile.displayName },
    aliases: [...profile.aliases],
    process: { ...profile.process },
    doe: { ...profile.doe },
    equipmentHints: [...profile.equipmentHints],
    fixtureHints: [...profile.fixtureHints],
    inspectionHints: [...profile.inspectionHints],
    risks: [...profile.risks],
    validationEmphasis: [...profile.validationEmphasis],
    acceptanceEmphasis: [...profile.acceptanceEmphasis],
  };
}
