import { NextRequest, NextResponse } from "next/server";
import { guardOffPage } from "@/lib/off-page/route-auth";
import {
  getActionCenterKpis,
  getTodayTasks,
  getNeedsReviewItems,
  getResultsAndLostLinks,
  approveOpportunity,
  rejectOpportunity,
  assignOpportunity,
  snoozeOpportunity,
  submitTaskCompletion,
} from "@/lib/off-page/action-center";

export async function GET(req: NextRequest) {
  const denied = await guardOffPage("view");
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const [kpis, todayTasks, needsReviewItems, resultsAndLostLinks] = await Promise.all([
      getActionCenterKpis(),
      getTodayTasks({ owner, limit }),
      getNeedsReviewItems({ limit }),
      getResultsAndLostLinks({ limit }),
    ]);

    return NextResponse.json({
      success: true,
      kpis,
      todayTasks,
      needsReviewItems,
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

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
