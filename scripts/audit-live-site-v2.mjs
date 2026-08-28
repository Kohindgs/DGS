import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SITE = new URL(process.env.DGS_SOURCE_URL || "https://www.dgeniussolutions.com");
const OUT_DIR = path.join(ROOT, "data/audit/live");
const CONCURRENCY = Math.max(1, Number(process.env.AUDIT_CONCURRENCY || "6"));
const MAX_REDIRECTS = 10;
const tier0 = JSON.parse(
  await readFile(path.join(ROOT, "data/migration/tier0-routes.json"), "utf8"),
);
const protectedByPath = new Map(tier0.routes.map((route) => [normalPath(route.path), route]));

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

function stripTags(value = "") {
  return decode(
    value
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

function normalPath(input) {
  try {
    const url = new URL(input, SITE);
    let pathname = url.pathname || "/";
    if (pathname !== "/" && !pathname.endsWith("/") && !/\.[a-z0-9]{1,8}$/i.test(pathname)) {
      pathname += "/";
    }
    return pathname;
  } catch {
    return input;
  }
}

function firstText(html, regex) {
  const match = html.match(regex);
  return match ? stripTags(match[1]) : "";
}

function metaContent(html, name) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const metaName = attr(tag, "name").toLowerCase();
    const property = attr(tag, "property").toLowerCase();
    if (metaName === name.toLowerCase() || property === name.toLowerCase()) return attr(tag, "content");
  }
  return "";
}

function canonicalFrom(html) {
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    if (attr(tag, "rel").toLowerCase().split(/\s+/).includes("canonical")) return attr(tag, "href");
  }
  return "";
}

function headingsFrom(html) {
  const headings = [];
  const regex = /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = regex.exec(html))) headings.push({ level: match[1].toLowerCase(), text: stripTags(match[2]) });
  return headings;
}

function linksFrom(html, pageUrl) {
  const links = [];
  for (const tag of html.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) || []) {
    const href = attr(tag, "href");
    if (!href || href.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(href)) continue;
    try {
      const url = new URL(href, pageUrl);
      url.hash = "";
      links.push({
        href: url.href,
        path: url.origin === SITE.origin ? normalPath(url.pathname + url.search) : null,
        internal: url.origin === SITE.origin,
        anchor: stripTags(tag),
        rel: attr(tag, "rel"),
      });
    } catch {
      links.push({ href, path: null, internal: null, anchor: stripTags(tag), malformed: true });
    }
  }
  return links;
}

function imagesFrom(html, pageUrl) {
  const images = [];
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const src = attr(tag, "src") || attr(tag, "data-src") || attr(tag, "data-lazy-src");
    if (!src) continue;
    let absolute = src;
    try {
      absolute = new URL(src, pageUrl).href;
    } catch {
      // Keep raw source for review.
    }
    images.push({ src: absolute, alt: attr(tag, "alt"), width: attr(tag, "width"), height: attr(tag, "height") });
  }
  return images;
}

function collectJsonLdTypes(value, found = new Set()) {
  if (Array.isArray(value)) value.forEach((item) => collectJsonLdTypes(item, found));
  else if (value && typeof value === "object") {
    const type = value["@type"];
    if (Array.isArray(type)) type.forEach((item) => found.add(String(item)));
    else if (type) found.add(String(type));
    Object.values(value).forEach((item) => collectJsonLdTypes(item, found));
  }
  return [...found].sort();
}

function jsonLdFrom(html) {
  const blocks = [];
  const regex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html))) {
    const raw = match[1].trim();
    if (!raw) continue;
    try {
      const value = JSON.parse(raw);
      blocks.push({ valid: true, types: collectJsonLdTypes(value), value });
    } catch (error) {
      blocks.push({ valid: false, types: [], error: String(error), raw });
    }
  }
  return blocks;
}

function xmlLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([\s\S]*?)\s*<\/loc>/gi)].map((match) => decode(match[1].trim()));
}

function classifyContentType(contentType = "", body = "") {
  const type = contentType.toLowerCase();
  if (type.includes("text/html") || type.includes("application/xhtml+xml")) return "html";
  if (type.includes("kml") || type.includes("xml") || type.includes("rss") || type.includes("atom")) return "machine-readable";
  if (!type && /<!doctype\s+html|<html\b/i.test(body)) return "html";
  return "other";
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      Accept: options.accept || "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "User-Agent": "DGS-NextJS-Migration-Audit/2.0",
    },
    redirect: options.redirect || "follow",
  });
  return { response, text: await response.text() };
}

async function getRedirectChain(inputUrl) {
  const chain = [];
  let current = new URL(inputUrl);
  for (let step = 0; step <= MAX_REDIRECTS; step += 1) {
    const response = await fetch(current, {
      headers: { Accept: "text/html,*/*", "User-Agent": "DGS-NextJS-Migration-Audit/2.0" },
      redirect: "manual",
    });
    const location = response.headers.get("location");
    chain.push({ url: current.href, status: response.status, location });
    if (response.status < 300 || response.status >= 400 || !location) {
      return { chain, finalUrl: current.href, status: response.status };
    }
    current = new URL(location, current);
  }
  return { chain, finalUrl: current.href, status: 0, error: `More than ${MAX_REDIRECTS} redirects` };
}

