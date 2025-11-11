import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/app/lib/session';

/**
 * Proxy for optimistic authentication checks
 *
 * This performs fast, cookie-based checks before routes render.
 * Per Next.js docs: "useful for initial checks" and early redirects,
 * but "should not be your only line of defense."
 *
 * Security is enforced at the data layer (DAL) and Server Actions.
 *
 * @see https://nextjs.org/docs/app/building-your-application/authentication
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = ['/admin'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Optimistic check: read session cookie
    const sessionCookie = request.cookies.get('session')?.value;
    const session = await decrypt(sessionCookie);

    // If no valid session, redirect to login for better UX
    if (!session?.userId) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow the request to proceed
  // Actual security checks happen in DAL and Server Actions
  return NextResponse.next();
}

/**
 * Configure which paths the proxy should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /api (API routes)
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - /favicon.ico, /sitemap.xml, /robots.txt (metadata files)
     * - /login (login page itself)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|login).*)',
  ],
};
