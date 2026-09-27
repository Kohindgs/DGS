import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

console.log("=== RUNNING DGS CMS INTEGRITY V8.6.1 AUDIT TEST SUITE ===");

test("1. hasAdminSession no longer authenticates legacy cookie when DB auth is authoritative", () => {
  const authContent = fs.readFileSync(path.resolve("lib/cms/auth.ts"), "utf8");
  assert.ok(
    authContent.includes("isCmsDatabaseConfigured"),
    "FAIL: lib/cms/auth.ts must import and check isCmsDatabaseConfigured"
  );
  assert.ok(
    authContent.includes("if (!isCmsDatabaseConfigured()) {\n    return hasLegacyAdminSession();\n  }") ||
      authContent.includes("if (!isCmsDatabaseConfigured()) {\r\n    return hasLegacyAdminSession();\r\n  }"),
    "FAIL: lib/cms/auth.ts must only fall back to hasLegacyAdminSession() when DB is not configured"
  );
  assert.ok(
    authContent.includes("return false;"),
    "FAIL: lib/cms/auth.ts must fail-closed and return false when DB is configured and DB session is missing/invalid"
  );
});

test("2. Legacy dgs_admin_session cookie no longer created in normal production DB login", () => {
  const sessionRouteContent = fs.readFileSync(path.resolve("app/api/admin/session/route.ts"), "utf8");
  assert.ok(
    !sessionRouteContent.includes("createAdminSessionToken("),
    "FAIL: app/api/admin/session/route.ts still calls createAdminSessionToken on login!"
  );
  const postFunction = sessionRouteContent.substring(
    sessionRouteContent.indexOf("export async function POST"),
    sessionRouteContent.indexOf("export async function GET")
  );
  assert.ok(
    !postFunction.includes("response.cookies.set(adminSessionCookie.name"),
    "FAIL: POST login handler still sets legacy adminSessionCookie!"
  );
  assert.ok(
    postFunction.includes("response.cookies.set(cmsSessionCookieConfig.name"),
    "FAIL: POST login handler must set authoritative cmsSessionCookieConfig token"
  );
});

test("3. Inactive user cannot authenticate using old legacy session", () => {
  const authDbContent = fs.readFileSync(path.resolve("lib/cms/auth-db.ts"), "utf8");
  assert.ok(
    authDbContent.includes("WHERE id = ? AND is_active = 1"),
    "FAIL: lib/cms/auth-db.ts must filter session user by is_active = 1 on every request"
  );

  const authContent = fs.readFileSync(path.resolve("lib/cms/auth.ts"), "utf8");
  assert.ok(
    authContent.includes("dbUser.is_active === 1 || dbUser.is_active === true"),
    "FAIL: lib/cms/auth.ts must explicitly verify active status"
  );
});

test("4. Inactive user cannot authenticate using env credentials", () => {
  const sessionRouteContent = fs.readFileSync(path.resolve("app/api/admin/session/route.ts"), "utf8");
  assert.ok(
    sessionRouteContent.includes("user.is_active !== 1") &&
      sessionRouteContent.includes("error=inactive"),
    "FAIL: Inactive user in session route must redirect to error=inactive before any fallback"
  );

  const authDbContent = fs.readFileSync(path.resolve("lib/cms/auth-db.ts"), "utf8");
  assert.ok(
    authDbContent.includes('session.user_id === "env-superadmin"') &&
      authDbContent.includes("return null;"),
    "FAIL: env-superadmin must be disallowed from production DB session authorization"
  );
});

test("5. Expired/deleted DB session rejected", () => {
  const authDbContent = fs.readFileSync(path.resolve("lib/cms/auth-db.ts"), "utf8");
  assert.ok(
    authDbContent.includes("expires_at > NOW()"),
    "FAIL: lib/cms/auth-db.ts must query expires_at > NOW() for sessions"
  );
  assert.ok(
    authDbContent.includes("if (!sessionRows || sessionRows.length === 0) {\n        return null;\n      }") ||
      authDbContent.includes("if (!sessionRows || sessionRows.length === 0) {\r\n        return null;\r\n      }"),
    "FAIL: lib/cms/auth-db.ts must return null when session row does not exist or has expired"
  );
});

