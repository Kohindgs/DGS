import assert from "node:assert/strict";

console.log("--- Testing Google Search Update Monitoring Engine ---");

const {
  classifyUpdate,
  generateDgsImpact,
  generateSafeRecommendations,
  fetchGoogleStatusDashboard,
  fetchGoogleSearchCentralBlog,
} = await import("../lib/google-updates/monitor.ts");

// Test G1: Classification Logic
const core = classifyUpdate("March 2026 Core Update Released", "Google has released the March 2026 broad core update.");
assert.equal(core.category, "Core Update");
assert.equal(core.severity, "CRITICAL");
console.log("✓ Core Update classified as CRITICAL");

const spam = classifyUpdate("October 2025 Spam Update", "Targeting site reputation abuse and scaled content spam.");
assert.equal(spam.category, "Spam Update");
assert.equal(spam.severity, "HIGH");
console.log("✓ Spam Update classified as HIGH");

const incident = classifyUpdate("Google Search Serving Outage", "We are investigating a search ranking incident.");
assert.equal(incident.category, "Search System Incident");
assert.equal(incident.severity, "HIGH");
console.log("✓ Search System Incident classified as HIGH");

const guide = classifyUpdate("New guidance on technical SEO documentation", "Search Central published best practices.");
assert.equal(guide.category, "Search Guidelines");
assert.equal(guide.severity, "INFORMATIONAL");
console.log("✓ Guidance classified as INFORMATIONAL");

// Test G2: Impact Analysis
const coreImpact = generateDgsImpact("March 2026 Core Update", "Core Update", "CRITICAL");
assert.ok(coreImpact.impactAnalysis.includes("/services/seo-services-in-mumbai/"));
assert.ok(coreImpact.affectedAreas.includes("/services/seo-services-in-mumbai/"));
assert.ok(coreImpact.affectedAreas.includes("/services/ai-video-production-agency/"));
console.log("✓ DGS Impact analysis correctly targets protected service pages");

// Test G3: Safe Recommendations Policy
const recs = generateSafeRecommendations("CRITICAL", "Core Update");
assert.ok(recs.length >= 4, "Must provide multiple actionable recommendations");
const hasNoRewritePolicy = recs.some((r) =>
  r.toLowerCase().includes("not automatically alter") ||
  r.toLowerCase().includes("do not") && r.toLowerCase().includes("rewrite"),
);
assert.ok(hasNoRewritePolicy, "STRICT REQUIREMENT: Safe recommendations must explicitly forbid automatic rewriting of ranked pages");
console.log("✓ Strict NO-AUTO-REWRITE ranking policy verified in recommendations");

// Test G4: Feed Ingestion
console.log("Fetching live Google status dashboard...");
const incidents = await fetchGoogleStatusDashboard();
console.log(`Fetched ${incidents.length} incidents from status.search.google.com`);

console.log("Fetching live Google Search Central blog feed...");
const blogItems = await fetchGoogleSearchCentralBlog();
console.log(`Fetched ${blogItems.length} articles from Search Central blog`);

// Test G5: Email Alert Template
const { renderDgsEmailHtml } = await import("../lib/notifications/email-template.ts");
const alertHtml = renderDgsEmailHtml({
  kicker: "GOOGLE SEARCH ALGORITHM ALERT",
  title: "March 2026 Broad Core Update",
  subtitle: "Core Update · Google Search Central · Published 2026-03-15",
  statusBadge: {
    text: "CRITICAL",
    color: "#ffffff",
    bg: "#dc2626",
  },
  sections: [
    {
      title: "Update Overview",
      fields: [
        { label: "Update Title", value: "March 2026 Broad Core Update" },
        { label: "Category", value: "Core Update", isBadge: true, badgeColor: "#6366f1" },
        { label: "Severity", value: "CRITICAL", isBadge: true, badgeColor: "#dc2626" },
      ],
    },
    {
      title: "DGS Impact Assessment",
      fields: [
        { label: "Analysis", value: coreImpact.impactAnalysis },
        { label: "Monitored Areas", value: coreImpact.affectedAreas.join(", ") },
      ],
    },
    {
      title: "Safe Action Recommendations",
      fields: recs.map((r, i) => ({ label: `Action ${i + 1}`, value: r })),
    },
  ],
  ctaText: "Open Search Updates in DGS CMS",
  ctaUrl: "https://www.dgeniussolutions.com/admin/search-updates/",
  note: "CRITICAL POLICY NOTICE: Automated modifications to ranking-protected pages during active Google rollouts are STRICTLY PROHIBITED.",
});

assert.ok(alertHtml.includes("CRITICAL"), "Alert HTML must include CRITICAL badge");
assert.ok(alertHtml.includes("March 2026 Broad Core Update"), "Alert HTML must include update title");
assert.ok(alertHtml.includes("STRICTLY PROHIBITED"), "Alert HTML must include ranking protection note");
assert.ok(alertHtml.includes("/admin/search-updates/"), "Alert HTML must include dashboard link");
console.log("✓ Google update alert email template verified");

console.log("\n=== ALL GOOGLE SEARCH UPDATE TESTS PASSED SUCCESSFULLY ===");
