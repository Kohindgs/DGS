import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { sendTestGoogleUpdateEmail } from "@/lib/notifications/google-update-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "google_updates", "edit")) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const result = await sendTestGoogleUpdateEmail(currentUser.email);

    await logAuditEvent({
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "test_email",
      resource: "google_updates",
      summary: `Test Google update alert dispatched to ${result.recipient || "default"}: sent=${result.sent}`,
      status: result.sent ? "success" : "failure",
    }).catch(() => {});

    if (!result.sent) {
      return NextResponse.json(
        { ok: false, error: result.error || "Failed to dispatch test email" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: `Test email sent successfully to ${result.recipient}`,
      delivery: {
        recipient: result.recipient,
        timestamp: result.timestamp,
        accepted: result.accepted,
        messageId: result.messageId,
      },
    });
  } catch (err: any) {
    console.error("Test Google update email error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to send test email" },
      { status: 500 },
    );
  }
}
