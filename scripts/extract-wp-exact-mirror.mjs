#!/usr/bin/env node
/**
 * Mechanical WordPress visual inventory for exact mirror mode.
 * Output: tooling/wp-exact-mirror/
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const WP_URL = "https://www.dgeniussolutions.com/";
const OUT = path.resolve("tooling/wp-exact-mirror");
const VIEWPORT = { width: 1440, height: 900 };

const SECTION_SELECTORS = [
  { key: "header", selector: "#dgsNav" },
  { key: "hero", selector: ".dgs-v1215-hero" },
  { key: "rail", selector: ".dgs-v1215-rail" },
  { key: "trustedBrands", selector: ".dgs-v1215-proof, .dgs-v1215-trusted" },
  { key: "awards", selector: ".dgs-v1215-awards" },
  { key: "capabilities", selector: ".dgs-v1215-services" },
  { key: "portfolio", selector: ".dgs-v1215-portfolio" },
  { key: "caseStudies", selector: ".dgs-v1215-case-studies" },
  { key: "creativeGallery", selector: ".dgs-v1215-work" },
  { key: "testimonials", selector: ".dgs-v1215-testimonials" },
  { key: "searchAuthority", selector: ".dgs-v1215-search-authority" },
  { key: "industries", selector: ".dgs-v1215-industries" },
  { key: "whyDgs", selector: ".dgs-v1215-why" },
  { key: "faq", selector: ".dgs-v1215-faq" },
  { key: "finalCta", selector: ".dgs-v1215-final-cta, .dgs-v1215-cta" },
  { key: "footer", selector: "footer, .site-footer" },
];

const STYLE_KEYS = [
  "display",
  "position",
  "top",
  "left",
  "width",
  "height",
  "padding",
  "margin",
  "gap",
  "gridTemplateColumns",
  "gridTemplateRows",
  "flexDirection",
  "alignItems",
  "justifyContent",
  "background",
  "backgroundColor",
  "backgroundImage",
  "border",
  "borderRadius",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "color",
  "overflow",
  "zIndex",
  "maxWidth",
  "textTransform",
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

async function main() {
  ensureDir(OUT);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 1 });

  await page.goto(WP_URL, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3500);

  await page.screenshot({ path: path.join(OUT, "wp-fullpage-1440.png"), fullPage: true });

  const inventory = await page.evaluate(
    ({ SECTION_SELECTORS, STYLE_KEYS }) => {
      const pickStyles = (el) => {
        const cs = getComputedStyle(el);
        const out = {};
        for (const k of STYLE_KEYS) {
          const prop = k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
          out[k] = cs.getPropertyValue(prop) || cs[k] || "";
        }
        const r = el.getBoundingClientRect();
        out.boundingBox = {
          x: r.x,
          y: r.y + window.scrollY,
          width: r.width,
          height: r.height,
        };
        return out;
      };

      const domTree = (el, depth = 0, maxDepth = 4) => {
        if (!el || depth > maxDepth) return null;
        const children = [...el.children]
          .slice(0, 12)
          .map((c) => domTree(c, depth + 1, maxDepth))
          .filter(Boolean);
        return {
          tag: el.tagName.toLowerCase(),
          id: el.id || null,
          className: (el.className?.toString?.() || "").slice(0, 120),
          text: depth < 2 ? (el.textContent || "").trim().slice(0, 80) : "",
          children,
        };
      };

      const sections = [];
      const geometry = [];
      const computedStyles = {};
      let order = 0;

      for (const { key, selector } of SECTION_SELECTORS) {
        const el = document.querySelector(selector);
        if (!el) {
          sections.push({ key, selector, present: false });
          continue;
        }
        order += 1;
        const styles = pickStyles(el);
        const heading = el.querySelector("h1,h2,h3,h4")?.textContent?.trim().slice(0, 160) || "";
        const images = [...el.querySelectorAll("img")].map((img) => ({
          src: img.currentSrc || img.src,
          alt: img.alt,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
        }));

        const item = {
          order,
          key,
          selector,
          present: true,
          id: el.id || null,
          className: el.className?.toString?.() || "",
          heading,
          geometry: styles.boundingBox,
          styles: { ...styles, boundingBox: undefined },
          imageCount: images.length,
          images: images.slice(0, 20),
          dom: domTree(el, 0, 3),
        };
        sections.push(item);
        geometry.push({ key, ...styles.boundingBox });
        computedStyles[key] = item.styles;
      }

      const mainSections = [...document.querySelectorAll("main section, .dgs-v1215-hero, .dgs-v1215-rail, footer")]
        .map((el, i) => {
          const r = el.getBoundingClientRect();
          return {
            index: i,
            tag: el.tagName.toLowerCase(),
            id: el.id || null,
            className: (el.className?.toString?.() || "").slice(0, 100),
            heading: el.querySelector("h1,h2,h3")?.textContent?.trim().slice(0, 100) || "",
            y: Math.round(r.top + window.scrollY),
            height: Math.round(r.height),
          };
        })
        .filter((s) => s.height > 30);

      const stylesheets = [...document.styleSheets]
        .map((sheet, i) => {
          try {
            return { index: i, href: sheet.href || "inline", rules: sheet.cssRules?.length ?? null };
          } catch {
            return { index: i, href: sheet.href || "inline", rules: "blocked" };
          }
        })
        .filter((s) => s.href && !String(s.href).includes("fonts.googleapis"));

      const assets = {
        images: [...document.querySelectorAll("main img, #dgsNav img, footer img")].map((img) => ({
          src: img.currentSrc || img.src,
          alt: img.alt?.slice(0, 80),
          width: img.naturalWidth,
          height: img.naturalHeight,
        })),
        canvases: [...document.querySelectorAll("canvas")].map((c) => ({
          id: c.id,
          className: c.className,
          width: c.width,
          height: c.height,
        })),
        videos: [...document.querySelectorAll("video")].map((v) => ({
          src: v.currentSrc || v.src,
          poster: v.poster,
        })),
      };

      const bodyCs = getComputedStyle(document.body);
      const htmlCs = getComputedStyle(document.documentElement);
      const background = {
        body: {
          background: bodyCs.background,
          backgroundColor: bodyCs.backgroundColor,
          backgroundImage: bodyCs.backgroundImage,
        },
        html: {
          background: htmlCs.background,
          backgroundColor: htmlCs.backgroundColor,
        },
        pseudo: {},
        canvases: assets.canvases.length,
        videos: assets.videos.length,
        hasThreeJs: !!(window.THREE || window.three),
        hasGsap: !!(window.gsap || window.ScrollTrigger),
        fixedLayers: [...document.querySelectorAll("*")]
          .filter((el) => {
            const cs = getComputedStyle(el);
            return cs.position === "fixed" && el.getBoundingClientRect().width > 100;
          })
          .slice(0, 20)
          .map((el) => ({
            tag: el.tagName.toLowerCase(),
            id: el.id,
            className: (el.className?.toString?.() || "").slice(0, 80),
            zIndex: getComputedStyle(el).zIndex,
            background: getComputedStyle(el).backgroundImage?.slice(0, 100),
          })),
      };

      return {
        capturedAt: new Date().toISOString(),
        url: location.href,
        viewport: { width: innerWidth, height: innerHeight },
        pageHeight: document.documentElement.scrollHeight,
        sections,
        liveDomOrder: mainSections,
        geometry,
        computedStyles,
        stylesheets,
        assets,
        background,
      };
    },
    { SECTION_SELECTORS, STYLE_KEYS },
  );

  writeJson(path.join(OUT, "wp-dom-structure.json"), {
    capturedAt: inventory.capturedAt,
    liveDomOrder: inventory.liveDomOrder,
    sections: inventory.sections.map((s) => ({
      key: s.key,
      present: s.present,
      order: s.order,
      selector: s.selector,
      heading: s.heading,
      dom: s.dom,
    })),
  });
  writeJson(path.join(OUT, "wp-section-geometry.json"), inventory.geometry);
  writeJson(path.join(OUT, "wp-computed-styles.json"), inventory.computedStyles);
  writeJson(path.join(OUT, "wp-background-inventory.json"), inventory.background);
  writeJson(path.join(OUT, "wp-assets.json"), inventory.assets);
  writeJson(path.join(OUT, "wp-stylesheets.json"), inventory.stylesheets);
  writeJson(path.join(OUT, "wp-full-inventory.json"), inventory);

  for (const section of inventory.sections.filter((s) => s.present)) {
    const dir = path.join(OUT, section.key);
    ensureDir(dir);
    const el = page.locator(section.selector).first();
    if ((await el.count()) > 0) {
      await el.scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(400);
      await el.screenshot({ path: path.join(dir, "wp.png") }).catch(async () => {
        const box = await el.boundingBox();
        if (box) await page.screenshot({ path: path.join(dir, "wp.png"), clip: box });
      });
    }
  }

  await browser.close();
  console.log("[wp-exact-mirror] done →", OUT);
  console.log(
    "[wp-exact-mirror] sections found:",
    inventory.sections.filter((s) => s.present).map((s) => s.key).join(", "),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
