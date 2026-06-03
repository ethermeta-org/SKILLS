import { describe, expect, it } from "vitest";
import {
  buildDecisionPack,
  buildMissingInfoClosure,
  buildMotionArchitectureCandidates,
  buildRecommendationEvidence,
} from "../src/core/recommendation-metadata.js";
import { recommendProcess } from "../src/stage5/process-recommend.js";

describe("dual-pack recommendation metadata", () => {
  it("caps initial heuristic recommendations at CONDITIONAL GO", () => {
    const pack = buildDecisionPack({
      missingInputs: [],
      assumptions: ["Surface condition is assumed clean and oxide/oil controlled."],
      risks: ["Validate fit-up and heat input with trial welds."],
      validationPlan: ["Run trial welds before production release."],
    });

    expect(pack.decisionGate).toBe("CONDITIONAL GO");
    expect(pack.decisionSummary).toContain("条件可行");
    expect(pack.topRisks.length).toBeLessThanOrEqual(3);
    expect(pack.evidenceNeeded.join(" ")).toContain("试焊");
  });

  it("keeps decision pack conditional when only process evidence is measured", () => {
    const pack = buildDecisionPack({
      missingInputs: [],
      assumptions: [],
      risks: [],
      validationPlan: ["Run trial welds before production release."],
      measuredSubjects: ["process-window"],
    });

    expect(pack.decisionGate).toBe("CONDITIONAL GO");
  });

  it("allows GO only when all critical decision subjects are measured", () => {
    const pack = buildDecisionPack({
      missingInputs: [],
      assumptions: [],
      risks: [],
      validationPlan: ["Run trial welds before production release."],
      measuredSubjects: ["process-window", "equipment-candidate", "doe-plan", "validation-plan"],
    });

    expect(pack.decisionGate).toBe("GO");
  });

  it("builds Chinese-first closure records for missing presales fields", () => {
    const closure = buildMissingInfoClosure(["targetTaktSec", "seamLengthMm", "ringDiameterMm"]);

    expect(closure).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "targetTaktSec",
          labelZh: "节拍目标",
          owner: "user",
          method: "customer-confirmation",
        }),
        expect.objectContaining({
          field: "seamLengthMm",
          labelZh: "焊缝长度",
          owner: "process-engineer",
          method: "measurement",
        }),
        expect.objectContaining({
          field: "ringDiameterMm",
          labelZh: "环焊直径",
          method: "measurement",
        }),
      ]),
    );
  });

  it("tags recommendations with evidence level and confidence", () => {
    const evidence = buildRecommendationEvidence({
      missingInputs: ["targetTaktSec"],
      assumptions: ["Quality target is assumed general strength and appearance until confirmed."],
      subjects: ["process-window", "equipment-candidate"],
    });

    expect(evidence).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: "process-window",
          evidenceLevel: "E2",
          confidence: "Medium",
        }),
        expect.objectContaining({
          subject: "equipment-candidate",
          evidenceLevel: "E3",
          confidence: "Low",
        }),
      ]),
    );
  });

  it("does not promote unmeasured subjects to E1", () => {
    const evidence = buildRecommendationEvidence({
      missingInputs: ["targetTaktSec"],
      assumptions: ["Quality target is assumed general strength and appearance until confirmed."],
      measuredSubjects: ["process-window"],
      subjects: ["process-window", "equipment-candidate"],
    });

    expect(evidence).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: "process-window",
          evidenceLevel: "E1",
          confidence: "High",
        }),
        expect.objectContaining({
          subject: "equipment-candidate",
          evidenceLevel: "E3",
          confidence: "Low",
        }),
      ]),
    );
  });

  it("mentions measured ring diameter for circular motion candidates", () => {
    const candidates = buildMotionArchitectureCandidates({
      weldingMethod: "circular",
      ringDiameterMm: 42,
    });

    expect(candidates[0]?.fitCondition).toContain("42 mm");
    expect(candidates[0]?.validationGate).toContain("42 mm");
  });

  it("does not claim circular diameter is clear when ring diameter is missing", () => {
    const candidates = buildMotionArchitectureCandidates({ weldingMethod: "circular" });

    expect(candidates[0]?.fitCondition).not.toContain("圆周焊直径明确");
    expect(candidates[0]?.fitCondition).toMatch(/待确认|需确认/);
  });

  it("keeps circular diameter pending context for high-takt circular candidates", () => {
    const candidates = buildMotionArchitectureCandidates({
      weldingMethod: "circular",
      targetTaktSec: 1.5,
    });

    expect(JSON.stringify(candidates)).toMatch(/待确认|需确认/);
  });

  it("keeps circular diameter context for galvo circular candidates", () => {
    const candidates = buildMotionArchitectureCandidates({
      weldingMethod: "circular",
      motionPlatform: "galvo-scanner",
      ringDiameterMm: 18,
    });

    expect(JSON.stringify(candidates)).toContain("18 mm");
  });

  it("adds battery-tab context to high-takt galvo candidates", () => {
    const candidates = buildMotionArchitectureCandidates({
      weldingMethod: "lap",
      applicationScenario: "battery-tab",
      targetTaktSec: 1.5,
    });

    expect(candidates[0]?.fitCondition).toContain("电池极耳");
    expect(candidates[0]?.validationGate).toContain("低飞溅");
    expect(candidates[0]?.validationGate).toContain("导电");
  });
});

