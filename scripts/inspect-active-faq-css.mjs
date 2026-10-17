import { chromium } from "playwright";

async function inspectActiveStyles() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://www.dgeniussolutions.com/services/website-development-amc/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const matched = await page.evaluate(() => {
    const item = document.querySelector('.faq-item');
    item.classList.add('active');
    const a = item.querySelector('.faq-a');

    const rules = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText && a.matches(rule.selectorText)) {
            rules.push({
              selector: rule.selectorText,
              cssText: rule.cssText
            });
          }
        }
      } catch (e) {}
    }
    return rules;
  });

  console.log("Matched rules when active:", JSON.stringify(matched, null, 2));
  await browser.close();
}

inspectActiveStyles().catch(console.error);
