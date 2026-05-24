#!/usr/bin/env node
import { parseArgs } from "node:util";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { setDataRoot } from "@ethermeta/lasernexus-core";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  materialAssessSchema,
  processRecommendSchema,
  hardwareRecommendSchema,
  doeMatrixSchema,
  defectDiagnoseSchema,
  trajectorySchema,
  fieldbusMapSchema,
  solutionBomSchema,
} from "./tools/schemas.js";
import {
  handleMaterialAssess,
  handleProcessRecommend,
  handleHardwareRecommend,
  handleDoeMatrix,
  handleDefectDiagnose,
  handleTrajectoryGenerate,
  handleFieldbusMap,
  handleSolutionBom,
} from "./tools/handlers.js";

import { MCP_TOOLS } from "./tools/list-tools.js";

const PKG_VERSION = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../package.json"), "utf-8"),
) as { version: string };

const server = new Server(
  { name: "lasernexus", version: PKG_VERSION.version },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [...MCP_TOOLS],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  let content;

  switch (name) {
    case "process_recommend":
      content = handleProcessRecommend(processRecommendSchema.parse(args ?? {}));
      break;
    case "material_assess":
      content = handleMaterialAssess(materialAssessSchema.parse(args ?? {}));
      break;
    case "hardware_recommend":
      content = handleHardwareRecommend(hardwareRecommendSchema.parse(args ?? {}));
      break;
    case "doe_matrix":
      content = handleDoeMatrix(doeMatrixSchema.parse(args ?? {}));
      break;
    case "defect_diagnose":
      content = handleDefectDiagnose(defectDiagnoseSchema.parse(args ?? {}));
      break;
    case "trajectory_generate":
      content = handleTrajectoryGenerate(trajectorySchema.parse(args ?? {}));
      break;
    case "fieldbus_map":
      content = handleFieldbusMap(fieldbusMapSchema.parse(args ?? {}));
      break;
    case "solution_bom":
      content = handleSolutionBom(solutionBomSchema.parse(args ?? {}));
      break;
    default:
      throw new Error(`Unknown tool: ${name}`);
  }

  return { content, isError: false };
});

function printUsage(): void {
  console.error(`Usage:
  lasernexus mcp [--data-dir <path>]
  lasernexus --version`);
}

function runCli(): boolean {
  const { positionals, values } = parseArgs({
    options: {
      "data-dir": { type: "string" },
      version: { type: "boolean" },
    },
    allowPositionals: true,
  });

  if (values.version) {
    console.log(PKG_VERSION.version);
    return false;
  }

  const command = positionals[0];
  if (command !== "mcp") {
    printUsage();
    process.exit(1);
  }

  if (values["data-dir"]) {
    setDataRoot(values["data-dir"]);
  }

  return true;
}

async function main() {
  if (!runCli()) return;
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
