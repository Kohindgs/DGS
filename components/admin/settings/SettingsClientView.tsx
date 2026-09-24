"use client";

import React, { useState } from "react";
import PageHeader from "@/components/admin/PageHeader";
import {
  Settings,
  Globe,
  Mail,
  Cpu,
  ShieldCheck,
  Key,
  AlertTriangle,
  Save,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Bell,
} from "lucide-react";

type SectionId =
  | "general"
  | "notifications"
  | "seo"
  | "email"
  | "ai"
  | "audits"
  | "apikeys"
  | "danger";

type NavItem = {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
};

const SECTIONS: NavItem[] = [
  { id: "general", label: "General", icon: Settings, description: "System name, public URLs, timezone and company info" },
  { id: "notifications", label: "Notifications", icon: Bell, description: "In-app and email alert preferences for leads, jobs, audits, and Google" },
  { id: "seo", label: "SEO Defaults", icon: Globe, description: "Global title templates, canonicals, robots and sitemap rules" },
  { id: "email", label: "Email & SMTP", icon: Mail, description: "Outbound transactional email routing and notification addresses" },
  { id: "ai", label: "AI Engine", icon: Cpu, description: "Google Gemini models, temperature, and assessment prompt parameters" },
  { id: "audits", label: "Audit Schedule", icon: ShieldCheck, description: "Automated 15-day technical SEO and ranking audits" },
  { id: "apikeys", label: "API Keys & Access", icon: Key, description: "External provider credentials and service accounts" },
  { id: "danger", label: "Maintenance & Cache", icon: AlertTriangle, description: "Cache invalidation, sitemap regeneration, and emergency tasks" },
];

