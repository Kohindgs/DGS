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

  if (!user || !database) {
    console.log("[MIGRATE] No DB credentials found, skipping direct migration.");
    return;
  }

  const conn = await mysql.createConnection({
    host,
    user,
    password,
    database,
  });

  console.log("Checking off_page_vector_documents table in MySQL/MariaDB...");
  await conn.query(`
    CREATE TABLE IF NOT EXISTS off_page_vector_documents (
      id VARCHAR(64) PRIMARY KEY,
      vector_id BIGINT UNSIGNED NOT NULL,
      entity_type VARCHAR(64) NOT NULL,
      entity_id VARCHAR(64) NOT NULL,
      content_hash VARCHAR(64) NOT NULL,
      embedding_model VARCHAR(64) NOT NULL,
      embedding_model_version VARCHAR(32) NOT NULL,
      embedding_dimension INT NOT NULL,
      index_name VARCHAR(64) NOT NULL,
      index_version INT NOT NULL DEFAULT 1,
      region VARCHAR(32) NULL,
      category VARCHAR(64) NULL,
      target_page VARCHAR(512) NULL,
      indexed_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      deleted_at DATETIME NULL,
      UNIQUE KEY uq_opvd_idx_vec (index_name, vector_id),
      UNIQUE KEY uq_opvd_idx_entity (index_name, entity_type, entity_id),
      INDEX idx_opvd_entity (entity_type, entity_id),
      INDEX idx_opvd_hash (content_hash),
      INDEX idx_opvd_region (region),
      INDEX idx_opvd_category (category),
      INDEX idx_opvd_deleted (deleted_at),
      INDEX idx_opvd_version (index_version)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("✓ SUCCESS: off_page_vector_documents table verified!");

  const [rows] = await conn.query("SHOW TABLES LIKE 'off_page_vector_documents'");
  console.log("Verified table:", rows);

  await conn.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
