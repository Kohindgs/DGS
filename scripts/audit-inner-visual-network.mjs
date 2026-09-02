#!/usr/bin/env node
/**
 * Runtime visual resource audit: 404s, MIME mismatches, React #418, leftover placeholders.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = process.cwd();
const NEXT = process.env.MIGRATION_TARGET_URL || "http://127.0.0.1:3025";
const OUT = path.join(ROOT, "data/audit/wp-visual-runtime-network.json");

const ROUTES = [
  "/services/seo-services-in-mumbai/",
  "/services/ai-video-production-agency/",
  "/services/aeo-services-in-mumbai/",
  "/services/geo/",
  "/services/llm-seo-service/",
  "/services/branding/",
  "/services/social-media-marketing/",
  "/services/website-development-amc/",
  "/services/content-creation/",
  "/services/performance-marketing/",
  "/about-us/",
  "/contact-us/",
  "/portfolio/",
  "/blogs/",
  "/blogs/what-is-llm-seo/",
  "/our-services/",
  "/services/",
];

const VISUAL_EXT = /\.(css|woff2?|ttf|eot|otf|png|jpe?g|gif|webp|svg|avif|ico)(\?|$)/i;

function classifyRequest(url, status, contentType) {
  const type = String(contentType || "");
  if (status >= 400) return "404";
  if (VISUAL_EXT.test(url) && /text\/html/i.test(type)) return "HTML_AS_IMAGE";
  if (/\.css(\?|$)/i.test(url) && type && !/css|text\/plain/i.test(type) && /text\/html/i.test(type)) {
    return "WRONG MIME";
  }
  if (/\/wp-mirror-css\/.+\.(png|jpe?g|webp|svg|woff2?)/i.test(url)) return "RELATIVE_UNDER_MIRROR_CSS";
  return "OK";
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const report = { generatedAt: new Date().toISOString(), next: NEXT, routes: [] };

  for (const route of ROUTES) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const failed = [];
    const react418 = [];
    page.on("console", (msg) => {
      const text = msg.text();
      if (/Minified React error #418|#418/i.test(text)) react418.push(text.slice(0, 240));
    });
    page.on("response", (res) => {
      const url = res.url();
      if (!VISUAL_EXT.test(url) && !/\/wp-mirror-css\//.test(url) && !/\/wp-content\//.test(url)) return;
      const row = {
        url,
        status: res.status(),
        contentType: res.headers()["content-type"] || "",
        classification: classifyRequest(url, res.status(), res.headers()["content-type"] || ""),
      };
      if (row.classification !== "OK") failed.push(row);
    });

    await page.goto(new URL(route, NEXT).href, { waitUntil: "networkidle", timeout: 90000 }).catch(() => {});
    await page.waitForTimeout(1200);
    const placeholders = await page.evaluate(() => {
      return [...document.querySelectorAll("img")]
        .filter((img) => /^data:image\/gif/i.test(img.getAttribute("src") || "") || /R0lGODlhAQABAIAAAP/.test(img.getAttribute("srcset") || ""))
        .length;
    });
    const cssCount = await page.evaluate(() =>
      [...document.querySelectorAll('link[rel="stylesheet"]')].filter((n) => /wp-mirror-css/.test(n.href)).length,
    );

    report.routes.push({
      path: route,
      cssCount,
      leftoverGifPlaceholders: placeholders,
      react418: [...new Set(react418)],
      defects: failed,
    });
    console.log(
      `${route} css=${cssCount} placeholders=${placeholders} defects=${failed.length} 418=${react418.length ? "YES" : "no"}`,
    );
    await context.close();
  }

  await browser.close();
  const defectCount = report.routes.reduce((n, r) => n + r.defects.length, 0);
  const react418Routes = report.routes.filter((r) => r.react418.length).map((r) => r.path);
  report.summary = { defectCount, react418Routes };
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report.summary, null, 2));
  process.exit(defectCount === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
