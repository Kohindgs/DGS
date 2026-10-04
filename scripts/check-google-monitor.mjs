import mysql from "mysql2/promise";
import fs from "node:fs";

function loadEnv() {
  const content = fs.readFileSync(".env.production", "utf8");
  const config = {};
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (m) {
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      config[m[1]] = val;
    }
  }
  return config;
}

const env = loadEnv();

async function main() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: env.DGS_MYSQL_USER,
    password: env.DGS_MYSQL_PASSWORD,
    database: env.DGS_MYSQL_DATABASE,
  });

  const [runs] = await conn.query("SELECT * FROM google_update_monitor_runs ORDER BY started_at DESC LIMIT 3");
  console.log("=== LATEST MONITOR RUNS ===");
  console.log(JSON.stringify(runs, null, 2));

  const [active] = await conn.query("SELECT id, title, category, severity, status, external_status, incident_begin, incident_end FROM google_search_updates WHERE external_status = 'ACTIVE' OR status = 'ACTIVE ROLLOUT'");
  console.log("=== ACTIVE ROLLOUTS ===");
  console.log(JSON.stringify(active, null, 2));

  await conn.end();
}

main().catch(console.error);
