# Laser Welding Skills（官方）

面向自动化与工艺工程师的工业激光焊接决策支持：材料评估、硬件选型、DOE、缺陷诊断、运动程序、场总线映射与整线方案 BOM。

支持集成到 **Claude Code**、**Cursor**、**Codex**、**OpenCode** 与 **MCP** 客户端。

## Skills 功用与差异

本仓库包含 1 个路由 skill 和 4 个阶段 skill。它们是互补关系，建议按阶段串联使用，而不是互相替代。

| Skill | 主要职责 | 适用时机 | 输出重点 | 与其他 skill 的差异 |
|------|------|------|------|------|
| `laser-welding` | 工作流路由器 | 新需求或混合范围需求 | 阶段路由 + 最终专业交付路径 | 它是总协调器，决定下一步应进入 brainstorm / write-plan / execute-plan / verify 的哪个阶段。 |
| `laser-welding-brainstorm` | 需求澄清与门禁 | 输入不完整或不明确 | 就绪度等级、缺失输入、假设、风险、下一步问题/动作 | 当缺少必填输入（`material`、`thicknessMm`、`weldingMethod`）时，不会产出完整方案。 |
| `laser-welding-write-plan` | 执行计划编写 | 必填输入齐全，但尚无可执行步骤 | 分阶段任务、验收标准、停止条件、DOE 关卡 | 只写计划，不执行数值化工艺或硬件计算。 |
| `laser-welding-execute-plan` | 按计划执行 | 已有书面执行计划 | 按模板映射的工艺/硬件/DOE/BOM 方案报告 | 强调证据可追溯，输入或证据不足时会停止。 |
| `laser-welding-verify` | 交付前验证关卡 | 在任何“完成/可交付/可推进”声明之前 | 验证结论、证据等级、置信度、阻塞项 | 属于硬门禁。未通过该步骤，不应做完成或可就绪声明。 |

### 快速区分

- `brainstorm` 回答的是：“现在信息是否足够开始？”
- `write-plan` 回答的是：“下一步具体执行任务和关卡怎么排？”
- `execute-plan` 回答的是：“当前可落地的工程建议到底是什么？”
- `verify` 回答的是：“这份建议是否真的达到可交付与合规标准？”
- `laser-welding` 回答的是：“现在该走哪一步、顺序是什么？”

## 功能特性

### Stage 1 — 材料与工艺窗口

- 金属：铝 6061、不锈钢 304、铜；聚合物：PP
- 材料属性：熔点、反射率、导热率
- 启发式窗口：功率 P、速度 v、离焦、保护气类型与流量

### Stage 2 — 硬件与光学

- 激光选型：IPG / Raycus 功率与波长（1064 / 515 nm）
- 高反材料策略：绿光/蓝光、摆动焊、Bessel/环形光斑参考
- 光学建议：光斑估算、摆动幅度与频率

### Stage 3 — 验证与故障排查

- DOE：功率-速度矩阵与线能量 J/mm
- 缺陷：烧穿、未熔合、气孔、裂纹 -> 定量调参建议

### Stage 4 — 自动化与 BOM

- 轨迹：G-code / 运动片段
- 场总线：OPC UA、PROFINET、EtherCAT 状态字/控制字模板
- 方案 BOM：激光器、运动、焊头、冷却、气路、安全、集成 + 线体布局

## 安装

### Claude Code

把本仓库作为 Claude Code 插件目录使用，插件元数据位于 `.claude-plugin/plugin.json`。

参考 [references/claude-code.md](references/claude-code.md)。

### Cursor

使用 `.cursor-plugin/plugin.json` 并链接到 `~/.cursor/plugins/local/`。

参考 [references/codex-tools.md](references/codex-tools.md)（含 Cursor/Codex 的 MCP 配置与工具映射）。

### Codex

使用 `.codex-plugin/plugin.json` 与 `.codex/config.toml`。

参考 [references/codex-tools.md](references/codex-tools.md)（安装与工具映射）。

### OpenCode

使用 `.opencode/plugins/laser-welding.js`。

参考根目录 `.opencode/INSTALL.md`。

### 仅使用 MCP

在 `.cursor/mcp.json` 或宿主 MCP 配置中加入：

```json
{
  "mcpServers": {
    "lasernexus": {
      "command": "npx",
      "args": ["-y", "@ethermeta/lasernexus", "mcp"]
    }
  }
}
```

### 从源码构建

在仓库根目录执行：

```bash
npm install && npm run build
```

## Quick Start

以下两条路径二选一。

### 路径 A：按 skills 工作流使用（推荐端到端项目）

1. 从 `laser-welding` 开始，至少提供：
   - `material`
   - `thicknessMm`
   - `weldingMethod`
