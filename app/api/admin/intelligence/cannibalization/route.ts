import { NextRequest, NextResponse } from "next/server";
import { authorizeSemanticAdmin } from "@/lib/intelligence/admin-auth";
import { getCmsBlogById } from "@/lib/cms/blogs";
import { semanticCannibalizationForBlog } from "@/lib/intelligence/semantic-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await authorizeSemanticAdmin("view");
  if (!auth.ok) return NextResponse.json({ ok: false }, { status: auth.status });
  const blogId = new URL(request.url).searchParams.get("blogId");
  if (!blogId) return NextResponse.json({ ok: false, message: "blogId is required" }, { status: 400 });
  const blog = await getCmsBlogById(blogId);
  if (!blog) return NextResponse.json({ ok: false, message: "Blog not found" }, { status: 404 });
  const result = await semanticCannibalizationForBlog(blog);
  return NextResponse.json({ ok: result.available, ...result }, { status: result.available ? 200 : 503 });
}
