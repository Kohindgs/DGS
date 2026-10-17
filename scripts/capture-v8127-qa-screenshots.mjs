import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = "https://www.dgeniussolutions.com";
const OUT_DIR = path.join("C:", "Users", "Kohin", ".gemini", "antigravity", "brain", "534291cc-4b59-4e18-aeca-75b1c4a803e7", "v8127_qa");
fs.mkdirSync(OUT_DIR, { recursive: true });

// Read credentials
const env = fs.readFileSync(".env.production", "utf8");
let email = "";
let password = "";
for (const line of env.split(/\r?\n/)) {
  if (line.startsWith("DGS_ADMIN_EMAIL=")) {
    email = line.slice("DGS_ADMIN_EMAIL=".length).trim().replace(/^['"](.*)['"]$/, "$1");
  }
  if (line.startsWith("DGS_ADMIN_PASSWORD=")) {
    password = line.slice("DGS_ADMIN_PASSWORD=".length).trim().replace(/^['"](.*)['"]$/, "$1");
  }
}

async function run() {
  console.log("================================================================================");
  console.log("   DGS V8.12.7 PLAYWRIGHT QA VISUAL AUDIT & SCREENSHOT CAPTURE");
  console.log("   LIVE ACQUISITION + WEB SEARCH ACTIVE + ACTION CENTER + GOVERNANCE");
  console.log("================================================================================");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
  });
  const page = await context.newPage();

  // 1. Authenticate as Admin
  console.log("[STEP 1] Logging into CMS Admin...");
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/admin**", { timeout: 15000 });
  console.log("✓ Authenticated as CMS administrator");

  // 2. Discovery Lanes Dashboard
  console.log("[STEP 2] Navigating to Discovery Lanes Dashboard (/admin/off-page/discovery-lanes)...");
  await page.goto(`${BASE}/admin/off-page/discovery-lanes`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, "01_offpage_discovery_lanes_v8127.png"), fullPage: false });
  console.log("✓ Saved 01_offpage_discovery_lanes_v8127.png");

  // 3. Settings & Search Providers Quota Governance
  console.log("[STEP 3] Navigating to Settings & Search Governance (/admin/off-page/settings)...");
  await page.goto(`${BASE}/admin/off-page/settings`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  // Scroll down to Section 5b
  await page.evaluate(() => window.scrollBy(0, 1100));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, "02_offpage_settings_credentials_v8127.png"), fullPage: false });
  console.log("✓ Saved 02_offpage_settings_credentials_v8127.png");

  // 4. Action Center - Needs My Review Queue
  console.log("[STEP 4] Navigating to Action Center (/admin/off-page/action-center)...");
  await page.goto(`${BASE}/admin/off-page/action-center`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(OUT_DIR, "03_offpage_action_center_v8127.png"), fullPage: false });
  console.log("✓ Saved 03_offpage_action_center_v8127.png");

  // 5. Two-Status Mismatches
  console.log("[STEP 5] Navigating to Two-Status Mismatches (/admin/off-page/mismatches)...");
  await page.goto(`${BASE}/admin/off-page/mismatches`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, "04_offpage_mismatches_v8127.png"), fullPage: false });
  console.log("✓ Saved 04_offpage_mismatches_v8127.png");

  await browser.close();
  console.log("\n================================================================================");
  console.log("   ALL V8.12.7 QA SCREENSHOTS CAPTURED SUCCESSFULLY IN v8127_qa");
  console.log("================================================================================");
}

run().catch((err) => {
  console.error("Playwright capture error:", err);
  process.exit(1);
});
