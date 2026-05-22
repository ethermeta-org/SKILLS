# Lasernexus v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement v2 domain expansion per [spec](../specs/2026-05-19-lasernexus-v2-design.md): plastics (PA6/PA66/ABS/PC/PMMA), `lightTransmittance`, laser types, motion/head catalogs, and extended process parameters—backward compatible with existing MCP tools.

**Architecture:** Extend `@ethermeta/lasernexus-core` catalogs and stage1/2 logic first; then MCP zod schemas + tool descriptions; keep flat `defocusMm` for v1 clients while adding `processParams` object.

**Tech Stack:** TypeScript, Zod, Vitest, MCP SDK, npm workspaces (`@ethermeta/lasernexus-core`, `@ethermeta/lasernexus`)

**Spec:** [2026-05-19-lasernexus-v2-design.md](../specs/2026-05-19-lasernexus-v2-design.md)

---

## File map

| File | Responsibility |
|------|----------------|
| `packages/laser-welding-core/src/core/types.ts` | `ProcessParams`, `DefocusSign`, polymer fields on `MaterialRecord`, `LaserRecord.laserType` |
| `packages/laser-welding-core/data/materials.json` | copper-ofc, pa6, pa66, abs, pc, pmma; update pp/copper aliases |
| `packages/laser-welding-core/data/equipment.json` | motion platforms + laser heads |
| `packages/laser-welding-core/data/lasers.json` | add `laserType` to all entries + generic 2μm/blue/diode rows |
| `packages/laser-welding-core/src/core/polymer.ts` | **new** — weldMode from transmittance |
| `packages/laser-welding-core/src/core/process-params.ts` | **new** — power curve, defocus sign, penetration, wireFill |
| `packages/laser-welding-core/src/core/data-loader.ts` | load equipment; export types |
| `packages/laser-welding-core/src/core/aliases.ts` | plastic + equipment + defocus zh aliases |
| `packages/laser-welding-core/src/stage1/process-window.ts` | wire new inputs/outputs |
| `packages/laser-welding-core/src/stage2/laser-selector.ts` | motion/head/laserType |
| `packages/laser-welding-core/src/stage4/trajectory.ts` | motionPlatform hint |
| `packages/laser-welding-core/src/stage3/doe-matrix.ts` | optional defocus/gap axes |
| `mcp/lasernexus/src/tools/schemas.ts` | zod optional fields |
| `mcp/lasernexus/src/index.ts` | tool descriptions |
| `packages/laser-welding-core/tests/v2.test.ts` | **new** — focused v2 tests |
| `skills/laser-welding/references/materials.md` | document plastics + transmittance |

---

### Task 1: Extend core types

**Files:**
- Modify: `packages/laser-welding-core/src/core/types.ts`
- Modify: `packages/laser-welding-core/src/index.ts` (re-export new types if needed)

- [ ] **Step 1: Add types**

Add to `types.ts`:

```ts
export type MaterialCategory = "metal" | "polymer" | "engineering-polymer";
export type WeldMode = "absorption" | "transmission" | "hybrid";
export type DefocusSign = "positive" | "negative" | "on-focus";
export type LaserType =
  | "fiber-1064"
  | "fiber-2um"
  | "fiber-green"
  | "diode-blue"
  | "diode-semiconductor";
export type MotionPlatformId = "gantry" | "single-axis" | "galvo-scanner";
export type LaserHeadId = "galvo" | "fixed-focus" | "single-axis-rotation";

export interface ProcessParams {
  powerW: number;
  powerCurve?: { segments: { durationMs: number; powerW: number }[] };
  speedMmPerS: number;
  defocus: { valueMm: number; sign: DefocusSign };
  penetrationDepthMm: number;
  wireFill?: { gapMm: number; suggestedWireMm: number };
}
```

Extend `MaterialRecord` with optional polymer fields: `lightTransmittance`, `referenceWavelengthNm`, `weldModeDefault`, `preferredWavelengthNm`, `reflectivity2000`.

Extend `LaserRecord` with `laserType: LaserType`.

