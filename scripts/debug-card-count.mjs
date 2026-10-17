import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto("https://www.dgeniussolutions.com/services/ai-video-production-agency/", { waitUntil: "networkidle" });

const info = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll("#portfolio-gallery .gallery-item"));
  return {
    cardCount: cards.length,
    titles: cards.map((c, i) => `${i+1}. ${c.querySelector("h3")?.textContent?.trim()}`),
    categories: cards.map(c => c.getAttribute("data-categories"))
  };
});

console.log("DOM Card Count in #portfolio-gallery:", info.cardCount);
console.log("Cards in DOM:", info.titles);
await browser.close();
