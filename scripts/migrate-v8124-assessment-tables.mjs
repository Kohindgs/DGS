import fs from "node:fs";
import mysql from "mysql2/promise";

import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = fs.existsSync(".env.production") 
  ? ".env.production" 
  : path.join(__dirname, "..", ".env.production");

const envContent = fs.readFileSync(envPath, "utf8");
let uri = "";
for (const line of envContent.split(/\r?\n/)) {
  if (line.startsWith("DGS_DATABASE_URL=")) {
    uri = line.slice("DGS_DATABASE_URL=".length).trim().replace(/^['"](.*)['"]$/, "$1");
  }
}

async function main() {
  console.log("==================================================");
  console.log("DGS V8.12.4 ASSESSMENT & PSYCHOMETRIC DB MIGRATION");
  console.log("==================================================");

  const pool = mysql.createPool({
    uri,
    waitForConnections: true,
    connectionLimit: 5,
    supportBigNumbers: true,
    bigNumberStrings: true,
  });

  const connection = await pool.getConnection();

  try {
    // 1. Check & add columns to assessment_assignments
    console.log("1. Checking assessment_assignments columns...");
    const [assignCols] = await connection.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'assessment_assignments'`
    );
    const existingAssignCols = new Set(assignCols.map((c) => c.COLUMN_NAME));

    if (!existingAssignCols.has("psychometric_enabled")) {
      console.log("  Adding psychometric_enabled to assessment_assignments...");
      await connection.query(
        "ALTER TABLE assessment_assignments ADD COLUMN psychometric_enabled TINYINT(1) NOT NULL DEFAULT 1"
      );
      console.log("  ✓ Added psychometric_enabled");
    } else {
      console.log("  ✓ psychometric_enabled already exists");
    }

    if (!existingAssignCols.has("assignment_snapshot")) {
      console.log("  Adding assignment_snapshot to assessment_assignments...");
      await connection.query(
        "ALTER TABLE assessment_assignments ADD COLUMN assignment_snapshot LONGTEXT NULL"
      );
      console.log("  ✓ Added assignment_snapshot");
    } else {
      console.log("  ✓ assignment_snapshot already exists");
    }

    if (!existingAssignCols.has("duration_minutes")) {
      console.log("  Adding duration_minutes to assessment_assignments...");
      await connection.query(
        "ALTER TABLE assessment_assignments ADD COLUMN duration_minutes INT NOT NULL DEFAULT 60"
      );
      console.log("  ✓ Added duration_minutes");
    } else {
      console.log("  ✓ duration_minutes already exists");
    }

    // 2. Check & add columns to assessment_attempts
    console.log("2. Checking assessment_attempts columns...");
    const [attemptCols] = await connection.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'assessment_attempts'`
    );
    const existingAttemptCols = new Set(attemptCols.map((c) => c.COLUMN_NAME));

    if (!existingAttemptCols.has("technical_answers")) {
      console.log("  Adding technical_answers to assessment_attempts...");
      await connection.query(
        "ALTER TABLE assessment_attempts ADD COLUMN technical_answers LONGTEXT NULL"
      );
      console.log("  ✓ Added technical_answers");
    } else {
      console.log("  ✓ technical_answers already exists");
    }

    if (!existingAttemptCols.has("psychometric_answers")) {
      console.log("  Adding psychometric_answers to assessment_attempts...");
      await connection.query(
        "ALTER TABLE assessment_attempts ADD COLUMN psychometric_answers LONGTEXT NULL"
      );
      console.log("  ✓ Added psychometric_answers");
    } else {
      console.log("  ✓ psychometric_answers already exists");
    }

    if (!existingAttemptCols.has("psychometric_profile")) {
      console.log("  Adding psychometric_profile to assessment_attempts...");
      await connection.query(
        "ALTER TABLE assessment_attempts ADD COLUMN psychometric_profile VARCHAR(100) NULL"
      );
      console.log("  ✓ Added psychometric_profile");
    } else {
      console.log("  ✓ psychometric_profile already exists");
    }

    if (!existingAttemptCols.has("psychometric_score_data")) {
      console.log("  Adding psychometric_score_data to assessment_attempts...");
      await connection.query(
        "ALTER TABLE assessment_attempts ADD COLUMN psychometric_score_data LONGTEXT NULL"
      );
      console.log("  ✓ Added psychometric_score_data");
    } else {
      console.log("  ✓ psychometric_score_data already exists");
    }

    if (!existingAttemptCols.has("practical_submission")) {
      console.log("  Adding practical_submission to assessment_attempts...");
      await connection.query(
        "ALTER TABLE assessment_attempts ADD COLUMN practical_submission LONGTEXT NULL"
      );
      console.log("  ✓ Added practical_submission");
    } else {
      console.log("  ✓ practical_submission already exists");
    }

    console.log("==================================================");
    console.log("✓ ALL V8.12.4 ASSESSMENT SCHEMA MIGRATIONS VERIFIED!");
    console.log("==================================================");
  } finally {
    connection.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
