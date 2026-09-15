import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { classifyNoindex, expectsStagingNoindex, jsonLdTypesFromHtml } from "./migration-audit-shared.mjs";
import {
  buildExpectedContextualLinks,
  isSiteInternalHref,
  loadApprovedLinkRestorations,
  removedHrefCorrections,
  restorationsForPath,
} from "./ranking-link-restorations.mjs";
import {
  canonicalFromHtml,
  diffContextualLinks,
  diffFaq,
  diffHeadings,
  diffImages,
  extractArticleHtml,
  extractContextualLinks,
  extractFaqItems,
  extractHeadings,
  extractImages,
  isImageLinkWrapArtifact,
  isTemplateLiteralHeading,
  meaningfulAltDiffs,
  meaningfulMissingHeadings,
  meaningfulMissingLinks,
  metaFromHtml,
  normalizePath,
  normalizeText,
  textSha256,
  titleFromHtml,
} from "./tier0-parity-compare.mjs";

const WP_ORIGIN = "https://www.dgeniussolutions.com";
const RANKING_BASELINE_PATH = path.join(process.cwd(), "data/migration/ranking-protection-baseline.json");
const RANKING_INTEGRITY_PATH = path.join(process.cwd(), "data/migration/ranking-protection-baseline.integrity.json");
const RANKING_POLICY_PATH = path.join(process.cwd(), "data/migration/ranking-protected-routes.json");

export function classifyFinding(kind, detail) {
  const map = {
    "staging-noindex": { class: "A", label: "EXPECTED_STAGING_DIFFERENCE", detail },
    "aeo-canonical": { class: "B", label: "APPROVED_TECHNICAL_CORRECTION", detail },
    "link-target": { class: "B", label: "APPROVED_TECHNICAL_LINK_TARGET_CORRECTION", detail },
    "broken-link-removal": { class: "B", label: "APPROVED_BROKEN_SOURCE_LINK_REMOVAL", detail },
    artifact: { class: "C", label: "AUDITOR_NORMALIZATION_ARTIFACT", detail },
    drift: { class: "D", label: "REAL_VISIBLE_CONTENT_DRIFT", detail },
    link: { class: "E", label: "REAL_INTERNAL_LINK_PARITY_DEFECT", detail },
    "broken-destination": { class: "E", label: "BROKEN_INTERNAL_LINK_DESTINATION", detail },
    unknown: { class: "F", label: "NEEDS_HUMAN_DECISION", detail },
  };
  return map[kind] || { class: "F", label: "NEEDS_HUMAN_DECISION", detail };
}

export function verifyBaselineIntegrity(baselineSerialized, integrity) {
  const actual = createHash("sha256").update(baselineSerialized).digest("hex");
  if (actual !== integrity.overallSha256) {
    return { ok: false, reason: `overall digest mismatch (expected ${integrity.overallSha256}, got ${actual})` };
  }
  const baseline = JSON.parse(baselineSerialized);
  for (const [routePath, expectedDigest] of Object.entries(integrity.routeDigests || {})) {
    const actualRoute = baseline.routes?.[routePath]?.routeSha256;
    if (actualRoute !== expectedDigest) {
      return { ok: false, reason: `route digest mismatch for ${routePath}` };
    }
  }
  return { ok: true, baseline };
}

export async function loadRankingProtectionContext() {
  const [baselineSerialized, integrity, policy, approvedRestorations] = await Promise.all([
    readFile(RANKING_BASELINE_PATH, "utf8"),
    readFile(RANKING_INTEGRITY_PATH, "utf8").then((raw) => JSON.parse(raw)),
    readFile(RANKING_POLICY_PATH, "utf8").then((raw) => JSON.parse(raw)),
    loadApprovedLinkRestorations(),
  ]);
  const integrityResult = verifyBaselineIntegrity(baselineSerialized, integrity);
  if (!integrityResult.ok) {
    throw new Error(`RANKING PROTECTION BASELINE INTEGRITY FAILURE: ${integrityResult.reason}`);
  }
  return {
    frozenBaseline: integrityResult.baseline,
    integrity,
    protectedPaths: new Set(policy.protectedPaths),
    approvedRestorations,
  };
}

