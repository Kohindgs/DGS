"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  mobileAccessibility?: number | null;
  mobileBestPractices?: number | null;
  mobileSeo?: number | null;
  mobileFcp?: number | null;
  mobileLcp?: number | null;
  mobileCls?: number | null;
  mobileTbt?: number | null;
  mobileSpeedIndex?: number | null;
  mobileInp?: number | null;
  mobileTtfb?: number | null;
  mobileFieldLcp?: number | null;
  mobileFieldCls?: number | null;
  desktopSpeed?: number | null;
  desktopAccessibility?: number | null;
  desktopBestPractices?: number | null;
  desktopSeo?: number | null;
  desktopFcp?: number | null;
  desktopLcp?: number | null;
  desktopCls?: number | null;
  desktopTbt?: number | null;
  desktopSpeedIndex?: number | null;
  issuesCount?: number;
  keywordsCount?: number;
};

type Props = {
  latestAudit: any;
  auditHistory: any[];
  pages: PageRow[];
  issues: any[];
  healthDiagnostics?: any;
  isDue: boolean;
};

export default function SiteAuditsClientView({
  latestAudit,
  auditHistory,
  pages: initialPages,
  issues,
  healthDiagnostics,
  isDue,
}: Props) {
  const [running, setRunning] = useState(false);
  const [pages, setPages] = useState<PageRow[]>(initialPages);
  const [activeTab, setActiveTab] = useState<"pages" | "issues" | "history" | "diagnostics">("pages");

  // Selected drawers & modals
  const [selectedUrlForDrawer, setSelectedUrlForDrawer] = useState<string | null>(null);
  const [selectedUrlForAltFixer, setSelectedUrlForAltFixer] = useState<string | null>(null);
  const [altFixerOpen, setAltFixerOpen] = useState(false);
  const [lighthouseModalPage, setLighthouseModalPage] = useState<PageRow | null>(null);

  // PageSpeed measurement queue state
  const [pageSpeedStatus, setPageSpeedStatus] = useState<any>(null);
  const [processingBatch, setProcessingBatch] = useState(false);
  const [measuringPageUrl, setMeasuringPageUrl] = useState<string | null>(null);

  // Issues draft creation tracking
  const [draftingIssueId, setDraftingIssueId] = useState<string | null>(null);
  const [createdIssueDrafts, setCreatedIssueDrafts] = useState<Record<string, string>>({});

  // Filter bar state
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const fetchPageSpeedStatus = async () => {
    try {
      const q = latestAudit?.id ? `?auditRunId=${latestAudit.id}` : "";
      const res = await fetch(`/api/admin/seo/pagespeed/status${q}`);
      const data = await res.json();
      if (res.ok) {
        setPageSpeedStatus(data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchPageSpeedStatus();
  }, [latestAudit?.id]);

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

  const handleProcessPageSpeedBatch = async (retryFailed = false) => {
    setProcessingBatch(true);
    try {
      const res = await fetch("/api/admin/seo/pagespeed/process-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditRunId: latestAudit?.id,
          retryFailed,
          limit: 3,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(
          `PageSpeed Batch Completed: ${data.completedCount} processed, ${data.failedCount} failed. Remaining queued: ${data.remainingQueued}`
        );
        await fetchPageSpeedStatus();
      } else {
        alert(data.error || "Batch failed");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setProcessingBatch(false);
    }
  };

  const handleMeasureSinglePage = async (pageUrl: string) => {
    setMeasuringPageUrl(pageUrl);
    try {
      const res = await fetch("/api/admin/seo/pagespeed/process-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceUrl: pageUrl }),
      });
      const data = await res.json();
      if (res.ok && data.results) {
        const mob = data.results.find((r: any) => r.strategy === "mobile");
        const desk = data.results.find((r: any) => r.strategy === "desktop");
        setPages((prev) =>
          prev.map((p) =>
            p.url === pageUrl
              ? {
                  ...p,
                  mobileSpeed: mob?.score ?? p.mobileSpeed,
                  desktopSpeed: desk?.score ?? p.desktopSpeed,
                }
              : p
          )
        );
        if (lighthouseModalPage && lighthouseModalPage.url === pageUrl) {
          setLighthouseModalPage((prev) =>
            prev
              ? {
                  ...prev,
                  mobileSpeed: mob?.score ?? prev.mobileSpeed,
                  desktopSpeed: desk?.score ?? prev.desktopSpeed,
                }
              : null
          );
        }
        alert(`PageSpeed insights recorded for ${pageUrl}! Mobile: ${mob?.score ?? "—"}, Desktop: ${desk?.score ?? "—"}`);
      } else {
        alert(data.error || "Failed to measure page");
      }
    } catch (err: any) {
      alert(err.message || "Failed to measure page");
    } finally {
      setMeasuringPageUrl(null);
    }
  };

  const handleOpenAltFixer = (url?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedUrlForAltFixer(url || null);
    setAltFixerOpen(true);
  };

  const handleCreateIssueDraft = async (iss: any) => {
    setDraftingIssueId(iss.id);
    try {
      const isMissingAlt = iss.issue_code === "MISSING_ALT_TEXT";
      const isDesc = iss.issue_code === "MISSING_DESCRIPTION";
      const isSchema = iss.issue_code === "NO_SCHEMA";
      const isLink = iss.issue_code === "LOW_INTERNAL_LINKS";

      const changeType = isMissingAlt
        ? "MISSING_ALT"
        : isDesc
        ? "META_DESCRIPTION"
        : isSchema
        ? "SCHEMA"
        : isLink
        ? "INTERNAL_LINK"
        : "CONTENT_SECTION";

      const riskLevel =
        iss.severity === "critical" ? "HIGH" : iss.severity === "high" ? "MODERATE" : "SAFE";

      const res = await fetch("/api/admin/seo/change-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_type: "AUDIT_ISSUE",
          source_id: iss.id,
          page_url: iss.url,
          issue_code: iss.issue_code,
          change_type: changeType,
          risk_level: riskLevel,
          reason: `${iss.title}: ${iss.description}`,
          evidence: { severity: iss.severity, category: iss.category, issueCode: iss.issue_code },
          implementation_plan: [iss.recommendation, "Verify rendered page", "Re-audit URL"],
          proposed_state: { issue: iss.title, recommendation: iss.recommendation },
        }),
      });

      const data = await res.json();
      if (data.ok && data.id) {
        setCreatedIssueDrafts((prev) => ({ ...prev, [iss.id]: data.id }));
      } else {
        alert(data.error || "Failed to draft change request");
      }
    } catch (err: any) {
      alert(err.message || "Failed to draft change request");
    } finally {
      setDraftingIssueId(null);
    }
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
            {p.url.replace(/^https?:\/\/[^/]+/i, "") || "/"}
          </div>
        </div>
      ),
    },
    {
      key: "statusCode",
      header: "Status",
      sortable: true,
      width: "80px",
      render: (p) => (
        <span className={`dgs-saas-chip ${p.statusCode === 200 ? "success" : "danger"}`}>
          {p.statusCode}
        </span>
      ),
    },
    {
      key: "googleAvgPosition",
      header: "GSC Avg. Pos",
      sortable: true,
      width: "125px",
      render: (p) => {
        if (p.googleAvgPosition != null && Number(p.googleAvgPosition) > 0) {
          const pos = Number(p.googleAvgPosition);
          const variant = pos <= 3 ? "success" : pos <= 10 ? "primary" : "neutral";
          return (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className={`dgs-saas-chip ${variant}`} style={{ fontWeight: 700 }}>
                {pos.toFixed(1)}
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>
                {p.gscClicks || 0} clk
              </span>
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
      width: "120px",
      render: (p) => {
        if (p.mobileSpeed != null) {
          const s = Number(p.mobileSpeed);
          const color = s >= 90 ? "var(--dgs-success)" : s >= 60 ? "var(--dgs-warning)" : "var(--dgs-danger)";
          return (
            <button
              type="button"
              onClick={() => setLighthouseModalPage(p)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                textAlign: "left",
              }}
              title="Click to view detailed Lighthouse lab and field metrics"
            >
              <strong style={{ color }}>{s}/100</strong>
              <div style={{ fontSize: "0.68rem", color: "var(--dgs-text-muted)" }}>Lighthouse &nearr;</div>
            </button>
          );
        }
        return (
          <button
            type="button"
            className="dgs-saas-btn secondary sm"
            onClick={() => handleMeasureSinglePage(p.url)}
            disabled={measuringPageUrl === p.url}
            style={{ fontSize: "0.7rem", padding: "2px 6px" }}
          >
            {measuringPageUrl === p.url ? "Measuring..." : "⚡ Measure"}
          </button>
        );
      },
    },
    {
      key: "desktopSpeed",
      header: "Desktop Speed",
      sortable: true,
      width: "120px",
      render: (p) => {
        if (p.desktopSpeed != null) {
          const s = Number(p.desktopSpeed);
          const color = s >= 90 ? "var(--dgs-success)" : s >= 60 ? "var(--dgs-warning)" : "var(--dgs-danger)";
          return (
            <button
              type="button"
              onClick={() => setLighthouseModalPage(p)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                textAlign: "left",
              }}
              title="Click to view detailed Lighthouse lab and field metrics"
            >
              <strong style={{ color }}>{s}/100</strong>
              <div style={{ fontSize: "0.68rem", color: "var(--dgs-text-muted)" }}>Lighthouse &nearr;</div>
            </button>
          );
        }
        return (
          <button
            type="button"
            className="dgs-saas-btn secondary sm"
            onClick={() => handleMeasureSinglePage(p.url)}
            disabled={measuringPageUrl === p.url}
            style={{ fontSize: "0.7rem", padding: "2px 6px" }}
          >
            {measuringPageUrl === p.url ? "Measuring..." : "⚡ Measure"}
          </button>
        );
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
    { key: "category", header: "Category", sortable: true, width: "110px" },
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
          {iss.url.replace(/^https?:\/\/[^/]+/i, "") || "/"}
        </button>
      ),
    },
    {
      key: "actions",
      header: "Action / Draft",
      width: "170px",
      render: (iss) => {
        const draftId = createdIssueDrafts[iss.id];
        const isDrafting = draftingIssueId === iss.id;

        if (draftId) {
          return (
            <Link
              href="/admin/seo/approvals/"
              style={{ fontSize: "0.75rem", color: "var(--dgs-primary)", textDecoration: "none", fontWeight: 600 }}
            >
              ✓ Draft #{draftId} &rarr;
            </Link>
          );
        }

        return (
          <button
            type="button"
            className="dgs-saas-btn primary sm"
            onClick={() => handleCreateIssueDraft(iss)}
            disabled={isDrafting}
            style={{ fontSize: "0.74rem", padding: "4px 8px", whiteSpace: "nowrap" }}
          >
            {isDrafting ? "Drafting..." : "+ Create Fix Draft"}
          </button>
        );
      },
    },
  ];

  const overall = latestAudit?.overall_score != null ? latestAudit.overall_score : null;
  const tech = latestAudit?.technical_score != null ? latestAudit.technical_score : null;
  const index = latestAudit?.indexability_score != null ? latestAudit.indexability_score : null;
  const schema = latestAudit?.schema_score != null ? latestAudit.schema_score : null;
  const media = latestAudit?.media_score != null ? latestAudit.media_score : null;
  const perf = latestAudit?.performance_score != null ? latestAudit.performance_score : null;

  const discoveredCount = latestAudit?.discovered_url_count ?? latestAudit?.total_pages ?? pages.length;
  const crawledCount = latestAudit?.crawled_url_count ?? latestAudit?.crawled_pages ?? pages.filter((p) => p.statusCode > 0 && p.statusCode < 500).length;
  const failedCount = latestAudit?.failed_url_count ?? pages.filter((p) => p.statusCode >= 500 || p.statusCode === 0).length;

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            Site Health &amp; SEO Intelligence
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
            Real-time crawler telemetry integrating Technical SEO, Search Console rankings, PageSpeed lab metrics, and WCAG accessibility.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          {isDue && (
            <span className="dgs-saas-chip warning">
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
          <Link
            href="/admin/seo/approvals/"
            className="dgs-saas-btn secondary sm"
            style={{ textDecoration: "none" }}
          >
            SEO Approvals &rarr;
          </Link>
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

      {/* PageSpeed Queue Progress Bar (Requirements G, H, I, J) */}
      {pageSpeedStatus && pageSpeedStatus.totalJobs > 0 && (
        <div
          style={{
            margin: "18px 0",
            padding: "16px 20px",
            background: "rgba(0, 229, 255, 0.04)",
            border: "1px solid rgba(0, 229, 255, 0.2)",
            borderRadius: "var(--dgs-radius-md, 8px)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="dgs-saas-chip primary" style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                PageSpeed Measurement Queue
              </span>
              <strong style={{ color: "#fff", fontSize: "0.92rem" }}>
                {pageSpeedStatus.completedJobs} / {pageSpeedStatus.totalJobs} Completed
              </strong>
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)", marginTop: "4px" }}>
              Pending Queued: {pageSpeedStatus.queuedJobs} · Running: {pageSpeedStatus.runningJobs} · Failed: {pageSpeedStatus.failedJobs}
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {pageSpeedStatus.queuedJobs > 0 && (
              <button
                type="button"
                className="dgs-saas-btn primary sm"
                onClick={() => handleProcessPageSpeedBatch(false)}
                disabled={processingBatch}
              >
                {processingBatch ? "Measuring Batch..." : "Measure Next Batch (3 Pages)"}
              </button>
            )}

            {pageSpeedStatus.failedJobs > 0 && (
              <button
                type="button"
                className="dgs-saas-btn secondary sm"
                onClick={() => handleProcessPageSpeedBatch(true)}
                disabled={processingBatch}
              >
                Retry Failed Jobs ({pageSpeedStatus.failedJobs})
              </button>
            )}
          </div>
        </div>
      )}

      {/* SEO Data Health Diagnostic Panel (Requirement V) */}
      {healthDiagnostics && !healthDiagnostics.isAltConsistent && (
        <div
          style={{
            margin: "18px 0",
            padding: "14px 18px",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            borderRadius: "var(--dgs-radius-md, 8px)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <div style={{ color: "#ef4444", fontWeight: 700, fontSize: "0.9rem" }}>
              ⚠ DATA MISMATCH DETECTED (SEO DATA HEALTH)
            </div>
            <div style={{ color: "#fca5a5", fontSize: "0.82rem", marginTop: "2px" }}>
              Page Table reports <strong>{healthDiagnostics.aggAltCount} missing alts</strong>, but <strong>{healthDiagnostics.detailAltCount} individual records</strong> exist in database.
            </div>
          </div>
          <button
            type="button"
            className="dgs-saas-btn danger sm"
            onClick={() => handleOpenAltFixer(undefined)}
          >
            Open Alt Fixer to Reconcile
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)", gap: "8px", margin: "20px 0 16px 0" }}>
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
          Crawled Pages ({pages.length})
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

        <button
          type="button"
          onClick={() => setActiveTab("diagnostics")}
          style={{
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "diagnostics" ? "2px solid var(--dgs-primary)" : "2px solid transparent",
            padding: "8px 16px",
            color: activeTab === "diagnostics" ? "#fff" : "var(--dgs-text-muted)",
            fontWeight: activeTab === "diagnostics" ? 700 : 500,
            cursor: "pointer",
            fontSize: "0.88rem",
          }}
        >
          SEO Data Health
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

      {activeTab === "diagnostics" && healthDiagnostics && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="dgs-saas-kpi-grid">
            <div className="dgs-saas-kpi-card">
              <div className="dgs-saas-kpi-title">Search Console Telemetry</div>
              <div className="dgs-saas-kpi-value">{healthDiagnostics.gscTotalRows.toLocaleString()} rows</div>
              <div className="dgs-saas-kpi-delta positive">Last Sync: {healthDiagnostics.gscLastSync || "Active"}</div>
            </div>

            <div className="dgs-saas-kpi-card">
              <div className="dgs-saas-kpi-title">Audit Sitemap Discovery</div>
              <div className="dgs-saas-kpi-value">{healthDiagnostics.sitemapUrls} URLs</div>
              <div className="dgs-saas-kpi-delta neutral">Crawled: {healthDiagnostics.crawledPages} Pages</div>
            </div>

            <div className="dgs-saas-kpi-card">
              <div className="dgs-saas-kpi-title">Missing Alt Consistency</div>
              <div className="dgs-saas-kpi-value">
                {healthDiagnostics.isAltConsistent ? "CONSISTENT" : "MISMATCH"}
              </div>
              <div className="dgs-saas-kpi-delta neutral">
                Aggregate: {healthDiagnostics.aggAltCount} · Detail Records: {healthDiagnostics.detailAltCount}
              </div>
            </div>

            <div className="dgs-saas-kpi-card">
              <div className="dgs-saas-kpi-title">PageSpeed Lab &amp; Queue</div>
              <div className="dgs-saas-kpi-value">{healthDiagnostics.pageSpeedMeasured} URLs Measured</div>
              <div className="dgs-saas-kpi-delta neutral">
                Queued: {healthDiagnostics.pageSpeedQueued} · Failed: {healthDiagnostics.pageSpeedFailed}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expandable Lighthouse Details Modal (Requirement K) */}
      {lighthouseModalPage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setLighthouseModalPage(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "760px",
              background: "#0d1117",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "12px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                  <span className="dgs-saas-chip primary">Lighthouse Laboratory &amp; CrUX Field Data</span>
                </div>
                <h3 style={{ margin: "4px 0", color: "#fff", fontSize: "1.2rem" }}>
                  {lighthouseModalPage.url}
                </h3>
              </div>
              <button
                type="button"
                className="dgs-saas-btn secondary sm"
                onClick={() => setLighthouseModalPage(null)}
              >
                ✕
              </button>
            </div>

            {/* Mobile Scores */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <strong style={{ color: "#38bdf8", fontSize: "0.95rem" }}>📱 MOBILE EVALUATION</strong>
                <span className="dgs-saas-chip neutral" style={{ fontSize: "0.68rem" }}>Google Moto G Power Emulation</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "12px" }}>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "6px", textAlign: "center" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>PERFORMANCE</div>
                  <strong style={{ fontSize: "1.3rem", color: "var(--dgs-primary)" }}>{lighthouseModalPage.mobileSpeed ?? "—"}</strong>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "6px", textAlign: "center" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>ACCESSIBILITY</div>
                  <strong style={{ fontSize: "1.3rem", color: "var(--dgs-success)" }}>{lighthouseModalPage.mobileAccessibility ?? "—"}</strong>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "6px", textAlign: "center" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>BEST PRACTICES</div>
                  <strong style={{ fontSize: "1.3rem", color: "#fff" }}>{lighthouseModalPage.mobileBestPractices ?? "—"}</strong>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "6px", textAlign: "center" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>SEO INDEX</div>
                  <strong style={{ fontSize: "1.3rem", color: "var(--dgs-success)" }}>{lighthouseModalPage.mobileSeo ?? "—"}</strong>
                </div>
              </div>

              {/* Lab vs Field Data (Requirement K) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "0.78rem" }}>
                <div style={{ background: "rgba(0,0,0,0.2)", padding: "10px", borderRadius: "6px" }}>
                  <strong style={{ color: "#fff" }}>LAB METRICS (Lighthouse Simulated):</strong>
                  <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px", color: "#cbd5e1" }}>
                    <div>FCP: <strong>{lighthouseModalPage.mobileFcp != null ? `${lighthouseModalPage.mobileFcp} ms` : "—"}</strong></div>
                    <div>LCP: <strong>{lighthouseModalPage.mobileLcp != null ? `${lighthouseModalPage.mobileLcp} ms` : "—"}</strong></div>
                    <div>CLS: <strong>{lighthouseModalPage.mobileCls != null ? `${lighthouseModalPage.mobileCls}` : "—"}</strong></div>
                    <div>TBT: <strong>{lighthouseModalPage.mobileTbt != null ? `${lighthouseModalPage.mobileTbt} ms` : "—"}</strong></div>
                  </div>
                </div>

                <div style={{ background: "rgba(0,0,0,0.2)", padding: "10px", borderRadius: "6px" }}>
                  <strong style={{ color: "#fff" }}>FIELD DATA (Chrome User Experience):</strong>
                  <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px", color: "#cbd5e1" }}>
                    <div>INP: <strong>{lighthouseModalPage.mobileInp != null ? `${lighthouseModalPage.mobileInp} ms` : "—"}</strong></div>
                    <div>TTFB: <strong>{lighthouseModalPage.mobileTtfb != null ? `${lighthouseModalPage.mobileTtfb} ms` : "—"}</strong></div>
                    <div>Field LCP: <strong>{lighthouseModalPage.mobileFieldLcp != null ? `${lighthouseModalPage.mobileFieldLcp} ms` : "—"}</strong></div>
                    <div>Field CLS: <strong>{lighthouseModalPage.mobileFieldCls != null ? `${lighthouseModalPage.mobileFieldCls}` : "—"}</strong></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Scores */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <strong style={{ color: "#38bdf8", fontSize: "0.95rem" }}>💻 DESKTOP EVALUATION</strong>
                <span className="dgs-saas-chip neutral" style={{ fontSize: "0.68rem" }}>Desktop Chrome Emulation</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "6px", textAlign: "center" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>PERFORMANCE</div>
                  <strong style={{ fontSize: "1.3rem", color: "var(--dgs-primary)" }}>{lighthouseModalPage.desktopSpeed ?? "—"}</strong>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "6px", textAlign: "center" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>ACCESSIBILITY</div>
                  <strong style={{ fontSize: "1.3rem", color: "var(--dgs-success)" }}>{lighthouseModalPage.desktopAccessibility ?? "—"}</strong>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "6px", textAlign: "center" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>BEST PRACTICES</div>
                  <strong style={{ fontSize: "1.3rem", color: "#fff" }}>{lighthouseModalPage.desktopBestPractices ?? "—"}</strong>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "6px", textAlign: "center" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>SEO INDEX</div>
                  <strong style={{ fontSize: "1.3rem", color: "var(--dgs-success)" }}>{lighthouseModalPage.desktopSeo ?? "—"}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                type="button"
                className="dgs-saas-btn primary sm"
                onClick={() => handleMeasureSinglePage(lighthouseModalPage.url)}
                disabled={measuringPageUrl === lighthouseModalPage.url}
              >
                {measuringPageUrl === lighthouseModalPage.url ? "Measuring Live..." : "⚡ Run Fresh PageSpeed Analysis"}
              </button>
            </div>
          </div>
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
        auditRunId={latestAudit?.id}
        reportedCount={pages.find((p) => p.url === selectedUrlForAltFixer)?.missingAltCount}
        isOpen={altFixerOpen}
        onClose={() => setAltFixerOpen(false)}
        onUpdated={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}
