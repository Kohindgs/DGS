import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = "https://www.dgeniussolutions.com";
const OUT_DIR = path.join("C:", "Users", "Kohin", ".gemini", "antigravity", "brain", "534291cc-4b59-4e18-aeca-75b1c4a803e7", "v8124_qa");

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
  console.log("Capturing 3-Pane Workstation modal screenshot...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1500, height: 1000 } });
  const page = await context.newPage();

  // 1. Authenticate as Admin
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/admin**", { timeout: 15000 });

  // 2. Go to Assessment OS
  await page.goto(`${BASE}/admin/assessment/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // Click Candidate Submissions tab
  const tab = await page.$("button:has-text('Candidate Submissions')");
  if (tab) {
    await tab.click();
    await page.waitForTimeout(1500);
  }

  // Click the 3-Pane Workstation button on the first row (Marcus Sterling)
  const workstationBtn = await page.$("button:has-text('3-Pane Workstation')");
  if (workstationBtn) {
    await workstationBtn.click();
    await page.waitForTimeout(3000);
  }

  await page.screenshot({ path: path.join(OUT_DIR, "08_admin_3pane_workstation_modal.png"), fullPage: false });
  console.log("✓ Saved 08_admin_3pane_workstation_modal.png");

  // Also capture the "Assign Assessment Link" modal showing psychometric toggle
  // Click back to blueprints tab
  const closeBtn = await page.$("button:has-text('Close'), button[aria-label='Close']");
  if (closeBtn) {
    await closeBtn.click().catch(() => {});
    await page.waitForTimeout(1000);
  }

  await page.goto(`${BASE}/admin/assessment/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const blueprintsTab = await page.$("button:has-text('Assessment Blueprints')");
  if (blueprintsTab) {
    await blueprintsTab.click();
    await page.waitForTimeout(1500);
  }

  // Click "Assign Link" on first approved blueprint
  const assignBtn = await page.$("button:has-text('Assign Link'), button:has-text('Assign')");
  if (assignBtn) {
    await assignBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, "09_admin_assign_link_modal.png"), fullPage: false });
    console.log("✓ Saved 09_admin_assign_link_modal.png");
  }

  await browser.close();
}

run().catch(console.error);
