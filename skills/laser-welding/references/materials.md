# Materials reference (fallback)

| ID | Category | T (透光率) | Weld mode | Notes |
|----|----------|------------|-----------|-------|
| aluminum-6061 | metal | — | — | Green/blue or wobble for thin sheet |
| stainless-304 | metal | — | — | Fiber 1064 nm, N₂ common |
| copper | metal | — | — | Battery tab: 515 nm / ring beam |
| copper-ofc | metal | — | — | 紫铜 OFC, precision weld |
| pp | polymer | 0.15 | absorption | Polypropylene |
| pa6 / pa66 | engineering-polymer | ~0.1 | absorption | Nylon |
| abs | engineering-polymer | ~0.08 | absorption | ABS housings |
| pc | engineering-polymer | 0.1–0.9 | hybrid/transmission | Override T via `lightTransmittance` |
| pmma | engineering-polymer | ~0.88 | transmission | 2μm typical |

Use MCP `material_assess` with optional `lightTransmittance`, `wireFill`, `gapMm` when available.
# Presales Material Notes

- Capture material pairs explicitly, even when both sides are the same.
- Coatings, plating, oxide, oil, and cleaning state can dominate process risk.
- Dissimilar materials require compatibility warnings and customer acceptance tests.
- Brazing/filler requests require a wire material family and trial weld validation.
