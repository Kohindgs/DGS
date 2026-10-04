import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { getDetectedAuthorityOpportunities } from "@/lib/off-page/authority-engine";
import type { AuthorityOpportunityType, PriorityTier, RegionCode } from "@/lib/off-page/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region") as RegionCode | null;
  const type = searchParams.get("type") as AuthorityOpportunityType | null;
  const priorityTier = searchParams.get("tier") as PriorityTier | null;

  try {
    const opportunities = await getDetectedAuthorityOpportunities({
      region: region || undefined,
      type: type || undefined,
      priorityTier: priorityTier || undefined,
    });

    return NextResponse.json({ ok: true, opportunities, total: opportunities.length });
  } catch (err: any) {
    console.error("Failed fetching authority opportunities:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
