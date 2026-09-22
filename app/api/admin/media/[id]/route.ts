import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import {
  getMediaAssetById,
  updateMediaAssetMetadata,
  deleteMediaAssetSafe,
  getMediaUsages,
} from "@/lib/cms/media";

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
  return NextResponse.json({ ok: true, asset, usages });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const updated = await updateMediaAssetMetadata(id, {
    altText: body.altText,
    isDecorative: body.isDecorative,
    title: body.title,
    caption: body.caption,
    description: body.description,
    category: body.category,
  });

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Media asset not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, asset: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const forcePermanent = searchParams.get("permanent") === "true";

  const result = await deleteMediaAssetSafe(id, { forcePermanent });

  if (!result.ok) {
    // 409 Conflict for delete protection
    return NextResponse.json(
      { ok: false, error: result.message, usages: result.usages },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true, message: result.message });
}
