"use client";

import React, { useState } from "react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import SeoIntelligenceDrawer from "@/components/admin/SeoIntelligenceDrawer";
import AltFixerDrawer from "@/components/admin/AltFixerDrawer";

type PageRow = {
  url: string;
  statusCode: number;
  responseTimeMs: number;
  title: string | null;
  h1Count: number;
  pageScore: number;
  missingAltCount: number;
  isIndexable: boolean | number;
  schemaTypes?: string | string[];
  internalLinksCount?: number;
  googleAvgPosition?: number | null;
  gscClicks?: number | null;
  gscImpressions?: number | null;
  gscCtr?: number | null;
  mobileSpeed?: number | null;
  desktopSpeed?: number | null;
  issuesCount?: number;
  keywordsCount?: number;
};

type Props = {
  latestAudit: any;
  auditHistory: any[];
  pages: PageRow[];
  issues: any[];
  isDue: boolean;
};

export default function SiteAuditsClientView({
  latestAudit,
  auditHistory,
  pages: initialPages,
  issues,
  isDue,
}: Props) {
  const [running, setRunning] = useState(false);
  const [pages, setPages] = useState<PageRow[]>(initialPages);
  const [activeTab, setActiveTab] = useState<"pages" | "issues" | "history">("pages");

  // Selected drawers
  const [selectedUrlForDrawer, setSelectedUrlForDrawer] = useState<string | null>(null);
  const [selectedUrlForAltFixer, setSelectedUrlForAltFixer] = useState<string | null>(null);
  const [altFixerOpen, setAltFixerOpen] = useState(false);

  // Filter bar state
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const handleRunAudit = async () => {
    if (running) return;
    setRunning(true);
    try {
      const res = await fetch("/api/admin/site-audits/run", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Audit failed");
      alert(
        `Audit completed! Crawled ${data.report.crawledPages} pages with overall score: ${data.report.overallScore}/100.`
      );
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRunning(false);
    }
  };

  const handleOpenAltFixer = (url?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedUrlForAltFixer(url || null);
    setAltFixerOpen(true);
  };

  // Filter logic
  const filteredPages = pages.filter((p) => {
    const pos = p.googleAvgPosition != null ? Number(p.googleAvgPosition) : 0;
    const hasSchema = Boolean(
      p.schemaTypes && (Array.isArray(p.schemaTypes) ? p.schemaTypes.length > 0 : p.schemaTypes !== "[]")
    );
    const intLinks = Number(p.internalLinksCount || 0);
    const mobSpeed = p.mobileSpeed != null ? Number(p.mobileSpeed) : null;

    switch (selectedFilter) {
      case "top10":
        return pos > 0 && pos <= 10;
      case "top20":
        return pos > 10 && pos <= 20;
      case "top50":
        return pos > 20 && pos <= 50;
      case "not_detected":
        return !p.googleAvgPosition || p.googleAvgPosition === 0;
      case "slow_mobile":
        return mobSpeed != null && mobSpeed < 70;
      case "missing_alt":
        return Number(p.missingAltCount) > 0;
      case "technical_issues":
        return Number(p.issuesCount || 0) > 0 || p.statusCode !== 200 || !Boolean(p.isIndexable);
      case "no_schema":
        return !hasSchema;
      case "no_internal_links":
        return intLinks < 3;
      case "all":
      default:
        return true;
    }
  });

  // Redesigned Page Audit Columns
  const pageColumns: Column<PageRow>[] = [
    {
      key: "url",
      header: "Page",
      sortable: true,
      render: (p) => (
        <div style={{ maxWidth: "260px" }}>
          <div
            style={{
              fontWeight: 600,
              color: "#fff",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={p.title || p.url}
          >
            {p.title || p.url}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--dgs-text-muted)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={p.url}
          >
            {p.url.replace(/^https?:\/\/[^/]+/i, "")}
          </div>
        </div>
      ),
    },
    {
      key: "statusCode",
      header: "HTTP",
      sortable: true,
      width: "80px",
      render: (p) => (
        <span className={`dgs-saas-chip ${p.statusCode === 200 ? "success" : "danger"}`}>
          {p.statusCode}
        </span>
      ),
    },
    {
      key: "isIndexable",
      header: "Index",
      sortable: true,
      width: "90px",
      render: (p) => (
        <span className={`dgs-saas-chip ${Boolean(p.isIndexable) ? "success" : "warning"}`}>
          {Boolean(p.isIndexable) ? "Index" : "Noindex"}
        </span>
      ),
    },
    {
      key: "googleAvgPosition",
      header: "Google Avg. Position",
      sortable: true,
      width: "140px",
      render: (p) => {
        const pos = p.googleAvgPosition != null ? Number(p.googleAvgPosition) : 0;
        if (pos > 0) {
          const variant = pos <= 3 ? "success" : pos <= 10 ? "primary" : "neutral";
          return <span className={`dgs-saas-chip ${variant}`}>{pos.toFixed(1)}</span>;
        }
        return <span style={{ color: "var(--dgs-text-muted)", fontSize: "0.78rem" }}>—</span>;
      },
    },
    {
      key: "gscClicks",
      header: "Clicks",
      sortable: true,
      width: "80px",
      render: (p) => p.gscClicks || 0,
    },
    {
      key: "gscImpressions",
      header: "Impressions",
      sortable: true,
      width: "110px",
      render: (p) => (p.gscImpressions ? p.gscImpressions.toLocaleString() : "0"),
    },
    {
      key: "keywordsCount",
      header: "Keywords",
      sortable: true,
      width: "90px",
      render: (p) => (p.keywordsCount ? `${p.keywordsCount}` : "0"),
    },
    {
      key: "mobileSpeed",
      header: "Mobile Speed",
      sortable: true,
      width: "110px",
      render: (p) => {
        if (p.mobileSpeed != null) {
          const s = Number(p.mobileSpeed);
          const color = s >= 90 ? "var(--dgs-success)" : s >= 60 ? "var(--dgs-warning)" : "var(--dgs-danger)";
          return <strong style={{ color }}>{s}/100</strong>;
        }
        return <span style={{ color: "var(--dgs-text-muted)", fontSize: "0.75rem" }}>Not Measured</span>;
      },
    },
    {
      key: "desktopSpeed",
      header: "Desktop Speed",
      sortable: true,
      width: "110px",
      render: (p) => {
        if (p.desktopSpeed != null) {
          const s = Number(p.desktopSpeed);
          const color = s >= 90 ? "var(--dgs-success)" : s >= 60 ? "var(--dgs-warning)" : "var(--dgs-danger)";
          return <strong style={{ color }}>{s}/100</strong>;
        }
        return <span style={{ color: "var(--dgs-text-muted)", fontSize: "0.75rem" }}>Not Measured</span>;
      },
    },
    {
      key: "missingAltCount",
      header: "Missing Alt",
      sortable: true,
      width: "110px",
      render: (p) => {
        const count = Number(p.missingAltCount || 0);
        if (count > 0) {
          return (
            <button
              type="button"
              onClick={(e) => handleOpenAltFixer(p.url, e)}
              className="dgs-saas-chip danger"
              style={{ cursor: "pointer", border: "none" }}
              title="Click to open Missing Alt Fixer drawer"
            >
              {count} Missing &rarr;
            </button>
          );
        }
        return <span className="dgs-saas-chip success">0</span>;
      },
    },
    {
      key: "pageScore",
      header: "SEO Score",
      sortable: true,
      width: "95px",
      render: (p) => (
        <strong
          style={{
            color:
              p.pageScore >= 90
                ? "var(--dgs-success)"
                : p.pageScore >= 70
                ? "var(--dgs-warning)"
                : "var(--dgs-danger)",
          }}
        >
          {p.pageScore}/100
        </strong>
      ),
    },
    {
      key: "issuesCount",
      header: "Issues",
      sortable: true,
      width: "85px",
      render: (p) => {
        const cnt = Number(p.issuesCount || 0);
        if (cnt > 0) {
          return <span className="dgs-saas-chip warning">{cnt}</span>;
        }
        return <span className="dgs-saas-chip neutral">0</span>;
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
          onClick={() => setSelectedUrlForDrawer(p.url)}
          style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}
        >
          Analyze &rarr;
        </button>
      ),
    },
  ];

  const issueColumns: Column<any>[] = [
    {
      key: "severity",
      header: "Severity",
      sortable: true,
      width: "120px",
      render: (iss) => {
        const variant =
          iss.severity === "critical"
            ? "danger"
            : iss.severity === "high"
            ? "warning"
            : iss.severity === "medium"
            ? "primary"
            : "info";
        return <span className={`dgs-saas-chip ${variant}`}>{iss.severity.toUpperCase()}</span>;
      },
    },
    { key: "category", header: "Category", sortable: true, width: "130px" },
    { key: "title", header: "Issue Title", sortable: true },
    {
      key: "url",
      header: "Affected URL",
      sortable: true,
      render: (iss) => (
        <button
          type="button"
          onClick={() => setSelectedUrlForDrawer(iss.url)}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--dgs-primary)",
            padding: 0,
            cursor: "pointer",
            textAlign: "left",
            fontSize: "0.82rem",
          }}
        >
          {iss.url}
        </button>
      ),
    },
    { key: "recommendation", header: "Recommended Action" },
  ];

  const overall = latestAudit?.overall_score != null ? latestAudit.overall_score : null;
  const tech = latestAudit?.technical_score != null ? latestAudit.technical_score : null;
  const index = latestAudit?.indexability_score != null ? latestAudit.indexability_score : null;
  const content = latestAudit?.content_score != null ? latestAudit.content_score : null;
  const schema = latestAudit?.schema_score != null ? latestAudit.schema_score : null;
  const media = latestAudit?.media_score != null ? latestAudit.media_score : null;
  const perf = latestAudit?.performance_score != null ? latestAudit.performance_score : null;

  const discoveredCount = latestAudit?.discovered_url_count ?? latestAudit?.total_pages ?? pages.length;
  const crawledCount = latestAudit?.crawled_url_count ?? latestAudit?.crawled_pages ?? pages.filter((p) => p.statusCode > 0 && p.statusCode < 500).length;
  const failedCount = latestAudit?.failed_url_count ?? pages.filter((p) => p.statusCode >= 500 || p.statusCode === 0).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            Site Health &amp; SEO Intelligence
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
            Real-time crawler telemetry integrating Technical SEO, Search Console rankings, PageSpeed lab metrics, and WCAG accessibility.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {isDue && (
            <span className="dgs-saas-chip warning" style={{ animation: "pulse 2s infinite" }}>
              Audit Due (15 Days)
            </span>
          )}
          <button
            type="button"
            className="dgs-saas-btn secondary sm"
            onClick={() => handleOpenAltFixer(undefined)}
          >
            Missing Alt Fixer
          </button>
          <button
            type="button"
            className="dgs-saas-btn primary sm"
            onClick={handleRunAudit}
            disabled={running}
          >
            {running ? "Crawling Sitemap..." : "Run Complete Audit"}
          </button>
        </div>
      </div>

      {/* KPI Cards — Zero Fabricated Scores */}
      <div className="dgs-saas-kpi-grid">
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Overall Health Score</div>
          <div className="dgs-saas-kpi-value">{overall != null ? `${overall}/100` : "NOT MEASURED"}</div>
          <div style={{ display: "flex", gap: "10px", fontSize: "0.78rem", marginTop: "4px", flexWrap: "wrap" }}>
            <span style={{ color: "#38BDF8" }}>Discovered: <strong>{discoveredCount}</strong></span>
            <span style={{ color: "var(--dgs-success)" }}>Crawled: <strong>{crawledCount}</strong></span>
            <span style={{ color: failedCount > 0 ? "var(--dgs-danger)" : "var(--dgs-text-muted)" }}>Failed: <strong>{failedCount}</strong></span>
          </div>
        </div>

        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Technical Indexability</div>
          <div className="dgs-saas-kpi-value">{tech != null ? `${tech}/100` : "NOT MEASURED"}</div>
          <div className="dgs-saas-kpi-delta positive">
            {index != null ? `Index score: ${index}/100` : "Index score: NOT MEASURED"}
          </div>
        </div>

        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Structured Data (Schema)</div>
          <div className="dgs-saas-kpi-value">{schema != null ? `${schema}/100` : "NOT MEASURED"}</div>
          <div className="dgs-saas-kpi-delta neutral">
            {schema != null ? "Measured from page JSON-LD" : "Run audit to inspect"}
          </div>
        </div>

        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Image Media Score</div>
          <div className="dgs-saas-kpi-value">{media != null ? `${media}/100` : "NOT MEASURED"}</div>
          <div className="dgs-saas-kpi-delta neutral">
            {media != null ? "Accessibility alt coverage" : "Run audit to inspect"}
          </div>
        </div>

        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">PageSpeed Performance</div>
          <div className="dgs-saas-kpi-value">
            {perf != null ? `${perf}/100` : "NOT MEASURED"}
          </div>
          <div className="dgs-saas-kpi-delta neutral">
            {perf != null ? "Lighthouse average" : "Run PSI to measure"}
          </div>
        </div>
      </div>

      {/* Empty State Banner when no completed audit exists */}
      {!latestAudit && pages.length === 0 && (
        <div
          style={{
            margin: "24px 0",
            padding: "36px 24px",
            background: "rgba(255,255,255,0.02)",
            border: "1px dashed rgba(255,255,255,0.15)",
            borderRadius: "var(--dgs-radius)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>
            No Site Audit Completed Yet
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)", maxWidth: "560px", margin: "0 auto 20px" }}>
            Audit metrics are strictly calculated from live crawl telemetry. All scores currently display <strong>NOT MEASURED</strong>. Run a complete audit to evaluate technical indexability, schema presence, and missing alt images.
          </p>
          <button
            type="button"
            className="dgs-saas-btn primary"
            onClick={handleRunAudit}
            disabled={running}
          >
            {running ? "Crawling Sitemap..." : "Run Audit"}
          </button>
        </div>
      )}

      {/* Navigation tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          margin: "24px 0 16px",
          gap: "8px",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("pages")}
          style={{
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "pages" ? "2px solid var(--dgs-primary)" : "2px solid transparent",
            padding: "8px 16px",
            color: activeTab === "pages" ? "#fff" : "var(--dgs-text-muted)",
            fontWeight: activeTab === "pages" ? 700 : 500,
            cursor: "pointer",
            fontSize: "0.88rem",
          }}
        >
          Audited Pages ({filteredPages.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("issues")}
          style={{
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "issues" ? "2px solid var(--dgs-primary)" : "2px solid transparent",
            padding: "8px 16px",
            color: activeTab === "issues" ? "#fff" : "var(--dgs-text-muted)",
            fontWeight: activeTab === "issues" ? 700 : 500,
            cursor: "pointer",
            fontSize: "0.88rem",
          }}
        >
          Detected Issues ({issues.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          style={{
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "history" ? "2px solid var(--dgs-primary)" : "2px solid transparent",
            padding: "8px 16px",
            color: activeTab === "history" ? "#fff" : "var(--dgs-text-muted)",
            fontWeight: activeTab === "history" ? 700 : 500,
            cursor: "pointer",
            fontSize: "0.88rem",
          }}
        >
          15-Day History ({auditHistory.length})
        </button>
      </div>

      {activeTab === "pages" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Filter Bar */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)", marginRight: "4px" }}>
              Filter:
            </span>
            {[
              { id: "all", label: "All Pages" },
              { id: "top10", label: "Top 10 Rankings" },
              { id: "top20", label: "Ranking 11–20" },
              { id: "top50", label: "Ranking 21–50" },
              { id: "not_detected", label: "Not Detected" },
              { id: "slow_mobile", label: "Slow Mobile (<70)" },
              { id: "missing_alt", label: "Missing Alt" },
              { id: "technical_issues", label: "Technical Issues" },
              { id: "no_schema", label: "No Schema" },
              { id: "no_internal_links", label: "Low Links (<3)" },
            ].map((flt) => (
              <button
                key={flt.id}
                type="button"
                onClick={() => setSelectedFilter(flt.id)}
                className={`dgs-saas-chip ${selectedFilter === flt.id ? "primary" : "neutral"}`}
                style={{ cursor: "pointer", fontSize: "0.75rem", padding: "4px 10px" }}
              >
                {flt.label}
              </button>
            ))}
          </div>

          <SaaSTable
            columns={pageColumns}
            data={filteredPages}
            keyExtractor={(p) => p.url}
            initialPageSize={50}
            searchPlaceholder="Search audited URL, title, or status..."
          />
        </div>
      )}

      {activeTab === "issues" && (
        <SaaSTable
          columns={issueColumns}
          data={issues}
          keyExtractor={(iss) => iss.id || `${iss.url}_${iss.issue_code}`}
          initialPageSize={50}
          searchPlaceholder="Search issues by title, URL, or code..."
        />
      )}

      {activeTab === "history" && (
        <div className="dgs-admin-table-wrap">
          <table className="dgs-admin-table">
            <thead>
              <tr>
                <th>Audit ID</th>
                <th>Trigger</th>
                <th>Crawled</th>
                <th>Overall</th>
                <th>Technical</th>
                <th>Schema</th>
                <th>Media</th>
                <th>Performance</th>
                <th>Completed At</th>
              </tr>
            </thead>
            <tbody>
              {auditHistory.map((h) => (
                <tr key={h.id}>
                  <td><code>{h.id.slice(0, 8)}</code></td>
                  <td>{h.trigger_type}</td>
                  <td>{h.crawled_pages} / {h.total_pages}</td>
                  <td><strong>{h.overall_score}/100</strong></td>
                  <td>{h.technical_score}/100</td>
                  <td>{h.schema_score}/100</td>
                  <td>{h.media_score}/100</td>
                  <td>{h.performance_score != null ? `${h.performance_score}/100` : "Not Measured"}</td>
                  <td>{new Date(h.completed_at || h.started_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SEO Intelligence Drawer */}
      {selectedUrlForDrawer && (
        <SeoIntelligenceDrawer
          url={selectedUrlForDrawer}
          isOpen={Boolean(selectedUrlForDrawer)}
          onClose={() => setSelectedUrlForDrawer(null)}
          onRefresh={() => {
            window.location.reload();
          }}
        />
      )}

      {/* Missing Alt Fixer Drawer */}
      <AltFixerDrawer
        pageUrl={selectedUrlForAltFixer || undefined}
        isOpen={altFixerOpen}
        onClose={() => setAltFixerOpen(false)}
        onUpdated={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}
