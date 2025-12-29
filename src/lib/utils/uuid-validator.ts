/**
 * Utilidades para validación de UUIDs
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Valida si un string es un UUID válido
 */
export function isValidUUID(value: string | null | undefined): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }
  return UUID_REGEX.test(value);
}

/**
 * Valida un UUID y lanza un error si no es válido
 */
export function validateUUID(value: string | null | undefined, fieldName: string = 'id'): string {
  if (!isValidUUID(value)) {
    throw new Error(`Invalid ${fieldName} format. Expected a valid UUID.`);
  }
  // En este punto, sabemos que value es un string válido
  return value as string;
}

