import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

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

async function run() {
  const pool = mysql.createPool(
    process.env.DGS_DATABASE_URL || {
      host: process.env.DGS_MYSQL_HOST,
      port: Number(process.env.DGS_MYSQL_PORT || 3306),
      user: process.env.DGS_MYSQL_USER,
      password: process.env.DGS_MYSQL_PASSWORD,
      database: process.env.DGS_MYSQL_DATABASE,
    }
  );

  console.log("=== REFRESHING SEPTEMBER 2026 SPAM UPDATE DB ROW ===");

  const targetId = "7c962b96-e229-40b5-839a-51893cf2db36";
  const [existing] = await pool.query(
    "SELECT id, title, summary, impact_analysis, affected_dgs_areas, assessment_status, site_policy_compliance, ranking_impact_status FROM google_search_updates WHERE id = ? OR title LIKE '%September 2026%Spam%' LIMIT 1",
    [targetId]
  );

  if (!existing || existing.length === 0) {
    console.warn("Could not find September 2026 Spam Update row in google_search_updates table.");
    await pool.end();
    return;
  }

  const row = existing[0];
  console.log(`Found update row: ${row.id} - "${row.title}"`);
  console.log(`Current assessment status: ${row.assessment_status}`);
  console.log(`Current policy compliance: ${row.site_policy_compliance}`);
  console.log(`Current ranking impact: ${row.ranking_impact_status}`);

  const refreshedSummary =
    "Official Notice: Google released the September 2026 spam update, beginning its global rollout on September 24, 2026. The rollout is estimated to take up to 14 days. DGS Policy Review Areas: Evaluates site compliance against published spam policies, specifically scaled content abuse, site reputation abuse, expired domain abuse, link spam, and doorway behavior.";

  const refreshedImpactAnalysis =
    "Potential DGS Impact (Hypothesis): Google is rolling out an automated spam update across search systems. DGS policy review areas encompass scaled-content abuse, site reputation abuse, expired-domain abuse, link spam, and doorway behavior. DGS white-hat architectural standards serve as defensive baseline; verified compliance and risk status require empirical site audit and GSC performance evidence.";

  const refreshedAffectedAreas = JSON.stringify([
    "Site Reputation Screening",
    "Scaled Content Verification",
    "Location Page Doorway Screening",
    "Organic Search Telemetry",
    "Brand Query Performance",
  ]);

  await pool.query(
    `UPDATE google_search_updates
     SET summary = ?,
         impact_analysis = ?,
         affected_dgs_areas = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [refreshedSummary, refreshedImpactAnalysis, refreshedAffectedAreas, row.id]
  );

  console.log("✓ Successfully refreshed September 2026 update description without altering assessment history or status.");

  const [verifyRows] = await pool.query(
    "SELECT id, title, summary, impact_analysis, affected_dgs_areas, updated_at FROM google_search_updates WHERE id = ?",
    [row.id]
  );
  console.log("Verified updated row:", JSON.stringify(verifyRows[0], null, 2));

  await pool.end();
}

run().catch((err) => {
  console.error("Failed to refresh September 2026 update row:", err);
  process.exit(1);
});
