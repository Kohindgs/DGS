"use client";

import React, { useState, useMemo } from "react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import SeoIntelligenceDrawer from "@/components/admin/SeoIntelligenceDrawer";
import { type RankingTrend } from "@/lib/seo/keyword-engine";

export type SitePageRankingRow = {
  url: string;
  title: string | null;
  primaryTopic: string;
  clicks: number;
  impressions: number;
  ctr: number;
  googleAvgPosition: number | null;
  prevPosition?: number | null;
  rankingTrend?: RankingTrend;
  topKeywords: string;
  mobilePsi: number | null;
  desktopPsi: number | null;
  issuesCount: number;
  opportunityScore: number;
};

type Props = {
  pages: SitePageRankingRow[];
  sitemapUrlsCount?: number;
  crawledCount?: number;
  gscPagesCount?: number;
  rankedQueriesCount?: number;
};

type FilterKey =
  | "all"
  | "top3"
  | "top10"
  | "top20"
  | "top50"
  | "top100"
  | "not_detected"
  | "improving"
  | "falling"
  | "lost"
  | "new"
  | "high_imp_low_ctr"
  | "high_opportunity"
  | "has_issues"
  | "slow_mobile";

export default function PagesClientView({
  pages: initialPages,
  sitemapUrlsCount = 0,
  crawledCount = 0,
  gscPagesCount = 0,
  rankedQueriesCount = 0,
}: Props) {
  const [pages] = useState<SitePageRankingRow[]>(initialPages);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filteredPages = useMemo(() => {
    return pages.filter((p) => {
      const pos = p.googleAvgPosition;
      const trend = p.rankingTrend?.status;

      switch (activeFilter) {
        case "top3":
          return pos != null && pos > 0 && pos <= 3;
        case "top10":
          return pos != null && pos > 0 && pos <= 10;
        case "top20":
          return pos != null && pos > 10 && pos <= 20;
        case "top50":
          return pos != null && pos > 20 && pos <= 50;
        case "top100":
          return pos != null && pos > 50 && pos <= 100;
        case "not_detected":
          return pos == null || pos <= 0;
        case "improving":
          return trend === "improving";
        case "falling":
          return trend === "falling";
        case "lost":
          return trend === "lost";
        case "new":
          return trend === "new";
        case "high_imp_low_ctr":
          return p.impressions >= 100 && p.ctr < 0.02;
        case "high_opportunity":
          return p.opportunityScore >= 70;
        case "has_issues":
          return p.issuesCount > 0;
        case "slow_mobile":
          return p.mobilePsi != null && p.mobilePsi < 60;
        case "all":
        default:
          return true;
      }
    });
  }, [pages, activeFilter]);

  const columns: Column<SitePageRankingRow>[] = [
    {
      key: "url",
      header: "Page",
      sortable: true,
      render: (p) => (
        <div style={{ maxWidth: "260px" }}>
          <div
            style={{ fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            title={p.title || p.url}
          >
            {p.title || p.url}
          </div>
          <div
            style={{ fontSize: "0.75rem", color: "var(--dgs-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {p.url.replace(/^https?:\/\/[^/]+/i, "") || "/"}
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
      header: "GSC Avg. Position",
      sortable: true,
      width: "180px",
      render: (p) => {
        if (p.googleAvgPosition != null && p.googleAvgPosition > 0) {
          const pos = p.googleAvgPosition;
          const variant = pos <= 3 ? "success" : pos <= 10 ? "primary" : "neutral";
          const trend = p.rankingTrend;

          return (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span className={`dgs-saas-chip ${variant}`} style={{ fontWeight: 700 }}>
                {pos.toFixed(1)}
              </span>
              {trend && trend.status !== "stable" && (
                <span className={`dgs-saas-chip ${trend.badgeClass}`} style={{ fontSize: "0.68rem", fontWeight: 600 }}>
                  {trend.label}
                </span>
              )}
            </div>
          );
        }
        return (
          <span className="dgs-saas-chip neutral" style={{ fontSize: "0.72rem", opacity: 0.85 }}>
            NOT DETECTED
          </span>
        );
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

  const filterButtons: { key: FilterKey; label: string; count?: number }[] = [
    { key: "all", label: "All Pages", count: pages.length },
    { key: "top3", label: "Top 3", count: pages.filter((p) => p.googleAvgPosition != null && p.googleAvgPosition <= 3).length },
    { key: "top10", label: "Top 10", count: pages.filter((p) => p.googleAvgPosition != null && p.googleAvgPosition <= 10).length },
    { key: "top20", label: "11–20", count: pages.filter((p) => p.googleAvgPosition != null && p.googleAvgPosition > 10 && p.googleAvgPosition <= 20).length },
    { key: "top50", label: "21–50", count: pages.filter((p) => p.googleAvgPosition != null && p.googleAvgPosition > 20 && p.googleAvgPosition <= 50).length },
    { key: "top100", label: "51–100", count: pages.filter((p) => p.googleAvgPosition != null && p.googleAvgPosition > 50 && p.googleAvgPosition <= 100).length },
    { key: "not_detected", label: "Not Detected", count: pages.filter((p) => p.googleAvgPosition == null).length },
    { key: "improving", label: "Improving", count: pages.filter((p) => p.rankingTrend?.status === "improving").length },
    { key: "falling", label: "Falling", count: pages.filter((p) => p.rankingTrend?.status === "falling").length },
    { key: "lost", label: "Lost", count: pages.filter((p) => p.rankingTrend?.status === "lost").length },
    { key: "new", label: "New", count: pages.filter((p) => p.rankingTrend?.status === "new").length },
    { key: "high_imp_low_ctr", label: "High Imp. / Low CTR", count: pages.filter((p) => p.impressions >= 100 && p.ctr < 0.02).length },
    { key: "high_opportunity", label: "High Opportunity", count: pages.filter((p) => p.opportunityScore >= 70).length },
    { key: "has_issues", label: "Has Issues", count: pages.filter((p) => p.issuesCount > 0).length },
    { key: "slow_mobile", label: "Slow Mobile", count: pages.filter((p) => p.mobilePsi != null && p.mobilePsi < 60).length },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            Site-Wide Page Rankings &amp; Opportunity Matrix
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
            Comprehensive index of all sitemap pages combining Search Console average positions, impressions, PageSpeed performance, and evidence-based opportunity scores.
          </p>
        </div>
      </div>

      {/* REQ-16: Separate KPI Counts */}
      <div className="dgs-saas-kpi-grid">
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Sitemap URLs</div>
          <div className="dgs-saas-kpi-value">{sitemapUrlsCount || pages.length}</div>
          <div className="dgs-saas-kpi-delta positive">Full recursive sitemap discovery</div>
        </div>

        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Crawled Pages</div>
          <div className="dgs-saas-kpi-value">{crawledCount || pages.length}</div>
          <div className="dgs-saas-kpi-delta positive">Latest completed site audit</div>
        </div>

        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">GSC Pages</div>
          <div className="dgs-saas-kpi-value">{gscPagesCount || pages.filter((p) => p.googleAvgPosition != null).length}</div>
          <div className="dgs-saas-kpi-delta neutral">Pages with recorded impressions</div>
        </div>

        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Ranked Queries</div>
          <div className="dgs-saas-kpi-value">{rankedQueriesCount.toLocaleString()}</div>
          <div className="dgs-saas-kpi-delta neutral">Search Console query universe</div>
        </div>
      </div>

      {/* REQ-17: Visible Neon Filters */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          padding: "12px 14px",
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "var(--dgs-radius-md)",
        }}
      >
        {filterButtons.map((btn) => {
          const isActive = activeFilter === btn.key;
          return (
            <button
              key={btn.key}
              type="button"
              className={`dgs-saas-chip ${isActive ? "primary" : "neutral"}`}
              onClick={() => setActiveFilter(btn.key)}
              style={{
                cursor: "pointer",
                padding: "6px 12px",
                fontSize: "0.78rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s ease",
                fontWeight: isActive ? 700 : 500,
              }}
            >
              <span>{btn.label}</span>
              {btn.count !== undefined && (
                <span
                  style={{
                    background: isActive ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.08)",
                    padding: "1px 6px",
                    borderRadius: "10px",
                    fontSize: "0.7rem",
                  }}
                >
                  {btn.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <SaaSTable
        columns={columns}
        data={filteredPages}
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
