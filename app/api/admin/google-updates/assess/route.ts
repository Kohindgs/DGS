import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { getGoogleSearchUpdate } from "@/lib/google-updates/monitor";
import { runGoogleUpdateAssessment } from "@/lib/google-updates/compliance-engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "google_updates", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const updateId = body.updateId;

    if (!updateId) {
      return NextResponse.json({ error: "updateId is required" }, { status: 400 });
    }

    const update = await getGoogleSearchUpdate(updateId);
    if (!update) {
      return NextResponse.json({ error: "Google update record not found" }, { status: 404 });
    }

    const result = await runGoogleUpdateAssessment(update, currentUser.display_name || currentUser.email);

    return NextResponse.json({
      ok: true,
      assessment: result,
    });
  } catch (err: any) {
    console.error("Google update assessment error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to assess Google update" },
      { status: 500 }
    );
  }
}
