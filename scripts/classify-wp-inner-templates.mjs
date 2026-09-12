#!/usr/bin/env node
/**
 * Evidence-based WordPress inner-page template family classification.
 * Uses captured REST content.rendered plus optional live HTML probes.
 * Does not modify production WordPress.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const WP_ORIGIN = "https://www.dgeniussolutions.com";
const UA = "DGS-InnerMirror-Inventory/1.0 (+https://www.dgeniussolutions.com)";

function signatures(html = "") {
  return {
    length: html.length,
    hasStyle: /<style[\s>]/i.test(html),
    styleCount: (html.match(/<style[\s>]/gi) || []).length,
    hasElementor: /elementor/i.test(html),
    hasHtmlWidget: /elementor-widget-html/i.test(html),
    hasFluent: /fluentform|frm-fluent-form/i.test(html),
    fluentIds: [...html.matchAll(/data-form_id=["'](\d+)["']/g)].map((m) => m[1]),
    hasCmsmasters: /cmsmasters/i.test(html),
    hasEnvira: /envira/i.test(html),
    hasDgsPage: /class="[^"]*dgs-page/i.test(html) || /class='[^']*dgs-page/i.test(html),
    hasDgsAeo: /dgs-aeo/i.test(html),
    hasDgsGeo: /dgs-geo/i.test(html) || /id=["']dgs-geo/i.test(html),
    hasDgsLlm: /dgs-llm/i.test(html) || /llm-seo/i.test(html),
    hasDgsAiVideo: /dgs-ai-?video|dgs-aiv|ai-video-production/i.test(html),
    hasDgsPerf: /dgs-performance-page|id=["']dgs-performance/i.test(html),
    hasDgsContact: /dgs-contact/i.test(html),
    hasDgsPf: /dgs-pf|dgs-portfolio/i.test(html),
    hasDgsCareer: /dgs-career|careers-page/i.test(html),
    hasDgsHero: /dgs-hero/i.test(html),
    hasBlogLoop: /cmsmasters-blog__post|cmsmasters_archive/i.test(html),
    hasSiteMain: /class="[^"]*site-main/i.test(html),
    h1: (html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "").replace(/<[^>]+>/g, "").trim().slice(0, 120),
    commentHints: [...html.matchAll(/<!--\s*([^>]{8,80})/g)].slice(0, 3).map((m) => m[1].trim()),
  };
}

function classify({ path: routePath, type, html }) {
  const sig = signatures(html);
  if (routePath === "/") return { family: "homepage-v1215", reason: "homepage path; existing v1215 mirror" };
  if (type === "post") return { family: "blog-detail", reason: "wordpressType=post; REST is body-only, live uses cmsmasters/Elementor single" };
  if (routePath === "/blogs/") return { family: "blog-archive", reason: "blogs archive path" };
  if (routePath === "/our-services/" || routePath === "/services/") {
    return { family: "service-archive", reason: "services archive path" };
  }
  if (routePath === "/about-us/") return { family: "about", reason: "about-us path; cmsmasters + HTML widget" };
  if (routePath === "/contact-us/") return { family: "contact", reason: "contact-us path" };
  if (routePath === "/career/") return { family: "career", reason: "career path; live WP redirects, REST holds careers widget" };
  if (routePath === "/portfolio/") return { family: "portfolio", reason: "portfolio path; Envira/cmsmasters live chrome" };
  if (routePath === "/wp-file-download-search/") return { family: "theme-standard", reason: "theme download search page" };

  if (sig.hasDgsAeo) return { family: "service-html-aeo", reason: "REST contains .dgs-aeo* HTML widget" };
  if (sig.hasDgsGeo) return { family: "service-html-geo", reason: "REST contains .dgs-geo* HTML widget" };
  if (sig.hasDgsPerf) return { family: "service-html-performance", reason: "REST contains #dgs-performance-page" };
  if (sig.hasDgsAiVideo && sig.hasHtmlWidget) {
    return { family: "service-html-ai-video", reason: "REST HTML widget with AI video page classes" };
  }
  if (sig.hasHtmlWidget && sig.hasStyle && /llm/i.test(routePath + html.slice(0, 2500))) {
    return { family: "service-html-llm", reason: "REST HTML widget + LLM SEO path/markup" };
  }
  if (sig.hasHtmlWidget && sig.hasStyle && /seo-service/i.test(routePath) && /Elementor widget build|ELEMENTOR HTML WIDGET|dgs-page/i.test(html)) {
    return { family: "service-html-location-seo", reason: "location SEO Elementor HTML widget" };
  }
  if (sig.hasHtmlWidget && sig.hasStyle) {
    return { family: "service-html-widget-other", reason: "self-contained Elementor HTML widget with inline CSS" };
  }
  if (sig.hasElementor && !sig.hasStyle) {
    return { family: "elementor-standard", reason: "Elementor markup without self-contained widget CSS" };
  }
  return { family: "theme-standard", reason: "cmsmasters/theme markup without HTML-widget CSS" };
}

function rewriteWpUrls(html) {
  const WP_ORIGIN_PATTERN = /https:\/\/(?:www\.)?dgeniussolutions\.com/gi;
  let out = html.replace(WP_ORIGIN_PATTERN, (match, offset, source) => {
    const next = source[offset + match.length];
    if (next !== "/") return match;
    const rest = source.slice(offset + match.length);
    const pathMatch = rest.match(/^\/[^"'\\\s<>]*/);
    const assetPath = pathMatch?.[0] ?? "/";
    if (assetPath.startsWith("/wp-content/") || assetPath.startsWith("/wp-includes/")) {
      return WP_ORIGIN;
    }
    return "";
  });
  out = out.replace(/(["'(])\/wp-content\//g, `$1${WP_ORIGIN}/wp-content/`);
  out = out.replace(/(["'(])\/wp-includes\//g, `$1${WP_ORIGIN}/wp-includes/`);
  return out.replaceAll('href="/#', 'href="#');
}

function stripRuntime(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<script\b[^>]*\/>/gi, "");
}

function extractInlineStyles(html) {
  const blocks = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1].trim());
  return blocks.join("\n\n");
}

function sliceLiveBody(html) {
  const navEndMarker = 'id="dgsFoot"';
  const navFootIdx = html.lastIndexOf(navEndMarker);
  let start = 0;
  if (navFootIdx >= 0) {
    const close = html.indexOf("</div>", navFootIdx);
    start = close >= 0 ? close + 6 : 0;
  } else {
    const nav = html.indexOf('<div id="dgsNav">');
    if (nav >= 0) {
      // fallback: after first large nav block
      start = html.indexOf("</div>", html.indexOf('id="dgsOverlay"')) || 0;
    }
  }
  const footerStart = html.indexOf('<footer class="dgs-footer-wrapper">');
  const end = footerStart >= 0 ? footerStart : html.indexOf("</body>");
  let body = html.slice(start, end > start ? end : undefined);
  body = body.replace(/<a class="skip-link screen-reader-text"[\s\S]*?<\/a>/i, "");
  return body.trim();
}

function collectCssUrls(html) {
  const urls = new Set();
  for (const match of html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi)) {
    const href = match[0].match(/href=["']([^"']+)["']/i)?.[1];
    if (!href) continue;
    if (/litespeed\/css|themes\/softy|cmsmasters|elementor.*css|fluentform/i.test(href)) {
      urls.add(href.split("?")[0]);
    }
  }
  return [...urls];
}

async function loadRestItems() {
  const [pages, services, posts] = await Promise.all([
    readFile(path.join(ROOT, "data/wordpress/raw/pages.json"), "utf8").then(JSON.parse),
    readFile(path.join(ROOT, "data/wordpress/raw/services.json"), "utf8").then(JSON.parse),
    readFile(path.join(ROOT, "data/wordpress/raw/posts.json"), "utf8").then(JSON.parse),
  ]);
  const registry = JSON.parse(
    await readFile(path.join(ROOT, "data/migration/nextjs-route-registry.generated.json"), "utf8"),
  );
  const keep = new Set(
    registry.routes
      .filter((r) => r.proposedAction === "KEEP_SAME_URL" || r.proposedAction === "PROTECTED")
      .map((r) => r.path),
  );

  const byPath = new Map();
  for (const item of [...pages, ...services, ...posts]) {
    const link = item.link || "";
    let routePath = "/";
    try {
      routePath = new URL(link).pathname;
      if (!routePath.endsWith("/")) routePath += "/";
      if (routePath === "/best-digital-marketing-agency-in-mumbai/") routePath = "/";
    } catch {
      continue;
    }
    byPath.set(routePath, {
      id: item.id,
      type: item.type || (item.link?.includes("/blogs/") ? "post" : item.link?.includes("/services/") ? "service" : "page"),
      path: routePath,
      slug: item.slug,
      modified: item.modified,
      html: item.content?.rendered || "",
    });
  }

  // /services/ is generated in Next and may not exist as REST page
  if (keep.has("/services/") && !byPath.has("/services/")) {
    byPath.set("/services/", {
      id: 0,
      type: "page",
      path: "/services/",
      slug: "services",
      modified: null,
      html: "",
    });
  }

  return [...keep].map((routePath) => {
    const item = byPath.get(routePath);
    if (item) return item;
    return { id: 0, type: "unknown", path: routePath, slug: "", modified: null, html: "" };
  });
}

const LIVE_PROBES = [
  "/",
  "/services/seo-services-in-mumbai/",
  "/services/social-media-marketing/",
  "/services/website-development-amc/",
  "/services/ai-video-production-agency/",
  "/services/branding/",
  "/services/content-creation/",
  "/services/aeo-services-in-mumbai/",
  "/services/llm-seo-service/",
  "/services/geo/",
  "/services/performance-marketing/",
  "/about-us/",
  "/contact-us/",
  "/portfolio/",
  "/career/",
  "/blogs/",
  "/blogs/what-is-llm-seo/",
  "/our-services/",
  "/services/",
];

async function fetchLive(routePath) {
  const url = new URL(routePath, WP_ORIGIN).href;
  const res = await fetch(url, {
    redirect: "manual",
    headers: { "User-Agent": UA, Accept: "text/html" },
  });
  const location = res.headers.get("location");
  let html = "";
  if (res.status === 200) html = await res.text();
  else if (res.status >= 300 && res.status < 400 && location) {
    html = "";
  }
  return {
    path: routePath,
    status: res.status,
    location,
    length: html.length,
    hasNav: html.includes('id="dgsNav"'),
    hasFooter: html.includes("dgs-footer-wrapper"),
    cssUrls: html ? collectCssUrls(html) : [],
    bodyLength: html ? sliceLiveBody(html).length : 0,
    liveSignatures: html ? signatures(sliceLiveBody(html)) : null,
    template: html.match(/<body[^>]*class="([^"]*)"/i)?.[1]?.slice(0, 240) || "",
  };
}

