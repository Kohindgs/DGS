import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCronHealthSummary } from "@/lib/cms/cron-logger";
import { getCmsDatabaseHealthMetrics } from "@/lib/cms/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cronSecret = (process.env.DGS_CRON_SECRET || "").trim();
  const authHeader = request.headers.get("authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  const isCronAuthenticated = Boolean(cronSecret && bearerToken && bearerToken === cronSecret);
  const isAdminAuthenticated = await hasAdminSession();

  if (!isCronAuthenticated && !isAdminAuthenticated) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized. Admin session or DGS_CRON_SECRET required." },
      { status: 401 },
    );
  }

  try {
    const [cronHealth, dbHealth] = await Promise.all([
      getCronHealthSummary(),
      getCmsDatabaseHealthMetrics(),
    ]);

    return NextResponse.json({
      ok: true,
      cronHealth,
      dbHealth,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: String(err?.message || "Failed to load cron health summary") },
      { status: 500 },
    );
  }
}
