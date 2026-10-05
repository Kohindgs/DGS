import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

/**
 * DGS V8.12.6 schema migration (idempotent, non-destructive):
 *  - provenance/qualification columns on off_page_opportunities
 *  - column defaults no longer guess DOFOLLOW (opportunities + backlinks)
 * Data changes (link-type de-guessing, re-verification) are NOT done here; they run through the
 * audited re-verification job after a fresh backup.
 */
async function main() {
  console.log("DGS V8.12.6 OFF-PAGE LIVE ACQUISITION ENGINE — SCHEMA MIGRATION");

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

  const [cols] = await conn.query("SHOW COLUMNS FROM off_page_opportunities");
  const have = new Set(cols.map((c) => c.Field));
  const add = [
    ["source_type", "VARCHAR(64) NULL"],
    ["discovery_lane", "VARCHAR(64) NULL"],
    ["semantic_status", "VARCHAR(32) NULL"],
    ["qualification_reason", "TEXT NULL"],
    ["page_title", "VARCHAR(512) NULL"],
    ["last_checked_at", "DATETIME NULL"],
  ];
  for (const [name, def] of add) {
    if (!have.has(name)) {
      await conn.query(`ALTER TABLE off_page_opportunities ADD COLUMN ${name} ${def}`);
      console.log(`  + off_page_opportunities.${name}`);
    } else {
      console.log(`  = off_page_opportunities.${name} exists`);
    }
  }
  const [idx] = await conn.query("SHOW INDEX FROM off_page_opportunities WHERE Key_name = 'idx_opo_lane'");
  if (idx.length === 0) {
    await conn.query("ALTER TABLE off_page_opportunities ADD INDEX idx_opo_lane (discovery_lane)");
    console.log("  + idx_opo_lane");
  }

  await conn.query("ALTER TABLE off_page_opportunities ALTER COLUMN dofollow_status SET DEFAULT 'UNKNOWN'");
  console.log("  ✓ off_page_opportunities.dofollow_status DEFAULT 'UNKNOWN'");

  const [bcols] = await conn.query("SHOW COLUMNS FROM off_page_backlinks");
  const bhave = new Set(bcols.map((c) => c.Field));
  if (bhave.has("link_rel")) await conn.query("ALTER TABLE off_page_backlinks ALTER COLUMN link_rel SET DEFAULT 'unknown'");
  if (bhave.has("dofollow")) await conn.query("ALTER TABLE off_page_backlinks ALTER COLUMN dofollow SET DEFAULT 0");
  if (bhave.has("unknown_link_type")) await conn.query("ALTER TABLE off_page_backlinks ALTER COLUMN unknown_link_type SET DEFAULT 1");
  console.log("  ✓ off_page_backlinks defaults: link_rel 'unknown', dofollow 0, unknown_link_type 1");

  await conn.end();
  console.log("V8.12.6 migration complete.");
}

main().catch((e) => {
  console.error("V8.12.6 migration failed:", e);
  process.exit(1);
});
