import { chromium } from "playwright";

async function main() {
  const b = await chromium.launch();
  const p = await b.newPage();
  const pageErrors = [];
  p.on("pageerror", err => pageErrors.push(err.message));
  await p.goto("https://www.dgeniussolutions.com/seo-pricing/");
  
  const btn = p.locator("button.b1, button:has-text('Get Started')").first();
  console.log("Button found:", await btn.count(), "text:", (await btn.innerText()).trim());
  await btn.click();
  await p.waitForTimeout(500);
  console.log("Page errors after clicking Get Started:", pageErrors);
  
  const modal = p.locator("#m-fm");
  console.log("Modal visible after click:", await modal.isVisible());

  await b.close();
}

main().catch(console.error);
