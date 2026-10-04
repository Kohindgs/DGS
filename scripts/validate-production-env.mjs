import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const targetFile = process.argv[2] || "/home/u188101251/production-app/shared/.env.production";

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Target environment file does not exist: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf8");
  const envMap = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const p = trimmed.indexOf("=");
    if (p > 0) {
      const k = trimmed.slice(0, p).trim();
      let v = trimmed.slice(p + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      envMap[k] = v;
    }
  }
  return envMap;
}

async function main() {
  console.log("==================================================");
  console.log("DGS PRODUCTION ENVIRONMENT PRE-DEPLOY GUARD");
  console.log("==================================================");
  console.log(`Auditing target env: ${targetFile}`);

  let env;
  try {
    env = parseEnv(targetFile);
  } catch (err) {
    console.error("PRODUCTION_ENV_VALIDATION_FAILED: Cannot read environment file");
    console.error(err.message);
    process.exit(1);
  }

  const missing = [];
  const invalid = [];

  // 1. Mandatory runtime keys
  const requiredKeys = [
    "DGS_PUBLIC_INDEXING",
    "DGS_CRON_SECRET",
    "DGS_MYSQL_HOST",
    "DGS_MYSQL_USER",
    "DGS_MYSQL_PASSWORD",
    "DGS_MYSQL_DATABASE",
    "DGS_ADMIN_ENABLED",
    "DGS_ADMIN_EMAIL",
    "DGS_ADMIN_PASSWORD",
    "DGS_ADMIN_SESSION_SECRET",
    "DGS_ENCRYPTION_KEY",
    "NEXT_PUBLIC_SITE_URL"
  ];

  for (const k of requiredKeys) {
    if (env[k] === undefined || env[k] === null || env[k].trim().length === 0) {
      missing.push(k);
    }
  }

  // 2. Indexing Hard Fail Guard
  if (env["DGS_PUBLIC_INDEXING"] !== "true") {
    invalid.push({
      name: "DGS_PUBLIC_INDEXING",
      reason: `Must equal exactly 'true'. Current value: ${env["DGS_PUBLIC_INDEXING"] || "MISSING"}`
    });
  }

  // 3. Cron Hard Fail Guard
  if (!env["DGS_CRON_SECRET"] || env["DGS_CRON_SECRET"].trim().length < 32) {
    invalid.push({
      name: "DGS_CRON_SECRET",
      reason: "Must be non-empty and at least 32 characters"
    });
  }

  if (missing.length > 0 || invalid.length > 0) {
    console.error("\n[HARD FAIL] PRODUCTION_ENV_VALIDATION_FAILED");
    if (missing.length > 0) {
      console.error("Missing mandatory variables:");
      missing.forEach(m => console.error(`  - ${m}`));
    }
    if (invalid.length > 0) {
      console.error("Invalid variables:");
      invalid.forEach(inv => console.error(`  - ${inv.name}: ${inv.reason}`));
    }
    process.exit(1);
  }

  console.log("✓ PRODUCTION_ENV_NAMES = PASS (All mandatory variables present)");
  console.log("✓ INDEXING_GUARD = PASS (DGS_PUBLIC_INDEXING === 'true')");
  console.log("✓ CRON_GUARD = PASS (DGS_CRON_SECRET present & valid length)");

  // 4. Database Connection Hard Fail Guard
  if (process.argv.includes("--skip-db")) {
    console.log("✓ DB_CONNECTION = SKIPPED (--skip-db specified for offline/pre-pack environment)");
  } else {
    console.log("Executing live database connection check...");
    try {
      const connection = await mysql.createConnection({
        host: env.DGS_MYSQL_HOST,
        port: parseInt(env.DGS_MYSQL_PORT || "3306", 10),
        user: env.DGS_MYSQL_USER,
        password: env.DGS_MYSQL_PASSWORD,
        database: env.DGS_MYSQL_DATABASE,
        connectTimeout: 5000,
      });
      const [rows] = await connection.execute("SELECT 1 AS ok");
      await connection.end();
      if (!rows || rows[0].ok !== 1) {
        throw new Error("Query SELECT 1 did not return expected result");
      }
      console.log("✓ DB_CONNECTION = PASS");
    } catch (dbErr) {
      console.error("\n[HARD FAIL] DATABASE_CONNECTION_FAILED");
      console.error("Could not establish live connection to MySQL using production environment credentials.");
      console.error(`Error: ${dbErr.message}`);
      process.exit(1);
    }
  }

  console.log("\n==================================================");
  console.log("ALL PRE-DEPLOY ENVIRONMENT GUARDS PASSED");
  console.log("==================================================");
}

main().catch((err) => {
  console.error("FATAL ERROR in env validator:", err.message);
  process.exit(1);
});
