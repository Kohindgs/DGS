import { readHtmlAttr } from "./html-attrs.mjs";

const WP_ORIGIN = "https://www.dgeniussolutions.com";

const EXCLUDE =
  /wp-admin\/|wp-login|customize\.php|\/css\/editor(?:-|\.)|editor\.min\.css|\/admin-bar(?:\.min)?\.css/i;

const INCLUDE_PATH =
  /\/wp-content\/(?:litespeed\/css\/[a-f0-9]+\.css|(?:plugins|themes|uploads|cache)\/[^"' ]+\.css)|\/wp-includes\/css\/[^"' ]+\.css/i;

export function absolutizeHref(href, pageUrl = `${WP_ORIGIN}/`) {
  const value = String(href || "").trim();
  if (!value || /^data:/i.test(value)) return null;
  try {
    if (value.startsWith("//")) return new URL(`https:${value}`).href;
    return new URL(value, pageUrl).href;
  } catch {
    return null;
  }
}

export function isExcludedStylesheet(href) {
  return EXCLUDE.test(String(href || ""));
}

export function isVisualStylesheetHref(href) {
  const clean = String(href || "").split("#")[0].split("?")[0];
  if (!clean) return false;
  if (isExcludedStylesheet(clean)) return false;
  if (INCLUDE_PATH.test(clean)) return true;
  if (/\/wp-content\/litespeed\/css\/[a-f0-9]+\.css$/i.test(clean)) return true;
  return false;
}

/** Stylesheet URLs the live page actually loads for visual parity. */
export function collectVisualStylesheetUrls(html, pageUrl = `${WP_ORIGIN}/`) {
  const urls = [];
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    const rel = tag.match(/\brel=["']([^"']+)["']/i)?.[1] || "";
    const as = tag.match(/\bas=["']([^"']+)["']/i)?.[1] || "";
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
    if (!href) continue;
    const isSheet = /stylesheet/i.test(rel) || (/preload/i.test(rel) && /style/i.test(as));
    if (!isSheet) continue;
    const abs = absolutizeHref(href, pageUrl);
    if (!abs || /fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(abs)) continue;
    if (!isVisualStylesheetHref(abs)) continue;
    urls.push(abs.split("#")[0]);
  }
  return [...new Set(urls)];
}

/** Google Fonts + locally cached webfont preloads that live WordPress uses. */
export function collectFontLinkTags(html, pageUrl = `${WP_ORIGIN}/`) {
  const links = [];
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1] || "";
    const rel = tag.match(/\brel=["']([^"']+)["']/i)?.[1] || "";
    const as = tag.match(/\bas=["']([^"']+)["']/i)?.[1] || "";
    const isFont =
      /fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(href) ||
      /fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(tag) ||
      (/preload/i.test(rel) && /font/i.test(as)) ||
      (/stylesheet/i.test(rel) && /fonts\.googleapis/i.test(href));
    if (!isFont) continue;
    let out = tag;
    const abs = absolutizeHref(href, pageUrl);
    if (abs && href && abs !== href) {
      out = out.replace(href, abs);
    }
    links.push(out);
  }
  return [...new Set(links)];
}

export function looksLikePlaceholderSrc(value) {
  const src = String(value || "");
  return (
    /^data:image\//i.test(src) ||
    /placeholder/i.test(src) ||
    /R0lGODlhAQABAIAAAP/i.test(src) ||
    src === "data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  );
}

const SKIP_HEAD_CSS =
  /#dgsNav\b|#dgsTalkPopup|FOOTER - LIGHTWEIGHT|fluentform_wrapper|\.ff-btn-submit|e-con\.e-parent:nth-of-type/i;

/**
 * Head <style> blocks the body slice does not include: @font-face with root-relative
 * cached fonts, and small Elementor inline background-image rules.
 * Skips nav/footer/form chrome and Elementor's lazy-background killer.
 */
export function collectHeadVisualCss(html) {
  const blocks = [];
  for (const match of String(html || "").matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    const css = match[1].trim();
    if (!css || css.length > 20000) continue;
    if (SKIP_HEAD_CSS.test(css)) continue;
    if (/@font-face/i.test(css) || /url\(/i.test(css) || /background-image\s*:/i.test(css)) {
      blocks.push(css);
    }
  }
  return blocks.join("\n\n");
}

/** Extract img/source/video visual URLs from HTML for parity audits. */
export function collectHtmlVisualAssetUrls(html) {
  const urls = [];
  const push = (value) => {
    const src = String(value || "").trim();
    if (src) urls.push(src);
  };
  for (const tag of String(html || "").matchAll(/<img\b[^>]*>/gi)) {
    const read = (name) => readHtmlAttr(tag[0], name) || "";
    push(read("src"));
    const srcset = read("srcset") || read("data-srcset") || read("data-envira-srcset");
    for (const part of srcset.split(",")) {
      push(part.trim().split(/\s+/)[0]);
    }
    push(read("data-src") || read("data-envira-src") || read("data-lazy-src"));
  }
  for (const tag of String(html || "").matchAll(/<(?:source|video|use)\b[^>]*>/gi)) {
    const read = (name) => readHtmlAttr(tag[0], name) || "";
    push(read("src"));
    push(read("poster") || read("data-poster"));
    push(read("href") || read("xlink:href"));
    const srcset = read("srcset") || read("data-srcset") || "";
    for (const part of srcset.split(",")) push(part.trim().split(/\s+/)[0]);
  }
  return [...new Set(urls.filter(Boolean))];
}
