"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  UserCheck,
  Clock,
  ArrowRight,
  Check,
  X,
  FileQuestion,
  Search,
} from "lucide-react";
import type { OffPageBacklink } from "@/lib/off-page/types";

interface Props {
  initialItems?: OffPageBacklink[];
  initialTotal?: number;
  initialSummary?: {
    activeMismatches: number;
    resolvedMismatches: number;
    teamLiveCrawlerLost: number;
    teamSubmittedCrawlerLive: number;
  };
}

export default function MismatchesClientView({
  initialItems,
  initialTotal,
  initialSummary,
}: Props) {
  const [items, setItems] = useState<OffPageBacklink[]>(initialItems || []);
  const [total, setTotal] = useState(initialTotal || 0);
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"MISMATCH" | "RESOLVED" | "ALL">("MISMATCH");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [recheckingId, setRecheckingId] = useState<string | null>(null);

  // Resolution modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalResolution, setModalResolution] = useState<"ACCEPTED_VERIFIED" | "KEPT_TEAM" | "ASSIGNED_REVIEW">("ACCEPTED_VERIFIED");
  const [selectedItem, setSelectedItem] = useState<OffPageBacklink | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolutionAssignee, setResolutionAssignee] = useState("");
  const [submittingResolution, setSubmittingResolution] = useState(false);

  const fetchMismatches = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/off-page/mismatches?status=${statusFilter}&limit=100`);
      const json = await res.json();
      if (json.success) {
        setItems(json.items);
        setTotal(json.total);
        if (json.summary) setSummary(json.summary);
      }
    } catch (err) {
      console.error("Failed to load mismatches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMismatches();
  }, [statusFilter]);

  const handleLiveRecheck = async (id: string) => {
    setRecheckingId(id);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/off-page/mismatches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backlinkId: id, resolution: "RECHECKED" }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback(`Live re-check completed: ${json.message}`);
        await fetchMismatches();
      } else {
        setFeedback(`Recheck failed: ${json.error}`);
      }
    } catch (err: any) {
      setFeedback(`Recheck error: ${err.message}`);
    } finally {
      setRecheckingId(null);
    }
  };

  const openResolutionModal = (
    item: OffPageBacklink,
    resolution: "ACCEPTED_VERIFIED" | "KEPT_TEAM" | "ASSIGNED_REVIEW"
  ) => {
    setSelectedItem(item);
    setModalResolution(resolution);
    setResolutionNote("");
    setResolutionAssignee(item.owner || "");
    setModalOpen(true);
  };

  const handleResolutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setSubmittingResolution(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/off-page/mismatches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backlinkId: selectedItem.id,
          resolution: modalResolution,
          note: resolutionNote || undefined,
          assignee: resolutionAssignee || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback(`Reconciliation saved: ${json.message}`);
        setModalOpen(false);
        await fetchMismatches();
      } else {
        setFeedback(`Failed to resolve mismatch: ${json.error}`);
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setSubmittingResolution(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top Banner */}
      <div
        className="dgs-saas-card"
        style={{
          padding: "20px 24px",
          background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(249, 115, 22, 0.08) 100%)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <ShieldAlert size={24} style={{ color: "#ef4444" }} />
              <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700, color: "#fff" }}>
                STATUS RECONCILIATION QUEUE — TWO-STATUS TRUTH ENGINE
              </h2>
              <span className="dgs-saas-chip danger" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                NON-DESTRUCTIVE AUDIT
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "0.88rem", color: "rgba(255, 255, 255, 0.7)" }}>
              The firewall between what humans claim and what the automated crawler proves. Automated checks never silently overwrite human history; every discrepancy is brought here for manager review and resolution.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={fetchMismatches}
              className="dgs-saas-btn secondary"
              disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem" }}
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh Queue
            </button>
            <Link
              href="/admin/off-page/backlinks"
              className="dgs-saas-btn primary"
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", textDecoration: "none" }}
            >
              View All Backlinks
            </Link>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className="dgs-saas-card"
          style={{
            padding: "12px 18px",
            background: feedback.includes("failed") || feedback.includes("Error") ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
            border: `1px solid ${feedback.includes("failed") || feedback.includes("Error") ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
            color: "#fff",
            fontSize: "0.88rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}>
            ✕
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
        }}
      >
        <div className="dgs-saas-card" style={{ padding: "16px", borderColor: (summary?.activeMismatches || 0) > 0 ? "rgba(249, 115, 22, 0.4)" : "rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>
            Active Mismatches
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#f97316" }}>
            {summary?.activeMismatches || 0}
          </div>
          <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)", marginTop: "4px" }}>
            Requiring manager action
          </div>
        </div>

        <div className="dgs-saas-card" style={{ padding: "16px", borderColor: (summary?.teamLiveCrawlerLost || 0) > 0 ? "rgba(239, 68, 68, 0.4)" : "rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>
            Team LIVE / Crawler LOST
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#ef4444" }}>
            {summary?.teamLiveCrawlerLost || 0}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "4px" }}>
            Critical link decay risk
          </div>
        </div>

        <div className="dgs-saas-card" style={{ padding: "16px", borderColor: "rgba(16, 185, 129, 0.3)" }}>
          <div style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>
            Team SUBMITTED / Crawler LIVE
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#10b981" }}>
            {summary?.teamSubmittedCrawlerLive || 0}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#10b981", marginTop: "4px" }}>
            Premature status / Link verified
          </div>
        </div>

        <div className="dgs-saas-card" style={{ padding: "16px" }}>
          <div style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>
            Resolved Mismatches
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff" }}>
            {summary?.resolvedMismatches || 0}
          </div>
          <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)", marginTop: "4px" }}>
            Audited & reconciled
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="dgs-saas-card" style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => setStatusFilter("MISMATCH")}
              className={`dgs-saas-chip ${statusFilter === "MISMATCH" ? "danger" : "neutral"}`}
              style={{ cursor: "pointer", border: "none", fontSize: "0.82rem", padding: "6px 12px", fontWeight: 600 }}
            >
              Active Discrepancies ({summary?.activeMismatches || 0})
            </button>
            <button
              onClick={() => setStatusFilter("RESOLVED")}
              className={`dgs-saas-chip ${statusFilter === "RESOLVED" ? "success" : "neutral"}`}
              style={{ cursor: "pointer", border: "none", fontSize: "0.82rem", padding: "6px 12px", fontWeight: 600 }}
            >
              Resolved ({summary?.resolvedMismatches || 0})
            </button>
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`dgs-saas-chip ${statusFilter === "ALL" ? "primary" : "neutral"}`}
              style={{ cursor: "pointer", border: "none", fontSize: "0.82rem", padding: "6px 12px", fontWeight: 600 }}
            >
              All Records
            </button>
          </div>

          <div style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.5)" }}>
            Showing {items.length} of {total} records
          </div>
        </div>

        {items.length === 0 ? (
          <div style={{ padding: "50px", textAlign: "center", color: "rgba(255, 255, 255, 0.5)" }}>
            <CheckCircle2 size={40} style={{ color: "#10b981", margin: "0 auto 12px auto" }} />
            <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#fff" }}>
              Zero Status Mismatches!
            </div>
            <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>
              Human reported statuses and automated crawler verification results are 100% synchronized.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="dgs-saas-table" style={{ width: "100%", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <th style={{ padding: "12px 10px" }}>Source Domain & URL</th>
                  <th style={{ padding: "12px 10px" }}>Target Page & Anchor</th>
                  <th style={{ padding: "12px 10px" }}>Team Claim</th>
                  <th style={{ padding: "12px 10px" }}>Crawler Proof</th>
                  <th style={{ padding: "12px 10px" }}>Discrepancy Detail</th>
                  <th style={{ padding: "12px 10px" }}>Executive</th>
                  <th style={{ padding: "12px 10px", textAlign: "right" }}>Manager Reconciliation Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((bl) => {
                  const teamLiveCrawlerLost = bl.team_status === "LIVE" && (bl.verified_status === "LOST" || bl.verified_status === "BROKEN" || bl.status === "LOST");
                  const teamSubmittedCrawlerLive = bl.team_status === "SUBMITTED" && bl.verified_status === "LIVE";

                  return (
                    <tr
                      key={bl.id}
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                        backgroundColor: teamLiveCrawlerLost ? "rgba(239, 68, 68, 0.05)" : "transparent",
                      }}
                    >
                      <td style={{ padding: "12px 10px", maxWidth: "220px" }}>
                        <div style={{ fontWeight: 600, color: "#fff" }}>{bl.source_domain}</div>
                        <a
                          href={bl.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#3b82f6",
                            fontSize: "0.76rem",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "200px",
                          }}
                        >
                          {bl.source_url} <ExternalLink size={10} />
                        </a>
                      </td>

                      <td style={{ padding: "12px 10px", maxWidth: "200px" }}>
                        <div style={{ fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {bl.target_url}
                        </div>
                        <div style={{ fontSize: "0.74rem", color: "rgba(255, 255, 255, 0.5)" }}>
                          Anchor: <span style={{ color: "#fff" }}>{bl.anchor_text || "—"}</span> ({bl.link_rel})
                        </div>
                      </td>

                      <td style={{ padding: "12px 10px" }}>
                        <span
                          className={`dgs-saas-chip ${
                            bl.team_status === "LIVE" ? "success" : bl.team_status === "SUBMITTED" ? "primary" : "warning"
                          }`}
                          style={{ fontSize: "0.72rem", fontWeight: 700 }}
                        >
                          {bl.team_status || "LIVE"}
                        </span>
                      </td>

                      <td style={{ padding: "12px 10px" }}>
                        <span
                          className={`dgs-saas-chip ${
                            bl.verified_status === "LIVE" ? "success" : bl.verified_status === "NOT_VERIFIED" ? "neutral" : "danger"
                          }`}
                          style={{ fontSize: "0.72rem", fontWeight: 700 }}
                        >
                          {bl.verified_status || "NOT_VERIFIED"}
                        </span>
                        {bl.http_status && (
                          <div style={{ fontSize: "0.7rem", color: "rgba(255, 255, 255, 0.4)", marginTop: "2px" }}>
                            HTTP {bl.http_status}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: "12px 10px", maxWidth: "240px" }}>
                        <div style={{ fontSize: "0.76rem", color: teamLiveCrawlerLost ? "#fca5a5" : "#e2e8f0" }}>
                          {bl.mismatch_reason || (teamLiveCrawlerLost ? "Team claims LIVE but crawler found link missing or 404" : "Status discrepancy detected")}
                        </div>
                        {bl.mismatch_detected_at && (
                          <div style={{ fontSize: "0.7rem", color: "rgba(255, 255, 255, 0.4)", marginTop: "2px" }}>
                            Detected: {new Date(bl.mismatch_detected_at).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: "12px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <UserCheck size={13} style={{ color: bl.owner ? "#10b981" : "rgba(255,255,255,0.4)" }} />
                          <span style={{ fontSize: "0.8rem", color: bl.owner ? "#fff" : "rgba(255,255,255,0.4)" }}>
                            {bl.owner || "Unassigned"}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: "12px 10px", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px", flexWrap: "wrap" }}>
                          <button
                            onClick={() => handleLiveRecheck(bl.id)}
                            disabled={recheckingId === bl.id}
                            className="dgs-saas-btn neutral"
                            style={{ padding: "3px 8px", fontSize: "0.74rem" }}
                            title="Instant live crawler check"
                          >
                            <RefreshCw size={11} className={recheckingId === bl.id ? "animate-spin" : ""} />
                            Recheck
                          </button>

                          <button
                            onClick={() => openResolutionModal(bl, "ACCEPTED_VERIFIED")}
                            className="dgs-saas-btn success"
                            style={{ padding: "3px 8px", fontSize: "0.74rem" }}
                            title="Accept crawler proof and update human status"
                          >
                            Accept Verified
                          </button>

                          <button
                            onClick={() => openResolutionModal(bl, "KEPT_TEAM")}
                            className="dgs-saas-btn secondary"
                            style={{ padding: "3px 8px", fontSize: "0.74rem" }}
                            title="Keep human status with note"
                          >
                            Keep Human
                          </button>

                          <button
                            onClick={() => openResolutionModal(bl, "ASSIGNED_REVIEW")}
                            className="dgs-saas-btn warning"
                            style={{ padding: "3px 8px", fontSize: "0.74rem" }}
                            title="Assign to executive to investigate"
                          >
                            Assign Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RESOLUTION MODAL */}
      {modalOpen && selectedItem && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            className="dgs-saas-card"
            style={{
              width: "100%",
              maxWidth: "520px",
              padding: "24px",
              background: "#111827",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#fff" }}>
                {modalResolution === "ACCEPTED_VERIFIED" && "Accept Crawler Verified Truth"}
                {modalResolution === "KEPT_TEAM" && "Retain Human Reported Status"}
                {modalResolution === "ASSIGNED_REVIEW" && "Assign Investigation to Executive"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "10px 14px", background: "rgba(255, 255, 255, 0.04)", borderRadius: "8px", marginBottom: "16px" }}>
              <div style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.7)" }}>
                Source: <span style={{ color: "#fff", fontWeight: 600 }}>{selectedItem.source_domain}</span>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "6px", fontSize: "0.8rem" }}>
                <span>Human Claim: <b style={{ color: "#3b82f6" }}>{selectedItem.team_status}</b></span>
                <ArrowRight size={14} style={{ alignSelf: "center", color: "rgba(255,255,255,0.4)" }} />
                <span>Crawler Proof: <b style={{ color: "#ef4444" }}>{selectedItem.verified_status}</b></span>
              </div>
            </div>

            <form onSubmit={handleResolutionSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {modalResolution === "ASSIGNED_REVIEW" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)", marginBottom: "4px" }}>
                    Assigned Executive:
                  </label>
                  <input
                    type="text"
                    className="dgs-saas-input"
                    value={resolutionAssignee}
                    onChange={(e) => setResolutionAssignee(e.target.value)}
                    placeholder="e.g. Aakash, Pooja, Rohan"
                    required
                    style={{ width: "100%" }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)", marginBottom: "4px" }}>
                  Resolution Note / Rationale:
                </label>
                <textarea
                  className="dgs-saas-input"
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder={
                    modalResolution === "ACCEPTED_VERIFIED"
                      ? "e.g. Confirmed post deleted by editor, moved to Lost"
                      : modalResolution === "KEPT_TEAM"
                      ? "e.g. Verified manual bypass; site blocked crawler User-Agent via Cloudflare"
                      : "Instructions for executive outreach to webmaster..."
                  }
                  required={modalResolution === "KEPT_TEAM"}
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="dgs-saas-btn secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResolution}
                  className="dgs-saas-btn primary"
                >
                  {submittingResolution ? "Saving..." : "Apply Reconciliation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
