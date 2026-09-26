import { cmsQuery, isCmsDatabaseConfigured } from "../lib/cms/db.ts";

async function main() {
  if (!isCmsDatabaseConfigured()) {
    console.error("CMS Database is not configured");
    process.exit(1);
  }

  console.log("=== 1. LATEST MONITOR RUNS ===");
  const runs = await cmsQuery(`
    SELECT id, run_type, status, status_dashboard_ok, search_central_blog_ok, docs_updates_ok,
           updates_detected, new_updates_count, updated_items_count, active_rollouts_count, started_at
    FROM google_update_monitor_runs
    ORDER BY started_at DESC
    LIMIT 3
  `);
  console.table(runs.rows);

  console.log("\n=== 2. SOURCE CURSORS ===");
  const cursors = await cmsQuery(`SELECT * FROM google_update_source_cursors`);
  console.table(cursors.rows);

  console.log("\n=== 3. ACTIVE ROLLOUT INCIDENT ===");
  const activeUpdates = await cmsQuery(`
    SELECT id, title, source, external_status, incident_begin, incident_end, status, published_at
    FROM google_search_updates
    WHERE external_status = 'ACTIVE' OR title LIKE '%spam%'
    ORDER BY published_at DESC
  `);
  console.table(activeUpdates.rows);

  console.log("\n=== 4. V8.3 GSC CANNIBALIZATION & DUPLICATION QA ===");
  const gscDupes = await cmsQuery(`
    SELECT canonical_page_key, query_text_normalized, COUNT(*) AS count
    FROM gsc_page_query_metrics
    WHERE period_type = '28d'
    GROUP BY canonical_page_key, query_text_normalized
    HAVING count > 1
  `);
  console.log("Duplicate current page-query pairs:", gscDupes.rows.length);

  const gscCount = await cmsQuery(`SELECT COUNT(*) AS total FROM gsc_page_query_metrics WHERE period_type = '28d'`);
  console.log("Total current 28d rows:", gscCount.rows[0]?.total);

  const snapCount = await cmsQuery(`SELECT COUNT(*) AS total FROM gsc_ranking_snapshots`);
  console.log("Total historical snapshots:", snapCount.rows[0]?.total);

  const brandQuery = await cmsQuery(`
    SELECT page_url, canonical_page_key, clicks, impressions, position
    FROM gsc_page_query_metrics
    WHERE query_text_normalized = 'dgenius solutions' AND period_type = '28d'
    ORDER BY impressions DESC
  `);
  console.log("\n'dgenius solutions' Brand Query distribution:");
  console.table(brandQuery.rows);

  console.log("\nVerification complete.");
}

main().catch(console.error);
