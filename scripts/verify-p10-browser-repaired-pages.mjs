import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const targetUrls = [
  "https://www.dgeniussolutions.com/blogs/",
  "https://www.dgeniussolutions.com/blogs/google-ads-for-b2b-lead-generation-how-to-get-better-quality-leads/",
  "https://www.dgeniussolutions.com/blogs/google-september-2026-spam-update-what-website-owners-should-know/"
];

const screenshotDir = path.join(process.cwd(), "data/audit/v8115_qa");
await fs.mkdir(screenshotDir, { recursive: true });

async function run() {
  console.log("==================================================");
  console.log("P10 — BROWSER VERIFICATION OF REPAIRED PAGES");
  console.log("==================================================");

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) DGS-Browser-Verify/1.0"
  });

  let totalJsErrors = 0;
  let totalHydrationErrors = 0;
  let totalFailedFetches = 0;

  for (let i = 0; i < targetUrls.length; i++) {
    const url = targetUrls[i];
    const jsErrors = [];
    const hydrationErrors = [];
    const failedFetches = [];

    page.on("pageerror", (err) => {
      const msg = err.message || "";
      if (msg.includes("418") || msg.toLowerCase().includes("hydration") || msg.includes("did not match")) {
        hydrationErrors.push(msg);
      } else {
        jsErrors.push(msg);
      }
    });

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        if (!text.includes("favicon") && !text.includes("Failed to load resource") && !text.includes("chrome-extension://")) {
          if (text.includes("418") || text.toLowerCase().includes("hydration") || text.includes("did not match")) {
            hydrationErrors.push(text);
          } else {
            jsErrors.push(text);
          }
        }
      }
    });

    page.on("requestfailed", (req) => {
      const reqUrl = req.url();
      const failureText = req.failure()?.errorText || "";
      if (
        !reqUrl.includes("google-analytics") &&
        !reqUrl.includes("googletagmanager") &&
        !reqUrl.includes("favicon") &&
        failureText !== "net::ERR_ABORTED"
      ) {
        failedFetches.push({ url: reqUrl, error: failureText });
      }
    });

    console.log(`\nTesting [${i + 1}/${targetUrls.length}]: ${url}`);
    const res = await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    const status = res?.status() || 0;
    const title = await page.title();
    const h1 = await page.locator("h1").first().textContent().catch(() => "NONE");
    const bodyLength = (await page.content()).length;

    const filename = `repaired_page_${i + 1}.png`;
    await page.screenshot({ path: path.join(screenshotDir, filename), fullPage: false });

    console.log(`  HTTP Status: ${status}`);
    console.log(`  Title: ${title}`);
    console.log(`  H1: ${h1?.trim()}`);
    console.log(`  HTML length: ${bodyLength} chars`);
    console.log(`  JS Errors: ${jsErrors.length}`);
    console.log(`  Hydration Errors: ${hydrationErrors.length}`);
    console.log(`  Failed Fetches: ${failedFetches.length}`);
    console.log(`  Screenshot saved: ${filename}`);

    totalJsErrors += jsErrors.length;
    totalHydrationErrors += hydrationErrors.length;
    totalFailedFetches += failedFetches.length;

    page.removeAllListeners("pageerror");
    page.removeAllListeners("console");
    page.removeAllListeners("requestfailed");
  }

  await browser.close();

  console.log("\n==================================================");
  console.log("P10 BROWSER AUDIT SUMMARY");
  console.log("==================================================");
  console.log(`JS_ERRORS = ${totalJsErrors}`);
  console.log(`HYDRATION_ERRORS = ${totalHydrationErrors}`);
  console.log(`FAILED_FETCHES = ${totalFailedFetches}`);
}

run().catch(console.error);
