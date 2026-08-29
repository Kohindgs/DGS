import {
  canonicalFromHtml,
  extractArticleHtml,
  extractContextualLinks,
  extractFaqItems,
  extractHeadings,
  extractImages,
  metaFromHtml,
  normalizePath,
  normalizeText,
  titleFromHtml,
  diffHeadings,
  meaningfulMissingHeadings,
  isTemplateLiteralHeading,
} from "./tier0-parity-compare.mjs";
import { classifyNoindex, expectsStagingNoindex, jsonLdTypesFromHtml } from "./migration-audit-shared.mjs";
import { isSiteInternalHref } from "./ranking-link-restorations.mjs";
import {
  createProbeCache,
  mapWithConcurrency,
  validateImageAsset,
  validateInternalLink,
  isBrokenImageClassification,
  isBrokenLinkClassification,
} from "./media-link-audit.mjs";
import { applyTechnicalLinkCorrections } from "./technical-link-corrections.mjs";

export const MIGRATION_CLASSES = [
  "200_RETAINED",
  "301_REDIRECT",
  "308_REDIRECT",
  "410_RETIRED",
  "NOINDEX_RETAINED",
  "NON_HTML",
  "NOT_MIGRATED",
  "BROKEN",
];

export const VISUAL_STATUSES = [
  "VISUAL_MIRROR_COMPLETE",
  "VISUAL_MIRROR_PARTIAL",
  "VISUAL_MIRROR_PENDING",
  "RANKING_PROTECTED",
  "NOT_APPLICABLE",
];

export const CONTENT_STATUSES = [
  "CONTENT_COMPLETE",
  "CONTENT_INCOMPLETE",
  "RANKING_PROTECTED",
  "INTENTIONALLY_NATIVE",
  "CONTENT_REVIEW_REQUIRED",
  "NOT_APPLICABLE",
];

/** Approved native Next routes — not compared against WordPress block parity. */
export const INTENTIONALLY_NATIVE_PATHS = new Set(["/portfolio/", "/services/"]);

const NON_RETAINED_MIGRATION_CLASSES = new Set([
  "301_REDIRECT",
  "308_REDIRECT",
  "410_RETIRED",
  "NON_HTML",
  "NOT_MIGRATED",
  "BROKEN",
]);

const PROTECTED_RANKING_PATHS = new Set([
  "/services/ai-video-production-agency/",
  "/services/aeo-services-in-mumbai/",
  "/services/geo/",
  "/services/llm-seo-service/",
]);

const TIER0_PATHS = new Set([
  ...PROTECTED_RANKING_PATHS,
  "/services/seo-services-in-mumbai/",
]);

const EXPLICIT_NON_HTML = new Set([
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
  "/llms-full.txt",
]);

export function cleanPath(input, base = "https://www.dgeniussolutions.com") {
  if (!input) return "";
  return normalizePath(input, base);
}

export function spanText(spans = []) {
  return spans.map((s) => s.text || "").join("").trim();
}

export function extractExpectedFromBlocks(blocks = [], { wordpressId = null } = {}) {
  const headings = [];
  const paragraphs = [];
  const lists = [];
  const faqs = [];
  const links = [];
  const images = [];
  const ctas = [];

  for (const [index, block] of blocks.entries()) {
    const blockRef = { index, type: block.type, id: block.id || null, wordpressId };
    if (block.type === "heading" && block.text) {
      headings.push({ ...blockRef, level: `h${block.level}`, text: block.text.trim() });
      if (block.href) {
        links.push({ ...blockRef, anchor: block.text.trim(), path: cleanPath(block.href) });
      }
    }
    if (block.type === "paragraph") {
      const text = spanText(block.content);
      if (text) paragraphs.push({ ...blockRef, text });
      for (const span of block.content || []) {
        if (span.href) {
          links.push({ ...blockRef, anchor: span.text?.trim() || text, path: cleanPath(span.href) });
        }
      }
    }
    if (block.type === "list") {
      for (const item of block.items || []) {
        const text = spanText(item);
        if (text) lists.push({ ...blockRef, text });
        for (const span of item || []) {
          if (span.href) {
            links.push({ ...blockRef, anchor: span.text?.trim() || text, path: cleanPath(span.href) });
          }
        }
      }
    }
    if (block.type === "faq") {
      for (const item of block.items || []) {
        faqs.push({
          ...blockRef,
          question: item.question?.trim() || "",
          answer: spanText(item.answer),
        });
      }
    }
    if (block.type === "image" && block.src) {
      images.push({ ...blockRef, src: block.src, alt: block.alt || "" });
    }
    if (block.type === "cta" && block.label) {
      ctas.push({ ...blockRef, label: block.label.trim() });
    }
  }

  return { headings, paragraphs, lists, faqs, links, images, ctas };
}

