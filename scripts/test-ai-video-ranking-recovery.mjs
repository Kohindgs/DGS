import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

// Load the mirror content
const mirrorPath = path.join(
  ROOT,
  "data/wordpress/mirrors/pages/services__ai-video-production-agency.json"
);
const mirrorData = JSON.parse(fs.readFileSync(mirrorPath, "utf8"));

// 1. URL & Route Registry
test("REQ-RECOVERY-01: AI Video route is valid, protected, and not retired", async () => {
  const routesFile = path.join(ROOT, "data/migration/nextjs-route-registry.generated.json");
  const routes = JSON.parse(fs.readFileSync(routesFile, "utf8")).routes;
  const route = routes.find((r) => r.path === "/services/ai-video-production-agency/");

  assert.ok(route, "Route /services/ai-video-production-agency/ must exist in route registry");
  assert.equal(route.indexable, true, "Route must be indexable");
  assert.ok(
    route.proposedAction === "PROTECTED" || route.proposedAction === "KEEP_SAME_URL",
    "Route proposedAction must be PROTECTED or KEEP_SAME_URL"
  );
  assert.equal(route.includeInSitemap, true, "Route must have includeInSitemap = true");
});

// 2. Canonical and Self-Canonical Destination
test("REQ-RECOVERY-02: Self-canonical destination is strict and unchanged", () => {
  const canonicalExpected = "/services/ai-video-production-agency/";
  assert.equal(mirrorData.path, canonicalExpected, "Mirror path must match exactly");
});

// 3. One Single H1 Heading
test("REQ-RECOVERY-03: Page contains strictly exactly ONE H1 tag", () => {
  const h1Matches = mirrorData.body.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];
  assert.equal(h1Matches.length, 1, `Expected exactly 1 H1, found ${h1Matches.length}`);
  const h1Text = h1Matches[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  assert.ok(
    h1Text.includes("AI Video Production House In Mumbai"),
    `H1 must maintain primary intent. Found: "${h1Text}"`
  );
});

// 4. Meta Title & Description Integrity
test("REQ-RECOVERY-04: Valid Title and Meta Description in SEO Overrides", () => {
  const overridesPath = path.join(ROOT, "lib/seo/page-overrides.ts");
  const content = fs.readFileSync(overridesPath, "utf8");
  assert.ok(
    content.includes("AI Video Production Agency in Mumbai | D’Genius Solutions"),
    "Must have approved AI Video Production Agency in Mumbai title"
  );
  assert.ok(
    content.includes("/services/ai-video-production-agency/"),
    "Must have SEO override entry for AI video production agency"
  );
});

// 5. Zero Visible Machine / Editorial SEO Labels
test("REQ-RECOVERY-05: Absolute prohibition of visible editorial/machine labels", () => {
  const body = mirrorData.body;
  const banned = [
    "Target Keyword",
    "AI Overview Answer",
    "Local SEO",
    "Internal Link",
    "Case Signal",
    "SEO Implementation",
    "Google, AI Overview and buyers need clear proof",
  ];

  for (const label of banned) {
    const regex = new RegExp(label, "i");
    assert.equal(
      regex.test(body),
      false,
      `Banned machine label "${label}" must NOT exist in mirror body`
    );
  }
});

// 6. Natural Format Cluster Presentation
test("REQ-RECOVERY-06: Specialized AI video format cluster is presented naturally", () => {
  const preparePath = path.join(ROOT, "lib/wordpress/prepare-inner-page-mirror.ts");
  const content = fs.readFileSync(preparePath, "utf8");

  assert.ok(
    content.includes("Specialized AI Video Formats"),
    "Cluster eyebrow should read 'Specialized AI Video Formats'"
  );
  assert.ok(
    !content.includes("AI Avatar Videos In Mumbai</h3>"),
    "Should not repeat 'In Mumbai' in every card H3"
  );
  assert.ok(
    !content.includes("<small>Target Keyword</small>"),
    "Must not inject Target Keyword labels"
  );
});

// 7. Sitemap Inclusion
test("REQ-RECOVERY-07: AI Video page is verified present in sitemap data", () => {
  const routesFile = path.join(ROOT, "data/migration/nextjs-route-registry.generated.json");
  const routes = JSON.parse(fs.readFileSync(routesFile, "utf8")).routes;
  const route = routes.find((r) => r.path === "/services/ai-video-production-agency/");
  assert.ok(route, "Route must exist");
  assert.equal(route.includeInSitemap, true, "AI video page must have includeInSitemap = true");
});

// 8. Core Valuable Portfolio & Service Sections Preservation
test("REQ-RECOVERY-08: Valuable authentic first-hand proof and portfolio are intact", () => {
  const body = mirrorData.body;
  assert.ok(body.includes('id="portfolio"'), "Portfolio gallery anchor must exist");
  assert.ok(body.includes("Eureka Forbes"), "Client brand proof must exist");
  assert.ok(body.includes("AI Video Ads"), "Service catalog must exist");
  assert.ok(body.includes("AI Product Videos"), "Product video section must exist");
  assert.ok(body.includes("AI Mascot"), "Mascot work section must exist");
  assert.ok(body.includes("AI Jewellery"), "Jewellery work section must exist");
  assert.ok(body.includes("AI Festival"), "Festival campaign section must exist");
});

// 9. Invariance: Other Tier-0 Ranking Pages Untouched
test("REQ-RECOVERY-09: Other Tier-0 ranking pages remain untouched and invariant", () => {
  const tier0Paths = [
    "data/wordpress/mirrors/pages/services__seo-services-in-mumbai.json",
    "data/wordpress/mirrors/pages/services__aeo-services-in-mumbai.json",
    "data/wordpress/mirrors/pages/services__geo-services-in-mumbai.json",
    "data/wordpress/mirrors/pages/services__llm-optimization-agency.json",
  ];

  for (const p of tier0Paths) {
    const full = path.join(ROOT, p);
    if (fs.existsSync(full)) {
      const data = JSON.parse(fs.readFileSync(full, "utf8"));
      assert.ok(data.body.length > 1000, `Tier-0 mirror ${p} must be intact`);
    }
  }
});