test("6. Successful login resets lockout counters", () => {
  const sessionRouteContent = fs.readFileSync(path.resolve("app/api/admin/session/route.ts"), "utf8");
  assert.ok(
    sessionRouteContent.includes("failed_attempts = 0") &&
      sessionRouteContent.includes("locked_until = NULL"),
    "FAIL: Session route must reset failed_attempts = 0 and locked_until = NULL upon successful authentication"
  );
});

test("7. Overall health cannot be HEALTHY when core subsystem is STALE", () => {
  const systemHealthContent = fs.readFileSync(path.resolve("lib/cms/system-health.ts"), "utf8");
  assert.ok(
    systemHealthContent.includes("staleCount > 0"),
    "FAIL: lib/cms/system-health.ts must evaluate staleCount when determining overallStatus"
  );
  assert.ok(
    systemHealthContent.includes("failedCount > 0 || degradedCount > 0 || staleCount > 0 || unknownCount > 0"),
    "FAIL: overallStatus must be DEGRADED if staleCount > 0"
  );
});

test("8. Overall health cannot be HEALTHY when core subsystem is UNKNOWN", () => {
  const systemHealthContent = fs.readFileSync(path.resolve("lib/cms/system-health.ts"), "utf8");
  assert.ok(
    systemHealthContent.includes("unknownCount > 0"),
    "FAIL: lib/cms/system-health.ts must evaluate unknownCount when determining overallStatus"
  );
});

test("9. Scheduler with no heartbeat is UNKNOWN, not HEALTHY", () => {
  const systemHealthContent = fs.readFileSync(path.resolve("lib/cms/system-health.ts"), "utf8");
  assert.ok(
    systemHealthContent.includes("if (!lastSchedulerRun)") &&
      systemHealthContent.includes('status: "UNKNOWN"') &&
      systemHealthContent.includes("No scheduler execution evidence recorded in telemetry"),
    "FAIL: blog_scheduler must report UNKNOWN when no scheduler execution heartbeat exists"
  );
});

test("10. Scheduler with overdue posts is DEGRADED", () => {
  const systemHealthContent = fs.readFileSync(path.resolve("lib/cms/system-health.ts"), "utf8");
  assert.ok(
    systemHealthContent.includes("overduePosts > 0") &&
      systemHealthContent.includes('status: "DEGRADED"'),
    "FAIL: blog_scheduler must report DEGRADED when overdue posts are found"
  );
});

test("11. Scheduler with recent successful heartbeat is HEALTHY", () => {
  const systemHealthContent = fs.readFileSync(path.resolve("lib/cms/system-health.ts"), "utf8");
  assert.ok(
    systemHealthContent.includes("schedulerAgeHours > 2") &&
      systemHealthContent.includes('status: "STALE"'),
    "FAIL: blog_scheduler must report STALE when heartbeat is > 2h old"
  );
  assert.ok(
    systemHealthContent.includes('status: "HEALTHY"') &&
      systemHealthContent.includes("Active scheduler worker"),
    "FAIL: blog_scheduler must report HEALTHY when heartbeat is recent and overdue posts is 0"
  );
});

test("12. Native forms health reads authoritative registry", () => {
  const systemHealthContent = fs.readFileSync(path.resolve("lib/cms/system-health.ts"), "utf8");
  assert.ok(
    systemHealthContent.includes('import { listApprovedForms } from "../forms/registry";') ||
      systemHealthContent.includes("listApprovedForms()"),
    "FAIL: lib/cms/system-health.ts must dynamically import and call listApprovedForms()"
  );
});

