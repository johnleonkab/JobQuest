import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { csrfMiddleware } from '@/middleware/csrf';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1. First validate CSRF for requests that modify data (POST, PUT, DELETE, etc.)
  // API routes and Server Actions might not go through intlMiddleware if they are not in [locale]
  // BUT the matcher covers them.
  const csrfResponse = await csrfMiddleware(request);
  if (csrfResponse) {
    return csrfResponse;
  }

  // 2. Run Next Intl Middleware to handle routing/locales
  // This will return a response (rewrite, redirect, or next)
  const intlResponse = intlMiddleware(request);

  // 3. Update Supabase Session
  // We pass the request to updateSession to check auth and refresh tokens
  // We need to capture the response from updateSession (which might contain set-cookie or be a redirect)
  const supabaseResponse = await updateSession(request);

  // If Supabase redirects (e.g. unauthenticated access to protected route), we respect that
  if (supabaseResponse.status === 307 || supabaseResponse.status === 302 || supabaseResponse.status === 303 || supabaseResponse.headers.get('location')) {
    return supabaseResponse;
  }

  // If authentication is fine, we return the intlResponse (which handles the locale routing)
  // BUT we must copy any cookies set by Supabase (e.g. refreshed session) to the intlResponse
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  return intlResponse;
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // However, match all pathnames within `/api`, except for `/_next`
    // '/(api|trpc)(.*)' 
    // Wait, API routes should NOT be localized usually.
    // The previous matcher was:
    // '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',

    // We want to exclude static files but INCLUDE everything else for intl routing
    '/',
    '/(es|en)/:path*',
    // Match protected routes to run middleware
    '/dashboard/:path*',
    '/profile/:path*',
    '/cv-builder/:path*',
    '/job-openings/:path*',
    '/gamification/:path*',
    '/auth/:path*'
  ],
};