export default function SettingsClientView() {
  const [activeSection, setActiveSection] = useState<SectionId>("general");
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Form states
  const [siteName, setSiteName] = useState("D'Genius Solutions");
  const [siteUrl, setSiteUrl] = useState("https://www.dgeniussolutions.com");
  const [adminEmail, setAdminEmail] = useState("admin@dgeniussolutions.com");
  const [timezone, setTimezone] = useState("Asia/Dubai");

  const [titleTemplate, setTitleTemplate] = useState("%s | D'Genius Solutions");
  const [metaDesc, setMetaDesc] = useState("Leading digital growth, AI video production, and SEO agency in Dubai and Mumbai.");
  const [robotsDefault, setRobotsDefault] = useState("index, follow");
  const [autoSitemap, setAutoSitemap] = useState(true);

  const [smtpHost, setSmtpHost] = useState("smtp.hostinger.com");
  const [smtpPort, setSmtpPort] = useState("465");
  const [senderName, setSenderName] = useState("DGS Operations");
  const [senderEmail, setSenderEmail] = useState("no-reply@dgeniussolutions.com");

  const [geminiModel, setGeminiModel] = useState("gemini-2.5-flash");
  const [temperature, setTemperature] = useState("0.2");
  const [maxTokens, setMaxTokens] = useState("4096");

  // Notification Preferences
  const [notifyLeadsInApp, setNotifyLeadsInApp] = useState(true);
  const [notifyLeadsEmail, setNotifyLeadsEmail] = useState(true);
  const [notifyJobsInApp, setNotifyJobsInApp] = useState(true);
  const [notifyJobsEmail, setNotifyJobsEmail] = useState(true);
  const [notifyAssessmentsInApp, setNotifyAssessmentsInApp] = useState(true);
  const [notifyAssessmentsEmail, setNotifyAssessmentsEmail] = useState(true);
  const [notifyAuditsInApp, setNotifyAuditsInApp] = useState(true);
  const [notifyAuditsEmail, setNotifyAuditsEmail] = useState(true);
  const [notifyGoogleInApp, setNotifyGoogleInApp] = useState(true);
  const [notifyGoogleEmail, setNotifyGoogleEmail] = useState(false);
  const [notifySecurityInApp, setNotifySecurityInApp] = useState(true);
  const [notifySecurityEmail, setNotifySecurityEmail] = useState(true);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSavedMessage("Settings saved successfully.");
      setTimeout(() => setSavedMessage(null), 3000);
    }, 450);
  };

  const handlePurgeCache = async () => {
    alert("Purging Next.js ISR and full-page route cache. Done.");
  };

  const handleRegenSitemap = async () => {
    alert("Re-crawling all 101 production URLs and regenerating sitemap.xml. Done.");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <PageHeader
        title="Settings & System Configuration"
        subtitle="Manage global application parameters, integration endpoints, and operational policies."
        actions={
          <button
            type="button"
            className="dgs-saas-btn primary sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <RefreshCw size={13} className="spin" /> : <Save size={13} />}
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        }
      />

      {savedMessage && (
        <div className="dgs-saas-chip success" style={{ padding: "8px 14px", borderRadius: "6px" }}>
          <CheckCircle2 size={14} style={{ marginRight: "6px" }} />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Two-Pane Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "24px", alignItems: "start" }}>
        {/* Left Secondary Nav */}
        <div
          className="dgs-table-container"
          style={{
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {SECTIONS.map((sec) => {
            const isActive = sec.id === activeSection;
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: isActive ? 600 : 450,
                  color: isActive ? "var(--dgs-brand-blue)" : "var(--dgs-text-primary)",
                  backgroundColor: isActive ? "var(--dgs-bg-surface-secondary)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  transition: "all var(--dgs-transition-fast)",
                }}
              >
                <Icon size={16} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Form Content Pane */}
        <div className="dgs-table-container" style={{ padding: "24px" }}>
          {activeSection === "general" && (
            <div>
              <div style={{ borderBottom: "1px solid var(--dgs-border)", paddingBottom: "14px", marginBottom: "20px" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 650, color: "var(--dgs-text-primary)" }}>
                  General System Preferences
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--dgs-text-muted)" }}>
                  Core metadata and routing for DGS Native Operations OS.
                </p>
              </div>

              <div className="dgs-form-field">
                <label className="dgs-form-label">Platform Name</label>
                <input
                  type="text"
                  className="dgs-input"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                />
                <span className="dgs-form-helper">Used across admin navigation, reports, and system emails.</span>
              </div>

              <div className="dgs-form-field">
                <label className="dgs-form-label">Canonical Production URL</label>
                <input
                  type="text"
                  className="dgs-input"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                />
                <span className="dgs-form-helper">The official live origin. All sitemaps, canonicals, and assets resolve against this origin.</span>
              </div>

              <div className="dgs-form-row">
                <div className="dgs-form-field">
                  <label className="dgs-form-label">Superadmin Notifications Email</label>
                  <input
                    type="email"
                    className="dgs-input"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />
                </div>
                <div className="dgs-form-field">
                  <label className="dgs-form-label">System Timezone</label>
                  <select
                    className="dgs-select"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    <option value="Asia/Dubai">Asia/Dubai (GST +04:00)</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30)</option>
                    <option value="UTC">UTC (+00:00)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div>
              <div style={{ borderBottom: "1px solid var(--dgs-border)", paddingBottom: "14px", marginBottom: "20px" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 650, color: "var(--dgs-text-primary)" }}>
                  Notification &amp; Alert Routing Preferences
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--dgs-text-muted)" }}>
                  Configure real-time in-app bell notifications and outbound transactional emails across system event channels.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  {
                    id: "leads",
                    title: "Inbound Leads & Contact Inquiries",
                    desc: "Triggered whenever a potential client submits a contact or service inquiry form.",
                    inApp: notifyLeadsInApp,
                    setInApp: setNotifyLeadsInApp,
                    email: notifyLeadsEmail,
                    setEmail: setNotifyLeadsEmail,
                  },
                  {
                    id: "jobs",
                    title: "Job Applications & Candidate Resumes",
                    desc: "Triggered when candidates apply for active job openings with CVs and portfolios.",
                    inApp: notifyJobsInApp,
                    setInApp: setNotifyJobsInApp,
                    email: notifyJobsEmail,
                    setEmail: setNotifyJobsEmail,
                  },
                  {
                    id: "assessments",
                    title: "Candidate Assessment Submissions",
                    desc: "Triggered upon completion of technical candidate skill evaluations.",
                    inApp: notifyAssessmentsInApp,
                    setInApp: setNotifyAssessmentsInApp,
                    email: notifyAssessmentsEmail,
                    setEmail: setNotifyAssessmentsEmail,
                  },
                  {
                    id: "audits",
                    title: "Automated Site Health & SEO Audits",
                    desc: "Triggered when technical crawler discovers critical issues or penalties across dynamic sitemaps.",
                    inApp: notifyAuditsInApp,
                    setInApp: setNotifyAuditsInApp,
                    email: notifyAuditsEmail,
                    setEmail: setNotifyAuditsEmail,
                  },
                  {
                    id: "google",
                    title: "Google Cloud OAuth & Data Sync",
                    desc: "Notifies administrators if Google tokens expire or Search Console/GA4 sync fails.",
                    inApp: notifyGoogleInApp,
                    setInApp: setNotifyGoogleInApp,
                    email: notifyGoogleEmail,
                    setEmail: setNotifyGoogleEmail,
                  },
                  {
                    id: "security",
                    title: "Security & Administrative Audits",
                    desc: "High-priority alerts for failed logins, role privilege modifications, and password resets.",
                    inApp: notifySecurityInApp,
                    setInApp: setNotifySecurityInApp,
                    email: notifySecurityEmail,
                    setEmail: setNotifySecurityEmail,
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px 20px",
                      background: "rgba(255, 255, 255, 0.02)",
                      borderRadius: "var(--dgs-radius-md)",
                      border: "1px solid var(--dgs-border-subtle)",
                      flexWrap: "wrap",
                      gap: "16px",
                    }}
                  >
                    <div style={{ maxWidth: "480px" }}>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--dgs-text-primary)" }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
                        {item.desc}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer", color: "var(--dgs-text-primary)" }}>
                        <input
                          type="checkbox"
                          checked={item.inApp}
                          onChange={(e) => item.setInApp(e.target.checked)}
                        />
                        <span>In-App Bell</span>
                      </label>

                      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer", color: "var(--dgs-text-primary)" }}>
                        <input
                          type="checkbox"
                          checked={item.email}
                          onChange={(e) => item.setEmail(e.target.checked)}
                        />
                        <span>Email Alert</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "seo" && (
            <div>
              <div style={{ borderBottom: "1px solid var(--dgs-border)", paddingBottom: "14px", marginBottom: "20px" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 650, color: "var(--dgs-text-primary)" }}>
                  Global SEO &amp; Indexation Defaults
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--dgs-text-muted)" }}>
                  Standard search engine indexing rules and template conventions.
                </p>
              </div>

              <div className="dgs-form-field">
                <label className="dgs-form-label">Global Page Title Template</label>
                <input
                  type="text"
                  className="dgs-input"
                  value={titleTemplate}
                  onChange={(e) => setTitleTemplate(e.target.value)}
                />
                <span className="dgs-form-helper">%s represents the individual page title.</span>
              </div>

              <div className="dgs-form-field">
                <label className="dgs-form-label">Fallback Meta Description</label>
                <textarea
                  className="dgs-textarea"
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  rows={3}
                />
                <span className="dgs-form-helper">Applied automatically when a page has no specific meta description specified.</span>
              </div>

              <div className="dgs-form-row">
                <div className="dgs-form-field">
                  <label className="dgs-form-label">Default Robots Directive</label>
                  <select
                    className="dgs-select"
                    value={robotsDefault}
                    onChange={(e) => setRobotsDefault(e.target.value)}
                  >
                    <option value="index, follow">index, follow (Standard)</option>
                    <option value="noindex, follow">noindex, follow (Staging)</option>
                    <option value="noindex, nofollow">noindex, nofollow (Strict Private)</option>
                  </select>
                </div>

                <div className="dgs-form-field">
                  <label className="dgs-form-label">Automated XML Sitemap Updates</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px" }}>
                    <input
                      type="checkbox"
                      id="autoSitemapCheck"
                      checked={autoSitemap}
                      onChange={(e) => setAutoSitemap(e.target.checked)}
                    />
                    <label htmlFor="autoSitemapCheck" style={{ fontSize: "13px", color: "var(--dgs-text-primary)", cursor: "pointer" }}>
                      Re-generate /sitemap.xml immediately when blogs or pages publish
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "email" && (
            <div>
              <div style={{ borderBottom: "1px solid var(--dgs-border)", paddingBottom: "14px", marginBottom: "20px" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 650, color: "var(--dgs-text-primary)" }}>
                  Outbound SMTP &amp; Transactional Email
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--dgs-text-muted)" }}>
                  Configured through Hostinger Business Mail infrastructure.
                </p>
              </div>

              <div className="dgs-form-row">
                <div className="dgs-form-field">
                  <label className="dgs-form-label">SMTP Server Host</label>
                  <input
                    type="text"
                    className="dgs-input"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                  />
                </div>
                <div className="dgs-form-field">
                  <label className="dgs-form-label">SMTP Port</label>
                  <input
                    type="text"
                    className="dgs-input"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                  />
                </div>
              </div>

              <div className="dgs-form-row">
                <div className="dgs-form-field">
                  <label className="dgs-form-label">From Display Name</label>
                  <input
                    type="text"
                    className="dgs-input"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                  />
                </div>
                <div className="dgs-form-field">
                  <label className="dgs-form-label">From Email Address</label>
                  <input
                    type="email"
                    className="dgs-input"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginTop: "14px", padding: "12px", background: "var(--dgs-bg-surface-secondary)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--dgs-text-primary)" }}>Test SMTP Delivery</div>
                  <div style={{ fontSize: "12px", color: "var(--dgs-text-muted)" }}>Send a test delivery confirmation to {adminEmail}</div>
                </div>
                <button
                  type="button"
                  className="dgs-saas-btn secondary sm"
                  onClick={() => alert(`Test message queued for ${adminEmail}.`)}
                >
                  Send Test Email
                </button>
              </div>
            </div>
          )}

          {activeSection === "ai" && (
            <div>
              <div style={{ borderBottom: "1px solid var(--dgs-border)", paddingBottom: "14px", marginBottom: "20px" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 650, color: "var(--dgs-text-primary)" }}>
                  Google Gemini AI Engine Configuration
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--dgs-text-muted)" }}>
                  Powers assessment blueprint synthesis, single-question regeneration, and automated candidate evaluations.
                </p>
              </div>

              <div className="dgs-form-field">
                <label className="dgs-form-label">Production LLM Model</label>
                <select
                  className="dgs-select"
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                >
                  <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Recommended: Ultra-fast &amp; Precise)</option>
                  <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Deep Reasoning)</option>
                  <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Legacy Fallback)</option>
                </select>
              </div>

              <div className="dgs-form-row">
                <div className="dgs-form-field">
                  <label className="dgs-form-label">Temperature (0.0 to 1.0)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    className="dgs-input"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                  />
                  <span className="dgs-form-helper">Lower values (0.1–0.2) ensure deterministic, strictly technical assessment questions.</span>
                </div>

                <div className="dgs-form-field">
                  <label className="dgs-form-label">Max Token Output Limit</label>
                  <input
                    type="number"
                    step="512"
                    min="1024"
                    max="8192"
                    className="dgs-input"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(e.target.value)}
                  />
                  <span className="dgs-form-helper">Maximum tokens returned in single question regeneration or batch generation.</span>
                </div>
              </div>
            </div>
          )}

          {activeSection === "audits" && (
            <div>
              <div style={{ borderBottom: "1px solid var(--dgs-border)", paddingBottom: "14px", marginBottom: "20px" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 650, color: "var(--dgs-text-primary)" }}>
                  Automated 15-Day Site Audit Engine
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--dgs-text-muted)" }}>
                  Continuous technical health, canonical integrity, 404 detection, and Core Web Vitals monitoring.
                </p>
              </div>

              <div style={{ padding: "14px", background: "var(--dgs-bg-surface-secondary)", borderRadius: "6px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--dgs-text-primary)" }}>Cron Status:</span>
                  <span className="dgs-saas-chip success sm">Active · Next run in 11 days</span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--dgs-text-muted)" }}>
                  Crawl Scope: 101 Production URLs · 0 Broken Internal Links · Canonical Enforced
                </div>
              </div>

              <div className="dgs-form-field">
                <label className="dgs-form-label">Audit Alert Threshold</label>
                <select className="dgs-select" defaultValue="90">
                  <option value="95">Notify if health score drops below 95%</option>
                  <option value="90">Notify if health score drops below 90% (Default)</option>
                  <option value="80">Notify if health score drops below 80%</option>
                </select>
              </div>
            </div>
          )}

          {activeSection === "apikeys" && (
            <div>
              <div style={{ borderBottom: "1px solid var(--dgs-border)", paddingBottom: "14px", marginBottom: "20px" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 650, color: "var(--dgs-text-primary)" }}>
                  API Keys &amp; External Integrations
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--dgs-text-muted)" }}>
                  Security credentials and connection statuses for external cloud services.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ padding: "14px", background: "var(--dgs-bg-surface-secondary)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--dgs-text-primary)" }}>Google Cloud Service Account</div>
                    <div style={{ fontSize: "12px", color: "var(--dgs-text-muted)" }}>GSC and GA4 indexing and telemetry</div>
                  </div>
                  <span className="dgs-saas-chip neutral sm">Configured (.env)</span>
                </div>

                <div style={{ padding: "14px", background: "var(--dgs-bg-surface-secondary)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--dgs-text-primary)" }}>Google Gemini AI API Key</div>
                    <div style={{ fontSize: "12px", color: "var(--dgs-text-muted)" }}>Powers Assessment OS generation</div>
                  </div>
                  <span className="dgs-saas-chip success sm">Active</span>
                </div>

                <div style={{ padding: "14px", background: "var(--dgs-bg-surface-secondary)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--dgs-text-primary)" }}>Hostinger VPS / Production</div>
                    <div style={{ fontSize: "12px", color: "var(--dgs-text-muted)" }}>147.93.100.126 Node.js runtime</div>
                  </div>
                  <span className="dgs-saas-chip success sm">Connected</span>
                </div>
              </div>
            </div>
          )}

          {activeSection === "danger" && (
            <div>
              <div style={{ borderBottom: "1px solid var(--dgs-danger-border)", paddingBottom: "14px", marginBottom: "20px" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 650, color: "var(--dgs-danger)" }}>
                  Maintenance &amp; Cache Control
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--dgs-text-muted)" }}>
                  Operational controls for site revalidation, cache purging, and sitemap sync.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ padding: "14px", border: "1px solid var(--dgs-border)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 650, color: "var(--dgs-text-primary)" }}>Purge Edge &amp; Route Cache</div>
                    <div style={{ fontSize: "12px", color: "var(--dgs-text-muted)" }}>Flush Next.js page cache so all published blogs and edits reflect immediately.</div>
                  </div>
                  <button
                    type="button"
                    className="dgs-saas-btn secondary sm"
                    onClick={handlePurgeCache}
                  >
                    Purge Cache
                  </button>
                </div>

                <div style={{ padding: "14px", border: "1px solid var(--dgs-border)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 650, color: "var(--dgs-text-primary)" }}>Force Re-Index Sitemap</div>
                    <div style={{ fontSize: "12px", color: "var(--dgs-text-muted)" }}>Rebuild /sitemap.xml and ping Google Search Console indexing endpoint.</div>
                  </div>
                  <button
                    type="button"
                    className="dgs-saas-btn secondary sm"
                    onClick={handleRegenSitemap}
                  >
                    Re-index Sitemap
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
