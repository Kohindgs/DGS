import assert from "node:assert/strict";
import test from "node:test";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

console.log("=== RUNNING DGS CMS INTEGRITY V8.6 TEST SUITE ===");

test("1. OWASP-Compliant Fail-Closed Auth & No Hardcoded Passwords", () => {
  const authDbContent = fs.readFileSync(path.resolve("lib/cms/auth-db.ts"), "utf8");
  assert.ok(
    !authDbContent.includes("DGS#Admin!27Kx9Qp4Mv8Ls"),
    "FAIL: lib/cms/auth-db.ts still contains hardcoded superadmin fallback password!"
  );
  assert.ok(
    authDbContent.includes("if (!adminPassword)"),
    "FAIL: ensureSuperadminSeeded does not fail closed when DGS_ADMIN_PASSWORD is missing"
  );
});

test("2. Session Protection: 5 Failed Attempts Account Lockout & Inactive Check", () => {
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
});

test("3. Dashboard Telemetry: Strict 28-day Window Metrics (No Lifetime Sum)", () => {
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

test("4. Site Audit Integrity: Alt Consistency & 28d Period Filtering", () => {
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

test("5. RBAC Enforcement across API Mutation Endpoints", () => {
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

test("6. Real Actor Audit Logging (No Hardcoded Admin)", () => {
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

test("7. Honest Candidate Fallback in Assessment OS", () => {
  const assessmentContent = fs.readFileSync(path.resolve("app/admin/assessment/page.tsx"), "utf8");
  assert.ok(!assessmentContent.includes("candidate@example.com"), "Found dummy email candidate@example.com");
  assert.ok(assessmentContent.includes("Unknown candidate"), "Missing Unknown candidate fallback");
  assert.ok(assessmentContent.includes("Missing HR linkage"), "Missing Missing HR linkage fallback");
});

test("8. Dynamic CMS System Health Service", () => {
  const healthContent = fs.readFileSync(path.resolve("app/api/admin/health/route.ts"), "utf8");
  assert.ok(!healthContent.includes("wordpressBridgeOrigin"), "Found deprecated wordpressBridgeOrigin in health endpoint");
  assert.ok(!healthContent.includes("media: \"partial\""), "Found obsolete media: partial in health endpoint");
  assert.ok(healthContent.includes("getCmsSystemHealth"), "Missing getCmsSystemHealth integration");

  const systemHealthService = fs.readFileSync(path.resolve("lib/cms/system-health.ts"), "utf8");
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
    assert.ok(systemHealthService.includes(`id: "${sub}"`), `Missing subsystem tracking for: ${sub}`);
  }
});

console.log("=== ALL TEST DEFINITIONS LOADED ===");
