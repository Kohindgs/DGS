import { chromium } from "playwright";
import fs from "node:fs";

const env = fs.readFileSync(".env.production", "utf8");
let email = "";
let password = "";
for (const line of env.split(/\r?\n/)) {
  if (line.startsWith("DGS_ADMIN_EMAIL=")) email = line.slice("DGS_ADMIN_EMAIL=".length).trim().replace(/^['"](.*)['"]$/, "$1");
  if (line.startsWith("DGS_ADMIN_PASSWORD=")) password = line.slice("DGS_ADMIN_PASSWORD=".length).trim().replace(/^['"](.*)['"]$/, "$1");
}

async function test() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on("pageerror", err => errors.push({ url: page.url(), error: err.message }));
  page.on("console", msg => {
    if (msg.type() === "error" && !msg.text().includes("favicon") && !msg.text().includes("Failed to load resource") && !msg.text().includes("chrome-extension://")) {
      errors.push({ url: page.url(), consoleError: msg.text() });
    }
  });

  // Authenticate
  await context.request.post("https://www.dgeniussolutions.com/api/admin/session", {
    form: { email, password }
  });

  const cmsPages = [
    "/admin",
    "/admin/google-updates",
    "/admin/search-console",
    "/admin/blogs",
    "/admin/assessment",
    "/admin/leads",
    "/admin/applications",
    "/admin/careers",
    "/admin/hr-pipeline"
  ];

  for (const p of cmsPages) {
    await page.goto("https://www.dgeniussolutions.com" + p, { waitUntil: "networkidle" });
  }

  console.log("CMS Pages Checked:", cmsPages.length);
  console.log("CMS Page Errors Encountered:", errors.length);
  if (errors.length > 0) {
    console.log(errors);
  }
  await browser.close();
}

test().catch(console.error);
