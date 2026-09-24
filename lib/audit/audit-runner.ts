import "server-only";
import { randomUUID } from "node:crypto";
import { cmsQuery, cmsExecute, isCmsDatabaseConfigured } from "@/lib/cms/db";
import { publishNotificationEvent } from "@/lib/notifications/engine";

export type AuditIssue = {
  severity: "critical" | "high" | "medium" | "low" | "info";
  category: "technical" | "indexability" | "content" | "schema" | "media" | "links";
  issueCode: string;
  title: string;
  description: string;
  recommendation: string;
};

export type DetailedMissingAlt = {
  id: string;
  pageUrl: string;
  imageSrc: string;
  mediaAssetId?: string | null;
  filename: string;
  currentAlt: string | null;
  surroundingContext?: string | null;
  altStatus: "MISSING_ALT_ATTRIBUTE" | "EMPTY_ALT_DECORATIVE" | "EMPTY_ALT_NEEDS_REVIEW";
  isDecorative: boolean;
  suggestedAlt?: string | null;
  recommendation: string;
};

export type PageAuditResult = {
  url: string;
  statusCode: number;
  responseTimeMs: number;
  title: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  robotsMeta: string | null;
  h1Count: number;
  h1Text: string | null;
  schemaTypes: string[];
  ogTags: Record<string, string>;
  imagesCount: number;
  missingAltCount: number;
  missingAltDetails: DetailedMissingAlt[];
  internalLinksCount: number;
  externalLinksCount: number;
  isIndexable: boolean;
  pageScore: number;
  issues: AuditIssue[];
  mobileSpeedScore?: number | null;
  desktopSpeedScore?: number | null;
  gscAvgPosition?: number | null;
  gscClicks?: number | null;
  gscImpressions?: number | null;
  gscCtr?: number | null;
  rankingKeywordsCount?: number;
  targetKeywordsCount?: number;
  notDetectedCount?: number;
  opportunityScore?: number;
};

export type FullAuditReport = {
  id: string;
  status: "completed" | "failed";
  triggerType: "scheduled" | "manual";
  totalPages: number;
  crawledPages: number;
  discoveredUrlCount?: number;
  crawledUrlCount?: number;
  failedUrlCount?: number;
  sitemapError?: string | null;
  overallScore: number;
  technicalScore: number;
  indexabilityScore: number;
  contentScore: number;
  schemaScore: number;
  mediaScore: number;
  linksScore: number;
  performanceScore: number | null;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  pages: PageAuditResult[];
  startedAt: string;
  completedAt: string;
};

function getSiteOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://www.dgeniussolutions.com";
}

/**
 * Recursive sitemap discovery supporting nested <sitemapindex>, urlset,
 * same-domain validation, deduplication, timeout, and max recursion depth.
 * Fails closed without synthetic fallback lists.
 */
