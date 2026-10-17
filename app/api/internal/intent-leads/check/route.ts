import { NextResponse } from "next/server";
import { runIntentLeadDiscovery } from "@/lib/intent-leads/engine";
import { recordCronRun } from "@/lib/cms/cron-logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const startedAt = new Date();
  const cronSecret = process.env.DGS_CRON_SECRET;

  if (!cronSecret || cronSecret.trim().length === 0) {
    return NextResponse.json(
      { ok: false, message: "DGS_CRON_SECRET is not configured on server" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!token || token !== cronSecret.trim()) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized. Invalid or missing DGS_CRON_SECRET bearer token." },
      { status: 401 }
    );
  }

  const githubRunId = request.headers.get("x-github-run-id") || null;

  try {
    const result = await runIntentLeadDiscovery({
      runType: "CRON",
      sendEmailDigest: true,
    });

    const completedAt = new Date();
    const durationMs = Math.max(0, completedAt.getTime() - startedAt.getTime());
    const isFailed = result.status === "FAILED";
    const httpStatus = isFailed ? 500 : 200;

    await recordCronRun({
      jobName: "buyer-intent-lead-monitor",
      endpoint: "/api/internal/intent-leads/check",
      triggerSource: "github_actions",
      startedAt,
      completedAt,
      durationMs,
      status: isFailed ? "FAILED" : "SUCCESS",
      httpStatus,
      recordsChecked: result.rawCandidatesFound,
      recordsProcessed: result.qualifiedLeadsAdded,
      recordsFailed: isFailed ? 1 : 0,
      errorSummary: isFailed ? result.summaryText : null,
      metadata: {
        runId: result.runId,
        githubRunId,
        queriesExecuted: result.queriesExecuted,
        rejectedNoiseCount: result.rejectedNoiseCount,
        emailsSent: result.emailsSent,
      },
    });

    return NextResponse.json(
      {
        ok: !isFailed,
        github_workflow_run_id: githubRunId,
        http_result: httpStatus,
        durationMs,
        message: result.summaryText,
        result,
      },
      { status: httpStatus }
    );
  } catch (err: any) {
    const completedAt = new Date();
    const durationMs = Math.max(0, completedAt.getTime() - startedAt.getTime());
    const errorMessage = String(err?.message || "Failed to execute buyer-intent lead monitor");

    await recordCronRun({
      jobName: "buyer-intent-lead-monitor",
      endpoint: "/api/internal/intent-leads/check",
      triggerSource: "github_actions",
      startedAt,
      completedAt,
      durationMs,
      status: "FAILED",
      httpStatus: 500,
      errorSummary: errorMessage,
      metadata: { githubRunId },
    });

    return NextResponse.json(
      { ok: false, durationMs, message: errorMessage },
      { status: 500 }
    );
  }
}
