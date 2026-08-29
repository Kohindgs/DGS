import { createHash } from "node:crypto";
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

export function extractExpectedFromBlocks(blocks = []) {
  const headings = [];
  const paragraphs = [];
  const lists = [];
  const faqs = [];
  const links = [];
  const images = [];
  const ctas = [];

  for (const block of blocks) {
    if (block.type === "heading" && block.text) {
      headings.push({ level: `h${block.level}`, text: block.text.trim() });
      if (block.href) links.push({ anchor: block.text.trim(), path: cleanPath(block.href) });
    }
    if (block.type === "paragraph") {
      const text = spanText(block.content);
      if (text) paragraphs.push(text);
      for (const span of block.content || []) {
        if (span.href) links.push({ anchor: span.text?.trim() || text, path: cleanPath(span.href) });
      }
    }
    if (block.type === "list") {
      for (const item of block.items || []) {
        const text = spanText(item);
        if (text) lists.push(text);
        for (const span of item || []) {
          if (span.href) links.push({ anchor: span.text?.trim() || text, path: cleanPath(span.href) });
        }
      }
    }
    if (block.type === "faq") {
      for (const item of block.items || []) {
        faqs.push({ question: item.question?.trim() || "", answer: spanText(item.answer) });
      }
    }
    if (block.type === "image" && block.src) {
      images.push({ src: block.src, alt: block.alt || "" });
    }
    if (block.type === "cta" && block.label) {
      ctas.push(block.label.trim());
    }
  }

  return { headings, paragraphs, lists, faqs, links, images, ctas };
}

export function classifyVisualMirror(path, template) {
  if (path === "/") return "VISUAL_MIRROR_COMPLETE";
  if (PROTECTED_RANKING_PATHS.has(path)) return "RANKING_PROTECTED";
  if (path === "/services/seo-services-in-mumbai/") return "RANKING_PROTECTED";
  if (template === "ContactForm") return "VISUAL_MIRROR_PARTIAL";
  if (template === "Portfolio") return "VISUAL_MIRROR_PARTIAL";
  if (template === "Homepage") return "VISUAL_MIRROR_COMPLETE";
  if (EXPLICIT_NON_HTML.has(path)) return "NOT_APPLICABLE";
  return "VISUAL_MIRROR_PENDING";
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

  const missingParagraphs = expected.paragraphs.filter((p) => {
    const needle = normalizeText(p).slice(0, 80);
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
    .map((f) => f.question);

  const missingLists = expected.lists.filter((item) => {
    const needle = normalizeText(item).slice(0, 60);
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
    missingHeadings: missingHeadings.map((h) => h.text),
    missingParagraphs: missingParagraphs.slice(0, 8),
    missingFaqs: missingFaqs.map((f) => f.question),
    faqAnswerDiffs,
    missingLists: missingLists.slice(0, 5),
    missingLinks: missingLinks.slice(0, 8).map((l) => ({ anchor: l.anchor, path: l.path })),
    missingImages: missingImages.slice(0, 5).map((i) => i.alt),
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
  if (expectedBlocks?.length && !TIER0_PATHS.has(path)) {
    const expected = extractExpectedFromBlocks(expectedBlocks);
    content = compareRenderedContent(expected, html, url.href);
    if (!content.contentComplete) warnings.push("WordPress visible content incomplete");
  }

  const images = extractImages(article || html).slice(0, 12);
  const brokenImages = [];
  for (const img of images) {
    if (!img.src || /^data:/i.test(img.src)) continue;
    try {
      const imgUrl = new URL(img.src, target);
      const imgRes = await fetch(imgUrl, { method: "HEAD", redirect: "follow" });
      if (imgRes.status >= 400) brokenImages.push({ src: img.src, status: imgRes.status });
    } catch {
      brokenImages.push({ src: img.src, status: "fetch-error" });
    }
  }
  if (brokenImages.length) failures.push(`${brokenImages.length} broken in-content image(s)`);

  const internalLinks = extractContextualLinks(article || html, url.href)
    .filter((l) => isSiteInternalHref(l.href || l.path))
    .filter((l) => !/wp-content/i.test(l.path || ""))
    .slice(0, 20);
  const brokenInternalLinks = [];
  if (!TIER0_PATHS.has(path)) {
    for (const link of internalLinks) {
      try {
        const linkRes = await fetch(new URL(link.path, target), { redirect: "manual" });
        if (linkRes.status === 404) brokenInternalLinks.push({ path: link.path, anchor: link.anchor });
        else if (linkRes.status >= 300 && linkRes.status < 400) {
          const hopRes = await fetch(new URL(link.path, target), { redirect: "follow" });
          if (hopRes.status === 404) brokenInternalLinks.push({ path: link.path, anchor: link.anchor, status: 404 });
        } else if (linkRes.status >= 500) {
          brokenInternalLinks.push({ path: link.path, anchor: link.anchor, status: linkRes.status });
        }
      } catch {
        brokenInternalLinks.push({ path: link.path, anchor: link.anchor, status: "fetch-error" });
      }
    }
    if (!isHome && brokenInternalLinks.length) {
      failures.push(`${brokenInternalLinks.length} broken internal link(s) in article`);
    }
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
      brokenImages,
      brokenInternalLinks: brokenInternalLinks.slice(0, 5),
    },
  };
}

export function contentStatusFor(path, migrationClass, contentAudit, visualStatus) {
  if (TIER0_PATHS.has(path)) return "RANKING_PROTECTED";
  if (migrationClass !== "200_RETAINED" && migrationClass !== "NOINDEX_RETAINED") return "NOT_APPLICABLE";
  if (!contentAudit) return visualStatus === "VISUAL_MIRROR_PENDING" ? "CONTENT_UNKNOWN" : "CONTENT_UNKNOWN";
  if (contentAudit.contentComplete) return "CONTENT_COMPLETE";
  return "CONTENT_INCOMPLETE";
}
