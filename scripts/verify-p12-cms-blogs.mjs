import { chromium } from "playwright";
import fs from "node:fs";

const env = fs.readFileSync(".env.production", "utf8");
let email = "";
let password = "";
for (const line of env.split(/\r?\n/)) {
  if (line.startsWith("DGS_ADMIN_EMAIL=")) email = line.slice("DGS_ADMIN_EMAIL=".length).trim().replace(/^['"](.*)['"]$/, "$1");
  if (line.startsWith("DGS_ADMIN_PASSWORD=")) password = line.slice("DGS_ADMIN_PASSWORD=".length).trim().replace(/^['"](.*)['"]$/, "$1");
}

async function run() {
  console.log("==================================================");
  console.log("P12 — CMS BLOG RECORD VERIFICATION");
  console.log("==================================================");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // 1. Authenticate
  console.log("Authenticating into CMS...");
  const authRes = await context.request.post("https://www.dgeniussolutions.com/api/admin/session", {
    form: { email, password }
  });
  console.log("Auth status:", authRes.status());

  // 2. Open /admin/blogs/
  console.log("Navigating to /admin/blogs/...");
  await page.goto("https://www.dgeniussolutions.com/admin/blogs/", { waitUntil: "networkidle" });
  const content = await page.content();

  const blog1Found = content.includes("Google Ads for B2B Lead Generation") || content.includes("google-ads-for-b2b-lead-generation");
  const blog2Found = content.includes("Google September 2026 Spam Update") || content.includes("google-september-2026-spam-update");

  console.log(`Blog 1 in list: ${blog1Found ? "YES" : "NO"}`);
  console.log(`Blog 2 in list: ${blog2Found ? "YES" : "NO"}`);

  // Check published status
  const publishedBadgeCount = await page.locator("text=published, text=PUBLISHED").count();
  console.log(`Published badges visible: ${publishedBadgeCount}`);

  await browser.close();
}

run().catch(console.error);
