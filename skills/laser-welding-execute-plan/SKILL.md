---
name: laser-welding-execute-plan
description: >-
  基于已有激光焊接执行计划开展落地执行，结合内部结构化工具与参考资料，
  确保从假设与输入到工艺、硬件、DOE、BOM 及验证输出全链路可追溯。
---

# 激光焊接（Laser Welding）— 执行计划（Execute Plan）

## 概述（Overview）

当已存在书面的激光焊接执行计划时使用本技能。该技能会先审阅计划，再按阶段顺序执行，保证输出可追溯；一旦证据或输入不足则立即停止。

执行不是临场发挥。若计划不完整、存在冲突或缺少必需输入，应停止并回退到前序阶段，不得猜测补全。

## 共享语言与产物规则（Shared Language And Artifact Rules）

- 遵循 `../laser-welding/references/shared-rules.md`。
- 本技能使用的产物类型为：`solution-report`。

## 执行规则（Execution Rules）

- 在执行任何任务前，先完成计划审阅。
- 数值化工艺、硬件、DOE、fieldbus 与 BOM 输出应优先使用可用结构化工具在内部完成；不要向用户询问工具是否可用。
- 对外焊接/工艺答复中，最终答案不得提及工具可用性、工具调用、MCP、fallback mode 或内部编排；仅当用户明确询问集成或配置时才可说明工具细节。
- 在起草任何 `solution-report` 前，当上下文显示高影响假设存在较高不确定性时，可进行一次可选的用户确认。
- 最终交付必须映射到 `skills/laser-welding/references/solution-report-template.md` 的章节结构。
- 对第 3 节工艺参数，每个关键参数都必须给出“数值临时范围（numeric temporary range）+ 明确收敛触发条件（explicit convergence trigger）”。
- 决策章节（`process`/`equipment`/`risk`/`DOE`/`conclusion`）必须采用“结论优先（conclusion-first）”，再给证据与备选方案。
- 在组装第 3 节前，先基于混合场景识别计算报告渲染策略：优先显式 `applicationScenario`，否则由材料族 + 焊接方法推断（inference fallback）。
- 仅当渲染策略判定适用 `polymer-transmission` 时才渲染第 3.1 节。
- 若第 3.1 节不适用，可物理省略；不得添加 `N/A` 占位或占位表格。
- 当省略第 3.1 节时，可增加一行叙述用于审计清晰度：`3.1 节按策略判定不适用（section 3.1 not applicable by policy）`（不是表格占位）。
- 对 `polymer-transmission` 场景，若缺少实测值，应先依据材料/零件信息评估透过率（transmittance），并明确给出可行性与不确定性。
- 若缺少必需输入，回到 brainstorm 阶段。
- 若执行顺序、范围或验收标准不完整，回到 write-plan 阶段。
- 所有输出都必须可追溯到结构化输出、目录/型录参考（catalog reference）、参考文档或显式假设。
- 不得夸大启发式（heuristic）输出。
- 仅当输入完整时，DOE 与缺陷诊断（defect diagnosis）才可独立运行。

## 执行流程（The Process）

### 第 1 步：加载并审阅计划（Step 1: Load And Review Plan）

完整阅读计划。识别必需输入、假设、阶段划分、预期工具或参考来源、预期输出、验收标准与停止条件。

若计划存在关键缺口，应在执行前先明确提出。

### 第 2 步：按顺序执行各阶段（Step 2: Execute Each Stage In Order）

对每个阶段：

1. 确认阶段输入。
2. 使用计划中指定的结构化工具或参考来源。
3. 以专业工程语言记录输出。
4. 标注假设与置信边界（confidence limits）。
5. 检查该阶段验收标准。
6. 若阶段门（stage gate）失败则停止。

### 第 3 步：可选的预报告确认（上下文驱动）（Step 3: Optional Pre-Report Confirmation）

在生成 solution report 前，可针对高影响假设进行一次可选确认交互。用户可选择任意子集，或全部跳过。

提供以下可选核对项：

- 材料牌号确认（例如：304 vs 316L）
- 实际焊缝长度与轨迹来源（CAD/path constraints）
- 产能目标依据（target takt 或 annual volume）
- 量化验收阈值（强度/外观/变形）
- 全部跳过并按当前假设继续

行为规则：

- 该交互为可选；补充数值同样为可选。
- 若用户提供任一所选项，需相应更新第 2.2 节假设。
- 若第 2.2 节变更影响节拍（cycle）或产能（throughput）逻辑，需重算第 5 节。
- 若用户跳过可选交互，继续执行，但需保持假设与风险可见。
- 不得因这些可选核对项阻塞报告生成。

