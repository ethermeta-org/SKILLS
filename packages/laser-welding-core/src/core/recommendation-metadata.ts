import type {
  ApplicationScenario,
  DecisionGate,
  DecisionPack,
  MissingInfoClosure,
  MotionArchitectureCandidate,
  MotionPlatformId,
  RecommendationConfidence,
  RecommendationEvidence,
  RecommendationEvidenceSubject,
  WeldingMethod,
} from "./types.js";

const CLOSURE_CATALOG: Record<string, Omit<MissingInfoClosure, "field">> = {
  baseMaterialB: {
    labelZh: "第二材料",
    owner: "user",
    method: "customer-confirmation",
    impactIfMissing: "异种材料兼容性、焊接模式和验收方法无法可靠锁定。",
  },
  thicknessBMm: {
    labelZh: "第二材料厚度",
    owner: "user",
    method: "measurement",
    impactIfMissing: "线能量窗口、夹具压紧和熔深风险会偏离实际工况。",
  },
  jointType: {
    labelZh: "接头形式",
    owner: "process-engineer",
    method: "customer-confirmation",
    impactIfMissing: "工艺窗口和 DOE 间隙轴无法按真实接头收敛。",
  },
  seamType: {
    labelZh: "焊缝类型",
    owner: "process-engineer",
    method: "measurement",
    impactIfMissing: "运动架构和轨迹验证边界无法可靠判断。",
  },
  seamLengthMm: {
    labelZh: "焊缝长度",
    owner: "process-engineer",
    method: "measurement",
    impactIfMissing: "节拍估算、热输入累计和运动平台选择会保持低置信度。",
  },
  qualityTargets: {
    labelZh: "质量目标",
    owner: "user",
    method: "customer-confirmation",
    impactIfMissing: "验收标准只能保持定性，无法形成放行依据。",
  },
  targetTaktSec: {
    labelZh: "节拍目标",
    owner: "user",
    method: "customer-confirmation",
    impactIfMissing: "产能、工位数量和运动架构选择无法可靠锁定。",
  },
  ringDiameterMm: {
    labelZh: "环焊直径",
    owner: "user",
    method: "measurement",
    impactIfMissing: "环焊头型、运动架构、轨迹和 DOE 边界无法可靠推荐。",
  },
};

export function buildMissingInfoClosure(fields: string[]): MissingInfoClosure[] {
  return [...new Set(fields)].map((field) => ({
    field,
    ...(CLOSURE_CATALOG[field] ?? {
      labelZh: field,
      owner: "user" as const,
      method: "customer-confirmation" as const,
      impactIfMissing: "该输入缺失会降低方案置信度，需要在下一阶段确认。",
    }),
  }));
}

const GO_REQUIRED_SUBJECTS: RecommendationEvidenceSubject[] = [
  "process-window",
  "equipment-candidate",
  "doe-plan",
  "validation-plan",
];

function hasGoEvidence(measuredSubjects: RecommendationEvidenceSubject[] | undefined): boolean {
  const measured = new Set(measuredSubjects ?? []);
  return GO_REQUIRED_SUBJECTS.every((subject) => measured.has(subject));
}

function gateFromContext(input: {
  measuredSubjects?: RecommendationEvidenceSubject[];
  missingInputs: string[];
  assumptions: string[];
}): DecisionGate {
  if (input.missingInputs.includes("ringDiameterMm")) return "NO-GO";
  if (hasGoEvidence(input.measuredSubjects) && input.missingInputs.length === 0) return "GO";
  return "CONDITIONAL GO";
}

const LOW_CONFIDENCE_WHEN_INPUTS_MISSING = new Set<RecommendationEvidenceSubject>([
  "equipment-candidate",
  "motion-architecture",
  "bom-scope",
]);

function confidenceForSubject(
  subject: RecommendationEvidenceSubject,
  missingInputs: string[],
  assumptions: string[],
): RecommendationConfidence {
  if (missingInputs.length === 0 && assumptions.length === 0) return "High";
  if (LOW_CONFIDENCE_WHEN_INPUTS_MISSING.has(subject)) {
    return missingInputs.length > 0 ? "Low" : "Medium";
  }
  return "Medium";
}

// measuredSubjects must only include subjects backed by measured, DOE, or trial-weld evidence.
export function buildRecommendationEvidence(input: {
  measuredSubjects?: RecommendationEvidenceSubject[];
  missingInputs: string[];
  assumptions: string[];
  subjects: RecommendationEvidenceSubject[];
}): RecommendationEvidence[] {
  const measuredSubjects = new Set(input.measuredSubjects ?? []);
  return input.subjects.map((subject) => {
    const isMeasuredSubject = measuredSubjects.has(subject);
    const confidence = isMeasuredSubject
      ? "High"
      : confidenceForSubject(subject, input.missingInputs, input.assumptions);
    return {
      subject,
      evidenceLevel: isMeasuredSubject ? "E1" : confidence === "Low" ? "E3" : "E2",
      confidence,
      basis: isMeasuredSubject
        ? ["用户提供了试焊、DOE 或实测验证证据。"]
        : ["结构化启发式输出", "用户输入约束", "显式假设"],
      limits:
        input.missingInputs.length > 0
          ? [`缺失输入：${input.missingInputs.join(", ")}`]
          : ["仍需通过 DOE 与试焊验证后才能锁定量产参数。"],
    };
  });
}

