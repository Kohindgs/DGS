import { randomUUID } from "node:crypto";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "./db";
import { revalidateOpportunityUrls } from "./discovery";
import { checkLiveBacklink } from "./backlinks";
import { generateMonthlyOffPageReport } from "./reports";
import type { OffPageBacklink } from "./types";

/**
 * Runs the daily automated off-page maintenance suite:
 * 1. Revalidates opportunities (checks dead submission pages, updates expired).
 * 2. Checks active backlinks (verifies presence, anchor, rel, source indexability).
 * 3. On 1st of month, generates previous month's executive report.
 * 4. Logs run to off_page_automation_runs.
 */
export async function runDailyOffPageAutomation(runType: string = "FULL_AUTOMATION"): Promise<{
  runId: string;
  status: "SUCCESS" | "FAILED";
  summary: any;
  error?: string;
}> {
  await ensureOffPageTablesExist();

  const runId = `run_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const startedAt = new Date();

  await cmsExecute(
    `INSERT INTO off_page_automation_runs (id, run_type, status, started_at)
     VALUES (?, ?, 'RUNNING', ?)`,
    [runId, runType, startedAt]
  );

  const summary: any = {
    revalidatedOpportunities: { checked: 0, healthy: 0, dead: 0 },
    backlinksChecked: { checked: 0, live: 0, lost: 0, broken: 0 },
    monthlyReportGenerated: false,
  };

  try {
    // 1. Revalidate active opportunities
    const reval = await revalidateOpportunityUrls(15);
    summary.revalidatedOpportunities = reval;

    // 2. Check active backlinks
    const { rows: links } = await cmsQuery<OffPageBacklink>(
      `SELECT id FROM off_page_backlinks WHERE status IN ('LIVE', 'VERIFIED') LIMIT 10`
    );

    let liveCount = 0;
    let lostCount = 0;
    let brokenCount = 0;

    for (const l of links) {
      const res = await checkLiveBacklink(l.id);
      if (res.status === "LIVE" || res.status === "VERIFIED") liveCount++;
      else if (res.status === "LOST") lostCount++;
      else brokenCount++;
    }
    summary.backlinksChecked = {
      checked: links.length,
      live: liveCount,
      lost: lostCount,
      broken: brokenCount,
    };

    // 3. On 1st day of month (or if no report exists for previous month), generate monthly report
    const today = new Date();
    const prevMonthDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
    const prevMonthStr = prevMonthDate.toISOString().slice(0, 7);

    const { rows: repRows } = await cmsQuery<{ id: string }>(
      `SELECT id FROM off_page_monthly_reports WHERE report_month = ? LIMIT 1`,
      [prevMonthStr]
    );

    if (repRows.length === 0 || today.getUTCDate() === 1) {
      await generateMonthlyOffPageReport(prevMonthStr);
      summary.monthlyReportGenerated = true;
      summary.generatedReportMonth = prevMonthStr;
    }

    const completedAt = new Date();
    await cmsExecute(
      `UPDATE off_page_automation_runs SET 
        status = 'SUCCESS', 
        completed_at = ?, 
        summary = ? 
       WHERE id = ?`,
      [completedAt, JSON.stringify(summary), runId]
    );

    return {
      runId,
      status: "SUCCESS",
      summary,
    };
  } catch (err: any) {
    const errorMsg = err?.message || "Unknown error during off-page automation";
    await cmsExecute(
      `UPDATE off_page_automation_runs SET 
        status = 'FAILED', 
        completed_at = NOW(), 
        error_message = ?, 
        summary = ? 
       WHERE id = ?`,
      [errorMsg, JSON.stringify(summary), runId]
    );

    return {
      runId,
      status: "FAILED",
      summary,
      error: errorMsg,
    };
  }
}
