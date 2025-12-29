import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { csrfMiddleware } from '@/middleware/csrf';

export async function middleware(request: NextRequest) {
  // Primero validar CSRF para requests que modifican datos
  const csrfResponse = await csrfMiddleware(request);
  if (csrfResponse) {
    return csrfResponse;
  }

  // Luego actualizar sesión
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

