import { NextResponse } from "next/server";
import { syncGoogleData } from "@/lib/integrations/google";
import { cmsQuery } from "@/lib/cms/db";
import { createChangeRequest } from "@/lib/seo/change-requests";
import { publishNotificationEvent } from "@/lib/notifications/engine";
import { recordCronRun } from "@/lib/cms/cron-logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GscOpportunityRow = {
  page_url: string;
  query_text: string;
  clicks: number;
  impressions: number;
  position: number;
};

type GscPageDropRow = {
  page_url: string;
  clicks: number;
  prev_clicks: number;
  impressions: number;
  prev_impressions: number;
  position: number;
  prev_position: number;
};

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

  if (!token || token !== cronSecret.trim()) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized. Invalid or missing DGS_CRON_SECRET bearer token." },
      { status: 401 },
    );
  }

  try {
    // 1. Sync live Google Search Console (7d, 15d, 28d + daily + page-query + snapshots) & GA4
    const syncResult = await syncGoogleData();

    // 2. Detect Top-10 Zero-CTR queries & Page-2 Striking Distance queries
    const { rows: zeroCtrRows } = await cmsQuery<GscOpportunityRow>(
      `SELECT page_url, query_text, clicks, impressions, position
       FROM gsc_page_query_metrics
       WHERE period_type = '28d'
         AND position <= 10.0
         AND impressions >= 20
         AND clicks = 0
       ORDER BY impressions DESC
       LIMIT 10`,
    );

    const { rows: strikingRows } = await cmsQuery<GscOpportunityRow>(
      `SELECT page_url, query_text, clicks, impressions, position
       FROM gsc_page_query_metrics
       WHERE period_type = '28d'
         AND position > 10.0
         AND position <= 25.0
         AND impressions >= 25
       ORDER BY impressions DESC
       LIMIT 10`,
    );

    // 3. Detect pages with significant position or click drops (28d vs prev 28d)
    const { rows: dropRows } = await cmsQuery<GscPageDropRow>(
      `SELECT page_url, clicks, prev_clicks, impressions, prev_impressions, position, prev_position
       FROM gsc_page_metrics
       WHERE period_type = '28d'
         AND prev_position IS NOT NULL
         AND prev_impressions >= 40
         AND (position - prev_position >= 3.0 OR prev_clicks - clicks >= 5)
       ORDER BY (prev_clicks - clicks) DESC, (position - prev_position) DESC
       LIMIT 10`,
    );

    // 4. Queue non-duplicate SEO Change Requests for Zero-CTR & Striking-Distance opportunities
    const { rows: existingRequests } = await cmsQuery<{ page_url: string; issue_code: string }>(
      `SELECT page_url, issue_code
       FROM seo_change_requests
       WHERE (
         status IN ('DRAFT', 'AWAITING_APPROVAL', 'APPROVED', 'APPLIED')
         OR (status = 'VERIFIED' AND verified_at >= DATE_SUB(NOW(), INTERVAL 21 DAY))
       )
         AND issue_code IN ('AUTO_ZERO_CTR_TOP10', 'AUTO_STRIKING_DISTANCE_P2')`,
    );
    const existingKeys = new Set(
      (existingRequests || []).map((r) => `${r.page_url}::${r.issue_code}`),
    );

    let queuedChangeRequests = 0;

    for (const row of zeroCtrRows.slice(0, 5)) {
      const key = `${row.page_url}::AUTO_ZERO_CTR_TOP10`;
      if (existingKeys.has(key)) continue;
      existingKeys.add(key);

      await createChangeRequest({
        source_type: "gsc_daily_automation",
        source_id: "AUTO_ZERO_CTR_TOP10",
        page_url: row.page_url,
        keyword: row.query_text,
        issue_code: "AUTO_ZERO_CTR_TOP10",
        change_type: "META_DESCRIPTION",
        proposed_state: {
          targetQuery: row.query_text,
          action: "Add explicit case-study proof, 2026 benchmarks, and direct answer hook in Meta Description & Executive Summary.",
        },
        reason: `Page ranks at Position #${Number(row.position).toFixed(2)} for "${row.query_text}" with ${row.impressions} impressions (28d) but 0 clicks (0% CTR).`,
        evidence: {
          period: "28d",
          query: row.query_text,
          impressions: Number(row.impressions),
          clicks: Number(row.clicks),
          position: Number(row.position),
        },
        implementation_plan: [
          `Include exact query phrase "${row.query_text}" or its primary commercial intent in the meta description.`,
          "Highlight verified proof (6x organic growth, 75+ brands scaled) to increase SERP click-through rate.",
        ],
        created_by: "seo-automation-cron",
      });
      queuedChangeRequests += 1;
    }

    for (const row of strikingRows.slice(0, 5)) {
      const key = `${row.page_url}::AUTO_STRIKING_DISTANCE_P2`;
      if (existingKeys.has(key)) continue;
      existingKeys.add(key);

      await createChangeRequest({
        source_type: "gsc_daily_automation",
        source_id: "AUTO_STRIKING_DISTANCE_P2",
        page_url: row.page_url,
        keyword: row.query_text,
        issue_code: "AUTO_STRIKING_DISTANCE_P2",
        change_type: "FAQ_ADDITION",
        proposed_state: {
          targetQuery: row.query_text,
          recommendedFaqQuestion: `How does D'Genius Solutions deliver ${row.query_text}?`,
          action: "Add dedicated H2/H3 section or FAQ item + contextual internal links from high-impression blog posts.",
        },
        reason: `Striking-distance keyword "${row.query_text}" is at Position #${Number(row.position).toFixed(2)} with ${row.impressions} impressions (28d) — ready to move from Page 2 to Page 1.`,
        evidence: {
          period: "28d",
          query: row.query_text,
          impressions: Number(row.impressions),
          clicks: Number(row.clicks),
          position: Number(row.position),
        },
        implementation_plan: [
          `Add a concise 45-60 word answer block targeting "${row.query_text}" on ${row.page_url}.`,
          `Add 2 internal anchor links pointing to ${row.page_url} using "${row.query_text}".`,
        ],
        created_by: "seo-automation-cron",
      });
      queuedChangeRequests += 1;
    }

    // 5. Publish notification if ranking drops or new opportunities were queued
    if (dropRows.length > 0 || queuedChangeRequests > 0) {
      const topDrops = dropRows
        .slice(0, 3)
        .map(
          (d) =>
            `${d.page_url.replace("https://www.dgeniussolutions.com", "") || "/"} (pos ${Number(d.prev_position).toFixed(1)} → ${Number(d.position).toFixed(1)}, clicks ${d.prev_clicks} → ${d.clicks})`,
        )
        .join("; ");

      await publishNotificationEvent({
        title: `Daily SEO Sync: ${queuedChangeRequests} new opportunities, ${dropRows.length} page shifts monitored`,
        message: topDrops
          ? `GSC 28d sync completed. Key shifts monitored: ${topDrops}. ${queuedChangeRequests} optimization recommendations queued in Change Requests.`
          : `GSC 28d sync completed. ${queuedChangeRequests} new CTR & striking-distance recommendations queued in Change Requests.`,
        type: "site_audit_issues",
        severity: dropRows.length > 0 ? "warning" : "info",
        recipient_role: "admin",
        link: "/admin/seo/change-requests",
      });
    }

    const completedAt = new Date();
    const durationMs = Math.max(0, completedAt.getTime() - startedAt.getTime());

    await recordCronRun({
      jobName: "seo-daily-gsc-sync-and-optimizer",
      endpoint: "/api/internal/seo/daily-sync",
      triggerSource: "github_actions",
      startedAt,
      completedAt,
      durationMs,
      status: syncResult.success ? "SUCCESS" : "PARTIAL",
      httpStatus: 200,
      recordsChecked: zeroCtrRows.length + strikingRows.length + dropRows.length,
      recordsProcessed: queuedChangeRequests,
      recordsFailed: syncResult.success ? 0 : 1,
      errorSummary: syncResult.error || null,
      metadata: {
        gscSynced: Boolean(syncResult.gsc),
        ga4Synced: Boolean(syncResult.ga4),
        zeroCtrCount: zeroCtrRows.length,
        strikingDistanceCount: strikingRows.length,
        pageDropsCount: dropRows.length,
        queuedChangeRequests,
      },
    });

    return NextResponse.json({
      ok: true,
      syncedAt: completedAt.toISOString(),
      durationMs,
      syncSuccess: syncResult.success,
      gsc: syncResult.gsc,
      ga4: syncResult.ga4,
      opportunities: {
        zeroCtrTop10Count: zeroCtrRows.length,
        strikingDistancePage2Count: strikingRows.length,
        monitoredDropsCount: dropRows.length,
        queuedChangeRequests,
      },
    });
  } catch (err: any) {
    const completedAt = new Date();
    const durationMs = Math.max(0, completedAt.getTime() - startedAt.getTime());
    const errorMessage = String(err?.message || "Daily SEO sync failed");

    await recordCronRun({
      jobName: "seo-daily-gsc-sync-and-optimizer",
      endpoint: "/api/internal/seo/daily-sync",
      triggerSource: "github_actions",
      startedAt,
      completedAt,
      durationMs,
      status: "FAILED",
      httpStatus: 500,
      errorSummary: errorMessage,
    });

    return NextResponse.json(
      { ok: false, message: errorMessage, durationMs },
      { status: 500 },
    );
  }
}
