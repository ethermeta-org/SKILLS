# SKILLS Operations Manual (Business-Oriented Quick Start, English)

Audience:

- Line builder project managers (need process detail and supplier-facing specs)
- End customers (need to decide whether laser welding should be introduced to a new line)

Goals:

- Start with minimal inputs and still get actionable guidance
- Produce two business-ready outputs: `Decision Pack` and `Vendor RFQ Pack`
- Handle incomplete early data with explicit assumptions, risks, and closure actions

---

## 1. What You Get

1. `Decision Pack` (management decision view)
- Conclusion: `GO / CONDITIONAL GO / NO-GO`
- Key basis: evidence level (E1/E2/E3) and confidence (High/Medium/Low)
- Blockers, closure path, and target dates

2. `Vendor RFQ Pack` (supplier-facing technical package)
- Process parameter ranges (with units, bounds, convergence triggers)
- Equipment and technical indicators (laser/head/motion/inspection/safety/fieldbus)
- Acceptance method, DOE/trial requirements, and supplier submission checklist

---

## 2. 30-Second Quick Start (Both Platforms)

### 2.1 Cursor Agent

1. In chat, invoke: `/laser-welding-brainstorm`
2. Paste the minimum-input prompt (see Section 6)
3. Continue in order: `/laser-welding-write-plan` -> `/laser-welding-execute-plan` -> `/laser-welding-verify`

### 2.2 Codex / Open Skills

1. One-time skill install:
```bash
npx skills add <org>/SKILLS --skill laser-welding -g -y
```
2. In your first chat message, state: `Use skill: laser-welding-brainstorm`
3. Continue by stage: `write-plan` -> `execute-plan` -> `verify`

Note: if your client supports slash commands, you can also use `/laser-welding-*` directly.

---

## 3. Business Scenario A: Line Builder PM Selecting Suppliers

Business objective:

- Build a technical package that can be sent to suppliers quickly
- Avoid mis-selection when early-stage parameters are incomplete

Minimum required fields (Tier A):

- `material`
- `thicknessMm`
- `weldingMethod` (lap / butt / fillet / seal / etc.)

Execution path:

1. `brainstorm`: readiness gate, missing inputs, assumptions, risks  
2. `write-plan`: dual deliverables (Decision Pack + RFQ Pack)  
3. `execute-plan`: parameters, equipment, DOE, BOM, interface constraints  
4. `verify`: unit checks, evidence checks, scope guardrails, acceptance closure

What PMs should focus on:

- Technical indicators: power/speed ranges, defocus direction and window, shielding gas and flow, clamp force
- Equipment constraints: repeatability, path capability, safety interlock, PLC/fieldbus, plant utilities
- Delivery constraints: supplier evidence package, acceptance method, risk closure plan

---

## 4. Business Scenario B: End Customer Evaluating New-Line Adoption

Business objective:

- Make a feasibility decision before committing to procurement or pilot launch

Recommended flow:

1. Run `brainstorm` first to get `Readiness Level (L0-L3)`  
2. At L0/L1: close critical missing inputs before seeking a full solution  
3. At L2/L3: run `plan` and `execute`, then finalize with `verify`

Decision-level focus:

- Whether `GO` criteria are met (critical decisions backed by E1/E2 evidence)
- If `CONDITIONAL GO`, who owns each blocker and by when
- Whether the report clearly states: parameters are DOE/trial starting points, not production-release settings

---

## 5. How To Work With Incomplete Inputs (Industrial Reality)

Rules:

1. If Tier A is missing: ask one required question at a time; do not force a full solution  
2. If Tier B/C is missing: an initial recommendation is still allowed, but must explicitly include  
- assumptions
- risks
- validation actions
- closure table (Owner / Method / DueDate / Impact)

Recommended closure table for project meetings:

| Missing Item | Owner | Method | Due Date | Impact If Missing |
| --- | --- | --- | --- | --- |
| target takt | production manager | takt breakdown review | 2026-06-05 | station config cannot be frozen |
| inspection thresholds | quality manager | quality spec alignment | 2026-06-07 | acceptance criteria remain undefined |

---

## 6. Copy-Paste Prompt Pack (English)

### 6.1 Minimum start (feasibility first)

```text
/laser-welding-brainstorm
New project: laser welding adoption assessment.
Materials: 1.0 mm copper to 0.8 mm nickel-plated steel; method: lap.
Targets: low spatter, stable conductivity, no burn-through.
Please run readiness gating and output: readiness, missing inputs, assumptions, risks, and next action.
```

### 6.2 Line builder PM (supplier package)

```text
/laser-welding-write-plan
Based on the project above, write a dual-deliverable plan:
1) Decision Pack (GO/CONDITIONAL GO/NO-GO)
2) Vendor RFQ Pack (technical indicators, interface constraints, acceptance methods, supplier submission checklist).
Each stage must include input, output, acceptance criteria, and stop condition.
```

### 6.3 End customer (adoption decision)

```text
/laser-welding-execute-plan
Execute the plan and provide process recommendations, equipment recommendations, DOE, risks, and validation.
Requirements: all numeric values must include units; provide temporary ranges and convergence triggers; include evidence level and confidence.
End with feasibility conclusion: GO / CONDITIONAL GO / NO-GO.
```

### 6.4 Final pre-delivery check

```text
/laser-welding-verify
Before sending to customer, run final verification:
check unit consistency, heuristic disclaimers, DOE/trial reminders, assumptions and risks, BOM completeness, and out-of-scope guardrails.
```

---

## 7. Common Mistakes and Fixes

1. Treating doc links as skill invocation
- Fix: explicitly invoke the skill (slash or `Use skill: ...`)

2. Requesting full solution without Tier A
- Fix: provide `material/thicknessMm/weldingMethod` first

3. Treating heuristic parameters as production settings
- Fix: run DOE and trial welds before freezing

4. Choosing by brand only
- Fix: evaluate evidence level, constraints fit, and acceptance capability first

5. Ignoring missing-input closure
- Fix: every missing item needs Owner, method, due date, and business impact

---

## 8. Recommended Reading Order

1. Router skill: [skills/laser-welding/SKILL.md](/Users/gubin/workspaces/SKILLS/skills/laser-welding/SKILL.md)  
2. Full flow samples: [examples/workflow-en.md](/Users/gubin/workspaces/SKILLS/examples/workflow-en.md)  
3. Scenario prompts: [examples/scenarios-en.md](/Users/gubin/workspaces/SKILLS/examples/scenarios-en.md)  
4. Report template: [skills/laser-welding/references/solution-report-template.md](/Users/gubin/workspaces/SKILLS/skills/laser-welding/references/solution-report-template.md)
