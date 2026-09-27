import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

// Load environment variables
const envCandidates = [
  path.join(ROOT, ".env.production"),
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
  console.log("=== VERIFYING LIVE GOOGLE UPDATE ASSESSMENT EXECUTION ===");
  
  const { getGoogleSearchUpdate } = await import("../lib/google-updates/monitor.ts");
  const { runGoogleUpdateAssessment } = await import("../lib/google-updates/compliance-engine.ts");
  
  const updateId = "7c962b96-e229-40b5-839a-51893cf2db36"; // September 2026 spam update
  console.log(`1. Fetching update record: ${updateId}`);
  const update = await getGoogleSearchUpdate(updateId);
  
  if (!update) {
    console.error("FAIL: Google update record not found!");
    process.exit(1);
  }
  console.log(`✓ Found update: "${update.title}" (Published: ${update.publishedAt}, Status: ${update.rolloutStatus})`);

  console.log("2. Running automated compliance assessment...");
  const assessment = await runGoogleUpdateAssessment(update, "automated-verifier");
  
  console.log("✓ Assessment completed successfully without error!");
  console.log("Assessment Result Summary:");
  console.log(" - Update ID:", assessment.updateId);
  console.log(" - Status:", assessment.assessmentStatus);
  console.log(" - Overall Score:", assessment.overallScore);
  console.log(" - Confidence:", assessment.confidence);
  console.log(" - Checks Count:", assessment.checksPerformed.length);
  for (const check of assessment.checksPerformed) {
    console.log(`   [${check.result}] ${check.name}: ${check.details.slice(0, 80)}...`);
  }
  console.log(" - Audit Telemetry:", JSON.stringify(assessment.auditTelemetry, null, 2));
  console.log(" - Affected Pages Evaluated:", assessment.affectedPagesImpact?.length || 0);

  console.log("\n>>> LIVE PRODUCTION ASSESSMENT VERIFICATION: PASS <<<");
}

run().catch((err) => {
  console.error("FATAL ASSESSMENT ERROR:", err);
  process.exit(1);
});
