import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { logAuditEvent } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { deleteCmsDraftBlog, getCmsBlogById, updateCmsBlog, validateCmsBlogForPublish } from "@/lib/cms/blogs";

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
  { params }: { params: Promise<{ id: string }> }
) {
  const status = await authorize();
  if (status !== 200) return NextResponse.json({ ok: false }, { status });

  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, message: "Blog ID required" }, { status: 400 });

  const blog = await getCmsBlogById(id);
  if (!blog) return NextResponse.json({ ok: false, message: "Blog not found" }, { status: 404 });

  const qa = await validateCmsBlogForPublish(id);

  return NextResponse.json({ ok: true, blog, qa });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const status = await authorize();
  if (status !== 200) return NextResponse.json({ ok: false }, { status });

  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, message: "Blog ID required" }, { status: 400 });

  const body = await request.json();

  try {
    const updated = await updateCmsBlog(id, body);
    if (!updated) return NextResponse.json({ ok: false, message: "Blog not found" }, { status: 404 });

    await logAuditEvent({
      actor_email: "admin@dgeniussolutions.com",
      role: "admin",
      action: "BLOG_UPDATED",
      resource: "blog_post",
      resource_id: id,
      summary: `Updated blog "${updated.title}" (${id})`,
      after_state: {
        title: updated.title,
        slug: updated.slug,
        status: updated.status,
        needs_review: updated.needs_review,
      },
      status: "success",
    });

    const qa = await validateCmsBlogForPublish(id);
    return NextResponse.json({ ok: true, blog: updated, qa });
  } catch (error) {
    console.error("Failed to update CMS blog", error);
    return NextResponse.json({ ok: false, message: "Failed to update blog" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const status = await authorize();
  if (status !== 200) return NextResponse.json({ ok: false }, { status });

  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, message: "Blog ID required" }, { status: 400 });

  const blog = await getCmsBlogById(id);
  if (!blog) return NextResponse.json({ ok: false, message: "Blog not found" }, { status: 404 });

  if (blog.status === "published") {
    return NextResponse.json(
      { ok: false, message: "Cannot delete a published blog directly. Unpublish or revert to draft first." },
      { status: 400 }
    );
  }

  try {
    await deleteCmsDraftBlog(id);

    await logAuditEvent({
      actor_email: "admin@dgeniussolutions.com",
      role: "admin",
      action: "BLOG_DELETED",
      resource: "blog_post",
      resource_id: id,
      summary: `Deleted blog "${blog.title}" (${id})`,
      before_state: {
        title: blog.title,
        slug: blog.slug,
        status: blog.status,
      },
      status: "success",
    });

    return NextResponse.json({ ok: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Failed to delete CMS blog", error);
    return NextResponse.json({ ok: false, message: "Failed to delete blog" }, { status: 500 });
  }
}

