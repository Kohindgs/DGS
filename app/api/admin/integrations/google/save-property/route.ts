import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { saveGoogleProperties } from "@/lib/integrations/google";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "integrations", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { gscSiteUrl, ga4PropertyId } = body;

    await saveGoogleProperties(gscSiteUrl, ga4PropertyId);

    await logAuditEvent({
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "update_properties",
      resource: "google_integrations",
      summary: `Updated Google properties: GSC=${gscSiteUrl || "none"}, GA4=${ga4PropertyId || "none"}`,
      status: "success",
    });

    return NextResponse.json({ ok: true, message: "Properties updated successfully" });
  } catch (err: any) {
    console.error("Error saving google properties:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to save Google properties" },
      { status: 500 }
    );
  }
}
