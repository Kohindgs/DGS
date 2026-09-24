import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { upsertPortfolioOverride } from "@/lib/cms/portfolio";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "portfolio", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const sourceItemId = String(body.sourceItemId || "").trim();
    if (!sourceItemId) {
      return NextResponse.json({ error: "sourceItemId is required" }, { status: 400 });
    }

    await upsertPortfolioOverride({
      sourceItemId,
      title: body.title !== undefined ? String(body.title).trim() : undefined,
      altText: body.altText !== undefined ? String(body.altText).trim() : undefined,
      sortOrder: Number(body.sortOrder || 0),
      active: Boolean(body.active),
    });

    revalidatePath("/admin/portfolio/");
    revalidatePath("/portfolio/");

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Portfolio save error:", err);
    return NextResponse.json({ error: err?.message || "Failed to save portfolio override" }, { status: 500 });
  }
}
