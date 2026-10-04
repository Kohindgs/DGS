import fs from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const env = fs.readFileSync(".env.production", "utf8");
let cronSecret = "";
let dbPassword = "";
let adminPassword = "";

for (const line of env.split(/\r?\n/)) {
  if (line.startsWith("DGS_CRON_SECRET=")) {
    cronSecret = line.slice("DGS_CRON_SECRET=".length).trim().replace(/^['"](.*)['"]$/, "$1");
  }
  if (line.startsWith("DGS_MYSQL_PASSWORD=")) {
    dbPassword = line.slice("DGS_MYSQL_PASSWORD=".length).trim().replace(/^['"](.*)['"]$/, "$1");
  }
  if (line.startsWith("DGS_ADMIN_PASSWORD=")) {
    adminPassword = line.slice("DGS_ADMIN_PASSWORD=".length).trim().replace(/^['"](.*)['"]$/, "$1");
  }
}

function auditSecret(name, secret) {
  if (!secret || secret.length < 8) {
    console.log(`[WARN] Secret ${name} not defined or too short`);
    return { name, trackedMatches: 0, gitLogMatches: 0 };
  }

  // 1. Check tracked files (excluding .env*)
  let trackedMatches = 0;
  try {
    const trackedFiles = execSync("git ls-files", { encoding: "utf8" }).split("\n").filter(Boolean);
    for (const f of trackedFiles) {
      if (f.startsWith(".env")) continue;
      if (!fs.existsSync(f)) continue;
      const content = fs.readFileSync(f, "utf8");
      if (content.includes(secret)) {
        trackedMatches++;
        console.error(`LEAK DETECTED in tracked file: ${f}`);
      }
    }
  } catch (e) {
    console.error("Error checking tracked files:", e.message);
  }

  // 2. Check git commit history
  let gitLogMatches = 0;
  try {
    // Search git log for the string
    const logCheck = execSync(`git log -S "${secret}" --oneline`, { encoding: "utf8" }).trim();
    if (logCheck.length > 0) {
      gitLogMatches = logCheck.split("\n").length;
      console.error(`LEAK DETECTED in git commit history (${gitLogMatches} commits)`);
    }
  } catch (e) {
    // git log -S returns non-zero if not found or errors
  }

  return { name, trackedMatches, gitLogMatches };
}

async function run() {
  console.log("==================================================");
  console.log("DGS V8.11.3 SECRET LEAK AUDIT (P15)");
  console.log("==================================================");

  const cronRes = auditSecret("CRON_SECRET", cronSecret);
  const dbRes = auditSecret("DB_SECRET", dbPassword);
  const adminRes = auditSecret("ADMIN_PASSWORD", adminPassword);

  console.log(`PLAINTEXT_CRON_SECRET_MATCHES = ${cronRes.trackedMatches}`);
  console.log(`PLAINTEXT_CRON_SECRET_IN_GIT_LOG = ${cronRes.gitLogMatches}`);
  console.log(`PLAINTEXT_DB_SECRET_MATCHES = ${dbRes.trackedMatches}`);
  console.log(`PLAINTEXT_DB_SECRET_IN_GIT_LOG = ${dbRes.gitLogMatches}`);
  console.log(`PLAINTEXT_ADMIN_SECRET_MATCHES = ${adminRes.trackedMatches}`);
  console.log(`PLAINTEXT_ADMIN_SECRET_IN_GIT_LOG = ${adminRes.gitLogMatches}`);

  const total = cronRes.trackedMatches + cronRes.gitLogMatches +
                dbRes.trackedMatches + dbRes.gitLogMatches +
                adminRes.trackedMatches + adminRes.gitLogMatches;

  console.log("==================================================");
  console.log(`TOTAL_SECRET_LEAKS_FOUND = ${total}`);
  console.log("==================================================");
}

run();
