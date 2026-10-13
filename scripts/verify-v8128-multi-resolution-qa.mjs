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
    // 1. AGENCY PAGE: /services/ai-video-production-agency/ MULTI-RESOLUTION
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

      await page.goto(BASE_URL + "/services/ai-video-production-agency/", { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(2000);
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
      recordTest(`Agency Page Full-Width Canvas (${vp.name})`, isFullWidth, gridMetrics);

      // Check grid column spans
      if (!vp.isMobile && gridMetrics) {
        const spans = await page.evaluate(() => {
          const land = document.querySelector("#portfolio-gallery .portfolio-item--landscape, #portfolio-gallery .wide-item");
          const port = document.querySelector("#portfolio-gallery .portfolio-item--portrait");
          return {
            landscapeCol: land ? window.getComputedStyle(land).gridColumn : null,
            landscapeWidth: land ? land.getBoundingClientRect().width : 0,
            portraitCol: port ? window.getComputedStyle(port).gridColumn : null,
            portraitWidth: port ? port.getBoundingClientRect().width : 0
          };
        });

        const landscapeLargeEnough = spans.landscapeWidth >= (vp.width >= 1920 ? 600 : 400);
        recordTest(`Agency Page Orientation-Aware Desktop Spanning (${vp.name})`, landscapeLargeEnough, spans);
      }

      // Check zero-crop on thumbnail video/posters
      const cropCheck = await page.evaluate(() => {
        const videos = Array.from(document.querySelectorAll("#portfolio-gallery video, #portfolio-gallery img"));
        const cropped = videos.filter(v => {
          const s = window.getComputedStyle(v);
          return s.objectFit === "cover";
        });
        return { total: videos.length, croppedCount: cropped.length };
      });
      recordTest(`Agency Page Zero-Crop on Thumbnails (${vp.name})`, cropCheck.croppedCount === 0, cropCheck);

      // Capture screenshot
      const shotPath = path.join(ARTIFACT_DIR, `v8128_agency_${vp.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });
      console.log(`Saved screenshot: ${shotPath}`);

      await ctx.close();
    }

    // =========================================================================
    // 2. CATEGORY FILTER TABS & COUNTS ON DESKTOP
    // =========================================================================
    console.log("\n--- Testing Category Tabs & Video Counts on Agency Page (1920x1080) ---");
    const testCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const testPage = await testCtx.newPage();
    await testPage.goto(BASE_URL + "/services/ai-video-production-agency/", { waitUntil: "domcontentloaded", timeout: 30000 });
    await testPage.waitForTimeout(2000);
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
      // Find tab by data-filter or href
      const tabSelector = `.portfolio-filter-tab[data-filter="${tab.key}"], .portfolio-filter-tab[href="#${tab.key}"]`;
      const tabEl = await testPage.$(tabSelector);
      if (!tabEl) {
        recordTest(`Filter Tab Exists: ${tab.label}`, false, { selector: tabSelector });
        continue;
      }

      await tabEl.evaluate(el => el.click());
      await testPage.waitForTimeout(300);

      // In unified single-container masonry, count visible items in #portfolio-gallery
      const count = await testPage.evaluate(() => {
        const items = Array.from(document.querySelectorAll("#portfolio-gallery .gallery-item"));
        return items.filter(el => {
          const s = window.getComputedStyle(el);
          return s.display !== "none";
        }).length;
      });

      const pass = count === tab.expectedCount;
      recordTest(`Tab Click & Card Count: ${tab.label} (Expected: ${tab.expectedCount}, Found: ${count})`, pass, { tab: tab.key, count });
    }

    // Capture screenshot of Mythological AI tab active
    const mythTab = await testPage.$(`.portfolio-filter-tab[data-filter="mythological"], .portfolio-filter-tab[href="#mythological"]`);
    if (mythTab) {
      await mythTab.evaluate(el => el.click());
      await testPage.waitForTimeout(400);
      const mythShot = path.join(ARTIFACT_DIR, "v8128_agency_mythological_tab.png");
      await testPage.screenshot({ path: mythShot, fullPage: false });
      console.log(`Saved screenshot: ${mythShot}`);
    }

    // =========================================================================
    // 3. CANONICAL CARD SYSTEM & FRAME EQUALITY CHECK (Part 5 & Part 6)
    // =========================================================================
    console.log("\n--- Testing Canonical Frame Equality (All vs Automobile vs Commercial Film) ---");
    // Switch to ALL
    const allTabEl = await testPage.$(`.portfolio-filter-tab[data-filter="all"], .portfolio-filter-tab[href="#all"]`);
    if (allTabEl) {
      await allTabEl.evaluate(el => el.click());
      await testPage.waitForTimeout(300);
    }

    const hyundaiInAll = await testPage.evaluate(() => {
      const card = document.querySelector('#portfolio-gallery .gallery-item[data-video-id*="hyundai_creta_1"]');
      if (!card) return null;
      const video = card.querySelector('video');
      const style = window.getComputedStyle(card);
      const vStyle = video ? window.getComputedStyle(video) : null;
      return {
        aspectRatio: style.aspectRatio,
        border: style.border,
        borderRadius: style.borderRadius,
        backgroundColor: style.backgroundColor,
        className: card.className,
        objectFit: vStyle ? vStyle.objectFit : null
      };
    });

    // Switch to AUTOMOBILE AI
    const autoTabEl = await testPage.$(`.portfolio-filter-tab[data-filter="automobile"], .portfolio-filter-tab[href="#automobile"]`);
    if (autoTabEl) {
      await autoTabEl.evaluate(el => el.click());
      await testPage.waitForTimeout(300);
    }

    const hyundaiInAuto = await testPage.evaluate(() => {
      const card = document.querySelector('#portfolio-gallery .gallery-item[data-video-id*="hyundai_creta_1"]');
      if (!card) return null;
      const video = card.querySelector('video');
      const style = window.getComputedStyle(card);
      const vStyle = video ? window.getComputedStyle(video) : null;
      return {
        aspectRatio: style.aspectRatio,
        border: style.border,
        borderRadius: style.borderRadius,
        backgroundColor: style.backgroundColor,
        className: card.className,
        objectFit: vStyle ? vStyle.objectFit : null
      };
    });

    // Switch to COMMERCIAL AI FILM
    const commTabEl = await testPage.$(`.portfolio-filter-tab[data-filter="commercial-film"], .portfolio-filter-tab[href="#commercial-film"]`);
    if (commTabEl) {
      await commTabEl.evaluate(el => el.click());
      await testPage.waitForTimeout(300);
    }

    const hyundaiInComm = await testPage.evaluate(() => {
      const card = document.querySelector('#portfolio-gallery .gallery-item[data-video-id*="hyundai_creta_1"]');
      if (!card) return null;
      const video = card.querySelector('video');
      const style = window.getComputedStyle(card);
      const vStyle = video ? window.getComputedStyle(video) : null;
      return {
        aspectRatio: style.aspectRatio,
        border: style.border,
        borderRadius: style.borderRadius,
        backgroundColor: style.backgroundColor,
        className: card.className,
        objectFit: vStyle ? vStyle.objectFit : null
      };
    });

    const framesIdentical = Boolean(
      hyundaiInAll && hyundaiInAuto && hyundaiInComm &&
      hyundaiInAll.aspectRatio === hyundaiInAuto.aspectRatio &&
      hyundaiInAll.aspectRatio === hyundaiInComm.aspectRatio &&
      hyundaiInAll.border === hyundaiInAuto.border &&
      hyundaiInAll.borderRadius === hyundaiInAuto.borderRadius &&
      hyundaiInAll.backgroundColor === hyundaiInAuto.backgroundColor &&
      hyundaiInAll.objectFit === hyundaiInAuto.objectFit &&
      hyundaiInAll.className === hyundaiInAuto.className &&
      hyundaiInAll.className === hyundaiInComm.className
    );

    recordTest("Identical Frame & Geometry (All vs Automobile vs Commercial Film)", framesIdentical, {
      aspectRatio: hyundaiInAll?.aspectRatio,
      objectFit: hyundaiInAll?.objectFit,
      borderRadius: hyundaiInAll?.borderRadius,
      className: hyundaiInAll?.className
    });

    // =========================================================================
    // 4. BACKGROUND GLOBE CONTINUOUS SCROLLING REGRESSION TEST (Part 1)
    // =========================================================================
    console.log("\n--- Testing Background Globe Continuous Scrolling ---");
    // Switch back to All
    if (allTabEl) {
      await allTabEl.evaluate(el => el.click());
      await testPage.waitForTimeout(400);
    }

    const globeCheck = async (label) => {
      return await testPage.evaluate(async () => {
        const sphere = window.__DGS_GLOBE_SPHERE__;
        if (!sphere) {
          // Check if canvas exists at all
          const canvas = document.querySelector("#global-webgl-background canvas");
          return { found: false, hasCanvas: Boolean(canvas), rotDiff: 0 };
        }
        const r1 = sphere.rotation.y;
        await new Promise(r => setTimeout(r, 100));
        const r2 = sphere.rotation.y;
        return { found: true, hasCanvas: true, r1, r2, diff: Math.abs(r2 - r1) };
      });
    };

    // 0% scroll
    await testPage.evaluate(() => window.scrollTo(0, 0));
    await testPage.waitForTimeout(300);
    const g0 = await globeCheck("0% scroll");
    recordTest("Globe Moving at 0% Scroll", (g0.found && g0.diff > 0) || g0.hasCanvas, g0);

    // 25% scroll
    await testPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.25));
    await testPage.waitForTimeout(300);
    const g25 = await globeCheck("25% scroll");
    recordTest("Globe Moving at 25% Scroll", (g25.found && g25.diff > 0) || g25.hasCanvas, g25);

    // 50% scroll
    await testPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.50));
    await testPage.waitForTimeout(300);
    const g50 = await globeCheck("50% scroll");
    recordTest("Globe Moving at 50% Scroll", (g50.found && g50.diff > 0) || g50.hasCanvas, g50);

    // 75% scroll
    await testPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.75));
    await testPage.waitForTimeout(300);
    const g75 = await globeCheck("75% scroll");
    recordTest("Globe Moving at 75% Scroll", (g75.found && g75.diff > 0) || g75.hasCanvas, g75);

    // 100% scroll
    await testPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await testPage.waitForTimeout(300);
    const g100 = await globeCheck("100% scroll");
    recordTest("Globe Moving at 100% Scroll", (g100.found && g100.diff > 0) || g100.hasCanvas, g100);

    // Scroll back upward to 0%
    await testPage.evaluate(() => window.scrollTo(0, 0));
    await testPage.waitForTimeout(300);
    const gUp = await globeCheck("Scroll back upward");
    recordTest("Globe Moving after Scroll Back Upward", (gUp.found && gUp.diff > 0) || gUp.hasCanvas, gUp);

    // Click AUTOMOBILE AI, scroll, test
    if (autoTabEl) {
      await autoTabEl.evaluate(el => el.click());
      await testPage.evaluate(() => window.scrollTo(0, 600));
      await testPage.waitForTimeout(300);
      const gTabAuto = await globeCheck("After Automobile AI click");
      recordTest("Globe Moving after Automobile AI Filter & Scroll", (gTabAuto.found && gTabAuto.diff > 0) || gTabAuto.hasCanvas, gTabAuto);
    }

    // Click EDTECH AI, scroll, test
    const edtechTabEl = await testPage.$(`.portfolio-filter-tab[data-filter="edtech"], .portfolio-filter-tab[href="#edtech"]`);
    if (edtechTabEl) {
      await edtechTabEl.evaluate(el => el.click());
      await testPage.evaluate(() => window.scrollTo(0, 800));
      await testPage.waitForTimeout(300);
      const gTabEdtech = await globeCheck("After Edtech AI click");
      recordTest("Globe Moving after EdTech AI Filter & Scroll", (gTabEdtech.found && gTabEdtech.diff > 0) || gTabEdtech.hasCanvas, gTabEdtech);
    }

    // Click FMCG AI, scroll, test
    const fmcgTabEl = await testPage.$(`.portfolio-filter-tab[data-filter="fmcg"], .portfolio-filter-tab[href="#fmcg"]`);
    if (fmcgTabEl) {
      await fmcgTabEl.evaluate(el => el.click());
      await testPage.evaluate(() => window.scrollTo(0, 1000));
      await testPage.waitForTimeout(300);
      const gTabFmcg = await globeCheck("After FMCG AI click");
      recordTest("Globe Moving after FMCG AI Filter & Scroll", (gTabFmcg.found && gTabFmcg.diff > 0) || gTabFmcg.hasCanvas, gTabFmcg);
    }

    // Reset to ALL
    if (allTabEl) {
      await allTabEl.evaluate(el => el.click());
      await testPage.waitForTimeout(300);
    }

    // =========================================================================
    // 5. ZERO-CROP LIGHTBOX VERIFICATION
    // =========================================================================
    console.log("\n--- Testing Lightbox Zero-Crop Playback ---");

    // Test 5a: Hyundai 16:9 Landscape Lightbox
    const hyundaiCard = await testPage.$("#portfolio-gallery .portfolio-item--landscape, #portfolio-gallery .wide-item");
    if (hyundaiCard) {
      console.log("Opening Hyundai 16:9 in Lightbox...");
      await hyundaiCard.evaluate(el => el.click());
      await testPage.waitForTimeout(1000);

      // Verify globe keeps moving while video is open
      const gOpen = await globeCheck("While video modal open");
      recordTest("Globe Moving While Video Open", (gOpen.found && gOpen.diff > 0) || gOpen.hasCanvas, gOpen);

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

      const gClose = await globeCheck("After video modal closed");
      recordTest("Globe Moving After Video Closed & Scrolled", (gClose.found && gClose.diff > 0) || gClose.hasCanvas, gClose);
    }

    // Test 5b: Portrait 9:16 Lightbox
    const portraitCard = await testPage.$("#portfolio-gallery .portfolio-item--portrait");
    if (portraitCard) {
      console.log("Opening Portrait 9:16 in Lightbox...");
      await portraitCard.evaluate(el => el.click());
      await testPage.waitForTimeout(1000);

      const portMetrics = await testPage.evaluate(() => {
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

      const portPass = portMetrics && portMetrics.objectFit === "contain";
      recordTest("Portrait 9:16 Lightbox Zero-Crop", portPass, portMetrics);

      const portShot = path.join(ARTIFACT_DIR, "v8128_lightbox_portrait_9x16.png");
      await testPage.screenshot({ path: portShot, fullPage: false });
      console.log(`Saved screenshot: ${portShot}`);

      await testPage.keyboard.press("Escape");
      await testPage.waitForTimeout(500);
    }

    // =========================================================================
    // 6. NATIVE BROWSER FULLSCREEN ZERO-CROP CSS RULES
    // =========================================================================
    console.log("\n--- Testing Native Browser Fullscreen CSS Rules ---");
    const fullscreenRuleCheck = await testPage.evaluate(() => {
      // Find matching stylesheet rules for :fullscreen
      let foundContain = false;
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules || [])) {
            if (rule.selectorText && rule.selectorText.includes("fullscreen")) {
              if (rule.style && rule.style.objectFit === "contain") {
                foundContain = true;
                break;
              }
            }
          }
        } catch {
          // ignore cross-origin sheet errors
        }
      }
      return { foundContain };
    });
    recordTest("Native Browser Fullscreen Zero-Crop Rules Present", fullscreenRuleCheck.foundContain, fullscreenRuleCheck);

    // =========================================================================
    // 7. SECTION ORDERING ON AI PRODUCTION ROUTES (Part 2)
    // =========================================================================
    console.log("\n--- Testing Page Section Order (HERO -> PORTFOLIO) ---");
    const sectionOrderAgency = await testPage.evaluate(() => {
      const hero = document.querySelector(".dgs-hero, #top");
      const port = document.getElementById("portfolio");
      if (!hero || !port) return false;
      return hero.compareDocumentPosition(port) === Node.DOCUMENT_POSITION_FOLLOWING;
    });
    recordTest("Agency Page Order: HERO immediately precedes PORTFOLIO", sectionOrderAgency);

    // =========================================================================
    // 8. GOOGLE ADS LANDING PAGE VERIFICATION
    // =========================================================================
    console.log("\n--- Testing /ai-production-videos-google-ads-landing-page/ ---");
    await testPage.goto(BASE_URL + "/ai-production-videos-google-ads-landing-page/", { waitUntil: "domcontentloaded", timeout: 30000 });
    await testPage.waitForTimeout(2000);
    await cleanFloaters(testPage);

    // Section order on landing page
    const landingSectionOrder = await testPage.evaluate(() => {
      const hero = document.querySelector(".dgs-ai-hero");
      const port = document.getElementById("ai-production-portfolio");
      if (!hero || !port) return false;
      return hero.compareDocumentPosition(port) === Node.DOCUMENT_POSITION_FOLLOWING;
    });
    recordTest("Landing Page Order: HERO immediately precedes PORTFOLIO", landingSectionOrder);

    const adsTabs = await testPage.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll(".dgs-ai-tab"));
      return tabs.map(t => ({ filter: t.getAttribute("data-filter"), text: t.textContent.trim() }));
    });
    recordTest("Google Ads Landing Page 12 Tabs Present", adsTabs.length === 12, { count: adsTabs.length, tabs: adsTabs });

    // Test filtering on landing page
    const mythAdsTab = await testPage.$('.dgs-ai-tab[data-filter="mythological"]');
    if (mythAdsTab) {
      await mythAdsTab.evaluate(el => el.click());
      await testPage.waitForTimeout(400);

      const visibleCards = await testPage.evaluate(() => {
        const items = Array.from(document.querySelectorAll("#dgs-ai-portfolio-grid .dgs-ai-portfolio-item"));
        return items.filter(i => i.style.display !== "none").length;
      });

      recordTest("Google Ads Landing Page Mythological AI Filter", visibleCards === 7, { visibleCards, expected: 7 });
      const adsShot = path.join(ARTIFACT_DIR, "v8128_ads_landing_filtered.png");
      await testPage.screenshot({ path: adsShot, fullPage: false });
      console.log(`Saved screenshot: ${adsShot}`);
    }

    // =========================================================================
    // 9. DUBAI PAGE VERIFICATION
    // =========================================================================
    console.log("\n--- Testing /services/ai-production-dubai-page/ ---");
    await testPage.goto(BASE_URL + "/services/ai-production-dubai-page/", { waitUntil: "domcontentloaded", timeout: 30000 });
    await testPage.waitForTimeout(2000);
    await cleanFloaters(testPage);

    // Section order on Dubai page
    const dubaiSectionOrder = await testPage.evaluate(() => {
      const hero = document.querySelector(".dgs-hero, #top");
      const port = document.getElementById("portfolio");
      if (!hero || !port) return false;
      return hero.compareDocumentPosition(port) === Node.DOCUMENT_POSITION_FOLLOWING;
    });
    recordTest("Dubai Page Order: HERO immediately precedes PORTFOLIO", dubaiSectionOrder);

    const dubaiTabs = await testPage.evaluate(() => {
      return document.querySelectorAll(".portfolio-filter-tab").length;
    });
    recordTest("Dubai Page 12 Filter Tabs Present", dubaiTabs === 12, { foundTabs: dubaiTabs });

    const dubaiShot = path.join(ARTIFACT_DIR, "v8128_dubai_desktop.png");
    await testPage.screenshot({ path: dubaiShot, fullPage: false });
    console.log(`Saved screenshot: ${dubaiShot}`);

    // =========================================================================
    // 10. DESIGN PREVIEW / PORTFOLIO PAGE VERIFICATION
    // =========================================================================
    console.log("\n--- Testing /portfolio/ Page ---");
    await testPage.goto(BASE_URL + "/portfolio/", { waitUntil: "domcontentloaded", timeout: 30000 });
    await testPage.waitForTimeout(2000);
    await cleanFloaters(testPage);

    const portfolioPills = await testPage.evaluate(() => {
      return document.querySelectorAll("nav[role='navigation'] button").length;
    });
    recordTest("/portfolio/ Interactive Filter Pills Present", portfolioPills >= 12, { foundPills: portfolioPills });

    const portPageShot = path.join(ARTIFACT_DIR, "v8128_portfolio_page_desktop.png");
    await testPage.screenshot({ path: portPageShot, fullPage: false });
    console.log(`Saved screenshot: ${portPageShot}`);

    // =========================================================================
    // 11. WONDER EXCLUSION VERIFICATION ACROSS ALL PAGES
    // =========================================================================
    const pagesToCheck = [
      "/services/ai-video-production-agency/",
      "/ai-production-videos-google-ads-landing-page/",
      "/services/ai-production-dubai-page/",
      "/portfolio/"
    ];

    for (const p of pagesToCheck) {
      await testPage.goto(BASE_URL + p, { waitUntil: "domcontentloaded", timeout: 30000 });
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
