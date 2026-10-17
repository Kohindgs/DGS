import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("https://www.dgeniussolutions.com/services/ai-video-production-agency/", { waitUntil: "networkidle" });
  const scripts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s, i) => ({
      i,
      len: s.textContent.length,
      start: s.textContent.substring(0, 150),
      end: s.textContent.substring(s.textContent.length - 150),
    }));
  });
  console.log("Scripts in DOM:", JSON.stringify(scripts, null, 2));
  await browser.close();
}

main().catch(console.error);
