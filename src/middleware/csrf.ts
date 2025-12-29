/**
 * Middleware para validar CSRF en API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateCSRFToken } from '@/lib/utils/csrf';

/**
 * Middleware para validar CSRF token en requests que modifican datos
 */
export async function csrfMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const method = request.method;
  
  // Solo validar métodos que modifican datos
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return null; // Continuar sin validación
  }

  // Excluir rutas que no necesitan CSRF (como auth callbacks, API routes internas)
  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith('/auth/') || 
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/csrf-token') ||
    pathname.startsWith('/_next/')
  ) {
    return null;
  }

  // Solo validar rutas de API
  if (!pathname.startsWith('/api/')) {
    return null;
  }

  // En desarrollo, ser más permisivo para evitar problemas iniciales
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const isValid = await validateCSRFToken(request);
  
  if (!isValid) {
    // En desarrollo, loggear pero permitir (para debugging)
    if (isDevelopment) {
      console.warn('[CSRF] Token validation failed, but allowing in development:', {
        pathname,
        method,
        hasCookie: !!request.cookies.get('csrf-token'),
        hasHeader: !!request.headers.get('x-csrf-token'),
      });
      return null; // Permitir en desarrollo
    }
    
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }

  return null; // Continuar con el request
}

