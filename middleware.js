import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();
  // Short CDN/HTML cache with SWR — mirror body is already server-cached 5m.
  // Build stamp still lets us verify deploys without forcing every HTML miss.
  if (request.nextUrl.pathname === '/' || request.headers.get('accept')?.includes('text/html')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=0, s-maxage=60, stale-while-revalidate=300'
    );
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    response.headers.set('X-DGS-Build', 'wp-mirror-2026-08-07o');
  }
  return response;
}

export const config = {
  matcher: ['/', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
