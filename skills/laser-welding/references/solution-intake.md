# Laser Welding Solution Intake

Use this table to gather presales-grade requirements.

| Level | Field | Notes |
| --- | --- | --- |
| Required | applicationScenario | metal-fusion, laser-brazing, push-pull-brazing, polymer-transmission, battery-tab, busbar, seal-welding, custom |
| Required | baseMaterialA / baseMaterialB | Use same value for same-material joints |
| Required | thicknessA / thicknessB | mm |
| Required | jointType | lap, butt, fillet, T-joint, edge, seal, circular |
| Required | seamType / seamLengthMm | line, circle, rectangle, custom path |
| Required | qualityTargets | strength, sealing, conductivity, appearance, low-spatter, low-heat-input |
| Required | deliveryScope | process-package, equipment-package, presales-solution |
| Recommended | coating / surfaceCondition | plating, oxide, oil, cleaning state |
| Recommended | targetTaktSec / stationCount | Drives automation and layout assumptions |
| Recommended | inspectionMethods | vision, cross-section, leak, resistance, pull/shear |
| Recommended | fieldbus / PLC / MES | OPC UA, PROFINET, EtherCAT, PLC preference |
| Recommended | push-pull fields | feed mode, orientation, angle, nozzle offset, wire speed, preheat, seam tracking |

For missing required fields, ask one question at a time before producing a complete solution. For missing recommended fields, state assumptions and risk.
