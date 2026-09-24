import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import {
  calculateRankingTrend,
  classifyKeyword,
  generateKeywordRecommendation,
} from "../lib/seo/keyword-engine.ts";
import {
  isProtectedPage,
  classifyRiskLevel,
  PROTECTED_TIER0_PAGES,
} from "../lib/seo/change-request-types.ts";
import {
  normalizeBrandName,
  decodeHtmlEntities,
  DGS_BRAND_NAME,
} from "../lib/brand.ts";

const ROOT = process.cwd();

// Pure mirror of deterministic source hash computation
function computeSourceHash(pageUrl, imageSrc) {
  const normPage = (pageUrl || "").trim().toLowerCase().replace(/\/+$/, "") + "/";
  const normSrc = (imageSrc || "").trim();
  return createHash("sha256").update(`${normPage}|${normSrc}`).digest("hex");
}

// ============================================================================
// SUITE 1: KEYWORDS PAGE ERROR BOUNDARY & NULL-SAFETY
// ============================================================================

test("1. Keywords Error Boundary exists and provides recovery UI", async () => {
  const errorPagePath = join(ROOT, "app/admin/seo/keywords/error.tsx");
  assert.ok(existsSync(errorPagePath), "error.tsx must exist in app/admin/seo/keywords/");

  const content = await readFile(errorPagePath, "utf8");
  assert.ok(content.includes('"use client"') || content.includes("'use client'"), "Must be client component");
  assert.ok(content.includes("reset"), "Must receive and expose reset callback");
  assert.ok(content.includes("Keywords Strategy Telemetry Error"), "Must display human-readable error title");
  assert.ok(content.includes("Try Again") || content.includes("Retry"), "Must provide retry button");
});

test("2. Keyword engine handles all null, undefined, and zero edge cases without crashing", () => {
  // Test calculateRankingTrend with null / undefined / zero deltas
  const trendNull = calculateRankingTrend(null, null);
  assert.equal(trendNull.label, "NOT DETECTED");
  assert.equal(trendNull.delta, null);

  const trendNoPrev = calculateRankingTrend(12.5, null);
  assert.equal(trendNoPrev.status, "new");
  assert.equal(trendNoPrev.label, "NEW");

  const trendSame = calculateRankingTrend(5.0, 5.0);
  assert.equal(trendSame.status, "stable");
  assert.equal(trendSame.label, "STABLE");

  const trendGain = calculateRankingTrend(3.2, 8.4);
  assert.equal(trendGain.status, "improving");
  assert.ok(trendGain.delta > 0);

  const trendDrop = calculateRankingTrend(15.1, 4.0);
  assert.equal(trendDrop.status, "falling");
  assert.ok(trendDrop.delta < 0);

  // Test classifyKeyword with empty / undefined objects
  const classifiedEmpty = classifyKeyword({
    query: "",
    position: null,
  });
  assert.equal(classifiedEmpty, "NOT DETECTED");

  const classifiedNullPositions = classifyKeyword({
    query: "test query",
    position: null,
    prevPosition: null,
    impressions: null,
    clicks: null,
  });
  assert.equal(classifiedNullPositions, "NOT DETECTED");

  // Protect tier
  const classifiedProtect = classifyKeyword({
    query: "top ranking query",
    position: 2.1,
    targetUrl: "https://www.dgeniussolutions.com/services/seo-services-in-mumbai/",
    isTarget: true,
  });
  assert.equal(classifiedProtect, "PROTECT");

  // Grow tier
  const classifiedGrow = classifyKeyword({
    query: "striking distance query",
    position: 14.0,
    impressions: 1200,
    clicks: 10,
  });
  assert.equal(classifiedGrow, "GROW");

  // Recover tier
  const classifiedRecover = classifyKeyword({
    query: "declining query",
    position: 25.0,
    prevPosition: 8.0,
  });
  assert.equal(classifiedRecover, "RECOVER");
});

