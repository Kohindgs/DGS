/**
 * Inner-page WordPress HTML repairs.
 *
 * Attribute matching must use `(?:^|\\s)name=` — never `\\bsrc=`.
 * `-` is a non-word character, so `\\bsrc=` matches the `src` in `data-src`.
 */

const SRC_DATA_ATTRS = ["data-src", "data-envira-src", "data-lazy-src", "data-original"];
const SRCSET_DATA_ATTRS = ["data-srcset", "data-envira-srcset", "data-lazy-srcset"];
const POSTER_DATA_ATTRS = ["data-poster", "data-lazy-poster"];

export const NATIVE_JUSTIFIED_GALLERY_ROOT_ID = "dgs-native-justified-gallery-root";

/** Empty in-tree mount so the native gallery stays inside the Elementor shortcode width. */
export const NATIVE_JUSTIFIED_GALLERY_MOUNT = `<div id="${NATIVE_JUSTIFIED_GALLERY_ROOT_ID}" data-dgs-native-justified-gallery-root="true" style="margin-bottom:20px"></div>`;

export function htmlAttrPattern(name: string): RegExp {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|\\s)${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
}

export function readHtmlAttr(tag: string, name: string): string | null {
  const match = tag.match(htmlAttrPattern(name));
  if (!match) return null;
  return match[1] ?? match[2] ?? match[3] ?? "";
}

export function replaceHtmlAttr(tag: string, name: string, value: string): string {
  const pattern = htmlAttrPattern(name);
  const match = tag.match(pattern);
  if (!match || match.index == null) {
    return upsertHtmlAttr(tag, name, value);
  }
  const quoted = `"${value.replace(/"/g, "&quot;")}"`;
  const prefix = match[0].match(/^(\s*)/)?.[1] ?? "";
  return `${tag.slice(0, match.index)}${prefix}${name}=${quoted}${tag.slice(match.index + match[0].length)}`;
}

export function upsertHtmlAttr(tag: string, name: string, value: string): string {
  if (readHtmlAttr(tag, name) !== null) {
    return replaceHtmlAttr(tag, name, value);
  }
  const quoted = `"${value.replace(/"/g, "&quot;")}"`;
  return tag.replace(/(\s*\/?>)$/, ` ${name}=${quoted}$1`);
}

export function removeHtmlAttr(tag: string, name: string): string {
  const pattern = htmlAttrPattern(name);
  return tag.replace(pattern, (full) => (full.startsWith(" ") || /^\s/.test(full) ? "" : ""));
}

export function removeHtmlClass(tag: string, className: string): string {
  const current = readHtmlAttr(tag, "class");
  if (!current) return tag;
  const next = current
    .split(/\s+/)
    .filter((token) => token && token !== className)
    .join(" ");
  if (!next) return removeHtmlAttr(tag, "class");
  return replaceHtmlAttr(tag, "class", next);
}

export function addHtmlClass(tag: string, className: string): string {
  const current = readHtmlAttr(tag, "class") ?? "";
  const tokens = current.split(/\s+/).filter(Boolean);
  if (tokens.includes(className)) return tag;
  tokens.push(className);
  return upsertHtmlAttr(tag, "class", tokens.join(" "));
}

export function isPlaceholderMediaUrl(value: string | null | undefined): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (/^data:/i.test(trimmed)) return true;
  if (/placeholder|blank\.gif|lazy-load|1x1/i.test(trimmed)) return true;
  if (/R0lGODlhAQABAIAAAP/i.test(trimmed)) return true;
  return false;
}

function firstRealDataUrl(tag: string, names: string[]): string {
  for (const name of names) {
    const value = readHtmlAttr(tag, name);
    if (value && !isPlaceholderMediaUrl(value)) return value;
  }
  return "";
}

function promoteAttr(tag: string, liveName: string, dataNames: string[]): string {
  const data = firstRealDataUrl(tag, dataNames);
  if (!data) return tag;
  const live = readHtmlAttr(tag, liveName);
  if (!live || isPlaceholderMediaUrl(live)) {
    return upsertHtmlAttr(tag, liveName, data);
  }
  return tag;
}

