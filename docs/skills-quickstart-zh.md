# SKILLS 操作手册（业务导向 Quick Start，中文）

适用对象：

- 线体商项目经理（需要确认工艺细节并筛选设备厂商）
- 最终客户工艺/制造团队（需要判断激光焊接是否适合导入新产线）

目标：

- 用最少输入快速得到可执行建议
- 输出可直接用于业务沟通的两类结果：`Decision Pack` 与 `Vendor RFQ Pack`
- 在输入不完整时，仍能给出“可行性方向 + 风险 + 补数闭环”

---

## 1. 你会拿到什么输出

1. `Decision Pack`（管理决策包）
- 结论：`GO / CONDITIONAL GO / NO-GO`
- 核心依据：证据等级（E1/E2/E3）与置信度（High/Medium/Low）
- 阻塞项、关闭路径、目标日期

2. `Vendor RFQ Pack`（设备商技术规格包）
- 工艺参数建议区间（含单位、边界、收敛触发条件）
- 设备与技术指标（激光器/焊接头/运动/检测/安全/总线）
- 验收方法、DOE/试焊要求、供应商提交材料清单

---

## 2. 30 秒 Quick Start（双平台）

### 2.1 Cursor Agent

1. 在聊天中输入：`/laser-welding-brainstorm`
2. 粘贴最小输入提示词（见第 6 节）
3. 按流程继续：`/laser-welding-write-plan` -> `/laser-welding-execute-plan` -> `/laser-welding-verify`

### 2.2 Codex / Open Skills

1. 安装技能（一次性）：
```bash
npx skills add <org>/SKILLS --skill laser-welding -g -y
```
2. 在对话首条明确写：`Use skill: laser-welding-brainstorm`
3. 按同样阶段推进：`write-plan` -> `execute-plan` -> `verify`

说明：如果你的客户端支持 slash 命令，也可直接使用 `/laser-welding-*`。

---

## 3. 业务场景 A：线体商 PM 寻找设备厂商

业务目标：

- 快速形成“可发给设备商”的技术要求和澄清清单
- 避免前期参数不全导致的错误选型

最小必填（Tier A）：

- `material`
- `thicknessMm`
- `weldingMethod`（lap / butt / fillet / seal / 等）

执行路径：

1. `brainstorm`：确认就绪度、缺失项、假设和风险  
2. `write-plan`：形成双交付计划（Decision Pack + RFQ Pack）  
3. `execute-plan`：输出参数、设备、DOE、BOM、接口约束  
4. `verify`：检查单位、证据、越界声明、验收闭环

你应重点看这些字段：

- 技术指标：功率范围、速度范围、离焦方向与窗口、保护气体与流量、夹紧力
- 设备约束：重复定位、轨迹能力、安全联锁、PLC/Fieldbus、厂务条件
- 交付约束：供应商提交证据、验收方法、风险闭环计划

---

## 4. 业务场景 B：最终客户评估是否导入新产线

业务目标：

- 先做“导入可行性判断”，再决定是否启动设备招采/试制

建议执行方式：

1. 先跑 `brainstorm` 获取 `Readiness Level (L0-L3)`  
2. 若 L0/L1：先补关键缺失项，不急于追求完整方案  
3. 若 L2/L3：执行 `plan` 与 `execute`，再用 `verify` 输出可行性结论

决策层优先关注：

- 是否达到 `GO` 条件（关键证据是否为 E1/E2）
- 若为 `CONDITIONAL GO`：阻塞项是谁负责、何时补齐
- 是否明确“参数仅为 DOE/试焊起点，不等同量产放行参数”

---

## 5. 输入不完整时怎么用（工业场景重点）

规则：

1. 缺失必填（Tier A）时：一次只补一个问题，不直接给完整方案  
2. 缺失推荐项（Tier B/C）时：允许先给初步建议，但必须显式写出  
- 假设（Assumption）
- 风险（Risk）
- 验证动作（Validation Action）
- 补数闭环（Owner / Method / DueDate / Impact）

推荐补数闭环表（可直接放在项目周会）：

| 缺失项 | Owner | 获取方式 | 截止日期 | 不补齐后果 |
| --- | --- | --- | --- | --- |
| 目标节拍 | 生产经理 | 节拍分解评审 | 2026-06-05 | 无法冻结工位配置 |
| 检测阈值 | 质量经理 | 质量规范对齐 | 2026-06-07 | 无法定义验收标准 |

---

## 6. 可直接复制的提示词（中文）

### 6.1 最小起步（先判断可不可做）

```text
/laser-welding-brainstorm
新项目：激光焊接导入评估。
材料：1.0mm 铜 与 0.8mm 镀镍钢；焊接方式：lap。
目标：低飞溅、导电稳定、不焊穿。
请先做就绪度门禁，输出：Readiness、缺失输入、假设、风险、下一步。
```

### 6.2 线体商 PM（要发设备商）

```text
/laser-welding-write-plan
基于上述项目，编写双交付计划：
1) Decision Pack（GO/CONDITIONAL GO/NO-GO）
2) Vendor RFQ Pack（技术指标、接口约束、验收方法、供应商提交清单）。
每个阶段必须写明输入、输出、验收标准、停止条件。
```

### 6.3 最终客户（做导入决策）

```text
/laser-welding-execute-plan
按计划输出工艺建议、设备建议、DOE、风险与验证。
要求：所有数值带单位，给临时范围与收敛触发条件；明确证据等级和置信度。
最终给出可行性结论：GO / CONDITIONAL GO / NO-GO。
```

### 6.4 发客户前校验

```text
/laser-welding-verify
在发送给客户前做最终校验：
检查单位一致性、启发式免责声明、DOE/试焊提醒、假设与风险、BOM完整性、越界内容。
```

---

## 7. 常见错误与避免方式

1. 把技能文档链接当成“自动调用”
- 正确：在聊天中显式调用 skill（slash 或 `Use skill: ...`）

2. 缺了 Tier A 还要求完整方案
- 正确：先补 `material/thicknessMm/weldingMethod`

3. 把建议参数当成量产参数
- 正确：先 DOE + 试焊，再收敛冻结

4. 只看品牌不看证据
- 正确：品牌只是候选，优先看证据等级、适配约束和验收能力

5. 忽略补数闭环
- 正确：每个缺失项都要有 Owner、方法、日期、后果

---

## 8. 推荐阅读顺序

1. 主入口技能：[skills/laser-welding/SKILL.md](/Users/gubin/workspaces/SKILLS/skills/laser-welding/SKILL.md)  
2. 完整流程样例：[examples/workflow-zh.md](/Users/gubin/workspaces/SKILLS/examples/workflow-zh.md)  
3. 单场景样例：[examples/scenarios-zh.md](/Users/gubin/workspaces/SKILLS/examples/scenarios-zh.md)  
4. 解决方案模板：[skills/laser-welding/references/solution-report-template.md](/Users/gubin/workspaces/SKILLS/skills/laser-welding/references/solution-report-template.md)
