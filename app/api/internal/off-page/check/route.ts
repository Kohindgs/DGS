import { NextResponse } from "next/server";
import { runDailyOffPageAutomation } from "@/lib/off-page/automation";
import { recordCronRun } from "@/lib/cms/cron-logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const startedAt = new Date();
  const cronSecret = process.env.DGS_CRON_SECRET;

  if (!cronSecret || cronSecret.trim().length === 0) {
    return NextResponse.json(
      { ok: false, message: "DGS_CRON_SECRET is not configured on server" },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  // Strict dedicated cron authentication only.
  if (!token || token !== cronSecret.trim()) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized. Invalid or missing DGS_CRON_SECRET bearer token." },
      { status: 401 },
    );
  }

  const githubRunId = request.headers.get("x-github-run-id") || null;

  try {
    const result = await runDailyOffPageAutomation("cron");
    const completedAt = new Date();
    const durationMs = Math.max(0, completedAt.getTime() - startedAt.getTime());
    const newOpps = result.summary?.newOpportunitiesAdded || 0;
    const isFailed = result.status === "FAILED";
    const httpStatus = isFailed ? 500 : 200;

    await recordCronRun({
      jobName: "off-page-seo-daily-monitor",
      endpoint: "/api/internal/off-page/check",
      triggerSource: "github_actions",
      startedAt,
      completedAt,
      durationMs,
      status: isFailed ? "FAILED" : "SUCCESS",
      httpStatus,
      recordsChecked: Number(result.summary?.recordsEvaluated || 0),
      recordsProcessed: newOpps,
      recordsFailed: isFailed ? 1 : 0,
      errorSummary: isFailed ? String(result.error || "Off-page automation failed") : null,
      metadata: {
        runId: result.runId,
        githubRunId,
        summary: result.summary,
      },
    });

    if (isFailed) {
      return NextResponse.json(
        {
          ok: false,
          github_workflow_run_id: githubRunId,
          http_result: 500,
          db_automation_run_id: result.runId,
          durationMs,
          message: `Off-page SEO automated check failed (${result.runId}).`,
          result,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      github_workflow_run_id: githubRunId,
      http_result: 200,
      db_automation_run_id: result.runId,
      new_opportunities_added: newOpps,
      durationMs,
      message: `Off-page SEO automated check completed (${result.runId}). Status: ${result.status}. Net-new opportunities added: ${newOpps}`,
      result,
    });
  } catch (err: any) {
    const completedAt = new Date();
    const durationMs = Math.max(0, completedAt.getTime() - startedAt.getTime());
    const errorMessage = String(err?.message || "Failed to execute off-page automation");
    const errorCode = err?.code ? String(err.code) : null;

    await recordCronRun({
      jobName: "off-page-seo-daily-monitor",
      endpoint: "/api/internal/off-page/check",
      triggerSource: "github_actions",
      startedAt,
      completedAt,
      durationMs,
      status: "FAILED",
      httpStatus: 500,
      errorCode,
      errorSummary: errorMessage,
    });

    console.error("Automated off-page check failed:", err);
    return NextResponse.json(
      { ok: false, message: errorMessage, errorCode, durationMs },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: false, message: "Method not allowed. Use POST with Bearer authentication." },
    { status: 405 },
  );
}
