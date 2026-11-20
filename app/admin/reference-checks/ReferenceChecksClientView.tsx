"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FileCheck2,
  Upload,
  Sparkles,
  Send,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Eye,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Building2,
  UserCheck,
  Plus,
  Mail,
  Phone,
  Search,
  X,
  ExternalLink,
} from "lucide-react";
import type {
  ReferenceCheckRecord,
  ReferenceQuestion,
} from "@/lib/reference-checks/types";
import { buildCommonQuestions, MAX_REFERENCE_QUESTIONS } from "@/lib/reference-checks/question-generator";

type Stats = {
  total: number;
  pending: number;
  submitted: number;
  redFlags: number;
};

type Props = {
  initialRecords: ReferenceCheckRecord[];
  initialStats: Stats;
  hrSenderEmail: string;
  currentUserRole: string;
};

const EMPTY_QUESTIONS = buildCommonQuestions({
  candidateName: "",
  lastCompany: "",
  lastDesignation: "",
  lastEmploymentDates: "",
});

function formatDateTime(val: string | null | undefined): string {
  if (!val) return "--";
  try {
    const iso = val.includes("T") ? val : `${val.replace(" ", "T")}Z`;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(val);
  }
}

export default function ReferenceChecksClientView({
  initialRecords,
  initialStats,
  hrSenderEmail,
}: Props) {
  const [records, setRecords] = useState<ReferenceCheckRecord[]>(initialRecords);
  const [activeTab, setActiveTab] = useState<"registry" | "feeder">("registry");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // CV Scanner & Feeder State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scannerBanner, setScannerBanner] = useState<string | null>(null);
  const [cvFilename, setCvFilename] = useState<string>("");
  const [cvSummary, setCvSummary] = useState<string>("");
  const [claimedResponsibilities, setClaimedResponsibilities] = useState<string[]>([]);
  const [claimedAchievements, setClaimedAchievements] = useState<string[]>([]);

  // Candidate & Last Employer
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidatePhone, setCandidatePhone] = useState("");
  const [candidatePosition, setCandidatePosition] = useState("");
  const [lastCompany, setLastCompany] = useState("");
  const [lastDesignation, setLastDesignation] = useState("");
  const [lastEmploymentDates, setLastEmploymentDates] = useState("");

  // POC Feeder Inputs
  const [pocName, setPocName] = useState("");
  const [pocDesignation, setPocDesignation] = useState("");
  const [pocEmail, setPocEmail] = useState("");
  const [pocPhone, setPocPhone] = useState("");

  // Questions (max 10)
  const [questions, setQuestions] = useState<ReferenceQuestion[]>(EMPTY_QUESTIONS);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionCategory, setNewQuestionCategory] = useState<"common" | "resume_claim">("resume_claim");

  // Dispatching & Actions State
  const [sending, setSending] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: "ok" | "err"; text: string; url?: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReferenceCheckRecord | null>(null);

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const qName = sp.get("candidate");
      const qEmail = sp.get("email");
      const qPhone = sp.get("phone");
      const qPos = sp.get("position");
      const qTab = sp.get("tab");
      if (qName) setCandidateName(qName);
      if (qEmail) setCandidateEmail(qEmail);
      if (qPhone) setCandidatePhone(qPhone);
      if (qPos) setCandidatePosition(qPos);
      if (qTab === "feeder" || qName) setActiveTab("feeder");
    } catch {}
  }, []);

  const stats: Stats = useMemo(() => {
    return {
      total: records.length,
      pending: records.filter((r) => r.status === "pending").length,
      submitted: records.filter((r) => r.status === "submitted").length,
      redFlags: records.filter(
        (r) =>
          r.comparison_feedback?.overallVerdict === "RED_FLAG_DETECTED" ||
          r.comparison_feedback?.overallVerdict === "MINOR_DISCREPANCY"
      ).length,
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (statusFilter === "pending" && r.status !== "pending") return false;
      if (statusFilter === "submitted" && r.status !== "submitted") return false;
      if (
        statusFilter === "flagged" &&
        r.comparison_feedback?.overallVerdict !== "RED_FLAG_DETECTED" &&
        r.comparison_feedback?.overallVerdict !== "MINOR_DISCREPANCY"
      ) {
        return false;
      }
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const hay = [
          r.candidate_name,
          r.candidate_position,
          r.last_company,
          r.last_designation,
          r.poc_name,
          r.poc_email,
          r.poc_designation,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [records, statusFilter, searchQuery]);

  async function refreshList() {
    try {
      const res = await fetch("/api/admin/reference-checks");
      const json = await res.json();
      if (json.ok && Array.isArray(json.records)) {
        setRecords(json.records);
      }
    } catch {}
  }

  async function handleCvUpload(file: File) {
    setScanning(true);
    setActionMsg(null);
    setScannerBanner(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (candidatePosition.trim()) {
        fd.append("appliedPosition", candidatePosition.trim());
      }

      const res = await fetch("/api/admin/reference-checks/scan-cv", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || !json.ok || !json.result) {
        setActionMsg({ type: "err", text: json?.message || "Failed to scan CV." });
        return;
      }

      const r = json.result;
      setCvFilename(file.name);
      setCandidateName(r.candidateName || "");
      setCandidateEmail(r.candidateEmail || "");
      setCandidatePhone(r.candidatePhone || "");
      if (r.appliedPosition) setCandidatePosition(r.appliedPosition);
      setLastCompany(r.lastCompany || "");
      setLastDesignation(r.lastDesignation || "");
      setLastEmploymentDates(r.lastEmploymentDates || "");
      setCvSummary(r.cvSummary || "");
      setClaimedResponsibilities(r.claimedResponsibilities || []);
      setClaimedAchievements(r.claimedAchievements || []);

      if (r.detectedPoc) {
        if (r.detectedPoc.fullName) setPocName(r.detectedPoc.fullName);
        if (r.detectedPoc.designation) setPocDesignation(r.detectedPoc.designation);
        if (r.detectedPoc.email) setPocEmail(r.detectedPoc.email);
        if (r.detectedPoc.phone) setPocPhone(r.detectedPoc.phone);
      }

      if (Array.isArray(r.questions) && r.questions.length > 0) {
        setQuestions(r.questions.slice(0, MAX_REFERENCE_QUESTIONS));
      }

      setScannerBanner(
        `Scanned "${file.name}" (${r.scannerMode === "gemini_ai" ? "Gemini AI" : "Smart Fallback"}): identified last workplace "${r.lastCompany}" & generated ${r.questions?.length || 0} verification questions (<= 10 limit).`
      );
    } catch (err: any) {
      setActionMsg({ type: "err", text: err?.message || "Error scanning CV." });
    } finally {
      setScanning(false);
    }
  }

  function updateQuestionText(idx: number, text: string) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, questionText: text } : q))
    );
  }

  function toggleQuestionEnabled(idx: number) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, enabled: !q.enabled } : q))
    );
  }

  function removeQuestion(idx: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  }

  function addCustomQuestion() {
    const clean = newQuestionText.trim();
    if (!clean || questions.length >= MAX_REFERENCE_QUESTIONS) return;
    setQuestions((prev) => [
      ...prev,
      {
        id: `q${prev.length + 1}`,
        questionText: clean,
        category: newQuestionCategory,
        answerType: "yes_no_comment",
        claimContext: newQuestionCategory === "resume_claim" ? clean : undefined,
        enabled: true,
      },
    ]);
    setNewQuestionText("");
  }

  function refreshCommonQuestionsFromFields() {
    const freshCommon = buildCommonQuestions({
      candidateName: candidateName || "the candidate",
      lastCompany: lastCompany || "the last company",
      lastDesignation: lastDesignation || "their stated role",
      lastEmploymentDates: lastEmploymentDates || "their stated dates",
    });
    const resumeClaims = questions.filter((q) => q.category === "resume_claim").slice(0, 5);
    setQuestions([...freshCommon, ...resumeClaims].slice(0, MAX_REFERENCE_QUESTIONS));
  }

  async function handleDispatchReferenceCheck(e: React.FormEvent) {
    e.preventDefault();
    setActionMsg(null);
    const activeQuestions = questions.filter((q) => q.enabled !== false).slice(0, MAX_REFERENCE_QUESTIONS);
    if (activeQuestions.length === 0) {
      setActionMsg({ type: "err", text: "Enable at least 1 question (up to 10)." });
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/admin/reference-checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName,
          candidateEmail,
          candidatePhone,
          candidatePosition,
          lastCompany,
          lastDesignation,
          lastEmploymentDates,
          cvFilename,
          cvTextSummary: cvSummary,
          claimedResponsibilities,
          claimedAchievements,
          pocName,
          pocDesignation,
          pocEmail,
          pocPhone,
          questions: activeQuestions,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setActionMsg({ type: "err", text: json?.message || "Failed to send reference check." });
        return;
      }

      if (json.record) {
        setRecords((prev) => [json.record, ...prev]);
      }

      const sentOk = json.emailResult?.sent;
      setActionMsg({
        type: sentOk ? "ok" : "err",
        text: sentOk
          ? `Reference check registered (PENDING) & email dispatched from ${json.emailResult.sender} to ${pocEmail}.`
          : `Record saved (PENDING), but email dispatch reported: ${json.emailResult?.error || "SMTP not configured"}. You can still copy the direct link below.`,
        url: json.publicUrl,
      });

      setActiveTab("registry");
    } catch (err: any) {
      setActionMsg({ type: "err", text: err?.message || "Network error creating reference check." });
    } finally {
      setSending(false);
    }
  }

  async function handleResendEmail(id: string) {
    setResendingId(id);
    setActionMsg(null);
    try {
      const res = await fetch(`/api/admin/reference-checks/${encodeURIComponent(id)}`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.ok) {
        setActionMsg({ type: "ok", text: "Reference check reminder email resent cleanly from HR ID." });
        await refreshList();
      } else {
        setActionMsg({
          type: "err",
          text: json?.emailResult?.error || json?.message || "Failed to resend email.",
        });
      }
    } finally {
      setResendingId(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete reference check for ${name}?`)) return;
    const res = await fetch(`/api/admin/reference-checks/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (json.ok) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      if (selectedReport?.id === id) setSelectedReport(null);
    }
  }

  function copyLink(token: string, id: string) {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://www.dgeniussolutions.com";
    const url = `${origin}/ref-check/${encodeURIComponent(token)}/`;
    navigator.clipboard?.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2200);
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        margin: 0,
        padding: "clamp(12px, 1.5vw, 28px)",
        boxSizing: "border-box",
        color: "#f8fafc",
      }}
    >
      {/* Top Page Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "20px",
          padding: "20px 24px",
          background: "linear-gradient(135deg, rgba(17, 19, 30, 0.96) 0%, rgba(24, 18, 43, 0.9) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: "#22d3ee", textTransform: "uppercase", marginBottom: "6px" }}>
            <FileCheck2 size={15} /> HR Background Verification &bull; AI CV Scanner
          </div>
          <h1 style={{ margin: 0, fontSize: "clamp(20px, 1.8vw, 30px)", fontWeight: 700, color: "#ffffff" }}>
            Candidate Reference Check System
          </h1>
          <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: "#94a3b8" }}>
            Scan candidate CV (last employer), feed Reference POC contact details, shoot &le; 10 Yes/No questions from <strong style={{ color: "#e2e8f0" }}>{hrSenderEmail}</strong>, and compare CV vs. received feedback.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <button
            type="button"
            onClick={() => setActiveTab("registry")}
            style={{
              padding: "11px 18px",
              borderRadius: "10px",
              border: activeTab === "registry" ? "1px solid rgba(34, 211, 238, 0.5)" : "1px solid rgba(255,255,255,0.12)",
              background: activeTab === "registry" ? "rgba(34, 211, 238, 0.14)" : "rgba(255,255,255,0.04)",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Reference Registry ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("feeder")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "11px 20px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(135deg, #7928ca 0%, #0891b2 100%)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <Plus size={16} /> New Reference Check (CV + POC Feeder)
          </button>
        </div>
      </div>

      {/* Full-Width 4K Responsive KPI Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        {[
          { label: "Total Registered", val: stats.total, color: "#67e8f9", icon: FileCheck2 },
          { label: "Pending Response", val: stats.pending, color: "#fbbf24", icon: Clock },
          { label: "Submitted & Verified", val: stats.submitted, color: "#34d399", icon: CheckCircle2 },
          { label: "Discrepancies / Flags", val: stats.redFlags, color: "#f87171", icon: AlertTriangle },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              style={{
                padding: "18px 20px",
                background: "rgba(17, 19, 29, 0.92)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>{kpi.label}</div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: kpi.color, marginTop: "4px" }}>{kpi.val}</div>
              </div>
              <Icon size={28} color={kpi.color} style={{ opacity: 0.75 }} />
            </div>
          );
        })}
      </div>

      {/* Action Notification Banner */}
      {actionMsg && (
        <div
          style={{
            marginBottom: "18px",
            padding: "14px 18px",
            borderRadius: "12px",
            background: actionMsg.type === "ok" ? "rgba(16, 185, 129, 0.14)" : "rgba(239, 68, 68, 0.14)",
            border: actionMsg.type === "ok" ? "1px solid rgba(52, 211, 153, 0.35)" : "1px solid rgba(248, 113, 113, 0.35)",
            color: actionMsg.type === "ok" ? "#6ee7b7" : "#fca5a5",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            fontSize: "13px",
          }}
        >
          <span>{actionMsg.text}</span>
          {actionMsg.url && (
            <a
              href={actionMsg.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#fff",
                textDecoration: "underline",
                fontWeight: 600,
              }}
            >
              Open Referee Form <ExternalLink size={14} />
            </a>
          )}
        </div>
      )}

      {/* TAB 1: CV UPLOAD + POC FEEDER + <=10 QUESTIONS */}
      {activeTab === "feeder" && (
        <form onSubmit={handleDispatchReferenceCheck} style={{ display: "grid", gap: "20px" }}>
          {/* Multi-column 4K Layout (Left: CV Upload + Candidate Last Company + POC Feeder | Right: <=10 Questions Builder) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 520px), 1fr))",
              gap: "20px",
              alignItems: "start",
            }}
          >
            {/* LEFT COLUMN: CV Scanner + Last Employer + POC Feeder */}
            <div style={{ display: "grid", gap: "18px" }}>
              {/* Card 1: Upload & AI Scan CV */}
              <div
                style={{
                  padding: "22px",
                  background: "rgba(17, 19, 29, 0.94)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 700, color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    <Sparkles size={16} /> 1. Upload &amp; Scan Candidate CV
                  </div>
                  {cvFilename && <span style={{ fontSize: "12px", color: "#34d399" }}>Loaded: {cvFilename}</span>}
                </div>

                <div
                  onClick={() => !scanning && fileInputRef.current?.click()}
                  style={{
                    border: "2px dashed rgba(192, 132, 252, 0.35)",
                    borderRadius: "12px",
                    padding: "24px 16px",
                    textAlign: "center",
                    background: "rgba(121, 40, 202, 0.06)",
                    cursor: scanning ? "wait" : "pointer",
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.md"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleCvUpload(f);
                    }}
                  />
                  <Upload size={28} color="#c084fc" style={{ marginBottom: "8px" }} />
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>
                    {scanning ? "Scanning CV with Gemini AI (extracting last workplace & claims)..." : "Click to Upload Candidate CV (.PDF, .DOCX, .TXT)"}
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                    Automatically identifies candidate&apos;s last place worked and builds up to 10 common + resume-specific questions.
                  </div>
                </div>

                {scannerBanner && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: "rgba(34, 211, 238, 0.1)",
                      border: "1px solid rgba(34, 211, 238, 0.25)",
                      color: "#67e8f9",
                      fontSize: "12px",
                    }}
                  >
                    {scannerBanner}
                  </div>
                )}
              </div>

              {/* Card 2: Candidate Shared Details (Last Workplace Focused) */}
              <div
                style={{
                  padding: "22px",
                  background: "rgba(17, 19, 29, 0.94)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 700, color: "#67e8f9", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    <Building2 size={16} /> 2. Candidate &amp; Last Place Worked
                  </div>
                  <button
                    type="button"
                    onClick={refreshCommonQuestionsFromFields}
                    style={{
                      padding: "5px 10px",
                      fontSize: "11px",
                      borderRadius: "6px",
                      border: "1px solid rgba(255,255,255,0.14)",
                      background: "rgba(255,255,255,0.05)",
                      color: "#cbd5e1",
                      cursor: "pointer",
                    }}
                  >
                    Sync Common Questions
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "12px" }}>
                  <InputField label="Candidate Full Name *" value={candidateName} onChange={setCandidateName} required placeholder="e.g. Rohan Sharma" />
                  <InputField label="Role Applied For at DGS" value={candidatePosition} onChange={setCandidatePosition} placeholder="e.g. Senior SEO Strategist" />
                  <InputField label="Last Company Worked At *" value={lastCompany} onChange={setLastCompany} required placeholder="Exact last employer name" />
                  <InputField label="Last Designation Held *" value={lastDesignation} onChange={setLastDesignation} required placeholder="Role at last employer" />
                  <InputField label="Dates at Last Company" value={lastEmploymentDates} onChange={setLastEmploymentDates} placeholder="e.g. Jan 2024 - Oct 2025" />
                  <InputField label="Candidate Email" value={candidateEmail} onChange={setCandidateEmail} type="email" placeholder="candidate@email.com" />
                </div>
              </div>

              {/* Card 3: Reference Check POC Data Feeder */}
              <div
                style={{
                  padding: "22px",
                  background: "rgba(17, 19, 29, 0.94)",
                  border: "1px solid rgba(52, 211, 153, 0.25)",
                  borderRadius: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 700, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>
                  <UserCheck size={16} /> 3. Reference Check POC Feeder
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "12px" }}>
                  <InputField label="POC Full Name *" value={pocName} onChange={setPocName} required placeholder="e.g. Ananya Deshmukh" />
                  <InputField label="POC Designation *" value={pocDesignation} onChange={setPocDesignation} required placeholder="e.g. Head of Marketing / HR Lead" />
                  <InputField label="POC Email ID *" value={pocEmail} onChange={setPocEmail} type="email" required placeholder="manager@lastcompany.com" />
                  <InputField label="POC Phone Number (Optional)" value={pocPhone} onChange={setPocPhone} type="tel" placeholder="+91 98XXXXXXXX (Optional)" />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Question Review & Customization (Strict <= 10 Cap) */}
            <div
              style={{
                padding: "22px",
                background: "rgba(17, 19, 29, 0.94)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                display: "grid",
                gap: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#f8fafc", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    4. Reference Check Questions (Yes/No + Reply)
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                    Mix of Common Checks and Resume-Specific Claim Verifications. Capped at {MAX_REFERENCE_QUESTIONS}.
                  </div>
                </div>
                <span
                  style={{
                    padding: "5px 12px",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    fontWeight: 700,
                    background: "rgba(192, 132, 252, 0.16)",
                    color: "#e9d5ff",
                    border: "1px solid rgba(192, 132, 252, 0.3)",
                  }}
                >
                  {questions.filter((q) => q.enabled !== false).length} / {MAX_REFERENCE_QUESTIONS} Active
                </span>
              </div>

              <div style={{ display: "grid", gap: "10px", maxHeight: "650px", overflowY: "auto", paddingRight: "4px" }}>
                {questions.map((q, idx) => (
                  <div
                    key={q.id + "_" + idx}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "#0c0e17",
                      border: q.enabled !== false ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.04)",
                      opacity: q.enabled !== false ? 1 : 0.5,
                      display: "grid",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          type="checkbox"
                          checked={q.enabled !== false}
                          onChange={() => toggleQuestionEnabled(idx)}
                          aria-label={`Enable question ${idx + 1}`}
                        />
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8" }}>Q{idx + 1}</span>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "9999px",
                            textTransform: "uppercase",
                            background: q.category === "resume_claim" ? "rgba(6, 182, 212, 0.16)" : "rgba(192, 132, 252, 0.16)",
                            color: q.category === "resume_claim" ? "#67e8f9" : "#d8b4fe",
                          }}
                        >
                          {q.category === "resume_claim" ? "Resume Specific" : "Common Check"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuestion(idx)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#64748b",
                          cursor: "pointer",
                          padding: "2px",
                        }}
                        title="Remove question"
                      >
                        <X size={15} />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={q.questionText}
                      onChange={(e) => updateQuestionText(idx, e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "#07080d",
                        color: "#f1f5f9",
                        fontSize: "13px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                ))}
              </div>

              {questions.length < MAX_REFERENCE_QUESTIONS && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", paddingTop: "6px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <input
                    type="text"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    placeholder="Add custom Yes/No question (max 10 total)..."
                    style={{
                      flex: "1 1 220px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "#07080d",
                      color: "#fff",
                      fontSize: "13px",
                    }}
                  />
                  <select
                    value={newQuestionCategory}
                    onChange={(e) => setNewQuestionCategory(e.target.value as any)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "#07080d",
                      color: "#fff",
                      fontSize: "13px",
                    }}
                  >
                    <option value="resume_claim">Resume Specific</option>
                    <option value="common">Common Check</option>
                  </select>
                  <button
                    type="button"
                    onClick={addCustomQuestion}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border: "1px solid rgba(192,132,252,0.4)",
                      background: "rgba(192,132,252,0.15)",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    + Add Question
                  </button>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Email sends from <strong style={{ color: "#e2e8f0" }}>{hrSenderEmail}</strong> &bull; Status registers as <strong style={{ color: "#fbbf24" }}>Pending</strong> until submitted.
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(135deg, #7928ca 0%, #0891b2 100%)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: sending ? "wait" : "pointer",
                    opacity: sending ? 0.7 : 1,
                  }}
                >
                  <Send size={16} />
                  {sending ? "Sending Reference Email..." : "Shoot Reference Check Email"}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: REGISTRY (PENDING vs SUBMITTED + COMPARISON FEEDBACK) */}
      {activeTab === "registry" && (
        <div
          style={{
            padding: "20px",
            background: "rgba(17, 19, 29, 0.94)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
          }}
        >
          {/* Toolbar */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "18px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {[
                { key: "all", label: "All" },
                { key: "pending", label: "Pending" },
                { key: "submitted", label: "Submitted" },
                { key: "flagged", label: "Discrepancies / Flags" },
              ].map((pill) => (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => setStatusFilter(pill.key)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "9999px",
                    border: statusFilter === pill.key ? "1px solid #22d3ee" : "1px solid rgba(255,255,255,0.1)",
                    background: statusFilter === pill.key ? "rgba(34, 211, 238, 0.14)" : "rgba(255,255,255,0.04)",
                    color: statusFilter === pill.key ? "#67e8f9" : "#cbd5e1",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: "1 1 260px", maxWidth: "420px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search size={15} color="#64748b" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search candidate, company, or POC..."
                  style={{
                    width: "100%",
                    padding: "9px 12px 9px 36px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "#07080d",
                    color: "#fff",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <button
                type="button"
                onClick={refreshList}
                title="Refresh list"
                style={{
                  padding: "9px 12px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#cbd5e1",
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div style={{ padding: "48px 16px", textAlign: "center", color: "#94a3b8" }}>
              <FileCheck2 size={40} style={{ opacity: 0.4, marginBottom: "10px" }} />
              <div style={{ fontSize: "15px", fontWeight: 600, color: "#e2e8f0" }}>
                No reference checks match your filter yet
              </div>
              <p style={{ fontSize: "13px", marginTop: "4px" }}>
                Click &quot;New Reference Check (CV + POC Feeder)&quot; to upload a CV and send your first verification request.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "960px", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8" }}>
                    <th style={{ padding: "12px 14px" }}>Candidate</th>
                    <th style={{ padding: "12px 14px" }}>Last Workplace (CV)</th>
                    <th style={{ padding: "12px 14px" }}>POC Reference Feeder</th>
                    <th style={{ padding: "12px 14px" }}>Status</th>
                    <th style={{ padding: "12px 14px" }}>CV vs Received Comparison</th>
                    <th style={{ padding: "12px 14px" }}>Timeline</th>
                    <th style={{ padding: "12px 14px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((rec) => {
                    const fb = rec.comparison_feedback;
                    return (
                      <tr
                        key={rec.id}
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "13px" }}
                      >
                        <td style={{ padding: "14px" }}>
                          <div style={{ fontWeight: 700, color: "#fff" }}>{rec.candidate_name}</div>
                          {rec.candidate_position && (
                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>{rec.candidate_position}</div>
                          )}
                          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                            {rec.questions.length} Questions Sent
                          </div>
                        </td>

                        <td style={{ padding: "14px" }}>
                          <div style={{ fontWeight: 600, color: "#e2e8f0" }}>{rec.last_company}</div>
                          <div style={{ fontSize: "12px", color: "#94a3b8" }}>{rec.last_designation}</div>
                          {rec.last_employment_dates && (
                            <div style={{ fontSize: "11px", color: "#67e8f9", marginTop: "2px" }}>
                              {rec.last_employment_dates}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: "14px" }}>
                          <div style={{ fontWeight: 600, color: "#e2e8f0" }}>{rec.poc_name}</div>
                          <div style={{ fontSize: "12px", color: "#94a3b8" }}>{rec.poc_designation}</div>
                          <div style={{ fontSize: "11px", color: "#c084fc", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                            <Mail size={11} /> {rec.poc_email}
                          </div>
                          {rec.poc_phone && (
                            <div style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                              <Phone size={11} /> {rec.poc_phone}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: "14px" }}>
                          {rec.status === "submitted" ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "5px 10px",
                                borderRadius: "9999px",
                                background: "rgba(16, 185, 129, 0.16)",
                                color: "#34d399",
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              <CheckCircle2 size={13} /> SUBMITTED
                            </span>
                          ) : (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "5px 10px",
                                borderRadius: "9999px",
                                background: "rgba(251, 191, 36, 0.16)",
                                color: "#fbbf24",
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              <Clock size={13} /> PENDING
                            </span>
                          )}
                        </td>

                        <td style={{ padding: "14px" }}>
                          {fb ? (
                            <div>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "4px 10px",
                                  borderRadius: "6px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  background:
                                    fb.overallVerdict === "VERIFIED_HIGH_CONFIDENCE"
                                      ? "rgba(16, 185, 129, 0.18)"
                                      : fb.overallVerdict === "MINOR_DISCREPANCY"
                                      ? "rgba(251, 191, 36, 0.18)"
                                      : "rgba(239, 68, 68, 0.18)",
                                  color:
                                    fb.overallVerdict === "VERIFIED_HIGH_CONFIDENCE"
                                      ? "#34d399"
                                      : fb.overallVerdict === "MINOR_DISCREPANCY"
                                      ? "#fbbf24"
                                      : "#f87171",
                                }}
                              >
                                {fb.matchScore}% Match &bull; {fb.overallVerdict.replace(/_/g, " ")}
                              </span>
                              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                                Rehire: <strong style={{ color: fb.rehireEligible ? "#34d399" : "#f87171" }}>{fb.rehireEligible ? "Yes" : "No"}</strong>
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: "12px", color: "#64748b" }}>Awaiting POC feedback</span>
                          )}
                        </td>

                        <td style={{ padding: "14px", fontSize: "12px", color: "#94a3b8" }}>
                          <div>Sent: {formatDateTime(rec.sent_at || rec.created_at)}</div>
                          {rec.submitted_at && (
                            <div style={{ color: "#34d399", marginTop: "2px" }}>
                              Submitted: {formatDateTime(rec.submitted_at)}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: "14px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              onClick={() => setSelectedReport(rec)}
                              title="View Comparison Feedback & Q&A"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "7px 11px",
                                borderRadius: "8px",
                                border: "1px solid rgba(34, 211, 238, 0.35)",
                                background: "rgba(34, 211, 238, 0.12)",
                                color: "#67e8f9",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              <Eye size={14} /> {rec.status === "submitted" ? "Comparison Feedback" : "Details"}
                            </button>
                            <button
                              type="button"
                              onClick={() => copyLink(rec.secure_token, rec.id)}
                              title="Copy referee link"
                              style={{
                                padding: "7px 10px",
                                borderRadius: "8px",
                                border: "1px solid rgba(255,255,255,0.12)",
                                background: "rgba(255,255,255,0.05)",
                                color: copiedId === rec.id ? "#34d399" : "#cbd5e1",
                                cursor: "pointer",
                              }}
                            >
                              {copiedId === rec.id ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                            {rec.status === "pending" && (
                              <button
                                type="button"
                                disabled={resendingId === rec.id}
                                onClick={() => handleResendEmail(rec.id)}
                                title="Resend HR email"
                                style={{
                                  padding: "7px 10px",
                                  borderRadius: "8px",
                                  border: "1px solid rgba(192,132,252,0.3)",
                                  background: "rgba(192,132,252,0.12)",
                                  color: "#d8b4fe",
                                  cursor: "pointer",
                                }}
                              >
                                <Send size={14} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDelete(rec.id, rec.candidate_name)}
                              title="Delete check"
                              style={{
                                padding: "7px 10px",
                                borderRadius: "8px",
                                border: "1px solid rgba(248,113,113,0.25)",
                                background: "rgba(239,68,68,0.1)",
                                color: "#f87171",
                                cursor: "pointer",
                              }}
                            >
                              <Trash2 size={14} />
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
      )}

      {/* MODAL: SIDE-BY-SIDE COMPARISON FEEDBACK REPORT */}
      {selectedReport &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedReport(null);
            }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(4, 5, 10, 0.85)",
              backdropFilter: "blur(8px)",
              padding: "clamp(12px, 2vw, 32px)",
              overflowY: "auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
          <div
            style={{
              width: "100%",
              maxWidth: "1600px",
              background: "#0d0f18",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "18px",
              padding: "clamp(18px, 2.2vw, 32px)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "#22d3ee", textTransform: "uppercase" }}>
                  Candidate Shared CV vs. Received Reference Feedback
                </div>
                <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#fff" }}>
                  {selectedReport.candidate_name} — {selectedReport.last_company}
                </h2>
                <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
                  Referee POC: <strong style={{ color: "#e2e8f0" }}>{selectedReport.poc_name}</strong> ({selectedReport.poc_designation}) &bull; {selectedReport.poc_email}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                style={{
                  padding: "8px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {selectedReport.comparison_feedback ? (
              <div style={{ display: "grid", gap: "20px" }}>
                {/* Executive Summary & Match Score */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "14px",
                  }}
                >
                  <div style={{ flex: "1 1 240px", padding: "18px", borderRadius: "12px", background: "#141724", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Verification Score</div>
                    <div style={{ fontSize: "34px", fontWeight: 800, color: selectedReport.comparison_feedback.matchScore >= 85 ? "#34d399" : selectedReport.comparison_feedback.matchScore >= 65 ? "#fbbf24" : "#f87171", marginTop: "4px" }}>
                      {selectedReport.comparison_feedback.matchScore}%
                    </div>
                    <div style={{ fontSize: "12px", color: "#cbd5e1", marginTop: "4px" }}>
                      {selectedReport.comparison_feedback.overallVerdict.replace(/_/g, " ")}
                    </div>
                  </div>
                  <div style={{ flex: "2 1 400px", padding: "18px", borderRadius: "12px", background: "#141724", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ fontSize: "11px", color: "#c084fc", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>AI Comparison Feedback &amp; Recommendation</div>
                    <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#f1f5f9", lineHeight: 1.55 }}>
                      {selectedReport.comparison_feedback.executiveSummary}
                    </p>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#67e8f9" }}>
                      Recommended Action: {selectedReport.comparison_feedback.recommendation}
                    </div>
                  </div>
                </div>

                {selectedReport.comparison_feedback.redFlags.length > 0 && (
                  <div style={{ padding: "16px 18px", borderRadius: "12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(248, 113, 113, 0.3)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 700, color: "#fca5a5", marginBottom: "8px" }}>
                      <ShieldAlert size={16} /> Discrepancies / Red Flags Highlighted
                    </div>
                    <ul style={{ margin: 0, paddingLeft: "18px", color: "#fecaca", fontSize: "13px", display: "grid", gap: "4px" }}>
                      {selectedReport.comparison_feedback.redFlags.map((rf, i) => (
                        <li key={i}>{rf}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Side-by-Side Comparison Matrix */}
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "780px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", fontSize: "11px", textTransform: "uppercase", color: "#94a3b8", textAlign: "left" }}>
                        <th style={{ padding: "10px 12px" }}>Check Area</th>
                        <th style={{ padding: "10px 12px" }}>Candidate Shared Details (CV)</th>
                        <th style={{ padding: "10px 12px" }}>Referee Received Details (POC)</th>
                        <th style={{ padding: "10px 12px" }}>Alignment Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReport.comparison_feedback.items.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "13px" }}>
                          <td style={{ padding: "12px", fontWeight: 600, color: "#e2e8f0" }}>{item.dimension}</td>
                          <td style={{ padding: "12px", color: "#cbd5e1" }}>{item.candidateClaimed}</td>
                          <td style={{ padding: "12px", color: "#fff", fontWeight: 500 }}>{item.refereeReported}</td>
                          <td style={{ padding: "12px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "3px 10px",
                                borderRadius: "9999px",
                                fontSize: "11px",
                                fontWeight: 700,
                                background:
                                  item.status === "MATCH"
                                    ? "rgba(16,185,129,0.18)"
                                    : item.status === "PARTIAL"
                                    ? "rgba(251,191,36,0.18)"
                                    : "rgba(239,68,68,0.18)",
                                color:
                                  item.status === "MATCH"
                                    ? "#34d399"
                                    : item.status === "PARTIAL"
                                    ? "#fbbf24"
                                    : "#f87171",
                              }}
                            >
                              {item.status}
                            </span>
                            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>{item.analysis}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {selectedReport.comparison_feedback.additionalComments && (
                  <div style={{ padding: "14px 18px", borderRadius: "10px", background: "#141724", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>
                      Additional Comments from {selectedReport.poc_name}
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", color: "#e2e8f0" }}>
                      {selectedReport.comparison_feedback.additionalComments}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: "24px", borderRadius: "12px", background: "#141724", border: "1px solid rgba(251,191,36,0.25)", display: "grid", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fbbf24", fontWeight: 700 }}>
                  <Clock size={18} /> Pending Response from {selectedReport.poc_name} ({selectedReport.poc_email})
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
                  Comparison report will populate automatically as soon as the Point of Contact completes the {selectedReport.questions.length} verification questions.
                </p>
                <div style={{ display: "grid", gap: "8px", marginTop: "6px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#cbd5e1" }}>Questions Sent:</div>
                  {selectedReport.questions.map((q, i) => (
                    <div key={q.id} style={{ fontSize: "13px", color: "#e2e8f0", padding: "8px 12px", borderRadius: "8px", background: "#0b0d14" }}>
                      <strong>Q{i + 1}:</strong> {q.questionText}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>,
          document.body
        )}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "12px", color: "#cbd5e1", marginBottom: "5px", fontWeight: 600 }}>
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.12)",
          background: "#07080d",
          color: "#ffffff",
          fontSize: "13px",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}
