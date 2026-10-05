import { NextRequest, NextResponse } from "next/server";
import { guardOffPage } from "@/lib/off-page/route-auth";
import {
  getActionCenterKpis,
  getTodayTasks,
  getNeedsReviewItems,
  getNeedsVerificationItems,
  getResultsAndLostLinks,
  approveOpportunity,
  rejectOpportunity,
  assignOpportunity,
  snoozeOpportunity,
  submitTaskCompletion,
} from "@/lib/off-page/action-center";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";

export async function GET(req: NextRequest) {
  const denied = await guardOffPage("view");
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const [kpis, todayTasks, needsReviewItems, needsVerificationItems, resultsAndLostLinks] = await Promise.all([
      getActionCenterKpis(),
      getTodayTasks({ owner, limit }),
      getNeedsReviewItems({ limit }),
      getNeedsVerificationItems({ limit }),
      getResultsAndLostLinks({ limit }),
    ]);

    return NextResponse.json({
      success: true,
      kpis,
      todayTasks,
      needsReviewItems,
      needsVerificationItems,
      resultsAndLostLinks,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await guardOffPage("edit");
  if (denied) return denied;

  try {
    const body = await req.json();
    const { action, id } = body;

    if (!id || !action) {
      return NextResponse.json({ error: "id and action are required" }, { status: 400 });
    }

    if (action === "approve") {
      const { nextAction, dueDate, owner, note } = body;
      const res = await approveOpportunity(id, {
        next_action: nextAction,
        due_date: dueDate,
        owner,
        note,
      });
      return NextResponse.json(res);
    }

    if (action === "reject") {
      const { reason } = body;
      if (!reason) {
        return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
      }
      const res = await rejectOpportunity(id, reason);
      return NextResponse.json(res);
    }

    if (action === "assign") {
      const { owner, nextAction, dueDate, note } = body;
      if (!owner || !nextAction || !dueDate) {
        return NextResponse.json(
          { error: "owner, nextAction, and dueDate are mandatory when assigning" },
          { status: 400 }
        );
      }
      const res = await assignOpportunity(id, owner, nextAction, dueDate, note);
      return NextResponse.json(res);
    }

    if (action === "snooze") {
      const { snoozeUntil, reason } = body;
      if (!snoozeUntil) {
        return NextResponse.json({ error: "snoozeUntil date is required" }, { status: 400 });
      }
      const res = await snoozeOpportunity(id, snoozeUntil, reason);
      return NextResponse.json(res);
    }

    if (action === "complete") {
      const { proofUrl, submissionDate, note } = body;
      if (!proofUrl || !submissionDate) {
        return NextResponse.json(
          { error: "proofUrl and submissionDate are required for task completion" },
          { status: 400 }
        );
      }
      const res = await submitTaskCompletion(id, proofUrl, submissionDate, note);
      return NextResponse.json(res);
    }

    if (action === "verify_qualify") {
      const { category, targetPage } = body;
      const { rows } = await cmsQuery<any>(
        `SELECT * FROM off_page_raw_candidates WHERE id = ? LIMIT 1`,
        [id]
      );
      if (!rows.length) {
        return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
      }
      const cand = rows[0];
      const oppId = `opp_${cand.domain.replace(/[^a-z0-9]/gi, "_").slice(0, 15)}_${Date.now().toString(36)}`;
      
      await cmsExecute(
        `INSERT INTO off_page_opportunities (
          id, site_name, domain, exact_submission_url, category, status, verification_status,
          priority_tier, source_type, discovery_lane, page_title, page_intent, confidence,
          action_required, action_destination, actionability_score, actionable_evidence,
          recommended_dgs_target_page, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'QUALIFIED', 'VERIFIED_ACTIVE', 'P1', 'web_search', ?, ?, ?, 'HIGH', ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          oppId,
          cand.domain,
          cand.domain,
          cand.page_url,
          category || "AGENCY_DIRECTORY",
          cand.discovery_lane || "AGENCY_DIRECTORIES",
          cand.page_title,
          cand.page_intent || "BUSINESS_DIRECTORY",
          cand.action_required || "SUBMIT_LISTING",
          cand.action_destination || cand.page_url,
          cand.actionability_score || 80,
          cand.actionable_evidence,
          targetPage || "https://www.dgeniussolutions.com/",
        ]
      );

      await cmsExecute(
        `UPDATE off_page_raw_candidates 
            SET qualification_status = 'QUALIFIED', confidence = 'HIGH', opportunity_id = ?, updated_at = NOW()
          WHERE id = ?`,
        [oppId, id]
      );

      return NextResponse.json({ success: true, opportunityId: oppId });
    }

    if (action === "verify_reject") {
      const { reason } = body;
      await cmsExecute(
        `UPDATE off_page_raw_candidates 
            SET qualification_status = 'REJECTED', qualification_reason = ?, updated_at = NOW()
          WHERE id = ?`,
        [reason || "Rejected by SEO Analyst during verification", id]
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
