import { chromium } from "playwright";

async function testClickEvaluation() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://www.dgeniussolutions.com/services/website-development-amc/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const testResult = await page.evaluate(() => {
    const btn = document.querySelector('.faq-q');
    const item = document.querySelector('.faq-item');
    const container = document.querySelector('.faq-list');
    
    // Check if DgsLocationFaqBoot listeners are on root
    const root = document.querySelector('.dgs-wp-mirror-inner') || document.body;
    
    // Dispatch a synthetic click event
    const clickEvt = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
    btn.dispatchEvent(clickEvt);
    
    return {
      classesAfterClick: item.className,
      ariaAfterClick: btn.getAttribute('aria-expanded'),
      gridRowsAfterClick: window.getComputedStyle(item.querySelector('.faq-a')).gridTemplateRows
    };
  });

  console.log("Synthetic click evaluation:", testResult);
  await browser.close();
}

testClickEvaluation().catch(console.error);