export async function fetchRecursiveSitemapUrls(
  customRootUrl?: string,
  maxDepth = 5
): Promise<string[]> {
  const origin = getSiteOrigin();
  const rootUrl = customRootUrl || `${origin}/sitemap.xml`;
  let targetOrigin: string;
  try {
    targetOrigin = new URL(rootUrl).origin.toLowerCase();
  } catch (err: any) {
    throw new Error(`SITEMAP DISCOVERY FAILED: Invalid root URL ${rootUrl}`);
  }

  const visitedSitemaps = new Set<string>();
  const discoveredUrls = new Set<string>();
  const queue: Array<{ url: string; depth: number }> = [{ url: rootUrl, depth: 0 }];
  const MAX_TOTAL_SITEMAPS = 50;

  while (queue.length > 0) {
    if (visitedSitemaps.size >= MAX_TOTAL_SITEMAPS) {
      console.warn(`Sitemap recursion limit reached (${MAX_TOTAL_SITEMAPS} sitemaps processed).`);
      break;
    }

    const current = queue.shift()!;
    if (visitedSitemaps.has(current.url)) continue;
    visitedSitemaps.add(current.url);

    let xmlText = "";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(current.url, {
        headers: { Accept: "application/xml,text/xml,application/xhtml+xml,*/*" },
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      xmlText = await res.text();
    } catch (err: any) {
      const reason = err?.name === "AbortError" ? "Timeout after 12s" : (err?.message || "Network error");
      if (current.depth === 0) {
        throw new Error(`SITEMAP DISCOVERY FAILED: Could not fetch root sitemap (${current.url}): ${reason}`);
      } else {
        console.warn(`Sub-sitemap fetch warning (${current.url}):`, reason);
        continue;
      }
    }

    // Check if this XML is a sitemapindex
    const isSitemapIndex = /<sitemapindex\b/i.test(xmlText);
    const isUrlSet = /<urlset\b/i.test(xmlText);

    if (isSitemapIndex) {
      // Recurse child <sitemap><loc>...</loc>
      const sitemapBlocks = [...xmlText.matchAll(/<sitemap>([\s\S]*?)<\/sitemap>/gi)];
      for (const block of sitemapBlocks) {
        const locMatch = block[1].match(/<loc>([^<]+)<\/loc>/i);
        if (locMatch && locMatch[1]) {
          const subUrl = locMatch[1].trim();
          try {
            const subOrigin = new URL(subUrl).origin.toLowerCase();
            if (subOrigin === targetOrigin) {
              if (!visitedSitemaps.has(subUrl) && current.depth + 1 <= maxDepth) {
                queue.push({ url: subUrl, depth: current.depth + 1 });
              }
            }
          } catch {
            // Ignore malformed URL
          }
        }
      }
    }

    if (isUrlSet || (!isSitemapIndex && /<loc>/i.test(xmlText))) {
      // Extract page URLs from <url><loc> or direct <loc>
      const locMatches = [...xmlText.matchAll(/<loc>([^<]+)<\/loc>/gi)];
      for (const m of locMatches) {
        const pageUrl = m[1].trim();
        try {
          const parsed = new URL(pageUrl);
          if (parsed.origin.toLowerCase() === targetOrigin) {
            parsed.hash = "";
            discoveredUrls.add(parsed.toString());
          }
        } catch {
          // Ignore invalid URL
        }
      }
    }
  }

  const result = Array.from(discoveredUrls);
  if (result.length === 0) {
    throw new Error(`SITEMAP DISCOVERY FAILED: No valid same-domain URLs found in sitemap at ${rootUrl}`);
  }

  return result;
}

export async function fetchDynamicSitemapUrls(): Promise<string[]> {
  return fetchRecursiveSitemapUrls();
}

export async function auditSingleUrl(url: string): Promise<PageAuditResult> {
  const issues: AuditIssue[] = [];
  const startTime = Date.now();
  let statusCode = 0;
  let html = "";

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "DGS-SiteAuditEngine/2.0 (+https://www.dgeniussolutions.com/)",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
      redirect: "manual",
    });
    statusCode = res.status;
    html = await res.text();
  } catch (err: any) {
    statusCode = 599;
    issues.push({
      severity: "critical",
      category: "technical",
      issueCode: "FETCH_FAILED",
      title: "Network Connection Failed",
      description: err.message || "Failed to reach endpoint",
      recommendation: "Ensure server is operational and domain resolves properly.",
    });
  }

  const responseTimeMs = Date.now() - startTime;

  if (statusCode >= 400) {
    issues.push({
      severity: "critical",
      category: "technical",
      issueCode: `HTTP_${statusCode}`,
      title: `Page returned HTTP ${statusCode}`,
      description: `Endpoint returned error status code ${statusCode}`,
      recommendation: "Fix broken route or remove dead URL from sitemap.",
    });
  }

  // Parse HTML tags
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;

  const descMatch =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const metaDescription = descMatch ? descMatch[1].trim() : null;

  const canonicalMatch =
    html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i) ||
    html.match(/<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["']/i);
  const canonicalUrl = canonicalMatch ? canonicalMatch[1].trim() : null;

  const robotsMatch = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i);
  const robotsMeta = robotsMatch ? robotsMatch[1].trim() : null;

  const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h1Count = h1Matches.length;
  const h1Text = h1Count > 0 ? h1Matches[0][1].replace(/<[^>]+>/g, "").trim() : null;

  // Schema types
  const schemaMatches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const schemaTypes: string[] = [];
  for (const m of schemaMatches) {
    try {
      const parsed = JSON.parse(m[1]);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item["@type"]) schemaTypes.push(item["@type"]);
        }
      } else if (parsed["@type"]) {
        schemaTypes.push(parsed["@type"]);
      }
    } catch {}
  }

  // OpenGraph tags
  const ogMatches = [...html.matchAll(/<meta[^>]+property=["'](og:[^"']+)["'][^>]+content=["']([^"']*)["']/gi)];
  const ogTags: Record<string, string> = {};
  for (const m of ogMatches) {
    ogTags[m[1]] = m[2];
  }

  // Individual image extraction and missing alt categorization
  const imgMatches = [...html.matchAll(/<img[^>]+>/gi)];
  const imagesCount = imgMatches.length;
  let missingAltCount = 0;
  const missingAltDetails: DetailedMissingAlt[] = [];

  for (const img of imgMatches) {
    const rawTag = img[0];
    const srcMatch = rawTag.match(/src=["']([^"']*)["']/i);
    const src = srcMatch ? srcMatch[1].trim() : "";
    if (!src) continue;

    const altMatch = rawTag.match(/alt=["']([^"']*)["']/i);
    const rawAlt = altMatch ? altMatch[1] : null;
    const isDecorativeAttr = rawTag.includes('aria-hidden="true"') || rawTag.includes('role="presentation"');
    const filename = src.split("/").pop()?.split("?")[0] || "image.png";

    if (rawAlt === null) {
      missingAltCount++;
      missingAltDetails.push({
        id: randomUUID(),
        pageUrl: url,
        imageSrc: src,
        filename,
        currentAlt: null,
        altStatus: "MISSING_ALT_ATTRIBUTE",
        isDecorative: false,
        recommendation: "Image lacks alt attribute entirely. Add descriptive alt text or mark decorative.",
      });
    } else if (rawAlt.trim() === "") {
      const looksDecorative =
        isDecorativeAttr ||
        /icon|bullet|arrow|decor|divider|separator|bg-|shape/i.test(src);

      if (looksDecorative) {
        missingAltDetails.push({
          id: randomUUID(),
          pageUrl: url,
          imageSrc: src,
          filename,
          currentAlt: "",
          altStatus: "EMPTY_ALT_DECORATIVE",
          isDecorative: true,
          recommendation: "Valid decorative image with empty alt attribute per WCAG.",
        });
      } else {
        missingAltCount++;
        missingAltDetails.push({
          id: randomUUID(),
          pageUrl: url,
          imageSrc: src,
          filename,
          currentAlt: "",
          altStatus: "EMPTY_ALT_NEEDS_REVIEW",
          isDecorative: false,
          recommendation: "Empty alt on meaningful image. Review and provide descriptive alt text.",
        });
      }
    }
  }

  // Links
  const internalLinks = [...html.matchAll(/<a[^>]+href=["'](\/[^"']*)["']/gi)];
  const externalLinks = [...html.matchAll(/<a[^>]+href=["'](https?:\/\/[^"']*)["']/gi)];

  // Indexability check
  const isNoindex = robotsMeta ? robotsMeta.toLowerCase().includes("noindex") : false;
  const isIndexable = statusCode === 200 && !isNoindex;

  // Issue evaluations
  if (!title) {
    issues.push({
      severity: "high",
      category: "content",
      issueCode: "MISSING_TITLE",
      title: "Missing <title> tag",
      description: "Page lacks a title element required for search result snippet generation.",
      recommendation: "Add a concise, keyword-focused title between 40-60 characters.",
    });
  }

  if (!metaDescription) {
    issues.push({
      severity: "high",
      category: "content",
      issueCode: "MISSING_DESCRIPTION",
      title: "Missing Meta Description",
      description: "Page has no meta description tag.",
      recommendation: "Provide a compelling description under 160 characters summarizing the page value.",
    });
  }

  if (!canonicalUrl) {
    issues.push({
      severity: "medium",
      category: "indexability",
      issueCode: "MISSING_CANONICAL",
      title: "Missing Canonical URL",
      description: "Page lacks a rel='canonical' tag specifying the authoritative URL.",
      recommendation: "Add self-referential canonical URL.",
    });
  }

  if (h1Count === 0) {
    issues.push({
      severity: "high",
      category: "content",
      issueCode: "MISSING_H1",
      title: "Missing <h1> Heading",
      description: "Page does not contain a primary heading.",
      recommendation: "Add exactly one distinct <h1> element representing the main topic.",
    });
  } else if (h1Count > 1) {
    issues.push({
      severity: "low",
      category: "content",
      issueCode: "MULTIPLE_H1",
      title: `Multiple <h1> Headings Found (${h1Count})`,
      description: "Having more than one H1 heading can dilute semantic hierarchy.",
      recommendation: "Retain one top-level H1 and convert secondary sections to H2.",
    });
  }

  if (missingAltCount > 0) {
    issues.push({
      severity: "medium",
      category: "media",
      issueCode: "MISSING_ALT_TEXT",
      title: `${missingAltCount} Images Missing Alt Text`,
      description: "Images without alt descriptions harm accessibility and image SEO.",
      recommendation: "Click to open Alt Fixer and approve descriptive alt text or mark decorative.",
    });
  }

  if (schemaTypes.length === 0) {
    issues.push({
      severity: "low",
      category: "schema",
      issueCode: "NO_SCHEMA",
      title: "No Structured Data Detected",
      description: "Page has no JSON-LD schema markup for rich search results.",
      recommendation: "Implement BreadcrumbList or WebPage schema.",
    });
  }

  // Calculate page score purely from detected issues
  let score = 100;
  for (const iss of issues) {
    if (iss.severity === "critical") score -= 25;
    else if (iss.severity === "high") score -= 10;
    else if (iss.severity === "medium") score -= 5;
    else if (iss.severity === "low") score -= 2;
  }
  score = Math.max(0, score);

  return {
    url,
    statusCode,
    responseTimeMs,
    title,
    metaDescription,
    canonicalUrl,
    robotsMeta,
    h1Count,
    h1Text,
    schemaTypes,
    ogTags,
    imagesCount,
    missingAltCount,
    missingAltDetails,
    internalLinksCount: internalLinks.length,
    externalLinksCount: externalLinks.length,
    isIndexable,
    pageScore: score,
    issues,
  };
}

