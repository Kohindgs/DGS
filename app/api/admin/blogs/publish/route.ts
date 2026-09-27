import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { publishCmsBlog, validateCmsBlogForPublish } from "@/lib/cms/blogs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (process.env.DGS_ADMIN_ENABLED !== "true") return NextResponse.json({ ok: false }, { status: 404 });
  if (!(await hasAdminSession())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!isCmsDatabaseConfigured()) return NextResponse.json({ ok: false, error: "Database not configured" }, { status: 503 });

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "blogs", "publish")) {
    return NextResponse.json({ ok: false, error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  const body = await request.json();
  const id = String(body?.id || "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ ok: false, message: "Valid blog id required" }, { status: 400 });

  const qa = await validateCmsBlogForPublish(id);
  if (!qa.ok) {
    return NextResponse.json({
      ok: false,
      message: "Blog failed the publish QA gate",
      qa,
    }, { status: 422 });
  }

  const blog = await publishCmsBlog(id);
  if (!blog) return NextResponse.json({ ok: false, message: "Draft not found or already published" }, { status: 404 });

  await logAuditEvent({
    user_id: currentUser.id,
    actor_email: currentUser.email,
    role: currentUser.role,
    action: "BLOG_PUBLISHED",
    resource: "blog_post",
    resource_id: id,
    summary: `Published blog "${blog.title}" (/blogs/${blog.slug}/)`,
    after_state: {
      title: blog.title,
      slug: blog.slug,
      status: "published",
      published_at: blog.published_at,
    },
    status: "success",
  });

  revalidatePath("/blogs/");
  revalidatePath(`/blogs/${blog.slug}/`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/llms.txt");
  revalidatePath("/llms.md");
  revalidatePath("/llms-full.txt");
  revalidatePath("/llms-full.md");

  return NextResponse.json({ ok: true, blog, qa });
}
