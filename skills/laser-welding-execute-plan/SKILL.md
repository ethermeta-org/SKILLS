---
name: laser-welding-execute-plan
description: >-
  Execute a laser welding plan with internal structured tooling and references,
  preserving traceability from assumptions and inputs to process, hardware,
  DOE, BOM, and validation outputs.
---

# Laser Welding — Execute Plan

## Overview

Use this when a written laser welding execution plan exists. This skill reviews the plan, executes stages in order, keeps outputs traceable, and stops when evidence or inputs are insufficient.

Execution is not improvisation. If the plan is incomplete, contradictory, or missing required inputs, stop and return to the earlier stage instead of guessing.

## Execution Rules

- Review the plan before executing any task.
- Use available structured tools internally for numeric process, hardware, DOE, fieldbus, and BOM outputs; do not ask the user whether tools are available.
- For welding/process answers, final answers must not mention tool availability, tool calls, MCP, fallback mode, or internal orchestration. Mention tooling only when the user explicitly asks about integration or setup.
- Return to brainstorm if required inputs are missing.
- Return to write-plan if the execution sequence, scope, or acceptance criteria are incomplete.
- Keep every output traceable to structured output, catalog reference, reference document, or explicit assumption.
- Do not overstate heuristic outputs.
- DOE and defect diagnosis may run independently only when inputs are complete.

## The Process

### Step 1: Load And Review Plan

Read the plan fully. Identify required inputs, assumptions, stages, expected tools or references, expected outputs, acceptance criteria, and stop conditions.

If the plan has critical gaps, raise them before executing.

### Step 2: Execute Each Stage In Order

For each stage:

1. Confirm stage inputs.
2. Use the planned structured tool or reference source.
3. Record output in professional engineering language.
4. Mark assumptions and confidence limits.
5. Check the stage acceptance criteria.
6. Stop if the stage gate fails.

### Step 3: Assemble Delivery

Combine process, hardware, DOE, BOM, risks, validation, and acceptance into a coherent recommendation. Keep internal orchestration out of the final user-facing answer.

### Step 4: Hand Off To Verification

Invoke `laser-welding-verify` before claiming the result is complete, ready, sufficient, or deliverable.

## Tool Order

1. `process_recommend` for full recommendations from material, thickness, and welding method
2. `material_assess` when focused process-window detail is needed
3. `hardware_recommend`
4. `doe_matrix` and `defect_diagnose` as needed
5. `solution_bom`
6. `trajectory_generate` and `fieldbus_map` when automation details are in scope

## Structured Tooling Unavailable

If structured tooling is unavailable, use `skills/laser-welding/references/*.md` internally. Give process numbers only from user-provided values, structured/catalog data, or documented reference ranges, with assumptions labeled.

Give DOE numeric ranges only from user-provided, structured, catalog, or documented range bounds. Otherwise provide qualitative DOE axes and ask for the missing range inputs.

Do not expose the fallback mechanism in the final answer.

## When To Stop And Ask For Help

Stop immediately when:

- A required input is missing.
- A plan instruction is unclear or contradictory.
- A planned stage lacks acceptance criteria.
- Numeric values cannot be traced to user input, structured output, catalog data, or reference ranges.
- Structured output conflicts with a user constraint.
- Verification fails repeatedly.
- The request crosses into pricing, quotation, simulation, finite element analysis, certified filler approval, or production release.

Ask for clarification rather than inventing a missing requirement.

## When To Revisit Earlier Steps

Return to plan review when the user updates the plan or changes delivery scope.

Return to brainstorm when material, thickness, welding method, application scenario, or quality target changes.

Return to write-plan when stage order, tool choice, acceptance criteria, or validation gates must change.

Return to the current stage when only a tool/reference output needs to be regenerated with corrected inputs.

## Output Contract

The executed recommendation should include:

- Process starting point and assumptions
- Equipment selection and rationale
- DOE range or qualitative DOE axes
- BOM and line configuration when in scope
- Risks and missing inputs
- Validation plan and acceptance criteria
- Explicit reminder that numeric values are heuristic and require DOE/trial weld validation

## Handoff To Verify

Finish every execution by applying `laser-welding-verify`. Do not claim completion, readiness, or sufficiency until the verification gate passes.
