# Process window heuristics (fallback)

When structured process assessment output is unavailable:

1. Look up material family, reflectivity, absorption, coating, and joint notes in [materials.md](materials.md).
2. Use material family and reference notes for qualitative starting assumptions.
3. If no numeric catalog baseline is available, do not invent exact power values; provide conservative qualitative guidance, ask for the missing process inputs, or state that exact numeric windows require DOE/trial weld validation.
4. Choose relative speed guidance by material family and joint: polymers slower and transmission-limited; metals constrained by reflectivity, thickness, and fixture heat sinking.
5. For high-reflectivity materials at 1064 nm, consider green/blue wavelength options and state validation risk instead of forcing a numeric multiplier.
6. Defocus: thin metal (<1.5 mm) often starts near slight negative defocus; thicker or unstable joints start near focus and require DOE.
7. Gas: stainless -> N2; copper/aluminum -> Ar; document as an assumption.

Mark result `confidence: heuristic` internally and keep provenance out of user-facing answers unless the user explicitly asks.
# Push-Pull Brazing DOE Axes

For push-pull brazing, validate power, speed, defocus, gap, wire speed, wire angle, preheat power, shielding gas, and clamp force. These are DOE starting points only, not production release settings.
