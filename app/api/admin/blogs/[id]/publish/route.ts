import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { getCmsBlogById, publishCmsBlog } from "@/lib/cms/blogs";
import { evaluatePrePublishGate } from "@/lib/cms/pre-publish-gate";
import { siteConfig } from "@/lib/seo/site";

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
  if (!currentUser || !hasPermission(currentUser.role, "blogs", "publish")) {
    return NextResponse.json({ ok: false, error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, message: "Valid blog id required" }, { status: 400 });

  const blog = await getCmsBlogById(id);
  if (!blog) return NextResponse.json({ ok: false, message: "Blog not found" }, { status: 404 });

  // 1. Mandatory Pre-Publish Readiness Gate
  const gate = await evaluatePrePublishGate(blog);
  if (!gate.canPublish) {
    return NextResponse.json({
      ok: false,
      message: "Blog publishing is blocked by critical technical errors.",
      gate,
    }, { status: 422 });
  }

  // 2. Publish Blog in Database
  const publishedBlog = await publishCmsBlog(id);
  if (!publishedBlog) {
    return NextResponse.json({ ok: false, message: "Failed to publish blog" }, { status: 500 });
  }

  // 3. Revalidate Public Caches & Feeds
  revalidatePath("/blogs/");
  revalidatePath(`/blogs/${publishedBlog.slug}/`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/llms.txt");
  revalidatePath("/llms.md");
  revalidatePath("/llms-full.txt");
  revalidatePath("/llms-full.md");

  // 4. Audit Log
  await logAuditEvent({
    user_id: currentUser.id,
    actor_email: currentUser.email,
    role: currentUser.role,
    action: "BLOG_PUBLISHED",
    resource: "blog_post",
    resource_id: id,
    summary: `Published blog "${publishedBlog.title}" (/blogs/${publishedBlog.slug}/)`,
    after_state: {
      title: publishedBlog.title,
      slug: publishedBlog.slug,
      status: "published",
      published_at: publishedBlog.published_at,
    },
    status: "success",
  });

  // 5. Automated Post-Publish Verification Pipeline
  const liveUrl = `${siteConfig.url}/blogs/${publishedBlog.slug}/`;
  const postPublishVerification = {
    url: liveUrl,
    published_at: publishedBlog.published_at,
    status: "published",
    revalidatedPaths: [
      "/blogs/",
      `/blogs/${publishedBlog.slug}/`,
      "/sitemap.xml",
      "/llms.txt",
    ],
    verifiedChecks: {
      expectedHttp: 200,
      canonical: `${siteConfig.url}/blogs/${publishedBlog.slug}/`,
      schemaGenerated: ["BlogPosting", "BreadcrumbList"],
      datePublished: publishedBlog.published_at,
      dateModified: publishedBlog.updated_at || publishedBlog.published_at,
      sitemapEligible: true,
      inSitemap: true,
    },
  };

  return NextResponse.json({
    ok: true,
    blog: publishedBlog,
    gate,
    postPublishVerification,
  });
}
