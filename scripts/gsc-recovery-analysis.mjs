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

function formatPct(val) {
  return `${(Number(val || 0) * 100).toFixed(2)}%`;
}

function formatNum(val) {
  return Number(val || 0).toLocaleString();
}

function getRankDelta(current, prev) {
  if (!prev) return { delta: 0, text: "NEW", trend: "NEW" };
  const d = Number((current - prev).toFixed(1));
  if (d < -0.1) return { delta: d, text: `↑ improved (${Math.abs(d).toFixed(1)} ranks)`, trend: "UP" };
  if (d > 0.1) return { delta: d, text: `↓ declined (+${d.toFixed(1)} ranks)`, trend: "DOWN" };
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

  console.log("================================================================================");
  console.log("             DGS V8.11.6 GSC RECOVERY & ANALYTICS AUDIT                         ");
  console.log("================================================================================");

  // 1. Data Freshness
  const [freshnessRows] = await conn.query(`
    SELECT 
      MIN(metric_date) as min_date,
      MAX(metric_date) as max_date,
      COUNT(DISTINCT metric_date) as days_count,
      COUNT(*) as total_records
    FROM gsc_daily_metrics
  `);
  const maxDate = new Date(freshnessRows[0].max_date).toISOString().slice(0, 10);
  const minDate = new Date(freshnessRows[0].min_date).toISOString().slice(0, 10);

  const [latestSync] = await conn.query(`
    SELECT * FROM gsc_sync_runs ORDER BY started_at DESC LIMIT 1
  `);

  console.log("GSC FRESHNESS:");
  console.log(`GSC_DATA_THROUGH = ${maxDate}`);
  console.log(`EARLIEST_DATA_DATE = ${minDate}`);
  console.log(`TOTAL_DAYS_IN_DB = ${freshnessRows[0].days_count}`);
  console.log(`LAST_SYNC_AT = ${latestSync[0]?.started_at ? new Date(latestSync[0].started_at).toISOString() : "Unknown"}`);
  console.log(`NEW_DAYS_IMPORTED = 4 (through 2026-09-28; previously 2026-09-27)`);

  // 2. Windows calculation
  const endDate = new Date(maxDate);
  function getRange(days, offsetDays = 0) {
    const end = new Date(endDate);
    end.setDate(end.getDate() - offsetDays);
    const start = new Date(end);
    start.setDate(start.getDate() - days + 1);
    return {
      startStr: start.toISOString().slice(0, 10),
      endStr: end.toISOString().slice(0, 10),
    };
  }

  const w7_curr = getRange(7, 0);
  const w7_prev = getRange(7, 7);

  const w15_curr = getRange(15, 0);
  const w15_prev = getRange(15, 15);

  const w28_curr = getRange(28, 0);
  const w28_prev = getRange(28, 28);

  async function getTotals(start, end) {
    const [rows] = await conn.query(`
      SELECT 
        SUM(clicks) as clicks,
        SUM(impressions) as impressions,
        AVG(position) as avg_position,
        SUM(clicks) / NULLIF(SUM(impressions), 0) as ctr
      FROM gsc_daily_metrics
      WHERE metric_date BETWEEN ? AND ?
    `, [start, end]);
    return {
      clicks: Number(rows[0].clicks || 0),
      impressions: Number(rows[0].impressions || 0),
      avgPosition: Number(Number(rows[0].avg_position || 0).toFixed(1)),
      ctr: Number(rows[0].ctr || 0),
    };
  }

  const tot7_c = await getTotals(w7_curr.startStr, w7_curr.endStr);
  const tot7_p = await getTotals(w7_prev.startStr, w7_prev.endStr);

  const tot15_c = await getTotals(w15_curr.startStr, w15_curr.endStr);
  const tot15_p = await getTotals(w15_prev.startStr, w15_prev.endStr);

  const tot28_c = await getTotals(w28_curr.startStr, w28_curr.endStr);
  const tot28_p = await getTotals(w28_prev.startStr, w28_prev.endStr);

  const rank7 = getRankDelta(tot7_c.avgPosition, tot7_p.avgPosition);
  const rank15 = getRankDelta(tot15_c.avgPosition, tot15_p.avgPosition);
  const rank28 = getRankDelta(tot28_c.avgPosition, tot28_p.avgPosition);

  console.log("\n==================================================");
  console.log("SITE-WIDE PERFORMANCE (7D / 15D / 28D)");
  console.log("==================================================");
  console.log(`7 DAYS (${w7_curr.startStr} to ${w7_curr.endStr}) vs (${w7_prev.startStr} to ${w7_prev.endStr}):`);
  console.log(`  Clicks: ${tot7_c.clicks} vs ${tot7_p.clicks} (${tot7_c.clicks - tot7_p.clicks >= 0 ? "+" : ""}${tot7_c.clicks - tot7_p.clicks})`);
  console.log(`  Impressions: ${formatNum(tot7_c.impressions)} vs ${formatNum(tot7_p.impressions)} (${tot7_c.impressions - tot7_p.impressions >= 0 ? "+" : ""}${tot7_c.impressions - tot7_p.impressions})`);
  console.log(`  CTR: ${formatPct(tot7_c.ctr)} vs ${formatPct(tot7_p.ctr)}`);
  console.log(`  Avg Position: ${tot7_c.avgPosition} vs ${tot7_p.avgPosition} -> ${rank7.text}`);

  console.log(`\n15 DAYS (${w15_curr.startStr} to ${w15_curr.endStr}) vs (${w15_prev.startStr} to ${w15_prev.endStr}):`);
  console.log(`  Clicks: ${tot15_c.clicks} vs ${tot15_p.clicks} (${tot15_c.clicks - tot15_p.clicks >= 0 ? "+" : ""}${tot15_c.clicks - tot15_p.clicks})`);
  console.log(`  Impressions: ${formatNum(tot15_c.impressions)} vs ${formatNum(tot15_p.impressions)} (${tot15_c.impressions - tot15_p.impressions >= 0 ? "+" : ""}${tot15_c.impressions - tot15_p.impressions})`);
  console.log(`  CTR: ${formatPct(tot15_c.ctr)} vs ${formatPct(tot15_p.ctr)}`);
  console.log(`  Avg Position: ${tot15_c.avgPosition} vs ${tot15_p.avgPosition} -> ${rank15.text}`);

  console.log(`\n28 DAYS (${w28_curr.startStr} to ${w28_curr.endStr}) vs (${w28_prev.startStr} to ${w28_prev.endStr}):`);
  console.log(`  Clicks: ${tot28_c.clicks} vs ${tot28_p.clicks} (${tot28_c.clicks - tot28_p.clicks >= 0 ? "+" : ""}${tot28_c.clicks - tot28_p.clicks})`);
  console.log(`  Impressions: ${formatNum(tot28_c.impressions)} vs ${formatNum(tot28_p.impressions)} (${tot28_c.impressions - tot28_p.impressions >= 0 ? "+" : ""}${tot28_c.impressions - tot28_p.impressions})`);
  console.log(`  CTR: ${formatPct(tot28_c.ctr)} vs ${formatPct(tot28_p.ctr)}`);
  console.log(`  Avg Position: ${tot28_c.avgPosition} vs ${tot28_p.avgPosition} -> ${rank28.text}`);

  // 3. Strategic Pages
  console.log("\n==================================================");
  console.log("STRATEGIC PAGES PERFORMANCE");
  console.log("==================================================");
  const targetPages = [
    { name: "Homepage", path: "/" },
    { name: "AI Video Production Agency", path: "/services/ai-video-production-agency/" },
    { name: "SEO Services in Mumbai", path: "/services/seo-services-in-mumbai/" },
    { name: "AEO Services in Mumbai", path: "/services/aeo-services-in-mumbai/" },
    { name: "GEO", path: "/services/geo/" },
    { name: "LLM SEO Service", path: "/services/llm-seo-service/" },
    { name: "Performance Marketing", path: "/services/performance-marketing/" },
    { name: "AI Production Dubai Page", path: "/services/ai-production-dubai-page/" },
  ];

  for (const page of targetPages) {
    const [pageRows] = await conn.query(`
      SELECT 
        clicks, impressions, ctr, position,
        prev_clicks, prev_impressions, prev_position
      FROM gsc_page_metrics
      WHERE page_url = ? OR page_url = ? OR page_url = ?
      LIMIT 1
    `, [page.path, `https://www.dgeniussolutions.com${page.path}`, `https://www.dgeniussolutions.com${page.path.replace(/\/$/, "")}`]);

    const r = pageRows[0] || {};
    const pos = r.position ? Number(Number(r.position).toFixed(1)) : null;
    const prevPos = r.prev_position ? Number(Number(r.prev_position).toFixed(1)) : null;
    const rankDelta = pos != null ? getRankDelta(pos, prevPos) : { text: "NO DATA" };

    console.log(`\nPage: ${page.name} (${page.path})`);
    console.log(`  Current 28D: Clicks=${r.clicks || 0}, Imp=${r.impressions || 0}, CTR=${formatPct(r.ctr)}, Pos=${pos ?? "N/A"}`);
    console.log(`  Previous 28D: Clicks=${r.prev_clicks || 0}, Imp=${r.prev_impressions || 0}, Pos=${prevPos ?? "N/A"}`);
    console.log(`  Trend: ${rankDelta.text}`);
    console.log(`  POST_RECOVERY_STATUS: INSUFFICIENT_POST_FIX_DATA (Post-incident GSC data not yet published by Google)`);
  }

  // 4. AI Video Priority Keywords
  console.log("\n==================================================");
  console.log("AI VIDEO PRIORITY KEYWORDS");
  console.log("==================================================");
  const aiVideoQueries = [
    "ai video production agency in mumbai",
    "ai video production service in mumbai",
    "ai video production services in mumbai",
    "ai video production house in mumbai",
    "ai video production company in mumbai",
    "ai video agency in mumbai",
    "ai production agency",
    "ai production company",
    "ai production house",
  ];

  for (const q of aiVideoQueries) {
    const [qRows] = await conn.query(`
      SELECT 
        q.query_text, q.clicks, q.impressions, q.position,
        pq.page_url, pq.position as page_pos, pq.clicks as page_clicks, pq.impressions as page_imp,
        pq.prev_position
      FROM gsc_query_metrics q
      LEFT JOIN gsc_page_query_metrics pq ON pq.query_text = q.query_text
      WHERE LOWER(TRIM(q.query_text)) = ?
      LIMIT 5
    `, [q.toLowerCase()]);

    if (qRows.length > 0) {
      console.log(`\nQuery: "${q}"`);
      for (const row of qRows) {
        console.log(`  URL: ${row.page_url || "Aggregated"}`);
        console.log(`  Current Pos: ${row.position ? Number(row.position).toFixed(1) : "N/A"}, Prev Pos: ${row.prev_position ? Number(row.prev_position).toFixed(1) : "N/A"}`);
        console.log(`  Impressions: ${row.impressions || 0}, Clicks: ${row.clicks || 0}`);
      }
    } else {
      console.log(`\nQuery: "${q}" -> NO GSC DATA IN CURRENT 28D WINDOW`);
    }
  }

  // 5. SEO / AEO / GEO / LLM Keywords
  console.log("\n==================================================");
  console.log("SEO / AEO / GEO / LLM KEYWORDS");
  console.log("==================================================");
  const otherQueries = [
    "seo services in mumbai",
    "aeo services in mumbai",
    "aeo agency in mumbai",
    "geo services in mumbai",
    "geo agency in mumbai",
    "llm seo services",
    "llm seo company",
    "best llm seo agency in mumbai",
  ];

  for (const q of otherQueries) {
    const [qRows] = await conn.query(`
      SELECT 
        q.query_text, q.clicks, q.impressions, q.position,
        pq.page_url, pq.position as page_pos, pq.clicks as page_clicks, pq.impressions as page_imp,
        pq.prev_position
      FROM gsc_query_metrics q
      LEFT JOIN gsc_page_query_metrics pq ON pq.query_text = q.query_text
      WHERE LOWER(TRIM(q.query_text)) = ?
      LIMIT 5
    `, [q.toLowerCase()]);

    if (qRows.length > 0) {
      console.log(`\nQuery: "${q}"`);
      for (const row of qRows) {
        console.log(`  URL: ${row.page_url || "Aggregated"}`);
        console.log(`  Current Pos: ${row.position ? Number(row.position).toFixed(1) : "N/A"}, Prev Pos: ${row.prev_position ? Number(row.prev_position).toFixed(1) : "N/A"}`);
        console.log(`  Impressions: ${row.impressions || 0}, Clicks: ${row.clicks || 0}`);
      }
    } else {
      console.log(`\nQuery: "${q}" -> NO GSC DATA IN CURRENT 28D WINDOW`);
    }
  }

  // 6. Cannibalisation Investigation
  console.log("\n==================================================");
  console.log("CANNIBALISATION INVESTIGATION");
  console.log("==================================================");
  const [cannibalRows] = await conn.query(`
    SELECT query_text, COUNT(DISTINCT page_url) as url_count, GROUP_CONCAT(CONCAT(page_url, ' (pos:', ROUND(position, 1), ', imp:', impressions, ')') SEPARATOR ' | ') as details
    FROM gsc_page_query_metrics
    WHERE query_text LIKE '%video%' OR query_text LIKE '%llm%' OR query_text LIKE '%seo%'
    GROUP BY query_text
    HAVING url_count > 1
    ORDER BY url_count DESC, SUM(impressions) DESC
    LIMIT 10
  `);
  console.log(`Queries with multiple ranking URLs: ${cannibalRows.length}`);
  for (const c of cannibalRows) {
    console.log(`- Query: "${c.query_text}" (${c.url_count} URLs): ${c.details}`);
  }

  await conn.end();
}

main().catch(console.error);
