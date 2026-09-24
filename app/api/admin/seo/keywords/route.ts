import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import {
  listTargetKeywords,
  addTargetKeyword,
  removeTargetKeyword,
  detectCannibalization,
  seedInitialTargetKeywords,
} from "@/lib/seo/keywords";
import { cmsQuery, isCmsDatabaseConfigured } from "@/lib/cms/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "seo", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const pageUrl = searchParams.get("pageUrl") || undefined;
  const view = searchParams.get("view") || "targets";

  if (view === "cannibalization") {
    const risks = await detectCannibalization();
    return NextResponse.json({ ok: true, risks });
  }

  if (view === "all_ranking") {
    if (!isCmsDatabaseConfigured()) {
      return NextResponse.json({ ok: true, queries: [] });
    }
    try {
      const { rows } = await cmsQuery<any>(
        `SELECT pq.*, tk.keyword_group
         FROM gsc_page_query_metrics pq
         LEFT JOIN target_keywords tk ON pq.query_text = tk.keyword AND pq.page_url = tk.page_url
         ORDER BY pq.clicks DESC, pq.impressions DESC
         LIMIT 200`
      );
      return NextResponse.json({ ok: true, queries: rows });
    } catch {
      return NextResponse.json({ ok: true, queries: [] });
    }
  }

  // Ensure initial seeds are populated if empty
  await seedInitialTargetKeywords();
  const targets = await listTargetKeywords({ pageUrl });
  return NextResponse.json({ ok: true, targets });
}

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "seo", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const action = body.action;

    if (action === "add") {
      const id = await addTargetKeyword({
        pageUrl: body.pageUrl,
        keyword: body.keyword,
        keywordGroup: body.keywordGroup,
      });
      return NextResponse.json({ ok: true, id });
    }

    if (action === "remove") {
      const ok = await removeTargetKeyword(body.id);
      return NextResponse.json({ ok });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Keywords API error:", err);
    return NextResponse.json({ error: err?.message || "Operation failed" }, { status: 500 });
  }
}
