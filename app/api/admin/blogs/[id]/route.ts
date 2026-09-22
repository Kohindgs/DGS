import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
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
    return NextResponse.json({ ok: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Failed to delete CMS blog", error);
    return NextResponse.json({ ok: false, message: "Failed to delete blog" }, { status: 500 });
  }
}
