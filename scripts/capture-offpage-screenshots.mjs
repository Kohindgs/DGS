import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = "https://www.dgeniussolutions.com";
const OUT_DIR = path.join("C:", "Users", "Kohin", ".gemini", "antigravity", "brain", "534291cc-4b59-4e18-aeca-75b1c4a803e7", "v8121_qa");
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
  console.log("Launching headless browser for QA screenshots...");
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

  const routes = [
    { name: "01_offpage_dashboard", url: "/admin/off-page/" },
    { name: "02_offpage_opportunities", url: "/admin/off-page/opportunities/" },
    { name: "03_offpage_outreach_drafts", url: "/admin/off-page/outreach/?stage=DRAFT" },
    { name: "04_offpage_backlinks", url: "/admin/off-page/backlinks/" },
    { name: "05_offpage_digital_pr", url: "/admin/off-page/digital-pr/" },
    { name: "06_offpage_reports", url: "/admin/off-page/reports/" },
  ];

  for (const r of routes) {
    console.log(`Capturing ${r.name} from ${r.url}...`);
    await page.goto(`${BASE}${r.url}`, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(OUT_DIR, `${r.name}.png`), fullPage: false });
    console.log(`✓ Saved ${r.name}.png`);
  }

  await browser.close();
  console.log("QA screenshot capture completed successfully.");
}

run().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
