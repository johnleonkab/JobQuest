/**
 * Utilidades para validación de inputs
 */

/**
 * Límites de longitud para diferentes tipos de campos
 */
export const FIELD_LIMITS = {
  job_description: 10000, // 10KB
  notes: 5000, // 5KB
  description: 5000, // 5KB (CV sections)
  analysis_text: 50000, // 50KB (AI insights)
  company_name: 200,
  position: 200,
  title: 200,
  name: 200,
  email: 255,
  headline: 200,
  linkedin_url: 500,
} as const;

/**
 * Valida la longitud de un campo de texto
 */
export function validateFieldLength(
  value: string | null | undefined,
  fieldName: keyof typeof FIELD_LIMITS,
  required: boolean = false
): { valid: boolean; error?: string } {
  if (!value || value.trim().length === 0) {
    if (required) {
      return { valid: false, error: `${fieldName} es requerido` };
    }
    return { valid: true };
  }

  const limit = FIELD_LIMITS[fieldName];
  if (value.length > limit) {
    return {
      valid: false,
      error: `${fieldName} excede el límite de ${limit} caracteres`,
    };
  }

  return { valid: true };
}

/**
 * Trunca un string a un límite máximo
 */
export function truncateString(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }
  return value.substring(0, maxLength - 3) + '...';
}


