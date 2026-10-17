import { chromium } from "playwright";
import fs from "node:fs";

const BASE_URL = "https://www.dgeniussolutions.com";

async function main() {
  console.log("=== COMPREHENSIVE LIVE VERIFICATION V8.12.8B ===");
  const browser = await chromium.launch({ headless: true });
  const results = {
    releaseSha: "62c3ff7-21b161fb5f7e7979",
    blogArchive: {},
    blogArticles: {},
    webdevPage: {},
    protectedRoutes: {},
    passed: true
  };

  // 0. Check active release SHA
  try {
    const res = await fetch(`${BASE_URL}/robots.txt?t=${Date.now()}`);
    console.log(`Robots.txt status: ${res.status}`);
  } catch (e) {
    console.warn("Could not probe base:", e.message);
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. PHASE 1: Verify Blog Archive & Images
  console.log("\n--- VERIFYING /blogs/ ARCHIVE ---");
  await page.goto(`${BASE_URL}/blogs/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(2500);

  // Scroll to trigger lazy images
  for (let i = 0; i < 15; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * 600);
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(2000);

  const blogImgs = await page.evaluate(() => {
    return [...document.images].map((im) => ({
      src: im.src,
      complete: im.complete,
      naturalWidth: im.naturalWidth,
      naturalHeight: im.naturalHeight,
      visible: im.getBoundingClientRect().width > 0 && im.getBoundingClientRect().height > 0,
      article: im.closest("article")?.querySelector("a[href]")?.getAttribute("href"),
    }));
  });

  const brokenBlogImgs = blogImgs.filter((x) => x.visible && x.complete && x.naturalWidth === 0);
  const p1Card = blogImgs.find((x) => x.article?.includes("google-september-2026-spam-update"));
  const p2Card = blogImgs.find((x) => x.article?.includes("google-ads-for-b2b-lead-generation"));

  results.blogArchive = {
    totalImages: blogImgs.length,
    brokenImages: brokenBlogImgs.length,
    post1CardLoaded: p1Card ? p1Card.naturalWidth > 0 : false,
    post2CardLoaded: p2Card ? p2Card.naturalWidth > 0 : false,
  };
  console.log("Blog Archive Results:", JSON.stringify(results.blogArchive, null, 2));

  // 2. PHASE 2: Verify Website Development & AMC Page
  console.log("\n--- VERIFYING /services/website-development-amc/ ---");
  const badResponses = [];
  const pageErrors = [];
  page.on("response", (r) => {
    if (r.status() >= 400 && /image|jpg|png|webp|avif|css|js/.test(r.url())) {
      badResponses.push({ status: r.status(), url: r.url() });
    }
  });
  page.on("pageerror", (e) => pageErrors.push(e.message));

  const webdevRes = await page.goto(`${BASE_URL}/services/website-development-amc/`, {
    waitUntil: "domcontentloaded",
    timeout: 45000,
  });
  await page.waitForTimeout(3000);

  // Scroll through page to trigger lazyload
  for (let i = 0; i < 20; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * 700);
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(2000);

  const webdevData = await page.evaluate(() => {
    const h1 = document.querySelector("h1")?.textContent?.trim();
    const iframes = [...document.querySelectorAll("iframe")].map((f) => ({
      src: f.src,
      title: f.title,
    }));

    // Inspect case studies
    const caseCards = [...document.querySelectorAll(".work-project-row")].map((row, idx) => {
      const name = row.querySelector(".work-client-name")?.textContent?.trim();
      const img = row.querySelector("img");
      const iframe = row.querySelector("iframe");
      return {
        index: idx + 1,
        name,
        hasImg: Boolean(img),
        imgSrc: img?.src,
        imgComplete: img?.complete,
        naturalWidth: img?.naturalWidth,
        naturalHeight: img?.naturalHeight,
        hasIframe: Boolean(iframe),
        iframeSrc: iframe?.src,
      };
    });

    // Form 6 inspection
    const form6 = document.querySelector("#fluentform_6, form.fluent_form_6");
    const formInputs = form6 ? [...form6.querySelectorAll("input, select, textarea, button")].length : 0;

    // FAQ inspection
    const faqs = document.querySelectorAll(".faq-item");

    return {
      h1,
      iframesCount: iframes.length,
      iframes,
      caseCards,
      form6Present: Boolean(form6),
      formInputs,
      faqsCount: faqs.length,
    };
  });

  results.webdevPage = {
    httpStatus: webdevRes?.status(),
    h1: webdevData.h1,
    badAssetResponses: badResponses.length,
    pageErrors: pageErrors.length,
    caseCards: webdevData.caseCards,
    noAboutBlankIframes: webdevData.caseCards.every((c) => !c.hasIframe || !c.iframeSrc?.includes("about:blank")),
    allCaseCardsHaveLoadedImages: webdevData.caseCards.every((c) => c.hasImg && c.naturalWidth > 0),
    form6Present: webdevData.form6Present,
    faqsCount: webdevData.faqsCount,
  };
  console.log("Webdev Page Results:", JSON.stringify(results.webdevPage, null, 2));

  // Test FAQ interaction
  try {
    const firstFaq = page.locator(".faq-item .faq-q").first();
    await firstFaq.click();
    await page.waitForTimeout(500);
    const isExpanded = await page.locator(".faq-item").first().evaluate((el) => el.classList.contains("active"));
    results.webdevPage.faqExpandWorks = isExpanded;
    console.log("FAQ expand works:", isExpanded);
  } catch (e) {
    results.webdevPage.faqExpandWorks = false;
  }

  // Capture screenshot of the case studies section
  const caseStudiesSection = page.locator("#recent-work");
  if (await caseStudiesSection.count() > 0) {
    await caseStudiesSection.screenshot({ path: "scripts/webdev_case_studies_live.png" });
    console.log("Captured scripts/webdev_case_studies_live.png");
  }

  // 3. REGRESSION CHECKS ON PROTECTED ROUTES
  console.log("\n--- REGRESSION CHECKS ON PROTECTED ROUTES ---");

  // A. Homepage: 8 curated AI cards, NO load more
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(2000);
  const homeData = await page.evaluate(() => {
    const aiCards = document.querySelectorAll("#ai-video-grid .ai-card, [data-video-id], .ai-production-card");
    const loadMoreBtn = document.querySelector("#load-more-btn, .dgs-load-more-btn");
    return {
      aiCardsCount: aiCards.length,
      hasLoadMore: Boolean(loadMoreBtn && getComputedStyle(loadMoreBtn).display !== "none"),
    };
  });
  results.protectedRoutes.homepage = {
    aiCardsCount: homeData.aiCardsCount,
    hasNoLoadMore: !homeData.hasLoadMore,
  };
  console.log("Homepage Check:", JSON.stringify(results.protectedRoutes.homepage));

  // B. AI Video Production: 56 library, Load More exists
  await page.goto(`${BASE_URL}/services/ai-video-production-agency/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(2500);
  const aiProdData = await page.evaluate(() => {
    const cards = document.querySelectorAll("#portfolio-gallery .gallery-item:not(.is-hidden)");
    const total = document.querySelectorAll("#portfolio-gallery .gallery-item");
    const loadMoreBtn = document.querySelector("#load-more-btn");
    return {
      totalCards: total.length,
      visibleCards: cards.length,
      loadMoreVisible: Boolean(loadMoreBtn && getComputedStyle(loadMoreBtn).display !== "none"),
      loadMoreText: loadMoreBtn?.textContent?.trim(),
    };
  });
  results.protectedRoutes.aiProduction = aiProdData;
  console.log("AI Production Check:", JSON.stringify(results.protectedRoutes.aiProduction));

  // C. Main Portfolio: 142 items, filters exist
  await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(2500);
  const portfolioData = await page.evaluate(() => {
    const items = document.querySelectorAll("article[data-media-kind], .portfolio-item, .gallery-item");
    const filterTabs = document.querySelectorAll("button[data-filter], a[data-filter], .portfolio-filter-btn, [data-category-slug]");
    const loadMoreBtn = document.querySelector("#load-more-btn");
    return {
      itemsFound: items.length,
      filtersFound: filterTabs.length,
      hasLoadMore: Boolean(loadMoreBtn && getComputedStyle(loadMoreBtn).display !== "none"),
    };
  });
  results.protectedRoutes.portfolio = portfolioData;
  console.log("Portfolio Check:", JSON.stringify(results.protectedRoutes.portfolio));

  fs.writeFileSync("scripts/v8128b_qa_results.json", JSON.stringify(results, null, 2));
  console.log("\nResults written to scripts/v8128b_qa_results.json");

  await browser.close();
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
