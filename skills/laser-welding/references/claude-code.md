# Claude Code installation

## Plugin (recommended)

From repository root:

```bash
claude --plugin-dir .
```

Reload:

```text
/reload-plugins
```

Invoke skill:

```text
/laser-welding-skills:laser-welding
```

## Bundled MCP

Plugin root [`.mcp.json`](../../.mcp.json) registers `laser-welding` MCP server. After reload, confirm tools with: "What MCP tools are available from lasernexus?"

## Marketplace

When published, install via Claude plugin marketplace and enable MCP in plugin settings.
