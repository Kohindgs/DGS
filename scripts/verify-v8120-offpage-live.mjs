import fs from "node:fs";

const BASE = "https://www.dgeniussolutions.com";

// Read credentials
const env = fs.readFileSync(".env.production", "utf8");
let email = "";
let password = "";
let cronSecret = "";

for (const line of env.split(/\r?\n/)) {
  if (line.startsWith("DGS_ADMIN_EMAIL=")) {
    email = line.slice("DGS_ADMIN_EMAIL=".length).trim().replace(/^['"](.*)['"]$/, "$1");
  }
  if (line.startsWith("DGS_ADMIN_PASSWORD=")) {
    password = line.slice("DGS_ADMIN_PASSWORD=".length).trim().replace(/^['"](.*)['"]$/, "$1");
  }
  if (line.startsWith("DGS_CRON_SECRET=")) {
    cronSecret = line.slice("DGS_CRON_SECRET=".length).trim().replace(/^['"](.*)['"]$/, "$1");
  }
}

async function login() {
  const params = new URLSearchParams();
  params.set("email", email);
  params.set("password", password);

  const res = await fetch(`${BASE}/api/admin/session`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
    redirect: "manual",
  });

  const cookieHeader = res.headers.get("set-cookie");
  if (!cookieHeader) {
    throw new Error(`Login failed with status ${res.status}, no cookie returned`);
  }
  const sessionCookie = cookieHeader.split(";")[0];
  console.log(`✓ Admin Login: HTTP ${res.status} (Cookie acquired)`);
  return sessionCookie;
}

async function testApi(cookie, path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Cookie: cookie },
  });
  const ok = res.status === 200;
  let summary = "";
  try {
    const data = await res.json();
    if (Array.isArray(data)) {
      summary = `Array(${data.length})`;
    } else if (data && typeof data === "object") {
      const keys = Object.keys(data);
      summary = `Object keys: [${keys.slice(0, 5).join(", ")}${keys.length > 5 ? "..." : ""}]`;
    }
  } catch {
    summary = `Text (${(await res.text()).length} chars)`;
  }
  console.log(`${ok ? "✓" : "✗"} API ${path} -> HTTP ${res.status} | ${summary}`);
  return { path, status: res.status, ok };
}

async function testCsvExport(cookie) {
  const res = await fetch(`${BASE}/api/admin/off-page/reports/export`, {
    headers: { Cookie: cookie },
  });
  const text = await res.text();
  const isCsv = text.includes("DGS OFF-PAGE SEO MONTHLY REPORT") && text.includes("EXECUTIVE METRICS,VALUE");
  console.log(`${isCsv ? "✓" : "✗"} API /api/admin/off-page/reports/export -> HTTP ${res.status} | CSV valid: ${isCsv} (${text.split("\n").length} lines)`);
  return isCsv;
}

async function testInternalCron() {
  const res = await fetch(`${BASE}/api/internal/off-page/check`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${cronSecret}`,
      "Content-Type": "application/json"
    },
  });
  const data = await res.json();
  const ok = res.status === 200 && data.ok;
  console.log(`${ok ? "✓" : "✗"} Internal Cron /api/internal/off-page/check -> HTTP ${res.status} | Message: ${data.message}`);
  return data;
}

async function testPage(cookie, path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Cookie: cookie },
  });
  const text = await res.text();
  const ok = res.status === 200 && text.includes("<!DOCTYPE html>");
  console.log(`${ok ? "✓" : "✗"} PAGE ${path} -> HTTP ${res.status} (${text.length} bytes)`);
  return { path, status: res.status, ok };
}

async function testPublicUrls() {
  console.log("\n================ PUBLIC TECHNICAL BASELINE ================");
  const publicUrls = [
    { url: `${BASE}/`, checkRobots: true, checkCanonical: true },
    { url: `${BASE}/robots.txt` },
    { url: `${BASE}/sitemap.xml` },
    { url: `${BASE}/services/ai-video-production-agency/` },
    { url: `${BASE}/services/seo-services-in-mumbai/` },
    { url: `${BASE}/services/aeo-services-in-mumbai/` },
    { url: `${BASE}/services/geo/` },
    { url: `${BASE}/services/llm-seo-service/` },
    { url: `${BASE}/services/performance-marketing/` },
    { url: `${BASE}/services/ai-production-dubai-page/` },
    { url: `${BASE}/blogs/` },
  ];

  for (const item of publicUrls) {
    const res = await fetch(item.url);
    const html = await res.text();
    let details = `HTTP ${res.status}`;
    if (item.checkRobots) {
      const hasIndexFollow = html.includes('content="index, follow"');
      details += ` | robots:index,follow=${hasIndexFollow}`;
    }
    if (item.checkCanonical) {
      const hasCanonical = html.includes('rel="canonical" href="https://www.dgeniussolutions.com/"');
      details += ` | canonical=${hasCanonical}`;
    }
    if (item.url.endsWith("sitemap.xml")) {
      const count = (html.match(/<loc>/g) || []).length;
      details += ` | sitemap URLs=${count}`;
    }
    console.log(`${res.status === 200 ? "✓" : "✗"} ${item.url} -> ${details}`);
  }
}

async function main() {
  console.log("==================================================");
  console.log("DGS V8.12.0 PRODUCTION FORENSIC VERIFICATION");
  console.log("OFF-PAGE SEO AUTHORITY ENGINE");
  console.log("==================================================");

  // 1. Public baseline
  await testPublicUrls();

  // 2. Login
  console.log("\n================ CMS ADMIN AUTHENTICATION ================");
  const cookie = await login();

  // 3. API Endpoints
  console.log("\n================ OFF-PAGE SEO API ENDPOINTS ================");
  const apiPaths = [
    "/api/admin/off-page/dashboard",
    "/api/admin/off-page/opportunities",
    "/api/admin/off-page/backlinks",
    "/api/admin/off-page/authority",
    "/api/admin/off-page/competitors",
    "/api/admin/off-page/mentions",
    "/api/admin/off-page/citations",
    "/api/admin/off-page/target-pages",
    "/api/admin/off-page/reports",
    "/api/admin/off-page/settings",
    "/api/admin/off-page/alerts",
  ];

  for (const p of apiPaths) {
    await testApi(cookie, p);
  }

  // 4. CSV Export
  console.log("\n================ OFF-PAGE CSV EXPORT ================");
  await testCsvExport(cookie);

  // 5. Internal Cron
  console.log("\n================ INTERNAL CRON AUTOMATION ================");
  await testInternalCron();

  // 6. CMS Frontend Submodules (15 sections)
  console.log("\n================ CMS 15 SUBMODULE PAGES ================");
  const pages = [
    "/admin/off-page/",
    "/admin/off-page/opportunities/",
    "/admin/off-page/backlinks/",
    "/admin/off-page/authority/",
    "/admin/off-page/competitors/",
    "/admin/off-page/mentions/",
    "/admin/off-page/digital-pr/",
    "/admin/off-page/citations/",
    "/admin/off-page/partnerships/",
    "/admin/off-page/outreach/",
    "/admin/off-page/reclamation/",
    "/admin/off-page/target-pages/",
    "/admin/off-page/monitoring/",
    "/admin/off-page/reports/",
    "/admin/off-page/settings/",
  ];

  for (const p of pages) {
    await testPage(cookie, p);
  }

  console.log("\n==================================================");
  console.log("ALL FORENSIC CHECKS COMPLETE");
  console.log("==================================================");
}

main().catch(err => {
  console.error("FATAL VERIFICATION ERROR:", err);
  process.exit(1);
});
