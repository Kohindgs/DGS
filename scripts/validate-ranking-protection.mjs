#!/usr/bin/env node
/**
 * Ranking-protection release blocker.
 * Compares four ranking-protected service routes against the WordPress baseline.
 * Fails release on unexplained drift in search-visible semantics.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import {
  classifyNoindex,
  expectsStagingNoindex,
  jsonLdTypesFromHtml,
} from "./lib/migration-audit-shared.mjs";
import {
  canonicalFromHtml,
  decode,
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
const WP_ORIGIN = "https://www.dgeniussolutions.com";
const OUT = path.join(ROOT, "data/audit/ranking-protection-report.json");

const [policy, tier0, contentBaseline, pagesRaw, servicesRaw] = await Promise.all([
  readJson(path.join(ROOT, "data/migration/ranking-protected-routes.json")),
  readJson(path.join(ROOT, "data/migration/tier0-routes.json")),
  readJson(path.join(ROOT, "data/migration/tier0-content-baseline.generated.json")),
  readJson(path.join(ROOT, "data/wordpress/raw/pages.json")),
  readJson(path.join(ROOT, "data/wordpress/raw/services.json")),
]);

const recordsById = new Map([...pagesRaw, ...servicesRaw].map((item) => [Number(item.id), item]));
const baselineByPath = new Map(contentBaseline.baselines.map((item) => [item.path, item]));
const tier0ByPath = new Map(tier0.routes.map((item) => [item.path, item]));
const protectedRoutes = policy.protectedPaths
  .map((routePath) => tier0ByPath.get(routePath))
  .filter(Boolean);

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
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
    artifact: { class: "C", label: "AUDITOR_NORMALIZATION_ARTIFACT" },
    drift: { class: "D", label: "REAL_VISIBLE_CONTENT_DRIFT" },
    link: { class: "E", label: "REAL_INTERNAL_LINK_PARITY_DEFECT" },
    unknown: { class: "F", label: "NEEDS_HUMAN_DECISION" },
  };
  return { ...map[kind], detail };
}

const sitemap = await fetchSitemapPaths();
const routeReports = [];
const blockingFailures = [];
const explainedFindings = [];

for (const route of protectedRoutes) {
  const routePolicyMeta = policy.observedMetaDescriptions?.[route.path] || "";
  const wpRecord = recordsById.get(Number(route.wordpressId));
  const baseline = baselineByPath.get(route.path);
  const wpHtml = wpRecord?.content?.rendered || "";

  const url = new URL(route.path, TARGET);
  const response = await fetch(url, {
    redirect: "manual",
    headers: { Accept: "text/html,*/*", "User-Agent": "DGS-Ranking-Protection/1.0" },
  });

  let html = "";
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    blockingFailures.push(`${route.path}: redirect ${response.status} -> ${location || "unknown"}`);
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
  const desiredCanonicalPath = normalizePath(route.desiredCanonicalPath || route.path, TARGET);
  const schemaTypes = jsonLdTypesFromHtml(html);
  const inSitemap = sitemap.paths.includes(normalizePath(route.path, TARGET));
  const hasBreadcrumbs = /breadcrumb/i.test(html);

  const wpArticleHtml = wpHtml;
  const nextArticleHtml = extractArticleHtml(html);
  const wpHeadings = extractHeadings(wpArticleHtml);
  const nextHeadings = extractHeadings(nextArticleHtml);
  const wpFaq = extractFaqItems(wpArticleHtml);
  const nextFaq = extractFaqItems(nextArticleHtml);
  const wpImages = extractImages(wpArticleHtml);
  const nextImages = extractImages(nextArticleHtml);
  const wpLinks = extractContextualLinks(wpArticleHtml, `${WP_ORIGIN}${route.path}`);
  const nextLinks = extractContextualLinks(nextArticleHtml, url.href);

  const headingDiff = diffHeadings(wpHeadings, nextHeadings);
  const faqDiff = diffFaq(wpFaq, nextFaq);
  const imageDiff = diffImages(wpImages, nextImages);
  const linkDiff = diffContextualLinks(wpLinks, nextLinks);

  const missingHeadings = meaningfulMissingHeadings(headingDiff.missing);
  const missingLinks = meaningfulMissingLinks(linkDiff.missingInTarget);
  const altDiffs = meaningfulAltDiffs(imageDiff.altDiffs);

  const h1s = nextHeadings.filter((h) => h.level === "h1");
  const h1 = h1s[0]?.text || "";

  const normalizedWp = normalizeText(wpArticleHtml);
  const normalizedNext = normalizeText(nextArticleHtml);
  const hashMatch = baseline
    ? textSha256(normalizedNext) === baseline.content.normalizedTextSha256
    : textSha256(normalizedNext) === textSha256(normalizedWp);

  const findings = [];
  const blockers = [];

  const record = (kind, detail, blocks = false) => {
    const finding = classify(kind, detail);
    findings.push(finding);
    if (blocks) {
      blockers.push(`${route.path}: [${finding.class}] ${detail}`);
      blockingFailures.push(`${route.path}: [${finding.class}] ${detail}`);
    } else {
      explainedFindings.push(`${route.path}: [${finding.class}] ${detail}`);
    }
  };

  if (response.status !== 200) record("drift", `HTTP ${response.status}`, true);
  if (noindexInfo.hasNoindex) {
    record(noindexInfo.classification === "A" ? "staging-noindex" : "drift", noindexInfo.label || "noindex", noindexInfo.classification !== "A");
  }

  if (canonicalPath !== desiredCanonicalPath) {
    record("drift", `canonical ${canonicalPath || "missing"} != required ${desiredCanonicalPath}`, true);
  } else if (route.path === "/services/aeo-services-in-mumbai/") {
    record("aeo-canonical", `Next self-canonical ${canonicalPath} (WordPress defective /services/aeo/ not restored)`, false);
  }

  if (!inSitemap) record("drift", "missing from sitemap.xml", true);
  if (!hasBreadcrumbs) record("drift", "breadcrumbs not detected", true);

  for (const requiredType of policy.requiredSchemaTypes || []) {
    if (!schemaTypes.includes(requiredType)) {
      record("drift", `missing schema type ${requiredType}`, true);
    }
  }

  if (title !== route.observedTitle) record("drift", `title drift: "${title}"`, true);
  if (routePolicyMeta && description !== routePolicyMeta) {
    record("drift", `meta description drift`, true);
  }
  if (h1s.length !== 1) record("drift", `expected 1 H1, found ${h1s.length}`, true);
  else if (h1 !== route.observedH1) record("drift", `H1 drift: "${h1}"`, true);

  if (missingHeadings.length) record("drift", `${missingHeadings.length} missing headings: ${missingHeadings.map((h) => h.text).slice(0, 3).join("; ")}`, true);
  if (headingDiff.extra.length) record("drift", `${headingDiff.extra.length} extra headings`, true);
  if (headingDiff.orderChanged && missingHeadings.length) record("drift", "heading order changed with missing headings", true);

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
  if (linkDiff.extraInTarget.length) {
    const meaningfulExtra = linkDiff.extraInTarget.filter((l) => l.anchor?.trim() && !/\/wp-content\//.test(l.path));
    if (meaningfulExtra.length) {
      record("link", `${meaningfulExtra.length} extra contextual links`, true);
    }
  }

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

  const imageWrapOnly =
    linkDiff.missingInTarget.length > 0 &&
    missingLinks.length === 0 &&
    linkDiff.missingInTarget.every((l) => !l.anchor?.trim());
  if (imageWrapOnly) {
    record("artifact", `${linkDiff.missingInTarget.length} empty-anchor image link wraps only`, false);
  }

  routeReports.push({
    path: route.path,
    label: route.label,
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

const report = {
  checkedAt: new Date().toISOString(),
  target: TARGET.origin,
  sourceOfTruth: policy.sourceOfTruth,
  expectStagingNoindex: expectsStagingNoindex(),
  protectedRouteCount: routeReports.length,
  routes: routeReports,
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
console.log(JSON.stringify({ protectedRouteCount: routeReports.length, explainedFindings }, null, 2));
