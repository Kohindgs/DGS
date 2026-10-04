import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import { seedMentionsAndCitationsIfEmpty } from "@/lib/off-page/authority-engine";
import type { OffPageBrandMention } from "@/lib/off-page/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await ensureOffPageTablesExist();
  await seedMentionsAndCitationsIfEmpty();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  const sql = type && type !== "ALL"
    ? `SELECT * FROM off_page_brand_mentions WHERE mention_type = ? ORDER BY detected_at DESC LIMIT 100`
    : `SELECT * FROM off_page_brand_mentions ORDER BY detected_at DESC LIMIT 100`;

  try {
    const { rows } = await cmsQuery<OffPageBrandMention>(sql, type && type !== "ALL" ? [type] : []);
    return NextResponse.json({ ok: true, mentions: rows, total: rows.length });
  } catch (err: any) {
    console.error("Failed fetching brand mentions:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ error: "ID and status required" }, { status: 400 });

    await cmsExecute(
      `UPDATE off_page_brand_mentions SET status = ? WHERE id = ?`,
      [status, id]
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Failed updating mention status:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