Extend `ProcessWindowResult` with optional `processParams`, `weldMode`, `effectiveTransmittance`.

Extend `HardwareRecommendResult`: `recommendedLaserTypes`, `motionPlatform`, `laserHead`, `beamDelivery` adds `"galvo-scanner"`.

- [ ] **Step 2: Build**

```bash
cd /Users/gubin/workspaces/SKILLS && npm run build -w @ethermeta/lasernexus-core
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add packages/laser-welding-core/src/core/types.ts packages/laser-welding-core/src/index.ts
git commit -m "feat(core): add v2 process and polymer types"
```

---

### Task 2: Materials catalog (copper-ofc + plastics + transmittance)

**Files:**
- Modify: `packages/laser-welding-core/data/materials.json`
- Modify: `packages/laser-welding-core/src/core/aliases.ts`

- [ ] **Step 1: Write failing test**

Create `packages/laser-welding-core/tests/v2.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getMaterialById } from "../src/core/data-loader.js";
import { resolveMaterialId } from "../src/core/aliases.js";

describe("v2 materials", () => {
  it("resolves copper-ofc separately from copper", () => {
    expect(resolveMaterialId("紫铜")).toBe("copper-ofc");
    expect(getMaterialById("copper-ofc")?.id).toBe("copper-ofc");
    expect(getMaterialById("copper")?.id).toBe("copper");
  });

  it("loads pa66 with lightTransmittance", () => {
    const m = getMaterialById("pa66");
    expect(m?.category).toBe("engineering-polymer");
    expect(m?.lightTransmittance).toBeLessThan(0.3);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm run test -w @ethermeta/lasernexus-core -- tests/v2.test.ts
```

- [ ] **Step 3: Update materials.json**

- Add `copper-ofc` (copy copper props, adjust `materialFactor` slightly e.g. 1.3)
- Remove `紫铜` from `copper.aliases.zh`; add to `copper-ofc.aliases.zh`
- Add `pa6`, `pa66`, `abs`, `pc`, `pmma` with `lightTransmittance`, `weldModeDefault`, `referenceWavelengthNm: 2000` for polymers
- Update `pp` with `lightTransmittance: 0.15`, `category: "polymer"`

- [ ] **Step 4: Extend aliases.ts** — `pa66`→`pa66`, `尼龙`, `abs`, `pc`, `pmma`, `透光率` keys as needed

- [ ] **Step 5: Run test — expect PASS**

- [ ] **Step 6: Commit**

```bash
git add packages/laser-welding-core/data/materials.json packages/laser-welding-core/src/core/aliases.ts packages/laser-welding-core/tests/v2.test.ts
git commit -m "feat(data): add copper-ofc and engineering polymers with transmittance"
```

---

### Task 3: Polymer weld mode helper

**Files:**
- Create: `packages/laser-welding-core/src/core/polymer.ts`
- Test: `packages/laser-welding-core/tests/v2.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { resolveWeldMode } from "../src/core/polymer.js";

it("resolveWeldMode transmission for high transmittance", () => {
  expect(resolveWeldMode(0.85)).toBe("transmission");
  expect(resolveWeldMode(0.1)).toBe("absorption");
  expect(resolveWeldMode(0.5)).toBe("hybrid");
});
```

- [ ] **Step 2: Implement `polymer.ts`**

```ts
import type { WeldMode } from "./types.js";

export function resolveWeldMode(lightTransmittance: number): WeldMode {
  if (lightTransmittance < 0.3) return "absorption";
  if (lightTransmittance > 0.7) return "transmission";
  return "hybrid";
}

export function effectiveTransmittance(
  catalogDefault: number | undefined,
  override: number | undefined,
): number {
  if (override !== undefined) return Math.min(1, Math.max(0, override));
  return catalogDefault ?? 0.2;
}
```

- [ ] **Step 3: Run tests PASS; commit**

```bash
git commit -m "feat(core): polymer weld mode from light transmittance"
```

---

### Task 4: Process params builder

