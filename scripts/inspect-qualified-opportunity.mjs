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

// Latest opportunity
const [opps] = await c.query("SELECT * FROM off_page_opportunities ORDER BY created_at DESC LIMIT 1");
// Staged raw candidate
const [raw] = await c.query("SELECT * FROM off_page_raw_candidates WHERE opportunity_id = ? OR qualification_status = 'QUALIFIED' ORDER BY updated_at DESC LIMIT 1", [opps[0]?.id || 'none']);
// Vector doc
const [vdoc] = await c.query("SELECT * FROM off_page_vector_documents WHERE entity_id = ? LIMIT 1", [opps[0]?.id || 'none']);

console.log("__OPP__" + JSON.stringify({ opportunity: opps[0], raw: raw[0], vectorDoc: vdoc[0] }));
await c.end();
`;

const raw = execSync(
  `ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/current/tmp/qopp.mjs && cd /home/u188101251/production-app/current && node tmp/qopp.mjs; rm -f tmp/qopp.mjs"`,
  { input: REMOTE_SCRIPT, encoding: "utf8" }
);
const jsonStr = raw.slice(raw.indexOf("__OPP__") + 7).trim();
console.log(JSON.stringify(JSON.parse(jsonStr), null, 2));
