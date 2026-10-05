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
  host: env.DGS_MYSQL_HOST || "127.0.0.1",
  user: env.DGS_MYSQL_USER,
  password: env.DGS_MYSQL_PASSWORD,
  database: env.DGS_MYSQL_DATABASE,
});

console.log("=== Quarantining Test Records in Production MariaDB ===");

// 1. Quarantine Opportunity opp_99f5943724d44b9f
const [oppRes] = await conn.execute(\`
  UPDATE off_page_opportunities 
  SET 
    status = 'ARCHIVED',
    notes = CONCAT(IFNULL(notes, ''), ' [QUARANTINED_TEST_RECORD]')
  WHERE id = 'opp_99f5943724d44b9f' OR domain LIKE '%e2e-verified-test%'
\`);
console.log("Quarantined test opportunities:", oppRes.affectedRows);

// 2. Quarantine Test Backlinks
const [blRes] = await conn.execute(\`
  UPDATE off_page_backlinks 
  SET 
    status = 'ARCHIVED',
    team_status = 'ARCHIVED',
    verified_status = 'ARCHIVED',
    mismatch_status = 'MATCH',
    notes = CONCAT(IFNULL(notes, ''), ' [QUARANTINED_TEST_RECORD]')
  WHERE id IN ('lnk_external_broken_03', 'lnk_external_lost_02', 'lnk_fixture_live_01')
     OR source_domain LIKE '%httpbin%'
     OR source_url LIKE '%test-fixtures%'
\`);
console.log("Quarantined test backlinks:", blRes.affectedRows);

// 3. Mark any test alerts as read
const [altRes] = await conn.execute(\`
  UPDATE off_page_alerts 
  SET is_read = 1 
  WHERE entity_id IN ('lnk_external_broken_03', 'lnk_external_lost_02', 'lnk_fixture_live_01', 'opp_99f5943724d44b9f')
     OR title LIKE '%httpbin%'
     OR message LIKE '%test-fixture%'
\`);
console.log("Quarantined test alerts:", altRes.affectedRows);

// 4. Verify Active Pipeline Counts after quarantine
const [oppCounts] = await conn.query(\`
  SELECT 
    COUNT(*) as total_rows,
    SUM(CASE WHEN status NOT IN ('REJECTED', 'ARCHIVED', 'EXPIRED', 'SPAM') THEN 1 ELSE 0 END) as active_pipeline,
    SUM(CASE WHEN (status IN ('MANAGER_REVIEW', 'QUALIFIED', 'APPROVED', 'NEW', 'DISCOVERED')) AND (owner IS NULL OR owner = '') AND status NOT IN ('REJECTED', 'ARCHIVED', 'EXPIRED', 'SPAM') THEN 1 ELSE 0 END) as needs_review,
    SUM(CASE WHEN status = 'ARCHIVED' THEN 1 ELSE 0 END) as archived_count
  FROM off_page_opportunities
\`);
console.log("\\nOPPORTUNITY COUNTS POST-QUARANTINE:", oppCounts[0]);

const [blCounts] = await conn.query(\`
  SELECT 
    COUNT(*) as total_backlinks,
    SUM(CASE WHEN status != 'ARCHIVED' THEN 1 ELSE 0 END) as active_backlinks,
    SUM(CASE WHEN status = 'ARCHIVED' THEN 1 ELSE 0 END) as archived_backlinks
  FROM off_page_backlinks
\`);
console.log("BACKLINK COUNTS POST-QUARANTINE:", blCounts[0]);

await conn.end();
`;

execSync(`ssh -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/current/tmp/quarantine.mjs"`, {
  input: remoteJs,
  encoding: "utf8"
});

const out = execSync(`ssh -p 65002 u188101251@147.93.100.126 "cd /home/u188101251/production-app/current && node tmp/quarantine.mjs"`, {
  encoding: "utf8"
});
console.log(out);
