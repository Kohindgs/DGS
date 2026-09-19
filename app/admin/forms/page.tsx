import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { getFormSubmissionCounts } from "@/lib/cms/leads";
import { listApprovedForms } from "@/lib/forms/registry";

export default async function FormsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const forms = listApprovedForms();
  const databaseReady = isCmsDatabaseConfigured();
  const counts = databaseReady ? await getFormSubmissionCounts() : new Map<string, number>();

  return (
    <main className="dgs-admin-shell">
      <header className="dgs-admin-header">
        <div>
          <p className="dgs-admin-kicker">DGS CMS · Forms</p>
          <h1>Forms Migration</h1>
          <p>Approved public form inventory, route mappings and native shadow-capture status.</p>
        </div>
        <div className="dgs-admin-header-actions">
          <span className={databaseReady ? "dgs-admin-badge ready" : "dgs-admin-badge"}>
            {databaseReady ? "Native capture enabled" : "Database not configured"}
          </span>
          <Link href="/admin/">Back to CMS</Link>
        </div>
      </header>
      <section className="dgs-admin-status">
        <h2>Current delivery mode</h2>
        <p>
          Fluent Forms remains the verified email/submission provider. After a successful Fluent submission,
          the sanitized lead is copied into the native CMS. This protects live lead delivery while native cutover is validated.
        </p>
      </section>

      <section className="dgs-admin-grid" aria-label="Website forms">
        {forms.map((form) => {
          const nativeCount = counts.get(form.key) || 0;
          const visibleFields = form.fields.filter((field) => !field.hidden && field.type !== "hidden").length;
          return (
            <article className="dgs-admin-card" key={form.key}>
              <div className="dgs-admin-card-dot" aria-hidden="true" />
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
                <div>
                  <p className="dgs-admin-kicker">Fluent Form {form.fluentFormId}</p>
                  <h2>{form.title}</h2>
                </div>
                <span className={form.activationEnabled ? "dgs-admin-badge ready" : "dgs-admin-badge"}>
                  {form.activationEnabled ? "Live" : "Disabled"}
                </span>
              </div>
              <p>{visibleFields} visible fields · {form.captcha?.enabled ? "CAPTCHA enabled" : "No CAPTCHA"}</p>
              <p><strong>Native captured:</strong> {nativeCount}</p>
              <p><strong>Routes:</strong></p>
              <ul>
                {(form.sourceRoutes || []).map((route) => (
                  <li key={route}><code>{route}</code></li>
                ))}
              </ul>
              <p>
                <strong>Migration:</strong>{" "}
                {databaseReady ? "Fluent delivery + native CMS shadow capture" : "Fluent delivery only"}
              </p>
              <p>
                <strong>Final cutover gate:</strong>{" "}
                Native notification email + CAPTCHA verification + controlled submission QA.
              </p>
            </article>
          );
        })}
      </section>

      <section className="dgs-admin-status">
        <h2>Cutover rule</h2>
        <p>
          WordPress form delivery will only be disabled after every approved form passes native validation,
          email delivery, CAPTCHA and controlled production QA. Until then there is no change to customer-facing behavior.
        </p>
      </section>
    </main>
  );
}
