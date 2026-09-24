import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured, cmsQuery, cmsExecute } from "@/lib/cms/db";
import { runPageSpeedInsights, isPageSpeedConfigured, type PageSpeedStrategy } from "@/lib/seo/pagespeed";
import { randomUUID } from "node:crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "seo", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const cfg = isPageSpeedConfigured();
  if (!cfg.configured) {
    return NextResponse.json(
      { error: "PageSpeed API key is not configured in server environment (PAGESPEED_API_KEY or GOOGLE_API_KEY required)." },
      { status: 400 }
    );
  }

  if (!isCmsDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { forceUrl, retryFailed, auditRunId, limit = 3 } = body;
    const batchSize = Math.max(1, Math.min(Number(limit) || 3, 5));

    // Case A: User requested "Measure This Page" directly
    if (forceUrl) {
      const results: any[] = [];
      for (const strategy of ["mobile", "desktop"] as const) {
        const jobId = `psj_${randomUUID().slice(0, 16)}`;
        try {
          const res = await runPageSpeedInsights(forceUrl, strategy, true);
          results.push({ strategy, score: res.performanceScore, lab: res.labMetrics });

          // Update page record if applicable
          const col = strategy === "mobile" ? "mobile_speed" : "desktop_speed";
          await cmsExecute(
            `UPDATE site_audit_pages SET ${strategy === "mobile" ? "mobile_speed" : "desktop_speed"} = ? WHERE url = ?`,
            [res.performanceScore, forceUrl]
          ).catch(() => {});
        } catch (err: any) {
          results.push({ strategy, error: err.message });
        }
      }

      return NextResponse.json({
        ok: true,
        type: "single_page_measured",
        url: forceUrl,
        results,
      });
    }

    // Case B: User requested "Retry Failed"
    if (retryFailed) {
      await cmsExecute(
        `UPDATE pagespeed_jobs SET status = 'QUEUED', attempt_count = 0, last_error = NULL WHERE status = 'FAILED'`
      );
    }

    // Case C: Standard Queue Batch
    const { rows: jobs } = await cmsQuery<any>(
      `SELECT id, audit_run_id, url, strategy, attempt_count
       FROM pagespeed_jobs
       WHERE status = 'QUEUED' OR (status = 'FAILED' AND attempt_count < 3)
       ORDER BY attempt_count ASC, created_at ASC
       LIMIT ?`,
      [batchSize]
    );

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({
        ok: true,
        processedCount: 0,
        completedCount: 0,
        failedCount: 0,
        remainingQueued: 0,
        message: "No pending PageSpeed jobs in queue.",
      });
    }

    let completedCount = 0;
    let failedCount = 0;
    const jobResults: any[] = [];

    for (const job of jobs) {
      const newAttempts = Number(job.attempt_count || 0) + 1;
      await cmsExecute(
        `UPDATE pagespeed_jobs SET status = 'RUNNING', started_at = NOW(), attempt_count = ? WHERE id = ?`,
        [newAttempts, job.id]
      );

      try {
        const res = await runPageSpeedInsights(job.url, job.strategy as PageSpeedStrategy, true);
        await cmsExecute(
          `UPDATE pagespeed_jobs SET status = 'COMPLETED', completed_at = NOW(), last_error = NULL WHERE id = ?`,
          [job.id]
        );
        completedCount++;

        jobResults.push({
          id: job.id,
          url: job.url,
          strategy: job.strategy,
          status: "COMPLETED",
          performanceScore: res.performanceScore,
          accessibilityScore: res.accessibilityScore,
          bestPracticesScore: res.bestPracticesScore,
          seoScore: res.seoScore,
        });
      } catch (jobErr: any) {
        failedCount++;
        await cmsExecute(
          `UPDATE pagespeed_jobs SET status = 'FAILED', last_error = ? WHERE id = ?`,
          [jobErr?.message || "Execution exception", job.id]
        );

        jobResults.push({
          id: job.id,
          url: job.url,
          strategy: job.strategy,
          status: "FAILED",
          error: jobErr?.message,
        });
      }
    }

    const { rows: remaining } = await cmsQuery<any>(
      `SELECT COUNT(*) as cnt FROM pagespeed_jobs WHERE status = 'QUEUED'`
    );
    const remainingQueued = Number(remaining[0]?.cnt || 0);

    return NextResponse.json({
      ok: true,
      processedCount: jobs.length,
      completedCount,
      failedCount,
      remainingQueued,
      jobs: jobResults,
    });
  } catch (err: any) {
    console.error("PageSpeed process-batch error:", err);
    return NextResponse.json({ error: err?.message || "Failed to process PageSpeed batch" }, { status: 500 });
  }
}
