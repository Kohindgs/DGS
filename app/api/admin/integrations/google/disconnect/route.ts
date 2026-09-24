import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { disconnectGoogle } from "@/lib/integrations/google";

export const dynamic = "force-dynamic";

export async function POST() {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "integrations", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await disconnectGoogle();

    await logAuditEvent({
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "disconnect",
      resource: "google_integrations",
      summary: "Disconnected Google OAuth integration and cleared tokens",
      status: "success",
    });

    return NextResponse.json({ ok: true, message: "Disconnected successfully" });
  } catch (err: any) {
    console.error("Error disconnecting Google:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to disconnect Google" },
      { status: 500 }
    );
  }
}