async function main() {
  const items = await loadRestItems();
  const classified = items.map((item) => {
    const { family, reason } = classify(item);
    return {
      path: item.path,
      wordpressId: item.id,
      type: item.type,
      family,
      reason,
      rest: signatures(item.html),
    };
  });

  const families = {};
  for (const row of classified) {
    families[row.family] ??= { count: 0, routes: [], reason: row.reason };
    families[row.family].count += 1;
    families[row.family].routes.push(row.path);
  }

  const live = [];
  for (const routePath of LIVE_PROBES) {
    try {
      const probe = await fetchLive(routePath);
      live.push(probe);
      process.stdout.write(`live ${routePath} ${probe.status} body=${probe.bodyLength} css=${probe.cssUrls.length}\n`);
    } catch (error) {
      live.push({ path: routePath, error: String(error) });
      process.stdout.write(`live ${routePath} ERROR ${error}\n`);
    }
    await new Promise((r) => setTimeout(r, 700));
  }

  const outDir = path.join(ROOT, "data/wordpress/mirrors");
  await mkdir(outDir, { recursive: true });
  const payload = {
    generatedAt: new Date().toISOString(),
    source: WP_ORIGIN,
    method: "REST content.rendered signatures + live HTML probes (no runtime WP/Elementor)",
    familyCounts: Object.fromEntries(Object.entries(families).map(([k, v]) => [k, v.count])),
    families,
    routes: classified,
    liveProbes: live,
  };
  await writeFile(path.join(outDir, "template-families.json"), `${JSON.stringify(payload, null, 2)}\n`);
  console.log("\nFAMILY COUNTS");
  for (const [name, info] of Object.entries(families).sort((a, b) => b[1].count - a[1].count)) {
    console.log(`${name}\t${info.count}\t${info.routes.slice(0, 4).join(" ")}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
