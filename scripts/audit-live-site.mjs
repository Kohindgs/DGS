import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE = new URL(process.env.DGS_SOURCE_URL || "https://www.dgeniussolutions.com");
const OUT_DIR = path.resolve(process.env.AUDIT_OUT_DIR || "data/audit/live");
const CONCURRENCY = Number(process.env.AUDIT_CONCURRENCY || "6");
const MAX_REDIRECTS = 10;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

function stripTags(value = "") {
  return decodeEntities(
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
  return match ? decodeEntities(match[1].trim()) : "";
}

function firstMatch(html, regex) {
  const match = html.match(regex);
  return match ? stripTags(match[1]) : "";
}

function metaContent(html, name) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const metaName = attr(tag, "name").toLowerCase();
    const property = attr(tag, "property").toLowerCase();
    if (metaName === name.toLowerCase() || property === name.toLowerCase()) {
      return attr(tag, "content");
    }
  }
  return "";
}

function canonicalFrom(html) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const rel = attr(tag, "rel").toLowerCase().split(/\s+/);
    if (rel.includes("canonical")) return attr(tag, "href");
  }
  return "";
}

function headingsFrom(html) {
  const headings = [];
  const regex = /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = regex.exec(html))) {
    headings.push({ level: match[1].toLowerCase(), text: stripTags(match[2]) });
  }
  return headings;
}

function linksFrom(html, pageUrl) {
  const links = [];
  const tags = html.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) || [];
  for (const tag of tags) {
    const href = attr(tag, "href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue;
    try {
      const url = new URL(href, pageUrl);
      url.hash = "";
      links.push({
        href: url.href,
        path: url.origin === SITE.origin ? url.pathname + url.search : null,
        internal: url.origin === SITE.origin,
        anchor: stripTags(tag),
        rel: attr(tag, "rel"),
      });
    } catch {
      // Ignore malformed links; they will be visible in HTML review if needed.
    }
  }
  return links;
}

function imagesFrom(html, pageUrl) {
  const images = [];
  const tags = html.match(/<img\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const src = attr(tag, "src") || attr(tag, "data-src") || attr(tag, "data-lazy-src");
    if (!src) continue;
    let absolute = src;
    try {
      absolute = new URL(src, pageUrl).href;
    } catch {
      // Keep the raw source for audit visibility.
    }
    images.push({ src: absolute, alt: attr(tag, "alt"), width: attr(tag, "width"), height: attr(tag, "height") });
  }
  return images;
}

function jsonLdFrom(html) {
  const blocks = [];
  const regex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html))) {
    const raw = match[1].trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      blocks.push({ valid: true, types: collectJsonLdTypes(parsed), value: parsed });
    } catch (error) {
      blocks.push({ valid: false, types: [], error: String(error), raw });
    }
  }
  return blocks;
}

function collectJsonLdTypes(value, found = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) collectJsonLdTypes(item, found);
  } else if (value && typeof value === "object") {
    const type = value["@type"];
    if (Array.isArray(type)) type.forEach((item) => found.add(String(item)));
    else if (type) found.add(String(type));
    for (const child of Object.values(value)) collectJsonLdTypes(child, found);
  }
  return [...found].sort();
}

function xmlLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([\s\S]*?)\s*<\/loc>/gi)].map((match) => decodeEntities(match[1].trim()));
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      Accept: options.accept || "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "User-Agent": "DGS-NextJS-Migration-Audit/1.0",
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
      headers: { Accept: "text/html,*/*", "User-Agent": "DGS-NextJS-Migration-Audit/1.0" },
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
  const seeds = declared.length ? declared : [new URL("/sitemap_index.xml", SITE).href, new URL("/sitemap.xml", SITE).href];
  const visited = new Set();
  const sitemapRecords = [];
  const pageUrls = new Set();
  const queue = [...new Set(seeds)];

  while (queue.length) {
    const sitemapUrl = queue.shift();
    if (!sitemapUrl || visited.has(sitemapUrl)) continue;
    visited.add(sitemapUrl);

    try {
      const { response, text } = await fetchText(sitemapUrl, { accept: "application/xml,text/xml,*/*" });
      const locs = xmlLocs(text);
      sitemapRecords.push({ url: sitemapUrl, status: response.status, locCount: locs.length });
      if (!response.ok) continue;

      const isIndex = /<sitemapindex\b/i.test(text);
      if (isIndex) {
        for (const loc of locs) if (!visited.has(loc)) queue.push(loc);
      } else {
        for (const loc of locs) {
          try {
            const url = new URL(loc);
            if (url.origin === SITE.origin) pageUrls.add(url.href);
          } catch {
            // Ignore malformed sitemap entries, but keep sitemap record.
          }
        }
      }
    } catch (error) {
      sitemapRecords.push({ url: sitemapUrl, status: 0, locCount: 0, error: String(error) });
    }
  }

  return { robots, robotsUrl: robotsUrl.href, sitemapRecords, pageUrls: [...pageUrls].sort() };
}

