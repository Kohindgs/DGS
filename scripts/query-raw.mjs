import fs from "node:fs/promises";
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
  dateStrings: true,
});

const [raw] = await c.query("SELECT id, query, domain, url, validation_status, qualification_status, qualification_reasons FROM off_page_raw_candidates ORDER BY created_at DESC LIMIT 15");
console.log("__RAW__" + JSON.stringify(raw));
await c.end();
`;

const raw = execSync(
  `ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/current/tmp/qraw.mjs && cd /home/u188101251/production-app/current && node tmp/qraw.mjs; rm -f tmp/qraw.mjs"`,
  { input: REMOTE_SCRIPT, encoding: "utf8" }
);
const jsonStr = raw.slice(raw.indexOf("__RAW__") + 7).trim();
console.log(JSON.stringify(JSON.parse(jsonStr), null, 2));
