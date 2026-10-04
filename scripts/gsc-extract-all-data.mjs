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

function getDelta(current, prev) {
  if (current == null || prev == null) return { delta: 0, text: "NEW", trend: "NEW" };
  const d = Number((prev - current).toFixed(1)); // lower is better in rank
  if (d > 0.2) return { delta: d, text: `↑ +${d.toFixed(1)} ranks`, trend: "UP" };
  if (d < -0.2) return { delta: d, text: `↓ ${d.toFixed(1)} ranks`, trend: "DOWN" };
  return { delta: 0, text: "→ stable", trend: "STABLE" };
}

async function main() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: env.DGS_MYSQL_USER,
    password: env.DGS_MYSQL_PASSWORD,
    database: env.DGS_MYSQL_DATABASE,
  });

  console.log("=== 1. GSC FRESHNESS ===");
  const [fresh] = await conn.query(`
    SELECT MIN(metric_date) as min_date, MAX(metric_date) as max_date, COUNT(*) as days
    FROM gsc_daily_metrics
  `);
  const maxDate = new Date(fresh[0].max_date).toISOString().slice(0, 10);
  console.log("GSC_DATA_THROUGH:", maxDate);

  console.log("\n=== 2. PERIOD SNAPSHOTS IN DB ===");
  const [snapSummary] = await conn.query(`
    SELECT entity_type, period_type, snapshot_date, COUNT(*) as count
    FROM gsc_ranking_snapshots
    GROUP BY entity_type, period_type, snapshot_date
    ORDER BY snapshot_date DESC, period_type ASC
    LIMIT 20
  `);
  console.table(snapSummary);

  console.log("\n=== 3. STRATEGIC PAGES IN gsc_ranking_snapshots ===");
  const [stratSnaps] = await conn.query(`
    SELECT identifier, period_type, snapshot_date, clicks, impressions, ctr, position
    FROM gsc_ranking_snapshots
    WHERE entity_type = 'page'
      AND (
        identifier LIKE '%ai-video-production-agency%'
        OR identifier LIKE '%seo-services-in-mumbai%'
        OR identifier LIKE '%aeo-services-in-mumbai%'
        OR identifier LIKE '%/services/geo%'
        OR identifier LIKE '%llm-seo-service%'
        OR identifier LIKE '%performance-marketing%'
        OR identifier LIKE '%ai-production-dubai-page%'
        OR identifier = '/'
        OR identifier = 'https://www.dgeniussolutions.com/'
      )
    ORDER BY identifier, period_type, snapshot_date DESC
  `);
  console.log(`Found ${stratSnaps.length} strategic page snapshot entries.`);

  console.log("\n=== 4. KEYWORD MOVEMENTS (28D) ===");
  const [topKeywords] = await conn.query(`
    SELECT 
      query_text,
      clicks,
      impressions,
      ctr,
      position as current_position,
      prev_position,
      (position - prev_position) as rank_diff
    FROM gsc_query_metrics
    WHERE period_type = '28d'
    ORDER BY clicks DESC, impressions DESC
  `);

  let upKws = [];
  let downKws = [];
  let stableKws = [];
  let newKws = [];

  for (const k of topKeywords) {
    const cur = Number(k.current_position || 0);
    const prev = k.prev_position ? Number(k.prev_position) : null;
    if (prev == null) {
      newKws.push({ ...k, trend: "NEW" });
    } else {
      const d = Number((prev - cur).toFixed(1)); // positive = improvement
      if (d > 0.2) upKws.push({ ...k, delta: d, trend: "UP" });
      else if (d < -0.2) downKws.push({ ...k, delta: d, trend: "DOWN" });
      else stableKws.push({ ...k, delta: 0, trend: "STABLE" });
    }
  }

  console.log(`Keywords Summary: UP: ${upKws.length}, DOWN: ${downKws.length}, STABLE: ${stableKws.length}, NEW: ${newKws.length}, TOTAL: ${topKeywords.length}`);

  // Top gainers (largest positive delta in rank or clicks)
  upKws.sort((a, b) => b.delta - a.delta);
  console.log("\nTop 10 Gainers by Rank Delta:");
  console.table(upKws.slice(0, 10).map(k => ({ query: k.query_text, cur: k.current_position, prev: k.prev_position, delta: `+${k.delta}`, clicks: k.clicks, imp: k.impressions })));

  // Top decliners (most negative delta in rank)
  downKws.sort((a, b) => a.delta - b.delta);
  console.log("\nTop 10 Decliners by Rank Delta:");
  console.table(downKws.slice(0, 10).map(k => ({ query: k.query_text, cur: k.current_position, prev: k.prev_position, delta: `${k.delta}`, clicks: k.clicks, imp: k.impressions })));

  // Cannibalisation
  console.log("\n=== 5. CANNIBALISATION DETECTION ===");
  const [cannibal] = await conn.query(`
    SELECT 
      query_text,
      COUNT(DISTINCT page_url) as page_count,
      GROUP_CONCAT(DISTINCT CONCAT(page_url, ' [Pos: ', ROUND(position, 1), ', Imp: ', impressions, ']') SEPARATOR ' \n   -> ') as page_splits,
      SUM(clicks) as total_clicks,
      SUM(impressions) as total_imp
    FROM gsc_page_query_metrics
    GROUP BY query_text
    HAVING COUNT(DISTINCT page_url) > 1
    ORDER BY total_imp DESC
    LIMIT 25
  `);
  console.log(`Found ${cannibal.length} cannibalised query clusters:`);
  for (const c of cannibal) {
    console.log(`\nQuery: "${c.query_text}" (Total Clicks: ${c.total_clicks}, Total Imp: ${c.total_imp})`);
    console.log(`   -> ${c.page_splits}`);
  }

  await conn.end();
}

main().catch(console.error);
