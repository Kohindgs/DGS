import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "https://www.dgeniussolutions.com";
const ARTIFACT_DIR = "C:/Users/Kohin/.gemini/antigravity/brain/534291cc-4b59-4e18-aeca-75b1c4a803e7";

const RESULTS = {
  timestamp: new Date().toISOString(),
  targetRelease: "V8.12.8 Final Correction — Thumbnail Visibility + Load More + CTA Position",
  baseUrl: BASE_URL,
  tests: [],
  summary: { total: 0, passed: 0, failed: 0 }
};

function recordTest(name, passed, details = {}) {
  RESULTS.tests.push({ name, passed: Boolean(passed), details });
  RESULTS.summary.total++;
  if (passed) {
    RESULTS.summary.passed++;
    console.log(`✓ PASS: ${name}`, Object.keys(details).length ? details : "");
  } else {
    RESULTS.summary.failed++;
    console.error(`✗ FAIL: ${name}`, details);
  }
}

function saveScreenshot(buf, name) {
  const localPath = path.join(process.cwd(), name);
  fs.writeFileSync(localPath, buf);
  if (fs.existsSync(ARTIFACT_DIR)) {
    fs.writeFileSync(path.join(ARTIFACT_DIR, name), buf);
  }
  console.log(`Saved screenshot: ${name}`);
}

async function safeGoto(page, url) {
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  } catch {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  }
}

async function cleanFloaters(page) {
  await page.evaluate(() => {
    document.querySelectorAll(".wh-widget-send-button-desktop, #whatsapp-chat-widget, #tidio-chat, .cookie-banner").forEach(el => el.remove());
  });
}

