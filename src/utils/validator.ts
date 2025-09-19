// src/utils/validator.ts
export type ValidationError = { field: string; message: string };

export function validateRequired(
  obj: Record<string, any>,
  requiredFields: string[],
  fieldLabels: Record<string, string> = {}
): ValidationError[] {
  const errors: ValidationError[] = [];

  requiredFields.forEach((field) => {
    const label = fieldLabels[field] ?? field; // usa alias si existe
    if (
      obj[field] === undefined ||
      obj[field] === null ||
      (typeof obj[field] === "string" && obj[field].trim() === "")
    ) {
      errors.push({ field, message: `${label} es requerido` });
    }
  });

  return errors;
}
