import fs from "node:fs";

async function main() {
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
  const authHeaders = { Cookie: sessionCookie };

  const res = await fetch("https://www.dgeniussolutions.com/api/admin/off-page/opportunities?today=true", {
    headers: authHeaders
  });
  const json = await res.json();
  console.log(`Today's New Opportunities count: ${json.opportunities?.length || 0}`);
  for (const opp of (json.opportunities || []).slice(0, 5)) {
    console.log(`\n--- NEW OPP: ${opp.id} ---`);
    console.log(`  Site: ${opp.site_name}`);
    console.log(`  Domain: ${opp.domain}`);
    console.log(`  URL: ${opp.exact_submission_url}`);
    console.log(`  Provider: ${opp.discovery_provider}`);
    console.log(`  Query: ${opp.discovery_query}`);
    console.log(`  Region: ${opp.region}, Country: ${opp.country}`);
    console.log(`  Category: ${opp.category}, Free: ${opp.free_status}`);
    console.log(`  HTTP: ${opp.http_status}, Verified: ${opp.verification_status}`);
    console.log(`  Target Page: ${opp.recommended_dgs_target_page}`);
    console.log(`  Evidence: ${opp.evidence}`);
  }
}

main().catch(console.error);