// measuredSubjects controls GO eligibility; do not populate it from assumptions alone.
export function buildDecisionPack(input: {
  measuredSubjects?: RecommendationEvidenceSubject[];
  missingInputs: string[];
  assumptions: string[];
  risks: string[];
  validationPlan: string[];
}): DecisionPack {
  const decisionGate = gateFromContext(input);
  const topRiskSource = input.risks.length > 0 ? input.risks : input.assumptions;
  const topRisks = topRiskSource.slice(0, 3).map((risk) => ({
    risk,
    impact: "影响工艺窗口、设备选择或验收置信度。",
    closureAction: "通过补充输入、DOE 试焊或供应商资料关闭该风险。",
  }));
  return {
    decisionGate,
    decisionSummary:
      decisionGate === "GO"
        ? "结论：可推进，但仍需按验证计划锁定最终参数。"
        : decisionGate === "NO-GO"
          ? "结论：当前存在关键阻塞，不建议进入设备或工艺定型。"
          : "结论：条件可行，可进入小样 DOE 与方案细化，但不能直接锁定量产参数。",
    recommendedPath:
      decisionGate === "NO-GO"
        ? "先补齐阻塞输入，再重新生成工艺、设备、DOE 与 BOM 建议。"
        : "先做小样 DOE，确认接头质量和窗口稳定性，再锁定设备架构与 RFQ 指标。",
    topRisks,
    evidenceNeeded:
      input.validationPlan.length > 0
        ? [...input.validationPlan, "试焊验证"]
        : ["DOE 记录", "试焊样件", "截面或破坏性检测结果"],
    highestImpactQuestion:
      input.missingInputs.length > 0
        ? `请优先确认 ${input.missingInputs[0]}，这是当前最影响方案置信度的输入。`
        : undefined,
  };
}

export function buildMotionArchitectureCandidates(input: {
  weldingMethod: WeldingMethod;
  applicationScenario?: ApplicationScenario;
  targetTaktSec?: number;
  ringDiameterMm?: number;
  motionPlatform?: MotionPlatformId;
}): MotionArchitectureCandidate[] {
  const batteryTabHighTaktContext =
    input.applicationScenario === "battery-tab" ? "电池极耳低飞溅、导电一致性场景，" : "";
  const circularDiameterContext =
    input.weldingMethod === "circular"
      ? input.ringDiameterMm === undefined
        ? "圆周焊直径待确认，"
        : `圆周焊直径 ${input.ringDiameterMm} mm，`
      : "";
  if (input.motionPlatform === "galvo-scanner" || (input.targetTaktSec ?? 999) <= 2) {
    return [
      {
        name: "振镜 + 机器人",
        fitCondition: `${circularDiameterContext}${batteryTabHighTaktContext}高节拍、短焊缝、多姿态或需要快速换型时优先评估。`,
        rejectCondition: "焊缝几何不稳定、夹具重复定位不足或安全节拍无法验证时淘汰。",
        keyRisks: ["TCP 标定", "夹具重复性", "激光安全包络"],
        validationGate: `${circularDiameterContext}${batteryTabHighTaktContext}用节拍样件验证轨迹稳定性、焦点一致性、低飞溅、导电稳定性和安全互锁响应。`,
      },
      {
        name: "振镜扫描工位",
        fitCondition: `${circularDiameterContext}${batteryTabHighTaktContext}焊缝集中在稳定平面内，且夹具重复定位高时适用。`,
        rejectCondition: "需要大姿态变化、深腔可达性差或焦平面变化过大时淘汰。",
        keyRisks: ["焦平面变化", "视野边缘能量一致性", "反射光风险"],
        validationGate: `${circularDiameterContext}${batteryTabHighTaktContext}验证全视场功率密度、焦点偏差、低飞溅、导电稳定性和首末件一致性。`,
      },
    ];
  }

  if (input.weldingMethod === "circular") {
    const diameterContext =
      input.ringDiameterMm === undefined ? "圆周焊直径待确认" : `圆周焊直径 ${input.ringDiameterMm} mm`;
    return [
      {
        name: "单轴旋转 + 线性轴",
        fitCondition: `${diameterContext}、零件可旋转且节拍中等时优先。`,
        rejectCondition: "零件无法稳定旋转或环径公差导致焦点漂移时淘汰。",
        keyRisks: ["同轴度", "搭接过渡", "热累积"],
        validationGate: `按 ${diameterContext} 验证整圈熔深、首尾搭接和圆周跳动。`,
      },
      {
        name: "机器人 + 变位机",
        fitCondition: `零件姿态复杂、${diameterContext} 且需要多角度可达时适用。`,
        rejectCondition: "节拍极短或安全包络无法满足时淘汰。",
        keyRisks: ["路径同步", "姿态重复性", "安全防护范围"],
        validationGate: `按 ${diameterContext} 验证机器人与变位机同步误差、焦点跟随和安全互锁。`,
      },
    ];
  }

  return [
    {
      name: "龙门 / 笛卡尔工位",
      fitCondition: "直线或平面焊缝、夹具重复定位高、节拍稳定时优先。",
      rejectCondition: "空间曲线、姿态复杂或频繁换型时淘汰。",
      keyRisks: ["夹具可达性", "间隙控制", "热变形"],
      validationGate: "验证定位重复性、间隙窗口和 DOE 后的工艺稳定性。",
    },
    {
      name: "工业机器人",
      fitCondition: "空间曲线、多角度姿态或高混线需求明显时适用。",
      rejectCondition: "极短节拍、焦点稳定性不足或安全空间不足时淘汰。",
      keyRisks: ["TCP 标定", "轨迹速度波动", "激光安全包络"],
      validationGate: "验证轨迹速度一致性、TCP 偏差和安全互锁响应。",
    },
  ];
}
