import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const MIGRATION_DIR = path.join(ROOT, "data/migration");
const WP_RAW_DIR = path.join(ROOT, "data/wordpress/raw");

const tier0 = JSON.parse(await readFile(path.join(MIGRATION_DIR, "tier0-routes.json"), "utf8"));
const [pages, services] = await Promise.all([
  readJson(path.join(WP_RAW_DIR, "pages.json")),
  readJson(path.join(WP_RAW_DIR, "services.json")),
]);

const recordsById = new Map([...pages, ...services].map((item) => [Number(item.id), item]));

function decodeEntities(value = "") {
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

function normalizeText(html = "") {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return match ? decodeEntities(match[1].trim()) : "";
}

function headingsFrom(html = "") {
  const headings = [];
  const regex = /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = regex.exec(html))) {
    headings.push({ level: match[1].toLowerCase(), text: normalizeText(match[2]) });
  }
  return headings;
}

function internalLinksFrom(html = "") {
  const links = [];
  const tags = html.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) || [];
  for (const tag of tags) {
    const href = attr(tag, "href");
    if (!href) continue;
    try {
      const url = new URL(href, "https://www.dgeniussolutions.com");
      if (url.hostname.replace(/^www\./, "") !== "dgeniussolutions.com") continue;
      links.push({ path: url.pathname + url.search, anchor: normalizeText(tag) });
    } catch {
      // Skip malformed URLs.
    }
  }
  return links;
}

function imagesFrom(html = "") {
  const images = [];
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const src = attr(tag, "src") || attr(tag, "data-src") || attr(tag, "data-lazy-src");
    if (!src) continue;
    images.push({ src, alt: attr(tag, "alt") });
  }
  return images;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

const baselines = [];
const missing = [];

for (const route of tier0.routes) {
  const record = recordsById.get(Number(route.wordpressId));
  if (!record) {
    missing.push({ path: route.path, wordpressId: route.wordpressId });
    continue;
  }

  const html = record.content?.rendered || "";
  const visibleText = normalizeText(html);
  const headings = headingsFrom(html);
  const internalLinks = internalLinksFrom(html);
  const images = imagesFrom(html);

  baselines.push({
    path: route.path,
    wordpressId: route.wordpressId,
    wordpressType: record.type || null,
    slug: record.slug,
    sourceLink: record.link,
    modified: record.modified,
    titleRendered: normalizeText(record.title?.rendered || ""),
    content: {
      normalizedText: visibleText,
      normalizedTextSha256: sha256(visibleText),
      renderedHtmlSha256: sha256(html),
      characterCount: visibleText.length,
      headingCount: headings.length,
      internalLinkCount: internalLinks.length,
      imageCount: images.length,
    },
    headings,
    internalLinks,
    images,
  });
}

const output = {
  generatedAt: new Date().toISOString(),
  source: "WordPress REST content.rendered",
  warning: "This snapshot preserves migration content evidence. Do not use Elementor-rendered wrappers as the new frontend architecture.",
  missing,
  baselines,
};

await mkdir(MIGRATION_DIR, { recursive: true });
await writeFile(path.join(MIGRATION_DIR, "tier0-content-baseline.generated.json"), `${JSON.stringify(output, null, 2)}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      generatedAt: output.generatedAt,
      protectedRoutes: tier0.routes.length,
      captured: baselines.length,
      missing: missing.length,
      hashes: baselines.map((item) => ({ path: item.path, sha256: item.content.normalizedTextSha256 })),
    },
    null,
    2,
  ),
);

if (missing.length) process.exitCode = 1;

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}