test("13. Native forms health does not hardcode form ID list", () => {
  const systemHealthContent = fs.readFileSync(path.resolve("lib/cms/system-health.ts"), "utf8");
  assert.ok(
    !systemHealthContent.includes("const approvedForms = [1, 3, 4, 6"),
    "FAIL: lib/cms/system-health.ts still contains hardcoded form IDs array!"
  );
  assert.ok(
    systemHealthContent.includes("const approvedForms = listApprovedForms();"),
    "FAIL: lib/cms/system-health.ts must assign approvedForms from listApprovedForms()"
  );
});

test("14. Form 18 remains LEGACY / UNMIGRATED", () => {
  const systemHealthContent = fs.readFileSync(path.resolve("lib/cms/system-health.ts"), "utf8");
  assert.ok(
    systemHealthContent.includes("Form 18 on /seo-pricing/ is LEGACY / UNMIGRATED") ||
      systemHealthContent.includes("Form 18 (/seo-pricing/) is LEGACY / UNMIGRATED"),
    "FAIL: Form 18 on /seo-pricing/ must be documented as LEGACY / UNMIGRATED in system health metrics"
  );
});

test("15. Failed forms-health verification cannot return HEALTHY", () => {
  const systemHealthContent = fs.readFileSync(path.resolve("lib/cms/system-health.ts"), "utf8");
  assert.ok(
    systemHealthContent.includes("subsystems.native_forms.status === \"FAILED\"") &&
      systemHealthContent.includes('overallStatus = "CRITICAL"'),
    "FAIL: When native_forms fails, overallStatus must be CRITICAL"
  );
});

test("16. No completed site audit means no page/issue query against latest failed/running audit", () => {
  const pageContent = fs.readFileSync(path.resolve("app/admin/site-audits/page.tsx"), "utf8");
  assert.ok(
    pageContent.includes("latestAudit = latestCompleted || null;"),
    "FAIL: page.tsx must only assign latestAudit from latestCompleted, never latestRun"
  );
  assert.ok(
    !pageContent.includes("latestAudit = latestCompleted || latestRun || null;"),
    "FAIL: page.tsx must not fall back to latestRun for page/issue queries"
  );
  assert.ok(
    pageContent.includes("if (latestCompleted) {"),
    "FAIL: page.tsx must guard pages and issues query with if (latestCompleted)"
  );
});

test("17. Latest completed audit remains authoritative when newer failed run exists", () => {
  const systemHealthContent = fs.readFileSync(path.resolve("lib/cms/system-health.ts"), "utf8");
  assert.ok(
    systemHealthContent.includes("isRunFailed = latestRun && latestRun.status === \"failed\"") &&
      systemHealthContent.includes('status: "DEGRADED"'),
    "FAIL: site_audit_worker must report DEGRADED when newest run failed after last completed"
  );
  assert.ok(
    systemHealthContent.includes("lastCompletedId: latestCompleted.id"),
    "FAIL: site_audit_worker must keep reference to authoritative latestCompleted run"
  );
});

test("18. SMTP stale success does not remain permanently HEALTHY", () => {
  const systemHealthContent = fs.readFileSync(path.resolve("lib/cms/system-health.ts"), "utf8");
  assert.ok(
    systemHealthContent.includes("daysSinceDelivery > 30") &&
      systemHealthContent.includes('status: "STALE"'),
    "FAIL: SMTP dispatcher must transition to STALE if last verified delivery was > 30 days ago"
  );
});

