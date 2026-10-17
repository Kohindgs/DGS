import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto("https://www.dgeniussolutions.com/services/ai-video-production-agency/", { waitUntil: "networkidle" });

for (let i = 0; i < 4; i++) {
  const btn = await page.$("#load-more-btn");
  if (btn && await btn.isVisible()) {
    await btn.click();
    await page.waitForTimeout(500);
  }
}

const res = await page.evaluate(() => {
  const allCards = Array.from(document.querySelectorAll("#portfolio-gallery .gallery-item"));
  const hiddenCards = allCards.filter(c => c.classList.contains("is-hidden") || window.getComputedStyle(c).display === "none");
  const visibleCards = allCards.filter(c => !c.classList.contains("is-hidden") && window.getComputedStyle(c).display !== "none");
  return {
    total: allCards.length,
    visible: visibleCards.length,
    hiddenCount: hiddenCards.length,
    hiddenTitles: hiddenCards.map(c => c.querySelector("h3")?.textContent?.trim()),
    btnText: document.getElementById("load-more-btn")?.textContent,
    btnDisplay: window.getComputedStyle(document.getElementById("load-more-btn")).display
  };
});

console.log(res);
await browser.close();
