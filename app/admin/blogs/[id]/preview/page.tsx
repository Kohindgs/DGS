import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { getCmsBlogById, cmsBlogToPublicPost } from "@/lib/cms/blogs";
import { BlogArticle } from "@/components/blog/BlogArticle";
import { BlogWpChrome } from "@/components/blog/BlogWpChrome";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Blog Draft Preview | DGS Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminBlogPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");
  if (!isCmsDatabaseConfigured()) notFound();

  const { id } = await params;
  if (!id) notFound();

  const blog = await getCmsBlogById(id);
  if (!blog) notFound();

  const article = cmsBlogToPublicPost(blog as any);

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    draft: { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" },
    review: { bg: "#e0e7ff", text: "#3730a3", border: "#6366f1" },
    scheduled: { bg: "#f3e8ff", text: "#6b21a8", border: "#a855f7" },
    published: { bg: "#dcfce7", text: "#166534", border: "#22c55e" },
    trashed: { bg: "#fee2e2", text: "#991b1b", border: "#ef4444" },
  };

  const currentTheme = statusColors[blog.status] || { bg: "#f1f5f9", text: "#334155", border: "#94a3b8" };

  return (
    <div>
      {/* Top Preview Bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 9999,
          background: "#0f172a",
          color: "#f8fafc",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontSize: "13px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "4px",
              fontWeight: 700,
              fontSize: "11px",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              backgroundColor: currentTheme.bg,
              color: currentTheme.text,
              border: `1px solid ${currentTheme.border}`,
            }}
          >
            {blog.status} PREVIEW
          </span>
          <span style={{ color: "#94a3b8" }}>
            Target URL: <strong style={{ color: "#f8fafc" }}>/blogs/{blog.slug}/</strong>
          </span>
          <span style={{ color: "#cbd5e1" }}>
            (Strictly <strong>noindex, nofollow</strong> — not public)
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/admin/blogs/"
            style={{
              color: "#38bdf8",
              textDecoration: "none",
              fontWeight: 600,
              padding: "6px 14px",
              borderRadius: "4px",
              backgroundColor: "rgba(56, 189, 248, 0.1)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
            }}
          >
            ← Back to Blog Manager
          </Link>
          {blog.status === "published" && (
            <a
              href={`/blogs/${blog.slug}/`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#4ade80",
                textDecoration: "none",
                fontWeight: 600,
                padding: "6px 14px",
                borderRadius: "4px",
                backgroundColor: "rgba(74, 222, 128, 0.1)",
                border: "1px solid rgba(74, 222, 128, 0.2)",
              }}
            >
              View Live Page ↗
            </a>
          )}
        </div>
      </div>

      {/* Mirrored Blog Layout */}
      <BlogWpChrome>
        <BlogArticle article={article} relatedPosts={[]} />
      </BlogWpChrome>
    </div>
  );
}
