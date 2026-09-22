import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dgeniussolutions.com";

console.log(`\n==================================================`);
console.log(`LIVE PRODUCTION E2E VERIFICATION ON HOSTINGER`);
console.log(`Target: ${SITE_URL}`);
console.log(`==================================================\n`);

async function testRedirect() {
  console.log("1. Testing Junior HR Generalist 301 Redirect...");
  const resWithSlash = await fetch(`${SITE_URL}/career/junior-hr-generalist/`, {
    redirect: "manual",
  });
  console.log(`   /career/junior-hr-generalist/ status: ${resWithSlash.status}`);
  console.log(`   Location: ${resWithSlash.headers.get("location")}`);
  assert.equal(resWithSlash.status, 301, "Must return HTTP 301");
  assert.ok(
    resWithSlash.headers.get("location")?.endsWith("/career/"),
    "Location must point to /career/",
  );

  const resWithoutSlash = await fetch(`${SITE_URL}/career/junior-hr-generalist`, {
    redirect: "manual",
  });
  console.log(`   /career/junior-hr-generalist status: ${resWithoutSlash.status}`);
  console.log(`   Location: ${resWithoutSlash.headers.get("location")}`);
  assert.equal(resWithoutSlash.status, 301, "Must return HTTP 301");
  assert.ok(
    resWithoutSlash.headers.get("location")?.endsWith("/career/"),
    "Location must point to /career/",
  );
  console.log("   ✓ Junior HR Generalist redirects permanently 301 to /career/ (zero 404s)\n");
}

async function testCareersHub() {
  console.log("2. Testing Active Careers Hub (/career/)...");
  const res = await fetch(`${SITE_URL}/career/`);
  assert.equal(res.status, 200, "Hub must return 200");
  const html = await res.text();

  assert.ok(html.includes("Generative AI Artist"), "Must list Generative AI Artist");
  assert.ok(
    !html.includes("Junior HR Generalist"),
    "Junior HR Generalist must NOT be displayed",
  );
  assert.ok(html.includes("₹10,000 – ₹15,000"), "Must display salary on card");
  assert.ok(html.includes("Khar West, Mumbai"), "Must display location");
  assert.ok(html.includes("Work From Office"), "Must display workplace type");
  console.log("   ✓ Generative AI Artist is active and Junior HR Generalist is absent\n");
}

async function testGenerativeAiArtistPage() {
  console.log("3. Testing Generative AI Artist Job Page...");
  const res = await fetch(`${SITE_URL}/career/generative-ai-artist/`);
  assert.equal(res.status, 200, "Page must return 200");
  const html = await res.text();

  assert.ok(html.includes("Generative AI Artist"), "Must have job title");
  assert.ok(html.includes("₹10,000 – ₹15,000 per month"), "Must have compensation");
  assert.ok(html.includes("12th Pass"), "Must have 12th Pass education");
  assert.ok(html.includes("1–2 Years"), "Must have experience");
  assert.ok(html.includes("Khar West, Mumbai"), "Must have location");

  // Verify Schema.org JobPosting in JSON-LD
  const jsonLdMatch = html.match(/<script id="career-job-jsonld"[^>]*>(.*?)<\/script>/s);
  assert.ok(jsonLdMatch, "career-job-jsonld script tag must be present");
  const parsed = JSON.parse(jsonLdMatch[1]);
  const jobSchema = Array.isArray(parsed) ? parsed.find((d) => d["@type"] === "JobPosting") : parsed;

  assert.ok(jobSchema, "JobPosting schema must be found");
  assert.equal(jobSchema.title, "Generative AI Artist");
  assert.equal(jobSchema.educationRequirements, "12th Pass");
  assert.equal(jobSchema.experienceRequirements, "1–2 Years");
  assert.equal(jobSchema.baseSalary.currency, "INR");
  assert.equal(jobSchema.baseSalary.value.minValue, 10000);
  assert.equal(jobSchema.baseSalary.value.maxValue, 15000);
  assert.equal(jobSchema.baseSalary.value.unitText, "MONTH");
  console.log("   ✓ JobPosting schema verified: baseSalary INR 10,000–15,000/mo, 12th Pass, 1–2 Years\n");
}

async function testGoogleSearchUpdates() {
  console.log("4. Testing Google Search Update System in DB...");
  const dbConfig = {
    host: process.env.DGS_MYSQL_HOST,
    port: Number(process.env.DGS_MYSQL_PORT || 3306),
    user: process.env.DGS_MYSQL_USER,
    password: process.env.DGS_MYSQL_PASSWORD || "",
    database: process.env.DGS_MYSQL_DATABASE,
  };

  const conn = await mysql.createConnection(dbConfig);
  try {
    const [rows] = await conn.execute(
      "SELECT id, title, category, severity, status, notified_at, recommended_actions FROM google_search_updates ORDER BY published_at DESC LIMIT 25",
    );
    console.log(`   Found ${rows.length} Google Search Updates stored in MySQL.`);
    assert.ok(rows.length > 0, "Must have updates recorded");

    const criticals = rows.filter((r) => r.severity === "CRITICAL");
    const highs = rows.filter((r) => r.severity === "HIGH");
    console.log(`   - CRITICAL updates: ${criticals.length}`);
    console.log(`   - HIGH updates: ${highs.length}`);

    const rawActions = rows[0].recommended_actions;
    const sampleActions =
      typeof rawActions === "string"
        ? rawActions.startsWith("[") || rawActions.startsWith("{")
          ? JSON.parse(rawActions)
          : [rawActions]
        : Array.isArray(rawActions)
        ? rawActions
        : [];
    const hasProtectionRule = sampleActions.some((a) =>
      String(a).toLowerCase().includes("not automatically alter") ||
      (String(a).toLowerCase().includes("do not") && String(a).toLowerCase().includes("rewrite")),
    );
    assert.ok(hasProtectionRule, "Strict NO-AUTO-REWRITE policy must be present in recommendations");
    console.log("   ✓ Strict NO-AUTO-REWRITE policy confirmed in DB recommendations\n");
  } finally {
    await conn.end();
  }
}

async function testProtectedRankingPages() {
  console.log("5. Testing Protected Ranking Pages Health...");
  const protectedRoutes = [
    "/services/seo-services-in-mumbai/",
    "/services/ai-video-production-agency/",
    "/services/performance-marketing/",
    "/services/aeo-services-in-mumbai/",
  ];

  for (const route of protectedRoutes) {
    const res = await fetch(`${SITE_URL}${route}`);
    console.log(`   ${route} => HTTP ${res.status}`);
    assert.equal(res.status, 200, `Protected route ${route} must return HTTP 200`);
  }
  console.log("   ✓ All protected ranking pages healthy and accessible\n");
}

async function run() {
  await testRedirect();
  await testCareersHub();
  await testGenerativeAiArtistPage();
  await testGoogleSearchUpdates();
  await testProtectedRankingPages();

  console.log(`==================================================`);
  console.log(`ALL 5 PRODUCTION VERIFICATION CHECKS PASSED!`);
  console.log(`==================================================\n`);
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
