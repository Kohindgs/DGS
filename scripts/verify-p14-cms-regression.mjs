import fs from "node:fs";

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

async function run() {
  console.log("==================================================");
  console.log("DGS V8.11.3 CMS REGRESSION AUDIT (P14)");
  console.log("==================================================");

  // 1. Check login page without session
  const loginRes = await fetch("https://www.dgeniussolutions.com/admin/login");
  console.log(`/admin/login: HTTP ${loginRes.status} (Expected: 200)`);

  // 2. Perform authentication
  const params = new URLSearchParams();
  params.set("email", email);
  params.set("password", password);

  const authRes = await fetch("https://www.dgeniussolutions.com/api/admin/session", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
    redirect: "manual"
  });

  const cookieHeader = authRes.headers.get("set-cookie");
  if (!cookieHeader) {
    throw new Error("Failed to receive authentication cookie from /api/admin/session");
  }
  const sessionCookie = cookieHeader.split(";")[0];
  console.log(`✓ Authenticated session established (HTTP ${authRes.status})`);

  // 3. Test all admin routes with auth cookie
  const adminRoutes = [
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

  let passedRoutes = 0;
  for (const route of adminRoutes) {
    const res = await fetch("https://www.dgeniussolutions.com" + route, {
      headers: {
        "Cookie": sessionCookie,
        "User-Agent": "Mozilla/5.0"
      },
      redirect: "manual"
    });
    const status = res.status;
    const body = await res.text();
    const isOk = status === 200 && !body.includes("Redirecting to login");
    if (isOk) passedRoutes++;
    console.log(`${route}: HTTP ${status} - ${isOk ? "PASS" : "FAIL"}`);
  }

  console.log("==================================================");
  console.log(`CMS_ROUTES_TOTAL = ${adminRoutes.length + 1}`);
  console.log(`CMS_ROUTES_PASSED = ${passedRoutes + (loginRes.status === 200 ? 1 : 0)}`);
  console.log(`CMS_REGRESSION = ${passedRoutes === adminRoutes.length ? "NONE (ALL ROUTES OPERATIONAL)" : "FAIL"}`);
  console.log("==================================================");
}

run().catch(console.error);
