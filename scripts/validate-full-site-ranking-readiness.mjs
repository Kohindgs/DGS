#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const AUDIT = path.join(ROOT, "data/audit/full-site-ranking-readiness.json");

let report;
try {
  report = JSON.parse(readFileSync(AUDIT, "utf8"));
} catch {
  console.error("Missing ranking readiness audit. Run: npm run audit:full-site-ranking-readiness");
  process.exit(1);
}

const protectedOverflow = (report.pages || []).filter(
  (page) =>
    page.classification === "RANKING_PROTECTED" &&
    Object.values(page.mobileOverflow || {}).some(Boolean),
);

const unexplainedOverflow = (report.pages || []).filter(
  (page) =>
    page.classification !== "RANKING_PROTECTED" &&
    Object.values(page.mobileOverflow || {}).some(Boolean),
);

const ok = unexplainedOverflow.length === 0;
console.log(ok ? "PASS — FULL-SITE RANKING READINESS" : "FAIL — FULL-SITE RANKING READINESS");
console.log(
  JSON.stringify(
    {
      ok,
      summary: report.summary,
      protectedOverflowPages: protectedOverflow.map((p) => p.path),
      unexplainedOverflowPages: unexplainedOverflow.map((p) => p.path),
    },
    null,
    2,
  ),
);
process.exit(ok ? 0 : 1);
