---
name: laser-welding-brainstorm
description: >-
  Brainstorm and gate laser welding projects before process or equipment
  decisions: scenario, materials, joint, quality, takt, automation, push-pull
  brazing, wire family, risks, and missing inputs.
---

# Laser Welding — Brainstorm

## Overview

Use this before process, equipment, DOE, BOM, or delivery decisions. This skill turns an early laser welding idea into a gated requirement summary with readiness level, assumptions, missing inputs, risks, and next action.

Brainstorm is the start of the workflow for new or underspecified projects. It does not produce a complete solution while required initial recommendation inputs are missing.

## Hard Gate

Do not produce a complete laser welding solution until these minimum inputs are known:

- `material`
- `thicknessMm`
- `weldingMethod` (`叠焊` / `拼焊` / `角焊` / lap / butt / fillet, etc.)

When any required input is missing, ask one missing required question and stop. Missing recommended inputs do not block an initial recommendation; they must be listed as assumptions, risks, and validation actions.

## Anti-Pattern: "This Is Enough To Recommend"

A project can sound obvious while hiding decisive process constraints. Copper battery tabs, stainless fillets, polymer transmission welds, and push-pull brazing all need different assumptions, tooling, and validation evidence.

If the user provides only a short description, do not silently invent the rest. Gate the required inputs first, then classify the remaining gaps by readiness level.

## Checklist

### Required For Initial Recommendation

- `material`
- `thicknessMm`
- `weldingMethod`

### Recommended / High-Confidence Inputs

- `applicationScenario`
- `baseMaterialB`, `thicknessBMm`
- `seamType`, `seamLengthMm`, or equivalent trajectory dimensions
- `qualityTargets` or target requirement
- `deliveryScope`

### Strongly Recommended

- Material grade, coating, surface condition, oil/oxide state
- Joint details beyond `weldingMethod`
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
- Mixed role: produce a balanced intake summary and name which open questions affect process versus automation.

## The Process

### Step 1: Identify The User Role And Scenario

Classify the request as process engineering, automation/presales, defect diagnosis, DOE planning, BOM/line layout, push-pull brazing, or mixed scope.

If the request spans unrelated subsystems, split the work into separately gated sub-projects and brainstorm the first one.

### Step 2: Check Required Inputs

Check `material`, `thicknessMm`, and `weldingMethod`.

If one or more is missing, ask one missing required question. Use a multiple-choice question when the likely choices are clear.

### Step 3: Classify Readiness

Assign one readiness level from L0 to L3. The readiness level controls whether the next output is a question, a concept recommendation, a preliminary solution, or DOE/trial planning.

### Step 4: Make Assumptions Explicit

For each missing recommended input, either list a conservative assumption or state why the missing input materially affects the risk.

### Step 5: Choose The Next Stage

Route ready requirements to `laser-welding-write-plan`. Route missing required inputs back to one-question intake. Route narrow defect-only requests to execution only when material, thickness, and symptom are known.

## Readiness Levels

- L0: Missing required inputs; do not produce a complete solution.
- L1: Concept solution only; assumptions and risks dominate.
- L2: Preliminary solution; major recommended inputs are present.
- L3: Ready for DOE and trial weld planning.

## Question Rule

Ask one missing required-for-initial-recommendation question at a time. Missing recommended inputs should not block the recommendation; state assumptions and risk.

Prefer focused questions:

- Missing material: ask for material family or grade.
- Missing thickness: ask for primary thickness in millimeters.
- Missing welding method: ask for lap, butt, fillet, seal, circular, brazing, or another named joint.

## When To Stop And Ask For Help

Stop and ask when:

- Any required input is missing.
- The user asks for a production release decision.
- The user asks for pricing, quotation, cost, simulation, or finite element analysis.
- The material or process mode is ambiguous enough that recommendations would diverge.
- Push-pull brazing is requested without enough information to name wire family or feeding geometry.

## When To Revisit Earlier Steps

Return to Step 1 when the user changes the application scenario or role.

Return to Step 2 when material, thickness, or welding method changes.

Return to Step 3 when missing recommended inputs are supplied and the readiness level may improve.

Return to Step 4 when a stated assumption is rejected.

## Output Template

- Scenario and role
- Readiness level
- Known inputs
- Missing required inputs
- Missing recommended inputs
- Assumptions
- Key risks
- Recommended next action

## Handoff To Write Plan

Hand off to `laser-welding-write-plan` only when required inputs are present. Include the readiness level, known inputs, assumptions, risk level, and recommended validation gates.
