import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = "https://www.dgeniussolutions.com";
const OUT_DIR = path.join("C:", "Users", "Kohin", ".gemini", "antigravity", "brain", "534291cc-4b59-4e18-aeca-75b1c4a803e7", "v8122_qa");
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
  console.log("Launching headless browser for V8.12.2 QA screenshots...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // Login
  console.log("Logging into admin...");
  await page.goto(`${BASE}/admin/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/admin**", { timeout: 15000 });
  console.log("✓ Logged into CMS successfully");

  // 1. Dashboard
  console.log("Capturing 01_offpage_dashboard...");
  await page.goto(`${BASE}/admin/off-page/`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(OUT_DIR, "01_offpage_dashboard.png"), fullPage: false });
  console.log("✓ Saved 01_offpage_dashboard.png");

  // 2. Opportunities view with target page matching
  console.log("Capturing 02_offpage_opportunities...");
  await page.goto(`${BASE}/admin/off-page/opportunities/`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(OUT_DIR, "02_offpage_opportunities.png"), fullPage: false });
  console.log("✓ Saved 02_offpage_opportunities.png");

  // 3. Open Grounding / Outreach Draft modal
  console.log("Capturing 03_offpage_grounding_modal...");
  const draftBtn = await page.$("button:has-text('Draft Pitch'), button:has-text('Draft')");
  if (draftBtn) {
    await draftBtn.click();
    await page.waitForTimeout(2000); // Allow grounding API to resolve assets
    await page.screenshot({ path: path.join(OUT_DIR, "03_offpage_grounding_modal.png"), fullPage: false });
    console.log("✓ Saved 03_offpage_grounding_modal.png");
    
    // Close modal if open
    const cancelBtn = await page.$("button:has-text('Cancel')");
    if (cancelBtn) await cancelBtn.click();
  } else {
    console.log("Draft button not found on opportunities view");
  }

  // 4. Outreach drafts view
  console.log("Capturing 04_offpage_outreach_drafts...");
  await page.goto(`${BASE}/admin/off-page/outreach/?stage=DRAFT`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(OUT_DIR, "04_offpage_outreach_drafts.png"), fullPage: false });
  console.log("✓ Saved 04_offpage_outreach_drafts.png");

  // 5. Backlinks view
  console.log("Capturing 05_offpage_backlinks...");
  await page.goto(`${BASE}/admin/off-page/backlinks/`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(OUT_DIR, "05_offpage_backlinks.png"), fullPage: false });
  console.log("✓ Saved 05_offpage_backlinks.png");

  // 6. Reports view
  console.log("Capturing 06_offpage_reports...");
  await page.goto(`${BASE}/admin/off-page/reports/`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(OUT_DIR, "06_offpage_reports.png"), fullPage: false });
  console.log("✓ Saved 06_offpage_reports.png");

  await browser.close();
  console.log("V8.12.2 QA screenshot capture completed successfully.");
}

run().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
