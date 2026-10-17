import { execSync } from "node:child_process";

const remoteCode = `
import fs from "node:fs";
import mysql from "mysql2/promise";

async function run() {
  const env = fs.readFileSync("/home/u188101251/production-app/shared/.env.production", "utf8");
  const cfg = {};
  for (const line of env.split("\\n")) {
    const idx = line.indexOf("=");
    if (idx > 0) {
      cfg[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^['"](.*)['"]$/, "$1");
    }
  }

  const conn = await mysql.createConnection({
    host: cfg.DGS_MYSQL_HOST || "127.0.0.1",
    user: cfg.DGS_MYSQL_USER,
    password: cfg.DGS_MYSQL_PASSWORD,
    database: cfg.DGS_MYSQL_DATABASE,
  });

  console.log("=== CHECKING TARGET PAGES BEFORE UPDATE ===");
  const [before] = await conn.execute("SELECT id, page_url, page_title, priority_tier FROM off_page_target_pages WHERE page_url LIKE '%website%'");
  console.log(before);

  console.log("=== UPDATING PHANTOM 404 URL TO CANONICAL URL ===");
  const [update] = await conn.execute(
    "UPDATE off_page_target_pages SET page_url = 'https://www.dgeniussolutions.com/services/website-development-amc/', page_title = 'Web Development Agency in Mumbai' WHERE page_url = 'https://www.dgeniussolutions.com/services/website-design-development/'"
  );
  console.log("Rows affected:", update.affectedRows);

  console.log("=== CHECKING TARGET PAGES AFTER UPDATE ===");
  const [after] = await conn.execute("SELECT id, page_url, page_title, priority_tier FROM off_page_target_pages WHERE page_url LIKE '%website%'");
  console.log(after);

  await conn.end();
}

run().catch((e) => {
  console.error("FAIL:", e);
  process.exit(1);
});
`;

console.log("Uploading script to VPS...");
execSync(`ssh -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/current/update-target.mjs"`, {
  input: remoteCode,
  encoding: "utf8",
});

console.log("Executing remote target page update...");
const output = execSync(
  `ssh -p 65002 u188101251@147.93.100.126 "cd /home/u188101251/production-app/current && node update-target.mjs && rm -f update-target.mjs"`,
  { encoding: "utf8" }
);

console.log(output);
