import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { trashCmsBlog, getCmsBlogById } from "@/lib/cms/blogs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (process.env.DGS_ADMIN_ENABLED !== "true") return NextResponse.json({ ok: false }, { status: 404 });
  if (!(await hasAdminSession())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!isCmsDatabaseConfigured()) return NextResponse.json({ ok: false, error: "Database not configured" }, { status: 503 });

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || (!hasPermission(currentUser.role, "blogs", "edit") && !hasPermission(currentUser.role, "blogs", "delete"))) {
    return NextResponse.json({ ok: false, error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, message: "Blog ID required" }, { status: 400 });

  const blog = await getCmsBlogById(id);
  if (!blog) return NextResponse.json({ ok: false, message: "Blog not found" }, { status: 404 });

  let body: { redirectUrl?: string; statusCode?: number } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    const updated = await trashCmsBlog(id, currentUser.id, {
      redirectUrl: body.redirectUrl,
      statusCode: body.statusCode || 301,
    });

    await logAuditEvent({
      user_id: currentUser.id,
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "BLOG_TRASHED",
      resource: "blog_post",
      resource_id: id,
      summary: `Moved blog "${blog.title}" (/blogs/${blog.slug}/) to Trash`,
      before_state: {
        title: blog.title,
        slug: blog.slug,
        status: blog.status,
      },
      after_state: {
        title: blog.title,
        slug: blog.slug,
        status: "trashed",
        redirect_url: body.redirectUrl || null,
        redirect_status_code: body.statusCode || 301,
      },
      status: "success",
    });

    revalidatePath("/blogs/");
    revalidatePath(`/blogs/${blog.slug}/`);
    revalidatePath("/sitemap.xml");
    revalidatePath("/llms.txt");
    revalidatePath("/llms.md");

    return NextResponse.json({ ok: true, blog: updated, message: `Blog moved to Trash` });
  } catch (err) {
    console.error("Failed to trash blog:", err);
    return NextResponse.json(
      { ok: false, message: (err as Error).message || "Failed to move blog to Trash" },
      { status: 500 }
    );
  }
}
