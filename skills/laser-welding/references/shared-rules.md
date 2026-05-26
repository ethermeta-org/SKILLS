# Shared Language And Artifact Rules

These rules are shared by:

- `laser-welding`
- `laser-welding-brainstorm`
- `laser-welding-write-plan`
- `laser-welding-execute-plan`
- `laser-welding-verify`

## Language Rules (Chinese First)

- Default output language is Simplified Chinese unless the user requests otherwise.
- At first mention of a specialist term, use `中文术语（English/缩写）` format.
- Every numeric statement must include a unit.
- Prefer concise Chinese explanations for mixed audiences (process, equipment, management).
- Avoid long English-only paragraphs in normal delivery.

## Generated Artifact Rules (Aligned With Superpowers)

- Store generated artifacts under `docs/laser-welding/artifacts/` at repository root.
- Use filename pattern `YYYY-MM-DD-<topic>-<artifact-type>.md`.
- Keep `<topic>` and `<artifact-type>` in lowercase kebab-case.
- Supported `<artifact-type>` values:
  - `brainstorm`
  - `plan`
  - `solution-report`
  - `verification`

Examples:

- `docs/laser-welding/artifacts/2026-05-26-battery-tab-brainstorm.md`
- `docs/laser-welding/artifacts/2026-05-26-battery-tab-plan.md`
- `docs/laser-welding/artifacts/2026-05-26-battery-tab-solution-report.md`
- `docs/laser-welding/artifacts/2026-05-26-battery-tab-verification.md`
