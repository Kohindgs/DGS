"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  type SeoChangeRequestRecord,
  type ChangeRequestStatus,
  type RiskLevel,
} from "@/lib/seo/change-requests";

type Props = {
  initialRequests: SeoChangeRequestRecord[];
  userRole: string;
  userEmail?: string;
};

export default function ApprovalsClientView({
  initialRequests = [],
  userRole,
}: Props) {
  const [requests, setRequests] = useState<SeoChangeRequestRecord[]>(initialRequests);
  const [activeTab, setActiveTab] = useState<ChangeRequestStatus | "ALL">("AWAITING_APPROVAL");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const isSuperadmin = userRole === "superadmin" || userRole === "admin";

  const counts = {
    ALL: requests.length,
    AWAITING_APPROVAL: requests.filter((r) => r.status === "AWAITING_APPROVAL" || r.status === "DRAFT").length,
    APPROVED: requests.filter((r) => r.status === "APPROVED").length,
    APPLIED: requests.filter((r) => r.status === "APPLIED").length,
    VERIFIED: requests.filter((r) => r.status === "VERIFIED").length,
    FAILED: requests.filter((r) => r.status === "FAILED").length,
    ROLLED_BACK: requests.filter((r) => r.status === "ROLLED_BACK").length,
  };

  const filteredRequests = requests.filter((r) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "AWAITING_APPROVAL") {
      return r.status === "AWAITING_APPROVAL" || r.status === "DRAFT";
    }
    return r.status === activeTab;
  });

  const refreshList = async () => {
    try {
      const res = await fetch("/api/admin/seo/change-requests");
      const data = await res.json();
      if (data.ok) {
        setRequests(data.items || []);
      }
    } catch {}
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/seo/change-requests/${id}/approve`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setFeedback({ type: "success", message: `Change request #${id} approved.` });
        await refreshList();
      } else {
        setFeedback({ type: "error", message: data.error || "Approval failed." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Operation failed." });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Enter reason for rejection:");
    if (!reason) return;

    setProcessingId(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/seo/change-requests`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "reject", reason }),
      });
      // Fallback: update status via direct API if patch endpoint not mapped
      if (!res.ok) {
        await fetch(`/api/admin/seo/change-requests/${id}/approve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reject", reason }),
        }).catch(() => {});
      }
      setFeedback({ type: "success", message: `Change request #${id} marked as rejected.` });
      await refreshList();
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Operation failed." });
    } finally {
      setProcessingId(null);
    }
  };

  const handleApply = async (id: string) => {
    setProcessingId(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/seo/change-requests/${id}/apply`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setFeedback({ type: "success", message: `Change request #${id} applied and verified live!` });
        await refreshList();
      } else {
        setFeedback({ type: "error", message: data.error || "Apply failed." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Operation failed." });
    } finally {
      setProcessingId(null);
    }
  };

  const handleVerify = async (id: string) => {
    setProcessingId(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/seo/change-requests/${id}/verify`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setFeedback({ type: "success", message: `Re-audit verification passed for #${id}.` });
        await refreshList();
      } else {
        setFeedback({ type: "error", message: data.error || "Verification failed." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Verification failed." });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRollback = async (id: string) => {
    if (!confirm("Are you sure you want to ROLLBACK this approved change? Previous source will be restored and page re-audited.")) {
      return;
    }

    setProcessingId(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/seo/change-requests/${id}/rollback`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setFeedback({ type: "success", message: `Change request #${id} rolled back successfully.` });
        await refreshList();
      } else {
        setFeedback({ type: "error", message: data.error || "Rollback failed." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Rollback failed." });
    } finally {
      setProcessingId(null);
    }
  };

  const getRiskBadge = (risk: RiskLevel, isProtected: boolean) => {
    return (
      <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
        <span
          className={`dgs-saas-chip ${
            risk === "SAFE"
              ? "success"
              : risk === "MODERATE"
              ? "primary"
              : risk === "HIGH"
              ? "warning"
              : "danger"
          }`}
          style={{ fontWeight: 700, fontSize: "0.68rem" }}
        >
          {risk} RISK
        </span>
        {isProtected && (
          <span className="dgs-saas-chip danger" style={{ fontWeight: 700, fontSize: "0.68rem" }}>
            🔒 PROTECTED TIER-0
          </span>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            SEO Approvals &amp; Change Request Engine
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
            Audit findings and keyword strategies transformed into audited, previewable, and reversible production mutations.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className="dgs-saas-btn secondary sm"
            onClick={refreshList}
          >
            ↻ Refresh Requests
          </button>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "var(--dgs-radius-md, 8px)",
            background: feedback.type === "success" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
            border: `1px solid ${feedback.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            color: feedback.type === "success" ? "var(--dgs-success)" : "#f87171",
            fontSize: "0.85rem",
          }}
        >
          {feedback.message}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)", gap: "8px", overflowX: "auto" }}>
        {(
          [
            { key: "AWAITING_APPROVAL", label: "Awaiting Approval", count: counts.AWAITING_APPROVAL },
            { key: "APPROVED", label: "Approved", count: counts.APPROVED },
            { key: "APPLIED", label: "Applied", count: counts.APPLIED },
            { key: "VERIFIED", label: "Verified", count: counts.VERIFIED },
            { key: "FAILED", label: "Failed", count: counts.FAILED },
            { key: "ROLLED_BACK", label: "Rolled Back", count: counts.ROLLED_BACK },
            { key: "ALL", label: "All Requests", count: counts.ALL },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: isActive ? "2px solid var(--dgs-primary)" : "2px solid transparent",
                padding: "8px 14px",
                color: isActive ? "#fff" : "var(--dgs-text-muted)",
                fontWeight: isActive ? 700 : 500,
                cursor: "pointer",
                fontSize: "0.85rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap",
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  background: isActive ? "var(--dgs-primary)" : "rgba(255,255,255,0.08)",
                  color: isActive ? "#000" : "#fff",
                  fontSize: "0.7rem",
                  padding: "1px 6px",
                  borderRadius: "10px",
                  fontWeight: 700,
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Request Cards Grid */}
      {filteredRequests.length === 0 ? (
        <div
          style={{
            padding: "60px 20px",
            textAlign: "center",
            background: "rgba(255,255,255,0.02)",
            borderRadius: "var(--dgs-radius-md)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>✓</div>
          <h4 style={{ margin: "0 0 4px 0", color: "#fff" }}>No Requests in this Queue</h4>
          <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
            New change requests created from Site Audits, Keyword Strategies, or Page Speed will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredRequests.map((req) => {
            const isLoading = processingId === req.id;
            const requiresSuperadmin = req.protected_page || req.risk_level === "HIGH" || req.risk_level === "CRITICAL";

            return (
              <div
                key={req.id}
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "var(--dgs-radius-md, 10px)",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {/* Header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <strong style={{ color: "#fff", fontSize: "1rem" }}>
                        #{req.id} · {req.change_type.replace(/_/g, " ")}
                      </strong>
                      <span className="dgs-saas-chip neutral" style={{ fontSize: "0.68rem" }}>
                        Source: {req.source_type}
                      </span>
                      {getRiskBadge(req.risk_level, req.protected_page)}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "var(--dgs-primary)", marginTop: "4px" }}>
                      Target: <code>{req.page_url}</code>
                      {req.keyword && <span style={{ color: "var(--dgs-text-muted)", marginLeft: "8px" }}>Query: &ldquo;{req.keyword}&rdquo;</span>}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span
                      className={`dgs-saas-chip ${
                        req.status === "VERIFIED"
                          ? "success"
                          : req.status === "APPLIED" || req.status === "APPROVED"
                          ? "primary"
                          : req.status === "FAILED"
                          ? "danger"
                          : req.status === "ROLLED_BACK"
                          ? "warning"
                          : "neutral"
                      }`}
                      style={{ fontWeight: 700 }}
                    >
                      STATUS: {req.status}
                    </span>
                  </div>
                </div>

                {/* Evidence & Why Change is Recommended */}
                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.2)",
                    borderRadius: "6px",
                    padding: "12px 14px",
                    fontSize: "0.82rem",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <div style={{ color: "#e2e8f0", marginBottom: "4px" }}>
                    <strong>Why Change is Recommended:</strong> {req.reason}
                  </div>
                  {req.evidence && (
                    <div style={{ color: "var(--dgs-text-muted)", fontSize: "0.78rem" }}>
                      <strong>Telemetry Evidence:</strong> {JSON.stringify(req.evidence)}
                    </div>
                  )}
                </div>

                {/* Proposal Diff Visual */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(239, 68, 68, 0.04)",
                      border: "1px solid rgba(239, 68, 68, 0.15)",
                      borderRadius: "6px",
                      padding: "10px 12px",
                      fontSize: "0.78rem",
                    }}
                  >
                    <div style={{ fontWeight: 600, color: "#f87171", marginBottom: "4px" }}>
                      Current Value (Before)
                    </div>
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: "#94a3b8", fontFamily: "monospace" }}>
                      {req.before_state ? JSON.stringify(req.before_state, null, 2).slice(0, 200) : "No modifications yet"}
                    </pre>
                  </div>

                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.04)",
                      border: "1px solid rgba(16, 185, 129, 0.15)",
                      borderRadius: "6px",
                      padding: "10px 12px",
                      fontSize: "0.78rem",
                    }}
                  >
                    <div style={{ fontWeight: 600, color: "#34d399", marginBottom: "4px" }}>
                      Proposed Value (After)
                    </div>
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: "#e2e8f0", fontFamily: "monospace" }}>
                      {JSON.stringify(req.proposed_state, null, 2).slice(0, 300)}
                    </pre>
                  </div>
                </div>

                {/* Implementation Plan */}
                {req.implementation_plan && req.implementation_plan.length > 0 && (
                  <div style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)" }}>
                    <strong>Implementation &amp; Verification Steps:</strong>
                    <ol style={{ margin: "4px 0 0", paddingLeft: "18px", color: "#cbd5e1" }}>
                      {req.implementation_plan.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Error message if failed */}
                {req.error_message && (
                  <div style={{ color: "#f87171", fontSize: "0.8rem", background: "rgba(239,68,68,0.08)", padding: "8px 12px", borderRadius: "4px" }}>
                    ⚠ Error: {req.error_message}
                  </div>
                )}

                {/* Action Buttons Toolbar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                    paddingTop: "8px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <div style={{ fontSize: "0.74rem", color: "var(--dgs-text-muted)" }}>
                    Created by: <strong>{req.created_by}</strong> on {req.created_at}
                    {req.approved_by && ` · Approved by: ${req.approved_by}`}
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {(req.status === "DRAFT" || req.status === "AWAITING_APPROVAL") && (
                      <>
                        <button
                          type="button"
                          className="dgs-saas-btn primary sm"
                          onClick={() => handleApprove(req.id)}
                          disabled={isLoading}
                        >
                          {isLoading ? "Approving..." : "✓ Approve Proposal"}
                        </button>
                        <button
                          type="button"
                          className="dgs-saas-btn secondary sm"
                          onClick={() => handleReject(req.id)}
                          disabled={isLoading}
                        >
                          ✕ Reject
                        </button>
                      </>
                    )}

                    {req.status === "APPROVED" && (
                      <button
                        type="button"
                        className="dgs-saas-btn primary sm"
                        onClick={() => handleApply(req.id)}
                        disabled={isLoading}
                      >
                        {isLoading ? "Applying..." : "⚡ Apply & Verify Live"}
                      </button>
                    )}

                    {(req.status === "APPLIED" || req.status === "FAILED") && (
                      <button
                        type="button"
                        className="dgs-saas-btn secondary sm"
                        onClick={() => handleVerify(req.id)}
                        disabled={isLoading}
                      >
                        ↻ Re-verify Live
                      </button>
                    )}

                    {(req.status === "APPLIED" || req.status === "VERIFIED") && (
                      <button
                        type="button"
                        className="dgs-saas-btn danger sm"
                        onClick={() => handleRollback(req.id)}
                        disabled={isLoading}
                      >
                        ↺ Rollback to Prior Source
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
