"use client";

import React, { useState } from "react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import {
  Users,
  LayoutGrid,
  List,
  Search,
  Trash2,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  X,
  ExternalLink,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";

export type CandidateRow = {
  id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  stage: string;
  interview_notes: string | null;
  created_at: string;
};

export const PIPELINE_STAGES: Array<{
  key: string;
  label: string;
  variant: "primary" | "info" | "success" | "warning" | "danger";
}> = [
  { key: "called", label: "Called", variant: "info" },
  { key: "shortlisted", label: "Shortlisted", variant: "primary" },
  { key: "interview_scheduled", label: "Interview Sched", variant: "warning" },
  { key: "interview_done", label: "Interview Done", variant: "primary" },
  { key: "test_created", label: "Test Created", variant: "info" },
  { key: "test_assigned", label: "Test Assigned", variant: "warning" },
  { key: "test_submitted", label: "Test Submitted", variant: "info" },
  { key: "selected", label: "Selected", variant: "success" },
  { key: "offer_sent", label: "Offer Sent", variant: "warning" },
  { key: "offer_accepted", label: "Offer Accepted", variant: "success" },
  { key: "appointment_issued", label: "Appointment", variant: "success" },
  { key: "onboarded", label: "Onboarded", variant: "success" },
  { key: "rejected", label: "Rejected", variant: "danger" },
];

type Props = {
  candidates: CandidateRow[];
  currentUserRole?: string;
};

