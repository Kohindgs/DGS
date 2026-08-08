import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();
  const path = request.nextUrl.pathname;

  // Local About cover art / public media — long cache for PageSpeed "efficient cache".
  if (path.startsWith('/media/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('CDN-Cache-Control', 'public, max-age=31536000');
    return response;
  }

  // Never CDN-cache HTML — stale Hostinger HITs were confusing users with old
  // site shells. Mirror body is still cached server-side for TTFB.
  if (path === '/' || request.headers.get('accept')?.includes('text/html')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('CDN-Cache-Control', 'no-store');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('X-DGS-Build', 'wp-mirror-2026-08-08e');
  }
  return response;
}

export const config = {
  matcher: ['/', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