async function discoverSitemaps() {
  const robotsUrl = new URL("/robots.txt", SITE);
  const robotsResult = await fetchText(robotsUrl, { accept: "text/plain,*/*" });
  const robots = robotsResult.text;
  const declared = [...robots.matchAll(/^\s*Sitemap:\s*(\S+)\s*$/gim)].map((match) => match[1]);
  const queue = [...new Set(declared.length ? declared : [new URL("/sitemap_index.xml", SITE).href, new URL("/sitemap.xml", SITE).href])];
  const visited = new Set();
  const sitemaps = [];
  const pageUrls = new Set();

  while (queue.length) {
    const sitemapUrl = queue.shift();
    if (!sitemapUrl || visited.has(sitemapUrl)) continue;
    visited.add(sitemapUrl);
    try {
      const { response, text } = await fetchText(sitemapUrl, { accept: "application/xml,text/xml,*/*" });
      const locs = xmlLocs(text);
      const isIndex = /<sitemapindex\b/i.test(text);
      sitemaps.push({ url: sitemapUrl, status: response.status, locCount: locs.length, isIndex });
      if (!response.ok) continue;
      if (isIndex) {
        locs.forEach((loc) => !visited.has(loc) && queue.push(loc));
      } else {
        for (const loc of locs) {
          try {
            const url = new URL(loc);
            if (url.origin === SITE.origin) pageUrls.add(url.href);
          } catch {
            // Malformed entries remain visible through the sitemap record count.
          }
        }
      }
    } catch (error) {
      sitemaps.push({ url: sitemapUrl, status: 0, locCount: 0, isIndex: false, error: String(error) });
    }
  }
  return { robots, robotsUrl: robotsUrl.href, sitemaps, pageUrls };
}

async function auditPage(url, sitemapMember) {
  const redirect = await getRedirectChain(url);
  const finalUrl = redirect.finalUrl;
  let body = "";
  let contentType = "";
  let fetchError = redirect.error || "";
  try {
    const response = await fetch(finalUrl, {
      headers: { Accept: "text/html,application/xhtml+xml,application/xml,*/*", "User-Agent": "DGS-NextJS-Migration-Audit/2.0" },
      redirect: "follow",
    });
    contentType = response.headers.get("content-type") || "";
    body = await response.text();
  } catch (error) {
    fetchError = String(error);
  }

  const resourceType = classifyContentType(contentType, body);
  const isHtml = resourceType === "html";
  const title = isHtml ? firstText(body, /<title\b[^>]*>([\s\S]*?)<\/title>/i) : "";
  const headings = isHtml ? headingsFrom(body) : [];
  const links = isHtml ? linksFrom(body, finalUrl) : [];
  const images = isHtml ? imagesFrom(body, finalUrl) : [];
  const jsonLd = isHtml ? jsonLdFrom(body) : [];
  const canonical = isHtml ? canonicalFrom(body) : "";
  const robots = isHtml ? metaContent(body, "robots") : "";
  const description = isHtml ? metaContent(body, "description") : "";
  const sourcePath = normalPath(new URL(url).pathname);
  const finalPath = normalPath(new URL(finalUrl).pathname);
  const protectedRoute = protectedByPath.get(sourcePath) || protectedByPath.get(finalPath) || null;

  return {
    sourceUrl: url,
    sourcePath,
    finalUrl,
    finalPath,
    status: redirect.status,
    redirectChain: redirect.chain,
    contentType,
    resourceType,
    fetchError,
    sitemapMember,
    protected: Boolean(protectedRoute),
    protectedLabel: protectedRoute?.label || null,
    title,
    description,
    canonical,
    robots,
    indexable: isHtml && redirect.status === 200 && !/noindex/i.test(robots),
    headings,
    h1s: headings.filter((item) => item.level === "h1").map((item) => item.text),
    internalLinks: links.filter((item) => item.internal),
    externalLinks: links.filter((item) => item.internal === false),
    malformedLinks: links.filter((item) => item.malformed),
    images,
    jsonLd,
    schemaTypes: [...new Set(jsonLd.flatMap((block) => block.types || []))].sort(),
    textLength: isHtml ? stripTags(body).length : 0,
  };
}

