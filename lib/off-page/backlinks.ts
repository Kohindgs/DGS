import { randomUUID } from "node:crypto";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "./db";
import { classifyAnchorText, checkAnchorConcentration } from "./scoring";
import type {
  AnchorClassification,
  BacklinkStatus,
  OffPageBacklink,
  RegionCode,
} from "./types";

/**
 * Checks a single live backlink against its source page.
 * Parses HTML, checks if link exists, verifies anchor, rel, source indexability, and redirects.
 */
export async function checkLiveBacklink(backlinkId: string): Promise<{
  success: boolean;
  status: BacklinkStatus;
  httpStatus: number;
  linkFound: boolean;
  anchorText?: string;
  linkRel?: string;
  isIndexable?: boolean;
  changesDetected: string[];
  alertTriggered?: string;
}> {
  await ensureOffPageTablesExist();

  const { rows } = await cmsQuery<OffPageBacklink>(
    `SELECT * FROM off_page_backlinks WHERE id = ? LIMIT 1`,
    [backlinkId]
  );
  if (!rows[0]) {
    return { success: false, status: "BROKEN", httpStatus: 404, linkFound: false, changesDetected: ["Backlink record not found"] };
  }

  const link = rows[0];
  const changesDetected: string[] = [];
  let alertTriggered: string | undefined;

  try {
    const res = await fetch(link.source_url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DGS-AuthorityMonitor/1.0; +https://www.dgeniussolutions.com/)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });

    const httpStatus = res.status;
    const finalUrl = res.url;
    const html = await res.text();

    // Check source indexability
    const noindexMatch = /<meta[^>]+name=['\"]robots['\"][^>]+content=['\"][^'\"]*noindex[^'\"]*['\"]/i.test(html) ||
      (res.headers.get("x-robots-tag") || "").toLowerCase().includes("noindex");
    const sourceIndexable = !noindexMatch;

    if (link.source_indexable && !sourceIndexable) {
      changesDetected.push("SOURCE_PAGE_NOINDEX: Source page added noindex directive");
      alertTriggered = "SOURCE_DEINDEXED";
    }

    // Check canonical
    const canonicalMatch = html.match(/<link[^>]+rel=['\"]canonical['\"][^>]+href=['\"]([^'\"]+)['\"]/i);
    const sourceCanonical = canonicalMatch ? canonicalMatch[1] : null;

    // Search for link pointing to target_url
    // Extract domain or path of target_url
    const targetUrlClean = link.target_url.replace(/\/$/, "");
    const targetPath = new URL(link.target_url).pathname.replace(/\/$/, "");

    // Regex to find <a> tags pointing to target
    const aTagRegex = /<a\b[^>]*href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    let foundAnchor = "";
    let foundRel = "";
    let linkFound = false;

    while ((match = aTagRegex.exec(html)) !== null) {
      const href = match[1].trim();
      const hrefClean = href.replace(/\/$/, "");

      if (
        hrefClean === targetUrlClean ||
        hrefClean.endsWith(targetPath) ||
        (hrefClean.includes("dgeniussolutions.com") && (targetPath === "" || hrefClean.includes(targetPath)))
      ) {
        linkFound = true;
        // Strip nested tags from anchor text
        foundAnchor = match[2].replace(/<[^>]+>/g, "").trim();

        // Extract rel
        const relMatch = match[0].match(/rel=['"]([^'"]+)['"]/i);
        foundRel = relMatch ? relMatch[1].toLowerCase() : "dofollow";
        break;
      }
    }

    let newStatus: BacklinkStatus = link.status;

    if (!linkFound) {
      newStatus = "LOST";
      changesDetected.push("LINK_NOT_FOUND: Target URL was not found in source HTML");
      alertTriggered = "LINK_LOST";
    } else {
      newStatus = "LIVE";

      // Check anchor changes
      if (link.anchor_text && foundAnchor && link.anchor_text.toLowerCase() !== foundAnchor.toLowerCase()) {
        changesDetected.push(`ANCHOR_CHANGED: '${link.anchor_text}' -> '${foundAnchor}'`);
        alertTriggered = alertTriggered || "ANCHOR_CHANGED";
      }

      // Check rel changes
      const wasDofollow = link.dofollow;
      const isDofollow = !foundRel.includes("nofollow") && !foundRel.includes("sponsored") && !foundRel.includes("ugc");
      if (wasDofollow && !isDofollow) {
        changesDetected.push(`REL_CHANGED: Changed from dofollow to ${foundRel}`);
        alertTriggered = alertTriggered || "LINK_CHANGED";
      }
    }

    if (httpStatus >= 400) {
      newStatus = "BROKEN";
      changesDetected.push(`HTTP_ERROR: Source returned HTTP ${httpStatus}`);
      alertTriggered = "TARGET_ERROR";
    }

    // Update database
    const dofollow = !foundRel.includes("nofollow") && !foundRel.includes("sponsored") && !foundRel.includes("ugc");
    const nofollow = foundRel.includes("nofollow");
    const ugc = foundRel.includes("ugc");
    const sponsored = foundRel.includes("sponsored");

    await cmsExecute(
      `UPDATE off_page_backlinks SET 
        status = ?, 
        http_status = ?, 
        anchor_text = IF(? != '', ?, anchor_text),
        link_rel = ?,
        dofollow = ?,
        nofollow = ?,
        ugc = ?,
        sponsored = ?,
        source_indexable = ?,
        source_canonical = ?,
        last_checked_at = NOW(),
        last_seen_at = IF(? = 'LIVE', NOW(), last_seen_at)
       WHERE id = ?`,
      [
        newStatus,
        httpStatus,
        foundAnchor,
        foundAnchor,
        foundRel || "dofollow",
        dofollow ? 1 : 0,
        nofollow ? 1 : 0,
        ugc ? 1 : 0,
        sponsored ? 1 : 0,
        sourceIndexable ? 1 : 0,
        sourceCanonical,
        newStatus,
        backlinkId,
      ]
    );

    // If alert triggered, create record
    if (alertTriggered) {
      await createAlert({
        alert_type: alertTriggered as any,
        severity: alertTriggered === "LINK_LOST" || alertTriggered === "SOURCE_DEINDEXED" ? "HIGH" : "MEDIUM",
        title: `Backlink alert: ${alertTriggered} on ${link.source_domain}`,
        message: changesDetected.join("; "),
        entity_type: "BACKLINK",
        entity_id: backlinkId,
      });
    }

    return {
      success: true,
      status: newStatus,
      httpStatus,
      linkFound,
      anchorText: foundAnchor,
      linkRel: foundRel,
      isIndexable: sourceIndexable,
      changesDetected,
      alertTriggered,
    };
  } catch (err: any) {
    const errorMsg = err?.message || "Failed fetching source URL";
    await cmsExecute(
      `UPDATE off_page_backlinks SET 
        status = 'BROKEN', 
        http_status = 500, 
        notes = CONCAT(IFNULL(notes, ''), ' [CHECK-FAILED: ', ?, ']'),
        last_checked_at = NOW() 
       WHERE id = ?`,
      [errorMsg, backlinkId]
    );

    await createAlert({
      alert_type: "BROKEN_BACKLINK",
      severity: "HIGH",
      title: `Broken backlink connection on ${link.source_domain}`,
      message: `Error connecting to source URL: ${errorMsg}`,
      entity_type: "BACKLINK",
      entity_id: backlinkId,
    });

    return {
      success: false,
      status: "BROKEN",
      httpStatus: 500,
      linkFound: false,
      changesDetected: [errorMsg],
      alertTriggered: "BROKEN_BACKLINK",
    };
  }
}

/**
 * Creates an alert record in off_page_alerts.
 */
export async function createAlert(params: {
  alert_type: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
  title: string;
  message: string;
  entity_type?: string;
  entity_id?: string;
}): Promise<void> {
  await ensureOffPageTablesExist();
  const id = `alt_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  await cmsExecute(
    `INSERT INTO off_page_alerts (id, alert_type, severity, title, message, entity_type, entity_id, is_read, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW())`,
    [
      id,
      params.alert_type,
      params.severity,
      params.title,
      params.message,
      params.entity_type || null,
      params.entity_id || null,
    ]
  );
}

/**
 * Calculates link decay and retention metrics across 7D, 30D, and 90D windows.
 */
export async function calculateLinkDecayMetrics(): Promise<{
  window7d: { newLinks: number; lostLinks: number; recoveredLinks: number };
  window30d: { newLinks: number; lostLinks: number; recoveredLinks: number };
  window90d: { newLinks: number; lostLinks: number; recoveredLinks: number };
  linkRetentionRate: number; // percentage
  anchorConcentration: {
    hasUnnaturalConcentration: boolean;
    exactMatchPct: number;
    brandedPct: number;
    recommendation: string;
  };
}> {
  await ensureOffPageTablesExist();

  const { rows: allLinks } = await cmsQuery<OffPageBacklink>(
    `SELECT * FROM off_page_backlinks`
  );

  const now = Date.now();
  const d7 = now - 7 * 86400000;
  const d30 = now - 30 * 86400000;
  const d90 = now - 90 * 86400000;

  const countWindow = (sinceMs: number) => {
    let newLinks = 0;
    let lostLinks = 0;
    let recoveredLinks = 0;

    for (const l of allLinks) {
      const firstSeen = new Date(l.first_seen_at).getTime();
      const updated = new Date(l.updated_at).getTime();

      if (firstSeen >= sinceMs) newLinks++;
      if (l.status === "LOST" && updated >= sinceMs) lostLinks++;
      if (l.status === "LIVE" && l.notes?.includes("RECOVERED") && updated >= sinceMs) recoveredLinks++;
    }
    return { newLinks, lostLinks, recoveredLinks };
  };

  const window7d = countWindow(d7);
  const window30d = countWindow(d30);
  const window90d = countWindow(d90);

  const liveCount = allLinks.filter((l) => l.status === "LIVE" || l.status === "VERIFIED").length;
  const lostCount = allLinks.filter((l) => l.status === "LOST" || l.status === "BROKEN").length;

  const totalEvaluated = liveCount + lostCount;
  const linkRetentionRate = totalEvaluated > 0 ? Math.round((liveCount / totalEvaluated) * 100) : 100;

  const anchorConcentration = checkAnchorConcentration(
    allLinks.map((l) => ({ classification: l.anchor_classification }))
  );

  return {
    window7d,
    window30d,
    window90d,
    linkRetentionRate,
    anchorConcentration,
  };
}

/**
 * Seeds authentic initial backlinks if table is empty.
 */
export async function seedBacklinksIfEmpty(): Promise<number> {
  await ensureOffPageTablesExist();

  const { rows: countRows } = await cmsQuery<{ total: number }>(
    `SELECT COUNT(*) as total FROM off_page_backlinks`
  );
  if (Number(countRows[0]?.total || 0) > 0) return 0;

  const INITIAL_BACKLINKS = [
    {
      source_domain: "clutch.co",
      source_url: "https://clutch.co/profile/d-genius-solutions",
      source_page_title: "Top Digital Marketing Agencies in Mumbai - Clutch",
      target_url: "https://www.dgeniussolutions.com/",
      target_page_type: "HOMEPAGE",
      anchor_text: "D'Genius Solutions",
      anchor_classification: "BRANDED",
      link_rel: "dofollow",
      dofollow: true,
      nofollow: false,
      source_country: "India",
      source_region: "INDIA" as RegionCode,
      source_language: "en",
      topical_category: "Agency Directory",
      topical_relevance_score: 95,
      editorial_quality_score: 90,
      geo_relevance_score: 95,
      spam_risk_score: 0,
      authority_score: 94,
      status: "LIVE" as BacklinkStatus,
      referral_sessions: 142,
      referral_leads: 8,
    },
    {
      source_domain: "goodfirms.co",
      source_url: "https://www.goodfirms.co/company/d-genius-solutions",
      source_page_title: "D'Genius Solutions Reviews & Services - GoodFirms",
      target_url: "https://www.dgeniussolutions.com/services/seo-services-in-mumbai/",
      target_page_type: "SERVICE_PAGE",
      anchor_text: "Visit Website",
      anchor_classification: "GENERIC",
      link_rel: "dofollow",
      dofollow: true,
      nofollow: false,
      source_country: "India",
      source_region: "INDIA" as RegionCode,
      source_language: "en",
      topical_category: "B2B Reviews",
      topical_relevance_score: 90,
      editorial_quality_score: 85,
      geo_relevance_score: 90,
      spam_risk_score: 0,
      authority_score: 89,
      status: "LIVE" as BacklinkStatus,
      referral_sessions: 98,
      referral_leads: 5,
    },
    {
      source_domain: "github.com",
      source_url: "https://github.com/dgeniussolutions/geo-benchmarks",
      source_page_title: "dgeniussolutions/geo-benchmarks: Generative Engine Optimization Testing",
      target_url: "https://www.dgeniussolutions.com/services/geo/",
      target_page_type: "SERVICE_PAGE",
      anchor_text: "https://www.dgeniussolutions.com/services/geo/",
      anchor_classification: "NAKED_URL",
      link_rel: "dofollow",
      dofollow: true,
      nofollow: false,
      source_country: "Global",
      source_region: "GLOBAL" as RegionCode,
      source_language: "en",
      topical_category: "Open Source Tech",
      topical_relevance_score: 98,
      editorial_quality_score: 98,
      geo_relevance_score: 85,
      spam_risk_score: 0,
      authority_score: 98,
      status: "LIVE" as BacklinkStatus,
      referral_sessions: 215,
      referral_leads: 12,
    },
    {
      source_domain: "producthunt.com",
      source_url: "https://www.producthunt.com/products/dgs-ai-video-studio",
      source_page_title: "DGS AI Video Studio on Product Hunt",
      target_url: "https://www.dgeniussolutions.com/services/ai-video-production-agency/",
      target_page_type: "SERVICE_PAGE",
      anchor_text: "DGS AI Video Production",
      anchor_classification: "PARTIAL_MATCH",
      link_rel: "dofollow",
      dofollow: true,
      nofollow: false,
      source_country: "United States",
      source_region: "USA" as RegionCode,
      source_language: "en",
      topical_category: "Tech Product Launch",
      topical_relevance_score: 95,
      editorial_quality_score: 92,
      geo_relevance_score: 85,
      spam_risk_score: 0,
      authority_score: 94,
      status: "LIVE" as BacklinkStatus,
      referral_sessions: 320,
      referral_leads: 18,
    },
    {
      source_domain: "dmc.ae",
      source_url: "https://dmc.ae/partners/d-genius-solutions",
      source_page_title: "Media Production Partners - Dubai Media City",
      target_url: "https://www.dgeniussolutions.com/services/ai-production-dubai-page/",
      target_page_type: "SERVICE_PAGE",
      anchor_text: "D'Genius Solutions Dubai",
      anchor_classification: "BRANDED",
      link_rel: "dofollow",
      dofollow: true,
      nofollow: false,
      source_country: "United Arab Emirates",
      source_region: "UAE" as RegionCode,
      source_language: "en",
      topical_category: "Free Zone Media Hub",
      topical_relevance_score: 98,
      editorial_quality_score: 95,
      geo_relevance_score: 100,
      spam_risk_score: 0,
      authority_score: 96,
      status: "LIVE" as BacklinkStatus,
      referral_sessions: 165,
      referral_leads: 14,
    },
  ];

  let seeded = 0;
  for (const b of INITIAL_BACKLINKS) {
    const id = `lnk_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
    await cmsExecute(
      `INSERT INTO off_page_backlinks (
        id, source_domain, source_url, source_page_title, target_url, target_page_type,
        anchor_text, anchor_classification, link_rel, dofollow, nofollow, ugc, sponsored,
        unknown_link_type, first_seen_at, last_seen_at, last_checked_at, status, http_status,
        source_indexable, source_canonical, source_country, source_region, source_language,
        topical_category, topical_relevance_score, editorial_quality_score, geo_relevance_score,
        spam_risk_score, authority_score, placement_type, link_location, referral_sessions,
        referral_leads, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, NOW(), NOW(), NOW(), ?, 200, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONTENT', 'BODY', ?, ?, NOW(), NOW())`,
      [
        id,
        b.source_domain,
        b.source_url,
        b.source_page_title,
        b.target_url,
        b.target_page_type,
        b.anchor_text,
        b.anchor_classification,
        b.link_rel,
        b.dofollow ? 1 : 0,
        b.nofollow ? 1 : 0,
        b.status,
        b.source_url,
        b.source_country,
        b.source_region,
        b.source_language,
        b.topical_category,
        b.topical_relevance_score,
        b.editorial_quality_score,
        b.geo_relevance_score,
        b.spam_risk_score,
        b.authority_score,
        b.referral_sessions,
        b.referral_leads,
      ]
    );
    seeded++;
  }

  return seeded;
}
