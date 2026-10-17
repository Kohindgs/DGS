import { chromium } from "playwright";

async function diagnoseToggle() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://www.dgeniussolutions.com/services/website-development-amc/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const result = await page.evaluate(() => {
    const item = document.querySelector('.faq-item');
    const q = document.querySelector('.faq-q');
    const a = document.querySelector('.faq-a');
    
    const logs = [];
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes') {
          logs.push({
            time: performance.now(),
            target: m.target.className || m.target.tagName,
            attr: m.attributeName,
            oldVal: m.oldValue,
            newVal: m.target.getAttribute(m.attributeName)
          });
        }
      }
    });

    observer.observe(item, { attributes: true, attributeOldValue: true });
    observer.observe(q, { attributes: true, attributeOldValue: true });
    observer.observe(a, { attributes: true, attributeOldValue: true });

    logs.push({ step: "before click", classes: item.className, aria: q.getAttribute("aria-expanded") });
    
    // Trigger click on q
    q.click();

    logs.push({ step: "after click", classes: item.className, aria: q.getAttribute("aria-expanded") });

    return logs;
  });

  console.log("Mutation logs during click:", JSON.stringify(result, null, 2));
  await browser.close();
}

diagnoseToggle().catch(console.error);
