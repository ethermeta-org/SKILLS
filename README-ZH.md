# SKILLS — 激光焊接（Lasernexus）

[English](README.md) | **中文**

面向 Claude Code、Cursor、Codex/Open Skills 与 MCP 的官方激光焊接 skills。

Lasernexus 是面向激光焊接工艺与自动化售前方案的 skills + MCP 工具集，支持从客户早期需求到工艺窗口、设备选型、推拉丝激光钎焊、钎焊焊丝材料族、DOE、缺陷诊断、现场总线、BOM、产线布局、风险与验收标准的完整流程。

## 功能

- **中英双语输入**：材料如 `copper`、`stainless-304`、`铜`、`不锈钢`；缺陷如 `spatter`、`porosity`、`飞溅`、`气孔`。
- **售前方案流程**：需求采集、就绪度门禁、假设、缺失输入、风险等级、验证计划与验收标准。
- **推拉丝激光钎焊**：送丝头、送丝模式、送丝方向、喷嘴偏移、送丝速度、预热、焊缝跟踪与碰撞风险。
- **钎焊焊丝材料族**：CuSi、AlSi、镍基、铜基、不锈钢焊丝及自定义材料族，并提供校验警告。
- **OEM 候选族**：IPG、Raycus、Oneshare/文享、Amada/天田、Miyachi/米亚基、Han's/大族、Hymson/海目星、UWLaser/联赢、HGTECH/华工。
- **一键专业推荐**：以材料、厚度、焊接方式为最小输入，输出工艺参数、设备选型、DOE 范围、BOM 配置、风险与验证建议。
- **MCP 工具**：全流程推荐、材料评估、硬件推荐、DOE 矩阵、缺陷诊断、轨迹、现场总线与方案 BOM。

## 安装

根据使用环境选择一种入口即可。

### 1. 插件安装

如果你的 agent 客户端支持本地 plugin 目录，优先使用这种方式，体验类似 Superpowers 插件安装。

```bash
git clone <repo> SKILLS
cd SKILLS
npm install
npm run build
```

Claude Code 插件：

```bash
claude --plugin-dir .
```

Cursor 插件：

```bash
# 将此仓库作为本地 Cursor 插件目录使用。
# 插件 manifest 为 .cursor-plugin/plugin.json。
```

插件 manifest：

| 客户端 | Manifest | Skills 路径 |
| --- | --- | --- |
| Claude Code | `.claude-plugin/plugin.json` | `./skills/` |
| Cursor | `.cursor-plugin/plugin.json` | `./skills/` |

发布时会把这些 manifest 打包进 `plugin.zip`。

### 2. Codex / Open Skills

```bash
npx skills add <org>/SKILLS --skill laser-welding -g -y
```

如需真实调用工艺窗口、BOM、DOE 等工具，请继续配置 MCP。

### 3. 通过 npm 使用 MCP

```bash
npx -y @ethermeta/lasernexus mcp
```

`.cursor/mcp.json` / `.mcp.json` 示例：

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

可选自定义数据目录：

```bash
npx -y @ethermeta/lasernexus mcp --data-dir /path/to/custom/data
```

或在 MCP 客户端配置中指定：

```json
{
  "mcpServers": {
    "lasernexus": {
      "command": "npx",
      "args": [
        "-y",
        "@ethermeta/lasernexus",
        "mcp",
        "--data-dir",
        "/path/to/lasernexus-data"
      ]
    }
  }
}
```

### 4. 源码运行

```bash
git clone <repo> SKILLS
cd SKILLS
npm install
npm run build
npm test
```

开发时从 workspace 启动 MCP：

```bash
npm run dev:mcp -- mcp
```

## 客户端安装

| 客户端 | 入口 | 说明 |
|--------|------|------|
| Claude Code | `.claude-plugin/plugin.json` | Claude 插件元数据与 MCP 注册 |
| Codex | `.codex-plugin/plugin.json` | Codex 插件元数据 |
| Codex | `.codex/config.toml` | 本地 Codex skill 与 MCP 配置 |
| OpenCode | `.opencode/plugins/laser-welding.js` | OpenCode 插件入口 |
| OpenCode | `.opencode/INSTALL.md` | OpenCode 安装说明 |
| Cursor | `.cursor-plugin/plugin.json` | 本地插件：运行 `./scripts/install-cursor-plugin.sh copy`。见 [cursor.md](skills/laser-welding/references/cursor.md)。 |
| Cursor | `.mcp.json` | 可选：将 `lasernexus` MCP 块复制到 Cursor MCP 配置 |
| Cursor | [examples/](examples/README.md) | 复制 Agent 提示词（中英）验证 skills |
| 仅 MCP | `.mcp.json` | 不使用插件时的通用 stdio MCP 配置 |

## 工作流

新项目建议按以下 skill 顺序推进：

1. `laser-welding-brainstorm` — 采集需求、缺失输入、假设与就绪度。
2. `laser-welding-write-plan` — 编写分阶段执行计划。
3. `laser-welding-execute-plan` — 输出工艺参数、设备选型、DOE、BOM、风险与验证建议。
4. `laser-welding-verify` — 校验免责声明、单位、DOE、BOM、风险与停止条件。

