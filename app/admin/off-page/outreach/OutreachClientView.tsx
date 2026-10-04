"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Send,
  AlertCircle,
  FileText,
  UserCheck,
  X,
} from "lucide-react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import type { OffPageOutreach, OutreachStage } from "@/lib/off-page/types";

interface Props {
  initialOutreach?: OffPageOutreach[];
}

export default function OutreachClientView({ initialOutreach }: Props) {
  const [outreachList, setOutreachList] = useState<OffPageOutreach[]>(initialOutreach || []);
  const [loading, setLoading] = useState(!initialOutreach);
  const [selectedStage, setSelectedStage] = useState<string>("ALL");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Edit / Review Pitch Modal
  const [activeItem, setActiveItem] = useState<OffPageOutreach | null>(null);
  const [modalStage, setModalStage] = useState<OutreachStage>("APPROVED");
  const [modalNotes, setModalNotes] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchOutreach = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStage !== "ALL") params.set("stage", selectedStage);
      const res = await fetch(`/api/admin/off-page/outreach?${params.toString()}`);
      const json = await res.json();
      if (json.ok) {
        setOutreachList(json.outreach);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutreach();
  }, [selectedStage]);

  const handleOpenModal = (item: OffPageOutreach) => {
    setActiveItem(item);
    setModalStage(item.stage);
    setModalNotes(item.notes || "");
    setLiveUrl(item.live_url || "");
  };

  const handleUpdateStage = async () => {
    if (!activeItem) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/off-page/outreach", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeItem.id,
          stage: modalStage,
          notes: modalNotes,
          live_url: liveUrl || undefined,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setOutreachList((prev) =>
          prev.map((o) => (o.id === activeItem.id ? { ...o, stage: modalStage, notes: modalNotes, live_url: liveUrl } : o))
        );
        setActiveItem(null);
        setFeedback(`Outreach task advanced to ${modalStage}.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Stage pipeline groupings
  const awaitingApprovalCount = outreachList.filter(
    (o) => o.stage === "NEW" || o.stage === "QUALIFIED"
  ).length;
  const inOutreachCount = outreachList.filter(
    (o) => o.stage === "APPROVED" || o.stage === "ASSIGNED" || o.stage === "OUTREACH" || o.stage === "FOLLOW_UP"
  ).length;
  const inDiscussionCount = outreachList.filter(
    (o) => o.stage === "NEGOTIATING" || o.stage === "SUBMITTED"
  ).length;
  const liveCount = outreachList.filter((o) => o.stage === "LIVE" || o.stage === "VERIFIED").length;

  const columns: Column<OffPageOutreach>[] = [
    {
      key: "publication",
      header: "Target Platform / Publication",
      sortable: true,
      render: (o) => (
        <div>
          <div style={{ fontWeight: 650, color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
            {o.publication}
            {(o.contact_url || o.submission_url) && (
              <a
                href={o.contact_url || o.submission_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--dgs-brand-cyan)", display: "inline-flex" }}
              >
                <ExternalLink size={13} />
              </a>
            )}
          </div>
          <div style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.5)" }}>
            {o.contact_name ? `${o.contact_name} • ` : ""}{o.email || "No direct email logged"}
          </div>
        </div>
      ),
    },
    {
      key: "pitch_type",
      header: "Pitch Type",
      render: (o) => (
        <span
          style={{
            fontSize: "0.72rem",
            padding: "2px 7px",
            borderRadius: "4px",
            background: "rgba(0, 198, 255, 0.12)",
            color: "var(--dgs-brand-cyan)",
            fontWeight: 650,
          }}
        >
          {o.pitch_type || "EDITORIAL"}
        </span>
      ),
    },
    {
      key: "target_page",
      header: "Target DGS Page",
      render: (o) => (
        <span
          style={{
            fontSize: "0.74rem",
            color: "rgba(255,255,255,0.7)",
            maxWidth: "160px",
            display: "inline-block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={o.target_page}
        >
          {o.target_page || "/"}
        </span>
      ),
    },
    {
      key: "stage",
      header: "CRM Stage",
      sortable: true,
      render: (o) => {
        const stageColors: Record<string, { bg: string; color: string }> = {
          NEW: { bg: "rgba(156,163,175,0.15)", color: "#9ca3af" },
          QUALIFIED: { bg: "rgba(59,130,246,0.15)", color: "#60a5fa" },
          APPROVED: { bg: "rgba(168,85,247,0.15)", color: "#c084fc" },
          ASSIGNED: { bg: "rgba(14,165,233,0.15)", color: "#38bdf8" },
          OUTREACH: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
          FOLLOW_UP: { bg: "rgba(249,115,22,0.15)", color: "#fb923c" },
          NEGOTIATING: { bg: "rgba(20,184,166,0.15)", color: "#2dd4bf" },
          SUBMITTED: { bg: "rgba(236,72,153,0.15)", color: "#f472b6" },
          LIVE: { bg: "rgba(16,185,129,0.15)", color: "#10b981" },
          VERIFIED: { bg: "rgba(16,185,129,0.25)", color: "#34d399" },
          REJECTED: { bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
        };
        const c = stageColors[o.stage] || { bg: "rgba(255,255,255,0.08)", color: "#fff" };
        return (
          <span
            style={{
              padding: "3px 8px",
              borderRadius: "6px",
              fontSize: "0.7rem",
              fontWeight: 700,
              background: c.bg,
              color: c.color,
            }}
          >
            {o.stage.replace(/_/g, " ")}
          </span>
        );
      },
    },
    {
      key: "approval",
      header: "Approval",
      render: (o) => {
        const approved = o.stage !== "NEW" && o.stage !== "QUALIFIED";
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "0.72rem",
              fontWeight: 650,
              color: approved ? "#10b981" : "#f59e0b",
            }}
          >
            {approved ? <CheckCircle2 size={13} /> : <Clock size={13} />}
            {approved ? "Approved" : "Pending Review"}
          </span>
        );
      },
    },
    {
      key: "updated_at",
      header: "Last Update",
      render: (o) => (
        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>
          {o.updated_at ? new Date(o.updated_at).toLocaleDateString() : "New"}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Top Banner */}
      <div
        className="dgs-saas-card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          padding: "16px 20px",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
            Off-Page Outreach CRM & Approval Workflow
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
            11-stage human-in-the-loop pipeline. Auto-pitching and spammy automated form submissions are strictly blocked by policy.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.75rem", color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>
            <ShieldCheck size={14} /> Human Approval Mandatory Before Send
          </span>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: "var(--dgs-radius-md)",
            background: "rgba(0, 198, 255, 0.15)",
            border: "1px solid var(--dgs-brand-cyan)",
            color: "#fff",
            fontSize: "0.84rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Sparkles size={16} color="var(--dgs-brand-cyan)" />
          {feedback}
        </div>
      )}

      {/* Pipeline Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
        }}
      >
        <div className="dgs-saas-card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Drafts & Awaiting Review</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#60a5fa", marginTop: "4px" }}>
            {awaitingApprovalCount}
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>Requires human approval</div>
        </div>

        <div className="dgs-saas-card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Active Outreach</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f59e0b", marginTop: "4px" }}>
            {inOutreachCount}
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>Approved pitches in market</div>
        </div>

        <div className="dgs-saas-card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>In Discussion / Submissions</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#c084fc", marginTop: "4px" }}>
            {inDiscussionCount}
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>Agreed editorial / pending live</div>
        </div>

        <div className="dgs-saas-card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Live Verified Backlinks</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#10b981", marginTop: "4px" }}>
            {liveCount}
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>Earned authority wins</div>
        </div>
      </div>

      {/* Stage Filter */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
          padding: "10px 16px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "var(--dgs-radius-md)",
        }}
      >
        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Stage Filter:</span>
        {[
          "ALL",
          "NEW",
          "APPROVED",
          "OUTREACH",
          "FOLLOW_UP",
          "NEGOTIATING",
          "SUBMITTED",
          "LIVE",
          "VERIFIED",
        ].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStage(st)}
            className={`dgs-saas-chip ${selectedStage === st ? "primary" : ""}`}
            style={{ cursor: "pointer", border: "none" }}
          >
            {st.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Main SaaS Table */}
      <div className="dgs-saas-card" style={{ padding: "16px" }}>
        <SaaSTable<OffPageOutreach>
          columns={columns}
          data={outreachList}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search publication, contact email, subject..."
          searchFilter={(item, q) =>
            item.publication.toLowerCase().includes(q) ||
            (item.contact_name || "").toLowerCase().includes(q) ||
            (item.email || "").toLowerCase().includes(q) ||
            (item.pitch_subject || "").toLowerCase().includes(q)
          }
          actions={(item) => (
            <button
              onClick={() => handleOpenModal(item)}
              className="dgs-saas-btn primary"
              style={{ fontSize: "0.72rem", padding: "4px 8px" }}
            >
              Manage / Advance
            </button>
          )}
          initialPageSize={12}
          emptyMessage="No outreach tasks found for this stage."
        />
      </div>

      {/* Manage / Advance Stage Modal */}
      {activeItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="dgs-saas-card"
            style={{
              width: "100%",
              maxWidth: "600px",
              padding: "24px",
              background: "#111827",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Mail size={18} color="var(--dgs-brand-cyan)" />
                <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem" }}>
                  Manage Outreach: {activeItem.publication}
                </h3>
              </div>
              <button onClick={() => setActiveItem(null)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            {/* Pitch Subject & Body preview */}
            <div style={{ marginBottom: "14px", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "6px" }}>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>Subject:</div>
              <div style={{ fontWeight: 650, color: "#fff", fontSize: "0.85rem", marginBottom: "8px" }}>
                {activeItem.pitch_subject || "(No subject set)"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>Pitch Content:</div>
              <div
                style={{
                  fontSize: "0.76rem",
                  color: "rgba(255,255,255,0.75)",
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  maxHeight: "140px",
                  overflowY: "auto",
                  marginTop: "4px",
                }}
              >
                {activeItem.pitch_body || "(No pitch body)"}
              </div>
            </div>

            {/* Stage Selector */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Advance Pipeline Stage:
              </label>
              <select
                value={modalStage}
                onChange={(e) => setModalStage(e.target.value as OutreachStage)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  background: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                }}
              >
                <option value="NEW">NEW — Newly Discovered</option>
                <option value="QUALIFIED">QUALIFIED — Vetted for Relevance</option>
                <option value="APPROVED">APPROVED — Pitch Approved</option>
                <option value="ASSIGNED">ASSIGNED — Assigned to Team</option>
                <option value="OUTREACH">OUTREACH — Pitch Sent</option>
                <option value="FOLLOW_UP">FOLLOW_UP — Follow-Up Sent</option>
                <option value="NEGOTIATING">NEGOTIATING — In Discussion with Editor</option>
                <option value="SUBMITTED">SUBMITTED — Guest Article / Listing Lodged</option>
                <option value="LIVE">LIVE — Active Link Detected</option>
                <option value="VERIFIED">VERIFIED — Quality & Indexability Verified</option>
                <option value="REJECTED">REJECTED — Declined or Irrelevant</option>
              </select>
            </div>

            {(modalStage === "LIVE" || modalStage === "VERIFIED") && (
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#10b981", marginBottom: "4px" }}>
                  Live Article / Backlink URL:
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/published-article"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    background: "#1f2937",
                    border: "1px solid #10b981",
                    color: "#fff",
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Internal Notes:
              </label>
              <textarea
                rows={2}
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                placeholder="Spoke with editor, agreed on case study feature..."
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  background: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "0.8rem",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setActiveItem(null)} className="dgs-saas-btn secondary">
                Cancel
              </button>
              <button onClick={handleUpdateStage} disabled={updating} className="dgs-saas-btn primary">
                {updating ? "Updating..." : "Save Pipeline Stage"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
