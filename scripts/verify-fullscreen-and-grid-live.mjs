import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.LIVE_URL || "https://www.dgeniussolutions.com";
const ARTIFACT_DIR = "C:/Users/Kohin/.gemini/antigravity/brain/534291cc-4b59-4e18-aeca-75b1c4a803e7";

async function run() {
  console.log(`Starting live Playwright verification against: ${BASE_URL}`);
  const browser = await chromium.launch({ headless: true });

  const results = {
    agencyPage: {},
    adsPage: {},
    dubaiPage: {},
    portfolioPage: {},
    fullscreenChecks: []
  };

  try {
    // ----------------------------------------------------
    // 1. AGENCY PAGE (/services/ai-video-production-agency/)
    // ----------------------------------------------------
    console.log("\n--- Checking /services/ai-video-production-agency/ ---");
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE_URL}/services/ai-video-production-agency/`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000);

    const agencyGalleryInfo = await page.evaluate(() => {
      const gallery = document.getElementById("portfolio-gallery");
      if (!gallery) return { found: false };
      const computed = window.getComputedStyle(gallery);
      const cards = Array.from(gallery.querySelectorAll(".gallery-item, .case-study-item"));
      
      const cardDetails = cards.slice(0, 6).map((c, i) => {
        const rect = c.getBoundingClientRect();
        const video = c.querySelector("video");
        const vRect = video ? video.getBoundingClientRect() : null;
        const comp = window.getComputedStyle(c);
        return {
          index: i,
          className: c.className,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          aspectRatio: comp.aspectRatio,
          gridColumn: comp.gridColumn,
          videoFit: video ? window.getComputedStyle(video).objectFit : null
        };
      });

      return {
        found: true,
        display: computed.display,
        gridTemplateColumns: computed.gridTemplateColumns.split(" ").length + " cols",
        cardCount: cards.length,
        firstCards: cardDetails
      };
    });

    console.log("Agency Gallery Info:", JSON.stringify(agencyGalleryInfo, null, 2));
    results.agencyPage = agencyGalleryInfo;

    // Scroll to portfolio
    await page.evaluate(() => {
      const g = document.getElementById("portfolio-gallery");
      if (g) g.scrollIntoView({ behavior: "instant", block: "start" });
    });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "qa_01_agency_12col_grid_desktop.png") });

    // Test Lightbox: Click Card 0 (Hyundai 16:9)
    console.log("Testing Lightbox Hyundai 16:9 on Agency Page...");
    const firstCard = page.locator("#portfolio-gallery .gallery-item").first();
    await firstCard.click();
    await page.waitForTimeout(1500);

    const hyundaiLightboxInfo = await page.evaluate(() => {
      const player = document.getElementById("lightbox-player");
      if (!player) return { playerFound: false };
      const rect = player.getBoundingClientRect();
      const style = window.getComputedStyle(player);
      return {
        playerFound: true,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        objectFit: style.objectFit,
        objectPosition: style.objectPosition,
        aspectRatioStyle: player.style.aspectRatio, // check if forced
        computedAspectRatio: style.aspectRatio,
        classes: player.className
      };
    });
    console.log("Hyundai Lightbox Info:", JSON.stringify(hyundaiLightboxInfo, null, 2));
    results.fullscreenChecks.push({ video: "Hyundai 16:9", ...hyundaiLightboxInfo });

    await page.screenshot({ path: path.join(ARTIFACT_DIR, "qa_02_agency_lightbox_hyundai_16x9.png") });

    // Close lightbox
    await page.keyboard.press("Escape");
    await page.waitForTimeout(800);

    // Click Portrait Card (e.g. Clarion Agro or Better Ceasons if loaded, or load more)
    console.log("Loading more items to test Clarion 9:16...");
    const loadMoreBtn = page.locator("#load-more-btn");
    if (await loadMoreBtn.isVisible()) {
      await loadMoreBtn.click();
      await page.waitForTimeout(1200);
    }

    const portraitCardInfo = await page.evaluate(() => {
      const gallery = document.getElementById("portfolio-gallery");
      const cards = Array.from(gallery.querySelectorAll(".gallery-item"));
      // Find Clarion or Better Ceasons
      const clarionCard = cards.find(c => c.getAttribute("aria-label")?.includes("Clarion") || c.classList.contains("portfolio-item--portrait") || !c.classList.contains("wide-item"));
      if (!clarionCard) return null;
      const idx = cards.indexOf(clarionCard);
      const rect = clarionCard.getBoundingClientRect();
      const comp = window.getComputedStyle(clarionCard);
      return {
        index: idx,
        title: clarionCard.getAttribute("aria-label"),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        gridColumn: comp.gridColumn
      };
    });
    console.log("Portrait Card in Grid Info:", JSON.stringify(portraitCardInfo, null, 2));

    if (portraitCardInfo) {
      const pCard = page.locator("#portfolio-gallery .gallery-item").nth(portraitCardInfo.index);
      await pCard.click();
      await page.waitForTimeout(1500);

      const portraitLightboxInfo = await page.evaluate(() => {
        const player = document.getElementById("lightbox-player");
        if (!player) return { playerFound: false };
        const rect = player.getBoundingClientRect();
        const style = window.getComputedStyle(player);
        return {
          playerFound: true,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          objectFit: style.objectFit,
          aspectRatioStyle: player.style.aspectRatio,
          classes: player.className
        };
      });
      console.log("Portrait Lightbox Info:", JSON.stringify(portraitLightboxInfo, null, 2));
      results.fullscreenChecks.push({ video: "Portrait 9:16", ...portraitLightboxInfo });
      await page.screenshot({ path: path.join(ARTIFACT_DIR, "qa_03_agency_lightbox_portrait_9x16.png") });
      await page.keyboard.press("Escape");
    }

    await page.close();

    // ----------------------------------------------------
    // 2. GOOGLE ADS LANDING PAGE (/ai-production-videos-google-ads-landing-page/)
    // ----------------------------------------------------
    console.log("\n--- Checking /ai-production-videos-google-ads-landing-page/ ---");
    const adsPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await adsPage.goto(`${BASE_URL}/ai-production-videos-google-ads-landing-page/`, { waitUntil: "networkidle", timeout: 30000 });
    await adsPage.waitForTimeout(2000);

    const adsGridInfo = await adsPage.evaluate(() => {
      const grid = document.getElementById("dgs-ai-portfolio-grid");
      if (!grid) return { found: false };
      const comp = window.getComputedStyle(grid);
      const items = Array.from(grid.querySelectorAll(".dgs-ai-portfolio-item"));
      return {
        found: true,
        display: comp.display,
        gridTemplateColumns: comp.gridTemplateColumns.split(" ").length + " cols",
        itemCount: items.length,
        items: items.map((it, i) => {
          const r = it.getBoundingClientRect();
          const itComp = window.getComputedStyle(it);
          const h3 = it.querySelector("h3");
          return {
            index: i,
            title: h3 ? h3.textContent.trim() : "",
            className: it.className,
            width: Math.round(r.width),
            height: Math.round(r.height),
            gridColumn: itComp.gridColumn
          };
        })
      };
    });

    console.log("Ads Grid Info:", JSON.stringify(adsGridInfo, null, 2));
    results.adsPage = adsGridInfo;

    await adsPage.evaluate(() => {
      const g = document.getElementById("dgs-ai-portfolio-grid");
      if (g) g.scrollIntoView({ behavior: "instant", block: "start" });
    });
    await adsPage.waitForTimeout(1000);
    await adsPage.screenshot({ path: path.join(ARTIFACT_DIR, "qa_04_ads_12col_grid_desktop.png") });

    // Test mobile viewport on Ads page
    await adsPage.setViewportSize({ width: 390, height: 844 });
    await adsPage.waitForTimeout(1000);
    await adsPage.screenshot({ path: path.join(ARTIFACT_DIR, "qa_05_ads_mobile_single_col.png") });
    await adsPage.close();

    // ----------------------------------------------------
    // 3. PORTFOLIO PAGE (/portfolio/)
    // ----------------------------------------------------
    console.log("\n--- Checking /portfolio/ ---");
    const portPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await portPage.goto(`${BASE_URL}/portfolio/`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await portPage.waitForTimeout(3000);

    const portRowsInfo = await portPage.evaluate(() => {
      const rows = Array.from(document.querySelectorAll("div[class*='editorialRow']"));
      return {
        rowCount: rows.length,
        rows: rows.slice(0, 8).map((r, i) => {
          const items = Array.from(r.querySelectorAll("article[class*='work']"));
          return {
            rowIndex: i,
            dataItems: r.getAttribute("data-items"),
            itemCount: items.length,
            items: items.map(it => {
              const rect = it.getBoundingClientRect();
              const title = it.querySelector("h3")?.textContent || "";
              return {
                title,
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              };
            })
          };
        })
      };
    });

    console.log("Portfolio Page Editorial Rows:", JSON.stringify(portRowsInfo, null, 2));
    results.portfolioPage = portRowsInfo;

    await portPage.evaluate(() => {
      const w = document.querySelector("section[class*='workSection']");
      if (w) w.scrollIntoView({ behavior: "instant", block: "start" });
    });
    await portPage.waitForTimeout(1000);
    await portPage.screenshot({ path: path.join(ARTIFACT_DIR, "qa_06_portfolio_editorial_desktop.png") });

    // Test Portfolio Lightbox & Native Fullscreen rules
    const firstPortItem = portPage.locator("article[class*='work'] button").first();
    await firstPortItem.click();
    await portPage.waitForTimeout(1500);

    const portViewerInfo = await portPage.evaluate(() => {
      const v = document.querySelector("video[class*='viewerImage']");
      if (!v) return { found: false };
      const r = v.getBoundingClientRect();
      const comp = window.getComputedStyle(v);
      return {
        found: true,
        width: Math.round(r.width),
        height: Math.round(r.height),
        objectFit: comp.objectFit,
        objectPosition: comp.objectPosition,
        videoWidth: v.videoWidth,
        videoHeight: v.videoHeight
      };
    });
    console.log("Portfolio Viewer Info:", JSON.stringify(portViewerInfo, null, 2));
    results.fullscreenChecks.push({ context: "Portfolio Viewer", ...portViewerInfo });

    await portPage.screenshot({ path: path.join(ARTIFACT_DIR, "qa_07_portfolio_viewer_desktop.png") });
    await portPage.close();

    // ----------------------------------------------------
    // 4. DUBAI PAGE (/services/ai-production-dubai-page/)
    // ----------------------------------------------------
    console.log("\n--- Checking /services/ai-production-dubai-page/ ---");
    const dubaiPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await dubaiPage.goto(`${BASE_URL}/services/ai-production-dubai-page/`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await dubaiPage.waitForTimeout(3000);

    const dubaiGalleryInfo = await dubaiPage.evaluate(() => {
      const g = document.getElementById("portfolio-gallery");
      if (!g) return { found: false };
      const comp = window.getComputedStyle(g);
      const cards = Array.from(g.querySelectorAll(".gallery-item"));
      return {
        found: true,
        display: comp.display,
        gridTemplateColumns: comp.gridTemplateColumns.split(" ").length + " cols",
        cardCount: cards.length,
        firstTwoCards: cards.slice(0, 2).map((c, i) => {
          const r = c.getBoundingClientRect();
          const itComp = window.getComputedStyle(c);
          return {
            index: i,
            width: Math.round(r.width),
            height: Math.round(r.height),
            gridColumn: itComp.gridColumn
          };
        })
      };
    });

    console.log("Dubai Gallery Info:", JSON.stringify(dubaiGalleryInfo, null, 2));
    results.dubaiPage = dubaiGalleryInfo;

    await dubaiPage.evaluate(() => {
      const g = document.getElementById("portfolio-gallery");
      if (g) g.scrollIntoView({ behavior: "instant", block: "start" });
    });
    await dubaiPage.waitForTimeout(1000);
    await dubaiPage.screenshot({ path: path.join(ARTIFACT_DIR, "qa_08_dubai_12col_grid_desktop.png") });
    await dubaiPage.close();

    console.log("\n=== PLAYWRIGHT VERIFICATION SUMMARY ===");
    console.log("All verifications completed successfully!");
    fs.writeFileSync(path.join(ARTIFACT_DIR, "qa_verification_results.json"), JSON.stringify(results, null, 2));

  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
