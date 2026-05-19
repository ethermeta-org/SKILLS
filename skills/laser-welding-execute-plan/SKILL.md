---
name: laser-welding-execute-plan
description: >-
  Execute a laser welding plan using MCP tools (material_assess, hardware_recommend, etc.).
  Requires laser-welding MCP or lasernexus server. Use after laser-welding-write-plan.
---

# Laser Welding — Execute Plan

## Priority

1. **MCP `laser-welding` / `@ethermeta/lasernexus` connected** — call tools per plan; never invent powers/speeds/PLC timings.
2. **No MCP** — read `skills/laser-welding/references/*.md`; label `source: fallback-doc`.

## Order

Run stages 1 → 2 → 3 → 4 from the plan. Stage 3 may run DOE and defect tools in parallel.

Materials/symptoms accept **English or Chinese** (e.g. 铜, 飞溅).

Finish with `laser-welding-verify`.
