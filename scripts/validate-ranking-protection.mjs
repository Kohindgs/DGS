#!/usr/bin/env node
/**
 * Ranking-protection release blocker.
 * Uses immutable data/migration/ranking-protection-baseline.json as authority.
 */
import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import {
  classifyNoindex,
  expectsStagingNoindex,
  jsonLdTypesFromHtml,
} from "./lib/migration-audit-shared.mjs";
import {
  buildExpectedContextualLinks,
  collectRequiredDestinations,
  loadApprovedLinkRestorations,
  removedHrefCorrections,
  restorationsForPath,
} from "./lib/ranking-link-restorations.mjs";
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
  meaningfulAltDiffs,
  meaningfulMissingHeadings,
  meaningfulMissingLinks,
  metaFromHtml,
  normalizePath,
  normalizeText,
  textSha256,
  titleFromHtml,
} from "./lib/tier0-parity-compare.mjs";

const ROOT = process.cwd();
const TARGET = new URL(process.env.MIGRATION_TARGET_URL || "http://127.0.0.1:3000");
const BASELINE_PATH = path.join(ROOT, "data/migration/ranking-protection-baseline.json");
const INTEGRITY_PATH = path.join(ROOT, "data/migration/ranking-protection-baseline.integrity.json");
const OUT = path.join(ROOT, "data/audit/ranking-protection-report.json");

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function verifyBaselineIntegrity(baselineSerialized, integrity) {
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

async function fetchSitemapPaths() {
  const res = await fetch(new URL("/sitemap.xml", TARGET), {
    headers: { Accept: "application/xml,text/xml,*/*" },
  });
  const xml = await res.text();
  return {
    status: res.status,
    paths: [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => normalizePath(m[1], TARGET)),
  };
}

function classify(kind, detail) {
  const map = {
    "staging-noindex": { class: "A", label: "EXPECTED_STAGING_DIFFERENCE" },
    "aeo-canonical": { class: "B", label: "APPROVED_TECHNICAL_CORRECTION" },
    "link-target": { class: "B", label: "APPROVED_TECHNICAL_LINK_TARGET_CORRECTION" },
    "broken-link-removal": { class: "B", label: "APPROVED_BROKEN_SOURCE_LINK_REMOVAL" },
    artifact: { class: "C", label: "AUDITOR_NORMALIZATION_ARTIFACT" },
    drift: { class: "D", label: "REAL_VISIBLE_CONTENT_DRIFT" },
    link: { class: "E", label: "REAL_INTERNAL_LINK_PARITY_DEFECT" },
    "broken-destination": { class: "E", label: "BROKEN_INTERNAL_LINK_DESTINATION" },
    unknown: { class: "F", label: "NEEDS_HUMAN_DECISION" },
  };
  return { ...map[kind], detail };
}

async function checkDestinationHealth(requiredPath) {
  const expectedPath = normalizePath(requiredPath, TARGET);
  const hops = [];
  let current = new URL(expectedPath, TARGET).href;
  let response = null;

  for (let i = 0; i < 10; i++) {
    response = await fetch(current, {
      redirect: "manual",
      headers: { Accept: "text/html,*/*", "User-Agent": "DGS-Ranking-Protection/1.0" },
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
  const canonicalPath = canonicalHref ? normalizePath(canonicalHref, TARGET) : "";
  const robots = metaFromHtml(html, "robots");
  const xRobots = response?.headers.get("x-robots-tag") || "";
  const noindexInfo = classifyNoindex(robots, xRobots);
  const redirectHops = Math.max(0, hops.length - 1);
  const finalPath = normalizePath(current, TARGET);
  const issues = [];

  if (!response || response.status === 404 || response.status === 410) {
    issues.push(`destination HTTP ${response?.status || "unknown"}`);
  } else if (response.status !== 200) {
    issues.push(`destination HTTP ${response.status}`);
  }
  if (redirectHops > 0) {
    issues.push(`${redirectHops} redirect hop(s); protected internal links must be direct 200 canonical URLs`);
  }
  if (canonicalPath && canonicalPath !== expectedPath) {
    issues.push(`final canonical ${canonicalPath} != required ${expectedPath}`);
  }
  if (!expectsStagingNoindex() && noindexInfo.hasNoindex) {
    issues.push(`destination not indexable (${noindexInfo.label || "noindex"})`);
  }

  return {
    requiredPath: expectedPath,
    finalPath,
    httpStatus: response?.status || 0,
    redirectHops,
    canonicalPath,
    indexable: !noindexInfo.hasNoindex,
    issues,
    healthy: issues.length === 0,
  };
}

function verifyRemovedHrefCorrections(routePath, restorations, nextHeadings, nextLinks, nextArticleHtml, record) {
  for (const item of removedHrefCorrections(restorations)) {
    const heading = nextHeadings.find((h) => h.text === item.anchor);
    if (!heading) {
      record("drift", `approved broken-link removal requires visible heading "${item.anchor}"`, true);
      continue;
    }

    const wordpressPath = normalizePath(item.wordpressDestination, TARGET);
    const linkedMatches = nextLinks.filter(
      (link) =>
        link.anchor === item.anchor || normalizePath(link.path, TARGET) === wordpressPath,
    );
    if (linkedMatches.length) {
      record(
        "link",
        `"${item.anchor}" must not retain href (found ${linkedMatches.map((l) => l.path).join(", ")})`,
        true,
      );
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

    const strayHrefPattern = new RegExp(
      `href=["'][^"']*${wordpressPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
      "i",
    );
    if (strayHrefPattern.test(nextArticleHtml)) {
      record("link", `article still contains href to removed destination ${wordpressPath}`, true);
    }

    record(
      "broken-link-removal",
      `"${item.anchor}" — frozen WordPress ${wordpressPath}; href removed, visible text preserved`,
      false,
    );
  }
}

const baselineSerialized = await readFile(BASELINE_PATH, "utf8");
const integrity = await readJson(INTEGRITY_PATH);
const integrityResult = verifyBaselineIntegrity(baselineSerialized, integrity);
if (!integrityResult.ok) {
  console.error("FAIL — RANKING PROTECTION BASELINE INTEGRITY FAILURE\n");
  console.error(`  - ${integrityResult.reason}`);
  process.exit(1);
}

const frozenBaseline = integrityResult.baseline;
const approvedRestorations = await loadApprovedLinkRestorations();
const sitemap = await fetchSitemapPaths();
const routeReports = [];
const blockingFailures = [];
const explainedFindings = [];

for (const [routePath, snapshot] of Object.entries(frozenBaseline.routes)) {
  const url = new URL(routePath, TARGET);
  const response = await fetch(url, {
    redirect: "manual",
    headers: { Accept: "text/html,*/*", "User-Agent": "DGS-Ranking-Protection/1.0" },
  });

  let html = "";
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    blockingFailures.push(`${routePath}: redirect ${response.status} -> ${location || "unknown"}`);
    if (location) {
      const follow = await fetch(new URL(location, TARGET), { redirect: "follow" });
      html = await follow.text();
    }
  } else {
    html = await response.text();
  }

  const title = titleFromHtml(html);
  const description = metaFromHtml(html, "description");
  const robots = metaFromHtml(html, "robots");
  const xRobots = response.headers.get("x-robots-tag") || "";
  const noindexInfo = classifyNoindex(robots, xRobots);
  const canonicalHref = canonicalFromHtml(html);
  const canonicalPath = canonicalHref ? normalizePath(canonicalHref, TARGET) : "";
  const desiredCanonicalPath = normalizePath(snapshot.requiredNextCanonical, TARGET);
  const schemaTypes = jsonLdTypesFromHtml(html);
  const inSitemap = sitemap.paths.includes(normalizePath(routePath, TARGET));
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
  const baselineLinks = buildExpectedContextualLinks(snapshot.contextualLinks || [], routeRestorations, TARGET);
  const linkDiff = diffContextualLinks(baselineLinks, nextLinks);

  const missingHeadings = meaningfulMissingHeadings(headingDiff.missing);
  const missingLinks = meaningfulMissingLinks(linkDiff.missingInTarget);
  const altDiffs = meaningfulAltDiffs(imageDiff.altDiffs);

  const h1s = nextHeadings.filter((h) => h.level === "h1");
  const h1 = h1s[0]?.text || "";
  const normalizedNext = normalizeText(nextArticleHtml);
  const hashMatch = textSha256(normalizedNext) === snapshot.bodyTextSha256;

  const findings = [];
  const blockers = [];

  const record = (kind, detail, blocks = false) => {
    const finding = classify(kind, detail);
    findings.push(finding);
    if (blocks) {
      blockers.push(`${routePath}: [${finding.class}] ${detail}`);
      blockingFailures.push(`${routePath}: [${finding.class}] ${detail}`);
    } else {
      explainedFindings.push(`${routePath}: [${finding.class}] ${detail}`);
    }
  };

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
    record("aeo-canonical", `Next self-canonical ${canonicalPath} (WordPress /services/aeo/ not restored)`, false);
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
    record(
      "drift",
      `${missingHeadings.length} missing headings: ${missingHeadings.map((h) => h.text).slice(0, 3).join("; ")}`,
      true,
    );
  }
  if (headingDiff.extra.length) {
    const meaningfulExtra = headingDiff.extra.filter((h) => h.text && !/^(Internal Link)$/i.test(h.text));
    if (meaningfulExtra.length) record("drift", `${meaningfulExtra.length} extra headings`, true);
  }
  if (headingDiff.orderChanged && missingHeadings.length) {
    record("drift", "heading order changed with missing headings", true);
  }

  if (faqDiff.missing.length) record("drift", `${faqDiff.missing.length} missing FAQ questions`, true);
  if (faqDiff.extra.length) record("drift", `${faqDiff.extra.length} extra FAQ questions`, true);
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

  verifyRemovedHrefCorrections(routePath, routeRestorations, nextHeadings, nextLinks, nextArticleHtml, record);

  if (altDiffs.length) {
    record("drift", `${altDiffs.length} meaningful image alt text differences`, true);
  } else if (imageDiff.altDiffs.length) {
    record("artifact", `${imageDiff.altDiffs.length} image alt differences are lazy-load/placeholder normalization only`, false);
  }

  if (!hashMatch) {
    const structuralDrift =
      missingHeadings.length > 0 ||
      faqDiff.missing.length > 0 ||
      faqDiff.answerDiffs.length > 0 ||
      missingLinks.length > 0 ||
      altDiffs.length > 0;
    if (structuralDrift) {
      record("drift", "normalized visible content hash differs with structural drift", true);
    } else {
      record("artifact", "normalized content hash differs without structural heading/FAQ/link loss", false);
    }
  }

  routeReports.push({
    path: routePath,
    baselineRouteSha256: snapshot.routeSha256,
    httpStatus: response.status,
    indexable: !noindexInfo.hasNoindex,
    noindexClassification: noindexInfo.label,
    expectStagingNoindex: expectsStagingNoindex(),
    title,
    description,
    h1,
    canonicalPath,
    desiredCanonicalPath,
    selfCanonical: canonicalPath === desiredCanonicalPath,
    inSitemap,
    hasBreadcrumbs,
    schemaTypes,
    contentHashMatch: hashMatch,
    content: {
      missingHeadings,
      extraHeadings: headingDiff.extra,
      headingOrderChanged: headingDiff.orderChanged,
      faq: faqDiff,
      missingLinks,
      extraLinks: linkDiff.extraInTarget,
      altDiffs,
    },
    findings,
    blocking: blockers,
  });
}

const destinationChecks = [];
const requiredDestinations = collectRequiredDestinations(approvedRestorations, frozenBaseline, TARGET);
for (const destination of requiredDestinations) {
  const health = await checkDestinationHealth(destination.requiredPath);
  destinationChecks.push({
    ...destination,
    ...health,
  });
  if (!health.healthy) {
    const detail = `"${destination.anchor}" on ${destination.sourceRoute} -> ${destination.requiredPath}: ${health.issues.join("; ")}`;
    blockingFailures.push(`${destination.sourceRoute}: [E] ${detail}`);
    explainedFindings.push(`${destination.sourceRoute}: [E] BROKEN_INTERNAL_LINK_DESTINATION — ${detail}`);
  } else if (destination.classification === "B") {
    explainedFindings.push(
      `${destination.sourceRoute}: [B] "${destination.anchor}" approved link-target correction ${destination.wordpressPath} -> ${destination.requiredPath}`,
    );
  }
}

const report = {
  checkedAt: new Date().toISOString(),
  target: TARGET.origin,
  baselineOverallSha256: integrity.overallSha256,
  baselineIntegrity: "pass",
  expectStagingNoindex: expectsStagingNoindex(),
  protectedRouteCount: routeReports.length,
  routes: routeReports,
  destinationChecks,
  explainedFindings,
  blockingFailures,
  passed: blockingFailures.length === 0,
};

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (blockingFailures.length) {
  console.error("FAIL — RANKING PROTECTION RELEASE BLOCKED\n");
  for (const failure of blockingFailures) console.error(`  - ${failure}`);
  console.error(`\nReport: ${OUT}`);
  process.exit(1);
}

console.log("PASS — RANKING PROTECTED ROUTES PRESERVED");
console.log(
  JSON.stringify(
    {
      baselineIntegrity: "pass",
      baselineOverallSha256: integrity.overallSha256,
      protectedRouteCount: routeReports.length,
      explainedFindings,
    },
    null,
    2,
  ),
);
