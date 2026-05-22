import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const PKG_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENTRY = join(PKG_DIR, "dist/index.js");
const PKG_VERSION = JSON.parse(
  readFileSync(join(PKG_DIR, "package.json"), "utf-8"),
) as { version: string };

function runCli(args: string[]) {
  return spawnSync(process.execPath, [ENTRY, ...args], {
    encoding: "utf-8",
    timeout: 3000,
  });
}

describe("lasernexus CLI", () => {
  it("prints version with --version", () => {
    const result = runCli(["--version"]);
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe(PKG_VERSION.version);
  });

  it("exits with usage for unknown subcommand", () => {
    const result = runCli(["stdio"]);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("lasernexus mcp");
  });

  it("exits with usage when no subcommand is given", () => {
    const result = runCli([]);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("lasernexus mcp");
  });

  it("rejects legacy --stdio flag", () => {
    const result = runCli(["--stdio"]);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Unknown option '--stdio'");
  });
});
