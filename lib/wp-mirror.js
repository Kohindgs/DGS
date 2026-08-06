const WP_HOME_URL = process.env.WP_HOME_URL || 'https://www.dgeniussolutions.com/';
const WP_ORIGIN = process.env.WP_ORIGIN || 'https://www.dgeniussolutions.com';
/** Demo Next.js host — internal links point here while testing */
const DEMO_ORIGIN =
  process.env.DEMO_ORIGIN || 'https://dimgrey-goat-473970.hostingersite.com';

function absolutize(url = '') {
  if (!url) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `${WP_ORIGIN}${url}`;
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

function decodeDataScript(src = '') {
  if (!src.startsWith('data:text/javascript;base64,')) return null;
  try {
    return Buffer.from(src.split(',', 2)[1], 'base64').toString('utf8');
  } catch {
    return null;
  }
}

/** Prefer real media URLs over Smush/LiteSpeed SVG placeholders. */
export function hydrateLazyMedia(html = '') {
  return html.replace(/<(img|source|video|iframe)\b([^>]*)>/gi, (full, tag, attrs) => {
    const get = (name) => {
      const m = attrs.match(new RegExp(`\\s${name}=["']([^"']*)["']`, 'i'));
      return m ? m[1] : null;
    };
    const real =
      get('data-src') ||
      get('data-lazy-src') ||
      get('data-lazyload') ||
      get('data-original') ||
      get('data-bg');

    let nextAttrs = attrs;
    if (real && !real.startsWith('data:image/svg')) {
      nextAttrs = nextAttrs
        .replace(/\s(?:src|data-src|data-lazy-src|data-lazyload|data-original)=["'][^"']*["']/gi, '')
        .replace(/\sclass=(["'])([^"']*)\1/i, (_, q, cls) => {
          const cleaned = cls
            .replace(/\blazyload\b/g, '')
            .replace(/\blazyloading\b/g, '')
            .replace(/\s+/g, ' ')
            .trim();
          return ` class=${q}${cleaned} lazyloaded${q}`;
        });
      nextAttrs = ` src="${real}"${nextAttrs}`;
    } else {
      // still mark lazy classes resolved
      nextAttrs = nextAttrs.replace(/\sclass=(["'])([^"']*)\1/i, (_, q, cls) => {
        const cleaned = cls
          .replace(/\blazyload\b/g, 'lazyloaded')
          .replace(/\blazyloading\b/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        return ` class=${q}${cleaned}${q}`;
      });
    }

    const bg = get('data-bg') || get('data-background');
    if (bg && !/style=/i.test(nextAttrs)) {
      nextAttrs += ` style="background-image:url(${bg})"`;
    }

    return `<${tag}${nextAttrs}>`;
  });
}

/** Point site links at the demo host; keep CMS media/API on WordPress. */
export function rewriteDemoLinks(html = '', demoOrigin = DEMO_ORIGIN) {
  const demo = demoOrigin.replace(/\/$/, '');
  let out = html;

  // Logo + internal page links → demo host
  out = out.replace(
    /https?:\/\/(?:www\.)?dgeniussolutions\.com(?!\/wp-content\/|\/wp-includes\/|\/wp-json\/|\/wp-admin\/)/gi,
    demo
  );

  // Root logo explicitly
  out = out.replace(
    /(<a\b[^>]*\bid=["']dgsLogo["'][^>]*\bhref=["'])([^"']+)(["'])/i,
    `$1${demo}/$3`
  );
  out = out.replace(
    /(<a\b[^>]*\bhref=["'])([^"']+)(["'][^>]*\bid=["']dgsLogo["'])/i,
    `$1${demo}/$3`
  );

  return out;
}

export function stripAnalyticsNoise(html = '') {
  return html
    .replace(/<noscript>\s*<img[^>]*facebook\.com\/tr[^>]*>\s*<\/noscript>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?googletagmanager[\s\S]*?<\/script>/gi, '')
    .replace(/<script[^>]*src=["'][^"']*googletagmanager[^"']*["'][^>]*><\/script>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?fbq\s*\([\s\S]*?<\/script>/gi, '');
}

function isCriticalInline(code = '') {
  return (
    /dgsToggle|dgsSvc|dgsLockScroll|dgsOpenTalkPopup|dgsNav|dgs-v1215|__DGS_PORTFOLIO|lightbox|dgsLogo|portfolioData|initPortfolio|bootMotion|initThree|envira_gallery|fluentFormVars|fluent_form_ff_form_instance|fluentformElementor/.test(
      code
    ) && !/googletagmanager|fbq\s*\(|taboola|RocketPreloadLinksConfig/.test(code)
  );
}

function isCriticalExternal(src = '', scriptId = '') {
  if (/(?:jquery\.min\.js|gsap\.min\.js|ScrollTrigger\.min\.js|three(?:\.min)?\.js)/i.test(src)) {
    return true;
  }
  // Envira gallery + lightbox (case studies / brand gallery)
  if (/^envira-gallery/i.test(scriptId) || /envira-gallery(?:-script)?(?:\.min)?\.js/i.test(src)) {
    return true;
  }
  // FluentForm (Let's Talk) + reCAPTCHA
  if (
    /^fluent(?:form)?[-_]/i.test(scriptId) ||
    /fluent(?:-form|form)/i.test(src) ||
    /google\.com\/recaptcha/i.test(src) ||
    /^google-recaptcha/i.test(scriptId)
  ) {
    return true;
  }
  return false;
}

/** Point FluentForm AJAX at our same-origin proxy (WP admin-ajax blocks browser CORS). */
function rewriteFluentAjax(code = '', demoOrigin = DEMO_ORIGIN) {
  if (!/fluentFormVars|fluent_form_ff_form_instance|ajaxUrl/i.test(code)) return code;
  const proxy = `${demoOrigin.replace(/\/$/, '')}/api/fluentform`;
  return code
    .replace(
      /https:\\\/\\\/(?:www\.)?dgeniussolutions\.com\\\/wp-admin\\\/admin-ajax\.php/gi,
      proxy.replace(/\//g, '\\/')
    )
    .replace(
      /https:\/\/(?:www\.)?dgeniussolutions\.com\/wp-admin\/admin-ajax\.php/gi,
      proxy
    );
}

function extractStylesheets(html = '') {
  const seen = new Set();
  const sheets = [];
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    if (
      !/rel=["']stylesheet["']/i.test(tag) &&
      !/rel=["']icon["']/i.test(tag) &&
      !/apple-touch-icon/i.test(tag)
    ) {
      continue;
    }
    const href = tag.match(/href=["']([^"']+)["']/i)?.[1];
    if (!href) continue;
    const abs = absolutize(href.replace(/&amp;/g, '&'));
    if (seen.has(abs)) continue;
    seen.add(abs);
    sheets.push({
      href: abs,
      rel: tag.match(/rel=["']([^"']+)["']/i)?.[1] || 'stylesheet',
      media: tag.match(/media=["']([^"']+)["']/i)?.[1],
      sizes: tag.match(/sizes=["']([^"']+)["']/i)?.[1],
    });
  }
  return sheets;
}

/**
 * Portfolio thumbs rely on same-origin video frame capture on WP.
 * On the demo host that fails (cross-origin), and CSS keeps .thumb-video at
 * opacity:0 until .video-ready — so force -thumb.webp posters as visible images.
 */
function patchPortfolioScript(code = '') {
  if (!/portfolioData|__DGS_PORTFOLIO|initPortfolio/.test(code)) return code;

  let next = code.replace(/var\s+AUTO_THUMBS\s*=\s*!1\b/, 'var AUTO_THUMBS=!0');
  next = next.replace(/AUTO_THUMBS\s*=\s*!1\b/g, 'AUTO_THUMBS=!0');

  // Inject a visible <img class="thumb-img thumb-poster"> alongside the video.
  if (!/thumb-poster/.test(next) && /function imageHTML\(video,isWide\)/.test(next)) {
    next = next.replace(
      /var posterAttribute=thumb\?' poster="'\+escapeHTML\(thumb\)\+'"':'';return'<div class="thumb-fallback"><\/div>'\+'<video class="thumb-video"/,
      `var posterAttribute=thumb?' poster="'+escapeHTML(thumb)+'"':'';var posterImg=thumb?'<img class="thumb-img thumb-poster" src="'+escapeHTML(thumb)+'" alt="" loading="lazy" decoding="async" draggable="false">':'';return'<div class="thumb-fallback"></div>'+posterImg+'<video class="thumb-video"`
    );
  }

  return next;
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
  // Envira / FluentForm CSS is often printed in the footer — pull from full HTML
  const stylesheets = extractStylesheets(html);

  // Head + body styles (lightbox / Envira theme rules may live in footer style tags)
  const inlineStyles = [];
  const seenStyle = new Set();
  for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    const css = m[1];
    if (!css || seenStyle.has(css)) continue;
    seenStyle.add(css);
    inlineStyles.push(css);
  }

  const schemas = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(
    (m) => m[1].trim()
  );

  // Critical frontend scripts only (menu, WebGL bg, portfolio lightbox, Envira, FluentForm)
  const externalScripts = [];
  const seenExt = new Set();
  const inlineScripts = [];

  const pushExternal = (src, scriptId = '') => {
    const abs = absolutize(src);
    if (seenExt.has(abs)) return;
    seenExt.add(abs);
    let kind = 'lib';
    if (/jquery/i.test(abs) || /jquery/i.test(scriptId)) kind = 'jquery';
    else if (/^envira/i.test(scriptId) || /envira/i.test(abs)) kind = 'envira';
    else if (/^fluent/i.test(scriptId) || /fluent/i.test(abs)) kind = 'fluent';
    else if (/recaptcha/i.test(abs) || /recaptcha/i.test(scriptId)) kind = 'recaptcha';
    else if (/gsap|ScrollTrigger|three/i.test(abs)) kind = 'motion';
    externalScripts.push({ src: abs, id: scriptId, kind });
  };

  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = m[1] || '';
    const body = m[2] || '';
    if (/type=["']application\/ld\+json["']/i.test(attrs)) continue;
    const scriptId = attrs.match(/\sid=["']([^"']+)["']/i)?.[1] || '';
    const src = attrs.match(/\ssrc=["']([^"']+)["']/i)?.[1]?.replace(/&amp;/g, '&');
    if (src) {
      if (src.startsWith('data:text/javascript;base64,')) {
        const code = decodeDataScript(src);
        if (code && isCriticalInline(code)) inlineScripts.push(patchPortfolioScript(code));
      } else if (isCriticalExternal(src, scriptId)) {
        pushExternal(src, scriptId);
      }
      continue;
    }
    if (body && isCriticalInline(body)) inlineScripts.push(patchPortfolioScript(body));
  }

  // Stable CDN fallbacks if WP omitted them
  if (![...seenExt].some((s) => /gsap\.min\.js/i.test(s))) {
    pushExternal('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js', 'gsap-js');
  }
  if (![...seenExt].some((s) => /ScrollTrigger/i.test(s))) {
    pushExternal(
      'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
      'ScrollTrigger-js'
    );
  }
  if (![...seenExt].some((s) => /three/i.test(s))) {
    pushExternal('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js', 'three-js');
  }

  const bodyMatch = html.match(/<body([^>]*)>([\s\S]*)<\/body>/i);
  const bodyAttrs = bodyMatch?.[1] || '';
  const bodyId = bodyAttrs.match(/\sid=["']([^"']+)["']/i)?.[1] || 'cmsmasters_body';
  const bodyClass =
    bodyAttrs.match(/\sclass=["']([^"']+)["']/i)?.[1] ||
    'home page page-id-63505 elementor-default elementor-kit-33 elementor-page elementor-page-63505';

  let bodyHtml = bodyMatch?.[2] || '';
  bodyHtml = bodyHtml.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  bodyHtml = hydrateLazyMedia(bodyHtml);
  bodyHtml = stripAnalyticsNoise(bodyHtml);
  bodyHtml = rewriteDemoLinks(bodyHtml, DEMO_ORIGIN);

  // Soften Syne — WP ships 700/800; request asked for Syne but not thick
  const softenedStyles = inlineStyles.map((css) =>
    css.replace(/([^{}]*Syne[^{]*)\{([^}]*)\}/gi, (full, selector, body) => {
      const nextBody = body
        .replace(/font-weight:\s*800\s*!important/gi, 'font-weight: 500 !important')
        .replace(/font-weight:\s*700\s*!important/gi, 'font-weight: 500 !important')
        .replace(/font-weight:\s*800\b/gi, 'font-weight: 500')
        .replace(/font-weight:\s*700\b/gi, 'font-weight: 500');
      return `${selector}{${nextBody}}`;
    })
  );

  // Rewrite demo links inside inline scripts too (logo handlers etc.)
  // Keep CMS media URLs on WordPress (rewriteDemoLinks already skips /wp-content/).
  // Point FluentForm AJAX at same-origin proxy so browser CORS does not block submits.
  const demoInlineScripts = inlineScripts.map((code) =>
    rewriteFluentAjax(rewriteDemoLinks(code, DEMO_ORIGIN), DEMO_ORIGIN)
  );

  return {
    meta: {
      title: decodeEntities(titleMatch?.[1]?.trim() || "Digital Marketing Agency in Mumbai | D'Genius Solutions"),
      description: decodeEntities(
        descMatch?.[1] ||
          "D'Genius Solutions is a full service digital marketing agency in Mumbai offering connected search, website development, social media, performance marketing, branding and AI-led creative production."
      ),
      canonical: `${DEMO_ORIGIN}/`,
      og: {
        ...og,
        'og:url': `${DEMO_ORIGIN}/`,
      },
      robots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
    },
    stylesheets,
    inlineStyles: softenedStyles,
    schemas,
    bodyId,
    bodyClass,
    bodyHtml,
    externalScripts,
    inlineScripts: demoInlineScripts,
    demoOrigin: DEMO_ORIGIN,
  };
}
