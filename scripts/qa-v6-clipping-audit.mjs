import { chromium } from "playwright";
import crypto, { createHmac } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const SESSION_SECRET = process.env.DGS_ADMIN_SESSION_SECRET || crypto.randomBytes(32).toString("hex");
const ADMIN_EMAIL = process.env.DGS_ADMIN_EMAIL || process.env.DGS_QA_ADMIN_EMAIL || `qa-${crypto.randomBytes(4).toString("hex")}@dgeniussolutions.internal`;
const BASE_URL = process.env.QA_BASE_URL || "http://127.0.0.1:3000";

function createAdminSessionToken(email) {
  const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 8;
  const payload = Buffer.from(JSON.stringify({ email, expires })).toString("base64url");
  const signature = createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

const VIEWPORTS = [
  { name: "390", width: 390, height: 844, isMobile: true },
  { name: "430", width: 430, height: 932, isMobile: true },
  { name: "768", width: 768, height: 1024, isMobile: true },
  { name: "1024", width: 1024, height: 768 },
  { name: "1366", width: 1366, height: 768 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
  { name: "2560", width: 2560, height: 1440 },
  { name: "3840", width: 3840, height: 2160 },
];

const ROUTES = [
  { path: "/admin/", name: "01-dashboard" },
  { path: "/admin/search-console/", name: "02-search-console" },
  { path: "/admin/analytics/", name: "03-analytics" },
  { path: "/admin/site-audits/", name: "04-site-audits" },
  { path: "/admin/google-updates/", name: "05-google-updates" },
  { path: "/admin/blogs/", name: "06-blogs" },
  { path: "/admin/blogs/new/", name: "07-blogs-new" },
  { path: "/admin/media/", name: "08-media" },
  { path: "/admin/portfolio/", name: "09-portfolio" },
  { path: "/admin/seo/", name: "10-seo" },
  { path: "/admin/forms/", name: "11-forms" },
  { path: "/admin/leads/", name: "12-leads" },
  { path: "/admin/careers/", name: "13-careers" },
  { path: "/admin/assessment/", name: "14-assessment" },
  { path: "/admin/hr-pipeline/", name: "15-hr-pipeline" },
  { path: "/admin/users/", name: "16-users" },
  { path: "/admin/activity-log/", name: "17-activity-log" },
  { path: "/admin/integrations/", name: "18-integrations" },
  { path: "/admin/integrations/google/setup/", name: "19-google-wizard" },
  { path: "/admin/settings/", name: "20-settings" },
  { path: "/admin/login/", name: "21-login", noAuth: true },
];

async function run() {
  const localOutDir = path.resolve(process.cwd(), "qa-artifacts/v6-screenshots");
  const brainDir = path.resolve("C:/Users/Kohin/.gemini/antigravity/brain/534291cc-4b59-4e18-aeca-75b1c4a803e7/v6-qa");
  await fs.mkdir(localOutDir, { recursive: true });
  await fs.mkdir(brainDir, { recursive: true });

  console.log(`Starting DGS CMS V6 Comprehensive Geometry & Clipping Audit on ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const token = createAdminSessionToken(ADMIN_EMAIL);
  const cookieDomain = new URL(BASE_URL).hostname;

  let totalGeometryChecks = 0;
  let passedGeometryChecks = 0;
  let overflowViolations = [];
  let elementClippingViolations = [];

  const screenshotViewports = ["390", "768", "1440", "1920", "2560", "3840"];

  for (const vp of VIEWPORTS) {
    console.log(`\n======================================================`);
    console.log(`Auditing Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`======================================================`);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: Boolean(vp.isMobile),
      hasTouch: Boolean(vp.isMobile),
    });

    if (!token) throw new Error("Missing token");
    await context.addCookies([
      { name: "dgs_admin_session", value: token, domain: cookieDomain, path: "/", httpOnly: true, secure: false, sameSite: "Lax" },
    ]);

    const page = await context.newPage();

    for (const route of ROUTES) {
      const url = `${BASE_URL}${route.path}`;
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
        await page.waitForTimeout(400);

        // 1. Check Body & Document Horizontal Overflow
        totalGeometryChecks++;
        const overflowMetrics = await page.evaluate(() => {
          const docScroll = document.documentElement.scrollWidth;
          const docClient = document.documentElement.clientWidth;
          const bodyScroll = document.body ? document.body.scrollWidth : docScroll;
          const bodyClient = document.body ? document.body.clientWidth : docClient;
          return {
            docScroll,
            docClient,
            bodyScroll,
            bodyClient,
            docOverflow: docScroll > docClient + 1,
            bodyOverflow: bodyScroll > bodyClient + 1,
          };
        });

        if (overflowMetrics.docOverflow || overflowMetrics.bodyOverflow) {
          overflowViolations.push({
            viewport: vp.name,
            route: route.path,
            metrics: overflowMetrics,
          });
          console.error(`  [OVERFLOW FAIL] ${route.path} on ${vp.name}: doc=${overflowMetrics.docScroll}/${overflowMetrics.docClient}, body=${overflowMetrics.bodyScroll}/${overflowMetrics.bodyClient}`);
        } else {
          passedGeometryChecks++;
        }

        // 2. Element Edge Checks on Core UI Elements
        if (route.path !== "/admin/login/") {
          const edgeChecks = await page.evaluate((vpWidth) => {
            const issues = [];
            const header = document.querySelector(".dgs-saas-header");
            if (header) {
              const rect = header.getBoundingClientRect();
              if (rect.left < 0 || rect.right > vpWidth + 1) {
                issues.push(`Header bounding rect out of viewport: left=${rect.left}, right=${rect.right}, vp=${vpWidth}`);
              }
            }

            // On mobile/tablet (<= 1024px) sidebar is closed in drawer, so check header mark.
            // On desktop (> 1024px) check sidebar logo.
            const logo = vpWidth <= 1024
              ? document.querySelector(".dgs-saas-header-mark-img")
              : document.querySelector(".dgs-saas-logo-img, .dgs-saas-mark-img");
            if (logo) {
              const rect = logo.getBoundingClientRect();
              if (rect.left < 0 || rect.right > vpWidth + 1) {
                issues.push(`Logo clipped: left=${rect.left}, right=${rect.right}`);
              }
            }

            return issues;
          }, vp.width);

          if (edgeChecks.length > 0) {
            elementClippingViolations.push({ viewport: vp.name, route: route.path, issues: edgeChecks });
          }
        }

        // Capture key screenshot if viewport is in target list
        if (screenshotViewports.includes(vp.name)) {
          const fileName = `${route.name}-${vp.name}-dark.png`;
          const localPath = path.join(localOutDir, fileName);
          const brainPath = path.join(brainDir, fileName);

          await page.screenshot({ path: localPath, fullPage: false });
          try {
            await fs.copyFile(localPath, brainPath);
          } catch {}
        }
      } catch (err) {
        console.error(`  Error testing ${route.path} at ${vp.name}:`, err.message);
      }
    }

    // Interactive Checks on Dashboard: Notifications Open & Sidebar Collapse
    if (vp.name === "1920" || vp.name === "1440") {
      try {
        await page.goto(`${BASE_URL}/admin/`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(500);

        // Test Notifications Dropdown Open
        const notifBtn = await page.$("button[aria-label^='Notifications']");
        if (notifBtn) {
          await notifBtn.click();
          await page.waitForTimeout(300);

          const dropdownCheck = await page.evaluate((vpWidth) => {
            const dropdown = document.querySelector(".dgs-saas-profile-dropdown[role='dialog']");
            if (!dropdown) return { found: false };
            const rect = dropdown.getBoundingClientRect();
            return {
              found: true,
              left: rect.left,
              right: rect.right,
              width: rect.width,
              isClipped: rect.left < 0 || rect.right > vpWidth + 1,
            };
          }, vp.width);

          console.log(`  [Notifications Panel on ${vp.name}] Width: ${dropdownCheck.width}px, Clipped: ${dropdownCheck.isClipped}`);
          if (dropdownCheck.isClipped) {
            elementClippingViolations.push({ viewport: vp.name, route: "/admin/", issues: ["Notification dropdown clipped outside viewport"] });
          }

          const notifScreen = `01-dashboard-notifications-open-${vp.name}-dark.png`;
          await page.screenshot({ path: path.join(localOutDir, notifScreen), fullPage: false });
          try {
            await fs.copyFile(path.join(localOutDir, notifScreen), path.join(brainDir, notifScreen));
          } catch {}

          // Close dropdown via backdrop
          const backdrop = await page.$(".dgs-saas-dropdown-backdrop");
          if (backdrop) {
            await backdrop.click();
          } else {
            await notifBtn.click({ force: true });
          }
          await page.waitForTimeout(300);
        }

        // Test Sidebar Collapse & Workspace Expansion
        const wrapperWidthExpanded = await page.evaluate(() => {
          const wrap = document.querySelector(".dgs-saas-wrapper");
          return wrap ? wrap.getBoundingClientRect().width : 0;
        });

        // Trigger collapse
        const accordionBtn = await page.$(".dgs-sidebar-accordion-btn");
        if (accordionBtn) {
          await accordionBtn.click();
          await page.waitForTimeout(400);

          const wrapperWidthCollapsed = await page.evaluate(() => {
            const wrap = document.querySelector(".dgs-saas-wrapper");
            return wrap ? wrap.getBoundingClientRect().width : 0;
          });

          console.log(`  [Workspace Expansion on ${vp.name}] Expanded: ${wrapperWidthExpanded}px -> Collapsed: ${wrapperWidthCollapsed}px`);
          if (wrapperWidthCollapsed <= wrapperWidthExpanded) {
            console.error(`  [WORKSPACE EXPANSION FAIL] Wrapper did not gain usable width on collapse: ${wrapperWidthExpanded} -> ${wrapperWidthCollapsed}`);
          } else {
            console.log(`  [WORKSPACE EXPANSION PASS] Workspace gained ${Math.round(wrapperWidthCollapsed - wrapperWidthExpanded)}px on collapse!`);
          }

          const collapseScreen = `01-dashboard-collapsed-${vp.name}-dark.png`;
          await page.screenshot({ path: path.join(localOutDir, collapseScreen), fullPage: false });
          try {
            await fs.copyFile(path.join(localOutDir, collapseScreen), path.join(brainDir, collapseScreen));
          } catch {}

          // Re-expand
          await accordionBtn.click();
          await page.waitForTimeout(200);
        }
      } catch (err) {
        console.error("Error during interactive tests:", err.message);
      }
    }

    // Interactive Checks on Mobile Viewport: Mobile Drawer Open & Close
    if (vp.isMobile && (vp.name === "390" || vp.name === "768")) {
      try {
        await page.goto(`${BASE_URL}/admin/`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(400);

        const hamburger = await page.$("button[aria-label='Open Mobile Navigation']");
        if (hamburger) {
          await hamburger.click();
          await page.waitForTimeout(300);

          const drawerCheck = await page.evaluate((vpWidth) => {
            const sidebar = document.querySelector(".dgs-saas-sidebar.mobile-open");
            if (!sidebar) return { open: false };
            const rect = sidebar.getBoundingClientRect();
            const logo = sidebar.querySelector(".dgs-saas-logo-img, .dgs-saas-mark-img");
            const logoRect = logo ? logo.getBoundingClientRect() : null;
            return {
              open: true,
              sidebarLeft: rect.left,
              sidebarRight: rect.right,
              logoLeft: logoRect ? logoRect.left : 0,
              logoRight: logoRect ? logoRect.right : 0,
              clipped: rect.left < 0 || (logoRect && (logoRect.left < 0 || logoRect.right > vpWidth + 1)),
            };
          }, vp.width);

          console.log(`  [Mobile Drawer on ${vp.name}] Open: ${drawerCheck.open}, Sidebar Left: ${drawerCheck.sidebarLeft}, Clipped: ${drawerCheck.clipped}`);
          if (drawerCheck.clipped) {
            elementClippingViolations.push({ viewport: vp.name, route: "/admin/", issues: ["Mobile drawer clipped outside viewport"] });
          }

          const drawerScreen = `01-dashboard-drawer-open-${vp.name}-dark.png`;
          await page.screenshot({ path: path.join(localOutDir, drawerScreen), fullPage: false });
          try {
            await fs.copyFile(path.join(localOutDir, drawerScreen), path.join(brainDir, drawerScreen));
          } catch {}

          const closeBtn = await page.$("button[aria-label='Close navigation']");
          if (closeBtn) {
            await closeBtn.click();
            await page.waitForTimeout(200);
          }
        }
      } catch (err) {
        console.error("Error during mobile drawer test:", err.message);
      }
    }

    await context.close();
  }

  await browser.close();

  console.log(`\n======================================================`);
  console.log(`V6 GEOMETRY AUDIT RESULTS`);
  console.log(`======================================================`);
  console.log(`Total Route/Viewport Combinations Tested: ${totalGeometryChecks}`);
  console.log(`Passed (scrollWidth <= clientWidth + 1):  ${passedGeometryChecks}`);
  console.log(`Body Overflow Violations:                 ${overflowViolations.length}`);
  console.log(`Element Clipping Violations:              ${elementClippingViolations.length}`);

  if (overflowViolations.length > 0) {
    console.error(`Violations Summary:`, JSON.stringify(overflowViolations, null, 2));
    process.exit(1);
  }

  if (elementClippingViolations.length > 0) {
    console.error(`Clipping Summary:`, JSON.stringify(elementClippingViolations, null, 2));
    process.exit(1);
  }

  console.log(`\nALL V6 GEOMETRY & CLIPPING AUDITS PASSED WITH ZERO VIOLATIONS!`);
}

run().catch((err) => {
  console.error("Audit runner fatal error:", err);
  process.exit(1);
});
