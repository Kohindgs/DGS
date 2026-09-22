import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { checkAndRecordGoogleUpdates } from "@/lib/google-updates/monitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await checkAndRecordGoogleUpdates();
    return NextResponse.json({
      ok: true,
      message: `Checked Google feeds. Detected: ${result.detectedCount}, New: ${result.newCount}, Notified: ${result.notifiedCount}`,
      result,
    });
  } catch (err: any) {
    console.error("Manual search update check failed:", err);
    return NextResponse.json(
      { ok: false, message: err.message || "Failed to check search updates" },
      { status: 500 },
    );
  }
}
