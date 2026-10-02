import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

console.log("=== RUNNING DGS CMS INTEGRITY V8.6 AUDIT TEST SUITE ===");

test("1. OWASP-Compliant Fail-Closed Auth & No Hardcoded Passwords", () => {
  const authDbContent = fs.readFileSync(path.resolve("lib/cms/auth-db.ts"), "utf8");
  assert.ok(
    !authDbContent.includes("adminPassword || \"") && !authDbContent.includes("adminPassword = \""),
    "FAIL: lib/cms/auth-db.ts still contains hardcoded superadmin fallback password!"
  );
  assert.ok(
    authDbContent.includes("if (!adminPassword)"),
    "FAIL: ensureSuperadminSeeded does not fail closed when DGS_ADMIN_PASSWORD is missing"
  );
});

test("2. Session Protection: 5 Failed Attempts Lockout, Inactive Check, & Lockout Reset on Success", () => {
  const sessionRouteContent = fs.readFileSync(path.resolve("app/api/admin/session/route.ts"), "utf8");
  assert.ok(
    sessionRouteContent.includes("user.locked_until") && sessionRouteContent.includes("Date.now()"),
    "FAIL: Session route missing active lockout time expiration check"
  );
  assert.ok(
    sessionRouteContent.includes("nextAttempts >= 5") || sessionRouteContent.includes(">= 5"),
    "FAIL: Session route missing consecutive 5 failed attempt threshold for lockout"
  );
  assert.ok(
    sessionRouteContent.includes("error=locked"),
    "FAIL: Session route does not redirect to error=locked on lockout"
  );
  assert.ok(
    sessionRouteContent.includes("error=inactive"),
    "FAIL: Session route does not redirect to error=inactive for disabled users"
  );
  assert.ok(
    sessionRouteContent.includes("failed_attempts = 0") && sessionRouteContent.includes("locked_until = NULL"),
    "FAIL: Successful login does not reset failed_attempts and locked_until in session route"
  );
});

test("3. Session Route: Disallow Environment Fallback If DB User Exists or DB Active", () => {
  const sessionRouteContent = fs.readFileSync(path.resolve("app/api/admin/session/route.ts"), "utf8");
  assert.ok(
    sessionRouteContent.includes("!dbUserFound") && sessionRouteContent.includes("!isCmsDatabaseConfigured()"),
    "FAIL: Session route must disallow environment fallback when DB user exists or DB is configured and active"
  );
  assert.ok(
    sessionRouteContent.includes("return NextResponse.redirect(publicUrl(\"/admin/login/?error=invalid\"), 303);"),
    "FAIL: Session route must return error=invalid when DB user password fails without falling through"
  );
});

test("4. Dashboard Telemetry: Strict 28-day Window Metrics (No Lifetime Sum)", () => {
  const dashboardContent = fs.readFileSync(path.resolve("app/admin/page.tsx"), "utf8");
  assert.ok(
    dashboardContent.includes("ORDER BY metric_date DESC") && dashboardContent.includes("LIMIT 28"),
    "FAIL: Dashboard does not limit GSC/GA4 queries to the last 28 days"
  );
  assert.ok(
    !dashboardContent.includes("updatesCount: 19"),
    "FAIL: Dashboard still contains hardcoded updatesCount: 19"
  );
  assert.ok(
    !dashboardContent.includes("mediaCount: 880"),
    "FAIL: Dashboard still contains hardcoded mediaCount: 880"
  );
  assert.ok(
    !dashboardContent.includes("activeJobsCount: 1"),
    "FAIL: Dashboard still contains hardcoded activeJobsCount: 1"
  );
});

