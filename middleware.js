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

  // Edge-cache HTML so PSI "document latency" / TTFB isn't a cold Node hit every run.
  // Build stamp header lets us confirm which revision the edge served.
  if (path === '/' || request.headers.get('accept')?.includes('text/html')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=0, s-maxage=300, stale-while-revalidate=900'
    );
    response.headers.set('CDN-Cache-Control', 'public, max-age=300, stale-while-revalidate=900');
    response.headers.set('Surrogate-Control', 'max-age=300');
    response.headers.set('X-DGS-Build', 'wp-mirror-2026-08-09a');
  }
  return response;
}

export const config = {
  matcher: ['/', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
