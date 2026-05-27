# Laser Welding Skills (Official)

Industrial laser welding decision support for automation and process engineers: material assessment, hardware selection, DOE, defect diagnosis, motion programs, fieldbus mapping, and turnkey solution BOM.

Integrates with **Claude Code**, **Cursor**, **Codex**, **OpenCode**, and **MCP** clients.

## Skill roles and differences

This repository provides one router skill and four stage skills. They are complementary and should be used in sequence instead of replacing each other.

| Skill | Primary role | When to use | Output focus | How it differs |
|------|------|------|------|------|
| `laser-welding` | Workflow router | New request or mixed-scope request | Stage routing + final professional delivery path | This is the coordinator. It decides whether to run brainstorm, planning, execution, or verification next. |
| `laser-welding-brainstorm` | Intake and gating | Inputs are incomplete or ambiguous | Readiness level, missing inputs, assumptions, risks, next question/action | It does not produce a full solution when required inputs are missing (`material`, `thicknessMm`, `weldingMethod`). |
| `laser-welding-write-plan` | Execution planning | Required inputs exist, but no implementation steps yet | Staged plan with tasks, acceptance criteria, stop conditions, and DOE gates | It writes the plan only; it does not execute numeric process or hardware calculations. |
| `laser-welding-execute-plan` | Plan execution | A written plan already exists | Process/hardware/DOE/BOM solution report mapped to template sections | It executes the plan with traceable evidence and stops when evidence or inputs are insufficient. |
| `laser-welding-verify` | Delivery gate | Before any readiness/completion claim | Verification result, evidence grade, confidence, and blockers | It is a hard gate. No completion/readiness claim is valid without this step. |

### Fast distinction

- `brainstorm` answers: "Do we have enough information to start?"
- `write-plan` answers: "What exact staged tasks and gates will we run?"
- `execute-plan` answers: "What is the concrete engineering recommendation now?"
- `verify` answers: "Is the current recommendation truly deliverable and compliant?"
- `laser-welding` answers: "Which of the above should happen next, and in what order?"

## Features

### Stage 1 — Material & process window

- Metals: aluminum 6061, stainless 304, copper; polymer: PP
- Properties: melting point, reflectivity, thermal conductivity
- Heuristic window: power P, speed v, defocus, shield gas type and flow

### Stage 2 — Hardware & optics

- Laser selection: IPG / Raycus power and wavelength (1064 / 515 nm)
- High-reflectivity: green/blue, wobble, Bessel/annular guidance
- Optics: spot size estimate, wobble amplitude and frequency

### Stage 3 — Validation & troubleshooting

- DOE: power–speed matrix with line energy J/mm
- Defects: blowout, lack of fusion, porosity, cracking → quantitative tuning

### Stage 4 — Automation & BOM

- Trajectory: G-code / motion snippets
- Fieldbus: OPC UA, PROFINET, EtherCAT status/control word templates
- Solution BOM: component list (laser, motion, head, cooling, gas, safety, integration) + line layout

## Installation

### Claude Code

Use this repository as a Claude Code plugin directory. Plugin metadata lives at `.claude-plugin/plugin.json`.

See [references/claude-code.md](references/claude-code.md).

### Cursor

Use `.cursor-plugin/plugin.json` and link to `~/.cursor/plugins/local/`.

See [references/codex-tools.md](references/codex-tools.md) for Cursor/Codex MCP setup and tool mapping.

### Codex

Use `.codex-plugin/plugin.json` and `.codex/config.toml`.

See [references/codex-tools.md](references/codex-tools.md) for setup and tool mapping.

### OpenCode

Use `.opencode/plugins/laser-welding.js`.

See root `.opencode/INSTALL.md`.

### MCP only

Add to `.cursor/mcp.json` or host MCP config:

```json
{
  "mcpServers": {
    "lasernexus": {
      "command": "npx",
      "args": ["-y", "@ethermeta/lasernexus", "mcp"]
    }
  }
}
```

### Build from source

From the repository root:

```bash
npm install && npm run build
```

## Quick start

Choose one of the two onboarding paths below.

### Path A: use skills workflow (recommended for end-to-end projects)

1. Start with `laser-welding` and provide at least:
   - `material`
   - `thicknessMm`
   - `weldingMethod`
2. If required inputs are missing, run `laser-welding-brainstorm` to close the highest-impact gap first.
3. Once required inputs are complete, run `laser-welding-write-plan` to produce staged tasks, gates, and acceptance criteria.
4. Run `laser-welding-execute-plan` to generate the solution report (process, hardware, DOE, BOM, risks, validation).
5. Run `laser-welding-verify` before any completion or readiness claim.