**Files:**
- Create: `packages/laser-welding-core/src/core/process-params.ts`
- Test: `packages/laser-welding-core/tests/v2.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { buildProcessParams } from "../src/core/process-params.js";

it("builds power curve for wireFill", () => {
  const p = buildProcessParams({
    powerW: 1000,
    speedMmPerS: 3,
    defocusMm: -0.5,
    lineEnergyJPerMm: 333,
    wireFill: true,
    gapMm: 0.5,
  });
  expect(p.powerCurve?.segments.length).toBeGreaterThanOrEqual(2);
  expect(p.wireFill?.gapMm).toBe(0.5);
  expect(p.defocus.sign).toBe("negative");
});
```

- [ ] **Step 2: Implement `process-params.ts`**

- `defocusSignFromMm(mm)`: negative if mm < 0, positive if > 0, else on-focus
- `estimatePenetrationDepthMm(lineEnergy, materialFactor)`: `k * Math.sqrt(lineEnergy / materialFactor)` with k≈0.15
- `buildProcessParams`: assemble `ProcessParams`; if `wireFill`, add 2 segments `[{durationMs:50, powerW: power*0.4}, {durationMs:200, powerW}]`, `suggestedWireMm = gapMm * 1.0`

- [ ] **Step 3: Tests PASS; commit**

---

### Task 5: Integrate process-window (material_assess)

**Files:**
- Modify: `packages/laser-welding-core/src/stage1/process-window.ts`
- Modify: `packages/laser-welding-core/tests/v2.test.ts`

- [ ] **Step 1: Extend `MaterialAssessInput`** with optional `gapMm`, `wireFill`, `wireDiameterMm`, `targetPenetrationDepthMm`, `lightTransmittance`

- [ ] **Step 2: Failing tests**

```ts
import { assessMaterial } from "../src/stage1/process-window.js";

it("assess pa66 absorption mode", () => {
  const r = assessMaterial({ material: "pa66", thicknessMm: 2 });
  expect(r.weldMode).toBe("absorption");
  expect(r.processParams?.penetrationDepthMm).toBeGreaterThan(0);
});

it("assess pc with transmittance override", () => {
  const r = assessMaterial({ material: "pc", thicknessMm: 3, lightTransmittance: 0.85 });
  expect(r.weldMode).toBe("transmission");
  expect(r.effectiveTransmittance).toBe(0.85);
});
```

- [ ] **Step 3: Implement** — call `effectiveTransmittance`, `resolveWeldMode`, `buildProcessParams`; add warnings for transmission (吸收层); adjust speed/power for polymers

- [ ] **Step 4: Run all core tests; commit**

```bash
git commit -m "feat(stage1): material_assess v2 processParams and weldMode"
```

---

### Task 6: Equipment catalog + data-loader

**Files:**
- Create: `packages/laser-welding-core/data/equipment.json`
- Modify: `packages/laser-welding-core/src/core/data-loader.ts`
- Test: `packages/laser-welding-core/tests/v2.test.ts`

- [ ] **Step 1: Add equipment.json** per spec (gantry, single-axis, galvo-scanner; heads galvo, fixed-focus, single-axis-rotation)

- [ ] **Step 2: Add `loadEquipment()`, `resolveMotionPlatform(id)`, `resolveLaserHead(id)` using `matchesAlias`**

- [ ] **Step 3: Test load + 龙门 alias; commit**

---

### Task 7: Lasers laserType + hardware_recommend

**Files:**
- Modify: `packages/laser-welding-core/data/lasers.json`
- Modify: `packages/laser-welding-core/src/stage2/laser-selector.ts`
- Test: `packages/laser-welding-core/tests/v2.test.ts`

- [ ] **Step 1: Add `laserType` to each existing laser row; add generic rows for `fiber-2um`, `diode-blue`, `diode-semiconductor` if missing**

- [ ] **Step 2: Extend `HardwareRecommendInput`**: `motionPlatform`, `laserHead`, `preferredLaserType`

- [ ] **Step 3: Failing tests**