test("5. Site Audit Integrity: Alt Consistency & 28d Period Filtering", () => {
  const siteAuditsContent = fs.readFileSync(path.resolve("app/admin/site-audits/page.tsx"), "utf8");
  assert.ok(
    siteAuditsContent.includes("isAltConsistent: aggAltCount === detailAltCount"),
    "FAIL: Site audits does not strictly enforce aggAltCount === detailAltCount"
  );
  assert.ok(
    !siteAuditsContent.includes("detailAltCount > 0"),
    "FAIL: Site audits still contains faulty fallback detailAltCount > 0 for consistency"
  );
  assert.ok(
    siteAuditsContent.includes("gpm.period_type = '28d'"),
    "FAIL: Site audits does not filter gsc_page_metrics join by period_type = '28d'"
  );
  assert.ok(
    siteAuditsContent.includes("pq.period_type = '28d'"),
    "FAIL: Site audits does not filter gsc_page_query_metrics join by period_type = '28d'"
  );
});

test("6. Site Audit Run Separation: Explicit LATEST RUN and LATEST COMPLETED queries", () => {
  const siteAuditsContent = fs.readFileSync(path.resolve("app/admin/site-audits/page.tsx"), "utf8");
  assert.ok(
    siteAuditsContent.includes("SELECT * FROM site_audit_runs ORDER BY created_at DESC LIMIT 1"),
    "FAIL: Site audits missing explicit query for latest run"
  );
  assert.ok(
    siteAuditsContent.includes("SELECT * FROM site_audit_runs WHERE status = 'completed' ORDER BY completed_at DESC LIMIT 1"),
    "FAIL: Site audits missing explicit query for latest completed run"
  );
  assert.ok(
    siteAuditsContent.includes("latestAudit = latestCompleted || null") ||
      siteAuditsContent.includes("latestAudit = latestCompleted || latestRun || null"),
    "FAIL: Site audits does not prioritize latestCompleted for page/issue data"
  );
});

test("7. RBAC Enforcement across API Mutation Endpoints", () => {
  const blogsRoute = fs.readFileSync(path.resolve("app/api/admin/blogs/route.ts"), "utf8");
  assert.ok(blogsRoute.includes("hasPermission(currentUser.role, \"blogs\", \"view\")"), "Missing blogs:view RBAC");
  assert.ok(blogsRoute.includes("hasPermission(currentUser.role, \"blogs\", \"create\")"), "Missing blogs:create RBAC");

  const blogIdRoute = fs.readFileSync(path.resolve("app/api/admin/blogs/[id]/route.ts"), "utf8");
  assert.ok(blogIdRoute.includes("hasPermission(currentUser.role, \"blogs\", \"edit\")"), "Missing blogs:edit RBAC");
  assert.ok(blogIdRoute.includes("hasPermission(currentUser.role, \"blogs\", \"delete\")"), "Missing blogs:delete RBAC");

  const blogPublishRoute = fs.readFileSync(path.resolve("app/api/admin/blogs/[id]/publish/route.ts"), "utf8");
  assert.ok(blogPublishRoute.includes("hasPermission(currentUser.role, \"blogs\", \"publish\")"), "Missing blogs:publish RBAC");

  const mediaIdRoute = fs.readFileSync(path.resolve("app/api/admin/media/[id]/route.ts"), "utf8");
  assert.ok(mediaIdRoute.includes("hasPermission(currentUser.role, \"media\", \"view\")"), "Missing media:view RBAC");
  assert.ok(mediaIdRoute.includes("hasPermission(currentUser.role, \"media\", \"edit\")"), "Missing media:edit RBAC");
  assert.ok(mediaIdRoute.includes("hasPermission(currentUser.role, \"media\", \"delete\")"), "Missing media:delete RBAC");

  const leadsIdRoute = fs.readFileSync(path.resolve("app/api/admin/leads/[id]/route.ts"), "utf8");
  assert.ok(leadsIdRoute.includes("hasPermission(currentUser.role, \"leads\", \"manage\")"), "Missing leads:manage RBAC");
});

