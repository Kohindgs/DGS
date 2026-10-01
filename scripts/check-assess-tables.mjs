import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

async function loadEnvFile(file) {
  try {
    const text = await fs.readFile(file, "utf8");
    for (const raw of text.split(/\r?\n/)) {
      const match = raw.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (match && !process.env[match[1]]) {
        let val = match[2];
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[match[1]] = val;
      }
    }
  } catch {}
}

await loadEnvFile(path.join(process.cwd(), ".env.production"));
await loadEnvFile(path.join(process.cwd(), ".env.local"));

function connectionOptions() {
  const uri = process.env.DGS_DATABASE_URL || process.env.DATABASE_URL;
  if (uri) {
    const url = new URL(uri);
    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ""),
      ssl: url.searchParams.get("ssl") === "true" ? {} : undefined,
    };
  }

  return {
    host: process.env.DGS_MYSQL_HOST,
    port: Number(process.env.DGS_MYSQL_PORT || 3306),
    user: process.env.DGS_MYSQL_USER,
    password: process.env.DGS_MYSQL_PASSWORD || "",
    database: process.env.DGS_MYSQL_DATABASE,
  };
}

async function main() {
  const connection = await mysql.createConnection(connectionOptions());
  try {
    const [rows] = await connection.query("SHOW TABLES");
    const tables = rows.map((r) => Object.values(r)[0]);
    console.log("All Database Tables (" + tables.length + "):", tables.join(", "));
    
    const assessTables = tables.filter((t) => t.includes("assess") || t.includes("hr") || t.includes("pipeline"));
    console.log("\nAssessment / HR Tables:", assessTables);
    
    for (const t of assessTables) {
      const [cols] = await connection.query(`DESCRIBE \`${t}\``);
      console.log(`\nTable ${t}:`, cols.map((c) => `${c.Field} (${c.Type})`).join(", "));
    }
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
