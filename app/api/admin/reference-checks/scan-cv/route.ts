import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { scanCandidateCvAndBuildQuestions } from "@/lib/reference-checks/cv-scanner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const isAuth = await hasAdminSession();
  if (!isAuth) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  const currentUser = await getCurrentCmsUser().catch(() => null);
  if (currentUser && !hasPermission(currentUser.role, "hr", "create")) {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const appliedPositionHint = String(formData.get("appliedPosition") || "").trim();

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { ok: false, message: "Please upload a valid CV file (.pdf, .docx, or .txt)." },
        { status: 400 }
      );
    }

    const filename = file.name || "candidate-cv.pdf";
    const maxBytes = 12 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { ok: false, message: "CV file exceeds the 12 MB limit." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await scanCandidateCvAndBuildQuestions({
      buffer,
      filename,
      mimeType: file.type,
      appliedPositionHint: appliedPositionHint || undefined,
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (err: any) {
    console.error("[api/reference-checks/scan-cv] Error:", err);
    return NextResponse.json(
      { ok: false, message: err?.message || "Failed to scan CV." },
      { status: 500 }
    );
  }
}
