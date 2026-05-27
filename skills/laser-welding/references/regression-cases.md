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

## Validation Result

- Case A: PASS
  - 依据：`skills/laser-welding/SKILL.md` 要求在电池铜环门控下缺字段时“每轮只问一个问题”且“不最终确定头型”；`skills/laser-welding-brainstorm/SKILL.md` 也要求一次只问一个缺失必填并禁止锁定具体头型。
- Case B: PASS
  - 依据：`skills/laser-welding-brainstorm/SKILL.md` 明确高节拍约束下候选必须包含 `振镜+机器人`，且同轮需给至少一个并行候选与切换条件。
- Case C: PASS
  - 依据：`skills/laser-welding-brainstorm/SKILL.md` 候选态输出契约要求 `>=2` 候选、每个候选带触发/切换条件，并至少包含一条 DOE/试焊风险项；与完整输入后的推荐流程一致。

## Residual Risk

- 以上为静态规则走查，不等同于运行时行为验证；若路由未进入 `brainstorm` 或提示词被上层覆写，仍可能出现偏差。
- Case C 的“多候选+条件+DOE 风险”主要由 `brainstorm` 候选态契约保障，建议在后续对话回放中补 1 组动态样例验证。
