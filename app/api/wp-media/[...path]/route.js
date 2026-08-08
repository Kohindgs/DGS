import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { tmpdir } from 'os';

const WP_ORIGIN = process.env.WP_ORIGIN || 'https://www.dgeniussolutions.com';
const RESIZE_CACHE_DIR = path.join(tmpdir(), 'dgs-wp-media-resize');

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

function isImagePath(pathname = '') {
  return /\.(?:png|jpe?g|gif|webp|avif)(?:$|\?)/i.test(pathname);
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
 *
 * Optional `dgs_w` query resizes images with sharp for PageSpeed "properly size images".
 */
export async function GET(request, context) {
  const params = await context.params;
  const parts = params?.path || [];
  if (!isAllowedPath(parts)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const pathname = '/' + parts.map((p) => encodeURIComponent(p)).join('/');
  const upstreamUrl = new URL(pathname, `${WP_ORIGIN}/`);
  const resizeW = Number(request.nextUrl.searchParams.get('dgs_w') || 0);
  // Preserve query (cache-busters like ?v=20260707) but never forward dgs_w upstream.
  request.nextUrl.searchParams.forEach((value, key) => {
    if (key === 'dgs_w') return;
    upstreamUrl.searchParams.set(key, value);
  });

  const range = request.headers.get('range');
  const scriptLike = isScriptPath(pathname);
  const imageLike = isImagePath(pathname);
  const wantsResize = imageLike && resizeW >= 40 && resizeW <= 2400 && !range;

  const headers = {
    'User-Agent': 'DGS-NextJS-MediaProxy/1.4',
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
      // Cache upstream WP bytes in Next's data cache (Range requests stay fresh).
      ...(range && !scriptLike
        ? { cache: 'no-store' }
        : { next: { revalidate: scriptLike ? 3600 : wantsResize ? 604800 : 86400 } }),
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
  // Long cache helps PSI "efficient cache lifetimes" (HTML stays no-store).
  out.set('Cache-Control', 'public, max-age=31536000, immutable');
  out.set('CDN-Cache-Control', 'public, max-age=31536000');
  out.set('X-DGS-Media-Proxy', '1.4');

  // Scripts/CSS: buffer full body so clients never see truncated JS.
  // Do NOT set Content-Length — Hostinger/LiteSpeed may re-compress the
  // response and leave a mismatched length that truncates in browsers.
  if (scriptLike) {
    const buf = Buffer.from(await upstream.arrayBuffer());
    out.set('X-DGS-Media-Bytes', String(buf.byteLength));
    out.set('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800');
    out.set('CDN-Cache-Control', 'public, max-age=86400');
    return new NextResponse(buf, {
      status: upstream.status,
      headers: out,
    });
  }

  if (wantsResize) {
    try {
      const width = Math.round(resizeW);
      const cacheKey = createHash('sha1')
        .update(`${pathname}|${width}|q72`)
        .digest('hex');
      const cachePath = path.join(RESIZE_CACHE_DIR, `${cacheKey}.webp`);
      try {
        const cached = await readFile(cachePath);
        out.set('Content-Type', 'image/webp');
        out.set('X-DGS-Media-Resize', String(width));
        out.set('X-DGS-Media-Resize-Cache', 'HIT');
        out.set('Cache-Control', 'public, max-age=31536000, immutable');
        return new NextResponse(cached, { status: 200, headers: out });
      } catch {
        /* miss — generate below */
      }

      const sharp = (await import('sharp')).default;
      const input = Buffer.from(await upstream.arrayBuffer());
      const resized = await sharp(input)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 72 })
        .toBuffer();
      out.set('Content-Type', 'image/webp');
      out.set('X-DGS-Media-Resize', String(width));
      out.set('X-DGS-Media-Resize-Cache', 'MISS');
      out.set('Cache-Control', 'public, max-age=31536000, immutable');
      mkdir(RESIZE_CACHE_DIR, { recursive: true })
        .then(() => writeFile(cachePath, resized))
        .catch(() => {});
      return new NextResponse(resized, { status: 200, headers: out });
    } catch (err) {
      // Fall through to streaming original if sharp fails.
      out.set('X-DGS-Media-Resize-Error', String(err?.message || 'resize-failed').slice(0, 80));
    }
  }

  // Media (images/video): stream. With identity encoding, length is safe to forward.
  // If resize failed after buffering, re-fetch once for the body stream.
  if (wantsResize && !out.get('X-DGS-Media-Resize')) {
    try {
      const again = await fetch(upstreamUrl.toString(), {
        headers,
        redirect: 'follow',
        next: { revalidate: 86400 },
      });
      if (again.ok) {
        const contentType = again.headers.get('content-type');
        if (contentType) out.set('Content-Type', contentType);
        return new NextResponse(again.body, { status: again.status, headers: out });
      }
    } catch {
      /* ignore */
    }
  }

  const contentRange = upstream.headers.get('content-range');
  const contentLength = upstream.headers.get('content-length');
  const contentEncoding = upstream.headers.get('content-encoding');
  if (contentRange) out.set('Content-Range', contentRange);
  if (contentLength && (!contentEncoding || /^(identity|)$/i.test(contentEncoding))) {
    out.set('Content-Length', contentLength);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: out,
  });
}
