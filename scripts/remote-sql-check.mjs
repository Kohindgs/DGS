import fs from "node:fs";
import mysql from "mysql2/promise";

async function main() {
  const env = fs.readFileSync("/home/u188101251/production-app/current/.env.production", "utf8");
  const cfg = {};
  for (const line of env.split("\n")) {
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

  const [[{ c: uaeSql }]] = await conn.query("SELECT COUNT(*) as c FROM off_page_opportunities WHERE region = 'UAE'");
  const [[{ c: indiaSql }]] = await conn.query("SELECT COUNT(*) as c FROM off_page_opportunities WHERE region = 'INDIA'");
  const [[{ c: p0Sql }]] = await conn.query("SELECT COUNT(*) as c FROM off_page_opportunities WHERE priority_tier = 'P0'");
  const [[{ c: freeSql }]] = await conn.query("SELECT COUNT(*) as c FROM off_page_opportunities WHERE free_status = 'FREE'");
  const [[{ c: totalSql }]] = await conn.query("SELECT COUNT(*) as c FROM off_page_opportunities");

  console.log(JSON.stringify({ uaeSql, indiaSql, p0Sql, freeSql, totalSql }));
  await conn.end();
}

main().catch((err) => {
  console.error("SQL check error:", err);
  process.exit(1);
});
