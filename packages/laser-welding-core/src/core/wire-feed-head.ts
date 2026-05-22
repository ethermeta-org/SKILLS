import { loadWireFeedHeads } from "./data-loader.js";
import type {
  ApplicationScenario,
  MotionPlatformId,
  WireFeedHeadRecommendation,
  WireFeedMode,
  WireFeedOrientation,
} from "./types.js";

export interface WireFeedHeadInput {
  applicationScenario?: ApplicationScenario;
  motionPlatform?: MotionPlatformId;
  wireFeedMode?: WireFeedMode;
  wireFeedOrientation?: WireFeedOrientation;
  headCoolingRequired?: boolean;
  seamTrackingRequired?: boolean;
  preheatRequired?: boolean;
  collisionEnvelopeNotes?: string;
}

export function recommendWireFeedHead(input: WireFeedHeadInput): WireFeedHeadRecommendation {
  const catalog = loadWireFeedHeads();
  const desiredMode: WireFeedMode =
    input.wireFeedMode ?? (input.applicationScenario === "push-pull-brazing" ? "push-pull" : "push");
  const record =
    catalog.heads.find((h) => h.feedMode === desiredMode) ??
    catalog.heads.find((h) => h.feedMode === "push-pull") ??
    catalog.heads[0];

  const orientation = input.wireFeedOrientation ?? record.orientations[0] ?? "front";
  const compatibleMotion = record.compatibleMotion.filter((m) =>
    ["gantry", "single-axis", "galvo-scanner"].includes(m),
  ) as MotionPlatformId[];

  const risks = [...record.risks];
  if (input.motionPlatform && !record.compatibleMotion.includes(input.motionPlatform)) {
    risks.push(`Selected wire-feed head has compatibility risk with ${input.motionPlatform}.`);
  }
  if (input.motionPlatform === "galvo-scanner") {
    risks.push(
      "Push-pull wire-feed heads usually need TCP access and are risky with compact galvo scanner layouts.",
    );
  }
  if (input.collisionEnvelopeNotes) {
    risks.push(`Collision envelope requires review: ${input.collisionEnvelopeNotes}`);
  }

  const notes = [...record.notes];
  if (input.seamTrackingRequired) notes.push("Include seam tracking in equipment and DOE validation.");
  if (input.preheatRequired) notes.push("Include preheat module and validate wetting stability.");

  return {
    headType: record.headType,
    feedMode: desiredMode,
    orientation,
    compatibleMotion,
    coolingRequired: input.headCoolingRequired ?? record.coolingRequired,
    notes,
    risks,
  };
}
