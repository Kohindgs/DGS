import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { cmsQuery } from "@/lib/cms/db";
import {
  checkSemanticDuplicate,
  matchSupportingAssets,
  matchTargetPages,
  searchTurboVec,
} from "@/lib/intelligence/turbovec-client";
import type { OffPageOpportunity } from "@/lib/off-page/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Opportunity ID is required" }, { status: 400 });
  }

  try {
    const { rows } = await cmsQuery<OffPageOpportunity>(
      "SELECT * FROM off_page_opportunities WHERE id = ? LIMIT 1",
      [id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    const opp = rows[0];
    const oppText = `${opp.site_name} ${opp.domain} ${opp.category} ${opp.region} ${opp.notes || ""} ${opp.recommended_service || ""}`.trim();

    // 1. Semantic Duplicate Check (Thresholds: < 0.78 UNIQUE, 0.78-0.88 POSSIBLE_DUPLICATE, >= 0.88 LIKELY_DUPLICATE)
    const duplicateCheck = await checkSemanticDuplicate({
      text: oppText,
      domain: opp.domain,
      url: opp.exact_submission_url,
    });

    // 2. Recommended Target Page
    const pageRes = await matchTargetPages({
      query: oppText,
      region: opp.region,
      limit: 3,
    });

    const recommendedTargetPage = pageRes.target_pages[0] || {
      page: opp.recommended_dgs_target_page || "/services/ai-seo",
      title: "AI SEO Services",
      semantic_relevance: 0.85,
      region_match: true,
      service_match: "AI SEO",
      reason: `Matches ${opp.region} regional authority requirement and ${opp.category} intent.`,
    };

    // 3. Best DGS Assets to Cite (up to 3-4 items)
    const assetsRes = await matchSupportingAssets({
      query: oppText,
      limit: 4,
    });

    // 4. Similar Opportunities (Top 5 from off-page vector index, excluding current record)
    const similarRes = await searchTurboVec({
      indexName: "off-page",
      query: `${opp.site_name} ${opp.category} ${opp.region} ${opp.notes || ""}`,
      excludeKeys: [`opp:${opp.id}`],
      limit: 5,
      k: 15,
    });

    let similarOpportunities: any[] = [];
    if (similarRes.ok && similarRes.results.length > 0) {
      const entityIds = similarRes.results
        .map((r) => r.entity_id || r.key?.replace("opp:", ""))
        .filter(Boolean);

      if (entityIds.length > 0) {
        const placeholders = entityIds.map(() => "?").join(", ");
        const { rows: simRows } = await cmsQuery<OffPageOpportunity>(
          `SELECT id, site_name, domain, region, category, status, priority_tier, free_status FROM off_page_opportunities WHERE id IN (${placeholders})`,
          entityIds
        );

        // Map back in score order
        const simMap = new Map(simRows.map((r) => [r.id, r]));
        similarOpportunities = similarRes.results
          .map((item) => {
            const sid = item.entity_id || item.key?.replace("opp:", "");
            const sOpp = simMap.get(sid);
            if (!sOpp) return null;
            return {
              ...sOpp,
              semantic_similarity: item.score,
            };
          })
          .filter(Boolean);
      }
    }

    return NextResponse.json({
      ok: true,
      opportunity: opp,
      duplicate_check: duplicateCheck,
      recommended_target_page: recommendedTargetPage,
      all_target_page_matches: pageRes.target_pages,
      best_assets: assetsRes.assets,
      similar_opportunities: similarOpportunities.slice(0, 5),
    });
  } catch (err: any) {
    console.error("Failed fetching opportunity intel:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
