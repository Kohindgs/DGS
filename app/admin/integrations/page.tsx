import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { getIntegrationStatuses, getGoogleEnvDiagnostics } from "@/lib/integrations/google";

import PageHeader from "@/components/admin/PageHeader";
import GoogleIntegrationCard from "@/components/admin/GoogleIntegrationCard";

export const dynamic = "force-dynamic";

export default async function AdminIntegrationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "integrations", "view")) {
    redirect("/admin/");
  }

  const userCanEdit = hasPermission(currentUser.role, "integrations", "edit");
  const integrations = await getIntegrationStatuses();
  const envDiagnostics = getGoogleEnvDiagnostics();

  const gsc = integrations.find((i) => i.service === "gsc")!;
  const ga4 = integrations.find((i) => i.service === "ga4")!;
  const otherIntegrations = integrations.filter((i) => i.service !== "gsc" && i.service !== "ga4");

  const resolvedParams = searchParams ? await searchParams : {};
  const errorMessage = resolvedParams.error;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <PageHeader
        title="Google &amp; Service Integrations Hub"
        subtitle="Encrypted OAuth 2.0 token management, Google Search Console, Google Analytics 4, Gemini AI, and SMTP connectivity."
      />

      {errorMessage && (
        <div
          style={{
            padding: "14px 18px",
            background: "rgba(234, 84, 85, 0.1)",
            border: "1px solid rgba(234, 84, 85, 0.3)",
            borderRadius: "var(--dgs-radius-md)",
            color: "var(--dgs-danger)",
            fontSize: "14px",
          }}
        >
          <strong>Integration Error:</strong> {errorMessage}
        </div>
      )}

      {/* Unified Google Integration Card */}
      <GoogleIntegrationCard
        gsc={gsc}
        ga4={ga4}
        userCanEdit={userCanEdit}
        envDiagnostics={envDiagnostics}
      />

      {/* Other Service Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {otherIntegrations.map((item) => {
          const isConnected = item.status === "connected";
          const isReady = item.status === "ready_to_connect";
          const badgeClass = isConnected ? "success" : isReady ? "warning" : "danger";
          const badgeLabel = isConnected ? "CONNECTED" : isReady ? "READY TO CONNECT" : "DISCONNECTED";

          return (
            <div
              key={item.service}
              className="dgs-saas-card"
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                padding: "20px",
                backgroundColor: "var(--dgs-bg-surface)",
                border: "1px solid var(--dgs-border)",
                borderRadius: "var(--dgs-radius-md)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 650, color: "var(--dgs-text-primary)" }}>{item.name}</h3>
                <span className={`dgs-saas-chip sm ${badgeClass}`}>{badgeLabel}</span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--dgs-text-dim)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.04em" }}>
                    Service Status / Target
                  </div>
                  <div style={{ fontSize: "14px", color: "var(--dgs-text-primary)", fontWeight: 600, marginTop: "4px", wordBreak: "break-all" }}>
                    {item.propertyOrAccount || "Not configured"}
                  </div>

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
                      Last Check: {new Date(item.lastSyncAt).toLocaleString()}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--dgs-border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
