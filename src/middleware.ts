// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  // Check if it's the PDI subdomain
  const isPDIHostname = hostname.startsWith('pdi.')
  
  if (isPDIHostname) {
    // On PDI subdomain, rewrite all routes to include /pdi prefix internally
    const url = request.nextUrl.clone()
    url.pathname = `/pdi${pathname}`
    return NextResponse.rewrite(url)
  }
  
  // On main domain, if trying to access /pdi routes, redirect to PDI domain
  if (!isPDIHostname && pathname.startsWith('/pdi')) {
    const url = new URL(request.url)
    url.hostname = `pdi.${url.hostname}`
    url.pathname = pathname.replace('/pdi', '')
    return NextResponse.redirect(url)
  }
  
  // Allow access to all other routes on main domain
  return NextResponse.next()
}

// Configure matcher for paths that should trigger the middleware
export const config = {
  matcher: [
    // Match all paths except static files and api routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}