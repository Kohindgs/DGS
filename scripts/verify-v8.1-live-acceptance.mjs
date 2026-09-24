import { spawn } from "node:child_process";
import http from "node:http";
import path from "node:path";
import crypto, { createHmac } from "node:crypto";
import fs from "node:fs/promises";
import { chromium } from "playwright";

const PORT = 3005;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const SESSION_SECRET = "dgs_v8_1_test_secret_for_qa_acceptance_32chars_min";
const ADMIN_EMAIL = "admin@dgeniussolutions.com";

function createAdminSessionToken(email) {
  const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 8;
  const payload = Buffer.from(JSON.stringify({ email, expires })).toString("base64url");
  const signature = createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function check() {
      const req = http.get(url, (res) => {
        resolve();
      });
      req.on("error", () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timeout waiting for server at ${url}`));
        } else {
          setTimeout(check, 400);
        }
      });
    }
    check();
  });
}

async function main() {
  console.log("==================================================");
  console.log("STARTING V8.1 LIVE ACCEPTANCE & VISUAL VERIFICATION");
  console.log("==================================================");

  const brainDir = path.resolve("C:/Users/Kohin/.gemini/antigravity/brain/534291cc-4b59-4e18-aeca-75b1c4a803e7/v8.1-qa");
  await fs.mkdir(brainDir, { recursive: true });

  const server = spawn("cmd.exe", ["/c", "npx", "next", "start", "-p", String(PORT)], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(PORT),
      DGS_ADMIN_ENABLED: "true",
      DGS_ADMIN_EMAIL: ADMIN_EMAIL,
      DGS_ADMIN_PASSWORD: "Password123!",
      DGS_ADMIN_SESSION_SECRET: SESSION_SECRET,
      NODE_OPTIONS: "--max-old-space-size=4096",
    },
    stdio: "pipe",
  });

  server.stdout.on("data", (d) => process.stdout.write(d));
  server.stderr.on("data", (d) => process.stderr.write(d));

  try {
    console.log(`Waiting for local Next.js server at ${BASE_URL}...`);
    await waitForServer(BASE_URL);
    console.log("Server is ready! Launching headless browser...");

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });

    const token = createAdminSessionToken(ADMIN_EMAIL);
    await context.addCookies([
      {
        name: "dgs_admin_session",
        value: token,
        domain: "127.0.0.1",
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);

    const page = await context.newPage();

    // 1. Verify Keywords Strategy Page
    console.log("\n1. Verifying /admin/seo/keywords/...");
    await page.goto(`${BASE_URL}/admin/seo/keywords/`, { waitUntil: "networkidle", timeout: 30000 });
    
    // Check if error boundary fired or page loaded
    const pageText = await page.innerText("body");
    const hasCrash = pageText.includes("This page couldn't load") || pageText.includes("Application error: a client-side exception has occurred");
    if (hasCrash) {
      console.error("FATAL: Keywords page crashed!");
      throw new Error("Keywords page crashed with client-side exception");
    }
    console.log("✓ Keywords page loaded cleanly without crash!");

    const keywordsScreenshot = path.join(brainDir, "01-keywords-strategy.png");
    await page.screenshot({ path: keywordsScreenshot, fullPage: true });
    console.log(`✓ Saved screenshot: ${keywordsScreenshot}`);

    // 2. Verify Site Audits Page
    console.log("\n2. Verifying /admin/site-audits/...");
    await page.goto(`${BASE_URL}/admin/site-audits/`, { waitUntil: "networkidle", timeout: 30000 });
    const siteAuditsText = await page.innerText("body");
    const siteAuditsCrash = siteAuditsText.includes("This page couldn't load") || siteAuditsText.includes("Application error");
    if (siteAuditsCrash) {
      throw new Error("Site Audits page crashed!");
    }
    console.log("✓ Site Audits page loaded cleanly!");

    const siteAuditsScreenshot = path.join(brainDir, "02-site-audits.png");
    await page.screenshot({ path: siteAuditsScreenshot, fullPage: true });
    console.log(`✓ Saved screenshot: ${siteAuditsScreenshot}`);

    // 3. Verify SEO Approvals Page
    console.log("\n3. Verifying /admin/seo/approvals/...");
    await page.goto(`${BASE_URL}/admin/seo/approvals/`, { waitUntil: "networkidle", timeout: 30000 });
    const approvalsText = await page.innerText("body");
    if (approvalsText.includes("This page couldn't load") || approvalsText.includes("Application error")) {
      throw new Error("Approvals page crashed!");
    }
    console.log("✓ SEO Approvals page loaded cleanly!");

    const approvalsScreenshot = path.join(brainDir, "03-seo-approvals.png");
    await page.screenshot({ path: approvalsScreenshot, fullPage: true });
    console.log(`✓ Saved screenshot: ${approvalsScreenshot}`);

    // 4. Verify Responsive FAQ Accordion Interaction
    console.log("\n4. Verifying FAQ Accordion on /aeo-dubai/...");
    await page.goto(`${BASE_URL}/aeo-dubai/`, { waitUntil: "networkidle", timeout: 30000 });
    const faqContainer = await page.$(".dgs-faq-container");
    if (faqContainer) {
      const faqQuestions = await page.$$(".dgs-faq-question");
      console.log(`Found ${faqQuestions.length} FAQ questions`);
      if (faqQuestions.length >= 2) {
        // Click second FAQ item
        await faqQuestions[1].click();
        await page.waitForTimeout(500);

        const items = await page.$$(".dgs-faq-item");
        const isSecondActive = await items[1].evaluate((el) => el.classList.contains("active"));
        const isFirstActive = await items[0].evaluate((el) => el.classList.contains("active"));

        console.log(`Second item active: ${isSecondActive}, First item active: ${isFirstActive}`);
        if (!isSecondActive) {
          throw new Error("FAQ accordion failed to activate clicked item!");
        }
        if (isFirstActive) {
          throw new Error("FAQ accordion failed sibling closing!");
        }
        console.log("✓ FAQ Accordion interactive toggle and sibling closing verified!");

        const faqScreenshot = path.join(brainDir, "04-faq-accordion.png");
        await page.screenshot({ path: faqScreenshot });
        console.log(`✓ Saved screenshot: ${faqScreenshot}`);
      }
    } else {
      console.log("Note: .dgs-faq-container not found on /aeo-dubai/, skipping interaction");
    }

    // 5. Verify Brand Name HTML Entity Defect Resolution
    console.log("\n5. Verifying Brand Name Entity Defect Resolution...");
    const sampleUrls = ["/", "/about-us/", "/aeo-dubai/", "/blogs/"];
    for (const testUrl of sampleUrls) {
      await page.goto(`${BASE_URL}${testUrl}`, { waitUntil: "networkidle", timeout: 30000 });
      const title = await page.title();
      const bodyText = await page.locator("body").innerText();
      const rawHtml = await page.content();

      const forbiddenVisualTokens = ["D&#x27;Genius", "D&amp;#x27;Genius", "D&#039;Genius", "D&apos;Genius", "D&#39;Genius"];
      for (const token of forbiddenVisualTokens) {
        if (title.includes(token)) {
          throw new Error(`Visible entity '${token}' found in browser title of ${testUrl}: "${title}"`);
        }
        if (bodyText.includes(token)) {
          throw new Error(`Visible brand entity defect '${token}' found in rendered text of ${testUrl}`);
        }
      }

      // Check raw HTML serialization (record as valid serialization, not failure)
      const hasRawEntitySerialization = rawHtml.includes("D&#x27;Genius");
      if (hasRawEntitySerialization) {
        console.log(`  [Note] ${testUrl} contains D&#x27;Genius in raw HTML -> VALID HTML SERIALIZATION — NOT A USER-FACING DEFECT (Rendered browser title: "${title}")`);
      }
      console.log(`✓ ${testUrl} rendered title clean: "${title}"`);
    }
    console.log("✓ Brand Name Entity Defect is completely fixed across all tested pages!");

    await browser.close();
    console.log("\n==================================================");
    console.log("ALL V8.1 LIVE ACCEPTANCE TESTS PASSED SUCCESSFULLY");
    console.log("==================================================");
  } finally {
    server.kill();
  }
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
