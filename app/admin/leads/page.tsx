import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { listCmsLeads, updateLeadStatus } from "@/lib/cms/leads";

export const dynamic = "force-dynamic";

async function changeStatus(formData: FormData) {
  "use server";
  if (!(await hasAdminSession())) redirect("/admin/login/");
  await updateLeadStatus(String(formData.get("id") || ""), String(formData.get("status") || "new"));
  revalidatePath("/admin/leads/");
}

function parsePayloadObj(value: unknown): Record<string, any> {
  if (!value) return {};
  if (typeof value === "object") return value as Record<string, any>;
  try {
    return JSON.parse(String(value));
  } catch {
    return {};
  }
}

function textPayload(value: unknown) {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

export default async function AdminLeadsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");
  const ready = isCmsDatabaseConfigured();
  const leads = ready ? await listCmsLeads() : [];

  return (
    <main className="dgs-admin-shell">
      <header className="dgs-admin-header">
        <div>
          <p className="dgs-admin-kicker">DGS CMS · Leads</p>
          <h1>Lead Inbox</h1>
          <p>
            One place for website enquiries, career applications and native form submissions.
          </p>
        </div>
        <div className="dgs-admin-header-actions">
          <span className={ready ? "dgs-admin-badge ready" : "dgs-admin-badge"}>
            {ready ? "Database configured" : "Database not configured"}
          </span>
          <Link href="/admin/">Back to CMS</Link>
        </div>
      </header>

      {!ready ? (
        <section className="dgs-admin-status">
          <h2>Database setup required</h2>
        </section>
      ) : (
        <section className="dgs-admin-import-panel">
          <div className="dgs-admin-table-wrap">
            <table className="dgs-admin-table">
              <thead>
                <tr>
                  <th>Created</th>
                  <th>Lead / Candidate</th>
                  <th>Source / Position</th>
                  <th>Status</th>
                  <th>Documents &amp; Details</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const p = parsePayloadObj(lead.payload);
                  const isCareer = lead.source_form_key === "career-application";

                  return (
                    <tr key={lead.id}>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {String(lead.created_at).slice(0, 16).replace("T", " ")}
                      </td>
                      <td>
                        <strong>{lead.name || "Unnamed"}</strong>
                        <br />
                        <span style={{ fontSize: "0.85em", color: "#9ca3af" }}>
                          {lead.email || ""}
                        </span>
                        <br />
                        <span style={{ fontSize: "0.85em", color: "#9ca3af" }}>
                          {lead.phone || ""}
                        </span>
                        {p.location ? (
                          <div style={{ fontSize: "0.8em", color: "#c084fc", marginTop: 2 }}>
                            📍 {p.location}
                          </div>
                        ) : null}
                      </td>
                      <td>
                        {isCareer ? (
                          <div>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "2px 6px",
                                borderRadius: 4,
                                fontSize: "0.78em",
                                fontWeight: 700,
                                background: "#7928ca",
                                color: "#fff",
                                marginBottom: 4,
                              }}
                            >
                              {p.position || "Career Application"}
                            </span>
                            {p.experience ? (
                              <div style={{ fontSize: "0.82em", color: "#cbd5e1" }}>
                                Exp: {p.experience}
                              </div>
                            ) : null}
                            {p.education ? (
                              <div style={{ fontSize: "0.82em", color: "#94a3b8" }}>
                                Edu: {p.education}
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <div>
                            <code>{lead.source_form_key || "unknown"}</code>
                            <br />
                            <span style={{ fontSize: "0.82em", color: "#9ca3af" }}>
                              {lead.source_route || ""}
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        <form action={changeStatus} className="dgs-admin-inline-form">
                          <input type="hidden" name="id" value={lead.id} />
                          <select name="status" defaultValue={lead.status}>
                            {["new", "contacted", "qualified", "won", "lost", "spam"].map(
                              (s) => (
                                <option key={s}>{s}</option>
                              ),
                            )}
                          </select>
                          <button type="submit">Save</button>
                        </form>
                      </td>
                      <td>
                        {isCareer ? (
                          <div style={{ marginBottom: 6 }}>
                            {p.resume ? (
                              <p style={{ margin: "2px 0" }}>
                                <a
                                  href={`/api/admin/leads/${lead.id}/resume`}
                                  style={{ color: "#a855f7", fontWeight: 600 }}
                                >
                                  📄 Download CV ({p.resume.originalName || "File"})
                                </a>
                              </p>
                            ) : null}
                            {p.portfolio ? (
                              <p style={{ margin: "2px 0" }}>
                                <a
                                  href={`/api/admin/leads/${lead.id}/portfolio`}
                                  style={{ color: "#38bdf8", fontWeight: 600 }}
                                >
                                  🎨 Download Portfolio PDF ({p.portfolio.originalName || "PDF"})
                                </a>
                              </p>
                            ) : null}
                            {p.portfolioUrl ? (
                              <p style={{ margin: "2px 0" }}>
                                <a
                                  href={p.portfolioUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: "#38bdf8", textDecoration: "underline" }}
                                >
                                  🔗 Open Portfolio Link ↗
                                </a>
                              </p>
                            ) : null}
                          </div>
                        ) : null}
                        <details>
                          <summary style={{ cursor: "pointer", fontSize: "0.85em", color: "#9ca3af" }}>
                            View payload
                          </summary>
                          <pre
                            style={{
                              fontSize: "0.78em",
                              maxHeight: "150px",
                              overflow: "auto",
                              background: "rgba(0,0,0,0.3)",
                              padding: 8,
                              borderRadius: 4,
                            }}
                          >
                            {textPayload(lead.payload)}
                          </pre>
                        </details>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!leads.length ? (
            <p className="dgs-admin-help">No native leads captured yet.</p>
          ) : null}
        </section>
      )}
    </main>
  );
}
