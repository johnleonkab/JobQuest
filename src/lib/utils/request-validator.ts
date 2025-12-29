/**
 * Utilidades para validación de tipos de datos en requests
 */

/**
 * Valida que un valor sea un número entero positivo
 */
export function validatePositiveInteger(
  value: unknown,
  fieldName: string
): { valid: boolean; error?: string; value?: number } {
  if (value === null || value === undefined) {
    return { valid: true };
  }

  if (typeof value !== 'number') {
    return {
      valid: false,
      error: `${fieldName} debe ser un número`,
    };
  }

  if (!Number.isInteger(value)) {
    return {
      valid: false,
      error: `${fieldName} debe ser un número entero`,
    };
  }

  if (value < 0) {
    return {
      valid: false,
      error: `${fieldName} debe ser un número positivo`,
    };
  }

  return { valid: true, value };
}

/**
 * Valida que un valor sea un array de strings
 */
export function validateStringArray(
  value: unknown,
  fieldName: string
): { valid: boolean; error?: string; value?: string[] } {
  if (value === null || value === undefined) {
    return { valid: true, value: [] };
  }

  if (!Array.isArray(value)) {
    return {
      valid: false,
      error: `${fieldName} debe ser un array`,
    };
  }

  if (!value.every((item) => typeof item === 'string')) {
    return {
      valid: false,
      error: `${fieldName} debe ser un array de strings`,
    };
  }

  return { valid: true, value };
}

/**
 * Valida que un valor sea uno de los valores permitidos
 */
export function validateEnum<T extends string>(
  value: unknown,
  fieldName: string,
  allowedValues: readonly T[]
): { valid: boolean; error?: string; value?: T } {
  if (value === null || value === undefined) {
    return { valid: true };
  }

  if (typeof value !== 'string') {
    return {
      valid: false,
      error: `${fieldName} debe ser un string`,
    };
  }

  if (!allowedValues.includes(value as T)) {
    return {
      valid: false,
      error: `${fieldName} debe ser uno de: ${allowedValues.join(', ')}`,
    };
  }

  return { valid: true, value: value as T };
}

/**
 * Valida que un valor sea un objeto JSON válido
 */
export function validateJSONObject(
  value: unknown,
  fieldName: string
): { valid: boolean; error?: string; value?: Record<string, unknown> } {
  if (value === null || value === undefined) {
    return { valid: true, value: {} };
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    return {
      valid: false,
      error: `${fieldName} debe ser un objeto`,
    };
  }

  return { valid: true, value: value as Record<string, unknown> };
}

/**
 * Valida formato de email básico
 */
export function validateEmail(
  value: unknown,
  fieldName: string = 'email'
): { valid: boolean; error?: string } {
  if (!value || typeof value !== 'string') {
    return { valid: true }; // Email es opcional en muchos casos
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return {
      valid: false,
      error: `${fieldName} debe ser un email válido`,
    };
  }

  return { valid: true };
}

/**
 * Dominios permitidos para URLs (whitelist)
 */
const ALLOWED_DOMAINS = [
  'supabase.co',
  'supabase.in',
  'storage.googleapis.com',
  'img.logo.dev',
  'logo.dev',
] as const;

/**
 * Valida formato de URL básico y dominio permitido
 */
export function validateURL(
  value: unknown,
  fieldName: string = 'url',
  allowExternalDomains: boolean = true
): { valid: boolean; error?: string } {
  if (!value || typeof value !== 'string') {
    return { valid: true }; // URL es opcional en muchos casos
  }

  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return {
        valid: false,
        error: `${fieldName} debe usar http:// o https://`,
      };
    }

    // Si no se permiten dominios externos, validar whitelist
    if (!allowExternalDomains) {
      const hostname = url.hostname.toLowerCase();
      const isAllowed = ALLOWED_DOMAINS.some((domain) => 
        hostname === domain || hostname.endsWith(`.${domain}`)
      );

      if (!isAllowed) {
        return {
          valid: false,
          error: `${fieldName} debe apuntar a un dominio permitido`,
        };
      }
    }

    return { valid: true };
  } catch {
    return {
      valid: false,
      error: `${fieldName} debe ser una URL válida`,
    };
  }
}

