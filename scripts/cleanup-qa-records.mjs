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
    const [jds] = await connection.query("SELECT id FROM assessment_jds WHERE role_title LIKE '%DGS QA%'");
    const [vers] = await connection.query("SELECT id FROM assessment_versions WHERE test_data LIKE '%DGS QA%'");
    const [att] = await connection.query("SELECT id FROM assessment_attempts WHERE candidate_name LIKE '%DGS QA%'");
    const [cand] = await connection.query("SELECT id FROM assessment_candidates WHERE evaluation_notes LIKE '%DGS QA%' OR reviewer_notes LIKE '%DGS QA%'");
    const [blogs] = await connection.query("SELECT id FROM blog_posts WHERE title LIKE '%DGS QA%' OR slug LIKE '%dgs-qa%'");

    console.log("Found QA records:", {
      jds: jds.length,
      versions: vers.length,
      attempts: att.length,
      candidates: cand.length,
      blogs: blogs.length,
    });

    if (att.length > 0) {
      await connection.query("DELETE FROM assessment_attempts WHERE candidate_name LIKE '%DGS QA%'");
    }
    if (cand.length > 0) {
      await connection.query("DELETE FROM assessment_candidates WHERE evaluation_notes LIKE '%DGS QA%' OR reviewer_notes LIKE '%DGS QA%'");
    }
    if (vers.length > 0) {
      await connection.query("DELETE FROM assessment_versions WHERE test_data LIKE '%DGS QA%'");
    }
    if (jds.length > 0) {
      await connection.query("DELETE FROM assessment_jds WHERE role_title LIKE '%DGS QA%'");
    }
    if (blogs.length > 0) {
      await connection.query("DELETE FROM blog_posts WHERE title LIKE '%DGS QA%' OR slug LIKE '%dgs-qa%'");
    }

    console.log("QA records purged successfully. Production DB clean.");
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
