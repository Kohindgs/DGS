/**
 * DGS V8.12.6 live green-gate verifier — READ-ONLY.
 * - HTTP checks against production (public SEO, auth guard, lanes API, provider matrix, Action Center queue rules)
 * - Direct MariaDB reconciliation over SSH (SELECT only)
 * Never writes to production records.
 */
import fs from "node:fs/promises";
import { execSync } from "node:child_process";

const BASE_URL = "https://www.dgeniussolutions.com";
const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail !== undefined ? ` — ${typeof detail === "string" ? detail : JSON.stringify(detail)}` : ""}`);
};

const REMOTE_DB_SCRIPT = String.raw`
import fs from "node:fs";
import mysql from "mysql2/promise";
const env = {};
for (const line of fs.readFileSync("/home/u188101251/production-app/shared/.env.production", "utf8").split("\n")) {
  const i = line.indexOf("="); if (i > 0) { let v = line.slice(i + 1).trim(); if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1); env[line.slice(0, i).trim()] = v; }
}
const c = await mysql.createConnection({ host: env.DGS_MYSQL_HOST || "127.0.0.1", user: env.DGS_MYSQL_USER, password: env.DGS_MYSQL_PASSWORD, database: env.DGS_MYSQL_DATABASE, dateStrings: true });
const q = async (sql) => (await c.query(sql))[0];
const out = {
  total: (await q("SELECT COUNT(*) n FROM off_page_opportunities"))[0].n,
  byStatus: await q("SELECT status, COUNT(*) n FROM off_page_opportunities GROUP BY status ORDER BY n DESC"),
  byVerification: await q("SELECT COALESCE(verification_status,'NULL') v, COUNT(*) n FROM off_page_opportunities GROUP BY v ORDER BY n DESC"),
  byLinkType: await q("SELECT dofollow_status v, COUNT(*) n FROM off_page_opportunities GROUP BY v ORDER BY n DESC"),
  byFree: await q("SELECT free_status v, COUNT(*) n FROM off_page_opportunities GROUP BY v ORDER BY n DESC"),
  bySourceType: await q("SELECT COALESCE(source_type,'NULL') v, COUNT(*) n FROM off_page_opportunities GROUP BY v ORDER BY n DESC"),
  byLane: await q("SELECT COALESCE(discovery_lane,'NULL') v, status, COUNT(*) n FROM off_page_opportunities WHERE discovery_lane IS NOT NULL GROUP BY v, status ORDER BY v"),
  needsReview: (await q("SELECT COUNT(*) n FROM off_page_opportunities WHERE status IN ('MANAGER_REVIEW','QUALIFIED','APPROVED') AND (owner IS NULL OR owner='')"))[0].n,
  needsReviewNotVerified: (await q("SELECT COUNT(*) n FROM off_page_opportunities WHERE status IN ('MANAGER_REVIEW','QUALIFIED','APPROVED') AND (owner IS NULL OR owner='') AND COALESCE(verification_status,'') <> 'VERIFIED_ACTIVE'"))[0].n,
  dofollowWithoutObservation: (await q("SELECT COUNT(*) n FROM off_page_opportunities WHERE dofollow_status IN ('DOFOLLOW','NOFOLLOW','UGC','SPONSORED','MIXED')"))[0].n,
  activeBacklinks: await q("SELECT status, verified_status, COUNT(*) n FROM off_page_backlinks GROUP BY status, verified_status"),
  backlinksLiveNotOnDgs: (await q("SELECT COUNT(*) n FROM off_page_backlinks WHERE status='LIVE' AND target_url NOT LIKE '%dgeniussolutions.com%'"))[0].n,
  laneRuns: await q("SELECT provider, status, started_at, queries_run, results_returned, valid_candidates, inserted_count, spam_rejected FROM off_page_discovery_runs WHERE provider LIKE 'LANE:%' OR provider LIKE 'REVERIFY:%' ORDER BY started_at DESC LIMIT 30"),
  vectorDocs: (await q("SELECT COUNT(*) n FROM off_page_vector_documents WHERE deleted_at IS NULL"))[0].n,
  braveKeyConfigured: !!(env.BRAVE_SEARCH_API_KEY && env.BRAVE_SEARCH_API_KEY.trim()),
  columns: (await q("SHOW COLUMNS FROM off_page_opportunities")).map((x) => x.Field).filter((f) => ["source_type","discovery_lane","semantic_status","qualification_reason","page_title","last_checked_at"].includes(f)),
  dofollowDefault: (await q("SHOW COLUMNS FROM off_page_opportunities WHERE Field='dofollow_status'"))[0]?.Default,
};
console.log("__DB__" + JSON.stringify(out));
await c.end();
`;

async function main() {
  console.log("DGS V8.12.6 LIVE GREEN-GATE VERIFIER (read-only)\n");

  // ---- Public SEO regression ----
  const home = await fetch(`${BASE_URL}/`, { redirect: "follow" });
  const homeHtml = await home.text();
  check("Public home 200", home.status === 200, home.status);
  check("Public home robots index, follow", /<meta name="robots" content="index, follow"/.test(homeHtml));
  const robots = await fetch(`${BASE_URL}/robots.txt`);
  const robotsTxt = await robots.text();
  check("robots.txt 200 + sitemap", robots.status === 200 && /sitemap/i.test(robotsTxt), robots.status);
  const sm = await fetch(`${BASE_URL}/sitemap.xml`);
  check("sitemap.xml 200", sm.status === 200, sm.status);

  // ---- Security: unauthenticated off-page admin routes must be rejected ----
  for (const p of ["/api/admin/off-page/action-center", "/api/admin/off-page/mismatches", "/api/admin/off-page/lanes", "/api/admin/off-page/integrations/google-sheets"]) {
    const r = await fetch(`${BASE_URL}${p}`, { redirect: "manual" });
    check(`Unauthenticated GET ${p} rejected`, r.status === 401 || r.status === 403, r.status);
  }
  const ur = await fetch(`${BASE_URL}/api/admin/off-page/backlinks/discover`, { method: "POST", redirect: "manual", headers: { "Content-Type": "application/json" }, body: "{}" });
  check("Unauthenticated POST backlinks/discover rejected", ur.status === 401 || ur.status === 403, ur.status);

  // ---- Admin session ----
  const envContent = await fs.readFile(".env.production", "utf8");
  const get = (k) => (envContent.split(/\r?\n/).find((l) => l.startsWith(`${k}=`)) || "").slice(k.length + 1).trim().replace(/^['"](.*)['"]$/, "$1");
  const body = new URLSearchParams({ email: get("DGS_ADMIN_EMAIL"), password: get("DGS_ADMIN_PASSWORD") });
  const auth = await fetch(`${BASE_URL}/api/admin/session`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString(), redirect: "manual" });
  const cookie = (auth.headers.get("set-cookie") || "").split(";")[0];
  check("Admin session acquired", !!cookie);
  const headers = { Cookie: cookie };

  // ---- Lanes API ----
  const lanesRes = await fetch(`${BASE_URL}/api/admin/off-page/lanes`, { headers });
  const lanes = await lanesRes.json();
  check("Lanes API ok", lanes.ok === true, lanesRes.status);
  check("13 discovery lanes registered", lanes.lanes?.length === 13, lanes.lanes?.length);
  console.log("      Brave:", JSON.stringify(lanes.brave));
  for (const l of lanes.lanes || []) {
    console.log(`      ${l.id.padEnd(22)} ready=${l.ready} ${l.readiness} | last=${l.last_run ? `${l.last_run.status} ${l.last_run.message || ""}` : "never"}`);
  }

  // ---- Provider matrix ----
  const pr = await fetch(`${BASE_URL}/api/admin/off-page/providers`, { headers });
  const prj = await pr.json().catch(() => ({}));
  const matrix = prj.matrix || prj.providers || prj.health || [];
  const brave = (Array.isArray(matrix) ? matrix : []).find((m) => m.id === "brave-search");
  check("Provider matrix includes Brave", !!brave, brave ? `${brave.status}: ${brave.reason}` : JSON.stringify(Object.keys(prj)));

  // ---- Action Center queue rule ----
  const ac = await (await fetch(`${BASE_URL}/api/admin/off-page/action-center`, { headers })).json();
  const bad = (ac.needsReviewItems || []).filter((i) => !["QUALIFIED", "MANAGER_REVIEW", "APPROVED"].includes(String(i.status).toUpperCase()));
  check("Needs Review contains only QUALIFIED/MANAGER_REVIEW/APPROVED", ac.success && bad.length === 0, { needsReviewCount: ac.kpis?.needsReviewCount, raw: ac.kpis?.rawCandidatesCount, offending: bad.length });

  // ---- DB reconciliation (SELECT only) ----
  const raw = execSync(
    `ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/current/tmp/v8126verify.mjs && cd /home/u188101251/production-app/current && node tmp/v8126verify.mjs; rm -f tmp/v8126verify.mjs"`,
    { input: REMOTE_DB_SCRIPT, encoding: "utf8" }
  );
  const db = JSON.parse(raw.slice(raw.indexOf("__DB__") + 6).trim());
  console.log("\nDB RECONCILIATION:");
  console.log(JSON.stringify(db, null, 2));
  check("V8.12.6 columns present", db.columns.length === 6, db.columns);
  check("dofollow_status column default UNKNOWN", db.dofollowDefault === "UNKNOWN", db.dofollowDefault);
  check("Zero opportunity link types asserted without live observation", Number(db.dofollowWithoutObservation) === 0, db.dofollowWithoutObservation);
  check("Needs Review (DB) == Action Center KPI", Number(db.needsReview) === Number(ac.kpis?.needsReviewCount), { db: db.needsReview, api: ac.kpis?.needsReviewCount });
  check("Every Needs Review record is VERIFIED_ACTIVE", Number(db.needsReviewNotVerified) === 0, db.needsReviewNotVerified);
  check("No LIVE backlink pointing outside dgeniussolutions.com", Number(db.backlinksLiveNotOnDgs) === 0, db.backlinksLiveNotOnDgs);

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  await fs.writeFile("v8126-gate-result.json", JSON.stringify({ at: new Date().toISOString(), results, db, lanes: lanes.lanes, brave: lanes.brave }, null, 2));
  if (failed.length) process.exit(1);
}

main().catch((e) => {
  console.error("VERIFIER ERROR:", e);
  process.exit(1);
});
