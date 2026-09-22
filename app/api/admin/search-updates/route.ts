import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import {
  listGoogleSearchUpdates,
  updateSearchUpdateStatus,
} from "@/lib/google-updates/monitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const severity = searchParams.get("severity") || undefined;
  const status = searchParams.get("status") || undefined;
  const limit = Number(searchParams.get("limit") || 50);

  const updates = await listGoogleSearchUpdates({ severity, status, limit });
  return NextResponse.json({ ok: true, updates });
}

export async function POST(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json({ ok: false, message: "Missing id or status" }, { status: 400 });
    }

    await updateSearchUpdateStatus(id, status);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}
