---
name: laser-welding-verify
description: >-
  在完成前验证激光焊接交付物：启发式免责声明、单位一致性、假设与风险、
  DOE/试焊证据、push-pull 焊丝头、钎焊丝族、BOM 完整性及越界防护。
---

# 激光焊接（Laser Welding）— 验证（Verify）

## 概述（Overview）

在任何声称“激光焊接建议已完整、可交付、可用于规划或可安全推进”的最终答复前，先使用本技能。验证内容包括证据、单位、假设、风险、验证关卡、BOM 完整性、push-pull 要求与越界防护。

目的不是把答案写得更长，而是避免无证据支撑的工程性结论。

## 共享语言与产物规则（Shared Language And Artifact Rules）

- 遵循 `../laser-welding/references/shared-rules.md`。
- 本技能使用的产物类型为：`verification`。

## 铁律（The Iron Law）

```text
NO COMPLETION OR READINESS CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

若当前答案尚未经过验证检查，不得宣称建议“完整、可交付、充分、可量产（production-ready）或已验证”。

## 关卡函数（The Gate Function）

在作出任何正向交付状态声明前：

1. 明确哪些证据可以证明该声明成立（Identify what evidence proves the claim）。
2. 按验证检查清单核对当前答案（Check the current answer against the verification checklist）。
3. 确认必需输入、假设、风险、验证与验收信息齐备（required inputs, assumptions, risks, validation, acceptance）。
4. 确认不存在被禁止的声明（prohibited claims）。
5. 若检查失败，明确真实限制并回到所需流程阶段。
6. 若检查通过，在答案中显式呈现证据与限制。

跳过任一步骤都会使完成声明失效。

## 停止条件（Stop Conditions）

- 在缺少必需输入时却给出完整方案。
- 出现 pricing、quotation、cost estimation、simulation 或 finite element analysis 内容。
- 在缺少 DOE 与试焊证据时宣称 production-ready。
- push-pull 钎焊缺少送丝焊头（wire-feed head）或钎焊丝族（brazing wire family）。
- 工艺数值缺少来源、假设或验证警示。
- BOM 声明遗漏范围内的安全、冷却、检测、fieldbus 或集成项。
- 品牌名被当作背书而非候选示例。

## 验证检查清单（Verification Checklist）

- [ ] 单位一致（Units consistent）
- [ ] 启发式免责声明存在（Heuristic disclaimer present）
- [ ] DOE / 试焊提醒存在
- [ ] 不包含 pricing / simulation / finite element analysis
- [ ] 不做直接量产发布承诺
- [ ] 已列出假设、缺失输入与风险等级
- [ ] 已列出验证计划与验收标准
- [ ] 在相关场景下覆盖 push-pull 焊头与钎焊丝族
- [ ] 在范围内时，BOM 覆盖 laser、head、motion、fixture、cooling、gas、safety、inspection、fieldbus 与 integration
- [ ] 品牌名仅作为非背书候选
- [ ] 除非用户询问集成，最终答案不暴露内部工具调用或 fallback mode
- [ ] 节拍估算（takt）包含分步骤拆解与假设
- [ ] 设备技术指标可追溯到输入约束与目标
- [ ] 专业术语表（glossary）存在且中文可读
- [ ] 最终答案结构映射到 `skills/laser-welding/references/solution-report-template.md`
- [ ] 对 polymer transmission，需给出透过率评估依据（材料、颜色/添加剂、厚度、波长假设）
- [ ] 对 polymer transmission，可行性结论需明确并绑定透过率置信度
- [ ] 参数建议必须是带单位/边界的数值临时范围，而非仅方向性措辞
- [ ] 每个临时范围都带明确收敛触发条件（可观察信号/阈值与下一步收窄动作）
- [ ] 决策章节（`process`/`equipment`/`risk`/`DOE`/`conclusion`）为结论优先
- [ ] `polymer-transmission` 的 `3.1` 节仅在适用时渲染；不适用则整体省略（不得 `N/A` 占位）
- [ ] 省略 `3.1` 时，可选加入审计政策说明：`3.1 节按策略判定不适用（section 3.1 not applicable by policy）`

## 常见失败模式（Common Failures）

| 声称（Claim） | 必要条件（Requires） | 不充分条件（Not Sufficient） |
| --- | --- | --- |
| 建议已完整（Recommendation is complete） | 必需输入、假设、风险、验证、验收齐备 | 只有材料和厚度 |
| 工艺窗口可用（Process window is usable） | 有启发式来源与 DOE/试焊提醒 | 仅给单一数值且无验证 |
| 参数指导可执行（Parameter guidance is actionable） | 给出带单位与边界的数值临时范围 | 仅“increase/decrease”等方向性表述 |
| 临时范围可收敛（Temporary ranges are convergent） | 每个临时范围都有收敛触发与收窄规则 | 仅列范围，无可观察触发或下一步规则 |
| 决策叙述结论优先（Decision narrative is decision-first） | `process`/`equipment`/`risk`/`DOE`/`conclusion` 先给明确结论 | 先分析，结论埋在后文 |
| 聚合物章节渲染合规（Polymer section rendering is compliant） | 仅在 polymer transmission 适用时出现 `3.1` | 保留 `3.1` 并填 `N/A` / “not applicable” |
| BOM 完整（BOM is complete） | 范围内覆盖 laser、head、motion、fixture、cooling、gas、safety、inspection、fieldbus、integration | 仅 laser 与 head |
| push-pull 钎焊覆盖完整（Push-pull brazing is covered） | 送丝焊头、几何、钎焊丝族、风险齐备 | 仅泛化描述 wire feeder |
| 可量产（Ready for production） | 用户提供 DOE 与试焊证据 | 初始建议或目录启发式 |

## 证据要求（Evidence Requirements）

- 工艺数值必须来自用户提供值、结构化输出、目录数据或文档化参考范围。
- DOE 范围必须来自结构化输出、目录数据、文档边界或用户提供边界。
- BOM 完整性以用户声明的交付深度为范围边界。
- 品牌名必须仅作为候选呈现。
- 缺失的建议输入必须以假设、风险或后续验证动作形式显式可见。
- takt 相关声称必须包含分解逻辑或显式假设。
- 设备指标声称必须体现与场景、质量目标、产能约束的关联。
- 术语需便于混合受众理解（process + equipment + management）。
- polymer transmission 可行性需说明透过率获取方式（估算或实测）、不确定性来源与必需验证动作。

## 输出契约（Output Contract）

若验证通过，最终输出可声明建议已可用于所述规划或售前范围，但必须保留假设与验证边界可见。

若验证失败，不得掩盖缺口。应明确阻塞问题，并回路由至 `laser-welding-brainstorm`、`laser-welding-write-plan` 或 `laser-welding-execute-plan`。

可用时与 Superpowers `verification-before-completion` 保持一致。