describe("process dual-pack output", () => {
  it("returns decision pack and engineering metadata from minimal input", () => {
    const result = recommendProcess({
      material: "stainless-304",
      thicknessMm: 1,
      weldingMethod: "角焊",
      qualityTargets: ["strength", "appearance"],
    });

    expect(result).not.toHaveProperty("gateStatus");
    if ("gateStatus" in result) throw new Error("expected full recommendation");

    expect(result.decisionPack!.decisionGate).toBe("CONDITIONAL GO");
    expect(result.decisionPack!.decisionSummary).toContain("条件可行");
    expect(result.recommendationEvidence!).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ subject: "process-window", evidenceLevel: "E2" }),
        expect.objectContaining({ subject: "equipment-candidate" }),
        expect.objectContaining({ subject: "motion-architecture" }),
      ]),
    );
    expect(result.missingInfoClosure!.length).toBeGreaterThan(0);
    expect(result.motionArchitectureCandidates!.length).toBeGreaterThanOrEqual(2);
  });

  it("builds motion candidates from resolved hardware motion platform", () => {
    const result = recommendProcess({
      material: "pc",
      thicknessMm: 2,
      weldingMethod: "拼焊",
      lightTransmittance: 0.8,
    });

    if ("gateStatus" in result) throw new Error("expected full recommendation");

    expect(result.hardware.motionPlatform).toBe("galvo-scanner");
    expect(result.motionArchitectureCandidates?.map((candidate) => candidate.name)).toContain("振镜扫描工位");
  });

  it("includes galvo plus robot for explicit high-takt process recommendations", () => {
    const result = recommendProcess({
      material: "copper",
      thicknessMm: 1,
      weldingMethod: "叠焊",
      applicationScenario: "battery-tab",
      targetTaktSec: 2,
      qualityTargets: ["conductivity", "low-spatter"],
    });

    if ("gateStatus" in result) throw new Error("expected full recommendation");

    expect(result.motionArchitectureCandidates?.map((candidate) => candidate.name)).toContain("振镜 + 机器人");
    expect(result.motionArchitectureCandidates?.length).toBeGreaterThanOrEqual(2);
    expect(result.motionArchitectureCandidates?.[0]?.validationGate).toContain("验证");
  });

  it("uses rotary and robot-positioner candidates for complete circular process recommendations", () => {
    const result = recommendProcess({
      material: "copper",
      thicknessMm: 1,
      weldingMethod: "环焊",
      ringDiameterMm: 18,
      qualityTargets: ["conductivity"],
    });

    if ("gateStatus" in result) throw new Error("expected full recommendation");

    const names = result.motionArchitectureCandidates?.map((candidate) => candidate.name) ?? [];
    expect(names).toContain("单轴旋转 + 线性轴");
    expect(names).toContain("机器人 + 变位机");
  });

  it("keeps ring gate blocked without full recommendation metadata", () => {
    const result = recommendProcess({
      material: "copper",
      thicknessMm: 1,
      weldingMethod: "环焊",
    });

    expect(result.gateStatus).toBe("blocked");
    expect(result.missingRequiredInputs).toContain("ringDiameterMm");
    expect(result).not.toHaveProperty("motionArchitectureCandidates");
    expect(result).not.toHaveProperty("decisionPack");
  });
});
