import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const appRoot = process.cwd();

test("1. classifyUpdate accurately categorizes Spam, Core, Incident, and Multimodal Console updates", async () => {
  const { classifyUpdate } = await import("../lib/google-updates/monitor.ts");

  const spam = classifyUpdate("September 2026 spam update", "Released the September 2026 spam update affecting all languages.");
  assert.equal(spam.category, "Spam Update");
  assert.equal(spam.severity, "HIGH");

  const core = classifyUpdate("August 2026 broad core update", "Rollout of broad core algorithm update.");
  assert.equal(core.category, "Core Update");
  assert.equal(core.severity, "CRITICAL");

  const multimodal = classifyUpdate(
    "Announcing web multimodal Search performance reporting in Search Console",
    "Understanding how users find your content in multimodal search.",
  );
  assert.equal(multimodal.category, "Search Features & Schema");
  assert.equal(multimodal.severity, "MEDIUM");

  const incident = classifyUpdate("Google Search Serving Outage", "We are investigating a search ranking incident.");
  assert.equal(incident.category, "Search System Incident");
  assert.equal(incident.severity, "HIGH");
});

test("2. generateSafeRecommendations enforces strict zero-auto-rewrite ranking policy", async () => {
  const { generateSafeRecommendations } = await import("../lib/google-updates/monitor.ts");

  for (const severity of ["CRITICAL", "HIGH", "MEDIUM", "INFORMATIONAL"]) {
    const recs = generateSafeRecommendations(severity, "Spam Update");
    assert.ok(recs.length >= 3, "Must provide multiple safe recommendations");
    const hasForbiddenRewrite = recs.some((r) =>
      r.toLowerCase().includes("not automatically alter") ||
      (r.toLowerCase().includes("do not") && r.toLowerCase().includes("rewrite")),
    );
    assert.ok(hasForbiddenRewrite, `Severity ${severity} must forbid automatic rewriting of ranked pages`);
  }
});

test("3. generateDgsImpact protects core service pages and organic brand queries", async () => {
  const { generateDgsImpact } = await import("../lib/google-updates/monitor.ts");

  const coreImpact = generateDgsImpact("Core Update", "Core Update", "CRITICAL");
  assert.ok(coreImpact.affectedAreas.includes("/services/seo-services-in-mumbai/"));
  assert.ok(coreImpact.affectedAreas.includes("/services/ai-video-production-agency/"));

  const spamImpact = generateDgsImpact("September 2026 spam update", "Spam Update", "HIGH");
  assert.ok(spamImpact.affectedAreas.includes("Blog Editorial Integrity"));
  assert.ok(spamImpact.affectedAreas.includes("Competitive SERP Visibility"));
});

test("4. Official Source 3 (Google Search Documentation Updates RSS) fetcher functions and parses items", async () => {
  const { fetchGoogleSearchDocsUpdates } = await import("../lib/google-updates/monitor.ts");

  const docsUpdates = await fetchGoogleSearchDocsUpdates();
  assert.ok(Array.isArray(docsUpdates), "Must return an array of items");
  if (docsUpdates.length > 0) {
    const first = docsUpdates[0];
    assert.ok(first.title, "Item must have a title");
    assert.ok(first.sourceUrl, "Item must have a sourceUrl");
    assert.ok(first.publishedAt, "Item must have a publishedAt");
    assert.equal(first.source, "Google Search Documentation Updates");
  }
});

test("5. Status Dashboard fetcher identifies active rollouts without end timestamp", async () => {
  const { fetchGoogleStatusDashboard } = await import("../lib/google-updates/monitor.ts");

  const incidents = await fetchGoogleStatusDashboard();
  assert.ok(Array.isArray(incidents), "Must return an array of incidents");
  if (incidents.length > 0) {
    const first = incidents[0];
    assert.ok(["ACTIVE", "COMPLETED", "INVESTIGATING", "RESOLVED"].includes(first.externalStatus));
    assert.ok(first.title);
    assert.ok(first.sourceUrl);
  }
});

