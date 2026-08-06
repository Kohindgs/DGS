const WP_HOME_URL = process.env.WP_HOME_URL || 'https://www.dgeniussolutions.com/';

function absolutize(url = '') {
  if (!url) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `https://www.dgeniussolutions.com${url}`;
  return url;
}

function decodeEntities(text = '') {
  return text
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'");
}

/** Activate LiteSpeed/Rocket lazy media so images show without WP JS. */
export function hydrateLazyMedia(html = '') {
  let out = html;
  out = out.replace(/\sdata-src=(["'])(.*?)\1/gi, ' src=$1$2$1');
  out = out.replace(/\sdata-lazy-src=(["'])(.*?)\1/gi, ' src=$1$2$1');
  out = out.replace(/\sdata-lazyload=(["'])(.*?)\1/gi, ' src=$1$2$1');
  out = out.replace(/\sdata-bg=(["'])(.*?)\1/gi, (m, q, bg) => ` style=${q}background-image:url(${bg})${q}`);
  out = out.replace(/\sdata-background=(["'])(.*?)\1/gi, (m, q, bg) => ` style=${q}background-image:url(${bg})${q}`);
  // common noscript image fallbacks stay; remove rocket lazy placeholders if present
  out = out.replace(/\ssrc=["']data:image\/svg\+xml[^"']*["']/gi, '');
  return out;
}

export function stripAnalyticsNoise(html = '') {
  return html
    .replace(/<noscript>\s*<img[^>]*facebook\.com\/tr[^>]*>\s*<\/noscript>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?googletagmanager[\s\S]*?<\/script>/gi, '')
    .replace(/<script[^>]*src=["'][^"']*googletagmanager[^"']*["'][^>]*><\/script>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?fbq\s*\([\s\S]*?<\/script>/gi, '');
}

export async function getWpHomeMirror({ revalidate = 300 } = {}) {
  const res = await fetch(WP_HOME_URL, {
    headers: {
      Accept: 'text/html',
      'User-Agent': 'DGS-NextJS-Mirror/1.0',
    },
    next: { revalidate },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch WordPress homepage (${res.status})`);
  }
  const html = await res.text();

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const descMatch =
    html.match(/name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
    html.match(/content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const canonicalMatch = html.match(/rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);

  const og = {};
  for (const key of [
    'og:title',
    'og:description',
    'og:url',
    'og:site_name',
    'og:type',
    'og:locale',
    'og:image',
    'twitter:card',
    'twitter:title',
    'twitter:description',
    'twitter:image',
  ]) {
    const re1 = new RegExp(`(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`, 'i');
    const re2 = new RegExp(`content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`, 'i');
    const m = html.match(re1) || html.match(re2);
    if (m) og[key] = decodeEntities(m[1]);
  }

  const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '';
  const stylesheets = [...head.matchAll(/<link\b[^>]*>/gi)]
    .map((m) => m[0])
    .filter((tag) => /rel=["']stylesheet["']/i.test(tag) || /rel=["']icon["']/i.test(tag) || /apple-touch-icon/i.test(tag))
    .map((tag) => {
      const href = tag.match(/href=["']([^"']+)["']/i)?.[1];
      const rel = tag.match(/rel=["']([^"']+)["']/i)?.[1] || 'stylesheet';
      const media = tag.match(/media=["']([^"']+)["']/i)?.[1];
      const sizes = tag.match(/sizes=["']([^"']+)["']/i)?.[1];
      return href
        ? {
            href: absolutize(href.replace(/&amp;/g, '&')),
            rel,
            media,
            sizes,
          }
        : null;
    })
    .filter(Boolean);

  const inlineStyles = [...head.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]);

  const schemas = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(
    (m) => m[1].trim()
  );

  const bodyMatch = html.match(/<body([^>]*)>([\s\S]*)<\/body>/i);
  const bodyAttrs = bodyMatch?.[1] || '';
  const bodyId = bodyAttrs.match(/\sid=["']([^"']+)["']/i)?.[1] || 'cmsmasters_body';
  const bodyClass =
    bodyAttrs.match(/\sclass=["']([^"']+)["']/i)?.[1] ||
    'home page page-id-63505 elementor-default elementor-kit-33 elementor-page elementor-page-63505';

  let bodyHtml = bodyMatch?.[2] || '';
  // Drop deferred/external script tags from body; re-inject curated ones client-side
  bodyHtml = bodyHtml.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  bodyHtml = hydrateLazyMedia(bodyHtml);
  bodyHtml = stripAnalyticsNoise(bodyHtml);

  // Keep functional frontend scripts (jquery + gsap + three + WP litespeed bundles excluding GTM)
  const scriptSrcs = [...html.matchAll(/<script[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi)]
    .map((m) => absolutize(m[1].replace(/&amp;/g, '&')))
    .filter((src) => {
      if (src.startsWith('data:')) return false;
      if (/googletagmanager|google-analytics|gtag\/js|facebook\.net|fbevents/i.test(src)) return false;
      if (/recaptcha/i.test(src)) return false;
      return /dgeniussolutions\.com|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/.test(src);
    });

  // Prefer critical libs first
  const priority = [];
  const rest = [];
  for (const src of scriptSrcs) {
    if (/jquery\.min\.js/.test(src)) priority.unshift(src);
    else if (/gsap|ScrollTrigger|three\.min/.test(src)) priority.push(src);
    else rest.push(src);
  }
  const scripts = [...new Set([...priority, ...rest])];

  return {
    meta: {
      title: decodeEntities(titleMatch?.[1]?.trim() || "Digital Marketing Agency in Mumbai | D'Genius Solutions"),
      description: decodeEntities(
        descMatch?.[1] ||
          "D'Genius Solutions is a full service digital marketing agency in Mumbai offering connected search, website development, social media, performance marketing, branding and AI-led creative production."
      ),
      canonical: canonicalMatch?.[1] || 'https://www.dgeniussolutions.com/',
      og,
      robots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
    },
    stylesheets,
    inlineStyles,
    schemas,
    bodyId,
    bodyClass,
    bodyHtml,
    scripts,
  };
}
