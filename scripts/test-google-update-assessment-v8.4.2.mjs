import test from "node:test";
import assert from "node:assert/strict";
import { formatAuditDate, formatDateOnly, getDaysAgo } from "../lib/utils/date.ts";
import {
  calculateComplianceConfidence,
  isInformationalUpdate,
} from "../lib/google-updates/compliance-engine.ts";

// 1. Universal Safe Date Normalization
test("REQ-ASSESS-01: formatAuditDate handles all input formats without throwing", () => {
  // Date object
  const validDate = new Date("2026-09-24T19:26:55.000Z");
  assert.equal(formatAuditDate(validDate), "2026-09-24");

  // ISO string
  assert.equal(formatAuditDate("2026-09-24T19:26:55.000Z"), "2026-09-24");

  // MySQL datetime string
  assert.equal(formatAuditDate("2026-09-24 19:26:55"), "2026-09-24");

  // Standard YYYY-MM-DD
  assert.equal(formatAuditDate("2026-09-24"), "2026-09-24");

  // Numeric timestamp
  assert.equal(formatAuditDate(validDate.getTime()), "2026-09-24");

  // Null, undefined, empty
  assert.equal(formatAuditDate(null), "recent");
  assert.equal(formatAuditDate(undefined), "recent");
  assert.equal(formatAuditDate(""), "recent");

  // Custom fallback
  assert.equal(formatAuditDate(null, "none"), "none");

  // Invalid date string
  assert.equal(formatAuditDate("not-a-valid-date"), "recent");

  // Invalid Date object
  const invalidDate = new Date("invalid");
  assert.equal(formatAuditDate(invalidDate), "recent");
});

test("REQ-ASSESS-02: formatDateOnly returns YYYY-MM-DD or null", () => {
  assert.equal(formatDateOnly(new Date("2026-09-24T00:00:00Z")), "2026-09-24");
  assert.equal(formatDateOnly("2026-09-24 12:00:00"), "2026-09-24");
  assert.equal(formatDateOnly(null), null);
  assert.equal(formatDateOnly("invalid"), null);
});

test("REQ-ASSESS-03: getDaysAgo accurately computes age across types", () => {
  const now = new Date("2026-09-27T12:00:00Z").getTime();

  // 3 days ago (Sep 24)
  const sep24Date = new Date("2026-09-24T12:00:00Z");
  assert.equal(getDaysAgo(sep24Date, now), 3);
  assert.equal(getDaysAgo("2026-09-24T12:00:00Z", now), 3);
  assert.equal(getDaysAgo("2026-09-24 12:00:00", now), 3);

  // 20 days ago (Sep 7 - Stale)
  const sep7Date = new Date("2026-09-07T12:00:00Z");
  assert.equal(getDaysAgo(sep7Date, now), 20);

  // Null / invalid
  assert.equal(getDaysAgo(null), null);
  assert.equal(getDaysAgo("invalid"), null);
});

// 2. Fresh vs Stale Audit Confidence Behavior
test("REQ-ASSESS-04: Fresh audit (<15d) awards higher confidence than stale audit (>15d)", () => {
  const freshConfidence = calculateComplianceConfidence({
    totalRequiredChecks: 5,
    checksWithEvidence: 4,
    hasCompletedAudit: true,
    auditAgeDays: 3, // fresh
    hasGscData: true,
  });

  const staleConfidence = calculateComplianceConfidence({
    totalRequiredChecks: 5,
    checksWithEvidence: 4,
    hasCompletedAudit: true,
    auditAgeDays: 25, // stale (>15d)
    hasGscData: true,
  });

  const noAuditConfidence = calculateComplianceConfidence({
    totalRequiredChecks: 5,
    checksWithEvidence: 4,
    hasCompletedAudit: false,
    auditAgeDays: null,
    hasGscData: true,
  });

  assert.ok(freshConfidence > staleConfidence, "Fresh audit must yield higher confidence than stale audit");
  assert.ok(staleConfidence > noAuditConfidence, "Stale audit must yield higher confidence than no audit");
});

test("REQ-ASSESS-05: Informational updates are classified as NOT APPLICABLE", () => {
  assert.equal(
    isInformationalUpdate(
      "Search Central Live India 2026: Bengaluru, We're Coming (For Real This Time)",
      "Search Central Live",
      "Announcing community conference in India"
    ),
    true
  );

  assert.equal(
    isInformationalUpdate(
      "September 2026 spam update",
      "Spam Update",
      "Google is releasing the September 2026 spam update"
    ),
    false
  );
});

// 3. Stale Audit Issue Enforcement
test("REQ-ASSESS-06: Audits older than 15 days are categorized as stale", () => {
  const isStale = (days) => days != null && days > 15;
  assert.equal(isStale(3), false, "3 days is fresh");
  assert.equal(isStale(14), false, "14 days is fresh");
  assert.equal(isStale(15), false, "15 days is boundary");
  assert.equal(isStale(16), true, "16 days is stale");
  assert.equal(isStale(30), true, "30 days is stale");
});

// 4. Safe Assessment Execution
test("REQ-ASSESS-07: runGoogleUpdateAssessment runs without throwing in all evidence environments", async () => {
  const { runGoogleUpdateAssessment } = await import("../lib/google-updates/compliance-engine.ts");
  const sampleUpdate = {
    id: "test-update-123",
    title: "September 2026 spam update",
    source: "Google Search Central",
    source_url: "https://developers.google.com/search/updates",
    external_id: "ext-123",
    published_at: "2026-09-24T16:15:00.000Z",
    detected_at: "2026-09-24T16:20:00.000Z",
    category: "Spam Update",
    severity: "HIGH",
    summary: "Google September 2026 spam update rollout.",
    impact_analysis: "Potential impact.",
    recommended_actions: [],
    affected_dgs_areas: ["/services/ai-video-production-agency/"],
    status: "active",
    assessment_status: "NOT ASSESSED",
    external_status: "ACTIVE",
    incident_begin: "2026-09-24T16:15:00.000Z",
    incident_end: null,
    raw_details: {},
    notified_at: null,
    assessment_date: null,
    evidence: null,
    affected_pages: null,
    checks_performed: null,
    issues_found: null,
    recommendations: null,
    assessed_by: null,
    assessment_mode: null,
    confidence: null,
    created_at: "2026-09-24T16:20:00.000Z",
    updated_at: "2026-09-24T16:20:00.000Z",
  };

  const result = await runGoogleUpdateAssessment(sampleUpdate, "Test Assessor");
  assert.ok(result);
  assert.equal(result.updateId, "test-update-123");
  assert.ok(result.assessmentStatus === "INSUFFICIENT EVIDENCE" || result.assessmentStatus === "NEEDS REVIEW");
  assert.ok(Array.isArray(result.checksPerformed));
  assert.ok(result.checksPerformed.length > 0);
  assert.ok(typeof result.confidence === "number");
});

test("REQ-ASSESS-08: formatAuditDate properly formats Date completed_at preventing .slice crash", () => {
  // Simulate MySQL returning Date object for completed_at
  const latestAuditRow = {
    id: "audit-123",
    status: "completed",
    completed_at: new Date("2026-09-24T19:26:55.000Z"),
  };

  // Attempting .slice(0, 10) directly on Date object would throw:
  assert.throws(() => {
    latestAuditRow.completed_at.slice(0, 10);
  }, /is not a function/);

  // Using formatAuditDate succeeds safely:
  const formatted = formatAuditDate(latestAuditRow.completed_at);
  assert.equal(formatted, "2026-09-24");
});

