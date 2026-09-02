#!/usr/bin/env node
/**
 * Build-time WordPress inner-page visual mirror extractor.
 * READ ONLY against production WordPress — does not iframe, proxy, or load Elementor at runtime.
 *
 * Output:
 *   data/wordpress/mirrors/pages/*.json
 *   data/wordpress/mirrors/css/*.css
 *   data/wordpress/mirrors/index.json
 *   data/wordpress/mirrors/template-families.json
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { rewriteWpUrls, WP_ORIGIN } from "./lib/rewrite-wp-urls.mjs";
import { rebaseCssUrls } from "./lib/rebase-css-urls.mjs";
import {
  collectFontLinkTags,
  collectHeadVisualCss,
  collectVisualStylesheetUrls,
  looksLikePlaceholderSrc,
} from "./lib/collect-visual-stylesheets.mjs";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "data/wordpress/mirrors");
const PAGES_DIR = path.join(OUT_DIR, "pages");
const CSS_DIR = path.join(OUT_DIR, "css");
const PUBLIC_CSS_DIR = path.join(ROOT, "public/wp-mirror-css");
const UA = "DGS-InnerPageMirror/1.0 (+https://www.dgeniussolutions.com)";
const DELAY_MS = 650;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function pathToMirrorFilename(routePath) {
  const trimmed = String(routePath || "/")
    .replace(/^\/+|\/+$/g, "")
    .replaceAll("/", "__");
  return `${trimmed || "root"}.json`;
}

function sha12(text) {
  return createHash("sha256").update(text).digest("hex").slice(0, 12);
}

function findMatchingClose(html, startIdx) {
  const tagMatch = html.slice(startIdx).match(/^<([a-zA-Z0-9-]+)/);
  if (!tagMatch) return -1;
  const tag = tagMatch[1];
  let depth = 0;
  const re = new RegExp(`<(/)?${tag}\\b[^>]*>`, "gi");
  re.lastIndex = startIdx;
  let match;
  while ((match = re.exec(html))) {
    const selfClosing = /\/\s*>$/.test(match[0]);
    if (selfClosing) continue;
    if (match[1] === "/") {
      depth -= 1;
      if (depth === 0) return match.index + match[0].length;
    } else {
      depth += 1;
    }
  }
  return -1;
}

function extractElementById(html, id) {
  const re = new RegExp(`<(div|section|aside|form)[^>]*id=["']${id}["'][^>]*>`, "i");
  const match = html.match(re);
  if (!match || match.index == null) return null;
  const end = findMatchingClose(html, match.index);
  if (end < 0) return { start: match.index, end: match.index + match[0].length, html: match[0] };
  return { start: match.index, end, html: html.slice(match.index, end) };
}

function stripElementById(html, id) {
  const found = extractElementById(html, id);
  if (!found) return html;
  return `${html.slice(0, found.start)}${html.slice(found.end)}`;
}

function sliceLiveBody(html) {
  const footerStart = html.indexOf('<footer class="dgs-footer-wrapper">');
  const end = footerStart >= 0 ? footerStart : html.indexOf("</body>");
  const talk = extractElementById(html, "dgsTalkPopup");
  let start = 0;
  if (talk) {
    start = talk.end;
  } else {
    const nav = extractElementById(html, "dgsNav");
    start = nav ? nav.end : 0;
  }
  let body = html.slice(start, end > start ? end : undefined);
  body = body.replace(/<a class="skip-link screen-reader-text"[\s\S]*?<\/a>/i, "");
  body = stripElementById(body, "dgsTalkPopup");
  return body.trim();
}

function stripRuntime(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<script\b[^>]*\/?\s*>/gi, "");
}

function extractInlineStyles(html) {
  return [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((m) => m[1].trim())
    .filter(Boolean)
    .join("\n\n");
}

function stripStyleTags(html) {
  return html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
}

function unwrapLazyImages(html) {
  let out = html.replace(/<img\b[^>]*>/gi, (tag) => {
    let next = tag;
    const read = (name) => tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1] || "";
    const dataSrc = read("data-src") || read("data-envira-src") || read("data-lazy-src") || read("data-original");
    const dataSrcset = read("data-srcset") || read("data-envira-srcset") || read("data-lazy-srcset");
    const src = read("src");
    const srcset = read("srcset");
    const isPlaceholder = looksLikePlaceholderSrc(src);
    const srcsetIsPlaceholder = looksLikePlaceholderSrc(srcset);

    if (dataSrc && (isPlaceholder || !src)) {
      if (/\bsrc=/i.test(next)) next = next.replace(/\bsrc=["'][^"']*["']/i, `src="${dataSrc}"`);
      else next = next.replace(/<img/i, `<img src="${dataSrc}"`);
    }
    if (srcsetIsPlaceholder) {
      if (dataSrcset && !looksLikePlaceholderSrc(dataSrcset)) {
        next = next.replace(/\bsrcset=["'][^"']*["']/i, `srcset="${dataSrcset}"`);
      } else {
        next = next.replace(/\s*srcset=["'][^"']*["']/i, "");
      }
    } else if (dataSrcset) {
      if (/\bsrcset=/i.test(next)) next = next.replace(/\bsrcset=["'][^"']*["']/i, `srcset="${dataSrcset}"`);
      else next = next.replace(/<img/i, `<img srcset="${dataSrcset}"`);
    }
    if (!/\bloading=/i.test(next)) next = next.replace(/<img/i, `<img loading="lazy"`);
    if (!/\bdecoding=/i.test(next)) next = next.replace(/<img/i, `<img decoding="async"`);
    return next;
  });

  out = out.replace(/<(div|section|span|figure|a|header|footer|article|aside|li)\b[^>]*>/gi, (tag) => {
    const dataBg =
      tag.match(/\bdata-bg=["']([^"']+)["']/i)?.[1] ||
      tag.match(/\bdata-lazy-bg=["']([^"']+)["']/i)?.[1] ||
      tag.match(/\bdata-bg-webp=["']([^"']+)["']/i)?.[1];
    if (!dataBg || looksLikePlaceholderSrc(dataBg)) return tag;
    if (/background-image\s*:/i.test(tag)) return tag;
    if (/\bstyle=/i.test(tag)) {
      return tag.replace(
        /\bstyle=(["'])([\s\S]*?)\1/i,
        (_, q, style) => `style=${q}background-image:url('${dataBg}');${style}${q}`,
      );
    }
    return tag.replace(/<([a-zA-Z0-9-]+)/i, `<$1 style="background-image:url('${dataBg}')"`);
  });

  out = out.replace(/<source\b[^>]*>/gi, (tag) => {
    const dataSrcset = tag.match(/\bdata-srcset=["']([^"']+)["']/i)?.[1];
    const srcset = tag.match(/\bsrcset=["']([^"']+)["']/i)?.[1] || "";
    if (dataSrcset && (looksLikePlaceholderSrc(srcset) || !srcset)) {
      if (/\bsrcset=/i.test(tag)) return tag.replace(/\bsrcset=["'][^"']*["']/i, `srcset="${dataSrcset}"`);
      return tag.replace(/<source/i, `<source srcset="${dataSrcset}"`);
    }
    return tag;
  });

  out = out.replace(/<video\b[^>]*>/gi, (tag) => {
    const dataPoster = tag.match(/\bdata-poster=["']([^"']+)["']/i)?.[1];
    const poster = tag.match(/\bposter=["']([^"']+)["']/i)?.[1] || "";
    if (dataPoster && (!poster || looksLikePlaceholderSrc(poster))) {
      if (/\bposter=/i.test(tag)) return tag.replace(/\bposter=["'][^"']*["']/i, `poster="${dataPoster}"`);
      return tag.replace(/<video/i, `<video poster="${dataPoster}"`);
    }
    return tag;
  });

  return out;
}

function fluentFormIds(html) {
  return [...new Set([...html.matchAll(/data-form_id=["'](\d+)["']/g)].map((m) => m[1]))];
}

export function classifyInnerFamily({ path: routePath, type, html }) {
  if (routePath === "/") return { family: "homepage-v1215", reason: "homepage uses existing v1215 mirror" };
  if (type === "post") return { family: "blog-detail", reason: "live cmsmasters/Elementor single post template" };
  if (routePath === "/blogs/") return { family: "blog-archive", reason: "live cmsmasters-blog grid archive" };
  if (routePath === "/our-services/") return { family: "page-our-services", reason: "live cmsmasters Our Services page" };
  if (routePath === "/services/") return { family: "service-archive", reason: "live CPT archive post-type-archive-services" };
  if (routePath === "/about-us/") return { family: "about", reason: "live cmsmasters-main + HTML widget" };
  if (routePath === "/contact-us/") return { family: "contact", reason: "live cmsmasters-main contact widget" };
  if (routePath === "/career/") return { family: "career", reason: "REST HTML widget; live /career/ 301s to homepage" };
  if (routePath === "/portfolio/") return { family: "portfolio", reason: "live cmsmasters + Envira gallery" };
  if (routePath === "/wp-file-download-search/") return { family: "theme-standard", reason: "theme download search" };

  if (/id=["']dgs-performance-page["']|class=["'][^"']*dgs-performance-page/.test(html)) {
    return { family: "service-html-performance", reason: "self-contained #dgs-performance-page HTML widget" };
  }
  if (/class=["'][^"']*dgs-aeo-page|id=["']dgs-aeo/.test(html)) {
    return { family: "service-html-aeo", reason: "self-contained .dgs-aeo-page HTML widget" };
  }
  if (/class=["'][^"']*dgs-geo|id=["']dgs-geo/.test(html)) {
    return { family: "service-html-geo", reason: "self-contained GEO HTML widget" };
  }
  if (routePath === "/services/llm-seo-service/" || /class=["'][^"']*dgs-llm/.test(html)) {
    return { family: "service-html-llm", reason: "self-contained LLM SEO HTML widget" };
  }
  if (
    routePath === "/services/ai-video-production-agency/" ||
    routePath === "/services/ai-production-dubai-page/" ||
    /class=["'][^"']*dgs-ai-?video|class=["'][^"']*dgs-aiv/.test(html)
  ) {
    return { family: "service-html-ai-video", reason: "self-contained AI video HTML widget" };
  }
  if (/\/seo-service/.test(routePath) && /elementor-widget-html/.test(html) && /<style/i.test(html)) {
    return { family: "service-html-location-seo", reason: "location SEO Elementor HTML widget with inline CSS" };
  }
  if (/elementor-widget-html/.test(html) && /<style/i.test(html)) {
    return { family: "service-html-widget-other", reason: "self-contained Elementor HTML widget with inline CSS" };
  }
  if (/elementor/.test(html)) {
    return { family: "elementor-standard", reason: "Elementor/cmsmasters markup without self-contained widget CSS" };
  }
  return { family: "theme-standard", reason: "cmsmasters/theme markup" };
}

async function loadRestByPath() {
  const [pages, services, posts] = await Promise.all([
    readFile(path.join(ROOT, "data/wordpress/raw/pages.json"), "utf8").then(JSON.parse),
    readFile(path.join(ROOT, "data/wordpress/raw/services.json"), "utf8").then(JSON.parse),
    readFile(path.join(ROOT, "data/wordpress/raw/posts.json"), "utf8").then(JSON.parse),
  ]);
  const byPath = new Map();
  for (const item of [...pages, ...services, ...posts]) {
    let routePath = "/";
    try {
      routePath = new URL(item.link).pathname;
      if (!routePath.endsWith("/")) routePath += "/";
      if (routePath === "/best-digital-marketing-agency-in-mumbai/") routePath = "/";
    } catch {
      continue;
    }
    const type =
      item.type ||
      (item.link?.includes("/blogs/") ? "post" : item.link?.includes("/services/") ? "service" : "page");
    byPath.set(routePath, {
      id: item.id,
      type,
      path: routePath,
      slug: item.slug,
      modified: item.modified,
      html: item.content?.rendered || "",
    });
  }
  return byPath;
}

async function fetchLive(routePath, attempt = 1) {
  const url = new URL(routePath, WP_ORIGIN).href;
  const res = await fetch(url, {
    redirect: "manual",
    headers: { "User-Agent": UA, Accept: "text/html" },
  });
  if ((res.status === 429 || res.status >= 500) && attempt < 5) {
    await sleep(1500 * attempt);
    return fetchLive(routePath, attempt + 1);
  }
  const location = res.headers.get("location");
  const html = res.status === 200 ? await res.text() : "";
  return { status: res.status, location, html };
}

async function downloadCss(url, cache) {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/css,*/*" } });
  if (!res.ok) {
    cache.set(url, null);
    return null;
  }
  const text = rewriteWpUrls(rebaseCssUrls(await res.text(), url));
  const hash = sha12(text);
  const file = `${hash}.css`;
  await writeFile(path.join(CSS_DIR, file), text);
  await writeFile(path.join(PUBLIC_CSS_DIR, file), text);
  const entry = { hash, file, url, bytes: text.length };
  cache.set(url, entry);
  return entry;
}

