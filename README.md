# SKILLS — Laser Welding (Lasernexus)

Distribution hub for Lasernexus laser welding skills, MCP tooling, and npm packages. This repository supports Claude Code, Codex, OpenCode, Cursor, and any MCP client that can launch a stdio server.

Lasernexus helps engineering assistants reason through laser welding work: material assessment, hardware and optics selection, DOE planning, defect diagnosis, motion trajectories, fieldbus mapping, and automation code generation. Inputs can be in English or Chinese, and outputs are intended to support real engineering review, not replace DOE, trial welds, or OEM documentation.

## What is included

- `skills/laser-welding` — primary process engineering skill for materials, equipment, validation, and automation.
- `skills/laser-welding-brainstorm` — discovery workflow for new laser welding applications and constraints.
- `skills/laser-welding-write-plan` — structured planning workflow for multi-stage welding work.
- `skills/laser-welding-execute-plan` — execution workflow that maps plans to MCP tool calls.
- `skills/laser-welding-verify` — verification checklist for assumptions, outputs, safety, and traceability.
- `@ethermeta/lasernexus-core` — core TypeScript library, data catalogs, templates, and process heuristics.
- `@ethermeta/lasernexus` — MCP server CLI that exposes the Lasernexus tools over stdio.

## Features

- Bilingual material inputs: copper / 铜 / 紫铜, aluminum / 铝, stainless steel / 不锈钢, and plastics such as PA6, PA66, PC, and PMMA.
- Bilingual defect inputs: 飞溅, 气孔, 未熔合, 裂纹, blowout, porosity, lack of fusion, and cracking.
- OEM family guidance for IPG, Raycus, Oneshare / 文享, Amada / 天田, Miyachi / 米亚基, Han's / 大族, Hymson / 海目星, UWLaser / 联赢, and HGTECH / 华工.
- Four-stage engineering flow: material and process window, hardware and optics, validation, and automation.
- Support for laser brazing, push-pull wire, turnkey automation lines, wobble/Bessel options, galvo and gantry motion, OPC UA, PROFINET, EtherCAT, CODESYS ST, and C#.
- MCP-first operation so clients can call deterministic tools instead of inventing power, speed, timing, or fieldbus details.

## Quick start from source

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

## MCP quick start

Run the published MCP server:

```bash
npx -y @ethermeta/lasernexus --stdio
```

Generic MCP client configuration:

```json
{
  "mcpServers": {
    "laser-welding": {
      "command": "npx",
      "args": ["-y", "@ethermeta/lasernexus", "--stdio"]
    }
  }
}
```

Use a custom data directory for extended material, equipment, or OEM catalogs:

```json
{
  "mcpServers": {
    "laser-welding": {
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

## MCP tools

| Tool | Stage | Purpose |
|------|-------|---------|
| `material_assess` | 1 | Assess material and thickness, then return a process window with power, speed, defocus, gas, and related parameters. |
| `hardware_recommend` | 2 | Recommend laser types, OEM families, optics, motion platforms, brazing options, and turnkey considerations. |
| `doe_matrix` | 3 | Generate a power-speed DOE grid, with optional defocus and gap axes. |
| `defect_diagnose` | 3 | Diagnose English or Chinese defect symptoms and suggest likely causes and corrective actions. |
| `trajectory_generate` | 4 | Generate line, circle, or rectangle motion paths as G-code or Fanuc-style output. |
| `fieldbus_map` | 4 | Produce OPC UA, PROFINET, or EtherCAT signal maps for laser automation. |
| `codegen_codesys_st` | 4 | Generate CODESYS Structured Text for `FB_LaserControl` with gas timing and interlocks. |
| `codegen_csharp` | 4 | Generate a C# laser control state machine. |

## Packages

| Package | Location | Purpose |
|---------|----------|---------|
| `@ethermeta/lasernexus-core` | `packages/laser-welding-core` | Core library, JSON catalogs, templates, tests, and build output. |
| `@ethermeta/lasernexus` | `mcp/laser-welding-server` | MCP stdio server and CLI entry point. |

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

Versioned release tags publish the distribution artifacts through `.github/workflows/release.yml`. The workflow runs tests, creates a GitHub Release with `plugin.zip`, and publishes the npm packages when `NPM_TOKEN` is configured.

Before release:

- Confirm `npm run build`, `npm test`, and `npm run lint` pass.
- Confirm plugin metadata points at the current package names and MCP command.
- Confirm package versions and generated distribution files are current.

## Safety

Lasernexus outputs are heuristic engineering aids. Always validate parameters with DOE, coupons, trial welds, destructive or nondestructive inspection, safety interlocks, qualified operators, and equipment manufacturer documentation. Brand names are illustrative references to OEM families, not endorsements.

## License

AGPL-3.0-or-later. See `LICENSE`.
