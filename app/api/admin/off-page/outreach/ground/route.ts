import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { cmsQuery } from "@/lib/cms/db";
import { groundOutreachDraft, matchSupportingAssets, matchTargetPages } from "@/lib/intelligence/turbovec-client";
import { generateOutreachPitchDraft } from "@/lib/off-page/outreach";
import type { OffPageOpportunity, PitchType } from "@/lib/off-page/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    let opp: OffPageOpportunity | null = null;

    if (body.opportunity_id) {
      const { rows } = await cmsQuery<OffPageOpportunity>(
        `SELECT * FROM off_page_opportunities WHERE id = ? LIMIT 1`,
        [body.opportunity_id]
      );
      if (rows[0]) opp = rows[0];
    }

    const publication = body.publication || opp?.site_name || body.target_domain || "Industry Publication";
    const domain = body.target_domain || opp?.domain || null;
    const category = body.category || opp?.category || "AGENCY_DIRECTORY";
    let targetPage = body.target_page || opp?.recommended_dgs_target_page || "https://www.dgeniussolutions.com/";
    let service = body.service || opp?.recommended_service || "AI Video Production & SEO";
    const contactName = body.contact_name || "Editorial Team";
    const pitchType: PitchType = body.pitch_type || (category === "DIGITAL_PR" ? "EXPERT_QUOTE" : "RESOURCE_SUGGESTION");

    const opportunityText = `${publication} ${domain || ""} ${category} ${opp?.notes || ""} ${opp?.recommended_content || ""} ${service}`.trim();

    // 1. Query TurboVec for draft grounding
    const groundRes = await groundOutreachDraft({
      opportunityText,
      publicationName: publication,
      targetPage,
    });

    // 2. Query TurboVec for matching assets
    const assetsRes = await matchSupportingAssets({
      query: opportunityText,
      limit: 4,
    });

    // 3. Query TurboVec for target page if generic
    if (!targetPage || targetPage === "https://www.dgeniussolutions.com/") {
      const pageRes = await matchTargetPages({
        query: opportunityText,
        region: opp?.region || "GLOBAL",
        limit: 1,
      });
      if (pageRes.ok && pageRes.target_pages.length > 0) {
        targetPage = `https://www.dgeniussolutions.com${pageRes.target_pages[0].page}`;
        service = pageRes.target_pages[0].service_match;
      }
    }

    // 4. Generate grounded draft
    const draft = generateOutreachPitchDraft({
      siteName: publication,
      publication: domain || publication,
      category,
      targetPage,
      service,
      contactName,
      pitchType,
      sourcesUsed: groundRes.sources_used || [],
    });

    return NextResponse.json({
      ok: true,
      sources_used: groundRes.sources_used || [],
      talking_points: groundRes.talking_points || [],
      recommended_target_page: targetPage,
      recommended_service: service,
      assets: assetsRes.assets || [],
      pitch_subject: draft.pitchSubject,
      pitch_body: draft.pitchBody,
      pitch_type: draft.pitchType,
      suggested_follow_up_days: draft.suggestedFollowUpDays,
    });
  } catch (err: any) {
    console.error("Failed grounding outreach draft:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
