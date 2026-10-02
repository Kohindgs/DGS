import { chromium } from "playwright";

async function check() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto("https://www.dgeniussolutions.com/admin/login", { waitUntil: "domcontentloaded" });
  const adminEmail = process.env.DGS_ADMIN_EMAIL || "admin@dgeniussolutions.com";
  const adminPassword = process.env.DGS_ADMIN_PASSWORD;
  if (!adminPassword) throw new Error("DGS_ADMIN_PASSWORD environment variable is required");
  await page.fill('input[type="email"]', adminEmail);
  await page.fill('input[type="password"]', adminPassword);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    page.click('button[type="submit"]'),
  ]);

  await page.goto("https://www.dgeniussolutions.com/admin/search-console/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  for (const win of ["7 DAYS", "15 DAYS", "28 DAYS"]) {
    await page.click(`button:has-text("${win}")`);
    await page.waitForTimeout(600);
    const kpis = await page.locator(".dgs-saas-kpi-card").allInnerTexts();
    console.log(`=== ${win} ===`);
    console.log(kpis.map((k) => k.replace(/\n+/g, " ")).join(" | "));
  }

  await browser.close();
}
check().catch(console.error);
