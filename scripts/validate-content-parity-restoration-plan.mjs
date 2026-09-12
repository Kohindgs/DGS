#!/usr/bin/env node
/**
 * Validates internal consistency of the historical Phase 1F restoration plan snapshot.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

const PLAN_PATH = path.join(process.cwd(), "data/audit/content-parity-restoration-plan.json");
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const plan = JSON.parse(await readFile(PLAN_PATH, "utf8"));
assert(plan.documentType === "HISTORICAL_PHASE_1F_DIAGNOSIS", "documentType must be HISTORICAL_PHASE_1F_DIAGNOSIS");
assert(plan.sourceStartingSha, "sourceStartingSha required");
assert(plan.restorationSha, "restorationSha required");
assert(plan.sourceAuditGeneratedAt, "sourceAuditGeneratedAt required");

const counts = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0 };
for (const route of plan.routes || []) {
  for (const finding of route.findings || []) {
    const key = finding.findingClassification;
    counts[key] = (counts[key] || 0) + 1;
  }
}

for (const [key, value] of Object.entries(plan.classificationCounts || {})) {
  if ((counts[key] || 0) !== value) {
    failures.push(`classificationCounts.${key}=${value} but actual findings=${counts[key] || 0}`);
  }
}

const totalFindings = Object.values(counts).reduce((sum, value) => sum + value, 0);
assert(
  totalFindings === Object.values(plan.classificationCounts || {}).reduce((sum, value) => sum + value, 0),
  "classificationCounts sum must equal actual findings",
);

if (failures.length) {
  console.error("FAIL — RESTORATION PLAN CONSISTENCY");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("PASS — RESTORATION PLAN CONSISTENCY");
console.log(
  JSON.stringify(
    {
      documentType: plan.documentType,
      sourceStartingSha: plan.sourceStartingSha,
      restorationSha: plan.restorationSha,
      startingIncompleteCount: plan.startingIncompleteCount,
      classificationCounts: plan.classificationCounts,
      totalFindings,
    },
    null,
    2,
  ),
);
