import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { createCmsBlog, listCmsBlogsDetailed, type BlogFilterView } from "@/lib/cms/blogs";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (process.env.DGS_ADMIN_ENABLED !== "true") return NextResponse.json({ ok: false }, { status: 404 });
  if (!(await hasAdminSession())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!isCmsDatabaseConfigured()) return NextResponse.json({ ok: false, error: "Database not configured" }, { status: 503 });

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "blogs", "view")) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const view = (searchParams.get("view") || "all") as BlogFilterView;
  const search = searchParams.get("search") || undefined;
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 20);

  try {
    const data = await listCmsBlogsDetailed({ view, search, page, limit });
    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    console.error("Failed to list CMS blogs", error);
    return NextResponse.json({ ok: false, message: "Unable to list blogs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (process.env.DGS_ADMIN_ENABLED !== "true") return NextResponse.json({ ok: false }, { status: 404 });
  if (!(await hasAdminSession())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!isCmsDatabaseConfigured()) return NextResponse.json({ ok: false, error: "Database not configured" }, { status: 503 });

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "blogs", "create")) {
    return NextResponse.json({ ok: false, error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  const body = await request.json();
  const title = String(body?.title || "").trim();
  const slug = String(body?.slug || "").trim().toLowerCase();
  if (!title || !slug) {
    return NextResponse.json({ ok: false, message: "Title and slug are required" }, { status: 400 });
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return NextResponse.json({ ok: false, message: "Slug must use lowercase letters, numbers, and hyphens" }, { status: 400 });
  }

  const content = Array.isArray(body?.content) ? body.content : [];
  const excerpt = typeof body?.excerpt === "string" ? body.excerpt : undefined;
  const featuredImageUrl = typeof body?.featured_image_url === "string" ? body.featured_image_url : undefined;
  const seoTitle = typeof body?.seo_title === "string" ? body.seo_title : undefined;
  const seoDescription = typeof body?.seo_description === "string" ? body.seo_description : undefined;
  const focusKeyword = typeof body?.focus_keyword === "string" ? body.focus_keyword : undefined;

  try {
    const blog = await createCmsBlog({
      title,
      slug,
      excerpt,
      content,
      featured_image_url: featuredImageUrl,
      seo_title: seoTitle,
      seo_description: seoDescription,
      focus_keyword: focusKeyword,
      status: "draft",
    });

    await logAuditEvent({
      user_id: currentUser.id,
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "BLOG_CREATED",
      resource: "blog_post",
      resource_id: blog.id,
      summary: `Created blog draft "${blog.title}" (${blog.id})`,
      after_state: {
        title: blog.title,
        slug: blog.slug,
        status: blog.status,
      },
      status: "success",
    });

    return NextResponse.json({ ok: true, blog }, { status: 201 });
  } catch (error) {
    const err = error as { code?: string; errno?: number };
    if (err?.code === "ER_DUP_ENTRY" || err?.errno === 1062) {
      return NextResponse.json({ ok: false, message: "A blog with this slug already exists" }, { status: 409 });
    }
    console.error("Failed to create CMS blog", error);
    return NextResponse.json({ ok: false, message: "Unable to create blog" }, { status: 500 });
  }
}
