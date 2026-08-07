import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();
  // Bust stale CDN/browser caches for HTML navigations
  if (request.nextUrl.pathname === '/' || request.headers.get('accept')?.includes('text/html')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('CDN-Cache-Control', 'no-store');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('X-DGS-Build', 'wp-mirror-2026-08-07e');
  }
  return response;
}

export const config = {
  matcher: ['/', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
