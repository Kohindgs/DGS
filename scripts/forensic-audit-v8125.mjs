import { execSync } from "node:child_process";

const remoteAuditJs = `
import fs from "node:fs/promises";
import mysql from "mysql2/promise";

async function run() {
  const envText = await fs.readFile("/home/u188101251/production-app/current/.env.production", "utf8");
  const env = {};
  for (const line of envText.split("\\n")) {
    const p = line.indexOf("=");
    if (p > 0) {
      let v = line.slice(p + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      env[line.slice(0, p).trim()] = v;
    }
  }

  const conn = await mysql.createConnection({
    host: env.DGS_MYSQL_HOST || "127.0.0.1",
    user: env.DGS_MYSQL_USER,
    password: env.DGS_MYSQL_PASSWORD,
    database: env.DGS_MYSQL_DATABASE,
  });

  console.log("==================================================");
  console.log("   DGS PRODUCTION DATABASE FORENSIC AUDIT");
  console.log("==================================================");

  // 1. Total Rows & Active Breakdown
  const [[{ total_rows }]] = await conn.query("SELECT COUNT(*) as total_rows FROM off_page_opportunities");
  const [[{ active_rows }]] = await conn.query("SELECT COUNT(*) as active_rows FROM off_page_opportunities WHERE status NOT IN ('EXPIRED', 'REJECTED', 'ARCHIVED', 'SPAM')");
  console.log("TOTAL ROWS =", Number(total_rows));
  console.log("ACTIVE ROWS =", Number(active_rows));

  // Status Breakdown
  const [statusRows] = await conn.query("SELECT status, COUNT(*) as cnt FROM off_page_opportunities GROUP BY status ORDER BY cnt DESC");
  console.log("\\n--- Status Breakdown ---");
  for (const r of statusRows) {
    console.log(\`  \${r.status}: \${Number(r.cnt)}\`);
  }

  // Source Type Breakdown
  const [sourceTypeRows] = await conn.query("SELECT COALESCE(source_type, 'NULL/UNSET') as st, COUNT(*) as cnt FROM off_page_opportunities GROUP BY st ORDER BY cnt DESC");
  console.log("\\n--- Source Type Breakdown ---");
  for (const r of sourceTypeRows) {
    console.log(\`  \${r.st}: \${Number(r.cnt)}\`);
  }

  // Source Column Breakdown
  const [sourceRows] = await conn.query("SELECT COALESCE(source, 'NULL/UNSET') as src, COUNT(*) as cnt FROM off_page_opportunities GROUP BY src ORDER BY cnt DESC");
  console.log("\\n--- Source Breakdown ---");
  for (const r of sourceRows) {
    console.log(\`  \${r.src}: \${Number(r.cnt)}\`);
  }

  // Discovery Provider Breakdown
  const [providerRows] = await conn.query("SELECT COALESCE(discovery_provider, 'NULL/UNSET') as dp, COUNT(*) as cnt FROM off_page_opportunities GROUP BY dp ORDER BY cnt DESC");
  console.log("\\n--- Discovery Provider Breakdown ---");
  for (const r of providerRows) {
    console.log(\`  \${r.dp}: \${Number(r.cnt)}\`);
  }

  // Region Breakdown
  const [regionRows] = await conn.query("SELECT COALESCE(region, 'NULL/UNSET') as reg, COUNT(*) as cnt FROM off_page_opportunities GROUP BY reg ORDER BY cnt DESC");
  console.log("\\n--- Region Breakdown ---");
  for (const r of regionRows) {
    console.log(\`  \${r.reg}: \${Number(r.cnt)}\`);
  }

  // Category Breakdown
  const [catRows] = await conn.query("SELECT COALESCE(category, 'NULL/UNSET') as cat, COUNT(*) as cnt FROM off_page_opportunities GROUP BY cat ORDER BY cnt DESC");
  console.log("\\n--- Category Breakdown ---");
  for (const r of catRows) {
    console.log(\`  \${r.cat}: \${Number(r.cnt)}\`);
  }

  // Verification Status Breakdown
  const [verRows] = await conn.query("SELECT COALESCE(verification_status, 'NULL/UNSET') as vs, COUNT(*) as cnt FROM off_page_opportunities GROUP BY vs ORDER BY cnt DESC");
  console.log("\\n--- Verification Status Breakdown ---");
  for (const r of verRows) {
    console.log(\`  \${r.vs}: \${Number(r.cnt)}\`);
  }

  // Data Quality Checks
  const [[{ missing_url }]] = await conn.query("SELECT COUNT(*) as missing_url FROM off_page_opportunities WHERE exact_submission_url IS NULL OR exact_submission_url = ''");
  const [[{ missing_provider }]] = await conn.query("SELECT COUNT(*) as missing_provider FROM off_page_opportunities WHERE discovery_provider IS NULL OR discovery_provider = ''");
  const [[{ missing_evidence }]] = await conn.query("SELECT COUNT(*) as missing_evidence FROM off_page_opportunities WHERE evidence IS NULL OR evidence = ''");
  const [[{ missing_query }]] = await conn.query("SELECT COUNT(*) as missing_query FROM off_page_opportunities WHERE discovery_query IS NULL OR discovery_query = ''");
  const [[{ missing_region }]] = await conn.query("SELECT COUNT(*) as missing_region FROM off_page_opportunities WHERE region IS NULL OR region = ''");
  const [[{ missing_category }]] = await conn.query("SELECT COUNT(*) as missing_category FROM off_page_opportunities WHERE category IS NULL OR category = ''");
  console.log("\\n--- Data Quality Checks ---");
  console.log("Missing exact_submission_url =", Number(missing_url));
  console.log("Missing Discovery Provider =", Number(missing_provider));
  console.log("Missing Evidence =", Number(missing_evidence));
  console.log("Missing Discovery Query =", Number(missing_query));
  console.log("Missing Region =", Number(missing_region));
  console.log("Missing Category =", Number(missing_category));

  // Duplicates
  const [[{ dup_urls }]] = await conn.query("SELECT COUNT(*) - COUNT(DISTINCT exact_submission_url) as dup_urls FROM off_page_opportunities");
  const [[{ distinct_domains }]] = await conn.query("SELECT COUNT(DISTINCT domain) as distinct_domains FROM off_page_opportunities");
  console.log("\\n--- Duplicate Analysis ---");
  console.log("Duplicate exact_submission_url =", Number(dup_urls));
  console.log("Distinct Domains =", Number(distinct_domains));

  // Domain Contamination Check
  const [[{ school_opps }]] = await conn.query("SELECT COUNT(*) as school_opps FROM off_page_opportunities WHERE exact_submission_url LIKE '%digitalgrowthschool%' OR recommended_dgs_target_page LIKE '%digitalgrowthschool%' OR internal_note LIKE '%digitalgrowthschool%' OR notes LIKE '%digitalgrowthschool%'");
  const [[{ dgs_opps }]] = await conn.query("SELECT COUNT(*) as dgs_opps FROM off_page_opportunities WHERE recommended_dgs_target_page LIKE '%dgeniussolutions%'");
  console.log("\\n--- Monitored Domain Contamination (Opportunities) ---");
  console.log("Opportunities referencing 'digitalgrowthschool':", Number(school_opps));
  console.log("Opportunities referencing 'dgeniussolutions':", Number(dgs_opps));

  if (Number(school_opps) > 0) {
    const [sampleSchool] = await conn.query("SELECT id, site_name, exact_submission_url, recommended_dgs_target_page FROM off_page_opportunities WHERE exact_submission_url LIKE '%digitalgrowthschool%' OR recommended_dgs_target_page LIKE '%digitalgrowthschool%' OR internal_note LIKE '%digitalgrowthschool%' OR notes LIKE '%digitalgrowthschool%' LIMIT 10");
    console.log("Sample digitalgrowthschool opportunities:", sampleSchool);
  }

  // Backlinks domain check
  const [[{ total_bl }]] = await conn.query("SELECT COUNT(*) as total_bl FROM off_page_backlinks");
  const [[{ school_bl }]] = await conn.query("SELECT COUNT(*) as school_bl FROM off_page_backlinks WHERE target_url LIKE '%digitalgrowthschool%' OR source_url LIKE '%digitalgrowthschool%'");
  const [[{ dgs_bl }]] = await conn.query("SELECT COUNT(*) as dgs_bl FROM off_page_backlinks WHERE target_url LIKE '%dgeniussolutions%' OR source_url LIKE '%dgeniussolutions%'");
  console.log("\\n--- Backlinks Domain Contamination ---");
  console.log("TOTAL BACKLINKS =", Number(total_bl));
  console.log("Backlinks referencing 'digitalgrowthschool':", Number(school_bl));
  console.log("Backlinks referencing 'dgeniussolutions':", Number(dgs_bl));

  if (Number(school_bl) > 0) {
    const [sampleSchoolBl] = await conn.query("SELECT id, source_domain, source_url, target_url, notes FROM off_page_backlinks WHERE target_url LIKE '%digitalgrowthschool%' OR source_url LIKE '%digitalgrowthschool%'");
    console.log("Sample digitalgrowthschool backlinks:", sampleSchoolBl);
  }

  // TurboVec Index Reconciliation
  const [[{ total_vector_docs }]] = await conn.query("SELECT COUNT(*) as total_vector_docs FROM off_page_vector_documents");
  const [vectorDocTypes] = await conn.query("SELECT doc_type, COUNT(*) as cnt FROM off_page_vector_documents GROUP BY doc_type");
  console.log("\\n--- TurboVec Vector Documents in MariaDB ---");
  console.log("TOTAL VECTOR REGISTRY ROWS =", Number(total_vector_docs));
  for (const vt of vectorDocTypes) {
    console.log(\`  \${vt.doc_type}: \${Number(vt.cnt)}\`);
  }

  // Cross-reference MariaDB opportunities vs vector registry
  const [[{ opps_indexed }]] = await conn.query(\`
    SELECT COUNT(DISTINCT o.id) as opps_indexed 
    FROM off_page_opportunities o
    JOIN off_page_vector_documents v ON v.source_id = o.id
  \`);
  const [[{ opps_not_indexed }]] = await conn.query(\`
    SELECT COUNT(*) as opps_not_indexed 
    FROM off_page_opportunities o
    LEFT JOIN off_page_vector_documents v ON v.source_id = o.id
    WHERE v.id IS NULL
  \`);
  console.log("Opportunities with vector document in registry =", Number(opps_indexed));
  console.log("Opportunities without vector document in registry =", Number(opps_not_indexed));

  // Check physical TurboVec stats on disk
  try {
    const tvStats = JSON.parse(await fs.readFile("/home/u188101251/production-app/shared/turbovec/indexes/off-page.json", "utf8").catch(() => "{}"));
    console.log("\\n--- Physical TurboVec off-page index metadata ---");
    console.log("TurboVec off-page documentCount on disk:", tvStats.documentCount || tvStats.total_documents || "N/A");
  } catch (e) {
    console.log("Could not read off-page.json:", e.message);
  }

  await conn.end();
}

run().catch(err => {
  console.error("Forensic audit error:", err);
  process.exit(1);
});
`;

execSync(`ssh -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/current/tmp/run-forensic.mjs"`, {
  input: remoteAuditJs,
  encoding: "utf8"
});

const out = execSync(`ssh -p 65002 u188101251@147.93.100.126 "cd /home/u188101251/production-app/current && node tmp/run-forensic.mjs"`, {
  encoding: "utf8"
});

console.log(out);
