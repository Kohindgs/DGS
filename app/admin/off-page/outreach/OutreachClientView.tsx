"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  Edit3,
  Check,
  Link2,
} from "lucide-react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import type { OffPageOutreach, OutreachStage, PitchType } from "@/lib/off-page/types";

interface Props {
  initialOutreach?: OffPageOutreach[];
}

const TABS: { id: string; label: string; stages: OutreachStage[] | "ALL" }[] = [
  { id: "DRAFTS", label: "DRAFTS", stages: ["DRAFT", "NEW"] },
  { id: "APPROVED", label: "APPROVED", stages: ["APPROVED"] },
  { id: "OUTREACH", label: "OUTREACH", stages: ["OUTREACH"] },
  { id: "FOLLOW_UP", label: "FOLLOW-UP", stages: ["FOLLOW_UP"] },
  { id: "SUBMITTED", label: "SUBMITTED", stages: ["SUBMITTED", "NEGOTIATING"] },
  { id: "LIVE", label: "LIVE", stages: ["LIVE"] },
  { id: "VERIFIED", label: "VERIFIED", stages: ["VERIFIED"] },
  { id: "CLOSED", label: "CLOSED", stages: ["REJECTED", "LOST", "CLOSED"] },
  { id: "ALL", label: "ALL PIPELINE", stages: "ALL" },
];

