#!/usr/bin/env node
/**
 * Browser-level rendered-asset audit for AI Production on Dimgrey vs WordPress.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const WP = "https://www.dgeniussolutions.com/services/ai-video-production-agency/";
const DIMGREY = "https://dimgrey-goat-473970.hostingersite.com/services/ai-video-production-agency/";
const OUT_DIR = path.join(process.cwd(), "tooling/visual-parity/ai-production-3b3");
const ARTIFACTS = "/opt/cursor/artifacts";

const REQUIRED_LOGOS = [
  "Eureka Forbes",
  "Aditya Birla Education Academy",
  "Saint Gobain",
  "Pantaloons",
  "Raymond",
  "Onida",
  "Kotak Mahindra Bank",
  "Druva",
  "Meryl",
  "MedArtha",
  "LG",
];

const SECTIONS = [
  { id: "hero", sel: "main.dgs-ai-page, #top, .dgs-ai-page" },
  { id: "logo-wall", sel: "#dgs-proof" },
  { id: "featured-work", sel: "#featured-ai-video-work" },
  { id: "portfolio", sel: "#portfolio" },
  { id: "icon-section", sel: "#why-dgenius-ai-video-agency, #what-we-create" },
  { id: "cta-form", sel: "#cta-form, form.frm-fluent-form, .fluentform" },
  { id: "footer", sel: "footer.dgs-footer-wrapper" },
  { id: "ai-summary-logos", sel: ".dgs-footer-ai-summary" },
];

async function collectRendered(page) {
  return page.evaluate((requiredLogos) => {
    const defects = [];
    const logoHits = [];
    const imgs = [...document.querySelectorAll("img")];
    for (const img of imgs) {
      const src = img.getAttribute("src") || "";
      const dataSrc = img.getAttribute("data-src") || "";
      const srcset = img.getAttribute("srcset") || "";
      const dataSrcset = img.getAttribute("data-srcset") || "";
      const alt = img.getAttribute("alt") || "";
      const cs = getComputedStyle(img);
      const rect = img.getBoundingClientRect();
      if (/^data:image/i.test(src) && /^https?:/i.test(dataSrc)) {
        defects.push({ kind: "LAZY_PLACEHOLDER_PAINTED", alt, dataSrc });
      }
      if (/^data:image/i.test(srcset) && dataSrcset && !/^data:/i.test(dataSrcset)) {
        defects.push({ kind: "LAZY_SRCSET_PLACEHOLDER", alt, dataSrcset });
      }
      const inProof = Boolean(img.closest("#dgs-proof"));
      if (inProof && /^https?:/i.test(src)) {
        logoHits.push({
          alt,
          src,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          width: rect.width,
          height: rect.height,
          opacity: cs.opacity,
          visibility: cs.visibility,
          display: cs.display,
        });
        if (img.naturalWidth === 0) defects.push({ kind: "ZERO_NATURAL", alt, src });
        if (parseFloat(cs.opacity) === 0) defects.push({ kind: "ZERO_OPACITY", alt, src });
        if (cs.visibility === "hidden") defects.push({ kind: "HIDDEN", alt, src });
      }
    }
    const required = requiredLogos.map((name) => {
      const hit = logoHits.find((row) => (row.alt || "").toLowerCase().includes(name.toLowerCase().split(" ")[0].toLowerCase()) && (row.alt || "").toLowerCase().includes(name.toLowerCase().split(" ").slice(-1)[0].toLowerCase()) || (row.alt || "").toLowerCase().includes(name.toLowerCase()));
      return {
        name,
        found: Boolean(hit),
        painted: Boolean(hit && hit.naturalWidth > 1 && parseFloat(hit.opacity) > 0 && hit.visibility !== "hidden"),
        src: hit?.src || "",
        naturalWidth: hit?.naturalWidth || 0,
      };
    });
    const gallery = document.getElementById("portfolio-gallery");
    const cards = gallery ? [...gallery.querySelectorAll(".gallery-item, .case-study-item")] : [];
    const videos = [...document.querySelectorAll("#portfolio-gallery video, #portfolio-gallery source")];
    const videoTags = [...document.querySelectorAll("#portfolio-gallery video")];
    const sources = videoTags.map((v) => v.querySelector("source")?.getAttribute("src") || v.getAttribute("src") || "");
    const footers = [...document.querySelectorAll("footer")].map((el) => ({
      className: el.className,
      type: el.getAttribute("data-elementor-type") || "",
    }));
    const aiIcons = [...document.querySelectorAll(".dgs-footer-ai-icon")].map((img) => ({
      src: img.getAttribute("src") || "",
      alt: img.getAttribute("alt") || "",
      naturalWidth: img.naturalWidth,
      complete: img.complete,
    }));
    return {
      title: document.title,
      leftoverPlaceholders: defects.filter((d) => d.kind.startsWith("LAZY")).length,
      defects,
      logoHits: logoHits.length,
      required,
      galleryCards: cards.length,
      videoTags: videoTags.length,
      videoSources: sources,
      footers,
      aiIcons,
      reactRoot: Boolean(document.querySelector("#__next_error__")),
    };
  }, REQUIRED_LOGOS);
}

async function screenshotSections(page, prefix) {
  const files = [];
  for (const section of SECTIONS) {
    const handle = await page.$(section.sel);
    const file = path.join(OUT_DIR, `${prefix}-${section.id}.png`);
    const artifact = path.join(ARTIFACTS, `${prefix}_${section.id.replace(/-/g, "_")}.png`);
    if (handle) {
      await handle.screenshot({ path: file }).catch(async () => {
        await page.screenshot({ path: file, fullPage: false });
      });
    } else {
      await page.screenshot({ path: file, fullPage: false });
    }
    files.push(file);
    try {
      const { copyFile } = await import("node:fs/promises");
      await copyFile(file, artifact);
    } catch {
      /* artifacts dir may be missing in some environments */
    }
  }
  return files;
}

