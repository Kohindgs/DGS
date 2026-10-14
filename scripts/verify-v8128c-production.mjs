import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "https://www.dgeniussolutions.com";

const VIEWPORTS = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "laptop-1024", width: 1024, height: 768 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "desktop-1920", width: 1920, height: 1080 },
  { name: "desktop-2560", width: 2560, height: 1440 },
  { name: "desktop-3840", width: 3840, height: 2160 },
];

async function main() {
  console.log("================================================================");
  console.log("  DGS PRODUCTION QA — REPROCESSED WEBDEV & BLOG REPAIR VERIFIER");
  console.log("  Target Host:", BASE_URL);
  console.log("================================================================\n");

  const browser = await chromium.launch({ headless: true });
  const results = {
    timestamp: new Date().toISOString(),
    targetHost: BASE_URL,
    releaseSha: null,
    phase1_blogRepairs: {},
    phase2_webdevPage: {},
    phase3_protectedRoutes: {},
    passed: true,
    failures: [],
  };

  // Helper failure logger
  function recordFailure(step, reason) {
    console.error(`[FAIL] [${step}] ${reason}`);
    results.failures.push({ step, reason });
    results.passed = false;
  }

  // 0. Probe release SHA & connectivity
  try {
    const robotsRes = await fetch(`${BASE_URL}/robots.txt?t=${Date.now()}`);
    console.log(`[INIT] Health probe /robots.txt status: ${robotsRes.status}`);
  } catch (err) {
    recordFailure("INIT", `Cannot connect to ${BASE_URL}: ${err.message}`);
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // ===========================================================================
  // PHASE 1: BLOG REPAIRS VERIFICATION
  // ===========================================================================
  console.log("\n>>> [PHASE 1] VERIFYING BLOG REPAIRS (/blogs/ & ARTICLES) <<<");
  await page.goto(`${BASE_URL}/blogs/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(2500);

  // Scroll through blog page to trigger lazy loading
  for (let i = 0; i < 15; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * 600);
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(1500);

  const blogArchiveImgs = await page.evaluate(() => {
    return [...document.images].map((im) => ({
      src: im.src,
      complete: im.complete,
      naturalWidth: im.naturalWidth,
      naturalHeight: im.naturalHeight,
      visible: im.getBoundingClientRect().width > 0 && im.getBoundingClientRect().height > 0,
      articleHref: im.closest("article")?.querySelector("a[href]")?.getAttribute("href") || "",
    }));
  });

  const brokenBlogImgs = blogArchiveImgs.filter((x) => x.visible && x.complete && x.naturalWidth === 0);
  const card1 = blogArchiveImgs.find((x) => x.articleHref.includes("google-september-2026-spam-update"));
  const card2 = blogArchiveImgs.find((x) => x.articleHref.includes("google-ads-for-b2b-lead-generation"));

  results.phase1_blogRepairs.blogArchive = {
    totalImages: blogArchiveImgs.length,
    brokenImagesCount: brokenBlogImgs.length,
    card1_spamUpdate: card1 ? { naturalWidth: card1.naturalWidth, src: card1.src } : null,
    card2_b2bLeads: card2 ? { naturalWidth: card2.naturalWidth, src: card2.src } : null,
  };

  if (brokenBlogImgs.length > 0) {
    recordFailure("PHASE1_BLOG_ARCHIVE", `Found ${brokenBlogImgs.length} broken images on /blogs/ archive!`);
  }
  if (!card1 || card1.naturalWidth === 0) {
    recordFailure("PHASE1_BLOG_CARD1", "Spam Update blog card image is missing or has naturalWidth === 0!");
  }
  if (!card2 || card2.naturalWidth === 0) {
    recordFailure("PHASE1_BLOG_CARD2", "B2B Leads blog card image is missing or has naturalWidth === 0!");
  }

  // Check Single Post 1
  const post1Url = `${BASE_URL}/blogs/google-september-2026-spam-update-what-website-owners-should-know/`;
  console.log(`Checking Single Post 1: ${post1Url}`);
  const post1Res = await page.goto(post1Url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(2000);
  const post1Featured = await page.evaluate(() => {
    const featured = document.querySelector(".blog-featured-image img, article img");
    return {
      src: featured?.src,
      complete: featured?.complete,
      naturalWidth: featured?.naturalWidth || 0,
      naturalHeight: featured?.naturalHeight || 0,
    };
  });
  results.phase1_blogRepairs.post1 = {
    httpStatus: post1Res?.status(),
    featured: post1Featured,
  };
  if (post1Res?.status() !== 200) {
    recordFailure("PHASE1_POST1_HTTP", `Post 1 returned HTTP status ${post1Res?.status()}`);
  }
  if (post1Featured.naturalWidth === 0) {
    recordFailure("PHASE1_POST1_IMG", "Post 1 featured image failed to load (naturalWidth === 0)!");
  }

  // Check Single Post 2
  const post2Url = `${BASE_URL}/blogs/google-ads-for-b2b-lead-generation-how-to-get-better-quality-leads/`;
  console.log(`Checking Single Post 2: ${post2Url}`);
  const post2Res = await page.goto(post2Url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(2000);
  const post2Featured = await page.evaluate(() => {
    const featured = document.querySelector(".blog-featured-image img, article img");
    return {
      src: featured?.src,
      complete: featured?.complete,
      naturalWidth: featured?.naturalWidth || 0,
      naturalHeight: featured?.naturalHeight || 0,
    };
  });
  results.phase1_blogRepairs.post2 = {
    httpStatus: post2Res?.status(),
    featured: post2Featured,
  };
  if (post2Res?.status() !== 200) {
    recordFailure("PHASE1_POST2_HTTP", `Post 2 returned HTTP status ${post2Res?.status()}`);
  }
  if (post2Featured.naturalWidth === 0) {
    recordFailure("PHASE1_POST2_IMG", "Post 2 featured image failed to load (naturalWidth === 0)!");
  }

  console.log("Phase 1 Blog Repairs Results:", JSON.stringify(results.phase1_blogRepairs, null, 2));

  // ===========================================================================
  // PHASE 2: WEBSITE DEVELOPMENT & AMC PAGE VERIFICATION
  // ===========================================================================
  console.log("\n>>> [PHASE 2] VERIFYING /services/website-development-amc/ <<<");
  const badAssets = [];
  const consoleErrors = [];
  page.on("response", (res) => {
    if (res.status() >= 400 && /image|jpg|png|webp|avif|css|js/.test(res.url())) {
      badAssets.push({ status: res.status(), url: res.url() });
    }
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  const webdevUrl = `${BASE_URL}/services/website-development-amc/`;
  const webdevRes = await page.goto(webdevUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(3000);

  // Progressive scroll to load images & check render
  for (let i = 0; i < 25; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * 600);
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(2000);

  // 1. Verify 14 Sections in Exact Order
  const EXPECTED_SECTION_IDS = [
    "hero-section",
    "trust-indicators",
    "webdev-services",
    "selected-projects",
    "why-dgs",
    "development-process",
    "tech-stack",
    "redesign-migration",
    "seo-aeo-geo",
    "website-amc",
    "coverage-locations",
    "webdev-faqs",
    "final-cta",
    "website-project-form",
  ];

  const pageSections = await page.evaluate(() => {
    const mainWrap = document.querySelector(".reprocessed-webdev-page") || document.body;
    const sections = [...mainWrap.querySelectorAll("section")].map((sec, idx) => ({
      index: idx + 1,
      id: sec.id,
      classes: sec.className,
      h1: sec.querySelector("h1")?.textContent?.trim() || null,
      h2: sec.querySelector("h2")?.textContent?.trim() || null,
    }));
    return sections;
  });

  results.phase2_webdevPage.sectionsFound = pageSections;

  console.log(`Found ${pageSections.length} sections on page.`);
  pageSections.forEach((s) => console.log(`  Section ${s.index}: id="${s.id}" | h2="${s.h2 || s.h1 || ''}"`));

  if (pageSections.length !== 14) {
    recordFailure("PHASE2_SECTIONS_COUNT", `Expected 14 sections, found ${pageSections.length}`);
  }

  EXPECTED_SECTION_IDS.forEach((expectedId, idx) => {
    const actualSec = pageSections[idx];
    if (!actualSec || actualSec.id !== expectedId) {
      recordFailure(
        "PHASE2_SECTION_ORDER",
        `Section at index ${idx + 1} mismatch: expected id="${expectedId}", got id="${actualSec?.id}"`
      );
    }
  });

  // 2. Case Studies (Selected Projects)
  const caseStudies = await page.evaluate(() => {
    const cards = [...document.querySelectorAll("#selected-projects .project-card")].map((card, idx) => {
      const client = card.querySelector(".project-client")?.textContent?.trim();
      const title = card.querySelector(".project-title")?.textContent?.trim();
      const img = card.querySelector("img");
      const iframe = card.querySelector("iframe");
      return {
        index: idx + 1,
        client,
        title,
        hasImg: Boolean(img),
        imgSrc: img?.src,
        complete: img?.complete,
        naturalWidth: img?.naturalWidth || 0,
        naturalHeight: img?.naturalHeight || 0,
        hasIframe: Boolean(iframe),
      };
    });
    return cards;
  });

  results.phase2_webdevPage.caseStudies = caseStudies;
  console.log("Case Studies Inspection:", JSON.stringify(caseStudies, null, 2));

  if (caseStudies.length !== 4) {
    recordFailure("PHASE2_CASE_STUDIES_COUNT", `Expected 4 case study cards, found ${caseStudies.length}`);
  }
  caseStudies.forEach((cs) => {
    if (!cs.hasImg || cs.naturalWidth === 0) {
      recordFailure("PHASE2_CASE_STUDY_IMG", `Case study "${cs.client}" image failed to load (naturalWidth: ${cs.naturalWidth})`);
    }
    if (cs.hasIframe) {
      recordFailure("PHASE2_CASE_STUDY_IFRAME", `Case study "${cs.client}" has an iframe! Expected static image.`);
    }
  });

  // 3. Primary CTAs Text & Target
  const primaryCtas = await page.evaluate(() => {
    const ctas = [...document.querySelectorAll("a.btn-primary, button.btn-primary")].map((el) => ({
      text: el.textContent?.trim(),
      href: el.getAttribute("href"),
      tag: el.tagName.toLowerCase(),
    }));
    return ctas;
  });

  results.phase2_webdevPage.primaryCtas = primaryCtas;
  console.log("Primary CTAs Inspection:", JSON.stringify(primaryCtas, null, 2));

  primaryCtas.forEach((cta, idx) => {
    if (cta.text !== "START YOUR WEBSITE PROJECT") {
      recordFailure(
        "PHASE2_CTA_TEXT",
        `Primary CTA ${idx + 1} has text "${cta.text}", expected "START YOUR WEBSITE PROJECT"`
      );
    }
    if (cta.href !== "#website-project-form") {
      recordFailure(
        "PHASE2_CTA_HREF",
        `Primary CTA ${idx + 1} has href "${cta.href}", expected "#website-project-form"`
      );
    }
  });

  // 4. Form 6 Inspection
  const form6Details = await page.evaluate(() => {
    const form = document.querySelector("#fluentform_6, form.fluent_form_6");
    if (!form) return { present: false };
    const inputs = [...form.querySelectorAll("input, select, textarea, button")].map((inp) => ({
      name: inp.getAttribute("name"),
      type: inp.getAttribute("type") || inp.tagName.toLowerCase(),
      id: inp.id,
    }));
    return {
      present: true,
      id: form.id,
      action: form.getAttribute("action"),
      inputsCount: inputs.length,
      hasSubmitBtn: Boolean(form.querySelector("button[type='submit'], input[type='submit']")),
    };
  });

  results.phase2_webdevPage.form6 = form6Details;
  console.log("Form 6 Inspection:", JSON.stringify(form6Details, null, 2));
  if (!form6Details.present) {
    recordFailure("PHASE2_FORM6_PRESENT", "Form 6 (#fluentform_6) is NOT present on the page!");
  }
  if (!form6Details.hasSubmitBtn) {
    recordFailure("PHASE2_FORM6_SUBMIT", "Form 6 submit button is missing!");
  }

  // 5. FAQ Accordion Interaction
  const faqData = await page.evaluate(() => {
    const items = [...document.querySelectorAll("#webdev-faqs .faq-item")].map((item, idx) => ({
      index: idx + 1,
      question: item.querySelector(".faq-question")?.textContent?.trim(),
      hasAnswer: Boolean(item.querySelector(".faq-answer")),
      isActive: item.classList.contains("active"),
    }));
    return items;
  });

  results.phase2_webdevPage.faqs = {
    count: faqData.length,
    items: faqData,
  };
  console.log(`Found ${faqData.length} FAQs in #webdev-faqs`);
  if (faqData.length !== 11) {
    recordFailure("PHASE2_FAQ_COUNT", `Expected 11 FAQ items, found ${faqData.length}`);
  }

  // Test click toggle on first FAQ
  try {
    const firstFaqTrigger = page.locator("#webdev-faqs .faq-question").first();
    await firstFaqTrigger.click();
    await page.waitForTimeout(400);
    const isFirstActive = await page.locator("#webdev-faqs .faq-item").first().evaluate((el) => el.classList.contains("active"));
    results.phase2_webdevPage.faqClickExpanded = isFirstActive;
    if (!isFirstActive) {
      recordFailure("PHASE2_FAQ_INTERACTION", "Clicking FAQ question did not toggle .active class!");
    }
  } catch (err) {
    recordFailure("PHASE2_FAQ_INTERACTION", `Error clicking FAQ: ${err.message}`);
  }

  // 6. Viewport Responsive & Horizontal Overflow Checks
  console.log("\nTesting responsive viewports and horizontal overflow...");
  const viewportResults = [];
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(500);

    const vpMetrics = await page.evaluate(() => {
      const docEl = document.documentElement;
      const body = document.body;
      const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
      const clientWidth = docEl.clientWidth;
      const hasOverflow = scrollWidth > clientWidth + 1; // 1px threshold for subpixel rounding

      // Check max container width
      const containers = [...document.querySelectorAll(".reprocessed-webdev-page .section-container")];
      const maxWidthViolations = containers.filter((c) => c.getBoundingClientRect().width > 1280);

      return {
        clientWidth,
        scrollWidth,
        hasOverflow,
        maxWidthViolationsCount: maxWidthViolations.length,
      };
    });

    viewportResults.push({
      viewport: vp.name,
      width: vp.width,
      ...vpMetrics,
    });

    if (vpMetrics.hasOverflow) {
      recordFailure(
        `PHASE2_VIEWPORT_${vp.name}`,
        `Horizontal overflow detected at ${vp.width}px! scrollWidth=${vpMetrics.scrollWidth}, clientWidth=${vpMetrics.clientWidth}`
      );
    }
  }
  results.phase2_webdevPage.viewportChecks = viewportResults;

  // Capture Visual Screenshots
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);

  // Take screenshot of case studies
  const projectsSec = page.locator("#selected-projects");
  if (await projectsSec.count() > 0) {
    await projectsSec.screenshot({ path: "scripts/webdev_case_studies_live.png" });
    console.log("Captured scripts/webdev_case_studies_live.png");
  }

  // Take screenshot of Hero
  const heroSec = page.locator("#hero-section");
  if (await heroSec.count() > 0) {
    await heroSec.screenshot({ path: "scripts/webdev_hero_live.png" });
    console.log("Captured scripts/webdev_hero_live.png");
  }

  // Take screenshot of Form
  const formSec = page.locator("#website-project-form");
  if (await formSec.count() > 0) {
    await formSec.screenshot({ path: "scripts/webdev_form_live.png" });
    console.log("Captured scripts/webdev_form_live.png");
  }

  // ===========================================================================
  // PHASE 3: PROTECTED ROUTES NON-REGRESSION
  // ===========================================================================
  console.log("\n>>> [PHASE 3] VERIFYING PROTECTED ROUTES NON-REGRESSION <<<");

  // 1. Homepage: 8 curated AI cards, NO Load More button
  console.log("Checking Homepage (/)");
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(2000);
  const homeData = await page.evaluate(() => {
    const aiCards = document.querySelectorAll("#ai-video-grid .ai-card, [data-video-id], .ai-production-card");
    const loadMoreBtn = document.querySelector("#load-more-btn, .dgs-load-more-btn");
    const isBtnVisible = Boolean(loadMoreBtn && getComputedStyle(loadMoreBtn).display !== "none");
    return {
      aiCardsCount: aiCards.length,
      hasLoadMoreButton: isBtnVisible,
    };
  });
  results.phase3_protectedRoutes.homepage = homeData;
  console.log("Homepage status:", JSON.stringify(homeData));
  if (homeData.hasLoadMoreButton) {
    recordFailure("PHASE3_HOMEPAGE", "Homepage must NOT have a visible Load More button!");
  }

  // 2. AI Video Production Agency: 56 library, Load More visible
  console.log("Checking AI Video Production (/services/ai-video-production-agency/)");
  await page.goto(`${BASE_URL}/services/ai-video-production-agency/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(2500);
  const aiProdData = await page.evaluate(() => {
    const allCards = document.querySelectorAll("#portfolio-gallery .gallery-item");
    const visibleCards = document.querySelectorAll("#portfolio-gallery .gallery-item:not(.is-hidden)");
    const loadMoreBtn = document.querySelector("#load-more-btn");
    const isVisible = Boolean(loadMoreBtn && getComputedStyle(loadMoreBtn).display !== "none");
    return {
      totalCards: allCards.length,
      visibleCards: visibleCards.length,
      loadMoreVisible: isVisible,
      loadMoreText: loadMoreBtn?.textContent?.trim(),
    };
  });
  results.phase3_protectedRoutes.aiProduction = aiProdData;
  console.log("AI Video Production status:", JSON.stringify(aiProdData));
  if (aiProdData.totalCards !== 56) {
    recordFailure("PHASE3_AI_TOTAL", `Expected 56 cards in AI Video Production, found ${aiProdData.totalCards}`);
  }
  if (!aiProdData.loadMoreVisible) {
    recordFailure("PHASE3_AI_LOAD_MORE", "Load More button is NOT visible on AI Video Production page!");
  }

  // 3. Main Portfolio
  console.log("Checking Main Portfolio (/portfolio/)");
  await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(2500);
  const portfolioData = await page.evaluate(() => {
    const items = document.querySelectorAll("article[data-media-kind], .portfolio-item, .gallery-item");
    const filters = document.querySelectorAll("button[data-filter], a[data-filter], .portfolio-filter-btn, [data-category-slug]");
    return {
      itemsCount: items.length,
      filtersCount: filters.length,
    };
  });
  results.phase3_protectedRoutes.portfolio = portfolioData;
  console.log("Main Portfolio status:", JSON.stringify(portfolioData));
  if (portfolioData.itemsCount === 0) {
    recordFailure("PHASE3_PORTFOLIO", "No items found on Main Portfolio page!");
  }

  // Summary and Output
  fs.writeFileSync("scripts/v8128c_production_results.json", JSON.stringify(results, null, 2));
  console.log("\n================================================================");
  console.log(`  VERIFICATION COMPLETE — OVERALL RESULT: ${results.passed ? "PASS" : "FAIL"}`);
  console.log(`  Total Failures: ${results.failures.length}`);
  if (!results.passed) {
    console.log("  Failures list:");
    results.failures.forEach((f) => console.log(`    - [${f.step}] ${f.reason}`));
  }
  console.log("================================================================\n");

  await browser.close();

  if (!results.passed) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error during verification:", err);
  process.exit(1);
});
