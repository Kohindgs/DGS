import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execSync } from "node:child_process";

const TURBOVEC_URL = "http://127.0.0.1:5178";

function generateVectorId(key) {
  const hash = crypto.createHash("sha256").update(String(key)).digest();
  return hash.readBigUInt64BE(0).toString();
}

function calculateContentHash(text) {
  return crypto.createHash("sha256").update(String(text)).digest("hex");
}

async function main() {
  console.log("==================================================");
  console.log("DGS V8.12.2 — BUILD OFF-PAGE INDEX & SYNC TO VPS");
  console.log("==================================================");

  // 1. Verify TurboVec health
  const healthRes = await fetch(`${TURBOVEC_URL}/health`);
  const health = await healthRes.json();
  console.log(`✓ Local TurboVec service healthy: model=${health.model}, dim=${health.dimension}`);

  // 2. Load opportunities
  const exportPath = path.join(process.cwd(), "data", "turbovec", "opportunities_export.json");
  const rawData = fs.readFileSync(exportPath, "utf-8");
  const opportunities = JSON.parse(rawData);
  console.log(`Loaded ${opportunities.length} authentic opportunities from export.`);

  // 3. Prepare documents
  const registryRecords = [];
  const documents = opportunities.map((opp) => {
    const semanticText = [
      opp.site_name,
      opp.domain,
      opp.category,
      opp.region,
      opp.country,
      opp.recommended_service,
      opp.recommended_dgs_target_page,
      opp.notes,
      opp.evidence,
      opp.exact_submission_url,
    ]
      .filter(Boolean)
      .join("\n");

    const key = `opp:${opp.id}`;
    const vectorId = generateVectorId(key);
    const contentHash = calculateContentHash(semanticText);

    registryRecords.push({
      id: `vdoc_offpage_${opp.id}`,
      vector_id: vectorId,
      entity_type: "OFF_PAGE_OPPORTUNITY",
      entity_id: opp.id,
      content_hash: contentHash,
      region: opp.region || null,
      category: opp.category || null,
      target_page: opp.recommended_dgs_target_page || null,
    });

    return {
      key,
      id: opp.id,
      numeric_id: vectorId,
      text: semanticText,
      title: opp.site_name,
      site_name: opp.site_name,
      domain: opp.domain,
      category: opp.category,
      region: opp.region,
      country: opp.country,
      status: opp.status,
      kind: "opportunity",
      entity_type: "OFF_PAGE_OPPORTUNITY",
      entity_id: opp.id,
      target_page: opp.recommended_dgs_target_page,
      content_hash: contentHash,
    };
  });

  // 4. Batch index into TurboVec
  const BATCH_SIZE = 25;
  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = documents.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(documents.length / BATCH_SIZE);
    console.log(`Vectorizing batch ${batchNum}/${totalBatches} (${batch.length} docs)...`);

    const res = await fetch(`${TURBOVEC_URL}/api/index-batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        index_name: "off-page",
        documents: batch,
      }),
    });

    if (!res.ok) {
      throw new Error(`Batch ${batchNum} failed: ${await res.text()}`);
    }

    const resJson = await res.json();
    console.log(`  ✓ Batch ${batchNum} complete. Current index total: ${resJson.total}`);
  }

  // 5. Verify local index files
  const statusRes = await fetch(`${TURBOVEC_URL}/api/status`, { method: "POST" });
  const statusJson = await statusRes.json();
  console.log("Local TurboVec Index Status:", JSON.stringify(statusJson.indexes, null, 2));

  // 6. Sync registry records to production MariaDB
  console.log(`Syncing ${registryRecords.length} vector document mappings to production MariaDB...`);
  const syncSqlJs = `
import fs from "node:fs/promises";
import mysql from "mysql2/promise";

async function main() {
  const envText = await fs.readFile("/home/u188101251/production-app/shared/.env.production", "utf8");
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
    host: env.DGS_MYSQL_HOST,
    user: env.DGS_MYSQL_USER,
    password: env.DGS_MYSQL_PASSWORD,
    database: env.DGS_MYSQL_DATABASE
  });

  const rawJson = await fs.readFile("/home/u188101251/production-app/shared/turbovec_records.json", "utf8");
  const records = JSON.parse(rawJson);
  console.log("Importing", records.length, "registry records to MariaDB...");

  for (const r of records) {
    await conn.query(\`
      INSERT INTO off_page_vector_documents (
        id, vector_id, entity_type, entity_id, content_hash,
        embedding_model, embedding_model_version, embedding_dimension,
        index_name, index_version, region, category, target_page,
        indexed_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'nomic-embed-text', 'v1', 768, 'off-page', 1, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        content_hash = VALUES(content_hash),
        region = VALUES(region),
        category = VALUES(category),
        target_page = VALUES(target_page),
        updated_at = NOW(),
        deleted_at = NULL
    \`, [r.id, r.vector_id, r.entity_type, r.entity_id, r.content_hash, r.region, r.category, r.target_page]);
  }

  const [count] = await conn.query("SELECT COUNT(*) as total FROM off_page_vector_documents WHERE index_name = 'off-page'");
  console.log("Total off_page_vector_documents in DB:", count[0].total);

  await conn.end();
}

main().catch(err => {
  console.error("DB Sync error:", err);
  process.exit(1);
});
`;

  // Upload registry data to VPS
  fs.writeFileSync("data/turbovec/turbovec_records.json", JSON.stringify(registryRecords));
  execSync(`scp -P 65002 data/turbovec/turbovec_records.json u188101251@147.93.100.126:/home/u188101251/production-app/shared/turbovec_records.json`);

  // Execute DB sync script on VPS
  execSync(`ssh -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/shared/run-db-sync.mjs"`, {
    input: syncSqlJs,
    encoding: "utf8"
  });

  const dbSyncOut = execSync(`ssh -p 65002 u188101251@147.93.100.126 "node /home/u188101251/production-app/shared/run-db-sync.mjs && rm -f /home/u188101251/production-app/shared/run-db-sync.mjs /home/u188101251/production-app/shared/turbovec_records.json"`, {
    encoding: "utf8"
  });
  console.log(dbSyncOut);

  // 7. Upload canonical TurboVec index files to VPS shared persistence
  console.log("Uploading canonical TurboVec index files to /home/u188101251/production-app/shared/turbovec/ ...");
  execSync(`scp -P 65002 data/turbovec/dgs-content.tvim u188101251@147.93.100.126:/home/u188101251/production-app/shared/turbovec/dgs-content.tvim`);
  execSync(`scp -P 65002 data/turbovec/dgs-content.metadata.json u188101251@147.93.100.126:/home/u188101251/production-app/shared/turbovec/dgs-content.metadata.json`);
  execSync(`scp -P 65002 data/turbovec/off-page.tvim u188101251@147.93.100.126:/home/u188101251/production-app/shared/turbovec/off-page.tvim`);
  execSync(`scp -P 65002 data/turbovec/off-page.metadata.json u188101251@147.93.100.126:/home/u188101251/production-app/shared/turbovec/off-page.metadata.json`);

  console.log("Verifying files on VPS shared directory...");
  const vpsFiles = execSync(`ssh -p 65002 u188101251@147.93.100.126 "ls -la /home/u188101251/production-app/shared/turbovec/"`, { encoding: "utf8" });
  console.log(vpsFiles);

  console.log("✓ All index files and database vector registry records are 100% synchronized!");
}

main().catch((err) => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
