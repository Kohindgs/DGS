import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import { seedMentionsAndCitationsIfEmpty } from "@/lib/off-page/authority-engine";
import type { OffPageCitation, OffPageReviewPlatform } from "@/lib/off-page/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await ensureOffPageTablesExist();
  await seedMentionsAndCitationsIfEmpty();

  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region");

  const citSql = region && region !== "ALL"
    ? `SELECT * FROM off_page_citations WHERE region = ? ORDER BY nap_status, platform_name`
    : `SELECT * FROM off_page_citations ORDER BY region, nap_status, platform_name`;

  const revSql = region && region !== "ALL"
    ? `SELECT * FROM off_page_reviews WHERE region = ? ORDER BY rating DESC`
    : `SELECT * FROM off_page_reviews ORDER BY region, rating DESC`;

  try {
    const { rows: citations } = await cmsQuery<OffPageCitation>(citSql, region && region !== "ALL" ? [region] : []);
    const { rows: reviews } = await cmsQuery<OffPageReviewPlatform>(revSql, region && region !== "ALL" ? [region] : []);

    return NextResponse.json({ ok: true, citations, reviews });
  } catch (err: any) {
    console.error("Failed fetching citations:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
