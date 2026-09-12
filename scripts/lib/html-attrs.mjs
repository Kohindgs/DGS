/**
 * Exact HTML attribute helpers (Node extractor copy of lib/wordpress/html-attrs.ts).
 * Do not use `\bsrc=` — it matches the `src` substring inside `data-src`.
 */

const SRC_DATA_ATTRS = ["data-src", "data-envira-src", "data-lazy-src", "data-original"];
const SRCSET_DATA_ATTRS = ["data-srcset", "data-envira-srcset", "data-lazy-srcset"];
const POSTER_DATA_ATTRS = ["data-poster", "data-lazy-poster"];

export function htmlAttrPattern(name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|\\s)${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
}

export function readHtmlAttr(tag, name) {
  const match = tag.match(htmlAttrPattern(name));
  if (!match) return null;
  return match[1] ?? match[2] ?? match[3] ?? "";
}

export function replaceHtmlAttr(tag, name, value) {
  const pattern = htmlAttrPattern(name);
  const match = tag.match(pattern);
  if (!match || match.index == null) {
    return upsertHtmlAttr(tag, name, value);
  }
  const quoted = `"${String(value).replace(/"/g, "&quot;")}"`;
  const prefix = match[0].match(/^(\s*)/)?.[1] ?? "";
  return `${tag.slice(0, match.index)}${prefix}${name}=${quoted}${tag.slice(match.index + match[0].length)}`;
}

export function upsertHtmlAttr(tag, name, value) {
  if (readHtmlAttr(tag, name) !== null) {
    return replaceHtmlAttr(tag, name, value);
  }
  const quoted = `"${String(value).replace(/"/g, "&quot;")}"`;
  return tag.replace(/(\s*\/?>)$/, ` ${name}=${quoted}$1`);
}

export function removeHtmlAttr(tag, name) {
  const pattern = htmlAttrPattern(name);
  return tag.replace(pattern, (full) => (full.startsWith(" ") || /^\s/.test(full) ? "" : ""));
}

export function removeHtmlClass(tag, className) {
  const current = readHtmlAttr(tag, "class");
  if (!current) return tag;
  const next = current
    .split(/\s+/)
    .filter((token) => token && token !== className)
    .join(" ");
  if (!next) return removeHtmlAttr(tag, "class");
  return replaceHtmlAttr(tag, "class", next);
}

export function addHtmlClass(tag, className) {
  const current = readHtmlAttr(tag, "class") ?? "";
  const tokens = current.split(/\s+/).filter(Boolean);
  if (tokens.includes(className)) return tag;
  tokens.push(className);
  return upsertHtmlAttr(tag, "class", tokens.join(" "));
}

export function isPlaceholderMediaUrl(value) {
  if (!value) return true;
  const trimmed = String(value).trim();
  if (!trimmed) return true;
  if (/^data:/i.test(trimmed)) return true;
  if (/placeholder|blank\.gif|lazy-load|1x1/i.test(trimmed)) return true;
  if (/R0lGODlhAQABAIAAAP/i.test(trimmed)) return true;
  return false;
}

function firstRealDataUrl(tag, names) {
  for (const name of names) {
    const value = readHtmlAttr(tag, name);
    if (value && !isPlaceholderMediaUrl(value)) return value;
  }
  return "";
}

function promoteAttr(tag, liveName, dataNames) {
  const data = firstRealDataUrl(tag, dataNames);
  if (!data) return tag;
  const live = readHtmlAttr(tag, liveName);
  if (!live || isPlaceholderMediaUrl(live)) {
    return upsertHtmlAttr(tag, liveName, data);
  }
  return tag;
}

export function unwrapLazyMediaTag(tag) {
  let out = tag;
  out = promoteAttr(out, "src", SRC_DATA_ATTRS);
  out = promoteAttr(out, "srcset", SRCSET_DATA_ATTRS);
  out = promoteAttr(out, "poster", POSTER_DATA_ATTRS);
  const srcset = readHtmlAttr(out, "srcset");
  if (srcset && isPlaceholderMediaUrl(srcset)) {
    out = removeHtmlAttr(out, "srcset");
  }
  out = removeHtmlClass(out, "lazyload");
  out = removeHtmlClass(out, "lazyloading");
  out = addHtmlClass(out, "e-lazyloaded");
  return out;
}

export function unwrapLazyMediaHtml(html) {
  return String(html || "").replace(/<(img|source|video|audio)\b[^>]*>/gi, (tag) => unwrapLazyMediaTag(tag));
}

export function stripCapturedFooters(html) {
  const match = String(html || "").search(/<footer\b/i);
  if (match >= 0) return String(html).slice(0, match).trim();
  return String(html || "");
}
