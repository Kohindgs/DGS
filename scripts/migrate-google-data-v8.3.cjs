const fs = require('fs');
const mysql = require('mysql2/promise');
const crypto = require('crypto');

// Read environment
const envFile = process.env.DGS_ENV_FILE || '/home/u188101251/production-app/shared/.env.production';
let env = {};
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  for (const line of envContent.split('\n')) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2];
  }
} else {
  env = process.env;
}

function canonicalPageKey(input) {
  if (!input) return '/';
  let str = String(input).trim();
  const hashIdx = str.indexOf('#');
  if (hashIdx !== -1) str = str.slice(0, hashIdx);
  let pathname = '/';
  if (/^https?:\/\//i.test(str)) {
    try {
      const parsed = new URL(str);
      pathname = parsed.pathname || '/';
    } catch {
      str = str.replace(/^https?:\/\/[^/]+/i, '') || '/';
      const qIdx = str.indexOf('?');
      pathname = qIdx !== -1 ? str.slice(0, qIdx) : str;
    }
  } else {
    if (!str.startsWith('/')) str = '/' + str;
    const qIdx = str.indexOf('?');
    pathname = qIdx !== -1 ? str.slice(0, qIdx) : str;
  }
  pathname = pathname.replace(/\/+/g, '/');
  if (!pathname.endsWith('/')) pathname += '/';
  return pathname;
}

function normalizeSearchQuery(input) {
  if (!input) return '';
  return String(input)
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019\u02BC\u0060]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

