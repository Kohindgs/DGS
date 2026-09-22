import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { createCmsBlog, listCmsBlogsDetailed, type BlogFilterView } from "@/lib/cms/blogs";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorize() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") return 404;
  if (!(await hasAdminSession())) return 401;
  if (!isCmsDatabaseConfigured()) return 503;
  return 200;
}

export async function GET(request: NextRequest) {
  const status = await authorize();
  if (status !== 200) return NextResponse.json({ ok: false }, { status });

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
  const status = await authorize();
  if (status !== 200) return NextResponse.json({ ok: false }, { status });

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