```ts
it("recommends galvo for galvo-scanner motion", () => {
  const r = recommendHardware({
    material: "stainless-304",
    thicknessMm: 1,
    motionPlatform: "galvo-scanner",
  });
  expect(r.laserHead).toBe("galvo");
  expect(r.beamDelivery).toBe("galvo-scanner");
});

it("recommends fiber-2um for pmma transmission", () => {
  const r = recommendHardware({ material: "pmma", thicknessMm: 2 });
  expect(r.recommendedLaserTypes).toContain("fiber-2um");
});
```

- [ ] **Step 4: Implement** — map weldMode/transmittance to laser types; validate motion/head compatibility; warnings on mismatch

- [ ] **Step 5: Commit**

---

### Task 8: Trajectory + DOE optional axes

**Files:**
- Modify: `packages/laser-welding-core/src/stage4/trajectory.ts`
- Modify: `packages/laser-welding-core/src/stage3/doe-matrix.ts`
- Modify: `packages/laser-welding-core/tests/v2.test.ts`

- [ ] **Step 1: `TrajectoryInput.motionPlatform?`** — if `galvo-scanner`, prefix program comment `; Galvo scanner path — export via OEM field converter`

- [ ] **Step 2: `DoeMatrixInput` optional `defocusMin/Max`, `includeGapAxis`** — when set, append columns to matrix/csv

- [ ] **Step 3: Minimal tests; commit**

---

### Task 9: MCP schemas and tool descriptions

**Files:**
- Modify: `mcp/lasernexus/src/tools/schemas.ts`
- Modify: `mcp/lasernexus/src/index.ts`
- Test: `mcp/lasernexus/tests/handlers.test.ts`

- [ ] **Step 1: Extend zod schemas** (all optional new fields with `.optional()`)

```ts
lightTransmittance: z.number().min(0).max(1).optional(),
gapMm: z.number().positive().optional(),
wireFill: z.boolean().optional(),
motionPlatform: z.enum(["gantry", "single-axis", "galvo-scanner"]).optional(),
laserHead: z.enum(["galvo", "fixed-focus", "single-axis-rotation"]).optional(),
```

- [ ] **Step 2: Handler test for pc + transmittance**

```ts
const content = handleMaterialAssess({ material: "pc", thicknessMm: 2, lightTransmittance: 0.8 });
const data = JSON.parse(content[0].text);
expect(data.weldMode).toBe("transmission");
```

- [ ] **Step 3: Update TOOL descriptions in index.ts; full `npm test`; commit**

---

### Task 10: Documentation

**Files:**
- Modify: `skills/laser-welding/references/materials.md`
- Modify: `skills/laser-welding/SKILL.md`

- [ ] **Step 1: materials.md table** — all plastics + transmittance + weldMode column

- [ ] **Step 2: SKILL.md** — mention `lightTransmittance`, motion/head params, new laser types

- [ ] **Step 3: Commit**

```bash
git commit -m "docs: lasernexus v2 materials and MCP parameters"
```

---

### Task 11: Version bump and verify

**Files:**
- Modify: `packages/laser-welding-core/package.json` → `1.1.0`
- Modify: `mcp/lasernexus/package.json` → `1.1.0`

- [ ] **Step 1: Bump versions**

- [ ] **Step 2: Full verify**

```bash
npm run lint && npm run build && npm test
```

Expected: all pass

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: release v1.1.0 lasernexus v2"
```

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| copper-ofc separate | 2 |
| pa6/pa66/abs/pc/pmma + pp transmittance | 2, 3, 5 |
| lightTransmittance input/output | 3, 5, 9 |
| laserType on lasers | 7 |
| equipment.json motion/head | 6, 7 |
| processParams + power curve | 4, 5 |
| hardware motion/head/laserTypes | 7 |
| trajectory motionPlatform | 8 |
| doe defocus/gap optional | 8 |
| bilingual aliases | 2, 6 |
| tests per spec | 2–9 |
| docs | 10 |

---

## Execution handoff

Plan saved. Two execution options:

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks  
2. **Inline Execution** — execute in this session with executing-plans checkpoints

Which approach do you want?
