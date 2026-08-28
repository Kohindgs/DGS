import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "data/audit/live");
const CONFIG = JSON.parse(await readFile(path.join(ROOT, "data/migration/tier0-routes.json"), "utf8"));
const SITE = new URL(process.env.DGS_SOURCE_URL || CONFIG.source || "https://www.dgeniussolutions.com");

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

function text(value = "") {
  return decodeEntities(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return match ? decodeEntities(match[1].trim()) : "";
}

function meta(html, name) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    if (attr(tag, "name").toLowerCase() === name.toLowerCase()) return attr(tag, "content");
  }
  return "";
}

function canonical(html) {
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    if (attr(tag, "rel").toLowerCase().split(/\s+/).includes("canonical")) return attr(tag, "href");
  }
  return "";
}

function headings(html) {
  const result = [];
  const regex = /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = regex.exec(html))) result.push({ level: match[1].toLowerCase(), text: text(match[2]) });
  return result;
}

function links(html, pageUrl) {
  const result = [];
  for (const tag of html.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) || []) {
    const href = attr(tag, "href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue;
    try {
      const url = new URL(href, pageUrl);
      url.hash = "";
      result.push({ href: url.href, anchor: text(tag), rel: attr(tag, "rel") });
    } catch {
      // Ignore malformed href values.
    }
  }
  return result;
}

function images(html, pageUrl) {
  const result = [];
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const src = attr(tag, "src") || attr(tag, "data-src") || attr(tag, "data-lazy-src");
    if (!src) continue;
    let absolute = src;
    try {
      absolute = new URL(src, pageUrl).href;
    } catch {
      // Keep raw source.
    }
    result.push({ src: absolute, alt: attr(tag, "alt") });
  }
  return result;
}

function collectTypes(value, found = new Set()) {
  if (Array.isArray(value)) value.forEach((item) => collectTypes(item, found));
  else if (value && typeof value === "object") {
    const type = value["@type"];
    if (Array.isArray(type)) type.forEach((item) => found.add(String(item)));
    else if (type) found.add(String(type));
    Object.values(value).forEach((item) => collectTypes(item, found));
  }
  return [...found].sort();
}

function jsonLd(html) {
  const blocks = [];
  const regex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html))) {
    const raw = match[1].trim();
    if (!raw) continue;
    try {
      const value = JSON.parse(raw);
      blocks.push({ valid: true, types: collectTypes(value), value });
    } catch (error) {
      blocks.push({ valid: false, types: [], error: String(error), raw });
    }
  }
  return blocks;
}

const reports = [];
for (const route of CONFIG.routes) {
  const url = new URL(route.path, SITE);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { Accept: "text/html,*/*", "User-Agent": "DGS-NextJS-Tier0-Audit/1.0" },
    });
    const html = await response.text();
    const pageHeadings = headings(html);
    const pageLinks = links(html, response.url);
    const pageImages = images(html, response.url);
    const schema = jsonLd(html);
    const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);

    reports.push({
      path: route.path,
      label: route.label,
      wordpressId: route.wordpressId,
      status: response.status,
      finalUrl: response.url,
      title: titleMatch ? text(titleMatch[1]) : "",
      description: meta(html, "description"),
      canonical: canonical(html),
      robots: meta(html, "robots"),
      headings: pageHeadings,
      h1s: pageHeadings.filter((item) => item.level === "h1").map((item) => item.text),
      links: pageLinks,
      images: pageImages,
      schema,
      schemaTypes: [...new Set(schema.flatMap((block) => block.types || []))].sort(),
      textLength: text(html).length,
      sourceKnownIssues: route.sourceKnownIssues || [],
      desiredCanonicalPath: route.desiredCanonicalPath || route.path,
    });
  } catch (error) {
    reports.push({
      path: route.path,
      label: route.label,
      wordpressId: route.wordpressId,
      status: 0,
      error: String(error),
      sourceKnownIssues: route.sourceKnownIssues || [],
      desiredCanonicalPath: route.desiredCanonicalPath || route.path,
    });
  }
}

await mkdir(OUT_DIR, { recursive: true });
await writeFile(
  path.join(OUT_DIR, "tier0-pages.json"),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), source: SITE.origin, pages: reports }, null, 2)}\n`,
  "utf8",
);

console.log(
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      protectedPages: reports.length,
      successful: reports.filter((item) => item.status === 200).length,
      failed: reports.filter((item) => item.status !== 200).map((item) => ({ path: item.path, status: item.status })),
      schemaTypes: reports.map((item) => ({ path: item.path, types: item.schemaTypes || [] })),
    },
    null,
    2,
  ),
);

if (reports.some((item) => item.status !== 200)) process.exitCode = 1;