async function checkDestinationHealth(requiredPath, target) {
  const expectedPath = normalizePath(requiredPath, target);
  const hops = [];
  let current = new URL(expectedPath, target).href;
  let response = null;

  for (let i = 0; i < 10; i++) {
    response = await fetch(current, {
      redirect: "manual",
      headers: { Accept: "text/html,*/*", "User-Agent": "DGS-Tier0-Preview/1.0" },
    });
    const location = response.headers.get("location");
    hops.push({ url: current, status: response.status, location });
    if (response.status >= 300 && response.status < 400 && location) {
      current = new URL(location, current).href;
      continue;
    }
    break;
  }

  const html = response?.status === 200 ? await response.text() : "";
  const canonicalHref = canonicalFromHtml(html);
  const canonicalPath = canonicalHref ? normalizePath(canonicalHref, target) : "";
  const robots = metaFromHtml(html, "robots");
  const xRobots = response?.headers.get("x-robots-tag") || "";
  const noindexInfo = classifyNoindex(robots, xRobots);
  const redirectHops = Math.max(0, hops.length - 1);
  const issues = [];

  if (!response || response.status === 404 || response.status === 410) {
    issues.push(`destination HTTP ${response?.status || "unknown"}`);
  } else if (response.status !== 200) {
    issues.push(`destination HTTP ${response.status}`);
  }
  if (redirectHops > 0) {
    issues.push(`${redirectHops} redirect hop(s); prefer direct 200 canonical URLs`);
  }
  if (canonicalPath && canonicalPath !== expectedPath) {
    issues.push(`final canonical ${canonicalPath} != required ${expectedPath}`);
  }
  if (!expectsStagingNoindex() && noindexInfo.hasNoindex) {
    issues.push(`destination not indexable (${noindexInfo.label || "noindex"})`);
  }

  return { requiredPath: expectedPath, issues, healthy: issues.length === 0 };
}

function verifyRemovedHrefCorrections(restorations, nextHeadings, nextLinks, nextArticleHtml, record) {
  for (const item of removedHrefCorrections(restorations)) {
    const heading = nextHeadings.find((h) => h.text === item.anchor);
    if (!heading) {
      record("drift", `approved broken-link removal requires visible heading "${item.anchor}"`, true);
      continue;
    }
    const wordpressPath = normalizePath(item.wordpressDestination, WP_ORIGIN);
    const linkedMatches = nextLinks.filter(
      (link) => link.anchor === item.anchor || normalizePath(link.path, WP_ORIGIN) === wordpressPath,
    );
    if (linkedMatches.length) {
      record("link", `"${item.anchor}" must not retain href`, true);
    }
    if (item.headingId) {
      const linkedHeadingPattern = new RegExp(
        `<h[1-6][^>]*id=["']${item.headingId}["'][^>]*>\\s*<a\\b`,
        "i",
      );
      if (linkedHeadingPattern.test(nextArticleHtml)) {
        record("link", `"${item.anchor}" heading still wraps anchor markup`, true);
      }
    }
    record(
      "broken-link-removal",
      `"${item.anchor}" — frozen WordPress ${wordpressPath}; href removed, visible text preserved`,
      false,
    );
  }
}

