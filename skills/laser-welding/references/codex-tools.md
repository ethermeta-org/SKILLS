# Codex tool mapping

Skills use MCP tool names. Map to your host as follows:

| Skill / MCP tool | Codex with MCP | Codex without MCP |
|------------------|----------------|-------------------|
| `material_assess` | Call MCP `material_assess` | Follow [process-window-heuristics.md](process-window-heuristics.md) |
| `hardware_recommend` | Call MCP `hardware_recommend` | Read [materials.md](materials.md) + recommend 515 nm for copper tab |
| `doe_matrix` | Call MCP `doe_matrix` | Build power–speed grid manually from ranges |
| `defect_diagnose` | Call MCP `defect_diagnose` | Use [defects.md](defects.md) |
| `trajectory_generate` | Call MCP `trajectory_generate` | Generate G-code per user dimensions |
| `fieldbus_map` | Call MCP `fieldbus_map` | State standard words: LaserReady, LaserOn, ShutterOpen, Fault |
| `solution_bom` | Call MCP `solution_bom` | List laser line components, qty, OEM hints, line layout |

## Install skill only

Use the repository-level Codex plugin metadata in `.codex-plugin/plugin.json`, then register the repository `skills` directory with Codex skill discovery. See the root `.codex/INSTALL.md` for the Windows junction setup and MCP configuration.

## Add MCP (Cursor / Codex config)

```json
{
  "mcpServers": {
    "lasernexus": {
      "command": "node",
      "args": ["/absolute/path/to/SKILLS/mcp/lasernexus/dist/index.js"]
    }
  }
}
```

Build server first: `npm run build` from repository root.

| Claude Code tool | Codex equivalent |
|------------------|------------------|
| `CallMcpTool` (MCP) | Host MCP invoke API |
| `Skill` tool | Skills load natively — follow SKILL.md |
| `Read` / file tools | Native file tools |

## v2 optional fields

- **material_assess**: `lightTransmittance` (0–1), `wireFill`, `gapMm`, `wireDiameterMm`, `targetPenetrationDepthMm`
- **hardware_recommend**: `motionPlatform`, `laserHead`, `lightTransmittance` → `bomSummary`, `lineLayout`
- **solution_bom**: same as hardware + `fieldbusProtocol`, `includeVision`, `wireFill`, `gapMm`
- **trajectory_generate**: `motionPlatform`
- **doe_matrix**: `defocusMin`, `defocusMax`, `gapMin`, `gapMax`, `includeGapAxis`
