# @ethermeta/lasernexus

**English** | [中文](README-ZH.md)

[MCP](https://modelcontextprotocol.io/) server and `lasernexus` CLI for laser welding process and presales solution tools. Wraps [`@ethermeta/lasernexus-core`](https://www.npmjs.com/package/@ethermeta/lasernexus-core) for use in Cursor, Codex, Claude Code, and other MCP clients.

## When to use

- Connect an AI client to numeric process windows, hardware recommendations, DOE, defect actions, trajectory hints, fieldbus templates, and solution BOM output.
- Run locally via `npx` without cloning the full skills repository.

For staged Agent skills (`laser-welding-brainstorm`, `laser-welding-write-plan`, etc.), install the [SKILLS monorepo](https://github.com/ethermeta-org/SKILLS) or marketplace skill bundle — this package is the **tool backend** only.

## Install and run

```bash
npx -y @ethermeta/lasernexus mcp
```

Custom data catalog (same layout as core `data/`):

```bash
npx -y @ethermeta/lasernexus mcp --data-dir /path/to/lasernexus-data
```

Print version:

```bash
npx -y @ethermeta/lasernexus --version
```

Requires Node.js **20** or newer.

## MCP client configuration

Add to `.cursor/mcp.json`, `.mcp.json`, or your host’s MCP config:

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

With a custom data directory:

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

More examples: [skills/laser-welding/references/codex-tools.md](https://github.com/ethermeta-org/SKILLS/blob/main/skills/laser-welding/references/codex-tools.md).

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

Example `material_assess` input:

```json
{
  "material": "copper",
  "thicknessMm": 1,
  "jointType": "battery-tab"
}
```

## Dependency on core

`dependencies['@ethermeta/lasernexus-core']` in this package must **exactly match** the `version` in `packages/laser-welding-core/package.json` (pin an exact semver, not `^` ranges). The MCP package version (for example `2.x`) may differ from core (`1.x`). Before publish, run `./scripts/publish-npm.sh --check-versions`. When publishing MCP alone, the matching core version must already be on the npm registry.

## Develop in the monorepo

From the [SKILLS](https://github.com/ethermeta-org/SKILLS) repository root:

```bash
npm install
npm run build
npm run dev:mcp -- mcp
npm test -w @ethermeta/lasernexus
```

## Safety

Outputs are **heuristic engineering aids** only. Validate with DOE, coupons, trial welds, inspection, safety interlocks, qualified operators, and equipment manufacturer documentation. Brand names are candidate examples, not endorsements.

Lasernexus never provides pricing, quotation, cost estimation, simulation, finite element analysis, certified filler wire approval, or production-release promises.

## More documentation

- [@ethermeta/lasernexus-core](https://github.com/ethermeta-org/SKILLS/tree/main/packages/laser-welding-core) — library API and `setDataRoot`
- [SKILLS README (EN)](https://github.com/ethermeta-org/SKILLS/blob/main/README.md)
- [SKILLS README (中文)](https://github.com/ethermeta-org/SKILLS/blob/main/README-ZH.md)
- [Laser welding skill](https://github.com/ethermeta-org/SKILLS/tree/main/skills/laser-welding)

## License

AGPL-3.0-or-later. See [LICENSE](https://github.com/ethermeta-org/SKILLS/blob/main/LICENSE) in the monorepo.