export async function auditRankingProtectedRoute({
  routePath,
  snapshot,
  html,
  response,
  sitemapPaths,
  approvedRestorations,
  target,
}) {
  const findings = [];
  const blockers = [];
  const record = (kind, detail, blocks = false) => {
    const finding = classifyFinding(kind, detail);
    findings.push(finding);
    if (blocks) blockers.push(finding);
  };

  const url = new URL(routePath, target);
  const title = titleFromHtml(html);
  const description = metaFromHtml(html, "description");
  const robots = metaFromHtml(html, "robots");
  const xRobots = response.headers.get("x-robots-tag") || "";
  const noindexInfo = classifyNoindex(robots, xRobots);
  const canonicalHref = canonicalFromHtml(html);
  const canonicalPath = canonicalHref ? normalizePath(canonicalHref, target) : "";
  const desiredCanonicalPath = normalizePath(snapshot.requiredNextCanonical, target);
  const schemaTypes = jsonLdTypesFromHtml(html);
  const inSitemap = sitemapPaths.includes(normalizePath(routePath, target));
  const hasBreadcrumbs = /breadcrumb/i.test(html);

  const nextArticleHtml = extractArticleHtml(html);
  const nextHeadings = extractHeadings(nextArticleHtml);
  const nextFaq = extractFaqItems(nextArticleHtml);
  const nextImages = extractImages(nextArticleHtml);
  const nextLinks = extractContextualLinks(nextArticleHtml, url.href);

  const baselineHeadings = snapshot.headings.map((h, index) => ({ index, level: h.level, text: h.text }));
  const headingDiff = diffHeadings(baselineHeadings, nextHeadings);
  const faqDiff = diffFaq(snapshot.faqs || [], nextFaq);
  const imageDiff = diffImages(snapshot.images || [], nextImages);
  const routeRestorations = restorationsForPath(approvedRestorations, routePath);
  const baselineLinks = buildExpectedContextualLinks(snapshot.contextualLinks || [], routeRestorations, target);
  const linkDiff = diffContextualLinks(baselineLinks, nextLinks);

  const missingHeadings = meaningfulMissingHeadings(headingDiff.missing);
  const missingLinks = meaningfulMissingLinks(linkDiff.missingInTarget);
  const altDiffs = meaningfulAltDiffs(imageDiff.altDiffs);
  const h1s = nextHeadings.filter((h) => h.level === "h1");
  const h1 = h1s[0]?.text || "";
  const hashMatch = textSha256(normalizeText(nextArticleHtml)) === snapshot.bodyTextSha256;

  if (response.status !== 200) record("drift", `HTTP ${response.status}`, true);
  if (noindexInfo.hasNoindex) {
    record(
      noindexInfo.classification === "A" ? "staging-noindex" : "drift",
      noindexInfo.label || "noindex",
      noindexInfo.classification !== "A",
    );
  }
  if (canonicalPath !== desiredCanonicalPath) {
    record("drift", `canonical ${canonicalPath || "missing"} != required ${desiredCanonicalPath}`, true);
  } else if (routePath === "/services/aeo-services-in-mumbai/") {
    record("aeo-canonical", `Next self-canonical ${canonicalPath}`, false);
  }
  if (!inSitemap) record("drift", "missing from sitemap.xml", true);
  if (!hasBreadcrumbs) record("drift", "breadcrumbs not detected", true);
  for (const requiredType of snapshot.requiredSchemaTypes || []) {
    if (!schemaTypes.includes(requiredType)) record("drift", `missing schema type ${requiredType}`, true);
  }
  if (title !== snapshot.title) record("drift", `title drift: "${title}"`, true);
  if (snapshot.metaDescription && description !== snapshot.metaDescription) {
    record("drift", "meta description drift", true);
  }
  if (h1s.length !== 1) record("drift", `expected 1 H1, found ${h1s.length}`, true);
  else if (h1 !== snapshot.h1) record("drift", `H1 drift: "${h1}"`, true);
  if (missingHeadings.length) {
    record("drift", `${missingHeadings.length} missing headings: ${missingHeadings.map((h) => h.text).slice(0, 3).join("; ")}`, true);
  }
  if (headingDiff.extra.length) {
    const meaningfulExtra = headingDiff.extra.filter((h) => h.text && !/^(Internal Link)$/i.test(h.text));
    if (meaningfulExtra.length) record("drift", `${meaningfulExtra.length} extra headings`, true);
  }
  if (faqDiff.missing.length) record("drift", `${faqDiff.missing.length} missing FAQ questions`, true);
  if (faqDiff.answerDiffs.length) record("drift", `${faqDiff.answerDiffs.length} FAQ answer wording differences`, true);
  if (missingLinks.length) {
    record(
      "link",
      `${missingLinks.length} missing contextual links: ${missingLinks
        .slice(0, 4)
        .map((l) => `"${l.anchor}" -> ${l.path}`)
        .join("; ")}`,
      true,
    );
  }
  for (const expected of baselineLinks) {
    if (expected.classification === "B" && expected.action !== "REMOVE_BROKEN_HREF") {
      record(
        "link-target",
        `"${expected.anchor}" WordPress ${expected.wordpressPath} -> required Next ${expected.path}`,
        false,
      );
    }
  }
  verifyRemovedHrefCorrections(routeRestorations, nextHeadings, nextLinks, nextArticleHtml, record);
  if (altDiffs.length) record("drift", `${altDiffs.length} meaningful image alt text differences`, true);
  else if (imageDiff.altDiffs.length) {
    record("artifact", `${imageDiff.altDiffs.length} image alt differences are lazy-load/placeholder normalization only`, false);
  }
  if (!hashMatch) {
    const structuralDrift =
      missingHeadings.length > 0 ||
      faqDiff.missing.length > 0 ||
      faqDiff.answerDiffs.length > 0 ||
      missingLinks.length > 0 ||
      altDiffs.length > 0;
    if (structuralDrift) record("drift", "normalized visible content hash differs with structural drift", true);
    else record("artifact", "normalized content hash differs without structural heading/FAQ/link loss", false);
  }

  for (const expected of baselineLinks) {
    const health = await checkDestinationHealth(expected.path, target);
    if (!health.healthy) {
      record(
        "broken-destination",
        `"${expected.anchor}" -> ${expected.path}: ${health.issues.join("; ")}`,
        true,
      );
    }
  }

  return { findings, blockers, passed: blockers.length === 0 };
}