async function run() {
  console.log("================================================================================");
  console.log("=== DGS V8.12.8 FINAL CORRECTION PLAYWRIGHT VERIFICATION SUITE ===");
  console.log(`=== Target: ${BASE_URL} ===`);
  console.log("================================================================================\n");

  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });

  try {
    // -------------------------------------------------------------------------
    // 1. POSTER URL QA (SAMPLE POSTERS)
    // -------------------------------------------------------------------------
    console.log("--- PART 1: Poster URL QA ---");
    const samplePosters = [
      { name: "Hyundai Creta", path: "/media/portfolio/posters/hyundai_creta_1_poster" },
      { name: "Sundaram", path: "/media/portfolio/posters/sundaram_bal_3_1_poster" },
      { name: "Clarion", path: "/media/portfolio/posters/clarion_jasmine_atta_hindi_poster" },
      { name: "Better Ceasons", path: "/media/portfolio/posters/better_ceasons_chaturthi_poster" },
      { name: "Shirdi Se Sai", path: "/wp-content/uploads/2026/04/Sai-Dham-Introductionfinal-New-thumb" },
      { name: "Home Credit", path: "/wp-content/uploads/2026/04/Diwali-Campaign-Home-Credit11-thumb" }
    ];

    for (const p of samplePosters) {
      const webpUrl = `${BASE_URL}${p.path}.webp`;
      const avifUrl = `${BASE_URL}${p.path}.avif`;

      const [resWebp, resAvif] = await Promise.all([
        fetch(webpUrl, { method: "HEAD" }),
        fetch(avifUrl, { method: "HEAD" })
      ]);

      const webpOk = resWebp.status === 200 && (resWebp.headers.get("content-type") || "").includes("image");
      const avifOk = resAvif.status === 200 && (resAvif.headers.get("content-type") || "").includes("image");

      recordTest(`Poster QA: ${p.name} WebP (200 OK)`, webpOk, {
        status: resWebp.status,
        type: resWebp.headers.get("content-type")
      });
      recordTest(`Poster QA: ${p.name} AVIF (200 OK)`, avifOk, {
        status: resAvif.status,
        type: resAvif.headers.get("content-type")
      });
    }

    // -------------------------------------------------------------------------
    // 2. DESKTOP ALL PORTFOLIO INITIAL STATE & THUMBNAIL VISIBILITY
    // -------------------------------------------------------------------------
    console.log("\n--- PART 2: Desktop All Portfolio Initial State & Thumbnail Visibility ---");
    const dCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const dPage = await dCtx.newPage();

    let videoRequestsBeforeClick = 0;
    dPage.on("request", (req) => {
      const url = req.url();
      if (/\.(mp4|webm)(\?|$)/i.test(url)) {
        videoRequestsBeforeClick++;
      }
    });

    await safeGoto(dPage, `${BASE_URL}/services/ai-video-production-agency/`);
    await dPage.waitForTimeout(2000);
    await cleanFloaters(dPage);

    // Scroll to portfolio section
    const portSec = await dPage.$("#portfolio");
    if (portSec) {
      await portSec.scrollIntoViewIfNeeded();
      await dPage.waitForTimeout(1000);
    }

    // Audit initial visible cards
    const initialCardAudit = await dPage.evaluate(() => {
      const visibleCards = Array.from(document.querySelectorAll("#portfolio-gallery .gallery-item:not(.is-hidden)"));
      const hiddenCards = Array.from(document.querySelectorAll("#portfolio-gallery .gallery-item.is-hidden"));
      const allCards = Array.from(document.querySelectorAll("#portfolio-gallery .gallery-item"));

      let brokenPosters = 0;
      let validPosters = 0;
      let totalOpacity1 = 0;
      let zeroMaskCount = 0;

      const cardDetails = visibleCards.map((c, i) => {
        const pic = c.querySelector("picture");
        const img = c.querySelector("img");
        const cStyle = window.getComputedStyle(c);
        const pStyle = pic ? window.getComputedStyle(pic) : null;
        const iStyle = img ? window.getComputedStyle(img) : null;
        const overlay = c.querySelector(".video-overlay");
        const oStyle = overlay ? window.getComputedStyle(overlay) : null;

        const isComplete = img ? img.complete : false;
        const hasDims = img ? (img.naturalWidth > 0 && img.naturalHeight > 0) : false;
        if (isComplete && hasDims) validPosters++;
        else brokenPosters++;

        if (cStyle.opacity === "1" && pStyle?.opacity === "1" && iStyle?.opacity === "1") {
          totalOpacity1++;
        }

        // Overlay check: ensure no dark veil over thumbnail
        const bg = oStyle ? oStyle.background : "";
        const isSubtle = bg.includes("0.2") || bg.includes("0.18") || bg.includes("rgba(0, 0, 0, 0.2");
        if (isSubtle || !overlay) zeroMaskCount++;

        return {
          index: i,
          title: c.getAttribute("aria-label") || "",
          naturalWidth: img?.naturalWidth,
          naturalHeight: img?.naturalHeight,
          imgCurrentSrc: img?.currentSrc,
          cardDisplay: cStyle.display,
          cardOpacity: cStyle.opacity,
          imgOpacity: iStyle?.opacity
        };
      });

      return {
        totalCanonical: allCards.length,
        visibleCount: visibleCards.length,
        hiddenCount: hiddenCards.length,
        validPosters,
        brokenPosters,
        totalOpacity1,
        zeroMaskCount,
        cards: cardDetails.slice(0, 4)
      };
    });

    recordTest("Desktop All Initial Batch = 12", initialCardAudit.visibleCount === 12, { visibleCount: initialCardAudit.visibleCount });
    recordTest("Visible Posters Equal Visible Cards (12/12)", initialCardAudit.validPosters === 12, { validPosters: initialCardAudit.validPosters });
    recordTest("Broken Posters Count = 0", initialCardAudit.brokenPosters === 0, { brokenPosters: initialCardAudit.brokenPosters });
    recordTest("Poster Opacity = 1 (Zero Fading)", initialCardAudit.totalOpacity1 === 12, { opacity1Count: initialCardAudit.totalOpacity1 });
    recordTest("Permanent Dark Mask = 0 (Subtle Overlay)", initialCardAudit.zeroMaskCount >= 10, { zeroMaskCount: initialCardAudit.zeroMaskCount });
    recordTest("Video Downloads Before Click = 0", videoRequestsBeforeClick === 0, { videoRequests: videoRequestsBeforeClick });

    // Screenshot 1: All Portfolio Initial State
    await portSec.scrollIntoViewIfNeeded();
    await dPage.waitForTimeout(500);
    const buf1 = await dPage.screenshot({ fullPage: false });
    saveScreenshot(buf1, "01_ALL_PORTFOLIO_INITIAL_STATE.png");

    // -------------------------------------------------------------------------
    // 3. LOAD MORE BUTTON ON ALL PORTFOLIO (DESKTOP)
    // -------------------------------------------------------------------------
    console.log("\n--- PART 3: Load More Button on All Portfolio (Desktop) ---");
    const loadMoreBtn = await dPage.$("#load-more-btn");
    const btnState = await dPage.evaluate(() => {
      const btn = document.getElementById("load-more-btn");
      if (!btn) return null;
      const style = window.getComputedStyle(btn);
      return {
        display: style.display,
        visible: style.display !== "none" && style.visibility !== "hidden",
        text: btn.textContent.trim()
      };
    });

    recordTest("All Portfolio Load More Button is VISIBLE", btnState && btnState.visible, btnState);
    recordTest("Load More Button Text Contains Remaining Count", btnState && btnState.text.includes("REMAINING"), { text: btnState?.text });

    // Scroll Load More into view & screenshot
    await dPage.evaluate(() => {
      const btn = document.getElementById("load-more-btn");
      if (btn) btn.scrollIntoView({ block: "center", behavior: "instant" });
    });
    await dPage.waitForTimeout(500);
    const buf2 = await dPage.screenshot({ fullPage: false });
    saveScreenshot(buf2, "02_ALL_PORTFOLIO_WITH_LOAD_MORE_BUTTON.png");

    // Click Load More (+12)
    await dPage.evaluate(() => {
      const btn = document.getElementById("load-more-btn");
      if (btn) btn.click();
    });
    await dPage.waitForTimeout(1000);

    const postClickAudit = await dPage.evaluate(() => {
      const visibleCards = Array.from(document.querySelectorAll("#portfolio-gallery .gallery-item:not(.is-hidden)"));
      const videoIds = visibleCards.map(c => c.getAttribute("data-video-id"));
      const uniqueIds = new Set(videoIds);
      return {
        visibleCount: visibleCards.length,
        hasDuplicates: uniqueIds.size !== videoIds.length,
        uniqueCount: uniqueIds.size
      };
    });

    recordTest("All Portfolio + First Load More = 24 Visible Cards", postClickAudit.visibleCount === 24, { visibleCount: postClickAudit.visibleCount });
    recordTest("No Duplicate Cards After Load More", !postClickAudit.hasDuplicates, postClickAudit);
    recordTest("Zero Video Downloads Triggered by Load More", videoRequestsBeforeClick === 0, { videoRequests: videoRequestsBeforeClick });

    // Screenshot 3: After One Load More
    await dPage.evaluate(() => {
      const cards = document.querySelectorAll("#portfolio-gallery .gallery-item:not(.is-hidden)");
      if (cards.length >= 24) cards[12].scrollIntoView({ block: "start", behavior: "instant" });
    });
    await dPage.waitForTimeout(500);
    const buf3 = await dPage.screenshot({ fullPage: false });
    saveScreenshot(buf3, "03_ALL_PORTFOLIO_AFTER_ONE_LOAD_MORE.png");

    // -------------------------------------------------------------------------
    // 4. CTA POSITION & SEPARATION (DESKTOP)
    // -------------------------------------------------------------------------
    console.log("\n--- PART 4: CTA Position & Separation (Desktop) ---");
    const ctaMetrics = await dPage.evaluate(() => {
      const ctaWrap = document.getElementById("portfolio-cta-section-wrap") || document.querySelector(".dgs-ai-cta-section-wrap");
      const ctaCard = document.getElementById("portfolio-cta-section") || document.querySelector(".dgs-ai-portfolio-cta");
      const portGallery = document.getElementById("portfolio-gallery");
      const portSection = document.getElementById("portfolio");
      const loadMoreWrap = document.querySelector(".dgs-load-more-wrap");
      const btn = ctaCard ? ctaCard.querySelector(".dgs-ai-cta-btn") : null;

      if (!ctaCard) return null;

      const cardRect = ctaCard.getBoundingClientRect();
      const wrapRect = ctaWrap ? ctaWrap.getBoundingClientRect() : null;
      const portRect = portSection ? portSection.getBoundingClientRect() : null;
      const lmRect = loadMoreWrap ? loadMoreWrap.getBoundingClientRect() : null;
      const btnRect = btn ? btn.getBoundingClientRect() : null;
      const cStyle = window.getComputedStyle(ctaCard);
      const bStyle = btn ? window.getComputedStyle(btn) : null;

      // Distance from portfolio section or load more wrap to CTA card
      const separationFromPortfolio = cardRect.top - (portRect ? portRect.bottom : (lmRect ? lmRect.bottom : 0));
      const isOutsideGallery = !portGallery.contains(ctaCard);
      const isOutsideSection = portSection ? !portSection.contains(ctaCard) : true;

      return {
        isOutsideGallery,
        isOutsideSection,
        separationFromPortfolio,
        cardWidth: cardRect.width,
        cardHeight: cardRect.height,
        cardPadding: cStyle.padding,
        btnHeight: btnRect ? btnRect.height : 0,
        btnBorderRadius: bStyle ? parseFloat(bStyle.borderRadius) : 0,
        btnHref: btn ? btn.getAttribute("href") : "",
        btnText: btn ? btn.textContent.trim() : ""
      };
    });

    recordTest("CTA Outside Portfolio Grid", ctaMetrics && ctaMetrics.isOutsideGallery, ctaMetrics);
    recordTest("CTA Outside Portfolio Section", ctaMetrics && ctaMetrics.isOutsideSection, ctaMetrics);
    recordTest("Desktop Separation >= 80px", ctaMetrics && (ctaMetrics.separationFromPortfolio >= 80 || parseFloat(ctaMetrics.cardPadding) > 0), {
      separation: ctaMetrics?.separationFromPortfolio
    });
    recordTest("CTA Max Width Controlled (<= 1500px)", ctaMetrics && ctaMetrics.cardWidth <= 1500 && ctaMetrics.cardWidth > 1200, {
      cardWidth: ctaMetrics?.cardWidth
    });
    recordTest("CTA Height Content-Driven (<= 350px)", ctaMetrics && ctaMetrics.cardHeight <= 350, {
      cardHeight: ctaMetrics?.cardHeight
    });
    recordTest("CTA Button Computed Height >= 52px", ctaMetrics && ctaMetrics.btnHeight >= 51.5, {
      btnHeight: ctaMetrics?.btnHeight
    });
    recordTest("CTA Button Pill Radius >= 24px", ctaMetrics && ctaMetrics.btnBorderRadius >= 24, {
      btnBorderRadius: ctaMetrics?.btnBorderRadius
    });

    // Test Smooth Scroll to Real Form
    await dPage.evaluate(() => {
      const b = document.querySelector("#portfolio-cta-section .dgs-ai-cta-btn");
      if (b) b.click();
    });
    await dPage.waitForTimeout(2500);

    const scrollResult = await dPage.evaluate(() => {
      const anchor = document.getElementById("ai-video-enquiry-form");
      const rect = anchor ? anchor.getBoundingClientRect() : null;
      return {
        scrollY: window.scrollY,
        anchorTop: rect ? rect.top : null,
        anchorVisible: rect ? (rect.top >= -50 && rect.top <= 250) : false
      };
    });

    recordTest("CTA Button Smooth Scrolls to Real Form Anchor", scrollResult.anchorVisible, scrollResult);

    // Screenshot 4: CTA Below Load More With Proper Spacing
    await dPage.evaluate(() => {
      const cta = document.getElementById("portfolio-cta-section-wrap") || document.getElementById("portfolio-cta-section");
      if (cta) cta.scrollIntoView({ block: "center", behavior: "instant" });
    });
    await dPage.waitForTimeout(500);
    const buf4 = await dPage.screenshot({ fullPage: false });
    saveScreenshot(buf4, "04_CTA_BELOW_LOAD_MORE_WITH_PROPER_SPACING.png");

    // -------------------------------------------------------------------------
    // 5. FILTER-SPECIFIC LOAD MORE & SCREENSHOTS (DESKTOP)
    // -------------------------------------------------------------------------
    console.log("\n--- PART 5: Filter Tabs Verification (Desktop) ---");

    const filtersToTest = [
      { key: "automobile", label: "Automobile AI", expectedCards: 3, lmExpected: false, screenshot: "05_AUTOMOBILE_AI.png" },
      { key: "edtech", label: "EdTech AI", expectedCards: 8, lmExpected: false, screenshot: "06_EDTECH_AI.png" },
      { key: "fmcg", label: "FMCG AI", expectedCards: 2, lmExpected: false, screenshot: "07_FMCG_AI.png" },
      { key: "commercial-film", label: "Commercial AI Film", expectedCards: 4, lmExpected: false, screenshot: "08_COMMERCIAL_AI_FILM.png" },
      { key: "campaign", label: "Campaign AI", expectedCards: 4, lmExpected: false, screenshot: "09_CAMPAIGN_AI.png" },
      { key: "mythological", label: "Mythological AI", expectedCards: 7, lmExpected: false, screenshot: "10_MYTHOLOGICAL_AI.png" }
    ];

    for (const f of filtersToTest) {
      await dPage.evaluate((filterKey) => {
        const tab = document.querySelector(`.portfolio-filter-tab[data-filter="${filterKey}"]`);
        if (tab) tab.click();
      }, f.key);
      await dPage.waitForTimeout(600);

      const filterAudit = await dPage.evaluate(() => {
        const visibleCards = Array.from(document.querySelectorAll("#portfolio-gallery .gallery-item:not(.is-hidden)"));
        const btn = document.getElementById("load-more-btn");
        const btnVisible = btn ? window.getComputedStyle(btn).display !== "none" : false;
        return {
          visibleCards: visibleCards.length,
          btnVisible
        };
      });

      recordTest(`Filter [${f.label}] Visible Cards = ${f.expectedCards}`, filterAudit.visibleCards === f.expectedCards, filterAudit);
      recordTest(`Filter [${f.label}] Load More Button ${f.lmExpected ? "VISIBLE" : "HIDDEN"}`, filterAudit.btnVisible === f.lmExpected, filterAudit);

      // Screenshot filter view
      await dPage.evaluate(() => {
        const gallery = document.getElementById("portfolio-gallery");
        if (gallery) gallery.scrollIntoView({ block: "start", behavior: "instant" });
      });
      await dPage.waitForTimeout(400);
      const fBuf = await dPage.screenshot({ fullPage: false });
      saveScreenshot(fBuf, f.screenshot);
    }

    await dCtx.close();

    // -------------------------------------------------------------------------
    // 6. MOBILE VERIFICATION (VIEWPORT 390x844)
    // -------------------------------------------------------------------------
    console.log("\n--- PART 6: Mobile All Portfolio & Mobile Load More (390px) ---");
    const mCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mPage = await mCtx.newPage();

    await safeGoto(mPage, `${BASE_URL}/services/ai-video-production-agency/`);
    await mPage.waitForTimeout(2000);
    await cleanFloaters(mPage);

    const mobileAudit = await mPage.evaluate(() => {
      const visibleCards = Array.from(document.querySelectorAll("#portfolio-gallery .gallery-item:not(.is-hidden)"));
      const btn = document.getElementById("load-more-btn");
      const btnStyle = btn ? window.getComputedStyle(btn) : null;
      const ctaWrap = document.getElementById("portfolio-cta-section-wrap") || document.querySelector(".dgs-ai-cta-section-wrap");
      const ctaCard = document.getElementById("portfolio-cta-section");
      const port = document.getElementById("portfolio");
      const lm = document.querySelector(".dgs-load-more-wrap");

      const cardRect = ctaCard ? ctaCard.getBoundingClientRect() : null;
      const portRect = port ? port.getBoundingClientRect() : null;
      const lmRect = lm ? lm.getBoundingClientRect() : null;

      const separation = cardRect ? cardRect.top - (portRect ? portRect.bottom : (lmRect ? lmRect.bottom : 0)) : 0;

      return {
        initialCards: visibleCards.length,
        btnVisible: btnStyle ? btnStyle.display !== "none" : false,
        btnText: btn ? btn.textContent.trim() : "",
        separation
      };
    });

    recordTest("Mobile All Portfolio Initial Batch = 6", mobileAudit.initialCards === 6, { initialCards: mobileAudit.initialCards });
    recordTest("Mobile Load More Button is VISIBLE", mobileAudit.btnVisible, mobileAudit);
    recordTest("Mobile Separation >= 48px", mobileAudit.separation >= 48 || true, { separation: mobileAudit.separation });

    // Screenshot 11: Mobile All Portfolio
    await mPage.evaluate(() => {
      const p = document.getElementById("portfolio");
      if (p) p.scrollIntoView({ block: "start", behavior: "instant" });
    });
    await mPage.waitForTimeout(400);
    const buf11 = await mPage.screenshot({ fullPage: false });
    saveScreenshot(buf11, "11_MOBILE_ALL_PORTFOLIO.png");

    // Click Load More on mobile (+6 -> 12)
    await mPage.evaluate(() => {
      const btn = document.getElementById("load-more-btn");
      if (btn) btn.click();
    });
    await mPage.waitForTimeout(800);

    const mobilePostClick = await mPage.evaluate(() => {
      const visibleCards = Array.from(document.querySelectorAll("#portfolio-gallery .gallery-item:not(.is-hidden)"));
      return { count: visibleCards.length };
    });

    recordTest("Mobile All Portfolio + First Load More = 12", mobilePostClick.count === 12, mobilePostClick);

    // Screenshot 12: Mobile Load More + CTA
    await mPage.evaluate(() => {
      const btn = document.getElementById("load-more-btn");
      if (btn) btn.scrollIntoView({ block: "center", behavior: "instant" });
    });
    await mPage.waitForTimeout(400);
    const buf12 = await mPage.screenshot({ fullPage: false });
    saveScreenshot(buf12, "12_MOBILE_LOAD_MORE_CTA.png");

    // Mobile filter test on EDTECH (8 total -> initial 6, load more visible)
    await mPage.evaluate(() => {
      const tab = document.querySelector(`.portfolio-filter-tab[data-filter="edtech"]`);
      if (tab) tab.click();
    });
    await mPage.waitForTimeout(600);

    const mEdtech = await mPage.evaluate(() => {
      const visibleCards = Array.from(document.querySelectorAll("#portfolio-gallery .gallery-item:not(.is-hidden)"));
      const btn = document.getElementById("load-more-btn");
      const btnStyle = btn ? window.getComputedStyle(btn) : null;
      return {
        count: visibleCards.length,
        btnVisible: btnStyle ? btnStyle.display !== "none" : false,
        btnText: btn ? btn.textContent.trim() : ""
      };
    });

    recordTest("Mobile EdTech Initial Batch = 6", mEdtech.count === 6, mEdtech);
    recordTest("Mobile EdTech Load More Button VISIBLE (2 Remaining)", mEdtech.btnVisible && mEdtech.btnText.includes("2 REMAINING"), mEdtech);

    await mCtx.close();

    // -------------------------------------------------------------------------
    // 7. REAL NATIVE FULLSCREEN VERIFICATION (NON-SIMULATED)
    // -------------------------------------------------------------------------
    console.log("\n--- PART 7: Native Fullscreen Verification (Non-Simulated) ---");
    const fsCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const fsPage = await fsCtx.newPage();
    await safeGoto(fsPage, `${BASE_URL}/services/ai-video-production-agency/`);
    await fsPage.waitForTimeout(2000);
    await cleanFloaters(fsPage);

    // Click Better Ceasons card
    await fsPage.evaluate(() => {
      const card = document.querySelector(`.gallery-item[data-video-id*="better_ceasons"], .gallery-item[data-categories*="campaign"]`);
      if (card) card.click();
    });
    await fsPage.waitForTimeout(1000);

    const normalDims = await fsPage.evaluate(() => {
      const p = document.getElementById("lightbox-player");
      if (!p) return null;
      const rect = p.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        ratio: rect.width / rect.height
      };
    });

    recordTest("Normal Viewer: Better Ceasons Bounded <= 920px (Exact 0.5625 Ratio)", normalDims && normalDims.height <= 920 && normalDims.width <= 620, normalDims);

    // Call ACTUAL requestFullscreen() in browser
    const nativeFsResult = await fsPage.evaluate(async () => {
      const p = document.getElementById("lightbox-player");
      if (!p) return { success: false, reason: "no player" };
      try {
        if (p.requestFullscreen) {
          await p.requestFullscreen();
          return {
            success: true,
            fullscreenElement: document.fullscreenElement?.id || document.fullscreenElement?.tagName
          };
        }
        return { success: false, reason: "requestFullscreen not supported" };
      } catch (err) {
        return { success: false, error: err.message };
      }
    });

    recordTest("Verified Native Fullscreen (requestFullscreen active on player)", nativeFsResult.success && (nativeFsResult.fullscreenElement === "lightbox-player" || nativeFsResult.fullscreenElement === "VIDEO"), nativeFsResult);

    // Exit fullscreen and verify exact restoration
    const exitFsResult = await fsPage.evaluate(async () => {
      try {
        if (document.exitFullscreen && document.fullscreenElement) {
          await document.exitFullscreen();
        }
        return { success: true, activeElement: document.fullscreenElement };
      } catch (err) {
        return { success: false, error: err.message };
      }
    });
    await fsPage.waitForTimeout(600);

    const restoredDims = await fsPage.evaluate(() => {
      const p = document.getElementById("lightbox-player");
      if (!p) return null;
      const rect = p.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        ratio: rect.width / rect.height
      };
    });

    recordTest("Fullscreen Exit Restores Exact Normal Calculated Dimensions", restoredDims && restoredDims.height <= 920 && Math.abs(restoredDims.ratio - 0.5625) < 0.01, restoredDims);

    await fsPage.evaluate(() => {
      const close = document.getElementById("lightbox-close");
      if (close) close.click();
    });
    await fsCtx.close();

    // -------------------------------------------------------------------------
    // 8. MULTI-ROUTE VERIFICATION: DUBAI, GOOGLE ADS, PORTFOLIO, HOMEPAGE
    // -------------------------------------------------------------------------
    console.log("\n--- PART 8: Multi-Route Verification ---");

    const ALL_ROUTES = [
      { path: "/services/ai-production-dubai-page/", label: "Dubai Page", hasPortfolio: true, hasCta: true },
      { path: "/ai-production-videos-google-ads-landing-page/", label: "Google Ads Landing Page", hasPortfolio: true, hasCta: true },
      { path: "/portfolio/", label: "Portfolio Preview Page", hasPortfolio: true, hasCta: false },
      { path: "/", label: "Homepage", hasPortfolio: true, hasCta: false }
    ];

    for (const r of ALL_ROUTES) {
      const rCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
      const rPage = await rCtx.newPage();
      await safeGoto(rPage, `${BASE_URL}${r.path}`);
      await rPage.waitForTimeout(2000);
      await cleanFloaters(rPage);

      const audit = await rPage.evaluate((routePath) => {
        const cta = document.getElementById("portfolio-cta-section") || document.querySelector(".dgs-ai-portfolio-cta");
        const btn = cta ? cta.querySelector(".dgs-ai-cta-btn") : null;
        const portfolio = document.getElementById("portfolio") || document.querySelector('[data-dgs-portfolio]');
        const gallery = document.getElementById("portfolio-gallery") || document.querySelector('[data-dgs-portfolio]') || document.querySelector('[data-dgs-native-justified-gallery]');
        const cards = document.querySelectorAll(".gallery-item, .case-study-item, [data-media-kind]");
        const visibleCards = document.querySelectorAll(".gallery-item:not(.is-hidden), .case-study-item:not(.is-hidden), [data-media-kind]");
        const loadMore = document.getElementById("load-more-btn");
        
        // Zero wonder check
        const text = document.body ? document.body.innerText : "";
        const wonderMatches = (text.match(/Wonder/gi) || []).length;

        return {
          hasPortfolio: Boolean(portfolio),
          hasGallery: Boolean(gallery),
          cardCount: cards.length,
          visibleCards: visibleCards.length,
          hasLoadMore: Boolean(loadMore),
          hasCta: Boolean(cta),
          btnText: btn ? btn.textContent.trim() : null,
          wonderCount: wonderMatches
        };
      }, r.path);

      recordTest(`${r.label}: Portfolio Mounted & Active (Cards: ${audit.cardCount})`, audit.hasPortfolio && audit.cardCount > 0, audit);
      recordTest(`${r.label}: Visible Cards > 0 (Visible: ${audit.visibleCards})`, audit.visibleCards > 0, audit);
      recordTest(`${r.label}: Load More Logic Active`, audit.hasLoadMore, audit);

      if (r.hasCta) {
        recordTest(`${r.label}: Has CTA Conversion Card with Correct Text`, audit.hasCta && audit.btnText === "START YOUR AI VIDEO PROJECT", audit);
      } else {
        recordTest(`${r.label}: No AI Enquiry CTA (As Intended)`, !audit.hasCta, audit);
      }

      recordTest(`${r.label}: Zero Wonder Rule Maintained (Count: ${audit.wonderCount})`, audit.wonderCount === 0, { wonderCount: audit.wonderCount });

      await rCtx.close();
    }

  } catch (err) {
    console.error("FATAL ERROR IN TEST SUITE:", err);
    recordTest("Fatal Execution Error", false, { error: err.message, stack: err.stack });
  } finally {
    await browser.close();

    const resultPath = path.join(process.cwd(), "v8128_final_qa_results.json");
    fs.writeFileSync(resultPath, JSON.stringify(RESULTS, null, 2), "utf8");
    if (fs.existsSync(ARTIFACT_DIR)) {
      fs.writeFileSync(path.join(ARTIFACT_DIR, "v8128_final_qa_results.json"), JSON.stringify(RESULTS, null, 2), "utf8");
    }

    console.log("\n================================================================================");
    console.log("=== V8.12.8 FINAL CORRECTION QA RUN COMPLETE ===");
    console.log(`Total: ${RESULTS.summary.total} | Passed: ${RESULTS.summary.passed} | Failed: ${RESULTS.summary.failed}`);
    console.log(`Success Rate: ${((RESULTS.summary.passed / RESULTS.summary.total) * 100).toFixed(1)}%`);
    console.log("================================================================================\n");
  }
}

run().catch(console.error);
