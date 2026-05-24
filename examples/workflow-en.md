# Workflow Prompt Examples (English)

Copy each block into **Cursor Agent** chat. Type the slash command first, then paste the prompt on the next line.

Install and invoke skills: [skills/laser-welding/references/cursor.md](../skills/laser-welding/references/cursor.md).

---

## Step 1 — Requirements intake

**Invoke:** `/laser-welding-brainstorm` (or `@` → pick `laser-welding-brainstorm`)

**Prompt:**

> New laser welding project for a battery module line.
> Base materials: 1 mm copper tab to 0.8 mm nickel-plated steel busbar.
> Joint: lap, seam length about 12 mm per cell.
> Quality targets: low spatter, electrical resistance within customer spec, no burn-through.
> Delivery scope: process window, laser/head recommendation, and preliminary BOM for a single-station prototype.
> Missing: target takt, fixture design, inspection method, and preferred OEM brands.
> Please run readiness gating and list assumptions, missing inputs, and risk level.

**Expected:**

- Agent loads brainstorm checklist (application scenario, materials, joint, quality, delivery scope).
- Asks **one** missing required question at a time if inputs are incomplete.
- Assigns readiness level (L0–L3); does not produce a full turnkey solution at L0/L1.
- Lists assumptions and missing inputs explicitly.
- No pricing, quotation, simulation, or production-release claims.

---

## Step 2 — Write execution plan

**Invoke:** `/laser-welding-write-plan`

**Prompt:**

> Based on the intake above (1 mm copper tab, nickel busbar, lap joint, battery module line):
> Write a staged execution plan covering process window, hardware, DOE, BOM/layout, fieldbus, and delivery verification.
> Each task must include inputs, expected assessment content, expected output, acceptance criteria, and a DOE/trial weld gate.
> Do not output unverified final process numbers during planning.

**Expected:**

- Five plan stages: process → hardware → DOE/defects → solution (BOM/layout/fieldbus) → delivery.
- Each task names the process, equipment, DOE, BOM, risk, and validation items to assess.
- Includes DOE gate and brazing/wire-feed details only if brazing is in scope.
- Hands off to `laser-welding-execute-plan`; no numeric outputs invented without labeling as plan placeholders.

---

## Step 3 — Execute plan

**Invoke:** `/laser-welding-execute-plan`

**Prompt:**

> Execute the plan for the copper battery tab project.
> Material: copper, 1 mm; joint: battery-tab lap; application: battery module welding.
> Provide recommended process parameters, equipment selection, DOE range, BOM configuration, risks, and validation guidance.
> Keep all numeric values heuristic and traceable to explicit assumptions or validation logic.

**Expected:**

- Outputs include units (W, mm/s, J/mm, L/min).
- Outputs equipment selection, DOE range, BOM configuration, assumptions, missing inputs, risk level, and validation plan.
- Does not expose internal tool orchestration in the conclusion.
- Ends with pointer to `laser-welding-verify`; no pricing or FEA.

---

## Step 4 — Verify deliverables

**Invoke:** `/laser-welding-verify`

**Prompt:**

> Verify the deliverables from the copper battery tab execution above before we send them to the customer.
> Check units, heuristic disclaimers, DOE/trial weld reminders, assumptions, missing inputs, risk level, BOM completeness, and out-of-scope guardrails.

**Expected:**

- Runs verify checklist (units, disclaimer, DOE reminder, no pricing/simulation/FEA).
- Lists assumptions, missing inputs, validation plan, acceptance criteria.
- Stop conditions flagged if required inputs were missing or production-ready claims appear without DOE evidence.
- Brand names treated as non-endorsed candidates.

---

## Full workflow shortcut

**Invoke:** `/laser-welding`

**Prompt:**

> End-to-end presales support: 1 mm copper battery tab to nickel busbar, lap joint, low spatter target.
> Walk through brainstorm → plan → execute → verify, and present only professional conclusions.

**Expected:**

- Agent follows decision tree in main `laser-welding` skill.
- Stages skills in order or equivalent workflow inline.
- Final package passes verify stop conditions.
