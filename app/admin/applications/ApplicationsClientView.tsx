"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import PageHeader from "@/components/admin/PageHeader";
import type { ApplicationRow } from "./page";
import {
  Users,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  ExternalLink,
  Phone,
  Mail,
  Calendar,
  Filter,
  ArrowLeft,
  Eye,
  X,
  Briefcase,
  Award,
  AlertCircle,
  FileX,
  Check,
} from "lucide-react";

export const PIPELINE_STAGES: Array<{
  key: string;
  label: string;
  variant: "primary" | "info" | "success" | "warning" | "danger";
}> = [
  { key: "called", label: "Called", variant: "info" },
  { key: "shortlisted", label: "Shortlisted", variant: "primary" },
  { key: "interview_scheduled", label: "Interview Scheduled", variant: "warning" },
  { key: "interview_done", label: "Interview Done", variant: "primary" },
  { key: "test_created", label: "Test Created", variant: "info" },
  { key: "test_assigned", label: "Test Assigned", variant: "warning" },
  { key: "test_submitted", label: "Test Submitted", variant: "info" },
  { key: "selected", label: "Selected", variant: "success" },
  { key: "offer_sent", label: "Offer Sent", variant: "warning" },
  { key: "offer_accepted", label: "Offer Accepted", variant: "success" },
  { key: "appointment_issued", label: "Appointment Issued", variant: "success" },
  { key: "onboarded", label: "Onboarded", variant: "success" },
  { key: "rejected", label: "Rejected", variant: "danger" },
];

function formatDateUTC(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toISOString().split("T")[0];
  } catch {
    return String(dateStr);
  }
}

function formatDateTimeUTC(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC");
  } catch {
    return String(dateStr);
  }
}

type Props = {
  initialApplications: ApplicationRow[];
  currentUserRole?: string;
};

