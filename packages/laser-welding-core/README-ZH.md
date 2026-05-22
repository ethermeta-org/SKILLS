# @ethermeta/lasernexus-core

[English](README.md) | **中文**

激光焊接工艺核心库：材料评估、硬件选型、DOE、缺陷诊断、场总线映射与售前方案 BOM。本包为带内置数据目录的 TypeScript 库，**不是** MCP 服务，也**不是** Agent Skill。

## 适用场景

- 在 Node.js 中直接调用工艺与方案逻辑，或自建服务 / CLI / MCP。
- 通过 `setDataRoot()` 扩展或替换 `data/` 下的材料、激光器、缺陷、BOM 等目录。
- 与官方 MCP 包 [`@ethermeta/lasernexus`](https://www.npmjs.com/package/@ethermeta/lasernexus) 使用同一套核心实现。

官方 MCP 依赖本包。若使用 Cursor、Codex、Claude Code 及分阶段 skill，请参阅 [SKILLS monorepo](https://github.com/ethermeta-org/SKILLS)。

## 安装

```bash
npm install @ethermeta/lasernexus-core
```

需要 Node.js **20** 及以上。

## 快速开始

```ts
import { assessMaterial, setDataRoot } from "@ethermeta/lasernexus-core";

// 可选：自定义数据目录（材料、激光器、缺陷、BOM 目录等）
// setDataRoot("/path/to/custom/data");

const result = assessMaterial({
  material: "copper",
  thicknessMm: 1,
  jointType: "battery-tab",
});

console.log(result.powerW, result.speedMmPerS, result.warnings);
```

## 公开 API（按阶段）

| 阶段 | 导出 | 用途 |
| --- | --- | --- |
| 1 | `assessMaterial` | 材料/组合、镀层、工艺窗口、焊接模式、钎焊焊丝警告 |
| 2 | `recommendHardware` | 激光类型、OEM 候选、焊头、运动、推拉送丝、验证计划 |
| 3 | `generateDoeMatrix` | 功率/速度/离焦/间隙/焊丝/预热/气体/夹具 DOE 矩阵 |
| 3 | `diagnoseDefect` | 缺陷驱动的调参建议 |
| 4 | `generateTrajectory` | 运动 / G 代码提示 |
| 4 | `mapFieldbus` | OPC UA、PROFINET、EtherCAT 映射模板 |
| 4 | `composeSolutionBom` | 交钥匙 BOM、线体布局、假设、风险、验收标准 |
| 4 | `buildBomLineItems`、`buildLineLayout`、`summarizeBom`、`turnkeyVendorsFromCatalog` | BOM 构建模块 |

另导出：核心 `types`、`errors`、材料 `aliases`，以及 `setDataRoot` / `getDataRoot`。

## 数据目录

发布包内自带 `data/`（材料、激光器、设备、缺陷、钎焊焊丝、送丝头、场总线、BOM 目录等）。

```ts
import { setDataRoot, getDataRoot } from "@ethermeta/lasernexus-core";

setDataRoot("/path/to/lasernexus-data");
console.log(getDataRoot());
```

自定义目录请保持与内置 `data/` 相同的结构。

## 在 monorepo 中开发

在 [SKILLS](https://github.com/ethermeta-org/SKILLS) 仓库根目录：

```bash
npm install
npm run build -w @ethermeta/lasernexus-core
npm test -w @ethermeta/lasernexus-core
npm run lint -w @ethermeta/lasernexus-core
```

发布使用 `./scripts/publish-npm.sh`（先发布 core，再发布 MCP；MCP 对 core 的依赖版本须与本包 `version` 一致）。

## 安全说明

所有输出均为**启发式工程建议**，须通过 DOE、试片、试焊、检测、安全联锁、持证人员及设备厂商资料验证。品牌名称仅为候选示例，不构成背书。

Lasernexus 不提供报价、成本估算、仿真、有限元、焊丝牌号认证或投产承诺。

## 更多文档

- [SKILLS README（英文）](https://github.com/ethermeta-org/SKILLS/blob/main/README.md) — 插件与 MCP 客户端完整安装说明
- [SKILLS README（中文）](https://github.com/ethermeta-org/SKILLS/blob/main/README-ZH.md)
- [激光焊接 skill](https://github.com/ethermeta-org/SKILLS/tree/main/skills/laser-welding) — MCP 工具示例与配置
- [@ethermeta/lasernexus MCP 包](https://github.com/ethermeta-org/SKILLS/tree/main/mcp/lasernexus)

## 许可证

AGPL-3.0-or-later。许可证文本见 monorepo 根目录 [LICENSE](https://github.com/ethermeta-org/SKILLS/blob/main/LICENSE)。
