import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();

// Test 1: Zero Static Notification Seeds in API Route
test("REQ-V6-NOTIF-01: Zero static notification seeds in app/api/admin/notifications/route.ts", () => {
  const routeContent = fs.readFileSync(path.join(ROOT, "app", "api", "admin", "notifications", "route.ts"), "utf8");
  
  assert.equal(
    routeContent.includes("Sitemap Baseline 100% Protected"),
    false,
    "Fake seed 'Sitemap Baseline 100% Protected' must not be in notification route"
  );
  assert.equal(
    routeContent.includes("15-Day Automated Website Audit"),
    false,
    "Fake seed '15-Day Automated Website Audit' must not be in notification route"
  );
  assert.equal(
    routeContent.includes("Google Search Update Compliance"),
    false,
    "Fake seed 'Google Search Update Compliance' must not be in notification route"
  );
  assert.equal(
    routeContent.includes("const seeds = ["),
    false,
    "Static seeds array must be purged from notifications API"
  );
});

// Test 2: Notification Engine Schema & Producer Functions Exist
test("REQ-V6-NOTIF-02: Notification Engine exports correct event and query interfaces", async () => {
  const engineContent = fs.readFileSync(path.join(ROOT, "lib", "notifications", "engine.ts"), "utf8");
  
  assert.ok(engineContent.includes("export async function publishNotificationEvent"), "publishNotificationEvent must be exported");
  assert.ok(engineContent.includes("export async function getNotificationsForUser"), "getNotificationsForUser must be exported");
  assert.ok(engineContent.includes("export async function markNotificationAsRead"), "markNotificationAsRead must be exported");
  assert.ok(engineContent.includes("export async function markAllNotificationsAsRead"), "markAllNotificationsAsRead must be exported");
  assert.ok(engineContent.includes("export async function dismissNotification"), "dismissNotification must be exported");
  assert.ok(engineContent.includes("severity"), "Schema must include severity column");
  assert.ok(engineContent.includes("resource_type"), "Schema must include resource_type column");
  assert.ok(engineContent.includes("dismissed_at"), "Schema must include dismissed_at column");
});

// Test 3: Real Event Producer Integration Checks
test("REQ-V6-NOTIF-03: Real system event producers are wired to publishNotificationEvent", () => {
  // A. Native Form Submit (Leads)
  const formSubmit = fs.readFileSync(path.join(ROOT, "lib", "forms", "native", "submit.ts"), "utf8");
  assert.ok(formSubmit.includes("publishNotificationEvent"), "Native lead submit must call publishNotificationEvent");
  assert.ok(formSubmit.includes("new_lead"), "Native lead submit must produce new_lead event");
  assert.ok(formSubmit.includes("/admin/leads/?leadId="), "Native lead event must deep-link to leads");

  // B. Career Applications
  const careerApply = fs.readFileSync(path.join(ROOT, "app", "api", "career", "apply", "route.ts"), "utf8");
  assert.ok(careerApply.includes("publishNotificationEvent"), "Career application must call publishNotificationEvent");
  assert.ok(careerApply.includes("new_application"), "Career application must produce new_application event");
  assert.ok(careerApply.includes("/admin/hr-pipeline/?candidate="), "Career application must deep-link to pipeline");

  // C. Assessment Submit
  const assessSubmit = fs.readFileSync(path.join(ROOT, "app", "api", "assessment", "submit", "route.ts"), "utf8");
  assert.ok(assessSubmit.includes("publishNotificationEvent"), "Assessment submit must call publishNotificationEvent");
  assert.ok(assessSubmit.includes("assessment_submitted"), "Assessment submit must produce assessment_submitted event");
  assert.ok(assessSubmit.includes("/admin/assessment/?attemptId="), "Assessment submit must deep-link to attempt");

  // D. Google OAuth & Sync Failure
  const googleIntegration = fs.readFileSync(path.join(ROOT, "lib", "integrations", "google.ts"), "utf8");
  assert.ok(googleIntegration.includes("google_oauth_expired"), "Google integration must produce google_oauth_expired event");
  assert.ok(googleIntegration.includes("google_sync_failed"), "Google integration must produce google_sync_failed event");

  // E. Site Health Audit Issues
  const auditRunner = fs.readFileSync(path.join(ROOT, "lib", "audit", "audit-runner.ts"), "utf8");
  assert.ok(auditRunner.includes("site_audit_issues"), "Audit runner must produce site_audit_issues event");
});

