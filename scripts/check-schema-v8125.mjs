import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

async function main() {
  let envText = "";
  const envPaths = [
    path.join(process.cwd(), ".env.production"),
    "/home/u188101251/production-app/current/.env.production",
    "/home/u188101251/production-app/shared/.env.production",
  ];

  for (const p of envPaths) {
    try {
      envText = await fs.readFile(p, "utf8");
      if (envText) break;
    } catch {}
  }

  const env = {};
  for (const line of envText.split("\n")) {
    const p = line.indexOf("=");
    if (p > 0) {
      let v = line.slice(p + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      env[line.slice(0, p).trim()] = v;
    }
  }

  const host = env.DGS_MYSQL_HOST || process.env.DGS_MYSQL_HOST || "127.0.0.1";
  const user = env.DGS_MYSQL_USER || process.env.DGS_MYSQL_USER;
  const password = env.DGS_MYSQL_PASSWORD || process.env.DGS_MYSQL_PASSWORD;
  const database = env.DGS_MYSQL_DATABASE || process.env.DGS_MYSQL_DATABASE;

  const conn = await mysql.createConnection({ host, user, password, database });

  const [oppRows] = await conn.query("SHOW CREATE TABLE off_page_opportunities");
  console.log("=== off_page_opportunities ===");
  console.log(oppRows[0]["Create Table"]);

  const [blRows] = await conn.query("SHOW CREATE TABLE off_page_backlinks");
  console.log("\n=== off_page_backlinks ===");
  console.log(blRows[0]["Create Table"]);

  await conn.end();
}

main().catch(console.error);
