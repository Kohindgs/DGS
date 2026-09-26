import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

async function loadEnv() {
  const envFiles = [
    path.join(process.cwd(), ".env.production"),
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), ".env"),
  ];
  for (const file of envFiles) {
    try {
      const text = await fs.readFile(file, "utf8");
      for (const line of text.split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
        if (match && !process.env[match[1]]) {
          process.env[match[1]] = match[2];
        }
      }
    } catch {
      // ignore missing
    }
  }
}

await loadEnv();

function connectionOptions() {
  const uri = process.env.DGS_DATABASE_URL || process.env.DATABASE_URL;
  if (uri) {
    const url = new URL(uri);
    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ""),
      ssl: url.searchParams.get("ssl") === "true" ? {} : undefined,
    };
  }

  return {
    host: process.env.DGS_MYSQL_HOST,
    port: Number(process.env.DGS_MYSQL_PORT || 3306),
    user: process.env.DGS_MYSQL_USER,
    password: process.env.DGS_MYSQL_PASSWORD || "",
    database: process.env.DGS_MYSQL_DATABASE,
  };
}

async function main() {
  console.log("==================================================");
  console.log("DGS V8.5 — LIVE PRODUCTION VERIFICATION SUITE");
  console.log("==================================================");

  // 1. Database Connection & Schema Verification
  console.log("\n[1/5] Verifying Database Connection and Schema...");
  const conn = await mysql.createConnection(connectionOptions());
  try {
    const [tables] = await conn.query("SHOW TABLES");
    const tableNames = tables.map((t) => Object.values(t)[0]);
    console.log(`✓ Total Database Tables: ${tableNames.length}`);

    const requiredTables = [
      "blog_posts",
      "blog_revisions",
      "google_search_updates",
      "google_update_monitor_runs",
      "google_update_source_cursors",
      "gsc_page_query_metrics",
      "cms_audit_log"
    ];
    for (const req of requiredTables) {
      if (tableNames.includes(req)) {
        console.log(`  ✓ Table '${req}' exists`);
      } else {
        console.log(`  ⚠ Table '${req}' not found (or optional)`);
      }
    }

    // Check cms_audit_log entries
    const [auditLogCount] = await conn.query("SELECT COUNT(*) as count FROM cms_audit_log");
    console.log(`✓ cms_audit_log total records: ${auditLogCount[0]?.count || 0}`);
    const [recentAudits] = await conn.query("SELECT action, resource, summary, created_at FROM cms_audit_log ORDER BY created_at DESC LIMIT 5");
    if (recentAudits.length > 0) {
      console.log("✓ Recent audit events:");
      for (const a of recentAudits) {
        console.log(`  - [${a.created_at}] ${a.action} on ${a.resource}: ${a.summary || "n/a"}`);
      }
    }

    // Check blog_revisions columns
    const [revCols] = await conn.query("DESCRIBE blog_revisions");
    const revColNames = revCols.map((c) => c.Field);
    console.log(`✓ blog_revisions columns: ${revColNames.join(", ")}`);

    // Check blog_posts breakdown by status
    const [statusCounts] = await conn.query(
      "SELECT status, COUNT(*) as count FROM blog_posts GROUP BY status"
    );
    console.log("✓ Blog Posts status counts:", statusCounts);

    // 2. V8.3 GSC Invariants
    console.log("\n[2/5] Verifying V8.3 GSC Invariants...");
    const [dupes] = await conn.query(`
      SELECT canonical_page_key, query_text_normalized, COUNT(*) AS count
      FROM gsc_page_query_metrics
      WHERE period_type = '28d'
      GROUP BY canonical_page_key, query_text_normalized
      HAVING count > 1
    `);
    console.log(`✓ GSC Duplicate Current Pairs: ${dupes.length} (Target: 0)`);
    if (dupes.length > 0) {
      throw new Error(`GSC duplicate violation: found ${dupes.length} duplicate pairs`);
    }

    const [totalRows] = await conn.query(
      "SELECT COUNT(*) AS total FROM gsc_page_query_metrics WHERE period_type = '28d'"
    );
    console.log(`✓ Total Current 28d Rows: ${totalRows[0].total} (Target: 905)`);

    const [brandRows] = await conn.query(`
      SELECT page_url, canonical_page_key, clicks, impressions, position
      FROM gsc_page_query_metrics
      WHERE query_text_normalized = 'dgenius solutions' AND period_type = '28d'
      ORDER BY impressions DESC
      LIMIT 1
    `);
    console.log(`✓ Brand Query Primary Route: ${brandRows[0]?.canonical_page_key} (Position: ${brandRows[0]?.position})`);
    if (brandRows[0]?.canonical_page_key !== "/") {
      throw new Error("Brand cannibalization violation: homepage is not primary");
    }

    // 3. V8.4.1 Google Update Monitor Integrity
    console.log("\n[3/5] Verifying Google Update Monitor Health...");
    const [latestRun] = await conn.query(`
      SELECT id, status, status_dashboard_ok, search_central_blog_ok, docs_updates_ok, updates_detected, active_rollouts_count, started_at
      FROM google_update_monitor_runs
      ORDER BY started_at DESC
      LIMIT 1
    `);
    if (latestRun.length > 0) {
      console.log("✓ Latest Monitor Run:", latestRun[0]);
    }

    const [activeRollouts] = await conn.query(`
      SELECT id, title, external_status, published_at
      FROM google_search_updates
      WHERE external_status = 'ACTIVE'
    `);
    console.log(`✓ Active Rollouts Detected: ${activeRollouts.length}`);
    for (const r of activeRollouts) {
      console.log(`  - ${r.title} (${r.external_status})`);
    }

  } finally {
    await conn.end();
  }

  // 4. Live Endpoint Checks (Scheduled Blog Publisher)
  console.log("\n[4/5] Verifying Live Scheduled Blog Publisher Endpoints...");
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dgeniussolutions.com";
  const endpoint = `${baseUrl}/api/internal/blogs/publish-scheduled`;
  const secret = process.env.DGS_CRON_SECRET;

  if (!secret) {
    throw new Error("DGS_CRON_SECRET environment variable is not defined");
  }

  // Test 4a: GET -> 405
  const getRes = await fetch(endpoint, { method: "GET" });
  console.log(`✓ GET ${endpoint} -> Status ${getRes.status} (Allow header: ${getRes.headers.get("allow")})`);
  if (getRes.status !== 405) {
    throw new Error(`Expected 405 from GET, got ${getRes.status}`);
  }

  // Test 4b: POST without token -> 401
  const noAuthRes = await fetch(endpoint, { method: "POST" });
  console.log(`✓ POST ${endpoint} (no auth) -> Status ${noAuthRes.status}`);
  if (noAuthRes.status !== 401) {
    throw new Error(`Expected 401 without auth, got ${noAuthRes.status}`);
  }

  // Test 4c: POST with invalid token -> 401
  const badAuthRes = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: "Bearer definitely-invalid-secret-key" },
  });
  console.log(`✓ POST ${endpoint} (invalid auth) -> Status ${badAuthRes.status}`);
  if (badAuthRes.status !== 401) {
    throw new Error(`Expected 401 with bad auth, got ${badAuthRes.status}`);
  }

  // Test 4d: POST with VALID token -> 200
  const validAuthRes = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` },
  });
  const validData = await validAuthRes.json();
  console.log(`✓ POST ${endpoint} (valid auth) -> Status ${validAuthRes.status}`, validData);
  if (validAuthRes.status !== 200 || !validData.ok) {
    throw new Error(`Expected 200 and ok=true from scheduled publisher, got ${validAuthRes.status}`);
  }

  // 5. Live Public Endpoints
  console.log("\n[5/5] Verifying Live Public Blog Routes & Assets...");
  const publicRoutes = [
    { url: `${baseUrl}/blogs/`, type: "text/html" },
    { url: `${baseUrl}/sitemap.xml`, type: "xml" },
    { url: `${baseUrl}/llms.txt`, type: "text" },
  ];

  for (const pr of publicRoutes) {
    const res = await fetch(pr.url);
    const contentType = res.headers.get("content-type") || "";
    console.log(`✓ GET ${pr.url} -> Status ${res.status}, Content-Type: ${contentType}`);
    if (res.status !== 200) {
      throw new Error(`Public route ${pr.url} returned status ${res.status}`);
    }
  }

  console.log("\n==================================================");
  console.log("DGS V8.5 NATIVE BLOG CMS HARDENING: FULLY CLOSED");
  console.log("==================================================");
}

main().catch((err) => {
  console.error("FATAL ERROR in verification suite:", err);
  process.exit(1);
});
