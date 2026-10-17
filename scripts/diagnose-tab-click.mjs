import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on("console", msg => console.log("PAGE LOG:", msg.text()));
  page.on("pageerror", err => console.log("PAGE ERROR:", err.message));
  
  await page.goto("https://www.dgeniussolutions.com/services/ai-video-production-agency/", { waitUntil: "networkidle" });

  const before = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll("#portfolio-gallery .gallery-item"));
    const tab = document.querySelector(".portfolio-filter-tab[data-filter='automobile']");
    const allTabs = Array.from(document.querySelectorAll(".portfolio-filter-tab")).map(t => ({
      text: t.textContent.trim(),
      filter: t.getAttribute("data-filter"),
      href: t.getAttribute("href")
    }));
    return {
      total: items.length,
      tabFound: Boolean(tab),
      allTabs,
      firstItemCats: items[0] ? items[0].getAttribute("data-categories") : null
    };
  });
  console.log("Before click:", JSON.stringify(before, null, 2));

  // Click automobile tab
  console.log("Clicking Automobile tab...");
  await page.evaluate(() => {
    const tab = document.querySelector(".portfolio-filter-tab[data-filter='automobile']");
    if (tab) {
      console.log("Dispatching click on tab:", tab.outerHTML);
      tab.click();
    } else {
      console.log("Tab NOT FOUND in evaluate!");
    }
  });
  await page.waitForTimeout(1000);

  const after = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll("#portfolio-gallery .gallery-item"));
    const visible = items.filter(i => window.getComputedStyle(i).display !== "none");
    const samples = items.slice(0, 10).map(i => ({
      title: i.querySelector("h3")?.textContent,
      displayStyle: i.style.display,
      computedDisplay: window.getComputedStyle(i).display,
      cats: i.getAttribute("data-categories")
    }));
    return {
      total: items.length,
      visibleCount: visible.length,
      samples
    };
  });
  console.log("After click:", JSON.stringify(after, null, 2));
  await browser.close();
}

main().catch(console.error);
