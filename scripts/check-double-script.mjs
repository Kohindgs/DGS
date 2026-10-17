import { chromium } from "playwright";

async function checkDoubleScript() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://www.dgeniussolutions.com/services/ai-production-dubai-page/', { waitUntil: 'commit' });
  const onCommit = await page.evaluate(() => document.querySelectorAll('script[type="application/ld+json"]').length);
  
  await page.waitForLoadState('domcontentloaded');
  const onDom = await page.evaluate(() => document.querySelectorAll('script[type="application/ld+json"]').length);

  await page.waitForTimeout(2000);
  const afterWait = await page.evaluate(() => document.querySelectorAll('script[type="application/ld+json"]').length);

  console.log({ onCommit, onDom, afterWait });
  await browser.close();
}

checkDoubleScript().catch(console.error);
