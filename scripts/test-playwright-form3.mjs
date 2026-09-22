import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
});
const page = await context.newPage();
await page.goto("https://www.dgeniussolutions.com/services/seo-services-in-mumbai/", { waitUntil: "networkidle" });

const form = page.locator("form[data-migration-form]");
await form.scrollIntoViewIfNeeded();
await page.waitForTimeout(2000);

const anchorFrame = page.frames().find(f => f.url().includes("recaptcha/api2/anchor"));
if (anchorFrame) {
  const checkbox = anchorFrame.locator("#recaptcha-anchor");
  await checkbox.click();
  await page.waitForTimeout(3000);

  const bframe = page.frames().find(f => f.url().includes("recaptcha/api2/bframe"));
  if (bframe) {
    console.log("bframe URL:", bframe.url());
    const title = await bframe.title();
    console.log("bframe title:", title);
    const text = await bframe.locator("body").innerText();
    console.log("bframe text:", text.slice(0, 200));
  } else {
    console.log("No bframe found");
  }
}

await browser.close();
