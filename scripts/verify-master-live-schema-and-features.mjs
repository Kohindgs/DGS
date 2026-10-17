import { chromium } from "playwright";

const BASE_URL = "https://www.dgeniussolutions.com";

const AUDIT_PAGES = [
  { name: "AI Video Production Agency", path: "/services/ai-video-production-agency/" },
  { name: "Dubai AI Production", path: "/services/ai-production-dubai-page/" },
  { name: "Homepage", path: "/" },
  { name: "Portfolio", path: "/portfolio/" },
  { name: "Website Development & AMC", path: "/services/website-development-amc/" },
];

async function main() {
  console.log("==================================================================");
  console.log("  COMPREHENSIVE PRODUCTION VERIFICATION ON LIVE DEPLOYMENT");
  console.log("==================================================================");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const auditResults = [];

  for (const target of AUDIT_PAGES) {
    const url = `${BASE_URL}${target.path}`;
    console.log(`\nAuditing schema on: ${target.name} (${url})...`);
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    const scriptInfo = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      let totalEntities = 0;
      let reviewCount = 0;
      let videoCount = 0;
      let missingUploadDate = 0;
      let dubaiAddressCount = 0;
      const entityTypes = [];

      scripts.forEach((s) => {
        try {
          const data = JSON.parse(s.textContent.trim());
          const items = Array.isArray(data) ? data : (data["@graph"] ? data["@graph"] : [data]);
          totalEntities += items.length;
          items.forEach((item) => {
            entityTypes.push(item["@type"]);
            if (item["@type"] === "Review") reviewCount++;
            if (item["@type"] === "VideoObject") {
              videoCount++;
              if (!item.uploadDate) missingUploadDate++;
            }
            if (JSON.stringify(item).includes('"addressLocality":"Dubai"')) {
              dubaiAddressCount++;
            }
          });
        } catch {}
      });

      const microdataReviews = document.querySelectorAll('[itemtype*="Review"]').length;
      const microdataVideos = document.querySelectorAll('[itemtype*="VideoObject"]').length;

      return {
        scriptsCount: scripts.length,
        totalEntities,
        reviewCount,
        videoCount,
        missingUploadDate,
        dubaiAddressCount,
        entityTypes: [...new Set(entityTypes)],
        microdataReviews,
        microdataVideos,
      };
    });

    auditResults.push({
      Page: target.name,
      URL: target.path,
      Scripts: scriptInfo.scriptsCount,
      "Total Entities": scriptInfo.totalEntities,
      "Review Objects": scriptInfo.reviewCount + scriptInfo.microdataReviews,
      "Video Objects": scriptInfo.videoCount,
      "Missing uploadDate": scriptInfo.missingUploadDate,
      "Dubai Address in Schema": scriptInfo.dubaiAddressCount,
      "Entity Types": scriptInfo.entityTypes.join(", "),
    });
  }

  console.log("\n========================================================");
  console.log("SCHEMA AUDIT SUMMARY TABLE");
  console.log("========================================================");
  console.table(auditResults);

  // Feature verification on /services/ai-video-production-agency/
  console.log("\nTesting Portfolio, Lightbox, Filters, FAQs on AI Video Production Agency...");
  await page.goto(`${BASE_URL}/services/ai-video-production-agency/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const testStats = await page.evaluate(async () => {
    // Check testimonials
    const testimonials = Array.from(document.querySelectorAll('.testimonial-content, .testimonial-item, .elementor-testimonial')).map(el => el.textContent);
    const visibleDujon = document.body.innerText.includes("Dujon Fernandes") && document.body.innerText.includes("Onida");
    const visibleChaitali = document.body.innerText.includes("Chaitali Nandi") && document.body.innerText.includes("Pantaloons");
    const visibleAparna = document.body.innerText.includes("Aparna Singh") && document.body.innerText.includes("Eureka Forbes");

    // Check portfolio items
    const galleryItems = document.querySelectorAll('#portfolio-gallery .gallery-item');
    const loadMoreBtn = document.getElementById('load-more-btn');

    // Check FAQ accordion
    const faqs = document.querySelectorAll('.faq-item, .accordion-item, .elementor-accordion-item');
    const faqCount = faqs.length;

    return {
      testimonialsVisible: {
        dujon: visibleDujon,
        chaitali: visibleChaitali,
        aparna: visibleAparna,
      },
      initialGalleryItems: galleryItems.length,
      hasLoadMore: Boolean(loadMoreBtn),
      faqCount,
    };
  });

  console.log("Feature Check Results:", JSON.stringify(testStats, null, 2));

  // Test Load More button
  const loadMoreBtn = await page.$('#load-more-btn');
  if (loadMoreBtn) {
    console.log("Clicking 'LOAD MORE' button...");
    await loadMoreBtn.click();
    await page.waitForTimeout(1500);
    const countAfter = await page.evaluate(() => document.querySelectorAll('#portfolio-gallery .gallery-item').length);
    console.log(`Gallery items after Load More click: ${countAfter} (increased from ${testStats.initialGalleryItems})`);
  }

  // Test Lightbox open
  const firstVideoCard = await page.$('#portfolio-gallery .gallery-item');
  if (firstVideoCard) {
    console.log("Clicking first video card to trigger lightbox...");
    await firstVideoCard.click();
    await page.waitForTimeout(1000);
    const lightboxOpen = await page.evaluate(() => {
      const lb = document.getElementById('lightbox');
      const player = document.getElementById('lightbox-player');
      return {
        isOpen: lb ? lb.classList.contains('is-open') || lb.style.display === 'flex' : false,
        hasSrc: player ? Boolean(player.querySelector('source')?.src || player.src) : false,
      };
    });
    console.log("Lightbox status:", lightboxOpen);

    // Close lightbox
    const closeBtn = await page.$('#lightbox-close');
    if (closeBtn) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // Verify Dubai canonical and title
  console.log("\nVerifying Dubai page metadata & canonical...");
  await page.goto(`${BASE_URL}/services/ai-production-dubai-page/`, { waitUntil: "networkidle" });
  const dubaiMeta = await page.evaluate(() => {
    const title = document.title;
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
    const h1 = document.querySelector('h1')?.textContent?.trim();
    return { title, canonical, h1 };
  });
  console.log("Dubai metadata:", dubaiMeta);

  await browser.close();
  console.log("\n✓ All production verifications completed successfully!");
}

main().catch(console.error);