test("19. Gemini health requires specific successful Gemini evidence", () => {
  const systemHealthContent = fs.readFileSync(path.resolve("lib/cms/system-health.ts"), "utf8");
  assert.ok(
    systemHealthContent.includes("action IN ('assessment.generate', 'assessment.regenerate_question', 'gemini.test_connection', 'gemini.generate')"),
    "FAIL: Gemini health check must inspect cms_audit_log for specific Gemini operations"
  );
  assert.ok(
    systemHealthContent.includes("assessment_versions"),
    "FAIL: Gemini health check must cross-reference assessment_versions table for generation telemetry"
  );
  assert.ok(
    systemHealthContent.includes('status: "CONFIGURED"') &&
      systemHealthContent.includes("no runtime execution logged yet"),
    "FAIL: Gemini health must report CONFIGURED (not HEALTHY) when no runtime execution has occurred"
  );
});

test("20. Health endpoint exposes no secrets", () => {
  const systemHealthContent = fs.readFileSync(path.resolve("lib/cms/system-health.ts"), "utf8");
  assert.ok(!systemHealthContent.includes("password:"), "system-health must not output passwords");
  assert.ok(!systemHealthContent.includes("api_key:"), "system-health must not output API keys");
  assert.ok(!systemHealthContent.includes("client_secret:"), "system-health must not output client secrets");
  assert.ok(!systemHealthContent.includes("refresh_token:"), "system-health must not output refresh tokens");
});

test("21. Existing Blog RBAC remains correct", () => {
  const blogsRoute = fs.readFileSync(path.resolve("app/api/admin/blogs/route.ts"), "utf8");
  assert.ok(blogsRoute.includes("hasPermission(currentUser.role, \"blogs\", \"view\")"), "Missing blogs:view RBAC");
  assert.ok(blogsRoute.includes("hasPermission(currentUser.role, \"blogs\", \"create\")"), "Missing blogs:create RBAC");

  const blogIdRoute = fs.readFileSync(path.resolve("app/api/admin/blogs/[id]/route.ts"), "utf8");
  assert.ok(blogIdRoute.includes("hasPermission(currentUser.role, \"blogs\", \"edit\")"), "Missing blogs:edit RBAC");
  assert.ok(blogIdRoute.includes("hasPermission(currentUser.role, \"blogs\", \"delete\")"), "Missing blogs:delete RBAC");

  const blogPublishRoute = fs.readFileSync(path.resolve("app/api/admin/blogs/[id]/publish/route.ts"), "utf8");
  assert.ok(blogPublishRoute.includes("hasPermission(currentUser.role, \"blogs\", \"publish\")"), "Missing blogs:publish RBAC");
});

test("22. Existing Media RBAC remains correct", () => {
  const mediaIdRoute = fs.readFileSync(path.resolve("app/api/admin/media/[id]/route.ts"), "utf8");
  assert.ok(mediaIdRoute.includes("hasPermission(currentUser.role, \"media\", \"view\")"), "Missing media:view RBAC");
  assert.ok(mediaIdRoute.includes("hasPermission(currentUser.role, \"media\", \"edit\")"), "Missing media:edit RBAC");
  assert.ok(mediaIdRoute.includes("hasPermission(currentUser.role, \"media\", \"delete\")"), "Missing media:delete RBAC");
});

test("23. Existing Leads RBAC remains correct", () => {
  const leadsIdRoute = fs.readFileSync(path.resolve("app/api/admin/leads/[id]/route.ts"), "utf8");
  assert.ok(leadsIdRoute.includes("hasPermission(currentUser.role, \"leads\", \"manage\")"), "Missing leads:manage RBAC");
});

test("24. Google Update review/manage RBAC remains correct", () => {
  const checkRoute = fs.readFileSync(path.resolve("app/api/admin/google-updates/check/route.ts"), "utf8");
  assert.ok(
    checkRoute.includes("\"google_updates\", \"review\"") && checkRoute.includes("\"google_updates\", \"manage\""),
    "FAIL: Google updates check route must require review or manage permission"
  );
  assert.ok(
    !checkRoute.includes("\"google_updates\", \"view\""),
    "FAIL: Google updates check route must not allow plain view permission"
  );
});

console.log("=== ALL 24 CMS INTEGRITY V8.6.1 TEST DEFINITIONS LOADED ===");
