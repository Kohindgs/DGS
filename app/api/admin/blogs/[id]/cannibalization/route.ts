import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { getCmsBlogById } from "@/lib/cms/blogs";
import { checkBlogCannibalizationRisk, checkCanonicalCollision } from "@/lib/seo/cannibalization";

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

  const seo = blog.content?.optimization?.seo;
  const canonicalPath = seo?.canonicalPath || `/blogs/${blog.slug}/`;
  const report = checkBlogCannibalizationRisk({
    slug: blog.slug,
    title: blog.title,
    focusKeyword: blog.focus_keyword || seo?.focusKeyword || null,
    secondaryKeywords: seo?.secondaryKeywords || null,
    canonicalPath,
  });

  const canonicalCollision = await checkCanonicalCollision({
    targetCanonical: `https://www.dgeniussolutions.com${canonicalPath}`,
    currentEntityId: blog.id,
    currentEntityType: "blog_post",
  });

  return NextResponse.json({ ok: true, blogId: id, report, canonicalCollision });
}
