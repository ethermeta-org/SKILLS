# @ethermeta/lasernexus

[English](README.md) | **中文**

激光焊接工艺与售前方案的 [MCP](https://modelcontextprotocol.io/) 服务及 `lasernexus` CLI。在 Cursor、Codex、Claude Code 等客户端中调用 [`@ethermeta/lasernexus-core`](https://www.npmjs.com/package/@ethermeta/lasernexus-core) 提供的工具。

## 适用场景

- 让 AI 客户端获得工艺窗口、硬件推荐、DOE、缺陷调参、轨迹提示、场总线与方案 BOM 等结构化输出。
- 通过 `npx` 本地运行，无需克隆完整 skills 仓库。

分阶段 Agent skill（`laser-welding-brainstorm`、`laser-welding-write-plan` 等）请安装 [SKILLS monorepo](https://github.com/ethermeta-org/SKILLS) 或 marketplace skill；**本包仅为工具后端**。

## 安装与运行

```bash
npx -y @ethermeta/lasernexus mcp
```

自定义数据目录（结构与 core 包 `data/` 一致）：

```bash
npx -y @ethermeta/lasernexus mcp --data-dir /path/to/lasernexus-data
```

查看版本：

```bash
npx -y @ethermeta/lasernexus --version
```

需要 Node.js **20** 及以上。

## MCP 客户端配置

写入 `.cursor/mcp.json`、`.mcp.json` 或宿主 MCP 配置：

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

自定义数据目录：

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

更多示例：[skills/laser-welding/references/codex-tools.md](https://github.com/ethermeta-org/SKILLS/blob/main/skills/laser-welding/references/codex-tools.md)。

## MCP 工具

| 工具 | 阶段 | 用途 |
| --- | --- | --- |
| `material_assess` | 1 | 材料组合、镀层、工艺窗口、焊接模式、钎焊焊丝警告 |
| `hardware_recommend` | 2 | 激光类型、OEM 候选、焊头、运动、推拉送丝、验证计划 |
| `doe_matrix` | 3 | 功率/速度/离焦/间隙/焊丝/预热/气体/夹具 DOE 矩阵 |
| `defect_diagnose` | 3 | 缺陷驱动的调参建议 |
| `trajectory_generate` | 4 | 运动 / G 代码提示 |
| `fieldbus_map` | 4 | OPC UA、PROFINET、EtherCAT 映射 |
| `solution_bom` | 4 | BOM、线体布局、假设、缺失输入、风险、验收标准 |

`material_assess` 输入示例：

```json
{
  "material": "copper",
  "thicknessMm": 1,
  "jointType": "battery-tab"
}
```

## 与 core 包的版本关系

本包 `dependencies['@ethermeta/lasernexus-core']` 必须与 `packages/laser-welding-core/package.json` 的 `version` **完全一致**（精确版本号，不要用 `^`）。MCP 包自身的 semver（例如 `2.x`）可以与 core（`1.x`）不同。发布前运行 `./scripts/publish-npm.sh --check-versions`。仅发 MCP 时，对应版本的 core 须已在 npm 上发布。

## 在 monorepo 中开发

在 [SKILLS](https://github.com/ethermeta-org/SKILLS) 仓库根目录：

```bash
npm install
npm run build
npm run dev:mcp -- mcp
npm test -w @ethermeta/lasernexus
```

## 安全说明

所有输出均为**启发式工程建议**，须通过 DOE、试片、试焊、检测、安全联锁、持证人员及设备厂商资料验证。品牌名称仅为候选示例，不构成背书。

Lasernexus 不提供报价、成本估算、仿真、有限元、焊丝牌号认证或投产承诺。

## 更多文档

- [@ethermeta/lasernexus-core](https://github.com/ethermeta-org/SKILLS/tree/main/packages/laser-welding-core) — 库 API 与 `setDataRoot`
- [SKILLS README（英文）](https://github.com/ethermeta-org/SKILLS/blob/main/README.md)
- [SKILLS README（中文）](https://github.com/ethermeta-org/SKILLS/blob/main/README-ZH.md)
- [激光焊接 skill](https://github.com/ethermeta-org/SKILLS/tree/main/skills/laser-welding)

## 许可证

AGPL-3.0-or-later。许可证文本见 monorepo 根目录 [LICENSE](https://github.com/ethermeta-org/SKILLS/blob/main/LICENSE)。
