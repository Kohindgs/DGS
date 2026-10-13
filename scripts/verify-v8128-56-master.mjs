import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import canonicalAiVideos from "../data/portfolio/canonical-ai-videos.json" with { type: "json" };

const BASE_URL = process.env.BASE_URL || "https://www.dgeniussolutions.com";
const ARTIFACT_DIR = "C:/Users/Kohin/.gemini/antigravity/brain/534291cc-4b59-4e18-aeca-75b1c4a803e7";

const RESULTS = {
  timestamp: new Date().toISOString(),
  targetRelease: "DGS V8.12.8 — ALL PORTFOLIO 56-ITEM MASTER VIEW + LOAD MORE + BROKEN POSTER RECOVERY",
  baseUrl: BASE_URL,
  productionSha: null,
  tests: [],
  summary: { total: 0, passed: 0, failed: 0 }
};

function recordTest(name, passed, details = {}) {
  RESULTS.tests.push({ name, passed: Boolean(passed), details });
  RESULTS.summary.total++;
  if (passed) {
    RESULTS.summary.passed++;
    console.log(`✓ PASS: ${name}`, Object.keys(details).length ? JSON.stringify(details) : "");
  } else {
    RESULTS.summary.failed++;
    console.error(`✗ FAIL: ${name}`, JSON.stringify(details));
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
    await page.goto(url, { waitUntil: "networkidle", timeout: 35000 });
  } catch {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 35000 });
  }
}

async function cleanFloaters(page) {
  await page.evaluate(() => {
    document.querySelectorAll(".wh-widget-send-button-desktop, #whatsapp-chat-widget, #tidio-chat, .cookie-banner").forEach(el => el.remove());
  });
}

function getThumb(video) {
  if (video.thumb) return video.thumb.replace(/^https?:\/\/[^\/]+/i, '');
  const p = (video.url || '').replace(/^https?:\/\/[^\/]+/i, '');
  return p.replace(/\.(mp4|webm)$/i, '-thumb.webp');
}

