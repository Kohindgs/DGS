import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { checkLiveBacklink } from "@/lib/off-page/backlinks";
import { cmsQuery } from "@/lib/cms/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const backlinkId = body.id;

    if (backlinkId) {
      const res = await checkLiveBacklink(backlinkId);
      return NextResponse.json({ ok: true, result: res });
    }

    // Otherwise check top 5 oldest checked links
    const { rows } = await cmsQuery<{ id: string }>(
      `SELECT id FROM off_page_backlinks ORDER BY CASE WHEN last_checked_at IS NULL THEN 0 ELSE 1 END, last_checked_at ASC LIMIT 5`
    );

    const results = [];
    for (const r of rows) {
      const res = await checkLiveBacklink(r.id);
      results.push({ id: r.id, ...res });
    }

    return NextResponse.json({ ok: true, batchResults: results });
  } catch (err: any) {
    console.error("Backlink check error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
