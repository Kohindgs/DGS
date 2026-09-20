import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";

const sections = [
  ["Blogs", "Draft, review and publish native posts", "/admin/blogs/"],
  ["Careers", "Create, publish and unpublish job openings", "/admin/careers/"],
  ["Leads", "Native lead inbox and status tracking", "/admin/leads/"],
  ["Forms", "Verified form inventory and migration controls", "/admin/forms/"],
  ["Media", "Uploads, alt text and asset metadata", ""],
  ["SEO", "Metadata, canonicals and schema controls", ""],
  ["Users", "Roles, access and audit history", ""],
] as const;

export default async function AdminPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const databaseReady = isCmsDatabaseConfigured();

  return (
    <main className="dgs-admin-shell">
      <header className="dgs-admin-header">
        <div>
          <p className="dgs-admin-kicker">D&apos;Genius Solutions</p>
          <h1>DGS CMS</h1>
          <p>Native Next.js content, forms, leads, media and SEO administration.</p>
        </div>
        <span className={databaseReady ? "dgs-admin-badge ready" : "dgs-admin-badge"}>
          {databaseReady ? "Database configured" : "Database not configured"}
        </span>
      </header>
      <section className="dgs-admin-grid" aria-label="CMS sections">
        {sections.map(([title, description, href]) => (
          <article className="dgs-admin-card" key={title}>
            <div className="dgs-admin-card-dot" aria-hidden="true" />
            <h2>{title}</h2>
            <p>{description}</p>
            {href ? <Link href={href}>Manage {title}</Link> : <span>Foundation ready</span>}
          </article>
        ))}
      </section>

      <section className="dgs-admin-status">
        <h2>Migration status</h2>
        <p>WordPress remains the temporary forms, CMS and media backend while native modules are built and verified.</p>
        <ul>
          <li>Headless WordPress bridge: active</li>
          <li>Fluent Forms context bridge: verified 11/11</li>
          <li>Native PostgreSQL schema: source-ready</li>
          <li>Production cutover: not started</li>
        </ul>
      </section>
    </main>
  );
}