export default function HrPipelineClientView({
  candidates: initialCandidates,
  currentUserRole = "viewer",
}: Props) {
  const [candidates, setCandidates] = useState<CandidateRow[]>(initialCandidates);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRow | null>(null);
  const [candidateDocs, setCandidateDocs] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [candidateNotes, setCandidateNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Deletion protection state (REQ-32)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const isSuperadmin = currentUserRole === "superadmin";

  const handleStageChange = async (candidateId: string, newStage: string) => {
    try {
      const res = await fetch(`/api/admin/hr/pipeline/${candidateId}/stage`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update stage");

      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c))
      );
      if (selectedCandidate && selectedCandidate.id === candidateId) {
        setSelectedCandidate({ ...selectedCandidate, stage: newStage });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenCandidateModal = async (cand: CandidateRow) => {
    setSelectedCandidate(cand);
    setCandidateNotes(cand.interview_notes || "");
    setLoadingDocs(true);
    try {
      const res = await fetch(`/api/admin/hr/pipeline/${cand.id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setCandidateDocs(data.documents || []);
      }
    } catch (err) {
      console.error("Error loading candidate documents:", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedCandidate) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/hr/pipeline/${selectedCandidate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interview_notes: candidateNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save notes");
      setCandidates((prev) =>
        prev.map((c) => (c.id === selectedCandidate.id ? { ...c, interview_notes: candidateNotes } : c))
      );
      setSelectedCandidate({ ...selectedCandidate, interview_notes: candidateNotes });
      alert("Candidate notes updated successfully.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingNotes(false);
    }
  };

  // REQ-32: Superadmin Candidate Deletion Protection
  const handleDeleteCandidate = async () => {
    if (!selectedCandidate) return;
    if (deleteConfirmationText.trim().toUpperCase() !== "DELETE") {
      alert("Please type 'DELETE' to confirm permanent removal.");
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/hr/pipeline/${selectedCandidate.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete candidate");

      setCandidates((prev) => prev.filter((c) => c.id !== selectedCandidate.id));
      setShowDeleteModal(false);
      setSelectedCandidate(null);
      setDeleteConfirmationText("");
      alert("Candidate record permanently deleted with audit trail logged.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const tableColumns: Column<CandidateRow>[] = [
    {
      key: "candidate_name",
      header: "Candidate",
      sortable: true,
      render: (c) => (
        <div>
          <strong style={{ color: "#fff", fontSize: "0.92rem" }}>{c.candidate_name}</strong>
          <div style={{ fontSize: "0.76rem", color: "var(--dgs-text-muted)" }}>{c.candidate_email}</div>
        </div>
      ),
    },
    { key: "candidate_phone", header: "Phone", width: "140px" },
    {
      key: "stage",
      header: "Stage",
      sortable: true,
      width: "180px",
      render: (c) => {
        const stageObj = PIPELINE_STAGES.find((s) => s.key === c.stage) || { label: c.stage, variant: "info" };
        return (
          <select
            value={c.stage}
            onChange={(e) => handleStageChange(c.id, e.target.value)}
            style={{
              background: "var(--dgs-bg-input)",
              border: "1px solid var(--dgs-border)",
              color: "#fff",
              borderRadius: "6px",
              padding: "4px 8px",
              fontSize: "0.8rem",
            }}
          >
            {PIPELINE_STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      key: "interview_notes",
      header: "Notes / Summary",
      render: (c) => (
        <span style={{ fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
          {c.interview_notes ? (c.interview_notes.length > 70 ? `${c.interview_notes.slice(0, 70)}…` : c.interview_notes) : "—"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      sortable: true,
      width: "120px",
      render: (c) => new Date(c.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.45rem", fontWeight: 700, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <Users size={22} style={{ color: "var(--dgs-purple-light)" }} />
            HR Recruitment Pipeline &amp; Documents
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
            13-Stage candidate lifecycle tracking from first call to appointment issuance and onboarding.
          </p>
        </div>

        {/* View Switcher */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            type="button"
            className={`dgs-saas-btn sm ${viewMode === "kanban" ? "primary" : "secondary"}`}
            onClick={() => setViewMode("kanban")}
            style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
          >
            <LayoutGrid size={14} /> Kanban Board
          </button>
          <button
            type="button"
            className={`dgs-saas-btn sm ${viewMode === "table" ? "primary" : "secondary"}`}
            onClick={() => setViewMode("table")}
            style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
          >
            <List size={14} /> Table View
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="dgs-saas-kpi-grid">
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Total Active Candidates</div>
          <div className="dgs-saas-kpi-value">{candidates.length}</div>
          <div className="dgs-saas-kpi-delta positive">Real Pipeline Records</div>
        </div>
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Interviewing</div>
          <div className="dgs-saas-kpi-value">
            {candidates.filter((c) => ["interview_scheduled", "interview_done"].includes(c.stage)).length}
          </div>
          <div className="dgs-saas-kpi-delta neutral">Scheduled or Completed</div>
        </div>
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Technical Testing</div>
          <div className="dgs-saas-kpi-value">
            {candidates.filter((c) => ["test_created", "test_assigned", "test_submitted"].includes(c.stage)).length}
          </div>
          <div className="dgs-saas-kpi-delta positive">Assessment Stage</div>
        </div>
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Offers &amp; Onboarded</div>
          <div className="dgs-saas-kpi-value">
            {candidates.filter((c) => ["selected", "offer_sent", "offer_accepted", "appointment_issued", "onboarded"].includes(c.stage)).length}
          </div>
          <div className="dgs-saas-kpi-delta positive">High Intent Pipeline</div>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === "table" ? (
        <SaaSTable
          columns={tableColumns}
          data={candidates}
          keyExtractor={(c) => c.id}
          searchPlaceholder="Search candidates by name, email, or phone..."
          actions={(c) => (
            <button
              type="button"
              className="dgs-saas-btn secondary sm"
              onClick={() => handleOpenCandidateModal(c)}
            >
              Details
            </button>
          )}
        />
      ) : (
        /* KANBAN BOARD (REQ-30: 13 Stages) */
        <div
          style={{
            display: "grid",
            gridAutoFlow: "column",
            gridAutoColumns: "280px",
            gap: "14px",
            overflowX: "auto",
            paddingBottom: "16px",
          }}
        >
          {PIPELINE_STAGES.map((col) => {
            const inStage = candidates.filter((c) => c.stage === col.key);
            return (
              <div
                key={col.key}
                style={{
                  background: "var(--dgs-bg-card)",
                  border: "1px solid var(--dgs-border)",
                  borderRadius: "var(--dgs-radius-md)",
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: "75vh",
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid var(--dgs-border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <strong style={{ fontSize: "0.85rem", color: "#fff" }}>{col.label}</strong>
                  <span className={`dgs-saas-chip ${col.variant}`} style={{ fontSize: "0.68rem" }}>
                    {inStage.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {inStage.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "24px 0", color: "var(--dgs-text-dim)", fontSize: "0.78rem" }}>
                      No candidates
                    </div>
                  ) : (
                    inStage.map((cand) => (
                      <div
                        key={cand.id}
                        onClick={() => handleOpenCandidateModal(cand)}
                        style={{
                          background: "var(--dgs-bg-input)",
                          border: "1px solid var(--dgs-border)",
                          borderRadius: "var(--dgs-radius-sm)",
                          padding: "12px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                          cursor: "pointer",
                          transition: "border-color 0.15s ease",
                        }}
                      >
                        <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.88rem" }}>
                          {cand.candidate_name}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
                          {cand.candidate_email}
                        </div>
                        {cand.interview_notes && (
                          <div style={{ fontSize: "0.74rem", color: "var(--dgs-text-dim)", marginTop: "6px", lineHeight: "1.3" }}>
                            {cand.interview_notes.slice(0, 80)}…
                          </div>
                        )}
                        <div
                          style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={cand.stage}
                            onChange={(e) => handleStageChange(cand.id, e.target.value)}
                            style={{
                              background: "none",
                              border: "1px solid var(--dgs-border)",
                              borderRadius: "4px",
                              color: "var(--dgs-text-muted)",
                              fontSize: "0.72rem",
                              padding: "2px 4px",
                            }}
                          >
                            {PIPELINE_STAGES.map((s) => (
                              <option key={s.key} value={s.key}>
                                &rarr; {s.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Candidate Details & Documents (REQ-31 & REQ-32) */}
      {selectedCandidate && (
        <div className="dgs-saas-search-overlay" onClick={() => setSelectedCandidate(null)}>
          <div
            className="dgs-saas-search-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "650px", maxWidth: "95vw", maxHeight: "88vh", display: "flex", flexDirection: "column" }}
          >
            {/* Modal Header */}
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--dgs-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, color: "#fff", fontSize: "1.15rem" }}>
                  {selectedCandidate.candidate_name}
                </h3>
                <div style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
                  ID: {selectedCandidate.id}
                </div>
              </div>
              <button type="button" className="dgs-saas-btn secondary sm" onClick={() => setSelectedCandidate(null)}>
                <X size={15} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "22px", display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Contact Info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "var(--dgs-bg-card)", padding: "14px", borderRadius: "8px", border: "1px solid var(--dgs-border)" }}>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-dim)", textTransform: "uppercase" }}>Email Address</div>
                  <div style={{ color: "#fff", fontSize: "0.85rem", marginTop: "2px" }}>{selectedCandidate.candidate_email}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-dim)", textTransform: "uppercase" }}>Phone Number</div>
                  <div style={{ color: "#fff", fontSize: "0.85rem", marginTop: "2px" }}>{selectedCandidate.candidate_phone || "Not provided"}</div>
                </div>
              </div>

              {/* Stage Switcher */}
              <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                Recruitment Stage
                <select
                  value={selectedCandidate.stage}
                  onChange={(e) => handleStageChange(selectedCandidate.id, e.target.value)}
                  style={{
                    background: "var(--dgs-bg-input)",
                    border: "1px solid var(--dgs-border)",
                    borderRadius: "6px",
                    padding: "10px 12px",
                    color: "#fff",
                  }}
                >
                  {PIPELINE_STAGES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label} ({s.key})
                    </option>
                  ))}
                </select>
              </label>

              {/* Interview Notes */}
              <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                Interview Observations &amp; Notes
                <textarea
                  rows={5}
                  value={candidateNotes}
                  onChange={(e) => setCandidateNotes(e.target.value)}
                  placeholder="Enter notes on candidate background, expectations, feedback..."
                  style={{
                    background: "var(--dgs-bg-input)",
                    border: "1px solid var(--dgs-border)",
                    borderRadius: "6px",
                    padding: "10px",
                    color: "#fff",
                    fontSize: "0.85rem",
                    resize: "vertical",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                  <button
                    type="button"
                    className="dgs-saas-btn primary sm"
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                  >
                    {savingNotes ? "Saving…" : "Save Notes"}
                  </button>
                </div>
              </label>

              {/* Document Tracking (REQ-31) */}
              <div style={{ borderTop: "1px solid var(--dgs-border)", paddingTop: "14px" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FileText size={15} /> Private HR Documents
                </div>
                {candidateDocs.length === 0 ? (
                  <div style={{ fontSize: "0.8rem", color: "var(--dgs-text-dim)", background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "6px" }}>
                    No private HR documents attached yet. Documents are securely saved in private storage.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "6px" }}>
                    {candidateDocs.map((doc) => (
                      <div
                        key={doc.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          background: "var(--dgs-bg-card)",
                          border: "1px solid var(--dgs-border)",
                          borderRadius: "6px",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "0.82rem", color: "#fff", fontWeight: 500 }}>{doc.filename}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-dim)" }}>
                            Type: {doc.document_type} · Size: {Math.round(doc.file_size / 1024)} KB
                          </div>
                        </div>
                        <a
                          href={`/api/admin/files/private/${doc.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="dgs-saas-btn secondary sm"
                          style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                        >
                          <ExternalLink size={12} style={{ marginRight: 4 }} /> View
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Deletion Section (REQ-32: Superadmin Only) */}
              {isSuperadmin && (
                <div style={{ borderTop: "1px solid var(--dgs-border)", paddingTop: "14px", marginTop: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--dgs-danger)" }}>
                        Permanent Candidate Deletion
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "var(--dgs-text-dim)" }}>
                        Superadmin-only action. Removes candidate, attempts, and documents with permanent audit logging.
                      </div>
                    </div>
                    <button
                      type="button"
                      className="dgs-saas-btn danger sm"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <Trash2 size={13} style={{ marginRight: 4 }} /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: Candidate Deletion (REQ-32) */}
      {showDeleteModal && selectedCandidate && (
        <div className="dgs-saas-search-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="dgs-saas-search-modal" onClick={(e) => e.stopPropagation()} style={{ width: "480px" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--dgs-border)" }}>
              <h3 style={{ margin: 0, color: "var(--dgs-danger)", display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={18} /> Confirm Candidate Deletion
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--dgs-text-muted)" }}>
                You are about to permanently delete <strong>{selectedCandidate.candidate_name}</strong>.
              </p>
            </div>
            <div style={{ padding: "24px", display: "grid", gap: "14px" }}>
              <div style={{ fontSize: "0.82rem", color: "var(--dgs-text-dim)", lineHeight: "1.4" }}>
                This action is irreversible. All assessment attempts, answers, and HR documents will be permanently purged.
                An immutable audit trail entry will be recorded.
              </div>
              <label style={{ display: "grid", gap: "6px", fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
                Type <strong>DELETE</strong> to confirm:
                <input
                  type="text"
                  placeholder="DELETE"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  style={{
                    background: "var(--dgs-bg-input)",
                    border: "1px solid var(--dgs-border)",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    color: "#fff",
                  }}
                />
              </label>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "6px" }}>
                <button
                  type="button"
                  className="dgs-saas-btn secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmationText("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="dgs-saas-btn danger"
                  disabled={deleting || deleteConfirmationText.trim().toUpperCase() !== "DELETE"}
                  onClick={handleDeleteCandidate}
                >
                  {deleting ? "Deleting…" : "Permanently Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