async function auditUrl(browser, url, width, label) {
  const context = await browser.newContext({
    viewport: { width, height: width === 1440 ? 900 : 844 },
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();
  const react418 = [];
  const videoResponses = [];
  page.on("console", (msg) => {
    const text = msg.text();
    if (/Minified React error #418|#418/i.test(text)) react418.push(text.slice(0, 240));
  });
  page.on("response", (res) => {
    const u = res.url();
    if (/\.mp4(\?|#|$)/i.test(u)) {
      videoResponses.push({ url: u.split("#")[0], status: res.status(), type: res.headers()["content-type"] || "" });
    }
  });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(url.includes("dgeniussolutions.com") ? 4000 : 3500);
  const rendered = await collectRendered(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await screenshotSections(page, `${label}-${width}`);

  let lightbox = { opened: false, source: "", played: false };
  if (label.startsWith("dimgrey") && width === 1440) {
    const card = page.locator("#portfolio-gallery .gallery-item, #portfolio-gallery .case-study-item").first();
    if (await card.count()) {
      await card.click({ timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(800);
      lightbox.opened = await page.locator("#lightbox, .lightbox, #lightbox-player").first().isVisible().catch(() => false);
      lightbox.source = await page.locator("#lightbox-player, #lightbox video, .lightbox video").first().getAttribute("src").catch(() => "");
      if (!lightbox.source) {
        lightbox.source = (await page.locator("#lightbox-player source, #lightbox source").first().getAttribute("src").catch(() => "")) || "";
      }
      const player = page.locator("#lightbox-player, #lightbox video").first();
      if (await player.count()) {
        await player.click({ timeout: 4000 }).catch(() => {});
        lightbox.played = await page.evaluate(() => {
          const v = document.querySelector("#lightbox-player, #lightbox video");
          if (!v) return false;
          try {
            const p = v.play();
            if (p && typeof p.then === "function") p.catch(() => {});
          } catch {}
          return !v.paused || v.currentTime > 0 || v.readyState >= 2;
        });
      }
      await page.keyboard.press("Escape").catch(() => {});
    }

    const tab = page.locator('button, a, [role="tab"]').filter({ hasText: /festival|mascot|product/i }).first();
    if (await tab.count()) {
      await tab.click().catch(() => {});
      await page.waitForTimeout(600);
    }
    const loadMore = page.locator("#load-more-btn");
    if (await loadMore.count()) {
      await loadMore.click().catch(() => {});
      await page.waitForTimeout(800);
    }
  }

  await context.close();
  return { url, width, label, rendered, react418, videoResponses, lightbox };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(ARTIFACTS, { recursive: true }).catch(() => {});
  const browser = await chromium.launch({ headless: true });
  const results = [];
  for (const [url, label] of [
    [DIMGREY, "dimgrey"],
    [WP, "wordpress"],
  ]) {
    for (const width of [1440, 390]) {
      console.log(`auditing ${label} ${width}`);
      results.push(await auditUrl(browser, url, width, label));
    }
  }
  await browser.close();

  const dimgreyDesktop = results.find((r) => r.label === "dimgrey" && r.width === 1440);
  const successVideos = (dimgreyDesktop.videoResponses || []).filter((r) => r.status === 200 || r.status === 206);
  const failedVideos = (dimgreyDesktop.videoResponses || []).filter((r) => r.status >= 400 || r.status === 0);
  const report = {
    generatedAt: new Date().toISOString(),
    dimgrey: DIMGREY,
    wordpress: WP,
    sourceMp4sInBoot: 40,
    dimgreyDesktop: {
      logoHits: dimgreyDesktop.rendered.logoHits,
      required: dimgreyDesktop.rendered.required,
      leftoverPlaceholders: dimgreyDesktop.rendered.leftoverPlaceholders,
      defects: dimgreyDesktop.rendered.defects,
      galleryCards: dimgreyDesktop.rendered.galleryCards,
      videoTags: dimgreyDesktop.rendered.videoTags,
      videoSources: dimgreyDesktop.rendered.videoSources.slice(0, 12),
      successfulVideoResponses: successVideos.length,
      failedVideoResponses: failedVideos.length,
      failedVideoUrls: failedVideos,
      lightbox: dimgreyDesktop.lightbox,
      footers: dimgreyDesktop.rendered.footers,
      aiIcons: dimgreyDesktop.rendered.aiIcons,
      react418: dimgreyDesktop.react418,
    },
    viewports: results.map((r) => ({
      label: r.label,
      width: r.width,
      logoHits: r.rendered.logoHits,
      galleryCards: r.rendered.galleryCards,
      videoTags: r.rendered.videoTags,
      leftoverPlaceholders: r.rendered.leftoverPlaceholders,
      footerCount: r.rendered.footers.length,
      react418: r.react418.length,
      requiredPainted: r.rendered.required.filter((x) => x.painted).length,
    })),
  };
  await writeFile(path.join(OUT_DIR, "rendered-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report.dimgreyDesktop, null, 2));
  console.log(JSON.stringify(report.viewports, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
