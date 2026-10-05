import fs from "node:fs";

async function main() {
  console.log("==================================================");
  console.log("TESTING ALL LIVE OFF-PAGE ADMIN API ENDPOINTS");
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

  const endpoints = [
    { name: "Dashboard", url: "https://www.dgeniussolutions.com/api/admin/off-page/dashboard" },
    { name: "Providers Health", url: "https://www.dgeniussolutions.com/api/admin/off-page/providers" },
    { name: "Opportunities", url: "https://www.dgeniussolutions.com/api/admin/off-page/opportunities" },
    { name: "Discovery Runs", url: "https://www.dgeniussolutions.com/api/admin/off-page/opportunities/discover" },
    { name: "Backlinks", url: "https://www.dgeniussolutions.com/api/admin/off-page/backlinks" },
    { name: "Mentions", url: "https://www.dgeniussolutions.com/api/admin/off-page/mentions" },
    { name: "Citations", url: "https://www.dgeniussolutions.com/api/admin/off-page/citations" },
    { name: "Competitors", url: "https://www.dgeniussolutions.com/api/admin/off-page/competitors" },
    { name: "Outreach Drafts", url: "https://www.dgeniussolutions.com/api/admin/off-page/outreach" },
    { name: "Reports", url: "https://www.dgeniussolutions.com/api/admin/off-page/reports" },
    { name: "Settings", url: "https://www.dgeniussolutions.com/api/admin/off-page/settings" },
    { name: "TurboVec Status", url: "https://www.dgeniussolutions.com/api/admin/off-page/turbovec/status" },
  ];

  console.log("\n| Endpoint | Status | Rows/Count | Details |");
  console.log("|---|:---:|:---:|---|");

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, { headers: authHeaders });
      const json = await res.json().catch(() => null);
      let count = 0;
      let extra = "";
      if (json) {
        if (Array.isArray(json)) count = json.length;
        else if (Array.isArray(json.opportunities)) count = json.opportunities.length;
        else if (Array.isArray(json.data)) count = json.data.length;
        else if (Array.isArray(json.runs)) count = json.runs.length;
        else if (Array.isArray(json.backlinks)) count = json.backlinks.length;
        else if (Array.isArray(json.mentions)) count = json.mentions.length;
        else if (Array.isArray(json.citations)) count = json.citations.length;
        else if (Array.isArray(json.competitors)) count = json.competitors.length;
        else if (Array.isArray(json.drafts)) count = json.drafts.length;
        else if (Array.isArray(json.providers)) count = json.providers.length;
        else if (json.total !== undefined) count = json.total;
        
        if (ep.name === "TurboVec Status") extra = `worker_status: ${json.worker_status || json.status}`;
        if (ep.name === "Dashboard") extra = `KPIs loaded, total_opportunities: ${json.kpis?.total_opportunities || json.overview?.total_opportunities || 'ok'}`;
      }
      console.log(`| ${ep.name} | ${res.status} | ${count} | ${extra || (json?.ok !== undefined ? `ok: ${json.ok}` : '')} |`);
    } catch (e) {
      console.log(`| ${ep.name} | ERR | 0 | ${e.message} |`);
    }
  }
}

main().catch(console.error);
