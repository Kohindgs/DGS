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

    // Check all active backlinks (or up to 20 oldest checked links)
    const { rows } = await cmsQuery<{ id: string; source_url: string }>(
      `SELECT id, source_url FROM off_page_backlinks
       WHERE status NOT IN ('REMOVED', 'SPAM', 'IGNORED')
       ORDER BY CASE WHEN last_checked_at IS NULL THEN 0 ELSE 1 END, last_checked_at ASC
       LIMIT 20`
    );

    const queued = rows.length;
    let live = 0;
    let lost = 0;
    let broken = 0;
    const batchResults = [];

    for (const r of rows) {
      const res = await checkLiveBacklink(r.id);
      batchResults.push({ id: r.id, source_url: r.source_url, ...res });
      if (res.status === "LIVE" || res.status === "VERIFIED") {
        live++;
      } else if (res.status === "LOST") {
        lost++;
      } else {
        broken++;
      }
    }

    return NextResponse.json({
      ok: true,
      queued,
      checked: batchResults.length,
      live,
      lost,
      broken,
      completed: true,
      message: `Audited ${batchResults.length} remote backlinks: ${live} LIVE, ${lost} LOST, ${broken} UNREACHABLE/BROKEN.`,
      batchResults,
    });
  } catch (err: any) {
    console.error("Backlink check error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