2. 若必填输入缺失，进入 `laser-welding-brainstorm`，优先补齐最高影响缺口。
3. 必填输入齐全后，进入 `laser-welding-write-plan` 生成分阶段任务、关卡和验收标准。
4. 进入 `laser-welding-execute-plan` 生成方案报告（工艺、硬件、DOE、BOM、风险、验证）。
5. 在任何“完成/可交付/可推进”声明前，必须经过 `laser-welding-verify`。

示例请求（聊天风格）：

```text
Material: copper
Thickness: 1.0 mm
Welding method: lap
Scenario: battery-tab
Targets: conductivity and low spatter
Please provide process parameters, equipment recommendation, DOE plan, and BOM.
```

### 路径 B：直接调用 MCP 工具（推荐模块化集成）

MCP 连接后，先调用 **`material_assess`**：

```json
{
  "material": "copper",
  "thicknessMm": 1,
  "applicationScenario": "battery-tab",
  "jointType": "lap"
}
```

再按常见工具链继续：

1. `hardware_recommend`：激光/焊头/运动候选方案
2. `doe_matrix`：验证范围与线能量覆盖
3. `defect_diagnose`：按缺陷症状做调参
4. `solution_bom`：线体 BOM 与布局
5. 可选：`trajectory_generate` 与 `fieldbus_map`（自动化细节）
6. 可选一体化：`process_recommend`（整合输出）

## 使用示例

**Agent 聊天提示（Cursor slash / `@`）**：见 [examples/README.md](../../examples/README.md)，含中英文工作流与场景提示词。

### 示例 1 — 1 mm 铜电池极耳（选型）

**`material_assess`**

```json
{
  "material": "copper",
  "thicknessMm": 1,
  "applicationScenario": "battery-tab",
  "jointType": "lap"
}
```

**示例输出（节选）**

```json
{
  "materialId": "copper",
  "thicknessMm": 1,
  "powerW": 945,
  "speedMmPerS": 3,
  "lineEnergyJPerMm": 315,
  "defocusMm": -0.5,
  "shieldGasLpm": 20,
  "gasType": "Ar",
  "recommendedWavelengthNm": [515, 450],
  "confidence": "heuristic",
  "warnings": ["High reflectivity at 1064nm...", "Battery tab: verify polarity..."]
}
```

**`hardware_recommend`**

```json
{
  "material": "copper",
  "thicknessMm": 1,
  "application": "battery-tab"
}
```

**示例输出（节选）**

```json
{
  "wavelengthNm": 515,
  "beamDelivery": "wobble",
  "recommendedBrands": [
    { "brand": "IPG", "modelSeries": "YLPN", "powerRangeKW": [0.5, 3] }
  ],
  "optics": {
    "wobble": { "amplitudeMm": 0.48, "frequencyHz": 400 }
  }
}
```

### 示例 2 — 整线方案 BOM

**`solution_bom`**

```json
{
  "material": "copper",
  "thicknessMm": 1.2,
  "application": "laser-brazing-push-pull",
  "motionPlatform": "gantry"
}
```

返回 `lineItems`（组件 id、类别、数量、OEM 提示）与 `lineLayout`（工位流程与布局建议）。

方案规划中的运动架构候选（概念层）：

- 龙门工位（直接枚举输入：`gantry`）
- 单轴旋转 + 线性轴（直接枚举输入：`single-axis`）
- 以振镜为主的高速短焊缝工位（直接枚举输入：`galvo-scanner`）
- 面向复杂 3D 姿态控制的机器人单元（需先映射到受支持枚举）
- 机器人 + 变位机的大件/多角度工件单元（需先映射到受支持枚举）

直接调用 MCP 时，仅传入受支持的 `motionPlatform` 枚举值。

## 配置

[`config/laser-welding.default.json`](config/laser-welding.default.json)：

| 字段 | 默认值 | 说明 |
|-------|---------|-------------|
| `preGasMs` | 200 | 出光前预送气（ms） |
| `postGasMs` | 500 | 关光后续送气（ms） |
| `defaultShieldGasLpm` | 18 | 典型保护气流量设定 |
| `defaultFieldbusProtocol` | opc-ua | `fieldbus_map` 默认协议 |
| `profiles.battery-tab` | — | 极耳焊接配置覆盖 |

## MCP 工具

| 工具 | 说明 |
|------|-------------|
| `material_assess` | 工艺窗口 |
| `process_recommend` | 端到端整合建议 |
| `hardware_recommend` | 激光与光学 |
| `doe_matrix` | DOE 网格 |
| `defect_diagnose` | 缺陷调参 |
| `trajectory_generate` | G-code |
| `fieldbus_map` | 协议映射 |
| `solution_bom` | 整线 BOM 与布局 |

## 免责声明

所有输出均为启发式工程建议。请务必结合 DOE、试焊以及设备厂商资料完成验证。品牌名称仅作候选示例，不构成背书。

## 许可证

AGPL-3.0-or-later（见仓库根目录许可证）。
