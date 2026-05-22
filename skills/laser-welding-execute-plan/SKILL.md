---
name: laser-welding-execute-plan
description: >-
  Execute a laser welding plan with MCP tools or fallback references, preserving
  traceability from assumptions and inputs to process, hardware, DOE, BOM, and
  validation outputs.
---

# Laser Welding — Execute Plan

## Execution Rules

- Use MCP when connected.
- Return to brainstorm if required inputs are missing.
- Keep every output traceable to a tool call, catalog, fallback doc, or explicit assumption.
- Do not overstate heuristic outputs.
- DOE and defect diagnosis may run independently only when inputs are complete.

## Tool Order

1. `material_assess`
2. `hardware_recommend`
3. `doe_matrix` and `defect_diagnose` as needed
4. `solution_bom`
5. `trajectory_generate` and `fieldbus_map` when automation details are in scope

## Fallback

If MCP is unavailable, read `skills/laser-welding/references/*.md`, label outputs `source: fallback-doc`, and keep numeric recommendations conservative and heuristic.

Finish with `laser-welding-verify`.
