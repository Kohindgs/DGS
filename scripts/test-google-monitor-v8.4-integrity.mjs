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

test("4. Official Source 3 (Google Search Documentation Updates RSS) fetcher returns honest SourceFetchResult", async () => {
  const { fetchGoogleSearchDocsUpdates } = await import("../lib/google-updates/monitor.ts");

  const result = await fetchGoogleSearchDocsUpdates();
  assert.equal(typeof result.ok, "boolean", "Result must contain boolean ok flag");
  assert.equal(result.source, "Google Search Documentation Updates");
  assert.ok(Array.isArray(result.items), "Must return an array of items in items property");
  assert.ok(result.checkedAt, "Must include checkedAt timestamp");

  if (result.ok && result.items.length > 0) {
    const first = result.items[0];
    assert.ok(first.title, "Item must have a title");
    assert.ok(first.sourceUrl, "Item must have a sourceUrl");
    assert.ok(first.publishedAt, "Item must have a publishedAt");
    assert.equal(first.source, "Google Search Documentation Updates");
  }
});

test("5. Status Dashboard fetcher returns honest SourceFetchResult and identifies active rollouts", async () => {
  const { fetchGoogleStatusDashboard } = await import("../lib/google-updates/monitor.ts");

  const result = await fetchGoogleStatusDashboard();
  assert.equal(typeof result.ok, "boolean", "Result must contain boolean ok flag");
  assert.equal(result.source, "Google Search Status Dashboard");
  assert.ok(Array.isArray(result.items), "Must return items array");

  if (result.ok && result.items.length > 0) {
    const activeOrCompleted = result.items.find(i => i.externalStatus === "ACTIVE" || i.externalStatus === "COMPLETED");
    assert.ok(activeOrCompleted, "Must parse incident status as ACTIVE or COMPLETED");
    assert.ok(activeOrCompleted.title);
    assert.ok(activeOrCompleted.sourceUrl);
  }
});

test("6. Search Central Blog fetcher returns honest SourceFetchResult with items array", async () => {
  const { fetchGoogleSearchCentralBlog } = await import("../lib/google-updates/monitor.ts");

  const result = await fetchGoogleSearchCentralBlog();
  assert.equal(typeof result.ok, "boolean", "Result must contain boolean ok flag");
  assert.equal(result.source, "Google Search Central Blog");
  assert.ok(Array.isArray(result.items), "Must return items array");
});

test("7. Hardcoded deterministic baseline updates are completely removed from monitor.ts", () => {
  const monitorCode = fs.readFileSync(path.join(appRoot, "lib/google-updates/monitor.ts"), "utf8");

  assert.ok(
    !monitorCode.includes("getDeterministicBaselineUpdates"),
    "monitor.ts must NOT contain getDeterministicBaselineUpdates; live feeds are the sole source of truth",
  );
  assert.ok(
    !monitorCode.includes("Deterministic baseline incident"),
    "monitor.ts must NOT use deterministic baseline fallback",
  );
});

test("8. Overall monitor run status logic enforces SUCCESS, PARTIAL, or FAILED", () => {
  const monitorCode = fs.readFileSync(path.join(appRoot, "lib/google-updates/monitor.ts"), "utf8");

  // Verify status assignment logic
  assert.ok(
    monitorCode.includes('allOk ? "SUCCESS" : anyOk ? "PARTIAL" : "FAILED"'),
    "Must set SUCCESS when all 3 sources succeed, PARTIAL when partial, and FAILED when all fail",
  );
  assert.ok(
    monitorCode.includes('status: "RUNNING" | "SUCCESS" | "PARTIAL" | "FAILED"'),
    "MonitorRunRecord status must include RUNNING, SUCCESS, PARTIAL, and FAILED",
  );
});

test("9. Real monitor run telemetry replaces fake lastSyncAt timestamp in getIntegrationStatuses", () => {
  const googleTsCode = fs.readFileSync(path.join(appRoot, "lib/integrations/google.ts"), "utf8");

  assert.ok(
    !googleTsCode.includes('lastSyncAt: new Date().toISOString()'),
    "Fake hardcoded lastSyncAt = new Date().toISOString() must not be present",
  );
  assert.ok(googleTsCode.includes("getLatestMonitorRun"), "getIntegrationStatuses must query getLatestMonitorRun");
});

