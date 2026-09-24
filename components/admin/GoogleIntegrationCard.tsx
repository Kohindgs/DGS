"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Globe,
  BarChart3,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sliders,
  LogOut,
  Info,
  Copy,
  Check,
} from "lucide-react";
import type { IntegrationStatus } from "@/lib/integrations/google";

type Props = {
  gsc: IntegrationStatus;
  ga4: IntegrationStatus;
  userCanEdit: boolean;
};

export default function GoogleIntegrationCard({ gsc, ga4, userCanEdit }: Props) {
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedUri, setCopiedUri] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  const isConnected = gsc.status === "connected" || ga4.status === "connected";
  const accountEmail = gsc.accountEmail || ga4.accountEmail;
  const redirectUri = "https://www.dgeniussolutions.com/api/admin/integrations/google/callback";

  const handleCopyUri = () => {
    navigator.clipboard.writeText(redirectUri);
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 2500);
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncMessage(null);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/integrations/google/sync", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Sync failed");
      }
      setSyncMessage(
        `Synchronized successfully! GSC Clicks: ${data.gsc?.clicks ?? 0}, GA4 Sessions: ${data.ga4?.sessions ?? 0}`
      );
      setTimeout(() => setSyncMessage(null), 6000);
    } catch (err: any) {
      setErrorMessage(err?.message || "Sync encountered an error");
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect Google Search Console and Google Analytics 4? This will remove saved OAuth tokens.")) {
      return;
    }
    setDisconnecting(true);
    try {
      const res = await fetch("/api/admin/integrations/google/disconnect", {
        method: "POST",
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err: any) {
      alert("Failed to disconnect: " + err.message);
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div
      className="dgs-saas-card"
      style={{
        gridColumn: "1 / -1",
        background: "linear-gradient(135deg, rgba(20, 24, 38, 0.7) 0%, rgba(11, 14, 23, 0.8) 100%)",
        borderColor: isConnected ? "rgba(40, 199, 111, 0.3)" : "rgba(99, 102, 241, 0.3)",
        padding: "24px 28px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span className="dgs-saas-chip info" style={{ fontWeight: 700, letterSpacing: "0.06em" }}>
              UNIFIED GOOGLE ENGINE
            </span>
            <span className={`dgs-saas-chip ${isConnected ? "success" : "neutral"}`}>
              {isConnected ? "CONNECTED & ENCRYPTED" : "OAUTH PENDING"}
            </span>
          </div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            Google Cloud Platform Integration
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
            Google Search Console (organic rank, CTR, impressions) &amp; Google Analytics 4 (traffic, user engagement)
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={() => setShowDocs(!showDocs)}
            className="dgs-saas-btn secondary sm"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Info size={14} />
            <span>Superadmin Setup Docs</span>
          </button>

          {isConnected ? (
            <>
              <button
                type="button"
                disabled={syncing}
                onClick={handleSyncNow}
                className="dgs-saas-btn primary sm"
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <RefreshCw size={14} className={syncing ? "spin" : ""} />
                <span>{syncing ? "Syncing..." : "Sync Now"}</span>
              </button>
              {userCanEdit && (
                <>
                  <Link
                    href="/admin/integrations/google/setup/"
                    className="dgs-saas-btn secondary sm"
                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <Sliders size={14} />
                    <span>Configure</span>
                  </Link>
                  <button
                    type="button"
                    disabled={disconnecting}
                    onClick={handleDisconnect}
                    className="dgs-saas-btn danger sm"
                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <LogOut size={14} />
                    <span>Disconnect</span>
                  </button>
                </>
              )}
            </>
          ) : (
            userCanEdit && (
              <a
                href="/api/admin/integrations/google/connect"
                className="dgs-saas-btn primary sm"
                style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 650 }}
              >
                <Globe size={15} />
                <span>Connect Google</span>
              </a>
            )
          )}
        </div>
      </div>

      {syncMessage && (
        <div
          style={{
            marginTop: "16px",
            padding: "10px 14px",
            background: "rgba(40, 199, 111, 0.1)",
            border: "1px solid rgba(40, 199, 111, 0.3)",
            borderRadius: "var(--dgs-radius-sm)",
            color: "var(--dgs-success)",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CheckCircle2 size={16} />
          <span>{syncMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            marginTop: "16px",
            padding: "10px 14px",
            background: "rgba(234, 84, 85, 0.1)",
            border: "1px solid rgba(234, 84, 85, 0.3)",
            borderRadius: "var(--dgs-radius-sm)",
            color: "var(--dgs-danger)",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Property Details Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
          marginTop: "20px",
          paddingTop: "20px",
          borderTop: "1px solid var(--dgs-border-subtle)",
        }}
      >
        {/* Account Info */}
        <div style={{ padding: "14px 16px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "var(--dgs-radius-sm)", border: "1px solid var(--dgs-border-subtle)" }}>
          <div style={{ fontSize: "11px", color: "var(--dgs-text-dim)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
            Authorized Account
          </div>
          <div style={{ fontSize: "14px", fontWeight: 650, color: "#fff", marginTop: "4px" }}>
            {accountEmail || "None connected"}
          </div>
          <div style={{ fontSize: "12px", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
            {isConnected ? "Tokens stored in AES-256-GCM cipher" : "Click 'Connect Google' to authorize"}
          </div>
        </div>

        {/* GSC Property */}
        <div style={{ padding: "14px 16px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "var(--dgs-radius-sm)", border: "1px solid var(--dgs-border-subtle)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "var(--dgs-text-dim)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
              Search Console Site
            </span>
            <Link href="/admin/search-console/" style={{ fontSize: "11px", color: "var(--dgs-brand-cyan)", display: "flex", alignItems: "center", gap: "2px" }}>
              <span>Dashboard</span>
              <ExternalLink size={10} />
            </Link>
          </div>
          <div style={{ fontSize: "14px", fontWeight: 650, color: "var(--dgs-brand-cyan)", marginTop: "4px", wordBreak: "break-all" }}>
            {gsc.propertyOrAccount || "https://www.dgeniussolutions.com/"}
          </div>
          <div style={{ fontSize: "12px", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
            Last Sync: {gsc.lastSyncAt ? new Date(gsc.lastSyncAt).toLocaleString() : "Never synced"}
          </div>
        </div>

        {/* GA4 Property */}
        <div style={{ padding: "14px 16px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "var(--dgs-radius-sm)", border: "1px solid var(--dgs-border-subtle)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "var(--dgs-text-dim)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
              GA4 Property
            </span>
            <Link href="/admin/analytics/" style={{ fontSize: "11px", color: "var(--dgs-brand-orange)", display: "flex", alignItems: "center", gap: "2px" }}>
              <span>Dashboard</span>
              <ExternalLink size={10} />
            </Link>
          </div>
          <div style={{ fontSize: "14px", fontWeight: 650, color: "var(--dgs-brand-orange)", marginTop: "4px" }}>
            {ga4.propertyOrAccount || "Not configured"}
          </div>
          <div style={{ fontSize: "12px", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
            Last Sync: {ga4.lastSyncAt ? new Date(ga4.lastSyncAt).toLocaleString() : "Never synced"}
          </div>
        </div>
      </div>

      {/* Superadmin Setup Documentation Box */}
      {showDocs && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "var(--dgs-radius-md)",
            border: "1px solid var(--dgs-border)",
          }}
        >
          <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: "0 0 10px 0" }}>
            Google Cloud Console OAuth 2.0 Credentials Setup
          </h4>
          <ol style={{ margin: 0, paddingLeft: "20px", color: "var(--dgs-text-main)", fontSize: "13px", display: "grid", gap: "8px" }}>
            <li>
              Go to <strong>Google Cloud Console</strong> &rarr; <strong>APIs &amp; Services</strong> &rarr; <strong>Credentials</strong>.
            </li>
            <li>
              Enable <strong>Google Search Console API</strong> and <strong>Google Analytics Admin &amp; Data APIs</strong>.
            </li>
            <li>
              Create an <strong>OAuth 2.0 Client ID</strong> (Web Application).
            </li>
            <li>
              Add the following to <strong>Authorized Redirect URIs</strong>:
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                <code style={{ background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>
                  {redirectUri}
                </code>
                <button
                  type="button"
                  onClick={handleCopyUri}
                  className="dgs-saas-btn secondary sm"
                  style={{ padding: "3px 8px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  {copiedUri ? <Check size={12} style={{ color: "var(--dgs-success)" }} /> : <Copy size={12} />}
                  <span>{copiedUri ? "Copied" : "Copy URI"}</span>
                </button>
              </div>
            </li>
            <li>
              Set the following environment variables on the production server (in PM2 / `.env`):
              <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px", color: "var(--dgs-text-muted)" }}>
                <li><code>GOOGLE_CLIENT_ID=&lt;your_client_id&gt;.apps.googleusercontent.com</code></li>
                <li><code>GOOGLE_CLIENT_SECRET=&lt;your_client_secret&gt;</code></li>
                <li><code>GOOGLE_REDIRECT_URI=https://www.dgeniussolutions.com/api/admin/integrations/google/callback</code></li>
              </ul>
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
