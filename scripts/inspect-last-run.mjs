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
const [rows] = await conn.query("SELECT * FROM off_page_automation_runs ORDER BY started_at DESC LIMIT 1");
console.log("LAST_RUN:", JSON.stringify(rows[0], null, 2));
await conn.end();
`;

execSync(`ssh -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/current/tmp/inspect-run.mjs"`, {
  input: remoteJs,
  encoding: "utf8"
});

const out = execSync(`ssh -p 65002 u188101251@147.93.100.126 "cd /home/u188101251/production-app/current && node tmp/inspect-run.mjs"`, {
  encoding: "utf8"
});
console.log(out);