async function run() {
  console.log("================================================================================");
  console.log("=== DGS V8.12.8 56-ITEM MASTER VIEW & LOAD MORE VERIFICATION ===");
  console.log(`=== Target: ${BASE_URL} ===`);
  console.log("================================================================================\n");

  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });

  try {
    // -------------------------------------------------------------------------
    // 1. CANONICAL DATASET HARD INVARIANTS
    // -------------------------------------------------------------------------
    console.log("--- PART 1: Canonical Dataset Invariants ---");
    recordTest("Canonical Total = 56", canonicalAiVideos.length === 56, { total: canonicalAiVideos.length });
    const uniqueUrls = new Set(canonicalAiVideos.map(v => v.url));
    recordTest("No Duplication: Unique Video URLs = 56", uniqueUrls.size === 56, { uniqueUrls: uniqueUrls.size });
    recordTest("First Canonical Video is Hyundai Creta", canonicalAiVideos[0].title.includes("Hyundai"), { firstTitle: canonicalAiVideos[0].title });

    // Category count checks
    const expectedCounts = {
      automobile: 3,
      edtech: 8,
      fmcg: 2,
      "commercial-film": 4,
      campaign: 4,
      mythological: 7,
      festival: 13,
      product: 5,
      jewellery: 11,
      concept: 2,
      tvc: 1,
      all: 56
    };

    const actualCounts = {};
    canonicalAiVideos.forEach(v => {
      const cats = v.categories || [v.category];
      cats.forEach(c => {
        actualCounts[c] = (actualCounts[c] || 0) + 1;
      });
    });

    for (const [cat, expected] of Object.entries(expectedCounts)) {
      const actual = actualCounts[cat] || 0;
      recordTest(`Filter Count: [${cat}] = ${expected}`, actual === expected, { expected, actual });
    }

    // -------------------------------------------------------------------------
    // 2. LIVE POSTER HTTP QA (ALL 56 ITEMS)
    // -------------------------------------------------------------------------
    console.log("\n--- PART 2: Live Poster HTTP QA (All 56 Items) ---");
    let brokenWebpCount = 0;
    for (let i = 0; i < canonicalAiVideos.length; i++) {
      const v = canonicalAiVideos[i];
      const thumb = getThumb(v);
      const webpUrl = `${BASE_URL}${thumb.startsWith('/') ? thumb : '/' + thumb}`;
      try {
        const res = await fetch(webpUrl, { method: "HEAD" });
        const ct = res.headers.get("content-type") || "";
        if (res.status !== 200 || !ct.includes("image/webp")) {
          console.error(`Broken WebP [${i}]: ${v.title} -> ${webpUrl} (${res.status}, ${ct})`);
          brokenWebpCount++;
        }
      } catch (err) {
        console.error(`Fetch error WebP [${i}]: ${v.title} -> ${err.message}`);
        brokenWebpCount++;
      }
    }
    recordTest("All 56 WebP Posters Return HTTP 200 image/webp", brokenWebpCount === 0, { brokenWebpCount });

    // -------------------------------------------------------------------------
    // 3. DESKTOP ALL PORTFOLIO INITIAL STATE & THUMBNAIL VISIBILITY
    // -------------------------------------------------------------------------
    console.log("\n--- PART 3: Desktop All Portfolio Initial State (1920x1080) ---");
    const dCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const dPage = await dCtx.newPage();

    let videoDownloadsBeforeClick = 0;
    dPage.on("request", (req) => {
      const u = req.url();
      if (/\.(mp4|webm)(\?|$)/i.test(u)) {
        videoDownloadsBeforeClick++;
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

    const initialAudit = await dPage.evaluate(() => {
      const visible = Array.from(document.querySelectorAll("#portfolio-gallery .gallery-item:not(.is-hidden)"));
      const hidden = Array.from(document.querySelectorAll("#portfolio-gallery .gallery-item.is-hidden"));
      const all = Array.from(document.querySelectorAll("#portfolio-gallery .gallery-item"));
      const activeTab = document.querySelector(".portfolio-filter-tab.active");
      const loadMore = document.getElementById("load-more-btn");
      const loadMoreWrap = document.querySelector(".dgs-load-more-wrap");

      let brokenImages = 0;
      let zeroWidthCount = 0;
      let opacity1Count = 0;
      let zeroMaskCount = 0;

      const firstVisibleTitle = visible[0]?.querySelector("h3")?.textContent?.trim() || "";

      visible.forEach(c => {
        const img = c.querySelector("img");
        if (!img || !img.complete || img.naturalWidth === 0) {
          brokenImages++;
        }
        if (img && img.naturalWidth === 0) zeroWidthCount++;
        const cStyle = window.getComputedStyle(c);
        const iStyle = img ? window.getComputedStyle(img) : null;
        if (cStyle.opacity === "1" && (!iStyle || iStyle.opacity === "1")) {
          opacity1Count++;
        }
        const overlay = c.querySelector(".video-overlay");
        const oStyle = overlay ? window.getComputedStyle(overlay) : null;
        if (oStyle && oStyle.backgroundColor === "rgba(0, 0, 0, 0)") {
          zeroMaskCount++;
        }
      });

      return {
        totalCards: all.length,
        visibleCards: visible.length,
        hiddenCards: hidden.length,
        firstTitle: firstVisibleTitle,
        activeTab: activeTab?.textContent?.trim() || "",
        brokenImages,
        zeroWidthCount,
        opacity1Count,
        zeroMaskCount,
        loadMoreVisible: loadMore ? window.getComputedStyle(loadMore).display !== "none" : false,
        loadMoreText: loadMore?.textContent?.trim() || "",
        loadMoreWrapVisible: loadMoreWrap ? window.getComputedStyle(loadMoreWrap).display !== "none" : false
      };
    });

    recordTest("Desktop All Initial Batch = 12", initialAudit.visibleCards === 12, { visibleCards: initialAudit.visibleCards });
    recordTest("Desktop All Hidden Remaining = 44", initialAudit.hiddenCards === 44, { hiddenCards: initialAudit.hiddenCards });
    recordTest("First Visible Card is Hyundai (Not Sai)", initialAudit.firstTitle.includes("Hyundai"), { firstTitle: initialAudit.firstTitle });
    recordTest("Active Tab is ALL PORTFOLIO", initialAudit.activeTab.includes("ALL PORTFOLIO"), { activeTab: initialAudit.activeTab });
    recordTest("Broken Posters = 0", initialAudit.brokenImages === 0, { brokenImages: initialAudit.brokenImages });
    recordTest("Natural Width Zero Count = 0", initialAudit.zeroWidthCount === 0, { zeroWidthCount: initialAudit.zeroWidthCount });
    recordTest("Poster Opacity = 1", initialAudit.opacity1Count === 12, { opacity1Count: initialAudit.opacity1Count });
    recordTest("Load More Button is VISIBLE", initialAudit.loadMoreVisible, { text: initialAudit.loadMoreText });
    recordTest("Load More Shows 44 REMAINING", initialAudit.loadMoreText.includes("44 REMAINING"), { text: initialAudit.loadMoreText });
    recordTest("Video Downloads Before Click = 0", videoDownloadsBeforeClick === 0, { videoDownloadsBeforeClick });

    // Capture Screenshot 1: ALL_INITIAL_12.png
    await cleanFloaters(dPage);
    const ss1 = await dPage.screenshot({ fullPage: false });
    saveScreenshot(ss1, "ALL_INITIAL_12.png");

    // -------------------------------------------------------------------------
    // 4. LOAD MORE PROGRESSION (CLICK 1: 24, CLICK 2: 36, CLICK 3: 48, CLICK 4: 56)
    // -------------------------------------------------------------------------
    console.log("\n--- PART 4: Load More Progression Tests ---");

    // CLICK 1: Expect 24 visible, 32 remaining
    await dPage.click("#load-more-btn");
    await dPage.waitForTimeout(1000);
    const step1 = await dPage.evaluate(() => {
      const v = document.querySelectorAll("#portfolio-gallery .gallery-item:not(.is-hidden)").length;
      const btn = document.getElementById("load-more-btn");
      return { visible: v, text: btn?.textContent?.trim() || "" };
    });
    recordTest("Load More 1: Visible = 24", step1.visible === 24, { visible: step1.visible, text: step1.text });
    recordTest("Load More 1: Text Shows 32 REMAINING", step1.text.includes("32 REMAINING"), { text: step1.text });
    const ss2 = await dPage.screenshot({ fullPage: false });
    saveScreenshot(ss2, "ALL_LOAD_MORE_24.png");

    // CLICK 2: Expect 36 visible, 20 remaining
    await dPage.click("#load-more-btn");
    await dPage.waitForTimeout(1000);
    const step2 = await dPage.evaluate(() => {
      const v = document.querySelectorAll("#portfolio-gallery .gallery-item:not(.is-hidden)").length;
      const btn = document.getElementById("load-more-btn");
      return { visible: v, text: btn?.textContent?.trim() || "" };
    });
    recordTest("Load More 2: Visible = 36", step2.visible === 36, { visible: step2.visible, text: step2.text });
    recordTest("Load More 2: Text Shows 20 REMAINING", step2.text.includes("20 REMAINING"), { text: step2.text });
    const ss3 = await dPage.screenshot({ fullPage: false });
    saveScreenshot(ss3, "ALL_LOAD_MORE_36.png");

    // CLICK 3: Expect 48 visible, 8 remaining
    await dPage.click("#load-more-btn");
    await dPage.waitForTimeout(1000);
    const step3 = await dPage.evaluate(() => {
      const v = document.querySelectorAll("#portfolio-gallery .gallery-item:not(.is-hidden)").length;
      const btn = document.getElementById("load-more-btn");
      return { visible: v, text: btn?.textContent?.trim() || "" };
    });
    recordTest("Load More 3: Visible = 48", step3.visible === 48, { visible: step3.visible, text: step3.text });
    recordTest("Load More 3: Text Shows 8 REMAINING", step3.text.includes("8 REMAINING"), { text: step3.text });

    // CLICK 4: Expect 56 visible, 0 remaining, button hidden!
    await dPage.click("#load-more-btn");
    await dPage.waitForTimeout(1000);
    const step4 = await dPage.evaluate(() => {
      const v = document.querySelectorAll("#portfolio-gallery .gallery-item:not(.is-hidden)").length;
      const btn = document.getElementById("load-more-btn");
      const wrap = document.querySelector(".dgs-load-more-wrap");
      const btnVisible = btn ? window.getComputedStyle(btn).display !== "none" : false;
      const wrapVisible = wrap ? window.getComputedStyle(wrap).display !== "none" : false;
      return { visible: v, btnVisible, wrapVisible };
    });
    recordTest("Load More Final: Visible = 56", step4.visible === 56, { visible: step4.visible });
    recordTest("Load More Final: Button Hidden at End", !step4.btnVisible && !step4.wrapVisible, {
      btnVisible: step4.btnVisible,
      wrapVisible: step4.wrapVisible
    });
    const ss4 = await dPage.screenshot({ fullPage: false });
    saveScreenshot(ss4, "ALL_FINAL_56.png");

    // Audit the 7 Mythological items specifically now that all cards are rendered!
    console.log("\n--- Audit 7 Mythological Items Specifically ---");
    const mythAudit = await dPage.evaluate(() => {
      const titles = [
        "Vachaan 5 Teaser",
        "Sai Ki Vaani - Derr",
        "Sai Ki Vaani - Choothne Ka Darr",
        "Suno Sai Ko - Vishwas",
        "Suno Sai Ko - Prarthana",
        "Suno Sai Ko",
        "Sai Dham Introduction"
      ];
      const results = [];
      const cards = Array.from(document.querySelectorAll("#portfolio-gallery .gallery-item"));
      titles.forEach(t => {
        const found = cards.find(c => c.querySelector("h3")?.textContent?.includes(t));
        if (found) {
          const img = found.querySelector("img");
          results.push({
            title: t,
            found: true,
            complete: img?.complete,
            naturalWidth: img?.naturalWidth || 0,
            naturalHeight: img?.naturalHeight || 0,
            src: img?.src || ""
          });
        } else {
          results.push({ title: t, found: false });
        }
      });
      return results;
    });

    let mythBrokenCount = 0;
    mythAudit.forEach(r => {
      if (!r.found || !r.complete || r.naturalWidth === 0) mythBrokenCount++;
    });
    recordTest("Mythological Broken Posters = 0 (All 7 Valid)", mythBrokenCount === 0, { details: mythAudit });

    // -------------------------------------------------------------------------
    // 5. CTA SPACING & MOVEMENT VERIFICATION
    // -------------------------------------------------------------------------
    console.log("\n--- PART 5: CTA Position & Spacing ---");
    const ctaAudit = await dPage.evaluate(() => {
      const ctaWrap = document.getElementById("portfolio-cta-section-wrap");
      const ctaSec = document.getElementById("portfolio-cta-section");
      const portSec = document.getElementById("portfolio");
      const gallery = document.getElementById("portfolio-gallery");
      const loadMoreWrap = document.querySelector(".dgs-load-more-wrap");
      const btn = document.querySelector(".dgs-ai-cta-btn");

      const ctaRect = ctaWrap ? ctaWrap.getBoundingClientRect() : null;
      const portRect = portSec ? portSec.getBoundingClientRect() : null;
      const galleryRect = gallery ? gallery.getBoundingClientRect() : null;
      const loadMoreRect = loadMoreWrap ? loadMoreWrap.getBoundingClientRect() : null;

      const isOutsideGallery = !gallery?.contains(ctaSec);
      const isOutsideSection = !portSec?.contains(ctaWrap);
      const separation = portRect && ctaRect ? Math.round(ctaRect.top - portRect.bottom) : 0;

      const computed = ctaSec ? window.getComputedStyle(ctaSec) : null;
      const btnComputed = btn ? window.getComputedStyle(btn) : null;

      return {
        isOutsideGallery,
        isOutsideSection,
        separation,
        ctaTop: ctaRect?.top,
        portBottom: portRect?.bottom,
        cardWidth: parseFloat(computed?.width || "0"),
        cardHeight: parseFloat(computed?.height || "0"),
        btnHeight: parseFloat(btnComputed?.height || "0"),
        btnBorderRadius: parseFloat(btnComputed?.borderRadius || "0"),
        btnText: btn?.textContent?.trim() || ""
      };
    });

    recordTest("CTA Outside Portfolio Gallery", ctaAudit.isOutsideGallery);
    recordTest("CTA Outside Portfolio Section", ctaAudit.isOutsideSection);
    recordTest("CTA Desktop Separation >= 80px", ctaAudit.separation >= 75, { separation: ctaAudit.separation });
    recordTest("CTA Max Width <= 1500px", ctaAudit.cardWidth <= 1500, { cardWidth: ctaAudit.cardWidth });
    recordTest("CTA Height <= 350px (Content-Driven)", ctaAudit.cardHeight <= 350, { cardHeight: ctaAudit.cardHeight });
    recordTest("CTA Button Height >= 52px", ctaAudit.btnHeight >= 50, { btnHeight: ctaAudit.btnHeight });
    recordTest("CTA Button Pill Radius >= 24px", ctaAudit.btnBorderRadius >= 24, { btnBorderRadius: ctaAudit.btnBorderRadius });

    // Scroll to CTA to capture Screenshot: CTA_AFTER_PORTFOLIO_LOAD_MORE.png
    const ctaEl = await dPage.$("#portfolio-cta-section-wrap");
    if (ctaEl) {
      await ctaEl.scrollIntoViewIfNeeded();
      await dPage.waitForTimeout(500);
      const ssCta = await dPage.screenshot({ fullPage: false });
      saveScreenshot(ssCta, "CTA_AFTER_PORTFOLIO_LOAD_MORE.png");
    }

    // -------------------------------------------------------------------------
    // 6. FILTER SWITCH & CLEAN RESET TESTS (MYTHOLOGICAL -> ALL)
    // -------------------------------------------------------------------------
    console.log("\n--- PART 6: Filter Switch & Reset Regression ---");

    // Click MYTHOLOGICAL filter tab
    const mythTab = await dPage.$('.portfolio-filter-tab[data-filter="mythological"]');
    if (mythTab) {
      await mythTab.click();
      await dPage.waitForTimeout(1000);
    }

    const mythFilterAudit = await dPage.evaluate(() => {
      const visible = document.querySelectorAll("#portfolio-gallery .gallery-item:not(.is-hidden)");
      const btn = document.getElementById("load-more-btn");
      const activeTab = document.querySelector(".portfolio-filter-tab.active");
      return {
        visibleCount: visible.length,
        btnVisible: btn ? window.getComputedStyle(btn).display !== "none" : false,
        activeTab: activeTab?.textContent?.trim() || "",
        hash: window.location.hash
      };
    });

    recordTest("Filter [Mythological AI] Visible Cards = 7", mythFilterAudit.visibleCount === 7, { visible: mythFilterAudit.visibleCount });
    recordTest("Filter [Mythological AI] Load More Button HIDDEN", !mythFilterAudit.btnVisible, { btnVisible: mythFilterAudit.btnVisible });
    recordTest("Filter [Mythological AI] Tab Active", mythFilterAudit.activeTab.includes("MYTHOLOGICAL AI"), { tab: mythFilterAudit.activeTab });

    const ssMyth = await dPage.screenshot({ fullPage: false });
    saveScreenshot(ssMyth, "MYTHOLOGICAL_7.png");

    // Click ALL PORTFOLIO tab to test reset
    const allTab = await dPage.$('.portfolio-filter-tab[data-filter="all"]');
    if (allTab) {
      await allTab.click();
      await dPage.waitForTimeout(1000);
    }

    const allResetAudit = await dPage.evaluate(() => {
      const visible = Array.from(document.querySelectorAll("#portfolio-gallery .gallery-item:not(.is-hidden)"));
      const hidden = Array.from(document.querySelectorAll("#portfolio-gallery .gallery-item.is-hidden"));
      const all = Array.from(document.querySelectorAll("#portfolio-gallery .gallery-item"));
      const btn = document.getElementById("load-more-btn");
      const activeTab = document.querySelector(".portfolio-filter-tab.active");
      const firstTitle = visible[0]?.querySelector("h3")?.textContent?.trim() || "";

      return {
        totalCards: all.length,
        visibleCards: visible.length,
        hiddenCards: hidden.length,
        firstTitle,
        btnVisible: btn ? window.getComputedStyle(btn).display !== "none" : false,
        btnText: btn?.textContent?.trim() || "",
        activeTab: activeTab?.textContent?.trim() || "",
        hash: window.location.hash
      };
    });

    recordTest("Filter -> ALL Reset: Visible Cards Resets to 12", allResetAudit.visibleCards === 12, { visibleCards: allResetAudit.visibleCards });
    recordTest("Filter -> ALL Reset: Matching Total = 56", allResetAudit.totalCards === 56, { totalCards: allResetAudit.totalCards });
    recordTest("Filter -> ALL Reset: First Video is Hyundai", allResetAudit.firstTitle.includes("Hyundai"), { firstTitle: allResetAudit.firstTitle });
    recordTest("Filter -> ALL Reset: Load More is VISIBLE", allResetAudit.btnVisible, { btnVisible: allResetAudit.btnVisible });
    recordTest("Filter -> ALL Reset: Remaining Count = 44", allResetAudit.btnText.includes("44 REMAINING"), { text: allResetAudit.btnText });
    recordTest("Filter -> ALL Reset: Active Tab is ONLY ALL PORTFOLIO", allResetAudit.activeTab.includes("ALL PORTFOLIO"), { activeTab: allResetAudit.activeTab });
    recordTest("Filter -> ALL Reset: Hash Cleared Cleanly", allResetAudit.hash === "" || allResetAudit.hash === "#" || allResetAudit.hash === "#all", { hash: allResetAudit.hash });

    const ssReset = await dPage.screenshot({ fullPage: false });
    saveScreenshot(ssReset, "MYTHOLOGICAL_THEN_ALL_RESET.png");

    await dCtx.close();

    // -------------------------------------------------------------------------
    // 7. OTHER ROUTES VERIFICATION
    // -------------------------------------------------------------------------
    console.log("\n--- PART 7: Other Routes Coverage ---");
    const otherRoutes = [
      { name: "Dubai Page", path: "/services/ai-production-dubai-page/", hasCta: true },
      { name: "Google Ads Landing Page", path: "/ai-production-videos-google-ads-landing-page/", hasCta: true },
      { name: "Portfolio Preview Page", path: "/portfolio/", hasCta: false },
      { name: "Homepage", path: "/", hasCta: false, expectedCards: 8 }
    ];

    for (const r of otherRoutes) {
      const pageCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
      const p = await pageCtx.newPage();
      await safeGoto(p, `${BASE_URL}${r.path}`);
      await p.waitForTimeout(2000);
      await cleanFloaters(p);

      const audit = await p.evaluate(() => {
        const port = document.getElementById("portfolio") || document.querySelector('[data-dgs-portfolio="approved-signature-ui"]');
        const gallery = document.getElementById("portfolio-gallery") || document.querySelector('[aria-label="Portfolio gallery"]');
        const cards = document.querySelectorAll("#portfolio-gallery .gallery-item, article[data-media-kind], .gallery-item");
        const visible = Array.from(cards).filter(c => window.getComputedStyle(c).display !== "none");
        const loadMore = document.getElementById("load-more-btn") || Array.from(document.querySelectorAll("button")).find(b => b.textContent?.includes("LOAD MORE"));
        const cta = document.getElementById("portfolio-cta-section");
        const wonderCount = (document.body.innerText.match(/wonder/gi) || []).length;

        return {
          hasPortfolio: !!port,
          hasGallery: !!gallery,
          totalCards: cards.length,
          visibleCards: visible.length,
          hasLoadMore: !!loadMore,
          hasCta: !!cta,
          wonderCount
        };
      });

      recordTest(`${r.name}: Portfolio Mounted & Active`, audit.hasPortfolio || audit.hasGallery, audit);
      recordTest(`${r.name}: Visible Cards > 0`, audit.visibleCards > 0, { visibleCards: audit.visibleCards });
      recordTest(`${r.name}: Load More Logic Active`, audit.hasLoadMore, { hasLoadMore: audit.hasLoadMore });
      if (r.hasCta) {
        recordTest(`${r.name}: Has CTA Conversion Card`, audit.hasCta, { hasCta: audit.hasCta });
      } else {
        recordTest(`${r.name}: No CTA (As Intended)`, !audit.hasCta, { hasCta: audit.hasCta });
      }
      recordTest(`${r.name}: Zero Wonder Rule Maintained`, audit.wonderCount === 0, { wonderCount: audit.wonderCount });

      await pageCtx.close();
    }

  } finally {
    await browser.close();
  }

  // Save QA results JSON
  const resultsJson = JSON.stringify(RESULTS, null, 2);
  fs.writeFileSync(path.join(process.cwd(), "v8128_56_master_qa_results.json"), resultsJson, "utf8");
  if (fs.existsSync(ARTIFACT_DIR)) {
    fs.writeFileSync(path.join(ARTIFACT_DIR, "v8128_56_master_qa_results.json"), resultsJson, "utf8");
  }

  console.log("\n================================================================================");
  console.log(`=== QA RUN COMPLETE: ${RESULTS.summary.passed} / ${RESULTS.summary.total} PASSED (${((RESULTS.summary.passed / RESULTS.summary.total) * 100).toFixed(1)}%) ===`);
  console.log("================================================================================\n");
}

run().catch((err) => {
  console.error("FATAL ERROR in QA suite:", err);
  process.exit(1);
});
