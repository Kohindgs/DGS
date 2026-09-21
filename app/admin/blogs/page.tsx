import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { BlogImporter } from "./BlogImporter";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const databaseReady = isCmsDatabaseConfigured();
  return (
    <main className="dgs-admin-shell">
      <header className="dgs-admin-header">
        <div>
          <p className="dgs-admin-kicker">DGS CMS · Blogs</p>
          <h1>Word-to-Web Publisher</h1>
          <p>Upload a Word blog and matching images. DGS CMS prepares the draft, WebP assets, alt text, metadata and structured data.</p>
        </div>
        <div className="dgs-admin-header-actions">
          <span className={databaseReady ? "dgs-admin-badge ready" : "dgs-admin-badge"}>{databaseReady ? "Database configured" : "Database not configured"}</span>
          <Link href="/admin/">Back to CMS</Link>
        </div>
      </header>
      {databaseReady ? <BlogImporter /> : <section className="dgs-admin-status"><h2>Database setup required</h2><p>Configure DGS_DATABASE_URL before importing blogs. No upload will be accepted until the database is ready.</p></section>}
    </main>
  );
}
