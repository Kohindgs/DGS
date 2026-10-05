import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "./db";
import { getMismatchSummary } from "./backlinks";
import {
  MANDATORY_NEXT_ACTIONS,
  type MandatoryNextAction,
  type OffPageOpportunity,
  type OpportunityStatus,
  type PriorityTier,
} from "./types";

export { MANDATORY_NEXT_ACTIONS, type MandatoryNextAction };

export interface ResultBacklinkItem {
  id: string;
  source_domain: string;
  source_url: string;
  target_url: string;
  anchor_text: string | null;
  team_status: string;
  crawler_status: string;
  status_mismatch: boolean;
  http_status: number | null;
  link_rel: string | null;
  last_checked_at: string | null;
  created_at: string;
}

export interface ActionCenterKpis {
  pipelineCounts: Record<string, number>;
  totalInPipeline: number;
  rawCandidatesCount: number;
  qualifiedCount: number;
  needsReviewCount: number;
  assignedActiveCount: number;
  dueTodayCount: number;
  overdueCount: number;
  mismatchesCount: number;
  recentlyVerifiedLive: number;
}

export interface TodayTaskItem {
  id: string;
  site_name: string;
  domain: string;
  category: string;
  priority_tier: PriorityTier;
  status: OpportunityStatus;
  owner: string | null;
  next_action: string;
  due_date: string | null;
  is_overdue: boolean;
  is_due_today: boolean;
  internal_note: string | null;
  recommended_dgs_target_page: string;
  exact_submission_url: string;
  source_type: string;
}

/**
 * Retrieves Action Center dashboard KPIs.
 */
