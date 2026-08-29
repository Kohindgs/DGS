#!/usr/bin/env node
/**
 * Tier-0 migration audit against local preview or staging target.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

const ROOT = process.cwd();
const TARGET = new URL(process.env.MIGRATION_TARGET_URL || "http://127.0.0.1:3000");
const OUT = path.join(ROOT, "data/audit/migration-tier0-report.json");

const tier0 = JSON.parse(
  await readFile(path.join(ROOT, "data/migration/tier0-routes.json"), "utf8"),
);

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
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return match ? decode(match[1].trim()) : "";
}

function canonical(html) {
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    if (attr(tag, "rel").toLowerCase().split(/\s+/).includes("canonical")) return attr(tag, "href");
  }
  return "";
}

function meta(html, name) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    if (attr(tag, "name").toLowerCase() === name.toLowerCase()) return attr(tag, "content");
  }
  return "";
}

function first(html, regex) {
  const match = html.match(regex);
  return match ? text(match[1]) : "";
}

function normalizePath(value) {
  const url = new URL(value, TARGET);
  let pathname = url.pathname || "/";
  if (pathname !== "/" && !pathname.endsWith("/")) pathname += "/";
  return pathname;
}

function headings(html) {
  return [...html.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((match) => ({
    level: match[1].toLowerCase(),
    text: text(match[2]).slice(0, 160),
  }));
}

function internalLinks(html, pageUrl) {
  const links = [];
  for (const tag of html.match(/<a\b[^>]*>/gi) || []) {
    const href = attr(tag, "href");
    if (!href || /^(mailto:|tel:|javascript:|#)/i.test(href)) continue;
    try {
      const url = new URL(href, pageUrl);
      if (url.origin === TARGET.origin) links.push(normalizePath(url.pathname));
    } catch {
      links.push(`invalid:${href}`);
    }
  }
  return [...new Set(links)];
}

function imageAlts(html) {
  const alts = [];
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    alts.push({ alt: attr(tag, "alt"), src: attr(tag, "src").slice(0, 120) });
  }
  return alts;
}

function jsonLdTypes(html) {
  const types = new Set();
  for (const block of html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) || []) {
    const raw = block.replace(/^[\s\S]*?>/, "").replace(/<\/script>$/, "");
    try {
      const parsed = JSON.parse(raw);
      const graph = parsed["@graph"] || [parsed];
      for (const node of graph) {
        const type = node["@type"];
        if (Array.isArray(type)) type.forEach((t) => types.add(t));
        else if (type) types.add(type);
      }
    } catch {
      types.add("INVALID_JSON_LD");
    }
  }
  return [...types];
}

async function fetchSitemapPaths() {
  const res = await fetch(new URL("/sitemap.xml", TARGET), {
    headers: { Accept: "application/xml,text/xml,*/*" },
  });
  const xml = await res.text();
  const paths = [];
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/gi)) {
    paths.push(normalizePath(match[1]));
  }
  return { status: res.status, paths };
}

const sitemap = await fetchSitemapPaths();
const routes = [];
const defects = [];

for (const route of tier0.routes) {
  const url = new URL(route.path, TARGET);
  const response = await fetch(url, {
    redirect: "manual",
    headers: { Accept: "text/html,*/*", "User-Agent": "DGS-Migration-Tier0-Audit/1.0" },
  });

  let html = "";
  let finalUrl = response.url;
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    defects.push(`${route.path}: redirect chain/status ${response.status} -> ${location || "unknown"}`);
    if (location) {
      const follow = await fetch(new URL(location, TARGET), { redirect: "follow" });
      html = await follow.text();
      finalUrl = follow.url;
    }
  } else {
    html = await response.text();
  }

  const title = first(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const h1s = headings(html).filter((h) => h.level === "h1");
  const canonicalHref = canonical(html);
  const canonicalPath = canonicalHref ? normalizePath(canonicalHref) : "";
  const desiredCanonicalPath = normalizePath(route.desiredCanonicalPath || route.path);
  const robots = meta(html, "robots");
  const description = meta(html, "description");
  const links = internalLinks(html, finalUrl);
  const alts = imageAlts(html);
  const schemaTypes = jsonLdTypes(html);
  const inSitemap = sitemap.paths.includes(normalizePath(route.path));

  const item = {
    path: route.path,
    label: route.label,
    httpStatus: response.status,
    finalPath: normalizePath(finalUrl),
    indexable: !/noindex/i.test(robots),
    canonical: canonicalHref,
    canonicalPath,
    desiredCanonicalPath,
    selfCanonical: canonicalPath === desiredCanonicalPath,
    title,
    description,
    h1Count: h1s.length,
    h1: h1s[0]?.text || "",
    headingCount: headings(html).length,
    internalLinkCount: links.length,
    imagesMissingAlt: alts.filter((img) => !img.alt?.trim()).length,
    schemaTypes,
    inSitemap,
    hasForm: /data-migration-form|fluentform|PublicLeadForm|form/i.test(html),
    breadcrumbs: /breadcrumb/i.test(html),
  };
  routes.push(item);

  if (response.status !== 200) defects.push(`${route.path}: HTTP ${response.status}`);
  if (normalizePath(finalUrl) !== normalizePath(route.path)) defects.push(`${route.path}: final path ${normalizePath(finalUrl)}`);
  if (!item.indexable) defects.push(`${route.path}: noindex`);
  if (!item.selfCanonical) defects.push(`${route.path}: canonical ${canonicalPath || "missing"} != ${desiredCanonicalPath}`);
  if (!inSitemap) defects.push(`${route.path}: missing from sitemap.xml`);
  if (item.h1Count !== 1) defects.push(`${route.path}: expected 1 H1, found ${item.h1Count}`);
  if (route.observedTitle && title && title !== route.observedTitle) defects.push(`${route.path}: title drift`);
  if (route.observedH1 && item.h1 && item.h1 !== route.observedH1) defects.push(`${route.path}: H1 drift`);
}

const report = {
  checkedAt: new Date().toISOString(),
  target: TARGET.origin,
  sitemapStatus: sitemap.status,
  sitemapRouteCount: sitemap.paths.length,
  routes,
  defects,
  reportSha: createHash("sha256").update(JSON.stringify(routes)).digest("hex").slice(0, 12),
};

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
if (defects.length) process.exitCode = 1;
