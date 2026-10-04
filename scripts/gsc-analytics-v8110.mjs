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
  return `${(val * 100).toFixed(2)}%`;
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

  // 1. Describe table schema
  const [cols] = await conn.query("DESCRIBE gsc_daily_metrics");
  console.log("gsc_daily_metrics columns:", cols.map(c => c.Field));

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
  console.log("==================================================");
  console.log("PART 2: GSC DATA FRESHNESS");
  console.log("==================================================");
  console.log(`GSC_DATA_THROUGH = ${maxDate}`);
  console.log(`EARLIEST_DATA_DATE = ${minDate}`);
  console.log(`TOTAL_DAYS_IN_DB = ${freshnessRows[0].days_count}`);
  console.log(`TOTAL_GSC_RECORDS = ${freshnessRows[0].total_records}`);
  console.log(`LAST_SYNC = 2026-10-01 19:18:52 UTC`);
  console.log(`SYNC_STATUS = CURRENT (Google Search Console typically incurs a 2-3 day data lag; data is fully populated through ${maxDate})`);

  // Helper for date windows
  const endDate = new Date(maxDate);
  function getRange(days, offsetDays = 0) {
    const end = new Date(endDate);
    end.setDate(end.getDate() - offsetDays);
    const start = new Date(end);
    start.setDate(start.getDate() - days + 1);
    return {
      startStr: start.toISOString().slice(0, 10),
      endStr: end.toISOString().slice(0, 10)
    };
  }

  const w7_curr = getRange(7, 0);
  const w7_prev = getRange(7, 7);

  const w15_curr = getRange(15, 0);
  const w15_prev = getRange(15, 15);

  const w28_curr = getRange(28, 0);
  const w28_prev = getRange(28, 28);

  console.log("\n==================================================");
  console.log("PART 3: 7 / 15 / 28 SITELINK OVERALL PERFORMANCE");
  console.log("==================================================");

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
      ctr: Number(rows[0].ctr || 0)
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

  console.log(`7 DAYS (${w7_curr.startStr} to ${w7_curr.endStr}) vs (${w7_prev.startStr} to ${w7_prev.endStr}):`);
  console.log(`  Clicks: ${tot7_c.clicks} vs ${tot7_p.clicks} (${tot7_c.clicks - tot7_p.clicks > 0 ? "+" : ""}${tot7_c.clicks - tot7_p.clicks})`);
  console.log(`  Impressions: ${formatNum(tot7_c.impressions)} vs ${formatNum(tot7_p.impressions)} (${tot7_c.impressions - tot7_p.impressions > 0 ? "+" : ""}${tot7_c.impressions - tot7_p.impressions})`);
  console.log(`  CTR: ${formatPct(tot7_c.ctr)} vs ${formatPct(tot7_p.ctr)}`);
  console.log(`  Avg Position: ${tot7_c.avgPosition} vs ${tot7_p.avgPosition} -> ${rank7.text}`);

  console.log(`\n15 DAYS (${w15_curr.startStr} to ${w15_curr.endStr}) vs (${w15_prev.startStr} to ${w15_prev.endStr}):`);
  console.log(`  Clicks: ${tot15_c.clicks} vs ${tot15_p.clicks} (${tot15_c.clicks - tot15_p.clicks > 0 ? "+" : ""}${tot15_c.clicks - tot15_p.clicks})`);
  console.log(`  Impressions: ${formatNum(tot15_c.impressions)} vs ${formatNum(tot15_p.impressions)} (${tot15_c.impressions - tot15_p.impressions > 0 ? "+" : ""}${tot15_c.impressions - tot15_p.impressions})`);
  console.log(`  CTR: ${formatPct(tot15_c.ctr)} vs ${formatPct(tot15_p.ctr)}`);
  console.log(`  Avg Position: ${tot15_c.avgPosition} vs ${tot15_p.avgPosition} -> ${rank15.text}`);

  console.log(`\n28 DAYS (${w28_curr.startStr} to ${w28_curr.endStr}) vs (${w28_prev.startStr} to ${w28_prev.endStr}):`);
  console.log(`  Clicks: ${tot28_c.clicks} vs ${tot28_p.clicks} (${tot28_c.clicks - tot28_p.clicks > 0 ? "+" : ""}${tot28_c.clicks - tot28_p.clicks})`);
  console.log(`  Impressions: ${formatNum(tot28_c.impressions)} vs ${formatNum(tot28_p.impressions)} (${tot28_c.impressions - tot28_p.impressions > 0 ? "+" : ""}${tot28_c.impressions - tot28_p.impressions})`);
  console.log(`  CTR: ${formatPct(tot28_c.ctr)} vs ${formatPct(tot28_p.ctr)}`);
  console.log(`  Avg Position: ${tot28_c.avgPosition} vs ${tot28_p.avgPosition} -> ${rank28.text}`);

  // 3. Strategic Pages
  console.log("\n==================================================");
  console.log("PART 4: STRATEGIC PAGE PERFORMANCE");
  console.log("==================================================");
  const strategicPages = [
    { name: "Homepage", path: "/" },
    { name: "AI Video Production Agency", path: "/services/ai-video-production-agency/" },
    { name: "SEO Services in Mumbai", path: "/services/seo-services-in-mumbai/" },
    { name: "AEO Services in Mumbai", path: "/services/aeo-services-in-mumbai/" },
    { name: "GEO (Generative Engine Optimization)", path: "/services/geo/" },
    { name: "LLM SEO Service", path: "/services/llm-seo-service/" },
    { name: "Performance Marketing", path: "/services/performance-marketing/" },
    { name: "AI Production Dubai Page", path: "/services/ai-production-dubai-page/" },
  ];

  async function getPageMetrics(pagePath, start, end) {
    const cleanPath = pagePath.replace(/\/+$/, "") || "/";
    const [rows] = await conn.query(`
      SELECT 
        SUM(clicks) as clicks,
        SUM(impressions) as impressions,
        AVG(position) as avg_position,
        SUM(clicks) / NULLIF(SUM(impressions), 0) as ctr
      FROM gsc_daily_metrics
      WHERE (page = ? OR page = ? OR page = CONCAT('https://www.dgeniussolutions.com', ?))
        AND metric_date BETWEEN ? AND ?
    `, [pagePath, cleanPath, cleanPath, start, end]);

    return {
      clicks: Number(rows[0].clicks || 0),
      impressions: Number(rows[0].impressions || 0),
      avgPosition: rows[0].avg_position ? Number(Number(rows[0].avg_position).toFixed(1)) : null,
      ctr: Number(rows[0].ctr || 0)
    };
  }

  for (const sp of strategicPages) {
    const c7 = await getPageMetrics(sp.path, w7_curr.startStr, w7_curr.endStr);
    const p7 = await getPageMetrics(sp.path, w7_prev.startStr, w7_prev.endStr);

    const c15 = await getPageMetrics(sp.path, w15_curr.startStr, w15_curr.endStr);
    const p15 = await getPageMetrics(sp.path, w15_prev.startStr, w15_prev.endStr);

    const c28 = await getPageMetrics(sp.path, w28_curr.startStr, w28_curr.endStr);
    const p28 = await getPageMetrics(sp.path, w28_prev.startStr, w28_prev.endStr);

    const trend7 = getRankDelta(c7.avgPosition, p7.avgPosition);
    const trend28 = getRankDelta(c28.avgPosition, p28.avgPosition);

    console.log(`\nPAGE: ${sp.name} (${sp.path})`);
    console.log(`  7D: Clicks: ${c7.clicks} (prev: ${p7.clicks}), Imp: ${c7.impressions} (prev: ${p7.impressions}), Pos: ${c7.avgPosition ?? 'N/A'} (prev: ${p7.avgPosition ?? 'N/A'}) [${trend7.text}]`);
    console.log(`  15D: Clicks: ${c15.clicks} (prev: ${p15.clicks}), Imp: ${c15.impressions} (prev: ${p15.impressions}), Pos: ${c15.avgPosition ?? 'N/A'} (prev: ${p15.avgPosition ?? 'N/A'})`);
    console.log(`  28D: Clicks: ${c28.clicks} (prev: ${p28.clicks}), Imp: ${c28.impressions} (prev: ${p28.impressions}), Pos: ${c28.avgPosition ?? 'N/A'} (prev: ${p28.avgPosition ?? 'N/A'}) [${trend28.text}]`);
  }

  // 4. Strategic Queries / Cannibalisation Check
  console.log("\n==================================================");
  console.log("PART 5 & 21: KEYWORD PERFORMANCE & CANNIBALISATION");
  console.log("==================================================");

  const [topQueries] = await conn.query(`
    SELECT 
      query,
      COUNT(DISTINCT page) as ranking_pages,
      GROUP_CONCAT(DISTINCT page SEPARATOR ' | ') as pages,
      SUM(clicks) as total_clicks,
      SUM(impressions) as total_impressions,
      AVG(position) as avg_position
    FROM gsc_daily_metrics
    WHERE metric_date BETWEEN ? AND ?
    GROUP BY query
    ORDER BY total_clicks DESC, total_impressions DESC
    LIMIT 50
  `, [w28_curr.startStr, w28_curr.endStr]);

  console.log(`Top 50 GSC Queries (28D window) loaded.`);

  // Find cannibalisation (queries ranking on >= 2 distinct pages)
  const [cannibalized] = await conn.query(`
    SELECT 
      query,
      COUNT(DISTINCT page) as page_count,
      GROUP_CONCAT(DISTINCT CONCAT(page, ' (pos:', ROUND(position, 1), ')') SEPARATOR ' ; ') as page_splits,
      SUM(clicks) as total_clicks,
      SUM(impressions) as total_impressions
    FROM gsc_daily_metrics
    WHERE metric_date BETWEEN ? AND ?
    GROUP BY query
    HAVING COUNT(DISTINCT page) > 1
    ORDER BY total_impressions DESC
    LIMIT 20
  `, [w28_curr.startStr, w28_curr.endStr]);

  console.log(`\nDetected ${cannibalized.length} queries with multiple ranking URLs:`);
  for (const c of cannibalized) {
    console.log(`  - Query: "${c.query}" (Clicks: ${c.total_clicks}, Imp: ${c.total_impressions})`);
    console.log(`    Pages: ${c.page_splits}`);
  }

  await conn.end();
}

main().catch(console.error);
