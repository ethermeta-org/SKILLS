---
name: laser-welding
description: >-
  Laser welding / 激光焊接 process engineering: material assessment (铜/铝/不锈钢),
  IPG/Raycus/Oneshare/文享/Amada/天田/Miyachi/大族/海目星/联赢/华工 laser selection,
  laser brazing 钎焊 push-pull wire, turnkey automation lines, DOE, defect diagnosis
  (飞溅/气孔/未熔合), G-code, OPC UA/PROFINET/EtherCAT, CODESYS ST or C# FB_LaserControl.
  Meta workflow: laser-welding-brainstorm, write-plan, execute-plan, verify.
---

# Laser Welding (Official Skill)

End-to-end support for laser welding: materials → hardware → validation → automation.

## Execution priority

1. **New project** — consider `laser-welding-brainstorm` → `laser-welding-write-plan` → `laser-welding-execute-plan` → `laser-welding-verify` (or Superpowers equivalents for generic planning).
2. **If MCP `laser-welding` / `@ethermeta/lasernexus` is connected** — you **must** call the tools below. Do not invent power, speed, or PLC timings.
3. **If MCP is unavailable** — read [references/process-window-heuristics.md](references/process-window-heuristics.md), [references/materials.md](references/materials.md), [references/defects.md](references/defects.md). Label outputs `source: fallback-doc`.

**Inputs accept English or Chinese** for materials (铜, 不锈钢) and defects (飞溅, 气孔).

## MCP tools (8)

| Tool | Stage | When to use |
|------|-------|-------------|
| `material_assess` | 1 | Material + thickness → power, speed, defocus, gas |
| `hardware_recommend` | 2 | Wavelength, brands (IPG, Raycus, 文享, 大族, …), brazing/turnkey, wobble/Bessel |
| `doe_matrix` | 3 | Power–speed DOE grid |
| `defect_diagnose` | 3 | blowout / lack_of_fusion / porosity / cracking (中英别名) |
| `trajectory_generate` | 4 | G-code / motion program |
| `fieldbus_map` | 4 | opc-ua / profinet / ethercat |
| `codegen_codesys_st` | 4 | `FB_LaserControl` ST with PreGas/PostGas interlocks |
| `codegen_csharp` | 4 | C# laser state machine |

### Example — brazing (文享类场景)

```json
{ "material": "copper", "thicknessMm": 1.2, "application": "laser-brazing-push-pull" }
```

→ `hardware_recommend`

## Four-stage workflow

1. **Material & process window** — `material_assess`
2. **Hardware & optics** — `hardware_recommend`
3. **Validation** — `doe_matrix`; `defect_diagnose` when defects reported
4. **Automation** — trajectory, fieldbus, codegen as needed

## Installation

| Channel | How |
|---------|-----|
| Claude Code plugin | `claude --plugin-dir .` |
| MCP (npx) | `npx -y @ethermeta/lasernexus --stdio` |
| Open Skills | `npx skills add <org>/SKILLS --skill laser-welding` |

See [README.md](README.md).

## Safety & disclaimer

Heuristic values only. Brand names are illustrative, not endorsements. Validate with DOE and OEM manuals.


## v2 parameters (optional)

| Tool | New inputs |
|------|------------|
| `material_assess` | `lightTransmittance`, `wireFill`, `gapMm`, `wireDiameterMm`, `targetPenetrationDepthMm` |
| `hardware_recommend` | `motionPlatform`, `laserHead`, `preferredLaserType`, `lightTransmittance` |
| `trajectory_generate` | `motionPlatform` |
| `doe_matrix` | `defocusMin/Max`, `gapMin/Max`, `includeGapAxis` |

Outputs include `processParams`, `weldMode`, `recommendedLaserTypes`.
