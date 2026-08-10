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

/**
 * Point WP stylesheets at our same-origin CSS proxy.
 * Privacy browsers often block third-party CSS from the WP domain → text-only page.
 * The proxy also rewrites absolute font urls inside the CSS to /wp-content|includes.
 */
export function toSameOriginStylesheet(href = '') {
  if (!href) return href;
  try {
    const u = new URL(absolutize(href));
    const host = u.hostname.replace(/^www\./i, '').toLowerCase();
    if (host !== 'dgeniussolutions.com') return absolutize(href);
    if (!u.pathname.startsWith('/wp-content/') && !u.pathname.startsWith('/wp-includes/')) {
      return absolutize(href);
    }
    return `/api/wp-css?src=${encodeURIComponent(u.toString())}`;
  } catch {
    return href;
  }
}

/**
 * Collapse many WP stylesheets into one same-origin bundle URL.
 * Dozens of parallel /api/wp-css hits were 429'ing Hostinger and looking "down".
 * Page routes append their own ?v= cache-buster on the <link>.
 */
export function toBundledStylesheet(_hrefs = [], bundle = 'home') {
  const allowed = new Set(['home', 'about', 'ai-production']);
  const safe = allowed.has(bundle) ? bundle : 'home';
  return `/api/wp-css?bundle=${safe}`;
}

/**
 * Point WP media at our same-origin media proxy.
 * Direct www.dgeniussolutions.com loads often fail in browsers (ERR_CONNECTION_FAILED),
 * and Hostinger Next rewrites for /wp-content return empty .webp bodies.
 */
