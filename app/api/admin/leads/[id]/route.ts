import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { updateLeadStatus } from "@/lib/cms/leads";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.DGS_ADMIN_ENABLED !== "true") return NextResponse.json({ ok: false }, { status: 404 });
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "leads", "manage")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  const resolvedParams = await params;
  const body = await req.json();
  const { status } = body;
  try {
    await updateLeadStatus(resolvedParams.id, status);

    await logAuditEvent({
      user_id: currentUser.id,
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "LEAD_STATUS_UPDATED",
      resource: "lead",
      resource_id: resolvedParams.id,
      summary: `Updated lead ${resolvedParams.id} status to ${status}`,
      after_state: { status },
      status: "success",
    });

    return NextResponse.json({ ok: true, status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update status" }, { status: 400 });
  }
}
