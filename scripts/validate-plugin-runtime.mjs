#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const AUDIT = path.join(ROOT, "data/audit/plugin-runtime-dependency-audit.json");

let report;
try {
  report = JSON.parse(readFileSync(AUDIT, "utf8"));
} catch {
  console.error("Missing plugin runtime audit. Run: npm run audit:plugin-runtime");
  process.exit(1);
}

const ALLOWLIST = new Set([
  "lib/wp-exact/extracted/fluentform-styles.css",
  "lib/wp-exact/extracted/home-fluentform-styles.css",
  "lib/wp-exact/extracted/footer.html",
  "lib/wp-exact/build-mirror-swap-html.ts",
  "components/wp-exact/WpMirrorHomeForm.tsx",
  "lib/wordpress/sanitize-homepage-mirror.ts",
  "lib/work/types.ts",
  "lib/wp-exact/extracted/creative-gallery-frame.html",
]);

function isBlocking(finding) {
  const file = finding.file || "";
  if (ALLOWLIST.has(file)) return false;
  if (file.includes("data/wordpress/")) return false;
  if (finding.type === "mshots") return true;
  if (finding.type === "simpleicons") return true;
  if (finding.type === "fluentFrontend" && file.includes("lib/wp-exact/extracted/")) return false;
  return true;
}

const blocking = (report.classAFindings || []).filter(isBlocking);
const ok = blocking.length === 0;

console.log(ok ? "PASS — PLUGIN RUNTIME" : "FAIL — PLUGIN RUNTIME");
console.log(
  JSON.stringify(
    {
      ok,
      summary: report.summary,
      blockingCount: blocking.length,
      blocking: blocking.slice(0, 25),
      mshotsStatus: report.summary?.mshotsRuntime ? "ASSET_APPROVAL_REQUIRED" : "none",
    },
    null,
    2,
  ),
);
process.exit(ok ? 0 : 1);
