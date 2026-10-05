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
      if (link.status === "LOST") {
        changesDetected.push("LINK_RESTORED: Target URL was re-discovered in source HTML");
        alertTriggered = "LINK_RESTORED";
      }
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

    const priority = link.check_priority || "P1";
    const nextIntervalDays = newStatus === "LOST" ? 3 : priority === "P0" ? 3 : priority === "P1" ? 7 : priority === "P2" ? 14 : 30;

    const finalAnchor = foundAnchor || link.anchor_text || "";
    const isLive = newStatus === "LIVE";
    const isLost = newStatus === "LOST";
    const isReclaimed = newStatus === "LIVE" && link.status === "LOST";

    const now = new Date();
    const lastSeenAt = isLive ? now : (link.last_seen_at ? new Date(link.last_seen_at) : now);
    const verifiedAt = isLive ? (link.verified_at ? new Date(link.verified_at) : now) : (link.verified_at ? new Date(link.verified_at) : null);
    const liveAt = isLive ? (link.live_at ? new Date(link.live_at) : now) : (link.live_at ? new Date(link.live_at) : null);
    const lostAt = isLost ? (link.lost_at ? new Date(link.lost_at) : now) : (link.lost_at ? new Date(link.lost_at) : null);
    const reclaimedAt = isReclaimed ? now : (link.reclaimed_at ? new Date(link.reclaimed_at) : null);

    await cmsExecute(
      `UPDATE off_page_backlinks SET 
        status = ?, 
        http_status = ?, 
        anchor_text = ?,
        link_rel = ?,
        dofollow = ?,
        nofollow = ?,
        ugc = ?,
        sponsored = ?,
        source_indexable = ?,
        source_canonical = ?,
        last_checked_at = NOW(),
        last_seen_at = ?,
        verified_at = ?,
        live_at = ?,
        lost_at = ?,
        reclaimed_at = ?,
        next_check_at = DATE_ADD(NOW(), INTERVAL ? DAY)
       WHERE id = ?`,
      [
        newStatus,
        httpStatus,
        finalAnchor,
        foundRel || "dofollow",
        dofollow ? 1 : 0,
        nofollow ? 1 : 0,
        ugc ? 1 : 0,
        sponsored ? 1 : 0,
        sourceIndexable ? 1 : 0,
        sourceCanonical,
        lastSeenAt,
        verifiedAt,
        liveAt,
        lostAt,
        reclaimedAt,
        nextIntervalDays,
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
 * Zero-demo: sample backlinks are permanently eliminated from production code.
 * Safe no-op preserved for backward compatibility.
 */
export async function seedBacklinksIfEmpty(): Promise<number> {
  return 0;
}
