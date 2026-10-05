import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = "https://www.dgeniussolutions.com";
const OUT_DIR = path.join("C:", "Users", "Kohin", ".gemini", "antigravity", "brain", "534291cc-4b59-4e18-aeca-75b1c4a803e7", "v8126_qa");
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
  console.log("   DGS V8.12.6 PLAYWRIGHT QA VISUAL AUDIT & SCREENSHOT CAPTURE");
  console.log("   DISCOVERY LANES + QUALIFIED ACTION CENTER + MISMATCHES + GOVERNANCE");
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
  await page.screenshot({ path: path.join(OUT_DIR, "01_offpage_discovery_lanes.png"), fullPage: false });
  console.log("✓ Saved 01_offpage_discovery_lanes.png");

  // 3. Action Center - Needs My Review Queue
  console.log("[STEP 3] Navigating to Action Center (/admin/off-page/action-center)...");
  await page.goto(`${BASE}/admin/off-page/action-center`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, "02_offpage_action_center_review.png"), fullPage: false });
  console.log("✓ Saved 02_offpage_action_center_review.png");

  // 4. Action Center - My Team's Work Tab
  console.log("[STEP 4] Switching to My Team's Work Tab...");
  const teamBtn = await page.$("button:has-text(\"My Team's Work\")");
  if (teamBtn) {
    await teamBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT_DIR, "02b_offpage_action_center_team.png"), fullPage: false });
    console.log("✓ Saved 02b_offpage_action_center_team.png");
  }

  // 5. Two-Status Mismatches
  console.log("[STEP 5] Navigating to Two-Status Mismatches (/admin/off-page/mismatches)...");
  await page.goto(`${BASE}/admin/off-page/mismatches`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, "03_offpage_mismatches_clean.png"), fullPage: false });
  console.log("✓ Saved 03_offpage_mismatches_clean.png");

  // 6. Settings & Domain Governance
  console.log("[STEP 6] Navigating to Settings & Monitored Domains (/admin/off-page/settings)...");
  await page.goto(`${BASE}/admin/off-page/settings`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, "04_offpage_settings_governance.png"), fullPage: false });
  console.log("✓ Saved 04_offpage_settings_governance.png");

  await browser.close();
  console.log("\n================================================================================");
  console.log("   ALL V8.12.6 QA SCREENSHOTS CAPTURED SUCCESSFULLY IN v8126_qa");
  console.log("================================================================================");
}

run().catch((err) => {
  console.error("Playwright capture error:", err);
  process.exit(1);
});
