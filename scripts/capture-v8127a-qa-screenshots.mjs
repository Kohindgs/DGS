import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = "https://www.dgeniussolutions.com";
const OUT_DIR = path.join("C:", "Users", "Kohin", ".gemini", "antigravity", "brain", "534291cc-4b59-4e18-aeca-75b1c4a803e7", "v8127a_qa");
const ROOT_ARTIFACT_DIR = path.join("C:", "Users", "Kohin", ".gemini", "antigravity", "brain", "534291cc-4b59-4e18-aeca-75b1c4a803e7");
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
  console.log("   DGS V8.12.7A PLAYWRIGHT QA VISUAL AUDIT & SCREENSHOT CAPTURE");
  console.log("   PAGE INTENT + ACTIONABILITY GUIDANCE + ANALYST VERIFICATION QUEUE");
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

  // 2. Action Center - Needs My Review Queue & Actionability Guidance
  console.log("[STEP 2] Navigating to Manager Action Center (/admin/off-page/action-center)...");
  await page.goto(`${BASE}/admin/off-page/action-center`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const p1 = path.join(OUT_DIR, "01_offpage_action_center_review_v8127a.png");
  await page.screenshot({ path: p1, fullPage: false });
  fs.copyFileSync(p1, path.join(ROOT_ARTIFACT_DIR, "01_offpage_action_center_review_v8127a.png"));
  console.log("✓ Saved 01_offpage_action_center_review_v8127a.png");

  // 3. Action Center - Needs Verification (Analyst Queue) Tab
  console.log("[STEP 3] Switching to Needs Verification (Analyst Queue) Tab...");
  const verifBtn = await page.$('button:has-text("Needs Verification")');
  if (verifBtn) {
    await verifBtn.click();
    await page.waitForTimeout(1000);
  }
  const p2 = path.join(OUT_DIR, "02_offpage_action_center_verification_v8127a.png");
  await page.screenshot({ path: p2, fullPage: false });
  fs.copyFileSync(p2, path.join(ROOT_ARTIFACT_DIR, "02_offpage_action_center_verification_v8127a.png"));
  console.log("✓ Saved 02_offpage_action_center_verification_v8127a.png");

  // 4. Discovery Lanes Dashboard
  console.log("[STEP 4] Navigating to Discovery Lanes Dashboard (/admin/off-page/discovery-lanes)...");
  await page.goto(`${BASE}/admin/off-page/discovery-lanes`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const p3 = path.join(OUT_DIR, "03_offpage_discovery_lanes_v8127a.png");
  await page.screenshot({ path: p3, fullPage: false });
  fs.copyFileSync(p3, path.join(ROOT_ARTIFACT_DIR, "03_offpage_discovery_lanes_v8127a.png"));
  console.log("✓ Saved 03_offpage_discovery_lanes_v8127a.png");

  // 5. Settings & Quota Governance
  console.log("[STEP 5] Navigating to Settings (/admin/off-page/settings)...");
  await page.goto(`${BASE}/admin/off-page/settings`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollBy(0, 1100));
  await page.waitForTimeout(1000);
  const p4 = path.join(OUT_DIR, "04_offpage_settings_credentials_v8127a.png");
  await page.screenshot({ path: p4, fullPage: false });
  fs.copyFileSync(p4, path.join(ROOT_ARTIFACT_DIR, "04_offpage_settings_credentials_v8127a.png"));
  console.log("✓ Saved 04_offpage_settings_credentials_v8127a.png");

  // 6. Two-Status Mismatches
  console.log("[STEP 6] Navigating to Two-Status Mismatches (/admin/off-page/mismatches)...");
  await page.goto(`${BASE}/admin/off-page/mismatches`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const p5 = path.join(OUT_DIR, "05_offpage_mismatches_clean_v8127a.png");
  await page.screenshot({ path: p5, fullPage: false });
  fs.copyFileSync(p5, path.join(ROOT_ARTIFACT_DIR, "05_offpage_mismatches_clean_v8127a.png"));
  console.log("✓ Saved 05_offpage_mismatches_clean_v8127a.png");

  await browser.close();
  console.log("\n================================================================================");
  console.log("   ✓ ALL 5 V8.12.7A VISUAL AUDIT SCREENSHOTS CAPTURED SUCCESSFULLY");
  console.log("================================================================================");
}

run().catch((err) => {
  console.error("CAPTURE FAILED:", err);
  process.exit(1);
});