function baselineContextualLinks(source) {
  return (source?.internalLinks || [])
    .filter((link) => isSiteInternalHref(link.href || link.path))
    .filter((link) => !/wp-content/i.test(link.href || link.path || ""))
    .map((link) => ({
      anchor: link.anchor || "",
      href: normalizePath(link.href || link.path, WP_ORIGIN),
      path: normalizePath(link.href || link.path, WP_ORIGIN),
      scope: "body",
      destination: normalizePath(link.href || link.path, WP_ORIGIN),
    }));
}

const SEO_MUMBAI_CITY_PATHS = new Set([
  "/services/seo-service-pune/",
  "/services/seo-service-in-banglore/",
  "/services/seo-services-in-hyderabad/",
  "/services/seo-service-in-gurugram/",
]);

function isSeoMumbaiCityMegalink(link) {
  return SEO_MUMBAI_CITY_PATHS.has(link.path) && /^0[1-4] \//.test(link.anchor || "");
}

function resolveSeoMumbaiMissingLinks(missingLinks, targetLinks) {
  const targetPaths = new Set(targetLinks.map((link) => link.path));
  const resolved = [];
  const splitCityBlocks = [];

  for (const link of missingLinks) {
    if (isSeoMumbaiCityMegalink(link) && targetPaths.has(link.path)) {
      splitCityBlocks.push(link.path);
      continue;
    }
    resolved.push(link);
  }

  return { missingLinks: resolved, splitCityBlocks };
}

