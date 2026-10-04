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

const [tables] = await conn.query("SHOW TABLES LIKE 'off_page_%'");
console.log("OFF_PAGE_TABLES:", JSON.stringify(tables.map(r => Object.values(r)[0])));

// Check row counts
const counts = {};
for (const row of tables) {
  const tbl = Object.values(row)[0];
  const [res] = await conn.query(\`SELECT COUNT(*) as c FROM \${tbl}\`);
  counts[tbl] = res[0].c;
}
console.log("ROW_COUNTS:", JSON.stringify(counts, null, 2));

await conn.end();
`;

console.log("Uploading verify script to VPS...");
execSync(`ssh -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/current/tmp/verify-tables.mjs"`, {
  input: remoteJs,
  encoding: "utf8"
});

console.log("Executing verification on VPS...");
const result = execSync('ssh -p 65002 u188101251@147.93.100.126 "cd /home/u188101251/production-app/current && node tmp/verify-tables.mjs"', {
  encoding: "utf8"
});
console.log(result);