async function auditPage(url) {
  const redirect = await getRedirectChain(url);
  const finalUrl = redirect.finalUrl;
  let html = "";
  let contentType = "";
  let fetchError = redirect.error || "";

  try {
    const response = await fetch(finalUrl, {
      headers: { Accept: "text/html,*/*", "User-Agent": "DGS-NextJS-Migration-Audit/1.0" },
      redirect: "follow",
    });
    contentType = response.headers.get("content-type") || "";
    html = await response.text();
  } catch (error) {
    fetchError = String(error);
  }

  const title = firstMatch(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const headings = headingsFrom(html);
  const links = linksFrom(html, finalUrl);
  const images = imagesFrom(html, finalUrl);
  const jsonLd = jsonLdFrom(html);
  const canonical = canonicalFrom(html);
  const robots = metaContent(html, "robots");
  const description = metaContent(html, "description");

  return {
    sourceUrl: url,
    finalUrl,
    status: redirect.status,
    redirectChain: redirect.chain,
    contentType,
    fetchError,
    title,
    description,
    canonical,
    robots,
    indexable: redirect.status === 200 && !/noindex/i.test(robots),
    headings,
    h1s: headings.filter((item) => item.level === "h1").map((item) => item.text),
    internalLinks: links.filter((item) => item.internal),
    externalLinks: links.filter((item) => !item.internal),
    images,
    jsonLd,
    textLength: stripTags(html).length,
  };
}

async function mapLimit(values, limit, worker) {
  const results = new Array(values.length);
  let cursor = 0;
  async function runner() {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= values.length) return;
      results[index] = await worker(values[index], index);
      await sleep(50);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, () => runner()));
  return results;
}

await mkdir(OUT_DIR, { recursive: true });

const discovery = await discoverSitemaps();
const auditUrls = discovery.pageUrls.length ? discovery.pageUrls : [SITE.href];
const pages = await mapLimit(auditUrls, CONCURRENCY, auditPage);

const byPath = new Map();
for (const page of pages) {
  try {
    byPath.set(new URL(page.finalUrl).pathname, page);
  } catch {
    // Keep malformed final URLs in the page audit but exclude from path graph.
  }
}

const inbound = new Map();
const edges = [];
for (const page of pages) {
  const from = new URL(page.finalUrl).pathname;
  for (const link of page.internalLinks) {
    const to = link.path;
    if (!to) continue;
    edges.push({ from, to, anchor: link.anchor });
    inbound.set(to, (inbound.get(to) || 0) + 1);
  }
}

const orphans = pages
  .filter((page) => {
    const pathname = new URL(page.finalUrl).pathname;
    return pathname !== "/" && (inbound.get(pathname) || 0) === 0;
  })
  .map((page) => ({ path: new URL(page.finalUrl).pathname, title: page.title, status: page.status }));

const redirects = pages
  .filter((page) => page.redirectChain.length > 1 || page.redirectChain.some((step) => step.status >= 300 && step.status < 400))
  .map((page) => ({ sourceUrl: page.sourceUrl, finalUrl: page.finalUrl, chain: page.redirectChain }));

const issues = [];
for (const page of pages) {
  const pathname = new URL(page.finalUrl).pathname;
  if (page.status !== 200) issues.push({ severity: "error", path: pathname, issue: `HTTP ${page.status}` });
  if (page.indexable && !page.title) issues.push({ severity: "error", path: pathname, issue: "Missing title" });
  if (page.indexable && page.h1s.length === 0) issues.push({ severity: "error", path: pathname, issue: "Missing H1" });
  if (page.h1s.length > 1) issues.push({ severity: "warning", path: pathname, issue: `${page.h1s.length} H1 elements` });
  if (page.indexable && page.canonical) {
    try {
      const canonical = new URL(page.canonical, SITE);
      if (canonical.origin !== SITE.origin) issues.push({ severity: "warning", path: pathname, issue: `External canonical ${canonical.href}` });
    } catch {
      issues.push({ severity: "error", path: pathname, issue: `Invalid canonical ${page.canonical}` });
    }
  }
  for (const block of page.jsonLd) {
    if (!block.valid) issues.push({ severity: "error", path: pathname, issue: "Invalid JSON-LD block" });
  }
}

const summary = {
  generatedAt: new Date().toISOString(),
  source: SITE.origin,
  robots: discovery.robotsUrl,
  totals: {
    sitemaps: discovery.sitemapRecords.length,
    sitemapUrls: discovery.pageUrls.length,
    auditedPages: pages.length,
    indexablePages: pages.filter((page) => page.indexable).length,
    redirects: redirects.length,
    internalLinkEdges: edges.length,
    orphans: orphans.length,
    errors: issues.filter((item) => item.severity === "error").length,
    warnings: issues.filter((item) => item.severity === "warning").length,
  },
};

const writeJson = (name, value) => writeFile(path.join(OUT_DIR, name), `${JSON.stringify(value, null, 2)}\n`, "utf8");

await Promise.all([
  writeFile(path.join(OUT_DIR, "robots.txt"), discovery.robots, "utf8"),
  writeJson("summary.json", summary),
  writeJson("sitemaps.json", discovery.sitemapRecords),
  writeJson("pages.json", pages),
  writeJson("redirects.json", redirects),
  writeJson("internal-links.json", edges),
  writeJson("orphans.json", orphans),
  writeJson("issues.json", issues),
]);

console.log(JSON.stringify(summary, null, 2));
