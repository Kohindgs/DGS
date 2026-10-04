import fs from "node:fs/promises";
import mysql from "mysql2/promise";
import { execSync } from "node:child_process";

const remoteJs = `
import fs from "node:fs/promises";
import mysql from "mysql2/promise";

const envText = await fs.readFile("/home/u188101251/production-app/current/.env.production", "utf8");
const env = {};
for (const line of envText.split("\\n")) {
  const p = line.indexOf("=");
  if (p > 0) {
    let v = line.slice(p + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[line.slice(0, p).trim()] = v;
  }
}

const conn = await mysql.createConnection({
  host: env.DGS_MYSQL_HOST,
  user: env.DGS_MYSQL_USER,
  password: env.DGS_MYSQL_PASSWORD,
  database: env.DGS_MYSQL_DATABASE
});

console.log("Connected to MariaDB on VPS.");

// 1. Column migrations for off_page_opportunities
const [oppCols] = await conn.query("DESCRIBE off_page_opportunities");
const oppFields = new Set(oppCols.map(c => c.Field));
const oppMigrations = [
  { col: "discovered_at", sql: "ALTER TABLE off_page_opportunities ADD COLUMN discovered_at DATETIME NULL" },
  { col: "qualified_at", sql: "ALTER TABLE off_page_opportunities ADD COLUMN qualified_at DATETIME NULL" },
  { col: "assigned_at", sql: "ALTER TABLE off_page_opportunities ADD COLUMN assigned_at DATETIME NULL" },
  { col: "next_check_at", sql: "ALTER TABLE off_page_opportunities ADD COLUMN next_check_at DATETIME NULL" },
  { col: "check_priority", sql: "ALTER TABLE off_page_opportunities ADD COLUMN check_priority VARCHAR(20) NOT NULL DEFAULT 'P1'" },
];
for (const m of oppMigrations) {
  if (!oppFields.has(m.col)) {
    await conn.query(m.sql);
    console.log("Added column:", m.col, "to off_page_opportunities");
  }
}

// 2. Column migrations for off_page_outreach
const [outCols] = await conn.query("DESCRIBE off_page_outreach");
const outFields = new Set(outCols.map(c => c.Field));
const outMigrations = [
  { col: "source_module", sql: "ALTER TABLE off_page_outreach ADD COLUMN source_module VARCHAR(50) NOT NULL DEFAULT 'MANUAL'" },
  { col: "source_record_id", sql: "ALTER TABLE off_page_outreach ADD COLUMN source_record_id VARCHAR(64) NULL" },
  { col: "target_domain", sql: "ALTER TABLE off_page_outreach ADD COLUMN target_domain VARCHAR(255) NULL" },
  { col: "created_by", sql: "ALTER TABLE off_page_outreach ADD COLUMN created_by VARCHAR(255) NULL" },
  { col: "drafted_at", sql: "ALTER TABLE off_page_outreach ADD COLUMN drafted_at DATETIME NULL" },
  { col: "approved_at", sql: "ALTER TABLE off_page_outreach ADD COLUMN approved_at DATETIME NULL" },
  { col: "sent_at", sql: "ALTER TABLE off_page_outreach ADD COLUMN sent_at DATETIME NULL" },
  { col: "submitted_at", sql: "ALTER TABLE off_page_outreach ADD COLUMN submitted_at DATETIME NULL" },
  { col: "live_at", sql: "ALTER TABLE off_page_outreach ADD COLUMN live_at DATETIME NULL" },
  { col: "verified_at", sql: "ALTER TABLE off_page_outreach ADD COLUMN verified_at DATETIME NULL" },
];
for (const m of outMigrations) {
  if (!outFields.has(m.col)) {
    await conn.query(m.sql);
    console.log("Added column:", m.col, "to off_page_outreach");
  }
}

// 3. Column migrations for off_page_backlinks
const [blCols] = await conn.query("DESCRIBE off_page_backlinks");
const blFields = new Set(blCols.map(c => c.Field));
const blMigrations = [
  { col: "discovered_at", sql: "ALTER TABLE off_page_backlinks ADD COLUMN discovered_at DATETIME NULL" },
  { col: "live_at", sql: "ALTER TABLE off_page_backlinks ADD COLUMN live_at DATETIME NULL" },
  { col: "verified_at", sql: "ALTER TABLE off_page_backlinks ADD COLUMN verified_at DATETIME NULL" },
  { col: "lost_at", sql: "ALTER TABLE off_page_backlinks ADD COLUMN lost_at DATETIME NULL" },
  { col: "reclaimed_at", sql: "ALTER TABLE off_page_backlinks ADD COLUMN reclaimed_at DATETIME NULL" },
  { col: "next_check_at", sql: "ALTER TABLE off_page_backlinks ADD COLUMN next_check_at DATETIME NULL" },
  { col: "check_priority", sql: "ALTER TABLE off_page_backlinks ADD COLUMN check_priority VARCHAR(20) NOT NULL DEFAULT 'P1'" },
];
for (const m of blMigrations) {
  if (!blFields.has(m.col)) {
    await conn.query(m.sql);
    console.log("Added column:", m.col, "to off_page_backlinks");
  }
}

// 4. Backfill discovered_at on existing opportunities
await conn.query("UPDATE off_page_opportunities SET discovered_at = created_at WHERE discovered_at IS NULL");

// 5. Clean up ONLY fake / demo / sample records as requested by user
console.log("Purging demo/sample records from production database...");

// Delete 5 fake backlinks
const [delBL] = await conn.query("DELETE FROM off_page_backlinks WHERE id IN ('lnk_047a07b872a6417d', 'lnk_a3a9693238074b41', 'lnk_ac916e79a7ff4e5f', 'lnk_bc630965923d4a20', 'lnk_c36598cbdad5417d')");
console.log("Deleted demo backlinks:", delBL.affectedRows);

// Delete fake competitor gaps
const [delGaps] = await conn.query("DELETE FROM off_page_competitor_gaps WHERE id LIKE 'gap_%'");
console.log("Deleted demo competitor gaps:", delGaps.affectedRows);

// Delete fake brand mentions
const [delMentions] = await conn.query("DELETE FROM off_page_brand_mentions WHERE id LIKE 'men_%'");
console.log("Deleted demo brand mentions:", delMentions.affectedRows);

// Delete fake outreach records
const [delOut] = await conn.query("DELETE FROM off_page_outreach WHERE id IN ('out_0170351cc4fc429c', 'out_293688a0b9244758', 'out_86dd53ac8126437b', 'out_ac73366215d44c6b', 'out_ba1ec2a12a5c4509')");
console.log("Deleted demo outreach records:", delOut.affectedRows);

// Delete fake monthly reports
const [delRep] = await conn.query("DELETE FROM off_page_monthly_reports WHERE id IN ('rep_2026_07', 'rep_2026_08', 'rep_2026_10', 'rep_28d5dd78da1f4806')");
console.log("Deleted demo monthly reports:", delRep.affectedRows);

console.log("✓ Production database migration and demo cleanup complete!");

const tables = [
  'off_page_opportunities',
  'off_page_backlinks',
  'off_page_competitor_domains',
  'off_page_competitor_gaps',
  'off_page_brand_mentions',
  'off_page_citations',
  'off_page_target_pages',
  'off_page_outreach',
  'off_page_monthly_reports',
  'off_page_automation_runs'
];
const summary = {};
for (const t of tables) {
  const [rows] = await conn.query(\`SELECT COUNT(*) as c FROM \${t}\`);
  summary[t] = rows[0].c;
}
console.log("NEW DB SUMMARY:", JSON.stringify(summary, null, 2));

await conn.end();
`;

execSync(`ssh -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/current/tmp/run-v8121-migration.mjs"`, {
  input: remoteJs,
  encoding: "utf8"
});

const out = execSync(`ssh -p 65002 u188101251@147.93.100.126 "cd /home/u188101251/production-app/current && node tmp/run-v8121-migration.mjs"`, {
  encoding: "utf8"
});
console.log(out);
