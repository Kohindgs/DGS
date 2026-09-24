"use client";

import React, { useState } from "react";
import Link from "next/link";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import { type GoogleSearchUpdate } from "@/lib/google-updates/monitor";

type Props = {
  updates: GoogleSearchUpdate[];
};

export default function GoogleUpdatesClientView({ updates: initialUpdates }: Props) {
  const [updates, setUpdates] = useState<GoogleSearchUpdate[]>(initialUpdates);
  const [selectedUpdate, setSelectedUpdate] = useState<GoogleSearchUpdate | null>(null);
  const [assessingId, setAssessingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

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
      width: "130px",
      render: (u) => new Date(u.published_at).toLocaleDateString(),
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
                <span className="dgs-saas-chip primary" style={{ marginBottom: "8px", display: "inline-block" }}>
                  {selectedUpdate.category}
                </span>
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
                  Assessment Date
                </div>
                <div style={{ fontSize: "0.82rem", color: "#fff", marginTop: "2px" }}>
                  {selectedUpdate.assessment_date ? new Date(selectedUpdate.assessment_date).toLocaleString() : "Pending check"}
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

            {/* Affected Pages */}
            {selectedUpdate.affected_dgs_areas && selectedUpdate.affected_dgs_areas.length > 0 && (
              <div>
                <h4 style={{ fontSize: "0.95rem", color: "#fff", marginBottom: "8px" }}>Protected Target Areas</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {selectedUpdate.affected_dgs_areas.map((area, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: "0.75rem",
                        padding: "4px 10px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "12px",
                        color: "#ddd",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {selectedUpdate.recommendations && selectedUpdate.recommendations.length > 0 && (
              <div>
                <h4 style={{ fontSize: "0.95rem", color: "#fff", marginBottom: "8px" }}>Safe SEO Recommendations</h4>
                <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "0.82rem", color: "var(--dgs-text-muted)", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {selectedUpdate.recommendations.map((rec, idx) => (
                    <li key={idx} style={{ lineHeight: "1.4" }}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recheck Action */}
            <div style={{ marginTop: "auto", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                type="button"
                className="dgs-saas-btn primary sm"
                disabled={assessingId === selectedUpdate.id}
                onClick={() => handleRunAssessment(selectedUpdate)}
              >
                {assessingId === selectedUpdate.id ? "Assessing..." : "Run Compliance Verification"}
              </button>
              <button
                type="button"
                className="dgs-saas-btn secondary sm"
                onClick={() => setSelectedUpdate(null)}
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
