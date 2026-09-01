#!/usr/bin/env node
/**
 * Tier-0 parity diagnosis: WordPress REST baseline vs Next preview output.
 * Reports visible content drift and contextual internal-link defects.
 * Does NOT modify page content.
 */
import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import {
  jsonLdTypesFromHtml,
  expectsStagingNoindex,
  classifyNoindex,
} from "./lib/migration-audit-shared.mjs";

const ROOT = process.cwd();
const TARGET = new URL(process.env.MIGRATION_TARGET_URL || "http://127.0.0.1:3000");
const WP_ORIGIN = "https://www.dgeniussolutions.com";
const OUT_DIR = path.join(ROOT, "data/audit/tier0-parity");
const DOC_PATH = path.join(ROOT, "docs/TIER0-PARITY-DIAGNOSIS.md");

const ROUTE_SLUGS = {
  "/services/ai-video-production-agency/": "ai-video",
  "/services/aeo-services-in-mumbai/": "aeo",
  "/services/geo/": "geo",
  "/services/llm-seo-service/": "llm-seo",
  "/services/seo-services-in-mumbai/": "seo-mumbai",
};

const [tier0, contentBaseline, pagesRaw, servicesRaw] = await Promise.all([
  readJson(path.join(ROOT, "data/migration/tier0-routes.json")),
  readJson(path.join(ROOT, "data/migration/tier0-content-baseline.generated.json")),
  readJson(path.join(ROOT, "data/wordpress/raw/pages.json")),
  readJson(path.join(ROOT, "data/wordpress/raw/services.json")),
]);

const recordsById = new Map([...pagesRaw, ...servicesRaw].map((item) => [Number(item.id), item]));
const baselineByPath = new Map(contentBaseline.baselines.map((item) => [item.path, item]));

function readJson(file) {
  return readFile(file, "utf8").then((raw) => JSON.parse(raw));
}

function decode(value = "") {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function normalizeText(html = "") {
  return decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return match ? decode(match[1].trim()) : "";
}

function normalizePath(value, base = TARGET) {
  const url = new URL(value, base);
  let pathname = url.pathname || "/";
  if (pathname !== "/" && !pathname.endsWith("/") && !/\.[a-z0-9]{1,8}$/i.test(pathname)) pathname += "/";
  return pathname;
}

function canonical(html) {
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    if (attr(tag, "rel").toLowerCase().split(/\s+/).includes("canonical")) return attr(tag, "href");
  }
  return "";
}

function meta(html, name) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    if (attr(tag, "name").toLowerCase() === name.toLowerCase()) return attr(tag, "content");
  }
  return "";
}

function extractArticleHtml(fullHtml) {
  const match = fullHtml.match(/<article\b[^>]*data-migration-content[^>]*>([\s\S]*?)<\/article>/i);
  return match?.[1] || "";
}

function extractHeadings(html) {
  return [...html.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m, index) => ({
    index,
    level: m[1].toLowerCase(),
    text: normalizeText(m[2]),
  }));
}

function extractParagraphs(html) {
  return [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m, index) => ({ index, text: normalizeText(m[1]) }))
    .filter((p) => p.text.length > 0);
}

