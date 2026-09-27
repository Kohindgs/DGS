import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
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
  if (process.env.DGS_ADMIN_ENABLED !== "true") return NextResponse.json({ ok: false }, { status: 404 });
  if (!(await hasAdminSession())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "media", "view")) {
    return NextResponse.json({ ok: false, error: "Forbidden: insufficient permissions" }, { status: 403 });
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
  if (process.env.DGS_ADMIN_ENABLED !== "true") return NextResponse.json({ ok: false }, { status: 404 });
  if (!(await hasAdminSession())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "media", "edit")) {
    return NextResponse.json({ ok: false, error: "Forbidden: insufficient permissions" }, { status: 403 });
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
  if (process.env.DGS_ADMIN_ENABLED !== "true") return NextResponse.json({ ok: false }, { status: 404 });
  if (!(await hasAdminSession())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "media", "delete")) {
    return NextResponse.json({ ok: false, error: "Forbidden: insufficient permissions" }, { status: 403 });
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