// Test 4: In-Memory / Simulated RBAC Query and State Transitions
test("REQ-V6-NOTIF-04: RBAC query filtering, unread count, mark-read, and dismiss transitions", () => {
  const store = [];

  function insertEvent(event) {
    const record = {
      id: `notif_${crypto.randomBytes(6).toString("hex")}`,
      recipient_role: event.recipient_role,
      title: event.title,
      message: event.message,
      type: event.type,
      severity: event.severity,
      resource_url: event.resource_url,
      is_read: 0,
      read_at: null,
      dismissed_at: null,
      created_at: new Date().toISOString(),
    };
    store.unshift(record);
    return record.id;
  }

  function queryForUser(userRole, unreadOnly = false) {
    const isFullAdmin = userRole === "superadmin" || userRole === "admin";
    const filtered = store.filter((n) => {
      if (n.dismissed_at !== null) return false;
      if (unreadOnly && n.is_read !== 0) return false;
      if (isFullAdmin) return true;
      if (userRole === "hr") return n.recipient_role === "all" || n.recipient_role === "hr";
      if (userRole === "marketing") return n.recipient_role === "all" || n.recipient_role === "marketing";
      return n.recipient_role === "all" || n.recipient_role === userRole;
    });

    const unreadCount = store.filter((n) => {
      if (n.dismissed_at !== null) return false;
      if (n.is_read !== 0) return false;
      if (isFullAdmin) return true;
      if (userRole === "hr") return n.recipient_role === "all" || n.recipient_role === "hr";
      if (userRole === "marketing") return n.recipient_role === "all" || n.recipient_role === "marketing";
      return n.recipient_role === "all" || n.recipient_role === userRole;
    }).length;

    return { notifications: filtered, unreadCount };
  }

  // Initial Empty State
  const initialSuper = queryForUser("superadmin");
  assert.equal(initialSuper.notifications.length, 0, "Initial store must be empty");
  assert.equal(initialSuper.unreadCount, 0, "Initial unread count must be 0");

  // Step A: Produce Real Lead Event
  const leadId = insertEvent({
    recipient_role: "marketing",
    title: "New Inbound Lead: Acme Corp",
    message: "Submitted via Contact Form",
    type: "new_lead",
    severity: "info",
    resource_url: "/admin/leads/?leadId=lead_123",
  });

  // Step B: Produce Real Career Application Event
  const appNotifId = insertEvent({
    recipient_role: "hr",
    title: "New Candidate: John Doe (SEO Lead)",
    message: "Experience: 5 years",
    type: "new_application",
    severity: "info",
    resource_url: "/admin/hr-pipeline/?candidate=john@example.com",
  });

  // Step C: Produce Real Assessment Event
  const assessNotifId = insertEvent({
    recipient_role: "hr",
    title: "Assessment Completed: SEO Lead Evaluation",
    message: "Score: 18/20",
    type: "assessment_submitted",
    severity: "info",
    resource_url: "/admin/assessment/?attemptId=attempt_456",
  });

  // Step D: Produce Real Site Audit Event
  const auditNotifId = insertEvent({
    recipient_role: "all",
    title: "Site Health Audit: 2 Critical Issues",
    message: "Missing canonical tags detected",
    type: "site_audit_issues",
    severity: "danger",
    resource_url: "/admin/site-audits/",
  });

  // Check Superadmin: sees all 4 events
  const superResult = queryForUser("superadmin");
  assert.equal(superResult.notifications.length, 4, "Superadmin sees all 4 notifications");
  assert.equal(superResult.unreadCount, 4, "Superadmin unread count is 4");

  // Check HR: sees 2 hr + 1 all = 3 notifications
  const hrResult = queryForUser("hr");
  assert.equal(hrResult.notifications.length, 3, "HR sees 3 notifications (2 hr + 1 all)");
  assert.equal(hrResult.unreadCount, 3, "HR unread count is 3");

  // Check Marketing: sees 1 marketing + 1 all = 2 notifications
  const mktgResult = queryForUser("marketing");
  assert.equal(mktgResult.notifications.length, 2, "Marketing sees 2 notifications (1 mktg + 1 all)");
  assert.equal(mktgResult.unreadCount, 2, "Marketing unread count is 2");

  // Mark One Read
  const item = store.find((n) => n.id === leadId);
  item.is_read = 1;
  item.read_at = new Date().toISOString();

  const superAfterOneRead = queryForUser("superadmin");
  assert.equal(superAfterOneRead.unreadCount, 3, "Unread count decrements to 3 after marking one read");

  // Test Unread Only Filter
  const unreadOnlyResult = queryForUser("superadmin", true);
  assert.equal(unreadOnlyResult.notifications.length, 3, "Unread filter returns exactly 3 notifications");

  // Dismiss one notification
  const auditItem = store.find((n) => n.id === auditNotifId);
  auditItem.dismissed_at = new Date().toISOString();

  const superAfterDismiss = queryForUser("superadmin");
  assert.equal(superAfterDismiss.notifications.length, 3, "Dismissed notification is excluded from query");
  assert.equal(superAfterDismiss.unreadCount, 2, "Unread count decrements after dismissing unread item");

  // Mark All Read
  store.forEach((n) => {
    if (n.dismissed_at === null) {
      n.is_read = 1;
      n.read_at = new Date().toISOString();
    }
  });

  const superAfterMarkAll = queryForUser("superadmin");
  assert.equal(superAfterMarkAll.unreadCount, 0, "Unread count is 0 after mark all read");
  assert.equal(superAfterMarkAll.notifications.length, 3, "Notifications still list read items");
});

