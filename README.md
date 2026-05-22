# SKILLS — Laser Welding (Lasernexus)

**English** | [中文](README-ZH.md)

Official laser welding skills for Claude Code, Cursor, Codex/Open Skills, and MCP.

Lasernexus helps process and automation engineers move from early welding requirements to a presales-grade solution package: material assessment, laser/head selection, push-pull wire-feed brazing, brazing wire family guidance, DOE, defect diagnosis, fieldbus, trajectory hints, BOM, line layout, assumptions, risks, and validation criteria.

## Features

- **Bilingual inputs**: materials such as `copper`, `stainless-304`, `铜`, `不锈钢`; defects such as `spatter`, `porosity`, `飞溅`, `气孔`.
- **Presales solution workflow**: intake, readiness gates, assumptions, missing inputs, risk level, validation plan, and acceptance criteria.
- **Push-pull brazing**: wire-feed head, feed mode, feed orientation, nozzle offset, wire speed, preheat, seam tracking, and collision risk.
- **Brazing wire guidance**: CuSi, AlSi, Ni-based, Cu-based, stainless-filler, and custom families with validation warnings.
- **OEM candidate families**: IPG, Raycus, Oneshare/文享, Amada/天田, Miyachi/米亚基, Han's/大族, Hymson/海目星, UWLaser/联赢, HGTECH/华工.
- **MCP tools**: material assessment, hardware recommendation, DOE matrix, defect diagnosis, trajectory, fieldbus, and solution BOM.

## Install

Choose one entry point depending on how you use agents.

### 1. Plugin Install

Use this when your agent client supports local plugin directories, similar to Superpowers-style plugin installation.

```bash
git clone https://github.com/ethermeta-org/SKILLS.git
cd SKILLS
npm install
npm run build
```

Claude Code plugin:

```bash
claude --plugin-dir .
```

Cursor plugin:

```bash
# Use this repository as a local Cursor plugin directory.
# The plugin manifest is .cursor-plugin/plugin.json.
```

Plugin manifests:

| Client | Manifest | Skills path |
| --- | --- | --- |
| Claude Code | `.claude-plugin/plugin.json` | `./skills/` |
| Cursor | `.cursor-plugin/plugin.json` | `./skills/` |

Release builds package these manifests into `plugin.zip`.

### 2. Codex / Open Skills

```bash
npx skills add <org>/SKILLS --skill laser-welding -g -y
```

Then configure MCP if you want tool-backed process and BOM outputs.

### 3. MCP via npm

```bash
npx -y @ethermeta/lasernexus --stdio
```

`.cursor/mcp.json` / `.mcp.json` example:

```json
{
  "mcpServers": {
    "lasernexus": {
      "command": "npx",
      "args": ["-y", "@ethermeta/lasernexus", "--stdio"]
    }
  }
}
```

Optional custom data catalog:

```bash
npx -y @ethermeta/lasernexus --stdio --data-dir /path/to/custom/data
```

Or in MCP client configuration:

```json
{
  "mcpServers": {
    "lasernexus": {
      "command": "npx",
      "args": [
        "-y",
        "@ethermeta/lasernexus",
        "--stdio",
        "--data-dir",
        "/path/to/lasernexus-data"
      ]
    }
  }
}
```

### 4. From Source

```bash
git clone https://github.com/ethermeta-org/SKILLS.git
cd SKILLS
npm install
npm run build
npm test
```

Run the MCP server from the workspace during development:

```bash
npm run dev:mcp -- --stdio
```

## Client installation

| Client | Entry point | Notes |
|--------|-------------|-------|
| Claude Code | `.claude-plugin/plugin.json` | Claude plugin metadata and bundled MCP registration. |
| Codex | `.codex-plugin/plugin.json` | Codex plugin metadata for installing the skill bundle. |
| Codex | `.codex/config.toml` | Local Codex configuration for skill and MCP wiring. |
| OpenCode | `.opencode/plugins/laser-welding.js` | OpenCode plugin entry point. |
| OpenCode | `.opencode/INSTALL.md` | OpenCode installation instructions. |
| Cursor | `.mcp.json` | Add or copy the MCP server block into Cursor's MCP configuration. |
| MCP-only | `.mcp.json` | Generic MCP stdio configuration for clients that do not use plugins. |

## Workflow

For new projects, use the staged skills:

1. `laser-welding-brainstorm` — collect requirements, missing inputs, assumptions, and readiness.
2. `laser-welding-write-plan` — write the staged execution plan.
3. `laser-welding-execute-plan` — call MCP tools or fallback references.
4. `laser-welding-verify` — verify disclaimers, units, DOE, BOM, risks, and stop conditions.

## MCP tools

| Tool | Stage | Purpose |
| --- | --- | --- |
| `material_assess` | 1 | Material pair, coating, process window, weld mode, brazing wire warning |
| `hardware_recommend` | 2 | Laser type, OEM candidates, head, motion, push-pull head, validation plan |
| `doe_matrix` | 3 | Power/speed/defocus/gap/wire/preheat/gas/clamp DOE grid |
| `defect_diagnose` | 3 | Defect-driven tuning actions |
| `trajectory_generate` | 4 | Motion/G-code hints |
| `fieldbus_map` | 4 | OPC UA, PROFINET, EtherCAT mapping |
| `solution_bom` | 4 | BOM, line layout, assumptions, missing inputs, risk, acceptance criteria |

## Packages

| Package | Location | Purpose |
| --- | --- | --- |
| `@ethermeta/lasernexus-core` | `packages/laser-welding-core` | Core library, data catalogs, process and solution logic |
| `@ethermeta/lasernexus` | `mcp/lasernexus` | MCP server CLI (`lasernexus`) |

## Development

Requirements:

- Node.js 20 or newer.
- npm workspaces.

Common commands:

```bash
npm install
npm run build
npm test
npm run lint
npm run dev:mcp -- --stdio
```

The root workspace builds and tests both npm packages. Keep MCP schemas, handlers, and tool listings in sync when changing tool behavior.

## Release

Release tag `v*` runs lint, tests, build, GitHub Release asset generation (`plugin.zip` and npm tarball), npm publish, and marketplace publishing through `.github/workflows/release.yml`.

Before release:

- Confirm `npm run build`, `npm test`, and `npm run lint` pass.
- Confirm plugin metadata points at the current package names and MCP command.
- Confirm package versions and generated distribution files are current.

## Versioning And Documentation Sync

See [docs/VERSIONING.md](docs/VERSIONING.md).

## Safety

Lasernexus outputs are heuristic engineering aids. Always validate parameters with DOE, coupons, trial welds, destructive or nondestructive inspection, safety interlocks, qualified operators, and equipment manufacturer documentation. Brand names are candidate examples, not endorsements.

Lasernexus never provides pricing, quotation, cost estimation, simulation, finite element analysis, certified filler wire approval, or production-release promises.

## License

AGPL-3.0-or-later. See `LICENSE`.
