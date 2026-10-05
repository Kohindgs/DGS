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

const q = async (sql) => (await c.query(sql))[0];

const out = {
  totalOpportunities: (await q("SELECT COUNT(*) n FROM off_page_opportunities"))[0].n,
  byStatus: await q("SELECT status, COUNT(*) n FROM off_page_opportunities GROUP BY status ORDER BY n DESC"),
  byVerification: await q("SELECT COALESCE(verification_status,'NULL') v, COUNT(*) n FROM off_page_opportunities GROUP BY v ORDER BY n DESC"),
  vectorDocs: (await q("SELECT COUNT(*) n FROM off_page_vector_documents WHERE deleted_at IS NULL"))[0].n,
  sheetConnections: await q("SELECT * FROM off_page_sheet_connections"),
  settingsKeys: (await q("SELECT key_name FROM off_page_settings")).map(x => x.key_name),
  envBraveKeyPresent: !!(env.BRAVE_SEARCH_API_KEY && env.BRAVE_SEARCH_API_KEY.trim()),
  envGoogleKeyPresent: !!(env.GOOGLE_SEARCH_API_KEY && env.GOOGLE_SEARCH_API_KEY.trim()),
  envSerpApiKeyPresent: !!(env.SERPAPI_API_KEY && env.SERPAPI_API_KEY.trim()),
  envGeminiKeyPresent: !!(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim()),
  envPagespeedKeyPresent: !!(env.PAGESPEED_API_KEY && env.PAGESPEED_API_KEY.trim()),
};

console.log("__AUDIT__" + JSON.stringify(out));
await c.end();
`;

try {
  const raw = execSync(
    `ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/current/tmp/v8127audit.mjs && cd /home/u188101251/production-app/current && node tmp/v8127audit.mjs; rm -f tmp/v8127audit.mjs"`,
    { input: REMOTE_SCRIPT, encoding: "utf8" }
  );
  const jsonStr = raw.slice(raw.indexOf("__AUDIT__") + 9).trim();
  console.log(JSON.stringify(JSON.parse(jsonStr), null, 2));
} catch (err) {
  console.error("Audit error:", err.message);
}
