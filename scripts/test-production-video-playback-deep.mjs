import { chromium } from "playwright";

const BASE_URL = "https://www.dgeniussolutions.com";

const TEST_PAGES = [
  { name: "Homepage", url: `${BASE_URL}/` },
  { name: "AI Video Production", url: `${BASE_URL}/services/ai-video-production-agency/` },
  { name: "Dubai AI Production", url: `${BASE_URL}/services/ai-production-dubai-page/` },
  { name: "Portfolio", url: `${BASE_URL}/portfolio/` },
];

const DIRECT_URL_CHECKS = [
  // Newer /media/portfolio/videos/ path
  { name: "Hyundai Creta 1 (MP4)", url: `${BASE_URL}/media/portfolio/videos/hyundai_creta_1.mp4`, expectedMime: "video/mp4" },
  { name: "Hyundai Creta 1 (WebM)", url: `${BASE_URL}/media/portfolio/videos/hyundai_creta_1.webm`, expectedMime: "video/webm" },
  { name: "Sundaram Bal 3 1 (MP4)", url: `${BASE_URL}/media/portfolio/videos/sundaram_bal_3_1.mp4`, expectedMime: "video/mp4" },
  { name: "Sundaram Bal 3 1 (WebM)", url: `${BASE_URL}/media/portfolio/videos/sundaram_bal_3_1.webm`, expectedMime: "video/webm" },
  { name: "Clarion Jasmine Atta Hindi (MP4)", url: `${BASE_URL}/media/portfolio/videos/clarion_jasmine_atta_hindi.mp4`, expectedMime: "video/mp4" },
  { name: "Clarion Jasmine Atta Hindi (WebM)", url: `${BASE_URL}/media/portfolio/videos/clarion_jasmine_atta_hindi.webm`, expectedMime: "video/webm" },
  { name: "Better Ceasons Tenant (MP4)", url: `${BASE_URL}/media/portfolio/videos/better_ceasons_tenant.mp4`, expectedMime: "video/mp4" },
  { name: "Better Ceasons Tenant (WebM)", url: `${BASE_URL}/media/portfolio/videos/better_ceasons_tenant.webm`, expectedMime: "video/webm" },

  // Original /wp-content/uploads/ path
  { name: "Makar Sankranti & Pongal (MP4)", url: `${BASE_URL}/wp-content/uploads/2026/04/Makar-Sankranti-And-Pongal-Final-1.mp4`, expectedMime: "video/mp4" },
  { name: "Vachaan 5 Teaser (MP4)", url: `${BASE_URL}/wp-content/uploads/2026/05/Vachaan-5-Teaser.mp4`, expectedMime: "video/mp4" },
  { name: "Sai Ki Vaani Derr (MP4)", url: `${BASE_URL}/wp-content/uploads/2026/05/Sai-Ki-Vaani_Derr-1.mp4`, expectedMime: "video/mp4" },
  { name: "Home Credit Diwali (MP4)", url: `${BASE_URL}/wp-content/uploads/2026/04/Diwali-Campaign-Home-Credit11.mp4`, expectedMime: "video/mp4" },
  { name: "Savage Horse (MP4)", url: `${BASE_URL}/wp-content/uploads/2026/04/Savage-Horse11.mp4`, expectedMime: "video/mp4" },
];

async function checkDirectUrl(item) {
  const headRes = await fetch(item.url, { method: "HEAD" });
  const status200 = headRes.status;
  const contentType = headRes.headers.get("content-type") || "";
  const acceptRanges = headRes.headers.get("accept-ranges") || "";

  // Check Range request (bytes=0-1023)
  const rangeRes = await fetch(item.url, {
    method: "GET",
    headers: { Range: "bytes=0-1023" },
  });
  const status206 = rangeRes.status;
  const contentRange = rangeRes.headers.get("content-range") || "";

  const pass =
    status200 === 200 &&
    (status206 === 206 || status206 === 200) &&
    contentType.toLowerCase().includes(item.expectedMime.toLowerCase());

  return {
    name: item.name,
    url: item.url.replace(BASE_URL, ""),
    status200,
    status206,
    contentType,
    acceptRanges,
    contentRange: contentRange ? "bytes 0-1023/..." : "none",
    pass: pass ? "PASS" : "FAIL",
  };
}

