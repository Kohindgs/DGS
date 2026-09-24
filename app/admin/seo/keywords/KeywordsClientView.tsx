"use client";

import React, { useState } from "react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import { type CannibalizationRisk } from "@/lib/seo/keywords";
import SeoIntelligenceDrawer from "@/components/admin/SeoIntelligenceDrawer";

type KeywordRow = {
  id: string;
  query_text: string;
  page_url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  period_type: string;
  keyword_group?: string | null;
};

type Props = {
  queries: KeywordRow[];
  cannibalizationRisks: CannibalizationRisk[];
  targetsCount: number;
};

export default function KeywordsClientView({
  queries: initialQueries,
  cannibalizationRisks,
  targetsCount,
}: Props) {
  const [queries] = useState<KeywordRow[]>(initialQueries);
  const [selectedPageUrl, setSelectedPageUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "cannibalization">("all");

  const columns: Column<KeywordRow>[] = [
    {
      key: "query_text",
      header: "Keyword / Query",
      sortable: true,
      render: (q) => (
        <div>
          <strong style={{ color: "#fff" }}>{q.query_text}</strong>
          {q.keyword_group && (
            <span className="dgs-saas-chip primary" style={{ marginLeft: "8px", fontSize: "0.68rem" }}>
              Target: {q.keyword_group}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "page_url",
      header: "Ranking Page",
      sortable: true,
      render: (q) => (
        <button
          type="button"
          onClick={() => setSelectedPageUrl(q.page_url)}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--dgs-primary)",
            padding: 0,
            cursor: "pointer",
            textAlign: "left",
            fontSize: "0.82rem",
          }}
          title="Click to open page SEO intelligence"
        >
          {q.page_url.replace(/^https?:\/\/[^/]+/i, "")}
        </button>
      ),
    },
    {
      key: "position",
      header: "Google Avg. Position",
      sortable: true,
      width: "150px",
      render: (q) => {
        const pos = Number(q.position || 0);
        const variant = pos <= 3 ? "success" : pos <= 10 ? "primary" : "neutral";
        return <span className={`dgs-saas-chip ${variant}`}>{pos.toFixed(1)}</span>;
      },
    },
    {
      key: "clicks",
      header: "Clicks",
      sortable: true,
      width: "90px",
      render: (q) => q.clicks || 0,
    },
    {
      key: "impressions",
      header: "Impressions",
      sortable: true,
      width: "120px",
      render: (q) => (q.impressions ? q.impressions.toLocaleString() : "0"),
    },
    {
      key: "ctr",
      header: "CTR",
      sortable: true,
      width: "90px",
      render: (q) => `${((q.ctr || 0) * 100).toFixed(1)}%`,
    },
    {
      key: "type",
      header: "Target / Organic",
      width: "130px",
      render: (q) => (
        <span className={`dgs-saas-chip ${q.keyword_group ? "primary" : "neutral"}`}>
          {q.keyword_group ? "Target Registry" : "Discovered Query"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "100px",
      render: (q) => {
        const pos = Number(q.position || 0);
        if (pos <= 3) return <span className="dgs-saas-chip success">TOP 3</span>;
        if (pos <= 10) return <span className="dgs-saas-chip success">TOP 10</span>;
        if (pos <= 20) return <span className="dgs-saas-chip primary">TOP 20</span>;
        if (pos <= 50) return <span className="dgs-saas-chip neutral">TOP 50</span>;
        return <span className="dgs-saas-chip neutral">VISIBLE</span>;
      },
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            Site-Wide Keywords &amp; Query Matrix
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
            Official Search Console query telemetry mapped directly to ranking URLs, target registry keywords, and cannibalization detection.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dgs-saas-kpi-grid">
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Discovered Queries</div>
          <div className="dgs-saas-kpi-value">{queries.length}</div>
          <div className="dgs-saas-kpi-delta positive">GSC page-query dimensions</div>
        </div>

        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Target Keywords</div>
          <div className="dgs-saas-kpi-value">{targetsCount}</div>
          <div className="dgs-saas-kpi-delta neutral">Configured landing page targets</div>
        </div>

        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Cannibalization Risks</div>
          <div className="dgs-saas-kpi-value" style={{ color: cannibalizationRisks.length > 0 ? "var(--dgs-warning)" : "var(--dgs-success)" }}>
            {cannibalizationRisks.length}
          </div>
          <div className="dgs-saas-kpi-delta neutral">Queries with competing DGS pages</div>
        </div>

        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Top 10 Rankings</div>
          <div className="dgs-saas-kpi-value">
            {queries.filter((q) => Number(q.position) > 0 && Number(q.position) <= 10).length}
          </div>
          <div className="dgs-saas-kpi-delta positive">Page 1 Google Avg. Position</div>
        </div>
      </div>

      {/* Cannibalization Alert Banner if any risks found */}
      {cannibalizationRisks.length > 0 && (
        <div
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.25)",
            borderRadius: "var(--dgs-radius-md)",
            padding: "16px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ margin: 0, color: "#f59e0b", fontSize: "0.95rem" }}>
              ⚠ Keyword Cannibalization Warning ({cannibalizationRisks.length} query conflicts detected)
            </h4>
            <button
              type="button"
              className="dgs-saas-btn secondary sm"
              onClick={() => setActiveTab(activeTab === "cannibalization" ? "all" : "cannibalization")}
            >
              {activeTab === "cannibalization" ? "Show All Queries" : "Review Cannibalization Risks"}
            </button>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: "0.82rem", color: "var(--dgs-text-main)" }}>
            Multiple DGS pages are competing for the same search queries. Per DGS ranking protection policy, do NOT automatically canonicalize or delete pages. Review internal link anchors and topic differentiation.
          </p>
        </div>
      )}

      {/* Tab toggle */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)", gap: "8px" }}>
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          style={{
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "all" ? "2px solid var(--dgs-primary)" : "2px solid transparent",
            padding: "8px 16px",
            color: activeTab === "all" ? "#fff" : "var(--dgs-text-muted)",
            fontWeight: activeTab === "all" ? 700 : 500,
            cursor: "pointer",
            fontSize: "0.88rem",
          }}
        >
          All Ranked Queries ({queries.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("cannibalization")}
          style={{
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "cannibalization" ? "2px solid var(--dgs-primary)" : "2px solid transparent",
            padding: "8px 16px",
            color: activeTab === "cannibalization" ? "#fff" : "var(--dgs-text-muted)",
            fontWeight: activeTab === "cannibalization" ? 700 : 500,
            cursor: "pointer",
            fontSize: "0.88rem",
          }}
        >
          Cannibalization Risks ({cannibalizationRisks.length})
        </button>
      </div>

      {activeTab === "all" && (
        <SaaSTable
          columns={columns}
          data={queries}
          keyExtractor={(q) => q.id || `${q.query_text}_${q.page_url}`}
          searchPlaceholder="Search keyword, query, or ranking URL..."
        />
      )}

      {activeTab === "cannibalization" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {cannibalizationRisks.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--dgs-success)" }}>
              ✓ No cannibalization detected. Each high-intent search query maps cleanly to an authoritative page.
            </div>
          ) : (
            cannibalizationRisks.map((risk, idx) => (
              <div
                key={idx}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "var(--dgs-radius-md)",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, fontSize: "1rem", color: "#fff" }}>
                    Query: &ldquo;{risk.queryText}&rdquo;
                  </h4>
                  <span className="dgs-saas-chip warning">
                    {risk.competingPages.length} Competing URLs · {risk.totalImpressions.toLocaleString()} Impressions
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {risk.competingPages.map((cp, cIdx) => (
                    <div
                      key={cIdx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "rgba(255,255,255,0.02)",
                        padding: "8px 12px",
                        borderRadius: "4px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedPageUrl(cp.pageUrl)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--dgs-primary)",
                          cursor: "pointer",
                          fontSize: "0.82rem",
                        }}
                      >
                        {cp.pageUrl}
                      </button>
                      <div style={{ display: "flex", gap: "12px", fontSize: "0.78rem", color: "var(--dgs-text-muted)" }}>
                        <span>Clicks: <strong>{cp.clicks}</strong></span>
                        <span>Impressions: <strong>{cp.impressions.toLocaleString()}</strong></span>
                        <span>Google Avg. Position: <strong>{cp.googleAvgPosition.toFixed(1)}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: "0.8rem", color: "#fcd34d", background: "rgba(245, 158, 11, 0.08)", padding: "10px 12px", borderRadius: "4px" }}>
                  <strong>Recommendation:</strong> {risk.recommendation}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedPageUrl && (
        <SeoIntelligenceDrawer
          url={selectedPageUrl}
          isOpen={Boolean(selectedPageUrl)}
          onClose={() => setSelectedPageUrl(null)}
        />
      )}
    </div>
  );
}