export async function auditSeoMumbaiRoute({ route, source, html, response, target }) {
  const findings = [];
  const blockers = [];
  const record = (kind, detail, blocks = false) => {
    const finding = classifyFinding(kind, detail);
    findings.push(finding);
    if (blocks) blockers.push(finding);
  };

  const url = new URL(route.path, target);
  const title = titleFromHtml(html);
  const robots = metaFromHtml(html, "robots");
  const xRobots = response.headers.get("x-robots-tag") || "";
  const noindexInfo = classifyNoindex(robots, xRobots);
  const canonicalHref = canonicalFromHtml(html);
  const articleHtml = extractArticleHtml(html);
  const nextHeadings = extractHeadings(articleHtml);
  const nextFaq = extractFaqItems(articleHtml);
  const nextLinks = extractContextualLinks(articleHtml, url.href);
  const h1s = nextHeadings.filter((h) => h.level === "h1");
  const h1 = h1s[0]?.text || "";

  const sourceHeadings = (source?.headings || []).map((h, index) => ({ index, level: h.level, text: h.text }));
  const headingDiff = diffHeadings(sourceHeadings, nextHeadings);
  const faqDiff = diffFaq(source?.faqs || [], nextFaq);
  const expectedLinks = baselineContextualLinks(source);
  const linkDiff = diffContextualLinks(expectedLinks, nextLinks);

  const missingHeadings = meaningfulMissingHeadings(headingDiff.missing).filter(
    (h) => !isTemplateLiteralHeading(h.text),
  );
  const rawMissingLinks = meaningfulMissingLinks(linkDiff.missingInTarget).filter(
    (link) => !isImageLinkWrapArtifact(link),
  );
  const { missingLinks, splitCityBlocks } = resolveSeoMumbaiMissingLinks(rawMissingLinks, nextLinks);
  const hashMatch = source ? textSha256(normalizeText(articleHtml)) === source.content.normalizedTextSha256 : false;

  if (response.status !== 200) record("drift", `HTTP ${response.status}`, true);
  if (noindexInfo.hasNoindex) {
    record(
      noindexInfo.classification === "A" ? "staging-noindex" : "drift",
      noindexInfo.label || "noindex",
      noindexInfo.classification === "A" ? false : true,
    );
  }
  if (title !== route.observedTitle) record("drift", "title differs from protected baseline", true);
  if (h1 !== route.observedH1) record("drift", "H1 differs from protected baseline", true);
  if (!canonicalHref) record("drift", "canonical missing", true);
  else if (normalizePath(canonicalHref, target) !== normalizePath(route.desiredCanonicalPath || route.path, target)) {
    record("drift", `canonical points to ${canonicalHref}`, true);
  }
  if (!articleHtml) record("drift", "semantic migration article marker missing", true);
  if (missingHeadings.length) {
    record("drift", `${missingHeadings.length} missing headings: ${missingHeadings.map((h) => h.text).join("; ")}`, true);
  }
  if (faqDiff.missing.length) record("drift", `${faqDiff.missing.length} missing FAQ questions`, true);
  if (faqDiff.answerDiffs.length) record("drift", `${faqDiff.answerDiffs.length} FAQ answer wording differences`, true);
  if (splitCityBlocks.length) {
    record(
      "artifact",
      `${splitCityBlocks.length} city-block links split into heading/label/tag anchors with same destinations: ${splitCityBlocks.join(", ")}`,
      false,
    );
  }
  if (missingLinks.length) {
    record(
      "link",
      `${missingLinks.length} missing contextual links: ${missingLinks
        .slice(0, 4)
        .map((l) => `"${l.anchor}" -> ${l.path}`)
        .join("; ")}`,
      true,
    );
  }
  if (!hashMatch) {
    const structuralDrift =
      missingHeadings.length > 0 ||
      faqDiff.missing.length > 0 ||
      faqDiff.answerDiffs.length > 0 ||
      missingLinks.length > 0;
    if (structuralDrift) record("drift", "normalized visible content hash differs with structural drift", true);
    else record("artifact", "normalized visible content hash differs without structural heading/FAQ/link loss", false);
  }

  for (const expected of expectedLinks) {
    const health = await checkDestinationHealth(expected.path, target);
    if (!health.healthy) {
      record("broken-destination", `"${expected.anchor}" -> ${expected.path}: ${health.issues.join("; ")}`, true);
    }
  }

  return { findings, blockers, passed: blockers.length === 0 };
}
