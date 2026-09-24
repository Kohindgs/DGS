import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import {
  listMissingAlts,
  generateAltTextSuggestion,
  applyAltTextFix,
  markAltDecorative,
} from "@/lib/seo/alt-fixer";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "seo", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const pageUrl = searchParams.get("pageUrl") || undefined;
  const auditRunId = searchParams.get("auditRunId") || undefined;
  const resolvedParam = searchParams.get("resolved");
  const resolved = resolvedParam === "true" ? true : resolvedParam === "false" ? false : undefined;
  const limit = parseInt(searchParams.get("limit") || "100", 10);

  const items = await listMissingAlts({ pageUrl, auditRunId, resolved, limit });
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "seo", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const action = body.action;

    if (action === "suggest") {
      const suggestion = await generateAltTextSuggestion({
        pageUrl: body.pageUrl,
        filename: body.filename,
        imageSrc: body.imageSrc,
        currentAlt: body.currentAlt,
        surroundingContext: body.surroundingContext,
      });
      return NextResponse.json({ ok: true, suggestion });
    }

    if (action === "apply") {
      const result = await applyAltTextFix({
        id: body.id,
        newAltText: body.newAltText,
        applyToAllUsages: Boolean(body.applyToAllUsages),
        userId: currentUser.id,
        userName: currentUser.display_name || currentUser.email,
      });
      return NextResponse.json(result);
    }

    if (action === "decorative") {
      const ok = await markAltDecorative({
        id: body.id,
        userId: currentUser.id,
        userName: currentUser.display_name || currentUser.email,
      });
      return NextResponse.json({ ok });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Alt fixer API error:", err);
    return NextResponse.json({ error: err?.message || "Operation failed" }, { status: 500 });
  }
}