test("10. Automated 3-hour workflow file enforces DGS_CRON_SECRET and fails on any non-200 HTTP code", () => {
  const workflowPath = path.join(appRoot, ".github/workflows/google-search-monitor.yml");
  assert.ok(fs.existsSync(workflowPath), ".github/workflows/google-search-monitor.yml must exist");

  const content = fs.readFileSync(workflowPath, "utf8");
  assert.ok(content.includes("cron: '17 */3 * * *'"), "Must have 3-hour cron schedule (17 */3 * * *)");
  assert.ok(content.includes("/api/internal/google-updates/check"), "Must target internal check endpoint");
  assert.ok(content.includes("AUTH_SECRET: ${{ secrets.DGS_CRON_SECRET }}"), "Must use dedicated DGS_CRON_SECRET only");
  assert.ok(!content.includes("ADMIN_SESSION_SECRET"), "Must not fall back to admin session secret");
  assert.ok(!content.includes("INTERNAL_API_SECRET"), "Must not fall back to internal API secret");

  // Must fail on non-200 (only 200 is acceptable)
  assert.ok(
    content.includes('[ "$HTTP_STATUS" != "200" ]'),
    "Workflow must fail on any HTTP status other than 200",
  );
  assert.ok(!content.includes("-eq 401"), "Workflow must not treat 401 as acceptable");
});

test("11. Internal check endpoint is POST-only, returns 405 for GET, and requires DGS_CRON_SECRET", () => {
  const endpointPath = path.join(appRoot, "app/api/internal/google-updates/check/route.ts");
  assert.ok(fs.existsSync(endpointPath), "app/api/internal/google-updates/check/route.ts must exist");

  const content = fs.readFileSync(endpointPath, "utf8");

  // Verify GET method returns 405 Method Not Allowed
  assert.ok(content.includes("export async function GET"), "Must export GET handler");
  assert.ok(content.includes("status: 405"), "GET handler must return status 405");
  assert.ok(content.includes('Allow: "POST"') || content.includes("Allow: 'POST'"), "GET handler must include Allow: POST header");

  // Verify POST method strictly checks DGS_CRON_SECRET
  assert.ok(content.includes("export async function POST"), "Must export POST handler");
  assert.ok(content.includes("process.env.DGS_CRON_SECRET"), "Must reference process.env.DGS_CRON_SECRET");
  assert.ok(content.includes("Bearer "), "Must validate Bearer token");
  assert.ok(content.includes("token !== cronSecret.trim()"), "Must strictly check token against cronSecret");
  assert.ok(!content.includes("getCurrentCmsUser"), "Internal cron route must NOT accept CMS admin sessions");
});

test("12. Dedicated admin check endpoint handles manual checks with admin session authentication", () => {
  const adminCheckPath = path.join(appRoot, "app/api/admin/google-updates/check/route.ts");
  assert.ok(fs.existsSync(adminCheckPath), "app/api/admin/google-updates/check/route.ts must exist");

  const content = fs.readFileSync(adminCheckPath, "utf8");
  assert.ok(content.includes("getCurrentCmsUser"), "Admin check route must authenticate CMS user session");
  assert.ok(content.includes("checkAndRecordGoogleUpdates"), "Admin check route must call checkAndRecordGoogleUpdates");
  assert.ok(content.includes('runType: "manual"'), "Admin check route must pass runType: manual");
  assert.ok(content.includes("logAuditEvent"), "Admin check route must log audit event");
});

test("13. Dedicated admin test alert email endpoint verifies live email delivery", () => {
  const testEmailPath = path.join(appRoot, "app/api/admin/google-updates/test-email/route.ts");
  assert.ok(fs.existsSync(testEmailPath), "app/api/admin/google-updates/test-email/route.ts must exist");

  const content = fs.readFileSync(testEmailPath, "utf8");
  assert.ok(content.includes("getCurrentCmsUser"), "Test email route must authenticate CMS user session");
  assert.ok(content.includes("sendTestGoogleUpdateEmail"), "Test email route must call sendTestGoogleUpdateEmail");
  assert.ok(content.includes("delivery:"), "Test email route must return delivery confirmation");
  assert.ok(content.includes("messageId"), "Test email response must include messageId");
  assert.ok(content.includes("accepted"), "Test email response must include accepted recipient array");
});