export function classifyVisualMirror(path, template, migrationClass) {
  if (NON_RETAINED_MIGRATION_CLASSES.has(migrationClass) || EXPLICIT_NON_HTML.has(path)) {
    return "NOT_APPLICABLE";
  }

  if (path === "/") return "VISUAL_MIRROR_COMPLETE";
  if (PROTECTED_RANKING_PATHS.has(path)) return "RANKING_PROTECTED";
  if (path === "/services/seo-services-in-mumbai/") return "RANKING_PROTECTED";
  if (template === "ContactForm") return "VISUAL_MIRROR_PARTIAL";
  if (template === "Portfolio") return "VISUAL_MIRROR_PARTIAL";
  if (template === "ServicesArchive") return "VISUAL_MIRROR_PARTIAL";
  if (template === "Homepage") return "VISUAL_MIRROR_COMPLETE";
  return "VISUAL_MIRROR_PENDING";
}

export function isMshotsExternalDependency(src) {
  if (!src) return false;
  try {
    const url = new URL(src, "https://www.dgeniussolutions.com");
    return url.hostname === "s.wordpress.com" && url.pathname.startsWith("/mshots/");
  } catch {
    return /s\.wordpress\.com\/mshots/i.test(src);
  }
}

/** UI-locked homepage CDN icons — external but non-blocking in Phase 1 audit. */
export function isHomepageUiLockedExternalIcon(src) {
  if (!src) return false;
  try {
    return new URL(src).hostname === "cdn.simpleicons.org";
  } catch {
    return /cdn\.simpleicons\.org/i.test(src);
  }
}

function isNonBlockingExternalImage(src, routePath) {
  if (isMshotsExternalDependency(src)) return true;
  if (routePath === "/" && isHomepageUiLockedExternalIcon(src)) return true;
  return false;
}

export function classifyMigration({
  path,
  redirect,
  retired,
  registryRoute,
  indexability,
  livePage,
  approvedDecision,
}) {
  if (EXPLICIT_NON_HTML.has(path)) return "NON_HTML";
  if (approvedDecision?.classification === "NON_HTML_RESOURCE") return "NON_HTML";
  if (path.endsWith(".kml") || path.endsWith(".xml") && path !== "/sitemap.xml") return "NON_HTML";
  if (retired) return "410_RETIRED";
  if (redirect) return redirect.statusCode === 308 ? "308_REDIRECT" : "301_REDIRECT";
  const approvedRetained =
    approvedDecision?.approved &&
    (approvedDecision.indexable === true || approvedDecision.indexable === false);
  const registryRetained =
    registryRoute &&
    (registryRoute.proposedAction === "KEEP_SAME_URL" || registryRoute.proposedAction === "PROTECTED");
  if (approvedRetained || registryRetained) {
    if (
      (indexability && indexability.indexable === false) ||
      (approvedDecision && approvedDecision.indexable === false) ||
      (registryRoute && registryRoute.indexable === false)
    ) {
      return "NOINDEX_RETAINED";
    }
    return "200_RETAINED";
  }
  if (livePage?.status === 404 || livePage?.status === 410) return "BROKEN";
  if (!registryRoute && !livePage && !approvedDecision) return "NOT_MIGRATED";
  return "NOT_MIGRATED";
}

