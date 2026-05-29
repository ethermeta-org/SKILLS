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

# Parameter System Taxonomy

When explaining or structuring a process window, group parameters by function instead of listing only power/speed/focus:

1. Laser energy: power, peak power, average power, pulse width, pulse frequency, duty cycle, and power waveform.
2. Optics and focus: focus position, defocus amount and sign, spot diameter, focal length, field lens focus, and beam quality.
3. Welding motion: weld speed, positioning speed, acceleration, start delay, end delay, dwell time, and overlap.
4. Scan and wobble: wobble mode, wobble frequency, wobble amplitude, scan width, X/Y offset, scale factor, rotation angle, field correction, and scan delay.
5. Shielding gas: gas type, flow, nozzle distance and angle when a shielding nozzle exists, pre-gas, and post-gas. For galvo/field-lens scanner layouts, do not force nozzle distance/angle fields.
6. Cooling and auxiliary: cooling water temperature, flow, pressure, preheat power, preheat time, and wire retraction where relevant.
7. Monitoring, safety, and recipe: vision positioning, seam tracking, power feedback, temperature monitoring, spot monitoring, reflected-light monitoring, interlocks, alarms, permissions, and recipe management.

Do not imply all parameters are equally adjustable. Separate primary tuning variables from auxiliary stability variables and locked production recipe variables.

# Tuning Order

Use this sequence unless user evidence shows a different validated plant procedure:

1. Confirm weld target, material pair, thickness, joint form, gap, fixture, and acceptance criteria.
2. Establish baseline power, speed, focus/defocus, and spot size.
3. Set shielding gas and cooling before interpreting bead color, porosity, or heat accumulation.
4. Tune wobble/scan and motion offsets only after position and base energy are stable.
5. Observe weld depth, width, spatter, oxidation, deformation, temperature, reflected light, and monitor alarms.
6. Change one key variable at a time, then lock the validated recipe and define edit permissions.

# Parameter Change Effects

Use these qualitative effects when explaining trade-offs. Keep numeric changes tied to structured output, user input, or DOE ranges.

| Parameter | Increase | Decrease |
| --- | --- | --- |
| Laser power | More penetration; higher burn-through risk | Less penetration; higher lack-of-fusion risk |
| Welding speed | Lower heat input; narrower bead | Higher heat input; more deformation/overheat risk |
| Defocus amount | Lower energy density when spreading spot | Higher energy concentration when moving toward focus |
| Wobble width | Wider bead; possible lower penetration | Smaller coverage; better concentration |
| Gas flow | Stronger shielding; too much may disturb pool | Oxidation and porosity risk increase |
| Pulse frequency | Better spot continuity; heat accumulation may rise | Larger spot spacing; continuity can drop |
| X/Y offset | More visible path correction | More accurate centerline when corrected toward seam |
| Cooling flow | More heat removal and equipment stability | Temperature rise and alarm risk increase |

# Push-Pull Brazing DOE Axes

For push-pull brazing, validate power, speed, defocus, gap, wire speed, wire angle, preheat power, shielding gas, and clamp force. These are DOE starting points only, not production release settings.

For general laser welding DOE, include additional axes when the project scope or equipment supports them: pulse frequency, pulse width, duty cycle, wobble amplitude, wobble frequency, scan width, nozzle distance/angle only for nozzle-based shielding, cooling water temperature, cooling flow, and cooling pressure.

# Polymer Transmission: Material-Based Transmittance Estimation

When polymer transmission welding is in scope and measured transmittance is not provided:

1. Derive an initial transmittance estimate from material family reference values.
2. Adjust confidence using part-specific factors: color, fillers, additives, thickness, and surface condition.
3. State assumed wavelength basis when mapping feasibility.
4. Provide feasibility output in three levels:
   - likely feasible,
   - conditionally feasible with elevated validation risk,
   - not feasible until optical data is confirmed.
5. Record uncertainty source and validation action (coupon test or optical measurement).

Do not claim production feasibility from estimated transmittance alone.

## Parameter Coverage Checklist

Use this checklist before claiming that a process recommendation is complete.

### 1) Process Parameters

- Laser power window source available
- Welding speed baseline available
- Defocus strategy defined (including sign convention)
- Shielding gas type and flow assumption stated
- Gap and fit-up assumption stated
- Clamp force or fixture pressure assumption stated
- Preheat need and method stated when relevant
- Material-specific constraints called out (reflectivity, conductivity, coating)

### 2) Takt And Capacity Parameters

- Seam length per part (`seamLengthMm`) or equivalent weld time basis
- Takt breakdown available: load, align, weld, inspect, unload
- OEE/availability assumption visible
- Station count and balancing assumption visible
- Bottleneck step identified
- Capacity formula trace visible (even if qualitative)

### 3) Equipment Selection Parameters

- Laser source class and candidate wavelength defined
- Candidate power band and headroom rationale defined
- Beam mode strategy defined (single spot, wobble, ring, scanner)
- Welding head and optics assumptions defined
- Wire-feed head assumptions defined when brazing applies
- Motion platform assumptions defined (gantry/cartesian, single-axis rotary plus linear axes, industrial robot, collaborative robot, robot plus positioner)
- Cooling and utility assumptions defined
- Vision and inspection architecture assumptions defined

## Motion Architecture Heuristic Selection

When the user has not finalized a motion architecture, keep multiple candidates instead of forcing a single default:

1. Prioritize gantry or Cartesian axes for long straight seams and highest repeatability on planar fixtures.
2. Prioritize single-axis rotary plus linear axes for circumferential seams, shafts, and ring geometries.
3. Prioritize industrial six-axis robots for 3D spatial seams, rich orientation control, and frequent product geometry changes.
4. Prioritize collaborative robots for medium or low takt flexible cells where guarded human interaction is required.
5. For large complex parts, consider industrial robot plus positioner to improve torch access and reduce singularity risk.

Always treat this as a heuristic preselection and require trajectory accuracy and safety validation before final release.

## Unified Output Rule For Missing Numbers

When exact numeric values are not traceable to user input, structured output, catalog data, or documented bounds:

1. Provide qualitative range direction only (lower/middle/higher tendency).
2. List DOE sampling axes explicitly.
3. State missing fields blocking numeric precision.
4. Add validation warning: values are heuristic and require DOE/trial weld.

Do not fabricate numeric setpoints.

For polymer transmission feasibility, if exact transmittance cannot be confirmed, report a range and a confidence label instead of a single-point value.
