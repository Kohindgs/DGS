import { NextResponse } from 'next/server';

const WP_ORIGIN = process.env.WP_ORIGIN || 'https://www.dgeniussolutions.com';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAllowedPath(parts = []) {
  if (!parts.length) return false;
  const root = String(parts[0] || '').toLowerCase();
  return root === 'wp-content' || root === 'wp-includes';
}

/**
 * Same-origin media proxy for the WP homepage mirror.
 * Next.js rewrites for /wp-content return empty bodies for .webp on Hostinger,
 * and browsers often fail cross-origin video/image loads (ERR_CONNECTION_FAILED).
 * This streams upstream bytes (with Range) so portfolio + case studies load.
 */
export async function GET(request, context) {
  const params = await context.params;
  const parts = params?.path || [];
  if (!isAllowedPath(parts)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const pathname = '/' + parts.map((p) => encodeURIComponent(p)).join('/');
  const upstreamUrl = new URL(pathname, `${WP_ORIGIN}/`);
  // Preserve query (cache-busters like ?v=20260707)
  request.nextUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.set(key, value);
  });

  const headers = {
    'User-Agent': 'DGS-NextJS-MediaProxy/1.0',
    Accept: request.headers.get('accept') || '*/*',
  };
  const range = request.headers.get('range');
  if (range) headers.Range = range;

  let upstream;
  try {
    upstream = await fetch(upstreamUrl.toString(), {
      headers,
      redirect: 'follow',
      cache: 'no-store',
    });
  } catch (err) {
    return new NextResponse(`Media proxy failed: ${err?.message || 'error'}`, {
      status: 502,
    });
  }

  if (!upstream.ok && upstream.status !== 206) {
    return new NextResponse(upstream.statusText || 'Not Found', {
      status: upstream.status,
    });
  }

  const out = new Headers();
  const pass = [
    'content-type',
    'content-length',
    'content-range',
    'accept-ranges',
    'etag',
    'last-modified',
  ];
  for (const key of pass) {
    const val = upstream.headers.get(key);
    if (val) out.set(key, val);
  }
  out.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  out.set('X-DGS-Media-Proxy', '1');

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: out,
  });
}
