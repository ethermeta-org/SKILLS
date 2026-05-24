---
name: laser-welding-write-plan
description: >-
  Write an implementation or execution plan for a laser welding project after
  intake: process window, hardware, push-pull head, wire family, DOE, BOM,
  layout, fieldbus, and delivery verification.
---

# Laser Welding — Write Plan

## Overview

Use this after intake has established the minimum recommendation inputs. This skill turns a gated laser welding requirement into a staged execution plan that another agent can follow without inventing process logic.

Planning does not call structured tools. Planning names the tools, references, expected outputs, acceptance criteria, stop conditions, and DOE or trial weld gates that execution must use later.

## Scope Check

Before writing a plan, check whether the request is one cohesive workflow or multiple independent projects.

Split the work when the user asks for unrelated deliverables such as separate welding processes, separate automation lines, or independent defect investigations. Each sub-project gets its own brainstorm -> write-plan -> execute-plan -> verify loop.

## Plan Contract

Every plan must state:

- Known inputs
- Missing recommended inputs
- Assumptions
- Risk level
- Stage order
- Expected structured tool or fallback reference per stage
- Expected output per stage
- Acceptance criteria per stage
- Stop condition per stage
- DOE or trial weld gate per stage

Do not start execution from a plan that lacks any of these fields.

## Plan Stages

1. Process window: material pair, coating, weld mode, target quality.
2. Hardware: laser, optics, welding head, push-pull head, brazing wire family, motion.
3. DOE and defect loop: power, speed, defocus, gap, wire speed, angle, preheat, shielding, clamp force.
4. Solution: BOM, layout, fieldbus, fixture, vision, safety, integration.
5. Delivery: assumptions, missing inputs, risk level, validation plan, acceptance criteria.

## Task Structure

Each task in the plan must be small enough to execute and verify independently:

- Task name
- Inputs
- Structured tool or fallback reference
- Steps
- Expected output
- Acceptance criteria
- Stop condition
- DOE or trial weld gate

## Required Content Per Task

Each task includes:

- Inputs that are already known
- Inputs that remain assumed
- Expected MCP tool or fallback reference
- Expected output format
- Acceptance criteria
- DOE or trial weld gate
- Verification action

## Stop Conditions

Stop planning and return to brainstorm when:

- `material`, `thicknessMm`, or `weldingMethod` is missing.
- The requested scope includes prohibited work.
- The user expects production release without validation evidence.
- The requested output mixes unrelated projects that need separate plans.

Stop before execution when:

- A stage lacks acceptance criteria.
- Numeric process recommendations have no allowed source.
- Push-pull brazing lacks wire-feed head or brazing wire family requirements.
- Automation planning lacks takt, station, fixture, or safety assumptions.

## Plan Self-Review

Before handing off to `laser-welding-execute-plan`, review the plan:

1. Coverage: every user requirement maps to a task.
2. Placeholder scan: no deferred-work notes or vague handoffs remain.
3. Input consistency: material, thickness, welding method, scenario, and quality targets are named consistently.
4. Gate consistency: every stage has a stop condition and acceptance criteria.
5. Validation consistency: DOE and trial weld evidence are required before readiness claims.

Fix issues in the plan before handoff.

## Anti-Patterns

- No DOE gate.
- No assumption validation.
- Brazing plan without filler family and wire-feed head.
- Automation plan without takt, station, fixture, and safety assumptions.
- Tool list without expected output and acceptance criteria.
- Plan that starts execution while required inputs are missing.

## Output Template

- Plan summary
- Known inputs
- Missing recommended inputs and assumptions
- Risk level
- Task list with stages, tools/references, expected outputs, acceptance criteria, stop conditions, and gates
- Handoff note for `laser-welding-execute-plan`

## Handoff To Execute Plan

Hand off to `laser-welding-execute-plan` only after the self-review passes. Include the plan text, current assumptions, and any stage that must stop if evidence is missing.