export function unwrapLazyMediaTag(tag: string): string {
  let out = tag;
  out = promoteAttr(out, "src", SRC_DATA_ATTRS);
  out = promoteAttr(out, "srcset", SRCSET_DATA_ATTRS);
  out = promoteAttr(out, "poster", POSTER_DATA_ATTRS);
  const srcset = readHtmlAttr(out, "srcset");
  if (srcset && isPlaceholderMediaUrl(srcset)) {
    out = removeHtmlAttr(out, "srcset");
  }
  const isImg = /^<img\b/i.test(out);
  if (isImg) {
    const src = readHtmlAttr(out, "src");
    if (src !== null && src.trim() === "") {
      out = removeHtmlAttr(out, "src");
    }
  }
  out = removeHtmlClass(out, "lazyload");
  out = removeHtmlClass(out, "lazyloading");
  out = addHtmlClass(out, "e-lazyloaded");
  return out;
}

export function unwrapLazyMediaHtml(html: string): string {
  return html.replace(/<(img|source|video|audio)\b[^>]*>/gi, (tag) => unwrapLazyMediaTag(tag));
}

/** Drop captured WordPress/Elementor footers; Next appends the shared extracted footer. */
export function stripCapturedFooters(html: string): string {
  const match = html.search(/<footer\b/i);
  if (match >= 0) return html.slice(0, match).trim();
  return html;
}

function findMatchingClose(html: string, startIdx: number): number {
  const tagMatch = html.slice(startIdx).match(/^<([a-zA-Z0-9-]+)/);
  if (!tagMatch) return -1;
  const tag = tagMatch[1];
  let depth = 0;
  const re = new RegExp(`<(/)?${tag}\\b[^>]*>`, "gi");
  re.lastIndex = startIdx;
  let match: RegExpExecArray | null;
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

/** Strip Envira/LiteSpeed/Smush placeholders so the real media URL is what the browser paints. */
export function unwrapMirrorLazyMedia(html: string): string {
  return unwrapDataBackgrounds(unwrapLazyMediaHtml(html));
}

function unwrapDataBackgrounds(html: string): string {
  return html.replace(/<(div|section|span|figure|a|header|footer|article|aside|li)\b[^>]*>/gi, (tag) => {
    const dataBg =
      readHtmlAttr(tag, "data-bg") ||
      readHtmlAttr(tag, "data-lazy-bg") ||
      readHtmlAttr(tag, "data-bg-webp");
    if (!dataBg || isPlaceholderMediaUrl(dataBg)) return tag;
    if (/background-image\s*:/i.test(tag)) return tag;
    if (readHtmlAttr(tag, "style") !== null) {
      const style = readHtmlAttr(tag, "style") || "";
      return upsertHtmlAttr(tag, "style", `background-image:url('${dataBg}');${style}`);
    }
    return upsertHtmlAttr(tag, "style", `background-image:url('${dataBg}')`);
  });
}

/** Elementor JS adds this class so lazy background CSS does not zero out section images. */
export function markElementorBackgroundsReady(html: string): string {
  return html.replace(/class=(["'])([^"']*\be-con\b[^"']*\be-parent\b[^"']*)\1/gi, (full, q, cls) => {
    if (/\be-lazyloaded\b/.test(cls) || /\be-no-lazyload\b/.test(cls)) return full;
    return `class=${q}${cls} e-lazyloaded${q}`;
  });
}

/** Replace the Envira wrap with a native mount. Returns original HTML if the wrap cannot be sliced cleanly. */
export function replaceEnviraWrapWithNativeMount(html: string): string {
  const match = html.match(/<div[^>]*id=["']envira-gallery-wrap-\d+["'][^>]*>/i);
  if (!match || match.index == null) return html;
  const end = findMatchingClose(html, match.index);
  if (end < 0) return html;
  return `${html.slice(0, match.index)}${NATIVE_JUSTIFIED_GALLERY_MOUNT}${html.slice(end)}`;
}

export function hasNativeVideoPortfolioMount(html: string): boolean {
  return /id=["']portfolio-gallery["']/.test(html) && /id=["']load-more-btn["']/.test(html);
}
