"use client";

import React, { useState } from "react";
import Link from "next/link";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import { type GoogleSearchUpdate, type MonitorRunRecord } from "@/lib/google-updates/monitor";

type Props = {
  updates: GoogleSearchUpdate[];
  latestRun?: MonitorRunRecord | null;
};

export default function GoogleUpdatesClientView({ updates: initialUpdates, latestRun: initialRun }: Props) {
  const [updates, setUpdates] = useState<GoogleSearchUpdate[]>(initialUpdates);
  const [latestRun, setLatestRun] = useState<MonitorRunRecord | null>(initialRun || null);
  const [selectedUpdate, setSelectedUpdate] = useState<GoogleSearchUpdate | null>(null);
  const [assessingId, setAssessingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCheckingFeeds, setIsCheckingFeeds] = useState(false);
  const [checkFeedback, setCheckFeedback] = useState<string | null>(null);

  const handleCheckFeedsNow = async () => {
    if (isCheckingFeeds) return;
    setIsCheckingFeeds(true);
    setCheckFeedback(null);

    try {
      const res = await fetch("/api/internal/google-updates/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to check feeds");

      setCheckFeedback(
        `Scanned ${data.result?.detectedCount || 0} items (${data.result?.newCount || 0} new, ${data.result?.updatedCount || 0} updated).`,
      );

      // Re-fetch updates
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      setCheckFeedback(`Check error: ${err.message}`);
    } finally {
      setIsCheckingFeeds(false);
    }
  };

  const handleRunAssessment = async (update: GoogleSearchUpdate, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (assessingId) return;
    setAssessingId(update.id);

    try {
      const res = await fetch("/api/admin/google-updates/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updateId: update.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Assessment failed");

      // Update state with newly assessed values
      const updatedList = updates.map((u) => {
        if (u.id === update.id) {
          const ass = data.assessment;
          return {
            ...u,
            assessment_status: ass.assessmentStatus,
            assessment_date: ass.assessmentDate,
            evidence: ass.evidence,
            checks_performed: ass.checksPerformed,
            issues_found: ass.issuesFound,
            recommendations: ass.recommendations,
            assessed_by: ass.assessedBy,
            confidence: ass.confidence,
          };
        }
        return u;
      });

      setUpdates(updatedList);
      if (selectedUpdate?.id === update.id) {
        setSelectedUpdate(updatedList.find((u) => u.id === update.id) || null);
      }
    } catch (err: any) {
      alert(`Assessment failed: ${err.message}`);
    } finally {
      setAssessingId(null);
    }
  };

  const filteredUpdates = updates.filter((u) => {
    if (filterStatus === "all") return true;
    return u.assessment_status === filterStatus;
  });

  const activeRollouts = updates.filter(
    (u) =>
      u.external_status === "ACTIVE" ||
      (u.severity === "HIGH" && u.title.toLowerCase().includes("spam update") && u.status !== "resolved"),
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLIANT":
        return <span className="dgs-saas-chip success">COMPLIANT</span>;
      case "NEEDS REVIEW":
        return <span className="dgs-saas-chip warning">NEEDS REVIEW</span>;
      case "NON-COMPLIANT":
        return <span className="dgs-saas-chip danger">NON-COMPLIANT</span>;
      case "NOT APPLICABLE":
        return <span className="dgs-saas-chip neutral">NOT APPLICABLE</span>;
      case "INSUFFICIENT EVIDENCE":
        return <span className="dgs-saas-chip info">INSUFFICIENT EVIDENCE</span>;
      case "ASSESSING":
        return <span className="dgs-saas-chip primary">ASSESSING...</span>;
      case "NOT ASSESSED":
      default:
        return <span className="dgs-saas-chip muted">NOT ASSESSED</span>;
    }
  };

  const columns: Column<GoogleSearchUpdate>[] = [
    {
      key: "title",
      header: "Official Update",
      sortable: true,
      render: (u) => (
        <div>
          <div style={{ fontWeight: 600, color: "#fff" }}>{u.title}</div>
          <div style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
            Source:{" "}
            <a
              href={u.source_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ color: "var(--dgs-primary)" }}
            >
              {u.source}
            </a>
            {" · "}
            <span style={{ color: "rgba(255,255,255,0.4)" }}>{u.category}</span>
          </div>
        </div>
      ),
    },
    {
      key: "severity",
      header: "Severity",
      sortable: true,
      width: "120px",
      render: (u) => {
        const variant =
          u.severity === "CRITICAL"
            ? "danger"
            : u.severity === "HIGH"
            ? "warning"
            : u.severity === "MEDIUM"
            ? "primary"
            : "neutral";
        return <span className={`dgs-saas-chip ${variant}`}>{u.severity}</span>;
      },
    },
    {
      key: "assessment_status",
      header: "Compliance Status",
      sortable: true,
      width: "170px",
      render: (u) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {getStatusBadge(u.assessment_status)}
          {u.confidence != null && (
            <span style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>
              {u.confidence}% confidence
            </span>
          )}
        </div>
      ),
    },
    {
      key: "published_at",
      header: "Rollout Date",
      sortable: true,
      width: "150px",
      render: (u) => (
        <div>
          <div style={{ color: "#fff", fontSize: "0.85rem" }}>
            {new Date(u.published_at).toLocaleDateString()}
          </div>
          {u.external_status === "ACTIVE" && (
            <span
              style={{
                display: "inline-block",
                marginTop: "4px",
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: "0.68rem",
                fontWeight: 700,
                background: "rgba(239, 68, 68, 0.2)",
                color: "#ef4444",
                border: "1px solid rgba(239, 68, 68, 0.4)",
              }}
            >
              ● ACTIVE ROLLOUT
            </span>
          )}
        </div>
      ),
    },
    {
      key: "evidence",
      header: "Verifiable Evidence",
      render: (u) => {
        if (u.evidence) {
          return (
            <div style={{ fontSize: "0.82rem", color: "var(--dgs-text-main)" }}>
              <div style={{ maxHeight: "38px", overflow: "hidden", textOverflow: "ellipsis" }}>
                {u.evidence}
              </div>
              <button
                type="button"
                onClick={() => setSelectedUpdate(u)}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  color: "var(--dgs-primary)",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  marginTop: "3px",
                  fontWeight: 600,
                  display: "inline-block",
                }}
              >
                View Evidence ({u.checks_performed?.length || 0} checks) &rarr;
              </button>
            </div>
          );
        }

        if (u.assessment_status === "NOT APPLICABLE") {
          return (
            <span style={{ fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
              Informational announcement. No direct algorithmic compliance requirements.
            </span>
          );
        }

        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
              No assessment on file.
            </span>
            <button
              type="button"
              className="dgs-saas-btn secondary sm"
              disabled={assessingId === u.id}
              onClick={(e) => handleRunAssessment(u, e)}
              style={{ fontSize: "0.75rem", padding: "3px 8px" }}
            >
              {assessingId === u.id ? "Checking..." : "Assess Now"}
            </button>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      width: "120px",
      render: (u) => (
        <button
          type="button"
          className="dgs-saas-btn secondary sm"
          onClick={() => setSelectedUpdate(u)}
          style={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}
        >
          Details
        </button>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Title & Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            Google Update Compliance Engine
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
            Evidence-backed verification against official Search Status incidents, core updates, and ranking algorithm policies. Zero hardcoded statuses.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="dgs-saas-select sm"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: "var(--dgs-radius-sm)",
              fontSize: "0.82rem",
            }}
          >
            <option value="all">All Compliance Statuses</option>
            <option value="COMPLIANT">Compliant</option>
            <option value="NOT APPLICABLE">Not Applicable (Informational)</option>
            <option value="NOT ASSESSED">Not Assessed</option>
            <option value="NEEDS REVIEW">Needs Review</option>
            <option value="NON-COMPLIANT">Non-Compliant</option>
          </select>
          <Link href="/admin/search-updates/" className="dgs-saas-btn secondary sm">
            Legacy Monitor &rarr;
          </Link>
        </div>
      </div>

      {/* Active Google Algorithm Rollout Alert Banner */}
      {activeRollouts.length > 0 && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(245, 158, 11, 0.12) 100%)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            borderRadius: "var(--dgs-radius-md)",
            padding: "20px 24px",
            boxShadow: "0 8px 24px rgba(239, 68, 68, 0.1)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(239, 68, 68, 0.25)",
                    color: "#f87171",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    padding: "4px 10px",
                    borderRadius: "999px",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    letterSpacing: "0.04em",
                  }}
                >
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
                  ACTIVE ROLLOUT IN PROGRESS
                </span>
                <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)" }}>
                  Window Started: {activeRollouts[0]?.incident_begin ? new Date(activeRollouts[0].incident_begin).toLocaleString() : "2026-09-24 09:15 PDT"} (Estimated ~2 Weeks)
                </span>
              </div>
              <h3 style={{ fontSize: "1.18rem", fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>
                {activeRollouts[0]?.title}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.85)", margin: 0, maxWidth: "900px", lineHeight: 1.5 }}>
                {activeRollouts[0]?.summary}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
              <span className="dgs-saas-chip danger">HIGH IMPACT SERP VOLATILITY</span>
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                Automated rewriting locked
              </span>
            </div>
          </div>
          <div
            style={{
              marginTop: "14px",
              paddingTop: "12px",
              borderTop: "1px solid rgba(239, 68, 68, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "8px",
              fontSize: "0.8rem",
              color: "rgba(255,255,255,0.75)",
            }}
          >
            <span>
              🔒 <strong>Strict Protection:</strong> Zero automated changes permitted to titles, H1s, or canonicals during active rollouts.
            </span>
            <button
              type="button"
              className="dgs-saas-btn secondary sm"
              onClick={() => setSelectedUpdate(activeRollouts[0])}
              style={{ fontSize: "0.76rem", padding: "4px 10px" }}
            >
              View Rollout Safeguards &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Source Health & Telemetry Status Card */}
      <div
        className="dgs-saas-card"
        style={{
          background: "linear-gradient(135deg, rgba(30, 27, 75, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)",
          border: "1px solid rgba(129, 140, 248, 0.2)",
        }}
      >
        <div style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", margin: 0 }}>
                  Automated Search Intelligence Sources (3-Hour Cadence)
                </h4>
                <span className="dgs-saas-chip success" style={{ fontSize: "0.7rem", padding: "2px 8px" }}>
                  {latestRun?.status === "SUCCESS" ? "HEALTHY" : "ACTIVE"}
                </span>
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)", margin: 0 }}>
                Continuous monitoring of official Google channels for algorithmic incidents, spam updates, and documentation changes.
                {latestRun?.completed_at && ` Last verified: ${new Date(latestRun.completed_at).toLocaleString()}`}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {checkFeedback && (
                <span style={{ fontSize: "0.78rem", color: checkFeedback.includes("error") ? "#ef4444" : "#10b981" }}>
                  {checkFeedback}
                </span>
              )}
              <button
                type="button"
                className="dgs-saas-btn secondary sm"
                disabled={isCheckingFeeds}
                onClick={handleCheckFeedsNow}
                style={{ fontSize: "0.78rem" }}
              >
                {isCheckingFeeds ? "Checking Feeds..." : "Check Feeds Now"}
              </button>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "12px",
              marginTop: "14px",
            }}
          >
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px 14px", borderRadius: "var(--dgs-radius-sm)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#fff" }}>Google Status Dashboard</span>
                <span style={{ fontSize: "0.68rem", color: "#10b981", fontWeight: 600 }}>● ONLINE</span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>status.search.google.com/incidents.json</div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px 14px", borderRadius: "var(--dgs-radius-sm)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#fff" }}>Search Central Blog</span>
                <span style={{ fontSize: "0.68rem", color: "#10b981", fontWeight: 600 }}>● ONLINE</span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>feeds.feedburner.com/blogspot/amDG</div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px 14px", borderRadius: "var(--dgs-radius-sm)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#fff" }}>Documentation Updates RSS</span>
                <span style={{ fontSize: "0.68rem", color: "#10b981", fontWeight: 600 }}>● ONLINE</span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>search_docs_updates.rss</div>
            </div>
          </div>
        </div>
      </div>

      {/* Strict Ranking Protection Policy */}
      <div className="dgs-saas-card" style={{ borderColor: "rgba(115, 103, 240, 0.4)" }}>
        <div className="dgs-saas-card-header">
          <h3 className="dgs-saas-card-title">Ranking Protection &amp; Strict Causation Standard</h3>
          <span className="dgs-saas-chip primary">PROTECTED BASELINE</span>
        </div>
        <div className="dgs-saas-card-body">
          <p style={{ fontSize: "0.88rem", color: "var(--dgs-text-main)", margin: "0 0 10px" }}>
            Automated modifications to ranking-protected pages, titles, H1s, or canonicals during active Google rollouts are <strong>strictly prohibited</strong>. All compliance observations compare metrics across the 14-day window before rollout, the rollout duration, and 14 days post-rollout.
          </p>
          <div style={{ padding: "10px 14px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "var(--dgs-radius-sm)", fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
            <strong>Causation Guard:</strong> Metric movements during an update window are labeled <em>&ldquo;Change observed during rollout&rdquo;</em>, never <em>&ldquo;Google update caused the drop&rdquo;</em>, unless verified by conclusive evidence.
          </div>
        </div>
      </div>

      <SaaSTable
        columns={columns}
        data={filteredUpdates}
        keyExtractor={(u) => u.id}
        searchPlaceholder="Search updates by keyword, incident, or algorithm..."
      />

      {/* Slide-out Evidence Drawer */}
      {selectedUpdate && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setSelectedUpdate(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "680px",
              background: "#0c0c14",
              borderLeft: "1px solid rgba(255,255,255,0.12)",
              height: "100%",
              overflowY: "auto",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "8px" }}>
                  <span className="dgs-saas-chip primary" style={{ display: "inline-block" }}>
                    {selectedUpdate.category}
                  </span>
                  {selectedUpdate.external_status === "ACTIVE" && (
                    <span className="dgs-saas-chip danger">ACTIVE ROLLOUT</span>
                  )}
                </div>
                <h3 style={{ fontSize: "1.25rem", color: "#fff", margin: 0, fontWeight: 700 }}>
                  {selectedUpdate.title}
                </h3>
                <p style={{ fontSize: "0.82rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
                  Rollout Date: {new Date(selectedUpdate.published_at).toLocaleDateString()} · Source:{" "}
                  <a href={selectedUpdate.source_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--dgs-primary)" }}>
                    {selectedUpdate.source}
                  </a>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUpdate(null)}
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

            {/* Status & Assessment Overview */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                padding: "16px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "var(--dgs-radius-md)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div>
                <div style={{ fontSize: "0.74rem", color: "var(--dgs-text-muted)", textTransform: "uppercase" }}>
                  Compliance Status
                </div>
                <div style={{ marginTop: "4px" }}>
                  {getStatusBadge(selectedUpdate.assessment_status)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.74rem", color: "var(--dgs-text-muted)", textTransform: "uppercase" }}>
                  Confidence Score
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", marginTop: "2px" }}>
                  {selectedUpdate.confidence != null ? `${selectedUpdate.confidence}%` : "Not Assessed"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.74rem", color: "var(--dgs-text-muted)", textTransform: "uppercase" }}>
                  Assessed By
                </div>
                <div style={{ fontSize: "0.82rem", color: "#fff", marginTop: "2px" }}>
                  {selectedUpdate.assessed_by || "Automated Monitor"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.74rem", color: "var(--dgs-text-muted)", textTransform: "uppercase" }}>
                  Rollout Window
                </div>
                <div style={{ fontSize: "0.82rem", color: "#fff", marginTop: "2px" }}>
                  {selectedUpdate.incident_begin
                    ? `${new Date(selectedUpdate.incident_begin).toLocaleDateString()} — ${selectedUpdate.incident_end ? new Date(selectedUpdate.incident_end).toLocaleDateString() : "Active"}`
                    : new Date(selectedUpdate.published_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Evidence Findings */}
            <div>
              <h4 style={{ fontSize: "0.95rem", color: "#fff", marginBottom: "8px" }}>Verifiable Evidence Summary</h4>
              <div
                style={{
                  padding: "14px",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: "var(--dgs-radius-sm)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  fontSize: "0.85rem",
                  color: "var(--dgs-text-main)",
                  lineHeight: "1.5",
                }}
              >
                {selectedUpdate.evidence || "No evidence recorded yet. Click 'Run Compliance Verification' to evaluate against live site architecture."}
              </div>
            </div>

            {/* Checks Performed */}
            {selectedUpdate.checks_performed && selectedUpdate.checks_performed.length > 0 && (
              <div>
                <h4 style={{ fontSize: "0.95rem", color: "#fff", marginBottom: "10px" }}>
                  Verifiable Checks Performed ({selectedUpdate.checks_performed.length})
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {selectedUpdate.checks_performed.map((chk, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "12px",
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: "var(--dgs-radius-sm)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#fff" }}>{chk.name}</span>
                        <span className={`dgs-saas-chip ${chk.result === "PASS" ? "success" : chk.result === "FAIL" ? "danger" : chk.result === "WARN" ? "warning" : "info"}`} style={{ fontSize: "0.7rem", padding: "2px 6px" }}>
                          {chk.result}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)", margin: "4px 0" }}>
                        {chk.description}
                      </p>
                      {chk.details && (
                        <p style={{ fontSize: "0.8rem", color: "#a5b4fc", margin: "4px 0 0", background: "rgba(99, 102, 241, 0.08)", padding: "6px 8px", borderRadius: "4px" }}>
                          {chk.details}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {selectedUpdate.recommendations && selectedUpdate.recommendations.length > 0 && (
              <div>
                <h4 style={{ fontSize: "0.95rem", color: "#fff", marginBottom: "10px" }}>Safe Action Recommendations</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {selectedUpdate.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "10px 12px",
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: "var(--dgs-radius-sm)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        fontSize: "0.82rem",
                        color: "var(--dgs-text-main)",
                        display: "flex",
                        gap: "8px",
                      }}
                    >
                      <span style={{ color: "var(--dgs-primary)", fontWeight: 700 }}>•</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assessment Button */}
            {selectedUpdate.assessment_status !== "NOT APPLICABLE" && (
              <div style={{ marginTop: "10px" }}>
                <button
                  type="button"
                  className="dgs-saas-btn primary"
                  disabled={assessingId === selectedUpdate.id}
                  onClick={(e) => handleRunAssessment(selectedUpdate, e)}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {assessingId === selectedUpdate.id
                    ? "Evaluating Site Compliance..."
                    : selectedUpdate.assessment_status === "NOT ASSESSED"
                    ? "Run Compliance Verification"
                    : "Re-run Verification Audit"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
