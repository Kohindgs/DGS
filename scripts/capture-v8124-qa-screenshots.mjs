import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = "https://www.dgeniussolutions.com";
const OUT_DIR = path.join("C:", "Users", "Kohin", ".gemini", "antigravity", "brain", "534291cc-4b59-4e18-aeca-75b1c4a803e7", "v8124_qa");
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

const LONG_TEXT = "In order to diagnose and resolve an enterprise-level organic traffic decline following a search engine core update, I execute a rigorous multi-phased diagnostic protocol. First, I segment search console performance by directory, template type, device, and query intent to isolate the exact landing pages suffering losses. Second, I perform a forensic technical crawl examining canonical tag hygiene, hreflang annotations, indexation flags, internal link equity distribution, and 301 redirect chains. Third, I conduct a comprehensive content quality and EEAT evaluation comparing our pages against winning competitors in the SERPs, identifying missing semantic coverage, depth gaps, and user satisfaction signals. Fourth, I formulate an executive communication briefing clarifying the nature of algorithmic recalibration versus technical defects to maintain stakeholder confidence. Finally, I deliver a prioritized 30-day technical remediation sprint resolving high-severity crawl budget blockers, consolidating thin pages, and establishing daily keyword tracking.";

async function run() {
  console.log("================================================================================");
  console.log("   DGS V8.12.4 PLAYWRIGHT ASSESSMENT OS & PSYCHOMETRIC TEST CAPTURE");
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

  // 2. Admin Assessment Dashboard
  console.log("[STEP 2] Navigating to Admin Assessment OS...");
  await page.goto(`${BASE}/admin/assessment/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, "01_admin_assessment_dashboard.png"), fullPage: false });
  console.log("✓ Saved 01_admin_assessment_dashboard.png");

  // 3. Create fresh assignment for Playwright visual audit
  console.log("[STEP 3] Generating fresh assessment assignment link via API...");
  const cookies = await context.cookies();
  const authHeaders = {
    Cookie: `${cookies.map(c => `${c.name}=${c.value}`).join("; ")}`,
    "Content-Type": "application/json"
  };

  const genRes = await fetch(`${BASE}/api/admin/assessment/generate`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      role_title: "Senior Full-Stack Growth Engineer",
      difficulty: "senior",
      mcq_count: 5,
      short_count: 2,
      long_count: 1,
      include_psychometric: true,
      psychometric_count: 10,
      manual_draft: true
    })
  });
  const genData = await genRes.json();
  const versionId = genData.versionId;

  // Approve version
  await fetch(`${BASE}/api/admin/assessment/versions/${versionId}/approve`, {
    method: "POST",
    headers: authHeaders
  });

  // Create assignment link
  const assignRes = await fetch(`${BASE}/api/admin/assessment/assignments`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      assessmentKey: versionId,
      name: "Marcus Sterling (Principal Candidate)",
      email: "marcus.sterling@dgeniussolutions.com",
      phone: "+91 98111 22334",
      expiresInDays: 3,
      includePsychometric: true,
      durationMinutes: 75
    })
  });
  const assignData = await assignRes.json();
  const candidateUrl = assignData.assessmentUrl;
  console.log(`✓ Generated Candidate URL: ${candidateUrl}`);

  // 4. Candidate Experience: Section 1 - Instructions
  console.log("[STEP 4] Candidate loading Section 1: Instructions...");
  const candidateContext = await browser.newContext({ viewport: { width: 1300, height: 900 } });
  const candidatePage = await candidateContext.newPage();
  await candidatePage.goto(candidateUrl, { waitUntil: "networkidle" });
  await candidatePage.waitForTimeout(2000);
  await candidatePage.screenshot({ path: path.join(OUT_DIR, "02_candidate_instructions.png"), fullPage: false });
  console.log("✓ Saved 02_candidate_instructions.png");

  // Accept instructions checkbox
  const checkbox = await candidatePage.$('input[type="checkbox"]');
  if (checkbox) {
    await checkbox.check();
    await candidatePage.waitForTimeout(500);
  }

  // Click "Start Assessment"
  const startBtn = await candidatePage.$("button:has-text('Start Assessment')");
  if (startBtn) {
    await startBtn.click();
    await candidatePage.waitForTimeout(2000);
  }

  // 5. Candidate Experience: Section 2 - Technical Questions
  console.log("[STEP 5] Candidate Section 2: Technical Assessment...");
  // Answer Technical MCQs
  const techRadios = await candidatePage.$$('input[type="radio"]');
  const seenTech = new Set();
  for (const r of techRadios) {
    const name = await r.getAttribute("name");
    if (name && !seenTech.has(name)) {
      seenTech.add(name);
      await r.check({ force: true }).catch(() => {});
    }
  }

  // Answer Technical Short & Long Questions with valid word count (>120 words)
  const textareas = await candidatePage.$$('textarea');
  for (const ta of textareas) {
    await ta.fill(LONG_TEXT).catch(() => {});
  }
  await candidatePage.waitForTimeout(1000);
  await candidatePage.screenshot({ path: path.join(OUT_DIR, "03_candidate_technical_section.png"), fullPage: false });
  console.log("✓ Saved 03_candidate_technical_section.png");

  // Navigate to Section 3: Psychometric Assessment
  console.log("[STEP 6] Navigating to Section 3: Psychometric Assessment...");
  const continueBtn = await candidatePage.$("button:has-text('Save & Continue')");
  if (continueBtn) {
    await continueBtn.click();
    await candidatePage.waitForTimeout(2000);
  }

  // Answer all 10 Psychometric Questions
  const psychoRadios = await candidatePage.$$('input[type="radio"]');
  const seenPsycho = new Set();
  for (const r of psychoRadios) {
    const name = await r.getAttribute("name");
    if (name && !seenPsycho.has(name)) {
      seenPsycho.add(name);
      await r.check({ force: true }).catch(() => {});
    }
  }
  await candidatePage.waitForTimeout(1000);
  await candidatePage.screenshot({ path: path.join(OUT_DIR, "04_candidate_psychometric_section.png"), fullPage: false });
  console.log("✓ Saved 04_candidate_psychometric_section.png");

  // Navigate to Section 5: Review & Submit
  console.log("[STEP 7] Navigating to Review & Submit...");
  const reviewBtn = await candidatePage.$("button:has-text('Save & Continue')");
  if (reviewBtn) {
    await reviewBtn.click();
    await candidatePage.waitForTimeout(2000);
  }

  await candidatePage.screenshot({ path: path.join(OUT_DIR, "05_candidate_review_submit.png"), fullPage: false });
  console.log("✓ Saved 05_candidate_review_submit.png");

  // Click Final Submit
  console.log("Submitting final assessment...");
  const finalSubmitBtn = await candidatePage.$("button:has-text('Submit Final Assessment')");
  if (finalSubmitBtn) {
    await finalSubmitBtn.click();
    await candidatePage.waitForTimeout(4000);
  }

  await candidatePage.screenshot({ path: path.join(OUT_DIR, "06_candidate_submission_success.png"), fullPage: false });
  console.log("✓ Saved 06_candidate_submission_success.png");

  // 8. Admin Workstation: Review Candidate Trait Scores & Profile
  console.log("[STEP 8] Admin inspecting Candidate Evaluation Workstation...");
  await page.goto(`${BASE}/admin/assessment/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // Switch to Candidate Submissions & Workstation tab
  const candidatesTab = await page.$("button:has-text('Candidate Submissions')");
  if (candidatesTab) {
    await candidatesTab.click();
    await page.waitForTimeout(2000);
  }

  // Find candidate row in the table
  const marcusRow = await page.$("tr:has-text('Marcus Sterling')") || await page.$("tbody tr");
  if (marcusRow) {
    await marcusRow.click();
    await page.waitForTimeout(3000);
  }

  await page.screenshot({ path: path.join(OUT_DIR, "07_admin_candidate_workstation.png"), fullPage: false });
  console.log("✓ Saved 07_admin_candidate_workstation.png");

  await browser.close();
  console.log("================================================================================");
  console.log("   V8.12.4 PLAYWRIGHT QA SCREENSHOT CAPTURE COMPLETE!");
  console.log("================================================================================");
}

run().catch((err) => {
  console.error("FATAL ERROR during screenshot capture:", err);
  process.exit(1);
});
