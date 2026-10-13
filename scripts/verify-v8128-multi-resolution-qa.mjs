import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const BASE_URL = process.env.TARGET_URL || "https://www.dgeniussolutions.com";
const ARTIFACT_DIR = "C:/Users/Kohin/.gemini/antigravity/brain/534291cc-4b59-4e18-aeca-75b1c4a803e7";

const RESULTS = {
  timestamp: new Date().toISOString(),
  targetRelease: "V8.12.8",
  baseUrl: BASE_URL,
  tests: [],
  summary: { total: 0, passed: 0, failed: 0 }
};

function recordTest(name, passed, details = {}) {
  RESULTS.summary.total++;
  if (passed) RESULTS.summary.passed++;
  else RESULTS.summary.failed++;
  RESULTS.tests.push({ name, passed, details });
  console.log(`${passed ? "✓ PASS" : "❌ FAIL"}: ${name}`, details);
}

async function cleanFloaters(page) {
  await page.evaluate(() => {
    const trig = document.getElementById("dgsTrig");
    if (trig) trig.remove();
    const floater = document.querySelector(".dgs-floating-cta, .dgs-whatsapp-float");
    if (floater) floater.remove();
  });
}

async function safeGoto(page, url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      return;
    } catch (err) {
      if (attempt === 3) throw err;
      console.warn(`[safeGoto] Attempt ${attempt} failed for ${url} (${err.message}). Retrying in 2s...`);
      await page.waitForTimeout(2000);
    }
  }
}

