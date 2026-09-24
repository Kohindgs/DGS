import { chromium } from "playwright";
import { createHmac } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const SESSION_SECRET = process.env.DGS_ADMIN_SESSION_SECRET || "dgs-secret-qa-test-key-2026";
const ADMIN_EMAIL = process.env.DGS_ADMIN_EMAIL || "admin@dgeniussolutions.com";
const BASE_URL = process.env.QA_BASE_URL || "http://127.0.0.1:3000";

function createAdminSessionToken(email) {
  const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 8;
  const payload = Buffer.from(JSON.stringify({ email, expires })).toString("base64url");
  const signature = createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

const VIEWPORTS = [
  { name: "mobile-390", width: 390, height: 844, isMobile: true },
  { name: "laptop-1440", width: 1440, height: 900 },
  { name: "desktop-1920", width: 1920, height: 1080 },
  { name: "qhd-2560", width: 2560, height: 1440 },
  { name: "uhd-3840", width: 3840, height: 2160 },
];

const PAGES = [
  { path: "/admin/", name: "01-dashboard" },
  { path: "/admin/integrations/", name: "02-integrations" },
  { path: "/admin/integrations/google/setup/", name: "03-google-setup" },
  { path: "/admin/search-console/", name: "04-search-console" },
  { path: "/admin/analytics/", name: "05-analytics" },
  { path: "/admin/leads/", name: "06-leads" },
  { path: "/admin/assessment/", name: "07-assessment" },
  { path: "/admin/hr-pipeline/", name: "08-hr-pipeline" },
  { path: "/admin/login/", name: "09-login", noAuth: true },
];

async function run() {
  const outDir = path.resolve(process.cwd(), "qa-artifacts/v5-screenshots");
  await fs.mkdir(outDir, { recursive: true });

  const brainDir = path.resolve("C:/Users/Kohin/.gemini/antigravity/brain/534291cc-4b59-4e18-aeca-75b1c4a803e7/v5-qa");
  await fs.mkdir(brainDir, { recursive: true });

  console.log(`Starting V5 Liquid Glass Playwright QA on ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });

  const token = createAdminSessionToken(ADMIN_EMAIL);
  const cookieDomain = new URL(BASE_URL).hostname;

  for (const vp of VIEWPORTS) {
    console.log(`\n========================================`);
    console.log(`Capturing Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`========================================`);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: Boolean(vp.isMobile),
      hasTouch: Boolean(vp.isMobile),
    });

    await context.addCookies([
      {
        name: "dgs_admin_session",
        value: token,
        domain: cookieDomain,
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
      {
        name: "dgs_cms_session",
        value: token,
        domain: cookieDomain,
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);

    const page = await context.newPage();

    for (const p of PAGES) {
      const url = `${BASE_URL}${p.path}`;
      const pageToUse = p.noAuth
        ? await (await browser.newContext({ viewport: { width: vp.width, height: vp.height } })).newPage()
        : page;

      try {
        console.log(`  Visiting ${p.path} [2026 Dark Liquid Glass]...`);
        await pageToUse.goto(url, { waitUntil: "networkidle", timeout: 35000 });
        await pageToUse.waitForTimeout(600);

        // Ensure 2026 Dark Theme
        await pageToUse.evaluate(() => {
          document.documentElement.setAttribute("data-theme", "dark");
          localStorage.setItem("dgs_admin_theme", "dark");
        });
        await pageToUse.waitForTimeout(400);

        const filename = `${p.name}-${vp.name}-dark.png`;
        const filePath = path.join(outDir, filename);
        await pageToUse.screenshot({ path: filePath, fullPage: false });

        // Also copy to brain directory for artifact viewing
        const brainPath = path.join(brainDir, filename);
        await fs.copyFile(filePath, brainPath);

        console.log(`    ✓ Saved: ${filename}`);
      } catch (err) {
        console.error(`  Error capturing ${p.path}:`, err.message);
      } finally {
        if (p.noAuth) {
          await pageToUse.context().close();
        }
      }
    }

    // On Desktop 1920, also test and capture collapsed sidebar
    if (vp.name === "desktop-1920") {
      try {
        console.log(`  Testing sidebar toggle & workspace expansion on ${vp.name}...`);
        await page.goto(`${BASE_URL}/admin/`, { waitUntil: "networkidle" });
        await page.waitForTimeout(500);

        // Click sidebar accordion button
        const toggleBtn = await page.$("button[title*='Collapse' i], button[title*='Sidebar' i], .dgs-header-action-btn");
        if (toggleBtn) {
          await toggleBtn.click();
          await page.waitForTimeout(600);

          const filenameCollapsed = `10-sidebar-collapsed-${vp.name}-dark.png`;
          const filePathCollapsed = path.join(outDir, filenameCollapsed);
          await page.screenshot({ path: filePathCollapsed, fullPage: false });
          await fs.copyFile(filePathCollapsed, path.join(brainDir, filenameCollapsed));
          console.log(`    ✓ Saved: ${filenameCollapsed} (Sidebar Collapsed & Edge-to-Edge Expansion)`);
        }
      } catch (err) {
        console.error("  Error testing sidebar collapse:", err.message);
      }
    }

    await context.close();
  }

  await browser.close();
  console.log(`\nAll V5 screenshots successfully generated and saved to:\n  - ${outDir}\n  - ${brainDir}`);
}

run().catch((err) => {
  console.error("V5 Screenshot QA failed:", err);
  process.exit(1);
});