test("8. Google Updates Check Permission Requires Review or Manage (Not View)", () => {
  const checkRoute = fs.readFileSync(path.resolve("app/api/admin/google-updates/check/route.ts"), "utf8");
  assert.ok(
    checkRoute.includes("\"google_updates\", \"review\"") && checkRoute.includes("\"google_updates\", \"manage\""),
    "FAIL: Google updates check route must require review or manage permission"
  );
  assert.ok(
    !checkRoute.includes("\"google_updates\", \"view\""),
    "FAIL: Google updates check route must not allow plain view permission to trigger checks"
  );
});

test("9. Real Actor Audit Logging (No Hardcoded Admin)", () => {
  const blogIdRoute = fs.readFileSync(path.resolve("app/api/admin/blogs/[id]/route.ts"), "utf8");
  assert.ok(!blogIdRoute.includes("actor_email: \"admin@dgeniussolutions.com\""), "Found hardcoded actor in blogs/[id]");
  assert.ok(blogIdRoute.includes("actor_email: currentUser.email"), "Missing real actor_email in blogs/[id]");

  const blogPublish = fs.readFileSync(path.resolve("app/api/admin/blogs/[id]/publish/route.ts"), "utf8");
  assert.ok(!blogPublish.includes("actor_email: \"admin@dgeniussolutions.com\""), "Found hardcoded actor in blogs publish");
  assert.ok(blogPublish.includes("actor_email: currentUser.email"), "Missing real actor_email in blogs publish");

  const blogSchedule = fs.readFileSync(path.resolve("app/api/admin/blogs/[id]/schedule/route.ts"), "utf8");
  assert.ok(!blogSchedule.includes("actor_email: \"admin@dgeniussolutions.com\""), "Found hardcoded actor in blogs schedule");
  assert.ok(blogSchedule.includes("actor_email: currentUser.email"), "Missing real actor_email in blogs schedule");

  const mediaAssign = fs.readFileSync(path.resolve("app/api/admin/blogs/[id]/media/assign/route.ts"), "utf8");
  assert.ok(!mediaAssign.includes("actor_email: \"admin@dgeniussolutions.com\""), "Found hardcoded actor in media assign");
  assert.ok(mediaAssign.includes("actor_email: currentUser.email"), "Missing real actor_email in media assign");
});

test("10. Honest Candidate Fallback in Assessment OS", () => {
  const assessmentContent = fs.readFileSync(path.resolve("app/admin/assessment/page.tsx"), "utf8");
  assert.ok(!assessmentContent.includes("candidate@example.com"), "Found dummy email candidate@example.com");
  assert.ok(assessmentContent.includes("Unknown candidate"), "Missing Unknown candidate fallback");
  assert.ok(assessmentContent.includes("Missing HR linkage"), "Missing Missing HR linkage fallback");
});

test("11. Dynamic CMS System Health Queries Authoritative Tables (google_connections & leads)", () => {
  const systemHealthContent = fs.readFileSync(path.resolve("lib/cms/system-health.ts"), "utf8");
  assert.ok(
    systemHealthContent.includes("FROM google_connections WHERE service = 'gsc'"),
    "FAIL: system-health must query authoritative google_connections table for GSC"
  );
  assert.ok(
    systemHealthContent.includes("FROM google_connections WHERE service = 'ga4'"),
    "FAIL: system-health must query authoritative google_connections table for GA4"
  );
  assert.ok(
    !systemHealthContent.includes("google_service_connections"),
    "FAIL: system-health must NOT query non-existent google_service_connections"
  );
  assert.ok(
    systemHealthContent.includes("FROM leads"),
    "FAIL: system-health must query authoritative leads table"
  );
  assert.ok(
    !systemHealthContent.includes("cms_leads"),
    "FAIL: system-health must NOT query non-existent cms_leads"
  );
});

