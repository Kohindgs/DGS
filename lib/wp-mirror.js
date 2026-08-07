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
 */
export function toBundledStylesheet(_hrefs = []) {
  return '/api/wp-css?bundle=home';
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
      u.searchParams.set('dgsv', '20260807j');
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
  // Skip Three.js — homepage uses lightweight Canvas2D particles instead
  if (/three(?:\.min)?\.js/i.test(src) || /^three/i.test(scriptId)) {
    return false;
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

function extractStylesheets(html = '') {
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

  const bundled = toBundledStylesheet(wpCssHrefs);
  if (bundled) {
    sheets.unshift({ href: bundled, rel: 'stylesheet', media: 'all' });
  }
  return sheets;
}

/**
 * Portfolio: keep AUTO_THUMBS posters where files exist, but never preload
 * every MP4 up front (that stampeded Hostinger). Videos use data-src and are
 * activated in-viewport by the client.
 */
function patchPortfolioScript(code = '') {
  if (!/portfolioData|__DGS_PORTFOLIO|initPortfolio/.test(code)) return code;

  let next = code;

  // Prefer generated -thumb.webp posters when present (404s are cheap; layout looks correct).
  next = next.replace(/var\s+AUTO_THUMBS\s*=\s*!1\b/, 'var AUTO_THUMBS=!0');
  next = next.replace(/AUTO_THUMBS\s*=\s*!1\b/g, 'AUTO_THUMBS=!0');

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

function patchInlineScript(code = '') {
  return patchNavScrollScript(patchMotionScript(patchPortfolioScript(code)));
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
    const abs = toSameOriginWpAsset(absolutize(src), DEMO_ORIGIN);
    if (seenExt.has(abs)) return;
    seenExt.add(abs);
    let kind = 'lib';
    if (/jquery/i.test(abs) || /jquery/i.test(scriptId)) kind = 'jquery';
    else if (/^envira/i.test(scriptId) || /envira/i.test(abs) || /envira/i.test(src)) kind = 'envira';
    else if (/^fluent/i.test(scriptId) || /fluent/i.test(abs) || /fluent/i.test(src)) kind = 'fluent';
    else if (/recaptcha/i.test(abs) || /recaptcha/i.test(scriptId)) kind = 'recaptcha';
    else if (/gsap|ScrollTrigger/i.test(abs)) kind = 'motion';
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
        if (code && isCriticalInline(code)) inlineScripts.push(patchInlineScript(code));
      } else if (isCriticalExternal(src, scriptId)) {
        pushExternal(src, scriptId);
      }
      continue;
    }
    if (body && isCriticalInline(body)) inlineScripts.push(patchInlineScript(body));
  }

  // Stable CDN fallbacks if WP omitted them (no Three.js — Canvas2D bg instead)
  if (![...seenExt].some((s) => /gsap\.min\.js/i.test(s))) {
    pushExternal('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js', 'gsap-js');
  }
  if (![...seenExt].some((s) => /ScrollTrigger/i.test(s))) {
    pushExternal(
      'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
      'ScrollTrigger-js'
    );
  }

  const bodyMatch = html.match(/<body([^>]*)>([\s\S]*)<\/body>/i);
  const bodyAttrs = bodyMatch?.[1] || '';
  const bodyId = bodyAttrs.match(/\sid=["']([^"']+)["']/i)?.[1] || 'cmsmasters_body';
  const bodyClass =
    bodyAttrs.match(/\sclass=["']([^"']+)["']/i)?.[1] ||
    'home page page-id-63505 elementor-default elementor-kit-33 elementor-page elementor-page-63505';

  let bodyHtml = bodyMatch?.[2] || '';
  bodyHtml = bodyHtml.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  // Styles already extracted to <head>; leftover body <style> tags would
  // cascade AFTER our overrides and restore gradient close/nav chrome.
  bodyHtml = bodyHtml.replace(/<style\b[\s\S]*?<\/style>/gi, '');
  bodyHtml = hydrateLazyMedia(bodyHtml);
  bodyHtml = stripAnalyticsNoise(bodyHtml);
  bodyHtml = rewriteDemoLinks(bodyHtml, DEMO_ORIGIN);
  bodyHtml = rewriteWpMediaToProxy(bodyHtml, DEMO_ORIGIN);
  bodyHtml = patchAgentA11yHtml(bodyHtml);

  // Soften Syne — WP ships 700/800; request asked for Syne but not thick
  // Also rewrite absolute WP font/asset urls so they load same-origin on the demo host.
  const softenedStyles = inlineStyles.map((css) => {
    const softened = css.replace(/([^{}]*Syne[^{]*)\{([^}]*)\}/gi, (full, selector, body) => {
      const nextBody = body
        .replace(/font-weight:\s*800\s*!important/gi, 'font-weight: 500 !important')
        .replace(/font-weight:\s*700\s*!important/gi, 'font-weight: 500 !important')
        .replace(/font-weight:\s*800\b/gi, 'font-weight: 500')
        .replace(/font-weight:\s*700\b/gi, 'font-weight: 500');
      return `${selector}{${nextBody}}`;
    });
    return rewriteWpUrlsInCss(softened, DEMO_ORIGIN);
  });

  // Rewrite demo links + media proxy inside inline scripts (portfolio mp4s, posters).
  // Point FluentForm AJAX at same-origin proxy so browser CORS does not block submits.
  const demoInlineScripts = inlineScripts.map((code) =>
    rewriteWpMediaToProxy(
      rewriteFluentAjax(rewriteDemoLinks(code, DEMO_ORIGIN), DEMO_ORIGIN),
      DEMO_ORIGIN
    )
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
