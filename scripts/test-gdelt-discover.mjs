import fs from "node:fs";

async function main() {
  console.log("==================================================");
  console.log("TESTING GDELT 2.0 PROVIDER DISCOVERY");
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
  const sessionCookie = loginRes.headers.get("set-cookie")?.split(";")[0] || "";
  const authHeaders = { Cookie: sessionCookie, "Content-Type": "application/json" };

  console.log("Triggering POST /api/admin/off-page/opportunities/discover with GDELT...");
  const t0 = Date.now();
  const res = await fetch("https://www.dgeniussolutions.com/api/admin/off-page/opportunities/discover", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      providerId: "GDELT",
      limit: 5
    })
  });
  const elapsed = Date.now() - t0;
  console.log(`Response status: ${res.status} in ${elapsed}ms`);
  const json = await res.json();
  console.log("GDELT Discover result:", JSON.stringify(json, null, 2));
}

main().catch(console.error);
