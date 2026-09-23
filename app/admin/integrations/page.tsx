import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { getIntegrationStatuses } from "@/lib/integrations/google";

export const dynamic = "force-dynamic";

export default async function AdminIntegrationsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "integrations", "view")) {
    redirect("/admin/");
  }

  const integrations = await getIntegrationStatuses();

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff", margin: 0 }}>
          Google &amp; Service Integrations Hub
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
          Encrypted OAuth token management, Google Search Console, Google Analytics 4, Gemini AI, and SMTP connectivity.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {integrations.map((item) => {
          const isConnected = item.status === "connected";
          const isReady = item.status === "ready_to_connect";
          const badgeClass = isConnected ? "success" : isReady ? "warning" : "danger";
          const badgeLabel = isConnected ? "CONNECTED" : isReady ? "READY TO CONNECT" : "DISCONNECTED";

          return (
            <div key={item.service} className="dgs-saas-card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div className="dgs-saas-card-header">
                <h3 className="dgs-saas-card-title">{item.name}</h3>
                <span className={`dgs-saas-chip ${badgeClass}`}>{badgeLabel}</span>
              </div>
              <div className="dgs-saas-card-body" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "0.82rem", color: "var(--dgs-text-dim)", textTransform: "uppercase" }}>
                    Account / Property
                  </div>
                  <div style={{ fontSize: "0.95rem", color: "#fff", fontWeight: 600, marginTop: "4px", wordBreak: "break-all" }}>
                    {item.propertyOrAccount || "Not configured"}
                  </div>

                  {item.requiredScopes && (
                    <div style={{ marginTop: "14px" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--dgs-text-dim)", textTransform: "uppercase" }}>
                        OAuth Scope (Read-Only)
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)", marginTop: "2px", wordBreak: "break-all" }}>
                        {item.requiredScopes.join(", ")}
                      </div>
                    </div>
                  )}

                  {item.missingConfig && item.missingConfig.length > 0 && (
                    <div style={{ marginTop: "14px", padding: "10px 12px", background: "rgba(255, 159, 67, 0.08)", borderRadius: "6px", border: "1px solid rgba(255, 159, 67, 0.2)" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--dgs-warning)", fontWeight: 600 }}>
                        Required Server Environment Variables:
                      </div>
                      <ul style={{ margin: "4px 0 0 16px", padding: 0, fontSize: "0.78rem", color: "var(--dgs-text-muted)" }}>
                        {item.missingConfig.map((envKey) => (
                          <li key={envKey}><code>{envKey}</code></li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.lastSyncAt && (
                    <div style={{ marginTop: "12px", fontSize: "0.78rem", color: "var(--dgs-text-muted)" }}>
                      Last Sync: {new Date(item.lastSyncAt).toLocaleString()}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--dgs-border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {item.service === "gsc" && (
                    <Link href="/admin/search-console/" className="dgs-saas-btn secondary sm">
                      Search Console &rarr;
                    </Link>
                  )}
                  {item.service === "ga4" && (
                    <Link href="/admin/analytics/" className="dgs-saas-btn secondary sm">
                      Analytics Panel &rarr;
                    </Link>
                  )}
                  {item.service === "gemini" && (
                    <Link href="/admin/assessment/" className="dgs-saas-btn secondary sm">
                      Assessment OS &rarr;
                    </Link>
                  )}
                  {item.service === "search_monitor" && (
                    <Link href="/admin/google-updates/" className="dgs-saas-btn secondary sm">
                      Updates Monitor &rarr;
                    </Link>
                  )}
                  {item.service === "smtp" && (
                    <span style={{ fontSize: "0.8rem", color: "var(--dgs-success)" }}>Active on Hostinger</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
