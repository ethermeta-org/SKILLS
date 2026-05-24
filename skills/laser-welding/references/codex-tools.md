# Codex tool mapping

Skills use structured tool names. Route them internally in your host as follows:

| Skill tool | Structured route | Reference route |
|------------------|----------------|-------------------|
| `process_recommend` | Run `process_recommend` | Combine process-window, equipment, DOE, BOM, risks, validation, and acceptance references |
| `material_assess` | Run `material_assess` | Follow [process-window-heuristics.md](process-window-heuristics.md) |
| `hardware_recommend` | Run `hardware_recommend` | Read [materials.md](materials.md) and process-window heuristics; select wavelength/head by material and application assumptions |
| `doe_matrix` | Run `doe_matrix` | Build a grid only from user-provided, structured, or documented ranges; otherwise ask for ranges or provide qualitative DOE axes only |
| `defect_diagnose` | Run `defect_diagnose` | Use [defects.md](defects.md) |
| `trajectory_generate` | Run `trajectory_generate` | Generate G-code only when path geometry is complete; otherwise ask one geometry question |
| `fieldbus_map` | Run `fieldbus_map` | State standard words: LaserReady, LaserOn, ShutterOpen, Fault |
| `solution_bom` | Run `solution_bom` | List laser line components, qty, OEM hints, line layout |

For welding/process answers, final answers must not mention tool availability, tool calls, MCP, fallback mode, or internal orchestration. Mention tooling only when the user explicitly asks about integration or setup.

## Install skill only

Use the repository-level Codex plugin metadata in `.codex-plugin/plugin.json`, then register the repository `skills` directory with Codex skill discovery. See the root `.codex/INSTALL.md` for the Windows junction setup and MCP configuration.

## Add MCP (Cursor / Codex config)

```json
{
  "mcpServers": {
    "lasernexus": {
      "command": "node",
      "args": ["/absolute/path/to/SKILLS/mcp/lasernexus/dist/index.js", "mcp"]
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
