---
name: laser-welding-brainstorm
description: >-
  Brainstorm and gate laser welding projects before process or equipment
  decisions: scenario, materials, joint, quality, takt, automation, push-pull
  brazing, wire family, risks, and missing inputs.
---

# Laser Welding — Brainstorm

Use this for requirement intake and readiness gating before process or equipment decisions.

## Checklist

### Required

- `applicationScenario`
- `baseMaterialA`, `baseMaterialB`, `thicknessA`, `thicknessB`
- `jointType`
- `seamType`, `seamLengthMm` or equivalent trajectory dimensions
- `qualityTargets` or target requirement
- `deliveryScope`

### Strongly Recommended

- Material grade, coating, surface condition, oil/oxide state
- Target penetration, sealing, conductivity, strength, appearance, deformation limit
- `targetTaktSec`, annual volume, parts per hour, station count
- Automation level, motion platform, fixture constraints
- Inspection method, fieldbus, PLC/MES, safety level
- Preferred and forbidden brands
- For push-pull brazing: wire-feed mode, orientation, angle, nozzle offset, wire speed, preheat, seam tracking, brazing wire family

### Optional

- Fixture complexity, clamp force, plant utilities, existing equipment reuse, collision envelope notes

## Role Branches

- Process engineer: emphasize material pair, joint, target penetration, defects, DOE, and trial weld validation.
- Automation or presales engineer: emphasize takt, stations, motion platform, fixture, safety, fieldbus, BOM, and delivery package.

## Readiness Levels

- L0: Missing required inputs; do not produce a complete solution.
- L1: Concept solution only; assumptions and risks dominate.
- L2: Preliminary solution; major recommended inputs are present.
- L3: Ready for DOE and trial weld planning.

## Question Rule

Ask one missing required question at a time. If recommended inputs are missing, continue only with explicit assumptions and risk.

## Output Template

- Scenario and role
- Readiness level
- Known inputs
- Missing required inputs
- Assumptions
- Key risks
- Recommended next skill or MCP tool