(async () => {
  const db = await mysql.createConnection(env.DGS_DATABASE_URL || {
    host: env.DGS_MYSQL_HOST,
    port: Number(env.DGS_MYSQL_PORT || 3306),
    user: env.DGS_MYSQL_USER,
    password: env.DGS_MYSQL_PASSWORD,
    database: env.DGS_MYSQL_DATABASE
  });

  console.log('=== STARTING DGS SEO V8.3 SAFE DATABASE MIGRATION ===\n');

  // STEP 1: SAFETY BACKUP TABLES
  console.log('1. Creating timestamped safety backup tables...');
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);

  await db.query(`CREATE TABLE IF NOT EXISTS _backup_v83_gsc_page_query_metrics AS SELECT * FROM gsc_page_query_metrics`);
  await db.query(`CREATE TABLE IF NOT EXISTS _backup_v83_gsc_query_metrics AS SELECT * FROM gsc_query_metrics`);
  await db.query(`CREATE TABLE IF NOT EXISTS _backup_v83_gsc_page_metrics AS SELECT * FROM gsc_page_metrics`);
  await db.query(`CREATE TABLE IF NOT EXISTS _backup_v83_gsc_ranking_snapshots AS SELECT * FROM gsc_ranking_snapshots`);
  await db.query(`CREATE TABLE IF NOT EXISTS _backup_v83_ga4_page_metrics AS SELECT * FROM ga4_page_metrics`);
  console.log('   ✓ Safety backup tables confirmed.\n');

  // STEP 2: SCHEMA ENHANCEMENTS
  console.log('2. Applying schema enhancements...');

  // gsc_page_query_metrics columns
  const [pqCols] = await db.query('DESCRIBE gsc_page_query_metrics');
  const pqColSet = new Set(pqCols.map(c => c.Field));

  if (!pqColSet.has('canonical_page_key')) {
    await db.query('ALTER TABLE gsc_page_query_metrics ADD COLUMN canonical_page_key VARCHAR(512) NULL, ADD INDEX idx_gsc_pq_canon (canonical_page_key(255))');
    console.log('   ✓ Added gsc_page_query_metrics.canonical_page_key');
  }
  if (!pqColSet.has('query_text_normalized')) {
    await db.query('ALTER TABLE gsc_page_query_metrics ADD COLUMN query_text_normalized VARCHAR(512) NULL, ADD INDEX idx_gsc_pq_norm (query_text_normalized(255))');
    console.log('   ✓ Added gsc_page_query_metrics.query_text_normalized');
  }

  // gsc_sync_runs columns
  const [srCols] = await db.query('DESCRIBE gsc_sync_runs');
  const srColSet = new Set(srCols.map(c => c.Field));
  if (!srColSet.has('window_start')) {
    await db.query('ALTER TABLE gsc_sync_runs ADD COLUMN window_start DATE NULL, ADD COLUMN window_end DATE NULL, ADD COLUMN rows_fetched INT DEFAULT 0, ADD COLUMN rows_stored INT DEFAULT 0, ADD COLUMN is_truncated BOOLEAN DEFAULT FALSE');
    console.log('   ✓ Added window and pagination columns to gsc_sync_runs');
  }

  // ga4_sync_runs columns
  const [gaCols] = await db.query('DESCRIBE ga4_sync_runs');
  const gaColSet = new Set(gaCols.map(c => c.Field));
  if (!gaColSet.has('active_users')) {
    await db.query('ALTER TABLE ga4_sync_runs ADD COLUMN active_users INT DEFAULT 0, ADD COLUMN sessions INT DEFAULT 0, ADD COLUMN engaged_sessions INT DEFAULT 0, ADD COLUMN engagement_rate DECIMAL(5,4) DEFAULT 0, ADD COLUMN views INT DEFAULT 0, ADD COLUMN key_events INT DEFAULT 0, ADD COLUMN window_start DATE NULL, ADD COLUMN window_end DATE NULL');
    console.log('   ✓ Added aggregate KPI metrics to ga4_sync_runs');
  }

  // ga4_page_metrics columns
  const [gaPmCols] = await db.query('DESCRIBE ga4_page_metrics');
  const gaPmColSet = new Set(gaPmCols.map(c => c.Field));
  if (!gaPmColSet.has('canonical_page_key')) {
    await db.query('ALTER TABLE ga4_page_metrics ADD COLUMN canonical_page_key VARCHAR(512) NULL, ADD INDEX idx_ga4_pm_canon (canonical_page_key(255))');
    console.log('   ✓ Added canonical_page_key to ga4_page_metrics');
  }

  // STEP 3: BACKFILL ANY MISSING HISTORICAL SNAPSHOTS
  console.log('\n3. Verifying snapshot coverage...');
  const [allPq] = await db.query('SELECT * FROM gsc_page_query_metrics');
  let backfilled = 0;

  for (const r of allPq) {
    const dStr = new Date(r.metric_date).toISOString().slice(0, 10);
    const id = `${r.page_url}|||${r.query_text}`;
    const snapId = crypto.createHash('md5').update(`snap_pq_${dStr}_${r.page_url}_${r.query_text}`).digest('hex');

    const [exists] = await db.query(
      'SELECT id FROM gsc_ranking_snapshots WHERE id = ?',
      [snapId]
    );

    if (exists.length === 0) {
      await db.query(
        `INSERT INTO gsc_ranking_snapshots (id, snapshot_date, entity_type, identifier, page_url, query_text, period_type, clicks, impressions, ctr, position, created_at)
         VALUES (?, ?, 'page_query', ?, ?, ?, 'current_28d', ?, ?, ?, ?, NOW())`,
        [snapId, dStr, id, r.page_url, r.query_text, r.clicks, r.impressions, r.ctr, r.position]
      );
      backfilled++;
    }
  }
  console.log(`   ✓ Snapshot verification complete (Backfilled: ${backfilled}, Total: ${allPq.length}).`);

  // STEP 4: DEDUPLICATE gsc_page_query_metrics TO CURRENT-ONLY STATE
  console.log('\n4. Deduplicating gsc_page_query_metrics to current-only state...');
  // Sort by metric_date DESC, updated_at DESC, clicks DESC so latest/most authoritative row is chosen
  const [sortedPq] = await db.query('SELECT * FROM gsc_page_query_metrics ORDER BY metric_date DESC, updated_at DESC, clicks DESC');

  const chosenMap = new Map();
  const deleteIds = [];

  for (const r of sortedPq) {
    const canonPage = canonicalPageKey(r.page_url);
    const normQ = normalizeSearchQuery(r.query_text);
    const period = r.period_type || '28d';
    const key = `${period}|${canonPage}|${normQ}`;

    if (!chosenMap.has(key)) {
      // Deterministic current ID without metric_date
      const currentId = crypto.createHash('md5').update(`pq_current|${period}|${canonPage}|${normQ}`).digest('hex');
      chosenMap.set(key, { ...r, currentId, canonical_page_key: canonPage, query_text_normalized: normQ });
    } else {
      deleteIds.push(r.id);
    }
  }

  console.log(`   Found ${chosenMap.size} unique current page-query entities, ${deleteIds.length} historical duplicate rows to delete.`);

  // Drop old unique key if it exists
  const [indexes] = await db.query('SHOW INDEX FROM gsc_page_query_metrics');
  const indexNames = new Set(indexes.map(i => i.Key_name));
  if (indexNames.has('uq_gsc_pq')) {
    await db.query('ALTER TABLE gsc_page_query_metrics DROP INDEX uq_gsc_pq');
    console.log('   ✓ Dropped old uq_gsc_pq index (which had metric_date).');
  }

  // Delete duplicates
  if (deleteIds.length > 0) {
    // Delete in batches of 500
    for (let i = 0; i < deleteIds.length; i += 500) {
      const batch = deleteIds.slice(i, i + 500);
      const placeholders = batch.map(() => '?').join(',');
      await db.query(`DELETE FROM gsc_page_query_metrics WHERE id IN (${placeholders})`, batch);
    }
    console.log(`   ✓ Deleted ${deleteIds.length} historical duplicate rows from gsc_page_query_metrics.`);
  }

  // Update remaining rows with canonical keys, normalized query, and current IDs
  for (const item of chosenMap.values()) {
    await db.query(
      `UPDATE gsc_page_query_metrics
       SET id = ?, canonical_page_key = ?, query_text_normalized = ?
       WHERE id = ?`,
      [item.currentId, item.canonical_page_key, item.query_text_normalized, item.id]
    );
  }
  console.log('   ✓ Updated current rows with canonical keys, normalized queries, and current entity IDs.');

  // Ensure unique index on (period_type, canonical_page_key, query_text_normalized)
  const [newIndexes] = await db.query('SHOW INDEX FROM gsc_page_query_metrics');
  const newIndexNames = new Set(newIndexes.map(i => i.Key_name));
  if (!newIndexNames.has('uq_gsc_pq_current')) {
    await db.query('ALTER TABLE gsc_page_query_metrics ADD UNIQUE KEY uq_gsc_pq_current (period_type, canonical_page_key(255), query_text_normalized(255))');
    console.log('   ✓ Added unique constraint: uq_gsc_pq_current (period_type, canonical_page_key, query_text_normalized).');
  }

  // STEP 5: DEDUPLICATE ga4_page_metrics
  console.log('\n5. Updating ga4_page_metrics with canonical page keys...');
  const [gaRows] = await db.query('SELECT * FROM ga4_page_metrics ORDER BY updated_at DESC, views DESC');
  const gaChosen = new Map();
  const gaDeleteIds = [];

  for (const r of gaRows) {
    const canonPage = canonicalPageKey(r.page_path);
    const key = `${r.period_type || '28d'}|${canonPage}`;

    if (!gaChosen.has(key)) {
      const currentId = crypto.createHash('md5').update(`ga4_p_current|${r.period_type || '28d'}|${canonPage}`).digest('hex');
      gaChosen.set(key, { ...r, currentId, canonical_page_key: canonPage });
    } else {
      gaDeleteIds.push(r.id);
    }
  }

  if (gaDeleteIds.length > 0) {
    const placeholders = gaDeleteIds.map(() => '?').join(',');
    await db.query(`DELETE FROM ga4_page_metrics WHERE id IN (${placeholders})`, gaDeleteIds);
    console.log(`   ✓ Deleted ${gaDeleteIds.length} duplicate rows from ga4_page_metrics.`);
  }

  for (const item of gaChosen.values()) {
    await db.query(
      `UPDATE ga4_page_metrics SET id = ?, canonical_page_key = ? WHERE id = ?`,
      [item.currentId, item.canonical_page_key, item.id]
    );
  }
  console.log('   ✓ Updated ga4_page_metrics with canonical page keys.');

  // STEP 6: ACCEPTANCE VERIFICATION
  console.log('\n6. Running post-migration acceptance checks...');
  const [finalDupes] = await db.query(
    `SELECT query_text_normalized, canonical_page_key, period_type, COUNT(*) as c
     FROM gsc_page_query_metrics
     GROUP BY query_text_normalized, canonical_page_key, period_type
     HAVING c > 1`
  );

  const [finalCount] = await db.query('SELECT COUNT(*) as total FROM gsc_page_query_metrics');
  const [snapCount] = await db.query('SELECT COUNT(*) as total FROM gsc_ranking_snapshots');

  console.log(`   Total current page-query rows: ${finalCount[0].total}`);
  console.log(`   Total historical snapshots: ${snapCount[0].total}`);
  console.log(`   Duplicate current pairs (COUNT > 1): ${finalDupes.length}`);

  if (finalDupes.length === 0) {
    console.log('\n=== MIGRATION COMPLETED SUCCESSFULLY: 0 DUPLICATES ===');
  } else {
    console.error('\nFAIL: Duplicates still detected after migration!');
    process.exit(1);
  }

  await db.end();
})();
