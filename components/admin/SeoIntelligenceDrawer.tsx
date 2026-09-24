"use client";

import React, { useState, useEffect } from "react";
import AltFixerDrawer from "./AltFixerDrawer";

type Props = {
  url: string;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
};

export default function SeoIntelligenceDrawer({ url, isOpen, onClose, onRefresh }: Props) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "performance" | "keywords" | "pagespeed" | "technical" | "media" | "recommendations"
  >("overview");

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [altFixerOpen, setAltFixerOpen] = useState(false);
  const [recheckingPsi, setRecheckingPsi] = useState(false);

  // New target keyword input
  const [newKeyword, setNewKeyword] = useState("");
  const [addingKw, setAddingKw] = useState(false);

  const fetchPageIntel = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/seo/page-intel?url=${encodeURIComponent(url)}`);
      const resData = await res.json();
      if (resData.ok) {
        setData(resData);
      }
    } catch (err) {
      console.error("Failed to load page intelligence:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && url) {
      fetchPageIntel();
    }
  }, [isOpen, url]);

  const handleRunPageSpeed = async () => {
    setRecheckingPsi(true);
    try {
      const res = await fetch("/api/admin/seo/pagespeed/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, force: true }),
      });
      const resData = await res.json();
      if (resData.ok) {
        setData((prev: any) => ({
          ...prev,
          pageSpeed: {
            mobile: resData.mobile,
            desktop: resData.desktop,
            config: resData.config,
          },
        }));
      }
    } catch (err) {
      console.error("PageSpeed test failed:", err);
    } finally {
      setRecheckingPsi(false);
    }
  };

  const handleAddTargetKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim() || addingKw) return;
    setAddingKw(true);
    try {
      const res = await fetch("/api/admin/seo/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          pageUrl: url,
          keyword: newKeyword.trim(),
        }),
      });
      const resData = await res.json();
      if (resData.ok) {
        setNewKeyword("");
        fetchPageIntel();
      }
    } catch (err) {
      console.error("Add keyword error:", err);
    } finally {
      setAddingKw(false);
    }
  };

  const handleRemoveTargetKeyword = async (id: string) => {
    try {
      await fetch("/api/admin/seo/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", id }),
      });
      fetchPageIntel();
    } catch (err) {
      console.error("Remove keyword error:", err);
    }
  };

  if (!isOpen) return null;

  const pageAudit = data?.pageAudit || {};
  const gsc = data?.gscPerformance || {};
  const mobilePsi = data?.pageSpeed?.mobile;
  const desktopPsi = data?.pageSpeed?.desktop;
  const rankingKws = data?.rankingKeywords || [];
  const keywordGap = data?.keywordGap || {};
  const missingAlts = data?.missingAlts || [];
  const recommendations = data?.recommendations || [];

  const isTopRanking = gsc.hasData && gsc.googleAvgPosition > 0 && gsc.googleAvgPosition <= 5.0;

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(6px)",
          zIndex: 9998,
          display: "flex",
          justifyContent: "flex-end",
        }}
        onClick={onClose}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "880px",
            background: "#0c0c14",
            borderLeft: "1px solid rgba(255,255,255,0.12)",
            height: "100%",
            overflowY: "auto",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            boxShadow: "-10px 0 40px rgba(0,0,0,0.6)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                <span className="dgs-saas-chip primary">SEO INTELLIGENCE</span>
                {isTopRanking && <span className="dgs-saas-chip success">PROTECTED RANKING BASELINE (TOP 5)</span>}
              </div>
              <h3 style={{ fontSize: "1.35rem", color: "#fff", margin: 0, fontWeight: 700 }}>
                {pageAudit.title || url}
              </h3>
              <p style={{ fontSize: "0.82rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
                URL: <code>{url}</code>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "none",
                color: "#fff",
                fontSize: "1.2rem",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                cursor: "pointer",
              }}
            >
              &times;
            </button>
          </div>

          {/* 7-Tab Navigation */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              gap: "4px",
              overflowX: "auto",
            }}
          >
            {[
              { id: "overview", label: "Overview" },
              { id: "performance", label: "Search Performance" },
              { id: "keywords", label: `Keywords (${rankingKws.length})` },
              { id: "pagespeed", label: "PageSpeed & CWV" },
              { id: "technical", label: "Technical" },
              { id: "media", label: `Media (${pageAudit.imagesCount || 0})` },
              { id: "recommendations", label: `Action Plan (${recommendations.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: activeTab === tab.id ? "2px solid var(--dgs-primary)" : "2px solid transparent",
                  padding: "10px 14px",
                  color: activeTab === tab.id ? "#fff" : "var(--dgs-text-muted)",
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: "60px 0", textAlign: "center", color: "var(--dgs-text-muted)" }}>
              Analyzing page performance, rankings, and PageSpeed metrics...
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW — Answers 4 Executive Questions */}
              {activeTab === "overview" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Executive 4-Question Panel */}
                  <div
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: "var(--dgs-radius-md)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      padding: "18px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "8px" }}>
                      Executive Strategic Assessment
                    </h4>

                    {/* Q1 */}
                    <div>
                      <div style={{ fontSize: "0.76rem", color: "var(--dgs-primary)", fontWeight: 700, textTransform: "uppercase" }}>
                        1. Is This Page Ranking?
                      </div>
                      <div style={{ fontSize: "0.88rem", color: "#fff", marginTop: "2px" }}>
                        {gsc.hasData ? (
                          <>
                            <strong>Yes.</strong> Google Avg. Position: <strong>{gsc.googleAvgPosition}</strong> (Generated {gsc.clicks} clicks and {gsc.impressions.toLocaleString()} impressions over 28d).
                          </>
                        ) : (
                          <span style={{ color: "var(--dgs-text-muted)" }}>
                            Awaiting Google OAuth sync or no search impressions recorded in current 28d window.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Q2 */}
                    <div>
                      <div style={{ fontSize: "0.76rem", color: "var(--dgs-primary)", fontWeight: 700, textTransform: "uppercase" }}>
                        2. What Keywords Does It Rank For?
                      </div>
                      <div style={{ fontSize: "0.88rem", color: "#fff", marginTop: "2px" }}>
                        {rankingKws.length > 0 ? (
                          <>
                            Ranking for <strong>{rankingKws.length} detected queries</strong> (Top 10: {rankingKws.filter((k: any) => k.googleAvgPosition <= 10).length}). Top driver: &ldquo;{rankingKws[0]?.queryText}&rdquo; (Avg. Pos {rankingKws[0]?.googleAvgPosition}).
                          </>
                        ) : (
                          <span style={{ color: "var(--dgs-text-muted)" }}>
                            No query relationships detected yet in Search Console.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Q3 */}
                    <div>
                      <div style={{ fontSize: "0.76rem", color: "var(--dgs-primary)", fontWeight: 700, textTransform: "uppercase" }}>
                        3. What Is Holding It Back?
                      </div>
                      <div style={{ fontSize: "0.88rem", color: "#fff", marginTop: "2px" }}>
                        {recommendations.length > 0 ? (
                          <ul style={{ margin: "4px 0 0", paddingLeft: "18px", color: "var(--dgs-text-main)", fontSize: "0.82rem" }}>
                            {recommendations.slice(0, 3).map((r: any, idx: number) => (
                              <li key={idx}>{r.problem}</li>
                            ))}
                          </ul>
                        ) : (
                          <span style={{ color: "var(--dgs-success)" }}>
                            No major technical or on-page blockers detected. Baseline is clean.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Q4 */}
                    <div>
                      <div style={{ fontSize: "0.76rem", color: "var(--dgs-primary)", fontWeight: 700, textTransform: "uppercase" }}>
                        4. What Should We Do Next?
                      </div>
                      <div style={{ fontSize: "0.88rem", color: "#fff", marginTop: "2px" }}>
                        {recommendations.length > 0 ? (
                          <div style={{ color: "#a5b4fc", fontSize: "0.84rem", background: "rgba(99, 102, 241, 0.08)", padding: "8px 12px", borderRadius: "4px" }}>
                            <strong>Top Priority:</strong> {recommendations[0]?.recommendedAction}
                          </div>
                        ) : (
                          <span style={{ color: "var(--dgs-text-muted)" }}>
                            Continue scheduled monitoring and build high-authority external brand citations.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* KPI Cards Grid */}
                  <div className="dgs-saas-kpi-grid">
                    <div className="dgs-saas-kpi-card">
                      <div className="dgs-saas-kpi-title">Google Avg. Position</div>
                      <div className="dgs-saas-kpi-value">
                        {gsc.hasData && gsc.googleAvgPosition > 0 ? gsc.googleAvgPosition.toFixed(1) : "—"}
                      </div>
                      <div className="dgs-saas-kpi-delta neutral">Official Search Console avg</div>
                    </div>

                    <div className="dgs-saas-kpi-card">
                      <div className="dgs-saas-kpi-title">28d Clicks</div>
                      <div className="dgs-saas-kpi-value">{gsc.clicks || 0}</div>
                      <div className="dgs-saas-kpi-delta positive">{((gsc.ctr || 0) * 100).toFixed(1)}% CTR</div>
                    </div>

                    <div className="dgs-saas-kpi-card">
                      <div className="dgs-saas-kpi-title">Mobile PageSpeed</div>
                      <div className="dgs-saas-kpi-value">
                        {mobilePsi?.performanceScore != null ? `${mobilePsi.performanceScore}/100` : "Not Measured"}
                      </div>
                      <div className="dgs-saas-kpi-delta neutral">Lighthouse Mobile Engine</div>
                    </div>

                    <div className="dgs-saas-kpi-card">
                      <div className="dgs-saas-kpi-title">Desktop PageSpeed</div>
                      <div className="dgs-saas-kpi-value">
                        {desktopPsi?.performanceScore != null ? `${desktopPsi.performanceScore}/100` : "Not Measured"}
                      </div>
                      <div className="dgs-saas-kpi-delta neutral">Lighthouse Desktop Engine</div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SEARCH PERFORMANCE */}
              {activeTab === "performance" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="dgs-saas-card">
                    <div className="dgs-saas-card-header">
                      <h4 className="dgs-saas-card-title">Google Search Console Telemetry (28 Days)</h4>
                      <span className="dgs-saas-chip info">Source: Google Search Console</span>
                    </div>
                    <div className="dgs-saas-card-body">
                      {gsc.hasData ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                          <div>
                            <div style={{ fontSize: "0.74rem", color: "var(--dgs-text-muted)" }}>Total Clicks</div>
                            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fff" }}>{gsc.clicks}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: "0.74rem", color: "var(--dgs-text-muted)" }}>Impressions</div>
                            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fff" }}>{gsc.impressions.toLocaleString()}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: "0.74rem", color: "var(--dgs-text-muted)" }}>Average CTR</div>
                            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fff" }}>{((gsc.ctr || 0) * 100).toFixed(1)}%</div>
                          </div>
                          <div>
                            <div style={{ fontSize: "0.74rem", color: "var(--dgs-text-muted)" }}>Google Avg. Position</div>
                            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fff" }}>{gsc.googleAvgPosition.toFixed(1)}</div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ padding: "20px 0", color: "var(--dgs-text-muted)" }}>
                          No Search Console telemetry for this page yet. Once Google OAuth is authorized at{" "}
                          <a href="/admin/integrations/" style={{ color: "var(--dgs-primary)" }}>
                            /admin/integrations/
                          </a>
                          , real query and impression data will automatically synchronize.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: KEYWORDS & KEYWORD GAP */}
              {activeTab === "keywords" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Keyword Gap Summary */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: "10px",
                      background: "rgba(255,255,255,0.02)",
                      padding: "14px",
                      borderRadius: "var(--dgs-radius-sm)",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>Target Keywords</div>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>{keywordGap.totalTargets || 0}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>Ranking (GSC)</div>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--dgs-success)" }}>{keywordGap.rankingCount || 0}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>Top 10 Positions</div>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#a5b4fc" }}>{keywordGap.top10Count || 0}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>Not Detected In GSC</div>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--dgs-warning)" }}>{keywordGap.notDetectedCount || 0}</div>
                    </div>
                  </div>

                  {/* Add Target Keyword Form */}
                  <form onSubmit={handleAddTargetKeyword} style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      placeholder="Add strategic target keyword (e.g. ai video production agency in mumbai)..."
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      className="dgs-saas-input"
                      style={{
                        flex: 1,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "#fff",
                        padding: "8px 12px",
                        borderRadius: "4px",
                        fontSize: "0.82rem",
                      }}
                    />
                    <button type="submit" className="dgs-saas-btn primary sm" disabled={addingKw}>
                      {addingKw ? "Adding..." : "+ Add Target"}
                    </button>
                  </form>

                  {/* Target Keywords Registry List */}
                  {keywordGap.targetDetails && keywordGap.targetDetails.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: "0.9rem", color: "#fff", margin: "0 0 10px" }}>Target Keywords Registry</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {keywordGap.targetDetails.map((tk: any) => (
                          <div
                            key={tk.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "10px 14px",
                              background: "rgba(255,255,255,0.02)",
                              borderRadius: "4px",
                              border: "1px solid rgba(255,255,255,0.05)",
                            }}
                          >
                            <div>
                              <strong style={{ fontSize: "0.84rem", color: "#fff" }}>{tk.keyword}</strong>
                              <span style={{ fontSize: "0.74rem", color: "var(--dgs-text-muted)", marginLeft: "8px" }}>
                                Group: {tk.keywordGroup}
                              </span>
                            </div>
                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                              <span
                                className={`dgs-saas-chip ${
                                  tk.status === "RANKING" ? "success" : "neutral"
                                }`}
                                style={{ fontSize: "0.7rem" }}
                              >
                                {tk.status === "RANKING"
                                  ? `RANKING (Pos ${tk.currentAvgPosition?.toFixed(1)})`
                                  : "NOT DETECTED IN GSC"}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTargetKeyword(tk.id)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "var(--dgs-danger)",
                                  cursor: "pointer",
                                  fontSize: "0.78rem",
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Queries Ranking for this Page from GSC */}
                  <div>
                    <h4 style={{ fontSize: "0.9rem", color: "#fff", margin: "0 0 10px" }}>
                      Queries Ranking For This Page (Google Search Console)
                    </h4>
                    {rankingKws.length === 0 ? (
                      <div style={{ padding: "20px", color: "var(--dgs-text-muted)", fontSize: "0.82rem" }}>
                        No query metrics recorded yet.
                      </div>
                    ) : (
                      <div className="dgs-admin-table-wrap">
                        <table className="dgs-admin-table">
                          <thead>
                            <tr>
                              <th>Query</th>
                              <th>Google Avg. Position</th>
                              <th>Clicks</th>
                              <th>Impressions</th>
                              <th>CTR</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rankingKws.map((k: any) => (
                              <tr key={k.id}>
                                <td><strong>{k.queryText}</strong></td>
                                <td>{k.googleAvgPosition.toFixed(1)}</td>
                                <td>{k.clicks}</td>
                                <td>{k.impressions.toLocaleString()}</td>
                                <td>{((k.ctr || 0) * 100).toFixed(1)}%</td>
                                <td>
                                  <span className={`dgs-saas-chip ${k.googleAvgPosition <= 3 ? "success" : k.googleAvgPosition <= 10 ? "primary" : "neutral"}`} style={{ fontSize: "0.7rem" }}>
                                    {k.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: PAGESPEED & CORE WEB VITALS */}
              {activeTab === "pagespeed" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ margin: 0, color: "#fff", fontSize: "0.95rem" }}>
                        Google PageSpeed Insights Engine
                      </h4>
                      <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "var(--dgs-text-muted)" }}>
                        Separating Lighthouse lab metrics from CrUX real-user field data.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="dgs-saas-btn primary sm"
                      disabled={recheckingPsi}
                      onClick={handleRunPageSpeed}
                    >
                      {recheckingPsi ? "Running Test..." : "Run / Recheck PageSpeed"}
                    </button>
                  </div>

                  {/* Mobile & Desktop Scores */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    {/* Mobile Card */}
                    <div className="dgs-saas-card">
                      <div className="dgs-saas-card-header">
                        <h5 className="dgs-saas-card-title">Mobile Lighthouse Lab Data</h5>
                        <span className="dgs-saas-chip primary">
                          {mobilePsi?.performanceScore != null ? `${mobilePsi.performanceScore}/100` : "NOT MEASURED"}
                        </span>
                      </div>
                      <div className="dgs-saas-card-body">
                        {mobilePsi ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.82rem" }}>
                            <div>FCP: <strong>{mobilePsi.labMetrics?.fcpMs != null ? `${mobilePsi.labMetrics.fcpMs}ms` : "—"}</strong></div>
                            <div>LCP: <strong>{mobilePsi.labMetrics?.lcpMs != null ? `${mobilePsi.labMetrics.lcpMs}ms` : "—"}</strong></div>
                            <div>CLS: <strong>{mobilePsi.labMetrics?.clsScore != null ? mobilePsi.labMetrics.clsScore : "—"}</strong></div>
                            <div>TBT: <strong>{mobilePsi.labMetrics?.tbtMs != null ? `${mobilePsi.labMetrics.tbtMs}ms` : "—"}</strong></div>
                            <div>Speed Index: <strong>{mobilePsi.labMetrics?.speedIndexMs != null ? `${mobilePsi.labMetrics.speedIndexMs}ms` : "—"}</strong></div>
                          </div>
                        ) : (
                          <span style={{ color: "var(--dgs-text-muted)", fontSize: "0.82rem" }}>
                            Mobile test not run yet. Click &lsquo;Run / Recheck PageSpeed&rsquo; above.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Desktop Card */}
                    <div className="dgs-saas-card">
                      <div className="dgs-saas-card-header">
                        <h5 className="dgs-saas-card-title">Desktop Lighthouse Lab Data</h5>
                        <span className="dgs-saas-chip success">
                          {desktopPsi?.performanceScore != null ? `${desktopPsi.performanceScore}/100` : "NOT MEASURED"}
                        </span>
                      </div>
                      <div className="dgs-saas-card-body">
                        {desktopPsi ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.82rem" }}>
                            <div>FCP: <strong>{desktopPsi.labMetrics?.fcpMs != null ? `${desktopPsi.labMetrics.fcpMs}ms` : "—"}</strong></div>
                            <div>LCP: <strong>{desktopPsi.labMetrics?.lcpMs != null ? `${desktopPsi.labMetrics.lcpMs}ms` : "—"}</strong></div>
                            <div>CLS: <strong>{desktopPsi.labMetrics?.clsScore != null ? desktopPsi.labMetrics.clsScore : "—"}</strong></div>
                            <div>TBT: <strong>{desktopPsi.labMetrics?.tbtMs != null ? `${desktopPsi.labMetrics.tbtMs}ms` : "—"}</strong></div>
                            <div>Speed Index: <strong>{desktopPsi.labMetrics?.speedIndexMs != null ? `${desktopPsi.labMetrics.speedIndexMs}ms` : "—"}</strong></div>
                          </div>
                        ) : (
                          <span style={{ color: "var(--dgs-text-muted)", fontSize: "0.82rem" }}>
                            Desktop test not run yet. Click &lsquo;Run / Recheck PageSpeed&rsquo; above.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CrUX Real-User Field Data */}
                  <div className="dgs-saas-card">
                    <div className="dgs-saas-card-header">
                      <h5 className="dgs-saas-card-title">Chrome User Experience Report (CrUX Field Data)</h5>
                      <span className="dgs-saas-chip neutral">
                        {mobilePsi?.fieldMetrics?.available ? "REAL USER DATA" : "Field Data Not Available"}
                      </span>
                    </div>
                    <div className="dgs-saas-card-body" style={{ fontSize: "0.82rem" }}>
                      {mobilePsi?.fieldMetrics?.available ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                          <div>INP: <strong>{mobilePsi.fieldMetrics.inpMs}ms</strong></div>
                          <div>TTFB: <strong>{mobilePsi.fieldMetrics.ttfbMs}ms</strong></div>
                          <div>LCP: <strong>{mobilePsi.fieldMetrics.lcpMs}ms</strong></div>
                          <div>CLS: <strong>{mobilePsi.fieldMetrics.clsScore}</strong></div>
                        </div>
                      ) : (
                        <span style={{ color: "var(--dgs-text-muted)" }}>
                          Field Data Not Available (Page does not have enough real-user traffic in the 28-day Chrome CrUX collection window to report statistical percentiles. Zero data fabricated).
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Opportunities */}
                  {mobilePsi?.opportunities && mobilePsi.opportunities.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: "0.9rem", color: "#fff", marginBottom: "8px" }}>
                        Actionable Speed Opportunities
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {mobilePsi.opportunities.map((opp: any) => (
                          <div
                            key={opp.id}
                            style={{
                              padding: "10px 14px",
                              background: "rgba(255,255,255,0.02)",
                              borderRadius: "var(--dgs-radius-sm)",
                              border: "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <strong style={{ fontSize: "0.84rem", color: "#fff" }}>{opp.title}</strong>
                              {opp.estimatedSavingsMs && (
                                <span className="dgs-saas-chip warning" style={{ fontSize: "0.7rem" }}>
                                  Save ~{opp.estimatedSavingsMs}ms
                                </span>
                              )}
                            </div>
                            <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "var(--dgs-text-muted)" }}>
                              {opp.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: TECHNICAL */}
              {activeTab === "technical" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                      padding: "16px",
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: "var(--dgs-radius-sm)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      fontSize: "0.84rem",
                    }}
                  >
                    <div>
                      <span style={{ color: "var(--dgs-text-muted)" }}>HTTP Status:</span>{" "}
                      <strong style={{ color: pageAudit.statusCode === 200 ? "var(--dgs-success)" : "var(--dgs-danger)" }}>
                        {pageAudit.statusCode}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--dgs-text-muted)" }}>Indexability:</span>{" "}
                      <strong style={{ color: pageAudit.isIndexable ? "var(--dgs-success)" : "var(--dgs-danger)" }}>
                        {pageAudit.isIndexable ? "Indexable" : "Noindex / Blocked"}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--dgs-text-muted)" }}>H1 Headings:</span>{" "}
                      <strong>{pageAudit.h1Count} found</strong> {pageAudit.h1Text ? `("${pageAudit.h1Text.slice(0, 40)}...")` : ""}
                    </div>
                    <div>
                      <span style={{ color: "var(--dgs-text-muted)" }}>Canonical Tag:</span>{" "}
                      <code>{pageAudit.canonicalUrl || "Missing"}</code>
                    </div>
                    <div>
                      <span style={{ color: "var(--dgs-text-muted)" }}>Internal Links:</span>{" "}
                      <strong>{pageAudit.internalLinksCount || 0} links</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--dgs-text-muted)" }}>External Links:</span>{" "}
                      <strong>{pageAudit.externalLinksCount || 0} links</strong>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: "0.9rem", color: "#fff", marginBottom: "6px" }}>Page Title</h4>
                    <p style={{ margin: 0, fontSize: "0.84rem", color: "#ddd", background: "rgba(255,255,255,0.03)", padding: "8px 12px", borderRadius: "4px" }}>
                      {pageAudit.title || "No <title> tag detected"}
                    </p>
                  </div>

                  <div>
                    <h4 style={{ fontSize: "0.9rem", color: "#fff", marginBottom: "6px" }}>Meta Description</h4>
                    <p style={{ margin: 0, fontSize: "0.84rem", color: "#ddd", background: "rgba(255,255,255,0.03)", padding: "8px 12px", borderRadius: "4px" }}>
                      {pageAudit.metaDescription || "No meta description tag detected"}
                    </p>
                  </div>

                  <div>
                    <h4 style={{ fontSize: "0.9rem", color: "#fff", marginBottom: "6px" }}>Structured Data (Schema.org)</h4>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {pageAudit.schemaTypes && pageAudit.schemaTypes.length > 0 ? (
                        pageAudit.schemaTypes.map((st: string, idx: number) => (
                          <span key={idx} className="dgs-saas-chip success" style={{ fontSize: "0.72rem" }}>
                            {st}
                          </span>
                        ))
                      ) : (
                        <span className="dgs-saas-chip warning">No Schema Markup Detected</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: MEDIA */}
              {activeTab === "media" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ margin: 0, color: "#fff", fontSize: "0.95rem" }}>
                        Images &amp; Accessibility Alt Attributes
                      </h4>
                      <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "var(--dgs-text-muted)" }}>
                        Total images: {pageAudit.imagesCount || 0} · Missing Alt: {missingAlts.length}
                      </p>
                    </div>
                    {missingAlts.length > 0 && (
                      <button
                        type="button"
                        className="dgs-saas-btn primary sm"
                        onClick={() => setAltFixerOpen(true)}
                      >
                        Open Alt Fixer Drawer ({missingAlts.length})
                      </button>
                    )}
                  </div>

                  {missingAlts.length === 0 ? (
                    <div style={{ padding: "30px", textAlign: "center", color: "var(--dgs-success)", fontSize: "0.88rem" }}>
                      ✓ All images on this page have descriptive alt text or are valid decorative elements.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {missingAlts.map((ma: any) => (
                        <div
                          key={ma.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 14px",
                            background: "rgba(255,255,255,0.02)",
                            borderRadius: "var(--dgs-radius-sm)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            <div style={{ width: "48px", height: "36px", background: "#111", borderRadius: "3px", overflow: "hidden" }}>
                              <img src={ma.imageSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                            <div>
                              <strong style={{ fontSize: "0.82rem", color: "#fff" }}>{ma.filename}</strong>
                              <div style={{ fontSize: "0.74rem", color: "var(--dgs-text-muted)" }}>
                                Status: <span style={{ color: "var(--dgs-warning)" }}>{ma.altStatus}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="dgs-saas-btn secondary sm"
                            onClick={() => setAltFixerOpen(true)}
                          >
                            Fix Alt
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: RECOMMENDATIONS */}
              {activeTab === "recommendations" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {isTopRanking && (
                    <div
                      style={{
                        padding: "12px 16px",
                        background: "rgba(16, 185, 129, 0.08)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        borderRadius: "var(--dgs-radius-sm)",
                        fontSize: "0.82rem",
                        color: "#6ee7b7",
                      }}
                    >
                      <strong>PROTECTED RANKING BASELINE:</strong> This page holds top-tier Google ranking (Avg. Position {gsc.googleAvgPosition.toFixed(1)}). Automated rewriting of Title, H1, or core content is strictly forbidden. Recommendations focus exclusively on safe supporting sections, internal links, FAQ expansions, schema markup, and speed optimizations.
                    </div>
                  )}

                  {recommendations.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "var(--dgs-success)" }}>
                      ✓ No blocking issues found. Page adheres fully to DGS SEO standards.
                    </div>
                  ) : (
                    recommendations.map((rec: any, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          padding: "16px",
                          background: "rgba(255,255,255,0.02)",
                          borderRadius: "var(--dgs-radius-sm)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span
                            className={`dgs-saas-chip ${
                              rec.priority === "CRITICAL"
                                ? "danger"
                                : rec.priority === "HIGH"
                                ? "warning"
                                : "primary"
                            }`}
                          >
                            {rec.priority} PRIORITY
                          </span>
                          <span style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>
                            Risk: <strong>{rec.riskToExistingRanking}</strong>
                          </span>
                        </div>

                        <div>
                          <strong style={{ fontSize: "0.88rem", color: "#fff" }}>{rec.problem}</strong>
                          <p style={{ margin: "3px 0 0", fontSize: "0.78rem", color: "var(--dgs-text-muted)" }}>
                            Evidence: {rec.evidence}
                          </p>
                        </div>

                        <div style={{ background: "rgba(99, 102, 241, 0.08)", padding: "10px 12px", borderRadius: "4px", fontSize: "0.82rem", color: "#c7d2fe" }}>
                          <strong>Recommended Action:</strong> {rec.recommendedAction}
                        </div>

                        <div style={{ fontSize: "0.76rem", color: "var(--dgs-text-muted)" }}>
                          Expected SEO Purpose: {rec.expectedPurpose}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}

          {/* Footer Actions */}
          <div
            style={{
              marginTop: "auto",
              paddingTop: "16px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="dgs-saas-btn secondary sm"
            >
              Open Live Page ↗
            </a>
            <button type="button" className="dgs-saas-btn secondary sm" onClick={onClose}>
              Close Intelligence Panel
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Alt Fixer Drawer when triggered from Media tab */}
      <AltFixerDrawer
        pageUrl={url}
        isOpen={altFixerOpen}
        onClose={() => {
          setAltFixerOpen(false);
          fetchPageIntel();
        }}
        onUpdated={() => {
          fetchPageIntel();
          if (onRefresh) onRefresh();
        }}
      />
    </>
  );
}