test("6. Real monitor run telemetry replaces fake lastSyncAt timestamp in getIntegrationStatuses", async () => {
  const googleTsCode = fs.readFileSync(path.join(appRoot, "lib/integrations/google.ts"), "utf8");

  // Verify that fake lastSyncAt: new Date().toISOString() is NOT used in search_monitor status
  assert.ok(
    !googleTsCode.includes("service: \"search_monitor\",\n    name: \"Google Search Update Monitor\",\n    status: \"connected\",\n    propertyOrAccount: \"Daily Cron + Status Dashboard\",\n    lastSyncAt: new Date().toISOString()"),
    "Fake hardcoded lastSyncAt = new Date().toISOString() must not be present",
  );

  // Verify getLatestMonitorRun is referenced
  assert.ok(googleTsCode.includes("getLatestMonitorRun"), "getIntegrationStatuses must query getLatestMonitorRun");
});

test("7. Automated 3-hour workflow file exists with proper schedule and endpoint trigger", () => {
  const workflowPath = path.join(appRoot, ".github/workflows/google-search-monitor.yml");
  assert.ok(fs.existsSync(workflowPath), ".github/workflows/google-search-monitor.yml must exist");

  const content = fs.readFileSync(workflowPath, "utf8");
  assert.ok(content.includes("cron: '17 */3 * * *'"), "Must have 3-hour cron schedule (17 */3 * * *)");
  assert.ok(content.includes("/api/internal/google-updates/check"), "Must target internal check endpoint");
});

test("8. Secure internal endpoint exists and supports authentication token", () => {
  const endpointPath = path.join(appRoot, "app/api/internal/google-updates/check/route.ts");
  assert.ok(fs.existsSync(endpointPath), "app/api/internal/google-updates/check/route.ts must exist");

  const content = fs.readFileSync(endpointPath, "utf8");
  assert.ok(content.includes("Bearer "), "Must support Bearer token authentication");
  assert.ok(content.includes("checkAndRecordGoogleUpdates"), "Must call checkAndRecordGoogleUpdates");
});

test("9. Blog responsive layout tokens, header height, and no-crop hero image rules are established", () => {
  const globalsCss = fs.readFileSync(path.join(appRoot, "app/globals.css"), "utf8");
  assert.ok(globalsCss.includes("--dgs-site-header-height: 104px"), "--dgs-site-header-height must be defined in app/globals.css");

  const blogCss = fs.readFileSync(path.join(appRoot, "components/blog/Blog.module.css"), "utf8");
  assert.ok(blogCss.includes("var(--dgs-site-header-height"), "Blog.module.css must offset by --dgs-site-header-height");
  assert.ok(blogCss.includes(".heroImgNatural"), "Blog.module.css must define .heroImgNatural for uncropped hero images");

  const headerCss = fs.readFileSync(path.join(appRoot, "components/layout/Header.module.css"), "utf8");
  assert.ok(headerCss.includes("var(--dgs-site-header-height"), "Header.module.css must use --dgs-site-header-height");
  assert.ok(headerCss.includes("max-height: 64px"), "Logo must have responsive max-height constraint");
});

test("10. Database schema includes google_update_monitor_runs table and external_status columns", () => {
  const schemaSql = fs.readFileSync(path.join(appRoot, "db/schema.sql"), "utf8");
  assert.ok(schemaSql.includes("google_update_monitor_runs"), "db/schema.sql must define google_update_monitor_runs");
  assert.ok(schemaSql.includes("external_status VARCHAR"), "db/schema.sql must define external_status");
  assert.ok(schemaSql.includes("incident_begin DATETIME"), "db/schema.sql must define incident_begin");
  assert.ok(schemaSql.includes("idx_gsu_external_status"), "db/schema.sql must define idx_gsu_external_status index");
});