function prepareBody(html, pageUrl) {
  let body = stripRuntime(html);
  body = body.replace(/^(?:\s*<\/(?:div|header|section|main|span|nav|aside)>)+/i, "").trim();
  body = unwrapLazyImages(body);
  const styles = extractInlineStyles(body);
  body = stripStyleTags(body);
  body = rewriteWpUrls(body);
  const rebasedStyles = pageUrl ? rebaseCssUrls(styles, pageUrl) : styles;
  return { body, styles: rewriteWpUrls(rebasedStyles) };
}

async function main() {
  const registry = JSON.parse(
    await readFile(path.join(ROOT, "data/migration/nextjs-route-registry.generated.json"), "utf8"),
  );
  const routes = registry.routes.filter(
    (r) => (r.proposedAction === "KEEP_SAME_URL" || r.proposedAction === "PROTECTED") && r.path !== "/",
  );
  const restByPath = await loadRestByPath();

  await mkdir(PAGES_DIR, { recursive: true });
  await mkdir(CSS_DIR, { recursive: true });
  await mkdir(PUBLIC_CSS_DIR, { recursive: true });

  const cssCache = new Map();
  const classified = [];
  const index = {};
  const errors = [];

  for (const [i, route] of routes.entries()) {
    const rest = restByPath.get(route.path) || {
      id: route.wordpressId,
      type: route.wordpressType,
      path: route.path,
      html: "",
    };
    const restClass = classifyInnerFamily({
      path: route.path,
      type: rest.type || route.wordpressType,
      html: rest.html,
    });

    let source = "live";
    let liveHtml = "";
    let liveStatus = null;
    let liveLocation = null;

    if (route.path === "/career/") {
      source = "rest-fallback";
    } else {
      try {
        const live = await fetchLive(route.path);
        liveStatus = live.status;
        liveLocation = live.location;
        liveHtml = live.html;
        if (live.status >= 300 && live.status < 400) {
          source = "rest-fallback";
        } else if (live.status !== 200 || liveHtml.length < 500) {
          source = "rest-fallback";
        }
      } catch (error) {
        source = "rest-fallback";
        errors.push({ path: route.path, error: String(error) });
      }
      await sleep(DELAY_MS);
    }

    const liveClass = liveHtml
      ? classifyInnerFamily({
          path: route.path,
          type: rest.type || route.wordpressType,
          html: sliceLiveBody(liveHtml),
        })
      : restClass;
    const family = source === "rest-fallback" ? restClass.family : liveClass.family;
    const reason = source === "rest-fallback" ? restClass.reason : liveClass.reason;
    const needsThemeCss = source === "live";

    let rawBody = "";
    let fontLinks = [];
    let cssFiles = [];

    let headVisualCss = "";
    if (source === "live") {
      rawBody = sliceLiveBody(liveHtml);
      const pageUrl = new URL(route.path, WP_ORIGIN).href;
      fontLinks = collectFontLinkTags(liveHtml, pageUrl).map((tag) => rewriteWpUrls(tag));
      headVisualCss = collectHeadVisualCss(liveHtml);
      if (needsThemeCss) {
        for (const href of collectVisualStylesheetUrls(liveHtml, pageUrl)) {
          const entry = await downloadCss(href, cssCache);
          if (entry) cssFiles.push(entry.file);
        }
      }
    } else {
      rawBody = rest.html || "";
    }

    const pageUrl = source === "live" ? new URL(route.path, WP_ORIGIN).href : `${WP_ORIGIN}/`;
    const prepared = prepareBody(rawBody, pageUrl);
    if (headVisualCss) {
      const rebasedHead = rewriteWpUrls(rebaseCssUrls(headVisualCss, pageUrl));
      prepared.styles = prepared.styles ? `${rebasedHead}\n\n${prepared.styles}` : rebasedHead;
    }
    const payload = {
      path: route.path,
      family,
      wordpressId: rest.id || route.wordpressId || 0,
      type: rest.type || route.wordpressType,
      source,
      capturedAt: new Date().toISOString(),
      liveStatus,
      liveLocation,
      body: prepared.body,
      styles: prepared.styles,
      cssFiles,
      fontLinks,
      fluentFormIds: fluentFormIds(prepared.body),
      runPortfolio: family === "portfolio",
      needsThemeCss,
      bodyBytes: prepared.body.length,
      styleBytes: prepared.styles.length,
    };

    const filename = pathToMirrorFilename(route.path);
    await writeFile(path.join(PAGES_DIR, filename), `${JSON.stringify(payload)}\n`);
    index[route.path] = filename;
    classified.push({
      path: route.path,
      family,
      reason,
      source,
      wordpressId: payload.wordpressId,
      type: payload.type,
      needsThemeCss,
      fluentFormIds: payload.fluentFormIds,
      bodyBytes: payload.bodyBytes,
      cssFileCount: cssFiles.length,
    });

    process.stdout.write(
      `[${i + 1}/${routes.length}] ${route.path} ${family} ${source} body=${payload.bodyBytes} css=${cssFiles.length}\n`,
    );
  }

  const families = {};
  for (const row of classified) {
    families[row.family] ??= { count: 0, routes: [], reason: row.reason, needsThemeCss: row.needsThemeCss };
    families[row.family].count += 1;
    families[row.family].routes.push(row.path);
  }

  const familyDoc = {
    generatedAt: new Date().toISOString(),
    source: WP_ORIGIN,
    method:
      "Live HTML slice (after #dgsNav / #dgsTalkPopup, before footer) with REST fallback; scripts/JSON-LD stripped; live visual stylesheets (LiteSpeed/Elementor/theme/plugin) for every live-captured family, with CSS url() rebased to the original stylesheet URL",
    familyCounts: Object.fromEntries(Object.entries(families).map(([k, v]) => [k, v.count])),
    families,
    routes: classified,
    errors,
    uniqueCssFiles: [...cssCache.values()].filter(Boolean).map((e) => ({ file: e.file, url: e.url, bytes: e.bytes })),
  };

  await writeFile(path.join(OUT_DIR, "template-families.json"), `${JSON.stringify(familyDoc, null, 2)}\n`);
  await writeFile(
    path.join(OUT_DIR, "index.json"),
    `${JSON.stringify({ generatedAt: familyDoc.generatedAt, pages: index }, null, 2)}\n`,
  );
  console.log("\nDone.", classified.length, "pages.", "families:", JSON.stringify(familyDoc.familyCounts, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