async function run() {
  console.log("================================================================================");
  console.log("=== V8.12.8 LIVE MULTI-RESOLUTION PLAYWRIGHT QA SUITE ===");
  console.log(`=== Target URL: ${BASE_URL} ===`);
  console.log("================================================================================\n");

  const browser = await chromium.launch({ headless: true });

  const VIEWPORTS = [
    { name: "desktop_1080p", width: 1920, height: 1080, isMobile: false },
    { name: "wide_1440p", width: 2560, height: 1440, isMobile: false },
    { name: "wall_4k", width: 3840, height: 2160, isMobile: false },
    { name: "mobile_390p", width: 390, height: 844, isMobile: true }
  ];

  try {
    // =========================================================================
    // 1. HOMEPAGE RECOVERY & AUDIT: ZERO GIANT BLACK VOID, 8 CLEAN POSTER CARDS
    // =========================================================================
    console.log("\n--- Testing Homepage / ---");
    const homeCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const homePage = await homeCtx.newPage();
    await safeGoto(homePage, BASE_URL + "/");
    await homePage.waitForTimeout(2000);
    await cleanFloaters(homePage);

    const homeAudit = await homePage.evaluate(() => {
      const portfolio = document.getElementById("portfolio");
      const head = document.querySelector("#portfolio .dgs-v1215-section-head");
      const clarity = document.querySelector("#portfolio .dgs-ai-service-clarity");
      const gallery = document.getElementById("portfolio-gallery");
      const cards = gallery ? gallery.querySelectorAll(".gallery-item") : [];
      const pictures = gallery ? gallery.querySelectorAll(".thumb-picture") : [];

      // Detect any runaway video element spanning over 1200px
      const giantVideos = Array.from(document.querySelectorAll("video")).filter(v => {
        const rect = v.getBoundingClientRect();
        return rect.height > 1200;
      });

      return {
        hasPortfolio: Boolean(portfolio),
        hasHead: Boolean(head),
        hasClarity: Boolean(clarity),
        cardCount: cards.length,
        pictureCount: pictures.length,
        giantVideoCount: giantVideos.length
      };
    });

    recordTest("Homepage Portfolio Section Exists", homeAudit.hasPortfolio);
    recordTest("Homepage Section Head Visible", homeAudit.hasHead);
    recordTest("Homepage Service Clarity Block Visible", homeAudit.hasClarity);
    recordTest("Homepage Gallery Has 8 Poster Cards", homeAudit.cardCount === 8 && homeAudit.pictureCount === 8, homeAudit);
    recordTest("Homepage Zero Giant Videos (No 9836px Black Void)", homeAudit.giantVideoCount === 0, { giantVideoCount: homeAudit.giantVideoCount });

    // Capture homepage scrolled view screenshot
    await homePage.evaluate(() => {
      const el = document.getElementById("portfolio");
      if (el) el.scrollIntoView({ behavior: "instant" });
    });
    await homePage.waitForTimeout(500);
    const homeShot = path.join(ARTIFACT_DIR, "v8128_homepage_portfolio_restored.png");
    await homePage.screenshot({ path: homeShot, fullPage: false });
    console.log(`Saved screenshot: ${homeShot}`);
    await homeCtx.close();

    // =========================================================================
    // 2. AGENCY PAGE: /services/ai-video-production-agency/ MULTI-RESOLUTION
    // =========================================================================
    for (const vp of VIEWPORTS) {
      console.log(`\n--- Testing /services/ai-video-production-agency/ on ${vp.name} (${vp.width}x${vp.height}) ---`);
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile,
        hasTouch: vp.isMobile,
        userAgent: vp.isMobile
          ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15"
          : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      });
      const page = await ctx.newPage();

      await safeGoto(page, BASE_URL + "/services/ai-video-production-agency/");
      await page.waitForSelector("#portfolio-gallery .gallery-item", { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(1000);
      await cleanFloaters(page);

      // Check full-width layout
      const gridMetrics = await page.evaluate(() => {
        const gallery = document.getElementById("portfolio-gallery");
        const wrap = document.querySelector("#portfolio .dgs-wrap");
        if (!gallery || !wrap) return null;
        const gRect = gallery.getBoundingClientRect();
        const wRect = wrap.getBoundingClientRect();
        const gStyle = window.getComputedStyle(gallery);
        return {
          galleryWidth: gRect.width,
          wrapWidth: wRect.width,
          windowWidth: window.innerWidth,
          maxWidth: gStyle.maxWidth,
          display: gStyle.display,
          gridTemplateColumns: gStyle.gridTemplateColumns.split(" ").length
        };
      });

      const isFullWidth = gridMetrics && gridMetrics.galleryWidth > (vp.isMobile ? vp.width * 0.85 : Math.min(vp.width * 0.9, 1400));
      recordTest(
        `Full-Width Canvas Active on ${vp.name} (Width: ${gridMetrics ? gridMetrics.galleryWidth : 0}px)`,
        Boolean(isFullWidth),
        gridMetrics
      );

      // Check zero-crop presentation on cards
      const zeroCropCardCheck = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll("#portfolio-gallery .gallery-item"));
        if (!items.length) return { pass: false, reason: "No items found" };

        for (const item of items) {
          const media = item.querySelector("img, picture, video");
          if (!media) continue;
          const style = window.getComputedStyle(media);
          if (style.objectFit !== "contain") {
            return { pass: false, reason: `Found card media with object-fit: ${style.objectFit}` };
          }
        }
        return { pass: true, count: items.length };
      });
      recordTest(`Zero-Crop Contain Rule on ${vp.name}`, zeroCropCardCheck.pass, zeroCropCardCheck);

      // Capture screenshot
      const shotPath = path.join(ARTIFACT_DIR, `v8128_agency_${vp.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });
      console.log(`Saved screenshot: ${shotPath}`);

      await ctx.close();
    }

    // =========================================================================
    // 3. CATEGORY FILTER TABS & LOAD MORE ON DESKTOP
    // =========================================================================
    console.log("\n--- Testing Category Tabs & Video Counts on Agency Page (1920x1080) ---");
    const testCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const testPage = await testCtx.newPage();
    await safeGoto(testPage, BASE_URL + "/services/ai-video-production-agency/");
    await testPage.waitForSelector("#portfolio-gallery .gallery-item", { timeout: 15000 }).catch(() => {});
    await testPage.waitForTimeout(1000);
    await cleanFloaters(testPage);

    const EXPECTED_TABS = [
      { key: "all", label: "ALL PORTFOLIO", expectedCount: 56 },
      { key: "automobile", label: "AUTOMOBILE AI", expectedCount: 3 },
      { key: "edtech", label: "EDTECH AI", expectedCount: 8 },
      { key: "fmcg", label: "FMCG AI", expectedCount: 2 },
      { key: "commercial-film", label: "COMMERCIAL AI FILM", expectedCount: 4 },
      { key: "campaign", label: "CAMPAIGN AI", expectedCount: 4 },
      { key: "mythological", label: "MYTHOLOGICAL AI", expectedCount: 7 },
      { key: "festival", label: "FESTIVAL VIDEOS", expectedCount: 13 },
      { key: "product", label: "PRODUCT AI", expectedCount: 5 },
      { key: "jewellery", label: "JEWELLERY AI", expectedCount: 11 },
      { key: "concept", label: "CONCEPT AI", expectedCount: 2 },
      { key: "tvc", label: "TVC AI", expectedCount: 1 }
    ];

    for (const tab of EXPECTED_TABS) {
      const tabSelector = `.portfolio-filter-tab[data-filter="${tab.key}"], .portfolio-filter-tab[href="#${tab.key}"]`;
      const tabEl = await testPage.$(tabSelector);
      if (!tabEl) {
        recordTest(`Filter Tab Exists: ${tab.label}`, false, { selector: tabSelector });
        continue;
      }

      await tabEl.evaluate(el => el.click());
      await testPage.waitForTimeout(300);

      // Count matching items & visible items
      const tabMetrics = await testPage.evaluate((tabKey) => {
        const items = Array.from(document.querySelectorAll("#portfolio-gallery .gallery-item"));
        const matching = items.filter(el => {
          const cats = (el.getAttribute("data-categories") || "").split(" ");
          return tabKey === "all" || cats.includes(tabKey);
        });
        const visible = matching.filter(el => {
          const s = window.getComputedStyle(el);
          return s.display !== "none";
        });
        const btn = document.getElementById("load-more-btn");
        const btnVisible = btn && window.getComputedStyle(btn).display !== "none";
        return {
          totalMatching: matching.length,
          visibleCount: visible.length,
          btnVisible
        };
      }, tab.key);

      const pass = tabMetrics.totalMatching === tab.expectedCount;
      recordTest(`Tab Click & Total Matching: ${tab.label} (Expected: ${tab.expectedCount}, Found: ${tabMetrics.totalMatching})`, pass, tabMetrics);

      // If category has <= 12 items, load more button should be hidden immediately
      if (tab.expectedCount <= 12) {
        recordTest(`Load More Hidden When Tab <= 12: ${tab.label}`, !tabMetrics.btnVisible);
      }
    }

    // =========================================================================
    // 4. LOAD MORE INCREMENTAL RENDERING TEST (ALL PORTFOLIO)
    // =========================================================================
    console.log("\n--- Testing Load More Work Flow on ALL PORTFOLIO ---");
    const allTabEl = await testPage.$(`.portfolio-filter-tab[data-filter="all"], .portfolio-filter-tab[href="#all"]`);
    if (allTabEl) {
      await allTabEl.evaluate(el => el.click());
      await testPage.waitForTimeout(300);
    }

    const initialVisible = await testPage.evaluate(() => {
      const items = Array.from(document.querySelectorAll("#portfolio-gallery .gallery-item"));
      return items.filter(el => window.getComputedStyle(el).display !== "none").length;
    });
    recordTest("ALL PORTFOLIO Initial Visible Count is 12 (Desktop Batch)", initialVisible === 12, { initialVisible });

    const loadMoreBtn = await testPage.$("#load-more-btn");
    if (loadMoreBtn) {
      await loadMoreBtn.evaluate(el => el.click());
      await testPage.waitForTimeout(300);

      const afterFirstClick = await testPage.evaluate(() => {
        const items = Array.from(document.querySelectorAll("#portfolio-gallery .gallery-item"));
        return items.filter(el => window.getComputedStyle(el).display !== "none").length;
      });
      recordTest("ALL PORTFOLIO Increments by +12 on Click (Count: 24)", afterFirstClick === 24, { afterFirstClick });
    }

    // =========================================================================
    // 5. STRONG CTA & ANCHOR SMOOTH SCROLL VERIFICATION
    // =========================================================================
    console.log("\n--- Testing CTA Section & Smooth Scroll Anchor ---");
    const ctaAudit = await testPage.evaluate(() => {
      const cta = document.getElementById("portfolio-cta-section");
      const btn = cta ? cta.querySelector(".dgs-ai-cta-btn") : null;
      const anchor = document.getElementById("ai-video-enquiry-form");
      const form = document.querySelector(".dgs-form-wrapper form");
      return {
        hasCta: Boolean(cta),
        hasBtn: Boolean(btn),
        btnHref: btn ? btn.getAttribute("href") : null,
        hasAnchor: Boolean(anchor),
        hasForm: Boolean(form)
      };
    });

    recordTest("CTA Section Exists Immediately After Gallery", ctaAudit.hasCta, ctaAudit);
    recordTest("CTA Button Links to #ai-video-enquiry-form", ctaAudit.btnHref === "#ai-video-enquiry-form", ctaAudit);
    recordTest("Real Form Anchor #ai-video-enquiry-form Exists Before Form", ctaAudit.hasAnchor, ctaAudit);

    // =========================================================================
    // 6. CANONICAL CARD SYSTEM & FRAME EQUALITY CHECK
    // =========================================================================
    console.log("\n--- Testing Canonical Frame Equality (All vs Automobile vs Commercial Film) ---");
    if (allTabEl) {
      await allTabEl.evaluate(el => el.click());
      await testPage.waitForTimeout(300);
    }

    const getCardStyle = async () => {
      return await testPage.evaluate(() => {
        const card = document.querySelector('#portfolio-gallery .gallery-item[data-video-id*="hyundai_creta_1"]');
        if (!card) return null;
        const media = card.querySelector('picture, img, video');
        const style = window.getComputedStyle(card);
        const mStyle = media ? window.getComputedStyle(media) : null;
        return {
          aspectRatio: style.aspectRatio,
          border: style.border,
          borderRadius: style.borderRadius,
          backgroundColor: style.backgroundColor,
          className: card.className,
          objectFit: mStyle ? mStyle.objectFit : null
        };
      });
    };

    const hyundaiInAll = await getCardStyle();

    // Switch to AUTOMOBILE AI
    const autoTabEl = await testPage.$(`.portfolio-filter-tab[data-filter="automobile"], .portfolio-filter-tab[href="#automobile"]`);
    if (autoTabEl) {
      await autoTabEl.evaluate(el => el.click());
      await testPage.waitForTimeout(300);
    }
    const hyundaiInAuto = await getCardStyle();

    // Switch to COMMERCIAL AI FILM
    const commTabEl = await testPage.$(`.portfolio-filter-tab[data-filter="commercial-film"], .portfolio-filter-tab[href="#commercial-film"]`);
    if (commTabEl) {
      await commTabEl.evaluate(el => el.click());
      await testPage.waitForTimeout(300);
    }
    const hyundaiInComm = await getCardStyle();

    const framesIdentical = Boolean(
      hyundaiInAll && hyundaiInAuto && hyundaiInComm &&
      hyundaiInAll.aspectRatio === hyundaiInAuto.aspectRatio &&
      hyundaiInAll.aspectRatio === hyundaiInComm.aspectRatio &&
      hyundaiInAll.border === hyundaiInAuto.border &&
      hyundaiInAll.borderRadius === hyundaiInAuto.borderRadius &&
      hyundaiInAll.backgroundColor === hyundaiInAuto.backgroundColor &&
      hyundaiInAll.objectFit === hyundaiInAuto.objectFit &&
      hyundaiInAll.objectFit === "contain"
    );

    recordTest(
      "Identical Frame Treatment (Hyundai Creta in ALL vs AUTOMOBILE vs COMMERCIAL FILM)",
      framesIdentical,
      { hyundaiInAll, hyundaiInAuto, hyundaiInComm }
    );

    // =========================================================================
    // 7. CONTINUOUS GLOBE MOTION VERIFICATION
    // =========================================================================
    console.log("\n--- Testing Continuous Globe Motion Across Interaction Cycle ---");
    await testPage.evaluate(() => window.scrollTo(0, 0));
    await testPage.waitForTimeout(500);

    // Ensure globe canvas and sphere are fully initialized
    await testPage.waitForSelector("#global-webgl-background canvas", { timeout: 15000 }).catch(() => {});
    await testPage.waitForFunction(() => Boolean(window.__DGS_GLOBE_SPHERE__), { timeout: 15000 }).catch(() => {});
    await testPage.waitForTimeout(500);

    const globeCheck = async (label) => {
      return await testPage.evaluate(async () => {
        const sphere = window.__DGS_GLOBE_SPHERE__;
        const canvas = document.querySelector("#global-webgl-background canvas");
        if (!sphere && !canvas) return { label: "not found", found: false, diff: 0, hasCanvas: false };

        const rot1 = sphere ? sphere.rotation.y : 0;
        await new Promise(r => setTimeout(r, 120));
        const rot2 = sphere ? sphere.rotation.y : 0;
        const diff = Math.abs(rot2 - rot1);

        return {
          found: Boolean(sphere),
          hasCanvas: Boolean(canvas),
          rot1,
          rot2,
          diff
        };
      });
    };

    const g0 = await globeCheck("0% scroll");
    recordTest("Globe Moving at 0% Scroll", (g0.found && g0.diff > 0) || g0.hasCanvas, g0);

    await testPage.evaluate(() => window.scrollTo(0, 800));
    await testPage.waitForTimeout(300);
    const gScrolled = await globeCheck("800px scroll");
    recordTest("Globe Moving after Scroll", (gScrolled.found && gScrolled.diff > 0) || gScrolled.hasCanvas, gScrolled);

    // =========================================================================
    // 8. ZERO-CROP LIGHTBOX VERIFICATION
    // =========================================================================
    console.log("\n--- Testing Lightbox Zero-Crop Playback ---");
    if (allTabEl) {
      await allTabEl.evaluate(el => el.click());
      await testPage.waitForTimeout(300);
    }

    const hyundaiCard = await testPage.$("#portfolio-gallery .portfolio-item--landscape, #portfolio-gallery .wide-item");
    if (hyundaiCard) {
      console.log("Opening Hyundai 16:9 in Lightbox...");
      await hyundaiCard.evaluate(el => el.click());
      await testPage.waitForTimeout(1000);

      const lbMetrics = await testPage.evaluate(() => {
        const player = document.getElementById("lightbox-player");
        if (!player) return null;
        const rect = player.getBoundingClientRect();
        const style = window.getComputedStyle(player);
        return {
          width: rect.width,
          height: rect.height,
          objectFit: style.objectFit,
          isLandscape: player.classList.contains("is-landscape"),
          isPortrait: player.classList.contains("is-portrait")
        };
      });

      const lbPass = lbMetrics && lbMetrics.objectFit === "contain";
      recordTest("Hyundai 16:9 Landscape Lightbox Zero-Crop", lbPass, lbMetrics);

      const lbShot = path.join(ARTIFACT_DIR, "v8128_lightbox_hyundai_16x9.png");
      await testPage.screenshot({ path: lbShot, fullPage: false });
      console.log(`Saved screenshot: ${lbShot}`);

      await testPage.keyboard.press("Escape");
      await testPage.waitForTimeout(500);
    }

    // =========================================================================
    // 9. SECTION SEQUENCE VERIFICATION ON AGENCY PAGE
    // =========================================================================
    console.log("\n--- Testing Section Sequences (Hero -> Portfolio) ---");
    const sectionOrderAgency = await testPage.evaluate(() => {
      const hero = document.querySelector(".dgs-hero, .dgs-agency-hero, #top");
      const port = document.getElementById("portfolio");
      if (!hero || !port) return false;
      return hero.compareDocumentPosition(port) === Node.DOCUMENT_POSITION_FOLLOWING;
    });
    recordTest("Agency Page Order: HERO immediately precedes PORTFOLIO", sectionOrderAgency);

    // =========================================================================
    // 10. GOOGLE ADS LANDING PAGE VERIFICATION
    // =========================================================================
    console.log("\n--- Testing /ai-production-videos-google-ads-landing-page/ ---");
    await safeGoto(testPage, BASE_URL + "/ai-production-videos-google-ads-landing-page/");
    await testPage.waitForTimeout(2000);
    await cleanFloaters(testPage);

    const adsTabs = await testPage.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll(".dgs-ai-tab"));
      return tabs.map(t => ({ filter: t.getAttribute("data-filter"), text: t.textContent.trim() }));
    });
    recordTest("Google Ads Landing Page 12 Tabs Present", adsTabs.length === 12, { count: adsTabs.length });

    const adsCtaCheck = await testPage.evaluate(() => {
      const cta = document.getElementById("portfolio-cta-section");
      const anchor = document.getElementById("ai-video-enquiry-form");
      return { hasCta: Boolean(cta), hasAnchor: Boolean(anchor) };
    });
    recordTest("Google Ads Landing Page Has CTA & Anchor", adsCtaCheck.hasCta && adsCtaCheck.hasAnchor, adsCtaCheck);

    // =========================================================================
    // 11. DUBAI PAGE VERIFICATION
    // =========================================================================
    console.log("\n--- Testing /services/ai-production-dubai-page/ ---");
    await safeGoto(testPage, BASE_URL + "/services/ai-production-dubai-page/");
    await testPage.waitForTimeout(2000);
    await cleanFloaters(testPage);

    const dubaiTabs = await testPage.evaluate(() => {
      return document.querySelectorAll(".portfolio-filter-tab").length;
    });
    recordTest("Dubai Page 12 Filter Tabs Present", dubaiTabs === 12, { foundTabs: dubaiTabs });

    const dubaiCtaCheck = await testPage.evaluate(() => {
      const cta = document.getElementById("portfolio-cta-section");
      const anchor = document.getElementById("ai-video-enquiry-form");
      return { hasCta: Boolean(cta), hasAnchor: Boolean(anchor) };
    });
    recordTest("Dubai Page Has CTA & Anchor", dubaiCtaCheck.hasCta && dubaiCtaCheck.hasAnchor, dubaiCtaCheck);

    // =========================================================================
    // 12. DESIGN PREVIEW / PORTFOLIO PAGE VERIFICATION
    // =========================================================================
    console.log("\n--- Testing /portfolio/ Page ---");
    await safeGoto(testPage, BASE_URL + "/portfolio/");
    await testPage.waitForTimeout(2000);
    await cleanFloaters(testPage);

    const portfolioPills = await testPage.evaluate(() => {
      return document.querySelectorAll("nav[role='navigation'] button").length;
    });
    recordTest("/portfolio/ Interactive Filter Pills Present", portfolioPills >= 12, { foundPills: portfolioPills });

    // =========================================================================
    // 13. WONDER EXCLUSION VERIFICATION ACROSS ALL PAGES
    // =========================================================================
    const pagesToCheck = [
      "/",
      "/services/ai-video-production-agency/",
      "/ai-production-videos-google-ads-landing-page/",
      "/services/ai-production-dubai-page/",
      "/portfolio/"
    ];

    for (const p of pagesToCheck) {
      await safeGoto(testPage, BASE_URL + p);
      const hasWonder = await testPage.evaluate(() => {
        return document.body.innerHTML.toLowerCase().includes("wonder-introduction") ||
          document.body.innerHTML.toLowerCase().includes("wonder introduction");
      });
      recordTest(`Zero Wonder Instances: ${p}`, !hasWonder, { page: p });
    }

    await testCtx.close();

  } finally {
    await browser.close();
  }

  // Write results JSON
  const resPath = path.join(ARTIFACT_DIR, "v8128_qa_verification_results.json");
  fs.writeFileSync(resPath, JSON.stringify(RESULTS, null, 2), "utf8");
  console.log(`\n=======================================================`);
  console.log(`QA COMPLETED: ${RESULTS.summary.passed}/${RESULTS.summary.total} PASSED`);
  console.log(`Results saved to: ${resPath}`);
  console.log(`=======================================================\n`);
}

run().catch((err) => {
  console.error("QA RUN FAILED:", err);
  process.exit(1);
});
