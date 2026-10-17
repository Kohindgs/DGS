import { chromium } from "playwright";

async function inspectScripts() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://www.dgeniussolutions.com/services/website-development-amc/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const scriptContents = await page.evaluate(async () => {
    const scripts = Array.from(document.querySelectorAll('script[src*="/_next/static/"]'));
    const matches = [];
    for (const s of scripts) {
      try {
        const resp = await fetch(s.src);
        const text = await resp.text();
        if (text.includes("DgsLocationFaqBoot") || text.includes("dgs-faq-item") || text.includes("faq-item")) {
          matches.push({ src: s.src, hasFaqBoot: text.includes("DgsLocationFaqBoot"), hasDgsFaqItem: text.includes("dgs-faq-item") });
        }
      } catch (e) {}
    }
    return matches;
  });

  console.log("Matching scripts:", scriptContents);
  await browser.close();
}

inspectScripts().catch(console.error);
