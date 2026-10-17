import mysql from "mysql2/promise";
import fs from "node:fs";

async function main() {
  const envContent = fs.readFileSync(".env.production", "utf8");
  const cfg = {};
  for (const line of envContent.split("\n")) {
    const idx = line.indexOf("=");
    if (idx > 0) {
      cfg[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^['"](.*)['"]$/, "$1");
    }
  }

  const conn = await mysql.createConnection({
    host: cfg.DGS_MYSQL_HOST || "127.0.0.1",
    port: parseInt(cfg.DGS_MYSQL_PORT || "3306"),
    user: cfg.DGS_MYSQL_USER,
    password: cfg.DGS_MYSQL_PASSWORD,
    database: cfg.DGS_MYSQL_DATABASE,
  });

  console.log("=== GSC SEARCH FOR INDUSTRY KEYWORDS ===");
  const keywords = ["auto", "car", "edtech", "education", "fmcg", "manufacturing", "industrial", "video"];
  for (const kw of keywords) {
    const [rows] = await conn.execute(
      "SELECT query_text, page_url, clicks, impressions, ctr, position FROM gsc_page_query_metrics WHERE query_text LIKE ? ORDER BY impressions DESC LIMIT 5",
      [`%${kw}%`]
    );
    console.log(`\nKeyword: "${kw}" -> found ${rows.length} rows:`);
    if (rows.length) console.table(rows);
  }

  console.log("\n=== ALL QUERIES RANKING FOR AI VIDEO PAGES ===");
  const [aiRows] = await conn.execute(
    "SELECT query_text, page_url, clicks, impressions, ctr, position FROM gsc_page_query_metrics WHERE page_url LIKE '%ai-video%' OR query_text LIKE '%ai video%' ORDER BY impressions DESC LIMIT 20"
  );
  console.table(aiRows);
  await conn.end();
}

main().catch(console.error);
