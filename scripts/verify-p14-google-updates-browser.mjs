import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

async function loadEnvFile(file) {
  try {
    const text = await fs.readFile(file, "utf8");
    for (const raw of text.split(/\r?\n/)) {
      const match = raw.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (match && !process.env[match[1]]) {
        let val = match[2];
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[match[1]] = val;
      }
    }
  } catch {}
}

await loadEnvFile(path.join(process.cwd(), ".env.production"));

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dgeniussolutions.com";
const adminEmail = process.env.DGS_ADMIN_EMAIL || "kohin@dgeniussolutions.com";
let adminPassword = process.env.DGS_ADMIN_PASSWORD;
if (adminPassword && ((adminPassword.startsWith('"') && adminPassword.endsWith('"')) || (adminPassword.startsWith("'") && adminPassword.endsWith("'")))) {
  adminPassword = adminPassword.slice(1, -1);
}

const screenshotDir = path.join(process.cwd(), "data/audit/v8115_qa");
await fs.mkdir(screenshotDir, { recursive: true });

async function run() {
  console.log("==================================================");
  console.log("P14/P15 — GOOGLE UPDATES LIVE BROWSER VERIFICATION");
  console.log("==================================================");

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) DGS-Browser-Verify/1.0",
  });

  const page = await context.newPage();

  // 1. Authenticate
  console.log("Authenticating into CMS...");
  const authRes = await context.request.post(`${baseUrl}/api/admin/session`, {
    form: { email: adminEmail, password: adminPassword },
  });
  console.log("Auth status:", authRes.status());

  // 2. Open /admin/google-updates/
  console.log("Navigating to /admin/google-updates/...");
  await page.goto(`${baseUrl}/admin/google-updates/`, { waitUntil: "networkidle", timeout: 45000 });

  const content = await page.content();
  await page.screenshot({ path: path.join(screenshotDir, "google_updates_refreshed.png"), fullPage: false });

  const auditIdMatch = content.match(/6cadb55b-e1b5-4b60-b77f-ada25bc357c7/);
  const oldAuditIdMatch = content.match(/8d2726b3-aacd-424b-ad24-6bc2c48c0977/);
  const sitemapUrlsMatch = content.includes("102");

  console.log(`NEW Audit Run ID (6cadb55b...) visible on main page: ${auditIdMatch ? "YES" : "NO"}`);
  console.log(`OLD Audit Run ID (8d2726b3...) visible: ${oldAuditIdMatch ? "YES (Warning)" : "NO (Clean)"}`);
  console.log(`Sitemap 102 URLs evaluated: ${sitemapUrlsMatch ? "YES" : "NO"}`);

  // 3. Click on View Evidence button to open evidence slideover
  console.log("Opening September 2026 spam update evidence drawer via View Evidence button...");
  const viewEvidenceBtn = page.locator("text=/View Evidence/").first();
  await viewEvidenceBtn.click();
  await page.waitForTimeout(1500);

  const drawerContent = await page.content();
  await page.screenshot({ path: path.join(screenshotDir, "google_updates_evidence_drawer.png"), fullPage: false });

  const checksFound = await page.locator("div:has(> span.dgs-saas-chip)").allInnerTexts();
  console.log("Checks rendered in drawer:", checksFound);
  const drawerText = await page.innerText("body");
  const passMatch = drawerText.includes("Canonical & Indexability Enforcement") && drawerText.includes("PASS");
  const schemaPassMatch = drawerText.includes("Structured Data Validation") && drawerText.includes("PASS");
  const drawerAuditIdMatch = drawerContent.includes("6cadb55b-e1b5-4b60-b77f-ada25bc357c7");

  console.log(`Canonical & Indexability Enforcement = PASS in drawer: ${passMatch ? "YES" : "NO"}`);
  console.log(`Structured Data Validation = PASS in drawer: ${schemaPassMatch ? "YES" : "NO"}`);
  console.log(`NEW Audit Run ID visible in drawer: ${drawerAuditIdMatch ? "YES" : "NO"}`);

  await browser.close();
}

run().catch(console.error);
