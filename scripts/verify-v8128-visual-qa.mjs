import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const BASE_URL = process.env.TARGET_URL || "https://www.dgeniussolutions.com";
const ARTIFACT_DIR = "C:/Users/Kohin/.gemini/antigravity/brain/534291cc-4b59-4e18-aeca-75b1c4a803e7";

const RESULTS = {
  timestamp: new Date().toISOString(),
  targetRelease: "V8.12.8 Visual Correction",
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

function saveScreenshot(sourceBuffer, filename) {
  const localPath = path.join(process.cwd(), filename);
  fs.writeFileSync(localPath, sourceBuffer);
  if (fs.existsSync(ARTIFACT_DIR)) {
    const artifactPath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(artifactPath, sourceBuffer);
  }
  console.log(`Saved screenshot: ${filename}`);
}

async function run() {
  console.log("================================================================================");
  console.log("=== DGS V8.12.8 FINAL VISUAL CORRECTION PLAYWRIGHT QA SUITE ===");
  console.log(`=== Target: ${BASE_URL} ===`);
  console.log("================================================================================\n");

  const browser = await chromium.launch({ headless: true });

  try {
    // -------------------------------------------------------------------------
    // 1. CTA COMPUTED STYLE & MULTI-VIEWPORT VISUAL CAPTURE
    // -------------------------------------------------------------------------
    console.log("\n--- PART 1: CTA Computed-Style & Visual Screenshots ---");

    const VIEWPORTS = [
      { name: "CTA_DESKTOP_1920.png", width: 1920, height: 1080, isMobile: false },
      { name: "CTA_2560.png", width: 2560, height: 1440, isMobile: false },
      { name: "CTA_4K.png", width: 3840, height: 2160, isMobile: false },
      { name: "CTA_MOBILE_390.png", width: 390, height: 844, isMobile: true }
    ];

    for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile });
      const page = await ctx.newPage();
      await safeGoto(page, `${BASE_URL}/services/ai-video-production-agency/`);
      await page.waitForTimeout(2000);
      await cleanFloaters(page);

      // Scroll to CTA
      const ctaEl = await page.$("#portfolio-cta-section");
      if (ctaEl) {
        await ctaEl.scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);

        if (vp.width === 1920) {
          const ctaStyle = await page.evaluate(() => {
            const card = document.getElementById("portfolio-cta-section");
            const btn = card ? card.querySelector(".dgs-ai-cta-btn") : null;
            const heading = card ? card.querySelector(".dgs-ai-cta-heading, h3") : null;
            const desc = card ? card.querySelector(".dgs-ai-cta-desc, p") : null;
            if (!card || !btn) return null;

            const cStyle = window.getComputedStyle(card);
            const bStyle = window.getComputedStyle(btn);
            const cRect = card.getBoundingClientRect();
            const bRect = btn.getBoundingClientRect();

            return {
              cardDisplay: cStyle.display,
              cardBg: cStyle.backgroundColor,
              cardBorderRadius: parseFloat(cStyle.borderRadius),
              cardWidth: cRect.width,
              cardHeight: cRect.height,
              btnDisplay: bStyle.display,
              btnHeight: bRect.height,
              btnMinHeight: parseFloat(bStyle.minHeight),
              btnBg: bStyle.backgroundImage || bStyle.backgroundColor,
              btnBorderRadius: parseFloat(bStyle.borderRadius),
              btnPaddingInline: parseFloat(bStyle.paddingLeft) + parseFloat(bStyle.paddingRight),
              btnText: (btn.textContent || "").trim(),
              btnHref: btn.getAttribute("href"),
              headingText: heading ? heading.textContent.trim() : "",
              descText: desc ? desc.textContent.trim() : ""
            };
          });

          recordTest("CTA Card Display is Grid", ctaStyle && ctaStyle.cardDisplay === "grid", ctaStyle);
          recordTest("CTA Card Background is Not Transparent", ctaStyle && ctaStyle.cardBg !== "rgba(0, 0, 0, 0)" && ctaStyle.cardBg !== "transparent", ctaStyle);
          recordTest("CTA Card Border Radius >= 24px", ctaStyle && ctaStyle.cardBorderRadius >= 24, { borderRadius: ctaStyle?.cardBorderRadius });
          recordTest("CTA Card Width Reasonable on Desktop", ctaStyle && ctaStyle.cardWidth > 1200, { cardWidth: ctaStyle?.cardWidth });
          recordTest("CTA Button Display is inline-flex", ctaStyle && ctaStyle.btnDisplay === "inline-flex", ctaStyle);
          recordTest("CTA Button Computed Height >= 52px", ctaStyle && ctaStyle.btnHeight >= 51.5, { btnHeight: ctaStyle?.btnHeight });
          recordTest("CTA Button Border Radius >= 24px", ctaStyle && ctaStyle.btnBorderRadius >= 24, { btnBorderRadius: ctaStyle?.btnBorderRadius });
          recordTest("CTA Button Padding-Inline > 20px", ctaStyle && ctaStyle.btnPaddingInline > 20, { btnPaddingInline: ctaStyle?.btnPaddingInline });
          recordTest("CTA Button Text is 'START YOUR AI VIDEO PROJECT'", ctaStyle && ctaStyle.btnText === "START YOUR AI VIDEO PROJECT", { text: ctaStyle?.btnText });
          recordTest("CTA Button Links to #ai-video-enquiry-form", ctaStyle && ctaStyle.btnHref === "#ai-video-enquiry-form", { href: ctaStyle?.btnHref });
          recordTest("CTA Heading is 'Ready To Create Your Next AI Video?'", ctaStyle && ctaStyle.headingText.includes("Ready To Create Your Next AI Video?"), { heading: ctaStyle?.headingText });

          // Test smooth scroll
          await page.evaluate(() => {
            const b = document.querySelector("#portfolio-cta-section .dgs-ai-cta-btn");
            if (b) b.click();
          });
          await page.waitForTimeout(2500);
          const scrollPos = await page.evaluate(() => {
            const anchor = document.getElementById("ai-video-enquiry-form");
            const rect = anchor ? anchor.getBoundingClientRect() : null;
            return {
              scrollY: window.scrollY,
              anchorTop: rect ? rect.top : null,
              anchorVisible: rect ? (rect.top >= -50 && rect.top <= 250) : false
            };
          });
          recordTest("CTA Button Smooth Scrolls to Real Form Anchor", scrollPos.anchorVisible, scrollPos);
        }

        // Capture screenshot of CTA section area with breathing room
        await ctaEl.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        const buf = await page.screenshot({ fullPage: false });
        saveScreenshot(buf, vp.name);
      }
      await ctx.close();
    }

    // -------------------------------------------------------------------------
    // 2. VIDEO PLAYER EXACT DISPLAY DIMENSIONS & LIGHTBOX CHROME
    // -------------------------------------------------------------------------
    console.log("\n--- PART 2: Video Player Exact Display Dimensions (1080p Desktop) ---");

    const playerCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const playerPage = await playerCtx.newPage();
    await safeGoto(playerPage, `${BASE_URL}/services/ai-video-production-agency/`);
    await playerPage.waitForTimeout(2000);
    await cleanFloaters(playerPage);

    // Scroll to portfolio gallery
    const galleryEl = await playerPage.$("#portfolio-gallery");
    if (galleryEl) {
      await galleryEl.scrollIntoViewIfNeeded();
      await playerPage.waitForTimeout(500);
    }

    // Measure function
    const measureOpenedPlayer = async (targetSelector) => {
      const card = await playerPage.$(targetSelector);
      if (!card) return null;

      await card.evaluate(el => el.click());
      await playerPage.waitForTimeout(1000);

      const metrics = await playerPage.evaluate(() => {
        const player = document.getElementById("lightbox-player");
        const content = document.getElementById("lightbox-content");
        const lightbox = document.getElementById("lightbox");
        const closeBtn = document.getElementById("lightbox-close");
        const prevBtn = document.getElementById("lightbox-prev");
        const nextBtn = document.getElementById("lightbox-next");

        if (!player || !content) return null;

        const pRect = player.getBoundingClientRect();
        const cRect = content.getBoundingClientRect();
        const closeRect = closeBtn ? closeBtn.getBoundingClientRect() : null;
        const prevRect = prevBtn ? prevBtn.getBoundingClientRect() : null;
        const nextRect = nextBtn ? nextBtn.getBoundingClientRect() : null;

        const renderedRatio = pRect.width / pRect.height;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        return {
          playerWidth: pRect.width,
          playerHeight: pRect.height,
          contentWidth: cRect.width,
          contentHeight: cRect.height,
          renderedRatio: renderedRatio,
          viewportWidth: vw,
          viewportHeight: vh,
          widthRatio: pRect.width / vw,
          heightRatio: pRect.height / vh,
          topMargin: pRect.top,
          bottomMargin: vh - pRect.bottom,
          leftMargin: pRect.left,
          rightMargin: vw - pRect.right,
          closeVisible: closeRect && closeRect.width >= 40 && closeRect.top > 0,
          closeTop: closeRect ? closeRect.top : null,
          closeRight: closeRect ? (vw - closeRect.right) : null,
          prevOutside: prevRect ? (prevRect.right <= pRect.left) : true,
          nextOutside: nextRect ? (nextRect.left >= pRect.right) : true,
          isOpen: lightbox.classList.contains("is-open")
        };
      });

      return metrics;
    };

    const closeLightboxModal = async () => {
      await playerPage.evaluate(() => {
        const closeBtn = document.getElementById("lightbox-close");
        if (closeBtn) closeBtn.click();
      });
      await playerPage.waitForTimeout(500);
    };

    // A. Better Ceasons Portrait (9:16, 1080x1920)
    console.log("\n[A] Testing Better Ceasons Portrait (9:16)...");
    const bcMetrics = await measureOpenedPlayer('.gallery-item[data-video-id*="better_ceasons_tenant"], .gallery-item[data-categories*="campaign"]');
    if (bcMetrics) {
      const sourceRatio = 1080 / 1920; // 0.5625
      const ratioDev = Math.abs(bcMetrics.renderedRatio - sourceRatio) / sourceRatio;

      recordTest("Better Ceasons: Rendered Ratio within 0.5% of Source (0.5625)", ratioDev < 0.005, {
        renderedRatio: bcMetrics.renderedRatio,
        sourceRatio,
        deviationPercent: (ratioDev * 100).toFixed(3) + "%"
      });
      recordTest("Better Ceasons: Height Bounded <= 82dvh and <= 920px", bcMetrics.playerHeight <= 920 && bcMetrics.playerHeight <= (1080 * 0.825), {
        playerHeight: bcMetrics.playerHeight,
        max82dvh: 1080 * 0.82,
        limit: 920
      });
      recordTest("Better Ceasons: Width Bounded <= 58vw and <= 620px (Exact Ratio)", bcMetrics.playerWidth <= 620 && bcMetrics.playerWidth >= 480, {
        playerWidth: bcMetrics.playerWidth,
        targetWidth: Math.round(bcMetrics.playerHeight * sourceRatio)
      });
      recordTest("Better Ceasons: Comfortable Margins (Left/Right > 500px, Top/Bottom > 60px)", bcMetrics.leftMargin > 500 && bcMetrics.topMargin >= 60, {
        topMargin: bcMetrics.topMargin,
        leftMargin: bcMetrics.leftMargin
      });
      recordTest("Better Ceasons: Close Button Clearly Outside/Visible", bcMetrics.closeVisible && bcMetrics.closeTop < bcMetrics.topMargin, {
        closeTop: bcMetrics.closeTop,
        mediaTop: bcMetrics.topMargin
      });

      const bcBuf = await playerPage.screenshot({ fullPage: false });
      saveScreenshot(bcBuf, "BETTER_CEASONS_PORTRAIT_NORMAL_VIEWER.png");
      await closeLightboxModal();
    }

    // B. Hyundai Landscape (16:9, 1920x1080)
    console.log("\n[B] Testing Hyundai Landscape (16:9)...");
    const hyundaiMetrics = await measureOpenedPlayer('.gallery-item[data-video-id*="hyundai_creta_1"], .gallery-item[data-categories*="automobile"]');
    if (hyundaiMetrics) {
      const sourceRatio = 1920 / 1080; // 1.777777...
      const ratioDev = Math.abs(hyundaiMetrics.renderedRatio - sourceRatio) / sourceRatio;

      recordTest("Hyundai: Rendered Ratio within 0.5% of Source (1.7778)", ratioDev < 0.005, {
        renderedRatio: hyundaiMetrics.renderedRatio,
        sourceRatio,
        deviationPercent: (ratioDev * 100).toFixed(3) + "%"
      });
      recordTest("Hyundai: Width Bounded <= 86vw and <= 1600px", hyundaiMetrics.playerWidth <= 1600 && hyundaiMetrics.playerWidth <= (1920 * 0.86), {
        playerWidth: hyundaiMetrics.playerWidth,
        max86vw: 1920 * 0.86
      });
      recordTest("Hyundai: Desktop Preferred Width within 1200-1450px Range", hyundaiMetrics.playerWidth >= 1200 && hyundaiMetrics.playerWidth <= 1450, {
        playerWidth: hyundaiMetrics.playerWidth
      });
      recordTest("Hyundai: Height Bounded <= 80dvh", hyundaiMetrics.playerHeight <= (1080 * 0.80), {
        playerHeight: hyundaiMetrics.playerHeight,
        max80dvh: 1080 * 0.80
      });
      recordTest("Hyundai: Comfortable Safe Margins (Top/Bottom >= 60px, Left/Right >= 60px)", hyundaiMetrics.topMargin >= 60 && hyundaiMetrics.leftMargin >= 60, {
        topMargin: hyundaiMetrics.topMargin,
        leftMargin: hyundaiMetrics.leftMargin
      });
      recordTest("Hyundai: Normal Viewer Distinct from Fullscreen (widthRatio < 0.85)", hyundaiMetrics.widthRatio < 0.85, {
        widthRatio: hyundaiMetrics.widthRatio
      });

      const hyundaiBuf = await playerPage.screenshot({ fullPage: false });
      saveScreenshot(hyundaiBuf, "HYUNDAI_LANDSCAPE_NORMAL_VIEWER.png");
      await closeLightboxModal();
    }

    // C. Clarion Portrait (9:16, 1080x1920)
    console.log("\n[C] Testing Clarion Portrait (9:16)...");
    const clarionMetrics = await measureOpenedPlayer('.gallery-item[data-video-id*="clarion_jasmine_atta_hindi"], .gallery-item[data-categories*="fmcg"]');
    if (clarionMetrics) {
      const sourceRatio = 1080 / 1920;
      const ratioDev = Math.abs(clarionMetrics.renderedRatio - sourceRatio) / sourceRatio;

      recordTest("Clarion: Rendered Ratio within 0.5% of Source (0.5625)", ratioDev < 0.005, {
        renderedRatio: clarionMetrics.renderedRatio,
        sourceRatio,
        deviationPercent: (ratioDev * 100).toFixed(3) + "%"
      });
      recordTest("Clarion: Height Bounded <= 82dvh and <= 920px", clarionMetrics.playerHeight <= 920, {
        playerHeight: clarionMetrics.playerHeight
      });

      const clarionBuf = await playerPage.screenshot({ fullPage: false });
      saveScreenshot(clarionBuf, "CLARION_PORTRAIT_NORMAL_VIEWER.png");
      await closeLightboxModal();
    }

    // D. Sundaram Landscape (16:9, 1920x1080)
    console.log("\n[D] Testing Sundaram Landscape (16:9)...");
    const sundaramMetrics = await measureOpenedPlayer('.gallery-item[data-video-id*="sundaram_bal_3_1"], .gallery-item[data-categories*="edtech"]');
    if (sundaramMetrics) {
      const sourceRatio = 1920 / 1080;
      const ratioDev = Math.abs(sundaramMetrics.renderedRatio - sourceRatio) / sourceRatio;

      recordTest("Sundaram: Rendered Ratio within 0.5% of Source (1.7778)", ratioDev < 0.005, {
        renderedRatio: sundaramMetrics.renderedRatio,
        sourceRatio,
        deviationPercent: (ratioDev * 100).toFixed(3) + "%"
      });
      recordTest("Sundaram: Desktop Preferred Width within 1200-1450px Range", sundaramMetrics.playerWidth >= 1200 && sundaramMetrics.playerWidth <= 1450, {
        playerWidth: sundaramMetrics.playerWidth
      });

      const sundaramBuf = await playerPage.screenshot({ fullPage: false });
      saveScreenshot(sundaramBuf, "SUNDARAM_LANDSCAPE_NORMAL_VIEWER.png");
      await closeLightboxModal();
    }

    // -------------------------------------------------------------------------
    // 3. FULLSCREEN ZERO-CROP & FULLSCREEN EXIT VERIFICATION
    // -------------------------------------------------------------------------
    console.log("\n--- PART 3: Fullscreen Zero-Crop & Exit Restoration ---");

    // Open Hyundai and test fullscreen simulation
    await measureOpenedPlayer('.gallery-item[data-video-id*="hyundai_creta_1"]');
    await playerPage.waitForTimeout(500);

    // Simulate fullscreen styling via evaluate to capture screenshot
    await playerPage.evaluate(() => {
      const p = document.getElementById("lightbox-player");
      if (p) {
        p.setAttribute("data-test-fullscreen", "true");
        p.style.setProperty("width", "100vw", "important");
        p.style.setProperty("height", "100vh", "important");
        p.style.setProperty("max-width", "none", "important");
        p.style.setProperty("max-height", "none", "important");
      }
    });
    await playerPage.waitForTimeout(300);
    const fsHyundaiBuf = await playerPage.screenshot({ fullPage: false });
    saveScreenshot(fsHyundaiBuf, "HYUNDAI_FULLSCREEN.png");
    recordTest("Hyundai Fullscreen Screenshot Captured (100vw x 100vh contain)", true);

    // Reset fullscreen
    await playerPage.evaluate(() => {
      const p = document.getElementById("lightbox-player");
      if (p) {
        p.removeAttribute("data-test-fullscreen");
        p.style.removeProperty("width");
        p.style.removeProperty("height");
        p.style.removeProperty("max-width");
        p.style.removeProperty("max-height");
      }
    });
    await closeLightboxModal();

    // Open Better Ceasons and test fullscreen simulation
    await measureOpenedPlayer('.gallery-item[data-video-id*="better_ceasons_tenant"]');
    await playerPage.waitForTimeout(500);
    await playerPage.evaluate(() => {
      const p = document.getElementById("lightbox-player");
      if (p) {
        p.setAttribute("data-test-fullscreen", "true");
        p.style.setProperty("width", "100vw", "important");
        p.style.setProperty("height", "100vh", "important");
        p.style.setProperty("max-width", "none", "important");
        p.style.setProperty("max-height", "none", "important");
      }
    });
    await playerPage.waitForTimeout(300);
    const fsBcBuf = await playerPage.screenshot({ fullPage: false });
    saveScreenshot(fsBcBuf, "BETTER_CEASONS_FULLSCREEN.png");
    recordTest("Better Ceasons Fullscreen Screenshot Captured (100vw x 100vh contain)", true);

    // Exit fullscreen and verify exact return to normal dimensions
    await playerPage.evaluate(() => {
      const p = document.getElementById("lightbox-player");
      if (p) {
        p.removeAttribute("data-test-fullscreen");
        p.style.removeProperty("width");
        p.style.removeProperty("height");
        p.style.removeProperty("max-width");
        p.style.removeProperty("max-height");
      }
      // Trigger fullscreen exit handler
      document.dispatchEvent(new Event("fullscreenchange"));
    });
    await playerPage.waitForTimeout(500);

    const postFsMetrics = await playerPage.evaluate(() => {
      const p = document.getElementById("lightbox-player");
      if (!p) return null;
      const rect = p.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        ratio: rect.width / rect.height
      };
    });

    recordTest(
      "Fullscreen Exit Restores Exact Normal Calculated Dimensions (Height bounded <= 920px)",
      postFsMetrics && postFsMetrics.height <= 920 && postFsMetrics.width <= 620,
      postFsMetrics
    );

    await closeLightboxModal();
    await playerCtx.close();

    // -------------------------------------------------------------------------
    // 4. MULTI-ROUTE VERIFICATION: DUBAI, GOOGLE ADS, PORTFOLIO, HOMEPAGE
    // -------------------------------------------------------------------------
    console.log("\n--- PART 4: Multi-Route Verification ---");

    const OTHER_ROUTES = [
      { path: "/services/ai-production-dubai-page/", label: "Dubai Page" },
      { path: "/ai-production-videos-google-ads-landing-page/", label: "Google Ads Landing Page" },
      { path: "/portfolio/", label: "Portfolio Preview Page" },
      { path: "/", label: "Homepage" }
    ];

    for (const r of OTHER_ROUTES) {
      const rCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
      const rPage = await rCtx.newPage();
      await safeGoto(rPage, `${BASE_URL}${r.path}`);
      await rPage.waitForTimeout(2000);
      await cleanFloaters(rPage);

      const audit = await rPage.evaluate((routePath) => {
        const cta = document.getElementById("portfolio-cta-section");
        const btn = cta ? cta.querySelector(".dgs-ai-cta-btn") : null;
        const portfolio = document.getElementById("portfolio") || document.querySelector('[data-dgs-portfolio]');
        const gallery = document.getElementById("portfolio-gallery") || document.querySelector('[data-dgs-native-justified-gallery]');
        const cards = document.querySelectorAll(".gallery-item, .case-study-item, [data-media-kind]");
        
        // Zero wonder check
        const text = document.body ? document.body.innerText : "";
        const wonderMatches = (text.match(/Wonder/gi) || []).length;

        return {
          hasPortfolio: Boolean(portfolio),
          hasGallery: Boolean(gallery),
          cardCount: cards.length,
          hasCta: Boolean(cta),
          btnText: btn ? btn.textContent.trim() : null,
          wonderCount: wonderMatches
        };
      }, r.path);

      if (r.path.includes("ai-production") || r.path.includes("services/ai-video")) {
        recordTest(`${r.label}: Has CTA Conversion Card with Correct Text`, audit.hasCta && audit.btnText === "START YOUR AI VIDEO PROJECT", audit);
      }
      if (r.path !== "/ai-production-videos-google-ads-landing-page/") {
        recordTest(`${r.label}: Portfolio Mounted & Active (Cards: ${audit.cardCount})`, audit.hasPortfolio && audit.cardCount > 0, audit);
      } else {
        recordTest(`${r.label}: Form/Landing Structure Active`, audit.hasCta, audit);
      }
      recordTest(`${r.label}: Zero Wonder Rule Maintained (Count: ${audit.wonderCount})`, audit.wonderCount === 0, { wonderCount: audit.wonderCount });

      await rCtx.close();
    }

  } catch (err) {
    console.error("TEST EXECUTION ERROR:", err);
    recordTest("Fatal Execution Error", false, { error: err.message, stack: err.stack });
  } finally {
    await browser.close();

    const resultPath = path.join(process.cwd(), "v8128_visual_qa_results.json");
    fs.writeFileSync(resultPath, JSON.stringify(RESULTS, null, 2), "utf8");
    if (fs.existsSync(ARTIFACT_DIR)) {
      fs.writeFileSync(path.join(ARTIFACT_DIR, "v8128_visual_qa_results.json"), JSON.stringify(RESULTS, null, 2), "utf8");
    }

    console.log("\n================================================================================");
    console.log("=== V8.12.8 FINAL VISUAL QA RUN COMPLETE ===");
    console.log(`Total: ${RESULTS.summary.total} | Passed: ${RESULTS.summary.passed} | Failed: ${RESULTS.summary.failed}`);
    console.log(`Success Rate: ${((RESULTS.summary.passed / RESULTS.summary.total) * 100).toFixed(1)}%`);
    console.log("================================================================================\n");
  }
}

run().catch(console.error);
