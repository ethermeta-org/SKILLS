# Lasernexus v2 Design Spec

**Date:** 2026-05-19  
**Status:** Approved (user confirmed; plastics + transmittance added 2026-05-19)  
**Scope:** Extend existing 8 MCP tools + core catalogs (backward compatible)

## Goal

Expand laser welding domain coverage: materials (紫铜 OFC, PA66 等工程塑料), laser sources (半导体/蓝光/绿光/2μm), motion platforms (龙门/单轴/振镜), laser heads (振镜/定焦/单轴旋转), and rich process parameters (功率曲线, 正/负离焦, 熔深, 填丝焊+间隙).

## Architecture

- **Data-first catalogs** in `@ethermeta/lasernexus-core`: `materials.json`, `lasers.json`, new `equipment.json`.
- **Extend** `material_assess`, `hardware_recommend`, `trajectory_generate` (optional `doe_matrix`) schemas; no new MCP server tools in v2.
- **Aliases** (中英) via existing `aliases.ts` for materials, equipment ids, defocus signs, motion/head terms.
- All new numeric outputs remain `confidence: heuristic` with existing `DISCLAIMER`.

## Data Model

### Materials (`materials.json`)

| id | category | 典型透光率* | notes |
|----|----------|-------------|-------|
| `copper-ofc` | metal | — | 紫铜 OFC，独立于 `copper`；`copper` 别名移除「紫铜」 |
| `pp` | polymer | 0.0–0.3 (不透明) | 保留；吸收焊为主 |
| `pa6` | engineering-polymer | ~0.0–0.15 | 半透明偏不透明 |
| `pa66` | engineering-polymer | ~0.0–0.15 | 尼龙，玻纤牌号透光更低 |
| `abs` | engineering-polymer | ~0.0–0.2 | 不透明外壳件常见 |
| `pc` | engineering-polymer | 0.1–0.9 | 透明/半透明 PC 需透射焊考量 |
| `pmma` | engineering-polymer | 0.85–0.92 | 高透，典型透射焊 |

\* `lightTransmittance` 为材料 catalog **默认值**（0–1，在 `referenceWavelengthNm` 下）；实际工件可在 API 入参覆盖。

**工程塑料统一字段**（`category: "engineering-polymer"` 或 `polymer`）：

```ts
interface PolymerMaterialFields {
  lightTransmittance: number;      // 0..1，透光率（高=透射焊倾向）
  referenceWavelengthNm: number;   // 默认 1064 或 2000（2μm 塑料焊）
  preferredWavelengthNm: number[];
  weldModeDefault: "absorption" | "transmission" | "hybrid";
  reflectivity1064?: number;
  reflectivity2000?: number;
}
```

**透光率与焊法启发式：**

| lightTransmittance | weldMode 建议 | 说明 |
|--------------------|---------------|------|
| &lt; 0.3 | `absorption` | 表面吸收焊；1064/半导体 |
| 0.3 – 0.7 | `hybrid` | 视厚度/焊道；可能需吸收层或改波长 |
| &gt; 0.7 | `transmission` | 透射焊；优先 `fiber-2um`，对接合面吸收层 warning |

**`material_assess` 新增可选入参：**

- `lightTransmittance?: number` — 覆盖 catalog 默认值（0–1），用于“非金属塑料焊接”实际透光率
- 输出增加 `weldMode: "absorption" | "transmission" | "hybrid"` 与 `effectiveTransmittance`（实际采用的值）

### Lasers (`lasers.json`)

Add `laserType` on each entry:

| laserType | wavelengthNm (typical) |
|-----------|------------------------|
| `fiber-1064` | 1064 |
| `fiber-2um` | 2000 |
| `fiber-green` | 515 |
| `diode-blue` | 450 |
| `diode-semiconductor` | 915–980 |

Existing OEM brands unchanged; new generic entries allowed for type-only recommendations.

### Equipment (`equipment.json`, new)