在 **Cursor Agent** 聊天中使用 `/skill-name`，或输入 `@` 从列表选择 Skill。Markdown 链接用于导航文档，**不会**自动 invoke skill。

| Skill | Slash 命令 |
| --- | --- |
| 完整流程 | `/laser-welding` |
| 需求采集 | `/laser-welding-brainstorm` |
| 编写计划 | `/laser-welding-write-plan` |
| 执行计划 | `/laser-welding-execute-plan` |
| 交付校验 | `/laser-welding-verify` |

## 提示词样例

复制到 Cursor Agent 聊天框（先输入 slash 命令，或用 `@` 附加 skill）。

**流程起点（英文）：**

```text
/laser-welding-brainstorm
New laser welding project: 1 mm copper battery tab to nickel busbar, lap joint, low spatter target.
Missing: takt, fixture, inspection method. Run readiness gating and list assumptions.
```

**流程起点（中文）：**

```text
/laser-welding-brainstorm
新项目：1mm 铜极耳与镍汇流排搭接激光焊接，目标低飞溅。
缺失：节拍、夹具、检测方式。请做就绪度门禁并列出假设。
```

**简化全流程推荐（中文）：**

```text
/laser-welding
材料：不锈钢 304，厚度：1mm，焊接方式：角焊。
请给出推荐的工艺参数、设备选型、DOE 范围、BOM 配置、风险和验证建议。
最终只呈现专业结论。
```

**单场景 — 缺陷诊断（中文）：**

```text
/laser-welding-execute-plan
1.2mm 不锈钢 304 对接焊飞溅和气孔严重，请给出专业诊断、调参建议和验证步骤。
```

更多样例：

| 资源 | 说明 |
| --- | --- |
| [examples/README.md](examples/README.md) | 索引与验证清单 |
| [examples/workflow-en.md](examples/workflow-en.md) | 完整四步流程，英文 |
| [examples/workflow-zh.md](examples/workflow-zh.md) | 完整四步流程，中文 |
| [examples/scenarios-en.md](examples/scenarios-en.md) | 材料、缺陷、钎焊、BOM、总线 |
| [examples/scenarios-zh.md](examples/scenarios-zh.md) | 同上，中文场景 |
| [skills/laser-welding/references/cursor.md](skills/laser-welding/references/cursor.md) | Cursor 安装与调用 |

## MCP 工具

| 工具 | 用途 |
| --- | --- |
| `process_recommend` | 基于材料、厚度、焊接方式输出工艺参数、设备选型、DOE、BOM、风险和验证建议 |
| `material_assess` | 材料组合、镀层、工艺窗口、焊接模式、钎焊焊丝警告 |
| `hardware_recommend` | 激光类型、OEM 候选、焊接头、运动、推拉丝送丝头、验证计划 |
| `doe_matrix` | 功率/速度/离焦/间隙/焊丝/预热/气体/夹具 DOE 网格 |
| `defect_diagnose` | 基于缺陷的调参建议 |
| `trajectory_generate` | 运动/G 代码提示 |
| `fieldbus_map` | OPC UA、PROFINET、EtherCAT 映射 |
| `solution_bom` | BOM、产线布局、假设、缺失输入、风险、验收标准 |

## 包

| 包 | 路径 | 用途 |
| --- | --- | --- |
| [`@ethermeta/lasernexus-core`](packages/laser-welding-core/README-ZH.md) | `packages/laser-welding-core` | 核心库、数据目录、工艺与方案逻辑 |
| [`@ethermeta/lasernexus`](mcp/lasernexus/README-ZH.md) | `mcp/lasernexus` | MCP 服务 CLI（`lasernexus`） |

## 开发

```bash
npm install
npm run build
npm test
npm run lint
```

发布标签 `v*` 会触发 lint、测试、构建、GitHub Release 资产生成（`plugin.zip` 和 npm tarball）、npm 发布与 marketplace 发布。

本地发布到 npm [@ethermeta](https://www.npmjs.com/org/ethermeta)（需先 `npm login` 或设置 `NPM_TOKEN`）：

```bash
./scripts/publish-npm.sh --check-versions
./scripts/publish-npm.sh --dry-run
./scripts/publish-npm.sh
./scripts/publish-npm.sh --core
./scripts/publish-npm.sh --mcp        # 同 --lasernexus；须先在 npm 发布对应版本的 core
```

## 版本与文档同步

版本规则、中英文同步规则、发布检查清单见 [docs/VERSIONING.md](docs/VERSIONING.md)。

## 安全边界

所有数值输出都只是启发式初始建议，必须通过 DOE、试焊和设备厂商手册验证。品牌名称仅作为候选示例，不构成背书。

Lasernexus 永远不提供报价、成本估算、仿真、有限元计算、焊丝牌号认证或直接投产承诺。

## 许可证

AGPL-3.0-or-later
