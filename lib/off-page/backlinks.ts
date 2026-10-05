import { randomUUID } from "node:crypto";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "./db";
import { classifyAnchorText, checkAnchorConcentration } from "./scoring";
import { extractLinks, isMonitoredHost } from "./lanes/page-analyzer";
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

    // Search for a real <a href> whose host is the monitored domain and whose path matches the target
    const targetPath = (() => {
      try {
        return new URL(link.target_url).pathname.replace(/\/$/, "");
      } catch {
        return "";
      }
    })();
    const observed = extractLinks(html, finalUrl || link.source_url).filter((l) => isMonitoredHost(l.host));
    const exact = observed.find((l) => {
      try {
        return new URL(l.href).pathname.replace(/\/$/, "") === targetPath;
      } catch {
        return false;
      }
    });
    const hit = exact || (targetPath === "" ? observed[0] : undefined) || observed[0];
    const linkFound = !!hit;
    const foundAnchor = hit?.anchor || "";
    // Observed rel; a real <a> without rel is followed by HTML semantics.
    const foundRel = hit ? hit.rel || "none" : "";
    if (hit && !exact && targetPath !== "") {
      changesDetected.push(`TARGET_PATH_DIFFERS: expected ${targetPath || "/"}, found ${hit.href}`);
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

    // Update database (rel flags are only changed when the link was actually observed)
    const dofollow = linkFound ? !foundRel.includes("nofollow") && !foundRel.includes("sponsored") && !foundRel.includes("ugc") : !!link.dofollow;
    const nofollow = linkFound ? foundRel.includes("nofollow") : !!link.nofollow;
    const ugc = linkFound ? foundRel.includes("ugc") : !!link.ugc;
    const sponsored = linkFound ? foundRel.includes("sponsored") : !!link.sponsored;

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

    // Two-status reconciliation
    const teamStatus = (link.team_status || link.status || "LIVE").toUpperCase();
    let mismatchStatus: "MATCH" | "MISMATCH" | "RESOLVED" = "MATCH";
    let mismatchReason: string | null = null;
    let mismatchDetectedAt: string | null = null;

    if (newStatus === "LOST" || newStatus === "BROKEN") {
      if (teamStatus === "LIVE") {
        mismatchStatus = "MISMATCH";
        mismatchReason = `Team recorded LIVE but crawler verified link is ${newStatus} (HTTP ${httpStatus})`;
        mismatchDetectedAt = now.toISOString().slice(0, 19).replace("T", " ");
      }
    } else if (newStatus === "LIVE") {
      if (teamStatus === "SUBMITTED" || teamStatus === "PENDING" || teamStatus === "IN_PROGRESS") {
        mismatchStatus = "MISMATCH";
        mismatchReason = `Team recorded ${teamStatus} but link was found active and LIVE on source page!`;
        mismatchDetectedAt = now.toISOString().slice(0, 19).replace("T", " ");
      }
    }

    await cmsExecute(
      `UPDATE off_page_backlinks SET 
        status = ?, 
        verified_status = ?,
        mismatch_status = ?,
        mismatch_reason = ?,
        mismatch_detected_at = COALESCE(?, mismatch_detected_at),
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
        newStatus,
        mismatchStatus,
        mismatchReason,
        mismatchDetectedAt,
        httpStatus,
        finalAnchor,
        linkFound ? foundRel : link.link_rel || "unknown",
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

/**
 * Retrieves all backlinks currently flagged with a status mismatch between human claim and crawler reality.
 */
export async function getMismatchedBacklinks(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: OffPageBacklink[]; total: number }> {
  await ensureOffPageTablesExist();

  const statusFilter = params?.status || "MISMATCH";
  const limit = Math.min(Math.max(params?.limit || 50, 1), 200);
  const offset = Math.max(params?.offset || 0, 0);

  const whereClause = statusFilter === "ALL" 
    ? "WHERE mismatch_status IN ('MISMATCH', 'RESOLVED')" 
    : "WHERE mismatch_status = ?";
  const queryParams = statusFilter === "ALL" ? [] : [statusFilter];

  const { rows: countRows } = await cmsQuery<{ count: number }>(
    `SELECT COUNT(*) as count FROM off_page_backlinks ${whereClause}`,
    queryParams
  );
  const total = countRows[0]?.count || 0;

  const { rows: items } = await cmsQuery<OffPageBacklink>(
    `SELECT * FROM off_page_backlinks ${whereClause} 
     ORDER BY mismatch_detected_at DESC, updated_at DESC 
     LIMIT ? OFFSET ?`,
    [...queryParams, limit, offset]
  );

  return { items, total };
}

/**
 * Resolves a backlink status mismatch with manager decision.
 */
export async function resolveMismatch(
  backlinkId: string,
  resolution: "ACCEPTED_VERIFIED" | "KEPT_TEAM" | "RECHECKED" | "ASSIGNED_REVIEW",
  note?: string,
  assignee?: string
): Promise<{ success: boolean; backlink: OffPageBacklink | null; message: string }> {
  await ensureOffPageTablesExist();

  const { rows } = await cmsQuery<OffPageBacklink>(
    `SELECT * FROM off_page_backlinks WHERE id = ? LIMIT 1`,
    [backlinkId]
  );
  if (!rows[0]) {
    return { success: false, backlink: null, message: "Backlink not found" };
  }

  const bl = rows[0];

  if (resolution === "RECHECKED") {
    const recheckResult = await checkLiveBacklink(backlinkId);
    const { rows: updated } = await cmsQuery<OffPageBacklink>(
      `SELECT * FROM off_page_backlinks WHERE id = ? LIMIT 1`,
      [backlinkId]
    );
    return {
      success: true,
      backlink: updated[0] || null,
      message: `Rechecked live: status is ${recheckResult.status}, linkFound=${recheckResult.linkFound}`,
    };
  }

  if (resolution === "ACCEPTED_VERIFIED") {
    // Update team status to reflect verified truth
    const verifiedStatus = bl.verified_status || bl.status || "LOST";
    await cmsExecute(
      `UPDATE off_page_backlinks SET
        team_status = ?,
        status = ?,
        mismatch_status = 'RESOLVED',
        mismatch_resolution = 'ACCEPTED_VERIFIED',
        mismatch_resolved_at = NOW(),
        notes = CONCAT(IFNULL(notes, ''), ?),
        updated_at = NOW()
       WHERE id = ?`,
      [
        verifiedStatus,
        verifiedStatus,
        note ? ` [Manager accepted verified status ${verifiedStatus}: ${note}]` : ` [Manager accepted verified status ${verifiedStatus}]`,
        backlinkId,
      ]
    );
  } else if (resolution === "KEPT_TEAM") {
    // Keep team status with manager justification
    await cmsExecute(
      `UPDATE off_page_backlinks SET
        mismatch_status = 'RESOLVED',
        mismatch_resolution = 'KEPT_TEAM',
        mismatch_resolved_at = NOW(),
        notes = CONCAT(IFNULL(notes, ''), ?),
        updated_at = NOW()
       WHERE id = ?`,
      [
        note ? ` [Manager retained team status ${bl.team_status}: ${note}]` : ` [Manager retained team status ${bl.team_status}]`,
        backlinkId,
      ]
    );
  } else if (resolution === "ASSIGNED_REVIEW") {
    // Assign review task to executive
    await cmsExecute(
      `UPDATE off_page_backlinks SET
        owner = COALESCE(?, owner),
        mismatch_status = 'MISMATCH',
        mismatch_resolution = 'ASSIGNED_REVIEW',
        notes = CONCAT(IFNULL(notes, ''), ?),
        updated_at = NOW()
       WHERE id = ?`,
      [
        assignee || null,
        note ? ` [Assigned for review to ${assignee || "executive"}: ${note}]` : ` [Assigned for review to ${assignee || "executive"}]`,
        backlinkId,
      ]
    );
  }

  const { rows: finalRows } = await cmsQuery<OffPageBacklink>(
    `SELECT * FROM off_page_backlinks WHERE id = ? LIMIT 1`,
    [backlinkId]
  );

  return {
    success: true,
    backlink: finalRows[0] || null,
    message: `Mismatch resolved with action ${resolution}`,
  };
}

/**
 * Returns summary count of mismatches by type.
 */
export async function getMismatchSummary(): Promise<{
  activeMismatches: number;
  resolvedMismatches: number;
  teamLiveCrawlerLost: number;
  teamSubmittedCrawlerLive: number;
}> {
  await ensureOffPageTablesExist();

  const { rows: active } = await cmsQuery<{ count: number }>(
    `SELECT COUNT(*) as count FROM off_page_backlinks WHERE mismatch_status = 'MISMATCH'`
  );
  const { rows: resolved } = await cmsQuery<{ count: number }>(
    `SELECT COUNT(*) as count FROM off_page_backlinks WHERE mismatch_status = 'RESOLVED'`
  );
  const { rows: lostMismatches } = await cmsQuery<{ count: number }>(
    `SELECT COUNT(*) as count FROM off_page_backlinks 
     WHERE mismatch_status = 'MISMATCH' AND team_status = 'LIVE' AND verified_status IN ('LOST', 'BROKEN', 'NOT_FOUND')`
  );
  const { rows: prematureMismatches } = await cmsQuery<{ count: number }>(
    `SELECT COUNT(*) as count FROM off_page_backlinks 
     WHERE mismatch_status = 'MISMATCH' AND team_status IN ('SUBMITTED', 'PENDING', 'IN_PROGRESS') AND verified_status = 'LIVE'`
  );

  return {
    activeMismatches: active[0]?.count || 0,
    resolvedMismatches: resolved[0]?.count || 0,
    teamLiveCrawlerLost: lostMismatches[0]?.count || 0,
    teamSubmittedCrawlerLive: prematureMismatches[0]?.count || 0,
  };
}

