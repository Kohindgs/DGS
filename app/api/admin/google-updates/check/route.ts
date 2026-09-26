import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { checkAndRecordGoogleUpdates } from "@/lib/google-updates/monitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "google_updates", "view")) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const result = await checkAndRecordGoogleUpdates({ runType: "manual" });

    await logAuditEvent({
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "check",
      resource: "google_updates",
      summary: `Manual Google updates check: detected=${result.detectedCount}, new=${result.newCount}, updated=${result.updatedCount}`,
      status: result.errors.length === 0 ? "success" : "failure",
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      message: `Manual check completed (${result.runId}). Detected: ${result.detectedCount}, New: ${result.newCount}, Updated: ${result.updatedCount}`,
      result,
    });
  } catch (err: any) {
    console.error("Admin manual Google updates check failed:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to check Google updates" },
      { status: 500 },
    );
  }
}
