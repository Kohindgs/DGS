import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { listCmsBlogsDetailed } from "@/lib/cms/blogs";
import { BlogsManagerView } from "./BlogsManagerView";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const databaseReady = isCmsDatabaseConfigured();
  const initialData = databaseReady
    ? await listCmsBlogsDetailed({ view: "all", limit: 20 })
    : {
        blogs: [],
        total: 0,
        page: 1,
        limit: 20,
        counts: {
          all: 0,
          drafts: 0,
          scheduled: 0,
          published: 0,
          needs_review: 0,
          seo_issues: 0,
          missing_images: 0,
        },
      };

  return (
    <main className="dgs-admin-shell">
      <header className="dgs-admin-header">
        <div>
          <p className="dgs-admin-kicker">DGS CMS · Blogs</p>
          <h1>Blog & Content Studio</h1>
          <p>
            Word-to-Web bulk publisher, SEO/AEO/GEO optimizer, media integration, and publication pipeline.
          </p>
        </div>
        <div className="dgs-admin-header-actions">
          <span className={databaseReady ? "dgs-admin-badge ready" : "dgs-admin-badge"}>
            {databaseReady ? "Database configured" : "Database not configured"}
          </span>
          <Link href="/admin/">Back to CMS</Link>
        </div>
      </header>
      {databaseReady ? (
        <BlogsManagerView initialData={initialData} />
      ) : (
        <section className="dgs-admin-status">
          <h2>Database setup required</h2>
          <p>
            Configure DGS_DATABASE_URL before managing blogs. No operations will be accepted until the database is ready.
          </p>
        </section>
      )}
    </main>
  );
}
