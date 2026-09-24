"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Globe,
  BarChart3,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  AlertTriangle,
  Lock,
} from "lucide-react";

type GscSite = {
  siteUrl: string;
  permissionLevel: string;
};

type Ga4Property = {
  propertyId: string;
  displayName: string;
  accountName: string;
};

type Props = {
  initialConnected: boolean;
  initialEmail: string | null;
};

export default function GoogleSetupWizard({ initialConnected, initialEmail }: Props) {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(initialConnected ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [accountEmail, setAccountEmail] = useState<string | null>(initialEmail);
  const [isConnected, setIsConnected] = useState<boolean>(initialConnected);

  const [gscSites, setGscSites] = useState<GscSite[]>([]);
  const [selectedGscSite, setSelectedGscSite] = useState<string>("https://www.dgeniussolutions.com/");
  const [customGscSite, setCustomGscSite] = useState<string>("");

  const [ga4Properties, setGa4Properties] = useState<Ga4Property[]>([]);
  const [selectedGa4Property, setSelectedGa4Property] = useState<string>("");
  const [customGa4Property, setCustomGa4Property] = useState<string>("");

  const [syncResult, setSyncResult] = useState<{
    clicks?: number;
    impressions?: number;
    sessions?: number;
    views?: number;
  } | null>(null);

  // Fetch properties once on mount or when connected
  useEffect(() => {
    async function loadProperties() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/integrations/google/properties");
        if (res.ok) {
          const data = await res.json();
          if (data.connected) {
            setIsConnected(true);
            setAccountEmail(data.accountEmail);
            setGscSites(data.gsc?.sites || []);
            if (data.gsc?.currentSite) {
              setSelectedGscSite(data.gsc.currentSite);
            } else if (data.gsc?.sites?.length > 0) {
              const matched = data.gsc.sites.find((s: GscSite) =>
                s.siteUrl.includes("dgeniussolutions.com")
              );
              setSelectedGscSite(matched ? matched.siteUrl : data.gsc.sites[0].siteUrl);
            }

            setGa4Properties(data.ga4?.properties || []);
            if (data.ga4?.currentProperty) {
              setSelectedGa4Property(data.ga4.currentProperty);
            } else if (data.ga4?.properties?.length > 0) {
              const matched = data.ga4.properties.find((p: Ga4Property) =>
                p.displayName.toLowerCase().includes("dgenius") ||
                p.displayName.toLowerCase().includes("dgs")
              );
              setSelectedGa4Property(matched ? matched.propertyId : data.ga4.properties[0].propertyId);
            }
          }
        }
      } catch (err: any) {
        console.error("Failed to load Google properties:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, []);

  const handleStartOAuth = () => {
    window.location.href = "/api/admin/integrations/google/connect";
  };

  const handleSaveAndSync = async () => {
    setSyncing(true);
    setError(null);

    const finalGsc = customGscSite.trim() || selectedGscSite;
    const finalGa4 = customGa4Property.trim() || selectedGa4Property;

    try {
      // 1. Save chosen properties
      const saveRes = await fetch("/api/admin/integrations/google/save-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gscSiteUrl: finalGsc,
          ga4PropertyId: finalGa4,
        }),
      });

      if (!saveRes.ok) {
        const errJson = await saveRes.json();
        throw new Error(errJson.error || "Failed to save properties");
      }

      // 2. Trigger sync
      const syncRes = await fetch("/api/admin/integrations/google/sync", {
        method: "POST",
      });

      if (!syncRes.ok) {
        const errJson = await syncRes.json();
        throw new Error(errJson.error || "Initial data sync failed");
      }

      const syncData = await syncRes.json();
      setSyncResult({
        clicks: syncData.gsc?.clicks ?? 0,
        impressions: syncData.gsc?.impressions ?? 0,
        sessions: syncData.ga4?.sessions ?? 0,
        views: syncData.ga4?.views ?? 0,
      });
    } catch (err: any) {
      setError(err?.message || "An error occurred during verification");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Top Header Card */}
      <div
        className="dgs-saas-card"
        style={{
          background: "linear-gradient(135deg, rgba(20, 24, 38, 0.75) 0%, rgba(13, 16, 25, 0.85) 100%)",
          borderColor: "rgba(99, 102, 241, 0.25)",
          padding: "24px 28px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span className="dgs-saas-chip info" style={{ letterSpacing: "0.06em", fontWeight: 700 }}>
                GOOGLE CLOUD PLATFORM
              </span>
              <span className="dgs-saas-chip success">OAUTH 2.0 VERIFIED</span>
            </div>
            <h1 style={{ fontSize: "1.45rem", fontWeight: 700, color: "#fff", margin: 0 }}>
              Google Search &amp; Analytics Integration Setup
            </h1>
            <p style={{ fontSize: "0.88rem", color: "var(--dgs-text-muted)", margin: "6px 0 0" }}>
              Connect Google Search Console and Google Analytics 4 via official read-only OAuth 2.0 APIs.
            </p>
          </div>
          <Link href="/admin/integrations/" className="dgs-saas-btn secondary sm">
            Cancel &amp; Return
          </Link>
        </div>

        {/* Wizard Step Progression Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "12px",
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid var(--dgs-border-subtle)",
          }}
        >
          {[
            { num: 1, title: "Account Auth", desc: "OAuth 2.0 Credentials" },
            { num: 2, title: "Search Console", desc: "Select Verified Site" },
            { num: 3, title: "Analytics 4", desc: "Select GA4 Property" },
            { num: 4, title: "Verification", desc: "Sync & Activate" },
          ].map((s) => {
            const isDone = step > s.num || (s.num === 1 && isConnected);
            const isCurrent = step === s.num;
            return (
              <div
                key={s.num}
                onClick={() => {
                  if (s.num === 1 || (s.num <= 3 && isConnected)) {
                    setStep(s.num as any);
                  }
                }}
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--dgs-radius-sm)",
                  background: isCurrent
                    ? "rgba(99, 102, 241, 0.15)"
                    : isDone
                    ? "rgba(40, 199, 111, 0.08)"
                    : "rgba(255, 255, 255, 0.02)",
                  border: `1px solid ${
                    isCurrent
                      ? "rgba(99, 102, 241, 0.45)"
                      : isDone
                      ? "rgba(40, 199, 111, 0.25)"
                      : "rgba(255, 255, 255, 0.05)"
                  }`,
                  cursor: isDone || isCurrent ? "pointer" : "default",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: 700,
                      background: isDone
                        ? "var(--dgs-success)"
                        : isCurrent
                        ? "var(--dgs-brand-purple)"
                        : "rgba(255, 255, 255, 0.1)",
                      color: "#fff",
                    }}
                  >
                    {isDone ? "✓" : s.num}
                  </div>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: isCurrent ? 700 : 600,
                      color: isCurrent ? "#fff" : isDone ? "var(--dgs-text-primary)" : "var(--dgs-text-dim)",
                    }}
                  >
                    {s.title}
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "var(--dgs-text-muted)", marginTop: "4px", paddingLeft: "30px" }}>
                  {s.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "14px 18px",
            background: "rgba(234, 84, 85, 0.1)",
            border: "1px solid rgba(234, 84, 85, 0.3)",
            borderRadius: "var(--dgs-radius-md)",
            color: "var(--dgs-danger)",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Account Authorization */}
      {step === 1 && (
        <div className="dgs-saas-card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(99, 102, 241, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--dgs-brand-purple)",
              }}
            >
              <Lock size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", margin: 0 }}>
                Step 1: Authenticate Google Account
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
                Grant read-only access to Webmasters and Google Analytics reporting for your domain.
              </p>
            </div>
          </div>

          <div
            style={{
              padding: "18px 20px",
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: "var(--dgs-radius-md)",
              border: "1px solid var(--dgs-border-subtle)",
              marginBottom: "24px",
            }}
          >
            <h4 style={{ fontSize: "13px", color: "var(--dgs-text-main)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px 0" }}>
              Scopes Requested (Read-Only Safety Guarantee)
            </h4>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--dgs-text-muted)", fontSize: "13px", display: "grid", gap: "6px" }}>
              <li><code>https://www.googleapis.com/auth/webmasters.readonly</code> — Read search clicks, impressions, queries, and indexed pages.</li>
              <li><code>https://www.googleapis.com/auth/analytics.readonly</code> — Read GA4 active users, sessions, views, and engagement metrics.</li>
              <li><code>https://www.googleapis.com/auth/userinfo.email</code> — Verify authenticated Google account identity.</li>
            </ul>
          </div>

          {isConnected ? (
            <div
              style={{
                padding: "16px 20px",
                background: "rgba(40, 199, 111, 0.08)",
                border: "1px solid rgba(40, 199, 111, 0.25)",
                borderRadius: "var(--dgs-radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <CheckCircle2 size={24} style={{ color: "var(--dgs-success)" }} />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>
                    Connected Account: {accountEmail || "Google Account Authorized"}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
                    AES-256-GCM encrypted refresh token active.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleStartOAuth}
                className="dgs-saas-btn secondary sm"
              >
                Switch Account
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: "24px" }}>
              <button
                type="button"
                onClick={handleStartOAuth}
                className="dgs-saas-btn primary"
                style={{ width: "100%", padding: "14px", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
              >
                <Globe size={18} />
                <span>Connect Google Account via OAuth 2.0</span>
              </button>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              disabled={!isConnected}
              onClick={() => setStep(2)}
              className="dgs-saas-btn primary"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span>Continue to Search Console</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Google Search Console Selection */}
      {step === 2 && (
        <div className="dgs-saas-card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(0, 207, 232, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--dgs-brand-cyan)",
              }}
            >
              <Globe size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", margin: 0 }}>
                Step 2: Select Google Search Console Property
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
                Choose the verified site property to monitor clicks, impressions, and query rankings.
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--dgs-text-muted)" }}>
              <RefreshCw size={24} className="spin" style={{ margin: "0 auto 12px" }} />
              <div>Fetching verified sites from Google Webmasters API...</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              {gscSites.length > 0 ? (
                gscSites.map((site) => {
                  const isSelected = selectedGscSite === site.siteUrl && !customGscSite;
                  return (
                    <label
                      key={site.siteUrl}
                      onClick={() => {
                        setSelectedGscSite(site.siteUrl);
                        setCustomGscSite("");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 18px",
                        borderRadius: "var(--dgs-radius-md)",
                        background: isSelected ? "rgba(0, 207, 232, 0.08)" : "rgba(255, 255, 255, 0.02)",
                        border: `1px solid ${isSelected ? "rgba(0, 207, 232, 0.4)" : "var(--dgs-border-subtle)"}`,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <input
                          type="radio"
                          name="gscSite"
                          checked={isSelected}
                          onChange={() => {}}
                          style={{ accentColor: "var(--dgs-brand-cyan)" }}
                        />
                        <div>
                          <strong style={{ fontSize: "14px", color: isSelected ? "#fff" : "var(--dgs-text-main)" }}>
                            {site.siteUrl}
                          </strong>
                          {site.siteUrl.includes("dgeniussolutions.com") && (
                            <span className="dgs-saas-chip success sm" style={{ marginLeft: "10px" }}>
                              RECOMMENDED
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="dgs-saas-chip neutral sm">{site.permissionLevel}</span>
                    </label>
                  );
                })
              ) : (
                <div
                  style={{
                    padding: "16px 20px",
                    background: "rgba(255, 159, 67, 0.08)",
                    border: "1px solid rgba(255, 159, 67, 0.25)",
                    borderRadius: "var(--dgs-radius-md)",
                    fontSize: "13px",
                    color: "var(--dgs-warning)",
                  }}
                >
                  No verified Search Console sites found on this Google account. You can manually enter your site URL below.
                </div>
              )}

              {/* Custom site fallback */}
              <div style={{ marginTop: "12px" }}>
                <label style={{ fontSize: "12px", color: "var(--dgs-text-muted)", marginBottom: "6px", display: "block" }}>
                  Or enter custom Search Console Site URL:
                </label>
                <input
                  type="text"
                  placeholder="https://www.dgeniussolutions.com/ or sc-domain:dgeniussolutions.com"
                  className="dgs-saas-input"
                  value={customGscSite}
                  onChange={(e) => setCustomGscSite(e.target.value)}
                />
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="dgs-saas-btn secondary"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={!selectedGscSite && !customGscSite}
              onClick={() => setStep(3)}
              className="dgs-saas-btn primary"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span>Continue to Google Analytics 4</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Google Analytics 4 Selection */}
      {step === 3 && (
        <div className="dgs-saas-card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(255, 159, 67, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--dgs-brand-orange)",
              }}
            >
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", margin: 0 }}>
                Step 3: Select Google Analytics 4 Property
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
                Choose the GA4 property to synchronize traffic, active users, sessions, and page engagement.
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--dgs-text-muted)" }}>
              <RefreshCw size={24} className="spin" style={{ margin: "0 auto 12px" }} />
              <div>Fetching GA4 properties from Google Analytics Admin API...</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              {ga4Properties.length > 0 ? (
                ga4Properties.map((prop) => {
                  const isSelected = selectedGa4Property === prop.propertyId && !customGa4Property;
                  return (
                    <label
                      key={prop.propertyId}
                      onClick={() => {
                        setSelectedGa4Property(prop.propertyId);
                        setCustomGa4Property("");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 18px",
                        borderRadius: "var(--dgs-radius-md)",
                        background: isSelected ? "rgba(255, 159, 67, 0.08)" : "rgba(255, 255, 255, 0.02)",
                        border: `1px solid ${isSelected ? "rgba(255, 159, 67, 0.4)" : "var(--dgs-border-subtle)"}`,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <input
                          type="radio"
                          name="ga4Property"
                          checked={isSelected}
                          onChange={() => {}}
                          style={{ accentColor: "var(--dgs-brand-orange)" }}
                        />
                        <div>
                          <strong style={{ fontSize: "14px", color: isSelected ? "#fff" : "var(--dgs-text-main)" }}>
                            {prop.displayName}
                          </strong>
                          <span style={{ fontSize: "12px", color: "var(--dgs-text-dim)", marginLeft: "10px" }}>
                            Account: {prop.accountName}
                          </span>
                        </div>
                      </div>
                      <span className="dgs-saas-chip neutral sm">{prop.propertyId}</span>
                    </label>
                  );
                })
              ) : (
                <div
                  style={{
                    padding: "16px 20px",
                    background: "rgba(255, 159, 67, 0.08)",
                    border: "1px solid rgba(255, 159, 67, 0.25)",
                    borderRadius: "var(--dgs-radius-md)",
                    fontSize: "13px",
                    color: "var(--dgs-warning)",
                  }}
                >
                  No GA4 properties enumerated automatically. Enter your numeric GA4 Property ID below.
                </div>
              )}

              {/* Custom GA4 property fallback */}
              <div style={{ marginTop: "12px" }}>
                <label style={{ fontSize: "12px", color: "var(--dgs-text-muted)", marginBottom: "6px", display: "block" }}>
                  Or enter GA4 Property ID (e.g. 123456789 or properties/123456789):
                </label>
                <input
                  type="text"
                  placeholder="properties/123456789"
                  className="dgs-saas-input"
                  value={customGa4Property}
                  onChange={(e) => setCustomGa4Property(e.target.value)}
                />
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="dgs-saas-btn secondary"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={!selectedGa4Property && !customGa4Property}
              onClick={() => setStep(4)}
              className="dgs-saas-btn primary"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span>Proceed to Verification &amp; Sync</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Verification & Initial Sync */}
      {step === 4 && (
        <div className="dgs-saas-card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(40, 199, 111, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--dgs-success)",
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", margin: 0 }}>
                Step 4: Final Verification &amp; Initial Sync
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
                Confirm your configuration and trigger the first live sync with Google Cloud.
              </p>
            </div>
          </div>

          <div
            style={{
              padding: "20px",
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: "var(--dgs-radius-md)",
              border: "1px solid var(--dgs-border-subtle)",
              display: "grid",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", color: "var(--dgs-text-dim)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                Google Account
              </div>
              <div style={{ fontSize: "15px", fontWeight: 650, color: "#fff", marginTop: "2px" }}>
                {accountEmail || "Authorized Account"}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "11px", color: "var(--dgs-text-dim)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                Search Console Site
              </div>
              <div style={{ fontSize: "15px", fontWeight: 650, color: "var(--dgs-brand-cyan)", marginTop: "2px" }}>
                {customGscSite.trim() || selectedGscSite || "Not selected"}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "11px", color: "var(--dgs-text-dim)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                Google Analytics 4 Property
              </div>
              <div style={{ fontSize: "15px", fontWeight: 650, color: "var(--dgs-brand-orange)", marginTop: "2px" }}>
                {customGa4Property.trim() || selectedGa4Property || "Not selected"}
              </div>
            </div>
          </div>

          {syncResult ? (
            <div
              style={{
                padding: "20px",
                background: "rgba(40, 199, 111, 0.08)",
                border: "1px solid rgba(40, 199, 111, 0.3)",
                borderRadius: "var(--dgs-radius-md)",
                marginBottom: "24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <CheckCircle2 size={22} style={{ color: "var(--dgs-success)" }} />
                <strong style={{ fontSize: "15px", color: "#fff" }}>
                  Google Ecosystem Connected &amp; Synced Successfully!
                </strong>
              </div>
              <p style={{ fontSize: "13px", color: "var(--dgs-text-main)", margin: "0 0 16px 0" }}>
                Real data snapshot stored in CMS database cache. Zero artificial multipliers used.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
                <div style={{ padding: "12px", background: "rgba(0,0,0,0.2)", borderRadius: "6px" }}>
                  <div style={{ fontSize: "11px", color: "var(--dgs-text-muted)" }}>Search Clicks (28d)</div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginTop: "2px" }}>
                    {syncResult.clicks?.toLocaleString() ?? 0}
                  </div>
                </div>
                <div style={{ padding: "12px", background: "rgba(0,0,0,0.2)", borderRadius: "6px" }}>
                  <div style={{ fontSize: "11px", color: "var(--dgs-text-muted)" }}>Search Impressions</div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginTop: "2px" }}>
                    {syncResult.impressions?.toLocaleString() ?? 0}
                  </div>
                </div>
                <div style={{ padding: "12px", background: "rgba(0,0,0,0.2)", borderRadius: "6px" }}>
                  <div style={{ fontSize: "11px", color: "var(--dgs-text-muted)" }}>GA4 Sessions</div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginTop: "2px" }}>
                    {syncResult.sessions?.toLocaleString() ?? 0}
                  </div>
                </div>
                <div style={{ padding: "12px", background: "rgba(0,0,0,0.2)", borderRadius: "6px" }}>
                  <div style={{ fontSize: "11px", color: "var(--dgs-text-muted)" }}>GA4 Page Views</div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginTop: "2px" }}>
                    {syncResult.views?.toLocaleString() ?? 0}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: "24px" }}>
              <button
                type="button"
                disabled={syncing}
                onClick={handleSaveAndSync}
                className="dgs-saas-btn primary"
                style={{ width: "100%", padding: "14px", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
              >
                {syncing ? (
                  <>
                    <RefreshCw size={18} className="spin" />
                    <span>Synchronizing Google Search Console &amp; GA4...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Save Configuration &amp; Run Initial Sync</span>
                  </>
                )}
              </button>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              type="button"
              disabled={syncing}
              onClick={() => setStep(3)}
              className="dgs-saas-btn secondary"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <div style={{ display: "flex", gap: "10px" }}>
              <Link href="/admin/integrations/" className="dgs-saas-btn secondary">
                Integrations Hub
              </Link>
              <Link href="/admin/" className="dgs-saas-btn primary">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
