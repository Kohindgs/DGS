import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { getCmsBlogById, getBlogRevisionById, compareBlogRevision } from "@/lib/cms/blogs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorize() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") return 404;
  if (!(await hasAdminSession())) return 401;
  if (!isCmsDatabaseConfigured()) return 503;
  return 200;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; revisionId: string }> }
) {
  const status = await authorize();
  if (status !== 200) return NextResponse.json({ ok: false }, { status });

  const { id, revisionId } = await params;
  if (!id || !revisionId) {
    return NextResponse.json({ ok: false, message: "Blog ID and Revision ID required" }, { status: 400 });
  }

  const current = await getCmsBlogById(id);
  if (!current) {
    return NextResponse.json({ ok: false, message: "Blog not found" }, { status: 404 });
  }

  const revision = await getBlogRevisionById(revisionId);
  if (!revision || revision.blog_post_id !== id) {
    return NextResponse.json({ ok: false, message: "Revision not found" }, { status: 404 });
  }

  const comparison = compareBlogRevision(current, revision.snapshot);

  return NextResponse.json({
    ok: true,
    blogId: id,
    revisionId,
    comparison,
    current: {
      id: current.id,
      title: current.title,
      slug: current.slug,
      status: current.status,
      updated_at: current.updated_at,
    },
    revision: {
      id: revision.id,
      created_at: revision.created_at,
      created_by: revision.created_by,
    },
  });
}