async function testPageVideoPlayback(browser, pageConfig) {
  console.log(`\n======================================================`);
  console.log(`TESTING VIDEO PLAYBACK ON: ${pageConfig.name} (${pageConfig.url})`);
  console.log(`======================================================`);

  const context = await browser.newContext();
  const page = await context.newPage();

  // Monitor network requests for video errors (404, 500, etc.)
  const failedVideoRequests = [];
  page.on("response", (res) => {
    const url = res.url();
    if (url.match(/\.(mp4|webm)($|\?)/i)) {
      if (res.status() >= 400) {
        failedVideoRequests.push({ url, status: res.status() });
        console.error(`  [NET ERROR] ${res.status()} on ${url}`);
      }
    }
  });

  await page.goto(pageConfig.url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // Find portfolio cards
  const cardSelector = "button[class*='mediaButton'], .gallery-item, .portfolio-item, .elementor-portfolio-item";
  const cards = await page.$$(cardSelector);
  console.log(`  Found ${cards.length} portfolio cards on page.`);

  if (cards.length === 0) {
    console.log(`  No portfolio cards matching ${cardSelector} on this page.`);
    await context.close();
    return { name: pageConfig.name, cardsFound: 0, testStatus: "SKIP" };
  }

  // Remove floating overlays that can intercept automated clicks
  await page.evaluate(() => {
    document.getElementById("dgsTrig")?.remove();
    document.querySelector(".dgs-ai-prompt-toast")?.remove();
  });

  // Click first card (Hyundai Creta or first video)
  console.log("  Opening lightbox via first card...");
  await page.evaluate(() => {
    const card = document.querySelector("button[class*='mediaButton'], .gallery-item, .portfolio-item");
    if (card) {
      card.scrollIntoView({ block: "center" });
      card.click();
    } else if (typeof window.openLightbox === "function") {
      window.openLightbox(0);
    }
  });
  await page.waitForTimeout(2000);

  // Check lightbox and video element
  const playerStats = await page.evaluate(async () => {
    const lightbox = document.getElementById("lightbox") || document.querySelector(".portfolio-lightbox");
    const player = document.getElementById("lightbox-player") || document.querySelector("video");

    if (!player) return { error: "No video player found" };

    const sources = Array.from(player.querySelectorAll("source")).map((s) => ({
      src: s.src,
      type: s.type,
    }));

    // Wait for readyState >= 2 (up to 5s)
    let ready = player.readyState;
    if (ready < 2) {
      await new Promise((resolve) => {
        const handler = () => {
          if (player.readyState >= 2) {
            player.removeEventListener("canplay", handler);
            player.removeEventListener("loadeddata", handler);
            resolve();
          }
        };
        player.addEventListener("canplay", handler);
        player.addEventListener("loadeddata", handler);
        setTimeout(resolve, 5000);
      });
      ready = player.readyState;
    }

    // Try playing
    let playError = null;
    try {
      player.muted = true; // allow autoplay without user gesture block in test
      await player.play();
    } catch (e) {
      playError = e.message;
    }

    // Capture initial time
    const initialTime = player.currentTime;

    // Wait 1.5s
    await new Promise((r) => setTimeout(r, 1500));

    const advancedTime = player.currentTime;
    const isPlaying = !player.paused && !player.ended && advancedTime > initialTime;

    return {
      lightboxOpen: lightbox ? (lightbox.classList.contains("is-open") || lightbox.style.display === "flex") : false,
      sources,
      currentSrc: player.currentSrc,
      readyState: ready,
      initialTime,
      advancedTime,
      isPlaying,
      playError,
      videoWidth: player.videoWidth,
      videoHeight: player.videoHeight,
    };
  });

  console.log("  Playback Results for First Video:", JSON.stringify(playerStats, null, 2));

  // Test Next navigation in lightbox
  const nextBtn = await page.$("#lightbox-next, .lightbox-next");
  let nextStats = null;
  if (nextBtn) {
    console.log("  Testing Next button navigation in lightbox...");
    await page.evaluate(() => {
      const btn = document.querySelector("#lightbox-next, .lightbox-next");
      if (btn) btn.click();
      else if (typeof window.goLightbox === "function") window.goLightbox(1);
    });
    await page.waitForTimeout(2000);

    nextStats = await page.evaluate(async () => {
      const player = document.getElementById("lightbox-player") || document.querySelector("video");
      if (!player) return null;
      try {
        player.muted = true;
        await player.play();
      } catch {}
      const t1 = player.currentTime;
      await new Promise((r) => setTimeout(r, 1200));
      return {
        currentSrc: player.currentSrc,
        readyState: player.readyState,
        t1,
        t2: player.currentTime,
        advanced: player.currentTime > t1,
        videoWidth: player.videoWidth,
        videoHeight: player.videoHeight,
      };
    });
    console.log("  Next Video Playback Results:", JSON.stringify(nextStats, null, 2));
  }

  // Close lightbox
  const closeBtn = await page.$("#lightbox-close, .lightbox-close");
  if (closeBtn) {
    await page.evaluate(() => {
      const btn = document.querySelector("#lightbox-close, .lightbox-close");
      if (btn) btn.click();
      else if (typeof window.closeLightbox === "function") window.closeLightbox();
    });
    await page.waitForTimeout(500);
  }

  // Test Load More if present
  let loadMoreSuccess = false;
  const loadMoreBtn = await page.$("#load-more-btn");
  if (loadMoreBtn) {
    const isVisible = await loadMoreBtn.isVisible();
    if (isVisible) {
      const beforeCount = (await page.$$(cardSelector)).length;
      console.log(`  Testing Load More button (currently showing ${beforeCount} cards)...`);
      await page.evaluate(() => {
        const btn = document.getElementById("load-more-btn");
        if (btn) btn.click();
      });
      await page.waitForTimeout(1500);
      const afterCount = (await page.$$(cardSelector)).length;
      console.log(`  Cards after Load More: ${afterCount}`);
      loadMoreSuccess = afterCount >= beforeCount;
    }
  }

  await context.close();

  const passed =
    failedVideoRequests.length === 0 &&
    playerStats.readyState >= 2 &&
    playerStats.advancedTime > 0 &&
    playerStats.videoWidth > 0;

  return {
    name: pageConfig.name,
    cardsFound: cards.length,
    firstVideoUrl: playerStats.currentSrc ? playerStats.currentSrc.replace(BASE_URL, "") : "none",
    readyState: playerStats.readyState,
    timeAdvanced: (playerStats.advancedTime > playerStats.initialTime),
    framesRendered: (playerStats.videoWidth > 0 && playerStats.videoHeight > 0),
    netErrors: failedVideoRequests.length,
    nextNavTested: Boolean(nextStats?.advanced),
    loadMoreTested: loadMoreSuccess,
    status: passed ? "PASS" : "FAIL",
  };
}

async function main() {
  console.log("==================================================================");
  console.log("  PART 1: DIRECT VIDEO HTTP / RANGE REQUEST VERIFICATION");
  console.log("==================================================================");
  const directResults = [];
  for (const item of DIRECT_URL_CHECKS) {
    directResults.push(await checkDirectUrl(item));
  }
  console.table(directResults);

  console.log("\n==================================================================");
  console.log("  PART 2: PLAYWRIGHT BROWSER VIDEO PLAYBACK ON LIVE PRODUCTION");
  console.log("==================================================================");
  const browser = await chromium.launch({ headless: true });
  const pageResults = [];
  for (const pageConfig of TEST_PAGES) {
    pageResults.push(await testPageVideoPlayback(browser, pageConfig));
  }
  await browser.close();

  console.log("\n==================================================================");
  console.log("  PLAYWRIGHT PLAYBACK AUDIT SUMMARY");
  console.log("==================================================================");
  console.table(pageResults);
}

main().catch(console.error);
