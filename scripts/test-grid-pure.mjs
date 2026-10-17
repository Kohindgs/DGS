import { chromium } from "playwright";

async function testGridPure() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://www.dgeniussolutions.com/services/website-development-amc/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const test = await page.evaluate(async () => {
    const item = document.querySelector('.faq-item');
    const a = item.querySelector('.faq-a');
    const q = item.querySelector('.faq-q');

    // Make sure no inline max-height is present
    a.style.maxHeight = "";

    // Toggle active
    item.classList.add("active");
    q.setAttribute("aria-expanded", "true");

    await new Promise(r => setTimeout(r, 450));

    return {
      classes: item.className,
      aHeight: a.offsetHeight,
      gridRows: window.getComputedStyle(a).gridTemplateRows,
      innerText: a.innerText
    };
  });

  console.log("Pure CSS grid toggle test:", test);
  await browser.close();
}

testGridPure().catch(console.error);
