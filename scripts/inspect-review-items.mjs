import { execSync } from "node:child_process";

const REMOTE_SCRIPT = `
import fs from "node:fs";
import mysql from "mysql2/promise";
const envText = fs.readFileSync("/home/u188101251/production-app/shared/.env.production", "utf8");
const env = {};
for (const line of envText.split("\\n")) {
  const i = line.indexOf("=");
  if (i > 0) {
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[line.slice(0, i).trim()] = v;
  }
}
const c = await mysql.createConnection({
  host: env.DGS_MYSQL_HOST || "127.0.0.1",
  user: env.DGS_MYSQL_USER,
  password: env.DGS_MYSQL_PASSWORD,
  database: env.DGS_MYSQL_DATABASE,
});

const [opps] = await c.query(
  "SELECT id, site_name, domain, category, exact_submission_url, status, verification_status, assigned_to, source_type, discovery_lane, qualification_reason FROM off_page_opportunities WHERE (status IN ('QUALIFIED', 'MANAGER_REVIEW', 'APPROVED') OR verification_status = 'VERIFIED_ACTIVE') AND assigned_to IS NULL ORDER BY created_at DESC"
);

console.log("__REVIEW_OPPS__" + JSON.stringify(opps));
await c.end();
`;

const raw = execSync(
  `ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/current/tmp/qrev.mjs && cd /home/u188101251/production-app/current && node tmp/qrev.mjs; rm -f tmp/qrev.mjs"`,
  { input: REMOTE_SCRIPT, encoding: "utf8" }
);
const jsonStr = raw.slice(raw.indexOf("__REVIEW_OPPS__") + 15).trim();
const json = JSON.parse(jsonStr);
console.log(`Total Needs Review / Qualified Items: ${json.length}`);
json.forEach((x, i) => {
  console.log(`${i + 1}. [${x.id}] ${x.domain} | ${x.category} | ${x.exact_submission_url}`);
});
