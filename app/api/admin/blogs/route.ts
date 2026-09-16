import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { createCmsBlog, listCmsBlogs } from "@/lib/cms/blogs";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorize() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") return 404;
  if (!(await hasAdminSession())) return 401;
  if (!isCmsDatabaseConfigured()) return 503;
  return 200;
}

export async function GET() {
  const status = await authorize();
  if (status !== 200) return NextResponse.json({ ok: false }, { status });
  return NextResponse.json({ ok: true, blogs: await listCmsBlogs() });
}

export async function POST(request: NextRequest) {
  const status = await authorize();
  if (status !== 200) return NextResponse.json({ ok: false }, { status });

  const body = await request.json();
  const title = String(body?.title || "").trim();
  const slug = String(body?.slug || "").trim().toLowerCase();
  if (!title || !slug) {
    return NextResponse.json({ ok: false, message: "title and slug are required" }, { status: 400 });
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return NextResponse.json({ ok: false, message: "slug must use lowercase letters, numbers and hyphens" }, { status: 400 });
  }

  const content = Array.isArray(body?.content) ? body.content : [];
  const excerpt = typeof body?.excerpt === "string" ? body.excerpt : undefined;

  try {
    const blog = await createCmsBlog({ title, slug, excerpt, content });
    return NextResponse.json({ ok: true, blog }, { status: 201 });
  } catch (error) {
    const pgCode = typeof error === "object" && error && "code" in error
      ? String((error as { code?: unknown }).code || "")
      : "";
    if (pgCode === "23505") {
      return NextResponse.json({ ok: false, message: "slug already exists" }, { status: 409 });
    }
    console.error("Failed to create CMS blog", error);
    return NextResponse.json({ ok: false, message: "unable to create blog" }, { status: 500 });
  }
}
