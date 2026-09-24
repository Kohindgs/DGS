import { chromium } from "playwright";
import crypto, { createHmac } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const SESSION_SECRET = process.env.DGS_ADMIN_SESSION_SECRET || crypto.randomBytes(32).toString("hex");
const ADMIN_EMAIL = process.env.DGS_ADMIN_EMAIL || "admin@dgeniussolutions.com";
const BASE_URL = process.env.QA_BASE_URL || "http://127.0.0.1:3000";

function createAdminSessionToken(email) {
  const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 8;
  const payload = Buffer.from(JSON.stringify({ email, expires })).toString("base64url");
  const signature = createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

const VIEWPORTS = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "fhd-1920", width: 1920, height: 1080 },
  { name: "mobile-390", width: 390, height: 844, isMobile: true },
];

const PAGES = [
  { path: "/admin/", name: "01-dashboard" },
  { path: "/admin/leads/", name: "02-leads" },
  { path: "/admin/assessment/", name: "03-assessment" },
  { path: "/admin/hr-pipeline/", name: "04-hr-pipeline" },
  { path: "/admin/media/", name: "05-media" },
  { path: "/admin/integrations/", name: "06-integrations" },
  { path: "/admin/settings/", name: "07-settings" },
];

async function run() {
  const outDir = path.resolve(process.cwd(), "qa-artifacts/v4-screenshots");
  await fs.mkdir(outDir, { recursive: true });

  console.log(`Starting Playwright Screenshot QA on ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });

  const token = createAdminSessionToken(ADMIN_EMAIL);
  const cookieDomain = new URL(BASE_URL).hostname;

  for (const vp of VIEWPORTS) {
    console.log(`\nCapturing viewport: ${vp.name} (${vp.width}x${vp.height})...`);
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
      try {
        console.log(`  Visiting ${p.path} [Light Mode]...`);
        await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
        await page.waitForTimeout(600);

        // Ensure light theme
        await page.evaluate(() => {
          document.documentElement.setAttribute("data-theme", "light");
          localStorage.setItem("dgs_admin_theme", "light");
        });
        await page.waitForTimeout(300);

        const filenameLight = `${p.name}-${vp.name}-light.png`;
        await page.screenshot({
          path: path.join(outDir, filenameLight),
          fullPage: false, // Standard viewport shot for precise layout evaluation
        });
        console.log(`    Saved: ${filenameLight}`);

        // For desktop 1440, also capture a dark mode reference to verify neutral graphite palette
        if (vp.name === "desktop-1440") {
          await page.evaluate(() => {
            document.documentElement.setAttribute("data-theme", "dark");
            localStorage.setItem("dgs_admin_theme", "dark");
          });
          await page.waitForTimeout(300);
          const filenameDark = `${p.name}-${vp.name}-dark.png`;
          await page.screenshot({
            path: path.join(outDir, filenameDark),
            fullPage: false,
          });
          console.log(`    Saved: ${filenameDark}`);
        }
      } catch (err) {
        console.error(`  Error capturing ${p.path}:`, err.message);
      }
    }

    await context.close();
  }

  await browser.close();
  console.log(`\nAll screenshots successfully saved to ${outDir}`);
}

run().catch((err) => {
  console.error("Screenshot QA failed:", err);
  process.exit(1);
});
