import mysql from "mysql2/promise";
import fs from "node:fs";

const env = {};
const envFile = process.argv[2] || ".env.production";
fs.readFileSync(envFile, "utf8").split(/\r?\n/).forEach(l => {
  const trimmed = l.trim();
  if (!trimmed || trimmed.startsWith("#")) return;
  const eq = trimmed.indexOf("=");
  if (eq > 0) {
    const k = trimmed.slice(0, eq).trim();
    let v = trimmed.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[k] = v;
  }
});

async function check() {
  const conn = await mysql.createConnection({
    host: env.DGS_MYSQL_HOST,
    user: env.DGS_MYSQL_USER,
    password: env.DGS_MYSQL_PASSWORD,
    database: env.DGS_MYSQL_DATABASE
  });

  const [rows] = await conn.query("SELECT * FROM blog_posts WHERE slug = ?", [
    "google-ads-for-b2b-lead-generation-how-to-get-better-quality-leads"
  ]);

  console.log("COLUMNS FOR google-ads-for-b2b-lead-generation-how-to-get-better-quality-leads:");
  const row = rows[0];
  for (const [k, v] of Object.entries(row)) {
    if (typeof v === "string" && v.length > 100) {
      console.log(`  ${k}: [String length ${v.length}] ${v.slice(0, 100)}...`);
    } else {
      console.log(`  ${k}:`, v);
    }
  }

  const [rows2] = await conn.query("SELECT * FROM blog_posts WHERE slug = ?", [
    "google-september-2026-spam-update-what-website-owners-should-know"
  ]);
  console.log("\nCOLUMNS FOR google-september-2026-spam-update-what-website-owners-should-know:");
  const row2 = rows2[0];
  for (const [k, v] of Object.entries(row2)) {
    if (typeof v === "string" && v.length > 100) {
      console.log(`  ${k}: [String length ${v.length}] ${v.slice(0, 100)}...`);
    } else {
      console.log(`  ${k}:`, v);
    }
  }

  await conn.end();
}

check().catch(console.error);
