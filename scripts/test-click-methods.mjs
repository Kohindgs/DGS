import { chromium } from "playwright";

async function testClickMethods() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://www.dgeniussolutions.com/services/website-development-amc/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log("Initial state of FAQ 1:");
  console.log(await page.evaluate(() => {
    const item = document.querySelector('.faq-item');
    const q = document.querySelector('.faq-q');
    const a = document.querySelector('.faq-a');
    return {
      itemClass: item.className,
      aria: q.getAttribute('aria-expanded'),
      aHeight: a.offsetHeight
    };
  }));

  console.log("\nAttempt 1: Playwright locator.click()");
  const btn = page.locator('.faq-q').first();
  await btn.click();
  await page.waitForTimeout(800);

  console.log("After Attempt 1:");
  console.log(await page.evaluate(() => {
    const item = document.querySelector('.faq-item');
    const q = document.querySelector('.faq-q');
    const a = document.querySelector('.faq-a');
    return {
      itemClass: item.className,
      aria: q.getAttribute('aria-expanded'),
      aHeight: a.offsetHeight
    };
  }));

  console.log("\nAttempt 2: Native element.click() in page context");
  await page.evaluate(() => {
    const q = document.querySelectorAll('.faq-q')[1];
    q.click();
  });
  await page.waitForTimeout(800);

  console.log("After Attempt 2 (FAQ 2):");
  console.log(await page.evaluate(() => {
    const item = document.querySelectorAll('.faq-item')[1];
    const q = document.querySelectorAll('.faq-q')[1];
    const a = item.querySelector('.faq-a');
    return {
      itemClass: item.className,
      aria: q.getAttribute('aria-expanded'),
      aHeight: a.offsetHeight
    };
  }));

  await browser.close();
}

testClickMethods().catch(console.error);
