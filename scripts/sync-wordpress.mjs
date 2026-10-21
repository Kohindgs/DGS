#!/usr/bin/env node
/**
 * Sync WordPress → data/wordpress/ for the Next.js mirror.
 * Uses public REST + live HTML head capture. No WP plugins required at runtime.
 *
 * Usage: node scripts/sync-wordpress.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "data", "wordpress");
const CONTENT_DIR = path.join(OUT, "content");
const RAW_DIR = path.join(OUT, "raw-sync");

const SITE = "https://www.dgeniussolutions.com";
const UA = "DGS-Next-Mirror/1.0 (+https://www.dgeniussolutions.com)";

const META_DESC_OVERRIDES = {
  "/services/performance-marketing/":
    "Performance marketing agency in Mumbai — Google Ads, Meta Ads, lead generation, conversion tracking and ROI-focused campaigns by D'Genius Solutions.",
  "/contact-us/":
    "Contact D'Genius Solutions in Mumbai for SEO, AEO, GEO, LLM SEO, website development, branding and AI production. We respond within 24 hours.",
  "/services/":
    "Explore D'Genius Solutions services — SEO, AEO, GEO, LLM SEO, website development, performance marketing, branding, content and AI video production in Mumbai.",
};

const CANONICAL_OVERRIDES = {
  "/services/aeo-services-in-mumbai/": "/services/aeo-services-in-mumbai/",
  "/services/aeo/": "/services/aeo-services-in-mumbai/",
};

const NOINDEX_SLUGS = new Set([
  "indriya-test",
  "thank-you",
  "wp-file-download-search",
]);

const TIER1_SERVICE_SLUGS = new Set([
  "seo-services-in-mumbai",
  "aeo-services-in-mumbai",
  "geo",
  "llm-seo-service",
  "ai-video-production-agency",
  "performance-marketing",
  "website-development-amc",
  "social-media-marketing",
  "branding",
  "content-creation",
  "dubai-seo",
  "seo-service-in-banglore",
  "seo-service-in-gurugram",
  "seo-service-pune",
  "seo-services-in-hyderabad",
  "ai-production-dubai-page",
  "website-development-pune-page",
  "shirdi-se-sai-tak-case-study",
]);

const TIER1_PAGE_SLUGS = new Set([
  "best-digital-marketing-agency-in-mumbai",
  "about-us",
  "contact-us",
  "our-services",
  "portfolio",
  "privacy-policy",
  "seo-pricing",
  "aeo-dubai",
  "australia-page",
  "us-landing-page",
  "case_studies",
  "motion-graphics",
  "better-ceasons-case-study",
  "sitemap",
  "blogs",
]);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

async function fetchAll(endpoint) {
  const items = [];
  let page = 1;
  while (true) {
    const url = `${SITE}/wp-json/wp/v2/${endpoint}?per_page=100&page=${page}`;
    const batch = await fetchJson(url);
    if (!Array.isArray(batch) || batch.length === 0) break;
    items.push(...batch);
    if (batch.length < 100) break;
    page += 1;
    await sleep(80);
  }
  return items;
}

function pathnameFromLink(link) {
  const u = new URL(link);
  return u.pathname.endsWith("/") ? u.pathname : `${u.pathname}/`;
}

function contentKey(type, slug) {
  return `${type}-${slug}`.replace(/[^a-z0-9-]/gi, "-");
}

function extractHead(html) {
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const head = headMatch ? headMatch[1] : "";
  const pick = (re) => {
    const m = head.match(re);
    return m ? m[1].trim() : "";
  };
  const title = pick(/<title[^>]*>([\s\S]*?)<\/title>/i).replace(/\s+/g, " ");
  const description = pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)
    || pick(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  let canonical = pick(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    || pick(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  if (canonical) {
    try {
      canonical = pathnameFromLink(canonical.startsWith("http") ? canonical : `${SITE}${canonical}`);
    } catch {
      canonical = "";
    }
  }
  const robots = pick(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i);
  const ogImage = pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  const bodyClass = pick(/<body[^>]+class=["']([^"']*)["']/i);
  const schemas = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    const raw = m[1].trim();
    if (raw) schemas.push(raw);
  }
  const styles = [];
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  while ((m = styleRe.exec(html))) {
    if (m[1].trim()) styles.push(m[1]);
  }
  const fontLinks = [];
  const linkRe = /<link[^>]+rel=["'](?:preconnect|stylesheet)["'][^>]*>/gi;
  while ((m = linkRe.exec(head))) {
    if (/fonts\.googleapis|fonts\.gstatic|font/i.test(m[0])) fontLinks.push(m[0]);
  }
  return { title, description, canonical, robots, ogImage, bodyClass, schemas, styles, fontLinks };
}

function sanitizeBody(html) {
  let body = html;
  // Remove scripts, iframes from trackers (keep wp video embeds in content)
  body = body.replace(/<script[\s\S]*?<\/script>/gi, "");
  body = body.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
  // Fix lazy-loaded images
  body = body.replace(/<img\s[^>]*>/gi, (tag) => {
    const dataSrc = tag.match(/data-src=["']([^"']+)["']/);
    if (!dataSrc) return tag;
    const url = dataSrc[1];
    let out = tag.replace(/\s+data-src=["'][^"']*["']/, "");
    if (/src=["']data:image\/(?:gif|svg\+xml)[^"']*["']/.test(out)) {
      out = out.replace(/src=["']data:image\/(?:gif|svg\+xml)[^"']*["']/, `src="${url}"`);
    } else if (!/src=["']https?:/.test(out)) {
      out = out.replace(/^<img/, `<img src="${url}"`);
    }
    out = out.replace(/\s+class=["'][^"']*lazyload[^"']*["']/, "");
    out = out.replace(/\s+style=["'][^"']*smush[^"']*["']/gi, "");
    return out;
  });
  // Rewrite apex host to www for consistency
  body = body.replace(/https?:\/\/dgeniussolutions\.com/gi, SITE);
  return body;
}

function applySeoOverrides(pathname, seo) {
  const out = { ...seo };
  if (CANONICAL_OVERRIDES[pathname]) {
    out.canonical = CANONICAL_OVERRIDES[pathname];
  }
  if (META_DESC_OVERRIDES[pathname]) {
    out.description = META_DESC_OVERRIDES[pathname];
  }
  return out;
}

async function processItem(item, type) {
  const slug = item.slug;
  const link = item.link;
  const pathname = pathnameFromLink(link);
  const key = contentKey(type, slug);

  const include =
    type === "post" ||
    TIER1_SERVICE_SLUGS.has(slug) ||
    TIER1_PAGE_SLUGS.has(slug);

  if (!include) {
    console.log(`  skip ${type}/${slug}`);
    return null;
  }

  console.log(`  sync ${pathname}`);
  const fullHtml = await fetchText(link);
  const head = extractHead(fullHtml);
  const rendered = item.content?.rendered ?? "";
  const body = sanitizeBody(rendered || fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || "");

  const seo = applySeoOverrides(pathname, {
    title: head.title || item.title?.rendered?.replace(/<[^>]+>/g, "") || slug,
    description: head.description || "",
    canonical: head.canonical || pathname,
    robots: head.robots || "index, follow",
    ogImage: head.ogImage || null,
  });

  const noindex = NOINDEX_SLUGS.has(slug) || /noindex/i.test(seo.robots);

  const payload = {
    path: pathname,
    type: type === "post" ? "post" : type === "services" ? "service" : slug === "blogs" ? "blog-index" : "page",
    slug,
    wordpressId: item.id,
    link,
    modified: item.modified,
    seo,
    bodyClass: head.bodyClass,
    schemas: head.schemas,
    noindex,
    contentKey: key,
    body,
    styles: head.styles.join("\n"),
    fontLinks: head.fontLinks,
  };

  fs.writeFileSync(path.join(CONTENT_DIR, `${key}.json`), JSON.stringify(payload, null, 2));
  fs.writeFileSync(path.join(RAW_DIR, `${key}-rest.json`), JSON.stringify(item, null, 2));

  await sleep(120);
  return {
    path: pathname,
    type: payload.type,
    slug,
    wordpressId: item.id,
    link,
    modified: item.modified,
    seo,
    bodyClass: head.bodyClass,
    schemas: head.schemas,
    noindex,
    contentKey: key,
  };
}

async function main() {
  for (const dir of [OUT, CONTENT_DIR, RAW_DIR]) {
    fs.mkdirSync(dir, { recursive: true });
  }

  console.log("Fetching WordPress inventory…");
  const [pages, services, posts] = await Promise.all([
    fetchAll("pages"),
    fetchAll("services"),
    fetchAll("posts"),
  ]);

  console.log(`Found ${pages.length} pages, ${services.length} services, ${posts.length} posts`);

  const routes = [];
  for (const p of pages) {
    const r = await processItem(p, "page");
    if (r) routes.push(r);
  }
  for (const s of services) {
    const r = await processItem(s, "services");
    if (r) routes.push(r);
  }
  for (const p of posts) {
    const r = await processItem(p, "post");
    if (r) routes.push(r);
  }

  routes.sort((a, b) => a.path.localeCompare(b.path));

  const manifest = {
    generatedAt: new Date().toISOString(),
    siteUrl: SITE,
    routes,
  };

  fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));

  // Auto-generate parity markdown
  const md = [
    "# DGS WordPress Sync Manifest",
    "",
    `**Generated:** ${manifest.generatedAt}`,
    `**Routes:** ${routes.length}`,
    "",
    "| Path | Type | WP ID | Noindex | Title |",
    "|---|---|---|---|---|",
    ...routes.map(
      (r) =>
        `| \`${r.path}\` | ${r.type} | ${r.wordpressId} | ${r.noindex ? "yes" : "no"} | ${r.seo.title.slice(0, 60)} |`
    ),
    "",
  ].join("\n");
  fs.writeFileSync(path.join(ROOT, "docs", "DGS-SYNC-MANIFEST.md"), md);

  console.log(`\nDone. ${routes.length} routes → data/wordpress/manifest.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
