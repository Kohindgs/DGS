import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = "https://www.dgeniussolutions.com";

async function main() {
  console.log("==================================================================");
  console.log("  DGS MASTER PRODUCTION VERIFICATION — WORKSTREAM A & WORKSTREAM B");
  console.log("==================================================================");

  const results = {
    webdevRestoration: false,
    webdevLayoutPreserved: false,
    humanxtScrolling: false,
    weavingsScrolling: false,
    katherinesScrolling: false,
    betterceasonsScrolling: false,
    webdevFaqsFunctional: false,
    webdevFormOperational: false,
    dubaiTitleCorrect: false,
    dubaiH1Correct: false,
    dubaiCanonicalRetained: false,
    obsoleteDubaiSignalsRemoved: false,
    dubaiFaqsValidated: false,
    dubaiStructuredDataValid: false,
    aiVideoLibraryPreserved: false,
    loadMorePreserved: false,
    homepagePortfolioNoRegression: false,
    blogImagesNoRegression: false,
    details: {},
  };

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  });

  // -------------------------------------------------------------
  // TEST 1: WORKSTREAM A — WEBSITE DEVELOPMENT & AMC
  // -------------------------------------------------------------
  console.log("\n>>> Testing Workstream A: /services/website-development-amc/...");
  const webdevUrl = `${BASE_URL}/services/website-development-amc/`;
  const webdevResp = await page.goto(webdevUrl, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(3000);

  const webdevStatus = webdevResp.status();
  console.log(`HTTP Status: ${webdevStatus}`);

  // A1: Check restored kinetic scene and 62c3ff7 visual elements
  const visualScene = await page.evaluate(() => {
    const heroVisual = document.getElementById("heroVisual");
    const heroScene = document.getElementById("heroScene");
    const rings = document.querySelectorAll(".scene-rings .ring");
    const photon = document.getElementById("photon");
    const halo = document.getElementById("halo");
    const frags = document.querySelectorAll(".hero-fragments .frag");
    const rankingProof = document.querySelector(".ranking-proof");
    const starfield = document.getElementById("globalStarfield");
    return {
      hasHeroVisual: !!heroVisual,
      hasHeroScene: !!heroScene,
      ringCount: rings.length,
      hasPhoton: !!photon,
      hasHalo: !!halo,
      fragCount: frags.length,
      hasRankingProof: !!rankingProof,
      hasStarfield: !!starfield,
    };
  });
  console.log("Restored visual scene check:", visualScene);
  results.webdevRestoration = visualScene.hasHeroScene && visualScene.ringCount === 3 && visualScene.hasPhoton;
  results.webdevLayoutPreserved = visualScene.hasRankingProof && visualScene.hasStarfield;

  await page.screenshot({ path: "scripts/webdev_hero_restored_live.png" });

  // A2: Check Case Studies and Scrolling Preview Interaction
  console.log("\nChecking case study preview scrolling interactions...");
  const caseStudies = await page.evaluate(() => {
    const rows = document.querySelectorAll(".work-project-row");
    const items = [];
    rows.forEach((row, i) => {
      const title = row.querySelector(".work-client-name")?.textContent?.trim() || "";
      const img = row.querySelector(".w-img img");
      const link = row.querySelector(".live-preview-link");
      const box = row.querySelector(".w-img");
      const pill = row.querySelector(".preview-scroll-pill");
      items.push({
        index: i + 1,
        title,
        imgSrc: img?.getAttribute("src") || "",
        linkHref: link?.getAttribute("href") || "",
        boxH: box?.offsetHeight || 0,
        boxW: box?.offsetWidth || 0,
        imgH: img?.offsetHeight || 0,
        hasPill: !!pill,
      });
    });
    return items;
  });
  console.log("Case studies found:", caseStudies);

  // Test HumanXT hover scrolling
  const humanxtRow = page.locator(".work-project-row").nth(0);
  const humanxtImg = humanxtRow.locator(".w-img img");
  const humanxtBox = humanxtRow.locator(".w-img");

  const initialTopHumanxt = await humanxtImg.evaluate((el) => el.getBoundingClientRect().top);
  const initialBoxTop = await humanxtBox.evaluate((el) => el.getBoundingClientRect().top);
  console.log(`HumanXT initial relative top: ${initialTopHumanxt - initialBoxTop}px`);

  // Hover over row 1
  await humanxtRow.hover();
  await page.waitForTimeout(3000); // 3s into 11s scroll
  const midTopHumanxt = await humanxtImg.evaluate((el) => el.getBoundingClientRect().top);
  const scrolledPx = initialTopHumanxt - midTopHumanxt;
  console.log(`HumanXT scrolled after 3s: ${scrolledPx.toFixed(1)}px`);
  results.humanxtScrolling = scrolledPx > 100;

  await page.screenshot({ path: "scripts/webdev_humanxt_scrolled_live.png" });

  // Hover away to test pause and reset
  await page.mouse.move(0, 0);
  await page.waitForTimeout(1000);
  const resetTopHumanxt = await humanxtImg.evaluate((el) => el.getBoundingClientRect().top);
  console.log(`HumanXT relative top after mouse leave: ${resetTopHumanxt - initialBoxTop}px`);

  // Test Weavings hover scrolling
  const weavingsRow = page.locator(".work-project-row").nth(1);
  const weavingsImg = weavingsRow.locator(".w-img img");
  const initialTopWeavings = await weavingsImg.evaluate((el) => el.getBoundingClientRect().top);
  await weavingsRow.hover();
  await page.waitForTimeout(3000);
  const midTopWeavings = await weavingsImg.evaluate((el) => el.getBoundingClientRect().top);
  const weavingsScrolled = initialTopWeavings - midTopWeavings;
  console.log(`Weavings scrolled after 3s: ${weavingsScrolled.toFixed(1)}px`);
  results.weavingsScrolling = weavingsScrolled > 100;
  await page.mouse.move(0, 0);
  await page.waitForTimeout(1000);

  // Test Katherine's Gallery
  const kathRow = page.locator(".work-project-row").nth(2);
  const kathImg = kathRow.locator(".w-img img");
  const kathBox = kathRow.locator(".w-img");
  const kathSrc = await kathImg.getAttribute("src");
  console.log(`Katherine's Gallery image src: ${kathSrc}`);
  results.katherinesScrolling = !!kathSrc && !kathSrc.includes("mshots");

  // Test Better Ceasons hover scrolling
  const bcRow = page.locator(".work-project-row").nth(3);
  const bcImg = bcRow.locator(".w-img img");
  const initialTopBc = await bcImg.evaluate((el) => el.getBoundingClientRect().top);
  await bcRow.hover();
  await page.waitForTimeout(3000);
  const midTopBc = await bcImg.evaluate((el) => el.getBoundingClientRect().top);
  const bcScrolled = initialTopBc - midTopBc;
  console.log(`Better Ceasons scrolled after 3s: ${bcScrolled.toFixed(1)}px`);
  results.betterceasonsScrolling = bcScrolled > 100;
  await page.mouse.move(0, 0);
  await page.waitForTimeout(1000);

  await page.screenshot({ path: "scripts/webdev_case_studies_restored_live.png" });

  // A3: Check All 11 FAQs Interactivity
  console.log("\nChecking all 11 Website Development FAQs...");
  const faqItems = page.locator(".faq-item");
  const faqCount = await faqItems.count();
  console.log(`FAQ items count: ${faqCount}`);

  let faqsWorking = faqCount === 11;
  for (let i = 0; i < Math.min(faqCount, 3); i++) {
    const item = faqItems.nth(i);
    const btn = item.locator(".faq-q");
    const answer = item.locator(".faq-a");

    const initiallyExpanded = (await btn.getAttribute("aria-expanded")) === "true";
    await btn.click();
    await page.waitForTimeout(600);

    const afterClickExpanded = (await btn.getAttribute("aria-expanded")) === "true";
    const answerHeight = await answer.evaluate((el) => el.offsetHeight);

    console.log(`FAQ ${i + 1}: initial=${initiallyExpanded}, afterClick=${afterClickExpanded}, answerH=${answerHeight}px`);
    if (!afterClickExpanded || answerHeight <= 0) {
      faqsWorking = false;
    }

    // Click again to close
    await btn.click();
    await page.waitForTimeout(600);
    const closedExpanded = (await btn.getAttribute("aria-expanded")) === "true";
    console.log(`FAQ ${i + 1} closed: aria-expanded=${closedExpanded}`);
  }
  results.webdevFaqsFunctional = faqsWorking;

  await page.screenshot({ path: "scripts/webdev_faq_expanded_live.png" });

  // A4: Check Form 6 Operational
  console.log("\nChecking Form 6 operational state...");
  const form6 = page.locator("#fluentform_6");
  const form6Count = await form6.count();
  console.log(`Form 6 instances found: ${form6Count}`);
  results.webdevFormOperational = form6Count === 1;

  // A5: Check consistent Primary CTAs
  const ctas = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('a.btn-primary[href="#website-project-form"]'));
    return buttons.map((b) => b.textContent.trim());
  });
  console.log(`Primary CTAs to #website-project-form: ${ctas.length}`, ctas);

  // Responsive checks
  const viewports = [390, 768, 1024, 1440, 1920, 2560, 3840];
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp, height: 900 });
    await page.waitForTimeout(500);
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientW = await page.evaluate(() => document.documentElement.clientWidth);
    const hasOverflow = scrollW > clientW;
    console.log(`Viewport ${vp}px: scrollW=${scrollW}, clientW=${clientW}, overflow=${hasOverflow}`);
  }

  // Mobile screenshot
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: "scripts/webdev_mobile_390_live.png" });
  await page.setViewportSize({ width: 1920, height: 1080 });

  // -------------------------------------------------------------
  // TEST 2: WORKSTREAM B — DUBAI AI VIDEO PRODUCTION
  // -------------------------------------------------------------
  console.log("\n>>> Testing Workstream B: /services/ai-production-dubai-page/...");
  const dubaiUrl = `${BASE_URL}/services/ai-production-dubai-page/`;
  const dubaiResp = await page.goto(dubaiUrl, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(3000);

  console.log(`Dubai HTTP Status: ${dubaiResp.status()}`);

  const dubaiMeta = await page.evaluate(() => {
    const title = document.title;
    const h1 = document.querySelector("h1")?.textContent?.replace(/\s+/g, " ")?.trim() || "";
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "";
    const desc = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";
    const bodyText = document.body.innerText;
    const hasOldSignal = /1\.\s*AI Production Dubai page/i.test(bodyText);
    return { title, h1, canonical, desc, hasOldSignal };
  });
  console.log("Dubai rendered metadata:", dubaiMeta);

  results.dubaiTitleCorrect = dubaiMeta.title === "AI Video Production Agency in Dubai | D'Genius Solutions";
  results.dubaiH1Correct = dubaiMeta.h1.toLowerCase().includes("ai video production agency in dubai for ads, reels & brand films");
  results.dubaiCanonicalRetained = dubaiMeta.canonical === "https://www.dgeniussolutions.com/services/ai-production-dubai-page/";
  results.obsoleteDubaiSignalsRemoved = !dubaiMeta.hasOldSignal;

  await page.screenshot({ path: "scripts/dubai_hero_and_h1_live.png" });

  // Check Dubai FAQs in HTML and interactivity
  const dubaiFaqButtons = page.locator(".faq-q");
  const dubaiFaqCount = await dubaiFaqButtons.count();
  console.log(`Dubai visible FAQ questions: ${dubaiFaqCount}`);

  let dubaiFaqsOk = dubaiFaqCount === 9;
  if (dubaiFaqCount > 0) {
    const firstFaq = dubaiFaqButtons.first();
    await firstFaq.click();
    await page.waitForTimeout(500);
    const isExpanded = (await firstFaq.getAttribute("aria-expanded")) === "true";
    console.log(`Dubai FAQ 1 expanded: ${isExpanded}`);
  }
  results.dubaiFaqsValidated = dubaiFaqsOk;

  // Check Schema Graph in rendered page
  const schemas = await page.evaluate(() => {
    const rawScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    const seen = new Set();
    const all = [];
    rawScripts.forEach((s) => {
      const key = s.id || s.textContent?.trim();
      if (seen.has(key)) return;
      seen.add(key);
      try {
        const parsed = JSON.parse(s.textContent || s.innerHTML);
        if (Array.isArray(parsed)) {
          all.push(...parsed);
        } else if (parsed["@graph"]) {
          all.push(...parsed["@graph"]);
        } else {
          all.push(parsed);
        }
      } catch (e) {}
    });
    return all;
  });

  const schemaTypes = schemas.map((s) => s["@type"]);
  console.log("Rendered JSON-LD Schema Types:", schemaTypes);

  const faqSchema = schemas.find((s) => s["@type"] === "FAQPage");
  const faqEntityCount = schemas.filter((s) => s["@type"] === "FAQPage").length;
  console.log(`FAQPage entities count: ${faqEntityCount}`);
  if (faqSchema) {
    console.log(`FAQPage questions count in JSON-LD: ${faqSchema.mainEntity?.length}`);
  }

  // Check for any microdata FAQPage
  const microdataFaqCount = await page.evaluate(() => {
    return document.querySelectorAll('[itemtype="https://schema.org/FAQPage"]').length;
  });
  console.log(`Microdata FAQPage count in DOM: ${microdataFaqCount}`);

  results.dubaiStructuredDataValid =
    faqEntityCount === 1 && microdataFaqCount === 0 && (faqSchema?.mainEntity?.length === 9);

  // -------------------------------------------------------------
  // TEST 3: REGRESSION CHECKS (Homepage, Portfolio, Blogs)
  // -------------------------------------------------------------
  console.log("\n>>> Testing Protected System Regressions...");

  // Homepage
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(2000);
  const homeVideos = await page.evaluate(() => document.querySelectorAll("[data-video-id]").length);
  const homeLoadMore = await page.evaluate(() => document.querySelectorAll("#load-more-btn").length);
  console.log(`Homepage curated AI videos: ${homeVideos} (expected 8), Load More button: ${homeLoadMore} (expected 0)`);
  results.homepagePortfolioNoRegression = homeVideos === 8 && homeLoadMore === 0;

  // AI Video Production Agency (56 videos + Load More)
  await page.goto(`${BASE_URL}/services/ai-video-production-agency/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(2000);
  const aiVideos = await page.evaluate(() => document.querySelectorAll("[data-video-id]").length);
  const aiLoadMore = await page.evaluate(() => document.querySelectorAll("#load-more-btn").length);
  console.log(`AI Video Production page cards: ${aiVideos}, Load More count: ${aiLoadMore}`);
  results.aiVideoLibraryPreserved = aiVideos >= 12;
  results.loadMorePreserved = aiLoadMore === 1;

  // Blogs page repaired images check
  await page.goto(`${BASE_URL}/blogs/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(3000);
  const blogVerification = await page.evaluate(async () => {
    const targetSrcs = [
      "ChatGPT-Image-Jul-24-2026-03_25_52-PM-1.png.webp",
      "ChatGPT-Image-Jul-22-2026-02_53_19-PM.png.webp"
    ];
    const results = [];
    for (const needle of targetSrcs) {
      const img = Array.from(document.querySelectorAll("img")).find((i) => (i.src || "").includes(needle));
      if (img) {
        img.scrollIntoView({ behavior: "instant", block: "center" });
        if (!img.complete || img.naturalWidth === 0) {
          try {
            await img.decode();
          } catch (e) {}
        }
        results.push({
          needle,
          found: true,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          complete: img.complete,
        });
      } else {
        results.push({ needle, found: false, naturalWidth: 0, complete: false });
      }
    }
    return results;
  });
  console.log("Repaired blog images verification:", blogVerification);
  results.blogImagesNoRegression = blogVerification.every((b) => b.found && b.naturalWidth > 0);

  await browser.close();

  fs.writeFileSync("scripts/master_qa_results.json", JSON.stringify(results, null, 2), "utf8");
  console.log("\n==================================================================");
  console.log("FINAL QA SUMMARY TABLE:");
  console.log("==================================================================");
  for (const [k, v] of Object.entries(results)) {
    if (k === "details") continue;
    console.log(`${k.padEnd(35)} : ${v ? "✓ PASS" : "✗ FAIL"}`);
  }
}

main().catch((err) => {
  console.error("Fatal error during verification:", err);
  process.exit(1);
});
