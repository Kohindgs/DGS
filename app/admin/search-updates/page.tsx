import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import {
  listGoogleSearchUpdates,
  updateSearchUpdateStatus,
} from "@/lib/google-updates/monitor";
import { CheckUpdatesButton } from "./CheckUpdatesButton";

export const dynamic = "force-dynamic";

async function changeStatus(formData: FormData) {
  "use server";
  if (!(await hasAdminSession())) redirect("/admin/login/");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "new") as
    | "new"
    | "acknowledged"
    | "monitoring"
    | "resolved";
  await updateSearchUpdateStatus(id, status);
  revalidatePath("/admin/search-updates/");
}

export default async function AdminSearchUpdatesPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const ready = isCmsDatabaseConfigured();
  const updates = ready ? await listGoogleSearchUpdates({ limit: 100 }) : [];

  const criticalCount = updates.filter(
    (u) => u.severity === "CRITICAL" || u.severity === "HIGH",
  ).length;

  return (
    <main className="dgs-admin-shell">
      <header className="dgs-admin-header">
        <div>
          <p className="dgs-admin-kicker">DGS CMS · SEO Protection</p>
          <h1>Google Search Update Monitor</h1>
          <p>
            Official Google Search Status incidents, core updates, and automated safe action guidance.
          </p>
        </div>
        <div className="dgs-admin-header-actions" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <CheckUpdatesButton />
          <Link href="/admin/">Back to CMS</Link>
        </div>
      </header>

      {/* Strict Policy Alert */}
      <section
        style={{
          margin: "18px 0",
          padding: "16px 20px",
          background: "rgba(121, 40, 202, 0.12)",
          border: "1px solid rgba(168, 85, 247, 0.35)",
          borderRadius: "10px",
          color: "#e5e7eb",
          fontSize: "0.9rem",
          lineHeight: "1.5",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, color: "#c084fc", marginBottom: "4px" }}>
          <span>🛡️</span> STRICT RANKING PROTECTION PROTOCOL
        </div>
        <div>
          Automated modifications to ranking-protected pages, titles, H1s, or canonicals during active Google rollouts are <strong>strictly prohibited</strong>. Observe Search Console metrics across the 14-day window before evaluating intentional adjustments.
        </div>
      </section>

      {!ready ? (
        <section className="dgs-admin-status">
          <h2>Database setup required</h2>
        </section>
      ) : (
        <section className="dgs-admin-import-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: "1.1rem", margin: 0 }}>
              Detected Updates ({updates.length})
            </h2>
            <span
              style={{
                fontSize: "0.85rem",
                padding: "3px 10px",
                borderRadius: "9999px",
                background: criticalCount > 0 ? "#ef4444" : "#10b981",
                color: "#fff",
                fontWeight: 600,
              }}
            >
              {criticalCount} Critical / High Alerts
            </span>
          </div>

          <div className="dgs-admin-table-wrap">
            <table className="dgs-admin-table">
              <thead>
                <tr>
                  <th>Published</th>
                  <th>Severity &amp; Category</th>
                  <th>Update Title &amp; Source</th>
                  <th>Impact Assessment</th>
                  <th>Safe Actions</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {updates.map((update) => {
                  const severityColors: Record<string, string> = {
                    CRITICAL: "#ef4444",
                    HIGH: "#f97316",
                    MEDIUM: "#3b82f6",
                    INFORMATIONAL: "#10b981",
                  };
                  const badgeColor = severityColors[update.severity] || "#6b7280";

                  return (
                    <tr key={update.id}>
                      <td style={{ whiteSpace: "nowrap", fontSize: "0.85em" }}>
                        {String(update.published_at).slice(0, 10)}
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "0.75em",
                            fontWeight: 700,
                            background: badgeColor,
                            color: "#fff",
                            marginBottom: "4px",
                          }}
                        >
                          {update.severity}
                        </span>
                        <br />
                        <span style={{ fontSize: "0.8em", color: "#9ca3af" }}>
                          {update.category}
                        </span>
                      </td>
                      <td>
                        <strong>{update.title}</strong>
                        <br />
                        <a
                          href={update.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: "0.8em", color: "#38bdf8", textDecoration: "underline" }}
                        >
                          {update.source} ↗
                        </a>
                        <p style={{ fontSize: "0.82em", color: "#d1d5db", margin: "4px 0 0 0" }}>
                          {update.summary}
                        </p>
                      </td>
                      <td style={{ minWidth: "220px" }}>
                        <p style={{ fontSize: "0.84em", margin: "0 0 6px 0", color: "#e5e7eb" }}>
                          {update.impact_analysis}
                        </p>
                        {update.affected_dgs_areas.length > 0 ? (
                          <div style={{ fontSize: "0.78em", color: "#c084fc" }}>
                            Areas: {update.affected_dgs_areas.slice(0, 3).join(", ")}
                          </div>
                        ) : null}
                      </td>
                      <td style={{ minWidth: "200px" }}>
                        <ul style={{ margin: 0, paddingLeft: 16, fontSize: "0.8em", color: "#9ca3af" }}>
                          {update.recommended_actions.map((act, i) => (
                            <li key={i} style={{ marginBottom: 4 }}>
                              {act}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        <form action={changeStatus} className="dgs-admin-inline-form">
                          <input type="hidden" name="id" value={update.id} />
                          <select name="status" defaultValue={update.status}>
                            {["new", "acknowledged", "monitoring", "resolved"].map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <button type="submit">Save</button>
                        </form>
                        {update.notified_at ? (
                          <span style={{ fontSize: "0.75em", color: "#10b981", display: "block", marginTop: 4 }}>
                            ✓ Alert emailed
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!updates.length ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#9ca3af" }}>
              <p>No Google Search updates recorded yet.</p>
              <p style={{ fontSize: "0.85em" }}>
                Click &quot;Check For Updates Now&quot; above to query official Google feeds immediately.
              </p>
            </div>
          ) : null}
        </section>
      )}
    </main>
  );
}