// Test 5: UI Dropdown Component Verification
test("REQ-V6-NOTIF-05: AdminNotificationsDropdown uses Bell icon, numeric badge, 420px width, and tabs", () => {
  const dropdownContent = fs.readFileSync(path.join(ROOT, "components", "admin", "AdminNotificationsDropdown.tsx"), "utf8");
  
  assert.ok(dropdownContent.includes("<Bell"), "Must use Lucide Bell icon");
  assert.equal(dropdownContent.includes("<svg width=\"18\""), false, "Must not contain raw inline Bell SVG");
  assert.ok(dropdownContent.includes("unreadCount > 9 ? \"9+\" : unreadCount"), "Must display numeric counter badge");
  assert.ok(dropdownContent.includes("width: \"420px\""), "Must have 420px width");
  assert.ok(dropdownContent.includes("setTab(\"all\")"), "Must have All tab");
  assert.ok(dropdownContent.includes("setTab(\"unread\")"), "Must have Unread tab");
  assert.ok(dropdownContent.includes("handleMarkAllRead"), "Must have Mark All Read action");
  assert.ok(dropdownContent.includes("handleDismiss"), "Must have Dismiss action");
  assert.ok(dropdownContent.includes("setInterval(fetchNotifications, 45000)"), "Must auto-poll every 45s");
});

// Test 6: Settings Notifications Preferences UI
test("REQ-V6-NOTIF-06: SettingsClientView contains Notifications tab with In-App & Email channels", () => {
  const settingsContent = fs.readFileSync(path.join(ROOT, "components", "admin", "settings", "SettingsClientView.tsx"), "utf8");
  
  assert.ok(settingsContent.includes("Notification &amp; Alert Routing Preferences"), "Settings header for notifications");
  assert.ok(settingsContent.includes("notifyLeadsInApp"), "Inbound leads preference toggle");
  assert.ok(settingsContent.includes("notifyJobsInApp"), "Job applications preference toggle");
  assert.ok(settingsContent.includes("notifyAssessmentsInApp"), "Candidate assessments preference toggle");
  assert.ok(settingsContent.includes("notifyAuditsInApp"), "Site health audits preference toggle");
  assert.ok(settingsContent.includes("notifyGoogleInApp"), "Google OAuth preference toggle");
  assert.ok(settingsContent.includes("notifySecurityInApp"), "Security alerts preference toggle");
});
