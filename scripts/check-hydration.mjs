import { chromium } from "playwright";

async function checkHydration() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const consoleMessages = [];
  page.on('console', msg => consoleMessages.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', err => consoleMessages.push({ type: 'pageerror', text: err.message }));

  await page.goto('https://www.dgeniussolutions.com/services/website-development-amc/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const scripts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('script')).map(s => s.src || s.textContent.slice(0, 50));
  });

  console.log("Console messages:", consoleMessages.filter(m => m.type === 'error' || m.type === 'pageerror'));
  await browser.close();
}

checkHydration().catch(console.error);
