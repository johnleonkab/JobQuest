/**
 * Utilidad para hacer fetch requests con CSRF token automáticamente
 */

import { getCSRFTokenFromCookie } from './csrf';

/**
 * Wrapper para fetch que incluye automáticamente el token CSRF
 */
export async function fetchWithCSRF(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = options.method?.toUpperCase();
  
  // Solo agregar CSRF token para métodos que modifican datos
  if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = getCSRFTokenFromCookie();
    
    if (csrfToken) {
      options.headers = {
        ...options.headers,
        'x-csrf-token': csrfToken,
      };
    }
  }
  
  return fetch(url, options);
}

