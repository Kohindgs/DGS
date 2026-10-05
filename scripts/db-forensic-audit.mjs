import fs from "node:fs";
import mysql from "mysql2/promise";

async function main() {
  const env = fs.readFileSync("/home/u188101251/production-app/current/.env.production", "utf8");
  const cfg = {};
  for (const line of env.split("\n")) {
    const idx = line.indexOf("=");
    if (idx > 0) {
      cfg[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^['"](.*)['"]$/, "$1");
    }
  }

  const conn = await mysql.createConnection({
    host: cfg.DGS_MYSQL_HOST || "127.0.0.1",
    user: cfg.DGS_MYSQL_USER,
    password: cfg.DGS_MYSQL_PASSWORD,
    database: cfg.DGS_MYSQL_DATABASE,
  });

  console.log("=== OFF-PAGE DATABASE FORENSIC AUDIT ===");

  const tables = [
    "off_page_opportunities",
    "off_page_discovery_runs",
    "off_page_backlinks",
    "off_page_citations",
    "off_page_competitor_domains",
    "off_page_competitor_gaps",
    "off_page_brand_mentions",
    "off_page_outreach",
    "off_page_reviews",
    "off_page_target_pages",
    "off_page_vector_documents",
    "off_page_settings"
  ];

  for (const t of tables) {
    try {
      const [[{ c }]] = await conn.query(`SELECT COUNT(*) as c FROM ${t}`);
      console.log(`Table: ${t.padEnd(30)} Rows: ${c}`);
    } catch (e) {
      console.log(`Table: ${t.padEnd(30)} Error: ${e.message}`);
    }
  }

  // Inspect backlinks
  console.log("\n--- BACKLINKS ---");
  const [backlinks] = await conn.query("SELECT id, source_url, target_url, anchor_text, status, http_status, last_checked_at FROM off_page_backlinks");
  console.log(JSON.stringify(backlinks, null, 2));

  // Inspect citations
  console.log("\n--- CITATIONS ---");
  const [citations] = await conn.query("SELECT id, platform_name, listing_url, region, country, nap_status, status FROM off_page_citations");
  console.log(JSON.stringify(citations, null, 2));

  // Inspect competitor domains
  console.log("\n--- COMPETITOR DOMAINS ---");
  const [competitors] = await conn.query("SELECT id, domain, competitor_name, region, status FROM off_page_competitor_domains");
  console.log(JSON.stringify(competitors, null, 2));

  // Inspect settings
  console.log("\n--- SETTINGS ---");
  const [settings] = await conn.query("SELECT `key_name`, `key_value` FROM off_page_settings");
  console.log(JSON.stringify(settings, null, 2));

  // Inspect recent discovery runs
  console.log("\n--- RECENT DISCOVERY RUNS ---");
  const [runs] = await conn.query("SELECT run_id, provider, queries_run, results_returned, urls_validated, status, created_at FROM off_page_discovery_runs ORDER BY created_at DESC LIMIT 5");
  console.log(JSON.stringify(runs, null, 2));

  await conn.end();
}

main().catch((err) => {
  console.error("Forensic audit error:", err);
  process.exit(1);
});
