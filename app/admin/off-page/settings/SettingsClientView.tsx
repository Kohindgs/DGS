"use client";

import React, { useState } from "react";
import {
  Settings,
  ShieldCheck,
  Globe,
  Sliders,
  BellRing,
  Sparkles,
  Save,
  CheckCircle2,
} from "lucide-react";

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
    </div>
  );
}