### 第 4 步：组装交付物（Step 4: Assemble Delivery）

在编写第 3 节内容前，先完成并记录报告渲染策略：

- 存在显式 `applicationScenario` 时优先使用。
- 否则依据材料族 + 焊接方法进行推断。
- 在章节决策中一致执行 `explicit first, inference fallback`。

将工艺、硬件、DOE、BOM、风险、验证与验收整合为连贯建议。面向用户的最终答案中应去除内部编排细节。

以 solution report 模板作为必需输出骨架：

1. 项目背景与目标（Project background and goals）
2. 输入与假设（Inputs and assumptions）
3. 带单位与边界的工艺参数（Process parameters with units and boundaries）
4. 设备选型与技术指标（Equipment selection and technical indicators）
5. 节拍估算与产能假设（Takt estimate and capacity assumptions）
6. BOM 与集成范围（BOM and integration scope）
7. 风险清单与缓解措施（Risk list and mitigations）
8. DOE 与验证计划（DOE and validation plan）
9. 验收标准（Acceptance criteria）
10. 专业术语表（Glossary for professional terms）
11. 结论与下一步行动（Conclusion and next actions）

当适用 `polymer-transmission` 时，第 3.1 节必须包含透过率评估依据、假设波长、置信水平与可行性结论及验证动作。
当不适用 `polymer-transmission` 时，第 3.1 节应物理省略。为审计清晰度，可在表格外增加一行叙述：`3.1 节按策略判定不适用（section 3.1 not applicable by policy）`。

### 第 5 步：移交验证（Step 5: Hand Off To Verification）

在声称结果“完整、可交付、充分或可用于交付”之前，必须调用 `laser-welding-verify`。

## 工具顺序（Tool Order）

1. `process_recommend`：基于材料、厚度与焊接方法生成完整建议
2. `material_assess`：当需要更细化的工艺窗口（process-window）细节时使用
3. `hardware_recommend`
4. `doe_matrix` 与 `defect_diagnose`：按需使用
5. `solution_bom`
6. `trajectory_generate` 与 `fieldbus_map`：当自动化细节在范围内时使用

## 结构化工具不可用时（Structured Tooling Unavailable）

若结构化工具不可用，内部改用 `skills/laser-welding/references/*.md`。工艺数值仅可来自用户提供值、结构化/目录数据或文档化参考范围，并显式标注假设。

DOE 数值范围仅可来自用户提供、结构化、目录或文档边界；否则只提供定性 DOE 轴，并请求缺失的范围输入。

最终答案中不得暴露 fallback 机制。

## 何时停止并请求澄清（When To Stop And Ask For Help）

以下情况应立即停止：

- 缺少必需输入。
- 计划指令不清晰或相互冲突。
- 计划阶段缺少验收标准。
- 数值无法追溯到用户输入、结构化输出、目录数据或参考范围。
- 结构化输出与用户约束冲突。
- 验证反复失败。
- 请求越界到 pricing、quotation、simulation、finite element analysis、认证填充材料审批或量产发布（production release）。

应请求澄清，不得凭空补造缺失需求。

## 何时回到前序步骤（When To Revisit Earlier Steps）

当用户更新计划或变更交付范围时，回到计划审阅。

当材料、厚度、焊接方法、应用场景或质量目标变化时，回到 brainstorm。

当阶段顺序、工具选择、验收标准或验证关卡需调整时，回到 write-plan。

仅当工具/参考输出需以修正输入重新生成时，返回当前阶段重跑。

## 输出契约（Output Contract）

执行后的建议应包含：

- 工艺起点与假设
- 设备选型及理由
- DOE 范围或定性 DOE 轴
- 在范围内时的 BOM 与产线配置
- 风险与缺失输入
- 验证计划与验收标准
- 明确提醒数值为启发式（heuristic）结果，需经 DOE/试焊验证
- 章节需映射到 solution report 模板，不得静默省略
- 对第 3.1 节：仅在适用时渲染；否则可物理省略且不得使用 `N/A` 占位
- 若省略第 3.1 节，可选添加审计说明：`3.1 节按策略判定不适用（section 3.1 not applicable by policy）`
- 对 `polymer-transmission` 场景，需明确给出基于透过率的可行性结论、波长依据、置信度与验证动作

## 验证移交（Handoff To Verify）

每次执行结束都应接入 `laser-welding-verify`。在验证关卡通过前，不得宣称已完成、可交付或充分。
