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

export async function fetchDynamicSitemapUrls(): Promise<string[]> {
  const origin = getSiteOrigin();
  const sitemapUrl = `${origin}/sitemap.xml`;
  try {
    const res = await fetch(sitemapUrl, {
      headers: { Accept: "application/xml,text/xml,*/*" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)];
    const urls = matches.map((m) => m[1].trim()).filter(Boolean);
    return urls.length > 0 ? urls : [origin + "/"];
  } catch (err) {
    console.error("Failed to fetch dynamic sitemap for audit:", err);
    return [
      `${origin}/`,
      `${origin}/services/seo-company-in-mumbai/`,
      `${origin}/services/ai-video-production-agency/`,
      `${origin}/portfolio/`,
      `${origin}/career/`,
    ];
  }
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
    const results = await Promise.all(chunk.map((u) => auditSingleUrl(u)));
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

  const report: FullAuditReport = {
    id: auditId,
    status: "completed",
    triggerType,
    totalPages: urls.length,
    crawledPages: pages.length,
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
          overall_score, technical_score, indexability_score, content_score,
          schema_score, media_score, performance_score, links_score,
          critical_count, high_count, medium_count, low_count, info_count,
          started_at, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          auditId,
          "completed",
          triggerType,
          urls.length,
          pages.length,
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

        // Persist individual missing alt records
        for (const altItem of p.missingAltDetails) {
          if (altItem.altStatus === "EMPTY_ALT_DECORATIVE") continue; // Valid decorative images not errors
          await cmsExecute(
            `INSERT INTO site_audit_missing_alts (
              id, audit_run_id, page_url, image_src, filename, current_alt, alt_status, is_decorative, recommendation
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              audit_run_id = VALUES(audit_run_id),
              current_alt = VALUES(current_alt),
              alt_status = VALUES(alt_status),
              is_decorative = VALUES(is_decorative),
              updated_at = CURRENT_TIMESTAMP`,
            [
              altItem.id,
              auditId,
              altItem.pageUrl,
              altItem.imageSrc,
              altItem.filename,
              altItem.currentAlt,
              altItem.altStatus,
              altItem.isDecorative ? 1 : 0,
              altItem.recommendation,
            ]
          );
        }
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
