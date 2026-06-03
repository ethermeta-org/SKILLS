# Laser Welding Conversation Replay Cases

这些回放用来检查普通对话是否符合“专业但不复杂”的目标。每个 case 都是用户可能直接输入的一句话，验证重点是路由、输出形态和禁止行为。

## How To Run

1. 在支持 skill 的聊天客户端中调用 `laser-welding`。
2. 逐条粘贴 `Prompt`。
3. 对照 `Must Include` 与 `Must Avoid` 做人工检查。
4. 若输出冗长、暴露内部编排、跳过必需输入或声称量产就绪，判定失败。

## Global Pass Criteria

- 必需输入缺失时，只问一个最高优先级问题。
- 必需输入齐全的新项目默认输出 `Decision Pack` + `Engineering / RFQ Pack`。
- 普通聊天默认短版，不主动展开完整 RFQ 表、BOM 或方案书。
- 用户明确要求“展开 / RFQ / 技术要求 / BOM / 报告”时，再进入详细输出。
- 初始建议不得写成可量产 `GO`，除非用户提供 DOE 或试焊证据。
- 至少给出一个明确下一步动作，而不是只给背景知识。
- 不包含价格、报价、成本估算、仿真、有限元或直接量产放行。
- 不暴露内部工具、MCP、fallback 或编排细节。

## Case R1: Minimal Equipment Advice

Prompt:

> 1mm 304 不锈钢角焊，主要看强度和外观，怎么选设备？

Must Include:

- `Decision Pack`
- `CONDITIONAL GO`
- `Engineering / RFQ Pack`
- 至少两个设备或运动候选
- DOE / 试焊验证动作

Must Avoid:

- 量产放行承诺
- 单一设备结论
- 大段教材式材料介绍
- 未被要求时输出完整 RFQ 表或长报告

## Case R2: Missing Material

Prompt:

> 我想上一条激光焊接线，帮我推荐完整方案。

Must Include:

- 一个聚焦问题，优先询问材料
- 为什么材料是第一优先级

Must Avoid:

- 完整 BOM
- 最终头型或运动架构
- 一次追问多个字段

## Case R3: Battery Copper Ring Missing Diameter

Prompt:

> 电池紫铜环焊，厚度 0.4mm，帮我选激光头。

Must Include:

- `请提供环焊直径 ringDiameterMm，单位 mm。`
- 说明直径影响头型和运动架构

Must Avoid:

- 直接推荐振镜、旋转轴或机器人作为最终方案
- 同时追问多个高级参数

## Case R4: High Takt Motion Choice

Prompt:

> 铜片搭接焊，目标 2 秒一件，运动方案怎么选？

Must Include:

- `CONDITIONAL GO`
- 候选中包含 `振镜 + 机器人`
- 至少一个并列替代候选
- 每个候选的适用条件、淘汰条件或验证关卡
- 节拍拆解提醒

Must Avoid:

- 只说振镜最快
- 忽略上料、定位、检测和下料

## Case R5: Polymer Feasibility

Prompt:

> PC 和 ABS 透射焊，厚度 1.5mm，能不能做？

Must Include:

- `CONDITIONAL GO`
- 透光率、吸收层或材料颜色/添加剂假设
- coupon 试焊或 DOE
- 可行性与不确定性同时出现

Must Avoid:

- 只根据材料名判定可行
- 省略波长或透过率依据

## Case R6: Defect Troubleshooting

Prompt:

> 焊缝飞溅多，表面发黑，怎么办？

Must Include:

- 初步判断
- 优先排查顺序
- 至少 3 个过程变量：功率、速度、离焦、保护气体、表面状态、光学污染等
- 小步 DOE 或试焊收敛动作

Must Avoid:

- 单点参数神药
- 直接承诺解决
- 不问或不记录当前参数

## Case R7: Vendor RFQ

Prompt:

> 我要找设备商询价，给我一份技术要求。

Must Include:

- `Engineering / RFQ Pack` 优先
- 供应商必须响应项
- 打样证据、DOE 数据、验收报告
- 安全、检测、夹具或运动接口要求
- 简短 `Decision Pack`

Must Avoid:

- 价格或成本估算
- 品牌背书
- 只列设备名称，不列证据要求

## Case R8: Expand RFQ On Request

Prompt:

> 上面方案可以，展开成供应商 RFQ 技术要求。

Must Include:

- `Engineering / RFQ Pack`
- 技术指标或响应项表格
- 打样证据、DOE 数据、验收报告格式
- 安全、检测、夹具、运动、冷却或保护气接口要求
- 不重复输出长篇背景知识

Must Avoid:

- 价格、报价或成本估算
- 重新回到只问基础信息而不展开
- 完整方案书式冗长叙述

## Case R9: User Asks For Production Readiness

Prompt:

> 这些参数能直接量产吗？

Must Include:

- `NO-GO` 或 `CONDITIONAL GO`，取决于用户是否提供 DOE / 试焊证据
- 明确缺少量产放行证据
- 需要补齐的验证项：DOE、连续试焊、截面/强度/外观/电测或气密等适用验收

Must Avoid:

- `GO` without measured evidence
- “可以直接量产”
- 以经验参数代替验收证据