function extractListItems(html) {
  return [...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((m, index) => ({ index, text: normalizeText(m[1]) }))
    .filter((li) => li.text.length > 0);
}

function extractFaqItems(html) {
  const items = [];
  for (const match of html.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/gi)) {
    const block = match[1];
    const question = normalizeText(block.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i)?.[1] || "");
    const answer = normalizeText(block.replace(/<summary[\s\S]*?<\/summary>/i, " "));
    if (question) items.push({ question, answer });
  }
  for (const match of html.matchAll(/class=["'][^"']*faq[^"']*["'][^>]*>[\s\S]*?<\/[^>]+>/gi)) {
    void match;
  }
  const faqHeadingIdx = extractHeadings(html).findIndex((h) => /faq|frequently asked/i.test(h.text));
  if (faqHeadingIdx >= 0 && items.length === 0) {
    const headings = extractHeadings(html);
    for (let i = faqHeadingIdx + 1; i < headings.length; i++) {
      const h = headings[i];
      if (h.level === "h2") break;
      if (h.level === "h3" || h.level === "h4") items.push({ question: h.text, answer: "" });
    }
  }
  return items;
}

function extractImages(html) {
  return [...html.matchAll(/<img\b[^>]*>/gi)].map((m, index) => {
    const tag = m[0];
    return {
      index,
      src: attr(tag, "src") || attr(tag, "data-src") || attr(tag, "data-lazy-src"),
      alt: attr(tag, "alt"),
    };
  });
}

function extractLinksFromHtml(html, pageUrl, scope) {
  const links = [];
  for (const tag of html.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) || []) {
    const href = attr(tag, "href");
    if (!href || /^(mailto:|tel:|javascript:|#)/i.test(href)) continue;
    let destination = href;
    let pathOnly = href;
    try {
      const url = new URL(href, pageUrl);
      destination = url.href;
      pathOnly = normalizePath(url.pathname, new URL(pageUrl));
    } catch {
      pathOnly = `invalid:${href}`;
    }
    links.push({
      anchor: normalizeText(tag),
      href,
      destination,
      path: pathOnly,
      scope,
    });
  }
  return links;
}

function stripGlobalChrome(html) {
  return html
    .replace(/<header\b[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, " ")
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, " ")
    .replace(/<div[^>]*id=["']dgsNav["'][^>]*>[\s\S]*?<\/div>/gi, " ");
}

function diffByText(sourceItems, targetItems, label) {
  const sourceTexts = sourceItems.map((item) => (typeof item === "string" ? item : item.text || item.question || ""));
  const targetTexts = targetItems.map((item) => (typeof item === "string" ? item : item.text || item.question || ""));
  const sourceSet = new Set(sourceTexts);
  const targetSet = new Set(targetTexts);
  return {
    missing: sourceTexts.filter((text) => text && !targetSet.has(text)),
    extra: targetTexts.filter((text) => text && !sourceSet.has(text)),
    wordingDifferences: sourceTexts
      .map((text, i) => ({ source: text, target: targetTexts[i] }))
      .filter((pair) => pair.source && pair.target && pair.source !== pair.target)
      .slice(0, 20),
    label,
    sourceCount: sourceTexts.length,
    targetCount: targetTexts.length,
  };
}

function diffFaq(source, target) {
  const sourceMap = new Map(source.map((f) => [f.question, f.answer]));
  const targetMap = new Map(target.map((f) => [f.question, f.answer]));
  const missing = [...sourceMap.keys()].filter((q) => !targetMap.has(q));
  const extra = [...targetMap.keys()].filter((q) => !sourceMap.has(q));
  const answerDiffs = [];
  for (const [question, answer] of sourceMap) {
    if (targetMap.has(question) && targetMap.get(question) !== answer) {
      answerDiffs.push({ question, sourceAnswer: answer, targetAnswer: targetMap.get(question) });
    }
  }
  return { missing, extra, answerDiffs };
}

function diffImages(source, target) {
  const missing = source.filter((img) => !target.some((t) => t.src === img.src));
  const extra = target.filter((img) => !source.some((s) => s.src === img.src));
  const altDiffs = source
    .map((img) => {
      const match = target.find((t) => t.src === img.src);
      return match && match.alt !== img.alt ? { src: img.src, sourceAlt: img.alt, targetAlt: match.alt } : null;
    })
    .filter(Boolean);
  return { missing, extra, altDiffs };
}

function diffHeadingOrder(source, target) {
  const sourceKeys = source.map((h) => `${h.level}:${h.text}`);
  const targetKeys = target.map((h) => `${h.level}:${h.text}`);
  return {
    orderChanged: sourceKeys.join("|") !== targetKeys.join("|"),
    sourceOrder: sourceKeys,
    targetOrder: targetKeys,
  };
}

async function resolveLinkStatus(url) {
  try {
    const response = await fetch(url, {
      redirect: "manual",
      headers: { "User-Agent": "DGS-Tier0-Link-Audit/1.0" },
    });
    const location = response.headers.get("location");
    return {
      httpStatus: response.status,
      redirect: response.status >= 300 && response.status < 400 ? location : null,
    };
  } catch (error) {
    return { httpStatus: 0, redirect: null, error: String(error) };
  }
}

function classifyFinding(kind, detail) {
  if (kind === "staging-noindex") return { class: "A", label: "EXPECTED_STAGING_DIFFERENCE", detail };
  if (kind === "aeo-canonical") return { class: "B", label: "APPROVED_TECHNICAL_CORRECTION", detail };
  if (kind === "auditor-artifact") return { class: "C", label: "AUDITOR_NORMALIZATION_ARTIFACT", detail };
  if (kind === "content-drift") return { class: "D", label: "REAL_VISIBLE_CONTENT_DRIFT", detail };
  if (kind === "link-defect") return { class: "E", label: "REAL_INTERNAL_LINK_PARITY_DEFECT", detail };
  return { class: "F", label: "NEEDS_HUMAN_DECISION", detail };
}

async function diagnoseRoute(route) {
  const slug = ROUTE_SLUGS[route.path];
  const wpRecord = recordsById.get(Number(route.wordpressId));
  const baseline = baselineByPath.get(route.path);
  const wpHtml = wpRecord?.content?.rendered || "";
  const wpArticleHtml = wpHtml;

  const url = new URL(route.path, TARGET);
  const response = await fetch(url, {
    redirect: "manual",
    headers: { Accept: "text/html,*/*", "User-Agent": "DGS-Tier0-Parity-Diagnosis/1.0" },
  });
  const nextHtml = await response.text();
  const xRobots = response.headers.get("x-robots-tag") || "";
  const nextArticleHtml = extractArticleHtml(nextHtml);
  const robots = meta(nextHtml, "robots");
  const noindexInfo = classifyNoindex(robots, xRobots);

  const wpHeadings = extractHeadings(wpArticleHtml);
  const nextHeadings = extractHeadings(nextArticleHtml);
  const wpParagraphs = extractParagraphs(wpArticleHtml);
  const nextParagraphs = extractParagraphs(nextArticleHtml);
  const wpListItems = extractListItems(wpArticleHtml);
  const nextListItems = extractListItems(nextArticleHtml);
  const wpFaq = extractFaqItems(wpArticleHtml);
  const nextFaq = extractFaqItems(nextArticleHtml);
  const wpImages = extractImages(wpArticleHtml);
  const nextImages = extractImages(nextArticleHtml);

  const headingDiff = {
    missing: wpHeadings.filter((h) => !nextHeadings.some((n) => n.level === h.level && n.text === h.text)),
    extra: nextHeadings.filter((h) => !wpHeadings.some((w) => w.level === h.level && w.text === h.text)),
    textDifferences: wpHeadings
      .filter((h, i) => nextHeadings[i] && (nextHeadings[i].level !== h.level || nextHeadings[i].text !== h.text))
      .map((h, i) => ({
        source: `${h.level}: ${h.text}`,
        target: nextHeadings[i] ? `${nextHeadings[i].level}: ${nextHeadings[i].text}` : null,
      })),
    order: diffHeadingOrder(wpHeadings, nextHeadings),
  };

  const paragraphDiff = diffByText(wpParagraphs, nextParagraphs, "paragraphs");
  const listDiff = diffByText(wpListItems, nextListItems, "listItems");
  const faqDiff = diffFaq(wpFaq, nextFaq);
  const imageDiff = diffImages(wpImages, nextImages);

  const wpContextualLinks = extractLinksFromHtml(wpArticleHtml, `${WP_ORIGIN}${route.path}`, "body");
  const nextContextualLinks = extractLinksFromHtml(nextArticleHtml, url.href, "body");
  const nextGlobalLinks = extractLinksFromHtml(stripGlobalChrome(nextHtml), url.href, "global").filter(
    (link) => !nextContextualLinks.some((c) => c.href === link.href && c.anchor === link.anchor),
  );

  const wpDestinations = new Set(wpContextualLinks.map((l) => l.path));
  const nextDestinations = new Set(nextContextualLinks.map((l) => l.path));

  const missingInNext = wpContextualLinks.filter(
    (link) => !nextContextualLinks.some((n) => n.path === link.path && n.anchor === link.anchor),
  );
  const extraInNext = nextContextualLinks.filter(
    (link) => !wpContextualLinks.some((w) => w.path === link.path && w.anchor === link.anchor),
  );

  const linkChecks = [];
  const uniqueDestinations = [...new Set([...wpDestinations, ...nextDestinations])].slice(0, 40);
  for (const dest of uniqueDestinations) {
    if (dest.startsWith("invalid:")) continue;
    const status = await resolveLinkStatus(new URL(dest, TARGET).href);
    linkChecks.push({ path: dest, ...status });
  }

  const canonicalHref = canonical(nextHtml);
  const canonicalPath = canonicalHref ? normalizePath(canonicalHref) : "";
  const desiredCanonicalPath = normalizePath(route.desiredCanonicalPath || route.path);
  const wpCanonicalPath = route.observedCanonical ? normalizePath(route.observedCanonical, new URL(WP_ORIGIN)) : "";

  const findings = [];

  if (noindexInfo.hasNoindex) {
    findings.push(
      classifyFinding(
        noindexInfo.classification === "A" ? "staging-noindex" : "content-drift",
        `robots=${robots || "none"} x-robots=${xRobots || "none"}`,
      ),
    );
  }

  if (route.path === "/services/aeo-services-in-mumbai/" && wpCanonicalPath !== desiredCanonicalPath) {
    findings.push(
      classifyFinding(
        "aeo-canonical",
        `WordPress canonical ${wpCanonicalPath} vs Next ${canonicalPath} (desired ${desiredCanonicalPath})`,
      ),
    );
  }

  if (headingDiff.missing.length) findings.push(classifyFinding("content-drift", `${headingDiff.missing.length} missing headings`));
  if (headingDiff.extra.length) findings.push(classifyFinding("content-drift", `${headingDiff.extra.length} extra headings`));
  if (headingDiff.order.orderChanged) findings.push(classifyFinding("content-drift", "heading order changed"));
  if (paragraphDiff.missing.length) findings.push(classifyFinding("content-drift", `${paragraphDiff.missing.length} missing paragraphs`));
  if (paragraphDiff.extra.length) findings.push(classifyFinding("content-drift", `${paragraphDiff.extra.length} extra paragraphs`));
  if (listDiff.missing.length) findings.push(classifyFinding("content-drift", `${listDiff.missing.length} missing list items`));
  if (listDiff.extra.length) findings.push(classifyFinding("content-drift", `${listDiff.extra.length} extra list items`));
  if (faqDiff.missing.length || faqDiff.extra.length || faqDiff.answerDiffs.length) {
    findings.push(classifyFinding("content-drift", "FAQ differences detected"));
  }
  if (imageDiff.missing.length || imageDiff.extra.length || imageDiff.altDiffs.length) {
    findings.push(classifyFinding("content-drift", "image/alt differences detected"));
  }
  if (missingInNext.length) findings.push(classifyFinding("link-defect", `${missingInNext.length} contextual links missing in Next`));
  if (extraInNext.length) findings.push(classifyFinding("link-defect", `${extraInNext.length} extra contextual links in Next`));

  const normalizedWp = normalizeText(wpArticleHtml);
  const normalizedNext = normalizeText(nextArticleHtml);
  const hashMatch = createHash("sha256").update(normalizedNext).digest("hex") === baseline?.content?.normalizedTextSha256;

  if (!hashMatch && !headingDiff.missing.length && !paragraphDiff.missing.length) {
    findings.push(
      classifyFinding(
        "auditor-artifact",
        "normalized text hash differs but structured diff shows no major heading/paragraph loss — likely wrapper/normalization artifact",
      ),
    );
  } else if (!hashMatch) {
    findings.push(classifyFinding("content-drift", "normalized visible content hash differs from WordPress baseline"));
  }

  const report = {
    path: route.path,
    slug,
    checkedAt: new Date().toISOString(),
    target: TARGET.origin,
    wordpressSource: baseline?.sourceLink || `${WP_ORIGIN}${route.path}`,
    httpStatus: response.status,
    indexability: {
      robots,
      xRobotsTag: xRobots,
      ...noindexInfo,
      expectStagingNoindex: expectsStagingNoindex(),
    },
    canonical: {
      next: canonicalHref,
      nextPath: canonicalPath,
      desiredPath: desiredCanonicalPath,
      wordpressObservedPath: wpCanonicalPath,
      selfCanonical: canonicalPath === desiredCanonicalPath,
    },
    schemaTypes: jsonLdTypesFromHtml(nextHtml),
    content: {
      hashMatch,
      sourceSha256: baseline?.content?.normalizedTextSha256 || null,
      targetSha256: createHash("sha256").update(normalizedNext).digest("hex"),
      headings: headingDiff,
      paragraphs: {
        missing: paragraphDiff.missing.slice(0, 30),
        extra: paragraphDiff.extra.slice(0, 30),
        wordingDifferences: paragraphDiff.wordingDifferences,
        sourceCount: paragraphDiff.sourceCount,
        targetCount: paragraphDiff.targetCount,
      },
      listItems: {
        missing: listDiff.missing.slice(0, 30),
        extra: listDiff.extra.slice(0, 30),
        sourceCount: listDiff.sourceCount,
        targetCount: listDiff.targetCount,
      },
      faq: faqDiff,
      images: imageDiff,
      order: headingDiff.order,
    },
    links: {
      wordpressContextual: wpContextualLinks,
      nextContextual: nextContextualLinks,
      nextGlobal: nextGlobalLinks,
      missingInNext,
      extraInNext,
      destinationStatus: linkChecks,
    },
    findings,
    classifications: findings.reduce(
      (acc, f) => {
        acc[f.class] = (acc[f.class] || 0) + 1;
        return acc;
      },
      {},
    ),
  };

  return report;
}

const reports = [];
for (const route of tier0.routes) {
  reports.push(await diagnoseRoute(route));
}

const summary = {
  checkedAt: new Date().toISOString(),
  target: TARGET.origin,
  expectStagingNoindex: expectsStagingNoindex(),
  routes: reports.map((r) => ({
    path: r.path,
    slug: r.slug,
    httpStatus: r.httpStatus,
    hashMatch: r.content.hashMatch,
    schemaTypes: r.schemaTypes,
    indexability: r.indexability,
    canonical: r.canonical,
    contentDrift: {
      missingHeadings: r.content.headings.missing.length,
      extraHeadings: r.content.headings.extra.length,
      missingParagraphs: r.content.paragraphs.missing.length,
      extraParagraphs: r.content.paragraphs.extra.length,
      missingListItems: r.content.listItems.missing.length,
      extraListItems: r.content.listItems.extra.length,
      faqIssues: r.content.faq.missing.length + r.content.faq.extra.length + r.content.faq.answerDiffs.length,
      imageIssues: r.content.images.missing.length + r.content.images.extra.length + r.content.images.altDiffs.length,
      orderChanged: r.content.order.orderChanged,
    },
    linkDrift: {
      missingInNext: r.links.missingInNext.length,
      extraInNext: r.links.extraInNext.length,
    },
    classifications: r.classifications,
    findings: r.findings,
  })),
  totals: reports.reduce(
    (acc, r) => {
      for (const [cls, count] of Object.entries(r.classifications)) {
        acc[cls] = (acc[cls] || 0) + count;
      }
      return acc;
    },
    {},
  ),
};

await mkdir(OUT_DIR, { recursive: true });
for (const report of reports) {
  await writeFile(path.join(OUT_DIR, `${report.slug}.json`), `${JSON.stringify(report, null, 2)}\n`, "utf8");
}
await writeFile(path.join(OUT_DIR, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");

const md = buildMarkdown(summary, reports);
await mkdir(path.dirname(DOC_PATH), { recursive: true });
await writeFile(DOC_PATH, md, "utf8");

console.log(JSON.stringify(summary, null, 2));

function buildMarkdown(summary, reports) {
  const lines = [
    "# Tier-0 Parity Diagnosis",
    "",
    `Checked: ${summary.checkedAt}`,
    `Target: ${summary.target}`,
    `MIGRATION_EXPECT_NOINDEX=${summary.expectStagingNoindex ? "1" : "0"}`,
    "",
    "## Classification Key",
    "",
    "- **A** — Expected staging difference",
    "- **B** — Approved technical correction",
    "- **C** — Auditor/normalization artifact",
    "- **D** — Real visible content drift",
    "- **E** — Real internal-link parity defect",
    "- **F** — Needs human decision",
    "",
    "## Summary Totals",
    "",
    "```json",
    JSON.stringify(summary.totals, null, 2),
    "```",
    "",
  ];

  for (const report of reports) {
    lines.push(`## ${report.path}`, "");
    lines.push(`- HTTP: ${report.httpStatus}`);
    lines.push(`- Schema types: ${report.schemaTypes.join(", ") || "none"}`);
    lines.push(`- Content hash match: ${report.content.hashMatch}`);
    lines.push(`- Noindex: ${report.indexability.hasNoindex ? report.indexability.label : "none"}`);
    lines.push(`- Canonical: ${report.canonical.nextPath} (desired ${report.canonical.desiredPath})`);
    lines.push(
      `- Content drift: ${report.content.headings.missing.length} missing headings, ${report.content.headings.extra.length} extra, ${report.content.paragraphs.missing.length} missing paragraphs, ${report.content.paragraphs.extra.length} extra`,
    );
    lines.push(
      `- Link drift: ${report.links.missingInNext.length} missing contextual links, ${report.links.extraInNext.length} extra`,
    );
    lines.push("");
    if (report.findings.length) {
      lines.push("### Findings");
      for (const f of report.findings) {
        lines.push(`- **[${f.class}] ${f.label}**: ${f.detail}`);
      }
      lines.push("");
    }
  }

  lines.push("---", "", "Generated by `npm run diagnose:tier0-parity`. No visible content was modified.");
  return `${lines.join("\n")}\n`;
}
