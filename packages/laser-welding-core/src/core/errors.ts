export class LaserWeldingError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "LaserWeldingError";
  }
}

export class MaterialNotFoundError extends LaserWeldingError {
  constructor(materialId: string) {
    super(`Material not found: ${materialId}`, "MATERIAL_NOT_FOUND");
  }
}

export class ValidationError extends LaserWeldingError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
  }
}
