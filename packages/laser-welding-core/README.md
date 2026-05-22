# @ethermeta/lasernexus-core

**English** | [中文](README-ZH.md)

Laser welding process core library: materials, hardware selection, DOE, defect diagnosis, fieldbus mapping, and presales solution BOM. This package is a TypeScript library with bundled data catalogs — not an MCP server or Agent skill.

## When to use

- Build your own service, CLI, or MCP server on top of the same logic as [Lasernexus](https://www.npmjs.com/package/@ethermeta/lasernexus).
- Extend or replace the built-in catalogs under `data/` via `setDataRoot()`.
- Call process and solution functions directly from Node.js 20+.

The official MCP server [`@ethermeta/lasernexus`](https://www.npmjs.com/package/@ethermeta/lasernexus) depends on this package. For Cursor, Codex, Claude Code, and staged skills, see the [SKILLS monorepo](https://github.com/ethermeta-org/SKILLS).

## Install

```bash
npm install @ethermeta/lasernexus-core
```

Requires Node.js **20** or newer.

## Quick start

```ts
import { assessMaterial, setDataRoot } from "@ethermeta/lasernexus-core";

// Optional: point at a custom data directory (materials, lasers, defects, BOM catalog, …)
// setDataRoot("/path/to/custom/data");

const result = assessMaterial({
  material: "copper",
  thicknessMm: 1,
  jointType: "battery-tab",
});

console.log(result.powerW, result.speedMmPerS, result.warnings);
```

## Public API (by stage)

| Stage | Export | Purpose |
| --- | --- | --- |
| 1 | `assessMaterial` | Material / pair, coating, process window, weld mode, brazing wire warnings |
| 2 | `recommendHardware` | Laser type, OEM candidates, head, motion, push-pull wire-feed, validation plan |
| 3 | `generateDoeMatrix` | Power / speed / defocus / gap / wire / preheat / gas / clamp DOE grid |
| 3 | `diagnoseDefect` | Defect-driven tuning actions |
| 4 | `generateTrajectory` | Motion / G-code hints |
| 4 | `mapFieldbus` | OPC UA, PROFINET, EtherCAT mapping templates |
| 4 | `composeSolutionBom` | Turnkey BOM, line layout, assumptions, risks, acceptance criteria |
| 4 | `buildBomLineItems`, `buildLineLayout`, `summarizeBom`, `turnkeyVendorsFromCatalog` | BOM building blocks |

Also exported: core `types`, `errors`, material `aliases`, and `setDataRoot` / `getDataRoot`.

## Data catalogs

Shipped under `data/` in the published package (materials, lasers, equipment, defects, brazing wires, wire-feed heads, fieldbus profiles, BOM catalog).

```ts
import { setDataRoot, getDataRoot } from "@ethermeta/lasernexus-core";

setDataRoot("/path/to/lasernexus-data");
console.log(getDataRoot());
```

Use the same layout as the built-in `data/` folder when maintaining a custom catalog.

## Develop in the monorepo

From the [SKILLS](https://github.com/ethermeta-org/SKILLS) repository root:

```bash
npm install
npm run build -w @ethermeta/lasernexus-core
npm test -w @ethermeta/lasernexus-core
npm run lint -w @ethermeta/lasernexus-core
```

Publish with `./scripts/publish-npm.sh` (publish core before MCP; keep MCP’s `dependencies['@ethermeta/lasernexus-core']` equal to this package’s `version`).

## Safety

Outputs are **heuristic engineering aids** only. Validate with DOE, coupons, trial welds, inspection, safety interlocks, qualified operators, and equipment manufacturer documentation. Brand names are candidate examples, not endorsements.

Lasernexus never provides pricing, quotation, cost estimation, simulation, finite element analysis, certified filler wire approval, or production-release promises.

## More documentation

- [SKILLS README (EN)](https://github.com/ethermeta-org/SKILLS/blob/main/README.md) — full install paths for plugins and MCP clients
- [SKILLS README (中文)](https://github.com/ethermeta-org/SKILLS/blob/main/README-ZH.md)
- [Laser welding skill](https://github.com/ethermeta-org/SKILLS/tree/main/skills/laser-welding) — MCP tool examples and configuration
- [@ethermeta/lasernexus MCP package](https://github.com/ethermeta-org/SKILLS/tree/main/mcp/lasernexus)

## License

AGPL-3.0-or-later. See [LICENSE](https://github.com/ethermeta-org/SKILLS/blob/main/LICENSE) in the monorepo.
