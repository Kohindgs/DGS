import { NextResponse } from 'next/server';

const WP_HOSTS = new Set(['www.dgeniussolutions.com', 'dgeniussolutions.com']);

export const runtime = 'nodejs';

/**
 * Same-origin CSS proxy for the WordPress homepage mirror.
 * Cross-origin stylesheets from www.dgeniussolutions.com are often blocked by
 * privacy browsers / tracker protection → text-only page. This route:
 * 1) serves CSS from the demo host
 * 2) rewrites absolute WP font/asset urls to same-origin /wp-content|/wp-includes
 *    so @font-face is not CORS-blocked either.
 */
export async function GET(request) {
  const src = request.nextUrl.searchParams.get('src');
  if (!src) {
    return new NextResponse('Missing src', { status: 400 });
  }

  let url;
  try {
    url = new URL(src);
  } catch {
    return new NextResponse('Bad src', { status: 400 });
  }

  if (!WP_HOSTS.has(url.hostname.toLowerCase())) {
    return new NextResponse('Forbidden host', { status: 403 });
  }
  if (!url.pathname.startsWith('/wp-content/') && !url.pathname.startsWith('/wp-includes/')) {
    return new NextResponse('Forbidden path', { status: 403 });
  }

  try {
    const upstream = await fetch(url.toString(), {
      headers: {
        Accept: 'text/css,*/*;q=0.1',
        'User-Agent': 'DGS-NextJS-CssProxy/1.0',
      },
      next: { revalidate: 3600 },
    });

    if (!upstream.ok) {
      return new NextResponse(`Upstream CSS ${upstream.status}`, { status: upstream.status });
    }

    let css = await upstream.text();
    css = rewriteWpUrlsInCss(css);

    return new NextResponse(css, {
      status: 200,
      headers: {
        'Content-Type': 'text/css; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-DGS-Css-Proxy': '1',
      },
    });
  } catch (err) {
    return new NextResponse(`CSS proxy failed: ${err?.message || 'error'}`, { status: 502 });
  }
}

function rewriteWpUrlsInCss(css = '') {
  return css
    .replace(
      /https?:\/\/(?:www\.)?dgeniussolutions\.com(\/wp-(?:content|includes)\/[^)'"\s]*)/gi,
      '$1'
    )
    .replace(
      /url\(\s*(['"]?)\/\/(?:www\.)?dgeniussolutions\.com(\/wp-(?:content|includes)\/[^)'"\s]*)\1\s*\)/gi,
      'url($1$2$1)'
    );
}