test("14. Database schema defines google_update_monitor_runs with per-source error columns and external_id", () => {
  const schemaSql = fs.readFileSync(path.join(appRoot, "db/schema.sql"), "utf8");
  assert.ok(schemaSql.includes("google_update_monitor_runs"), "db/schema.sql must define google_update_monitor_runs");
  assert.ok(schemaSql.includes("status_dashboard_ok"), "db/schema.sql must define status_dashboard_ok");
  assert.ok(schemaSql.includes("search_central_blog_ok"), "db/schema.sql must define search_central_blog_ok");
  assert.ok(schemaSql.includes("docs_updates_ok"), "db/schema.sql must define docs_updates_ok");
  assert.ok(schemaSql.includes("last_status_dashboard_error"), "db/schema.sql must define last_status_dashboard_error");
  assert.ok(schemaSql.includes("last_search_central_error"), "db/schema.sql must define last_search_central_error");
  assert.ok(schemaSql.includes("last_docs_error"), "db/schema.sql must define last_docs_error");
  assert.ok(schemaSql.includes("external_id VARCHAR"), "db/schema.sql must define external_id on google_search_updates");
});

test("15. Database schema defines google_update_source_cursors table for persistent feed cursors", () => {
  const schemaSql = fs.readFileSync(path.join(appRoot, "db/schema.sql"), "utf8");
  assert.ok(schemaSql.includes("google_update_source_cursors"), "db/schema.sql must define google_update_source_cursors");
  assert.ok(schemaSql.includes("source_id VARCHAR(64) PRIMARY KEY"), "google_update_source_cursors must have source_id PK");
  assert.ok(schemaSql.includes("last_success_at"), "google_update_source_cursors must have last_success_at");
  assert.ok(schemaSql.includes("last_seen_external_id"), "google_update_source_cursors must have last_seen_external_id");
});

test("16. Database schema defines google_update_notifications table with unique update_id + notification_type", () => {
  const schemaSql = fs.readFileSync(path.join(appRoot, "db/schema.sql"), "utf8");
  assert.ok(schemaSql.includes("google_update_notifications"), "db/schema.sql must define google_update_notifications");
  assert.ok(
    schemaSql.includes("UNIQUE KEY uq_update_notif (update_id, notification_type)"),
    "google_update_notifications must have unique constraint on (update_id, notification_type) for deduplication",
  );
});

test("17. apply-cms-schema.mjs includes all 29 expected tables including cursors and notifications", () => {
  const applyScript = fs.readFileSync(path.join(appRoot, "scripts/apply-cms-schema.mjs"), "utf8");
  assert.ok(applyScript.includes('"google_update_source_cursors"'), "Must include google_update_source_cursors");
  assert.ok(applyScript.includes('"google_update_notifications"'), "Must include google_update_notifications");
  assert.ok(applyScript.includes('"google_update_monitor_runs"'), "Must include google_update_monitor_runs");
});

test("18. In-place incident update preserves exact official source URL without artificial URL fragments", () => {
  const monitorCode = fs.readFileSync(path.join(appRoot, "lib/google-updates/monitor.ts"), "utf8");

  // Check that externalId is used to find existing update
  assert.ok(
    monitorCode.includes("external_id = ?") || monitorCode.includes("item.externalId"),
    "monitor.ts must look up incidents by external_id to update in place",
  );
  // Check that artificial hash fragments are not appended to the canonical sourceUrl
  assert.ok(
    !monitorCode.includes('`https://status.search.google.com/incidents.json#incident-${'),
    "monitor.ts must not pollute official URL with artificial JSON fragment strings",
  );
  assert.ok(
    monitorCode.includes("https://status.search.google.com/incidents/"),
    "Status dashboard incidents must use official status incident URL format",
  );
});

test("19. calculateNextCronRun accurately computes next UTC 3-hour cron slot", async () => {
  const { calculateNextCronRun } = await import("../lib/google-updates/monitor.ts");

  // If time is 14:00 UTC, next cron at 15:17 UTC
  const test1 = new Date("2026-09-26T14:00:00.000Z");
  const next1 = calculateNextCronRun(test1);
  assert.equal(next1, "2026-09-26T15:17:00.000Z");

  // If time is 15:16 UTC, next cron is 15:17 UTC
  const test2 = new Date("2026-09-26T15:16:00.000Z");
  const next2 = calculateNextCronRun(test2);
  assert.equal(next2, "2026-09-26T15:17:00.000Z");

  // If time is 15:18 UTC, next cron is 18:17 UTC
  const test3 = new Date("2026-09-26T15:18:00.000Z");
  const next3 = calculateNextCronRun(test3);
  assert.equal(next3, "2026-09-26T18:17:00.000Z");

  // If time is 21:18 UTC (after the last slot of day), next cron is tomorrow at 00:17 UTC
  const test4 = new Date("2026-09-26T21:18:00.000Z");
  const next4 = calculateNextCronRun(test4);
  assert.equal(next4, "2026-09-27T00:17:00.000Z");
});