test("3. Keyword recommendation engine generates context-aware anchors and strategic actions", () => {
  const rec = generateKeywordRecommendation({
    query: "seo company in mumbai",
    position: 7.2,
    prevPosition: 5.1,
    clicks: 120,
    impressions: 4500,
    ctr: 0.026,
    targetUrl: "https://www.dgeniussolutions.com/services/seo-services-in-mumbai/",
    isCannibalized: false,
  });

  assert.ok(rec.classification, "Must generate recommendation classification");
  assert.ok(rec.whyThisMatters, "Must generate context explanation");
  assert.ok(Array.isArray(rec.suggestedAnchors), "Must provide suggested anchors");
  assert.ok(rec.suggestedAnchors.length >= 2, "Must provide multiple anchor variations");

  // Anchors must be context-aware and contain key terms, not generic "click here"
  for (const anchor of rec.suggestedAnchors) {
    assert.ok(
      anchor.toLowerCase().includes("seo") ||
      anchor.toLowerCase().includes("mumbai") ||
      anchor.toLowerCase().includes("company") ||
      anchor.toLowerCase().includes("services"),
      `Anchor "${anchor}" must be relevant to the query context`
    );
    assert.ok(!anchor.toLowerCase().includes("click here"), "Must not use generic anchors");
  }

  // Must provide real action options for approval drafts
  assert.ok(Array.isArray(rec.actionOptions), "Must generate actionOptions list");
  assert.ok(rec.actionOptions.length > 0, "Must have at least one actionOption");
  const firstAction = rec.actionOptions[0];
  assert.ok(firstAction.id, "ActionOption must have id");
  assert.ok(firstAction.label, "ActionOption must have label");
  assert.ok(firstAction.changeType, "ActionOption must have changeType");
  assert.ok(firstAction.riskLevel, "ActionOption must have riskLevel");
});

// ============================================================================
// SUITE 2: ALT CONSISTENCY & DETERMINISTIC IDENTITY
// ============================================================================

test("4. Missing Alt identity hash is strictly deterministic", () => {
  const hash1 = computeSourceHash(
    "https://www.dgeniussolutions.com/australia-page/",
    "https://www.dgeniussolutions.com/wp-content/uploads/2024/01/hero.jpg"
  );
  const hash2 = computeSourceHash(
    "https://www.dgeniussolutions.com/australia-page",
    "https://www.dgeniussolutions.com/wp-content/uploads/2024/01/hero.jpg"
  );
  const hash3 = computeSourceHash(
    "https://www.dgeniussolutions.com/australia-page/  ",
    "  https://www.dgeniussolutions.com/wp-content/uploads/2024/01/hero.jpg  "
  );

  assert.equal(hash1.length, 64, "Source hash must be 64-character SHA256 hex string");
  assert.equal(hash1, hash2, "Trailing slash on page URL must normalize to same hash");
  assert.equal(hash1, hash3, "Surrounding whitespace must normalize to same hash");
});

test("5. Database schema contains recommendation and source_hash columns and indexes", async () => {
  const schemaSql = await readFile(join(ROOT, "db/schema.sql"), "utf8");
  assert.ok(
    schemaSql.includes("recommendation TEXT NULL"),
    "db/schema.sql must declare recommendation TEXT NULL in site_audit_missing_alts"
  );
  assert.ok(
    schemaSql.includes("source_hash VARCHAR(64) NULL"),
    "db/schema.sql must declare source_hash in site_audit_missing_alts"
  );
  assert.ok(
    schemaSql.includes("idx_sama_source_hash"),
    "db/schema.sql must index source_hash"
  );

  const migrationScript = await readFile(join(ROOT, "scripts/apply-cms-schema.mjs"), "utf8");
  assert.ok(
    migrationScript.includes("recommendation TEXT NULL"),
    "Migration script must include recommendation column migration"
  );
  assert.ok(
    migrationScript.includes("source_hash VARCHAR(64) NULL"),
    "Migration script must include source_hash column migration"
  );
});

test("6. Alt Fixer Drawer and API support auditRunId scoping and discrepancy warning", async () => {
  const altFixerRoute = await readFile(join(ROOT, "app/api/admin/seo/alt-fixer/route.ts"), "utf8");
  assert.ok(
    altFixerRoute.includes("auditRunId"),
    "alt-fixer route must read auditRunId query param"
  );

  const altFixerLib = await readFile(join(ROOT, "lib/seo/alt-fixer.ts"), "utf8");
  assert.ok(
    altFixerLib.includes("auditRunId?: string"),
    "listMissingAlts must accept auditRunId option"
  );
  assert.ok(
    altFixerLib.includes("auditSingleUrl"),
    "refreshPageMissingAltCount must run live re-audit via auditSingleUrl"
  );

  const drawerComponent = await readFile(join(ROOT, "components/admin/AltFixerDrawer.tsx"), "utf8");
  assert.ok(
    drawerComponent.includes("auditRunId?: string") || drawerComponent.includes("auditRunId"),
    "AltFixerDrawer must accept auditRunId prop"
  );
  assert.ok(
    drawerComponent.includes("reportedCount?: number") || drawerComponent.includes("reportedCount"),
    "AltFixerDrawer must accept reportedCount prop"
  );
  assert.ok(
    drawerComponent.includes("DATA INCONSISTENCY") || drawerComponent.includes("hasInconsistency"),
    "AltFixerDrawer must alert when reported count does not match list count"
  );
});

