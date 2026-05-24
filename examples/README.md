# Prompt Examples — Laser Welding Skills

**English** | [中文说明](#验证步骤)

Copy-paste prompts to validate skills in **Cursor Agent** chat. Skills are invoked with `/skill-name` or `@` → pick Skill — not by clicking markdown file links.

## Files

| File | Description |
| --- | --- |
| [workflow-en.md](workflow-en.md) | Full presales workflow (brainstorm → plan → execute → verify), English |
| [workflow-zh.md](workflow-zh.md) | 完整售前流程四步，中文 |
| [scenarios-en.md](scenarios-en.md) | Single scenarios: material, defects, brazing, BOM, fieldbus, English |
| [scenarios-zh.md](scenarios-zh.md) | 单场景：材料、缺陷、钎焊、BOM、总线，中文 |

## Cursor setup

See [skills/laser-welding/references/cursor.md](../skills/laser-welding/references/cursor.md):

1. `./scripts/install-cursor-plugin.sh copy` (or `project` when developing in this repo)
2. Quit Cursor (`Cmd+Q`) and reopen
3. Optional: add `lasernexus` MCP from [`.mcp.json`](../.mcp.json)

**Do not** `ln -s` the repo into `~/.cursor/plugins/local/` — Cursor rejects symlinks outside that directory.

## Quick invoke

| Slash | Purpose |
| --- | --- |
| `/laser-welding` | Full workflow entry |
| `/laser-welding-brainstorm` | Requirements intake |
| `/laser-welding-write-plan` | Execution plan |
| `/laser-welding-execute-plan` | Process, equipment, DOE, BOM, risk, and validation output |
| `/laser-welding-verify` | Delivery verification |

## 验证步骤

1. **安装**：运行 `./scripts/install-cursor-plugin.sh copy`（勿用 `ln -s`），重启 Cursor，在 Settings → Rules 确认 5 个 skills。
2. **Slash**：Agent 聊天输入 `/laser-welding-brainstorm`，粘贴 [workflow-zh.md](workflow-zh.md) 步骤 1 提示词。
3. **专业结论**：用 [scenarios-en.md](scenarios-en.md) 材料评估场景，确认输出含工艺窗口、风险和验证建议。
4. **校验**：用 `/laser-welding-verify` 检查输出含免责声明、DOE 提醒、无报价/仿真。
5. **双语**：分别用 `copper`/`铜`、`spatter`/`飞溅` 测试英文与中文提示词。

## Pass criteria

- Skill checklist or decision tree is followed.
- Numeric outputs include units and heuristic disclaimers.
- Welding/process answers present professional conclusions without exposing internal orchestration.
- No pricing, quotation, simulation, FEA, or production-release without DOE evidence.
