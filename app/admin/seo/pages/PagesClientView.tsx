"use client";

import React, { useState } from "react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import SeoIntelligenceDrawer from "@/components/admin/SeoIntelligenceDrawer";

export type SitePageRankingRow = {
  url: string;
  title: string | null;
  primaryTopic: string;
  clicks: number;
  impressions: number;
  ctr: number;
  googleAvgPosition: number | null;
  topKeywords: string;
  mobilePsi: number | null;
  desktopPsi: number | null;
  issuesCount: number;
  opportunityScore: number;
};

type Props = {
  pages: SitePageRankingRow[];
};

export default function PagesClientView({ pages: initialPages }: Props) {
  const [pages] = useState<SitePageRankingRow[]>(initialPages);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const columns: Column<SitePageRankingRow>[] = [
    {
      key: "url",
      header: "Page",
      sortable: true,
      render: (p) => (
        <div style={{ maxWidth: "240px" }}>
          <div
            style={{ fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            title={p.title || p.url}
          >
            {p.title || p.url}
          </div>
          <div
            style={{ fontSize: "0.75rem", color: "var(--dgs-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {p.url.replace(/^https?:\/\/[^/]+/i, "")}
          </div>
        </div>
      ),
    },
    {
      key: "primaryTopic",
      header: "Primary Topic",
      sortable: true,
      width: "140px",
      render: (p) => (
        <span className="dgs-saas-chip neutral" style={{ fontSize: "0.72rem" }}>
          {p.primaryTopic}
        </span>
      ),
    },
    {
      key: "googleAvgPosition",
      header: "Google Avg. Position",
      sortable: true,
      width: "140px",
      render: (p) => {
        if (p.googleAvgPosition != null && p.googleAvgPosition > 0) {
          const variant = p.googleAvgPosition <= 3 ? "success" : p.googleAvgPosition <= 10 ? "primary" : "neutral";
          return <span className={`dgs-saas-chip ${variant}`}>{p.googleAvgPosition.toFixed(1)}</span>;
        }
        return <span style={{ color: "var(--dgs-text-muted)", fontSize: "0.78rem" }}>—</span>;
      },
    },
    {
      key: "clicks",
      header: "Clicks",
      sortable: true,
      width: "80px",
      render: (p) => p.clicks || 0,
    },
    {
      key: "impressions",
      header: "Impressions",
      sortable: true,
      width: "110px",
      render: (p) => (p.impressions ? p.impressions.toLocaleString() : "0"),
    },
    {
      key: "ctr",
      header: "CTR",
      sortable: true,
      width: "80px",
      render: (p) => `${((p.ctr || 0) * 100).toFixed(1)}%`,
    },
    {
      key: "topKeywords",
      header: "Top Keywords",
      render: (p) => (
        <span style={{ fontSize: "0.8rem", color: "#ddd" }} title={p.topKeywords}>
          {p.topKeywords || "—"}
        </span>
      ),
    },
    {
      key: "mobilePsi",
      header: "Mobile PSI",
      sortable: true,
      width: "95px",
      render: (p) => {
        if (p.mobilePsi != null) {
          const c = p.mobilePsi >= 90 ? "var(--dgs-success)" : p.mobilePsi >= 60 ? "var(--dgs-warning)" : "var(--dgs-danger)";
          return <strong style={{ color: c }}>{p.mobilePsi}</strong>;
        }
        return <span style={{ color: "var(--dgs-text-muted)", fontSize: "0.74rem" }}>Not Measured</span>;
      },
    },
    {
      key: "desktopPsi",
      header: "Desktop PSI",
      sortable: true,
      width: "95px",
      render: (p) => {
        if (p.desktopPsi != null) {
          const c = p.desktopPsi >= 90 ? "var(--dgs-success)" : p.desktopPsi >= 60 ? "var(--dgs-warning)" : "var(--dgs-danger)";
          return <strong style={{ color: c }}>{p.desktopPsi}</strong>;
        }
        return <span style={{ color: "var(--dgs-text-muted)", fontSize: "0.74rem" }}>Not Measured</span>;
      },
    },
    {
      key: "issuesCount",
      header: "Issues",
      sortable: true,
      width: "80px",
      render: (p) => (
        <span className={`dgs-saas-chip ${p.issuesCount > 0 ? "warning" : "neutral"}`}>
          {p.issuesCount}
        </span>
      ),
    },
    {
      key: "opportunityScore",
      header: "Opportunity Score",
      sortable: true,
      width: "140px",
      render: (p) => {
        const s = p.opportunityScore;
        const variant = s >= 70 ? "success" : s >= 40 ? "warning" : "neutral";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className={`dgs-saas-chip ${variant}`} style={{ fontWeight: 700 }}>
              {s}/100
            </span>
            {s >= 70 && (
              <span style={{ fontSize: "0.68rem", color: "var(--dgs-success)", fontWeight: 700 }}>
                HIGH
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      width: "100px",
      render: (p) => (
        <button
          type="button"
          className="dgs-saas-btn secondary sm"
          onClick={() => setSelectedUrl(p.url)}
          style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}
        >
          Details &rarr;
        </button>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            Site-Wide Page Rankings &amp; Opportunity Matrix
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
            Unified index of all sitemap pages combining Search Console average positions, impressions, PageSpeed performance, and evidence-based opportunity scores.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dgs-saas-kpi-grid">
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Audited Pages</div>
          <div className="dgs-saas-kpi-value">{pages.length}</div>
          <div className="dgs-saas-kpi-delta positive">Full dynamic sitemap</div>
        </div>

        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">High Opportunity Pages</div>
          <div className="dgs-saas-kpi-value" style={{ color: "var(--dgs-success)" }}>
            {pages.filter((p) => p.opportunityScore >= 70).length}
          </div>
          <div className="dgs-saas-kpi-delta positive">Striking distance + high impressions</div>
        </div>

        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Top 10 Ranked Pages</div>
          <div className="dgs-saas-kpi-value">
            {pages.filter((p) => p.googleAvgPosition != null && p.googleAvgPosition > 0 && p.googleAvgPosition <= 10).length}
          </div>
          <div className="dgs-saas-kpi-delta positive">Page 1 Google Avg. Position</div>
        </div>

        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Total Search Impressions</div>
          <div className="dgs-saas-kpi-value">
            {pages.reduce((acc, p) => acc + (p.impressions || 0), 0).toLocaleString()}
          </div>
          <div className="dgs-saas-kpi-delta neutral">28-day Search Console total</div>
        </div>
      </div>

      <SaaSTable
        columns={columns}
        data={pages}
        keyExtractor={(p) => p.url}
        searchPlaceholder="Search page URL, title, or topic..."
      />

      {selectedUrl && (
        <SeoIntelligenceDrawer
          url={selectedUrl}
          isOpen={Boolean(selectedUrl)}
          onClose={() => setSelectedUrl(null)}
        />
      )}
    </div>
  );
}
