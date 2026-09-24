"use client";

import React from "react";
import Link from "next/link";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";

type PageMetric = {
  page_path: string;
  views: number;
  sessions: number;
  engagement_rate: number;
};

type Props = {
  metrics: {
    connected: boolean;
    summary: {
      activeUsers: number;
      sessions: number;
      views: number;
      engagementRate: number;
    };
    topLandingPages: PageMetric[];
  };
};

export default function AnalyticsClientView({ metrics }: Props) {
  const [syncing, setSyncing] = React.useState(false);
  const [syncMsg, setSyncMsg] = React.useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch("/api/admin/integrations/google/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      setSyncMsg(`Synced successfully! Active users: ${data.ga4?.activeUsers ?? 0}, Sessions: ${data.ga4?.sessions ?? 0}`);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      alert("Analytics sync error: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const pageColumns: Column<PageMetric>[] = [
    { key: "page_path", header: "Landing Page / Path", sortable: true },
    { key: "views", header: "Views", sortable: true, width: "120px" },
    { key: "sessions", header: "Sessions", sortable: true, width: "120px" },
    {
      key: "engagement_rate",
      header: "Engagement Rate",
      sortable: true,
      width: "160px",
      render: (r) => `${(Number(r.engagement_rate) * 100).toFixed(1)}%`,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--dgs-text-primary)", margin: 0 }}>
            Google Analytics 4 Overview
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
            Official GA4 Property Reporting &middot; User Engagement &middot; Traffic Acquisition
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {metrics.connected ? (
            <>
              <Link href="/admin/integrations/google/setup/" className="dgs-saas-btn secondary sm">
                Manage Property
              </Link>
              <button
                type="button"
                className="dgs-saas-btn primary sm"
                disabled={syncing}
                onClick={handleSync}
              >
                {syncing ? "Syncing..." : "Sync Now"}
              </button>
            </>
          ) : (
            <Link href="/admin/integrations/google/setup/" className="dgs-saas-btn primary sm">
              Connect Google Analytics 4
            </Link>
          )}
        </div>
      </div>

      {syncMsg && (
        <div style={{ padding: "10px 14px", background: "rgba(40, 199, 111, 0.1)", border: "1px solid rgba(40, 199, 111, 0.3)", borderRadius: "var(--dgs-radius-sm)", color: "var(--dgs-success)", fontSize: "13px" }}>
          {syncMsg}
        </div>
      )}

      {/* KPI Cards */}
      <div className="dgs-saas-kpi-grid">
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Active Users (28d)</div>
          <div className="dgs-saas-kpi-value">
            {metrics.connected ? metrics.summary.activeUsers : "—"}
          </div>
          <div className="dgs-saas-kpi-delta neutral">
            {metrics.connected ? "Unique Visitors" : "Ready to connect"}
          </div>
        </div>

        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Total Sessions</div>
          <div className="dgs-saas-kpi-value">
            {metrics.connected ? metrics.summary.sessions : "—"}
          </div>
          <div className="dgs-saas-kpi-delta neutral">
            {metrics.connected ? "Traffic Sessions" : "Ready to connect"}
          </div>
        </div>

        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Engagement Rate</div>
          <div className="dgs-saas-kpi-value">
            {metrics.connected ? `${metrics.summary.engagementRate}%` : "—"}
          </div>
          <div className="dgs-saas-kpi-delta neutral">
            Engaged sessions percentage
          </div>
        </div>

        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Total Views</div>
          <div className="dgs-saas-kpi-value">
            {metrics.connected ? metrics.summary.views : "—"}
          </div>
          <div className="dgs-saas-kpi-delta neutral">
            Page and screen views
          </div>
        </div>
      </div>

      {/* Landing Pages Table */}
      <div>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--dgs-text-primary)", marginBottom: "12px" }}>
          Top Landing Pages
        </h3>
        <SaaSTable<PageMetric>
          columns={pageColumns}
          data={((metrics.topLandingPages || (metrics as any).topPages || []) as PageMetric[])}
          keyExtractor={(p) => p.page_path}
          searchPlaceholder="Search landing pages..."
          emptyMessage="No GA4 analytics cached. Connect Google Analytics in Integrations to view real visitor metrics."
        />
      </div>
    </div>
  );
}
