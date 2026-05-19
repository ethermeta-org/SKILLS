---
name: laser-welding-write-plan
description: >-
  Write an implementation plan for a laser welding project: staged tasks for material window,
  hardware, DOE, defect loops, trajectory, and PLC codegen. Use after laser-welding-brainstorm.
---

# Laser Welding — Write Plan

Produce `docs/plans/<topic>.md` with ordered tasks. Do not call MCP tools during planning.

## Stages (map to MCP)

1. `material_assess`
2. `hardware_recommend` (include brazing/turnkey if applicable)
3. `doe_matrix` + `defect_diagnose` as needed
4. `trajectory_generate`, `fieldbus_map`, `codegen_codesys_st` or `codegen_csharp`

## Each task includes

- Inputs, expected MCP tool, acceptance criteria, DOE/trial weld gate

Hand off to `laser-welding-execute-plan`.
