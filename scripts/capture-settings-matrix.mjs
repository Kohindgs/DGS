import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = "https://www.dgeniussolutions.com";
const OUT_DIR = path.join("C:", "Users", "Kohin", ".gemini", "antigravity", "brain", "534291cc-4b59-4e18-aeca-75b1c4a803e7", "v8123_qa");

const env = fs.readFileSync(".env.production", "utf8");
let email = "";
let password = "";
for (const line of env.split(/\r?\n/)) {
  if (line.startsWith("DGS_ADMIN_EMAIL=")) email = line.slice("DGS_ADMIN_EMAIL=".length).trim().replace(/^['"](.*)['"]$/, "$1");
  if (line.startsWith("DGS_ADMIN_PASSWORD=")) password = line.slice("DGS_ADMIN_PASSWORD=".length).trim().replace(/^['"](.*)['"]$/, "$1");
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/admin**", { timeout: 15000 });

  await page.goto(`${BASE}/admin/off-page/settings/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // Scroll to Provider Health Matrix
  const matrixHeading = await page.$("h2:has-text('5. External & Intelligence Provider Health Matrix')");
  if (matrixHeading) {
    await matrixHeading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
  } else {
    await page.evaluate(() => window.scrollTo(0, 1400));
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: path.join(OUT_DIR, "06_offpage_settings_providers.png"), fullPage: false });
  console.log("✓ Updated 06_offpage_settings_providers.png with matrix in view");

  await browser.close();
}

run().catch(console.error);
