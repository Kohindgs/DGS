import { chromium } from "playwright";

async function testWithWait() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://www.dgeniussolutions.com/services/website-development-amc/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const res = await page.evaluate(async () => {
    const item = document.querySelector('.faq-item');
    const a = item.querySelector('.faq-a');
    item.classList.add('active');
    
    // Wait for transition
    await new Promise(r => setTimeout(r, 500));

    return {
      classes: item.className,
      gridTemplateRows: window.getComputedStyle(a).gridTemplateRows,
      offsetHeight: a.offsetHeight
    };
  });

  console.log("After 500ms transition:", res);
  await browser.close();
}

testWithWait().catch(console.error);