Example request (chat-style):

```text
Material: copper
Thickness: 1.0 mm
Welding method: lap
Scenario: battery-tab
Targets: conductivity and low spatter
Please provide process parameters, equipment recommendation, DOE plan, and BOM.
```

### Path B: use MCP tools directly (recommended for modular integration)

With MCP connected, call **`material_assess`** first:

```json
{
  "material": "copper",
  "thicknessMm": 1,
  "applicationScenario": "battery-tab",
  "jointType": "lap"
}
```

Then continue with the typical tool chain:

1. `hardware_recommend` for laser/head/motion candidates
2. `doe_matrix` for validation ranges and line-energy coverage
3. `defect_diagnose` when symptom-driven tuning is needed
4. `solution_bom` for line items and layout
5. Optional: `trajectory_generate` and `fieldbus_map` for automation details
6. Optional all-in-one: `process_recommend` for integrated output

## Usage examples

**Agent chat prompts (Cursor slash / `@`):** see [examples/README.md](../../examples/README.md) — workflow and scenario prompts in English and Chinese.

### Example 1 — 1 mm copper battery tab (selection)

**`material_assess`**

```json
{
  "material": "copper",
  "thicknessMm": 1,
  "applicationScenario": "battery-tab",
  "jointType": "lap"
}
```

**Sample output (abbreviated)**

```json
{
  "materialId": "copper",
  "thicknessMm": 1,
  "powerW": 945,
  "speedMmPerS": 3,
  "lineEnergyJPerMm": 315,
  "defocusMm": -0.5,
  "shieldGasLpm": 20,
  "gasType": "Ar",
  "recommendedWavelengthNm": [515, 450],
  "confidence": "heuristic",
  "warnings": ["High reflectivity at 1064nm...", "Battery tab: verify polarity..."]
}
```

**`hardware_recommend`**

```json
{
  "material": "copper",
  "thicknessMm": 1,
  "application": "battery-tab"
}
```

**Sample output (abbreviated)**

```json
{
  "wavelengthNm": 515,
  "beamDelivery": "wobble",
  "recommendedBrands": [
    { "brand": "IPG", "modelSeries": "YLPN", "powerRangeKW": [0.5, 3] }
  ],
  "optics": {
    "wobble": { "amplitudeMm": 0.48, "frequencyHz": 400 }
  }
}
```

### Example 2 — Turnkey solution BOM

**`solution_bom`**

```json
{
  "material": "copper",
  "thicknessMm": 1.2,
  "application": "laser-brazing-push-pull",
  "motionPlatform": "gantry"
}
```

Returns `lineItems` (component id, category, qty, OEM hints) and `lineLayout` (workflow + stations for turnkey lines).

Conceptual motion architecture candidates in solution planning:

- Gantry station (direct enum input: `gantry`)
- Single-axis rotary plus linear axes (direct enum input: `single-axis`)
- Scanner-dominant station for fast short seams (direct enum input: `galvo-scanner`)
- Robot-centric cell for complex 3D posture control (map to a supported enum by station abstraction)
- Robot plus positioner for large or multi-angle workpieces (map to a supported enum by station abstraction)

For direct MCP calls, pass only accepted `motionPlatform` enum values.

## Configuration

[`config/laser-welding.default.json`](config/laser-welding.default.json):

| Field | Default | Description |
|-------|---------|-------------|
| `preGasMs` | 200 | Gas on before emission (ms) |
| `postGasMs` | 500 | Gas after emission off (ms) |
| `defaultShieldGasLpm` | 18 | Typical flow setpoint |
| `defaultFieldbusProtocol` | opc-ua | Default for `fieldbus_map` |
| `profiles.battery-tab` | — | Tab welding profile overrides |

## MCP tools

| Tool | Description |
|------|-------------|
| `material_assess` | Process window |
| `process_recommend` | End-to-end integrated recommendation |
| `hardware_recommend` | Laser & optics |
| `doe_matrix` | DOE grid |
| `defect_diagnose` | Defect actions |
| `trajectory_generate` | G-code |
| `fieldbus_map` | Protocol mapping |
| `solution_bom` | Turnkey component BOM + line layout |

## Disclaimer

Heuristic outputs only. Validate with DOE, trial welds, and equipment manufacturer documentation. Brand names are illustrative, not endorsements.

## License

AGPL-3.0-or-later (see repository root).
