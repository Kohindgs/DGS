import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { deleteCmsDraftBlog, getCmsBlogById, trashCmsBlog, updateCmsBlog, validateCmsBlogForPublish } from "@/lib/cms/blogs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (process.env.DGS_ADMIN_ENABLED !== "true") return NextResponse.json({ ok: false }, { status: 404 });
  if (!(await hasAdminSession())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!isCmsDatabaseConfigured()) return NextResponse.json({ ok: false, error: "Database not configured" }, { status: 503 });

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "blogs", "view")) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

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
  if (process.env.DGS_ADMIN_ENABLED !== "true") return NextResponse.json({ ok: false }, { status: 404 });
  if (!(await hasAdminSession())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!isCmsDatabaseConfigured()) return NextResponse.json({ ok: false, error: "Database not configured" }, { status: 503 });

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "blogs", "edit")) {
    return NextResponse.json({ ok: false, error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, message: "Blog ID required" }, { status: 400 });

  const body = await request.json();
  body.updatedBy = currentUser.id;

  try {
    const updated = await updateCmsBlog(id, body);
    if (!updated) return NextResponse.json({ ok: false, message: "Blog not found" }, { status: 404 });

    await logAuditEvent({
      user_id: currentUser.id,
      actor_email: currentUser.email,
      role: currentUser.role,
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

    revalidatePath("/blogs/");
    revalidatePath(`/blogs/${updated.slug}/`);
    revalidatePath("/sitemap.xml");
    revalidatePath("/llms.txt");
    revalidatePath("/llms.md");

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
  if (process.env.DGS_ADMIN_ENABLED !== "true") return NextResponse.json({ ok: false }, { status: 404 });
  if (!(await hasAdminSession())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!isCmsDatabaseConfigured()) return NextResponse.json({ ok: false, error: "Database not configured" }, { status: 503 });

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || (!hasPermission(currentUser.role, "blogs", "delete") && !hasPermission(currentUser.role, "blogs", "edit"))) {
    return NextResponse.json({ ok: false, error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, message: "Blog ID required" }, { status: 400 });

  const blog = await getCmsBlogById(id);
  if (!blog) return NextResponse.json({ ok: false, message: "Blog not found" }, { status: 404 });

  try {
    const trashed = await trashCmsBlog(id, currentUser.id);

    await logAuditEvent({
      user_id: currentUser.id,
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "BLOG_TRASHED",
      resource: "blog_post",
      resource_id: id,
      summary: `Moved blog "${blog.title}" (${id}) to Trash`,
      before_state: {
        title: blog.title,
        slug: blog.slug,
        status: blog.status,
      },
      status: "success",
    });

    revalidatePath("/blogs/");
    revalidatePath(`/blogs/${blog.slug}/`);
    revalidatePath("/sitemap.xml");
    revalidatePath("/llms.txt");
    revalidatePath("/llms.md");

    return NextResponse.json({ ok: true, message: "Blog moved to Trash", blog: trashed });
  } catch (error) {
    console.error("Failed to delete CMS blog", error);
    return NextResponse.json({ ok: false, message: "Failed to delete blog" }, { status: 500 });
  }
}

