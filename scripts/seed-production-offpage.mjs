import { execSync } from "node:child_process";

const remoteJs = `
import { seedOpportunitiesIfEmpty } from "./lib/off-page/discovery.js";
import { 
  seedCompetitorsIfEmpty, 
  seedTargetPagesIfEmpty, 
  seedMentionsAndCitationsIfEmpty 
} from "./lib/off-page/authority-engine.js";
import { seedInitialBacklinksIfEmpty } from "./lib/off-page/backlinks.js";
import { generateMonthlyOffPageReport } from "./lib/off-page/reports.js";
import { cmsQuery } from "./lib/cms/db.js";

async function main() {
  console.log("Seeding off-page engine tables on VPS...");

  // 1. Opportunities
  const oppRes = await seedOpportunitiesIfEmpty();
  console.log("✓ Opportunities seeded:", oppRes);

  // 2. Competitors
  const compCount = await seedCompetitorsIfEmpty();
  console.log("✓ Competitors seeded:", compCount);

  // 3. Target Pages
  const tpCount = await seedTargetPagesIfEmpty();
  console.log("✓ Target Pages seeded:", tpCount);

  // 4. Mentions & Citations
  await seedMentionsAndCitationsIfEmpty();
  console.log("✓ Mentions & Citations seeded");

  // 5. Backlinks
  const blCount = await seedInitialBacklinksIfEmpty();
  console.log("✓ Backlinks seeded:", blCount);

  // 6. Monthly Report for 2026-09
  try {
    const report = await generateMonthlyOffPageReport("2026-09");
    console.log("✓ September 2026 Report generated:", report.id);
  } catch (repErr) {
    console.warn("Report generation notice:", repErr.message);
  }

  // Summary counts
  const tables = [
    "off_page_opportunities",
    "off_page_backlinks",
    "off_page_competitor_domains",
    "off_page_competitor_gaps",
    "off_page_brand_mentions",
    "off_page_citations",
    "off_page_target_pages",
    "off_page_monthly_reports"
  ];
  const summary = {};
  for (const t of tables) {
    const { rows } = await cmsQuery(\`SELECT COUNT(*) as c FROM \${t}\`);
    summary[t] = rows[0]?.c || 0;
  }
  console.log("\\n=== PRODUCTION OFF-PAGE SUMMARY ===");
  console.log(JSON.stringify(summary, null, 2));
}

main().then(() => process.exit(0)).catch((err) => {
  console.error("FATAL SEED ERROR:", err);
  process.exit(1);
});
`;

console.log("Uploading seed script to Hostinger VPS...");
execSync(`ssh -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/current/tmp/seed-offpage.mjs"`, {
  input: remoteJs,
  encoding: "utf8"
});

console.log("Executing seed on Hostinger VPS...");
const result = execSync('ssh -p 65002 u188101251@147.93.100.126 "cd /home/u188101251/production-app/current && node tmp/seed-offpage.mjs"', {
  encoding: "utf8"
});
console.log(result);
