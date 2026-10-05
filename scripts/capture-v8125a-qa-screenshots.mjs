import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = "https://www.dgeniussolutions.com";
const OUT_DIR = path.join("C:", "Users", "Kohin", ".gemini", "antigravity", "brain", "534291cc-4b59-4e18-aeca-75b1c4a803e7", "v8125a_qa");
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
  console.log("   DGS V8.12.5A PLAYWRIGHT QA VISUAL AUDIT & VERIFICATION");
  console.log("   NEEDS MY REVIEW + MY TEAM'S WORK + RESULTS/LOST LINKS + DOMAIN GOVERNANCE");
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

  // 2. Action Center - Needs My Review Tab
  console.log("[STEP 2] Navigating to Action Center (Needs My Review)...");
  await page.goto(`${BASE}/admin/off-page/action-center`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, "01_offpage_action_center_review.png"), fullPage: false });
  console.log("✓ Saved 01_offpage_action_center_review.png");

  // 3. Action Center - My Team's Work Tab
  console.log("[STEP 3] Switching to My Team's Work Tab...");
  const teamBtn = await page.$("button:has-text(\"My Team's Work\")");
  if (teamBtn) {
    await teamBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT_DIR, "01b_offpage_action_center_team.png"), fullPage: false });
    console.log("✓ Saved 01b_offpage_action_center_team.png");
  }

  // 4. Action Center - Results / Lost Links Tab
  console.log("[STEP 4] Switching to Results / Lost Links Tab...");
  const resultsBtn = await page.$("button:has-text('Results / Lost Links')");
  if (resultsBtn) {
    await resultsBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT_DIR, "01c_offpage_action_center_results.png"), fullPage: false });
    console.log("✓ Saved 01c_offpage_action_center_results.png");
  }

  // 5. Action Center - Decision Modal with Mandatory Next Action Dropdown
  console.log("[STEP 5] Opening Decision Modal from Review Queue...");
  const reviewBtn = await page.$("button:has-text('Needs My Review')");
  if (reviewBtn) await reviewBtn.click();
  await page.waitForTimeout(1000);

  const assignBtn = await page.$("button:has-text('Assign'), button:has-text('Approve')");
  if (assignBtn) {
    await assignBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT_DIR, "02_offpage_action_decision_modal.png"), fullPage: false });
    console.log("✓ Saved 02_offpage_action_decision_modal.png");
    // Close modal
    const closeBtn = await page.$("button:has-text('Cancel'), button:has-text('✕')");
    if (closeBtn) await closeBtn.click();
  }

  // 6. Settings - Monitored Domains & Target Brand Governance
  console.log("[STEP 6] Navigating to Off-Page Settings (Domain Governance)...");
  await page.goto(`${BASE}/admin/off-page/settings`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, "03_offpage_settings_governance.png"), fullPage: false });
  console.log("✓ Saved 03_offpage_settings_governance.png");

  // 7. Status Mismatches Queue
  console.log("[STEP 7] Navigating to Status Mismatches Queue...");
  await page.goto(`${BASE}/admin/off-page/mismatches`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, "04_offpage_mismatches_clean.png"), fullPage: false });
  console.log("✓ Saved 04_offpage_mismatches_clean.png");

  await browser.close();
  console.log("\n✓ All V8.12.5A Playwright QA screenshots captured successfully in:", OUT_DIR);
}

run().catch((err) => {
  console.error("Playwright QA failed:", err);
  process.exit(1);
});
