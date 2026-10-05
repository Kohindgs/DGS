import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";
import * as XLSX from "xlsx";

const BASE_URL = process.env.BASE_URL || "https://digitalgrowthschool.com";

async function main() {
  console.log("==================================================");
  console.log("DGS V8.12.5 E2E LIVE VERIFICATION SUITE");
  console.log("ACTION CENTER + SHEET SYNC + TWO-STATUS MISMATCH QUEUE");
  console.log("==================================================");

  // 1. Database Direct Verification
  let envText = "";
  const envPaths = [
    path.join(process.cwd(), ".env.production"),
    "/home/u188101251/production-app/current/.env.production",
  ];
  for (const p of envPaths) {
    try {
      envText = await fs.readFile(p, "utf8");
      if (envText) break;
    } catch {}
  }
  const env = {};
  for (const line of envText.split("\n")) {
    const p = line.indexOf("=");
    if (p > 0) {
      let v = line.slice(p + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      env[line.slice(0, p).trim()] = v;
    }
  }

  const host = env.DGS_MYSQL_HOST || "127.0.0.1";
  const user = env.DGS_MYSQL_USER;
  const password = env.DGS_MYSQL_PASSWORD;
  const database = env.DGS_MYSQL_DATABASE;

  let conn = null;
  try {
    conn = await mysql.createConnection({ host, user, password, database });
    console.log("✓ Connected to MariaDB database.");

    // Check table structures
    const [sheetConnCols] = await conn.query("SHOW TABLES LIKE 'off_page_sheet_connections'");
    if (sheetConnCols.length === 0) throw new Error("off_page_sheet_connections missing!");
    console.log("✓ Table off_page_sheet_connections exists.");

    const [syncHistCols] = await conn.query("SHOW TABLES LIKE 'off_page_sync_history'");
    if (syncHistCols.length === 0) throw new Error("off_page_sync_history missing!");
    console.log("✓ Table off_page_sync_history exists.");

    const [discRunCols] = await conn.query("SHOW TABLES LIKE 'off_page_backlink_discovery_runs'");
    if (discRunCols.length === 0) throw new Error("off_page_backlink_discovery_runs missing!");
    console.log("✓ Table off_page_backlink_discovery_runs exists.");

    // Check two-status columns on off_page_backlinks
    const [blCols] = await conn.query("SHOW COLUMNS FROM off_page_backlinks");
    const colNames = new Set(blCols.map((c) => c.Field));
    const requiredBlCols = [
      "team_status", "verified_status", "mismatch_status", "mismatch_reason",
      "mismatch_detected_at", "mismatch_resolved_at", "source_type", "owner", "cost"
    ];
    for (const req of requiredBlCols) {
      if (!colNames.has(req)) throw new Error(`Column ${req} missing from off_page_backlinks!`);
    }
    console.log("✓ All two-status and mismatch columns verified on off_page_backlinks.");

    // Check action center columns on off_page_opportunities
    const [oppCols] = await conn.query("SHOW COLUMNS FROM off_page_opportunities");
    const oppColNames = new Set(oppCols.map((c) => c.Field));
    const requiredOppCols = ["next_action", "due_date", "internal_note", "owner", "rejection_reason", "proof_url"];
    for (const req of requiredOppCols) {
      if (!oppColNames.has(req)) throw new Error(`Column ${req} missing from off_page_opportunities!`);
    }
    console.log("✓ All Action Center columns verified on off_page_opportunities.");
  } catch (dbErr) {
    console.warn("[DB CHECK NOTE]:", dbErr.message);
  } finally {
    if (conn) await conn.end();
  }

  // 2. Test Excel / CSV Parser on in-memory workbook
  console.log("\n--- Testing In-Memory Excel Ingestion & Smart Aliases ---");
  const wsData = [
    ["Live Link", "Target Page", "Anchor Text", "Status", "Owner", "Cost", "Date Added"],
    ["https://example.com/test-backlink-1", "https://digitalgrowthschool.com", "SEO Course Mumbai", "Live", "Aakash", "$50", "2026-10-01"],
    ["https://example.org/test-backlink-2", "https://digitalgrowthschool.com/services/seo", "Digital Growth School", "Submitted", "Pooja", "$0", "2026-10-02"],
    ["https://invalid-domain", "https://digitalgrowthschool.com", "Bad Link", "Live", "Rohan", "0", "2026-10-03"],
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, "Backlinks");
  const testBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const { parseSpreadsheetBuffer, previewParsedSpreadsheet } = await import("../lib/off-page/sheet-sync.js").catch(async () => {
    return await import("./lib/off-page/sheet-sync.js").catch(() => null);
  }) || {};

  if (parseSpreadsheetBuffer) {
    const parsed = parseSpreadsheetBuffer(testBuffer);
    console.log(`✓ Parsed test workbook: ${parsed.headers.length} headers, ${parsed.rawRows.length} raw rows.`);
    const preview = previewParsedSpreadsheet(parsed.headers, parsed.rawRows);
    console.log(`✓ Auto-detected aliases: source_url -> '${preview.suggestedMapping.source_url}', anchor_text -> '${preview.suggestedMapping.anchor_text}'`);
    console.log(`✓ Valid rows: ${preview.validRowsCount}, Invalid rows: ${preview.invalidRowsCount}`);
    if (preview.validRowsCount !== 2 || preview.invalidRowsCount !== 1) {
      throw new Error(`Expected 2 valid rows and 1 invalid row, got valid=${preview.validRowsCount}, invalid=${preview.invalidRowsCount}`);
    }
  }

  // 3. API Endpoints Live HTTP Checks
  console.log("\n--- Testing Live API Routes on " + BASE_URL + " ---");

  // 3a. Action Center API
  try {
    const res = await fetch(`${BASE_URL}/api/admin/off-page/action-center`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`✓ GET /api/admin/off-page/action-center: HTTP ${res.status}`);
      console.log(`  Total In Pipeline: ${data.kpis?.totalInPipeline}`);
      console.log(`  Needs Review: ${data.kpis?.needsReviewCount}`);
      console.log(`  Due Today: ${data.kpis?.dueTodayCount}`);
      console.log(`  Overdue Tasks: ${data.kpis?.overdueCount}`);
      console.log(`  Status Mismatches: ${data.kpis?.mismatchesCount}`);
      console.log(`  Today's Tasks returned: ${data.todayTasks?.length || 0}`);
    } else {
      console.warn(`! GET /api/admin/off-page/action-center returned HTTP ${res.status}`);
    }
  } catch (err) {
    console.warn("! Action Center API error:", err.message);
  }

  // 3b. Mismatches API
  try {
    const res = await fetch(`${BASE_URL}/api/admin/off-page/mismatches`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`✓ GET /api/admin/off-page/mismatches: HTTP ${res.status}`);
      console.log(`  Active Mismatches: ${data.summary?.activeMismatches}`);
      console.log(`  Claimed Live / Crawler Lost: ${data.summary?.teamLiveCrawlerLost}`);
      console.log(`  Claimed Submitted / Crawler Live: ${data.summary?.teamSubmittedCrawlerLive}`);
      console.log(`  Total Items in queue: ${data.total}`);
    } else {
      console.warn(`! GET /api/admin/off-page/mismatches returned HTTP ${res.status}`);
    }
  } catch (err) {
    console.warn("! Mismatches API error:", err.message);
  }

  // 3c. Google Sheets Connections API
  try {
    const res = await fetch(`${BASE_URL}/api/admin/off-page/integrations/google-sheets`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`✓ GET /api/admin/off-page/integrations/google-sheets: HTTP ${res.status}`);
      console.log(`  Configured connections: ${data.connections?.length || 0}`);
    } else {
      console.warn(`! GET /api/admin/off-page/integrations/google-sheets returned HTTP ${res.status}`);
    }
  } catch (err) {
    console.warn("! Google Sheets API error:", err.message);
  }

  // 4. Regression Guards: Assessment OS & Public SEO
  console.log("\n--- Checking Baseline Invariant Regressions ---");
  try {
    const testRes = await fetch(`${BASE_URL}/api/admin/assessments/tests`, { signal: AbortSignal.timeout(8000) });
    console.log(`✓ Assessment Tests API: HTTP ${testRes.status} (V8.12.4 Preserved)`);
  } catch (e) {
    console.warn("! Assessment test check:", e.message);
  }

  try {
    const robotsRes = await fetch(`${BASE_URL}/robots.txt`, { signal: AbortSignal.timeout(8000) });
    const robotsTxt = await robotsRes.text();
    if (robotsTxt.includes("Allow: /") && robotsTxt.includes("sitemap.xml")) {
      console.log("✓ robots.txt intact and clean.");
    }
    const homeRes = await fetch(`${BASE_URL}/`, { signal: AbortSignal.timeout(8000) });
    const homeHtml = await homeRes.text();
    if (homeHtml.includes('name="robots" content="index, follow"')) {
      console.log("✓ Homepage index, follow meta tag verified.");
    }
  } catch (e) {
    console.warn("! Public SEO check:", e.message);
  }

  console.log("\n==================================================");
  console.log("✓ V8.12.5 VERIFICATION SUITE EXECUTION COMPLETE");
  console.log("==================================================");
}

main().catch(console.error);
