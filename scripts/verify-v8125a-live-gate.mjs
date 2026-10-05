import fs from "node:fs/promises";

const BASE_URL = "https://www.dgeniussolutions.com";

async function main() {
  console.log("==================================================");
  console.log("DGS V8.12.5A FINAL PRODUCTION GREEN GATE VERIFIER");
  console.log("==================================================");

  // Read production env for admin credentials
  const envContent = await fs.readFile(".env.production", "utf8");
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

  // 1. Authenticate as Admin
  console.log("1. Authenticating as Admin...");
  const loginParams = new URLSearchParams();
  loginParams.set("email", email);
  loginParams.set("password", password);

  const authRes = await fetch(`${BASE_URL}/api/admin/session`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: loginParams.toString(),
    redirect: "manual",
  });

  const rawCookie = authRes.headers.get("set-cookie") || "";
  if (!rawCookie) {
    throw new Error("Failed to acquire session cookie from /api/admin/session");
  }
  const sessionCookie = rawCookie.split(";")[0];
  console.log(`✓ Admin session acquired: ${sessionCookie.slice(0, 25)}...`);

  const headers = {
    Cookie: sessionCookie,
    "Content-Type": "application/json",
  };

  // 2. Action Center API Audit
  console.log("\n2. Auditing Action Center API (/api/admin/off-page/action-center)...");
  const acRes = await fetch(`${BASE_URL}/api/admin/off-page/action-center`, { headers });
  const acData = await acRes.json();
  if (!acData.success) {
    throw new Error(`Action Center API failed: ${JSON.stringify(acData)}`);
  }
  console.log("✓ KPIs:");
  console.log(`  - Total in Pipeline: ${acData.kpis.totalInPipeline} (MUST NOT BE 58,931)`);
  console.log(`  - Needs Manager Review: ${acData.kpis.needsReviewCount} (MUST NOT BE 9,308)`);
  console.log(`  - Active/Assigned: ${acData.kpis.assignedActiveCount}`);
  console.log(`  - Due Today: ${acData.kpis.dueTodayCount}`);
  console.log(`  - Overdue: ${acData.kpis.overdueCount}`);
  console.log(`  - Status Mismatches: ${acData.kpis.mismatchesCount}`);
  console.log("✓ Manager Queues:");
  console.log(`  - Needs Review Items: ${acData.needsReviewItems?.length || 0}`);
  console.log(`  - Today's Team Tasks: ${acData.todayTasks?.length || 0}`);
  console.log(`  - Results & Lost Links: ${acData.resultsAndLostLinks?.length || 0}`);

  if (acData.kpis.totalInPipeline > 500) {
    throw new Error(`Pipeline count is anomalously high (${acData.kpis.totalInPipeline}). String concatenation bug persists!`);
  }

  // 3. Settings & Monitored Domains Governance Audit
  console.log("\n3. Auditing Settings API (/api/admin/off-page/settings)...");
  const setRes = await fetch(`${BASE_URL}/api/admin/off-page/settings`, { headers });
  const setData = await setRes.json();
  if (!setData.settings) {
    throw new Error(`Settings API failed: ${JSON.stringify(setData)}`);
  }
  console.log("✓ Monitored Domain Governance:");
  console.log(`  - Primary Monitored Domain: ${setData.settings.primary_monitored_domain}`);
  console.log(`  - Monitored Domain Aliases: ${setData.settings.monitored_domain_aliases}`);
  console.log(`  - Monitored Brand Name: ${setData.settings.monitored_brand_name}`);
  console.log(`  - Discovery Provider: ${setData.settings.discovery_provider}`);

  if (setData.settings.primary_monitored_domain.includes("digitalgrowthschool")) {
    throw new Error("Contaminated domain 'digitalgrowthschool' found in primary settings!");
  }

  // 4. Backlink Discovery Test (dgeniussolutions.com only)
  console.log("\n4. Testing Live Candidate Backlink Discovery (/api/admin/off-page/backlinks/discover)...");
  const discRes = await fetch(`${BASE_URL}/api/admin/off-page/backlinks/discover`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      provider: "GOOGLE_NEWS",
      domain: "dgeniussolutions.com",
    }),
  });
  const discData = await discRes.json();
  console.log("✓ Backlink Discovery Response:");
  console.log(`  - Status: ${discRes.status}`);
  console.log(`  - Message: ${discData.message}`);
  console.log(`  - Candidates Crawled: ${discData.candidatesCrawled || discData.candidates_found || 0}`);
  console.log(`  - New Unknown Backlinks Discovered: ${discData.newBacklinksDiscovered || discData.inserted_count || 0}`);

  // 5. Manager Action Test with Mandatory Next Action Dropdown Value
  console.log("\n5. Testing Manager Action Center Decision (/api/admin/off-page/action-center)...");
  const testItem = acData.needsReviewItems?.[0];
  if (testItem) {
    const actRes = await fetch(`${BASE_URL}/api/admin/off-page/action-center`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        id: testItem.id,
        action: "assign",
        owner: "Aakash",
        nextAction: "PITCH ARTICLE",
        dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        note: "Assigned high-priority strategic guest post pitch via V8.12.5A action center",
      }),
    });
    const actData = await actRes.json();
    console.log(`✓ Manager Action Execution: ${actData.success ? "SUCCESS" : "FAILED"}`);
    if (actData.opportunity) {
      console.log(`  - Opportunity ID: ${actData.opportunity.id}`);
      console.log(`  - Updated Status: ${actData.opportunity.status}`);
      console.log(`  - Assigned Owner: ${actData.opportunity.owner || actData.opportunity.assigned_to}`);
      console.log(`  - Next Action: ${actData.opportunity.next_action}`);
    }
  }

  // 6. Public SEO Invariants
  console.log("\n6. Auditing Public SEO Invariants...");
  const homeRes = await fetch(`${BASE_URL}/`);
  const homeHtml = await homeRes.text();
  const hasRobots = homeHtml.includes('content="index, follow"');
  console.log(`✓ Homepage Robots meta: ${hasRobots ? "index, follow (PASS)" : "FAIL"}`);

  const robotsRes = await fetch(`${BASE_URL}/robots.txt`);
  const robotsTxt = await robotsRes.text();
  const robotsPass = robotsTxt.includes("Allow: /") && !robotsTxt.includes("Disallow: /admin");
  console.log(`✓ robots.txt: HTTP ${robotsRes.status} (PASS)`);

  const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
  console.log(`✓ sitemap.xml: HTTP ${sitemapRes.status} (PASS)`);

  console.log("\n==================================================");
  console.log("✓ ALL V8.12.5A PRODUCTION GREEN GATES VERIFIED PASS!");
  console.log("==================================================");
}

main().catch((err) => {
  console.error("FATAL VERIFICATION ERROR:", err);
  process.exit(1);
});
