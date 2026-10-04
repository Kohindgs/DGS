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

console.log("=== BACKLINKS ===");
const [backlinks] = await conn.query("SELECT id, source_domain, source_url, target_url, anchor_text, referral_sessions, referral_leads, status FROM off_page_backlinks");
console.log(JSON.stringify(backlinks, null, 2));

console.log("=== COMPETITOR GAPS ===");
const [gaps] = await conn.query("SELECT id, competitor_domain, source_domain, source_url, status FROM off_page_competitor_gaps");
console.log(JSON.stringify(gaps, null, 2));

console.log("=== BRAND MENTIONS ===");
const [mentions] = await conn.query("SELECT id, brand_query, mention_url, mention_title, is_linked, status FROM off_page_brand_mentions");
console.log(JSON.stringify(mentions, null, 2));

console.log("=== OUTREACH ===");
const [outreach] = await conn.query("SELECT id, opportunity_id, publication, stage, pitch_subject FROM off_page_outreach");
console.log(JSON.stringify(outreach, null, 2));

console.log("=== MONTHLY REPORTS ===");
const [reports] = await conn.query("SELECT id, report_month, report_title FROM off_page_monthly_reports");
console.log(JSON.stringify(reports, null, 2));

await conn.end();
`;

execSync(`ssh -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/current/tmp/inspect-demo.mjs"`, {
  input: remoteJs,
  encoding: "utf8"
});

const out = execSync(`ssh -p 65002 u188101251@147.93.100.126 "cd /home/u188101251/production-app/current && node tmp/inspect-demo.mjs"`, {
  encoding: "utf8"
});
console.log(out);
