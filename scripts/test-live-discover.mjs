import fs from "node:fs";

async function main() {
  console.log("==================================================");
  console.log("TESTING LIVE DISCOVER NOW (/api/admin/off-page/opportunities/discover)");
  console.log("==================================================");

  const envContent = fs.readFileSync(".env.production", "utf8");
  let email = "";
  let password = "";
  for (const line of envContent.split(/\r?\n/)) {
    if (line.startsWith("DGS_ADMIN_EMAIL=")) {
      email = line.slice("DGS_ADMIN_EMAIL=".length).trim().replace(/^['"](.*)['"]$/, "$1");
    }
    if (line.startsWith("DGS_ADMIN_PASSWORD=")) {
      password = line.slice("DGS_ADMIN_PASSWORD=".length).trim().replace(/^['"](.*)['"]$/, "$1");
    }
  }

  const loginParams = new URLSearchParams();
  loginParams.set("email", email);
  loginParams.set("password", password);

  const loginRes = await fetch("https://www.dgeniussolutions.com/api/admin/session", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: loginParams.toString(),
    redirect: "manual",
  });
  const cookieHeader = loginRes.headers.get("set-cookie");
  const sessionCookie = cookieHeader ? cookieHeader.split(";")[0] : "";
  const authHeaders = { Cookie: sessionCookie, "Content-Type": "application/json" };

  console.log("Triggering POST /api/admin/off-page/opportunities/discover...");
  const t0 = Date.now();
  const res = await fetch("https://www.dgeniussolutions.com/api/admin/off-page/opportunities/discover", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      providerId: "GOOGLE_NEWS_RSS",
      limit: 10
    })
  });
  const elapsed = Date.now() - t0;
  console.log(`Response status: ${res.status} in ${elapsed}ms`);
  const json = await res.json();
  console.log("Discover result:", JSON.stringify(json, null, 2));
}

main().catch(console.error);
