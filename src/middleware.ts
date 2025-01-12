// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

import { getUserAndSession } from './auth/middleware'; // Adjust import path as needed

import { pdi_id } from './db/pdi/constants';
import { redis } from './db/redis'; // Adjust import path as needed

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Check if it's the PDI subdomain
  const isPDIHostname = hostname.startsWith('pdi.');

  if (isPDIHostname) {
    if (pathname !== '/students/register') {
      // Get session for authentication check
      const auth = await getUserAndSession(request);

      // If no session, redirect to signin page
      if (!auth) {
        const signinUrl = request.nextUrl.clone();
        signinUrl.pathname = '/signin';
        return NextResponse.redirect(signinUrl);
      }

      // Special handling for the root path on PDI subdomain
      if (pathname === '/') {
        // Check if user is admin
        const isAdmin = await redis.sismember(
          `membership|${auth.user.id}|${pdi_id}`,
          'admin',
        );

        // If not admin, redirect to /{their_id}
        if (!isAdmin) {
          const isParent = await redis.sismember(
            `membership|${auth.user.id}|${pdi_id}`,
            'parent',
          );

          if (isParent) {
            const userUrl = request.nextUrl.clone();
            userUrl.pathname = `/pdi/children`;
            return NextResponse.rewrite(userUrl);
          }

          const userUrl = request.nextUrl.clone();
          userUrl.pathname = `/pdi/${auth.user.id}`;
          return NextResponse.rewrite(userUrl);
        }
      }
    }

    // For all other PDI routes, rewrite to include /pdi prefix internally
    const url = request.nextUrl.clone();
    url.pathname = `/pdi${pathname}`;
    return NextResponse.rewrite(url);
  }

  // On main domain, if trying to access /pdi routes, redirect to PDI domain
  if (!isPDIHostname && pathname.startsWith('/pdi')) {
    const url = new URL(request.url);
    url.hostname = `pdi.${url.hostname}`;
    url.pathname = pathname.replace('/pdi', '');
    return NextResponse.redirect(url);
  }

  // Allow access to all other routes on main domain
  return NextResponse.next();
}

// Configure matcher for paths that should trigger the middleware
export const config = {
  matcher: [
    // Match all paths except static files, api routes, and signin page
    '/((?!api|_next/static|_next/image|favicon.ico|signin|validate).*)',
  ],
};
