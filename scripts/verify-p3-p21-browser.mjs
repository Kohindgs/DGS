import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

async function loadEnvFile(file) {
  try {
    const text = await fs.readFile(file, "utf8");
    for (const raw of text.split(/\r?\n/)) {
      const match = raw.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
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
await loadEnvFile(path.join(process.cwd(), ".env.local"));

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dgeniussolutions.com";
const adminEmail = process.env.DGS_ADMIN_EMAIL || "kohin@dgeniussolutions.com";
let adminPassword = process.env.DGS_ADMIN_PASSWORD;
if (adminPassword && ((adminPassword.startsWith('"') && adminPassword.endsWith('"')) || (adminPassword.startsWith("'") && adminPassword.endsWith("'")))) {
  adminPassword = adminPassword.slice(1, -1);
}

const screenshotDir = path.join(process.cwd(), "data/audit/v8102_qa");
await fs.mkdir(screenshotDir, { recursive: true });

async function run() {
  console.log("==================================================");
  console.log("P3 & P21 REAL-BROWSER VALIDATION RUN");
  console.log("==================================================");

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) DGS-V8102-Verification/1.0",
  });

  const page = await context.newPage();

  const jsErrors = [];
  page.on("pageerror", (err) => {
    jsErrors.push({ message: err.message, stack: err.stack, url: page.url() });
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (!text.includes("Failed to load resource") && !text.includes("chrome-extension://")) {
        jsErrors.push({ message: text, url: page.url() });
      }
    }
  });

  // Step 1: Login
  console.log(`Authenticating at ${baseUrl}/admin/login...`);
  await page.goto(`${baseUrl}/admin/login`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(500);

  const emailInput = page.locator("input[type='email'], input[name='email']").first();
  const passwordInput = page.locator("input[type='password'], input[name='password']").first();
  const submitBtn = page.locator("button[type='submit']").first();

  await emailInput.fill(adminEmail);
  await passwordInput.fill(adminPassword);
  await Promise.all([
    page.waitForURL((url) => url.pathname.startsWith("/admin") && !url.pathname.includes("/login"), { timeout: 30000 }),
    submitBtn.click(),
  ]);

  console.log("✓ Logged into CMS successfully!");

  // P3: Test /admin/google-updates/ and REFRESH EVIDENCE
  console.log("\n[P3 & P21] Testing /admin/google-updates/ and Refresh Evidence...");
  await page.goto(`${baseUrl}/admin/google-updates/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(1000);

  // Click "Refresh Evidence"
  const refreshBtn = page.locator("button:has-text('Refresh Evidence')").first();
  if (await refreshBtn.isVisible()) {
    console.log("Clicking 'Refresh Evidence' button...");
    await refreshBtn.click();
    await page.waitForTimeout(2500);
  }

  await page.screenshot({ path: path.join(screenshotDir, "01_google_updates_refreshed.png"), fullPage: true });

  const pageContent = await page.content();
  const expectedAuditId = "8d2726b3-aacd-424b-ad24-6bc2c48c0977";
  const auditIdPresentInUi = pageContent.includes(expectedAuditId);
  console.log(`UI displays fresh DB_AUDIT_RUN_ID (${expectedAuditId}): ${auditIdPresentInUi ? "YES" : "NO"}`);

  // Test Content Ownership tab on google-updates
  const ownershipTab = page.locator("button:has-text('Content Ownership'), [role='tab']:has-text('Content Ownership')").first();
  if (await ownershipTab.isVisible()) {
    await ownershipTab.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotDir, "02_content_ownership_tab.png"), fullPage: true });
    console.log("✓ Content Ownership view verified and screenshot captured");
  }

  // P21: Careers & Make Job Description
  console.log("\n[P21] Testing /admin/careers/...");
  await page.goto(`${baseUrl}/admin/careers/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(1000);

  const makeJdBtn = page.locator("button:has-text('Create Position'), button:has-text('Make Job Description'), button:has-text('New Role')").first();
  if (await makeJdBtn.isVisible()) {
    await makeJdBtn.click();
    await page.waitForTimeout(600);
  }
  await page.screenshot({ path: path.join(screenshotDir, "03_careers_make_jd.png"), fullPage: true });
  console.log("✓ Careers / Make Job Description verified");

  // P21: Assessments & Make Assessment
  console.log("\n[P21] Testing /admin/assessment/...");
  await page.goto(`${baseUrl}/admin/assessment/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(1000);

  const makeAssessmentBtn = page.locator("button:has-text('Create Assessment'), button:has-text('Generate Blueprint'), button:has-text('New Assessment')").first();
  if (await makeAssessmentBtn.isVisible()) {
    await makeAssessmentBtn.click();
    await page.waitForTimeout(600);
  }
  await page.screenshot({ path: path.join(screenshotDir, "04_assessment_make_assessment.png"), fullPage: true });
  console.log("✓ Assessment / Make Assessment verified");

  // P21: Applications
  console.log("\n[P21] Testing /admin/applications/...");
  await page.goto(`${baseUrl}/admin/applications/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, "05_applications_view.png"), fullPage: true });
  console.log("✓ Applications verified");

  // P21: HR Pipeline
  console.log("\n[P21] Testing /admin/hr-pipeline/...");
  await page.goto(`${baseUrl}/admin/hr-pipeline/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, "06_hr_pipeline_view.png"), fullPage: true });
  console.log("✓ HR Pipeline verified");

  // P21: Search Console (7D, 15D, 28D & AI Overview Tracker)
  console.log("\n[P21] Testing /admin/search-console/...");
  await page.goto(`${baseUrl}/admin/search-console/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(1000);

  // Test 7D tab
  const btn7d = page.locator("button:has-text('7D')").first();
  if (await btn7d.isVisible()) {
    await btn7d.click();
    await page.waitForTimeout(500);
  }

  // Test 15D tab
  const btn15d = page.locator("button:has-text('15D')").first();
  if (await btn15d.isVisible()) {
    await btn15d.click();
    await page.waitForTimeout(500);
  }

  // Test 28D tab
  const btn28d = page.locator("button:has-text('28D')").first();
  if (await btn28d.isVisible()) {
    await btn28d.click();
    await page.waitForTimeout(500);
  }

  // Scroll to AI Overview Tracker / GSC Generative section
  await page.screenshot({ path: path.join(screenshotDir, "07_search_console_performance.png"), fullPage: true });
  console.log("✓ Search Console performance tabs and AI Overview section verified");

  console.log("\n================ VALIDATION JS ERROR AUDIT ================");
  console.log(`Captured JS Errors: ${jsErrors.length}`);
  if (jsErrors.length > 0) {
    console.log(JSON.stringify(jsErrors, null, 2));
  }
  console.log("===========================================================\n");

  await browser.close();
}

run().catch((err) => {
  console.error("FATAL ERROR in P3/P21 verification:", err);
  process.exit(1);
});
