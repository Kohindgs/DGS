"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Target,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Calendar,
  XCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Send,
  Sparkles,
  Filter,
  RefreshCw,
  Plus,
  FileCheck,
  CheckCircle,
  Link2,
} from "lucide-react";
import type { ActionCenterKpis, TodayTaskItem, ResultBacklinkItem } from "@/lib/off-page/action-center";
import {
  MANDATORY_NEXT_ACTIONS,
  type MandatoryNextAction,
  type OpportunityStatus,
  type PriorityTier,
} from "@/lib/off-page/types";

interface Props {
  initialKpis?: ActionCenterKpis;
  initialTodayTasks?: TodayTaskItem[];
  initialNeedsReviewItems?: TodayTaskItem[];
  initialResultsAndLostLinks?: ResultBacklinkItem[];
}

export default function ActionCenterClientView({
  initialKpis,
  initialTodayTasks,
  initialNeedsReviewItems,
  initialResultsAndLostLinks,
}: Props) {
  const [kpis, setKpis] = useState<ActionCenterKpis | undefined>(initialKpis);
  const [todayTasks, setTodayTasks] = useState<TodayTaskItem[]>(initialTodayTasks || []);
  const [needsReviewItems, setNeedsReviewItems] = useState<TodayTaskItem[]>(initialNeedsReviewItems || []);
  const [resultsAndLostLinks, setResultsAndLostLinks] = useState<ResultBacklinkItem[]>(initialResultsAndLostLinks || []);
  const [loading, setLoading] = useState(!initialKpis);
  const [selectedOwner, setSelectedOwner] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"REVIEW" | "TEAM" | "RESULTS" | "PIPELINE">("REVIEW");
  const [selectedStage, setSelectedStage] = useState<string>("ALL");
  const [pipelineOpps, setPipelineOpps] = useState<any[]>([]);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Decision Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"APPROVE" | "ASSIGN" | "REJECT" | "SNOOZE" | "COMPLETE">("ASSIGN");
  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [formOwner, setFormOwner] = useState("");
  const [formNextAction, setFormNextAction] = useState<string>(MANDATORY_NEXT_ACTIONS[0]);
  const [formDueDate, setFormDueDate] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formReason, setFormReason] = useState("");
  const [formProofUrl, setFormProofUrl] = useState("");
  const [submittingDecision, setSubmittingDecision] = useState(false);

  const fetchActionCenterData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedOwner !== "ALL") params.set("owner", selectedOwner);
      const res = await fetch(`/api/admin/off-page/action-center?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setKpis(json.kpis);
        setTodayTasks(json.todayTasks || []);
        setNeedsReviewItems(json.needsReviewItems || []);
        setResultsAndLostLinks(json.resultsAndLostLinks || []);
      }
    } catch (err) {
      console.error("Failed to load action center data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPipelineOpportunities = async (stage: string) => {
    setPipelineLoading(true);
    try {
      const params = new URLSearchParams();
      if (stage !== "ALL") params.set("status", stage);
      params.set("limit", "50");
      const res = await fetch(`/api/admin/off-page/opportunities?${params.toString()}`);
      const json = await res.json();
      if (json.opportunities) {
        setPipelineOpps(json.opportunities);
      }
    } catch (err) {
      console.error("Failed to load pipeline opportunities:", err);
    } finally {
      setPipelineLoading(false);
    }
  };

  useEffect(() => {
    fetchActionCenterData();
  }, [selectedOwner]);

  useEffect(() => {
    if (activeTab === "PIPELINE") {
      fetchPipelineOpportunities(selectedStage);
    }
  }, [activeTab, selectedStage]);

  const openDecisionModal = (
    item: any,
    mode: "APPROVE" | "ASSIGN" | "REJECT" | "SNOOZE" | "COMPLETE"
  ) => {
    setActiveItem(item);
    setModalMode(mode);
    setFormOwner(item.owner || "");
    const matchingAction = MANDATORY_NEXT_ACTIONS.find(
      (a) => a === item.next_action
    );
    setFormNextAction(matchingAction || (mode === "ASSIGN" ? "PITCH ARTICLE" : MANDATORY_NEXT_ACTIONS[0]));
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormDueDate(item.due_date || tomorrow.toISOString().slice(0, 10));
    setFormNote("");
    setFormReason("");
    setFormProofUrl(item.proof_url || "");
    setModalOpen(true);
  };

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;
    setSubmittingDecision(true);
    setFeedback(null);

    try {
      let body: any = { id: activeItem.id };

      if (modalMode === "APPROVE") {
        body.action = "approve";
        body.owner = formOwner || undefined;
        body.nextAction = formNextAction || undefined;
        body.dueDate = formDueDate || undefined;
        body.note = formNote || undefined;
      } else if (modalMode === "ASSIGN") {
        body.action = "assign";
        body.owner = formOwner;
        body.nextAction = formNextAction;
        body.dueDate = formDueDate;
        body.note = formNote || undefined;
      } else if (modalMode === "REJECT") {
        body.action = "reject";
        body.reason = formReason || "Does not meet authority or topical guidelines";
      } else if (modalMode === "SNOOZE") {
        body.action = "snooze";
        body.snoozeUntil = formDueDate;
        body.reason = formReason || undefined;
      } else if (modalMode === "COMPLETE") {
        body.action = "complete";
        body.proofUrl = formProofUrl;
        body.submissionDate = new Date().toISOString().slice(0, 10);
        body.note = formNote || undefined;
      }

      const res = await fetch("/api/admin/off-page/action-center", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback(`Decision recorded: ${modalMode} completed successfully for ${activeItem.domain || activeItem.site_name}.`);
        setModalOpen(false);
        await fetchActionCenterData();
        if (activeTab === "PIPELINE") {
          await fetchPipelineOpportunities(selectedStage);
        }
      } else {
        setFeedback(`Action failed: ${json.error}`);
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setSubmittingDecision(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top Banner */}
      <div
        className="dgs-saas-card"
        style={{
          padding: "20px 24px",
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.08) 100%)",
          border: "1px solid rgba(16, 185, 129, 0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <Target size={24} style={{ color: "var(--dgs-color-primary, #10b981)" }} />
              <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700, color: "#fff" }}>
                MANAGER ACTION CENTER — DAILY OPERATING SYSTEM
              </h2>
              <span className="dgs-saas-chip success" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                LIVE V8.12.5
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "0.88rem", color: "rgba(255, 255, 255, 0.7)" }}>
              The daily cockpit for SEO Leads & Executives: review incoming discovery, assign high-priority tasks with due dates, enforce two-status reconciliation, and verify live completions.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={fetchActionCenterData}
              className="dgs-saas-btn secondary"
              disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem" }}
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh Dashboard
            </button>
            <Link
              href="/admin/off-page/mismatches"
              className="dgs-saas-btn warning"
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", textDecoration: "none" }}
            >
              <ShieldAlert size={15} />
              Reconcile Mismatches ({kpis?.mismatchesCount || 0})
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

      {/* KPI Cards Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
        }}
      >
        <div className="dgs-saas-card" style={{ padding: "16px" }}>
          <div style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>
            Total in Pipeline
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff" }}>
            {kpis?.totalInPipeline || 0}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#10b981", marginTop: "4px" }}>
            Live Opportunities
          </div>
        </div>

        <div className="dgs-saas-card" style={{ padding: "16px", borderColor: "rgba(59, 130, 246, 0.3)" }}>
          <div style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>
            Needs Manager Review
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#3b82f6" }}>
            {kpis?.needsReviewCount || 0}
          </div>
          <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)", marginTop: "4px" }}>
            Awaiting decision
          </div>
        </div>

        <div className="dgs-saas-card" style={{ padding: "16px", borderColor: "rgba(16, 185, 129, 0.3)" }}>
          <div style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>
            Active / Assigned
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#10b981" }}>
            {kpis?.assignedActiveCount || 0}
          </div>
          <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)", marginTop: "4px" }}>
            In outreach execution
          </div>
        </div>

        <div className="dgs-saas-card" style={{ padding: "16px", borderColor: (kpis?.dueTodayCount || 0) > 0 ? "rgba(245, 158, 11, 0.4)" : "rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>
            Due Today
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#f59e0b" }}>
            {kpis?.dueTodayCount || 0}
          </div>
          <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)", marginTop: "4px" }}>
            Team priority tasks
          </div>
        </div>

        <div className="dgs-saas-card" style={{ padding: "16px", borderColor: (kpis?.overdueCount || 0) > 0 ? "rgba(239, 68, 68, 0.4)" : "rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>
            Overdue Tasks
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: (kpis?.overdueCount || 0) > 0 ? "#ef4444" : "#fff" }}>
            {kpis?.overdueCount || 0}
          </div>
          <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)", marginTop: "4px" }}>
            Needs immediate attention
          </div>
        </div>

        <div className="dgs-saas-card" style={{ padding: "16px", borderColor: (kpis?.mismatchesCount || 0) > 0 ? "rgba(249, 115, 22, 0.4)" : "rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>
            Status Mismatches
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#f97316" }}>
            {kpis?.mismatchesCount || 0}
          </div>
          <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)", marginTop: "4px" }}>
            Claim vs crawler reality
          </div>
        </div>

        <div className="dgs-saas-card" style={{ padding: "16px" }}>
          <div style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>
            Verified Live (7d)
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#10b981" }}>
            {kpis?.recentlyVerifiedLive || 0}
          </div>
          <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)", marginTop: "4px" }}>
            Proven new backlinks
          </div>
        </div>
      </div>

      {/* Main View Tabs */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "10px", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("REVIEW")}
          className={`dgs-saas-btn ${activeTab === "REVIEW" ? "primary" : "secondary"}`}
          style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}
        >
          <Clock size={16} />
          Needs My Review ({needsReviewItems.length})
        </button>

        <button
          onClick={() => setActiveTab("TEAM")}
          className={`dgs-saas-btn ${activeTab === "TEAM" ? "primary" : "secondary"}`}
          style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}
        >
          <Calendar size={16} />
          My Team's Work ({todayTasks.length})
        </button>

        <button
          onClick={() => setActiveTab("RESULTS")}
          className={`dgs-saas-btn ${activeTab === "RESULTS" ? "primary" : "secondary"}`}
          style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}
        >
          <CheckCircle size={16} />
          Results / Lost Links ({resultsAndLostLinks.length})
        </button>

        <button
          onClick={() => setActiveTab("PIPELINE")}
          className={`dgs-saas-btn ${activeTab === "PIPELINE" ? "primary" : "secondary"}`}
          style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}
        >
          <Filter size={16} />
          Full Pipeline ({kpis?.totalInPipeline || 0})
        </button>
      </div>

      {/* TAB 1: NEEDS MY REVIEW */}
      {activeTab === "REVIEW" && (
        <div className="dgs-saas-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
                Opportunities Needing Manager Decision
              </h3>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.6)" }}>
                Unassigned qualified opportunities requiring strategic allocation, rejection, or scheduling.
              </p>
            </div>
            <span className="dgs-saas-chip warning" style={{ fontWeight: 700 }}>
              {needsReviewItems.length} Awaiting Decision
            </span>
          </div>

          {needsReviewItems.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "rgba(255, 255, 255, 0.5)" }}>
              <CheckCircle2 size={36} style={{ color: "#10b981", margin: "0 auto 12px auto" }} />
              <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "#fff" }}>Review Queue Clear!</div>
              <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                All incoming opportunities have been processed or assigned.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="dgs-saas-table" style={{ width: "100%", textAlign: "left", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    <th style={{ padding: "12px 10px" }}>Priority & Site</th>
                    <th style={{ padding: "12px 10px" }}>Category</th>
                    <th style={{ padding: "12px 10px" }}>Target Page</th>
                    <th style={{ padding: "12px 10px" }}>Source Type</th>
                    <th style={{ padding: "12px 10px", textAlign: "right" }}>Manager Decisions</th>
                  </tr>
                </thead>
                <tbody>
                  {needsReviewItems.map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <td style={{ padding: "12px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            className={`dgs-saas-chip ${
                              item.priority_tier === "P0" ? "danger" : item.priority_tier === "P1" ? "warning" : "primary"
                            }`}
                            style={{ fontSize: "0.7rem", fontWeight: 700 }}
                          >
                            {item.priority_tier}
                          </span>
                          <div>
                            <div style={{ fontWeight: 600, color: "#fff" }}>{item.site_name}</div>
                            <a
                              href={item.exact_submission_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#3b82f6", fontSize: "0.78rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "3px" }}
                            >
                              {item.domain} <ExternalLink size={11} />
                            </a>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "12px 10px" }}>
                        <span className="dgs-saas-chip neutral" style={{ fontSize: "0.72rem" }}>
                          {item.category.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td style={{ padding: "12px 10px", maxWidth: "240px" }}>
                        <div style={{ fontSize: "0.8rem", color: "#93c5fd", wordBreak: "break-all" }}>
                          {item.recommended_dgs_target_page}
                        </div>
                      </td>

                      <td style={{ padding: "12px 10px" }}>
                        <span className="dgs-saas-chip neutral" style={{ fontSize: "0.7rem" }}>
                          {item.source_type}
                        </span>
                      </td>

                      <td style={{ padding: "12px 10px", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                          <button
                            onClick={() => openDecisionModal(item, "APPROVE")}
                            className="dgs-saas-btn primary"
                            style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                            title="Approve opportunity"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openDecisionModal(item, "ASSIGN")}
                            className="dgs-saas-btn success"
                            style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                            title="Assign to executive"
                          >
                            Assign
                          </button>
                          <button
                            onClick={() => openDecisionModal(item, "REJECT")}
                            className="dgs-saas-btn danger"
                            style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                            title="Reject opportunity"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => openDecisionModal(item, "SNOOZE")}
                            className="dgs-saas-btn neutral"
                            style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                            title="Snooze"
                          >
                            Snooze
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY TEAM'S WORK */}
      {activeTab === "TEAM" && (
        <div className="dgs-saas-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
                Team Execution Queue
              </h3>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.6)" }}>
                Active tasks assigned to executives with mandatory next actions and target due dates.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.6)" }}>Filter by Executive:</span>
              <select
                value={selectedOwner}
                onChange={(e) => setSelectedOwner(e.target.value)}
                className="dgs-saas-input"
                style={{ padding: "6px 12px", fontSize: "0.82rem", minWidth: "160px" }}
              >
                <option value="ALL">All Executives</option>
                <option value="Aakash">Aakash</option>
                <option value="Pooja">Pooja</option>
                <option value="Rohan">Rohan</option>
                <option value="Sneha">Sneha</option>
              </select>
            </div>
          </div>

          {todayTasks.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "rgba(255, 255, 255, 0.5)" }}>
              <CheckCircle2 size={36} style={{ color: "#10b981", margin: "0 auto 12px auto" }} />
              <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "#fff" }}>No assigned tasks in this view.</div>
              <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                Use the Needs My Review tab to assign opportunities to your team.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="dgs-saas-table" style={{ width: "100%", textAlign: "left", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    <th style={{ padding: "12px 10px" }}>Priority & Site</th>
                    <th style={{ padding: "12px 10px" }}>Category</th>
                    <th style={{ padding: "12px 10px" }}>Assigned Executive</th>
                    <th style={{ padding: "12px 10px" }}>Mandatory Next Action</th>
                    <th style={{ padding: "12px 10px" }}>Due Date & Urgency</th>
                    <th style={{ padding: "12px 10px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {todayTasks.map((task) => (
                    <tr key={task.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <td style={{ padding: "12px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            className={`dgs-saas-chip ${
                              task.priority_tier === "P0" ? "danger" : task.priority_tier === "P1" ? "warning" : "primary"
                            }`}
                            style={{ fontSize: "0.7rem", fontWeight: 700 }}
                          >
                            {task.priority_tier}
                          </span>
                          <div>
                            <div style={{ fontWeight: 600, color: "#fff" }}>{task.site_name}</div>
                            <a
                              href={task.exact_submission_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#3b82f6", fontSize: "0.78rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "3px" }}
                            >
                              {task.domain} <ExternalLink size={11} />
                            </a>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "12px 10px" }}>
                        <span className="dgs-saas-chip neutral" style={{ fontSize: "0.72rem" }}>
                          {task.category.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td style={{ padding: "12px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <UserCheck size={14} style={{ color: task.owner ? "#10b981" : "rgba(255,255,255,0.4)" }} />
                          <span style={{ fontWeight: 600, color: task.owner ? "#fff" : "#f59e0b" }}>
                            {task.owner || "Unassigned"}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: "12px 10px", maxWidth: "260px" }}>
                        <div style={{ fontWeight: 500, color: "#e2e8f0" }}>{task.next_action}</div>
                        {task.internal_note && (
                          <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)", marginTop: "2px" }}>
                            {task.internal_note.slice(0, 70)}...
                          </div>
                        )}
                      </td>

                      <td style={{ padding: "12px 10px" }}>
                        {task.is_overdue ? (
                          <span className="dgs-saas-chip danger" style={{ fontSize: "0.72rem", fontWeight: 700 }}>
                            OVERDUE ({task.due_date})
                          </span>
                        ) : task.is_due_today ? (
                          <span className="dgs-saas-chip warning" style={{ fontSize: "0.72rem", fontWeight: 700 }}>
                            DUE TODAY ({task.due_date})
                          </span>
                        ) : (
                          <span style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.8rem" }}>
                            {task.due_date || "No date"}
                          </span>
                        )}
                      </td>

                      <td style={{ padding: "12px 10px", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                          <button
                            onClick={() => openDecisionModal(task, "COMPLETE")}
                            className="dgs-saas-btn success"
                            style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                            title="Submit Proof of Completion"
                          >
                            Submit Proof
                          </button>
                          <button
                            onClick={() => openDecisionModal(task, "ASSIGN")}
                            className="dgs-saas-btn secondary"
                            style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                            title="Reassign or update due date"
                          >
                            Reassign
                          </button>
                          <button
                            onClick={() => openDecisionModal(task, "SNOOZE")}
                            className="dgs-saas-btn neutral"
                            style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                            title="Snooze"
                          >
                            Snooze
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RESULTS / LOST LINKS */}
      {activeTab === "RESULTS" && (
        <div className="dgs-saas-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
                Confirmed Results, Lost Links & Status Reconciliation
              </h3>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.6)" }}>
                Live external crawler telemetry against claimed team statuses. Two-status governance ensures zero false positives.
              </p>
            </div>
            <Link
              href="/admin/off-page/mismatches"
              className="dgs-saas-btn warning"
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", textDecoration: "none" }}
            >
              <ShieldAlert size={14} />
              Reconciliation Dashboard
            </Link>
          </div>

          {resultsAndLostLinks.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "rgba(255, 255, 255, 0.5)" }}>
              <CheckCircle2 size={36} style={{ color: "#10b981", margin: "0 auto 12px auto" }} />
              <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "#fff" }}>No active backlink results recorded yet.</div>
              <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                Submit proof of publication or import backlink records to initiate live automated monitoring.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="dgs-saas-table" style={{ width: "100%", textAlign: "left", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    <th style={{ padding: "12px 10px" }}>Source Domain & URL</th>
                    <th style={{ padding: "12px 10px" }}>Target URL & Anchor</th>
                    <th style={{ padding: "12px 10px" }}>Team Claim</th>
                    <th style={{ padding: "12px 10px" }}>Crawler Reality</th>
                    <th style={{ padding: "12px 10px" }}>Status Match</th>
                    <th style={{ padding: "12px 10px" }}>Last Crawled</th>
                    <th style={{ padding: "12px 10px", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsAndLostLinks.map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <td style={{ padding: "12px 10px", maxWidth: "260px" }}>
                        <div style={{ fontWeight: 600, color: "#fff" }}>{item.source_domain}</div>
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#3b82f6", fontSize: "0.78rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "3px", wordBreak: "break-all" }}
                        >
                          {item.source_url} <ExternalLink size={11} />
                        </a>
                      </td>

                      <td style={{ padding: "12px 10px", maxWidth: "240px" }}>
                        <div style={{ fontSize: "0.8rem", color: "#93c5fd", wordBreak: "break-all" }}>{item.target_url}</div>
                        <div style={{ fontSize: "0.74rem", color: "rgba(255, 255, 255, 0.6)", marginTop: "2px" }}>
                          Anchor: &ldquo;{item.anchor_text || "—"}&rdquo; ({item.link_rel || "unknown"})
                        </div>
                      </td>

                      <td style={{ padding: "12px 10px" }}>
                        <span className="dgs-saas-chip neutral" style={{ fontSize: "0.72rem", fontWeight: 600 }}>
                          {item.team_status}
                        </span>
                      </td>

                      <td style={{ padding: "12px 10px" }}>
                        <span
                          className={`dgs-saas-chip ${
                            item.crawler_status === "LIVE" ? "success" : item.crawler_status === "LOST" ? "danger" : "warning"
                          }`}
                          style={{ fontSize: "0.72rem", fontWeight: 700 }}
                        >
                          {item.crawler_status} {item.http_status ? `(${item.http_status})` : ""}
                        </span>
                      </td>

                      <td style={{ padding: "12px 10px" }}>
                        {item.status_mismatch ? (
                          <span className="dgs-saas-chip danger" style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                            MISMATCH
                          </span>
                        ) : (
                          <span className="dgs-saas-chip success" style={{ fontSize: "0.7rem" }}>
                            MATCH
                          </span>
                        )}
                      </td>

                      <td style={{ padding: "12px 10px" }}>
                        <span style={{ fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.6)" }}>
                          {item.last_checked_at || "Pending"}
                        </span>
                      </td>

                      <td style={{ padding: "12px 10px", textAlign: "right" }}>
                        {item.status_mismatch ? (
                          <Link
                            href="/admin/off-page/mismatches"
                            className="dgs-saas-btn warning"
                            style={{ padding: "4px 8px", fontSize: "0.75rem", textDecoration: "none", display: "inline-block" }}
                          >
                            Reconcile
                          </Link>
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: "#10b981" }}>Verified</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FULL PIPELINE STAGE MANAGER */}
      {activeTab === "PIPELINE" && (
        <div className="dgs-saas-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
                Full Operational Pipeline
              </h3>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.6)" }}>
                Track every stage from external discovery to ongoing link monitoring.
              </p>
            </div>

            {/* Stage Selector Chips */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {[
                { stage: "ALL", label: "All" },
                { stage: "DISCOVERED", label: "Discovered" },
                { stage: "QUALIFIED", label: "Qualified" },
                { stage: "MANAGER_REVIEW", label: "Needs Review" },
                { stage: "ASSIGNED", label: "Assigned" },
                { stage: "IN_PROGRESS", label: "In Progress" },
                { stage: "SUBMITTED", label: "Submitted" },
                { stage: "LIVE", label: "Live" },
              ].map((st) => (
                <button
                  key={st.stage}
                  onClick={() => setSelectedStage(st.stage)}
                  className={`dgs-saas-chip ${selectedStage === st.stage ? "primary" : "neutral"}`}
                  style={{ cursor: "pointer", border: "none", fontSize: "0.78rem", padding: "4px 10px" }}
                >
                  {st.label} ({st.stage === "ALL" ? kpis?.totalInPipeline || 0 : kpis?.pipelineCounts?.[st.stage] || 0})
                </button>
              ))}
            </div>
          </div>

          {pipelineLoading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "rgba(255, 255, 255, 0.6)" }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 8px auto" }} />
              <div>Loading opportunities for stage: {selectedStage}...</div>
            </div>
          ) : pipelineOpps.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "rgba(255, 255, 255, 0.5)" }}>
              No records in stage {selectedStage}.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="dgs-saas-table" style={{ width: "100%", textAlign: "left", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    <th style={{ padding: "10px" }}>Domain & Target</th>
                    <th style={{ padding: "10px" }}>Category & Rel</th>
                    <th style={{ padding: "10px" }}>Stage</th>
                    <th style={{ padding: "10px" }}>Owner & Action</th>
                    <th style={{ padding: "10px" }}>Due Date</th>
                    <th style={{ padding: "10px", textAlign: "right" }}>Manager Decisions</th>
                  </tr>
                </thead>
                <tbody>
                  {pipelineOpps.map((opp) => (
                    <tr key={opp.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <td style={{ padding: "10px" }}>
                        <div style={{ fontWeight: 600, color: "#fff" }}>{opp.site_name}</div>
                        <a
                          href={opp.exact_submission_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#3b82f6", fontSize: "0.78rem", textDecoration: "none" }}
                        >
                          {opp.domain}
                        </a>
                      </td>

                      <td style={{ padding: "10px" }}>
                        <div>{opp.category}</div>
                        <span className="dgs-saas-chip neutral" style={{ fontSize: "0.68rem" }}>
                          {opp.dofollow_status}
                        </span>
                      </td>

                      <td style={{ padding: "10px" }}>
                        <span className="dgs-saas-chip primary" style={{ fontSize: "0.72rem", fontWeight: 600 }}>
                          {opp.status}
                        </span>
                      </td>

                      <td style={{ padding: "10px" }}>
                        <div style={{ fontWeight: 600, color: opp.owner || opp.assigned_to ? "#10b981" : "rgba(255,255,255,0.4)" }}>
                          {opp.owner || opp.assigned_to || "Unassigned"}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.6)" }}>
                          {opp.next_action || "Pending action"}
                        </div>
                      </td>

                      <td style={{ padding: "10px" }}>
                        <span style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)" }}>
                          {opp.due_date || "—"}
                        </span>
                      </td>

                      <td style={{ padding: "10px", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                          <button
                            onClick={() => openDecisionModal(opp, "APPROVE")}
                            className="dgs-saas-btn primary"
                            style={{ padding: "3px 8px", fontSize: "0.75rem" }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openDecisionModal(opp, "ASSIGN")}
                            className="dgs-saas-btn secondary"
                            style={{ padding: "3px 8px", fontSize: "0.75rem" }}
                          >
                            Assign
                          </button>
                          <button
                            onClick={() => openDecisionModal(opp, "REJECT")}
                            className="dgs-saas-btn danger"
                            style={{ padding: "3px 8px", fontSize: "0.75rem" }}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DECISION ACTION MODAL */}
      {modalOpen && activeItem && (
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
              maxWidth: "540px",
              padding: "24px",
              background: "#111827",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#fff" }}>
                {modalMode === "APPROVE" && "Approve Opportunity & Pipeline Next Action"}
                {modalMode === "ASSIGN" && "Assign Task to Executive"}
                {modalMode === "REJECT" && "Reject Opportunity"}
                {modalMode === "SNOOZE" && "Snooze Opportunity"}
                {modalMode === "COMPLETE" && "Submit Proof of Completion"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "10px 14px", background: "rgba(255, 255, 255, 0.04)", borderRadius: "8px", marginBottom: "16px" }}>
              <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#fff" }}>{activeItem.site_name}</div>
              <div style={{ fontSize: "0.78rem", color: "#3b82f6" }}>{activeItem.domain}</div>
            </div>

            <form onSubmit={handleDecisionSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {(modalMode === "APPROVE" || modalMode === "ASSIGN") && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)", marginBottom: "4px" }}>
                      Assigned Executive (Owner):
                    </label>
                    <input
                      type="text"
                      className="dgs-saas-input"
                      placeholder="e.g. Aakash, Pooja, Rohan"
                      value={formOwner}
                      onChange={(e) => setFormOwner(e.target.value)}
                      required={modalMode === "ASSIGN"}
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)", marginBottom: "4px" }}>
                      Mandatory Next Action (Governance Standard):
                    </label>
                    <select
                      className="dgs-saas-input"
                      value={formNextAction}
                      onChange={(e) => setFormNextAction(e.target.value)}
                      required
                      style={{ width: "100%", background: "#1f2937", color: "#fff" }}
                    >
                      {MANDATORY_NEXT_ACTIONS.map((action) => (
                        <option key={action} value={action}>
                          {action}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)", marginBottom: "4px" }}>
                      Target Completion Date:
                    </label>
                    <input
                      type="date"
                      className="dgs-saas-input"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      required
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)", marginBottom: "4px" }}>
                      Internal Note / Context:
                    </label>
                    <textarea
                      className="dgs-saas-input"
                      rows={2}
                      placeholder="Strategic outreach pointers or angle..."
                      value={formNote}
                      onChange={(e) => setFormNote(e.target.value)}
                      style={{ width: "100%" }}
                    />
                  </div>
                </>
              )}

              {modalMode === "REJECT" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)", marginBottom: "4px" }}>
                    Reason for Rejection:
                  </label>
                  <textarea
                    className="dgs-saas-input"
                    rows={3}
                    placeholder="e.g. PBN network detected, unrelated niche, paid extortion link..."
                    value={formReason}
                    onChange={(e) => setFormReason(e.target.value)}
                    required
                    style={{ width: "100%" }}
                  />
                </div>
              )}

              {modalMode === "SNOOZE" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)", marginBottom: "4px" }}>
                      Snooze Until Date:
                    </label>
                    <input
                      type="date"
                      className="dgs-saas-input"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      required
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)", marginBottom: "4px" }}>
                      Snooze Reason:
                    </label>
                    <input
                      type="text"
                      className="dgs-saas-input"
                      placeholder="e.g. Waiting for editorial board schedule"
                      value={formReason}
                      onChange={(e) => setFormReason(e.target.value)}
                      style={{ width: "100%" }}
                    />
                  </div>
                </>
              )}

              {modalMode === "COMPLETE" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)", marginBottom: "4px" }}>
                      Live Backlink / Proof URL:
                    </label>
                    <input
                      type="url"
                      className="dgs-saas-input"
                      placeholder="https://example.com/blog/published-post"
                      value={formProofUrl}
                      onChange={(e) => setFormProofUrl(e.target.value)}
                      required
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)", marginBottom: "4px" }}>
                      Execution Notes:
                    </label>
                    <textarea
                      className="dgs-saas-input"
                      rows={2}
                      placeholder="e.g. Approved and published by editor with dofollow brand anchor"
                      value={formNote}
                      onChange={(e) => setFormNote(e.target.value)}
                      style={{ width: "100%" }}
                    />
                  </div>
                </>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="dgs-saas-btn secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDecision}
                  className={`dgs-saas-btn ${modalMode === "REJECT" ? "danger" : "primary"}`}
                >
                  {submittingDecision ? "Saving..." : "Confirm Decision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
