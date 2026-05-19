# SKILLS — Laser Welding (Lasernexus)

Official laser welding skills for Claude Code, Codex/Open Skills, and MCP.

## Features

- **Bilingual inputs**: materials (铜, 不锈钢) and defects (飞溅, 气孔) in English or Chinese
- **9 laser OEM families**: IPG, Raycus, Oneshare/文享 (precision + brazing + turnkey), Amada/天田, Miyachi/米亚基, Han's/大族, Hymson/海目星, UWLaser/联赢, HGTECH/华工
- **8 MCP tools** across 4 process stages + **4 meta skills** (brainstorm, write-plan, execute-plan, verify)

## Install

```bash
# From source
git clone <repo> && cd SKILLS
npm install && npm run build

# MCP via npm (after publish)
npx -y @ethermeta/lasernexus --stdio
```

`.cursor/mcp.json` / `.mcp.json` example:

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

Optional: `--data-dir /path/to/custom/data` for OEM-extended JSON catalogs.

## Packages

| Package | Purpose |
|---------|---------|
| `@ethermeta/lasernexus-core` | Core library + data |
| `@ethermeta/lasernexus` | MCP server CLI (`lasernexus`) |

## Development

```bash
npm install
npm run build
npm test
```

Release tag `v*` runs tests, GitHub Release (`plugin.zip`), and npm publish (requires `NPM_TOKEN`).

## License

AGPL-3.0-or-later