```json
{
  "motionPlatforms": [
    { "id": "gantry", "aliases": { "en": ["gantry"], "zh": ["龙门"] } },
    { "id": "single-axis", "aliases": { "en": ["single-axis"], "zh": ["单轴"] } },
    { "id": "galvo-scanner", "aliases": { "en": ["galvo", "scanner"], "zh": ["振镜"] } }
  ],
  "laserHeads": [
    { "id": "galvo", "compatibleMotion": ["galvo-scanner"] },
    { "id": "fixed-focus", "compatibleMotion": ["gantry", "single-axis"] },
    { "id": "single-axis-rotation", "compatibleMotion": ["single-axis", "gantry"] }
  ]
}
```

### Process params (TypeScript)

```ts
export type DefocusSign = "positive" | "negative" | "on-focus";

export interface ProcessParams {
  powerW: number;
  powerCurve?: { segments: { durationMs: number; powerW: number }[] };
  speedMmPerS: number;
  defocus: { valueMm: number; sign: DefocusSign };
  penetrationDepthMm: number;
  wireFill?: { gapMm: number; suggestedWireMm: number };
}
```

`ProcessWindowResult` gains optional `processParams: ProcessParams` (retain flat `defocusMm` for v1 clients).

## MCP Tool Changes

### `material_assess` — optional inputs

- `gapMm?: number`
- `wireFill?: boolean`
- `wireDiameterMm?: number`
- `targetPenetrationDepthMm?: number`
- `lightTransmittance?: number` — 0–1，覆盖材料默认透光率（透明/半透明塑料必填推荐）

### `material_assess` — extended output

- `processParams` as above
- `defocusMm` kept (negative = negative defocus convention)
- `weldMode`, `effectiveTransmittance`（塑料/非金属相关时返回）

### `hardware_recommend` — optional inputs

- `motionPlatform?: "gantry" | "single-axis" | "galvo-scanner"`
- `laserHead?: "galvo" | "fixed-focus" | "single-axis-rotation"`
- `preferredLaserType?: string`

### `hardware_recommend` — extended output

- `recommendedLaserTypes: string[]`
- `motionPlatform`, `laserHead` (resolved recommendation)
- `beamDelivery` union adds `"galvo-scanner"`
- Compatibility warnings when motion/head mismatch

### `trajectory_generate` — optional input

- `motionPlatform` — affects dialect hints (gantry G-code vs galvo scanner note)

### `doe_matrix` — optional (default off)

- `defocusMin`, `defocusMax`, `includeGapAxis` for wire-fill DOE

## Heuristic Rules

| Condition | Behavior |
|-----------|----------|
| `copper-ofc` / high reflectivity | Prefer 515/450 nm; defocus sign often negative for keyhole |
| `pa66` / `pa6` / `abs` | `absorption`; `fiber-2um` or `diode-semiconductor`; cap speed |
| `pc` / `pmma` + high `lightTransmittance` | `transmission`; `fiber-2um`; warn 吸收层/夹具 |
| `lightTransmittance` override | 按上表重算 `weldMode`；输出 `effectiveTransmittance` |
| `wireFill` + `gapMm` | Suggest wire diameter ≈ 0.8–1.2× gap; 2-segment power curve (preheat + weld) |
| `galvo-scanner` | Recommend `galvo` head; trajectory output notes scanner/OEM format |
| `gantry` + thick metal | `fixed-focus`; single-axis rotation for circular seams |
| Penetration | `penetrationDepthMm ≈ k * sqrt(lineEnergy)` with material factor; not NDT |

## Testing

- `copper-ofc` assess distinct from `copper`
- PA66 / ABS / PA6 → absorption + 2μm or semiconductor
- PC `lightTransmittance: 0.8` → transmission + warnings
- PMMA high transmittance → transmission path
- 中文别名：ABS、PC、尼龙、透光率
- 振镜 + 紫铜 → galvo head + green/blue wavelength
- `wireFill` + `gapMm: 0.5` → powerCurve segments + wireFill output
- Defocus sign positive vs negative explicit in `processParams`
- Chinese aliases: 龙门, 振镜, 正离焦, 填丝焊

## Out of Scope (v2)

- Arbitrary spline power curves (>3 segments)
- Real-time OEM API / machine connection
- HTTP MCP transport
- FEM or NDT-validated melt depth

## Spec Self-Review

- [x] No TBD placeholders
- [x] Consistent with v1 extend-existing decision and separate `copper-ofc`
- [x] Single implementable slice (one repo, one npm publish line)
- [x] Ambiguity resolved: power curve = 2–3 step segments only
