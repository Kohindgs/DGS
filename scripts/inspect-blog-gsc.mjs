import mysql from "mysql2/promise";
import fs from "node:fs";

function loadEnv() {
  const content = fs.readFileSync(".env.production", "utf8");
  const config = {};
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (m) {
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      config[m[1]] = val;
    }
  }
  return config;
}

const env = loadEnv();

async function main() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: env.DGS_MYSQL_USER,
    password: env.DGS_MYSQL_PASSWORD,
    database: env.DGS_MYSQL_DATABASE,
  });

  const blogUrls = [
    "https://www.dgeniussolutions.com/blogs/",
    "https://www.dgeniussolutions.com/blogs/google-ads-for-b2b-lead-generation-how-to-get-better-quality-leads/",
    "https://www.dgeniussolutions.com/blogs/google-september-2026-spam-update-what-website-owners-should-know/",
  ];

  for (const u of blogUrls) {
    const [rows] = await conn.query("SELECT * FROM gsc_page_metrics WHERE page_url = ? OR page_url = ?", [u, u.replace(/\/$/, "")]);
    console.log("=== Page metric for", u, "===");
    console.log(rows);
    const [pq] = await conn.query("SELECT query_text, clicks, impressions, position FROM gsc_page_query_metrics WHERE page_url LIKE ?", ["%" + u.replace("https://www.dgeniussolutions.com", "") + "%"]);
    console.log("=== Page queries for", u, "===");
    console.log(pq);
  }

  await conn.end();
}

main().catch(console.error);
