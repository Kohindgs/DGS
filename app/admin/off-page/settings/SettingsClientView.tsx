"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  ShieldCheck,
  Globe,
  Sliders,
  BellRing,
  Sparkles,
  Save,
  CheckCircle2,
  Activity,
  RefreshCw,
  AlertCircle,
  Cpu,
  Database,
  FileSpreadsheet,
  Plus,
  Trash2,
  ExternalLink,
} from "lucide-react";
import type { ProviderHealth } from "@/lib/off-page/providers/types";

interface Props {
  initialSettings?: Record<string, string>;
}

export default function SettingsClientView({ initialSettings }: Props) {
  const [settings, setSettings] = useState<Record<string, string>>(
    initialSettings || {
      daily_discovery_enabled: "true",
      auto_revalidation_enabled: "true",
      spam_risk_threshold: "40",
      exact_match_alert_pct: "20",
      default_outreach_followup_days: "5",
      primary_regions: "INDIA,UAE,USA",
      free_only_enforcement: "true",
    }
  );
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Provider Health Matrix State (Section 40 & 41)
  const [providers, setProviders] = useState<ProviderHealth[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  const fetchProviders = async () => {
    setLoadingProviders(true);
    try {
      const res = await fetch("/api/admin/off-page/providers");
      const json = await res.json();
      if (json.ok && Array.isArray(json.providers)) {
        setProviders(json.providers);
      }
    } catch (err) {
      console.error("Failed fetching providers:", err);
    } finally {
      setLoadingProviders(false);
    }
  };

  // Google Sheets Integration State
  const [sheetConnections, setSheetConnections] = useState<any[]>([]);
  const [syncHistory, setSyncHistory] = useState<any[]>([]);
  const [loadingSheets, setLoadingSheets] = useState(false);
  const [showAddSheetModal, setShowAddSheetModal] = useState(false);
  const [newSheetName, setNewSheetName] = useState("");
  const [newSheetUrl, setNewSheetUrl] = useState("");
  const [newSheetTab, setNewSheetTab] = useState("");
  const [newSheetAutoSync, setNewSheetAutoSync] = useState(true);
  const [addingSheet, setAddingSheet] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const fetchSheetConnections = async () => {
    setLoadingSheets(true);
    try {
      const res = await fetch("/api/admin/off-page/integrations/google-sheets");
      const json = await res.json();
      if (json.success) {
        setSheetConnections(json.connections || []);
        setSyncHistory(json.history || []);
      }
    } catch (err) {
      console.error("Failed fetching sheet connections:", err);
    } finally {
      setLoadingSheets(false);
    }
  };

  const handleAddSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSheetName || !newSheetUrl) return;
    setAddingSheet(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/off-page/integrations/google-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name: newSheetName,
          sheetUrl: newSheetUrl,
          tabName: newSheetTab || undefined,
          autoSyncEnabled: newSheetAutoSync,
          syncIntervalHours: 24,
          autoVerify: true,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback("Google Sheet connection registered successfully.");
        setShowAddSheetModal(false);
        setNewSheetName("");
        setNewSheetUrl("");
        setNewSheetTab("");
        await fetchSheetConnections();
      } else {
        setFeedback(`Failed to connect sheet: ${json.error}`);
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setAddingSheet(false);
    }
  };

  const handleSyncSheet = async (connectionId: string) => {
    setSyncingId(connectionId);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/off-page/integrations/google-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync", connectionId }),
      });

      const json = await res.json();
      if (json.success && json.result) {
        const r = json.result;
        setFeedback(
          `Sheet synced successfully: ${r.insertedCount} inserted, ${r.updatedCount} updated, ${r.mismatchesDetected} mismatches found.`
        );
        await fetchSheetConnections();
      } else {
        setFeedback(`Sync failed: ${json.error}`);
      }
    } catch (err: any) {
      setFeedback(`Sync error: ${err.message}`);
    } finally {
      setSyncingId(null);
    }
  };

  const handleDeleteSheet = async (connectionId: string) => {
    if (!confirm("Are you sure you want to delete this sheet connection?")) return;
    try {
      const res = await fetch("/api/admin/off-page/integrations/google-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", connectionId }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback("Sheet connection removed.");
        await fetchSheetConnections();
      }
    } catch (err) {
      console.error("Delete sheet error:", err);
    }
  };

  useEffect(() => {
    fetchProviders();
    fetchSheetConnections();
  }, []);

  const handleChange = (key: string, val: string) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/off-page/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.ok) {
        setFeedback("Off-Page Engine settings updated successfully.");
      } else {
        setFeedback(`Failed to update settings: ${json.error}`);
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top Banner */}
      <div
        className="dgs-saas-card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          padding: "16px 20px",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
            Off-Page SEO Engine Settings & Governance
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
            Configure free-tier enforcement rules, anti-spam thresholds, Penguin safety caps, and scheduled automation schedules.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="dgs-saas-btn primary"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <Save size={14} />
          {saving ? "Saving..." : "Save Configuration"}
        </button>
      </div>

      {feedback && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: "var(--dgs-radius-md)",
            background: "rgba(0, 198, 255, 0.15)",
            border: "1px solid var(--dgs-brand-cyan)",
            color: "#fff",
            fontSize: "0.84rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Sparkles size={16} color="var(--dgs-brand-cyan)" />
          {feedback}
        </div>
      )}

      {/* Settings Form Grid */}
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Section 1: Strict Free Tier & Policy Guard */}
        <div className="dgs-saas-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <ShieldCheck size={18} color="#10b981" />
            <h3 style={{ margin: 0, color: "#fff", fontSize: "1rem" }}>
              1. Free-Tier Safeguards & Policy Enforcement
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={settings.free_only_enforcement === "true"}
                onChange={(e) => handleChange("free_only_enforcement", e.target.checked ? "true" : "false")}
                style={{ marginTop: "3px" }}
              />
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 650, color: "#fff" }}>
                  Enforce Strict Free-Tier Policy by Default
                </div>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                  Excludes paid links, PBNs, link farms, sponsored posts, and auto-submitting directories. Any listing requiring payment is automatically tagged NOT_FREE and excluded from active queues.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Section 2: Regional Market Focus */}
        <div className="dgs-saas-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Globe size={18} color="var(--dgs-brand-cyan)" />
            <h3 style={{ margin: 0, color: "#fff", fontSize: "1rem" }}>
              2. Regional Market Targeting
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", color: "rgba(255,255,255,0.8)", marginBottom: "6px" }}>
                Active Geographic Priorities:
              </label>
              <input
                type="text"
                value={settings.primary_regions || "INDIA,UAE,USA"}
                onChange={(e) => handleChange("primary_regions", e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "0.85rem",
                }}
              />
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>
                Comma-separated (Primary: INDIA, UAE, USA. China/Russia excluded by default).
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", color: "rgba(255,255,255,0.8)", marginBottom: "6px" }}>
                Outreach Follow-Up Interval:
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.default_outreach_followup_days || "5"}
                  onChange={(e) => handleChange("default_outreach_followup_days", e.target.value)}
                  style={{
                    width: "80px",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    background: "#1f2937",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontSize: "0.85rem",
                  }}
                />
                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>Days between follow-ups</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Risk Thresholds & Penguin Safeguards */}
        <div className="dgs-saas-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Sliders size={18} color="#f59e0b" />
            <h3 style={{ margin: 0, color: "#fff", fontSize: "1rem" }}>
              3. Algorithm Safeguards & Risk Thresholds
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", color: "rgba(255,255,255,0.8)", marginBottom: "6px" }}>
                Penguin Exact-Match Alert Threshold (%):
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={settings.exact_match_alert_pct || "20"}
                  onChange={(e) => handleChange("exact_match_alert_pct", e.target.value)}
                  style={{
                    width: "80px",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    background: "#1f2937",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontSize: "0.85rem",
                  }}
                />
                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>
                  Trigger warning banner if exact match exceeds this % (Google benchmark &lt; 20%)
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", color: "rgba(255,255,255,0.8)", marginBottom: "6px" }}>
                Maximum Spam Risk Score (0-100):
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="number"
                  min="10"
                  max="80"
                  value={settings.spam_risk_threshold || "40"}
                  onChange={(e) => handleChange("spam_risk_threshold", e.target.value)}
                  style={{
                    width: "80px",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    background: "#1f2937",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontSize: "0.85rem",
                  }}
                />
                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>
                  Automatically reject opportunities exceeding this score
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Automation Schedulers */}
        <div className="dgs-saas-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <BellRing size={18} color="#c084fc" />
            <h3 style={{ margin: 0, color: "#fff", fontSize: "1rem" }}>
              4. Automation & Daily Crawler Tasks
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={settings.daily_discovery_enabled === "true"}
                onChange={(e) => handleChange("daily_discovery_enabled", e.target.checked ? "true" : "false")}
              />
              <span style={{ fontSize: "0.85rem", color: "#fff" }}>
                Enable Daily Free Opportunity Discovery Sweep
              </span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={settings.auto_revalidation_enabled === "true"}
                onChange={(e) => handleChange("auto_revalidation_enabled", e.target.checked ? "true" : "false")}
              />
              <span style={{ fontSize: "0.85rem", color: "#fff" }}>
                Enable Automated Live HTTP Backlink Status Verification
              </span>
            </label>
          </div>
        </div>

        {/* Section 5: Google Sheets & Live Spreadsheet Sync Connections */}
        <div
          className="dgs-saas-card"
          style={{
            padding: "24px",
            background: "rgba(16, 185, 129, 0.03)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FileSpreadsheet size={18} style={{ color: "#10b981" }} />
              <h3 style={{ margin: 0, color: "#fff", fontSize: "1rem" }}>
                5. Google Sheets Sync & Live Internal Data Ingestion
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAddSheetModal(true)}
              className="dgs-saas-btn primary"
              style={{ fontSize: "0.78rem", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Plus size={14} /> Connect Google Sheet
            </button>
          </div>

          <p style={{ margin: "0 0 16px 0", fontSize: "0.8rem", color: "rgba(255,255,255,0.65)" }}>
            Connect Google Spreadsheets containing team backlinks, guest post trackers, or agency link records. Changes are ingested non-destructively, preserving human notes while evaluating live crawler status.
          </p>

          {loadingSheets ? (
            <div style={{ padding: "20px", textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: "0.82rem" }}>
              <RefreshCw size={16} className="animate-spin" style={{ margin: "0 auto 6px auto" }} />
              Loading sheet connections...
            </div>
          ) : sheetConnections.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px", color: "rgba(255, 255, 255, 0.5)", fontSize: "0.84rem" }}>
              No Google Sheet connections configured yet. Click &ldquo;Connect Google Sheet&rdquo; above to link your first spreadsheet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {sheetConnections.map((conn) => (
                <div
                  key={conn.id}
                  style={{
                    padding: "14px 18px",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: 650, color: "#fff", fontSize: "0.9rem" }}>{conn.name}</span>
                      <span className="dgs-saas-chip primary" style={{ fontSize: "0.68rem" }}>
                        {conn.tab_name || "Sheet1"}
                      </span>
                      {conn.last_sync_status && (
                        <span
                          className={`dgs-saas-chip ${
                            conn.last_sync_status === "SUCCESS" ? "success" : "warning"
                          }`}
                          style={{ fontSize: "0.68rem" }}
                        >
                          {conn.last_sync_status}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)", marginTop: "4px" }}>
                      Last Synced: {conn.last_synced_at ? new Date(conn.last_synced_at).toLocaleString() : "Never"} • Rows: {conn.total_rows_synced}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => handleSyncSheet(conn.id)}
                      disabled={syncingId === conn.id}
                      className="dgs-saas-btn secondary"
                      style={{ fontSize: "0.75rem", padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: "5px" }}
                    >
                      <RefreshCw size={12} className={syncingId === conn.id ? "animate-spin" : ""} />
                      {syncingId === conn.id ? "Syncing..." : "Sync Now"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSheet(conn.id)}
                      className="dgs-saas-btn danger"
                      style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                      title="Delete connection"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 6: Provider Health Matrix & Architecture (Sections 40 & 41) */}
        <div
          className="dgs-saas-card"
          style={{
            padding: "24px",
            background: "linear-gradient(135deg, rgba(0, 198, 255, 0.03) 0%, rgba(112, 0, 255, 0.03) 100%)",
            border: "1px solid rgba(0, 198, 255, 0.2)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Activity size={18} color="var(--dgs-brand-cyan)" />
              <h3 style={{ margin: 0, color: "#fff", fontSize: "1rem" }}>
                6. Provider Health Matrix (10 Core Subsystems)
              </h3>
            </div>
            <button
              type="button"
              onClick={fetchProviders}
              disabled={loadingProviders}
              className="dgs-saas-btn secondary"
              style={{ fontSize: "0.74rem", padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: "5px" }}
            >
              <RefreshCw size={12} className={loadingProviders ? "animate-spin" : ""} />
              Refresh Health Matrix
            </button>
          </div>

          <p style={{ margin: "0 0 16px 0", fontSize: "0.78rem", color: "rgba(255,255,255,0.6)" }}>
            Real-time status of all external discovery crawlers, search APIs, databases, and semantic intelligence layers. Unconfigured providers are explicitly declared with zero synthetic mock data.
          </p>

          {loadingProviders ? (
            <div style={{ padding: "20px", textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: "0.82rem" }}>
              <RefreshCw size={18} className="animate-spin" style={{ margin: "0 auto 6px auto" }} />
              Auditing provider connections...
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {providers.map((p) => {
                const isPass = p.status === "ACTIVE";
                const isWarn = p.status === "DEGRADED" || p.status === "NOT_CONFIGURED";
                const badgeColor = isPass ? "#34d399" : isWarn ? "#fbbf24" : "#f87171";
                const badgeBg = isPass ? "rgba(16, 185, 129, 0.15)" : isWarn ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)";
                return (
                  <div
                    key={p.id}
                    style={{
                      padding: "12px 16px",
                      borderRadius: "6px",
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: 650, color: "#fff", fontSize: "0.86rem" }}>{p.name}</span>
                        <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                          [{p.type}]
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "4px",
                          background: badgeBg,
                          color: badgeColor,
                        }}
                      >
                        {p.status === "ACTIVE" ? "● ACTIVE" : p.status === "NOT_CONFIGURED" ? "○ NOT CONFIGURED" : p.status}
                      </span>
                    </div>

                    <div style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.65)", display: "flex", flexWrap: "wrap", gap: "16px" }}>
                      {p.lastSuccess && (
                        <span>
                          Last Success: <strong style={{ color: "#34d399" }}>{new Date(p.lastSuccess).toLocaleTimeString()}</strong>
                        </span>
                      )}
                      {p.lastResultCount !== undefined && (
                        <span>
                          Last Result Count: <strong style={{ color: "#fff" }}>{p.lastResultCount}</strong>
                        </span>
                      )}
                      {p.lastError && (
                        <span>
                          Last Error: <strong style={{ color: "#f87171" }}>{p.lastError}</strong>
                        </span>
                      )}
                    </div>

                    {p.reason && (
                      <div style={{ fontSize: "0.74rem", color: isWarn ? "#fbbf24" : "rgba(255,255,255,0.5)", marginTop: "2px" }}>
                        {p.reason}
                      </div>
                    )}

                    {p.requiredConfig && p.requiredConfig.length > 0 && (
                      <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>
                        Required: <code style={{ color: "#60a5fa" }}>{p.requiredConfig.join(", ")}</code>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={saving}
            className="dgs-saas-btn primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Save size={14} />
            {saving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </form>

      {/* ADD GOOGLE SHEET MODAL */}
      {showAddSheetModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            className="dgs-saas-card"
            style={{
              width: "100%",
              maxWidth: "520px",
              padding: "24px",
              background: "#111827",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileSpreadsheet size={20} style={{ color: "#10b981" }} />
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#fff" }}>
                  Connect Google Spreadsheet
                </h3>
              </div>
              <button
                onClick={() => setShowAddSheetModal(false)}
                style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSheet} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)", marginBottom: "4px" }}>
                  Connection Name:
                </label>
                <input
                  type="text"
                  className="dgs-saas-input"
                  placeholder="e.g. Master Backlinks Tracker 2026"
                  value={newSheetName}
                  onChange={(e) => setNewSheetName(e.target.value)}
                  required
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)", marginBottom: "4px" }}>
                  Google Spreadsheet URL:
                </label>
                <input
                  type="url"
                  className="dgs-saas-input"
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit#gid=0"
                  value={newSheetUrl}
                  onChange={(e) => setNewSheetUrl(e.target.value)}
                  required
                  style={{ width: "100%" }}
                />
                <span style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.5)", marginTop: "2px", display: "block" }}>
                  Ensure sheet is shared with link or published to web for automated CSV extraction.
                </span>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)", marginBottom: "4px" }}>
                  Tab Name (Optional):
                </label>
                <input
                  type="text"
                  className="dgs-saas-input"
                  placeholder="e.g. Live Links (defaults to first tab)"
                  value={newSheetTab}
                  onChange={(e) => setNewSheetTab(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  id="sheetAutoSync"
                  checked={newSheetAutoSync}
                  onChange={(e) => setNewSheetAutoSync(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "#10b981", cursor: "pointer" }}
                />
                <label htmlFor="sheetAutoSync" style={{ fontSize: "0.82rem", color: "#e2e8f0", cursor: "pointer" }}>
                  Enable Daily Automated Sync (Runs during scheduled off-page cron)
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddSheetModal(false)}
                  className="dgs-saas-btn secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingSheet}
                  className="dgs-saas-btn primary"
                >
                  {addingSheet ? "Connecting..." : "Connect Sheet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

