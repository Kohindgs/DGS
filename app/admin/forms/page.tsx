import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { listApprovedForms } from "@/lib/forms/registry";

export const dynamic = "force-dynamic";

export default async function AdminFormsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");
  const forms = listApprovedForms();
  return <main className="dgs-admin-shell">
    <header className="dgs-admin-header"><div>
      <p className="dgs-admin-kicker">DGS CMS · Forms</p>
      <h1>Forms Registry</h1>
      <p>Verified form definitions, route mappings and migration state for the WordPress-to-native cutover.</p>
    </div><div className="dgs-admin-header-actions">
      <span className="dgs-admin-badge ready">{forms.length} verified forms</span>
      <Link href="/admin/">Back to CMS</Link>
    </div></header>
    <section className="dgs-admin-import-panel">
      <div className="dgs-admin-record-list">

        {forms.map(form => <article className="dgs-admin-record" key={form.key}>
          <div>
            <span className={form.activationEnabled?"dgs-admin-state live":"dgs-admin-state"}>
              {form.activationEnabled?"Verified":"Disabled"}
            </span>
            <h3>{form.title}</h3>
            <p>Fluent Form #{form.fluentFormId} · {form.fields.filter(f=>!f.hidden).length} visible fields</p>
            <div className="dgs-admin-route-chips">{form.sourceRoutes.map(route=><code key={route}>{route}</code>)}</div>
          </div>
          <div className="dgs-admin-form-meta">
            <span>Current backend</span><strong>WordPress / Fluent Forms</strong>
            <span>Native migration</span><strong>{form.activationEnabled?"Ready for adapter cutover":"Blocked"}</strong>
          </div>
        </article>)}
      </div>
    </section>
  </main>;
}