export async function runFullWebsiteAudit(triggerType: "scheduled" | "manual" = "manual"): Promise<FullAuditReport> {
  const auditId = randomUUID();
  const startedAt = new Date().toISOString().slice(0, 19).replace("T", " ");

  const urls = await fetchDynamicSitemapUrls();
  const pages: PageAuditResult[] = [];

  // Crawl URLs with concurrency limit 5
  const concurrency = 5;
  for (let i = 0; i < urls.length; i += concurrency) {
    const chunk = urls.slice(i, i + concurrency);
    const results = await Promise.all(
      chunk.map(async (u) => {
        try {
          return await auditSingleUrl(u);
        } catch (pageErr: any) {
          console.error(`Failed auditing page ${u}:`, pageErr);
          return {
            url: u,
            statusCode: 599,
            responseTimeMs: 0,
            title: null,
            metaDescription: null,
            canonicalUrl: null,
            robotsMeta: null,
            h1Count: 0,
            h1Text: null,
            schemaTypes: [],
            ogTags: {},
            imagesCount: 0,
            missingAltCount: 0,
            missingAltDetails: [],
            internalLinksCount: 0,
            externalLinksCount: 0,
            isIndexable: false,
            pageScore: 0,
            issues: [
              {
                severity: "critical",
                category: "technical",
                issueCode: "AUDIT_EXCEPTION",
                title: "Failed auditing page",
                description: pageErr?.message || "Audit runner caught unhandled page exception",
                recommendation: "Investigate page accessibility and server response.",
              },
            ],
          } as PageAuditResult;
        }
      })
    );
    pages.push(...results);
  }

  const completedAt = new Date().toISOString().slice(0, 19).replace("T", " ");

  // Aggregate issues and actual measurements
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  let infoCount = 0;
  let totalScore = 0;

  let techScoreSum = 0;
  let schemaPagesCount = 0;
  let totalImagesCount = 0;
  let totalMissingAltCount = 0;
  let goodInternalLinksPages = 0;

  for (const p of pages) {
    totalScore += p.pageScore;
    for (const iss of p.issues) {
      if (iss.severity === "critical") criticalCount++;
      else if (iss.severity === "high") highCount++;
      else if (iss.severity === "medium") mediumCount++;
      else if (iss.severity === "low") lowCount++;
      else infoCount++;
    }

    // Technical points: HTTP 200 (25), isIndexable (25), canonical (25), single H1 (25)
    let pageTech = 0;
    if (p.statusCode === 200) pageTech += 25;
    if (p.isIndexable) pageTech += 25;
    if (p.canonicalUrl) pageTech += 25;
    if (p.h1Count === 1) pageTech += 25;
    else if (p.h1Count > 1) pageTech += 15;
    techScoreSum += pageTech;

    if (p.schemaTypes && p.schemaTypes.length > 0) {
      schemaPagesCount++;
    }

    totalImagesCount += p.imagesCount;
    totalMissingAltCount += p.missingAltCount;

    if (p.internalLinksCount >= 3) {
      goodInternalLinksPages++;
    }
  }

  const overallScore = pages.length > 0 ? Math.round(totalScore / pages.length) : 100;
  const technicalScore = pages.length > 0 ? Math.round(techScoreSum / pages.length) : 100;
  const indexabilityScore = pages.length > 0
    ? Math.round((pages.filter((p) => p.isIndexable).length / pages.length) * 100)
    : 100;
  const contentScore = highCount === 0 ? 100 : Math.max(0, 100 - highCount * 5);
  // Real Schema Score: % of crawled pages with valid JSON-LD schema (0 hardcoding)
  const schemaScore = pages.length > 0 ? Math.round((schemaPagesCount / pages.length) * 100) : 0;
  // Real Media Score: % of images with valid alt text (0 hardcoding)
  const mediaScore = totalImagesCount > 0
    ? Math.max(0, Math.round(((totalImagesCount - totalMissingAltCount) / totalImagesCount) * 100))
    : 100;
  // Real Links Score: % of crawled pages with internal links >= 3 (0 hardcoding)
  const linksScore = pages.length > 0 ? Math.round((goodInternalLinksPages / pages.length) * 100) : 0;

  // Real Performance Score: check pagespeed_cache for actual measurements
  let performanceScore: number | null = null;
  if (isCmsDatabaseConfigured()) {
    try {
      const { rows } = await cmsQuery<{ avg_perf: number }>(
        `SELECT AVG(performance_score) as avg_perf FROM pagespeed_cache WHERE tested_at >= DATE_SUB(NOW(), INTERVAL 15 DAY) AND performance_score IS NOT NULL`
      );
      if (rows && rows[0]?.avg_perf != null) {
        performanceScore = Math.round(Number(rows[0].avg_perf));
      }
    } catch {}
  }

  const discoveredCount = urls.length;
  const crawledCount = pages.filter((p) => p.statusCode > 0 && p.statusCode < 500).length;
  const failedCount = pages.filter((p) => p.statusCode >= 500 || p.statusCode === 0).length;

  const report: FullAuditReport = {
    id: auditId,
    status: "completed",
    triggerType,
    totalPages: discoveredCount,
    crawledPages: crawledCount,
    discoveredUrlCount: discoveredCount,
    crawledUrlCount: crawledCount,
    failedUrlCount: failedCount,
    sitemapError: null,
    overallScore,
    technicalScore,
    indexabilityScore,
    contentScore,
    schemaScore,
    mediaScore,
    linksScore,
    performanceScore,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    infoCount,
    pages,
    startedAt,
    completedAt,
  };

  // Persist to database if configured
  if (isCmsDatabaseConfigured()) {
    try {
      await cmsExecute(
        `INSERT INTO site_audit_runs (
          id, status, trigger_type, total_pages, crawled_pages,
          discovered_url_count, crawled_url_count, failed_url_count, sitemap_error,
          overall_score, technical_score, indexability_score, content_score,
          schema_score, media_score, performance_score, links_score,
          critical_count, high_count, medium_count, low_count, info_count,
          started_at, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          auditId,
          "completed",
          triggerType,
          discoveredCount,
          crawledCount,
          discoveredCount,
          crawledCount,
          failedCount,
          null,
          overallScore,
          technicalScore,
          indexabilityScore,
          contentScore,
          schemaScore,
          mediaScore,
          performanceScore, // NULL if not measured yet
          linksScore,
          criticalCount,
          highCount,
          mediumCount,
          lowCount,
          infoCount,
          startedAt,
          completedAt,
        ]
      );

      // Insert pages, issues, and individual missing alt image records
      for (const p of pages) {
        try {
          const pageId = randomUUID();
          await cmsExecute(
            `INSERT INTO site_audit_pages (
              id, audit_run_id, url, status_code, response_time_ms, title,
              meta_description, canonical_url, robots_meta, h1_count, h1_text,
              schema_types, og_tags, images_count, missing_alt_count,
              internal_links_count, external_links_count, is_indexable, page_score
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              pageId,
              auditId,
              p.url,
              p.statusCode,
              p.responseTimeMs,
              p.title,
              p.metaDescription,
              p.canonicalUrl,
              p.robotsMeta,
              p.h1Count,
              p.h1Text,
              JSON.stringify(p.schemaTypes),
              JSON.stringify(p.ogTags),
              p.imagesCount,
              p.missingAltCount,
              p.internalLinksCount,
              p.externalLinksCount,
              p.isIndexable ? 1 : 0,
              p.pageScore,
            ]
          );

          for (const iss of p.issues) {
            const issueId = randomUUID();
            await cmsExecute(
              `INSERT INTO site_audit_issues (
                id, audit_run_id, page_id, url, severity, category, issue_code, title, description, recommendation
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                issueId,
                auditId,
                pageId,
                p.url,
                iss.severity,
                iss.category,
                iss.issueCode,
                iss.title,
                iss.description,
                iss.recommendation,
              ]
            );
          }

          // Persist individual missing alt records with deterministic identity & source_hash
          for (const altItem of p.missingAltDetails) {
            if (altItem.altStatus === "EMPTY_ALT_DECORATIVE") continue; // Valid decorative images not errors

            // Deterministic identity (Requirement C)
            const sourceHash = require("node:crypto")
              .createHash("sha256")
              .update(`${altItem.pageUrl}|${altItem.imageSrc}`)
              .digest("hex");
            const deterministicId = require("node:crypto")
              .createHash("sha256")
              .update(`${auditId}|${altItem.pageUrl}|${altItem.imageSrc}`)
              .digest("hex")
              .slice(0, 36);

            await cmsExecute(
              `INSERT INTO site_audit_missing_alts (
                id, audit_run_id, page_url, image_src, source_hash, filename, current_alt, alt_status, is_decorative, recommendation
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
                audit_run_id = VALUES(audit_run_id),
                source_hash = VALUES(source_hash),
                current_alt = VALUES(current_alt),
                alt_status = VALUES(alt_status),
                is_decorative = VALUES(is_decorative),
                recommendation = VALUES(recommendation),
                updated_at = CURRENT_TIMESTAMP`,
              [
                deterministicId,
                auditId,
                altItem.pageUrl,
                altItem.imageSrc,
                sourceHash,
                altItem.filename,
                altItem.currentAlt,
                altItem.altStatus,
                altItem.isDecorative ? 1 : 0,
                altItem.recommendation,
              ]
            );
          }
        } catch (pageSaveErr) {
          console.error(`Error saving audit details for page ${p.url}:`, pageSaveErr);
        }
      }

      // Enqueue mobile + desktop PageSpeed measurement jobs for all crawled indexable pages (Requirement H)
      try {
        const indexableUrls = pages.filter((p) => p.statusCode === 200).map((p) => p.url);
        for (const u of indexableUrls) {
          for (const strategy of ["mobile", "desktop"] as const) {
            const jobId = `psj_${require("node:crypto").createHash("sha256").update(`${auditId}|${u}|${strategy}`).digest("hex").slice(0, 32)}`;
            await cmsExecute(
              `INSERT INTO pagespeed_jobs (id, audit_run_id, url, strategy, status)
               VALUES (?, ?, ?, ?, 'QUEUED')
               ON DUPLICATE KEY UPDATE status = 'QUEUED', attempt_count = 0, last_error = NULL`,
              [jobId, auditId, u, strategy]
            ).catch(() => {});
          }
        }
      } catch (queueErr) {
        console.warn("Notice: Failed to enqueue PageSpeed jobs:", queueErr);
      }

      if (criticalCount > 0 || highCount > 0) {
        await publishNotificationEvent({
          type: "site_audit_issues",
          severity: criticalCount > 0 ? "danger" : "warning",
          title: `Site Health Audit: ${criticalCount} Critical, ${highCount} High Issues`,
          message: `Health Score: ${overallScore}/100 across ${pages.length} URLs crawled. Review recommendations.`,
          resource_type: "site_audit",
          resource_id: auditId,
          resource_url: `/admin/site-audits/`,
          recipient_role: "all",
        }).catch((e) => console.error("Failed to publish audit notification", e));
      }
    } catch (err) {
      console.error("Error saving audit run to database:", err);
    }
  }

  return report;
}

export async function isAuditDue(): Promise<boolean> {
  if (!isCmsDatabaseConfigured()) return true;
  try {
    const { rows } = await cmsQuery<{ created_at: string }>(
      `SELECT created_at FROM site_audit_runs WHERE status = 'completed' ORDER BY created_at DESC LIMIT 1`
    );
    if (!rows || rows.length === 0) return true;
    const lastAudit = new Date(rows[0].created_at).getTime();
    const fifteenDaysMs = 15 * 24 * 60 * 60 * 1000;
    return Date.now() - lastAudit >= fifteenDaysMs;
  } catch {
    return true;
  }
}
