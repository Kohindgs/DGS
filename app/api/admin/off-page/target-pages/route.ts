import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import { seedTargetPagesIfEmpty } from "@/lib/off-page/authority-engine";
import type { OffPageTargetPage } from "@/lib/off-page/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await ensureOffPageTablesExist();
  await seedTargetPagesIfEmpty();

  try {
    const { rows: pages } = await cmsQuery<OffPageTargetPage>(
      `SELECT * FROM off_page_target_pages ORDER BY priority_tier, target_backlinks_goal DESC`
    );

    // Compute live stats per target page
    for (const p of pages) {
      const { rows: backlinkStats } = await cmsQuery<{
        ref_domains: number;
        live_links: number;
        ref_sessions: number;
        ref_leads: number;
      }>(
        `SELECT 
          COUNT(DISTINCT source_domain) as ref_domains,
          COUNT(*) as live_links,
          SUM(referral_sessions) as ref_sessions,
          SUM(referral_leads) as ref_leads
         FROM off_page_backlinks
         WHERE target_url = ? AND status IN ('LIVE', 'VERIFIED')`,
        [p.page_url]
      );

      const { rows: oppStats } = await cmsQuery<{ total: number }>(
        `SELECT COUNT(*) as total FROM off_page_opportunities WHERE recommended_dgs_target_page = ?`,
        [p.page_url]
      );

      const stats = backlinkStats[0];
      p.referring_domains = Number(stats?.ref_domains || 0);
      p.live_backlinks = Number(stats?.live_links || 0);
      p.referral_sessions_30d = Number(stats?.ref_sessions || 0);
      p.referral_leads_30d = Number(stats?.ref_leads || 0);
      p.opportunity_count = Number(oppStats[0]?.total || 0);
      p.authority_gap = Math.max(0, p.target_backlinks_goal - (p.live_backlinks || 0));
    }

    return NextResponse.json({ ok: true, pages });
  } catch (err: any) {
    console.error("Failed fetching target pages:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
