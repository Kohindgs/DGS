import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { syncGoogleData } from "@/lib/integrations/google";

export const dynamic = "force-dynamic";

export async function POST() {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "integrations", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const result = await syncGoogleData();

    await logAuditEvent({
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "sync",
      resource: "google_integrations",
      summary: `Triggered live Google synchronization: success=${result.success}`,
      status: result.success ? "success" : "failure",
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Google synchronization failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      syncedAt: new Date().toISOString(),
      gsc: result.gsc,
      ga4: result.ga4,
    });
  } catch (err: any) {
    console.error("Error during Google sync:", err);
    return NextResponse.json(
      { error: err?.message || "Google synchronization encountered an unexpected error" },
      { status: 500 }
    );
  }
}
