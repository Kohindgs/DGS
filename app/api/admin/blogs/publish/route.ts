import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { publishCmsBlog, validateCmsBlogForPublish } from "@/lib/cms/blogs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (process.env.DGS_ADMIN_ENABLED !== "true") return NextResponse.json({ ok: false }, { status: 404 });
  if (!(await hasAdminSession())) return NextResponse.json({ ok: false }, { status: 401 });
  if (!isCmsDatabaseConfigured()) return NextResponse.json({ ok: false }, { status: 503 });

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

  revalidatePath("/blogs/");
  revalidatePath(`/blogs/${blog.slug}/`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/llms.txt");
  revalidatePath("/llms.md");
  revalidatePath("/llms-full.txt");
  revalidatePath("/llms-full.md");

  return NextResponse.json({ ok: true, blog, qa });
}
