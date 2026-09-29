import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { permanentlyDeleteCmsBlog, getCmsBlogById } from "@/lib/cms/blogs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handlePermanentDelete(request, await params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handlePermanentDelete(request, await params);
}

async function handlePermanentDelete(request: NextRequest, { id }: { id: string }) {
  if (process.env.DGS_ADMIN_ENABLED !== "true") return NextResponse.json({ ok: false }, { status: 404 });
  if (!(await hasAdminSession())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!isCmsDatabaseConfigured()) return NextResponse.json({ ok: false, error: "Database not configured" }, { status: 503 });

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "blogs", "delete")) {
    return NextResponse.json(
      { ok: false, error: "Forbidden: Superadmin permissions required for permanent delete" },
      { status: 403 }
    );
  }

  if (!id) return NextResponse.json({ ok: false, message: "Blog ID required" }, { status: 400 });

  const blog = await getCmsBlogById(id);
  if (!blog) return NextResponse.json({ ok: false, message: "Blog not found" }, { status: 404 });

  let body: { confirmedSlug?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  if (!body.confirmedSlug || body.confirmedSlug.trim().toLowerCase() !== blog.slug.toLowerCase()) {
    return NextResponse.json(
      {
        ok: false,
        message: `Slug confirmation mismatch. Please type "${blog.slug}" exactly to permanently delete.`,
      },
      { status: 400 }
    );
  }

  try {
    await permanentlyDeleteCmsBlog(id, body.confirmedSlug);

    await logAuditEvent({
      user_id: currentUser.id,
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "BLOG_PERMANENTLY_DELETED",
      resource: "blog_post",
      resource_id: id,
      summary: `Permanently deleted blog "${blog.title}" (${blog.slug}) and all related records`,
      before_state: {
        title: blog.title,
        slug: blog.slug,
        status: blog.status,
        published_at: blog.published_at,
      },
      status: "success",
    });

    revalidatePath("/blogs/");
    revalidatePath(`/blogs/${blog.slug}/`);
    revalidatePath("/sitemap.xml");
    revalidatePath("/llms.txt");
    revalidatePath("/llms.md");

    return NextResponse.json({ ok: true, message: `Blog permanently deleted` });
  } catch (err) {
    console.error("Failed to permanently delete blog:", err);
    return NextResponse.json(
      { ok: false, message: (err as Error).message || "Failed to permanently delete blog" },
      { status: 500 }
    );
  }
}
