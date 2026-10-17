import { chromium } from "playwright";

async function testListeners() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://www.dgeniussolutions.com/services/website-development-amc/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const res = await page.evaluate(() => {
    const root = document.querySelector('.dgs-wp-mirror-inner');
    const q = document.querySelector('.faq-q');
    const item = document.querySelector('.faq-item');
    const ans = document.querySelector('.faq-a');
    
    // Test what happens if we manually execute the toggle logic right now:
    const willOpen = !(item.classList.contains("active") || item.classList.contains("on"));
    item.classList.toggle("active", willOpen);
    q.setAttribute("aria-expanded", String(willOpen));
    
    return {
      classesAfterManualToggle: item.className,
      qAriaAfter: q.getAttribute("aria-expanded"),
      computedGridRows: window.getComputedStyle(ans).gridTemplateRows,
      offsetHeight: ans.offsetHeight
    };
  });

  console.log("Manual toggle evaluation:", res);
  await browser.close();
}

testListeners().catch(console.error);
