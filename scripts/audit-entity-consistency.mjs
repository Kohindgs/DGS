#!/usr/bin/env node
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const OUT = join(ROOT, "data/audit/entity-consistency-audit.json");
const SCAN_DIRS = ["app", "components", "lib", "data", "public"];

const CONFLICT_PATTERNS = [
  { id: "postal_400050", pattern: /400050/g, severity: "error" },
  { id: "khar_w", pattern: /\bKhar W\b/gi, severity: "error" },
  { id: "sv_road_only", pattern: /"streetAddress":"SV Road"/gi, severity: "warning" },
  { id: "old_instagram", pattern: /instagram\.com\/dgenius_solutions/gi, severity: "warning" },
];

function collect(target, out = []) {
  const abs = join(ROOT, target);
  let stat;
  try {
    stat = statSync(abs);
  } catch {
    return out;
  }
  if (stat.isFile()) return [...out, abs];
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git", "data/wordpress/raw"].includes(entry.name)) continue;
    collect(join(target, entry.name), out);
  }
  return out;
}

const hits = [];
for (const dir of SCAN_DIRS) {
  for (const file of collect(dir)) {
    if (!/\.(ts|tsx|js|jsx|mjs|json|css|html|txt|kml)$/.test(file)) continue;
    const rel = file.replace(ROOT + "/", "");
    if (rel.includes("data/wordpress/content/page-best-digital-marketing-agency-in-mumbai.json")) continue;
    const content = readFileSync(file, "utf8");
    for (const rule of CONFLICT_PATTERNS) {
      rule.pattern.lastIndex = 0;
      if (rule.pattern.test(content)) hits.push({ ...rule, file: rel });
    }
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  verifiedNap: {
    streetAddress: "Unit 202, Amore Edge, Swami Vivekanand Rd, Govind Dham, Khar West",
    postalCode: "400052",
    addressLocality: "Mumbai",
    addressRegion: "Maharashtra",
    addressCountry: "IN",
  },
  canonicalEntitySource: "lib/schema/entity.ts",
  stableIds: {
    organization: "https://www.dgeniussolutions.com/#organization",
    website: "https://www.dgeniussolutions.com/#website",
    localBusiness: "https://www.dgeniussolutions.com/#localbusiness",
    logo: "https://www.dgeniussolutions.com/#logo",
  },
  conflicts: hits,
  unresolvedPublicNapConflicts: hits.filter((h) => h.severity === "error").length,
};

writeFileSync(OUT, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ unresolvedPublicNapConflicts: report.unresolvedPublicNapConflicts, hits: hits.length }, null, 2));