export default function OutreachClientView({ initialOutreach }: Props) {
  const searchParams = useSearchParams();
  const initialStageParam = searchParams?.get("stage")?.toUpperCase();

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (initialStageParam === "DRAFT" || initialStageParam === "DRAFTS") return "DRAFTS";
    if (initialStageParam === "APPROVED") return "APPROVED";
    if (initialStageParam === "OUTREACH") return "OUTREACH";
    if (initialStageParam === "SUBMITTED") return "SUBMITTED";
    if (initialStageParam === "LIVE") return "LIVE";
    if (initialStageParam === "VERIFIED") return "VERIFIED";
    return "DRAFTS";
  });

  const [outreachList, setOutreachList] = useState<OffPageOutreach[]>(initialOutreach || []);
  const [loading, setLoading] = useState(!initialOutreach);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Modal states for editing / advancing a draft
  const [activeItem, setActiveItem] = useState<OffPageOutreach | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editContact, setEditContact] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTargetPage, setEditTargetPage] = useState("");
  const [editAssignedStaff, setEditAssignedStaff] = useState("");
  const [modalStage, setModalStage] = useState<OutreachStage>("DRAFT");
  const [modalNotes, setModalNotes] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchOutreach = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/off-page/outreach");
      const json = await res.json();
      if (json.ok) {
        setOutreachList(json.outreach || []);
      }
    } catch (err) {
      console.error("Failed fetching outreach:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutreach();
  }, []);

  const [grounding, setGrounding] = useState(false);
  const [groundedAssets, setGroundedAssets] = useState<Array<{ title: string; url: string; entity_type: string; semantic_relevance: number; why_matches: string }>>([]);

  const handleOpenEditModal = (item: OffPageOutreach) => {
    setActiveItem(item);
    setEditSubject(item.pitch_subject || "");
    setEditBody(item.pitch_body || "");
    setEditContact(item.contact_name || "");
    setEditEmail(item.email || "");
    setEditTargetPage(item.target_page || "https://www.dgeniussolutions.com/");
    setEditAssignedStaff(item.assigned_staff || "Kohin Bellara - CEO D'Genius Solutions");
    setModalStage(item.stage || "DRAFT");
    setModalNotes(item.notes || "");
    setLiveUrl(item.live_url || "");
    setGroundedAssets([]);
  };

  const handleRegenerateGrounded = async () => {
    if (!activeItem) return;
    setGrounding(true);
    try {
      const res = await fetch("/api/admin/off-page/outreach/ground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunity_id: activeItem.opportunity_id,
          publication: activeItem.publication,
          category: activeItem.pitch_type,
          target_page: editTargetPage || activeItem.target_page,
          contact_name: editContact || activeItem.contact_name,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        if (json.pitch_subject) setEditSubject(json.pitch_subject);
        if (json.pitch_body) setEditBody(json.pitch_body);
        if (json.recommended_target_page) setEditTargetPage(json.recommended_target_page);
        if (json.assets) setGroundedAssets(json.assets);
      }
    } catch (err) {
      console.warn("Failed regenerating draft:", err);
    } finally {
      setGrounding(false);
    }
  };

  const handleSaveDraftChanges = async (stageOverride?: OutreachStage) => {
    if (!activeItem) return;
    setSaving(true);
    const targetStage = stageOverride || modalStage;

    try {
      const res = await fetch("/api/admin/off-page/outreach", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeItem.id,
          stage: targetStage,
          pitch_subject: editSubject,
          pitch_body: editBody,
          contact_name: editContact,
          email: editEmail,
          target_page: editTargetPage,
          assigned_staff: editAssignedStaff,
          notes: modalNotes,
          live_url: liveUrl || undefined,
        }),
      });

      const json = await res.json();
      if (json.ok) {
        setFeedback(`Outreach draft ${activeItem.id} updated. Stage: ${targetStage.replace(/_/g, " ")}`);
        setActiveItem(null);
        await fetchOutreach();
      } else {
        setFeedback(`Error saving draft: ${json.error}`);
      }
    } catch (err: any) {
      setFeedback(`Network error: ${err.message}`);
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 6000);
    }
  };

  const handleQuickAdvance = async (item: OffPageOutreach, nextStage: OutreachStage) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/off-page/outreach", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          stage: nextStage,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setFeedback(`Draft ${item.id} moved to ${nextStage.replace(/_/g, " ")}.`);
        await fetchOutreach();
      } else {
        setFeedback(`Error: ${json.error}`);
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Filter current tab items
  const currentTabDef = TABS.find((t) => t.id === activeTab) || TABS[0];
  const displayedItems = outreachList.filter((item) => {
    if (currentTabDef.stages === "ALL") return true;
    return currentTabDef.stages.includes(item.stage);
  });

  // Stage summary counts
  const draftCount = outreachList.filter((o) => o.stage === "DRAFT" || o.stage === "NEW").length;
  const approvedCount = outreachList.filter((o) => o.stage === "APPROVED").length;
  const inOutreachCount = outreachList.filter((o) => o.stage === "OUTREACH" || o.stage === "FOLLOW_UP").length;
  const submittedCount = outreachList.filter((o) => o.stage === "SUBMITTED" || o.stage === "NEGOTIATING").length;
  const liveCount = outreachList.filter((o) => o.stage === "LIVE" || o.stage === "VERIFIED").length;

  const stageBadgeStyle: Record<string, { bg: string; color: string }> = {
    DRAFT: { bg: "rgba(147, 51, 234, 0.15)", color: "#c084fc" },
    NEW: { bg: "rgba(156, 163, 175, 0.15)", color: "#9ca3af" },
    QUALIFIED: { bg: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" },
    APPROVED: { bg: "rgba(16, 185, 129, 0.15)", color: "#34d399" },
    ASSIGNED: { bg: "rgba(14, 165, 233, 0.15)", color: "#38bdf8" },
    OUTREACH: { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" },
    FOLLOW_UP: { bg: "rgba(249, 115, 22, 0.15)", color: "#fb923c" },
    NEGOTIATING: { bg: "rgba(20, 184, 166, 0.15)", color: "#2dd4bf" },
    SUBMITTED: { bg: "rgba(236, 72, 153, 0.15)", color: "#f472b6" },
    LIVE: { bg: "rgba(16, 185, 129, 0.2)", color: "#10b981" },
    VERIFIED: { bg: "rgba(16, 185, 129, 0.3)", color: "#34d399" },
    REJECTED: { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444" },
  };

  const columns: Column<OffPageOutreach>[] = [
    {
      key: "id",
      header: "Draft ID & Source",
      render: (o) => (
        <div>
          <div style={{ fontFamily: "monospace", fontSize: "0.76rem", color: "var(--dgs-brand-cyan)", fontWeight: 700 }}>
            {o.id}
          </div>
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>
            Module: {o.source_module || "OPPORTUNITY"}
          </div>
        </div>
      ),
    },
    {
      key: "publication",
      header: "Target Domain & Contact",
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
                title="Open Submission / Contact URL"
                style={{ color: "var(--dgs-brand-cyan)", display: "inline-flex" }}
              >
                <ExternalLink size={13} />
              </a>
            )}
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>
            {o.contact_name ? `${o.contact_name} • ` : ""}{o.email || "No direct email"}
          </div>
        </div>
      ),
    },
    {
      key: "pitch_subject",
      header: "Pitch Subject & Content",
      render: (o) => (
        <div style={{ maxWidth: "300px" }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: "0.78rem",
              color: "#fff",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={o.pitch_subject || ""}
          >
            {o.pitch_subject || "(No subject set)"}
          </div>
          <div
            style={{
              fontSize: "0.72rem",
              color: "rgba(255,255,255,0.5)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginTop: "2px",
            }}
          >
            {o.pitch_body ? o.pitch_body.replace(/\n/g, " ") : "Draft pending..."}
          </div>
        </div>
      ),
    },
    {
      key: "target_page",
      header: "Target DGS Page",
      render: (o) => (
        <span
          style={{
            fontSize: "0.72rem",
            color: "rgba(255,255,255,0.7)",
            maxWidth: "140px",
            display: "inline-block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={o.target_page}
        >
          {o.target_page.replace("https://www.dgeniussolutions.com", "") || "/"}
        </span>
      ),
    },
    {
      key: "stage",
      header: "Stage",
      sortable: true,
      render: (o) => {
        const badge = stageBadgeStyle[o.stage] || { bg: "rgba(255,255,255,0.08)", color: "#fff" };
        return (
          <span
            style={{
              padding: "3px 8px",
              borderRadius: "6px",
              fontSize: "0.7rem",
              fontWeight: 700,
              background: badge.bg,
              color: badge.color,
            }}
          >
            {o.stage.replace(/_/g, " ")}
          </span>
        );
      },
    },
    {
      key: "created_at",
      header: "Date Created",
      sortable: true,
      render: (o) => (
        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>
          {o.drafted_at ? new Date(o.drafted_at).toLocaleDateString() : o.created_at ? new Date(o.created_at).toLocaleDateString() : "Today"}
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
            Off-Page Outreach CRM & Draft Management
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
            Standard Sender: <strong style={{ color: "#fff" }}>Kohin Bellara - CEO D'Genius Solutions</strong>. All pitches require human review and approval.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.75rem", color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>
            <ShieldCheck size={14} /> Human-in-the-Loop Enforced
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

      {/* Summary KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "12px",
        }}
      >
        <div className="dgs-saas-card" style={{ padding: "14px 18px", cursor: "pointer" }} onClick={() => setActiveTab("DRAFTS")}>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Drafts Awaiting Review</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#c084fc", marginTop: "4px" }}>{draftCount}</div>
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>Editable draft pitches</div>
        </div>

        <div className="dgs-saas-card" style={{ padding: "14px 18px", cursor: "pointer" }} onClick={() => setActiveTab("APPROVED")}>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Approved for Sending</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#34d399", marginTop: "4px" }}>{approvedCount}</div>
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>Pitches verified by lead</div>
        </div>

        <div className="dgs-saas-card" style={{ padding: "14px 18px", cursor: "pointer" }} onClick={() => setActiveTab("OUTREACH")}>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>In Outreach / Sent</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f59e0b", marginTop: "4px" }}>{inOutreachCount}</div>
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>Awaiting editorial response</div>
        </div>

        <div className="dgs-saas-card" style={{ padding: "14px 18px", cursor: "pointer" }} onClick={() => setActiveTab("SUBMITTED")}>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Submitted to Publications</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f472b6", marginTop: "4px" }}>{submittedCount}</div>
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>Article / listing lodged</div>
        </div>

        <div className="dgs-saas-card" style={{ padding: "14px 18px", cursor: "pointer" }} onClick={() => setActiveTab("LIVE")}>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Live & Verified Wins</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#10b981", marginTop: "4px" }}>{liveCount}</div>
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>Earned backlinks</div>
        </div>
      </div>

      {/* Sub-tabs Sequence */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          flexWrap: "wrap",
          padding: "8px 12px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "var(--dgs-radius-md)",
        }}
      >
        <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", fontWeight: 700, marginRight: "4px" }}>
          CRM PIPELINE:
        </span>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`dgs-saas-chip ${activeTab === t.id ? "primary" : ""}`}
            style={{
              cursor: "pointer",
              border: "none",
              fontWeight: activeTab === t.id ? 700 : 500,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Table */}
      <div className="dgs-saas-card" style={{ padding: "16px" }}>
        <SaaSTable<OffPageOutreach>
          columns={columns}
          data={displayedItems}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search publication, domain, draft subject, or contact..."
          searchFilter={(item, q) =>
            item.publication.toLowerCase().includes(q) ||
            (item.contact_name || "").toLowerCase().includes(q) ||
            (item.email || "").toLowerCase().includes(q) ||
            (item.pitch_subject || "").toLowerCase().includes(q) ||
            (item.source_module || "").toLowerCase().includes(q)
          }
          actions={(item) => (
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <button
                onClick={() => handleOpenEditModal(item)}
                className="dgs-saas-btn primary"
                style={{ fontSize: "0.72rem", padding: "4px 8px", display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                <Edit3 size={12} /> Edit / Review
              </button>
              {(item.stage === "DRAFT" || item.stage === "NEW") && (
                <button
                  onClick={() => handleQuickAdvance(item, "APPROVED")}
                  className="dgs-saas-btn secondary"
                  style={{ fontSize: "0.72rem", padding: "4px 8px", color: "#34d399", borderColor: "rgba(16,185,129,0.3)" }}
                  title="Approve Pitch"
                >
                  <Check size={12} /> Approve
                </button>
              )}
            </div>
          )}
          initialPageSize={12}
          emptyMessage={`No items found in the ${activeTab} stage.`}
        />
      </div>

      {/* Full Edit Draft / Advance Stage Modal */}
      {activeItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
        >
          <div
            className="dgs-saas-card"
            style={{
              width: "100%",
              maxWidth: "680px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
              background: "#111827",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Mail size={20} color="var(--dgs-brand-cyan)" />
                <div>
                  <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem" }}>
                    Edit Outreach Draft: {activeItem.publication}
                  </h3>
                  <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>
                    Draft ID: {activeItem.id} • Source: {activeItem.source_module || "OPPORTUNITY"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Sender identity note & TurboVec Grounding button */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "14px",
                padding: "8px 12px",
                borderRadius: "6px",
                background: "rgba(0, 198, 255, 0.08)",
                border: "1px solid rgba(0, 198, 255, 0.2)",
                fontSize: "0.76rem",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              <div>
                Sender: <strong style={{ color: "#fff" }}>{editAssignedStaff || "Kohin Bellara - CEO D'Genius Solutions"}</strong>
              </div>
              <button
                type="button"
                onClick={handleRegenerateGrounded}
                disabled={grounding}
                className="dgs-saas-btn secondary"
                style={{ fontSize: "0.72rem", padding: "3px 8px", display: "inline-flex", alignItems: "center", gap: "5px" }}
              >
                <Sparkles size={12} className={grounding ? "animate-spin" : ""} color="var(--dgs-brand-cyan)" />
                {grounding ? "Grounding..." : "Regenerate Grounded Pitch"}
              </button>
            </div>

            {/* Matched Supporting Assets if retrieved */}
            {groundedAssets.length > 0 && (
              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--dgs-brand-cyan)", marginBottom: "6px" }}>
                  SUPPORTING DGS ASSETS RETRIEVED:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {groundedAssets.slice(0, 2).map((a, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "6px",
                        background: "#1f2937",
                        border: "1px solid rgba(255,255,255,0.08)",
                        fontSize: "0.72rem",
                      }}
                    >
                      <div style={{ fontWeight: 650, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {a.title}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", color: "rgba(255,255,255,0.5)" }}>
                        <span>{a.entity_type}</span>
                        <span style={{ color: "#34d399", fontWeight: 700 }}>
                          {(a.semantic_relevance * 100).toFixed(0)}% Relevance
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pitch Subject */}
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "0.78rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Pitch Subject Line:
              </label>
              <input
                type="text"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              />
            </div>

            {/* Pitch Body */}
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "0.78rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Pitch Body / Message:
              </label>
              <textarea
                rows={9}
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  background: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "0.82rem",
                  lineHeight: "1.5",
                  fontFamily: "monospace",
                }}
              />
            </div>

            {/* Contact Details Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", marginBottom: "4px" }}>
                  Contact Name:
                </label>
                <input
                  type="text"
                  value={editContact}
                  onChange={(e) => setEditContact(e.target.value)}
                  placeholder="e.g. Editorial Team or Editor Name"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    background: "#1f2937",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#fff",
                    fontSize: "0.8rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", marginBottom: "4px" }}>
                  Contact Email:
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="editor@publication.com"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    background: "#1f2937",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#fff",
                    fontSize: "0.8rem",
                  }}
                />
              </div>
            </div>

            {/* Target DGS Page */}
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", marginBottom: "4px" }}>
                Target DGS Landing Page:
              </label>
              <input
                type="text"
                value={editTargetPage}
                onChange={(e) => setEditTargetPage(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  background: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#fff",
                  fontSize: "0.8rem",
                }}
              />
            </div>

            {/* Advance Stage Selector */}
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Pipeline Stage:
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
                  fontSize: "0.82rem",
                }}
              >
                <option value="DRAFT">DRAFT — Drafted & Awaiting Human Review</option>
                <option value="APPROVED">APPROVED — Pitch Reviewed & Approved to Send</option>
                <option value="OUTREACH">OUTREACH — Sent to Publication</option>
                <option value="FOLLOW_UP">FOLLOW_UP — Follow-Up Sent</option>
                <option value="NEGOTIATING">NEGOTIATING — Active Editorial Discussion</option>
                <option value="SUBMITTED">SUBMITTED — Guest Article or Directory Entry Submitted</option>
                <option value="LIVE">LIVE — Published Live on Target Site</option>
                <option value="VERIFIED">VERIFIED — Crawled, Found & Verified DoFollow</option>
                <option value="REJECTED">REJECTED — Declined or Incompatible</option>
              </select>
            </div>

            {/* Live URL Input (when Live or Verified) */}
            {(modalStage === "LIVE" || modalStage === "VERIFIED") && (
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#10b981", marginBottom: "4px" }}>
                  Live Article / Backlink URL (will automatically create verified backlink):
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/live-article-mentioning-dgs"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    background: "#1f2937",
                    border: "1px solid #10b981",
                    color: "#fff",
                    fontSize: "0.8rem",
                  }}
                />
              </div>
            )}

            {/* Internal Notes */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", marginBottom: "4px" }}>
                Internal Audit / Outreach Notes:
              </label>
              <textarea
                rows={2}
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                placeholder="Editorial response, submitted prompt details..."
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  background: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#fff",
                  fontSize: "0.8rem",
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="dgs-saas-btn secondary"
                style={{ fontSize: "0.8rem" }}
              >
                Cancel
              </button>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {modalStage === "DRAFT" && (
                  <button
                    type="button"
                    onClick={() => handleSaveDraftChanges("APPROVED")}
                    disabled={saving}
                    className="dgs-saas-btn secondary"
                    style={{ fontSize: "0.8rem", color: "#34d399", borderColor: "rgba(16,185,129,0.4)" }}
                  >
                    Approve Draft
                  </button>
                )}

                {modalStage === "APPROVED" && (
                  <button
                    type="button"
                    onClick={() => handleSaveDraftChanges("OUTREACH")}
                    disabled={saving}
                    className="dgs-saas-btn secondary"
                    style={{ fontSize: "0.8rem", color: "#f59e0b", borderColor: "rgba(245,158,11,0.4)" }}
                  >
                    Mark Sent (Outreach)
                  </button>
                )}

                {(modalStage === "OUTREACH" || modalStage === "FOLLOW_UP" || modalStage === "NEGOTIATING") && (
                  <button
                    type="button"
                    onClick={() => handleSaveDraftChanges("SUBMITTED")}
                    disabled={saving}
                    className="dgs-saas-btn secondary"
                    style={{ fontSize: "0.8rem", color: "#f472b6", borderColor: "rgba(236,72,153,0.4)" }}
                  >
                    Mark Submitted
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleSaveDraftChanges()}
                  disabled={saving}
                  className="dgs-saas-btn primary"
                  style={{ fontSize: "0.8rem" }}
                >
                  {saving ? "Saving..." : "Save Draft Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
