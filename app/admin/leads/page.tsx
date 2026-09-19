import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { listRecentLeads } from "@/lib/cms/leads";

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return value;
  }
}

export default async function LeadsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const configured = isCmsDatabaseConfigured();
  const leads = configured ? await listRecentLeads(150) : [];

  return (
    <main className="dgs-admin-shell">
      <header className="dgs-admin-header">
        <div>
          <p className="dgs-admin-kicker">D&apos;Genius Solutions</p>
          <h1>Leads</h1>
          <p>Native CMS lead inbox captured from successful website form submissions.</p>
        </div>
        <Link href="/admin/">Back to CMS</Link>
      </header>
      {!configured ? (
        <section className="dgs-admin-status">
          <h2>Database not configured</h2>
          <p>Configure the native CMS MySQL connection to enable lead capture and the inbox.</p>
        </section>
      ) : leads.length === 0 ? (
        <section className="dgs-admin-status">
          <h2>No native leads yet</h2>
          <p>Successful Fluent Forms submissions will appear here automatically while shadow capture is enabled.</p>
        </section>
      ) : (
        <section className="dgs-admin-import-panel">
          <div className="dgs-admin-import-head">
            <div>
              <h2>Recent leads</h2>
              <p>{leads.length} most recent submissions</p>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 10 }}>Received</th>
                  <th style={{ textAlign: "left", padding: 10 }}>Name</th>
                  <th style={{ textAlign: "left", padding: 10 }}>Email</th>
                  <th style={{ textAlign: "left", padding: 10 }}>Phone</th>
                  <th style={{ textAlign: "left", padding: 10 }}>Company</th>
                  <th style={{ textAlign: "left", padding: 10 }}>Form</th>
                  <th style={{ textAlign: "left", padding: 10 }}>Source</th>
                  <th style={{ textAlign: "left", padding: 10 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td style={{ padding: 10, verticalAlign: "top" }}>{formatDate(lead.created_at)}</td>
                    <td style={{ padding: 10, verticalAlign: "top" }}>{lead.name || "—"}</td>
                    <td style={{ padding: 10, verticalAlign: "top" }}>
                      {lead.email ? <a href={`mailto:${lead.email}`}>{lead.email}</a> : "—"}
                    </td>
                    <td style={{ padding: 10, verticalAlign: "top" }}>{lead.phone || "—"}</td>
                    <td style={{ padding: 10, verticalAlign: "top" }}>{lead.company || "—"}</td>
                    <td style={{ padding: 10, verticalAlign: "top" }}>{lead.source_form_key || "—"}</td>
                    <td style={{ padding: 10, verticalAlign: "top" }}>{lead.source_route || "—"}</td>
                    <td style={{ padding: 10, verticalAlign: "top" }}>{lead.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
