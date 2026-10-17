import { chromium } from "playwright";

async function verifyConflict() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://www.dgeniussolutions.com/services/website-development-amc/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const res = await page.evaluate(async () => {
    const item = document.querySelector('.faq-item');
    const q = document.querySelector('.faq-q');
    const a = document.querySelector('.faq-a');

    // Clone the node or replace with a clone to remove all existing listeners on root,
    // OR test what happens when only one toggle function runs:
    item.classList.toggle("active", true);
    q.setAttribute("aria-expanded", "true");
    
    await new Promise(r => setTimeout(r, 400));
    return {
      classes: item.className,
      aHeight: a.offsetHeight
    };
  });

  console.log("Single toggle result:", res);
  await browser.close();
}

verifyConflict().catch(console.error);
