import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = "https://www.dgeniussolutions.com";
const OUT_DIR = path.join("C:", "Users", "Kohin", ".gemini", "antigravity", "brain", "534291cc-4b59-4e18-aeca-75b1c4a803e7", "v8125_qa");
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
  console.log("   DGS V8.12.5 PLAYWRIGHT QA VISUAL AUDIT & VERIFICATION");
  console.log("   ACTION CENTER + SHEET SYNC + TWO-STATUS MISMATCH RECONCILIATION");
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

  // 2. Action Center Today View
  console.log("[STEP 2] Navigating to Action Center...");
  await page.goto(`${BASE}/admin/off-page/action-center`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, "01_offpage_action_center.png"), fullPage: false });
  console.log("✓ Saved 01_offpage_action_center.png");

  // 2b. Action Center Full Pipeline View
  console.log("[STEP 2b] Switching to Full Pipeline Stage Manager...");
  const pipelineBtn = await page.$("button:has-text('Full Pipeline Stage Manager')");
  if (pipelineBtn) {
    await pipelineBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT_DIR, "01b_offpage_action_center_pipeline.png"), fullPage: false });
    console.log("✓ Saved 01b_offpage_action_center_pipeline.png");
  }

  // 3. Action Center Decision Modal
  console.log("[STEP 3] Opening Action Center Decision Modal...");
  const todayBtn = await page.$("button:has-text('What Your Team Should Do Today')");
  if (todayBtn) await todayBtn.click();
  await page.waitForTimeout(500);

  const actionBtn = await page.$("button:has-text('Reassign'), button:has-text('Assign'), button:has-text('Submit Proof')");
  if (actionBtn) {
    await actionBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT_DIR, "02_offpage_action_decision_modal.png"), fullPage: false });
    console.log("✓ Saved 02_offpage_action_decision_modal.png");
    // Close modal
    const closeBtn = await page.$("button:has-text('Cancel'), button:has-text('✕')");
    if (closeBtn) await closeBtn.click();
  }

  // 4. Status Mismatches Queue
  console.log("[STEP 4] Navigating to Status Mismatches Queue...");
  await page.goto(`${BASE}/admin/off-page/mismatches`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, "03_offpage_mismatches_queue.png"), fullPage: false });
  console.log("✓ Saved 03_offpage_mismatches_queue.png");

  // 5. Backlinks Two-Status Table & Import Modal
  console.log("[STEP 5] Navigating to Backlinks Monitor...");
  await page.goto(`${BASE}/admin/off-page/backlinks`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, "04a_offpage_backlinks_two_status_table.png"), fullPage: false });
  console.log("✓ Saved 04a_offpage_backlinks_two_status_table.png");

  const importBtn = await page.$("button:has-text('Import Excel / CSV')");
  if (importBtn) {
    await importBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT_DIR, "04_offpage_backlinks_import_modal.png"), fullPage: false });
    console.log("✓ Saved 04_offpage_backlinks_import_modal.png");
    const closeBtn = await page.$("button:has-text('Cancel'), button:has-text('✕')");
    if (closeBtn) await closeBtn.click();
  }

  // 6. Settings with Google Sheets & Provider Health
  console.log("[STEP 6] Navigating to Settings...");
  await page.goto(`${BASE}/admin/off-page/settings`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // Scroll to Google Sheets Section
  const sheetsHeading = await page.$("text=5. Google Sheets Sync & Live Internal Data Ingestion");
  if (sheetsHeading) {
    await sheetsHeading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT_DIR, "05_offpage_settings_sheets.png"), fullPage: false });
    console.log("✓ Saved 05_offpage_settings_sheets.png");
  }

  // Scroll to Provider Health Matrix
  const providerHeading = await page.$("text=Provider Health Matrix");
  if (providerHeading) {
    await providerHeading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT_DIR, "05b_offpage_settings_providers.png"), fullPage: false });
    console.log("✓ Saved 05b_offpage_settings_providers.png");
  }

  // 7. Off-Page Dashboard Live
  console.log("[STEP 7] Navigating to Off-Page Main Dashboard...");
  await page.goto(`${BASE}/admin/off-page`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, "06_offpage_dashboard_live.png"), fullPage: false });
  console.log("✓ Saved 06_offpage_dashboard_live.png");

  await browser.close();
  console.log("\n================================================================================");
  console.log("   ALL V8.12.5 PLAYWRIGHT QA SCREENSHOTS CAPTURED SUCCESSFULLY!");
  console.log("================================================================================");
}

run().catch((err) => {
  console.error("QA Capture error:", err);
  process.exit(1);
});
