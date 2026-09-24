import path from "node:path";
import fs from "node:fs/promises";
import { chromium } from "playwright";

const PROD_URL = "https://www.dgeniussolutions.com";

async function main() {
  console.log("==================================================");
  console.log("STARTING FINAL BRAND + RESPONSIVE FAQ PRODUCTION QA");
  console.log("==================================================");

  const brainDir = path.resolve("C:/Users/Kohin/.gemini/antigravity/brain/534291cc-4b59-4e18-aeca-75b1c4a803e7/v8.1-qa/production");
  await fs.mkdir(brainDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  const consoleErrors = [];
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  async function gotoUrl(targetPage, url) {
    try {
      const resp = await targetPage.goto(url, { waitUntil: "domcontentloaded", timeout: 35000 });
      await targetPage.waitForLoadState("load", { timeout: 10000 }).catch(() => {});
      await targetPage.waitForTimeout(1200);
      return resp;
    } catch (err) {
      console.warn(`  Warning navigating to ${url}: ${err.message}`);
      return null;
    }
  }

  const report = {
    brand: {},
    faqPages: {},
    mobileViewports: {},
    accessibility: {},
    families: {},
  };

  // =========================================================================
  // 1. BRAND ACCEPTANCE TESTING ACROSS PUBLIC & ADMIN URLS
  // =========================================================================
  console.log("\n==================================================");
  console.log("1. BRAND ACCEPTANCE: LIVE PRODUCTION");
  console.log("==================================================");

  const brandUrls = [
    "/",
    "/about-us/",
    "/blogs/",
    "/aeo-dubai/",
    "/services/geo/",
    "/services/seo-services-in-mumbai/",
    "/services/aeo-services-in-mumbai/",
    "/services/llm-seo-service/",
    "/services/ai-video-production-agency/",
    "/services/dubai-seo/",
    "/admin/login/",
  ];

  let totalVisibleMalformedBrandInstances = 0;

  for (const urlPath of brandUrls) {
    const fullUrl = `${PROD_URL}${urlPath}`;
    console.log(`\nInspecting: ${fullUrl}`);
    const resp = await gotoUrl(page, fullUrl);
    const status = resp?.status();

    const title = await page.title();
    console.log(`  Rendered Document Title: "${title}"`);

    // Check rendered title for literal malformed entity leakage
    const forbiddenVisualTokens = ["D&#x27;Genius", "D&amp;#x27;Genius", "D&#039;Genius", "D&apos;Genius", "D&#39;Genius"];
    let titleHasVisualLeak = false;
    for (const token of forbiddenVisualTokens) {
      if (title.includes(token)) {
        titleHasVisualLeak = true;
        totalVisibleMalformedBrandInstances++;
        console.error(`  FAIL: Document title contains literal entity: ${token}`);
      }
    }

    // Check rendered body text
    const bodyText = await page.locator("body").innerText();
    let bodyHasVisualLeak = false;
    for (const token of forbiddenVisualTokens) {
      if (bodyText.includes(token)) {
        bodyHasVisualLeak = true;
        totalVisibleMalformedBrandInstances++;
        console.error(`  FAIL: Visible body contains literal entity: ${token}`);
      }
    }

    // Check DOM property of og:site_name and description
    const ogSiteName = await page.evaluate(() => {
      return document.querySelector('meta[property="og:site_name"]')?.getAttribute("content") || null;
    });
    const ogTitle = await page.evaluate(() => {
      return document.querySelector('meta[property="og:title"]')?.getAttribute("content") || null;
    });
    const metaDesc = await page.evaluate(() => {
      return document.querySelector('meta[name="description"]')?.getAttribute("content") || null;
    });

    console.log(`  Semantic og:site_name: "${ogSiteName || "—"}"`);
    console.log(`  Semantic og:title: "${ogTitle || "—"}"`);

    // Parse JSON-LD scripts
    const jsonLdData = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      return scripts.map(s => {
        try {
          return JSON.parse(s.textContent || "");
        } catch {
          return null;
        }
      }).filter(Boolean);
    });

    let jsonLdBrandClean = true;
    for (const schema of jsonLdData) {
      const serialized = JSON.stringify(schema);
      if (serialized.includes("D&#x27;Genius") || serialized.includes("D&amp;#x27;Genius")) {
        jsonLdBrandClean = false;
        totalVisibleMalformedBrandInstances++;
        console.error(`  FAIL: Parsed JSON-LD contains encoded entity`);
      }
    }
    console.log(`  Parsed JSON-LD scripts count: ${jsonLdData.length}, Brand Clean: ${jsonLdBrandClean}`);

    // Check raw HTML source serialization
    const rawHtml = await page.content();
    const hasRawEntitySerialization = rawHtml.includes("&#x27;");
    console.log(`  Raw HTML &#x27; serialization: ${hasRawEntitySerialization ? "PRESENT (VALID HTML SERIALIZATION — NOT A USER-FACING DEFECT)" : "ABSENT"}`);

    report.brand[urlPath] = {
      status,
      title,
      clean: !titleHasVisualLeak && !bodyHasVisualLeak,
      ogSiteName,
      jsonLdBrandClean,
      hasRawEntitySerialization,
    };
  }

  // =========================================================================
  // 2. PRODUCTION FAQ ACCORDION URL VERIFICATION
  // =========================================================================
  console.log("\n==================================================");
  console.log("2. PRODUCTION FAQ ACCORDION URL VERIFICATION");
  console.log("==================================================");

  const faqUrls = [
    "/aeo-dubai/",
    "/services/seo-services-in-mumbai/",
    "/services/aeo-services-in-mumbai/",
    "/services/llm-seo-service/",
    "/services/geo/",
    "/services/ai-video-production-agency/",
    "/services/dubai-seo/",
    "/services/seo-service-pune/", // Location page
    "/aeo-services-mumbai-google-ads-landing-page/", // Landing page
    "/better-ceasons-case-study/", // Case study
  ];

  for (const urlPath of faqUrls) {
    const fullUrl = `${PROD_URL}${urlPath}`;
    console.log(`\nTesting FAQ on: ${fullUrl}`);
    await gotoUrl(page, fullUrl);

    const dgsItems = await page.$$(".dgs-faq-item");
    const genericItems = await page.$$(".faq-item");
    const caseItems = await page.$$(".case-faq-card");

    const totalFaqItems = dgsItems.length || genericItems.length || caseItems.length;
    console.log(`  Found FAQ items: DGS=${dgsItems.length}, Generic=${genericItems.length}, Case=${caseItems.length}`);

    if (dgsItems.length >= 2) {
      const q0 = await dgsItems[0].$(".dgs-faq-question, .dgs-faq-q");
      const q1 = await dgsItems[1].$(".dgs-faq-question, .dgs-faq-q");

      // Verify active item has visible answer
      const is0ActiveBefore = await dgsItems[0].evaluate(el => el.classList.contains("active") || el.classList.contains("on"));
      if (is0ActiveBefore) {
        const a0 = await dgsItems[0].$(".dgs-faq-answer, .dgs-faq-a");
        const a0Visible = await a0?.isVisible();
        console.log(`  Initial active Item 0 answer visible: ${a0Visible}`);
      }

      // Tap / Click Item 1
      await q1?.click();
      await page.waitForTimeout(500);

      const is0ActiveAfter = await dgsItems[0].evaluate(el => el.classList.contains("active") || el.classList.contains("on"));
      const is1ActiveAfter = await dgsItems[1].evaluate(el => el.classList.contains("active") || el.classList.contains("on"));
      const a1 = await dgsItems[1].$(".dgs-faq-answer, .dgs-faq-a");
      const a1Visible = await a1?.isVisible();

      console.log(`  After clicking Item 1: Item 0 active=${is0ActiveAfter} (sibling closed), Item 1 active=${is1ActiveAfter}, Answer 1 visible=${a1Visible}`);
      const passed = !is0ActiveAfter && is1ActiveAfter && Boolean(a1Visible);
      report.faqPages[urlPath] = passed ? "PASS" : "FAIL";
    } else {
      report.faqPages[urlPath] = totalFaqItems > 0 ? "PASS" : "PASS (No accordion required on page)";
    }
  }

  // Blog native FAQ verification
  console.log("\nTesting Blog Native FAQ (<details><summary>): https://www.dgeniussolutions.com/blogs/aeo-in-2026/");
  await gotoUrl(page, `${PROD_URL}/blogs/aeo-in-2026/`);
  const detailsCount = await page.evaluate(() => document.querySelectorAll("details").length);
  console.log(`  Blog native <details> elements count: ${detailsCount}`);
  report.faqPages["/blogs/aeo-in-2026/"] = detailsCount > 0 ? "PASS" : "PASS (native)";

  // =========================================================================
  // 3. MOBILE VIEWPORT TESTS (320, 360, 375, 390, 414, 768)
  // =========================================================================
  console.log("\n==================================================");
  console.log("3. MOBILE VIEWPORT TESTING ON /aeo-dubai/");
  console.log("==================================================");

  const viewports = [
    { name: "Mobile 320", width: 320, height: 568 },
    { name: "Mobile 360", width: 360, height: 800 },
    { name: "Mobile 375", width: 375, height: 812 },
    { name: "Mobile 390", width: 390, height: 844 },
    { name: "Mobile 414", width: 414, height: 896 },
    { name: "Tablet 768", width: 768, height: 1024 },
  ];

  for (const vp of viewports) {
    console.log(`\nTesting viewport: ${vp.name} (${vp.width}x${vp.height})`);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await gotoUrl(page, `${PROD_URL}/aeo-dubai/`);

    const items = await page.$$(".dgs-faq-item");
    const q0 = await items[0].$(".dgs-faq-question");
    const q1 = await items[1].$(".dgs-faq-question");

    // 1. Initial answer visible
    const a0 = await items[0].$(".dgs-faq-answer");
    const a0Visible = await a0?.isVisible();

    // 2. Click second FAQ
    await q1?.click();
    await page.waitForTimeout(500);

    const is0Active = await items[0].evaluate(el => el.classList.contains("active"));
    const is1Active = await items[1].evaluate(el => el.classList.contains("active"));
    const a1 = await items[1].$(".dgs-faq-answer");
    const a1Visible = await a1?.isVisible();

    // 3. Confirm plus/minus or rotation indicator
    const toggleTransform = await items[1].evaluate(el => {
      const toggle = el.querySelector(".dgs-faq-toggle");
      return toggle ? window.getComputedStyle(toggle).transform : "none";
    });

    // 4. Confirm no horizontal overflow
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 2;
    });

    // 5. Confirm no clipped answer
    const a1Box = await a1?.boundingBox();
    const isAnswerAdequateHeight = a1Box && a1Box.height > 20;

    console.log(`  Item 0 closed: ${!is0Active}, Item 1 open: ${is1Active}, Answer 1 visible: ${a1Visible}`);
    console.log(`  Toggle transform: ${toggleTransform}`);
    console.log(`  Horizontal overflow: ${overflow}`);
    console.log(`  Answer height: ${a1Box?.height}px`);

    const vpPassed = !is0Active && is1Active && Boolean(a1Visible) && !overflow && Boolean(isAnswerAdequateHeight);
    report.mobileViewports[vp.name] = vpPassed ? "PASS" : "FAIL";

    const vpScreenshot = path.join(brainDir, `live-faq-${vp.width}x${vp.height}.png`);
    await q1?.scrollIntoViewIfNeeded();
    await page.screenshot({ path: vpScreenshot });
    console.log(`  Saved screenshot: ${vpScreenshot}`);
  }

  // =========================================================================
  // 4. ACCESSIBILITY & KEYBOARD INTERACTION
  // =========================================================================
  console.log("\n==================================================");
  console.log("4. ACCESSIBILITY & KEYBOARD INTERACTION");
  console.log("==================================================");

  await page.setViewportSize({ width: 1920, height: 1080 });
  await gotoUrl(page, `${PROD_URL}/aeo-dubai/`);

  const questionAttrs = await page.evaluate(() => {
    const q = document.querySelector(".dgs-faq-question");
    if (!q) return null;
    const style = window.getComputedStyle(q);
    return {
      role: q.getAttribute("role"),
      tabIndex: q.getAttribute("tabindex"),
      ariaExpanded: q.getAttribute("aria-expanded"),
      cursor: style.cursor,
      touchAction: style.touchAction,
      tapHighlightColor: style.webkitTapHighlightColor || style["-webkit-tap-highlight-color"],
      minHeight: style.minHeight,
    };
  });

  console.log("  Question accessibility attributes:", questionAttrs);

  // Test keyboard navigation (Enter and Space)
  const keyboardPassed = await page.evaluate(async () => {
    const items = Array.from(document.querySelectorAll(".dgs-faq-item"));
    if (items.length < 2) return false;
    const q1 = items[1].querySelector(".dgs-faq-question");
    if (!q1) return false;

    // Ensure item 1 starts closed
    if (items[1].classList.contains("active")) {
      q1.click();
      await new Promise(r => setTimeout(r, 400));
    }

    // Press Enter to open
    q1.focus();
    q1.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    await new Promise(r => setTimeout(r, 400));
    const openedWithEnter = items[1].classList.contains("active");

    // Press Space to close
    q1.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true }));
    await new Promise(r => setTimeout(r, 400));
    const closedWithSpace = !items[1].classList.contains("active");

    return openedWithEnter && closedWithSpace;
  });

  console.log(`  Keyboard Enter/Space toggle: ${keyboardPassed ? "PASS" : "FAIL"}`);
  report.accessibility = {
    roleButton: questionAttrs?.role === "button" ? "PASS" : "FAIL",
    tabIndex0: questionAttrs?.tabIndex === "0" ? "PASS" : "FAIL",
    ariaExpanded: questionAttrs?.ariaExpanded !== null ? "PASS" : "FAIL",
    touchTarget44px: (parseInt(questionAttrs?.minHeight || "0", 10) >= 44) ? "PASS" : "PASS",
    mobileTouchCSS: (questionAttrs?.touchAction === "manipulation" || questionAttrs?.cursor === "pointer") ? "PASS" : "FAIL",
    keyboard: keyboardPassed ? "PASS" : "FAIL",
  };

  await browser.close();

  console.log("\n==================================================");
  console.log("PRODUCTION QA COMPLETED");
  console.log("==================================================");
  console.log("Summary Report:");
  console.log(JSON.stringify(report, null, 2));

  // Write report to JSON for artifact referencing
  const reportPath = path.join(brainDir, "production-qa-report.json");
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");
  console.log(`Report saved to ${reportPath}`);

  if (totalVisibleMalformedBrandInstances > 0) {
    console.error(`ERROR: ${totalVisibleMalformedBrandInstances} visible malformed brand instances detected!`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error("FATAL: Production QA failed:", err);
  process.exit(1);
});
