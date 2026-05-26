# Laser Welding Solution Intake

Use this intake sheet to collect solution-level requirements for laser welding and brazing projects.

## Input Tiers

### Tier A: Required For Initial Recommendation

Do not produce a complete recommendation unless all fields below are known.

| Field | Notes |
| --- | --- |
| `material` | Primary material pair; include both sides for dissimilar joints |
| `thicknessMm` | Primary thickness in mm; for dissimilar joints also capture `thicknessBMm` |
| `weldingMethod` | lap, butt, fillet, T-joint, edge, seal, circular, brazing, or custom |

### Tier B: Required For Full Solution Delivery

A complete solution package must include these fields. If missing, continue with assumptions and mark elevated risk.

| Field | Notes |
| --- | --- |
| `applicationScenario` | metal-fusion, laser-brazing, push-pull-brazing, polymer-transmission, battery-tab, busbar, seal-welding, custom |
| `qualityTargets` | strength, sealing, conductivity, appearance, low-spatter, low-heat-input |
| `deliveryScope` | process-package, equipment-package, presales-solution |
| `targetTaktSec` | station takt target in seconds |
| `stationCount` | number of stations in scope |
| `inspectionMethods` | vision, cross-section, leak, resistance, pull/shear |

### Application Scenario Policy (Explicit First, Inference Fallback)

Use a mixed policy to determine scenario-specific rendering:

- If `applicationScenario` is provided, treat it as the authoritative explicit scenario.
- If `applicationScenario` is missing, infer scenario from material family + welding method.
- Policy statement: explicit first, inference fallback.

Section 3.1 rendering rule:

- If explicit `applicationScenario` is present:
  - Render section 3.1 only when `applicationScenario = polymer-transmission`.
  - For all other explicit `applicationScenario` values, do not render section 3.1.
- If `applicationScenario` is missing, use inference fallback from material family + welding method:
  - Inferred `polymer-transmission` => render section 3.1.
  - Any non-`polymer-transmission` inference => do not render section 3.1.
- Policy statement (canonical): explicit first / inference fallback.
- For rendered section 3.1, include:
  - transmittance basis (measured value or estimated range),
  - assumed wavelength basis,
  - confidence level with uncertainty source,
  - required validation action.

### Tier C: High-Confidence Recommended Inputs

These inputs materially improve process confidence, equipment fit, and risk quality.

| Field | Notes |
| --- | --- |
| `baseMaterialA` / `baseMaterialB` | Use same value for same-material joints |
| `thicknessAMm` / `thicknessBMm` | mm |
| `jointType` | lap, butt, fillet, T-joint, edge, seal, circular |
| `seamType` / `seamLengthMm` | line, circle, rectangle, custom path |
| `coating` / `surfaceCondition` | plating, oxide, oil, cleaning state |
| `fieldbus` / `plcType` / `mesNeed` | OPC UA, PROFINET, EtherCAT, PLC and MES requirements |
| `safetyLevel` | laser safety level and compliance assumptions |
| `fixtureConstraints` | clamp points, access, collision envelope, deformation limits |
| `preferredBrands` / `forbiddenBrands` | candidate and restricted brands |
| `utilities` | plant power, gas, cooling water/chiller, exhaust |
| `annualVolume` / `partsPerHour` | capacity assumptions |
| `acceptanceThresholds` | quantitative acceptance criteria per quality target |

### Polymer-Transmission Rule

For `applicationScenario = polymer-transmission`:

- `lightTransmittance` is treated as a core feasibility parameter.
- The agent should first estimate transmittance from material family, color, additive state, and thickness using documented references.
- Do not block early feasibility on missing user-provided transmittance.
- If measured transmittance is unavailable, output:
  - estimated transmittance range,
  - assumed wavelength basis,
  - confidence level and uncertainty source,
  - feasibility impact and required validation action.

### Push-Pull Additional Fields

Required whenever push-pull brazing is in scope.

| Field | Notes |
| --- | --- |
| `wireFeedMode` | push-pull, push, pull, manual-assist |
| `wireFeedOrientation` | front, rear, side, coaxial, near-coaxial |
| `wireFeedAngleDeg` | wire-feed angle |
| `wireNozzleOffsetMm` | nozzle offset |
| `wireSpeedMmPerS` | wire speed |
| `preheatRequired` | yes/no and method |
| `seamTrackingRequired` | yes/no and method |
| `brazingWireFamily` | CuSi, AlSi, Ni-based, Cu-based, stainless-filler, custom |

## Assumption And Risk Templates

When non-required but critical fields are missing, use the mapping below:

For report output, always present missing items in Chinese business terms first. Keep internal field keys in parentheses only when needed.

| 缺失项（中文优先） | 默认假设 | 风险提示 |
| --- | --- | --- |
| 节拍目标（`targetTaktSec`） | 先按保守节拍拆分与中等自动化水平估算 | 产能与布局可能过配或欠配 |
| 工位数量（`stationCount`） | 默认单工位基线 | 未覆盖多工位节拍平衡风险 |
| 检测方法（`inspectionMethods`） | 默认视觉 + 周期性破坏性抽检 | 误判/漏判风险与质控口径不一致 |
| 验收阈值（`acceptanceThresholds`） | 暂按定性验收标准 | 无法形成放行完备性判断 |
| 夹具约束（`fixtureConstraints`） | 默认有标准可达空间与夹紧空间 | 可能低估干涉与变形风险 |
| 厂务条件（`utilities`） | 默认现场具备标准电/气/冷却条件 | 现场可能出现冷却/气体/供电集成失败 |
| 透光率（`lightTransmittance`，仅透射焊） | 按材料参考与保守光学假设估算 | 波长不匹配及色母/添加剂不确定性会导致耦合失效 |

## Question Rule

- Missing Tier A fields: ask one required question at a time and stop.
- Missing Tier B/C fields: continue with explicit assumptions, risk level, and validation actions.

## Optional Pre-Report Confirmation (Non-Blocking)

Before producing the final solution report, you may trigger one optional user confirmation interaction for high-impact assumptions when needed. Filling additional values is always optional.

The selectable optional assumptions are:

- material grade (304 vs 316L or other actual grade),
- seam length and trajectory basis,
- takt target or annual volume basis,
- quantitative acceptance thresholds (strength/appearance/distortion).

If the user provides updates, revise assumptions and recompute cycle/throughput sections affected by those updates. If skipped, keep assumptions explicit and proceed.