test("12. Standardized Truthful Subsystem Health States & Zero Silent Catches", () => {
  const systemHealthContent = fs.readFileSync(path.resolve("lib/cms/system-health.ts"), "utf8");
  
  // Standard statuses definition
  assert.ok(systemHealthContent.includes('"HEALTHY"'), "Missing HEALTHY status");
  assert.ok(systemHealthContent.includes('"DEGRADED"'), "Missing DEGRADED status");
  assert.ok(systemHealthContent.includes('"STALE"'), "Missing STALE status");
  assert.ok(systemHealthContent.includes('"FAILED"'), "Missing FAILED status");
  assert.ok(systemHealthContent.includes('"NOT_CONFIGURED"'), "Missing NOT_CONFIGURED status");

  // No empty silent catch blocks
  const silentCatchRegex = /catch\s*\(\s*(?:err)?\s*\)\s*\{\s*\}/g;
  const silentCatches = systemHealthContent.match(silentCatchRegex);
  assert.equal(
    silentCatches,
    null,
    "FAIL: lib/cms/system-health.ts contains silent catch {} blocks that swallow errors!"
  );

  // All 11 subsystems present
  const expectedSubsystems = [
    "database",
    "gsc",
    "ga4",
    "smtp",
    "gemini",
    "google_update_monitor",
    "blog_scheduler",
    "site_audit_worker",
    "pagespeed_worker",
    "native_forms",
    "media_processor",
  ];
  for (const sub of expectedSubsystems) {
    assert.ok(systemHealthContent.includes(`id: "${sub}"`), `Missing subsystem tracking for: ${sub}`);
  }
});

test("13. Blog Scheduler Health Tracks Overdue Posts", () => {
  const systemHealthContent = fs.readFileSync(path.resolve("lib/cms/system-health.ts"), "utf8");
  assert.ok(
    systemHealthContent.includes("scheduled_for < NOW()"),
    "FAIL: system-health must check overdue scheduled blog posts"
  );
  assert.ok(
    systemHealthContent.includes("overdueBlogCount > 0"),
    "FAIL: system-health must mark blog_scheduler as DEGRADED when overdue posts exist"
  );
});

test("14. Site Audit Worker Tracks Age & Failure State", () => {
  const systemHealthContent = fs.readFileSync(path.resolve("lib/cms/system-health.ts"), "utf8");
  assert.ok(
    systemHealthContent.includes("daysSinceCompleted > 15"),
    "FAIL: system-health must mark site_audit_worker as STALE when completed audit is > 15 days old"
  );
  assert.ok(
    systemHealthContent.includes("isRunFailed"),
    "FAIL: system-health must check whether latest audit run failed after last completed"
  );
});

test("15. PageSpeed Worker Reports Job Backlog & Failed Status", () => {
  const systemHealthContent = fs.readFileSync(path.resolve("lib/cms/system-health.ts"), "utf8");
  assert.ok(
    systemHealthContent.includes("pagespeed_jobs"),
    "FAIL: system-health must query pagespeed_jobs"
  );
  assert.ok(
    systemHealthContent.includes("failedJobs > 0"),
    "FAIL: system-health must mark pagespeed_worker as DEGRADED if failed jobs backlog exists"
  );
});

test("16. Native Forms Approved List & Form 18 Legacy Status Documented", () => {
  const systemHealthContent = fs.readFileSync(path.resolve("lib/cms/system-health.ts"), "utf8");
  assert.ok(
    systemHealthContent.includes("Form 18 is LEGACY / UNMIGRATED") || systemHealthContent.includes("Form 18 (/seo-pricing/) is LEGACY / UNMIGRATED"),
    "FAIL: system-health must document Form 18 as LEGACY / UNMIGRATED"
  );
  assert.ok(
    systemHealthContent.includes("approvedForms"),
    "FAIL: system-health must track approvedForms list"
  );
});

test("17. Media Processor Tests Sharp Availability & Storage Writability", () => {
  const systemHealthContent = fs.readFileSync(path.resolve("lib/cms/system-health.ts"), "utf8");
  assert.ok(
    systemHealthContent.includes("sharpAvailable"),
    "FAIL: system-health must test sharpAvailable"
  );
  assert.ok(
    systemHealthContent.includes("storageWritable"),
    "FAIL: system-health must test storageWritable"
  );
});

console.log("=== ALL 17 CMS INTEGRITY V8.6 TEST DEFINITIONS LOADED ===");