async function mapLimit(values, limit, worker) {
  const results = new Array(values.length);
  let cursor = 0;
  async function runner() {
    while (true) {
      const index = cursor++;
      if (index >= values.length) return;
      results[index] = await worker(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, () => runner()));
  return results;
}

await mkdir(OUT_DIR, { recursive: true });
const discovery = await discoverSitemaps();
const sitemapUrls = new Set([...discovery.pageUrls].map((url) => new URL(url).href));
const allUrls = new Set(sitemapUrls);
for (const route of tier0.routes) allUrls.add(new URL(route.path, SITE).href);
const auditUrls = [...allUrls].sort();
const pages = await mapLimit(auditUrls, CONCURRENCY, (url) => auditPage(url, sitemapUrls.has(url)));

const inbound = new Map();
const edges = [];
for (const page of pages) {
  if (page.resourceType !== "html") continue;
  for (const link of page.internalLinks) {
    if (!link.path) continue;
    edges.push({ from: page.finalPath, to: link.path, anchor: link.anchor, rel: link.rel });
    inbound.set(link.path, (inbound.get(link.path) || 0) + 1);
  }
}

const orphans = pages
  .filter((page) => page.resourceType === "html" && page.indexable && page.finalPath !== "/" && (inbound.get(page.finalPath) || 0) === 0)
  .map((page) => ({ path: page.finalPath, title: page.title, status: page.status, protected: page.protected }));

const redirects = pages
  .filter((page) => page.redirectChain.some((step) => step.status >= 300 && step.status < 400))
  .map((page) => ({ sourceUrl: page.sourceUrl, finalUrl: page.finalUrl, chain: page.redirectChain, protected: page.protected }));

const issues = [];
for (const page of pages) {
  const pathName = page.finalPath;
  if (page.status !== 200) issues.push({ severity: page.protected ? "critical" : "error", path: pathName, code: "HTTP_STATUS", issue: `HTTP ${page.status}` });
  if (page.resourceType !== "html") continue;
  if (page.indexable && !page.title) issues.push({ severity: "error", path: pathName, code: "MISSING_TITLE", issue: "Missing title" });
  if (page.indexable && page.h1s.length === 0) issues.push({ severity: "error", path: pathName, code: "MISSING_H1", issue: "Missing H1" });
  if (page.h1s.length > 1) issues.push({ severity: "warning", path: pathName, code: "MULTIPLE_H1", issue: `${page.h1s.length} H1 elements` });
  if (page.indexable && !page.canonical) issues.push({ severity: "warning", path: pathName, code: "MISSING_CANONICAL", issue: "Missing canonical" });
  if (page.canonical) {
    try {
      const canonical = new URL(page.canonical, SITE);
      if (canonical.origin !== SITE.origin) issues.push({ severity: "warning", path: pathName, code: "EXTERNAL_CANONICAL", issue: `External canonical ${canonical.href}` });
      if (page.protected) {
        const route = protectedByPath.get(page.sourcePath) || protectedByPath.get(page.finalPath);
        const desired = normalPath(route?.desiredCanonicalPath || route?.path || page.finalPath);
        if (normalPath(canonical.pathname) !== desired) {
          issues.push({ severity: "source-defect", path: pathName, code: "PROTECTED_CANONICAL_MISMATCH", issue: `Protected source canonical points to ${canonical.pathname}; desired migration canonical is ${desired}` });
        }
      }
    } catch {
      issues.push({ severity: "error", path: pathName, code: "INVALID_CANONICAL", issue: `Invalid canonical ${page.canonical}` });
    }
  }
  page.jsonLd.filter((block) => !block.valid).forEach(() => issues.push({ severity: "error", path: pathName, code: "INVALID_JSONLD", issue: "Invalid JSON-LD block" }));
  page.malformedLinks.forEach((link) => issues.push({ severity: "warning", path: pathName, code: "MALFORMED_LINK", issue: `Malformed link ${link.href}` }));
}

const protectedSitemapGaps = tier0.routes
  .map((route) => ({ ...route, absoluteUrl: new URL(route.path, SITE).href }))
  .filter((route) => !sitemapUrls.has(route.absoluteUrl))
  .map((route) => ({ path: route.path, label: route.label, wordpressId: route.wordpressId }));

const summary = {
  generatedAt: new Date().toISOString(),
  source: SITE.origin,
  totals: {
    sitemaps: discovery.sitemaps.length,
    sitemapUrls: sitemapUrls.size,
    auditedResources: pages.length,
    htmlResources: pages.filter((page) => page.resourceType === "html").length,
    nonHtmlResources: pages.filter((page) => page.resourceType !== "html").length,
    indexableHtmlPages: pages.filter((page) => page.indexable).length,
    redirects: redirects.length,
    internalLinkEdges: edges.length,
    orphans: orphans.length,
    protectedSitemapGaps: protectedSitemapGaps.length,
    errors: issues.filter((item) => ["critical", "error"].includes(item.severity)).length,
    warnings: issues.filter((item) => item.severity === "warning").length,
    sourceDefects: issues.filter((item) => item.severity === "source-defect").length,
  },
};

const writeJson = (name, value) => writeFile(path.join(OUT_DIR, name), `${JSON.stringify(value, null, 2)}\n`, "utf8");
await Promise.all([
  writeFile(path.join(OUT_DIR, "robots-v2.txt"), discovery.robots, "utf8"),
  writeJson("summary-v2.json", summary),
  writeJson("sitemaps-v2.json", discovery.sitemaps),
  writeJson("pages-v2.json", pages),
  writeJson("redirects-v2.json", redirects),
  writeJson("internal-links-v2.json", edges),
  writeJson("orphans-v2.json", orphans),
  writeJson("issues-v2.json", issues),
  writeJson("protected-sitemap-gaps.json", protectedSitemapGaps),
]);

console.log(JSON.stringify(summary, null, 2));
if (pages.some((page) => page.protected && page.status !== 200)) process.exitCode = 1;
