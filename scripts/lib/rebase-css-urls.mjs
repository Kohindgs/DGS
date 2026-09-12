const HASH_ONLY = /^(#|%23)/i;

/**
 * Resolve a CSS url() / @import reference against the original stylesheet URL.
 * Preserves data:, blob:, and fragment-only values.
 */
export function resolveCssAssetUrl(rawUrl, stylesheetUrl) {
  const value = String(rawUrl ?? "")
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .trim();
  if (!value) return value;
  if (/^(data:|blob:)/i.test(value)) return value;
  if (HASH_ONLY.test(value)) return value;

  if (value.startsWith("//")) {
    let protocol = "https:";
    try {
      protocol = new URL(stylesheetUrl).protocol || "https:";
    } catch {
      protocol = "https:";
    }
    try {
      return new URL(`${protocol}${value}`).href;
    } catch {
      return value;
    }
  }

  try {
    return new URL(value, stylesheetUrl).href;
  } catch {
    return value;
  }
}

function skipWhitespace(css, index) {
  let i = index;
  while (i < css.length && /\s/.test(css[i])) i += 1;
  return i;
}

/** Parse a url(…) starting at `url(`. Quoted values are taken as-is so nested url() inside data: SVGs is not rewritten. */
export function parseCssUrlFunction(css, idx) {
  if (css.slice(idx, idx + 4).toLowerCase() !== "url(") return null;
  let p = skipWhitespace(css, idx + 4);
  if (p >= css.length) return null;
  const quote = css[p] === '"' || css[p] === "'" ? css[p] : "";
  if (quote) {
    const start = p + 1;
    const endQuote = css.indexOf(quote, start);
    if (endQuote < 0) return null;
    let close = skipWhitespace(css, endQuote + 1);
    if (css[close] !== ")") return null;
    return { raw: css.slice(start, endQuote), quote, end: close + 1 };
  }

  const start = p;
  const peek = css.slice(start, start + 5).toLowerCase();
  if (peek.startsWith("data:") || peek.startsWith("blob:")) {
    let depth = 1;
    let j = start;
    while (j < css.length && depth > 0) {
      if (css[j] === "(") depth += 1;
      else if (css[j] === ")") depth -= 1;
      j += 1;
    }
    return { raw: css.slice(start, j - 1), quote: "", end: j };
  }

  const close = css.indexOf(")", start);
  if (close < 0) return null;
  return { raw: css.slice(start, close).trim(), quote: "", end: close + 1 };
}

function rewriteUrlFunction(css, stylesheetUrl) {
  let out = "";
  let i = 0;
  const lower = css.toLowerCase();
  while (i < css.length) {
    const idx = lower.indexOf("url(", i);
    if (idx === -1) {
      out += css.slice(i);
      break;
    }
    out += css.slice(i, idx);
    const parsed = parseCssUrlFunction(css, idx);
    if (!parsed) {
      out += css.slice(idx);
      break;
    }
    const resolved = resolveCssAssetUrl(parsed.raw, stylesheetUrl);
    out += `url(${parsed.quote}${resolved}${parsed.quote})`;
    i = parsed.end;
  }
  return out;
}

function rewriteImportUrls(css, stylesheetUrl) {
  return css.replace(
    /@import\s+(?:url\(\s*(['"]?)([^'")]*?)\1\s*\)|(['"])([^'"]+)\3)(\s+[^;]*)?;/gi,
    (full, q1, url1, q2, url2, rest = "") => {
      const raw = url1 || url2 || "";
      if (/^(data:|blob:)/i.test(raw.trim())) return full;
      const resolved = resolveCssAssetUrl(raw, stylesheetUrl);
      const q = q1 || q2 || '"';
      return `@import url(${q}${resolved}${q})${rest || ""};`;
    },
  );
}

/** Rebase every relative CSS asset URL to an absolute URL using the source stylesheet. */
export function rebaseCssUrls(css, stylesheetUrl) {
  if (!css || !stylesheetUrl) return css || "";
  return rewriteImportUrls(rewriteUrlFunction(css, stylesheetUrl), stylesheetUrl);
}

/** True when a stylesheet still has a relative (non-data, non-hash) url() after rebasing. */
export function findRelativeCssUrls(css) {
  const hits = [];
  let i = 0;
  const lower = String(css || "").toLowerCase();
  while (i < lower.length) {
    const idx = lower.indexOf("url(", i);
    if (idx === -1) break;
    const parsed = parseCssUrlFunction(css, idx);
    if (!parsed) break;
    const value = parsed.raw.trim();
    const isAbsolute =
      !value ||
      /^(data:|blob:|https?:|\/\/)/i.test(value) ||
      HASH_ONLY.test(value);
    if (!isAbsolute) {
      hits.push(value);
    }
    i = parsed.end;
  }
  return hits;
}
