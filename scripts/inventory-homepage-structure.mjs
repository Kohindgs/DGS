#!/usr/bin/env node
/**
 * Mechanical homepage section inventory for WordPress mirror QA.
 * Output: tooling/wp-mirror/homepage-structure.json (WP) or next-homepage-structure.json (Next)
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const WP_URL = "https://www.dgeniussolutions.com/";
const NEXT_URL = process.env.WP_MIRROR_NEXT_URL || "http://localhost:3010/";
const OUT_DIR = path.resolve("tooling/wp-mirror");
const VIEWPORT = { width: 1440, height: 900 };

const WP_SECTION_SELECTORS = [
  { key: "header", selector: "#dgsNav" },
  { key: "hero", selector: ".dgs-v1215-hero" },
  { key: "rail", selector: ".dgs-v1215-rail" },
  { key: "proof", selector: ".dgs-v1215-proof, #dgs-proof" },
  { key: "capabilities", selector: ".dgs-v1215-services, #dgs-v1215-services" },
  { key: "portfolio", selector: ".dgs-v1215-portfolio, [id*='portfolio']" },
  { key: "caseStudies", selector: ".dgs-v1215-case-studies, [id*='case']" },
  { key: "creativeGallery", selector: ".dgs-v1215-work, #dgs-v1215-work" },
  { key: "testimonials", selector: ".dgs-v1215-testimonials, [id*='testimonial']" },
  { key: "searchAuthority", selector: ".dgs-v1215-search-authority, #dgs-v1215-search-authority" },
  { key: "industries", selector: ".dgs-v1215-industries, #dgs-v1215-industries" },
  { key: "whyDgs", selector: ".dgs-v1215-why, #dgs-v1215-why" },
  { key: "faq", selector: ".dgs-v1215-faq, #dgs-v1215-faq" },
  { key: "finalCta", selector: ".dgs-v1215-final-cta, .dgs-v1215-cta" },
  { key: "footer", selector: "footer" },
];

const NEXT_SECTION_SELECTORS = [
  { key: "header", selector: "#dgsNav" },
  { key: "hero", selector: ".dgs-v1215-hero, #dgs-home-start" },
  { key: "rail", selector: ".dgs-v1215-rail" },
  { key: "proof", selector: "#dgs-proof" },
  { key: "capabilities", selector: "#dgs-v1215-services" },
  { key: "portfolio", selector: "[data-section='portfolio'], #dgs-portfolio, .HomePortfolioPreview" },
  { key: "caseStudies", selector: "[data-section='case-studies']" },
  { key: "creativeGallery", selector: "#dgs-v1215-work" },
  { key: "testimonials", selector: "[data-section='testimonials']" },
  { key: "searchAuthority", selector: "#dgs-v1215-search-authority" },
  { key: "industries", selector: "#dgs-v1215-industries" },
  { key: "whyDgs", selector: "#dgs-v1215-why" },
  { key: "faq", selector: "#dgs-v1215-faq" },
  { key: "finalCta", selector: "[data-section='final-cta'], .HomeFinalCta" },
  { key: "footer", selector: "footer" },
];

async function inventoryPage(page, source, selectors) {
  await page.goto(source === "wp" ? WP_URL : NEXT_URL, {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2500);

  return page.evaluate(
    ({ selectors, source }) => {
      const pickStyle = (cs) => ({
        backgroundColor: cs.backgroundColor,
        backgroundImage: cs.backgroundImage?.slice(0, 120) || "",
        display: cs.display,
        maxWidth: cs.maxWidth,
        padding: cs.padding,
      });

      const detectAnimation = (el) => {
        const cs = getComputedStyle(el);
        if (cs.animationName && cs.animationName !== "none") return `css-animation:${cs.animationName}`;
        if (cs.transform && cs.transform !== "none") return "transform";
        if (el.querySelector("[data-aos], .aos-init, .elementor-invisible")) return "aos/elementor-reveal";
        if (document.querySelector("canvas")) return "canvas-background";
        return "none";
      };

      const countItems = (el, key) => {
        if (key === "proof") {
          return {
            logos: el.querySelectorAll(".dgs-v1215-logo-item, .dgs-v1215-logo-track img, img[alt*='logo' i]").length,
            awardCards: el.querySelectorAll(".dgs-v1215-award, article, .awardCard").length,
          };
        }
        if (key === "portfolio") {
          return { items: el.querySelectorAll("a[href*='portfolio'], figure, .portfolioCard, [data-portfolio-item]").length };
        }
        if (key === "faq") {
          return { items: el.querySelectorAll("details, .faqItem, [data-faq-item]").length };
        }
        return {
          cards: el.querySelectorAll("article, .card, [class*='Card']").length,
          images: el.querySelectorAll("img").length,
        };
      };

      const sections = [];
      const used = new Set();

      for (const { key, selector } of selectors) {
        const el = document.querySelector(selector);
        if (!el || used.has(el)) {
          sections.push({ key, selector, present: false });
          continue;
        }
        used.add(el);
        const rect = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const heading =
          el.querySelector("h1, h2, h3")?.textContent?.trim().slice(0, 140) ||
          el.getAttribute("aria-label") ||
          "";
        const media = [...el.querySelectorAll("img, video, canvas")].slice(0, 8).map((node) => ({
          tag: node.tagName.toLowerCase(),
          src: node.getAttribute("src")?.slice(0, 120) || "",
          alt: node.getAttribute("alt")?.slice(0, 80) || "",
        }));

        sections.push({
          order: sections.length + 1,
          key,
          selector,
          present: true,
          id: el.id || null,
          className: (el.className?.toString?.() || "").split(/\s+/).slice(0, 6).join(" "),
          heading,
          geometry: {
            startY: Math.round(rect.top + window.scrollY),
            height: Math.round(rect.height),
            width: Math.round(rect.width),
            containerWidth: Math.round(
              el.querySelector("[class*='shell'], .container, [class*='section']")?.getBoundingClientRect().width ||
                rect.width,
            ),
          },
          background: pickStyle(cs),
          media,
          items: countItems(el, key),
          animation: detectAnimation(el),
        });
      }

      // Discover extra top-level main sections not mapped
      const extras = [];
      for (const el of document.querySelectorAll("main section, main article > section, .dgs-v1215-hero")) {
        if (used.has(el)) continue;
        const rect = el.getBoundingClientRect();
        if (rect.height < 40) continue;
        extras.push({
          className: (el.className?.toString?.() || "").slice(0, 80),
          id: el.id || null,
          heading: el.querySelector("h1,h2,h3")?.textContent?.trim().slice(0, 100) || "",
          startY: Math.round(rect.top + window.scrollY),
          height: Math.round(rect.height),
        });
      }

      return {
        source,
        url: location.href,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        capturedAt: new Date().toISOString(),
        pageHeight: document.documentElement.scrollHeight,
        sectionCount: sections.filter((s) => s.present).length,
        sections,
        extraSections: extras,
      };
    },
    { selectors, source },
  );
}

async function main() {
  const target = process.argv[2] || "both";
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  const page = await context.newPage();

  if (target === "wp" || target === "both") {
    console.log("[inventory] WordPress...");
    const wp = await inventoryPage(page, "wp", WP_SECTION_SELECTORS);
    fs.writeFileSync(path.join(OUT_DIR, "homepage-structure.json"), `${JSON.stringify(wp, null, 2)}\n`);
  }

  if (target === "next" || target === "both") {
    console.log("[inventory] Next @", NEXT_URL);
    const next = await inventoryPage(page, "next", NEXT_SECTION_SELECTORS);
    fs.writeFileSync(path.join(OUT_DIR, "next-homepage-structure.json"), `${JSON.stringify(next, null, 2)}\n`);
  }

  await browser.close();
  console.log("[inventory] done →", OUT_DIR);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
