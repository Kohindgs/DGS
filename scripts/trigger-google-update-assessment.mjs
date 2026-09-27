import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const envCandidates = [
  path.join(ROOT, ".env.production"),
  "/home/u188101251/production-app/shared/.env.production",
  "/home/u188101251/production-app/current/.env.production",
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2];
      }
    }
  }
}

const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dgeniussolutions.com";
const email = process.env.DGS_ADMIN_EMAIL;
const password = process.env.DGS_ADMIN_PASSWORD;

console.log("================================================================================");
console.log("             DGS GOOGLE UPDATE COMPLIANCE ASSESSMENT RUNNER                     ");
console.log("================================================================================");
console.log(`Target Origin: ${origin}`);

// 1. Authenticate to CMS
const form = new URLSearchParams();
form.append("email", email);
form.append("password", password);

const loginRes = await fetch(`${origin}/api/admin/session`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: form.toString(),
  redirect: "manual",
});

const setCookie = loginRes.headers.get("set-cookie");
if (!setCookie) {
  console.error("Failed to authenticate: no set-cookie header returned", loginRes.status);
  process.exit(1);
}

const sessionCookie = setCookie.split(";")[0];
console.log("Authentication: Session token acquired successfully.");

// 2. Trigger Assessment for September 2026 Spam Update
const updateId = "7c962b96-e229-40b5-839a-51893cf2db36";
console.log(`Executing POST /api/admin/google-updates/assess for updateId ${updateId}...`);
const t0 = Date.now();
const res = await fetch(`${origin}/api/admin/google-updates/assess`, {
  method: "POST",
  headers: {
    Cookie: sessionCookie,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify({ updateId }),
});

const duration = ((Date.now() - t0) / 1000).toFixed(1);

if (!res.ok) {
  const text = await res.text();
  console.error(`Assessment run failed [HTTP ${res.status}]:`, text);
  process.exit(1);
}

const data = await res.json();
const a = data.assessment || {};

console.log(`\n================================================================================`);
console.log(`             ASSESSMENT COMPLETED SUCCESSFULLY IN ${duration}s                  `);
console.log(`================================================================================`);
console.log(`Update ID:                ${a.updateId}`);
console.log(`Assessment Status:        ${a.assessmentStatus}`);
console.log(`Site Policy Compliance:   ${a.sitePolicyCompliance}`);
console.log(`Ranking Impact Status:    ${a.rankingImpactStatus}`);
console.log(`Overall Score:            ${a.overallScore} / 100`);
console.log(`Confidence:               ${a.confidence}`);
console.log(`Assessed By:              ${a.assessedBy}`);
console.log(`Assessed Date:            ${a.assessmentDate}`);
console.log(`--------------------------------------------------------------------------------`);
console.log(`Pillars / Checks Performed: ${a.checksPerformed?.length || 0}`);
for (const c of a.checksPerformed || []) {
  console.log(`  [${c.result.padEnd(4)}] ${c.name}: ${c.details.slice(0, 95)}`);
}
console.log(`--------------------------------------------------------------------------------`);
console.log(`Recommendations Count:    ${a.recommendations?.length || 0}`);
for (const rec of a.recommendations || []) {
  console.log(`  * ${rec}`);
}
console.log(`================================================================================`);
