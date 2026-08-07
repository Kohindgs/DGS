import { NextResponse } from 'next/server';

const WP_ORIGIN = process.env.WP_ORIGIN || 'https://www.dgeniussolutions.com';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAllowedPath(parts = []) {
  if (!parts.length) return false;
  const root = String(parts[0] || '').toLowerCase();
  return root === 'wp-content' || root === 'wp-includes';
}

function isScriptPath(pathname = '') {
  return /\.(?:js|mjs|css)(?:$|\?)/i.test(pathname);
}

/**
 * Same-origin media proxy for the WP homepage mirror.
 * Next.js rewrites for /wp-content return empty bodies for .webp on Hostinger,
 * and browsers often fail cross-origin video/image loads (ERR_CONNECTION_FAILED).
 *
 * Important: Node fetch auto-decompresses gzip/brotli but still exposes the
 * compressed Content-Length. Streaming that body while forwarding the compressed
 * length truncates jQuery/Envira JS (~29KB of ~87KB) and breaks gallery init.
 * Prefer identity encoding; buffer scripts so length always matches bytes.
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

  const range = request.headers.get('range');
  const scriptLike = isScriptPath(pathname);

  const headers = {
    'User-Agent': 'DGS-NextJS-MediaProxy/1.2',
    Accept: request.headers.get('accept') || '*/*',
    // Avoid compressed Content-Length vs decompressed body mismatch.
    'Accept-Encoding': 'identity',
  };
  if (range && !scriptLike) headers.Range = range;

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
  const pass = ['content-type', 'accept-ranges', 'etag', 'last-modified'];
  for (const key of pass) {
    const val = upstream.headers.get(key);
    if (val) out.set(key, val);
  }
  // Never forward content-encoding / compressed content-length from upstream.
  out.delete('content-encoding');
  out.delete('content-length');
  out.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  out.set('X-DGS-Media-Proxy', '1.2');

  // Scripts/CSS: buffer full body so clients never see truncated JS.
  // Do NOT set Content-Length — Hostinger/LiteSpeed may re-compress the
  // response and leave a mismatched length that truncates in browsers.
  // Keep CDN cache short for JS so a bad truncated HIT cannot stick.
  if (scriptLike) {
    const buf = Buffer.from(await upstream.arrayBuffer());
    out.set('X-DGS-Media-Bytes', String(buf.byteLength));
    out.set('Cache-Control', 'public, max-age=120, s-maxage=60, stale-while-revalidate=30');
    return new NextResponse(buf, {
      status: upstream.status,
      headers: out,
    });
  }

  // Media (images/video): stream. With identity encoding, length is safe to forward.
  const contentRange = upstream.headers.get('content-range');
  const contentLength = upstream.headers.get('content-length');
  const contentEncoding = upstream.headers.get('content-encoding');
  if (contentRange) out.set('Content-Range', contentRange);
  // Only forward length when upstream did not compress (identity / missing).
  if (contentLength && (!contentEncoding || /^(identity|)$/i.test(contentEncoding))) {
    out.set('Content-Length', contentLength);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: out,
  });
}
