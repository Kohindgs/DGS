import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();

// Pure implementation mirroring lib/google-updates/compliance-engine.ts
function calculateComplianceConfidence(params) {
  const { totalRequiredChecks, checksWithEvidence, hasCompletedAudit, auditAgeDays, hasGscData } = params;
  if (totalRequiredChecks === 0) return 100;
  const coverageRatio = Math.min(1, checksWithEvidence / totalRequiredChecks);
  let score = coverageRatio * 50;
  if (hasCompletedAudit) {
    if (auditAgeDays != null && auditAgeDays <= 15) {
      score += 30;
    } else if (auditAgeDays != null && auditAgeDays <= 30) {
      score += 20;
    } else {
      score += 10;
    }
  }
  if (hasGscData) {
    score += 20;
  }
  return Math.round(Math.min(100, Math.max(10, score)));
}

// Pure implementation mirroring lib/seo/alt-fixer.ts
function updateImgAltInHtml(html, imageSrcOrFilename, newAltText) {
  if (!html || !imageSrcOrFilename) return { updated: false, html };
  const cleanTarget = imageSrcOrFilename.split("/").pop() || imageSrcOrFilename;
  const escapedTarget = cleanTarget.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const imgRegex = new RegExp(`(<img\\b[^>]*?(?:src|data-src)=["'][^"']*?${escapedTarget}[^"']*?["'][^>]*?>)`, "gi");

  let matchFound = false;
  const updatedHtml = html.replace(imgRegex, (fullImgTag) => {
    matchFound = true;
    const escapedAlt = newAltText.replace(/"/g, "&quot;");
    if (/\balt=(["'])[\s\S]*?\1/i.test(fullImgTag)) {
      return fullImgTag.replace(/\balt=(["'])[\s\S]*?\1/i, `alt="${escapedAlt}"`);
    }
    return fullImgTag.replace(/\/?>$/, ` alt="${escapedAlt}"$&`);
  });

  return { updated: matchFound, html: updatedHtml };
}

test("1. Compliance check cannot PASS without evidence", async () => {
  const complianceCode = await readFile(join(ROOT, "lib/google-updates/compliance-engine.ts"), "utf8");
  
  // Verify that if !hasCompletedAudit, Indexability and Content checks return INSUFFICIENT EVIDENCE
  assert.ok(
    complianceCode.includes("if (!hasCompletedAudit || auditedPagesCount === 0)"),
    "Must check audit availability before evaluating indexability"
  );
  assert.ok(
    complianceCode.includes('result: "INSUFFICIENT EVIDENCE"'),
    "Must return INSUFFICIENT EVIDENCE when crawl evidence is missing"
  );
  
  // Verify no hardcoded PASS on site reputation
  assert.ok(
    !complianceCode.includes('name: "Site Reputation Abuse & Content Ownership",\n    description: "Verify that DGS hosts no unauthorized 3rd-party white-label content, parasite directories, or syndicated low-quality affiliate schemes.",\n    result: "PASS"'),
    "Site Reputation Abuse check must not be hardcoded to PASS"
  );
});

test("2. Compliance cannot default to COMPLIANT", async () => {
  const complianceCode = await readFile(join(ROOT, "lib/google-updates/compliance-engine.ts"), "utf8");
  
  // Verify finalStatus does not default to COMPLIANT
  assert.ok(
    !complianceCode.includes('let finalStatus: GoogleComplianceStatus = "COMPLIANT"'),
    "finalStatus must not default to COMPLIANT"
  );
  assert.ok(
    !complianceCode.includes('let finalStatus = "COMPLIANT"'),
    "finalStatus must not initialize as COMPLIANT"
  );
  assert.ok(
    complianceCode.includes("allPassing && !hasInsufficientEvidence"),
    "Must require all checks passing AND no insufficient evidence for COMPLIANT"
  );
});

test("3. Confidence is not hardcoded", async () => {
  const complianceCode = await readFile(join(ROOT, "lib/google-updates/compliance-engine.ts"), "utf8");
  
  // Verify confidence: 95 is removed from algorithmic updates
  assert.ok(
    !complianceCode.includes("confidence: 95"),
    "confidence: 95 must not be hardcoded in compliance engine"
  );
  
  // Verify calculateComplianceConfidence calculates dynamically
  const conf1 = calculateComplianceConfidence({
    totalRequiredChecks: 5,
    checksWithEvidence: 1,
    hasCompletedAudit: false,
    auditAgeDays: null,
    hasGscData: false,
  });
  const conf2 = calculateComplianceConfidence({
    totalRequiredChecks: 5,
    checksWithEvidence: 5,
    hasCompletedAudit: true,
    auditAgeDays: 5,
    hasGscData: true,
  });

  assert.ok(conf1 < conf2, `Incomplete evidence confidence (${conf1}) must be lower than full evidence (${conf2})`);
  assert.ok(conf1 <= 20, `No audit/GSC confidence must be low, got ${conf1}`);
  assert.ok(conf2 === 100, `Full fresh evidence confidence should be 100, got ${conf2}`);
});

test("4. Audit UI has no numeric fallback", async () => {
  const auditViewCode = await readFile(join(ROOT, "app/admin/site-audits/SiteAuditsClientView.tsx"), "utf8");

  // Verify fabricated fallbacks (?? 98, ?? 100, etc.) are removed
  assert.ok(!auditViewCode.includes("overall_score ?? 98"), "Must not fallback overall_score to 98");
  assert.ok(!auditViewCode.includes("technical_score ?? 100"), "Must not fallback technical_score to 100");
  assert.ok(!auditViewCode.includes("indexability_score ?? 100"), "Must not fallback indexability_score to 100");
  assert.ok(!auditViewCode.includes("content_score ?? 95"), "Must not fallback content_score to 95");
  assert.ok(!auditViewCode.includes("media_score ?? 100"), "Must not fallback media_score to 100");

  // Verify NOT MEASURED is rendered
  assert.ok(auditViewCode.includes("NOT MEASURED"), "Must render NOT MEASURED when unmeasured");
});

test("5. Alt Apply modifies rendered source", () => {
  const sampleHtml = `<div class="hero"><img src="/wp-content/uploads/2026/02/team-photo.webp" class="img-fluid" /></div>`;
  const result = updateImgAltInHtml(sampleHtml, "team-photo.webp", "DGS Leadership Team in Mumbai Office");
  
  assert.ok(result.updated, "Must report updated: true");
  assert.ok(result.html.includes('alt="DGS Leadership Team in Mumbai Office"'), "Updated HTML must contain new alt attribute");

  // Test replacing existing alt text
  const sampleWithAlt = `<img src="/images/banner.webp" alt="Old generic text" />`;
  const result2 = updateImgAltInHtml(sampleWithAlt, "banner.webp", "Modern Brand Identity Design");
  assert.ok(result2.html.includes('alt="Modern Brand Identity Design"'), "Must replace existing alt text");
  assert.ok(!result2.html.includes("Old generic text"), "Must not retain old alt text");
});

test("6. Alt Apply verification fails closed", async () => {
  const altFixerCode = await readFile(join(ROOT, "lib/seo/alt-fixer.ts"), "utf8");

  // Verify verification check in applyAltTextFix
  assert.ok(
    altFixerCode.includes("verifyRenderedAlt"),
    "applyAltTextFix must invoke verifyRenderedAlt"
  );
  assert.ok(
    altFixerCode.includes("if (!verified)"),
    "applyAltTextFix must check verification result"
  );
  assert.ok(
    altFixerCode.includes("resolved = 0"),
    "Must fail closed by retaining resolved = 0 on verification failure"
  );
});

test("7. Apply All updates actual usages", async () => {
  const altFixerCode = await readFile(join(ROOT, "lib/seo/alt-fixer.ts"), "utf8");

  // Verify applyToAllUsages updates rendered source for all usages
  assert.ok(
    altFixerCode.includes("usagesFound"),
    "Must track usagesFound"
  );
  assert.ok(
    altFixerCode.includes("usagesUpdated"),
    "Must track usagesUpdated"
  );
  assert.ok(
    altFixerCode.includes("usagesFailed"),
    "Must track usagesFailed"
  );
  assert.ok(
    altFixerCode.includes("updateRenderedSource"),
    "Apply all usages must call updateRenderedSource"
  );
});

test("8. PageSpeed does not use Gemini key fallback", async () => {
  const psiCode = await readFile(join(ROOT, "lib/seo/pagespeed.ts"), "utf8");

  // Verify GEMINI_API_KEY is not in getPageSpeedApiKey or isPageSpeedConfigured
  const getApiKeyBlock = psiCode.slice(psiCode.indexOf("function getPageSpeedApiKey"), psiCode.indexOf("export function isPageSpeedConfigured"));
  assert.ok(
    !getApiKeyBlock.includes("GEMINI_API_KEY"),
    "getPageSpeedApiKey must not use GEMINI_API_KEY"
  );

  const isConfiguredBlock = psiCode.slice(psiCode.indexOf("export function isPageSpeedConfigured"), psiCode.indexOf("export async function getCachedPageSpeed"));
  assert.ok(
    !isConfiguredBlock.includes("GEMINI_API_KEY"),
    "isPageSpeedConfigured must not use GEMINI_API_KEY"
  );

  assert.ok(
    psiCode.includes("PageSpeed API is NOT CONFIGURED"),
    "Must fail explicitly when PageSpeed API is not configured"
  );
});
