---
name: laser-welding-write-plan
description: >-
  Write an implementation or execution plan for a laser welding project after
  intake: process window, hardware, push-pull head, wire family, DOE, BOM,
  layout, fieldbus, and delivery verification.
---

# Laser Welding — Write Plan

Produce an ordered plan. Do not call MCP tools during planning.

## Plan Stages

1. Process window: material pair, coating, weld mode, target quality.
2. Hardware: laser, optics, welding head, push-pull head, brazing wire family, motion.
3. DOE and defect loop: power, speed, defocus, gap, wire speed, angle, preheat, shielding, clamp force.
4. Solution: BOM, layout, fieldbus, fixture, vision, safety, integration.
5. Delivery: assumptions, missing inputs, risk level, validation plan, acceptance criteria.

## Each Task Includes

- Inputs
- Expected MCP tool or fallback reference
- Expected output
- Acceptance criteria
- DOE or trial weld gate

## Anti-Patterns

- No DOE gate.
- No assumption validation.
- Brazing plan without filler family and wire-feed head.
- Automation plan without takt, station, and safety.

Hand off to `laser-welding-execute-plan`.
