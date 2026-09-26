import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { getCmsBlogById, restoreBlogRevision } from "@/lib/cms/blogs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorize() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") return 404;
  if (!(await hasAdminSession())) return 401;
  if (!isCmsDatabaseConfigured()) return 503;
  return 200;
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; revisionId: string }> }
) {
  const status = await authorize();
  if (status !== 200) return NextResponse.json({ ok: false }, { status });

  const { id, revisionId } = await params;
  if (!id || !revisionId) {
    return NextResponse.json({ ok: false, message: "Blog ID and Revision ID required" }, { status: 400 });
  }

  const blog = await getCmsBlogById(id);
  if (!blog) return NextResponse.json({ ok: false, message: "Blog not found" }, { status: 404 });

  try {
    const restored = await restoreBlogRevision(id, revisionId);
    return NextResponse.json({
      ok: true,
      message: `Blog restored successfully from revision ${revisionId}. Status reset to Review.`,
      blog: restored,
    });
  } catch (error) {
    console.error("Failed to restore blog revision", error);
    return NextResponse.json(
      { ok: false, message: (error as Error).message || "Failed to restore blog revision" },
      { status: 500 }
    );
  }
}
