import { cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "./db";
import { calculateLinkDecayMetrics } from "./backlinks";
import type { OffPageDashboardMetrics, RegionCode } from "./types";

/**
 * Compiles full dashboard metrics & charts strictly backed by actual MariaDB evidence.
 * No synthetic fallbacks, no automatic demo re-seeding.
 */
export async function getOffPageDashboardData(): Promise<OffPageDashboardMetrics> {
  await ensureOffPageTablesExist();

  // 1. Opportunities queries
  const { rows: opps } = await cmsQuery<{
    id: string;
    region: RegionCode;
    category: string;
    status: string;
    link_type: string;
    recommended_dgs_target_page: string;
  }>(`SELECT id, region, category, status, link_type, recommended_dgs_target_page FROM off_page_opportunities`);

  let indiaCount = 0;
  let uaeCount = 0;
  let usaCount = 0;
  let globalCount = 0;
  let submittedCount = 0;
  let verifiedCount = 0;
  let prOppsCount = 0;
  let partnershipOppsCount = 0;
  let citationOppsCount = 0;

  const stageCounts: Record<string, number> = {
    NEW: 0,
    QUALIFIED: 0,
    APPROVED: 0,
    OUTREACH: 0,
    SUBMITTED: 0,
    LIVE: 0,
    VERIFIED: 0,
  };

  const targetPageCounts: Record<string, number> = {};
  const linkTypeCounts: Record<string, number> = {};

  for (const o of opps) {
    if (o.region === "INDIA") indiaCount++;
    else if (o.region === "UAE") uaeCount++;
    else if (o.region === "USA") usaCount++;
    else globalCount++;

    if (stageCounts[o.status] !== undefined) stageCounts[o.status]++;
    if (["SUBMITTED", "LIVE", "VERIFIED"].includes(o.status)) submittedCount++;
    if (o.status === "VERIFIED") verifiedCount++;

    if (o.category === "DIGITAL_PR" || o.category === "EXPERT_CONTRIBUTION") prOppsCount++;
    if (o.category === "PARTNERSHIP" || o.category === "ASSOCIATION") partnershipOppsCount++;
    if (o.category === "LOCAL_CITATION" || o.category === "BUSINESS_LISTING") citationOppsCount++;

    const pKey = o.recommended_dgs_target_page.replace("https://www.dgeniussolutions.com", "") || "/";
    targetPageCounts[pKey] = (targetPageCounts[pKey] || 0) + 1;

    const lt = o.link_type || "EDITORIAL";
    linkTypeCounts[lt] = (linkTypeCounts[lt] || 0) + 1;
  }

  // 2. Backlinks queries
  const { rows: backlinks } = await cmsQuery<{
    id: string;
    source_domain: string;
    status: string;
    anchor_classification: string;
    referral_sessions: number;
    referral_leads: number;
    first_seen_at: string;
  }>(`SELECT id, source_domain, status, anchor_classification, referral_sessions, referral_leads, first_seen_at FROM off_page_backlinks`);

  const uniqueDomains = new Set(backlinks.filter((b) => b.status === "LIVE" || b.status === "VERIFIED").map((b) => b.source_domain));
  const liveCount = backlinks.filter((b) => b.status === "LIVE" || b.status === "VERIFIED").length;
  const lostCount = backlinks.filter((b) => b.status === "LOST").length;
  const brokenCount = backlinks.filter((b) => b.status === "BROKEN").length;
  const recoveredCount = backlinks.filter((b) => b.status === "RECLAIM").length;

  let totalRefSessions = 0;
  let totalRefLeads = 0;
  const anchorCounts: Record<string, number> = {
    BRANDED: 0,
    NAKED_URL: 0,
    GENERIC: 0,
    PARTIAL_MATCH: 0,
    EXACT_MATCH: 0,
    OTHER: 0,
  };

  for (const b of backlinks) {
    totalRefSessions += Number(b.referral_sessions || 0);
    totalRefLeads += Number(b.referral_leads || 0);
    if (anchorCounts[b.anchor_classification] !== undefined) {
      anchorCounts[b.anchor_classification]++;
    }
  }

  // 3. Mentions queries
  const { rows: unlinkedRows } = await cmsQuery<{ total: number }>(
    `SELECT COUNT(*) as total FROM off_page_brand_mentions WHERE is_linked = 0`
  );
  const unlinkedBrandMentions = Number(unlinkedRows[0]?.total || 0);

  // 4. Competitor gaps queries
  const { rows: compGapRows } = await cmsQuery<{ total: number }>(
    `SELECT COUNT(*) as total FROM off_page_competitor_gaps WHERE status = 'IDENTIFIED'`
  );
  const competitorGapOpportunities = Number(compGapRows[0]?.total || 0);

  // 5. Outreach queries
  const { rows: outreachRows } = await cmsQuery<{ stage: string; count: number }>(
    `SELECT stage, COUNT(*) as count FROM off_page_outreach GROUP BY stage`
  );
  let totalPitches = 0;
  let repliesCount = 0;
  for (const r of outreachRows) {
    const c = Number(r.count);
    totalPitches += c;
    if (["FOLLOW_UP", "NEGOTIATING", "SUBMITTED", "LIVE", "VERIFIED"].includes(r.stage)) {
      repliesCount += c;
    }
  }
  const outreachReplyRate = totalPitches > 0 ? Math.round((repliesCount / totalPitches) * 100) : 0;
  const submissionToLinkConversion = submittedCount > 0 ? Math.round((verifiedCount / submittedCount) * 100) : 0;

  // 6. Decay metrics
  const decay = await calculateLinkDecayMetrics();

  // Total opportunities across types
  const authorityOpportunities = opps.length + competitorGapOpportunities + unlinkedBrandMentions;

  // Chart data
  const totalOppCount = opps.length || 1;
  const regionDistribution = [
    { region: "India", count: indiaCount, percentage: Math.round((indiaCount / totalOppCount) * 100) },
    { region: "UAE", count: uaeCount, percentage: Math.round((uaeCount / totalOppCount) * 100) },
    { region: "USA", count: usaCount, percentage: Math.round((usaCount / totalOppCount) * 100) },
    { region: "Global", count: globalCount, percentage: Math.round((globalCount / totalOppCount) * 100) },
  ];

  const totalAnchors = backlinks.length || 1;
  const anchorDistribution = Object.entries(anchorCounts).map(([classification, count]) => ({
    classification,
    count,
    percentage: Math.round((count / totalAnchors) * 100),
  }));

  const targetPageDistribution = Object.entries(targetPageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([page, count]) => ({ page, count }));

  const opportunityPipeline = Object.entries(stageCounts).map(([stage, count]) => ({ stage, count }));
  const linkTypeDistribution = Object.entries(linkTypeCounts).map(([type, count]) => ({ type, count }));

  // 7. TODAY metrics (exact database timestamps, Section 24 & 39)
  const { rows: todayOpps } = await cmsQuery<{ c: number }>(
    `SELECT COUNT(*) as c FROM off_page_opportunities WHERE discovered_at IS NOT NULL AND DATE(discovered_at) = CURRENT_DATE AND source != 'CURATED_SEED'`
  );
  const { rows: todayWon } = await cmsQuery<{ c: number }>(
    `SELECT COUNT(*) as c FROM off_page_backlinks WHERE (live_at IS NOT NULL AND DATE(live_at) = CURRENT_DATE) OR (DATE(created_at) = CURRENT_DATE AND status IN ('LIVE', 'VERIFIED'))`
  );
  const { rows: todayLost } = await cmsQuery<{ c: number }>(
    `SELECT COUNT(*) as c FROM off_page_backlinks WHERE (lost_at IS NOT NULL AND DATE(lost_at) = CURRENT_DATE) OR (DATE(updated_at) = CURRENT_DATE AND status = 'LOST')`
  );
  const { rows: todayMentions } = await cmsQuery<{ c: number }>(
    `SELECT COUNT(*) as c FROM off_page_brand_mentions WHERE is_linked = 0 AND (DATE(detected_at) = CURRENT_DATE OR DATE(created_at) = CURRENT_DATE)`
  );
  const { rows: draftReviewRows } = await cmsQuery<{ c: number }>(
    `SELECT COUNT(*) as c FROM off_page_outreach WHERE stage = 'DRAFT'`
  );
  const { rows: followUpsDueRows } = await cmsQuery<{ c: number }>(
    `SELECT COUNT(*) as c FROM off_page_outreach WHERE next_follow_up IS NOT NULL AND DATE(next_follow_up) <= CURRENT_DATE AND stage IN ('OUTREACH', 'FOLLOW_UP')`
  );
  const { rows: latestDiscoveryRuns } = await cmsQuery<{ status: string; errors: string | null }>(
    `SELECT status, errors FROM off_page_discovery_runs ORDER BY started_at DESC LIMIT 1`
  );

  const today = {
    newOpportunitiesToday: Number(todayOpps[0]?.c || 0),
    newLiveBacklinksToday: Number(todayWon[0]?.c || 0),
    lostBacklinksToday: Number(todayLost[0]?.c || 0),
    unlinkedMentionsToday: Number(todayMentions[0]?.c || 0),
    draftsAwaitingReview: Number(draftReviewRows[0]?.c || 0),
    followUpsDueToday: Number(followUpsDueRows[0]?.c || 0),
    discoveryRunStatus: latestDiscoveryRuns[0]?.status || "IDLE",
    discoveryRunErrors: latestDiscoveryRuns[0]?.errors || null,
  };

  // 8. THIS MONTH metrics (exact month timestamp boundary)
  const { rows: monthSubmissions } = await cmsQuery<{ c: number }>(
    `SELECT COUNT(*) as c FROM off_page_outreach WHERE submitted_at IS NOT NULL AND submitted_at >= DATE_FORMAT(NOW(), '%Y-%m-01')`
  );
  const { rows: monthLiveWon } = await cmsQuery<{ c: number }>(
    `SELECT COUNT(*) as c FROM off_page_backlinks WHERE (live_at IS NOT NULL AND live_at >= DATE_FORMAT(NOW(), '%Y-%m-01')) OR (created_at >= DATE_FORMAT(NOW(), '%Y-%m-01') AND status IN ('LIVE', 'VERIFIED'))`
  );
  const { rows: monthVerified } = await cmsQuery<{ c: number }>(
    `SELECT COUNT(*) as c FROM off_page_backlinks WHERE (verified_at IS NOT NULL AND verified_at >= DATE_FORMAT(NOW(), '%Y-%m-01')) OR (status = 'VERIFIED' AND updated_at >= DATE_FORMAT(NOW(), '%Y-%m-01'))`
  );
  const { rows: monthDomains } = await cmsQuery<{ c: number }>(
    `SELECT COUNT(DISTINCT source_domain) as c FROM off_page_backlinks WHERE (live_at IS NOT NULL AND live_at >= DATE_FORMAT(NOW(), '%Y-%m-01')) OR (created_at >= DATE_FORMAT(NOW(), '%Y-%m-01') AND status IN ('LIVE', 'VERIFIED'))`
  );

  const thisMonth = {
    submissionsMade: Number(monthSubmissions[0]?.c || 0),
    liveLinksWon: Number(monthLiveWon[0]?.c || 0),
    verifiedLinks: Number(monthVerified[0]?.c || 0),
    referringDomainsAdded: Number(monthDomains[0]?.c || 0),
    referralSessions: totalRefSessions > 0 ? totalRefSessions : ("DATA_UNAVAILABLE" as const),
    referralLeads: totalRefLeads > 0 ? totalRefLeads : ("DATA_UNAVAILABLE" as const),
  };

  // 9. TEAM ACTION QUEUE
  const { rows: newOppsCountRows } = await cmsQuery<{ c: number }>(
    `SELECT COUNT(*) as c FROM off_page_opportunities WHERE status = 'NEW'`
  );
  const { rows: submittedOutreachRows } = await cmsQuery<{ c: number }>(
    `SELECT COUNT(*) as c FROM off_page_outreach WHERE stage IN ('SUBMITTED', 'FOLLOW_UP')`
  );

  const actionQueue = {
    reviewOpportunities: Number(newOppsCountRows[0]?.c || 0),
    reviewDrafts: today.draftsAwaitingReview,
    followUpPitches: Number(submittedOutreachRows[0]?.c || 0),
    reclaimLost: lostCount + brokenCount,
    convertMentions: unlinkedBrandMentions,
  };

  return {
    today,
    thisMonth,
    actionQueue,
    totalReferringDomains: uniqueDomains.size,
    liveBacklinks: liveCount,
    newBacklinks7d: decay.window7d.newLinks,
    newBacklinks30d: decay.window30d.newLinks,
    lostBacklinks: lostCount,
    brokenBacklinks: brokenCount,
    recoveredBacklinks: recoveredCount,
    unlinkedBrandMentions,
    authorityOpportunities,
    competitorGapOpportunities,
    digitalPrOpportunities: prOppsCount,
    partnershipOpportunities: partnershipOppsCount,
    citationOpportunities: citationOppsCount,
    submittedOpportunities: submittedCount,
    verifiedLinks: verifiedCount,
    outreachReplyRate,
    submissionToLinkConversion,
    referralSessions: totalRefSessions,
    referralLeads: totalRefLeads,
    regionalBreakdown: {
      india: indiaCount,
      uae: uaeCount,
      usa: usaCount,
      global: globalCount,
    },
    linkRetentionRate: decay.linkRetentionRate,
    charts: {
      newVsLost: [],
      domainGrowth: [],
      regionDistribution,
      targetPageDistribution,
      opportunityPipeline,
      linkTypeDistribution,
      anchorDistribution,
      referralTrafficTrend: [],
      outreachConversion: [
        { stage: "Pitched", count: totalPitches },
        { stage: "Replied", count: repliesCount },
        { stage: "Submitted", count: submittedCount },
        { stage: "Verified Live", count: verifiedCount },
      ],
      authorityScoreTrend: [],
    },
  };
}
