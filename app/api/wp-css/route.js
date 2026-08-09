import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

const WP_HOSTS = new Set(['www.dgeniussolutions.com', 'dgeniussolutions.com']);
const WP_ORIGIN = process.env.WP_ORIGIN || 'https://www.dgeniussolutions.com';
const WP_HOME_URL = process.env.WP_HOME_URL || `${WP_ORIGIN}/`;
const WP_ABOUT_URL =
  process.env.WP_ABOUT_URL || `${WP_ORIGIN.replace(/\/$/, '')}/about-us/`;
const WP_AI_PRODUCTION_URL =
  process.env.WP_AI_PRODUCTION_URL ||
  `${WP_ORIGIN.replace(/\/$/, '')}/services/ai-video-production-agency/`;

export const runtime = 'nodejs';

function rewriteWpUrlsInCss(css = '') {
  const demo =
    process.env.DEMO_ORIGIN || 'https://dimgrey-goat-473970.hostingersite.com';
  const origin = demo.replace(/\/$/, '');
  return css
    .replace(
      /https?:\/\/(?:www\.)?dgeniussolutions\.com(\/wp-(?:content|includes)\/[^)'"\s]*)/gi,
      `${origin}/api/wp-media$1`
    )
    .replace(
      /url\(\s*(['"]?)\/\/(?:www\.)?dgeniussolutions\.com(\/wp-(?:content|includes)\/[^)'"\s]*)\1\s*\)/gi,
      `url($1${origin}/api/wp-media$2$1)`
    )
    .replace(
      /url\(\s*(['"]?)\/(wp-(?:content|includes)\/[^)'"\s]*)\1\s*\)/gi,
      `url($1${origin}/api/wp-media/$2$1)`
    );
}

function isAllowedCssUrl(src) {
  try {
    const url = new URL(src);
    if (!WP_HOSTS.has(url.hostname.toLowerCase())) return false;
    return url.pathname.startsWith('/wp-content/') || url.pathname.startsWith('/wp-includes/');
  } catch {
    return false;
  }
}

function absolutize(url = '') {
  if (!url) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `${WP_ORIGIN}${url}`;
  return url;
}

async function fetchCss(src) {
  const upstream = await fetch(src, {
    headers: {
      Accept: 'text/css,*/*;q=0.1',
      'User-Agent': 'DGS-NextJS-CssProxy/1.1',
    },
    next: { revalidate: 3600 },
  });
  if (!upstream.ok) {
    throw new Error(`Upstream CSS ${upstream.status} for ${src}`);
  }
  return rewriteWpUrlsInCss(await upstream.text());
}

async function collectPageCssUrls(pageUrl, label = 'page') {
  const res = await fetch(pageUrl, {
    headers: {
      Accept: 'text/html',
      'User-Agent': 'DGS-NextJS-CssProxy/1.1',
    },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Failed to fetch WP ${label} (${res.status})`);
  const html = await res.text();
  const seen = new Set();
  const srcs = [];
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    if (!/rel=["']stylesheet["']/i.test(tag)) continue;
    const href = tag.match(/href=["']([^"']+)["']/i)?.[1];
    if (!href || !/\.css(\?|$)/i.test(href)) continue;
    const abs = absolutize(href.replace(/&amp;/g, '&'));
    if (!isAllowedCssUrl(abs) || seen.has(abs)) continue;
    seen.add(abs);
    srcs.push(abs);
  }
  return srcs;
}

async function collectHomeCssUrls() {
  return collectPageCssUrls(WP_HOME_URL, 'home');
}

async function collectAboutCssUrls() {
  return collectPageCssUrls(WP_ABOUT_URL, 'about');
}

async function collectAiProductionCssUrls() {
  return collectPageCssUrls(WP_AI_PRODUCTION_URL, 'ai-production');
}

function softenFontDisplay(css = '', { mapToSyne = false } = {}) {
  // font-display:swap in WP/LiteSpeed faces caused CLS when deferred CSS applied.
  let out = css
    .replace(/font-display:\s*swap/gi, 'font-display:optional')
    .replace(/font-display:\s*block/gi, 'font-display:optional')
    .replace(/font-display:\s*fallback/gi, 'font-display:optional');
  if (mapToSyne) {
    // Ranking service pages: only intentional visual change is Syne.
    out = out
      .replace(/["']Manrope["']/g, "'Syne'")
      .replace(/\bManrope\b/g, 'Syne')
      .replace(/["']Space Grotesk["']/g, "'Syne'")
      .replace(/\bSpace Grotesk\b/g, 'Syne');
  }
  return out;
}

async function buildBundle(srcs) {
  const parts = [];
  const batchSize = 6;
  for (let i = 0; i < srcs.length; i += batchSize) {
    const batch = srcs.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (src) => {
        try {
          const css = await fetchCss(src);
          return `/* ${src} */\n${css}`;
        } catch (err) {
          return `/* failed ${src}: ${err?.message || 'error'} */`;
        }
      })
    );
    parts.push(...results);
  }
  return parts.join('\n\n');
}

/**
 * Same-origin CSS proxy for WordPress HTML mirrors.
 * Prefer ?bundle=home|about|ai-production — one cached stylesheet instead of
 * 50+ parallel requests that were rate-limiting Hostinger.
 */
export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const bundle = searchParams.get('bundle');

  if (bundle === 'home' || bundle === 'about' || bundle === 'ai-production') {
    try {
      const cacheKey =
        bundle === 'about'
          ? ['wp-css-bundle-about-v1']
          : bundle === 'ai-production'
            ? ['wp-css-bundle-ai-production-v1']
            : ['wp-css-bundle-home-v4'];
      const getBundle = unstable_cache(
        async () => {
          const srcs =
            bundle === 'about'
              ? await collectAboutCssUrls()
              : bundle === 'ai-production'
                ? await collectAiProductionCssUrls()
                : await collectHomeCssUrls();
          return softenFontDisplay(await buildBundle(srcs), {
            mapToSyne: bundle === 'ai-production',
          });
        },
        cacheKey,
        { revalidate: 3600 }
      );
      const css = await getBundle();
      return new NextResponse(css, {
        status: 200,
        headers: {
          'Content-Type': 'text/css; charset=utf-8',
          // Long cache: bundle URL is versioned from the page (?v=).
          'Cache-Control': 'public, max-age=604800, stale-while-revalidate=2592000',
          'CDN-Cache-Control': 'public, max-age=604800',
          'X-DGS-Css-Proxy': `bundle-${bundle}`,
        },
      });
    } catch (err) {
      return new NextResponse(`CSS ${bundle} bundle failed: ${err?.message || 'error'}`, {
        status: 502,
      });
    }
  }

  const src = searchParams.get('src');
  if (!src) {
    return new NextResponse('Missing src', { status: 400 });
  }
  if (!isAllowedCssUrl(src)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const css = await fetchCss(src);
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