export function compareRenderedContent(expected, html, pageUrl) {
  const article = extractArticleHtml(html);
  const renderedHeadings = extractHeadings(article || html);
  const renderedFaq = extractFaqItems(article || html);
  const renderedLinks = extractContextualLinks(article || html, pageUrl);
  const renderedImages = extractImages(article || html);
  const renderedText = normalizeText(article || html);

  const sourceHeadings = expected.headings.map((h, index) => ({
    index,
    level: h.level,
    text: h.text,
  }));
  const headingDiff = diffHeadings(sourceHeadings, renderedHeadings);
  const missingHeadings = meaningfulMissingHeadings(headingDiff.missing).filter(
    (h) => !isTemplateLiteralHeading(h.text),
  );

  const missingParagraphs = expected.paragraphs.filter((entry) => {
    const needle = normalizeText(entry.text).slice(0, 80);
    return needle.length > 20 && !renderedText.includes(needle);
  });

  const missingFaqs = expected.faqs.filter(
    (f) => f.question && !renderedFaq.some((r) => r.question === f.question),
  );

  const faqAnswerDiffs = expected.faqs
    .filter((f) => {
      const match = renderedFaq.find((r) => r.question === f.question);
      return match && normalizeText(match.answer) !== normalizeText(f.answer);
    })
    .map((f) => ({
      question: f.question,
      wordpressId: f.wordpressId,
      blockIndex: f.index,
      blockType: f.type,
    }));

  const missingLists = expected.lists.filter((entry) => {
    const needle = normalizeText(entry.text).slice(0, 60);
    return needle.length > 15 && !renderedText.includes(needle);
  });

  const internalExpectedLinks = expected.links.filter(
    (l) => l.path.startsWith("/") && !/wp-content/i.test(l.path),
  );
  const renderedPaths = new Set(renderedLinks.map((l) => l.path));
  const missingLinks = internalExpectedLinks.filter((l) => {
    if (renderedPaths.has(l.path)) return false;
    const anchorNeedle = normalizeText(l.anchor).slice(0, 40);
    return anchorNeedle.length > 3 && !renderedText.includes(anchorNeedle);
  });

  const missingImages = expected.images.filter((img) => {
    if (!img.alt?.trim()) return false;
    return !renderedImages.some((r) => normalizeText(r.alt) === normalizeText(img.alt));
  });

  const structuralMissing =
    missingHeadings.length > 0 ||
    missingParagraphs.length > 0 ||
    missingFaqs.length > 0 ||
    faqAnswerDiffs.length > 0 ||
    missingLists.length > 0;

  return {
    contentComplete: structuralMissing === false && missingLinks.length === 0,
    missingHeadings: missingHeadings.map((h) => ({
      text: h.text,
      evidence: expected.headings.find((entry) => entry.text === h.text) || null,
    })),
    missingParagraphs: missingParagraphs.slice(0, 8).map((entry) => ({
      text: entry.text.slice(0, 120),
      wordpressId: entry.wordpressId,
      blockIndex: entry.index,
      blockType: entry.type,
    })),
    missingFaqs: missingFaqs.map((f) => ({
      question: f.question,
      wordpressId: f.wordpressId,
      blockIndex: f.index,
      blockType: f.type,
    })),
    faqAnswerDiffs,
    missingLists: missingLists.slice(0, 5).map((entry) => ({
      text: entry.text.slice(0, 120),
      wordpressId: entry.wordpressId,
      blockIndex: entry.index,
      blockType: entry.type,
    })),
    missingLinks: missingLinks.slice(0, 8).map((l) => ({
      anchor: l.anchor,
      path: l.path,
      wordpressId: l.wordpressId,
      blockIndex: l.index,
      blockType: l.type,
    })),
    missingImages: missingImages.slice(0, 5).map((i) => ({
      alt: i.alt,
      src: i.src,
      wordpressId: i.wordpressId,
      blockIndex: i.index,
      blockType: i.type,
    })),
    renderedHeadingCount: renderedHeadings.length,
    renderedImageCount: renderedImages.length,
  };
}

export async function fetchRoute(target, routePath, { followRedirects = false } = {}) {
  const url = new URL(routePath, target);
  const response = await fetch(url, {
    redirect: followRedirects ? "follow" : "manual",
    headers: {
      Accept: "text/html,application/xml,text/plain,*/*",
      "User-Agent": "DGS-Full-Site-Audit/1.0",
    },
  });
  const html = (response.headers.get("content-type") || "").includes("text/html")
    ? await response.text()
    : "";
  return { response, html, finalUrl: response.url };
}

