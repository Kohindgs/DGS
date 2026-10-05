import { randomUUID } from "node:crypto";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "./db";
import { revalidateOpportunityUrls, runOpportunityDiscoverySuite } from "./discovery";
import { checkLiveBacklink } from "./backlinks";
import { generateMonthlyOffPageReport } from "./reports";
import type { OffPageBacklink } from "./types";

/**
 * Runs the daily automated off-page maintenance suite:
 * 1. Checks persisted off_page_settings to respect enabled modules.
 * 2. Runs net-new opportunity discovery.
 * 3. Revalidates opportunities via priority rotating queue.
 * 4. Checks live backlinks via priority rotating queue.
 * 5. On 1st of month (or if no report exists for previous month), generates monthly executive report.
 * 6. Logs run to off_page_automation_runs.
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

  // Read settings from key-value table
  const { rows: settingsRows } = await cmsQuery<{
    key_name: string;
    key_value: string;
  }>(`SELECT key_name, key_value FROM off_page_settings`);

  const settingsMap: Record<string, string> = {
    daily_discovery_enabled: "true",
    auto_revalidation_enabled: "true",
    auto_check_backlinks: "true",
    discovery_provider: "NONE",
  };
  for (const r of settingsRows) {
    settingsMap[r.key_name] = r.key_value;
  }

  const discoveryEnabled = settingsMap.daily_discovery_enabled !== "false";
  const revalidationEnabled = settingsMap.auto_revalidation_enabled !== "false";
  const backlinksEnabled = settingsMap.auto_check_backlinks !== "false";

  const summary: any = {
    discovery: {
      provider_status: "DISCOVERY_PROVIDER_NOT_CONFIGURED",
      new_records_added: 0,
      message: "Discovery disabled or not configured",
    },
    revalidatedOpportunities: { checked: 0, healthy: 0, dead: 0 },
    backlinksChecked: { checked: 0, live: 0, lost: 0, broken: 0 },
    monthlyReportGenerated: false,
    newOpportunitiesAdded: 0,
  };

  try {
    // 1. Run Opportunity Discovery
    if (discoveryEnabled) {
      const disc = await runOpportunityDiscoverySuite();
      summary.discovery = disc;
      summary.newOpportunitiesAdded = disc.new_records_added;

      // 1b. V8.12.6 discovery lanes (only lanes with a usable live provider)
      try {
        const { getLaneOverview, runDiscoveryLane } = await import("./lanes/runner");
        const lanes = await getLaneOverview();
        summary.lanes = [];
        for (const lane of lanes) {
          if (!lane.ready) {
            summary.lanes.push({ lane: lane.id, status: "SKIPPED", reason: lane.readiness });
            continue;
          }
          const r = await runDiscoveryLane(lane.id, { maxQueries: 2, perQuery: 10, maxValidate: 20 });
          summary.lanes.push({ lane: lane.id, status: r.status, qualified: r.qualified_inserted, discovered: r.discovered_inserted, rejected: r.rejected });
          summary.newOpportunitiesAdded += r.qualified_inserted + r.discovered_inserted;
        }
      } catch (laneErr: any) {
        summary.lanesError = laneErr?.message || String(laneErr);
      }
    }

    // 2. Revalidate active opportunities via rotating queue
    if (revalidationEnabled) {
      const reval = await revalidateOpportunityUrls(25);
      summary.revalidatedOpportunities = reval;
    }

    // 3. Check active backlinks via rotating queue (where next_check_at IS NULL or <= NOW())
    if (backlinksEnabled) {
      const { rows: links } = await cmsQuery<OffPageBacklink>(
        `SELECT id FROM off_page_backlinks 
         WHERE status NOT IN ('REMOVED', 'SPAM', 'IGNORED')
           AND (next_check_at IS NULL OR next_check_at <= NOW())
         ORDER BY CASE WHEN next_check_at IS NULL THEN 0 ELSE 1 END, next_check_at ASC 
         LIMIT 15`
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
    }

    // 4. On 1st day of month (or if no report exists for previous month), generate monthly report
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
