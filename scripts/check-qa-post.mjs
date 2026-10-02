import fs from "node:fs";
import mysql from "mysql2/promise";

const ROOT = process.cwd();
const envCandidates = [
  pathJoin(ROOT, ".env.production"),
  "/home/u188101251/production-app/current/.env.production"
];

function pathJoin(...args) {
  return args.join("/");
}

for (const envFile of envCandidates) {
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].trim().replace(/^['"](.*)['"]$/, "$1");
      }
    }
  }
}

async function main() {
  const pool = mysql.createPool(process.env.DGS_DATABASE_URL || {
    host: process.env.DGS_MYSQL_HOST,
    user: process.env.DGS_MYSQL_USER,
    password: process.env.DGS_MYSQL_PASSWORD,
    database: process.env.DGS_MYSQL_DATABASE,
  });

  const [rows] = await pool.query("SELECT id, slug, title, status, needs_review FROM blog_posts WHERE slug = ?", ["dgs-cms-scheduled-cron-qa"]);
  console.log("dgs-cms-scheduled-cron-qa in blog_posts:", rows);

  // Also check if there's any file in mirrors or data
  await pool.end();
}

main().catch(console.error);
