"use client";

import React, { useState } from "react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";

type JD = {
  id: string;
  role_title: string;
  role_level: string;
  department: string;
  created_at: string;
};

type Version = {
  id: string;
  jd_id: string;
  role_title?: string;
  version_number: number;
  difficulty: string;
  status: string;
  created_at: string;
  approved_at: string | null;
};

type Candidate = {
  id: string;
  name: string;
  email: string;
  experience?: string;
  objective_score: number;
  objective_total: number;
  role_match_score?: number;
  review_status: string;
  submitted_at: string;
};

type Props = {
  jds: JD[];
  versions: Version[];
  candidates: Candidate[];
};

export default function AssessmentClientView({ jds, versions, candidates }: Props) {
  const [activeTab, setActiveTab] = useState<"jds" | "versions" | "candidates">("jds");
  const [selectedJd, setSelectedJd] = useState<JD | null>(null);
  const [generating, setGenerating] = useState(false);
  const [difficulty, setDifficulty] = useState<"junior" | "mid" | "senior" | "lead">("mid");
  const [mcqCount, setMcqCount] = useState(5);
  const [focusAreas, setFocusAreas] = useState("");

  const handleGenerateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJd) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/assessment/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jd_id: selectedJd.id,
          difficulty,
          mcq_count: mcqCount,
          focus_areas: focusAreas,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      alert(`Successfully generated assessment version #${data.versionNumber} for ${selectedJd.role_title}!`);
      setSelectedJd(null);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleApproveVersion = async (versionId: string) => {
    try {
      const res = await fetch(`/api/admin/assessment/versions/${versionId}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Approval failed");
      alert("Assessment version approved and locked as immutable.");
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const jdColumns: Column<JD>[] = [
    { key: "role_title", header: "Role Title", sortable: true },
    {
      key: "role_level",
      header: "Level",
      sortable: true,
      width: "120px",
      render: (j) => <span className="dgs-saas-chip info">{(j.role_level || "mid").toUpperCase()}</span>,
    },
    { key: "department", header: "Department", sortable: true, width: "160px" },
    {
      key: "created_at",
      header: "Created",
      sortable: true,
      width: "140px",
      render: (j) => new Date(j.created_at).toLocaleDateString(),
    },
  ];

  const versionColumns: Column<Version>[] = [
    {
      key: "version_number",
      header: "Version",
      sortable: true,
      width: "100px",
      render: (v) => <strong>v{v.version_number}</strong>,
    },
    { key: "role_title", header: "Associated Role", sortable: true },
    {
      key: "difficulty",
      header: "Difficulty",
      sortable: true,
      width: "120px",
      render: (v) => <span className="dgs-saas-chip primary">{v.difficulty.toUpperCase()}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      width: "130px",
      render: (v) => (
        <span className={`dgs-saas-chip ${v.status === "approved" ? "success" : "warning"}`}>
          {v.status.toUpperCase()}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      sortable: true,
      width: "140px",
      render: (v) => new Date(v.created_at).toLocaleDateString(),
    },
  ];

  const candidateColumns: Column<Candidate>[] = [
    { key: "name", header: "Candidate Name", sortable: true },
    { key: "email", header: "Email Address", sortable: true },
    {
      key: "objective_score",
      header: "MCQ Score",
      sortable: true,
      width: "130px",
      render: (c) => (
        <strong style={{ color: "var(--dgs-success)" }}>
          {c.objective_score} / {c.objective_total}
        </strong>
      ),
    },
    {
      key: "review_status",
      header: "HR Status",
      sortable: true,
      width: "140px",
      render: (c) => (
        <span className="dgs-saas-chip info">
          {c.review_status ? c.review_status.toUpperCase() : "PENDING"}
        </span>
      ),
    },
    {
      key: "submitted_at",
      header: "Submitted",
      sortable: true,
      width: "140px",
      render: (c) => new Date(c.submitted_at).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            Assessment &amp; Evaluation Operations
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
            Full native port from dgenius-assessment-1.3.3: JD management, Gemini AI test generation, psychometric &amp; MCQ scoring.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <span className="dgs-saas-chip success">Gemini 2.5 Flash Connected</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dgs-saas-kpi-grid">
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Job Descriptions</div>
          <div className="dgs-saas-kpi-value">{jds.length}</div>
          <div className="dgs-saas-kpi-delta positive">Active Evaluation JDs</div>
        </div>
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Test Versions</div>
          <div className="dgs-saas-kpi-value">{versions.length}</div>
          <div className="dgs-saas-kpi-delta neutral">Drafts &amp; Approved</div>
        </div>
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Candidate Attempts</div>
          <div className="dgs-saas-kpi-value">{candidates.length}</div>
          <div className="dgs-saas-kpi-delta positive">Scored &amp; Reviewed</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", borderBottom: "1px solid var(--dgs-border)", paddingBottom: "10px" }}>
        <button
          type="button"
          className={`dgs-saas-btn sm ${activeTab === "jds" ? "primary" : "secondary"}`}
          onClick={() => setActiveTab("jds")}
        >
          Job Descriptions ({jds.length})
        </button>
        <button
          type="button"
          className={`dgs-saas-btn sm ${activeTab === "versions" ? "primary" : "secondary"}`}
          onClick={() => setActiveTab("versions")}
        >
          Test Versions ({versions.length})
        </button>
        <button
          type="button"
          className={`dgs-saas-btn sm ${activeTab === "candidates" ? "primary" : "secondary"}`}
          onClick={() => setActiveTab("candidates")}
        >
          Candidate Results ({candidates.length})
        </button>
      </div>

      {/* JDs View */}
      {activeTab === "jds" && (
        <SaaSTable
          columns={jdColumns}
          data={jds}
          keyExtractor={(j) => j.id}
          searchPlaceholder="Search Job Descriptions..."
          actions={(j) => (
            <button
              type="button"
              className="dgs-saas-btn primary sm"
              onClick={() => setSelectedJd(j)}
            >
              Generate Test
            </button>
          )}
        />
      )}

      {/* Versions View */}
      {activeTab === "versions" && (
        <SaaSTable
          columns={versionColumns}
          data={versions}
          keyExtractor={(v) => v.id}
          searchPlaceholder="Search versions..."
          actions={(v) => (
            v.status === "draft" ? (
              <button
                type="button"
                className="dgs-saas-btn primary sm"
                onClick={() => handleApproveVersion(v.id)}
              >
                Approve Version
              </button>
            ) : (
              <span className="dgs-saas-chip success" style={{ fontSize: "0.72rem" }}>LOCKED (IMMUTABLE)</span>
            )
          )}
        />
      )}

      {/* Candidates View */}
      {activeTab === "candidates" && (
        <SaaSTable
          columns={candidateColumns}
          data={candidates}
          keyExtractor={(c) => c.id}
          searchPlaceholder="Search candidate submissions..."
        />
      )}

      {/* Generate Test Modal */}
      {selectedJd && (
        <div className="dgs-saas-search-overlay" onClick={() => setSelectedJd(null)}>
          <div className="dgs-saas-search-modal" onClick={(e) => e.stopPropagation()} style={{ width: "500px" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--dgs-border)" }}>
              <h3 style={{ margin: 0, color: "#fff" }}>Generate Assessment with Gemini 2.5 Flash</h3>
              <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--dgs-text-muted)" }}>
                Role: <strong>{selectedJd.role_title}</strong>
              </p>
            </div>
            <form onSubmit={handleGenerateTest} style={{ padding: "24px", display: "grid", gap: "16px" }}>
              <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                Difficulty Level
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  style={{
                    background: "var(--dgs-bg-input)",
                    border: "1px solid var(--dgs-border)",
                    borderRadius: "6px",
                    padding: "10px 12px",
                    color: "#fff",
                  }}
                >
                  <option value="junior">Junior (Foundational concepts &amp; process)</option>
                  <option value="mid">Mid-Level (Practical problem-solving &amp; agency workflows)</option>
                  <option value="senior">Senior (Architecture, strategy, advanced debugging)</option>
                  <option value="lead">Lead (Team leadership, system vision, client strategy)</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                MCQ Question Count
                <input
                  type="number"
                  min={3}
                  max={20}
                  value={mcqCount}
                  onChange={(e) => setMcqCount(Number(e.target.value))}
                  style={{
                    background: "var(--dgs-bg-input)",
                    border: "1px solid var(--dgs-border)",
                    borderRadius: "6px",
                    padding: "10px 12px",
                    color: "#fff",
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                Focus Areas / Custom Instructions
                <textarea
                  rows={3}
                  placeholder="e.g. Core Web Vitals, programmatic SEO, schema markup, high-intent client communication"
                  value={focusAreas}
                  onChange={(e) => setFocusAreas(e.target.value)}
                  style={{
                    background: "var(--dgs-bg-input)",
                    border: "1px solid var(--dgs-border)",
                    borderRadius: "6px",
                    padding: "10px 12px",
                    color: "#fff",
                    resize: "vertical",
                  }}
                />
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  className="dgs-saas-btn secondary"
                  onClick={() => setSelectedJd(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="dgs-saas-btn primary"
                  disabled={generating}
                >
                  {generating ? "Generating with Gemini..." : "Generate Test Draft"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
