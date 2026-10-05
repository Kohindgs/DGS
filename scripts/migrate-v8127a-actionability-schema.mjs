import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

/**
 * DGS V8.12.7A Schema Migration:
 *  - Adds page_intent, confidence, action_required, action_destination, actionability_score, actionable_evidence
 *    to off_page_opportunities and off_page_raw_candidates.
 */
async function main() {
  console.log("=== DGS V8.12.7A ACTIONABILITY & PAGE INTENT SCHEMA MIGRATION ===");

  let envText = "";
  for (const p of [
    path.join(process.cwd(), ".env.production"),
    "/home/u188101251/production-app/current/.env.production",
    "/home/u188101251/production-app/shared/.env.production",
  ]) {
    try {
      envText = await fs.readFile(p, "utf8");
      if (envText) break;
    } catch {}
  }
  const env = {};
  for (const line of envText.split("\n")) {
    const i = line.indexOf("=");
    if (i > 0) {
      let v = line.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      env[line.slice(0, i).trim()] = v;
    }
  }
  const user = env.DGS_MYSQL_USER || process.env.DGS_MYSQL_USER;
  const database = env.DGS_MYSQL_DATABASE || process.env.DGS_MYSQL_DATABASE;
  if (!user || !database) {
    console.log("[MIGRATE] No DB credentials found, skipping.");
    return;
  }
  const conn = await mysql.createConnection({
    host: env.DGS_MYSQL_HOST || process.env.DGS_MYSQL_HOST || "127.0.0.1",
    port: Number(env.DGS_MYSQL_PORT || 3306),
    user,
    password: env.DGS_MYSQL_PASSWORD || process.env.DGS_MYSQL_PASSWORD,
    database,
    charset: "UTF8MB4_UNICODE_CI",
  });

  console.log("Checking columns on off_page_opportunities...");
  const [oppCols] = await conn.query("SHOW COLUMNS FROM off_page_opportunities");
  const oppColSet = new Set(oppCols.map((c) => c.Field));

  const newOppCols = [
    ["page_intent", "VARCHAR(64) NULL AFTER discovery_lane"],
    ["confidence", "VARCHAR(32) NULL DEFAULT 'MEDIUM' AFTER page_intent"],
    ["action_required", "VARCHAR(64) NULL AFTER confidence"],
    ["action_destination", "VARCHAR(1024) NULL AFTER action_required"],
    ["actionability_score", "INT NULL DEFAULT 0 AFTER action_destination"],
    ["actionable_evidence", "JSON NULL AFTER actionability_score"],
  ];

  for (const [colName, colDef] of newOppCols) {
    if (!oppColSet.has(colName)) {
      await conn.query(`ALTER TABLE off_page_opportunities ADD COLUMN ${colName} ${colDef}`);
      console.log(`  + Added off_page_opportunities.${colName}`);
    } else {
      console.log(`  = Exists: off_page_opportunities.${colName}`);
    }
  }

  console.log("\nChecking columns on off_page_raw_candidates...");
  const [rawCols] = await conn.query("SHOW COLUMNS FROM off_page_raw_candidates");
  const rawColSet = new Set(rawCols.map((c) => c.Field));

  const newRawCols = [
    ["page_intent", "VARCHAR(64) NULL AFTER lane"],
    ["confidence", "VARCHAR(32) NULL AFTER page_intent"],
    ["action_required", "VARCHAR(64) NULL AFTER confidence"],
    ["action_destination", "VARCHAR(1024) NULL AFTER action_required"],
    ["actionability_score", "INT NULL DEFAULT 0 AFTER action_destination"],
    ["actionable_evidence", "JSON NULL AFTER actionability_score"],
  ];

  for (const [colName, colDef] of newRawCols) {
    if (!rawColSet.has(colName)) {
      await conn.query(`ALTER TABLE off_page_raw_candidates ADD COLUMN ${colName} ${colDef}`);
      console.log(`  + Added off_page_raw_candidates.${colName}`);
    } else {
      console.log(`  = Exists: off_page_raw_candidates.${colName}`);
    }
  }

  await conn.end();
  console.log("\n✓ V8.12.7A actionability schema migration complete.");
}

main().catch((e) => {
  console.error("Migration error:", e);
  process.exit(1);
});