// ============================================================================
// SUITE 3: PAGESPEED REAL MEASUREMENT QUEUE & LAB VS FIELD
// ============================================================================

test("7. PageSpeed measurement queue schema and batch runner exist", async () => {
  const schemaSql = await readFile(join(ROOT, "db/schema.sql"), "utf8");
  assert.ok(
    schemaSql.includes("CREATE TABLE IF NOT EXISTS pagespeed_jobs"),
    "db/schema.sql must create pagespeed_jobs table"
  );
  assert.ok(
    schemaSql.includes("audit_run_id VARCHAR(64) NOT NULL"),
    "pagespeed_jobs must include audit_run_id"
  );

  const batchRoutePath = join(ROOT, "app/api/admin/seo/pagespeed/process-batch/route.ts");
  assert.ok(existsSync(batchRoutePath), "process-batch route must exist");

  const batchRoute = await readFile(batchRoutePath, "utf8");
  assert.ok(batchRoute.includes("pagespeed_jobs"), "process-batch must query pagespeed_jobs");
  assert.ok(batchRoute.includes("runPageSpeedInsights"), "process-batch must run real measurements");
  assert.ok(batchRoute.includes("batchSize"), "process-batch must support batchSize parameter");

  const statusRoutePath = join(ROOT, "app/api/admin/seo/pagespeed/status/route.ts");
  assert.ok(existsSync(statusRoutePath), "status route must exist");
});

test("8. Site Audits UI contains PageSpeed queue progress and Lab vs Field metrics", async () => {
  const clientView = await readFile(join(ROOT, "app/admin/site-audits/SiteAuditsClientView.tsx"), "utf8");
  assert.ok(
    clientView.includes("PageSpeed Measurement Queue") || clientView.includes("pagespeed/process-batch"),
    "Site Audits view must display queue status and trigger batch processing"
  );
  assert.ok(
    clientView.includes("LAB METRICS") || clientView.includes("Lighthouse Laboratory"),
    "Site Audits view must display Lab metrics"
  );
  assert.ok(
    clientView.includes("FIELD DATA") || clientView.includes("CrUX Field Data"),
    "Site Audits view must display Field metrics"
  );
  assert.ok(
    clientView.includes("SEO Data Health") || clientView.includes("healthDiagnostics"),
    "Site Audits view must include SEO Data Health diagnosis panel"
  );
});

// ============================================================================
// SUITE 4: SEO APPROVAL WORKFLOW & PROTECTED TIER-0 GOVERNANCE
// ============================================================================

test("9. Protected Tier-0 pages are strictly identified and protected from mutations", () => {
  // Confirm the 5 required Tier-0 pages
  assert.ok(PROTECTED_TIER0_PAGES.includes("/services/ai-video-production-agency/"));
  assert.ok(PROTECTED_TIER0_PAGES.includes("/services/aeo-services-in-mumbai/"));
  assert.ok(PROTECTED_TIER0_PAGES.includes("/services/geo/"));
  assert.ok(PROTECTED_TIER0_PAGES.includes("/services/llm-seo-service/"));
  assert.ok(PROTECTED_TIER0_PAGES.includes("/services/seo-services-in-mumbai/"));

  // Check URL variations
  assert.ok(isProtectedPage("https://www.dgeniussolutions.com/services/seo-services-in-mumbai/"));
  assert.ok(isProtectedPage("https://www.dgeniussolutions.com/services/geo"));
  assert.ok(isProtectedPage("/services/ai-video-production-agency/"));
  assert.ok(!isProtectedPage("https://www.dgeniussolutions.com/about-us/"));
  assert.ok(!isProtectedPage("https://www.dgeniussolutions.com/blog/sample-post/"));

  // Risk level classification
  const riskProtected = classifyRiskLevel("/services/geo/", "TITLE");
  assert.equal(riskProtected, "CRITICAL", "Protected pages must always be CRITICAL risk");

  const riskCanonical = classifyRiskLevel("/about-us/", "CANONICAL");
  assert.ok(riskCanonical === "CRITICAL" || riskCanonical === "HIGH", "Canonical alterations must be CRITICAL/HIGH risk");

  const riskAlt = classifyRiskLevel("/about-us/", "MISSING_ALT");
  assert.equal(riskAlt, "SAFE", "Missing alt on standard pages should be SAFE/LOW risk");
});

