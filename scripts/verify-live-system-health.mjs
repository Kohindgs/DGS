import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const { getCmsSystemHealth } = await import(path.join(ROOT, "lib/cms/system-health.ts"));

console.log("=== EXECUTING LIVE CMS SYSTEM HEALTH CHECK ===");
const report = await getCmsSystemHealth();

console.log("Timestamp:", report.timestamp);
console.log("Overall Status:", report.overallStatus);
console.log("Summary:", JSON.stringify(report.summary, null, 2));

console.log("\n--- SUBSYSTEMS BREAKDOWN ---");
for (const [key, sub] of Object.entries(report.subsystems)) {
  console.log(`[${sub.status.padEnd(14)}] ${sub.id.padEnd(22)} : ${sub.details}`);
}

if (report.overallStatus === "CRITICAL") {
  console.error("FAIL: Overall status is CRITICAL");
  process.exit(1);
} else {
  console.log("\nSUCCESS: Dynamic CMS System Health is operational!");
  process.exit(0);
}