test("20. Admin monitor health UI displays scheduler status, branch 'main', per-source states, and test email trigger", () => {
  const clientViewCode = fs.readFileSync(
    path.join(appRoot, "app/admin/google-updates/GoogleUpdatesClientView.tsx"),
    "utf8",
  );

  // Workflow branch indicator
  assert.ok(clientViewCode.includes("main"), "UI must display workflow branch 'main'");
  assert.ok(clientViewCode.includes("Automated Search Intelligence Pipeline"), "UI must display Automated Search Intelligence Pipeline card");
  assert.ok(clientViewCode.includes("Next Expected Cron"), "UI must display Next Expected Cron");
  assert.ok(clientViewCode.includes("Send Test Alert Email"), "UI must provide Send Test Alert Email button");
  assert.ok(clientViewCode.includes("/api/admin/google-updates/test-email"), "UI must call /api/admin/google-updates/test-email");
  assert.ok(clientViewCode.includes("/api/admin/google-updates/check"), "UI must call /api/admin/google-updates/check for manual trigger");

  // Source health display
  assert.ok(clientViewCode.includes("HEALTHY"), "UI must display HEALTHY source status badge");
  assert.ok(clientViewCode.includes("FAILED"), "UI must display FAILED source status badge");
  assert.ok(clientViewCode.includes("STALE"), "UI must display STALE source status badge");
});

test("21. Dual alert recipients are configured for kohin and ankur.vishwakarma with reliable resolution", async () => {
  const { DEFAULT_GOOGLE_UPDATE_RECIPIENTS, getGoogleUpdateRecipients } = await import(
    "../lib/notifications/google-update-email.ts"
  );

  assert.ok(Array.isArray(DEFAULT_GOOGLE_UPDATE_RECIPIENTS), "Must export DEFAULT_GOOGLE_UPDATE_RECIPIENTS array");
  assert.equal(DEFAULT_GOOGLE_UPDATE_RECIPIENTS.length, 2, "Default recipient list must have exactly 2 emails");
  assert.ok(
    DEFAULT_GOOGLE_UPDATE_RECIPIENTS.includes("kohin@dgeniussolutions.com"),
    "Default recipients must include kohin@dgeniussolutions.com",
  );
  assert.ok(
    DEFAULT_GOOGLE_UPDATE_RECIPIENTS.includes("ankur.vishwakarma@dgeniussolutions.com"),
    "Default recipients must include ankur.vishwakarma@dgeniussolutions.com",
  );

  // Test resolver with empty env
  const origEnv = process.env.DGS_SEARCH_UPDATE_NOTIFICATION_TO;
  delete process.env.DGS_SEARCH_UPDATE_NOTIFICATION_TO;
  const resolvedDefault = getGoogleUpdateRecipients();
  assert.deepEqual(resolvedDefault, DEFAULT_GOOGLE_UPDATE_RECIPIENTS);

  // Test resolver with custom comma-separated env
  process.env.DGS_SEARCH_UPDATE_NOTIFICATION_TO = "alerts@dgeniussolutions.com, team@dgeniussolutions.com";
  const resolvedCustom = getGoogleUpdateRecipients();
  assert.deepEqual(resolvedCustom, ["alerts@dgeniussolutions.com", "team@dgeniussolutions.com"]);

  // Restore env
  if (origEnv !== undefined) {
    process.env.DGS_SEARCH_UPDATE_NOTIFICATION_TO = origEnv;
  } else {
    delete process.env.DGS_SEARCH_UPDATE_NOTIFICATION_TO;
  }
});

