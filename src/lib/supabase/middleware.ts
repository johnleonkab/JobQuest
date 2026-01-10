import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // Create an initial response
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes - only protect routes under /dashboard, /profile, etc.
  const protectedPaths = ['/dashboard', '/profile', '/job-openings', '/cv-builder', '/gamification'];

  // Get pathname without locale
  const pathname = request.nextUrl.pathname;
  // Regex to remove /en, /es, etc. at the start
  // assuming locale is 2 chars. better to import locales from config but regex is safer for now
  const pathnameWithoutLocale = pathname.replace(/^\/(en|es)/, '') || '/';

  const isProtectedPath = protectedPaths.some(path =>
    pathnameWithoutLocale === path || pathnameWithoutLocale.startsWith(path + '/')
  );

  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth'; // Redirect to auth page, preserving locale if needed or just base
    // If we are in /en/dashboard, we probably want to go to /en/auth
    // but users might not be authenticated yet.
    // Better to just redirect to /auth and let next-intl middleware handle the locale redirect if needed (e.g. /auth -> /es/auth)
    // BUT if we return redirect here, next-intl middleware won't run on this response.
    // So we should construct the correct locale URL.

    // Check if path starts with locale
    const localeMatch = pathname.match(/^\/(en|es)/);
    const locale = localeMatch ? localeMatch[0] : '';

    url.pathname = `${locale}/auth`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
