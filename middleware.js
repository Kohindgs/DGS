import { NextResponse } from 'next/server';

export function middleware() {
  const res = NextResponse.next();
  res.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
  res.headers.set('CDN-Cache-Control', 'no-store');
  res.headers.set('Surrogate-Control', 'no-store');
  res.headers.set('Pragma', 'no-cache');
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
