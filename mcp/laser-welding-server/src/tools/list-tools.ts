/** MCP ListTools definitions — keep in sync with schemas.ts */

export const MCP_TOOLS = [
  {
    name: "material_assess",
    description:
      "Stage 1: Process window with processParams (power curve, defocus sign, penetration), weldMode, lightTransmittance for plastics.",
    inputSchema: {
      type: "object" as const,
      properties: {
        material: { type: "string", description: "e.g. copper, pa66, 紫铜, PC" },
        thicknessMm: { type: "number" },
        jointType: { type: "string" },
        targetSpeedMmPerS: { type: "number" },
        gapMm: { type: "number" },
        wireFill: { type: "boolean" },
        wireDiameterMm: { type: "number" },
        targetPenetrationDepthMm: { type: "number" },
        lightTransmittance: { type: "number", description: "0–1, overrides catalog for plastics" },
      },
      required: ["material", "thicknessMm"],
    },
  },
  {
    name: "hardware_recommend",
    description:
      "Stage 2: Laser brands, laserTypes, motionPlatform, laserHead, brazing/turnkey; optional lightTransmittance.",
    inputSchema: {
      type: "object" as const,
      properties: {
        material: { type: "string" },
        thicknessMm: { type: "number" },
        application: { type: "string" },
        motionPlatform: { type: "string", enum: ["gantry", "single-axis", "galvo-scanner"] },
        laserHead: { type: "string", enum: ["galvo", "fixed-focus", "single-axis-rotation"] },
        preferredLaserType: {
          type: "string",
          enum: ["fiber-1064", "fiber-2um", "fiber-green", "diode-blue", "diode-semiconductor"],
        },
        lightTransmittance: { type: "number" },
      },
      required: ["material", "thicknessMm"],
    },
  },
  {
    name: "doe_matrix",
    description: "Stage 3: Power-speed DOE; optional defocusMin/Max, gapMin/Max, includeGapAxis.",
    inputSchema: {
      type: "object" as const,
      properties: {
        powerMin: { type: "number" },
        powerMax: { type: "number" },
        speedMin: { type: "number" },
        speedMax: { type: "number" },
        gridSize: { type: "number" },
        defocusMin: { type: "number" },
        defocusMax: { type: "number" },
        gapMin: { type: "number" },
        gapMax: { type: "number" },
        includeGapAxis: { type: "boolean" },
      },
      required: ["powerMin", "powerMax", "speedMin", "speedMax"],
    },
  },
  {
    name: "defect_diagnose",
    description: "Stage 3: Defect diagnosis (EN/ZH symptoms).",
    inputSchema: {
      type: "object" as const,
      properties: {
        symptom: { type: "string" },
        material: { type: "string" },
        thicknessMm: { type: "number" },
      },
      required: ["symptom", "material", "thicknessMm"],
    },
  },
  {
    name: "trajectory_generate",
    description: "Stage 4: G-code; galvo-scanner adds OEM export note.",
    inputSchema: {
      type: "object" as const,
      properties: {
        pathType: { type: "string", enum: ["line", "circle", "rectangle"] },
        lengthMm: { type: "number" },
        radiusMm: { type: "number" },
        widthMm: { type: "number" },
        heightMm: { type: "number" },
        speedMmPerS: { type: "number" },
        powerW: { type: "number" },
        dialect: { type: "string", enum: ["gcode", "fanuc"] },
        motionPlatform: { type: "string", enum: ["gantry", "single-axis", "galvo-scanner"] },
      },
      required: ["pathType", "speedMmPerS", "powerW"],
    },
  },
  {
    name: "fieldbus_map",
    description: "Stage 4: OPC UA, PROFINET, or EtherCAT.",
    inputSchema: {
      type: "object" as const,
      properties: {
        protocol: { type: "string", enum: ["opc-ua", "profinet", "ethercat"] },
      },
      required: ["protocol"],
    },
  },
  {
    name: "codegen_codesys_st",
    description: "Stage 4: CODESYS ST FB_LaserControl.",
    inputSchema: {
      type: "object" as const,
      properties: {
        profile: { type: "string" },
        preGasMs: { type: "number" },
        postGasMs: { type: "number" },
      },
    },
  },
  {
    name: "codegen_csharp",
    description: "Stage 4: C# laser state machine.",
    inputSchema: {
      type: "object" as const,
      properties: {
        profile: { type: "string" },
        preGasMs: { type: "number" },
        postGasMs: { type: "number" },
      },
    },
  },
] as const;
