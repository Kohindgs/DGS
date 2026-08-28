import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SITE = new URL(process.env.DGS_SOURCE_URL || "https://www.dgeniussolutions.com");
const OUT_DIR = path.join(ROOT, "data/audit/live");
const tier0 = JSON.parse(await readFile(path.join(ROOT, "data/migration/tier0-routes.json"), "utf8"));
const routes = [...new Set(["/", ...tier0.routes.map((route) => route.path)])];
const pages = [];

for (const route of routes) {
  const url = new URL(route, SITE);
  const started = performance.now();
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { Accept: "text/html,*/*", "User-Agent": "DGS-NextJS-Performance-Baseline/1.0" },
    });
    const html = await response.text();
    const elapsedMs = Math.round(performance.now() - started);
    const scriptTags = html.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) || [];
    const styleTags = html.match(/<style\b[^>]*>[\s\S]*?<\/style>/gi) || [];
    const linkTags = html.match(/<link\b[^>]*>/gi) || [];
    const imageTags = html.match(/<img\b[^>]*>/gi) || [];
    const videoTags = html.match(/<video\b[^>]*>/gi) || [];
    const iframeTags = html.match(/<iframe\b[^>]*>/gi) || [];
    const externalScripts = scriptTags.map((tag) => attr(tag, "src")).filter(Boolean).map((src) => absolute(src, response.url));
    const stylesheets = linkTags.filter((tag) => /(?:^|\s)stylesheet(?:\s|$)/i.test(attr(tag, "rel"))).map((tag) => attr(tag, "href")).filter(Boolean).map((href) => absolute(href, response.url));
    const images = imageTags.map((tag) => attr(tag, "src") || attr(tag, "data-src") || attr(tag, "data-lazy-src")).filter(Boolean).map((src) => absolute(src, response.url));
    const resourceUrls = [...externalScripts, ...stylesheets, ...images];
    const thirdPartyOrigins = [...new Set(resourceUrls.map((resource) => safeOrigin(resource)).filter((origin) => origin && origin !== SITE.origin))].sort();
    const elementCount = (html.match(/<(?!\/|!|\?)[a-z][^>]*>/gi) || []).length;
    const inlineScriptBytes = scriptTags.filter((tag) => !attr(tag, "src")).reduce((sum, tag) => sum + Buffer.byteLength(tag), 0);
    const inlineStyleBytes = styleTags.reduce((sum, tag) => sum + Buffer.byteLength(tag), 0);
    const imagesMissingDimensions = imageTags.filter((tag) => !attr(tag, "width") || !attr(tag, "height")).length;
    const imagesLazy = imageTags.filter((tag) => attr(tag, "loading").toLowerCase() === "lazy").length;

    pages.push({
      path: route,
      status: response.status,
      finalUrl: response.url,
      fetchElapsedMs: elapsedMs,
      htmlBytes: Buffer.byteLength(html),
      elementCount,
      externalScriptCount: externalScripts.length,
      externalScripts: [...new Set(externalScripts)],
      stylesheetCount: stylesheets.length,
      stylesheets: [...new Set(stylesheets)],
      inlineScriptBytes,
      inlineStyleBytes,
      imageCount: imageTags.length,
      imagesLazy,
      imagesMissingDimensions,
      videoCount: videoTags.length,
      iframeCount: iframeTags.length,
      thirdPartyOriginCount: thirdPartyOrigins.length,
      thirdPartyOrigins,
    });
  } catch (error) {
    pages.push({ path: route, status: 0, fetchElapsedMs: Math.round(performance.now() - started), error: String(error) });
  }
}

const summary = {
  generatedAt: new Date().toISOString(),
  source: SITE.origin,
  warning: "These are static HTML/resource indicators, not field Core Web Vitals. Fetch timing is runner-dependent and must not be treated as LCP/INP. Use Lighthouse/CrUX/Search Console for runtime/field metrics later.",
  pages,
};
await mkdir(OUT_DIR, { recursive: true });
await writeFile(path.join(OUT_DIR, "performance-static.generated.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ pages: pages.map((page) => ({ path: page.path, htmlKB: page.htmlBytes ? Math.round(page.htmlBytes / 1024) : null, elements: page.elementCount || null, scripts: page.externalScriptCount || null, stylesheets: page.stylesheetCount || null, images: page.imageCount || null, thirdPartyOrigins: page.thirdPartyOriginCount || null })) }, null, 2));

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return match ? match[1].trim() : "";
}
function absolute(value, base) {
  try { return new URL(value, base).href; } catch { return value; }
}
function safeOrigin(value) {
  try { return new URL(value).origin; } catch { return null; }
}
