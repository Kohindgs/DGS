import { NextRequest, NextResponse } from "next/server";
import { getMismatchedBacklinks, resolveMismatch, getMismatchSummary } from "@/lib/off-page/backlinks";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "MISMATCH";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const [data, summary] = await Promise.all([
      getMismatchedBacklinks({ status, limit, offset }),
      getMismatchSummary(),
    ]);

    return NextResponse.json({
      success: true,
      items: data.items,
      total: data.total,
      summary,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { backlinkId, resolution, note, assignee } = body;

    if (!backlinkId || !resolution) {
      return NextResponse.json(
        { error: "backlinkId and resolution ('ACCEPTED_VERIFIED' | 'KEPT_TEAM' | 'RECHECKED' | 'ASSIGNED_REVIEW') are required" },
        { status: 400 }
      );
    }

    const result = await resolveMismatch(backlinkId, resolution, note, assignee);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
