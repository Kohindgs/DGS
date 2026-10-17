import { chromium } from "playwright";

async function probe() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Check Dubai JSON-LD
  console.log("Checking Dubai page...");
  await page.goto('https://www.dgeniussolutions.com/services/ai-production-dubai-page/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const scripts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(s => s.textContent);
  });
  console.log('Dubai JSON-LD scripts count:', scripts.length);
  for (let s of scripts) {
    try {
      const parsed = JSON.parse(s);
      console.log('Script parsed keys:', Object.keys(parsed));
      if (parsed['@graph']) {
        console.log('@graph types:', parsed['@graph'].map(x => x['@type']));
        const faq = parsed['@graph'].find(x => x['@type'] === 'FAQPage');
        if (faq) {
          console.log('FAQPage entities in @graph:', faq.mainEntity?.length);
          console.log('FAQ sample question:', faq.mainEntity?.[0]?.name);
        }
      } else {
        console.log('Type:', parsed['@type']);
      }
    } catch (e) {
      console.log('Error parsing:', e.message);
    }
  }

  // Check Homepage video cards
  console.log("\nChecking Homepage...");
  await page.goto('https://www.dgeniussolutions.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const homeCounts = await page.evaluate(() => {
    return {
      byDataVideoId: document.querySelectorAll('[data-video-id]').length,
      byGridCard: document.querySelectorAll('#ai-video-grid .video-card').length,
      byGridAny: document.querySelectorAll('#ai-video-grid > *').length,
      byVideoCard: document.querySelectorAll('.video-card').length,
      gridExists: !!document.getElementById('ai-video-grid'),
      gridClassNames: Array.from(document.querySelectorAll('#ai-video-grid > *')).map(el => el.className)
    };
  });
  console.log('Home video counts:', homeCounts);

  // Check AI Video Production Agency
  console.log("\nChecking AI Video Production Agency...");
  await page.goto('https://www.dgeniussolutions.com/services/ai-video-production-agency/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const agencyCounts = await page.evaluate(() => {
    return {
      byDataVideoId: document.querySelectorAll('[data-video-id]').length,
      byVideoCard: document.querySelectorAll('.video-card').length,
      loadMoreBtn: document.querySelectorAll('#load-more-btn').length
    };
  });
  console.log('Agency video counts:', agencyCounts);

  // Check Webdev FAQ
  console.log("\nChecking Webdev FAQ...");
  await page.goto('https://www.dgeniussolutions.com/services/website-development-amc/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const faqData = await page.evaluate(() => {
    const items = document.querySelectorAll('.faq-item');
    const questions = document.querySelectorAll('.faq-q');
    const firstQ = questions[0];
    const details = document.querySelectorAll('details.faq-item');
    return {
      itemsCount: items.length,
      detailsCount: details.length,
      qCount: questions.length,
      firstQTag: firstQ?.tagName,
      firstQClasses: firstQ?.className,
      firstQText: firstQ?.textContent?.trim(),
      firstQParentClasses: firstQ?.parentElement?.className,
      firstQAriaExpanded: firstQ?.getAttribute('aria-expanded'),
      firstAHeight: document.querySelector('.faq-a')?.offsetHeight
    };
  });
  console.log('Webdev FAQ data:', faqData);

  // Test Webdev FAQ click
  const firstFaqBtn = page.locator('.faq-q').first();
  console.log('Clicking first Webdev FAQ button...');
  await firstFaqBtn.click();
  await page.waitForTimeout(600);
  const postClick = await page.evaluate(() => {
    const firstQ = document.querySelectorAll('.faq-q')[0];
    const firstItem = document.querySelectorAll('.faq-item')[0];
    const firstA = document.querySelector('.faq-a');
    return {
      itemClass: firstItem?.className,
      qAriaExpanded: firstQ?.getAttribute('aria-expanded'),
      aHeight: firstA?.offsetHeight,
      computedDisplay: window.getComputedStyle(firstA).display,
      computedHeight: window.getComputedStyle(firstA).height
    };
  });
  console.log('Post-click FAQ 1 state:', postClick);

  // Check Blogs
  console.log("\nChecking Blogs images...");
  await page.goto('https://www.dgeniussolutions.com/blogs/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const blogBroken = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs.filter(img => img.naturalWidth === 0).map(img => img.src);
  });
  console.log('Blogs broken images:', blogBroken.length, blogBroken);

  await browser.close();
}

probe().catch(console.error);
