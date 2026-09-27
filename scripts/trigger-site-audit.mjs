import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const envPath = path.join(ROOT, ".env.production");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2];
    }
  }
}

const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dgeniussolutions.com";
const email = process.env.DGS_ADMIN_EMAIL;
const password = process.env.DGS_ADMIN_PASSWORD;

console.log("================================================================================");
console.log("                  DGS NATIVE FULL WEBSITE AUDIT RUNNER                          ");
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

// 2. Trigger Audit Run
console.log("Executing POST /api/admin/site-audits/run (crawling all sitemap URLs in batches)...");
const t0 = Date.now();
const auditRes = await fetch(`${origin}/api/admin/site-audits/run`, {
  method: "POST",
  headers: {
    Cookie: sessionCookie,
    Accept: "application/json",
  },
});

const duration = ((Date.now() - t0) / 1000).toFixed(1);

if (!auditRes.ok) {
  const text = await auditRes.text();
  console.error(`Audit run failed [HTTP ${auditRes.status}]:`, text);
  process.exit(1);
}

const data = await auditRes.json();
const r = data.report || {};

console.log(`\n================================================================================`);
console.log(`                  AUDIT COMPLETED SUCCESSFULLY IN ${duration}s                  `);
console.log(`================================================================================`);
console.log(`Audit Run ID:        ${r.id}`);
console.log(`Overall Score:       ${r.overallScore} / 100`);
console.log(`Technical Score:     ${r.technicalScore} / 100`);
console.log(`Indexability Score:  ${r.indexabilityScore} / 100`);
console.log(`Content Score:       ${r.contentScore} / 100`);
console.log(`Schema Score:        ${r.schemaScore} / 100`);
console.log(`Media Score:         ${r.mediaScore} / 100`);
console.log(`Performance Score:   ${r.performanceScore ?? "N/A"} / 100`);
console.log(`Links Score:         ${r.linksScore} / 100`);
console.log(`Crawled Pages:       ${r.crawledPages} / ${r.totalPages}`);
console.log(`--------------------------------------------------------------------------------`);
console.log(`Critical Issues:     ${r.criticalCount}`);
console.log(`High Issues:         ${r.highCount}`);
console.log(`Medium Issues:       ${r.mediumCount}`);
console.log(`Low Notices:         ${r.lowCount}`);
console.log(`================================================================================`);
