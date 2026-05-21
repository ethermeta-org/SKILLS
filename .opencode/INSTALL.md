# Installing Laser Welding Skills for OpenCode

## Prerequisites

- OpenCode.ai
- Node.js 20+
- Git

## Git-Backed Plugin Install

Add the plugin to your OpenCode configuration:

```json
{
  "plugin": ["laser-welding-skills@git+https://github.com/ethermeta-org/SKILLS.git"]
}
```

Restart OpenCode after saving the config.

## Local Checkout Install

Use a local checkout when developing the skills or when your OpenCode setup cannot resolve the Git-backed plugin directly.

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.config\opencode" | Out-Null
git clone https://github.com/ethermeta-org/SKILLS.git "$env:USERPROFILE\.config\opencode\laser-welding-skills"
Set-Location "$env:USERPROFILE\.config\opencode\laser-welding-skills"
npm install
npm run build
```

Then point OpenCode at the local plugin directory:

```json
{
  "plugin": ["~/.config/opencode/laser-welding-skills"]
}
```

Restart OpenCode after saving the config.

## MCP Server

The plugin registers the skill content. Laser welding calculations, material matching, hardware selection, DOE generation, defect diagnosis, trajectory generation, fieldbus mapping, and code generation should come from the Lasernexus MCP server.

Add the MCP server to your OpenCode MCP configuration:

```json
{
  "mcp": {
    "lasernexus": {
      "type": "local",
      "command": ["npx", "-y", "@ethermeta/lasernexus", "--stdio"]
    }
  }
}
```

## Verification

Start a new OpenCode session and ask:

```text
Use the laser-welding skill to recommend starting parameters for 1.0 mm 304 stainless lap welding with a fiber laser.
```

Expected behavior:

- OpenCode recognizes that Laser Welding Skills are available.
- It uses the `laser-welding` skill for process-engineering workflow guidance.
- If the Lasernexus MCP server is connected, it calls MCP tools for process parameters instead of inventing values.
- It keeps calculations and domain logic in the MCP package, not in the OpenCode plugin.

## Updating

For a Git-backed plugin, update through your normal OpenCode plugin update flow, then restart OpenCode.

For a local checkout:

```powershell
Set-Location "$env:USERPROFILE\.config\opencode\laser-welding-skills"
git pull
npm install
npm run build
```

Restart OpenCode after updating so it reloads the plugin and skill paths.

## Troubleshooting

### Windows Local Fallback

If `~/.config/opencode/laser-welding-skills` does not resolve on Windows, use the absolute Windows path in your OpenCode config:

```json
{
  "plugin": ["C:/Users/YOUR_USER/.config/opencode/laser-welding-skills"]
}
```

Replace `YOUR_USER` with your Windows user name. Forward slashes are accepted by Node.js and avoid JSON escaping issues.

### MCP Package Resolution

If OpenCode cannot start the Lasernexus MCP server, verify that Node.js 20+ is on your PATH and that `npx` can resolve the package:

```powershell
npx -y @ethermeta/lasernexus --help
```

If your network blocks registry access, install or mirror the MCP package according to your organization's package policy, then update the MCP command to the approved executable.

### Duplicate Skill Content

If the bootstrap text appears more than once, restart OpenCode. The plugin injects the bootstrap only when it is not already present in existing message text parts, but old sessions can retain earlier transformed messages.

### Skill Not Found

Confirm the repository has a `skills/laser-welding/SKILL.md` file and that the plugin directory is the repository root or a checkout with the same layout. The plugin resolves the skills directory relative to `.opencode/plugins/laser-welding.js`.
