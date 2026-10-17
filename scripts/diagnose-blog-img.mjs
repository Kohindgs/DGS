import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on("requestfailed", r => console.log("FAILED REQ:", r.url(), r.failure()?.errorText));
  page.on("response", r => {
    if (r.url().includes("google-september") || r.url().includes("google-ads") || r.url().includes("cms-media")) {
      console.log("RESPONSE:", r.status(), r.url(), r.headers()["content-type"]);
    }
  });

  console.log("Navigating...");
  await page.goto("https://www.dgeniussolutions.com/blogs/google-september-2026-spam-update-what-website-owners-should-know/", { waitUntil: "networkidle" });
  
  const imgData = await page.evaluate(() => {
    const imgs = [...document.images].map(im => ({
      src: im.src,
      currentSrc: im.currentSrc,
      naturalWidth: im.naturalWidth,
      naturalHeight: im.naturalHeight,
      complete: im.complete
    }));
    return imgs;
  });

  console.log("ALL IMAGES ON PAGE:", JSON.stringify(imgData, null, 2));
  await browser.close();
}

main().catch(console.error);
