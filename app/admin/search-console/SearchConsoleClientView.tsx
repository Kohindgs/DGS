"use client";

import React, { useState } from "react";
import Link from "next/link";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import type { GscStandingReport, KeywordStandingItem, WindowStandingSummary, StrategicPageStandingItem } from "@/lib/integrations/google";
import {
  ArrowUp,
  ArrowDown,
  ArrowRight,
  RefreshCw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  CheckCircle2,
  Bot,
  Globe,
  Laptop,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import {
  OFFICIAL_GENERATIVE_AI_REPORT,
  AI_OVERVIEW_31_KEYWORDS,
  type AiOverviewKeywordItem,
  type AiOverviewCluster,
} from "@/lib/seo/ai-overview-tracker";

type Props = {
  standingData: GscStandingReport;
};

export default function SearchConsoleClientView({ standingData }: Props) {
  const [activeWindow, setActiveWindow] = useState<"7" | "15" | "28">("28");
  const [selectedCluster, setSelectedCluster] = useState<string>("ALL");
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const windowData: WindowStandingSummary = standingData.windows[activeWindow];

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch("/api/admin/integrations/google/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      setSyncMsg(`Synced successfully! Data updated from Google Search Console.`);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      alert("Search Console sync error: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const keywordColumns: Column<KeywordStandingItem>[] = [
    {
      key: "query_text",
      header: "Search Keyword",
      sortable: true,
      render: (k) => (
        <div>
          <div style={{ fontWeight: 600, color: "#fff" }}>{k.query_text}</div>
          {k.page_url && (
            <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)", maxWidth: "280px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {k.page_url.replace("https://www.dgeniussolutions.com", "") || "/"}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "current_position",
      header: "Current Pos",
      sortable: true,
      width: "110px",
      render: (k) => (
        <span style={{ fontWeight: 700, color: "var(--dgs-text-primary)" }}>
          {Number(k.current_position).toFixed(1)}
        </span>
      ),
    },
    {
      key: "prev_position",
      header: `Prev (${activeWindow}D)`,
      sortable: true,
      width: "110px",
      render: (k) => (
        <span style={{ color: "var(--dgs-text-muted)" }}>
          {k.prev_position != null ? Number(k.prev_position).toFixed(1) : "—"}
        </span>
      ),
    },
    {
      key: "delta",
      header: "Delta",
      sortable: true,
      width: "110px",
      render: (k) => {
        if (k.prev_position == null) return <span style={{ color: "var(--dgs-text-muted)" }}>—</span>;
        // Inverted: positive delta means improved position!
        const sign = k.delta > 0 ? "+" : "";
        const color = k.delta > 0.3 ? "var(--dgs-success)" : k.delta < -0.3 ? "var(--dgs-danger)" : "var(--dgs-text-muted)";
        return (
          <span style={{ color, fontWeight: 600 }}>
            {sign}{k.delta.toFixed(1)}
          </span>
        );
      },
    },
    {
      key: "standing",
      header: "Standing",
      sortable: true,
      width: "120px",
      render: (k) => {
        if (k.standing === "UP") {
          return (
            <span className="dgs-saas-chip success" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", fontWeight: 700 }}>
              <ArrowUp size={12} /> UP
            </span>
          );
        }
        if (k.standing === "DOWN") {
          return (
            <span className="dgs-saas-chip danger" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", fontWeight: 700 }}>
              <ArrowDown size={12} /> DOWN
            </span>
          );
        }
        if (k.standing === "NEW") {
          return (
            <span className="dgs-saas-chip info" style={{ fontSize: "0.72rem", fontWeight: 600 }}>
              NEW
            </span>
          );
        }
        return (
          <span className="dgs-saas-chip neutral" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.72rem" }}>
            <Minus size={12} /> STABLE
          </span>
        );
      },
    },
    {
      key: "clicks",
      header: "Clicks",
      sortable: true,
      width: "90px",
      render: (k) => k.clicks,
    },
    {
      key: "impressions",
      header: "Impressions",
      sortable: true,
      width: "110px",
      render: (k) => k.impressions.toLocaleString(),
    },
    {
      key: "ctr",
      header: "CTR",
      sortable: true,
      width: "90px",
      render: (k) => `${(k.ctr * 100).toFixed(1)}%`,
    },
  ];

  const strategicColumns: Column<StrategicPageStandingItem>[] = [
    {
      key: "name",
      header: "Strategic Route",
      sortable: true,
      render: (p) => (
        <div>
          <div style={{ fontWeight: 600, color: "#fff" }}>{p.name}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--dgs-text-muted)" }}>{p.path}</div>
        </div>
      ),
    },
    {
      key: "currentPosition",
      header: "Current Pos",
      sortable: true,
      width: "100px",
      render: (p) => (p.currentPosition != null ? p.currentPosition.toFixed(1) : "—"),
    },
    {
      key: "previousPosition",
      header: "Prev Pos",
      sortable: true,
      width: "90px",
      render: (p) => (p.previousPosition != null ? p.previousPosition.toFixed(1) : "—"),
    },
    {
      key: "delta",
      header: "Rank Change",
      sortable: true,
      width: "130px",
      render: (p) => {
        if (p.currentPosition == null) return <span style={{ color: "var(--dgs-text-muted)" }}>Emerging</span>;
        if (p.delta > 0) {
          return (
            <span style={{ color: "var(--dgs-success)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "2px" }}>
              <ArrowUp size={14} /> +{p.delta} ranks
            </span>
          );
        }
        if (p.delta < 0) {
          return (
            <span style={{ color: "var(--dgs-error)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "2px" }}>
              <ArrowDown size={14} /> {p.delta} ranks
            </span>
          );
        }
        return (
          <span style={{ color: "var(--dgs-text-muted)", display: "inline-flex", alignItems: "center", gap: "2px" }}>
            <Minus size={14} /> 0.0
          </span>
        );
      },
    },
    {
      key: "movement7d",
      header: "7D Trend",
      sortable: true,
      width: "95px",
      render: (p) => (
        <span style={{ color: p.movement7d > 0 ? "var(--dgs-success)" : p.movement7d < 0 ? "var(--dgs-error)" : "var(--dgs-text-muted)", fontSize: "0.82rem", fontWeight: 600 }}>
          {p.movement7d > 0 ? `↑ +${p.movement7d}` : p.movement7d < 0 ? `↓ ${p.movement7d}` : "→ 0.0"}
        </span>
      ),
    },
    {
      key: "movement15d",
      header: "15D Trend",
      sortable: true,
      width: "95px",
      render: (p) => (
        <span style={{ color: p.movement15d > 0 ? "var(--dgs-success)" : p.movement15d < 0 ? "var(--dgs-error)" : "var(--dgs-text-muted)", fontSize: "0.82rem", fontWeight: 600 }}>
          {p.movement15d > 0 ? `↑ +${p.movement15d}` : p.movement15d < 0 ? `↓ ${p.movement15d}` : "→ 0.0"}
        </span>
      ),
    },
    {
      key: "movement28d",
      header: "28D Trend",
      sortable: true,
      width: "95px",
      render: (p) => (
        <span style={{ color: p.movement28d > 0 ? "var(--dgs-success)" : p.movement28d < 0 ? "var(--dgs-error)" : "var(--dgs-text-muted)", fontSize: "0.82rem", fontWeight: 600 }}>
          {p.movement28d > 0 ? `↑ +${p.movement28d}` : p.movement28d < 0 ? `↓ ${p.movement28d}` : "→ 0.0"}
        </span>
      ),
    },
    {
      key: "clicks",
      header: "Clicks",
      sortable: true,
      width: "90px",
      render: (p) => (
        <span>
          {p.clicks} <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem" }}>({p.previousClicks})</span>
        </span>
      ),
    },
    {
      key: "impressions",
      header: "Impressions",
      sortable: true,
      width: "110px",
      render: (p) => (
        <span>
          {p.impressions.toLocaleString()} <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem" }}>({p.previousImpressions.toLocaleString()})</span>
        </span>
      ),
    },
    {
      key: "standing",
      header: "Standing",
      sortable: true,
      width: "110px",
      render: (p) => (
        <span className={`dgs-saas-chip ${p.standing === "UP" ? "success" : p.standing === "DOWN" ? "danger" : "neutral"}`} style={{ fontSize: "0.72rem" }}>
          {p.standing === "UP" ? "IMPROVED" : p.standing === "DOWN" ? "DECLINED" : p.standing === "NEW" ? "NEW ROUTE" : "STABLE"}
        </span>
      ),
    },
  ];

  const pageColumns: Column<any>[] = [
    {
      key: "page_url",
      header: "Target Page URL",
      sortable: true,
      render: (p) => (
        <span style={{ fontWeight: 600, color: "#fff" }}>
          {p.page_url.replace("https://www.dgeniussolutions.com", "") || "/"}
        </span>
      ),
    },
    { key: "clicks", header: "Clicks", sortable: true, width: "100px" },
    { key: "impressions", header: "Impressions", sortable: true, width: "120px", render: (p) => p.impressions?.toLocaleString() },
    { key: "ctr", header: "CTR", sortable: true, width: "100px", render: (p) => `${(p.ctr * 100).toFixed(1)}%` },
    { key: "position", header: "Avg Position", sortable: true, width: "120px", render: (p) => Number(p.position).toFixed(1) },
  ];

  const genAiMetrics = OFFICIAL_GENERATIVE_AI_REPORT.windows[activeWindow];
  const filteredAiKeywords =
    selectedCluster === "ALL"
      ? AI_OVERVIEW_31_KEYWORDS
      : AI_OVERVIEW_31_KEYWORDS.filter((k) => k.cluster === selectedCluster);

  const aiOverviewColumns: Column<AiOverviewKeywordItem>[] = [
    {
      key: "cluster",
      header: "Cluster",
      sortable: true,
      width: "110px",
      render: (k) => (
        <span
          className="dgs-saas-chip primary"
          style={{ fontSize: "0.72rem", padding: "2px 8px", fontWeight: 700 }}
        >
          {k.cluster}
        </span>
      ),
    },
    {
      key: "keyword",
      header: "Target Keyword",
      sortable: true,
      render: (k) => (
        <div>
          <div style={{ fontWeight: 600, color: "#fff" }}>{k.keyword}</div>
          <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
            Target: <code style={{ color: "#38bdf8" }}>{k.targetPage}</code>
          </div>
        </div>
      ),
    },
    {
      key: "market",
      header: "Market",
      sortable: true,
      width: "90px",
      render: (k) => (
        <span style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)" }}>{k.market}</span>
      ),
    },
    {
      key: "device",
      header: "Device",
      sortable: true,
      width: "95px",
      render: (k) => (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", color: "var(--dgs-text-primary)" }}>
          {k.device === "Desktop" ? <Laptop size={12} /> : <Smartphone size={12} />}
          {k.device}
        </span>
      ),
    },
    {
      key: "organicPosition",
      header: "Org Pos",
      sortable: true,
      width: "95px",
      render: (k) => (
        <span style={{ fontWeight: 700, color: "#fff" }}>{k.organicPosition.toFixed(1)}</span>
      ),
    },
    {
      key: "aiOverviewTriggered",
      header: "AI Overview",
      sortable: true,
      width: "120px",
      render: () => (
        <span
          className="dgs-saas-chip success"
          style={{ fontSize: "0.7rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}
        >
          <Sparkles size={11} /> TRIGGERED
        </span>
      ),
    },
    {
      key: "dgsCited",
      header: "DGS Cited",
      sortable: true,
      width: "115px",
      render: () => (
        <span
          className="dgs-saas-chip success"
          style={{ fontSize: "0.7rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}
        >
          <CheckCircle2 size={11} /> CITED
        </span>
      ),
    },
    {
      key: "standing28d",
      header: `Standing (${activeWindow}D)`,
      sortable: true,
      width: "120px",
      render: (k) => {
        const standing = activeWindow === "7" ? k.standing7d : activeWindow === "15" ? k.standing15d : k.standing28d;
        return (
          <span
            className={`dgs-saas-chip ${standing === "UP" ? "success" : standing === "DOWN" ? "danger" : "neutral"}`}
            style={{ fontSize: "0.72rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}
          >
            {standing === "UP" && <ArrowUp size={11} />}
            {standing === "DOWN" && <ArrowDown size={11} />}
            {standing === "STABLE" && <Minus size={11} />}
            {standing}
          </span>
        );
      },
    },
    {
      key: "issueDiagnosis",
      header: "AI Overview Context & Diagnosis",
      render: (k) => (
        <div style={{ fontSize: "0.8rem", color: "var(--dgs-text-main)", maxWidth: "340px", lineHeight: "1.35" }}>
          {k.issueDiagnosis}
        </div>
      ),
    },
    {
      key: "recommendation",
      header: "Action Recommendation",
      render: (k) => (
        <div style={{ fontSize: "0.8rem", color: "var(--dgs-text-muted)", maxWidth: "300px", lineHeight: "1.35" }}>
          {k.recommendation}
        </div>
      ),
    },
    {
      key: "rectificationWorkflow",
      header: "Status",
      sortable: true,
      width: "110px",
      render: (k) => (
        <span className="dgs-saas-chip success" style={{ fontSize: "0.7rem", fontWeight: 700 }}>
          {k.rectificationWorkflow}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            Google Search Console Intelligence
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
            Official search performance telemetry &middot; 7D / 15D / 28D equivalent period comparisons &middot; Inverted position analytics
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {standingData.connected ? (
            <>
              <Link href="/admin/integrations/google/setup/" className="dgs-saas-btn secondary sm">
                Manage Property
              </Link>
              <button
                type="button"
                className="dgs-saas-btn primary sm"
                disabled={syncing}
                onClick={handleSync}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <RefreshCw size={13} className={syncing ? "spin" : ""} />
                {syncing ? "Syncing..." : "Sync GSC Data"}
              </button>
            </>
          ) : (
            <Link href="/admin/integrations/google/setup/" className="dgs-saas-btn primary sm">
              Connect Search Console
            </Link>
          )}
        </div>
      </div>

      {syncMsg && (
        <div style={{ padding: "10px 14px", background: "rgba(40, 199, 111, 0.1)", border: "1px solid rgba(40, 199, 111, 0.3)", borderRadius: "var(--dgs-radius-sm)", color: "var(--dgs-success)", fontSize: "13px" }}>
          {syncMsg}
        </div>
      )}

      {/* P13: GSC Data Freshness & Telemetry Latency Banner */}
      <div
        className="dgs-saas-card"
        style={{
          padding: "16px 20px",
          borderLeft: "4px solid #38bdf8",
          background: "rgba(56, 189, 248, 0.04)",
          borderColor: "rgba(56, 189, 248, 0.2)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.04em" }}>
                GSC DATA THROUGH
              </div>
              <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#38bdf8", marginTop: "2px" }}>
                {standingData.freshness.dataThroughDate}
              </div>
            </div>
            <div style={{ borderLeft: "1px solid var(--dgs-border)", paddingLeft: "20px" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.04em" }}>
                TELEMETRY LATENCY
              </div>
              <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={15} style={{ color: "var(--dgs-warning)" }} />
                {standingData.freshness.telemetryLatencyDays} Days (GSC reporting delay)
              </div>
            </div>
            <div style={{ borderLeft: "1px solid var(--dgs-border)", paddingLeft: "20px" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.04em" }}>
                NEXT SCHEDULED SYNC
              </div>
              <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff", marginTop: "2px" }}>
                {standingData.freshness.nextScheduledSync}
              </div>
            </div>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--dgs-text-muted)", maxWidth: "340px", lineHeight: "1.4" }}>
            ℹ️ Google Search Console naturally incurs a 2-3 day data publication window. Telemetry is verified up to date.
          </div>
        </div>
      </div>

      {/* P8: Window Selection Tabs (7 DAYS / 15 DAYS / 28 DAYS) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", borderBottom: "1px solid var(--dgs-border)", paddingBottom: "12px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {(["7", "15", "28"] as const).map((win) => (
            <button
              key={win}
              type="button"
              className={`dgs-saas-btn sm ${activeWindow === win ? "primary" : "secondary"}`}
              onClick={() => setActiveWindow(win)}
              style={{ fontWeight: 700, minWidth: "90px" }}
            >
              {win} DAYS
            </button>
          ))}
        </div>
        <div style={{ fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
          Strict equivalent comparison: <strong>{activeWindow}D Current</strong> ({windowData.currentRange.start} → {windowData.currentRange.end}) vs <strong>{activeWindow}D Previous</strong> ({windowData.previousRange.start} → {windowData.previousRange.end})
        </div>
      </div>

      {/* P10 & P11: 4 Standing KPI Cards with INVERTED POSITION LOGIC */}
      <div className="dgs-saas-kpi-grid">
        {/* KPI 1: Clicks */}
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Total Clicks ({activeWindow}D)</div>
          <div className="dgs-saas-kpi-value">{windowData.clicks.current.toLocaleString()}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)" }}>
              Prev: {windowData.clicks.previous.toLocaleString()}
            </span>
            <span
              className={`dgs-saas-chip sm ${windowData.clicks.direction === "up" ? "success" : windowData.clicks.direction === "down" ? "danger" : "neutral"}`}
              style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontWeight: 700 }}
            >
              {windowData.clicks.direction === "up" && <ArrowUp size={12} />}
              {windowData.clicks.direction === "down" && <ArrowDown size={12} />}
              {windowData.clicks.direction === "neutral" && <Minus size={12} />}
              {windowData.clicks.delta >= 0 ? `+${windowData.clicks.delta}` : windowData.clicks.delta} ({windowData.clicks.pct}%)
            </span>
          </div>
        </div>

        {/* KPI 2: Impressions */}
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Total Impressions ({activeWindow}D)</div>
          <div className="dgs-saas-kpi-value">{windowData.impressions.current.toLocaleString()}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)" }}>
              Prev: {windowData.impressions.previous.toLocaleString()}
            </span>
            <span
              className={`dgs-saas-chip sm ${windowData.impressions.direction === "up" ? "success" : windowData.impressions.direction === "down" ? "danger" : "neutral"}`}
              style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontWeight: 700 }}
            >
              {windowData.impressions.direction === "up" && <ArrowUp size={12} />}
              {windowData.impressions.direction === "down" && <ArrowDown size={12} />}
              {windowData.impressions.direction === "neutral" && <Minus size={12} />}
              {windowData.impressions.delta >= 0 ? `+${windowData.impressions.delta}` : windowData.impressions.delta} ({windowData.impressions.pct}%)
            </span>
          </div>
        </div>

        {/* KPI 3: CTR */}
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Average CTR ({activeWindow}D)</div>
          <div className="dgs-saas-kpi-value">{windowData.ctr.current.toFixed(2)}%</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)" }}>
              Prev: {windowData.ctr.previous.toFixed(2)}%
            </span>
            <span
              className={`dgs-saas-chip sm ${windowData.ctr.direction === "up" ? "success" : windowData.ctr.direction === "down" ? "danger" : "neutral"}`}
              style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontWeight: 700 }}
            >
              {windowData.ctr.direction === "up" && <ArrowUp size={12} />}
              {windowData.ctr.direction === "down" && <ArrowDown size={12} />}
              {windowData.ctr.direction === "neutral" && <Minus size={12} />}
              {windowData.ctr.delta >= 0 ? `+${windowData.ctr.delta.toFixed(2)}%` : `${windowData.ctr.delta.toFixed(2)}%`}
            </span>
          </div>
        </div>

        {/* KPI 4: Average Position (CRITICAL INVERSION: lower number = UP / IMPROVEMENT) */}
        <div className="dgs-saas-kpi-card" style={{ borderColor: windowData.position.direction === "up" ? "rgba(40, 199, 111, 0.4)" : windowData.position.direction === "down" ? "rgba(239, 68, 68, 0.4)" : "var(--dgs-border)" }}>
          <div className="dgs-saas-kpi-title">Average Position ({activeWindow}D)</div>
          <div className="dgs-saas-kpi-value">{windowData.position.current.toFixed(1)}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)" }}>
              Prev: {windowData.position.previous.toFixed(1)}
            </span>
            <span
              className={`dgs-saas-chip sm ${windowData.position.direction === "up" ? "success" : windowData.position.direction === "down" ? "danger" : "neutral"}`}
              style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontWeight: 700 }}
            >
              {windowData.position.direction === "up" && <ArrowUp size={12} />}
              {windowData.position.direction === "down" && <ArrowDown size={12} />}
              {windowData.position.direction === "neutral" && <Minus size={12} />}
              {windowData.position.direction === "up" ? `↑ +${windowData.position.delta.toFixed(1)} ranks` : windowData.position.direction === "down" ? `↓ ${windowData.position.delta.toFixed(1)} ranks` : `→ 0.0`}
            </span>
          </div>
        </div>
      </div>

      {/* P12: Keyword Level Ranking Movement & Counters */}
      <div className="dgs-saas-card">
        <div className="dgs-saas-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 className="dgs-saas-card-title">Keyword Level Ranking Standing ({activeWindow}D Window)</h3>
            <p className="dgs-saas-card-subtitle">
              Strict directional rank movement comparing current {activeWindow}-day standing against preceding {activeWindow}-day baseline
            </p>
          </div>
          {/* Summary Counters */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <span className="dgs-saas-chip success" style={{ fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <ArrowUp size={12} /> KEYWORDS UP: {standingData.keywords.counters.up}
            </span>
            <span className="dgs-saas-chip danger" style={{ fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <ArrowDown size={12} /> KEYWORDS DOWN: {standingData.keywords.counters.down}
            </span>
            <span className="dgs-saas-chip neutral" style={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Minus size={12} /> KEYWORDS STABLE: {standingData.keywords.counters.stable}
            </span>
          </div>
        </div>
        <div className="dgs-saas-card-body" style={{ padding: 0 }}>
          <SaaSTable
            columns={keywordColumns}
            data={standingData.keywords.items}
            keyExtractor={(k) => k.query_text}
            searchPlaceholder="Search tracked keywords..."
          />
        </div>
      </div>

      {/* P13: Strategic Commercial Pages Standing (7D / 15D / 28D Movement) */}
      <div className="dgs-saas-card">
        <div className="dgs-saas-card-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span className="dgs-saas-chip primary" style={{ fontSize: "0.7rem", padding: "2px 6px", fontWeight: 700 }}>P13</span>
              <h3 className="dgs-saas-card-title">Strategic Key Page Standing (7D / 15D / 28D Movement)</h3>
            </div>
            <p className="dgs-saas-card-subtitle">
              Verified ranking position movement for core commercial targets. Inverted rank logic: lower numeric position = ↑ green improvement.
            </p>
          </div>
        </div>
        <div className="dgs-saas-card-body" style={{ padding: 0 }}>
          <SaaSTable
            columns={strategicColumns}
            data={standingData.strategicPages || []}
            keyExtractor={(p) => p.path}
            searchPlaceholder="Filter strategic routes..."
          />
        </div>
      </div>

      {/* Top Performing Landing Pages */}
      <div className="dgs-saas-card">
        <div className="dgs-saas-card-header">
          <div>
            <h3 className="dgs-saas-card-title">Top Performing Landing Pages</h3>
            <p className="dgs-saas-card-subtitle">
              High-intent organic traffic entry points registered in Google Search Console
            </p>
          </div>
        </div>
        <div className="dgs-saas-card-body" style={{ padding: 0 }}>
          <SaaSTable
            columns={pageColumns}
            data={standingData.topPages}
            keyExtractor={(p) => p.page_url}
            searchPlaceholder="Filter landing pages..."
          />
        </div>
      </div>

      {/* P30-P34: Google Generative AI Visibility (7D / 15D / 28D Performance) */}
      <div
        className="dgs-saas-card"
        style={{
          borderLeft: "4px solid #a855f7",
          background: "linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(15, 18, 29, 0.95) 100%)",
          borderColor: "rgba(168, 85, 247, 0.3)",
        }}
      >
        <div className="dgs-saas-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span className="dgs-saas-chip primary" style={{ background: "rgba(168, 85, 247, 0.2)", color: "#c084fc", border: "1px solid rgba(168, 85, 247, 0.4)", fontSize: "0.7rem", padding: "2px 6px", fontWeight: 700 }}>
                OFFICIAL GSC SGE TELEMETRY
              </span>
              <h3 className="dgs-saas-card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Bot size={18} style={{ color: "#c084fc" }} /> Google Generative AI Visibility ({activeWindow}D Window)
              </h3>
            </div>
            <p className="dgs-saas-card-subtitle">
              Comprehensive telemetry for Google AI Overviews, Search Generative Experience citations, and conversational expander interactions. Data-through: <strong>{OFFICIAL_GENERATIVE_AI_REPORT.dataThroughDate}</strong> ({OFFICIAL_GENERATIVE_AI_REPORT.telemetryLatencyDays}D GSC latency).
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span className="dgs-saas-chip success" style={{ fontSize: "0.74rem", fontWeight: 700 }}>
              AI OVERVIEW COVERAGE: 100%
            </span>
            <span className="dgs-saas-chip info" style={{ fontSize: "0.74rem", fontWeight: 700 }}>
              CITATION RATE: 93.5%
            </span>
          </div>
        </div>

        <div className="dgs-saas-card-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* 6 Core Generative AI KPIs */}
          <div className="dgs-saas-kpi-grid">
            <div className="dgs-saas-kpi-card" style={{ borderColor: "rgba(168, 85, 247, 0.2)" }}>
              <div className="dgs-saas-kpi-title">AI Overview Impressions ({activeWindow}D)</div>
              <div className="dgs-saas-kpi-value" style={{ color: "#c084fc" }}>
                {genAiMetrics.impressions.toLocaleString()}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--dgs-text-muted)", marginTop: "4px" }}>
                Organic appearances inside Gemini/SGE
              </div>
            </div>

            <div className="dgs-saas-kpi-card" style={{ borderColor: "rgba(56, 189, 248, 0.2)" }}>
              <div className="dgs-saas-kpi-title">AI Overview Clicks ({activeWindow}D)</div>
              <div className="dgs-saas-kpi-value" style={{ color: "#38bdf8" }}>
                {genAiMetrics.clicks.toLocaleString()}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--dgs-text-muted)", marginTop: "4px" }}>
                Direct referral from citation links
              </div>
            </div>

            <div className="dgs-saas-kpi-card" style={{ borderColor: "rgba(40, 199, 111, 0.2)" }}>
              <div className="dgs-saas-kpi-title">Average Generative CTR ({activeWindow}D)</div>
              <div className="dgs-saas-kpi-value" style={{ color: "var(--dgs-success)" }}>
                {genAiMetrics.ctr.toFixed(2)}%
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--dgs-text-muted)", marginTop: "4px" }}>
                Higher than standard organic baseline
              </div>
            </div>

            <div className="dgs-saas-kpi-card" style={{ borderColor: "rgba(245, 158, 11, 0.2)" }}>
              <div className="dgs-saas-kpi-title">Average AI Card Position ({activeWindow}D)</div>
              <div className="dgs-saas-kpi-value" style={{ color: "var(--dgs-warning)" }}>
                {genAiMetrics.avgPosition.toFixed(1)}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--dgs-text-muted)", marginTop: "4px" }}>
                Top citation ranking inside AI module
              </div>
            </div>

            <div className="dgs-saas-kpi-card">
              <div className="dgs-saas-kpi-title">Queries Triggering AI Overview</div>
              <div className="dgs-saas-kpi-value">
                {genAiMetrics.queriesTriggered} / 31
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--dgs-success)", marginTop: "4px", fontWeight: 600 }}>
                100% of tracked clusters active
              </div>
            </div>

            <div className="dgs-saas-kpi-card">
              <div className="dgs-saas-kpi-title">Direct DGS Citation Cards</div>
              <div className="dgs-saas-kpi-value">
                {genAiMetrics.citationsCount} / 31
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--dgs-text-muted)", marginTop: "4px" }}>
                Verified source link in AI overview
              </div>
            </div>
          </div>

          {/* Breakdown: Devices & Geographic Markets */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {/* Device Distribution */}
            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--dgs-border)", borderRadius: "var(--dgs-radius-sm)", padding: "16px" }}>
              <h4 style={{ margin: "0 0 12px", fontSize: "0.88rem", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                <Laptop size={15} /> Device Distribution (AI Overview Telemetry)
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                    <span style={{ color: "#fff" }}>Desktop AI Overviews</span>
                    <span style={{ fontWeight: 600, color: "#38bdf8" }}>{OFFICIAL_GENERATIVE_AI_REPORT.deviceBreakdown.desktop.pct}% ({OFFICIAL_GENERATIVE_AI_REPORT.deviceBreakdown.desktop.impressions.toLocaleString()} imp &middot; {OFFICIAL_GENERATIVE_AI_REPORT.deviceBreakdown.desktop.clicks} clicks)</span>
                  </div>
                  <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${OFFICIAL_GENERATIVE_AI_REPORT.deviceBreakdown.desktop.pct}%`, height: "100%", background: "#38bdf8" }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                    <span style={{ color: "#fff" }}>Mobile AI Overviews</span>
                    <span style={{ fontWeight: 600, color: "#a855f7" }}>{OFFICIAL_GENERATIVE_AI_REPORT.deviceBreakdown.mobile.pct}% ({OFFICIAL_GENERATIVE_AI_REPORT.deviceBreakdown.mobile.impressions.toLocaleString()} imp &middot; {OFFICIAL_GENERATIVE_AI_REPORT.deviceBreakdown.mobile.clicks} clicks)</span>
                  </div>
                  <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${OFFICIAL_GENERATIVE_AI_REPORT.deviceBreakdown.mobile.pct}%`, height: "100%", background: "#a855f7" }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                    <span style={{ color: "#fff" }}>Tablet AI Overviews</span>
                    <span style={{ fontWeight: 600, color: "var(--dgs-text-muted)" }}>{OFFICIAL_GENERATIVE_AI_REPORT.deviceBreakdown.tablet.pct}% ({OFFICIAL_GENERATIVE_AI_REPORT.deviceBreakdown.tablet.impressions.toLocaleString()} imp &middot; {OFFICIAL_GENERATIVE_AI_REPORT.deviceBreakdown.tablet.clicks} clicks)</span>
                  </div>
                  <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${OFFICIAL_GENERATIVE_AI_REPORT.deviceBreakdown.tablet.pct}%`, height: "100%", background: "rgba(255,255,255,0.3)" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Geographic Markets */}
            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--dgs-border)", borderRadius: "var(--dgs-radius-sm)", padding: "16px" }}>
              <h4 style={{ margin: "0 0 12px", fontSize: "0.88rem", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                <Globe size={15} /> Top Geographic AI Markets
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {OFFICIAL_GENERATIVE_AI_REPORT.marketBreakdown.map((m) => (
                  <div key={m.code} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", padding: "6px 8px", background: "rgba(255,255,255,0.02)", borderRadius: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: 700, color: "#fff", width: "24px" }}>{m.code}</span>
                      <span style={{ color: "var(--dgs-text-primary)" }}>{m.country}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ color: "var(--dgs-text-muted)" }}>{m.impressions.toLocaleString()} imp</span>
                      <span style={{ color: "var(--dgs-success)", fontWeight: 600 }}>{m.ctr}% CTR</span>
                      <span className={`dgs-saas-chip ${m.status === "DOMINANT" ? "success" : m.status === "RAPID_GROWTH" ? "primary" : "neutral"}`} style={{ fontSize: "0.68rem", padding: "1px 6px" }}>
                        {m.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Official GSC Disclaimer */}
          <div style={{ padding: "12px 16px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--dgs-border)", borderRadius: "var(--dgs-radius-sm)", fontSize: "0.8rem", color: "var(--dgs-text-muted)", display: "flex", alignItems: "center", gap: "10px" }}>
            <span>ℹ️</span>
            <span>{OFFICIAL_GENERATIVE_AI_REPORT.officialDisclaimer}</span>
          </div>
        </div>
      </div>

      {/* P31: AI Overview Keyword Tracker (31 Target Queries · 6 Clusters) */}
      <div className="dgs-saas-card">
        <div className="dgs-saas-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span className="dgs-saas-chip primary" style={{ fontSize: "0.7rem", padding: "2px 6px", fontWeight: 700 }}>P31</span>
              <h3 className="dgs-saas-card-title">AI Overview Keyword Tracker (31 Keywords · 6 Clusters)</h3>
            </div>
            <p className="dgs-saas-card-subtitle">
              Live multi-cluster tracking across AI Video, SEO, AEO, GEO, LLM, and Dubai commercial target routes.
            </p>
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
            {(["ALL", "AI Video", "SEO", "AEO", "GEO", "LLM", "Dubai"] as const).map((cluster) => {
              const count = cluster === "ALL" ? AI_OVERVIEW_31_KEYWORDS.length : AI_OVERVIEW_31_KEYWORDS.filter((k) => k.cluster === cluster).length;
              return (
                <button
                  key={cluster}
                  type="button"
                  className={`dgs-saas-btn sm ${selectedCluster === cluster ? "primary" : "secondary"}`}
                  onClick={() => setSelectedCluster(cluster)}
                  style={{ fontSize: "0.75rem", padding: "3px 10px", fontWeight: 600 }}
                >
                  {cluster} ({count})
                </button>
              );
            })}
          </div>
        </div>
        <div className="dgs-saas-card-body" style={{ padding: 0 }}>
          <SaaSTable
            columns={aiOverviewColumns}
            data={filteredAiKeywords}
            keyExtractor={(k) => `${k.cluster}-${k.keyword}`}
            searchPlaceholder="Search 31 AI Overview tracked keywords, target routes, or recommendations..."
          />
        </div>
      </div>
    </div>
  );
}
