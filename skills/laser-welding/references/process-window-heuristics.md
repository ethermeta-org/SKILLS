# Process window heuristics (fallback)

When MCP `material_assess` is unavailable:

1. Look up material in [materials.md](materials.md).
2. Target line energy: `E_target = E₀ × f_mat × t^0.7` (J/mm), with E₀ and f_mat from material table.
3. Choose speed v (mm/s): polymers ~8; metals ~3 (adjust per joint).
4. Power P = E_target × v (W).
5. If reflectivity @1064 nm > 0.85: multiply P by ≥1.35; recommend 515/450 nm.
6. Defocus: thin metal (<1.5 mm) often −0.5 mm; else 0 mm.
7. Gas: stainless → N₂; copper/aluminum → Ar; document in output.

Mark result `confidence: heuristic` and `source: fallback-doc`.
# Push-Pull Brazing DOE Axes

For push-pull brazing, validate power, speed, defocus, gap, wire speed, wire angle, preheat power, shielding gas, and clamp force. These are DOE starting points only, not production release settings.
