import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";

export const dynamic = "force-dynamic";

const sections = [
  ["Blogs", "Draft, review and publish native posts", "/admin/blogs/"],
  ["Careers", "Create, publish and unpublish job openings", "/admin/careers/"],
  ["Leads", "Native lead inbox and status tracking", "/admin/leads/"],
  ["Forms", "Verified form inventory and migration controls", "/admin/forms/"],
  ["Portfolio", "Visibility, order, titles and alt text for approved work", "/admin/portfolio/"],
  ["Assessment", "Secure candidate tests, scoring and HR review", "/admin/assessment/"],
  ["Media", "Uploads, alt text and asset metadata", "/admin/media/"],
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
          <p>Native Next.js content, careers, forms, leads, portfolio, assessments, media and SEO administration.</p>
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
        <p>The native CMS is code-complete for the current migration blocks; WordPress remains only as a compatibility fallback while production activation is completed.</p>
        <ul>
          <li>Headless WordPress bridge: retained as compatibility fallback</li>
          <li>Native careers, leads, portfolio and assessments: implemented</li>
          <li>Native MySQL schema: deployment-ready</li>
          <li>Production activation: requires persistent server config + schema application</li>
        </ul>
      </section>
    </main>
  );
}
