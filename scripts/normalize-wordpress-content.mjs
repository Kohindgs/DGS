import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const RAW_DIR = path.join(ROOT, "data/wordpress/raw");
const OUT_DIR = path.join(ROOT, "data/wordpress/normalized");
const SITE = "https://www.dgeniussolutions.com";

const [pages, services, posts] = await Promise.all([
  readJson(path.join(RAW_DIR, "pages.json")),
  readJson(path.join(RAW_DIR, "services.json")),
  readJson(path.join(RAW_DIR, "posts.json")),
]);

function decode(value = "") {
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

function text(html = "") {
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

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return match ? decode(match[1].trim()) : "";
}

function headings(html = "") {
  const items = [];
  const regex = /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = regex.exec(html))) items.push({ level: match[1].toLowerCase(), text: text(match[2]) });
  return items;
}

function links(html = "") {
  const items = [];
  for (const tag of html.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) || []) {
    const href = attr(tag, "href");
    if (!href || /^(mailto:|tel:|javascript:|#)/i.test(href)) continue;
    try {
      const url = new URL(href, SITE);
      items.push({
        href: url.href,
        internal: url.hostname.replace(/^www\./, "") === "dgeniussolutions.com",
        path: url.hostname.replace(/^www\./, "") === "dgeniussolutions.com" ? url.pathname + url.search : null,
        anchor: text(tag),
      });
    } catch {
      items.push({ href, internal: null, path: null, anchor: text(tag), malformed: true });
    }
  }
  return items;
}

function images(html = "") {
  const items = [];
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const src = attr(tag, "src") || attr(tag, "data-src") || attr(tag, "data-lazy-src");
    if (!src) continue;
    items.push({ src, alt: attr(tag, "alt"), width: attr(tag, "width"), height: attr(tag, "height") });
  }
  return items;
}

function ids(html = "") {
  const values = [];
  for (const tag of html.match(/<[^>]+\bid=["'][^"']+["'][^>]*>/gi) || []) {
    const id = attr(tag, "id");
    if (id) values.push(id);
  }
  return [...new Set(values)];
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function normalize(item, type) {
  const html = item.content?.rendered || "";
  const visibleText = text(html);
  const itemLinks = links(html);
  const itemHeadings = headings(html);
  const itemImages = images(html);
  const pathName = (() => {
    try { return new URL(item.link).pathname; } catch { return null; }
  })();
  return {
    id: item.id,
    type,
    slug: item.slug,
    path: pathName,
    sourceLink: item.link,
    status: item.status,
    date: item.date,
    modified: item.modified,
    parent: item.parent || 0,
    title: text(item.title?.rendered || ""),
    excerpt: text(item.excerpt?.rendered || ""),
    featuredMedia: item.featured_media || 0,
    evidence: {
      renderedHtmlSha256: hash(html),
      visibleTextSha256: hash(visibleText),
      visibleCharacterCount: visibleText.length,
      headingCount: itemHeadings.length,
      internalLinkCount: itemLinks.filter((link) => link.internal).length,
      externalLinkCount: itemLinks.filter((link) => link.internal === false).length,
      imageCount: itemImages.length,
    },
    headings: itemHeadings,
    links: itemLinks,
    images: itemImages,
    elementIds: ids(html),
  };
}

const normalized = {
  pages: pages.map((item) => normalize(item, "page")),
  services: services.map((item) => normalize(item, "service")),
  posts: posts.map((item) => normalize(item, "post")),
};

await mkdir(OUT_DIR, { recursive: true });
for (const [name, records] of Object.entries(normalized)) {
  await writeFile(path.join(OUT_DIR, `${name}.json`), `${JSON.stringify(records, null, 2)}\n`, "utf8");
}
await writeFile(
  path.join(OUT_DIR, "summary.json"),
  `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    source: "WordPress REST content.rendered used only as migration evidence",
    rule: "Normalized evidence must not be rendered as Elementor HTML in the final Next.js frontend.",
    totals: Object.fromEntries(Object.entries(normalized).map(([name, records]) => [name, records.length])),
  }, null, 2)}\n`,
  "utf8",
);
console.log(JSON.stringify(Object.fromEntries(Object.entries(normalized).map(([name, records]) => [name, records.length])), null, 2));

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}
