import { execSync } from "node:child_process";
import fs from "node:fs";

async function main() {
  console.log("==================================================");
  console.log("DGS V8.12.3 LIVE PRODUCTION FORENSIC AUDIT");
  console.log("==================================================");

  // Remote execution code
  const remoteCode = `
import mysql from "mysql2/promise";
import fs from "node:fs/promises";
import { execSync } from "node:child_process";

async function run() {
  // 1. Read env
  const envText = await fs.readFile(".env.production", "utf8");
  const env = {};
  for (const line of envText.split("\\n")) {
    const p = line.indexOf("=");
    if (p > 0) {
      let v = line.slice(p + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      env[line.slice(0, p).trim()] = v;
    }
  }

  // 2. Production Database Backup
  console.log("--- STEP 1: PRODUCTION DATABASE BACKUP ---");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = \`/home/u188101251/production-app/shared/backups/backup_v8123_pre_\${timestamp}.sql\`;
  try {
    execSync(\`mkdir -p /home/u188101251/production-app/shared/backups\`);
    const cnfTmp = \`/home/u188101251/production-app/shared/backups/.tmp_my_\${Date.now()}.cnf\`;
    fs.writeFileSync(cnfTmp, \`[client]\\nhost=\${env.DGS_MYSQL_HOST}\\nport=\${env.DGS_MYSQL_PORT || 3306}\\nuser=\${env.DGS_MYSQL_USER}\\npassword="\${(env.DGS_MYSQL_PASSWORD || "").replace(/["\\\\\\\\]/g, "\\\\\\\\$&")}"\\n\`, { mode: 0o600 });
    try {
      execSync(\`mysqldump --defaults-extra-file="\${cnfTmp}" --no-tablespaces \${env.DGS_MYSQL_DATABASE} > \${backupFile}\`);
      console.log(\`✓ Database backup created successfully at: \${backupFile}\`);
    } finally {
      try { fs.unlinkSync(cnfTmp); } catch {}
    }
  } catch (err) {
    console.warn("Notice during mysqldump backup:", err.message);
  }

  // 3. Connect to MariaDB
  const conn = await mysql.createConnection({
    host: env.DGS_MYSQL_HOST,
    user: env.DGS_MYSQL_USER,
    password: env.DGS_MYSQL_PASSWORD,
    database: env.DGS_MYSQL_DATABASE
  });

  console.log("\\n--- STEP 2: OFF-PAGE TABLE AUDIT ---");
  const [tables] = await conn.query("SHOW TABLES LIKE 'off_page%'");
  const tableNames = tables.map(t => Object.values(t)[0]);
  console.log("Found tables:", tableNames);

  for (const table of tableNames) {
    console.log(\`\\n>>> TABLE: \${table}\`);
    const [[countRes]] = await conn.query(\`SELECT COUNT(*) as total FROM \${table}\`);
    console.log(\`Total rows: \${countRes.total}\`);

    // Check columns
    const [cols] = await conn.query(\`SHOW COLUMNS FROM \${table}\`);
    const colNames = cols.map(c => c.Field);
    
    // Check timestamps if present
    const hasCreated = colNames.includes("created_at") || colNames.includes("discovered_at");
    const createdCol = colNames.includes("created_at") ? "created_at" : (colNames.includes("discovered_at") ? "discovered_at" : null);
    const updatedCol = colNames.includes("updated_at") ? "updated_at" : (colNames.includes("last_verified_at") ? "last_verified_at" : null);

    if (createdCol) {
      const [[earliest]] = await conn.query(\`SELECT MIN(\${createdCol}) as min_d, MAX(\${createdCol}) as max_d FROM \${table}\`);
      console.log(\`Earliest \${createdCol}: \${earliest.min_d}, Latest \${createdCol}: \${earliest.max_d}\`);
    }

    if (colNames.includes("status")) {
      const [statusDist] = await conn.query(\`SELECT status, COUNT(*) as cnt FROM \${table} GROUP BY status\`);
      console.log("Status distribution:", JSON.stringify(statusDist));
    }

    if (colNames.includes("region")) {
      const [regionDist] = await conn.query(\`SELECT region, COUNT(*) as cnt FROM \${table} GROUP BY region\`);
      console.log("Region distribution:", JSON.stringify(regionDist));
    }

    if (colNames.includes("source") || colNames.includes("discovery_provider")) {
      const srcCol = colNames.includes("discovery_provider") ? "discovery_provider" : "source";
      const [srcDist] = await conn.query(\`SELECT \${srcCol}, COUNT(*) as cnt FROM \${table} GROUP BY \${srcCol}\`);
      console.log("Source/Provider distribution:", JSON.stringify(srcDist));
    }
  }

  // 4. Audit Existing 181 Opportunities in detail
  console.log("\\n--- STEP 3: DETAILED AUDIT OF OPPORTUNITIES (181 RECORDS) ---");
  const [oppCols] = await conn.query("SHOW COLUMNS FROM off_page_opportunities");
  const colSet = new Set(oppCols.map(c => c.Field));
  console.log("Columns in off_page_opportunities:", Array.from(colSet));

  const [oppRows] = await conn.query("SELECT * FROM off_page_opportunities");
  console.log(\`Fetched \${oppRows.length} opportunities.\`);

  // Classify origins
  let verifiedBatchCount = 0;
  let manualCount = 0;
  let automatedCount = 0;
  let missingProviderCount = 0;
  let missingUrlCount = 0;
  let missingQueryCount = 0;
  const domains = new Set();
  const urls = new Set();
  let duplicateUrlCount = 0;
  let duplicateDomainCount = 0;

  for (const opp of oppRows) {
    const oppUrl = opp.url || opp.exact_submission_url;
    if (!oppUrl) missingUrlCount++;
    if (urls.has(oppUrl)) duplicateUrlCount++;
    else urls.add(oppUrl);

    if (domains.has(opp.domain)) duplicateDomainCount++;
    else domains.add(opp.domain);

    const prov = (opp.discovery_provider || opp.source || "").toLowerCase();
    if (prov.includes("batch") || prov.includes("verified") || (opp.notes && opp.notes.includes("batch"))) {
      verifiedBatchCount++;
    } else if (prov.includes("curated") || prov.includes("seed")) {
      verifiedBatchCount++;
    } else if (prov.includes("manual")) {
      manualCount++;
    } else if (prov.includes("automated") || prov.includes("google") || prov.includes("serp") || prov.includes("rss") || prov.includes("gdelt")) {
      automatedCount++;
    } else {
      missingProviderCount++;
    }

    if (!opp.discovery_query) missingQueryCount++;
  }

  console.log("Opportunity Analysis:");
  console.log(\`  - Total: \${oppRows.length}\`);
  console.log(\`  - Verified Batch Import: \${verifiedBatchCount}\`);
  console.log(\`  - Manual Entry: \${manualCount}\`);
  console.log(\`  - Automated Discovery: \${automatedCount}\`);
  console.log(\`  - Missing Provider / Unknown: \${missingProviderCount}\`);
  console.log(\`  - Missing Discovery Query: \${missingQueryCount}\`);
  console.log(\`  - Unique Domains: \${domains.size}, Duplicate Domains: \${duplicateDomainCount}\`);
  console.log(\`  - Unique URLs: \${urls.size}, Duplicate URLs: \${duplicateUrlCount}\`);

  // 5. Audit off_page_settings
  console.log("\\n--- STEP 4: OFF-PAGE SETTINGS AUDIT ---");
  try {
    const [settings] = await conn.query("SELECT * FROM off_page_settings");
    console.log("Settings rows:", JSON.stringify(settings, null, 2));
  } catch (err) {
    console.warn("Could not query off_page_settings:", err.message);
  }

  // 6. Audit Backlinks table
  console.log("\\n--- STEP 5: BACKLINKS TABLE AUDIT ---");
  try {
    const [backlinks] = await conn.query("SELECT * FROM off_page_backlinks LIMIT 10");
    console.log(\`Sample backlinks (\${backlinks.length}):\`, JSON.stringify(backlinks, null, 2));
  } catch (err) {
    console.warn("Could not query off_page_backlinks:", err.message);
  }

  await conn.end();
}

run().catch(e => { console.error("AUDIT FAILED:", e); process.exit(1); });
`;

  console.log("Uploading audit runner to production...");
  execSync(`ssh -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/current/run-audit.mjs"`, {
    input: remoteCode,
    encoding: "utf8"
  });

  console.log("Executing remote forensic audit...");
  const output = execSync(`ssh -p 65002 u188101251@147.93.100.126 "cd /home/u188101251/production-app/current && node run-audit.mjs && rm -f run-audit.mjs"`, {
    encoding: "utf8"
  });

  console.log(output);
}

main().catch(err => {
  console.error("Forensic audit failed:", err);
  process.exit(1);
});