export async function auditRetainedHtml({
  path,
  html,
  response,
  registryRoute,
  indexability,
  approvedDecision,
  sitemapPaths,
  expectedBlocks,
  target,
  technicalLinkCorrections = null,
  probeCache = null,
}) {
  const failures = [];
  const warnings = [];
  const url = new URL(path, target);

  if (response.status !== 200) {
    failures.push(`HTTP ${response.status}`);
    return { failures, warnings, checks: {} };
  }

  const article = extractArticleHtml(html);
  const title = titleFromHtml(html);
  const description = metaFromHtml(html, "description");
  const robots = metaFromHtml(html, "robots");
  const xRobots = response.headers.get("x-robots-tag") || "";
  const canonicalHref = canonicalFromHtml(html);
  const canonicalPath = canonicalHref ? cleanPath(canonicalHref, target) : "";
  const noindexInfo = classifyNoindex(robots, xRobots);
  const h1s = extractHeadings(html).filter((h) => h.level === "h1");
  const schemaTypes = jsonLdTypesFromHtml(html);
  const hasBreadcrumbs = /breadcrumb/i.test(html);
  const hasHeader = /id=["']dgsNav["']|site-header/i.test(html);
  const hasFooter = /<footer\b/i.test(html);
  const hasArticle = Boolean(article);
  const isHome = path === "/";
  const usesWpMirror = /dgs-wp-mirror-home|HomeWpMirrorPage/i.test(html) || /class="dgs-wp-mirror-home"/.test(html);

  if (!isHome && !hasArticle) failures.push("missing data-migration-content article marker");
  if (isHome && !usesWpMirror) failures.push("homepage missing WP mirror root");
  if (!isHome && h1s.length < 1) failures.push("missing H1");
  if (!isHome && registryRoute?.h1 && h1s[0] && h1s[0].text !== registryRoute.h1) {
    warnings.push(`H1 text differs from registry: "${h1s[0].text}"`);
  }
  if (!canonicalHref) failures.push("canonical missing");
  else if (registryRoute || approvedDecision) {
    const desired = cleanPath(
      approvedDecision?.canonicalPath ||
        registryRoute?.desiredCanonicalPath ||
        registryRoute?.canonical ||
        path,
      target,
    );
    if (canonicalPath !== desired) failures.push(`canonical ${canonicalPath} != required ${desired}`);
  }
  if (expectsStagingNoindex()) {
    if (!noindexInfo.hasNoindex) failures.push("staging route missing expected noindex");
  } else if (indexability?.indexable && noindexInfo.hasNoindex) {
    failures.push(`unexpected noindex (${noindexInfo.label || "noindex"})`);
  }
  if (indexability?.includeInSitemap && !sitemapPaths.includes(cleanPath(path, target))) {
    failures.push("missing from sitemap.xml");
  }
  if (!hasHeader) warnings.push("site header/nav not detected");
  if (!hasFooter) warnings.push("footer not detected");
  if (!isHome && registryRoute?.wordpressType === "service" && !hasBreadcrumbs) {
    warnings.push("breadcrumbs not detected on service page");
  }
  if (!schemaTypes.length && !isHome) warnings.push("no JSON-LD schema detected");

  let content = null;
  if (expectedBlocks?.length && !TIER0_PATHS.has(path) && !INTENTIONALLY_NATIVE_PATHS.has(path)) {
    const correctedBlocks = technicalLinkCorrections
      ? applyTechnicalLinkCorrections(path, expectedBlocks, technicalLinkCorrections)
      : expectedBlocks;
    const expected = extractExpectedFromBlocks(correctedBlocks, {
      wordpressId: registryRoute?.wordpressId || approvedDecision?.wordpressId || null,
    });
    content = compareRenderedContent(expected, html, url.href);
    if (!content.contentComplete) warnings.push("WordPress visible content incomplete");
  }

  const cache = probeCache || createProbeCache();
  const images = extractImages(article || html).filter((img) => img.src && !/^data:/i.test(img.src));
  const uniqueImages = [];
  const seenImageSrc = new Set();
  for (const img of images) {
    const key = img.src;
    if (seenImageSrc.has(key)) continue;
    seenImageSrc.add(key);
    uniqueImages.push(img);
  }

  const imageResults = await mapWithConcurrency(uniqueImages, async (img) =>
    validateImageAsset(img.src, target, cache, path),
  );
  const brokenImages = imageResults.filter((result) => isBrokenImageClassification(result.classification));
  const rateLimitedImages = imageResults.filter((result) => result.classification === "RATE_LIMITED");
  const externalDependencyImages = imageResults.filter((result) =>
    isNonBlockingExternalImage(result.sourceUrl, path),
  );
  const blockingBrokenImages = brokenImages.filter(
    (result) => !isNonBlockingExternalImage(result.sourceUrl, path),
  );
  if (blockingBrokenImages.length) failures.push(`${blockingBrokenImages.length} broken in-content image(s)`);

  const internalLinks = extractContextualLinks(article || html, url.href)
    .filter((l) => isSiteInternalHref(l.href || l.path))
    .filter((l) => !/wp-content/i.test(l.path || ""))
    .filter((l) => !String(l.path || "").includes("#"));
  const uniqueLinks = [];
  const seenLinkPaths = new Set();
  for (const link of internalLinks) {
    const key = link.path;
    if (seenLinkPaths.has(key)) continue;
    seenLinkPaths.add(key);
    uniqueLinks.push(link);
  }

  const linkResults = !TIER0_PATHS.has(path)
    ? await mapWithConcurrency(uniqueLinks, async (link) => validateInternalLink(link, target, cache))
    : [];
  const brokenInternalLinks = linkResults.filter((result) => isBrokenLinkClassification(result.classification));
  const avoidableRedirects = linkResults.filter((result) => result.classification === "AVOIDABLE_INTERNAL_REDIRECT");
  const ambiguousLinks = linkResults.filter((result) => result.classification === "AMBIGUOUS");
  const rateLimitedLinks = linkResults.filter((result) => result.classification === "RATE_LIMITED");

  if (!isHome && brokenInternalLinks.length) {
    failures.push(`${brokenInternalLinks.length} broken internal link(s) in article`);
  }

  return {
    failures,
    warnings,
    checks: {
      status: response.status,
      title,
      descriptionPresent: Boolean(description),
      h1: h1s[0]?.text || null,
      canonicalPath,
      robots: robots || xRobots || null,
      schemaTypes,
      hasBreadcrumbs,
      hasHeader,
      hasFooter,
      usesWpMirror: isHome ? usesWpMirror : null,
      content,
      imageAudit: {
        checkedCount: uniqueImages.length,
        brokenCount: brokenImages.length,
        blockingBrokenCount: blockingBrokenImages.length,
        rateLimitedCount: rateLimitedImages.length,
        externalDependencyCount: externalDependencyImages.length,
        brokenImages: brokenImages.slice(0, 8),
        rateLimitedImages: rateLimitedImages.slice(0, 8),
        externalDependencyImages: externalDependencyImages.slice(0, 8),
      },
      linkAudit: {
        checkedCount: uniqueLinks.length,
        brokenCount: brokenInternalLinks.length,
        avoidableRedirectCount: avoidableRedirects.length,
        ambiguousCount: ambiguousLinks.length,
        rateLimitedCount: rateLimitedLinks.length,
        brokenInternalLinks: brokenInternalLinks.slice(0, 8),
        avoidableRedirects: avoidableRedirects.slice(0, 8),
        ambiguousLinks: ambiguousLinks.slice(0, 8),
      },
      brokenImages: blockingBrokenImages.slice(0, 8),
      brokenInternalLinks: brokenInternalLinks.slice(0, 8),
    },
  };
}

export function contentStatusFor(path, migrationClass, contentAudit) {
  if (TIER0_PATHS.has(path)) return "RANKING_PROTECTED";
  if (migrationClass !== "200_RETAINED" && migrationClass !== "NOINDEX_RETAINED") return "NOT_APPLICABLE";
  if (INTENTIONALLY_NATIVE_PATHS.has(path)) return "INTENTIONALLY_NATIVE";
  if (!contentAudit) return "CONTENT_REVIEW_REQUIRED";
  if (contentAudit.contentComplete) return "CONTENT_COMPLETE";
  return "CONTENT_INCOMPLETE";
}
