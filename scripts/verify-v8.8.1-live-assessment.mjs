import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import { runGoogleUpdateAssessment } from "../lib/google-updates/compliance-engine.ts";
import { getGoogleSearchUpdate } from "../lib/google-updates/monitor.ts";

const ROOT = process.cwd();
const envCandidates = [
  path.join(ROOT, ".env.production"),
  "/home/u188101251/production-app/shared/.env.production",
  "/home/u188101251/production-app/current/.env.production",
  "/home/u188101251/production-app/.env.production",
  path.join(ROOT, ".env.local"),
  path.join(ROOT, ".env"),
];

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
  console.log("=== VERIFYING LIVE V8.8.1 COMPLIANCE ASSESSMENT & PERSISTENCE ===");
  const updateId = "7c962b96-e229-40b5-839a-51893cf2db36";

  const update = await getGoogleSearchUpdate(updateId);
  if (!update) {
    throw new Error(`Update not found for id ${updateId}`);
  }

  console.log(`Running assessment for update: ${update.id} - "${update.title}"...`);
  const assessmentResult = await runGoogleUpdateAssessment(update, "automated-v8.8.1-verification");

  console.log("\nAssessment execution result:");
  console.log("Status:", assessmentResult.assessmentStatus);
  console.log("Site Policy Compliance:", assessmentResult.sitePolicyCompliance);
  console.log("Ranking Impact Status:", assessmentResult.rankingImpactStatus);
  console.log("Confidence:", assessmentResult.confidence);
  console.log("Checks count:", assessmentResult.checksPerformed?.length);

  // Now verify directly from database
  const pool = mysql.createPool(
    process.env.DGS_DATABASE_URL || {
      host: process.env.DGS_MYSQL_HOST,
      port: Number(process.env.DGS_MYSQL_PORT || 3306),
      user: process.env.DGS_MYSQL_USER,
      password: process.env.DGS_MYSQL_PASSWORD,
      database: process.env.DGS_MYSQL_DATABASE,
    }
  );

  const [dbRows] = await pool.query(
    "SELECT id, title, assessment_status, site_policy_compliance, ranking_impact_status, confidence, assessed_by, assessment_date, summary, impact_analysis FROM google_search_updates WHERE id = ?",
    [updateId]
  );

  console.log("\nDirect MySQL verification:");
  console.log(JSON.stringify(dbRows[0], null, 2));

  // Now verify monitor.ts mapping
  const mappedUpdate = await getGoogleSearchUpdate(updateId);
  console.log("\nmonitor.ts getGoogleSearchUpdate result:");
  console.log("ID:", mappedUpdate?.id);
  console.log("assessment_status:", mappedUpdate?.assessment_status);
  console.log("site_policy_compliance:", mappedUpdate?.site_policy_compliance);
  console.log("ranking_impact_status:", mappedUpdate?.ranking_impact_status);
  console.log("sitePolicyCompliance:", mappedUpdate?.sitePolicyCompliance);
  console.log("rankingImpactStatus:", mappedUpdate?.rankingImpactStatus);

  if (
    dbRows[0]?.site_policy_compliance &&
    dbRows[0]?.ranking_impact_status &&
    mappedUpdate?.sitePolicyCompliance &&
    mappedUpdate?.rankingImpactStatus
  ) {
    console.log("\n✓ SUCCESS: Split status wiring is fully verified end-to-end in database and monitor mapping!");
  } else {
    console.error("\nFAIL: One or more status fields are missing or not persisted!");
    process.exitCode = 1;
  }

  await pool.end();
}

main().catch((err) => {
  console.error("Live assessment verification failed:", err);
  process.exit(1);
});
