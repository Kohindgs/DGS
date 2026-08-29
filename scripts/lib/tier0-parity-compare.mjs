/**
 * Shared WordPress vs Next tier-0 content extraction and comparison helpers.
 */
import { createHash } from "node:crypto";

export function decode(value = "") {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

export function normalizeText(html = "") {
  return decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

export function attr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return match ? decode(match[1].trim()) : "";
}

export function normalizePath(value, base) {
  const url = new URL(value, base);
  let pathname = url.pathname || "/";
  if (pathname !== "/" && !pathname.endsWith("/") && !/\.[a-z0-9]{1,8}$/i.test(pathname)) pathname += "/";
  return pathname;
}

export function canonicalFromHtml(html) {
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    if (attr(tag, "rel").toLowerCase().split(/\s+/).includes("canonical")) return attr(tag, "href");
  }
  return "";
}

export function metaFromHtml(html, name) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    if (attr(tag, "name").toLowerCase() === name.toLowerCase()) return attr(tag, "content");
  }
  return "";
}

export function titleFromHtml(html) {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return match ? normalizeText(match[1]) : "";
}

export function extractArticleHtml(fullHtml) {
  const match = fullHtml.match(/<article\b[^>]*data-migration-content[^>]*>([\s\S]*?)<\/article>/i);
  return match?.[1] || "";
}

export function extractHeadings(html) {
  return [...html.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m, index) => ({
    index,
    level: m[1].toLowerCase(),
    text: normalizeText(m[2]),
  }));
}

export function extractFaqItems(html) {
  const items = [];
  for (const match of html.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/gi)) {
    const block = match[1];
    const question = normalizeText(block.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i)?.[1] || "");
    const answer = normalizeText(block.replace(/<summary[\s\S]*?<\/summary>/i, " "));
    if (question) items.push({ question, answer });
  }
  return items;
}

export function extractImages(html) {
  return [...html.matchAll(/<img\b[^>]*>/gi)].map((m, index) => {
    const tag = m[0];
    return {
      index,
      src: attr(tag, "src") || attr(tag, "data-src") || attr(tag, "data-lazy-src"),
      alt: attr(tag, "alt"),
    };
  });
}

export function extractContextualLinks(html, pageUrl) {
  const links = [];
  for (const tag of html.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) || []) {
    const href = attr(tag, "href");
    if (!href || /^(mailto:|tel:|javascript:|#)/i.test(href)) continue;
    let pathOnly = href;
    let destination = href;
    try {
      const url = new URL(href, pageUrl);
      destination = url.href;
      pathOnly = normalizePath(url.pathname, pageUrl);
    } catch {
      pathOnly = `invalid:${href}`;
    }
    links.push({
      anchor: normalizeText(tag),
      href,
      destination,
      path: pathOnly,
      scope: "body",
    });
  }
  return links;
}

export function textSha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

export function isTemplateLiteralHeading(text) {
  const cleaned = String(text || "").replace(/^['"]+|['"]+$/g, "").trim();
  return /^\+title\+$/i.test(cleaned);
}

export function isLazyPlaceholderSrc(src = "") {
  return /^data:image\/svg\+xml/i.test(src);
}

export function isImageLinkWrapArtifact(link) {
  if (link.anchor?.trim()) return false;
  return /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(link.path || link.href || "");
}

export function isChromeParagraph(text) {
  return /^(Home|Services|About|Contact|Blog|Portfolio)$/i.test(text.trim());
}

export function diffHeadings(source, target) {
  const missing = source.filter((h) => !target.some((t) => t.level === h.level && t.text === h.text));
  const extra = target.filter((h) => !source.some((s) => s.level === h.level && s.text === h.text));
  const orderChanged =
    source.map((h) => `${h.level}:${h.text}`).join("|") !== target.map((h) => `${h.level}:${h.text}`).join("|");
  return { missing, extra, orderChanged };
}

export function diffFaq(source, target) {
  const sourceMap = new Map(source.map((f) => [f.question, f.answer]));
  const targetMap = new Map(target.map((f) => [f.question, f.answer]));
  return {
    missing: [...sourceMap.keys()].filter((q) => !targetMap.has(q)),
    extra: [...targetMap.keys()].filter((q) => !sourceMap.has(q)),
    answerDiffs: [...sourceMap.entries()]
      .filter(([q, a]) => targetMap.has(q) && targetMap.get(q) !== a)
      .map(([question, sourceAnswer]) => ({
        question,
        sourceAnswer,
        targetAnswer: targetMap.get(question),
      })),
  };
}

export function diffContextualLinks(source, target) {
  const key = (link) => `${link.path}::${link.anchor}`;
  const sourceKeys = new Set(source.map(key));
  const targetKeys = new Set(target.map(key));
  return {
    missingInTarget: source.filter((link) => !targetKeys.has(key(link))),
    extraInTarget: target.filter((link) => !sourceKeys.has(key(link))),
  };
}

export function diffImages(source, target) {
  const missing = source.filter((img) => !target.some((t) => t.src === img.src));
  const extra = target.filter((img) => !source.some((s) => s.src === img.src));
  const altDiffs = source
    .map((img) => {
      const match = target.find((t) => t.src === img.src);
      return match && match.alt !== img.alt ? { src: img.src, sourceAlt: img.alt, targetAlt: match.alt } : null;
    })
    .filter(Boolean);
  return { missing, extra, altDiffs };
}

export function meaningfulMissingHeadings(missing) {
  return missing.filter((h) => h.text && !isTemplateLiteralHeading(h.text));
}

export function meaningfulMissingLinks(missing) {
  return missing.filter((link) => !isImageLinkWrapArtifact(link));
}

export function meaningfulAltDiffs(altDiffs) {
  return altDiffs.filter((diff) => {
    if (isLazyPlaceholderSrc(diff.src)) return false;
    const sourceAlt = (diff.sourceAlt || "").trim();
    const targetAlt = (diff.targetAlt || "").trim();
    if (!sourceAlt && !targetAlt) return false;
    return sourceAlt !== targetAlt;
  });
}
