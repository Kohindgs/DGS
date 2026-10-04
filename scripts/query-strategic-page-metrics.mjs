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

  const strategicUrls = [
    { key: "Homepage", url: "https://www.dgeniussolutions.com/" },
    { key: "AI Video Production Agency", url: "https://www.dgeniussolutions.com/services/ai-video-production-agency/" },
    { key: "SEO Services in Mumbai", url: "https://www.dgeniussolutions.com/services/seo-services-in-mumbai/" },
    { key: "AEO Services in Mumbai", url: "https://www.dgeniussolutions.com/services/aeo-services-in-mumbai/" },
    { key: "GEO", url: "https://www.dgeniussolutions.com/services/geo/" },
    { key: "LLM SEO Service", url: "https://www.dgeniussolutions.com/services/llm-seo-service/" },
    { key: "Performance Marketing", url: "https://www.dgeniussolutions.com/services/performance-marketing/" },
    { key: "AI Production Dubai Page", url: "https://www.dgeniussolutions.com/services/ai-production-dubai-page/" },
  ];

  for (const p of strategicUrls) {
    const [snaps] = await conn.query(`
      SELECT period_type, clicks, impressions, ctr, position, snapshot_date
      FROM gsc_ranking_snapshots
      WHERE entity_type = 'page'
        AND (identifier = ? OR identifier = ?)
      ORDER BY snapshot_date DESC, period_type ASC
      LIMIT 10
    `, [p.url, p.url.replace("https://www.dgeniussolutions.com", "")]);

    const [cur28] = await conn.query(`
      SELECT clicks, impressions, ctr, position, prev_position, prev_clicks, prev_impressions
      FROM gsc_page_metrics
      WHERE period_type = '28d'
        AND (page_url = ? OR page_url = ?)
      LIMIT 1
    `, [p.url, p.url.replace("https://www.dgeniussolutions.com", "")]);

    console.log(`\n========================================`);
    console.log(`PAGE: ${p.key} (${p.url})`);
    console.log(`Current 28D row:`, cur28[0]);
    console.log(`Snapshots available:`, snaps.map(s => `${s.period_type} (${s.snapshot_date?.toISOString().slice(0,10)}): Clicks: ${s.clicks}, Imp: ${s.impressions}, Pos: ${s.position}`));
  }

  await conn.end();
}

main().catch(console.error);
