"use client";

import React, { useState, useMemo } from "react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import { type CannibalizationRisk } from "@/lib/seo/keywords";
import SeoIntelligenceDrawer from "@/components/admin/SeoIntelligenceDrawer";
import KeywordIntelligenceDrawer, { type KeywordDrawerData } from "@/components/admin/KeywordIntelligenceDrawer";
import {
  calculateRankingTrend,
  classifyKeyword,
} from "@/lib/seo/keyword-engine";

type KeywordRow = {
  id: string;
  query_text: string;
  page_url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number | null;
  prev_position?: number | null;
  prev_clicks?: number;
  prev_impressions?: number;
  period_type: string;
  keyword_group?: string | null;
  mobile_psi?: number | null;
  desktop_psi?: number | null;
};

type Props = {
  queries: KeywordRow[];
  cannibalizationRisks: CannibalizationRisk[];
  targetsCount: number;
};

type FilterCategory =
  | "all"
  | "top3"
  | "top10"
  | "top20"
  | "protect"
  | "grow"
  | "recover"
  | "new_opportunity"
  | "cannibalization"
  | "not_detected";

function safeStr(val: unknown): string {
  if (typeof val === "string") return val.trim();
  if (val != null) return String(val).trim();
  return "";
}

export default function KeywordsClientView({
  queries: initialQueries = [],
  cannibalizationRisks: initialRisks = [],
  targetsCount = 0,
}: Props) {
  const [queries] = useState<KeywordRow[]>(Array.isArray(initialQueries) ? initialQueries : []);
  const cannibalizationRisks = useMemo(
    () => (Array.isArray(initialRisks) ? initialRisks : []),
    [initialRisks]
  );

  const [selectedPageUrl, setSelectedPageUrl] = useState<string | null>(null);
  const [selectedKeywordData, setSelectedKeywordData] = useState<KeywordDrawerData | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "cannibalization">("all");
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");

  // Map of cannibalized query strings for fast lookup
  const cannibalizedQuerySet = useMemo(() => {
    const set = new Set<string>();
    for (const r of cannibalizationRisks) {
      const q = safeStr(r?.queryText).toLowerCase();
      if (q) set.add(q);
    }
    return set;
  }, [cannibalizationRisks]);

  const cannibalizationRiskMap = useMemo(() => {
    const map = new Map<string, CannibalizationRisk>();
    for (const r of cannibalizationRisks) {
      const q = safeStr(r?.queryText).toLowerCase();
      if (q) map.set(q, r);
    }
    return map;
  }, [cannibalizationRisks]);

  const filteredQueries = useMemo(() => {
    return queries.filter((q) => {
      if (!q) return false;
      const qText = safeStr(q.query_text);
      const pos = q.position != null && !isNaN(Number(q.position)) && Number(q.position) > 0 ? Number(q.position) : null;
      const isCannibalized = qText ? cannibalizedQuerySet.has(qText.toLowerCase()) : false;

      const classification = classifyKeyword({
        query: qText,
        position: pos,
        prevPosition: q.prev_position,
        clicks: q.clicks || 0,
        impressions: q.impressions || 0,
        ctr: q.ctr || 0,
        isCannibalized,
      });

      switch (activeFilter) {
        case "top3":
          return pos != null && pos <= 3;
        case "top10":
          return pos != null && pos <= 10;
        case "top20":
          return pos != null && pos > 10 && pos <= 20;
        case "protect":
          return classification === "PROTECT";
        case "grow":
          return classification === "GROW";
        case "recover":
          return classification === "RECOVER";
        case "new_opportunity":
          return classification === "NEW OPPORTUNITY";
        case "cannibalization":
          return isCannibalized;
        case "not_detected":
          return pos == null;
        case "all":
        default:
          return true;
      }
    });
  }, [queries, activeFilter, cannibalizedQuerySet]);

  const openDrawerForKeyword = (q: KeywordRow) => {
    if (!q) return;
    const qText = safeStr(q.query_text);
    const normQ = qText.toLowerCase();
    const isCannibalized = normQ ? cannibalizedQuerySet.has(normQ) : false;
    const risk = normQ ? cannibalizationRiskMap.get(normQ) : undefined;

    setSelectedKeywordData({
      id: q.id,
      query: qText || "Unnamed Query",
      pageUrl: q.page_url || "/",
      position: q.position != null ? Number(q.position) : null,
      prevPosition: q.prev_position != null ? Number(q.prev_position) : null,
      clicks: Number(q.clicks || 0),
      impressions: Number(q.impressions || 0),
      ctr: Number(q.ctr || 0),
      keywordGroup: q.keyword_group,
      isCannibalized,
      competingPages: (risk?.competingPages || []).map((cp) => ({
        pageUrl: cp?.pageUrl || "/",
        clicks: Number(cp?.clicks || 0),
        impressions: Number(cp?.impressions || 0),
        position: Number(cp?.googleAvgPosition || 0),
      })),
      mobilePsi: q.mobile_psi != null ? Number(q.mobile_psi) : null,
      desktopPsi: q.desktop_psi != null ? Number(q.desktop_psi) : null,
    });
  };

  const columns: Column<KeywordRow>[] = [
    {
      key: "query_text",
      header: "Keyword / Query",
      sortable: true,
      render: (q) => {
        const qText = safeStr(q?.query_text) || "Unnamed Query";
        const isCannibalized = qText ? cannibalizedQuerySet.has(qText.toLowerCase()) : false;
        return (
          <div>
            <button
              type="button"
              onClick={() => openDrawerForKeyword(q)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontWeight: 600,
                padding: 0,
                cursor: "pointer",
                textAlign: "left",
                fontSize: "0.88rem",
              }}
              title="Click to view full keyword intelligence & recommendations"
            >
              {qText}
            </button>
            <div style={{ display: "flex", gap: "6px", marginTop: "4px", flexWrap: "wrap" }}>
              {q?.keyword_group && (
                <span className="dgs-saas-chip primary" style={{ fontSize: "0.68rem" }}>
                  Target: {q.keyword_group}
                </span>
              )}
              {isCannibalized && (
                <span className="dgs-saas-chip warning" style={{ fontSize: "0.68rem" }}>
                  ⚠ Cannibalized
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "page_url",
      header: "Ranking Page",
      sortable: true,
      render: (q) => {
        const pUrl = q?.page_url || "/";
        const displayPath = pUrl.replace(/^https?:\/\/[^/]+/i, "") || "/";
        return (
          <button
            type="button"
            onClick={() => setSelectedPageUrl(pUrl)}
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
            {displayPath}
          </button>
        );
      },
    },
    {
      key: "position",
      header: "GSC Avg. Position",
      sortable: true,
      width: "180px",
      render: (q) => {
        if (q?.position != null && !isNaN(Number(q.position)) && Number(q.position) > 0) {
          const pos = Number(q.position);
          const variant = pos <= 3 ? "success" : pos <= 10 ? "primary" : "neutral";
          const trend = calculateRankingTrend(q.position, q.prev_position);

          return (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span className={`dgs-saas-chip ${variant}`} style={{ fontWeight: 700 }}>
                {pos.toFixed(1)}
              </span>
              {trend.status !== "stable" && (
                <span className={`dgs-saas-chip ${trend.badgeClass}`} style={{ fontSize: "0.68rem", fontWeight: 600 }}>
                  {trend.label}
                </span>
              )}
            </div>
          );
        }
        return (
          <span className="dgs-saas-chip neutral" style={{ fontSize: "0.72rem" }}>
            NOT DETECTED
          </span>
        );
      },
    },
    {
      key: "classification",
      header: "Classification",
      width: "150px",
      render: (q) => {
        const qText = safeStr(q?.query_text);
        const isCannibalized = qText ? cannibalizedQuerySet.has(qText.toLowerCase()) : false;
        const cls = classifyKeyword({
          query: qText,
          position: q?.position,
          prevPosition: q?.prev_position,
          clicks: q?.clicks,
          impressions: q?.impressions,
          ctr: q?.ctr,
          isCannibalized,
        });

        switch (cls) {
          case "PROTECT":
            return <span className="dgs-saas-chip success">PROTECT</span>;
          case "GROW":
            return <span className="dgs-saas-chip primary">GROW</span>;
          case "RECOVER":
            return <span className="dgs-saas-chip danger">RECOVER</span>;
          case "CANNIBALIZATION RISK":
            return <span className="dgs-saas-chip warning">CANNIBALIZATION</span>;
          case "NEW OPPORTUNITY":
            return <span className="dgs-saas-chip primary">NEW OPPORTUNITY</span>;
          case "LOW SIGNAL":
            return <span className="dgs-saas-chip neutral">LOW SIGNAL</span>;
          case "NOT DETECTED":
          default:
            return <span className="dgs-saas-chip neutral">NOT DETECTED</span>;
        }
      },
    },
    {
      key: "clicks",
      header: "Clicks",
      sortable: true,
      width: "80px",
      render: (q) => q?.clicks || 0,
    },
    {
      key: "impressions",
      header: "Impressions",
      sortable: true,
      width: "110px",
      render: (q) => (q?.impressions ? q.impressions.toLocaleString() : "0"),
    },
    {
      key: "ctr",
      header: "CTR",
      sortable: true,
      width: "80px",
      render: (q) => `${((q?.ctr || 0) * 100).toFixed(1)}%`,
    },
    {
      key: "actions",
      header: "Actions",
      width: "110px",
      render: (q) => (
        <button
          type="button"
          className="dgs-saas-btn secondary sm"
          onClick={() => openDrawerForKeyword(q)}
          style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}
        >
          Strategy &rarr;
        </button>
      ),
    },
  ];

  const filterButtons: { key: FilterCategory; label: string; count?: number }[] = [
    { key: "all", label: "All Queries", count: queries.length },
    {
      key: "top3",
      label: "Top 3",
      count: queries.filter((q) => q?.position != null && Number(q.position) > 0 && Number(q.position) <= 3).length,
    },
    {
      key: "top10",
      label: "Top 10",
      count: queries.filter((q) => q?.position != null && Number(q.position) > 0 && Number(q.position) <= 10).length,
    },
    {
      key: "top20",
      label: "Striking Distance (11–20)",
      count: queries.filter((q) => q?.position != null && Number(q.position) > 10 && Number(q.position) <= 20).length,
    },
    {
      key: "protect",
      label: "Protect",
      count: queries.filter((q) => {
        const qText = safeStr(q?.query_text);
        return classifyKeyword({
          query: qText,
          position: q?.position,
          prevPosition: q?.prev_position,
          clicks: q?.clicks,
          impressions: q?.impressions,
          ctr: q?.ctr,
          isCannibalized: qText ? cannibalizedQuerySet.has(qText.toLowerCase()) : false,
        }) === "PROTECT";
      }).length,
    },
    {
      key: "grow",
      label: "Grow",
      count: queries.filter((q) => {
        const qText = safeStr(q?.query_text);
        return classifyKeyword({
          query: qText,
          position: q?.position,
          prevPosition: q?.prev_position,
          clicks: q?.clicks,
          impressions: q?.impressions,
          ctr: q?.ctr,
          isCannibalized: qText ? cannibalizedQuerySet.has(qText.toLowerCase()) : false,
        }) === "GROW";
      }).length,
    },
    {
      key: "recover",
      label: "Recover",
      count: queries.filter((q) => {
        const qText = safeStr(q?.query_text);
        return classifyKeyword({
          query: qText,
          position: q?.position,
          prevPosition: q?.prev_position,
          clicks: q?.clicks,
          impressions: q?.impressions,
          ctr: q?.ctr,
          isCannibalized: qText ? cannibalizedQuerySet.has(qText.toLowerCase()) : false,
        }) === "RECOVER";
      }).length,
    },
    {
      key: "new_opportunity",
      label: "New Opportunity",
      count: queries.filter((q) => {
        const qText = safeStr(q?.query_text);
        return classifyKeyword({
          query: qText,
          position: q?.position,
          prevPosition: q?.prev_position,
          clicks: q?.clicks,
          impressions: q?.impressions,
          ctr: q?.ctr,
          isCannibalized: qText ? cannibalizedQuerySet.has(qText.toLowerCase()) : false,
        }) === "NEW OPPORTUNITY";
      }).length,
    },
    {
      key: "cannibalization",
      label: "Cannibalization",
      count: queries.filter((q) => {
        const qText = safeStr(q?.query_text);
        return qText ? cannibalizedQuerySet.has(qText.toLowerCase()) : false;
      }).length,
    },
    {
      key: "not_detected",
      label: "Not Detected",
      count: queries.filter((q) => q?.position == null).length,
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
            Official Search Console query telemetry mapped directly to ranking URLs, historical position trends, and strategic action plans.
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
          <div className="dgs-saas-kpi-title">Target Registry</div>
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
            {queries.filter((q) => Number(q?.position) > 0 && Number(q?.position) <= 10).length}
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
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Actionable Keyword Filters */}
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
            data={filteredQueries}
            keyExtractor={(q) => q?.id || `${q?.query_text}_${q?.page_url}`}
            searchPlaceholder="Search keyword, query, or ranking URL..."
          />
        </div>
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
                    Query: &ldquo;{risk?.queryText}&rdquo;
                  </h4>
                  <span className="dgs-saas-chip warning">
                    {(risk?.competingPages || []).length} Competing URLs · {(risk?.totalImpressions || 0).toLocaleString()} Impressions
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {(risk?.competingPages || []).map((cp, cIdx) => (
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
                        onClick={() => setSelectedPageUrl(cp?.pageUrl)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--dgs-primary)",
                          cursor: "pointer",
                          fontSize: "0.82rem",
                        }}
                      >
                        {cp?.pageUrl}
                      </button>
                      <div style={{ display: "flex", gap: "12px", fontSize: "0.78rem", color: "var(--dgs-text-muted)" }}>
                        <span>Clicks: <strong>{cp?.clicks || 0}</strong></span>
                        <span>Impressions: <strong>{(cp?.impressions || 0).toLocaleString()}</strong></span>
                        <span>Google Avg. Position: <strong>{cp?.googleAvgPosition ? Number(cp.googleAvgPosition).toFixed(1) : "—"}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: "0.8rem", color: "#fcd34d", background: "rgba(245, 158, 11, 0.08)", padding: "10px 12px", borderRadius: "4px" }}>
                  <strong>Recommendation:</strong> {risk?.recommendation}
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

      {selectedKeywordData && (
        <KeywordIntelligenceDrawer
          data={selectedKeywordData}
          isOpen={Boolean(selectedKeywordData)}
          onClose={() => setSelectedKeywordData(null)}
          onOpenPageSeo={(url) => {
            setSelectedKeywordData(null);
            setSelectedPageUrl(url);
          }}
        />
      )}
    </div>
  );
}
