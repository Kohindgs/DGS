import fs from "node:fs/promises";

const BASE_URL = "https://www.dgeniussolutions.com";

async function main() {
  console.log("=== DGS V8.12.7 LIVE ACQUISITION & VERIFICATION TEST ===\n");

  const envContent = await fs.readFile(".env.production", "utf8");
  const get = (k) => (envContent.split(/\r?\n/).find((l) => l.startsWith(`${k}=`)) || "").slice(k.length + 1).trim().replace(/^['"](.*)['"]$/, "$1");
  const body = new URLSearchParams({ email: get("DGS_ADMIN_EMAIL"), password: get("DGS_ADMIN_PASSWORD") });
  const auth = await fetch(`${BASE_URL}/api/admin/session`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString(), redirect: "manual" });
  const cookie = (auth.headers.get("set-cookie") || "").split(";")[0];
  if (!cookie) throw new Error("Failed to authenticate admin session");
  const headers = { Cookie: cookie, "Content-Type": "application/json" };
  console.log("✓ Admin session authenticated");

  // 1. Run Agency Directories lane (live search via WebSearchDiscoveryProvider)
  console.log("\n--- Triggering live discovery run for AGENCY_DIRECTORIES ---");
  const runRes = await fetch(`${BASE_URL}/api/admin/off-page/lanes`, {
    method: "POST",
    headers,
    body: JSON.stringify({ action: "run", lane: "AGENCY_DIRECTORIES", maxQueries: 2, perQuery: 5 }),
  });
  const runJson = await runRes.json();
  console.log("Run response:", JSON.stringify(runJson));

  console.log("Waiting for lane execution to complete on production server...");
  let completed = false;
  let attempts = 0;
  while (!completed && attempts < 30) {
    await new Promise((r) => setTimeout(r, 4000));
    attempts++;
    const checkRes = await fetch(`${BASE_URL}/api/admin/off-page/lanes`, { headers });
    const checkJson = await checkRes.json();
    const isRunning = (checkJson.running || []).some((r) => r.lane === "AGENCY_DIRECTORIES");
    const lastRun = (checkJson.recentRuns || [])[0];
    if (!isRunning) {
      completed = true;
      console.log("\n✓ Discovery lane run completed!");
      console.log("Last run details:", JSON.stringify(lastRun, null, 2));
    } else {
      process.stdout.write(".");
    }
  }

  // 2. Run Backlink Discovery
  console.log("\n--- Triggering Backlink Discovery for Brand Queries ---");
  const blRes = await fetch(`${BASE_URL}/api/admin/off-page/backlinks/discover`, {
    method: "POST",
    headers,
    body: JSON.stringify({ provider: "web_search", queries: ['"dgeniussolutions.com"', '"D\'Genius Solutions"'] }),
  });
  const blJson = await blRes.json();
  console.log("Backlink discovery response:", JSON.stringify(blJson, null, 2));

  // 3. Inspect Action Center
  console.log("\n--- Inspecting Manager Action Center ---");
  const acRes = await fetch(`${BASE_URL}/api/admin/off-page/action-center`, { headers });
  const acJson = await acRes.json();
  console.log("Action Center KPIs:", JSON.stringify(acJson.kpis, null, 2));
  console.log("Needs Review queue count:", acJson.needsReviewItems?.length);
  if (acJson.needsReviewItems?.length > 0) {
    console.log("Top 3 Needs Review items:", JSON.stringify(acJson.needsReviewItems.slice(0, 3).map((i) => ({ id: i.id, site: i.site_name, domain: i.domain, status: i.status, verification: i.verification_status })), null, 2));
  }
}

main().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
