---
name: laser-welding
description: >-
  Laser welding / 激光焊接 process engineering and presales solution workflow:
  intake, material assessment, laser and head selection, push-pull wire-feed
  brazing, brazing wire family guidance, DOE, defect diagnosis, fieldbus,
  trajectory, turnkey BOM, and delivery verification.
---

# Laser Welding (Official Skill)

## Overview

End-to-end laser welding solution support: intake -> process window -> hardware and automation -> DOE -> BOM -> delivery verification.

This is the official workflow router. It decides which stage skill to use, keeps domain guardrails visible, and makes sure every recommendation remains traceable to user inputs, structured output, catalog/reference material, or explicit assumptions.

## When To Use

- New laser welding or laser brazing project
- Push-pull wire-feed brazing head selection
- Brazing or filler wire family guidance
- Material, thickness, joint, coating, or defect process assessment
- Turnkey automation line, fieldbus, fixture, safety, or BOM request
- DOE planning or pre-delivery verification

## Hard Rules

- Never provide pricing, quotation, cost estimation, simulation, or finite element analysis.
- Use available structured tools internally for numeric process, hardware, DOE, fieldbus, and BOM outputs; do not ask the user whether tools are available.
- For welding/process answers, final answers must not mention tool availability, tool calls, MCP, fallback mode, or internal orchestration. Mention tooling only when the user explicitly asks about integration or setup.
- Do not invent process values, PLC timings, OEM-specific settings, certified filler grades, or production release claims.
- Every numeric recommendation is heuristic and requires DOE and trial weld validation.
- Brand names are candidate examples, not endorsements.
- Push-pull brazing must include wire-feed head, feeding geometry, brazing wire family, and validation risks.
- A complete solution requires at least `material`, `thicknessMm`, and `weldingMethod`; missing recommended inputs become assumptions and risks.

## Stage Decision Tree

1. New or underspecified project -> use `laser-welding-brainstorm`.
2. Required inputs are present but execution steps are not defined -> use `laser-welding-write-plan`.
3. Written execution plan exists -> use `laser-welding-execute-plan`.
4. Defect-only request -> use `defect_diagnose` internally, then verify whether the process context is sufficient.
5. Advanced BOM or line request -> use `hardware_recommend` and `solution_bom` internally when inputs are sufficient.
6. Before any final answer that claims completeness or readiness -> use `laser-welding-verify`.

## Process Flow

```mermaid
flowchart TD
  A["Intake: scenario, materials, joint, targets"] --> B{"material + thicknessMm + weldingMethod present?"}
  B -- "No" --> C["laser-welding-brainstorm: ask one missing required question"]
  B -- "Yes" --> D["laser-welding-write-plan: define staged execution"]
  D --> E["laser-welding-execute-plan: process, hardware, DOE, BOM"]
  E --> F["laser-welding-verify: evidence gate"]
  F --> G{"Verification passes?"}
  G -- "No" --> H["Return to brainstorm, planning, or execution"]
  G -- "Yes" --> I["Professional delivery with assumptions, risks, validation, acceptance"]
```

## MCP Tools

| Tool | Stage | Use |
| --- | --- | --- |
| `process_recommend` | End-to-end | Simplified input for process parameters, equipment selection, DOE, BOM, risks, validation, and acceptance |
| `material_assess` | Process | Material pair, coating, initial process window, weld mode, brazing wire family warning |
| `hardware_recommend` | Solution | Laser, head, wire-feed head, motion, brand filtering, validation plan |
| `doe_matrix` | Validation | Power, speed, defocus, gap, wire speed, wire angle, preheat, gas, clamp force |
| `defect_diagnose` | Validation | Defect-driven parameter corrections |
| `trajectory_generate` | Automation | G-code or motion hints |
| `fieldbus_map` | Automation | OPC UA, PROFINET, EtherCAT mappings |
| `solution_bom` | Delivery | BOM, layout, assumptions, missing inputs, risk, validation, acceptance |

## Stage Handoff Contract

Every stage hands the next stage these fields when known:

- Scenario and user role
- Known inputs
- Missing required inputs
- Missing recommended inputs
- Explicit assumptions
- Risk level
- Process mode: fusion, brazing, polymer transmission, seal welding, battery tab, busbar, or custom
- Required validation evidence
- Next recommended stage

## When To Stop And Ask For Help

Stop and ask one focused question when:

- `material`, `thicknessMm`, or `weldingMethod` is missing for a complete recommendation.
- The requested scope includes pricing, commercial quotation, simulation, finite element analysis, certified filler approval, or direct production release.
- The user asks for production readiness without DOE and trial weld evidence.
- Structured output and user constraints conflict in a way that changes the recommendation.

## When To Revisit Earlier Stages

Return to `laser-welding-brainstorm` when required inputs change or were misunderstood.

Return to `laser-welding-write-plan` when the delivery scope changes, an automation/BOM requirement is added, or assumptions need a new execution sequence.

Return to `laser-welding-execute-plan` when a plan is still valid but a tool output or reference result must be regenerated.

## Anti-Patterns

- Producing a complete solution without at least material, thickness, and welding method.
- Ignoring joint type, coating, fixture, takt, safety, or validation.
- Mixing brazing and fusion welding without declaring the mode.
- Treating push-pull wire-feed brazing as only a generic wire feeder.
- Omitting brazing wire family in a brazing request.
- Claiming production readiness without DOE or trial weld evidence.
- Exposing internal orchestration in a normal professional answer.

## Installation

| Channel | How |
|---------|-----|
| Claude Code plugin | Use `.claude-plugin/plugin.json`; see [claude-code.md](references/claude-code.md) |
| Cursor plugin | Use `.cursor-plugin/plugin.json`; see [cursor.md](references/cursor.md) |
| Codex plugin | Use `.codex-plugin/plugin.json`; see `.codex/INSTALL.md` |
| OpenCode plugin | Use `.opencode/plugins/laser-welding.js`; see `.opencode/INSTALL.md` |
| MCP (npx) | `npx -y @ethermeta/lasernexus mcp` |

## Permanent Out Of Scope

Pricing, quotation, cost estimation, simulation, finite element analysis, OEM real-time connection, certified filler grade approval, brand endorsement, and direct production release promises.

## References

- [cursor.md](references/cursor.md)
- [claude-code.md](references/claude-code.md)
- [solution-intake.md](references/solution-intake.md)
- [brazing-wire.md](references/brazing-wire.md)
- [wire-feed-heads.md](references/wire-feed-heads.md)
- [materials.md](references/materials.md)
- [process-window-heuristics.md](references/process-window-heuristics.md)
