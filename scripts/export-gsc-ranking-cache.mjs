import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const ROOT = process.cwd();
const envCandidates = [
  path.join(ROOT, ".env.production"),
  "/home/u188101251/production-app/shared/.env.production",
  "/home/u188101251/production-app/current/.env.production",
  "/home/u188101251/production-app/.env.production",
  path.join(ROOT, ".env.local"),
  path.join(ROOT, ".env"),
];

for (const envFile of envCandidates) {
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].trim().replace(/^['"](.*)['"]$/, "$1");
      }
    }
  }
}

function normalPath(urlOrPath) {
  try {
    let p = urlOrPath.startsWith("http") ? new URL(urlOrPath).pathname : urlOrPath;
    p = p.split(/[?#]/)[0];
    if (!p.startsWith("/")) p = "/" + p;
    if (!p.endsWith("/") && !p.includes(".")) p = p + "/";
    return p.toLowerCase();
  } catch {
    return urlOrPath;
  }
}

async function exportGscCache() {
  const pool = mysql.createPool(
    process.env.DGS_DATABASE_URL || {
      host: process.env.DGS_MYSQL_HOST,
      port: Number(process.env.DGS_MYSQL_PORT || 3306),
      user: process.env.DGS_MYSQL_USER,
      password: process.env.DGS_MYSQL_PASSWORD,
      database: process.env.DGS_MYSQL_DATABASE,
    }
  );

  console.log("=== EXPORTING GSC RANKING CACHE FROM DATABASE ===");

  // 1. Fetch latest metric dates per dataset
  let latestDailyMetricDate = null;
  let latestQueryMetricDate = null;
  let latestPageMetricDate = null;

  try {
    const [dailyRows] = await pool.query(
      "SELECT MAX(metric_date) as max_date FROM gsc_daily_metrics"
    );
    if (dailyRows && dailyRows[0]?.max_date) {
      latestDailyMetricDate = new Date(dailyRows[0].max_date).toISOString().slice(0, 10);
    }
  } catch (e) {
    console.warn("Could not query gsc_daily_metrics date:", e.message);
  }

  try {
    const [queryDateRows] = await pool.query(
      "SELECT MAX(metric_date) as max_date FROM gsc_page_query_metrics"
    );
    if (queryDateRows && queryDateRows[0]?.max_date) {
      latestQueryMetricDate = new Date(queryDateRows[0].max_date).toISOString().slice(0, 10);
    }
  } catch (e) {
    console.warn("Could not query gsc_page_query_metrics date:", e.message);
  }

  try {
    const [pageDateRows] = await pool.query(
      "SELECT MAX(updated_at) as max_updated FROM gsc_page_metrics"
    );
    if (pageDateRows && pageDateRows[0]?.max_updated) {
      latestPageMetricDate = new Date(pageDateRows[0].max_updated).toISOString().slice(0, 10);
    }
  } catch (e) {
    console.warn("Could not query gsc_page_metrics updated_at date:", e.message);
  }

  // Calculate latestAvailableMetricDate = MAX(daily, query, page)
  const availableDates = [latestDailyMetricDate, latestQueryMetricDate, latestPageMetricDate].filter(Boolean);
  const latestAvailableMetricDate = availableDates.length > 0
    ? [...availableDates].sort().reverse()[0]
    : new Date().toISOString().slice(0, 10);

  const latestMetricDate = latestAvailableMetricDate;
  console.log(`Freshness Dates: Daily=${latestDailyMetricDate}, Query=${latestQueryMetricDate}, Page=${latestPageMetricDate}, Available=${latestAvailableMetricDate}`);

  // 2. Fetch all 28d query rows
  const [queryRows] = await pool.query(
    "SELECT page_url, query_text, clicks, impressions, position, prev_clicks, prev_impressions, prev_position, metric_date FROM gsc_page_query_metrics WHERE period_type = '28d'"
  );
  console.log(`Fetched ${queryRows.length} query records from gsc_page_query_metrics`);

  // 3. Fetch all 28d page rows
  let pageRows = [];
  try {
    const [pRows] = await pool.query(
      "SELECT page_url, clicks, impressions, position, prev_clicks, prev_impressions, prev_position FROM gsc_page_metrics WHERE period_type = '28d'"
    );
    pageRows = pRows || [];
    console.log(`Fetched ${pageRows.length} page records from gsc_page_metrics`);
  } catch (e) {
    console.warn("Could not query gsc_page_metrics:", e.message);
  }

  // 4. Transform queries
  const queries = [];
  for (const r of queryRows) {
    const qText = (r.query_text || "").trim();
    if (!qText) continue;
    const cleanPath = normalPath(r.page_url || "");
    const curClicks = Number(r.clicks || 0);
    const prevClicks = Number(r.prev_clicks || 0);
    const curImp = Number(r.impressions || 0);
    const prevImp = Number(r.prev_impressions || 0);
    const curPos = r.position != null ? Number(Number(r.position).toFixed(2)) : null;
    const prevPos = r.prev_position != null ? Number(Number(r.prev_position).toFixed(2)) : null;

    queries.push({
      query: qText,
      pageUrl: r.page_url,
      path: cleanPath,
      currentClicks: curClicks,
      previousClicks: prevClicks,
      clickDelta: curClicks - prevClicks,
      clickDeltaPct: prevClicks > 0 ? Number((((curClicks - prevClicks) / prevClicks) * 100).toFixed(1)) : 0,
      currentImpressions: curImp,
      previousImpressions: prevImp,
      impressionDelta: curImp - prevImp,
      impressionDeltaPct: prevImp > 0 ? Number((((curImp - prevImp) / prevImp) * 100).toFixed(1)) : 0,
      currentPosition: curPos,
      previousPosition: prevPos,
      positionDelta: curPos != null && prevPos != null ? Number((curPos - prevPos).toFixed(2)) : null,
      currentCtr: curImp > 0 ? Number(((curClicks / curImp) * 100).toFixed(2)) : 0,
      previousCtr: prevImp > 0 ? Number(((prevClicks / prevImp) * 100).toFixed(2)) : 0,
      metricDate: r.metric_date ? new Date(r.metric_date).toISOString().slice(0, 10) : latestMetricDate,
    });
  }

  // 5. Calculate top lost and top gained queries
  const topLostQueries = queries
    .filter((q) => (q.previousImpressions >= 5 || q.currentImpressions >= 5) && (q.clickDelta < 0 || q.impressionDelta < 0 || (q.positionDelta != null && q.positionDelta >= 2.5)))
    .sort((a, b) => {
      const scoreA = a.clickDelta * 25 + a.impressionDelta + (a.positionDelta != null && a.positionDelta > 0 ? a.positionDelta * -3 : 0);
      const scoreB = b.clickDelta * 25 + b.impressionDelta + (b.positionDelta != null && b.positionDelta > 0 ? b.positionDelta * -3 : 0);
      return scoreA - scoreB;
    })
    .slice(0, 25);

  const topGainedQueries = queries
    .filter((q) => (q.currentImpressions >= 5 || q.previousImpressions >= 5) && (q.clickDelta > 0 || q.impressionDelta > 0 || (q.positionDelta != null && q.positionDelta <= -1.5)))
    .sort((a, b) => {
      const scoreA = a.clickDelta * 25 + a.impressionDelta + (a.positionDelta != null && a.positionDelta < 0 ? Math.abs(a.positionDelta) * 3 : 0);
      const scoreB = b.clickDelta * 25 + b.impressionDelta + (b.positionDelta != null && b.positionDelta < 0 ? Math.abs(b.positionDelta) * 3 : 0);
      return scoreB - scoreA;
    })
    .slice(0, 25);

  // 6. Aggregate pageMetrics (from pageRows and query aggregation)
  const pageMap = new Map();
  // Aggregate from queries first
  for (const q of queries) {
    if (!pageMap.has(q.path)) {
      pageMap.set(q.path, {
        path: q.path,
        metrics: {
          currentClicks: 0,
          previousClicks: 0,
          clickDelta: 0,
          clickDeltaPct: 0,
          currentImpressions: 0,
          previousImpressions: 0,
          impressionDelta: 0,
          impressionDeltaPct: 0,
          currentWeightedPosition: null,
          previousWeightedPosition: null,
          positionDelta: 0,
          currentCtr: 0,
          previousCtr: 0,
        },
        _curPosWeightedSum: 0,
        _curWeight: 0,
        _prevPosWeightedSum: 0,
        _prevWeight: 0,
        classification: "STABLE",
      });
    }
    const p = pageMap.get(q.path);
    p.metrics.currentClicks += q.currentClicks;
    p.metrics.previousClicks += q.previousClicks;
    p.metrics.currentImpressions += q.currentImpressions;
    p.metrics.previousImpressions += q.previousImpressions;
    if (q.currentPosition != null && q.currentImpressions > 0) {
      p._curPosWeightedSum += q.currentPosition * q.currentImpressions;
      p._curWeight += q.currentImpressions;
    }
    if (q.previousPosition != null && q.previousImpressions > 0) {
      p._prevPosWeightedSum += q.previousPosition * q.previousImpressions;
      p._prevWeight += q.previousImpressions;
    }
  }

  // Finalize weighted positions
  for (const [pth, p] of pageMap.entries()) {
    if (p._curWeight > 0) {
      p.metrics.currentWeightedPosition = Number((p._curPosWeightedSum / p._curWeight).toFixed(2));
    }
    if (p._prevWeight > 0) {
      p.metrics.previousWeightedPosition = Number((p._prevPosWeightedSum / p._prevWeight).toFixed(2));
    }
    if (p.metrics.currentWeightedPosition != null && p.metrics.previousWeightedPosition != null) {
      p.metrics.positionDelta = Number((p.metrics.currentWeightedPosition - p.metrics.previousWeightedPosition).toFixed(2));
    }
    p.metrics.clickDelta = p.metrics.currentClicks - p.metrics.previousClicks;
    p.metrics.impressionDelta = p.metrics.currentImpressions - p.metrics.previousImpressions;
    delete p._curPosWeightedSum;
    delete p._curWeight;
    delete p._prevPosWeightedSum;
    delete p._prevWeight;
  }

  // Supplement/override with gsc_page_metrics where available (e.g. for Dubai SEO where queries were withheld)
  for (const pr of pageRows) {
    const pth = normalPath(pr.page_url || "");
    if (!pth) continue;
    const curImp = Number(pr.impressions || 0);
    const prevImp = Number(pr.prev_impressions || 0);
    const curClicks = Number(pr.clicks || 0);
    const prevClicks = Number(pr.prev_clicks || 0);
    const curPos = pr.position != null ? Number(Number(pr.position).toFixed(2)) : null;
    const prevPos = pr.prev_position != null ? Number(Number(pr.prev_position).toFixed(2)) : null;

    if (!pageMap.has(pth) || pageMap.get(pth).metrics.currentImpressions === 0) {
      pageMap.set(pth, {
        path: pth,
        metrics: {
          currentClicks: curClicks,
          previousClicks: prevClicks,
          clickDelta: curClicks - prevClicks,
          clickDeltaPct: prevClicks > 0 ? Number((((curClicks - prevClicks) / prevClicks) * 100).toFixed(1)) : 0,
          currentImpressions: curImp,
          previousImpressions: prevImp,
          impressionDelta: curImp - prevImp,
          impressionDeltaPct: prevImp > 0 ? Number((((curImp - prevImp) / prevImp) * 100).toFixed(1)) : 0,
          currentWeightedPosition: curPos,
          previousWeightedPosition: prevPos,
          positionDelta: curPos != null && prevPos != null ? Number((curPos - prevPos).toFixed(2)) : 0,
          currentCtr: curImp > 0 ? Number(((curClicks / curImp) * 100).toFixed(2)) : 0,
          previousCtr: prevImp > 0 ? Number(((prevClicks / prevImp) * 100).toFixed(2)) : 0,
        },
        classification: curImp === 0 && prevImp === 0 ? "INSUFFICIENT_DATA" : "STABLE",
      });
    }
  }

  const pageMetrics = Array.from(pageMap.values());

  const cacheOutput = {
    generatedAt: new Date().toISOString(),
    source: "PRODUCTION_GSC_DATABASE_EXPORT",
    latestDailyMetricDate: latestDailyMetricDate || "2026-09-24",
    latestQueryMetricDate: latestQueryMetricDate || "2026-09-27",
    latestPageMetricDate: latestPageMetricDate || "2026-09-27",
    latestAvailableMetricDate: latestAvailableMetricDate || "2026-09-27",
    latestMetricDate: latestAvailableMetricDate || new Date().toISOString().slice(0, 10),
    periodType: "28d",
    queryCount: queries.length,
    pageCount: pageMetrics.length,
    topLostQueries,
    topGainedQueries,
    pageMetrics,
    queries,
  };

  const outPath = path.join(ROOT, "data/audit/gsc-page-query-metrics.cache.json");
  fs.writeFileSync(outPath, JSON.stringify(cacheOutput, null, 2), "utf8");
  console.log(`✓ Successfully exported programmatically generated GSC cache: ${outPath} (${queries.length} queries, ${pageMetrics.length} pages)`);

  await pool.end();
}

exportGscCache().catch((err) => {
  console.error("GSC Cache Export failed:", err);
  process.exit(1);
});