export function rewriteWpMediaToProxy(input = '', demoOrigin = DEMO_ORIGIN) {
  if (!input) return input;
  const demo = demoOrigin.replace(/\/$/, '');
  const toProxy = (_full, pathAndQuery) => {
    const cleaned = String(pathAndQuery || '').replace(/^\/+/, '');
    return `${demo}/api/wp-media/${cleaned}`;
  };

  let out = input;
  // Absolute URLs
  out = out.replace(
    /https?:\/\/(?:www\.)?dgeniussolutions\.com\/(wp-(?:content|includes)\/[^"'\\s)\]]*)/gi,
    toProxy
  );
  // JS-escaped absolute URLs (https:\/\/www...\/wp-content\/...)
  out = out.replace(
    /https?:\\\/\\\/(?:www\.)?dgeniussolutions\.com\\\/(wp-(?:content|includes)\\\/[^"'\\s)\]]*)/gi,
    (_full, escapedPath) => {
      const path = String(escapedPath).replace(/\\\//g, '/');
      return `${demo}/api/wp-media/${path}`.replace(/\//g, '\\/');
    }
  );
  // Root-relative /wp-content that would hit the broken Hostinger rewrite for webp
  out = out.replace(
    /(^|["'(=\s])\/(wp-(?:content|includes)\/[^"'\\s)\]]*)/gi,
    (full, prefix, pathAndQuery) => `${prefix}${demo}/api/wp-media/${pathAndQuery}`
  );
  return out;
}

/** Same-origin proxy URL for a WP wp-content / wp-includes asset (js/css/media). */
export function toSameOriginWpAsset(url = '', demoOrigin = DEMO_ORIGIN) {
  if (!url) return url;
  try {
    const u = new URL(absolutize(url));
    const host = u.hostname.replace(/^www\./i, '').toLowerCase();
    if (host !== 'dgeniussolutions.com') return u.toString();
    if (!u.pathname.startsWith('/wp-content/') && !u.pathname.startsWith('/wp-includes/')) {
      return u.toString();
    }
    const demo = demoOrigin.replace(/\/$/, '');
    // Bust CDN HITs of previously truncated JS responses.
    if (/\.(?:js|mjs|css)$/i.test(u.pathname) && !u.searchParams.has('dgsv')) {
      u.searchParams.set('dgsv', '20260807m');
    }
    return `${demo}/api/wp-media${u.pathname}${u.search}`;
  } catch {
    return url;
  }
}

/** Rewrite absolute WP asset urls in CSS so fonts/icons load same-origin via media proxy. */
export function rewriteWpUrlsInCss(css = '', demoOrigin = DEMO_ORIGIN) {
  return rewriteWpMediaToProxy(css, demoOrigin);
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

function isPlaceholderSrc(url = '') {
  if (!url) return true;
  if (url.startsWith('data:image/svg')) return true;
  // Envira/LiteSpeed 1×1 GIF placeholder used in src/srcset while waiting on lazy-load.
  if (/^data:image\/gif;base64,/i.test(url)) return true;
  return false;
}

/** Prefer real media URLs over Smush/LiteSpeed/Envira placeholders. */
export function hydrateLazyMedia(html = '') {
  return html.replace(/<(img|source|video|iframe)\b([^>]*)>/gi, (full, tag, attrs) => {
    const get = (name) => {
      const m = attrs.match(new RegExp(`\\s${name}=["']([^"']*)["']`, 'i'));
      return m ? m[1] : null;
    };
    const real =
      get('data-envira-src') ||
      get('data-src') ||
      get('data-lazy-src') ||
      get('data-lazyload') ||
      get('data-original') ||
      get('data-bg');
    const realSrcset =
      get('data-envira-srcset') || get('data-srcset') || get('data-lazy-srcset');

    let nextAttrs = attrs;
    const srcNow = get('src');
    const needsSrc = real && !isPlaceholderSrc(real) && (!srcNow || isPlaceholderSrc(srcNow));

    if (needsSrc) {
      nextAttrs = nextAttrs.replace(/\ssrc=["'][^"']*["']/gi, '');
      nextAttrs = ` src="${real}"${nextAttrs}`;
    } else if (real && !isPlaceholderSrc(real) && srcNow && isPlaceholderSrc(srcNow)) {
      nextAttrs = nextAttrs.replace(/\ssrc=["'][^"']*["']/gi, ` src="${real}"`);
    }

    // Envira keeps a GIF in srcset even when src/data-envira-src is real — browsers
    // prefer srcset and stay at naturalWidth=1, so the justified gallery never lays out.
    const srcsetNow = get('srcset');
    if (realSrcset && !isPlaceholderSrc(realSrcset.split(/\s/)[0] || '')) {
      if (/\ssrcset=/i.test(nextAttrs)) {
        nextAttrs = nextAttrs.replace(/\ssrcset=["'][^"']*["']/gi, ` srcset="${realSrcset}"`);
      } else {
        nextAttrs += ` srcset="${realSrcset}"`;
      }
    } else if (srcsetNow && isPlaceholderSrc(srcsetNow.split(/\s/)[0] || '')) {
      nextAttrs = nextAttrs.replace(/\ssrcset=["'][^"']*["']/gi, '');
    }

    nextAttrs = nextAttrs.replace(/\sclass=(["'])([^"']*)\1/i, (_, q, cls) => {
      const cleaned = cls
        .replace(/\blazyload\b/g, '')
        .replace(/\blazyloading\b/g, '')
        .replace(/\benvira-lazy\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      const withLoaded = /\blazyloaded\b/.test(cleaned) ? cleaned : `${cleaned} lazyloaded`.trim();
      return ` class=${q}${withLoaded}${q}`;
    });

    const bg = get('data-bg') || get('data-background');
    if (bg && !/style=/i.test(nextAttrs)) {
      nextAttrs += ` style="background-image:url(${bg})"`;
    }

    return `<${tag}${nextAttrs}>`;
  });
}

/**
 * Prefer smaller downloads for gallery / tile images via the media proxy
 * `dgs_w` resize param (sharp). Avoid inventing missing WP `-300x…` files
 * (those 404 and fail PageSpeed "Browser errors").
 */
export function compactEnviraImageSources(html = '') {
  const withWidth = (url, w) => {
    if (!url || !/\/api\/wp-media\//i.test(url)) return null;
    if (/\.(?:mp4|webm|m4v)(?:$|\?)/i.test(url)) return null;
    try {
      const u = new URL(url, 'https://dimgrey-goat-473970.hostingersite.com');
      u.searchParams.delete('dgs_w');
      u.searchParams.set('dgs_w', String(w));
      return `${u.pathname}?${u.searchParams.toString()}`;
    } catch {
      const base = url.split('#')[0];
      const bare = base.replace(/([?&])dgs_w=\d+/g, '').replace(/[?&]$/, '');
      const join = bare.includes('?') ? '&' : '?';
      return `${bare}${join}dgs_w=${w}`;
    }
  };

  const stripWidth = (url) => {
    try {
      const u = new URL(url, 'https://dimgrey-goat-473970.hostingersite.com');
      u.searchParams.delete('dgs_w');
      const q = u.searchParams.toString();
      return q ? `${u.pathname}?${q}` : u.pathname;
    } catch {
      return String(url).replace(/([?&])dgs_w=\d+/g, '').replace(/[?&]$/, '');
    }
  };

  return html.replace(/<img\b([^>]*)>/gi, (full, attrs) => {
    const cls = (attrs.match(/\bclass=["']([^"']*)["']/i) || [])[1] || '';
    const id = (attrs.match(/\bid=["']([^"']*)["']/i) || [])[1] || '';
    // Never downscale LCP/site logo via the generic pass (hero has its own optimizer).
    if (id === 'dgs-v1215-robot' || id === 'dgsLogo') return full;
    if (/\b(?:custom-logo|dgs-logo|site-logo|dgs-v1215-robot)\b/i.test(cls)) return full;

    const isTile =
      /\benvira-gallery-image\b/i.test(cls) ||
      /\bthumb-img\b/i.test(cls) ||
      /\bcase-.*img\b/i.test(cls);
    const isCaseMedia = /\bdgs-v1215-case-media\b|\bdgs-weavings-case-media\b/i.test(attrs);
    const isLogoTile = /\bdgs-v1215-logo-tile\b/i.test(attrs);
    const get = (name) => {
      const m = attrs.match(new RegExp(`\\s${name}=["']([^"']*)["']`, 'i'));
      return m ? m[1] : null;
    };
    const src = get('src') || get('data-envira-src') || get('data-src') || '';
    if (!src || isPlaceholderSrc(src) || !/\/api\/wp-media\//i.test(src)) return full;
    if (/\.(?:mp4|webm|m4v)(?:$|\?)/i.test(src)) return full;

    const dim = src.match(/-(\d+)x(\d+)\./);
    const srcW = dim ? Number(dim[1]) : 0;
    const isScaled = /-scaled\./i.test(src);
    // Portrait story tiles are often 576-wide but shown ~50px; still compact them.
    const shouldCompact =
      isTile ||
      isCaseMedia ||
      isLogoTile ||
      isScaled ||
      srcW >= 400 ||
      (/smush-webp/i.test(src) && srcW >= 360);
    if (!shouldCompact) return full;

    const fullSrc = stripWidth(src);
    // Logo wall ~230px; case screenshots ~half viewport; Envira tiles ~280–320px.
    // Never put the naked master in srcset — browsers/Lighthouse will fetch it
    // (full tile ≈ 400KB vs dgs_w=320 ≈ 15KB) and tank Speed Index.
    const w1 = isLogoTile ? 230 : isCaseMedia || isScaled ? 640 : 320;
    const w2 = isLogoTile ? 460 : isCaseMedia || isScaled ? 960 : 640;
    const srcSmall = withWidth(fullSrc, w1);
    const srcMid = withWidth(fullSrc, w2);
    if (!srcSmall || !srcMid) return full;

    const candidates = [`${srcSmall} ${w1}w`, `${srcMid} ${w2}w`];

    let a = attrs;
    const setAttr = (name, value) => {
      if (new RegExp(`\\s${name}=`, 'i').test(a)) {
        a = a.replace(new RegExp(`\\s${name}=["'][^"']*["']`, 'i'), ` ${name}="${value}"`);
      } else {
        a += ` ${name}="${value}"`;
      }
    };

    setAttr('src', srcSmall);
    setAttr('srcset', candidates.join(', '));
    setAttr(
      'sizes',
      isLogoTile
        ? '230px'
        : isCaseMedia || isScaled
          ? '(max-width: 900px) 92vw, 560px'
          : isTile
            ? '(max-width: 900px) 46vw, 320px'
            : '(max-width: 900px) 40vw, 200px'
    );
    setAttr('data-dgs-full-src', fullSrc);
    // Keep Envira/lazy attrs on the compact URL so JS cannot swap back to masters.
    setAttr('data-envira-src', srcSmall);
    setAttr('data-envira-srcset', candidates.join(', '));
    if (/\sdata-src=/i.test(a)) setAttr('data-src', srcSmall);
    if (/\sdata-srcset=/i.test(a)) setAttr('data-srcset', candidates.join(', '));
    if (/\sdata-lazy-src=/i.test(a)) setAttr('data-lazy-src', srcSmall);
    if (/\sdata-lazy-srcset=/i.test(a)) setAttr('data-lazy-srcset', candidates.join(', '));

    return `<img${a}>`;
  });
}

/**
 * Resize images inside known below-fold containers (case studies / logo wall)
 * where the <img> itself does not carry the container class.
 */
export function compactContainerImages(html = '') {
  const withWidth = (url, w) => {
    if (!url || !/\/api\/wp-media\//i.test(url) || isPlaceholderSrc(url)) return null;
    if (/\.(?:mp4|webm|m4v)(?:$|\?)/i.test(url)) return null;
    try {
      const u = new URL(url, 'https://dimgrey-goat-473970.hostingersite.com');
      u.searchParams.delete('dgs_w');
      u.searchParams.set('dgs_w', String(w));
      return `${u.pathname}?${u.searchParams.toString()}`;
    } catch {
      const bare = String(url).replace(/([?&])dgs_w=\d+/g, '').replace(/[?&]$/, '');
      return `${bare}${bare.includes('?') ? '&' : '?'}dgs_w=${w}`;
    }
  };

  const rewriteImg = (imgTag, w1, w2, sizes) =>
    imgTag.replace(/<img\b([^>]*)>/i, (full, attrs) => {
      if (/\bid=["']dgs-v1215-robot["']/i.test(attrs) || /\bid=["']dgsLogo["']/i.test(attrs)) {
        return full;
      }
      const srcMatch = attrs.match(/\ssrc=["']([^"']+)["']/i);
      const src = srcMatch?.[1];
      if (!src || !/\/api\/wp-media\//i.test(src) || /\bdgs_w=/.test(src)) return full;
      const fullSrc = src.replace(/([?&])dgs_w=\d+/g, '').replace(/[?&]$/, '');
      const s1 = withWidth(fullSrc, w1);
      const s2 = withWidth(fullSrc, w2);
      if (!s1 || !s2) return full;
      let a = attrs;
      const setAttr = (name, value) => {
        if (new RegExp(`\\s${name}=`, 'i').test(a)) {
          a = a.replace(new RegExp(`\\s${name}=["'][^"']*["']`, 'i'), ` ${name}="${value}"`);
        } else {
          a += ` ${name}="${value}"`;
        }
      };
      setAttr('src', s1);
      // Compact-only srcset — master kept on data-dgs-full-src for lightbox/error.
      setAttr('srcset', `${s1} ${w1}w, ${s2} ${w2}w`);
      setAttr('sizes', sizes);
      setAttr('data-dgs-full-src', fullSrc);
      return `<img${a}>`;
    });

  let next = html;
  // Case-study screenshots (often full "scaled" WP uploads).
  next = next.replace(
    /<(div|figure|a)\b([^>]*\b(?:dgs-v1215-case-media|dgs-weavings-case-media|dgs-v1215-case-visual)[^>]*)>([\s\S]*?)<\/\1>/gi,
    (full, tag, attrs, inner) =>
      `<${tag}${attrs}>${inner.replace(/<img\b[^>]*>/gi, (img) =>
        rewriteImg(img, 640, 960, '(max-width: 900px) 92vw, 560px')
      )}</${tag}>`
  );
  // Client logo wall — paint ~230 CSS px; 2x = 460.
  next = next.replace(
    /<(div|a)\b([^>]*\bdgs-v1215-logo-tile[^>]*)>([\s\S]*?)<\/\1>/gi,
    (full, tag, attrs, inner) =>
      `<${tag}${attrs}>${inner.replace(/<img\b[^>]*>/gi, (img) =>
        rewriteImg(img, 230, 460, '230px')
      )}</${tag}>`
  );
  return next;
}

/**
 * Keep the visual UI identical while telling the browser what can wait.
 * Hero robot stays high-priority; Envira keeps the first tiles eager so the
 * justified gallery can measure; everything else is lazy.
 */
export function applyPerfImageHints(html = '', { prioritizeFirstUpload = false } = {}) {
  let promotedFirstUpload = false;
  return html.replace(/<img\b([^>]*)>/gi, (_full, attrs) => {
    let a = attrs;
    const id = (a.match(/\bid=["']([^"']+)["']/i) || [])[1] || '';
    const cls = (a.match(/\bclass=["']([^"']+)["']/i) || [])[1] || '';
    const src = (a.match(/\bsrc=["']([^"']+)["']/i) || [])[1] || '';
    const isRobot = id === 'dgs-v1215-robot' || /\bdgs-v1215-robot\b/.test(cls);
    const isLogo =
      id === 'dgsLogo' ||
      /\b(?:custom-logo|dgs-logo|site-logo)\b/i.test(cls) ||
      (/logo/i.test(cls) && /\b(?:header|nav|brand)\b/i.test(cls)) ||
      /DGS-LOGO/i.test(src);
    const isFirstUploadLcp =
      prioritizeFirstUpload &&
      !promotedFirstUpload &&
      !isLogo &&
      !isRobot &&
      /wp-content\/uploads/i.test(src) &&
      !/facebook\.com\/tr|fbpx|simpleicons|gravatar/i.test(src);

    a = a
      .replace(/\sloading=["'][^"']*["']/gi, '')
      .replace(/\sfetchpriority=["'][^"']*["']/gi, '')
      .replace(/\sdecoding=["'][^"']*["']/gi, '');

    if (isRobot || isFirstUploadLcp) {
      if (isFirstUploadLcp) promotedFirstUpload = true;
      a += ' loading="eager" fetchpriority="high" decoding="async"';
    } else if (isLogo) {
      a += ' loading="eager" decoding="async"';
    } else {
      // Case studies, Envira tiles, and the rest wait until near the viewport so
      // the hero LCP image is not connection-starved.
      a += ' loading="lazy" decoding="async"';
    }
    return `<img${a}>`;
  });
}

/** Best-effort LCP candidate from the mirrored hero robot image. */
export function extractLcpImageUrl(html = '') {
  const byId =
    html.match(
      /<img\b[^>]*\bid=["']dgs-v1215-robot["'][^>]*\bsrc=["']([^"']+)["'][^>]*>/i
    ) ||
    html.match(
      /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*\bid=["']dgs-v1215-robot["'][^>]*>/i
    );
  if (byId?.[1] && !isPlaceholderSrc(byId[1])) return byId[1];
  return null;
}

/** About Us LCP: first real upload image (founders), skipping logos/trackers. */
export function extractAboutLcpImageUrl(html = '') {
  for (const m of html.matchAll(/<img\b([^>]*)>/gi)) {
    const attrs = m[1] || '';
    const src = attrs.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    if (!src || isPlaceholderSrc(src)) continue;
    if (!/wp-content\/uploads/i.test(src)) continue;
    if (/DGS-LOGO|logo|facebook\.com\/tr|fbpx|simpleicons|gravatar/i.test(`${attrs} ${src}`)) {
      continue;
    }
    return src;
  }
  return null;
}

/**
 * Point the hero robot at pre-baked local WebPs (public/media via /api/local-media).
 * Avoids cold sharp resize + WP upstream on the LCP path (~0.5–1.2s savings).
 */
export function optimizeHeroRobotImage(html = '', demoOrigin = DEMO_ORIGIN) {
  const src640 = '/api/local-media/dgs-hero-robot-640.webp';
  const src720 = '/api/local-media/dgs-hero-robot-720.webp';
  const src800 = '/api/local-media/dgs-hero-robot-800.webp';
  return html.replace(/<img\b([^>]*\bid=["']dgs-v1215-robot["'][^>]*)>/i, (_full, attrs) => {
    let a = attrs;
    a = a
      .replace(/\ssrc=["'][^"']*["']/i, ` src="${src640}"`)
      .replace(/\ssrcset=["'][^"']*["']/gi, '')
      .replace(/\ssizes=["'][^"']*["']/gi, '')
      .replace(/\swidth=["'][^"']*["']/gi, '')
      .replace(/\sheight=["'][^"']*["']/gi, '')
      .replace(/\sdata-dgs-full-src=["'][^"']*["']/gi, '');
    a += ` srcset="${src640} 640w, ${src720} 720w, ${src800} 800w"`;
    a += ' sizes="(max-width: 900px) 320px, 480px"';
    a += ' width="1024" height="1024"';
    return `<img${a}>`;
  });
}

/** Canonical LCP preload for the homepage hero robot. */
export function getHeroRobotLcpPreload() {
  return {
    href: '/api/local-media/dgs-hero-robot-640.webp',
    srcSet:
      '/api/local-media/dgs-hero-robot-640.webp 640w, /api/local-media/dgs-hero-robot-720.webp 720w, /api/local-media/dgs-hero-robot-800.webp 800w',
    sizes: '(max-width: 900px) 320px, 480px',
  };
}

/**
 * Move the hero banner "about" paragraph into a dedicated About Us section
 * under the hero/rail, with an on-page YouTube embed (no outbound play, no related).
 */
export function relocateHeroAboutSection(html = '', demoOrigin = DEMO_ORIGIN) {
  const demo = demoOrigin.replace(/\/$/, '');
  const coverAlt =
    "DGS Anthem cover — studio microphone with golden light, YOU DREAM and WE EXECUTE, plus strategy, design, marketing, web development, SEO, analytics and branding.";
  // Serve via /api/local-media so Cache-Control survives Hostinger static CDN.
  const coverSrc = '/api/local-media/dgs-anthem-cover-1280.webp';
  const coverSrcset =
    '/api/local-media/dgs-anthem-cover-960.webp 960w, /api/local-media/dgs-anthem-cover-1280.webp 1280w, /api/local-media/dgs-anthem-cover-1600.webp 1600w';
  const coverSizes = '100vw';

  // Already has the latest centered layout — only refresh cover attrs.
  if (/id=["']dgs-about["']/.test(html) && /dgs-v1215-about-head/.test(html)) {
    return html.replace(
      /(<button\b[^>]*class=["'][^"']*dgs-about-video[^"']*["'][^>]*>)([\s\S]*?)(<\/button>)/i,
      `$1<img src="${coverSrc}" srcset="${coverSrcset}" sizes="${coverSizes}" width="1280" height="720" alt="${coverAlt}" loading="lazy" decoding="async" />
      <span class="dgs-about-video-play" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M8 5.5v13l11-6.5L8 5.5z"/></svg>
      </span>$3`
    );
  }

  let aboutCopy =
    "D'Genius Solutions is a full service digital marketing agency in Mumbai helping brands grow through connected search, websites, social media, paid campaigns, branding and AI-led creative production.";

  // Drop any older about layout so deploys upgrade cleanly.
  let next = html.replace(/<section class=["']dgs-v1215-about["'][\s\S]*?<\/section>/i, '');

  next = next.replace(
    /(<div class=["']dgs-v1215-copy[^"']*["'][^>]*>[\s\S]*?<h1[\s\S]*?<\/h1>)\s*<p>([\s\S]*?)<\/p>/i,
    (_full, before, pHtml) => {
      const text = String(pHtml)
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&#8217;|&rsquo;|’/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
      if (text) aboutCopy = text;
      return before;
    }
  );

  const section = `
<section class="dgs-v1215-about" id="dgs-about" aria-label="About Us">
  <div class="dgs-v1215-shell">
    <div class="dgs-v1215-section-head dgs-v1215-about-head dgs-v1215-reveal">
      <div class="dgs-v1215-section-kicker">About Us</div>
      <h2>Innovators Driven by Passion &amp; Purpose Since 2021</h2>
      <p>${aboutCopy.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
      <p class="dgs-v1215-about-founders">Founded by Sneha &amp; Kohin Bellara — a tribe of creators, strategists and tech enthusiasts building transparent, AI-led growth partnerships.</p>
      <div class="dgs-v1215-actions dgs-v1215-about-actions">
        <a href="${demo}/about-us/" class="dgs-v1215-btn dgs-v1215-btn-secondary">Explore About Us <span>→</span></a>
        <a href="${demo}/about-us/" class="dgs-v1215-about-inline">Read our full story</a>
      </div>
    </div>
  </div>
  <div class="dgs-v1215-about-media dgs-v1215-reveal">
    <button type="button" class="dgs-about-video" data-dgs-yt="YbeRRCXA_ZE" aria-label="Play D'Genius Solutions anthem video">
      <img src="${coverSrc}" srcset="${coverSrcset}" sizes="${coverSizes}" width="1280" height="720" alt="${coverAlt}" loading="lazy" decoding="async" />
      <span class="dgs-about-video-play" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M8 5.5v13l11-6.5L8 5.5z"/></svg>
      </span>
    </button>
  </div>
</section>`;

  // Prefer after the capability rail (still under the banner band); else after hero.
  if (/<section class=["']dgs-v1215-rail["'][\s\S]*?<\/section>/i.test(next)) {
    next = next.replace(
      /(<section class=["']dgs-v1215-rail["'][\s\S]*?<\/section>)/i,
      `$1${section}`
    );
  } else {
    next = next.replace(
      /(<section class=["']dgs-v1215-hero["'][\s\S]*?<\/section>)/i,
      `$1${section}`
    );
  }

  return next;
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

/** Inline scripts that must run ASAP (menu / talk popup / scroll lock). */
export function isNavBootScript(code = '') {
  return (
    /dgsToggle|dgsSvc|dgsLockScroll|dgsUnlockScroll|dgsOpenTalkPopup|dgsNav|dgsLogo|dgs-talk/i.test(
      code
    ) &&
    !/portfolioData|bootMotion|initPortfolio|__DGS_PORTFOLIO|__DGS_AI_VIDEO_PORTFOLIO__/i.test(code)
  );
}

/** AI Production portfolio + FAQ accordion boot. */
export function isAiPortfolioBootScript(code = '') {
  return /__DGS_AI_VIDEO_PORTFOLIO__|\.faq-q/i.test(code) && /portfolioData/i.test(code);
}

export function stripAnalyticsNoise(html = '') {
  return html
    .replace(/<noscript>\s*<img[^>]*facebook\.com\/tr[^>]*>\s*<\/noscript>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?googletagmanager[\s\S]*?<\/script>/gi, '')
    .replace(/<script[^>]*src=["'][^"']*googletagmanager[^"']*["'][^>]*><\/script>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?fbq\s*\([\s\S]*?<\/script>/gi, '');
}

/** WP stamps <link rel=preload as=video> for every portfolio MP4 — skip on mirror. */
function isMp4PreloadStampede(code = '') {
  return /link\.rel\s*=\s*['"]preload['"]/.test(code) && /as\s*=\s*['"]video['"]/.test(code);
}

/** AI Production particle-sphere background (Three.js). */
export function isWebglBootScript(code = '') {
  return /global-webgl-background/.test(code) && /THREE\.WebGLRenderer/.test(code);
}

function isCriticalInline(code = '', mode = 'home') {
  if (isMp4PreloadStampede(code)) return false;
  if (mode === 'service' && isWebglBootScript(code)) return true;
  // Avoid bare "lightbox" — it kept Elementor frontend config (~3KB) for no gain.
  return (
    /dgsToggle|dgsSvc|dgsLockScroll|dgsOpenTalkPopup|dgsNav|__DGS_PORTFOLIO|__DGS_AI_VIDEO_PORTFOLIO__|portfolio-lightbox|dgsLogo|portfolioData|initPortfolio|bootMotion|envira_gallery|fluentFormVars|fluent_form_ff_form_instance|fluentformElementor|dgsRunAiPrompt|dgsAiPromptText|dgsShowAiPromptToast|\.faq-q/.test(
      code
    ) &&
    !/googletagmanager|fbq\s*\(|taboola|RocketPreloadLinksConfig|elementorFrontendConfig/.test(
      code
    )
  );
}

/**
 * Contact form section already embeds the FluentForm — the trailing
 * "Start With A Growth Audit" button just jumps to #contact-form (redundant).
 */
export function stripRedundantGrowthAuditCta(html = '') {
  if (!html) return html;
  return html.replace(
    /<a\b[^>]*href=["']#contact-form["'][^>]*class=["'][^"']*dgs-v1215-btn[^"']*["'][^>]*>\s*Start\s+With\s+A\s+Growth\s+Audit[\s\S]*?<\/a>/gi,
    ''
  );
}

/** Prompt used by footer "Ask AI" icons (matches WP footer widget). */
export const DGS_AI_PROMPT_TEXT =
  "Give me a brief summary of D'Genius Solutions and how it helps businesses with SEO, AEO, GEO, LLM SEO, website development, content creation, branding, social media marketing, AI video production, and digital growth. Website: https://www.dgeniussolutions.com/";

export function getAskAiPlatformUrls(promptText = DGS_AI_PROMPT_TEXT) {
  const q = encodeURIComponent(promptText);
  return {
    chatgpt: `https://chatgpt.com/?q=${q}`,
    perplexity: `https://www.perplexity.ai/search?q=${q}`,
    gemini: `https://gemini.google.com/app?prompt=${q}`,
    claude: `https://claude.ai/new?q=${q}`,
    copilot: `https://copilot.microsoft.com/?q=${q}`,
  };
}

/**
 * WP footer Ask AI icons use href="#" + onclick=dgsRunAiPrompt. If that script
 * is missing/deferred, "#" scrolls to top (looks like a home redirect).
 * Point hrefs at the real AI destinations so links work without JS.
 */
export function patchAskAiFooterLinks(html = '', promptText = DGS_AI_PROMPT_TEXT) {
  if (!html || !/data-ai-platform=/i.test(html)) return html;
  const urls = getAskAiPlatformUrls(promptText);
  return html.replace(
    /<a\b([^>]*\bdata-ai-platform=["'](\w+)["'][^>]*)>/gi,
    (full, attrs, platform) => {
      const dest = urls[String(platform || '').toLowerCase()];
      if (!dest) return full;
      let next = attrs;
      if (/\bhref=/i.test(next)) {
        next = next.replace(/\bhref=["'][^"']*["']/i, `href="${dest}"`);
      } else {
        next += ` href="${dest}"`;
      }
      return `<a${next}>`;
    }
  );
}

/** Early inline boot for Ask AI (clipboard toast + window.open). */
export function getAskAiPromptBootScript(promptText = DGS_AI_PROMPT_TEXT) {
  const urls = getAskAiPlatformUrls(promptText);
  return `window.dgsAiPromptText=${JSON.stringify(promptText)};window.dgsAiPromptUrls=${JSON.stringify(
    urls
  )};window.dgsShowAiPromptToast=function(message){var toast=document.querySelector(".dgs-ai-prompt-toast");if(!toast){toast=document.createElement("div");toast.className="dgs-ai-prompt-toast";document.body.appendChild(toast)}toast.textContent=message;toast.classList.add("active");window.clearTimeout(window.dgsAiPromptToastTimer);window.dgsAiPromptToastTimer=window.setTimeout(function(){toast.classList.remove("active")},4200)};window.dgsRunAiPrompt=function(event,element){if(event)event.preventDefault();var platform=element&&element.getAttribute("data-ai-platform");var destinationUrl=(window.dgsAiPromptUrls||{})[platform]||(element&&element.href);if(!destinationUrl||destinationUrl==="#")return!1;var openAiWindow=function(){window.open(destinationUrl,"_blank","noopener,noreferrer")};if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(window.dgsAiPromptText||"").then(function(){window.dgsShowAiPromptToast("AI prompt copied. Opening platform now. If the platform does not auto-submit, paste the prompt and press Enter.");openAiWindow()}).catch(function(){openAiWindow()})}else{openAiWindow()}return!1};`;
}

/** Early Three.js loader + queue for the AI Production WebGL background. */
export function getThreeJsBootScript() {
  return `(function(){window.__dgsOnThree=function(cb){if(window.THREE)cb();else{(window.__dgsThreeQ=window.__dgsThreeQ||[]).push(cb)}};window.__dgsFlushThree=function(){(window.__dgsThreeQ||[]).splice(0).forEach(function(f){try{f()}catch(e){}})};if(window.THREE)return window.__dgsFlushThree();if(document.getElementById('dgs-three-js'))return;var s=document.createElement('script');s.id='dgs-three-js';s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';s.onload=window.__dgsFlushThree;s.onerror=function(){};document.head.appendChild(s)})();`;
}

function isCriticalExternal(src = '', scriptId = '', mode = 'home') {
  // Homepage uses lightweight Canvas2D particles; AI Production keeps WP WebGL sphere.
  if (/three(?:\.min)?\.js/i.test(src) || /^three/i.test(scriptId)) {
    return mode === 'service';
  }
  if (/(?:jquery\.min\.js|gsap\.min\.js|ScrollTrigger\.min\.js)/i.test(src)) {
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

function extractStylesheets(html = '', bundle = 'home') {
  const seen = new Set();
  const sheets = [];
  const wpCssHrefs = [];
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
    const rel = tag.match(/rel=["']([^"']+)["']/i)?.[1] || 'stylesheet';

    // Collect WP CSS for one bundled same-origin request (avoids 429 stampede)
    if (/stylesheet/i.test(rel) && /\.css(\?|$)/i.test(abs)) {
      try {
        const u = new URL(abs);
        const host = u.hostname.replace(/^www\./i, '').toLowerCase();
        if (host === 'dgeniussolutions.com') {
          wpCssHrefs.push(abs);
          continue;
        }
      } catch {
        /* fall through */
      }
    }

    if (seen.has(abs)) continue;
    seen.add(abs);
    sheets.push({
      href: abs,
      rel,
      media: tag.match(/media=["']([^"']+)["']/i)?.[1],
      sizes: tag.match(/sizes=["']([^"']+)["']/i)?.[1],
    });
  }

  const bundled = toBundledStylesheet(wpCssHrefs, bundle);
  if (bundled) {
    sheets.unshift({ href: bundled, rel: 'stylesheet', media: 'all' });
  }
  return sheets;
}

/**
 * HEAD-check which AUTO_THUMBS posters exist on WordPress so the portfolio
 * script never requests missing `-thumb.webp` files (PSI "Console errors").
 */
async function probePortfolioThumbAllowlist(scriptCode = '') {
  const mp4Urls = [
    ...new Set(
      [...scriptCode.matchAll(/https?:\/\/[^"'\\\s>]+\.mp4/gi)].map((m) => m[0])
    ),
  ].filter((u) => /wp-content\/uploads/i.test(u));

  if (!mp4Urls.length) return {};

  const allow = {};
  let cursor = 0;
  const workers = Array.from({ length: Math.min(8, mp4Urls.length) }, async () => {
    while (cursor < mp4Urls.length) {
      const url = mp4Urls[cursor++];
      const thumbUrl = url.replace(/\.mp4$/i, '-thumb.webp');
      let probeUrl = thumbUrl;
      try {
        const u = new URL(thumbUrl);
        const path = u.pathname.replace(/^\/api\/wp-media/i, '');
        probeUrl = `${WP_ORIGIN}${path}`;
      } catch {
        /* keep thumbUrl */
      }
      try {
        const res = await fetch(probeUrl, {
          method: 'HEAD',
          headers: { 'User-Agent': 'DGS-NextJS-Mirror/1.0' },
          redirect: 'follow',
          next: { revalidate: 86400 },
        });
        if (res.ok) allow[thumbUrl] = 1;
      } catch {
        /* missing or blocked — omit from allowlist */
      }
    }
  });
  await Promise.all(workers);
  return allow;
}

/** Restrict getThumb() to allowlisted poster URLs (no 404 console noise). */
function applyPortfolioThumbAllowlist(code = '', allow = {}) {
  if (!/function getThumb\s*\(\s*video\s*\)/.test(code)) return code;
  const json = JSON.stringify(allow || {});
  let next = code.replace(/var\s+DGS_THUMB_OK\s*=\s*\{[\s\S]*?\}\s*;?/g, '');
  next = next.replace(
    /function getThumb\s*\(\s*video\s*\)\s*\{\s*if\s*\(\s*video\.thumb\s*\)\s*return\s*video\.thumb\s*;\s*if\s*\(\s*AUTO_THUMBS\s*\)\s*return\s*makeThumbUrl\s*\(\s*video\.url\s*\)\s*;\s*return\s*['"]['"]\s*;?\s*\}/,
    `var DGS_THUMB_OK=${json};function getThumb(video){if(video.thumb)return video.thumb;if(AUTO_THUMBS){var u=makeThumbUrl(video.url);return DGS_THUMB_OK[u]?u:''}return''}`
  );
  return next;
}

/**
 * Portfolio: keep AUTO_THUMBS posters where files exist, but never preload
 * every MP4 up front (that stampeded Hostinger). Videos use data-src and are
 * activated in-viewport by the client.
 */
function patchPortfolioScript(code = '') {
  if (!/portfolioData|__DGS_PORTFOLIO|__DGS_AI_VIDEO_PORTFOLIO__|initPortfolio/.test(code)) {
    return code;
  }

  let next = code;

  // Prefer generated -thumb.webp posters when present; allowlist applied after URL rewrite.
  next = next.replace(/var\s+AUTO_THUMBS\s*=\s*!1\b/, 'var AUTO_THUMBS=!0');
  next = next.replace(/AUTO_THUMBS\s*=\s*!1\b/g, 'AUTO_THUMBS=!0');

  // Let visible card text provide the accessible name (avoids PSI label mismatch
  // from aria-label="Play …" vs "CATEGORY + title" on screen).
  next = next.replace(
    /div\.setAttribute\(\s*['"]aria-label['"]\s*,\s*['"]Play ['"]\s*\+\s*video\.title\s*\)/g,
    'div.removeAttribute("aria-label")'
  );

  // Never preload gallery videos up front.
  next = next.replace(/preload="auto"/g, 'preload="none"');
  next = next.replace(/preload="metadata"/g, 'preload="none"');
  next = next.replace(/preload=\\"auto\\"/g, 'preload=\\"none\\"');
  next = next.replace(/preload=\\"metadata\\"/g, 'preload=\\"none\\"');
  next = next.replace(/preload:\\"auto\\"/g, 'preload:\\"none\\"');
  next = next.replace(/preload:\\"metadata\\"/g, 'preload:\\"none\\"');
  next = next.replace(/preload:'auto'/g, "preload:'none'");
  next = next.replace(/preload:'metadata'/g, "preload:'none'");

  // Media fragments (#t=0.08) force browsers to fetch video bytes immediately.
  next = next.replace(/#t=0\.08/g, '');
  next = next.replace(/#t=0\.1/g, '');

  // Prefer data-src on <source> so videos do not connect until we promote src.
  next = next.replace(
    /'<source src="'\+escapeHTML\(video\.url\)\+'/g,
    `'<source data-src="'+escapeHTML(video.url)+'`
  );
  next = next.replace(
    /"\u003csource src="'\+escapeHTML\(video\.url\)\+'/g,
    `"\u003csource data-src="'+escapeHTML(video.url)+'`
  );
  next = next.replace(
    /\\u003csource src=\\"'\+escapeHTML\(video\.url\)\+'/g,
    `\\u003csource data-src="'+escapeHTML(video.url)+'`
  );

  // Inject a visible poster <img> alongside the video when a thumb URL exists.
  if (!/thumb-poster/.test(next) && /function imageHTML\(video,isWide\)/.test(next)) {
    next = next.replace(
      /var posterAttribute=thumb\?' poster="'\+escapeHTML\(thumb\)\+'"':'';return'<div class="thumb-fallback"><\/div>'\+'<video class="thumb-video"/,
      `var posterAttribute=thumb?' poster="'+escapeHTML(thumb)+'"':'';var posterImg=thumb?'<img class="thumb-img thumb-poster" src="'+escapeHTML(thumb)+'" alt="" loading="lazy" decoding="async" draggable="false">':'';return'<div class="thumb-fallback"></div>'+posterImg+'<video class="thumb-video"`
    );
  }

  // AI Production portfolio/FAQ boots on DOMContentLoaded — that already fired by
  // the time client JS injects the script, so cards + FAQ never bind.
  if (/__DGS_AI_VIDEO_PORTFOLIO__/.test(next) && /DOMContentLoaded/.test(next)) {
    next = next.replace(
      /document\.addEventListener\(\s*['"]DOMContentLoaded['"]\s*,\s*function\s*\(\s*\)\s*\{/,
      'window.__dgsAiVideoBoot=function(){'
    );
    next = next.replace(
      /obs\.observe\(s\)\}\)\}\)\}\)\(\)\s*;?\s*$/,
      "obs.observe(s)});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',window.__dgsAiVideoBoot);else window.__dgsAiVideoBoot();}})()"
    );
  }

  // AI Production: always 6 videos per batch (not 10 on desktop).
  if (/__DGS_AI_VIDEO_PORTFOLIO__/.test(next)) {
    next = next.replace(
      /var itemsPerLoad=\(window\.matchMedia&&window\.matchMedia\('\(max-width:767px\)'\)\.matches\)\?6:10/,
      'var itemsPerLoad=6'
    );
    next = next.replace(
      /portfolioData\[k\]\.forEach\(function\(v\)\{/,
      'portfolioData[k].slice(0,6).forEach(function(v){'
    );
  }

  return next;
}

/** Wait for Three.js before booting the particle-sphere background. */
function patchWebglBootScript(code = '') {
  if (!isWebglBootScript(code) || /dgsWebglRun/.test(code)) return code;
  let next = code.replace(/\(function\(\)\{/, '(function(){function dgsWebglRun(){');
  next = next.replace(
    /var container=document\.getElementById\('global-webgl-background'\);if\(!container\|\|!window\.THREE\)return;/,
    "var container=document.getElementById('global-webgl-background');if(!container)return;if(!window.THREE){if(window.__dgsOnThree)return void window.__dgsOnThree(dgsWebglRun);var n=0,t=setInterval(function(){if(window.THREE){clearInterval(t);dgsWebglRun();}else if(++n>150)clearInterval(t);},40);return;}"
  );
  next = next.replace(/\}\)\(\)\s*;?\s*$/, '}dgsWebglRun();})();');
  return next;
}

/** Strip Three.js boot from WP motion script — Canvas2D bg replaces it. */
function patchMotionScript(code = '') {
  if (!/initThree|bootMotion|dgs-v1215/.test(code)) return code;
  let next = code;
  // Remove idle Three loader (newline may sit between return and loadScript)
  next = next.replace(
    /if\(canUseWebGL\)\{idle\(function\(\)\{if\(window\.THREE\)\{initThree\(\);return\}\s*loadScript\(["'][^"']+["']\)\.then\(initThree\)\.catch\(function\(\)\{root\.classList\.remove\(["']v1215-webgl-ready["']\)\}\)\)\}\)/,
    '/* Three.js skipped — DgsFastBackground */'
  );
  // Also strip any leftover three CDN loadScript calls in this file
  next = next.replace(
    /loadScript\(["']https:\/\/cdn\.jsdelivr\.net\/npm\/three[^"']+["']\)\.then\(initThree\)\.catch\(function\(\)\{root\.classList\.remove\(["']v1215-webgl-ready["']\)\}\)/g,
    'Promise.resolve()'
  );
  // Neutralize initThree if anything still calls it
  next = next.replace(/function initThree\(\)\{if\(/, 'function initThree(){return;if(');

  // Stop mouse parallax from sliding the entire canvas/grid background layer.
  // Original: setProperty("--v1215-grid-x",(n*-14).toFixed(2)+"px")
  // Do NOT use [^)]* — it truncates inside .toFixed(2) and leaves a SyntaxError.
  next = next.replace(
    /root\.style\.setProperty\(\s*["']--v1215-grid-x["']\s*,\s*\([^)]*\)\.toFixed\(\s*\d+\s*\)\s*\+\s*["']px["']\s*\)/g,
    'root.style.setProperty("--v1215-grid-x","0px")'
  );
  next = next.replace(
    /root\.style\.setProperty\(\s*["']--v1215-grid-y["']\s*,\s*\([^)]*\)\.toFixed\(\s*\d+\s*\)\s*\+\s*["']px["']\s*\)/g,
    'root.style.setProperty("--v1215-grid-y","0px")'
  );
  // Repair any previously broken patch leftovers:
  // setProperty("--v1215-grid-x","0px").toFixed(2)+"px")
  next = next.replace(
    /root\.style\.setProperty\(\s*["']--v1215-grid-x["']\s*,\s*["']0px["']\s*\)\s*\.toFixed\(\s*\d+\s*\)\s*\+\s*["']px["']\s*\)/g,
    'root.style.setProperty("--v1215-grid-x","0px")'
  );
  next = next.replace(
    /root\.style\.setProperty\(\s*["']--v1215-grid-y["']\s*,\s*["']0px["']\s*\)\s*\.toFixed\(\s*\d+\s*\)\s*\+\s*["']px["']\s*\)/g,
    'root.style.setProperty("--v1215-grid-y","0px")'
  );

  return next;
}

/**
 * SSR/HTML-level agent accessibility fixes so the a11y tree is well-formed
 * before client JS runs (menu name, gallery image semantics).
 */
function patchAgentA11yHtml(html = '') {
  let next = html;

  // Named menu command: #dgsTrig is role=button with no accessible name in WP markup.
  next = next.replace(/<div\b([^>]*\bid=["']dgsTrig["'][^>]*)>/i, (full, attrs) => {
    let a = attrs;
    if (!/\baria-label\s*=/i.test(a)) {
      a += ' aria-label="Open menu"';
    }
    if (!/\baria-expanded\s*=/i.test(a)) {
      a += ' aria-expanded="false"';
    }
    if (!/\brole\s*=/i.test(a)) {
      a += ' role="button"';
    }
    if (!/\btabindex\s*=/i.test(a)) {
      a += ' tabindex="0"';
    }
    return `<div${a}>`;
  });

  // Strip invalid role=button from case study articles if WP ever ships it.
  next = next.replace(
    /<(article)\b([^>]*\bclass=["'][^"']*dgs-v1215-case-(?:visual-card|mini)[^"']*["'][^>]*)>/gi,
    (full, tag, attrs) => {
      let a = attrs
        .replace(/\srole=["']button["']/gi, '')
        .replace(/\stabindex=["']0["']/gi, '');
      return `<${tag}${a}>`;
    }
  );

  // Envira: empty alt + tabindex=-1 is inconsistent for presentational images.
  // Prefer caption/title as alt; otherwise drop tabindex so decorative stays ignored.
  next = next.replace(/<img\b([^>]*\benvira-gallery-image[^>]*)>/gi, (full, attrs) => {
    let a = attrs;
    const altMatch = a.match(/\balt=["']([^"']*)["']/i);
    const alt = altMatch ? altMatch[1] : null;
    const caption =
      a.match(/\bdata-caption=["']([^"']*)["']/i)?.[1] ||
      a.match(/\btitle=["']([^"']*)["']/i)?.[1] ||
      '';
    const cleaned = String(caption)
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .trim();

    if ((!alt || alt === '') && cleaned) {
      if (/\balt=["']/i.test(a)) {
        a = a.replace(/\balt=["'][^"']*["']/i, `alt="${cleaned.replace(/"/g, '&quot;')}"`);
      } else {
        a += ` alt="${cleaned.replace(/"/g, '&quot;')}"`;
      }
      a = a.replace(/\stabindex=["']-1["']/gi, '');
    } else if (alt === '') {
      a = a.replace(/\stabindex=["']-1["']/gi, '');
      if (!/\baria-hidden\s*=/i.test(a)) a += ' aria-hidden="true"';
    }
    return `<img${a}>`;
  });

  return next;
}

/**
 * Fix menu close jumping to page bottom.
 * WP locks body with position:fixed; our CSS then forces position:static when
 * nav-open is removed — BEFORE unlock restores scrollY. Unlock first + rAF.
 */
function patchNavScrollScript(code = '') {
  if (!/dgsLockScroll|dgsUnlockScroll|dgsToggle/.test(code)) return code;
  if (/dgs-scroll-lock-patched/.test(code)) return code;

  let next = code;

  // Replace unlock to restore scroll after styles clear (double rAF for layout)
  next = next.replace(
    /window\.dgsUnlockScroll\s*=\s*function\s*\(\)\s*\{[\s\S]*?\};/,
    `window.dgsUnlockScroll=function(){/*dgs-scroll-lock-patched*/var y=window.dgsScrollY||0;document.documentElement.classList.remove("dgs-scroll-locked");document.body.classList.remove("dgs-scroll-locked");document.documentElement.style.overflow="";document.body.style.overflow="";document.body.style.position="";document.body.style.top="";document.body.style.left="";document.body.style.right="";document.body.style.width="";requestAnimationFrame(function(){requestAnimationFrame(function(){window.scrollTo(0,y);if(document.documentElement)document.documentElement.scrollTop=y;if(document.body)document.body.scrollTop=y;})})};`
  );

  // Lock: also set class so CSS can cooperate
  next = next.replace(
    /window\.dgsLockScroll\s*=\s*function\s*\(\)\s*\{[\s\S]*?\};/,
    `window.dgsLockScroll=function(){/*dgs-scroll-lock-patched*/window.dgsScrollY=window.scrollY||document.documentElement.scrollTop||0;document.documentElement.classList.add("dgs-scroll-locked");document.body.classList.add("dgs-scroll-locked");document.documentElement.style.overflow="hidden";document.body.style.overflow="hidden";document.body.style.position="fixed";document.body.style.top="-"+window.dgsScrollY+"px";document.body.style.left="0";document.body.style.right="0";document.body.style.width="100%";};`
  );

  // Close path: unlock BEFORE removing nav-open (critical with :has() CSS)
  next = next.replace(
    /window\.dgsToggle\s*=\s*function\s*\(\)\s*\{[\s\S]*?\};/,
    `window.dgsToggle=function(){/*dgs-scroll-lock-patched*/var nav=document.getElementById("dgsNav");var label=document.getElementById("dgsTrigLabel");if(!nav)return;var opening=!nav.classList.contains("nav-open");if(opening){nav.classList.add("nav-open");if(window.dgsLockScroll)window.dgsLockScroll();}else{if(window.dgsUnlockScroll)window.dgsUnlockScroll();nav.classList.remove("nav-open");}if(label)label.textContent=opening?"CLOSE":"MENU";var trig=document.getElementById("dgsTrig");if(trig){trig.setAttribute("aria-expanded",opening?"true":"false");trig.setAttribute("aria-label",opening?"Close menu":"Open menu");}};`
  );

  return next;
}

function patchInlineScript(code = '', mode = 'home') {
  let next = patchPortfolioScript(code);
  if (mode === 'service') {
    next = patchWebglBootScript(next);
  } else {
    next = patchMotionScript(next);
  }
  return patchNavScrollScript(next);
}

/**
 * Shared WordPress HTML mirror pipeline (home, about-us, …).
 * Dos: same-origin CSS/media proxies, one CSS bundle, keep WP inline <style>
 * (nav #dgsNav lives there), critical scripts only, strip analytics.
 * Don'ts: no Three.js, no body <style> left in HTML, no emptying inlineStyles.
 */
export async function getWpPageMirror({
  url = WP_HOME_URL,
  path = '/',
  bundle = 'home',
  revalidate = 300,
  mode = 'home',
  /** 'demo' → Hostinger URL; 'upstream' → keep WP canonical (ranking-safe). */
  canonicalMode = 'demo',
  defaultTitle = "Digital Marketing Agency in Mumbai | D'Genius Solutions",
  defaultDescription =
    "D'Genius Solutions is a full service digital marketing agency in Mumbai offering connected search, website development, social media, performance marketing, branding and AI-led creative production.",
  defaultBodyClass =
    'home page page-id-63505 elementor-default elementor-kit-33 elementor-page elementor-page-63505',
} = {}) {
  const res = await fetch(url, {
    headers: {
      Accept: 'text/html',
      'User-Agent': 'DGS-NextJS-Mirror/1.0',
    },
    next: { revalidate },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch WordPress page (${res.status}) from ${url}`);
  }
  const html = await res.text();

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const descMatch =
    html.match(/name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
    html.match(/content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const robotsMatch =
    html.match(/name=["']robots["'][^>]*content=["']([^"']*)["']/i) ||
    html.match(/content=["']([^"']*)["'][^>]*name=["']robots["']/i);
  const canonicalMatch =
    html.match(/rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ||
    html.match(/href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);

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

  // Envira / FluentForm CSS is often printed in the footer — pull from full HTML
  const stylesheets = extractStylesheets(html, bundle);

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
    const abs = toSameOriginWpAsset(absolutize(src), DEMO_ORIGIN);
    if (seenExt.has(abs)) return;
    seenExt.add(abs);
    let kind = 'lib';
    if (/jquery/i.test(abs) || /jquery/i.test(scriptId)) kind = 'jquery';
    else if (/^envira/i.test(scriptId) || /envira/i.test(abs) || /envira/i.test(src)) kind = 'envira';
    else if (/^fluent/i.test(scriptId) || /fluent/i.test(abs) || /fluent/i.test(src)) kind = 'fluent';
    else if (/recaptcha/i.test(abs) || /recaptcha/i.test(scriptId)) kind = 'recaptcha';
    else if (/gsap|ScrollTrigger/i.test(abs)) kind = 'motion';
    else if (/three/i.test(abs) || /^three/i.test(scriptId)) kind = 'three';
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
        if (code && isCriticalInline(code, mode)) inlineScripts.push(patchInlineScript(code, mode));
      } else if (isCriticalExternal(src, scriptId, mode)) {
        pushExternal(src, scriptId);
      }
      continue;
    }
    if (body && isCriticalInline(body, mode)) inlineScripts.push(patchInlineScript(body, mode));
  }

  // AI Production ranking page — particle-sphere background needs Three.js r128.
  if (mode === 'service') {
    if (![...seenExt].some((s) => /three(?:\.min)?\.js/i.test(s))) {
      pushExternal('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'three-js');
    }
  }

  // Home needs GSAP/ScrollTrigger for motion; About does not ship them — skip CDN bloat.
  if (mode === 'home') {
    if (![...seenExt].some((s) => /gsap\.min\.js/i.test(s))) {
      pushExternal('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js', 'gsap-js');
    }
    if (![...seenExt].some((s) => /ScrollTrigger/i.test(s))) {
      pushExternal(
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
        'ScrollTrigger-js'
      );
    }
  }

  const bodyMatch = html.match(/<body([^>]*)>([\s\S]*)<\/body>/i);
  const bodyAttrs = bodyMatch?.[1] || '';
  const bodyId = bodyAttrs.match(/\sid=["']([^"']+)["']/i)?.[1] || 'cmsmasters_body';
  const bodyClass = bodyAttrs.match(/\sclass=["']([^"']+)["']/i)?.[1] || defaultBodyClass;

  let bodyHtml = bodyMatch?.[2] || '';
  bodyHtml = bodyHtml.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  // Styles already extracted to <head>; leftover body <style> tags would
  // cascade AFTER our overrides and restore gradient close/nav chrome.
  bodyHtml = bodyHtml.replace(/<style\b[\s\S]*?<\/style>/gi, '');
  bodyHtml = hydrateLazyMedia(bodyHtml);
  bodyHtml = applyPerfImageHints(bodyHtml, {
    prioritizeFirstUpload: mode === 'about' || mode === 'service',
  });
  bodyHtml = stripAnalyticsNoise(bodyHtml);
  bodyHtml = rewriteDemoLinks(bodyHtml, DEMO_ORIGIN);
  bodyHtml = rewriteWpMediaToProxy(bodyHtml, DEMO_ORIGIN);
  bodyHtml = compactEnviraImageSources(bodyHtml);
  bodyHtml = compactContainerImages(bodyHtml);
  bodyHtml = patchAskAiFooterLinks(bodyHtml);
  if (mode === 'home') {
    bodyHtml = optimizeHeroRobotImage(bodyHtml, DEMO_ORIGIN);
    bodyHtml = relocateHeroAboutSection(bodyHtml, DEMO_ORIGIN);
    bodyHtml = stripRedundantGrowthAuditCta(bodyHtml);
  }
  bodyHtml = patchAgentA11yHtml(bodyHtml);

  const demoPath = path.startsWith('/') ? path : `/${path}`;
  const demoCanonical = `${DEMO_ORIGIN.replace(/\/$/, '')}${demoPath === '/' ? '/' : demoPath}`;
  const upstreamCanonical = canonicalMatch?.[1]
    ? decodeEntities(canonicalMatch[1])
    : url.replace(/\/?$/, '/');
  // Ranking pages keep the live WP canonical so the demo mirror does not split equity.
  const canonical = canonicalMode === 'upstream' ? upstreamCanonical : demoCanonical;

  let lcpImage = null;
  if (mode === 'home') {
    lcpImage = getHeroRobotLcpPreload().href || extractLcpImageUrl(bodyHtml);
  } else {
    lcpImage = extractAboutLcpImageUrl(bodyHtml) || extractLcpImageUrl(bodyHtml);
  }

  // Soften Syne weights + map WP theme faces → Syne (Manrope/Space Grotesk/DM Sans/Inter).
  // Also rewrite absolute WP font/asset urls so they load same-origin on the demo host.
  const softenedStyles = inlineStyles.map((css) => {
    let softened = css
      .replace(/["']Manrope["']/g, "'Syne'")
      .replace(/\bManrope\b/g, 'Syne')
      .replace(/["']Space Grotesk["']/g, "'Syne'")
      .replace(/\bSpace Grotesk\b/g, 'Syne')
      .replace(/["']DM Sans["']/g, "'Syne'")
      .replace(/\bDM Sans\b/g, 'Syne')
      .replace(/["']Inter["']/g, "'Syne'")
      .replace(/family=Inter:/gi, 'family=Syne:')
      .replace(/font-family:\s*Inter\b/gi, 'font-family:Syne')
      .replace(/font-display:\s*optional/gi, 'font-display:swap');
    softened = softened.replace(/([^{}]*Syne[^{]*)\{([^}]*)\}/gi, (full, selector, body) => {
      const nextBody = body
        .replace(/font-weight:\s*800\s*!important/gi, 'font-weight: 500 !important')
        .replace(/font-weight:\s*700\s*!important/gi, 'font-weight: 500 !important')
        .replace(/font-weight:\s*800\b/gi, 'font-weight: 500')
        .replace(/font-weight:\s*700\b/gi, 'font-weight: 500');
      return `${selector}{${nextBody}}`;
    });
    // Service CTA submit: replace WP pink→orange gradient with solid coral.
    if (mode === 'service') {
      softened = softened.replace(
        /background\s*:\s*linear-gradient\(\s*135deg\s*,\s*var\(--dgs-pink\)\s*,\s*var\(--dgs-orange\)\s*\)\s*!important/gi,
        'background:#FD5C62!important;background-image:none!important'
      );
      // Drop Inter @import — Syne-only on this ranking page.
      softened = softened.replace(/@import\s+url\([^)]*Inter[^)]*\)\s*;?/gi, '');
    }
    return rewriteWpUrlsInCss(softened, DEMO_ORIGIN);
  });

  // Rewrite demo links + media proxy inside inline scripts (portfolio mp4s, posters).
  // Point FluentForm AJAX at same-origin proxy so browser CORS does not block submits.
  let demoInlineScripts = inlineScripts.map((code) =>
    rewriteWpMediaToProxy(
      rewriteFluentAjax(rewriteDemoLinks(code, DEMO_ORIGIN), DEMO_ORIGIN),
      DEMO_ORIGIN
    )
  );

  // Only request portfolio posters that exist on WordPress (avoid PSI console 404s).
  if (mode === 'home') {
    const portfolioScript = demoInlineScripts.find((code) =>
      /portfolioData|makeThumbUrl|AUTO_THUMBS/.test(code)
    );
    if (portfolioScript) {
      const thumbAllow = await probePortfolioThumbAllowlist(portfolioScript);
      demoInlineScripts = demoInlineScripts.map((code) =>
        /portfolioData|makeThumbUrl|AUTO_THUMBS/.test(code)
          ? applyPortfolioThumbAllowlist(code, thumbAllow)
          : code
      );
    }
  }

  const ogOut = { ...og };
  if (canonicalMode === 'upstream') {
    // Keep ranking URL signals on the live WP host.
    ogOut['og:url'] = upstreamCanonical;
  } else {
    ogOut['og:url'] = canonical;
  }

  return {
    meta: {
      title: decodeEntities(titleMatch?.[1]?.trim() || defaultTitle),
      description: decodeEntities(descMatch?.[1] || defaultDescription),
      canonical,
      og: ogOut,
      robots:
        decodeEntities(
          robotsMatch?.[1] ||
            'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large'
        ),
    },
    stylesheets,
    // WP custom CSS (nav #dgsNav/#dgsTrig, theme) lives in <style> tags,
    // not in linked stylesheets — the CSS bundle cannot replace these.
    inlineStyles: softenedStyles,
    schemas,
    bodyId,
    bodyClass,
    bodyHtml,
    lcpImage,
    externalScripts,
    inlineScripts: demoInlineScripts,
    demoOrigin: DEMO_ORIGIN,
    mode,
  };
}

export async function getWpHomeMirror({ revalidate = 300 } = {}) {
  return getWpPageMirror({
    url: WP_HOME_URL,
    path: '/',
    bundle: 'home',
    revalidate,
    mode: 'home',
  });
}

export async function getWpAboutMirror({ revalidate = 300 } = {}) {
  return getWpPageMirror({
    url: `${WP_ORIGIN.replace(/\/$/, '')}/about-us/`,
    path: '/about-us',
    bundle: 'about',
    revalidate,
    mode: 'about',
    defaultTitle: "About Us | D'Genius Solutions",
    defaultDescription:
      "Meet D'Genius Solutions — a Mumbai digital marketing agency built on trust, expertise, and AI-led creative production.",
    defaultBodyClass:
      'page-template-default page page-id-38769 elementor-default elementor-kit-33 elementor-page elementor-page-38769',
  });
}

/** Ranking service page — content/SEO untouched; Syne font via CSS layer. */
export async function getWpAiProductionMirror({ revalidate = 300 } = {}) {
  return getWpPageMirror({
    url: `${WP_ORIGIN.replace(/\/$/, '')}/services/ai-video-production-agency/`,
    path: '/services/ai-video-production-agency',
    bundle: 'ai-production',
    revalidate,
    mode: 'service',
    canonicalMode: 'upstream',
    defaultTitle: "AI Video Production Agency in Mumbai | D'Genius Solutions",
    defaultDescription:
      'AI video production agency in Mumbai creating AI video ads, product films, reels, brand videos and AI product videos for businesses. Book a free strategy call.',
    defaultBodyClass:
      'services-template services-template-elementor_header_footer single single-services postid-40114 elementor-default elementor-kit-33 elementor-page elementor-page-40114',
  });
}
