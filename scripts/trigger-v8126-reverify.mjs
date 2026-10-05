import fs from "node:fs/promises";
import { execSync } from "node:child_process";

const BASE_URL = "https://www.dgeniussolutions.com";

async function main() {
  console.log("==================================================");
  console.log("TRIGGERING V8.12.6 LIVE RE-VERIFICATION");
  console.log("==================================================");

  const envContent = await fs.readFile(".env.production", "utf8");
  const get = (k) => (envContent.split(/\r?\n/).find((l) => l.startsWith(`${k}=`)) || "").slice(k.length + 1).trim().replace(/^['"](.*)['"]$/, "$1");

  console.log("Logging into Admin API...");
  const body = new URLSearchParams({ email: get("DGS_ADMIN_EMAIL"), password: get("DGS_ADMIN_PASSWORD") });
  const auth = await fetch(`${BASE_URL}/api/admin/session`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    redirect: "manual"
  });

  const cookie = (auth.headers.get("set-cookie") || "").split(";")[0];
  if (!cookie) {
    throw new Error("Failed to authenticate to admin session: " + auth.status);
  }
  console.log("✓ Admin session authenticated!");

  console.log("Triggering reverify_existing...");
  const res = await fetch(`${BASE_URL}/api/admin/off-page/lanes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie
    },
    body: JSON.stringify({ action: "reverify_existing" })
  });

  const json = await res.json();
  console.log("Response:", res.status, json);
  if (!json.ok) {
    throw new Error("Trigger failed: " + JSON.stringify(json));
  }

  console.log("Setting up remote poller on VPS...");
  const pollerJs = `
import fs from "node:fs";
import mysql from "mysql2/promise";
const env = {};
for (const line of fs.readFileSync("/home/u188101251/production-app/current/.env.production", "utf8").split("\\n")) {
  const i = line.indexOf("=");
  if (i > 0) {
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[line.slice(0, i).trim()] = v;
  }
}
const c = await mysql.createConnection({
  host: env.DGS_MYSQL_HOST || "127.0.0.1",
  port: Number(env.DGS_MYSQL_PORT || 3306),
  user: env.DGS_MYSQL_USER,
  password: env.DGS_MYSQL_PASSWORD,
  database: env.DGS_MYSQL_DATABASE
});
const [rows] = await c.query("SELECT run_id, provider, status, started_at, completed_at, results_returned, valid_candidates, inserted_count, spam_rejected, error_message FROM off_page_discovery_runs WHERE provider = 'REVERIFY:EXISTING' ORDER BY started_at DESC LIMIT 1");
console.log("__POLL__" + JSON.stringify(rows[0] || {}));
await c.end();
`;
  execSync(`ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/current/tmp/poll_reverify.mjs"`, {
    input: pollerJs,
    encoding: "utf8"
  });

  let done = false;
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    try {
      const out = execSync(`ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -p 65002 u188101251@147.93.100.126 "cd /home/u188101251/production-app/current && node tmp/poll_reverify.mjs"`, {
        encoding: "utf8"
      });
      const idx = out.indexOf("__POLL__");
      const run = JSON.parse(out.slice(idx + 8).trim() || "{}");
      console.log(`[Poll ${i + 1}] Status: ${run.status || "WAITING"} | Run ID: ${run.run_id || "n/a"} | Examined: ${run.results_returned ?? 0} | Qualified: ${run.valid_candidates ?? 0}`);
      if (run.status === "COMPLETED" || run.status === "FAILED") {
        console.log("\nRe-verification finished with status:", run.status);
        if (run.error_message) console.log("Message:", run.error_message);
        done = true;
        break;
      }
    } catch (e) {
      console.log(`[Poll ${i + 1}] Error polling run:`, e.message);
    }
  }

  // Cleanup remote poller
  execSync(`ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -p 65002 u188101251@147.93.100.126 "rm -f /home/u188101251/production-app/current/tmp/poll_reverify.mjs"`);

  if (!done) {
    console.log("Timed out waiting for completion. Check discovery runs manually.");
  }
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
