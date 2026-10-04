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

  console.log("Connected to MySQL.");

  // Check gsc_page_metrics
  const [pageRows] = await conn.query("SELECT * FROM gsc_page_metrics LIMIT 10");
  console.log("\nSample gsc_page_metrics:");
  console.log(pageRows);

  // Check strategic pages in gsc_page_metrics
  const [stratPages] = await conn.query(`
    SELECT * FROM gsc_page_metrics 
    WHERE page_url LIKE '%ai-video%' 
       OR page_url LIKE '%seo-services-in-mumbai%'
       OR page_url LIKE '%aeo-services%'
       OR page_url LIKE '%/geo%'
       OR page_url LIKE '%llm-seo%'
       OR page_url LIKE '%performance-marketing%'
       OR page_url LIKE '%dubai%'
       OR page_url = 'https://www.dgeniussolutions.com/'
       OR page_url = '/'
  `);
  console.log("\nStrategic Pages in gsc_page_metrics:", stratPages.length);
  for (const p of stratPages) {
    console.log(p.page_url, "| Clicks:", p.clicks, "| Imp:", p.impressions, "| Pos:", p.position, "| PrevPos:", p.prev_position, "| Period:", p.period_type);
  }

  // Check priority keywords in gsc_query_metrics
  const [kwRows] = await conn.query(`
    SELECT * FROM gsc_query_metrics
    WHERE query_text LIKE '%ai video%'
       OR query_text LIKE '%seo%'
       OR query_text LIKE '%aeo%'
       OR query_text LIKE '%geo%'
       OR query_text LIKE '%llm%'
       OR query_text LIKE '%dubai%'
       OR query_text LIKE '%avatar%'
       OR query_text LIKE '%festival%'
    ORDER BY impressions DESC
    LIMIT 30
  `);
  console.log("\nMatching priority keywords in gsc_query_metrics:", kwRows.length);
  for (const k of kwRows) {
    console.log(`"${k.query_text}" | Clicks: ${k.clicks} | Imp: ${k.impressions} | Pos: ${k.position} | PrevPos: ${k.prev_position}`);
  }

  // Check gsc_ranking_snapshots
  const [snapCount] = await conn.query("SELECT COUNT(*) as count FROM gsc_ranking_snapshots");
  console.log("\ngsc_ranking_snapshots count:", snapCount[0].count);

  await conn.end();
}

main().catch(console.error);