export default function ApplicationsClientView({
  initialApplications,
  currentUserRole = "viewer",
}: Props) {
  const [applications, setApplications] = useState<ApplicationRow[]>(initialApplications);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<ApplicationRow | null>(null);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Distinct job titles for filter dropdown
  const uniqueJobs = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((a) => {
      if (a.role_title) set.add(a.role_title);
    });
    return Array.from(set).sort();
  }, [applications]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        !searchTerm.trim() ||
        app.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.candidate_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.candidate_phone && app.candidate_phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.role_title && app.role_title.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStage = selectedStage === "all" || app.stage === selectedStage;
      const matchesJob = selectedJob === "all" || app.role_title === selectedJob;

      return matchesSearch && matchesStage && matchesJob;
    });
  }, [applications, searchTerm, selectedStage, selectedJob]);

  // Handle stage change
  const handleStageChange = async (appId: string, newStage: string) => {
    try {
      const res = await fetch(`/api/admin/hr/pipeline/${appId}/stage`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update stage");

      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, stage: newStage } : a))
      );
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp({ ...selectedApp, stage: newStage });
      }
      showToast(`Status updated to ${newStage.toUpperCase().replace(/_/g, " ")}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle save interview notes
  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/hr/pipeline/${selectedApp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interview_notes: notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save notes");

      setApplications((prev) =>
        prev.map((a) => (a.id === selectedApp.id ? { ...a, interview_notes: notes } : a))
      );
      setSelectedApp({ ...selectedApp, interview_notes: notes });
      showToast("Application notes saved successfully.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingNotes(false);
    }
  };

  // Open detail modal
  const handleOpenDetails = (app: ApplicationRow) => {
    setSelectedApp(app);
    setNotes(app.interview_notes || "");
  };

  // Table Columns
  const columns: Column<ApplicationRow>[] = [
    {
      key: "candidate_name",
      header: "Applicant",
      sortable: true,
      render: (a) => (
        <div>
          <strong style={{ color: "var(--dgs-text-primary)", fontSize: "0.92rem" }}>
            {a.candidate_name}
          </strong>
          <div style={{ fontSize: "0.76rem", color: "var(--dgs-text-muted)" }}>
            {a.candidate_email}
          </div>
        </div>
      ),
    },
    {
      key: "candidate_phone",
      header: "Phone",
      width: "140px",
      render: (a) => (
        <span style={{ fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
          {a.candidate_phone || "—"}
        </span>
      ),
    },
    {
      key: "role_title",
      header: "Applied Position",
      sortable: true,
      render: (a) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Briefcase size={13} style={{ color: "var(--dgs-purple-light)", flexShrink: 0 }} />
          <span style={{ color: "var(--dgs-text-primary)", fontWeight: 500, fontSize: "0.86rem" }}>
            {a.role_title || "General Candidate"}
          </span>
        </div>
      ),
    },
    {
      key: "stage",
      header: "Stage / Status",
      sortable: true,
      width: "180px",
      render: (a) => {
        const stageObj = PIPELINE_STAGES.find((s) => s.key === a.stage) || {
          label: a.stage,
          variant: "info",
        };
        return (
          <select
            value={a.stage}
            onChange={(e) => handleStageChange(a.id, e.target.value)}
            style={{
              background: "var(--dgs-bg-input)",
              border: "1px solid var(--dgs-border)",
              color: "var(--dgs-text-primary)",
              borderRadius: "6px",
              padding: "4px 8px",
              fontSize: "0.8rem",
              width: "100%",
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
      key: "objective_score",
      header: "Assessment",
      width: "120px",
      render: (a) => {
        if (a.objective_score != null && a.objective_total != null) {
          return (
            <span className="dgs-saas-chip success" style={{ fontSize: "0.72rem" }}>
              {a.objective_score}/{a.objective_total}
              {a.role_match_score ? ` (${a.role_match_score}%)` : ""}
            </span>
          );
        }
        return <span style={{ fontSize: "0.75rem", color: "var(--dgs-text-dim)" }}>None</span>;
      },
    },
    {
      key: "resume_id",
      header: "Resume / CV",
      width: "130px",
      render: (a) => {
        if (a.resume_id) {
          return (
            <a
              href={`/api/admin/files/private/${a.resume_id}`}
              target="_blank"
              rel="noreferrer"
              className="dgs-saas-btn secondary sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", padding: "3px 8px" }}
            >
              <FileText size={12} /> View CV
            </a>
          );
        }
        return (
          <span style={{ fontSize: "0.75rem", color: "var(--dgs-text-dim)", display: "inline-flex", alignItems: "center", gap: "3px" }}>
            <FileX size={12} /> No CV
          </span>
        );
      },
    },
    {
      key: "created_at",
      header: "Applied Date",
      sortable: true,
      width: "120px",
      render: (a) => <span suppressHydrationWarning>{formatDateUTC(a.created_at)}</span>,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "var(--dgs-bg-card)",
            border: "1px solid var(--dgs-success)",
            color: "var(--dgs-success)",
            padding: "12px 18px",
            borderRadius: "8px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.85rem",
          }}
        >
          <Check size={16} />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Candidate Applications"
        subtitle="Manage and review applicant submissions, job associations, CVs, and assessment scores."
        actions={
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Link
              href="/admin/"
              className="dgs-saas-btn secondary sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <Link
              href="/admin/hr-pipeline/"
              className="dgs-saas-btn secondary sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
            >
              HR Pipeline Board
            </Link>
          </div>
        }
      />

      {/* KPI Overview Strip */}
      <div className="dgs-saas-kpi-grid">
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Total Applications</div>
          <div className="dgs-saas-kpi-value">{applications.length}</div>
          <div className="dgs-saas-kpi-delta positive">All Recorded Submissions</div>
        </div>
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">In Review</div>
          <div className="dgs-saas-kpi-value">
            {applications.filter((a) => ["called", "shortlisted", "interview_scheduled"].includes(a.stage)).length}
          </div>
          <div className="dgs-saas-kpi-delta neutral">Under Evaluation</div>
        </div>
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Assessment Stage</div>
          <div className="dgs-saas-kpi-value">
            {applications.filter((a) => ["test_created", "test_assigned", "test_submitted"].includes(a.stage)).length}
          </div>
          <div className="dgs-saas-kpi-delta positive">Technical Testing</div>
        </div>
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Offers / Selected</div>
          <div className="dgs-saas-kpi-value">
            {applications.filter((a) => ["selected", "offer_sent", "offer_accepted", "appointment_issued", "onboarded"].includes(a.stage)).length}
          </div>
          <div className="dgs-saas-kpi-delta positive">Hiring Conversion</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
          background: "var(--dgs-bg-card)",
          padding: "14px 18px",
          borderRadius: "var(--dgs-radius-md)",
          border: "1px solid var(--dgs-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "220px" }}>
          <Search size={16} style={{ color: "var(--dgs-text-muted)" }} />
          <input
            type="text"
            placeholder="Search candidate by name, email, phone, or job..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--dgs-text-primary)",
              width: "100%",
              outline: "none",
              fontSize: "0.85rem",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Filter size={14} style={{ color: "var(--dgs-text-muted)" }} />
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            style={{
              background: "var(--dgs-bg-input)",
              border: "1px solid var(--dgs-border)",
              color: "var(--dgs-text-primary)",
              borderRadius: "6px",
              padding: "6px 10px",
              fontSize: "0.8rem",
            }}
          >
            <option value="all">All Recruitment Stages ({applications.length})</option>
            {PIPELINE_STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label} ({applications.filter((a) => a.stage === s.key).length})
              </option>
            ))}
          </select>

          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            style={{
              background: "var(--dgs-bg-input)",
              border: "1px solid var(--dgs-border)",
              color: "var(--dgs-text-primary)",
              borderRadius: "6px",
              padding: "6px 10px",
              fontSize: "0.8rem",
            }}
          >
            <option value="all">All Positions</option>
            {uniqueJobs.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main SaaS Table */}
      {filteredApplications.length === 0 ? (
        <div
          style={{
            background: "var(--dgs-bg-card)",
            border: "1px solid var(--dgs-border)",
            borderRadius: "var(--dgs-radius-md)",
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <Users size={32} style={{ color: "var(--dgs-text-dim)", margin: "0 auto 12px" }} />
          <h3 style={{ margin: "0 0 6px", color: "var(--dgs-text-primary)", fontSize: "1rem" }}>
            No candidate applications found
          </h3>
          <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
            {searchTerm || selectedStage !== "all" || selectedJob !== "all"
              ? "Try adjusting your search criteria or resetting filters."
              : "Candidate applications submitted via public careers or assessments will appear here."}
          </p>
        </div>
      ) : (
        <SaaSTable
          columns={columns}
          data={filteredApplications}
          keyExtractor={(a) => a.id}
          actions={(a) => (
            <button
              type="button"
              className="dgs-saas-btn primary sm"
              onClick={() => handleOpenDetails(a)}
              style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              <Eye size={12} /> Details
            </button>
          )}
        />
      )}

      {/* Modal: Application Details Drawer */}
      {selectedApp && (
        <div className="dgs-saas-search-overlay" onClick={() => setSelectedApp(null)}>
          <div
            className="dgs-saas-search-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "680px", maxWidth: "95vw", maxHeight: "88vh", display: "flex", flexDirection: "column" }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "18px 22px",
                borderBottom: "1px solid var(--dgs-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ margin: 0, color: "var(--dgs-text-primary)", fontSize: "1.15rem" }}>
                  {selectedApp.candidate_name}
                </h3>
                <div style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
                  Applied Position: <strong>{selectedApp.role_title || "General Candidate"}</strong>
                </div>
              </div>
              <button
                type="button"
                className="dgs-saas-btn secondary sm"
                onClick={() => setSelectedApp(null)}
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "22px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              {/* Contact Information Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  background: "var(--dgs-bg-card)",
                  padding: "14px",
                  borderRadius: "8px",
                  border: "1px solid var(--dgs-border)",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-dim)", textTransform: "uppercase" }}>
                    Email
                  </div>
                  <div style={{ color: "var(--dgs-text-primary)", fontSize: "0.85rem", marginTop: "2px" }}>
                    {selectedApp.candidate_email}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-dim)", textTransform: "uppercase" }}>
                    Phone
                  </div>
                  <div style={{ color: "var(--dgs-text-primary)", fontSize: "0.85rem", marginTop: "2px" }}>
                    {selectedApp.candidate_phone || "Not provided"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-dim)", textTransform: "uppercase" }}>
                    Applied On
                  </div>
                  <div style={{ color: "var(--dgs-text-primary)", fontSize: "0.85rem", marginTop: "2px" }} suppressHydrationWarning>
                    {formatDateTimeUTC(selectedApp.created_at)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-dim)", textTransform: "uppercase" }}>
                    Application ID
                  </div>
                  <div style={{ color: "var(--dgs-text-primary)", fontSize: "0.75rem", fontFamily: "monospace", marginTop: "2px" }}>
                    {selectedApp.id}
                  </div>
                </div>
              </div>

              {/* Recruitment Stage Selector */}
              <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                Update Application Status
                <select
                  value={selectedApp.stage}
                  onChange={(e) => handleStageChange(selectedApp.id, e.target.value)}
                  style={{
                    background: "var(--dgs-bg-input)",
                    border: "1px solid var(--dgs-border)",
                    borderRadius: "6px",
                    padding: "10px 12px",
                    color: "var(--dgs-text-primary)",
                    fontSize: "0.85rem",
                  }}
                >
                  {PIPELINE_STAGES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label} ({s.key})
                    </option>
                  ))}
                </select>
              </label>

              {/* Assessment Association */}
              <div
                style={{
                  background: "var(--dgs-bg-card)",
                  padding: "14px",
                  borderRadius: "8px",
                  border: "1px solid var(--dgs-border)",
                }}
              >
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--dgs-text-primary)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Award size={15} style={{ color: "var(--dgs-purple-light)" }} /> Technical Assessment Status
                </div>
                {selectedApp.objective_score != null ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.82rem" }}>
                    <div>
                      <span style={{ color: "var(--dgs-text-muted)" }}>MCQ Score:</span>{" "}
                      <strong style={{ color: "var(--dgs-success)" }}>
                        {selectedApp.objective_score} / {selectedApp.objective_total}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--dgs-text-muted)" }}>AI Match Fit:</span>{" "}
                      <strong style={{ color: "var(--dgs-purple-light)" }}>
                        {selectedApp.role_match_score ? `${selectedApp.role_match_score}%` : "Evaluated"}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: "0.8rem", color: "var(--dgs-text-dim)" }}>
                    No technical assessment attempted yet.
                  </div>
                )}
              </div>

              {/* Resume Document */}
              <div
                style={{
                  background: "var(--dgs-bg-card)",
                  padding: "14px",
                  borderRadius: "8px",
                  border: "1px solid var(--dgs-border)",
                }}
              >
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--dgs-text-primary)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FileText size={15} /> Candidate Resume / CV
                </div>
                {selectedApp.resume_id ? (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.82rem", color: "var(--dgs-text-primary)" }}>
                      {selectedApp.resume_filename || "Candidate_Resume.pdf"}
                    </span>
                    <a
                      href={`/api/admin/files/private/${selectedApp.resume_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="dgs-saas-btn primary sm"
                      style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      <ExternalLink size={12} /> View / Download CV
                    </a>
                  </div>
                ) : (
                  <div style={{ fontSize: "0.8rem", color: "var(--dgs-text-dim)" }}>
                    No resume document uploaded for this applicant.
                  </div>
                )}
              </div>

              {/* Interview / Application Notes */}
              <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                HR Notes &amp; Candidate Observations
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record interview notes, compensation requirements, strengths, or red flags..."
                  style={{
                    background: "var(--dgs-bg-input)",
                    border: "1px solid var(--dgs-border)",
                    borderRadius: "6px",
                    padding: "10px",
                    color: "var(--dgs-text-primary)",
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