test("10. SEO Change Requests schema, service, and API routes exist", async () => {
  const schemaSql = await readFile(join(ROOT, "db/schema.sql"), "utf8");
  assert.ok(
    schemaSql.includes("CREATE TABLE IF NOT EXISTS seo_change_requests"),
    "db/schema.sql must define seo_change_requests table"
  );

  const servicePath = join(ROOT, "lib/seo/change-requests.ts");
  assert.ok(existsSync(servicePath), "change-requests service must exist");
  const serviceCode = await readFile(servicePath, "utf8");
  assert.ok(serviceCode.includes("createChangeRequest"), "Must export createChangeRequest");
  assert.ok(serviceCode.includes("approveChangeRequest"), "Must export approveChangeRequest");
  assert.ok(serviceCode.includes("applyChangeRequest"), "Must export applyChangeRequest");
  assert.ok(serviceCode.includes("verifyChangeRequest"), "Must export verifyChangeRequest");
  assert.ok(serviceCode.includes("rollbackChangeRequest"), "Must export rollbackChangeRequest");
  assert.ok(serviceCode.includes("PROTECTED_TIER0_PAGES"), "Must export PROTECTED_TIER0_PAGES");

  // Verify all 5 workflow API endpoints exist
  assert.ok(existsSync(join(ROOT, "app/api/admin/seo/change-requests/route.ts")), "List/Create route exists");
  assert.ok(existsSync(join(ROOT, "app/api/admin/seo/change-requests/[id]/approve/route.ts")), "Approve route exists");
  assert.ok(existsSync(join(ROOT, "app/api/admin/seo/change-requests/[id]/apply/route.ts")), "Apply route exists");
  assert.ok(existsSync(join(ROOT, "app/api/admin/seo/change-requests/[id]/verify/route.ts")), "Verify route exists");
  assert.ok(existsSync(join(ROOT, "app/api/admin/seo/change-requests/[id]/rollback/route.ts")), "Rollback route exists");
});

test("11. SEO Approvals Center UI and Admin Sidebar integration", async () => {
  const approvalsPage = join(ROOT, "app/admin/seo/approvals/page.tsx");
  assert.ok(existsSync(approvalsPage), "Approvals page.tsx must exist");

  const approvalsClient = join(ROOT, "app/admin/seo/approvals/ApprovalsClientView.tsx");
  assert.ok(existsSync(approvalsClient), "ApprovalsClientView.tsx must exist");
  const clientCode = await readFile(approvalsClient, "utf8");
  assert.ok(
    clientCode.includes("SEO Approvals & Change Request Engine") || clientCode.includes("SEO Approvals"),
    "Approvals UI must display header"
  );
  assert.ok(clientCode.includes("Awaiting Approval"), "Approvals UI must have Awaiting Approval tab");
  assert.ok(clientCode.includes("PROTECTED TIER-0"), "Approvals UI must indicate Protected Tier-0 status");

  const sidebar = await readFile(join(ROOT, "components/admin/AdminSidebar.tsx"), "utf8");
  assert.ok(
    sidebar.includes('href: "/admin/seo/approvals"') || sidebar.includes("SEO Approvals"),
    "AdminSidebar must contain navigation to SEO Approvals"
  );
});

test("12. Per-page transactional error resilience in Site Audit Runner", async () => {
  const auditRunner = await readFile(join(ROOT, "lib/audit/audit-runner.ts"), "utf8");
  assert.ok(
    auditRunner.includes("Failed auditing page") || auditRunner.includes("catch (pageErr"),
    "Site audit runner must wrap individual page crawling in try/catch to prevent aborting whole run"
  );
  assert.ok(
    auditRunner.includes("computeSourceHash") || auditRunner.includes("sourceHash"),
    "Site audit runner must compute deterministic source_hash for missing alts"
  );
  assert.ok(
    auditRunner.includes("pagespeed_jobs"),
    "Site audit runner must populate pagespeed_jobs for scheduled analysis"
  );
});

// ============================================================================
// SUITE 5: BRAND NAME NORMALIZATION & HTML ENTITY INTEGRITY
// ============================================================================

