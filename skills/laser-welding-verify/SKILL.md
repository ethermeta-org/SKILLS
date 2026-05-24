---
name: laser-welding-verify
description: >-
  Verify laser welding deliverables before completion: heuristic disclaimers,
  units, assumptions, risks, DOE/trial weld evidence, push-pull head, brazing
  wire family, BOM completeness, and out-of-scope guardrails.
---

# Laser Welding — Verify

## Overview

Use this before any final answer that claims a laser welding recommendation is complete, ready for delivery, sufficient for planning, or safe to advance. Verification checks evidence, units, assumptions, risks, validation gates, BOM completeness, push-pull requirements, and out-of-scope guardrails.

The purpose is not to make the answer longer. The purpose is to prevent unsupported engineering claims.

## The Iron Law

```text
NO COMPLETION OR READINESS CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If verification has not checked the current answer, do not claim that the recommendation is complete, ready, sufficient, production-ready, or validated.

## The Gate Function

Before claiming any positive delivery status:

1. Identify what evidence proves the claim.
2. Check the current answer against the verification checklist.
3. Confirm that required inputs, assumptions, risks, validation, and acceptance are present.
4. Confirm that prohibited claims are absent.
5. If the check fails, state the actual limitation and return to the needed workflow stage.
6. If the check passes, provide the answer with the evidence and limitations visible.

Skipping any step invalidates the completion claim.

## Stop Conditions

- Complete solution produced while required inputs are missing.
- Pricing, quotation, cost estimation, simulation, or finite element analysis appears.
- Production-ready claim appears without DOE and trial weld evidence.
- Push-pull brazing lacks wire-feed head or brazing wire family.
- Numeric process values lack source, assumptions, or validation warning.
- BOM claim omits in-scope safety, cooling, inspection, fieldbus, or integration items.
- Brand names appear as endorsements rather than candidate examples.

## Verification Checklist

- [ ] Units consistent
- [ ] Heuristic disclaimer present
- [ ] DOE / trial weld reminder present
- [ ] No pricing / simulation / finite element analysis
- [ ] No direct production release promise
- [ ] Assumptions, missing inputs, and risk level listed
- [ ] Validation plan and acceptance criteria listed
- [ ] Push-pull head and brazing wire family covered when relevant
- [ ] BOM covers laser, head, motion, fixture, cooling, gas, safety, inspection, fieldbus, and integration when in scope
- [ ] Brand names are non-endorsed candidates
- [ ] Final answer does not expose internal tool calls or fallback mode unless the user asked about integration

## Common Failures

| Claim | Requires | Not Sufficient |
| --- | --- | --- |
| Recommendation is complete | Required inputs, assumptions, risks, validation, acceptance | Material and thickness only |
| Process window is usable | Heuristic source and DOE/trial reminder | A single number without validation |
| BOM is complete | In-scope laser, head, motion, fixture, cooling, gas, safety, inspection, fieldbus, integration | Laser and head only |
| Push-pull brazing is covered | Wire-feed head, geometry, brazing wire family, risks | Generic wire feeder wording |
| Ready for production | DOE and trial weld evidence supplied by the user | Initial recommendation or catalog heuristic |

## Evidence Requirements

- Process numbers must come from user-provided values, structured output, catalog data, or documented reference ranges.
- DOE ranges must come from structured output, catalog data, documented bounds, or user-provided bounds.
- BOM completeness is scoped to the user's stated delivery depth.
- Brand names must be presented as candidates only.
- Missing recommended inputs must be visible as assumptions, risks, or follow-up validation actions.

## Output Contract

If verification passes, final output may say the recommendation is ready for the stated planning or presales scope, with assumptions and validation limits visible.

If verification fails, do not polish over the gap. State the blocking issue and route back to `laser-welding-brainstorm`, `laser-welding-write-plan`, or `laser-welding-execute-plan`.

Align with Superpowers `verification-before-completion` when available.
