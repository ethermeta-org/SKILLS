# Laser Welding Skills (Official)

Industrial laser welding decision support for automation and process engineers: material assessment, hardware selection, DOE, defect diagnosis, motion programs, fieldbus mapping, and turnkey solution BOM.

Integrates with **Claude Code**, **Codex**, **OpenCode**, and **MCP** clients.

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

### Codex

Use `.codex-plugin/plugin.json` and `.codex/config.toml`.

See root `.codex/INSTALL.md` and [references/codex-tools.md](references/codex-tools.md).

### OpenCode

Use `.opencode/plugins/laser-welding.js`.

See root `.opencode/INSTALL.md`.

### MCP only (Cursor, etc.)

Add to `.cursor/mcp.json` or host MCP config:

```json
{
  "mcpServers": {
    "lasernexus": {
      "command": "npx",
      "args": ["-y", "@ethermeta/lasernexus", "--stdio"]
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

With MCP connected, call **`material_assess`**:

```json
{
  "material": "copper",
  "thicknessMm": 1,
  "jointType": "battery-tab"
}
```

## Usage examples

### Example 1 — 1 mm copper battery tab (selection)

**`material_assess`**

```json
{
  "material": "copper",
  "thicknessMm": 1,
  "jointType": "battery-tab"
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