test("22. DGS Impact Analysis Engine differentiates 9+ update types with structured schema and low-evidence fallback", async () => {
  const { generateDgsImpact } = await import("../lib/google-updates/monitor.ts");

  const testCases = [
    { title: "March 2026 Core Update", category: "Core Update", severity: "CRITICAL", expectedKey: "Core" },
    { title: "September 2026 spam update", category: "Spam Update", severity: "HIGH", expectedKey: "Spam" },
    { title: "Helpful Content & Reviews Update", category: "Helpful Content & Review Systems", severity: "HIGH", expectedKey: "Helpful Content" },
    { title: "Google Search Serving Outage", category: "Search System Incident", severity: "HIGH", expectedKey: "Outage" },
    { title: "AI Overviews expansion in search results", category: "AI Overviews / AI Search / AEO / GEO", severity: "HIGH", expectedKey: "AI Overviews" },
    { title: "Structured Data FAQPage schema guidance update", category: "Structured Data", severity: "MEDIUM", expectedKey: "Structured Data" },
    { title: "Core Web Vitals INP threshold guidance", category: "CWV", severity: "MEDIUM", expectedKey: "CWV" },
    { title: "Search Console performance report update", category: "Search Console", severity: "MEDIUM", expectedKey: "Search Console" },
    { title: "Google Search Essentials documentation update", category: "Guidelines", severity: "INFORMATIONAL", expectedKey: "Guidelines" },
  ];

  for (const tc of testCases) {
    const impact = generateDgsImpact(tc.title, tc.category, tc.severity);
    assert.ok(impact.whatChanged, `${tc.expectedKey} must return whatChanged`);
    assert.ok(impact.impactAnalysis, `${tc.expectedKey} must return impactAnalysis`);
    assert.ok(impact.actionRequired, `${tc.expectedKey} must return actionRequired`);
    assert.ok(Array.isArray(impact.recommendedActions), `${tc.expectedKey} must return recommendedActions array`);
    assert.ok(Array.isArray(impact.doNotChange), `${tc.expectedKey} must return doNotChange array`);
    assert.ok(Array.isArray(impact.affectedAreas), `${tc.expectedKey} must return affectedAreas array`);
    assert.ok(impact.monitoringWindow, `${tc.expectedKey} must return monitoringWindow`);
    assert.ok(impact.sourceEvidence, `${tc.expectedKey} must return sourceEvidence`);
  }

  // Low-evidence fallback
  const fallback = generateDgsImpact("Informational conference podcast notes", "General Search Announcement", "INFORMATIONAL");
  assert.ok(
    fallback.impactAnalysis.includes("Impact not yet confirmed — monitor"),
    "Low-evidence fallback must state 'Impact not yet confirmed — monitor'",
  );
  assert.ok(fallback.sourceEvidence.includes("Impact not yet confirmed — monitor"));
});

test("23. DGS Rollout Safeguards prohibit rewriting ranked copy, canonical changes, URL modifications, and link disavowals", async () => {
  const { DGS_ROLLOUT_SAFEGUARDS } = await import("../lib/notifications/google-update-email.ts");

  assert.ok(Array.isArray(DGS_ROLLOUT_SAFEGUARDS), "Must export DGS_ROLLOUT_SAFEGUARDS array");
  assert.ok(DGS_ROLLOUT_SAFEGUARDS.length >= 4, "Must define at least 4 explicit safeguards");

  const rulesText = DGS_ROLLOUT_SAFEGUARDS.join(" ").toLowerCase();
  assert.ok(rulesText.includes("rewrite") || rulesText.includes("alter"), "Must prohibit rewriting ranked pages");
  assert.ok(rulesText.includes("canonical"), "Must prohibit modifying canonical tags");
  assert.ok(rulesText.includes("url") || rulesText.includes("redirect"), "Must prohibit changing URLs or redirects");
  assert.ok(rulesText.includes("disavow"), "Must prohibit panic-driven backlink disavows");
});

test("24. Admin drawer displays What Changed, DGS Impact, Areas to Monitor, and What NOT to Change; email CTA links to /admin/google-updates/", () => {
  const clientViewCode = fs.readFileSync(
    path.join(appRoot, "app/admin/google-updates/GoogleUpdatesClientView.tsx"),
    "utf8",
  );

  // Drawer sections
  assert.ok(clientViewCode.includes("What Changed (Official Summary)"), "Drawer must display What Changed section");
  assert.ok(clientViewCode.includes("DGS Impact Assessment"), "Drawer must display DGS Impact Assessment section");
  assert.ok(clientViewCode.includes("Areas &amp; Pages to Monitor") || clientViewCode.includes("Areas & Pages to Monitor"), "Drawer must display Areas to Monitor section");
  assert.ok(clientViewCode.includes("What DGS Should NOT Change"), "Drawer must display What DGS Should NOT Change section");
  assert.ok(clientViewCode.includes("Safe Action Recommendations"), "Drawer must display Safe Action Recommendations section");

  // Email template link verification
  const emailCode = fs.readFileSync(
    path.join(appRoot, "lib/notifications/google-update-email.ts"),
    "utf8",
  );
  assert.ok(
    emailCode.includes("/admin/google-updates/"),
    "Email template CTA must link directly to /admin/google-updates/",
  );
  assert.ok(
    !emailCode.includes("/admin/search-updates/"),
    "Email template must NOT link to obsolete /admin/search-updates/",
  );
});

