# Laser Welding Regression Cases

## Case A

- 场景：电池紫铜环焊信息缺失。
- 约束：Tier A 其它必填 `material`、`weldingMethod` 仍需满足；当识别为环焊且 `ringDiameterMm` 缺失时，下一问必须先问 `ringDiameterMm`，一次只问一个字段。
- 预期行为：
  - 不允许一次性追问多个关键字段。
  - 在补齐关键尺寸前，不直接拍板头型。

## Case B

- 场景：高节拍需求，`targetTaktSec = 2s/件`。
- 约束：候选方案必须包含“振镜+机器人”。
- 预期行为：
  - 允许并列其他候选方案。
  - 不得输出单一方案作为唯一结论。

## Case C

- 场景：输入字段完整：`material`/`thicknessMm`/`weldingMethod`/`ringDiameterMm`；若有节拍约束则补 `targetTaktSec`。
- 约束：至少输出 2 个候选，每个候选都给出适用条件。
- 预期行为：
  - 每个候选都应明确边界与适配前提。
  - 至少包含 1 条 DOE/试焊风险提示。

## Case D

- 场景：新项目，`material = stainless-304`，`thicknessMm = 1`，`weldingMethod = fillet`，质量目标为 strength + appearance。
- 约束：用户没有指定受众或报告格式。
- 预期行为：
  - 默认使用 `Decision Pack` + `Engineering / RFQ Pack`，不输出冗长通用报告。
  - 初始启发式建议应为 `CONDITIONAL GO`，除非用户提供 DOE 或试焊证据。
  - 工程/RFQ 包覆盖 process window、equipment、DOE、BOM、validation、acceptance。
  - 运动/设备候选至少 2 个，并说明适用条件与淘汰条件。

## Case E

- 场景：新项目请求完整建议，但缺少 `material`。
- 约束：缺少必需输入时不得生成完整推荐。
- 预期行为：
  - 只问 1 个聚焦问题，优先补 `material`。
  - 不输出 `Decision Pack`、`Engineering / RFQ Pack`、完整 BOM 或最终架构。

## Case F

- 场景：高节拍需求，`targetTaktSec = 2s/件`。
- 约束：候选方案必须体现高速节拍下的运动架构切换逻辑。
- 预期行为：
  - 候选中包含“振镜 + 机器人”。
  - 至少保留 1 个并列替代方案。
  - 每个候选都给出适用条件、淘汰条件和验证关卡。

## Validation Result

- Case A: PASS
  - 依据：`skills/laser-welding/SKILL.md` 要求在电池铜环门控下缺字段时“每轮只问一个问题”且“不最终确定头型”；`skills/laser-welding-brainstorm/SKILL.md` 也要求一次只问一个缺失必填并禁止锁定具体头型。
- Case B: PASS
  - 依据：`skills/laser-welding-brainstorm/SKILL.md` 明确高节拍约束下候选必须包含 `振镜+机器人`，且同轮需给至少一个并行候选与切换条件。
- Case C: PASS
  - 依据：`skills/laser-welding-brainstorm/SKILL.md` 候选态输出契约要求 `>=2` 候选、每个候选带触发/切换条件，并至少包含一条 DOE/试焊风险项；与完整输入后的推荐流程一致。
- Case D: PASS
  - 依据：`skills/laser-welding/SKILL.md` 默认路由为双包输出；`skills/laser-welding-verify/SKILL.md` 要求新项目推荐使用双包结构，且初始启发式建议不得误写成可量产 `GO`。
- Case E: PASS
  - 依据：`skills/laser-welding/SKILL.md` 在缺少 `material`、`thicknessMm` 或 `weldingMethod` 时要求只问一个聚焦问题并停止，不生成完整推荐。
- Case F: PASS
  - 依据：`skills/laser-welding/SKILL.md` 要求高节拍下保留多候选并定义切换条件；结构化推荐会生成带适用、淘汰和验证关卡的 `motionArchitectureCandidates`。

## Residual Risk

- 以上为静态规则走查；普通聊天风格与简洁度需继续用 `conversation-replay-cases.md` 做回放检查。
- Case C 的“多候选+条件+DOE 风险”主要由 `brainstorm` 候选态契约保障；结构化推荐由核心与 MCP 层 focused tests 覆盖。
- 若路由未进入 `laser-welding` 或提示词被上层覆写，仍可能出现偏差，应优先用黄金样例修正最终表达。
