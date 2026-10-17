import fs from "node:fs/promises";

async function main() {
  const envContent = await fs.readFile(".env.production", "utf8");
  const get = (k) => (envContent.split(/\r?\n/).find((l) => l.startsWith(`${k}=`)) || "").slice(k.length + 1).trim().replace(/^['"](.*)['"]$/, "$1");
  const body = new URLSearchParams({ email: get("DGS_ADMIN_EMAIL"), password: get("DGS_ADMIN_PASSWORD") });
  const auth = await fetch("https://www.dgeniussolutions.com/api/admin/session", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    redirect: "manual",
  });
  const cookie = (auth.headers.get("set-cookie") || "").split(";")[0];
  const headers = { Cookie: cookie, "Content-Type": "application/json" };
  const res = await fetch("https://www.dgeniussolutions.com/api/admin/off-page/action-center", { headers });
  const json = await res.json();
  console.log("Action Center Needs Review KPI:", json.kpis?.needsReview);
  console.log("Needs Review Items Total:", json.needsReviewItems?.length);
  const found = (json.needsReviewItems || []).find((i) => i.id === "opp_06f8e242fa404b59");
  console.log("Found new opp in Needs Review:", !!found);
  if (found) {
    console.log(JSON.stringify({
      id: found.id,
      site_name: found.site_name,
      domain: found.domain,
      status: found.status,
      verification_status: found.verification_status,
      priority: found.priority_tier,
      category: found.category,
      region: found.region,
      source: found.source,
      provider: found.discovery_provider,
      query: found.discovery_query,
      target_page: found.recommended_dgs_target_page,
      action_recommendation: found.action_recommendation,
      why_it_matters: found.why_it_matters,
    }, null, 2));
  }
}

main().catch(console.error);