export async function getActionCenterKpis(): Promise<ActionCenterKpis> {
  await ensureOffPageTablesExist();

  // Get counts by status from opportunities
  const { rows: statusRows } = await cmsQuery<{ status: string; count: any }>(
    `SELECT status, COUNT(*) as count FROM off_page_opportunities GROUP BY status`
  );

  const pipelineCounts: Record<string, number> = {
    DISCOVERED: 0,
    VERIFYING: 0,
    QUALIFIED: 0,
    MANAGER_REVIEW: 0,
    ASSIGNED: 0,
    IN_PROGRESS: 0,
    SUBMITTED: 0,
    FOLLOW_UP: 0,
    LIVE: 0,
    MONITORING: 0,
    REJECTED: 0,
    SNOOZED: 0,
  };

  let totalInPipeline = 0;
  for (const row of statusRows) {
    const s = String(row.status || "").toUpperCase();
    const cnt = Number(row.count) || 0;
    if (pipelineCounts[s] !== undefined) {
      pipelineCounts[s] = cnt;
    } else if (s === "NEW") {
      pipelineCounts.DISCOVERED += cnt;
    } else if (s === "APPROVED") {
      pipelineCounts.QUALIFIED += cnt;
    } else if (s === "OUTREACH") {
      pipelineCounts.IN_PROGRESS += cnt;
    } else if (s === "VERIFIED") {
      pipelineCounts.LIVE += cnt;
    }
    if (s !== "REJECTED" && s !== "ARCHIVED" && s !== "EXPIRED" && s !== "SPAM") {
      totalInPipeline += cnt;
    }
  }

  // Needs Review: Unassigned opportunities in actionable stages awaiting manager allocation
  const { rows: reviewRows } = await cmsQuery<{ count: any }>(
    `SELECT COUNT(*) as count FROM off_page_opportunities 
     WHERE (status IN ('MANAGER_REVIEW', 'QUALIFIED', 'APPROVED', 'NEW', 'DISCOVERED'))
       AND (owner IS NULL OR owner = '')
       AND status NOT IN ('REJECTED', 'ARCHIVED', 'EXPIRED', 'SPAM')`
  );
  const needsReviewCount = Number(reviewRows[0]?.count) || 0;

  // Active Assigned (Allocated to an owner and actively in flight)
  const { rows: activeAssignedRows } = await cmsQuery<{ count: any }>(
    `SELECT COUNT(*) as count FROM off_page_opportunities 
     WHERE owner IS NOT NULL AND owner != ''
       AND status IN ('ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'FOLLOW_UP')`
  );
  const assignedActiveCount = Number(activeAssignedRows[0]?.count) || 0;

  // Overdue and Due Today
  const { rows: overdueRows } = await cmsQuery<{ count: any }>(
    `SELECT COUNT(*) as count FROM off_page_opportunities 
     WHERE due_date IS NOT NULL 
       AND due_date < CURDATE() 
       AND status NOT IN ('LIVE', 'MONITORING', 'REJECTED', 'ARCHIVED')`
  );
  const overdueCount = Number(overdueRows[0]?.count) || 0;

  const { rows: dueTodayRows } = await cmsQuery<{ count: any }>(
    `SELECT COUNT(*) as count FROM off_page_opportunities 
     WHERE due_date = CURDATE() 
       AND status NOT IN ('LIVE', 'MONITORING', 'REJECTED', 'ARCHIVED')`
  );
  const dueTodayCount = Number(dueTodayRows[0]?.count) || 0;

  // Recently verified live (last 7 days)
  const { rows: liveRows } = await cmsQuery<{ count: any }>(
    `SELECT COUNT(*) as count FROM off_page_opportunities 
     WHERE status IN ('LIVE', 'MONITORING', 'VERIFIED') 
       AND updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
  );
  const recentlyVerifiedLive = Number(liveRows[0]?.count) || 0;

  // Mismatches from backlinks table
  const mismatchSummary = await getMismatchSummary();

  return {
    pipelineCounts,
    totalInPipeline,
    rawCandidatesCount: Number(pipelineCounts.DISCOVERED) || 0,
    qualifiedCount: Number(pipelineCounts.QUALIFIED) || 0,
    needsReviewCount,
    assignedActiveCount,
    dueTodayCount,
    overdueCount,
    mismatchesCount: Number(mismatchSummary.activeMismatches) || 0,
    recentlyVerifiedLive,
  };
}

/**
 * Returns prioritized "What Your Team Should Do Today" items.
 */
export async function getTodayTasks(params?: {
  owner?: string;
  limit?: number;
}): Promise<TodayTaskItem[]> {
  await ensureOffPageTablesExist();

  const limit = Math.min(Math.max(params?.limit || 25, 1), 100);
  const whereClauses = [
    `status IN ('ASSIGNED', 'IN_PROGRESS', 'MANAGER_REVIEW', 'QUALIFIED', 'FOLLOW_UP')`,
  ];
  const queryParams: any[] = [];

  if (params?.owner) {
    whereClauses.push(`(owner = ? OR assigned_to = ?)`);
    queryParams.push(params.owner, params.owner);
  }

  const sql = `
    SELECT 
      id, site_name, domain, category, priority_tier, status,
      COALESCE(owner, assigned_to) as owner,
      COALESCE(next_action, 'Review opportunity and formulate pitch') as next_action,
      DATE_FORMAT(due_date, '%Y-%m-%d') as due_date,
      (due_date IS NOT NULL AND due_date < CURDATE()) as is_overdue,
      (due_date = CURDATE()) as is_due_today,
      internal_note,
      recommended_dgs_target_page,
      exact_submission_url,
      COALESCE(source_type, 'curated') as source_type
    FROM off_page_opportunities
    WHERE ${whereClauses.join(" AND ")}
    ORDER BY 
      is_overdue DESC,
      is_due_today DESC,
      CASE priority_tier
        WHEN 'P0' THEN 1
        WHEN 'P1' THEN 2
        WHEN 'P2' THEN 3
        ELSE 4
      END ASC,
      due_date ASC,
      updated_at DESC
    LIMIT ?
  `;

  queryParams.push(limit);

  const { rows } = await cmsQuery<TodayTaskItem>(sql, queryParams);
  return rows.map((r) => ({
    ...r,
    is_overdue: Boolean(r.is_overdue),
    is_due_today: Boolean(r.is_due_today),
  }));
}

/**
 * Returns opportunities awaiting manager review (unassigned in actionable stages).
 */
export async function getNeedsReviewItems(params?: { limit?: number }): Promise<TodayTaskItem[]> {
  await ensureOffPageTablesExist();
  const limit = Math.min(Math.max(params?.limit || 50, 1), 200);

  const sql = `
    SELECT 
      id, site_name, domain, category, priority_tier, status,
      COALESCE(owner, assigned_to) as owner,
      COALESCE(next_action, 'Review opportunity and allocate to executive') as next_action,
      DATE_FORMAT(due_date, '%Y-%m-%d') as due_date,
      (due_date IS NOT NULL AND due_date < CURDATE()) as is_overdue,
      (due_date = CURDATE()) as is_due_today,
      internal_note,
      recommended_dgs_target_page,
      exact_submission_url,
      COALESCE(source_type, 'curated') as source_type
    FROM off_page_opportunities
    WHERE (status IN ('MANAGER_REVIEW', 'QUALIFIED', 'APPROVED', 'NEW', 'DISCOVERED'))
      AND (owner IS NULL OR owner = '')
      AND status NOT IN ('REJECTED', 'ARCHIVED', 'EXPIRED', 'SPAM')
    ORDER BY 
      CASE priority_tier
        WHEN 'P0' THEN 1
        WHEN 'P1' THEN 2
        WHEN 'P2' THEN 3
        ELSE 4
      END ASC,
      priority_score DESC,
      created_at DESC
    LIMIT ?
  `;

  const { rows } = await cmsQuery<TodayTaskItem>(sql, [limit]);
  return rows.map((r) => ({
    ...r,
    is_overdue: Boolean(r.is_overdue),
    is_due_today: Boolean(r.is_due_today),
  }));
}

/**
 * Returns backlinks for Results / Lost Links queue: live links, lost links, and mismatches.
 */
export async function getResultsAndLostLinks(params?: { limit?: number }): Promise<ResultBacklinkItem[]> {
  await ensureOffPageTablesExist();
  const limit = Math.min(Math.max(params?.limit || 50, 1), 200);

  const sql = `
    SELECT 
      id, source_domain, source_url, target_url, anchor_text,
      COALESCE(team_status, 'LIVE') as team_status,
      COALESCE(verified_status, status) as crawler_status,
      (mismatch_status = 'MISMATCH') as status_mismatch,
      http_status,
      link_rel,
      DATE_FORMAT(last_checked_at, '%Y-%m-%d %H:%i') as last_checked_at,
      DATE_FORMAT(created_at, '%Y-%m-%d') as created_at
    FROM off_page_backlinks
    WHERE status NOT IN ('ARCHIVED')
    ORDER BY 
      (mismatch_status = 'MISMATCH') DESC,
      CASE COALESCE(verified_status, status)
        WHEN 'LOST' THEN 1
        WHEN 'BROKEN' THEN 2
        WHEN 'LIVE' THEN 3
        ELSE 4
      END ASC,
      last_checked_at DESC,
      created_at DESC
    LIMIT ?
  `;

  const { rows } = await cmsQuery<ResultBacklinkItem>(sql, [limit]);
  return rows.map((r) => ({
    ...r,
    status_mismatch: Boolean(r.status_mismatch),
  }));
}

/**
 * Manager Decision: Approve Opportunity
 */
export async function approveOpportunity(
  id: string,
  options?: {
    next_action?: string;
    due_date?: string;
    owner?: string;
    note?: string;
  }
): Promise<{ success: boolean; opportunity: OffPageOpportunity | null }> {
  await ensureOffPageTablesExist();

  const newStatus: OpportunityStatus = options?.owner ? "ASSIGNED" : "QUALIFIED";
  const nextAction = options?.next_action || (options?.owner ? "Execute outreach and submission" : "Awaiting assignment");

  await cmsExecute(
    `UPDATE off_page_opportunities SET
      status = ?,
      owner = COALESCE(?, owner),
      assigned_to = COALESCE(?, assigned_to),
      next_action = ?,
      due_date = COALESCE(?, due_date),
      internal_note = CONCAT(IFNULL(internal_note, ''), ?),
      qualified_at = NOW(),
      assigned_at = IF(? IS NOT NULL, NOW(), assigned_at),
      updated_at = NOW()
     WHERE id = ?`,
    [
      newStatus,
      options?.owner || null,
      options?.owner || null,
      nextAction,
      options?.due_date || null,
      options?.note ? `\n[Approved: ${options.note}]` : "\n[Approved by Manager]",
      options?.owner || null,
      id,
    ]
  );

  const { rows } = await cmsQuery<OffPageOpportunity>(
    `SELECT * FROM off_page_opportunities WHERE id = ? LIMIT 1`,
    [id]
  );
  return { success: true, opportunity: rows[0] || null };
}

/**
 * Manager Decision: Reject Opportunity
 */
export async function rejectOpportunity(
  id: string,
  reason: string
): Promise<{ success: boolean; opportunity: OffPageOpportunity | null }> {
  await ensureOffPageTablesExist();

  await cmsExecute(
    `UPDATE off_page_opportunities SET
      status = 'REJECTED',
      rejection_reason = ?,
      internal_note = CONCAT(IFNULL(internal_note, ''), '\n[Rejected: ', ?, ']'),
      updated_at = NOW()
     WHERE id = ?`,
    [reason, reason, id]
  );

  const { rows } = await cmsQuery<OffPageOpportunity>(
    `SELECT * FROM off_page_opportunities WHERE id = ? LIMIT 1`,
    [id]
  );
  return { success: true, opportunity: rows[0] || null };
}

/**
 * Manager Decision: Assign Task to Team Member
 */
export async function assignOpportunity(
  id: string,
  owner: string,
  nextAction: string,
  dueDate: string,
  note?: string
): Promise<{ success: boolean; opportunity: OffPageOpportunity | null }> {
  await ensureOffPageTablesExist();

  await cmsExecute(
    `UPDATE off_page_opportunities SET
      status = 'ASSIGNED',
      owner = ?,
      assigned_to = ?,
      next_action = ?,
      due_date = ?,
      internal_note = CONCAT(IFNULL(internal_note, ''), ?),
      assigned_at = NOW(),
      updated_at = NOW()
     WHERE id = ?`,
    [
      owner,
      owner,
      nextAction,
      dueDate,
      note ? `\n[Assigned to ${owner}: ${note}]` : `\n[Assigned to ${owner}]`,
      id,
    ]
  );

  const { rows } = await cmsQuery<OffPageOpportunity>(
    `SELECT * FROM off_page_opportunities WHERE id = ? LIMIT 1`,
    [id]
  );
  return { success: true, opportunity: rows[0] || null };
}

/**
 * Manager Decision: Snooze Opportunity
 */
export async function snoozeOpportunity(
  id: string,
  snoozeUntil: string,
  reason?: string
): Promise<{ success: boolean; opportunity: OffPageOpportunity | null }> {
  await ensureOffPageTablesExist();

  await cmsExecute(
    `UPDATE off_page_opportunities SET
      status = 'SNOOZED',
      snoozed_until = ?,
      internal_note = CONCAT(IFNULL(internal_note, ''), ?),
      updated_at = NOW()
     WHERE id = ?`,
    [
      snoozeUntil,
      reason ? `\n[Snoozed until ${snoozeUntil}: ${reason}]` : `\n[Snoozed until ${snoozeUntil}]`,
      id,
    ]
  );

  const { rows } = await cmsQuery<OffPageOpportunity>(
    `SELECT * FROM off_page_opportunities WHERE id = ? LIMIT 1`,
    [id]
  );
  return { success: true, opportunity: rows[0] || null };
}

/**
 * Team Execution: Complete Task & Submit Proof
 */
export async function submitTaskCompletion(
  id: string,
  proofUrl: string,
  submissionDate: string,
  note?: string
): Promise<{ success: boolean; opportunity: OffPageOpportunity | null }> {
  await ensureOffPageTablesExist();

  await cmsExecute(
    `UPDATE off_page_opportunities SET
      status = 'SUBMITTED',
      proof_url = ?,
      submission_date = ?,
      next_action = 'Verify link is indexed and live',
      internal_note = CONCAT(IFNULL(internal_note, ''), ?),
      updated_at = NOW()
     WHERE id = ?`,
    [
      proofUrl,
      submissionDate,
      note ? `\n[Submitted with proof ${proofUrl}: ${note}]` : `\n[Submitted with proof ${proofUrl}]`,
      id,
    ]
  );

  const { rows } = await cmsQuery<OffPageOpportunity>(
    `SELECT * FROM off_page_opportunities WHERE id = ? LIMIT 1`,
    [id]
  );
  return { success: true, opportunity: rows[0] || null };
}
