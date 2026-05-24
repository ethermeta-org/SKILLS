# Scenario Prompt Examples (English)

Single-scenario prompts for validating individual skill capabilities. Use in **Cursor Agent** chat with the listed slash command.

---

## Simplified Full Recommendation: Lap Weld

**Invoke:** `/laser-welding`

**Prompt:**

> Material: copper, thickness: 1 mm, welding method: lap weld.
> Provide process parameters, equipment selection, DOE range, BOM configuration, risks, and validation guidance.

**Expected:**

- Uses material, thickness, and welding method as the core inputs without forcing expert-only fields as required inputs.
- Returns power, speed, defocus, shield gas, weld mode, penetration guidance, units, and assumptions.
- Returns laser/head/motion candidates, DOE range, BOM configuration, risks, and validation plan.
- Does not expose internal tool orchestration in customer-facing conclusions.

## Material assessment

**Invoke:** `/laser-welding-execute-plan` or `/laser-welding`

**Prompt:**

> Assess the initial process window for 1 mm copper battery tab welding.
> Joint type: battery-tab lap. No coating. Target: low spatter, no burn-through.
> Provide the recommended process window, risks, and validation guidance.

**Expected:**

- Returns power, speed, defocus, shield gas, wavelength guidance with units.
- Includes heuristic disclaimer and DOE/trial weld reminder.
- Does not require expert-only details from the user; missing items are listed as assumptions or inputs to confirm.

---

## Defect diagnosis

**Invoke:** `/laser-welding-execute-plan` or `/laser-welding`

**Prompt:**

> We see heavy spatter and occasional porosity on 1.2 mm stainless-304 butt welds.
> Current settings (approximate): 2 kW, 15 mm/s, -1 mm defocus, Ar 20 L/min.
> Diagnose defects and suggest parameter corrections, risks, and validation steps.

**Expected:**

- Returns actionable tuning (power, speed, defocus, gas, etc.) with rationale.
- Does not claim root cause is confirmed without DOE/trial weld evidence.
- Does not expose internal tool orchestration in the conclusion.

---

## Push-pull laser brazing

**Invoke:** `/laser-welding-brainstorm` then `/laser-welding-execute-plan`

**Prompt:**

> Push-pull wire-feed laser brazing for galvanized steel auto body panel, 1.0 mm + 1.0 mm lap.
> Need wire-feed head mode, feed orientation, nozzle offset, CuSi wire family guidance, preheat, and seam tracking risks.
> Application: laser-brazing-push-pull. Missing: exact wire diameter and takt.

**Expected:**

- Brainstorm covers wire-feed head, brazing wire family, feed geometry, validation risks.
- Execute phase returns hardware recommendation, BOM configuration, risks, and validation plan.
- Explicitly lists push-pull head and filler family; does not treat as generic wire feeding.
- Readiness gating if takt or wire diameter missing.

---

## Turnkey solution BOM

**Invoke:** `/laser-welding-execute-plan` or `/laser-welding`

**Prompt:**

> Turnkey line BOM for push-pull laser brazing: copper-stainless dissimilar joint, 1.2 mm, gantry motion platform.
> Application: laser-brazing-push-pull. Include line layout, assumptions, missing inputs, risk, and acceptance criteria.
> Provide professional BOM configuration and validation guidance.

**Expected:**

- Returns `lineItems` and `lineLayout` (or equivalent structured BOM).
- Lists assumptions, missing inputs, risk level, validation plan.
- No pricing or cost estimation.

---

## Fieldbus mapping

**Invoke:** `/laser-welding-execute-plan` or `/laser-welding`

**Prompt:**

> Map laser welding cell signals to PROFINET for a turnkey brazing line.
> Need status/control words: LaserReady, LaserOn, ShutterOpen, Fault, ProgramActive.
> Provide fieldbus mapping guidance; default to opc-ua only if protocol unspecified.

**Expected:**

- Returns signal mapping template aligned with welding cell semantics.
- Does not invent PLC cycle times or vendor-specific addresses without labeling as placeholders.
- Does not expose internal tool orchestration in the conclusion.
