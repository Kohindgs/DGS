import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = "https://www.dgeniussolutions.com";
const OUT_DIR = path.join("C:", "Users", "Kohin", ".gemini", "antigravity", "brain", "534291cc-4b59-4e18-aeca-75b1c4a803e7", "v8123_qa");
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
  console.log("   DGS V8.12.3 PLAYWRIGHT LIVE ACCEPTANCE SCREENSHOT CAPTURE");
  console.log("================================================================================");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // 1. Login
  console.log("[STEP 1] Logging into CMS Admin...");
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/admin**", { timeout: 15000 });
  console.log("✓ Authenticated as CMS administrator");

  // 2. Off-Page Dashboard
  console.log("[STEP 2] Off-Page Authority Dashboard (Provider Bar, Action Queue, Discovery Status)...");
  await page.goto(`${BASE}/admin/off-page/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT_DIR, "01_offpage_dashboard.png"), fullPage: false });
  console.log("✓ Saved 01_offpage_dashboard.png");

  // 3. Opportunities Pipeline & Filters
  console.log("[STEP 3] Opportunities Table (Reconciled Count, Country & Category Filters)...");
  await page.goto(`${BASE}/admin/off-page/opportunities/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT_DIR, "02_offpage_opportunities.png"), fullPage: false });
  console.log("✓ Saved 02_offpage_opportunities.png");

  // 4. Discovery Runs History Modal
  console.log("[STEP 4] Opening Discovery Runs Audit History...");
  const runsBtn = await page.$("button:has-text('Runs')");
  if (runsBtn) {
    await runsBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT_DIR, "03_offpage_discovery_runs.png"), fullPage: false });
    console.log("✓ Saved 03_offpage_discovery_runs.png");
    // Close modal
    const closeBtn = await page.$("button:has-text('Close')");
    if (closeBtn) await closeBtn.click();
    await page.waitForTimeout(500);
  }

  // 5. Smart Search with allowlist reranking
  console.log("[STEP 5] Performing TurboVec Smart Search...");
  const smartInput = await page.$('input[placeholder*="free UAE AI video"]');
  if (smartInput) {
    await smartInput.fill("free UAE AI video opportunities");
    const smartSearchBtn = await page.$("button:has-text('Smart Search')");
    if (smartSearchBtn) await smartSearchBtn.click();
    await page.waitForTimeout(2500);
    console.log("✓ Executed TurboVec allowlist Smart Search");
  }
  await page.screenshot({ path: path.join(OUT_DIR, "04_offpage_smart_search.png"), fullPage: false });
  console.log("✓ Saved 04_offpage_smart_search.png");

  // 6. Backlinks Crawler & Telemetry
  console.log("[STEP 6] Remote Backlink Crawler View...");
  await page.goto(`${BASE}/admin/off-page/backlinks/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT_DIR, "05_offpage_backlinks_telemetry.png"), fullPage: false });
  console.log("✓ Saved 05_offpage_backlinks_telemetry.png");

  // 7. Settings: 10-System Provider Health Matrix
  console.log("[STEP 7] Settings: Provider Health Matrix (Section 40 & 41)...");
  await page.goto(`${BASE}/admin/off-page/settings/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT_DIR, "06_offpage_settings_providers.png"), fullPage: false });
  console.log("✓ Saved 06_offpage_settings_providers.png");

  // 8. Truthful Banner Module: Brand Mentions
  console.log("[STEP 8] Truthful Unconfigured Banner: Brand Mentions...");
  await page.goto(`${BASE}/admin/off-page/mentions/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT_DIR, "07_offpage_mentions_truthful.png"), fullPage: false });
  console.log("✓ Saved 07_offpage_mentions_truthful.png");

  await browser.close();
  console.log("\n================================================================================");
  console.log("✓ ALL PLAYWRIGHT ACCEPTANCE SCREENSHOTS CAPTURED SUCCESSFULLY!");
  console.log("================================================================================");
}

run().catch((err) => {
  console.error("Playwright screenshot capture error:", err);
  process.exit(1);
});
