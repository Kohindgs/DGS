import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { getMediaUsages, getMediaAssetById } from "@/lib/cms/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const asset = await getMediaAssetById(id);
  if (!asset) {
    return NextResponse.json({ ok: false, error: "Media asset not found" }, { status: 404 });
  }

  const usages = await getMediaUsages(id);
  return NextResponse.json({ ok: true, usages });
}
