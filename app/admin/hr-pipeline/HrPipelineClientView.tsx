"use client";

import React, { useState } from "react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";

type CandidateRow = {
  id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  stage: string;
  interview_notes: string | null;
  created_at: string;
};

const STAGES: Array<{ key: string; label: string; variant: "primary" | "info" | "success" | "warning" | "danger" }> = [
  { key: "called", label: "Called", variant: "info" },
  { key: "shortlisted", label: "Shortlisted", variant: "primary" },
  { key: "interview_scheduled", label: "Interview Sched", variant: "warning" },
  { key: "interview_done", label: "Interview Done", variant: "primary" },
  { key: "test_created", label: "Test Created", variant: "info" },
  { key: "selected", label: "Selected", variant: "success" },
  { key: "offer_sent", label: "Offer Sent", variant: "warning" },
  { key: "offer_accepted", label: "Offer Accepted", variant: "success" },
  { key: "appointment_issued", label: "Appointment", variant: "success" },
  { key: "onboarded", label: "Onboarded", variant: "success" },
  { key: "rejected", label: "Rejected", variant: "danger" },
];

type Props = {
  candidates: CandidateRow[];
};

export default function HrPipelineClientView({ candidates: initialCandidates }: Props) {
  const [candidates, setCandidates] = useState<CandidateRow[]>(initialCandidates);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRow | null>(null);

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
    } catch (err: any) {
      alert(err.message);
    }
  };

  const tableColumns: Column<CandidateRow>[] = [
    {
      key: "candidate_name",
      header: "Candidate",
      sortable: true,
      render: (c) => (
        <div>
          <div style={{ fontWeight: 600, color: "#fff" }}>{c.candidate_name}</div>
          <div style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)" }}>{c.candidate_email}</div>
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
        const stageObj = STAGES.find((s) => s.key === c.stage) || { label: c.stage, variant: "info" };
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
            {STAGES.map((s) => (
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
          {c.interview_notes || "—"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      sortable: true,
      width: "130px",
      render: (c) => new Date(c.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            HR Recruitment Pipeline &amp; Documents
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
            Candidate recruitment tracking across 11 stages from phone interview to appointment issuance.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className={`dgs-saas-btn sm ${viewMode === "kanban" ? "primary" : "secondary"}`}
            onClick={() => setViewMode("kanban")}
          >
            Kanban Board
          </button>
          <button
            type="button"
            className={`dgs-saas-btn sm ${viewMode === "table" ? "primary" : "secondary"}`}
            onClick={() => setViewMode("table")}
          >
            Table View
          </button>
        </div>
      </div>

      {viewMode === "table" ? (
        <SaaSTable
          columns={tableColumns}
          data={candidates}
          keyExtractor={(c) => c.id}
          searchPlaceholder="Search candidates by name, email, or phone..."
        />
      ) : (
        /* Kanban Board */
        <div
          style={{
            display: "grid",
            gridAutoFlow: "column",
            gridAutoColumns: "280px",
            gap: "16px",
            overflowX: "auto",
            paddingBottom: "16px",
          }}
        >
          {STAGES.map((col) => {
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
                <div
                  style={{
                    padding: "14px 16px",
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

                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {inStage.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px 0", color: "var(--dgs-text-dim)", fontSize: "0.8rem" }}>
                      Empty
                    </div>
                  ) : (
                    inStage.map((cand) => (
                      <div
                        key={cand.id}
                        style={{
                          background: "var(--dgs-bg-input)",
                          border: "1px solid var(--dgs-border)",
                          borderRadius: "var(--dgs-radius-sm)",
                          padding: "12px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        }}
                      >
                        <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.9rem" }}>
                          {cand.candidate_name}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
                          {cand.candidate_email}
                        </div>
                        {cand.interview_notes && (
                          <div style={{ fontSize: "0.75rem", color: "var(--dgs-text-dim)", marginTop: "6px", lineHeight: "1.3" }}>
                            {cand.interview_notes.slice(0, 90)}...
                          </div>
                        )}
                        <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                            {STAGES.map((s) => (
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
    </div>
  );
}