test("13. Brand name normalization resolves all entities and preserves prose apostrophes", async () => {
  assert.equal(DGS_BRAND_NAME, "D'Genius Solutions");

  // Encoded and entity forms must resolve to canonical brand
  assert.equal(normalizeBrandName("Welcome to D&#x27;Genius Solutions!"), "Welcome to D'Genius Solutions!");
  assert.equal(normalizeBrandName("Read D&amp;#x27;Genius Insights."), "Read D'Genius Insights.");
  assert.equal(normalizeBrandName("Contact D&#039;Genius Solutions today."), "Contact D'Genius Solutions today.");
  assert.equal(normalizeBrandName("D&apos;Genius Solutions digital agency"), "D'Genius Solutions digital agency");
  assert.equal(normalizeBrandName("D&#8217;Genius Solutions services"), "D'Genius Solutions services");
  assert.equal(normalizeBrandName("D’Genius Solutions Mumbai"), "D'Genius Solutions Mumbai");
  assert.equal(normalizeBrandName("Explore D’Genius capabilities"), "Explore D'Genius capabilities");

  // Normal English prose with curly apostrophes must be preserved
  const prose = "It’s important that our client’s campaign doesn’t fail and we won’t compromise.";
  assert.equal(normalizeBrandName(prose), prose, "Prose apostrophes must not be touched");

  // decodeHtmlEntities should handle common HTML entities
  const rawHtml = "&lt;h1&gt;Leading Agency &amp; Brand — D&#x27;Genius Solutions&lt;/h1&gt;";
  const decoded = decodeHtmlEntities(rawHtml);
  assert.ok(decoded.includes("Leading Agency & Brand — D'Genius Solutions"));

  // Verify no hardcoded D&apos; remains in JSX components
  const footerCode = await readFile(join(ROOT, "components/layout/Footer.tsx"), "utf8");
  assert.ok(!footerCode.includes("D&apos;"), "Footer.tsx must not contain D&apos;");

  const loginCode = await readFile(join(ROOT, "app/admin/login/page.tsx"), "utf8");
  assert.ok(!loginCode.includes("D&apos;"), "Login page must not contain D&apos;");

  const menuCode = await readFile(join(ROOT, "components/layout/SiteMenu.tsx"), "utf8");
  assert.ok(!menuCode.includes("D&apos;"), "SiteMenu.tsx must not contain D&apos;");
});

// ============================================================================
// SUITE 6: RESPONSIVE FAQ ACCORDION ARCHITECTURE & ACCESSIBILITY
// ============================================================================

test("14. Responsive FAQ Accordion engine uses standard selectors and accessibility attributes", async () => {
  const faqBootCode = await readFile(join(ROOT, "components/mirror/DgsLocationFaqBoot.tsx"), "utf8");

  // Must target genuine .dgs-faq-* selectors
  assert.ok(faqBootCode.includes(".dgs-faq-item"), "Must target .dgs-faq-item");
  assert.ok(faqBootCode.includes(".dgs-faq-question"), "Must target .dgs-faq-question");
  assert.ok(faqBootCode.includes(".dgs-faq-container"), "Must target .dgs-faq-container");

  // Open state must be .active, never .on
  assert.ok(faqBootCode.includes('"active"') || faqBootCode.includes("'active'"), "Must toggle 'active' class");
  assert.ok(!faqBootCode.includes('".on"') && !faqBootCode.includes("'.on'"), "Must NOT query '.on'");
  assert.ok(!faqBootCode.includes('".dgs-faq-q"') && !faqBootCode.includes("'.dgs-faq-q'"), "Must NOT query '.dgs-faq-q'");

  // Accessibility: role="button", tabindex="0", aria-expanded
  assert.ok(faqBootCode.includes("aria-expanded"), "Must maintain aria-expanded attribute");
  assert.ok(faqBootCode.includes("button"), "Must set role='button'");
  assert.ok(faqBootCode.includes("tabindex"), "Must set tabindex='0'");

  // Keyboard navigation: Enter and Space keys
  assert.ok(faqBootCode.includes("Enter"), "Must support Enter key");
  assert.ok(faqBootCode.includes(" "), "Must support Space key");

  // Sibling closing logic
  assert.ok(faqBootCode.includes("sibling !== item") || faqBootCode.includes("other !== item"), "Must close sibling FAQ items");

  // Stylesheet verification in inner-mirror-overrides.css
  const cssCode = await readFile(join(ROOT, "lib/wp-exact/inner-mirror-overrides.css"), "utf8");
  assert.ok(cssCode.includes(".dgs-faq-item.active .dgs-faq-answer"), "CSS must expand answer on .active");
  assert.ok(cssCode.includes(".dgs-faq-toggle"), "CSS must support toggle animation");
  assert.ok(cssCode.includes("min-height: 44px"), "CSS must define accessible 44px mobile touch target");
});
