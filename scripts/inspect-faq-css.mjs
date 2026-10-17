import { chromium } from "playwright";

async function inspectFaqStyles() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://www.dgeniussolutions.com/services/website-development-amc/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const styleRules = await page.evaluate(() => {
    const el = document.querySelector('.faq-a');
    const matched = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText && el.matches(rule.selectorText)) {
            matched.push({
              selector: rule.selectorText,
              cssText: rule.cssText
            });
          }
        }
      } catch (e) {}
    }
    return matched;
  });

  console.log("Matched CSS rules for .faq-a:", JSON.stringify(styleRules, null, 2));
  await browser.close();
}

inspectFaqStyles().catch(console.error);
