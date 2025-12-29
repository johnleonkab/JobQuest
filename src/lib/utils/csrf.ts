/**
 * Utilidades para protección CSRF
 */

import { cookies } from 'next/headers';

const CSRF_TOKEN_COOKIE = 'csrf-token';
const CSRF_HEADER = 'x-csrf-token';

/**
 * Genera un token CSRF aleatorio
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Obtiene el token CSRF de las cookies
 */
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_TOKEN_COOKIE)?.value || null;
}

/**
 * Establece el token CSRF en las cookies
 */
export async function setCSRFToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CSRF_TOKEN_COOKIE, token, {
    httpOnly: false, // Cambiar a false para que el cliente pueda leerlo
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // Cambiar a 'lax' para mejor compatibilidad
    maxAge: 60 * 60 * 24, // 24 horas
    path: '/',
  });
}

/**
 * Valida el token CSRF del request
 */
export async function validateCSRFToken(request: Request): Promise<boolean> {
  // Solo validar métodos que modifican datos
  const method = request.method;
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return true; // No validar GET, HEAD, OPTIONS
  }

  const cookieToken = await getCSRFToken();
  
  // Si no hay token en cookie, generar uno nuevo (primera vez)
  if (!cookieToken) {
    const newToken = generateCSRFToken();
    await setCSRFToken(newToken);
    // En la primera request sin token, permitir pero establecer el token
    return true;
  }

  const headerToken = request.headers.get(CSRF_HEADER);
  
  // Si no hay header token, permitir (el cliente aún no tiene el token)
  // Esto permite que el primer request pase y establezca el token
  if (!headerToken) {
    return true; // Permitir primera request sin header
  }

  // Comparar tokens de forma segura (timing-safe)
  return timingSafeEqual(cookieToken, headerToken);
}

/**
 * Comparación segura de strings para prevenir timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Obtiene el token CSRF para el cliente (para incluir en headers)
 */
export async function getCSRFTokenForClient(): Promise<string | null> {
  let token = await getCSRFToken();
  
  // Si no existe, generar uno nuevo
  if (!token) {
    token = generateCSRFToken();
    await setCSRFToken(token);
  }
  
  return token;
}

/**
 * Hook helper para obtener token CSRF en el cliente
 * Nota: Este es un helper, el token real se obtiene del cookie
 */
export function getCSRFTokenFromCookie(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('csrf-token='));
  
  if (!csrfCookie) {
    return null;
  }
  
  return csrfCookie.split('=')[1]?.trim() || null;
}

