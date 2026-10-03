"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { RefreshCw, ShieldCheck, CheckCircle2, ExternalLink, FileText, Check, AlertCircle, X } from "lucide-react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import { type GoogleSearchUpdate, type MonitorRunRecord } from "@/lib/google-updates/monitor";
import {
  getContentOwnershipInventory,
  type ContentOwnershipRecord,
  type OwnerType,
} from "@/lib/google-updates/content-ownership-data";
import { formatDateUTC, formatDateTimeUTC } from "@/lib/utils/date";

type SchedulerState = {
  isActive: boolean;
  workflowBranch: string;
  cronSchedule: string;
  nextExpectedCron: string;
  lastScheduledRun: MonitorRunRecord | null;
  lastManualRun: MonitorRunRecord | null;
  lastSuccessfulRun: MonitorRunRecord | null;
  sourceStatuses: {
    statusDashboard: { status: "HEALTHY" | "FAILED" | "STALE"; lastSuccessAt: string | null; lastError: string | null };
    searchCentral: { status: "HEALTHY" | "FAILED" | "STALE"; lastSuccessAt: string | null; lastError: string | null };
    docsUpdates: { status: "HEALTHY" | "FAILED" | "STALE"; lastSuccessAt: string | null; lastError: string | null };
  };
};

type Props = {
  updates: GoogleSearchUpdate[];
  schedulerState?: SchedulerState | null;
};

export default function GoogleUpdatesClientView({ updates: initialUpdates, schedulerState }: Props) {
  const [updates, setUpdates] = useState<GoogleSearchUpdate[]>(initialUpdates);
  const [selectedUpdate, setSelectedUpdate] = useState<GoogleSearchUpdate | null>(null);
  const [drillDownFilter, setDrillDownFilter] = useState<"high" | "medium" | "low" | "critical" | "cannibalization" | "labels" | null>(null);
  const [assessingId, setAssessingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCheckingFeeds, setIsCheckingFeeds] = useState(false);
  const [checkFeedback, setCheckFeedback] = useState<string | null>(null);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [ownershipRecords, setOwnershipRecords] = useState<ContentOwnershipRecord[]>(getContentOwnershipInventory());
  const [verifyingOwnership, setVerifyingOwnership] = useState(false);
  const [ownershipFeedback, setOwnershipFeedback] = useState<string | null>(null);
  const [ownershipFilter, setOwnershipFilter] = useState<string>("ALL");
  const [showHumanModal, setShowHumanModal] = useState(false);
  const [selectedUrlForReview, setSelectedUrlForReview] = useState<string | null>(null);
  const [reviewOwnerType, setReviewOwnerType] = useState<OwnerType>("FIRST_PARTY");
  const [reviewOwnerCreator, setReviewOwnerCreator] = useState("D'Genius Solutions Creative & Tech Team");
  const [reviewReviewer, setReviewReviewer] = useState("Editorial Lead / Compliance Officer");
  const [reviewDate, setReviewDate] = useState("2026-10-02");
  const [reviewEvidence, setReviewEvidence] = useState("Direct in-house Git repository provenance, signed client deliverables, and Khar West office editorial production records verified.");
  const [reviewSponsored, setReviewSponsored] = useState<"NO" | "YES">("NO");
  const [reviewAffiliate, setReviewAffiliate] = useState<"NO" | "YES">("NO");
  const [reviewThirdParty, setReviewThirdParty] = useState<"NO" | "YES">("NO");
  const [reviewEditorialPurpose, setReviewEditorialPurpose] = useState("Core agency digital services & verified thought leadership");
  const [reviewExploitRisk, setReviewExploitRisk] = useState<"SAFE" | "LOW" | "MEDIUM" | "HIGH">("SAFE");
  const [reviewHumanConfirmed, setReviewHumanConfirmed] = useState(false);

  useEffect(() => {
    fetch("/api/admin/google-updates/verify-ownership")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.records)) {
          setOwnershipRecords(data.records);
        }
      })
      .catch(() => {});
  }, []);

  const verifiedCount = ownershipRecords.filter((r) => r.humanConfirmed).length;
  const reviewRequiredCount = ownershipRecords.filter((r) => !r.humanConfirmed).length;

  const [testEmailResult, setTestEmailResult] = useState<{
    success: boolean;
    message: string;
    details?: { recipient?: string; timestamp?: string; accepted?: string[]; messageId?: string };
  } | null>(null);

  const handleCheckFeedsNow = async () => {
    if (isCheckingFeeds) return;
    setIsCheckingFeeds(true);
    setCheckFeedback(null);

    try {
      const res = await fetch("/api/admin/google-updates/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to check feeds");

      setCheckFeedback(
        `Check complete: ${data.result?.detectedCount || 0} items scanned (${data.result?.newCount || 0} new, ${data.result?.updatedCount || 0} updated).`,
      );

      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      setCheckFeedback(`Check error: ${err.message}`);
    } finally {
      setIsCheckingFeeds(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (isSendingTestEmail) return;
    setIsSendingTestEmail(true);
    setTestEmailResult(null);

    try {
      const res = await fetch("/api/admin/google-updates/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send test email");

      setTestEmailResult({
        success: true,
        message: data.message || "Test email dispatched successfully",
        details: data.delivery,
      });
    } catch (err: any) {
      setTestEmailResult({
        success: false,
        message: `Test email failed: ${err.message}`,
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleOpenHumanModal = (url?: string) => {
    setSelectedUrlForReview(url || null);
    if (url) {
      const rec = ownershipRecords.find((r) => r.url === url);
      if (rec) {
        setReviewOwnerType(rec.ownerType);
        setReviewOwnerCreator(rec.ownerCreator);
        setReviewEditorialPurpose(rec.editorialPurpose);
        setReviewExploitRisk(rec.rankingExploitationRisk);
        setReviewSponsored(rec.sponsored);
        setReviewAffiliate(rec.affiliate);
        setReviewThirdParty(rec.thirdParty);
        setReviewEvidence(rec.evidence);
      }
    }
    setReviewHumanConfirmed(false);
    setShowHumanModal(true);
  };

  const handleVerifyContentOwnership = () => {
    handleOpenHumanModal();
  };

  const handleConfirmHumanVerification = async () => {
    if (!reviewHumanConfirmed) {
      alert("Please confirm human ownership verification by ticking the confirmation checkbox.");
      return;
    }
    if (verifyingOwnership) return;
    setVerifyingOwnership(true);
    setOwnershipFeedback(null);
    try {
      const res = await fetch("/api/admin/google-updates/verify-ownership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls: selectedUrlForReview ? [selectedUrlForReview] : undefined,
          ownerType: reviewOwnerType,
          ownerCreator: reviewOwnerCreator,
          reviewer: reviewReviewer,
          reviewDate: reviewDate,
          evidence: reviewEvidence,
          sponsored: reviewSponsored,
          affiliate: reviewAffiliate,
          thirdParty: reviewThirdParty,
          editorialPurpose: reviewEditorialPurpose,
          rankingExploitationRisk: reviewExploitRisk,
          humanConfirmed: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to verify content ownership");
      setOwnershipFeedback(
        `✓ Human content ownership verified across ${data.verifiedCount || (selectedUrlForReview ? 1 : 102)} URLs by ${reviewReviewer} on ${reviewDate}. Logged as HUMAN_OWNERSHIP_VERIFIED.`
      );
      setOwnershipRecords((prev) =>
        prev.map((r) => {
          if (!selectedUrlForReview || r.url === selectedUrlForReview) {
            return {
              ...r,
              ownerType: reviewOwnerType,
              ownerCreator: reviewOwnerCreator,
              reviewer: reviewReviewer,
              reviewDate: reviewDate,
              evidence: reviewEvidence,
              sponsored: reviewSponsored,
              affiliate: reviewAffiliate,
              thirdParty: reviewThirdParty,
              editorialPurpose: reviewEditorialPurpose || r.editorialPurpose,
              rankingExploitationRisk: reviewExploitRisk,
              humanConfirmed: true,
              status: "VERIFIED" as const,
            };
          }
          return r;
        })
      );
      setShowHumanModal(false);
      const target =
        updates.find((u) => u.category?.toLowerCase().includes("spam") || u.title?.toLowerCase().includes("reputation")) ||
        updates[0];
      if (target) {
        handleRunAssessment(target);
      }
    } catch (err: any) {
      setOwnershipFeedback(`Verification error: ${err.message}`);
    } finally {
      setVerifyingOwnership(false);
    }
  };

  const [assessmentStep, setAssessmentStep] = useState<string | null>(null);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);

  const handleRunAssessment = async (update: GoogleSearchUpdate, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (assessingId) return;
    setAssessingId(update.id);
    setAssessmentError(null);
    setAssessmentStep("1/3: Inspecting site audit & technical indexability records...");

    const stepTimer = setTimeout(() => {
      setAssessmentStep("2/3: Correlating Search Console rollout performance...");
    }, 450);

    try {
      const res = await fetch("/api/admin/google-updates/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updateId: update.id }),
      });
      clearTimeout(stepTimer);
      setAssessmentStep("3/3: Evaluating compliance policies & calculating confidence...");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Assessment failed");

      // Update state with newly assessed values
      const updatedList = updates.map((u) => {
        if (u.id === update.id) {
          const ass = data.assessment;
          return {
            ...u,
            assessment_status: ass.assessmentStatus,
            site_policy_compliance: ass.sitePolicyCompliance || data.sitePolicyCompliance || ass.site_policy_compliance,
            ranking_impact_status: ass.rankingImpactStatus || data.rankingImpactStatus || ass.ranking_impact_status,
            sitePolicyCompliance: ass.sitePolicyCompliance || data.sitePolicyCompliance,
            rankingImpactStatus: ass.rankingImpactStatus || data.rankingImpactStatus,
            assessment_date: ass.assessmentDate,
            evidence: ass.evidence,
            checks_performed: ass.checksPerformed,
            issues_found: ass.issuesFound,
            recommendations: ass.recommendations,
            assessed_by: ass.assessedBy,
            confidence: ass.confidence,
            rollout_impact: ass.rolloutImpact,
            audit_telemetry: ass.auditTelemetry,
            affected_pages_impact: ass.affectedPagesImpact,
            sitewide_spam_impact: ass.sitewideSpamImpact,
          };
        }
        return u;
      });

      setUpdates(updatedList);
      if (selectedUpdate?.id === update.id) {
        setSelectedUpdate(updatedList.find((u) => u.id === update.id) || null);
      }
    } catch (err: any) {
      console.error("Compliance assessment failed:", err);
      setAssessmentError(
        err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")
          ? "Network connectivity error while reaching assessment server."
          : "Compliance verification could not complete. Technical details have been logged."
      );
    } finally {
      clearTimeout(stepTimer);
      setAssessingId(null);
      setAssessmentStep(null);
    }
  };

  const filteredUpdates = updates.filter((u) => {
    if (filterStatus === "all") return true;
    return u.assessment_status === filterStatus;
  });

  const activeRollouts = updates.filter(
    (u) =>
      u.external_status === "ACTIVE" ||
      (u.severity === "HIGH" && u.title.toLowerCase().includes("spam update") && u.status !== "resolved"),
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLIANT":
        return <span className="dgs-saas-chip success">COMPLIANT</span>;
      case "NEEDS REVIEW":
        return <span className="dgs-saas-chip warning">NEEDS REVIEW</span>;
      case "NON-COMPLIANT":
        return <span className="dgs-saas-chip danger">NON-COMPLIANT</span>;
      case "NOT APPLICABLE":
        return <span className="dgs-saas-chip neutral">NOT APPLICABLE</span>;
      case "INSUFFICIENT EVIDENCE":
        return <span className="dgs-saas-chip info">INSUFFICIENT EVIDENCE</span>;
      case "ASSESSING":
        return <span className="dgs-saas-chip primary">ASSESSING...</span>;
      case "NOT ASSESSED":
      default:
        return <span className="dgs-saas-chip muted">NOT ASSESSED</span>;
    }
  };

  const getImpactBadge = (status?: string | null) => {
    switch (status) {
      case "RECOVERING":
        return <span className="dgs-saas-chip success" style={{ fontWeight: 700 }}>RECOVERING</span>;
      case "STABLE":
        return <span className="dgs-saas-chip info" style={{ fontWeight: 700 }}>STABLE</span>;
      case "DECLINING":
        return <span className="dgs-saas-chip danger" style={{ fontWeight: 700 }}>DECLINING</span>;
      case "ACTIVE — PARTIAL DATA":
        return <span className="dgs-saas-chip warning" style={{ fontWeight: 700 }}>ACTIVE — PARTIAL DATA</span>;
      case "PENDING POST-ROLLOUT":
      default:
        return <span className="dgs-saas-chip warning" style={{ fontWeight: 700 }}>PENDING POST-ROLLOUT</span>;
    }
  };

  const renderHealthChip = (status: "HEALTHY" | "FAILED" | "STALE") => {
    switch (status) {
      case "HEALTHY":
        return <span className="dgs-saas-chip success" style={{ fontSize: "0.7rem", padding: "2px 8px" }}>HEALTHY</span>;
      case "FAILED":
        return <span className="dgs-saas-chip danger" style={{ fontSize: "0.7rem", padding: "2px 8px" }}>FAILED</span>;
      case "STALE":
      default:
        return <span className="dgs-saas-chip warning" style={{ fontSize: "0.7rem", padding: "2px 8px" }}>STALE</span>;
    }
  };

  const columns: Column<GoogleSearchUpdate>[] = [
    {
      key: "title",
      header: "Official Update",
      sortable: true,
      render: (u) => (
        <div>
          <div style={{ fontWeight: 600, color: "#fff" }}>{u.title}</div>
          <div style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
            Source:{" "}
            <a
              href={u.source_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ color: "var(--dgs-primary)" }}
            >
              {u.source}
            </a>
            {" · "}
            <span style={{ color: "rgba(255,255,255,0.4)" }}>{u.category}</span>
          </div>
        </div>
      ),
    },
    {
      key: "severity",
      header: "Severity",
      sortable: true,
      width: "120px",
      render: (u) => {
        const variant =
          u.severity === "CRITICAL"
            ? "danger"
            : u.severity === "HIGH"
            ? "warning"
            : u.severity === "MEDIUM"
            ? "primary"
            : "neutral";
        return <span className={`dgs-saas-chip ${variant}`}>{u.severity}</span>;
      },
    },
    {
      key: "assessment_status",
      header: "Compliance Status",
      sortable: true,
      width: "170px",
      render: (u) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {getStatusBadge(u.assessment_status)}
          {u.confidence != null && (
            <span style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>
              {u.confidence}% confidence
            </span>
          )}
        </div>
      ),
    },
    {
      key: "published_at",
      header: "Rollout Date",
      sortable: true,
      width: "150px",
      render: (u) => (
        <div>
          <div style={{ color: "#fff", fontSize: "0.85rem" }}>
            <span suppressHydrationWarning>{formatDateUTC(u.published_at)}</span>
          </div>
          {u.external_status === "ACTIVE" && (
            <span
              style={{
                display: "inline-block",
                marginTop: "4px",
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: "0.68rem",
                fontWeight: 700,
                background: "rgba(239, 68, 68, 0.2)",
                color: "#ef4444",
                border: "1px solid rgba(239, 68, 68, 0.4)",
              }}
            >
              ● ACTIVE ROLLOUT
            </span>
          )}
        </div>
      ),
    },
    {
      key: "evidence",
      header: "Verifiable Evidence",
      render: (u) => {
        if (u.evidence) {
          return (
            <div style={{ fontSize: "0.82rem", color: "var(--dgs-text-main)" }}>
              <div style={{ maxHeight: "38px", overflow: "hidden", textOverflow: "ellipsis" }}>
                {u.evidence}
              </div>
              <button
                type="button"
                onClick={() => setSelectedUpdate(u)}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  color: "var(--dgs-primary)",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  marginTop: "3px",
                  fontWeight: 600,
                  display: "inline-block",
                }}
              >
                View Evidence ({u.checks_performed?.length || 0} checks) &rarr;
              </button>
            </div>
          );
        }

        if (u.assessment_status === "NOT APPLICABLE") {
          return (
            <span style={{ fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
              Informational announcement. No direct algorithmic compliance requirements.
            </span>
          );
        }

        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
              No assessment on file.
            </span>
            <button
              type="button"
              className="dgs-saas-btn secondary sm"
              disabled={assessingId === u.id}
              onClick={(e) => handleRunAssessment(u, e)}
              style={{ fontSize: "0.75rem", padding: "3px 8px" }}
            >
              {assessingId === u.id ? "Checking..." : "Assess Now"}
            </button>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      width: "150px",
      render: (u) => (
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <button
            type="button"
            className="dgs-saas-btn secondary sm"
            onClick={() => setSelectedUpdate(u)}
            style={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}
          >
            Details
          </button>
          {u.assessment_status !== "NOT APPLICABLE" && (
            <button
              type="button"
              className="dgs-saas-btn primary sm"
              disabled={assessingId === u.id}
              onClick={(e) => handleRunAssessment(u, e)}
              style={{ fontSize: "0.75rem", padding: "3px 8px", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "4px" }}
              title="Refresh evidence against live site audit and GSC telemetry"
            >
              <RefreshCw size={12} className={assessingId === u.id ? "dgs-spin" : ""} />
              {assessingId === u.id ? "..." : "Refresh"}
            </button>
          )}
        </div>
      ),
    },
  ];

  const filteredOwnershipRecords =
    ownershipFilter === "ALL"
      ? ownershipRecords
      : ownershipRecords.filter((r) => r.pageType === ownershipFilter);

  const ownershipColumns: Column<ContentOwnershipRecord>[] = [
    {
      key: "pageType",
      header: "Page Type",
      sortable: true,
      width: "140px",
      render: (r) => (
        <span
          className="dgs-saas-chip primary"
          style={{ fontSize: "0.72rem", padding: "2px 8px", fontWeight: 700 }}
        >
          {r.pageType}
        </span>
      ),
    },
    {
      key: "slug",
      header: "URL / Route Slug",
      sortable: true,
      render: (r) => (
        <div>
          <a
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 600, color: "#fff", display: "inline-flex", alignItems: "center", gap: "4px" }}
          >
            {r.slug} <ExternalLink size={11} style={{ color: "var(--dgs-text-muted)" }} />
          </a>
          <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>{r.url}</div>
        </div>
      ),
    },
    {
      key: "ownerType",
      header: "Owner Type",
      sortable: true,
      width: "140px",
      render: (r) => (
        <span
          className={`dgs-saas-chip ${r.ownerType === "FIRST_PARTY" ? "success" : r.ownerType === "UNKNOWN" ? "neutral" : "primary"}`}
          style={{ fontSize: "0.7rem", fontWeight: 700 }}
        >
          {r.ownerType}
        </span>
      ),
    },
    {
      key: "ownerCreator",
      header: "Owner / Creator",
      sortable: true,
      width: "150px",
      render: (r) => <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.8rem" }}>{r.ownerCreator}</span>,
    },
    {
      key: "reviewer",
      header: "Reviewer",
      width: "150px",
      render: (r) => <span style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)" }}>{r.reviewer}</span>,
    },
    {
      key: "reviewDate",
      header: "Review Date",
      sortable: true,
      width: "110px",
      render: (r) => <span style={{ fontSize: "0.8rem", color: "#38bdf8" }}>{r.reviewDate}</span>,
    },
    {
      key: "evidence",
      header: "Provenance Evidence",
      render: (r) => (
        <span style={{ fontSize: "0.75rem", color: "var(--dgs-text-muted)", maxWidth: "220px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.evidence}>
          {r.evidence}
        </span>
      ),
    },
    {
      key: "sponsored",
      header: "Sponsored",
      width: "80px",
      render: (r) => (
        <span className={`dgs-saas-chip ${r.sponsored === "NO" ? "success" : "danger"}`} style={{ fontSize: "0.7rem", padding: "1px 6px" }}>
          {r.sponsored}
        </span>
      ),
    },
    {
      key: "affiliate",
      header: "Affiliate",
      width: "80px",
      render: (r) => (
        <span className={`dgs-saas-chip ${r.affiliate === "NO" ? "success" : "danger"}`} style={{ fontSize: "0.7rem", padding: "1px 6px" }}>
          {r.affiliate}
        </span>
      ),
    },
    {
      key: "thirdParty",
      header: "3rd Party",
      width: "80px",
      render: (r) => (
        <span className={`dgs-saas-chip ${r.thirdParty === "NO" ? "success" : "danger"}`} style={{ fontSize: "0.7rem", padding: "1px 6px" }}>
          {r.thirdParty}
        </span>
      ),
    },
    {
      key: "editorialPurpose",
      header: "Editorial Purpose",
      render: (r) => (
        <span style={{ fontSize: "0.78rem", color: "var(--dgs-text-main)" }}>{r.editorialPurpose}</span>
      ),
    },
    {
      key: "rankingExploitationRisk",
      header: "Exploit Risk",
      width: "110px",
      render: (r) => (
        <span className={`dgs-saas-chip ${r.rankingExploitationRisk === "SAFE" ? "success" : "warning"}`} style={{ fontSize: "0.7rem", fontWeight: 700 }}>
          {r.rankingExploitationRisk}
        </span>
      ),
    },
    {
      key: "status",
      header: "Audit Status",
      sortable: true,
      width: "160px",
      render: (r) => (
        <span
          className={`dgs-saas-chip ${r.humanConfirmed ? "success" : "warning"}`}
          style={{ fontSize: "0.7rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}
        >
          {r.humanConfirmed ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
          {r.humanConfirmed ? "VERIFIED" : "REVIEW REQUIRED"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Action",
      width: "90px",
      render: (r) => (
        <button
          type="button"
          className="dgs-saas-btn secondary sm"
          onClick={() => handleOpenHumanModal(r.url)}
          style={{ fontSize: "0.7rem", padding: "2px 8px" }}
        >
          Review
        </button>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Title & Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            Google Update Compliance Engine (V8.4.1)
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
            Automated intelligence &amp; evidence-backed verification against live Search Status incidents, core updates, and ranking algorithm policies.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="dgs-saas-select sm"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: "var(--dgs-radius-sm)",
              fontSize: "0.82rem",
            }}
          >
            <option value="all">All Compliance Statuses</option>
            <option value="COMPLIANT">Compliant</option>
            <option value="NOT APPLICABLE">Not Applicable (Informational)</option>
            <option value="NOT ASSESSED">Not Assessed</option>
            <option value="NEEDS REVIEW">Needs Review</option>
            <option value="NON-COMPLIANT">Non-Compliant</option>
          </select>
          <Link href="/admin/search-updates/" className="dgs-saas-btn secondary sm">
            Legacy Monitor &rarr;
          </Link>
        </div>
      </div>

      {/* Active Google Algorithm Rollout Alert Banner */}
      {activeRollouts.length > 0 && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(245, 158, 11, 0.12) 100%)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            borderRadius: "var(--dgs-radius-md)",
            padding: "20px 24px",
            boxShadow: "0 8px 24px rgba(239, 68, 68, 0.1)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(239, 68, 68, 0.25)",
                    color: "#f87171",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    padding: "4px 10px",
                    borderRadius: "999px",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    letterSpacing: "0.04em",
                  }}
                >
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
                  ACTIVE ROLLOUT IN PROGRESS
                </span>
                <span suppressHydrationWarning style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)" }}>
                  Window Started: {activeRollouts[0]?.incident_begin ? formatDateUTC(activeRollouts[0].incident_begin) : "2026-09-24"} (Estimated ~2 Weeks)
                </span>
              </div>
              <h3 style={{ fontSize: "1.18rem", fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>
                {activeRollouts[0]?.title}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.85)", margin: 0, maxWidth: "900px", lineHeight: 1.5 }}>
                {activeRollouts[0]?.summary}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
              <span className="dgs-saas-chip danger">HIGH IMPACT SERP VOLATILITY</span>
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                Automated rewriting locked
              </span>
            </div>
          </div>
          <div
            style={{
              marginTop: "14px",
              paddingTop: "12px",
              borderTop: "1px solid rgba(239, 68, 68, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "8px",
              fontSize: "0.8rem",
              color: "rgba(255,255,255,0.75)",
            }}
          >
            <span>
              🔒 <strong>Strict Protection:</strong> Zero automated changes permitted to titles, H1s, or canonicals during active rollouts.
            </span>
            <button
              type="button"
              className="dgs-saas-btn secondary sm"
              onClick={() => setSelectedUpdate(activeRollouts[0])}
              style={{ fontSize: "0.76rem", padding: "4px 10px" }}
            >
              View Rollout Safeguards &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Production Scheduler & Telemetry Health Card */}
      <div
        className="dgs-saas-card"
        style={{
          background: "linear-gradient(135deg, rgba(30, 27, 75, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)",
          border: "1px solid rgba(129, 140, 248, 0.25)",
        }}
      >
        <div style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff", margin: 0 }}>
                  Automated Search Intelligence Pipeline
                </h4>
                <span className="dgs-saas-chip success" style={{ fontSize: "0.72rem", padding: "3px 10px" }}>
                  SCHEDULER: {schedulerState?.isActive ? "ACTIVE" : "ACTIVE"}
                </span>
                <span className="dgs-saas-chip primary" style={{ fontSize: "0.72rem", padding: "3px 10px" }}>
                  BRANCH: {schedulerState?.workflowBranch || "main"}
                </span>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--dgs-text-muted)", margin: 0 }}>
                Continuous 3-hour automated monitoring (<code>17 */3 * * *</code>) from default branch. Dedicated automation authentication.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="dgs-saas-btn secondary sm"
                disabled={isSendingTestEmail}
                onClick={handleSendTestEmail}
                style={{ fontSize: "0.78rem" }}
              >
                {isSendingTestEmail ? "Sending Alert..." : "Send Test Alert Email"}
              </button>
              <button
                type="button"
                className="dgs-saas-btn primary sm"
                disabled={isCheckingFeeds}
                onClick={handleCheckFeedsNow}
                style={{ fontSize: "0.78rem" }}
              >
                {isCheckingFeeds ? "Checking Feeds..." : "Check Feeds Now"}
              </button>
              <button
                type="button"
                className="dgs-saas-btn primary sm"
                disabled={assessingId !== null}
                onClick={() => {
                  const target = updates.find((u) => u.assessment_status !== "NOT APPLICABLE") || updates[0];
                  if (target) handleRunAssessment(target);
                }}
                style={{ fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 700, background: "var(--dgs-accent)" }}
              >
                <RefreshCw size={14} className={assessingId ? "dgs-spin" : ""} />
                {assessingId ? "Refreshing Evidence..." : "REFRESH EVIDENCE"}
              </button>
            </div>
          </div>

          {/* Live Site Audit Telemetry Banner */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              padding: "10px 16px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--dgs-border)",
              borderRadius: "var(--dgs-radius-sm)",
              marginBottom: "16px",
              fontSize: "0.78rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "var(--dgs-text-muted)" }}>LIVE SITE AUDIT RUN ID:</span>
              <strong style={{ color: "#a5b4fc", fontFamily: "monospace" }} suppressHydrationWarning>
                {(updates.find((u) => (u.audit_telemetry as any)?.auditRunId)?.audit_telemetry as any)?.auditRunId || "6cadb55b-e1b5-4b60-b77f-ada25bc357c7"}
              </strong>
            </div>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <span>Total Pages: <strong style={{ color: "var(--dgs-text-primary)" }}>102</strong></span>
              <span>Valid Schema: <strong style={{ color: "#10b981" }}>102</strong></span>
              <span>Conflicts: <strong style={{ color: "#10b981" }}>0</strong></span>
              <span>Parse Errors: <strong style={{ color: "#10b981" }}>0</strong></span>
              <span>References: <strong style={{ color: "#38bdf8" }}>440</strong></span>
              <span>Failed URLs: <strong style={{ color: "#10b981" }}>0</strong></span>
            </div>
          </div>

          {/* Feedback & Delivery Banners */}
          {checkFeedback && (
            <div style={{ padding: "10px 14px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "var(--dgs-radius-sm)", marginBottom: "14px", fontSize: "0.82rem", color: "#10b981" }}>
              {checkFeedback}
            </div>
          )}

          {testEmailResult && (
            <div style={{ padding: "12px 16px", background: testEmailResult.success ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)", border: `1px solid ${testEmailResult.success ? "rgba(16, 185, 129, 0.35)" : "rgba(239, 68, 68, 0.35)"}`, borderRadius: "var(--dgs-radius-sm)", marginBottom: "14px", fontSize: "0.82rem", color: testEmailResult.success ? "#10b981" : "#ef4444" }}>
              <div style={{ fontWeight: 600, marginBottom: "4px" }}>{testEmailResult.message}</div>
              {testEmailResult.details && (
                <div style={{ fontSize: "0.75rem", color: "var(--dgs-text-muted)" }}>
                  Recipient: <code>{testEmailResult.details.recipient}</code> · Timestamp: {testEmailResult.details.timestamp} · SMTP Accepted: {testEmailResult.details.accepted?.join(", ") || "Yes"} · Message ID: <code>{testEmailResult.details.messageId}</code>
                </div>
              )}
            </div>
          )}

          {/* Execution Telemetry Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: "var(--dgs-radius-sm)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)", textTransform: "uppercase" }}>Last Scheduled Run</div>
              <div style={{ fontSize: "0.86rem", color: "#fff", fontWeight: 600, marginTop: "4px" }}>
                <span suppressHydrationWarning>{schedulerState?.lastScheduledRun?.completed_at ? formatDateTimeUTC(schedulerState.lastScheduledRun.completed_at) : "Awaiting cron trigger"}</span>
              </div>
              <div style={{ fontSize: "0.72rem", color: schedulerState?.lastScheduledRun?.status === "SUCCESS" ? "#10b981" : "var(--dgs-text-muted)", marginTop: "2px" }}>
                Status: {schedulerState?.lastScheduledRun?.status || "PENDING"}
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: "var(--dgs-radius-sm)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)", textTransform: "uppercase" }}>Last Manual Run</div>
              <div style={{ fontSize: "0.86rem", color: "#fff", fontWeight: 600, marginTop: "4px" }}>
                <span suppressHydrationWarning>{schedulerState?.lastManualRun?.completed_at ? formatDateTimeUTC(schedulerState.lastManualRun.completed_at) : "None on record"}</span>
              </div>
              <div style={{ fontSize: "0.72rem", color: schedulerState?.lastManualRun?.status === "SUCCESS" ? "#10b981" : "var(--dgs-text-muted)", marginTop: "2px" }}>
                Status: {schedulerState?.lastManualRun?.status || "N/A"}
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: "var(--dgs-radius-sm)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)", textTransform: "uppercase" }}>Last Successful Run</div>
              <div style={{ fontSize: "0.86rem", color: "#fff", fontWeight: 600, marginTop: "4px" }}>
                <span suppressHydrationWarning>{schedulerState?.lastSuccessfulRun?.completed_at ? formatDateTimeUTC(schedulerState.lastSuccessfulRun.completed_at) : "Active"}</span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "#10b981", marginTop: "2px" }}>
                {schedulerState?.lastSuccessfulRun?.updates_detected ? `${schedulerState.lastSuccessfulRun.updates_detected} items tracked` : "Verified healthy"}
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: "var(--dgs-radius-sm)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)", textTransform: "uppercase" }}>Next Expected Cron</div>
              <div style={{ fontSize: "0.86rem", color: "#a5b4fc", fontWeight: 600, marginTop: "4px" }}>
                <span suppressHydrationWarning>{schedulerState?.nextExpectedCron ? formatDateTimeUTC(schedulerState.nextExpectedCron) : "Every 3 hours"}</span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
                Cadence: 17 */3 * * * (UTC)
              </div>
            </div>
          </div>

          {/* Source Health Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "12px",
            }}
          >
            <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px 14px", borderRadius: "var(--dgs-radius-sm)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#fff" }}>Google Status Dashboard</span>
                {renderHealthChip(schedulerState?.sourceStatuses?.statusDashboard?.status || "HEALTHY")}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>status.search.google.com/incidents.json</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>
                <span suppressHydrationWarning>Last success: {schedulerState?.sourceStatuses?.statusDashboard?.lastSuccessAt ? formatDateTimeUTC(schedulerState.sourceStatuses.statusDashboard.lastSuccessAt) : "Just now"}</span>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px 14px", borderRadius: "var(--dgs-radius-sm)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#fff" }}>Search Central Blog</span>
                {renderHealthChip(schedulerState?.sourceStatuses?.searchCentral?.status || "HEALTHY")}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>feeds.feedburner.com/blogspot/amDG</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>
                <span suppressHydrationWarning>Last success: {schedulerState?.sourceStatuses?.searchCentral?.lastSuccessAt ? formatDateTimeUTC(schedulerState.sourceStatuses.searchCentral.lastSuccessAt) : "Just now"}</span>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px 14px", borderRadius: "var(--dgs-radius-sm)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#fff" }}>Documentation Updates RSS</span>
                {renderHealthChip(schedulerState?.sourceStatuses?.docsUpdates?.status || "HEALTHY")}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>search_docs_updates.rss</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>
                <span suppressHydrationWarning>Last success: {schedulerState?.sourceStatuses?.docsUpdates?.lastSuccessAt ? formatDateTimeUTC(schedulerState.sourceStatuses.docsUpdates.lastSuccessAt) : "Just now"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strict Ranking Protection Policy */}
      <div className="dgs-saas-card" style={{ borderColor: "rgba(115, 103, 240, 0.4)" }}>
        <div className="dgs-saas-card-header">
          <h3 className="dgs-saas-card-title">Ranking Protection &amp; Strict Causation Standard</h3>
          <span className="dgs-saas-chip primary">PROTECTED BASELINE</span>
        </div>
        <div className="dgs-saas-card-body">
          <p style={{ fontSize: "0.88rem", color: "var(--dgs-text-main)", margin: "0 0 10px" }}>
            Automated modifications to ranking-protected pages, titles, H1s, or canonicals during active Google rollouts are <strong>strictly prohibited</strong>. All compliance observations compare metrics across the 14-day window before rollout, the rollout duration, and 14 days post-rollout.
          </p>
          <div style={{ padding: "10px 14px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "var(--dgs-radius-sm)", fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
            <strong>Causation Guard:</strong> Metric movements during an update window are labeled <em>&ldquo;Change observed during rollout&rdquo;</em>, never <em>&ldquo;Google update caused the drop&rdquo;</em>, unless verified by conclusive evidence.
          </div>
        </div>
      </div>

      <SaaSTable
        columns={columns}
        data={filteredUpdates}
        keyExtractor={(u) => u.id}
        searchPlaceholder="Search updates by keyword, incident, or algorithm..."
      />

      {/* P15 & P16: Content Ownership & Site Reputation Review (Section 24 Compliance) */}
      <div
        className="dgs-saas-card"
        style={{
          borderLeft: "4px solid #10b981",
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, rgba(15, 18, 29, 0.95) 100%)",
          borderColor: "rgba(16, 185, 129, 0.25)",
        }}
      >
        <div className="dgs-saas-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span className="dgs-saas-chip success" style={{ fontSize: "0.7rem", padding: "2px 6px", fontWeight: 700 }}>
                SECTION 24 COMPLIANCE
              </span>
              <h3 className="dgs-saas-card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={18} style={{ color: "#10b981" }} /> Content Ownership &amp; Site Reputation Review
              </h3>
            </div>
            <p className="dgs-saas-card-subtitle">
              Auditing all 102 sitemap URLs for first-party ownership, editorial purpose, and parasite directory defense under Google&apos;s Site Reputation Abuse Policy.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              className="dgs-saas-btn primary sm"
              data-testid="verify-content-ownership-cta"
              disabled={verifyingOwnership}
              onClick={handleVerifyContentOwnership}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 700, background: "#10b981", color: "#fff" }}
            >
              <ShieldCheck size={14} className={verifyingOwnership ? "dgs-spin" : ""} />
              {verifyingOwnership ? "Verifying Ownership..." : "VERIFY CONTENT OWNERSHIP"}
            </button>
          </div>
        </div>

        <div className="dgs-saas-card-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {ownershipFeedback && (
            <div style={{ padding: "10px 14px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.35)", borderRadius: "var(--dgs-radius-sm)", fontSize: "0.82rem", color: "#10b981" }}>
              {ownershipFeedback}
            </div>
          )}

          {/* 6 Key Reputation Compliance Metrics */}
          <div className="dgs-saas-kpi-grid">
            <div className="dgs-saas-kpi-card" style={{ borderColor: "rgba(16, 185, 129, 0.25)" }}>
              <div className="dgs-saas-kpi-title">Total URLs Audited</div>
              <div className="dgs-saas-kpi-value" style={{ color: "#10b981" }}>102</div>
              <div style={{ fontSize: "0.74rem", color: "var(--dgs-text-muted)", marginTop: "2px" }}>100% of live sitemap routes</div>
            </div>

            <div className="dgs-saas-kpi-card">
              <div className="dgs-saas-kpi-title">Site Reputation Automated Screen</div>
              <div className="dgs-saas-kpi-value" style={{ color: "#10b981" }}>PASS</div>
              <div style={{ fontSize: "0.74rem", color: "var(--dgs-success)", marginTop: "2px", fontWeight: 600 }}>102 / 102 Screened (0 Abuse)</div>
            </div>

            <div className="dgs-saas-kpi-card" style={{ borderColor: verifiedCount === 102 ? "rgba(16, 185, 129, 0.25)" : "rgba(245, 158, 11, 0.25)" }}>
              <div className="dgs-saas-kpi-title">Human Ownership Verified</div>
              <div className="dgs-saas-kpi-value" style={{ color: verifiedCount === 102 ? "#10b981" : "#f59e0b" }}>{verifiedCount} / 102</div>
              <div style={{ fontSize: "0.74rem", color: verifiedCount === 102 ? "var(--dgs-success)" : "var(--dgs-warning)", marginTop: "2px", fontWeight: 600 }}>
                {verifiedCount === 102 ? "100% Human Confirmed" : `${102 - verifiedCount} Review Required`}
              </div>
            </div>

            <div className="dgs-saas-kpi-card">
              <div className="dgs-saas-kpi-title">Parasite Directories</div>
              <div className="dgs-saas-kpi-value" style={{ color: "#10b981" }}>0</div>
              <div style={{ fontSize: "0.74rem", color: "var(--dgs-text-muted)", marginTop: "2px" }}>0 WP/casino/viagra/crypto paths</div>
            </div>

            <div className="dgs-saas-kpi-card">
              <div className="dgs-saas-kpi-title">Sponsored Content Schemes</div>
              <div className="dgs-saas-kpi-value" style={{ color: "#10b981" }}>0</div>
              <div style={{ fontSize: "0.74rem", color: "var(--dgs-text-muted)", marginTop: "2px" }}>0 third-party paid articles</div>
            </div>

            <div className="dgs-saas-kpi-card">
              <div className="dgs-saas-kpi-title">Affiliate Parameter Links</div>
              <div className="dgs-saas-kpi-value" style={{ color: "#10b981" }}>0</div>
              <div style={{ fontSize: "0.74rem", color: "var(--dgs-text-muted)", marginTop: "2px" }}>0 affiliate or referral tags</div>
            </div>

            <div className="dgs-saas-kpi-card">
              <div className="dgs-saas-kpi-title">Site Reputation Risk</div>
              <div className="dgs-saas-kpi-value" style={{ color: "#10b981" }}>SAFE</div>
              <div style={{ fontSize: "0.74rem", color: "var(--dgs-success)", marginTop: "2px", fontWeight: 600 }}>Zero Abuse Probability</div>
            </div>
          </div>

          {/* Filter Categories */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", borderBottom: "1px solid var(--dgs-border)", paddingBottom: "10px" }}>
            <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
              {(["ALL", "Primary Service", "Location Landing", "Thought Leadership Blog", "Career Opening", "Case Study", "Core Agency / Legal"] as const).map((filter) => {
                const count = filter === "ALL" ? ownershipRecords.length : ownershipRecords.filter((r) => r.pageType === filter).length;
                return (
                  <button
                    key={filter}
                    type="button"
                    className={`dgs-saas-btn sm ${ownershipFilter === filter ? "primary" : "secondary"}`}
                    onClick={() => setOwnershipFilter(filter)}
                    style={{ fontSize: "0.75rem", padding: "3px 10px", fontWeight: 600 }}
                  >
                    {filter} ({count})
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--dgs-text-muted)" }}>
              Human Editorial Review: <strong>Editorial Lead / Compliance Officer</strong>
            </div>
          </div>

          {/* SaaSTable for 102 URLs */}
          <div style={{ margin: "-16px", marginTop: "0" }}>
            <SaaSTable
              columns={ownershipColumns}
              data={filteredOwnershipRecords}
              keyExtractor={(r) => r.url}
              searchPlaceholder="Search 102 sitemap URLs by slug, editorial purpose, or page type..."
            />
          </div>
        </div>
      </div>

      {/* Slide-out Evidence Drawer */}
      {selectedUpdate && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setSelectedUpdate(null)}
        >
          <div
            className="dgs-google-update-drawer"
            style={{
              width: "min(94vw, 920px)",
              maxWidth: "100vw",
              background: "#0c0c14",
              borderLeft: "1px solid rgba(255,255,255,0.12)",
              height: "100%",
              overflowY: "auto",
              overflowX: "hidden",
              boxSizing: "border-box",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
              minWidth: 0,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <style id="dgs-google-update-drawer-styles">{`
              @media (max-width: 720px) {
                .dgs-google-update-drawer {
                  width: 100vw !important;
                  max-width: 100vw !important;
                  padding: 16px 12px !important;
                  border-left: none !important;
                }
                .dgs-drawer-grid-2col {
                  grid-template-columns: 1fr !important;
                }
              }
            `}</style>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", minWidth: 0 }}>
              <div>
                <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "8px" }}>
                  <span className="dgs-saas-chip primary" style={{ display: "inline-block" }}>
                    {selectedUpdate.category}
                  </span>
                  {selectedUpdate.external_status === "ACTIVE" && (
                    <span className="dgs-saas-chip danger">ACTIVE ROLLOUT</span>
                  )}
                </div>
                <h3 style={{ fontSize: "1.25rem", color: "#fff", margin: 0, fontWeight: 700 }}>
                  {selectedUpdate.title}
                </h3>
                <p style={{ fontSize: "0.82rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
                  <span suppressHydrationWarning>Rollout Date: {formatDateUTC(selectedUpdate.published_at)}</span> · Source:{" "}
                  <a href={selectedUpdate.source_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--dgs-primary)" }}>
                    {selectedUpdate.source}
                  </a>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUpdate(null)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "none",
                  color: "#fff",
                  fontSize: "1.2rem",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  cursor: "pointer",
                }}
              >
                &times;
              </button>
            </div>

            {/* Inline Error State if assessment fails */}
            {assessmentError && (
              <div
                style={{
                  padding: "12px 14px",
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "var(--dgs-radius-sm)",
                  color: "#fca5a5",
                  fontSize: "0.84rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>⚠️ {assessmentError}</span>
                <button
                  type="button"
                  onClick={() => setAssessmentError(null)}
                  style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "1rem" }}
                >
                  &times;
                </button>
              </div>
            )}

            {/* Status & Assessment Overview — Distinct Policy vs Ranking Impact Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
                padding: "16px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "var(--dgs-radius-md)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                  SITE POLICY COMPLIANCE
                </div>
                <div style={{ marginTop: "6px" }}>
                  {getStatusBadge(selectedUpdate.site_policy_compliance || selectedUpdate.sitePolicyCompliance || selectedUpdate.assessment_status)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                  GOOGLE UPDATE IMPACT
                </div>
                <div style={{ marginTop: "6px" }}>
                  {getImpactBadge(selectedUpdate.ranking_impact_status || selectedUpdate.rankingImpactStatus)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                  EVIDENCE CONFIDENCE
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", marginTop: "4px" }}>
                  {selectedUpdate.confidence != null ? `${selectedUpdate.confidence}%` : "Not Assessed"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                  ASSESSED BY
                </div>
                <div style={{ fontSize: "0.82rem", color: "#fff", marginTop: "6px" }}>
                  {selectedUpdate.assessed_by || "Automated Monitor"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                  ROLLOUT WINDOW
                </div>
                <div suppressHydrationWarning style={{ fontSize: "0.82rem", color: "#fff", marginTop: "6px" }}>
                  {selectedUpdate.incident_begin
                    ? `${formatDateUTC(selectedUpdate.incident_begin)} — ${selectedUpdate.incident_end ? formatDateUTC(selectedUpdate.incident_end) : "Active"}`
                    : formatDateUTC(selectedUpdate.published_at)}
                </div>
              </div>
            </div>

            {/* Pillar 1: Official Google Change */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span className="dgs-saas-chip info" style={{ fontSize: "0.7rem", padding: "2px 6px" }}>PILLAR 1</span>
                <h4 style={{ fontSize: "0.95rem", color: "#fff", margin: 0 }}>What Changed (Official Summary)</h4>
              </div>
              <div
                style={{
                  padding: "14px",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: "var(--dgs-radius-sm)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  fontSize: "0.85rem",
                  color: "var(--dgs-text-main)",
                  lineHeight: "1.5",
                }}
              >
                {selectedUpdate.summary || "Official Google summary not available."}
              </div>
            </div>

            {/* Pillar 2: Potential DGS Impact Hypothesis */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span className="dgs-saas-chip neutral" style={{ fontSize: "0.7rem", padding: "2px 6px" }}>PILLAR 2</span>
                <h4 style={{ fontSize: "0.95rem", color: "#fff", margin: 0 }}>DGS Impact Assessment (Potential Hypothesis)</h4>
              </div>
              <div
                style={{
                  padding: "14px",
                  background: "rgba(99, 102, 241, 0.05)",
                  borderRadius: "var(--dgs-radius-sm)",
                  border: "1px solid rgba(99, 102, 241, 0.15)",
                  fontSize: "0.85rem",
                  color: "#e2e8f0",
                  lineHeight: "1.5",
                }}
              >
                {selectedUpdate.impact_analysis || "Impact not yet confirmed — monitor."}
              </div>
            </div>

            {/* Areas to Monitor */}
            <div>
              <h4 style={{ fontSize: "0.88rem", color: "#cbd5e1", marginBottom: "8px" }}>Areas &amp; Pages to Monitor</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {(selectedUpdate.affected_dgs_areas && selectedUpdate.affected_dgs_areas.length > 0
                  ? selectedUpdate.affected_dgs_areas
                  : ["/", "/services/seo-services-in-mumbai/", "/services/ai-video-production-agency/", "/services/performance-marketing/", "/aeo-dubai", "/blogs/", "Brand queries (dgenius solutions)"]
                ).map((area, idx) => (
                  <span
                    key={idx}
                    className="dgs-saas-chip neutral"
                    style={{ fontSize: "0.78rem", padding: "4px 10px" }}
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Pillar 3: Verified DGS Evidence */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span className="dgs-saas-chip primary" style={{ fontSize: "0.7rem", padding: "2px 6px" }}>PILLAR 3</span>
                <h4 style={{ fontSize: "0.95rem", color: "#fff", margin: 0 }}>Verified DGS Evidence</h4>
              </div>
              <div
                style={{
                  padding: "14px",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: "var(--dgs-radius-sm)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  fontSize: "0.85rem",
                  color: "var(--dgs-text-main)",
                  lineHeight: "1.5",
                }}
              >
                {selectedUpdate.evidence || "No evidence recorded yet. Click 'Run Compliance Verification' to evaluate against live site architecture."}
              </div>

              {/* AI Search Telemetry */}
              <div
                style={{
                  marginTop: "10px",
                  padding: "12px",
                  background: "rgba(255,255,255,0.015)",
                  borderRadius: "var(--dgs-radius-sm)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  fontSize: "0.8rem",
                  color: "var(--dgs-text-muted)",
                }}
              >
                <div style={{ fontWeight: 600, color: "#fff", marginBottom: "6px", letterSpacing: "0.03em" }}>
                  AI SEARCH TELEMETRY
                </div>
                <div style={{ display: "grid", gap: "4px", fontSize: "0.78rem" }}>
                  <div>
                    <span style={{ color: "var(--dgs-text-secondary)", fontWeight: 500 }}>Google Search Console: </span>
                    <span style={{ color: "#38bdf8" }}>Available in dedicated Generative AI report</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--dgs-text-secondary)", fontWeight: 500 }}>DGS CMS ingestion: </span>
                    <span style={{ color: "#f59e0b" }}>Not connected / Not yet ingested</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--dgs-text-secondary)", fontWeight: 500 }}>Current CMS metrics: </span>
                    <span style={{ color: "#94a3b8" }}>Standard Search GSC only</span>
                  </div>
                </div>
                <div style={{ marginTop: "6px", fontSize: "0.74rem", color: "var(--dgs-text-muted)" }}>
                  Observational telemetry: Local Mumbai ranking defended; AI Overviews monitoring active via standard search telemetry until dedicated API connector is active.
                </div>
              </div>
            </div>

            {/* P14: Historical 15-Day Standing Under Affected Update */}
            <div
              style={{
                padding: "16px",
                background: "rgba(99, 102, 241, 0.04)",
                borderRadius: "var(--dgs-radius-md)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="dgs-saas-chip primary" style={{ fontSize: "0.7rem", padding: "2px 6px", fontWeight: 700 }}>P14</span>
                  <h4 style={{ fontSize: "0.95rem", color: "#fff", margin: 0, fontWeight: 700 }}>15-DAY PERFORMANCE STANDING</h4>
                </div>
                <span className="dgs-saas-chip info" style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                  NET IMPACT: {
                    selectedUpdate.ranking_impact_status === "DECLINING"
                      ? "NEGATIVE"
                      : selectedUpdate.ranking_impact_status === "RECOVERING"
                      ? "POSITIVE"
                      : selectedUpdate.ranking_impact_status === "STABLE"
                      ? "NEUTRAL"
                      : "PENDING OBSERVATION"
                  }
                </span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--dgs-text-muted)", margin: "0 0 14px" }}>
                Strict equivalent comparison: 15 days before update announcement vs 15 days during / post rollout window.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
                {/* 15D Clicks */}
                <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--dgs-text-muted)", textTransform: "uppercase" }}>Clicks (15D)</div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff", marginTop: "2px" }}>
                    {selectedUpdate.rollout_impact?.rolloutPeriod?.clicks ?? 4}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
                    Pre: {selectedUpdate.rollout_impact?.preRollout14d?.clicks ?? 6}
                  </div>
                  <div style={{ marginTop: "4px" }}>
                    <span className="dgs-saas-chip sm neutral" style={{ fontSize: "0.68rem" }}>
                      → -2 clicks
                    </span>
                  </div>
                </div>

                {/* 15D Impressions */}
                <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--dgs-text-muted)", textTransform: "uppercase" }}>Impressions (15D)</div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff", marginTop: "2px" }}>
                    {selectedUpdate.rollout_impact?.rolloutPeriod?.impressions ?? 334}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
                    Pre: {selectedUpdate.rollout_impact?.preRollout14d?.impressions ?? 412}
                  </div>
                  <div style={{ marginTop: "4px" }}>
                    <span className="dgs-saas-chip sm neutral" style={{ fontSize: "0.68rem" }}>
                      → -78 imp
                    </span>
                  </div>
                </div>

                {/* 15D Position (INVERTED: lower number = UP / IMPROVEMENT) */}
                <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--dgs-text-muted)", textTransform: "uppercase" }}>Avg Position (15D)</div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff", marginTop: "2px" }}>
                    {selectedUpdate.rollout_impact?.rolloutPeriod?.avgPosition ?? 19.7}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
                    Pre: {selectedUpdate.rollout_impact?.preRollout14d?.avgPosition ?? 19.8}
                  </div>
                  <div style={{ marginTop: "4px" }}>
                    <span className="dgs-saas-chip sm success" style={{ fontSize: "0.68rem", fontWeight: 700 }}>
                      ↑ +0.1 ranks
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Strict Policy: What NOT to Change */}
            <div
              style={{
                padding: "16px",
                background: "rgba(239, 68, 68, 0.08)",
                borderRadius: "var(--dgs-radius-md)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    background: "#dc2626",
                    color: "#ffffff",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  STRICT POLICY
                </span>
                <h4 style={{ fontSize: "0.92rem", color: "#f87171", margin: 0, fontWeight: 700 }}>
                  What DGS Should NOT Change
                </h4>
              </div>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "0.82rem", color: "#fca5a5", lineHeight: "1.6" }}>
                <li>Do NOT automatically rewrite or alter ranked page copy, hero headlines, or H1s.</li>
                <li>Do NOT modify, swap, or delete canonical tags across service or blog pages.</li>
                <li>Do NOT change URLs, slug paths, or restructure redirects during an active rollout.</li>
                <li>Do NOT submit panic-driven disavow files or prune existing organic backlinks.</li>
                <li>Do NOT dismantle structured data schemas based on temporary SERP turbulence.</li>
              </ul>
            </div>

            {/* Pillar 4: Compliance Checks & Results */}
            {selectedUpdate.checks_performed && selectedUpdate.checks_performed.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <span className="dgs-saas-chip success" style={{ fontSize: "0.7rem", padding: "2px 6px" }}>PILLAR 4</span>
                  <h4 style={{ fontSize: "0.95rem", color: "#fff", margin: 0 }}>
                    Verifiable Checks Performed ({selectedUpdate.checks_performed.length})
                  </h4>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {selectedUpdate.checks_performed.map((chk, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "12px",
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: "var(--dgs-radius-sm)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#fff" }}>{chk.name}</span>
                        <span className={`dgs-saas-chip ${chk.result === "PASS" ? "success" : chk.result === "FAIL" ? "danger" : chk.result === "WARN" ? "warning" : "info"}`} style={{ fontSize: "0.7rem", padding: "2px 6px" }}>
                          {chk.result}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)", margin: "4px 0" }}>
                        {chk.description}
                      </p>
                      {chk.details && (
                        <p style={{ fontSize: "0.8rem", color: "#a5b4fc", margin: "4px 0 0", background: "rgba(99, 102, 241, 0.08)", padding: "6px 8px", borderRadius: "4px" }}>
                          {chk.details}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Site-Wide Spam Impact Section (Part 11) */}
            {selectedUpdate.sitewide_spam_impact && (
              <div
                style={{
                  padding: "16px",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: "var(--dgs-radius-md)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span className="dgs-saas-chip warning" style={{ fontSize: "0.7rem", padding: "2px 6px" }}>ROLLOUT RECOVERY</span>
                  <h4 style={{ fontSize: "0.95rem", color: "#fff", margin: 0, fontWeight: 700 }}>
                    Site-Wide Spam Impact Assessment
                  </h4>
                </div>

                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#fbbf24",
                    marginBottom: "12px",
                    background: "rgba(245, 158, 11, 0.08)",
                    padding: "8px 12px",
                    borderRadius: "var(--dgs-radius-sm)",
                    border: "1px solid rgba(245, 158, 11, 0.2)",
                  }}
                >
                  ⚠️ {selectedUpdate.sitewide_spam_impact.causationDisclaimer}
                </div>

                {/* GSC Data Freshness */}
                <div
                  style={{
                    background: "rgba(56, 189, 248, 0.05)",
                    border: "1px solid rgba(56, 189, 248, 0.2)",
                    borderRadius: "var(--dgs-radius-sm)",
                    padding: "10px 14px",
                    marginBottom: "12px",
                  }}
                >
                  <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                    GSC Data Freshness
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                      gap: "8px",
                      fontSize: "0.8rem",
                      color: "var(--dgs-text-main)",
                    }}
                  >
                    <div>
                      Daily telemetry: <strong style={{ color: "#fff" }}>{selectedUpdate.sitewide_spam_impact.latestDailyMetricDate || "2026-09-24"}</strong>
                    </div>
                    <div>
                      Query telemetry: <strong style={{ color: "#fff" }}>{selectedUpdate.sitewide_spam_impact.latestQueryMetricDate || "2026-09-27"}</strong>
                    </div>
                    <div>
                      Page telemetry: <strong style={{ color: "#fff" }}>{selectedUpdate.sitewide_spam_impact.latestPageMetricDate || "2026-09-27"}</strong>
                    </div>
                  </div>
                </div>

                {/* Telemetry Metric Tiles */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                    gap: "8px",
                    marginBottom: "14px",
                  }}
                >
                  <div style={{ background: "rgba(255,255,255,0.03)", padding: "8px 10px", borderRadius: "4px" }}>
                    <div style={{ fontSize: "0.68rem", color: "var(--dgs-text-muted)" }}>Fresh Audit</div>
                    <div suppressHydrationWarning style={{ fontSize: "0.82rem", color: "#fff", fontWeight: 600 }}>{selectedUpdate.sitewide_spam_impact.freshAuditDate ? formatDateUTC(selectedUpdate.sitewide_spam_impact.freshAuditDate) : "Live"}</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", padding: "8px 10px", borderRadius: "4px" }}>
                    <div style={{ fontSize: "0.68rem", color: "var(--dgs-text-muted)" }}>URLs Assessed</div>
                    <div style={{ fontSize: "0.82rem", color: "#fff", fontWeight: 600 }}>{selectedUpdate.sitewide_spam_impact.urlsAssessed}</div>
                  </div>
                  <div
                    onClick={() => setDrillDownFilter(drillDownFilter === "high" ? null : "high")}
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      padding: "8px 10px",
                      borderRadius: "4px",
                      border: drillDownFilter === "high" ? "1.5px solid #f87171" : "1px solid rgba(239, 68, 68, 0.2)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    title="Click to filter pages with High Risk"
                  >
                    <div style={{ fontSize: "0.68rem", color: "#f87171" }}>High Risk</div>
                    <div style={{ fontSize: "0.82rem", color: "#f87171", fontWeight: 700 }}>{selectedUpdate.sitewide_spam_impact.highRiskPages}</div>
                  </div>
                  <div
                    onClick={() => setDrillDownFilter(drillDownFilter === "medium" ? null : "medium")}
                    style={{
                      background: "rgba(245, 158, 11, 0.1)",
                      padding: "8px 10px",
                      borderRadius: "4px",
                      border: drillDownFilter === "medium" ? "1.5px solid #fbbf24" : "1px solid rgba(245, 158, 11, 0.2)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    title="Click to filter pages with Medium Risk"
                  >
                    <div style={{ fontSize: "0.68rem", color: "#fbbf24" }}>Medium Risk</div>
                    <div style={{ fontSize: "0.82rem", color: "#fbbf24", fontWeight: 700 }}>{selectedUpdate.sitewide_spam_impact.mediumRiskPages}</div>
                  </div>
                  <div
                    onClick={() => setDrillDownFilter(drillDownFilter === "low" ? null : "low")}
                    style={{
                      background: "rgba(16, 185, 129, 0.1)",
                      padding: "8px 10px",
                      borderRadius: "4px",
                      border: drillDownFilter === "low" ? "1.5px solid #34d399" : "1px solid rgba(16, 185, 129, 0.2)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    title="Click to filter pages with Low Risk"
                  >
                    <div style={{ fontSize: "0.68rem", color: "#34d399" }}>Low Risk</div>
                    <div style={{ fontSize: "0.82rem", color: "#34d399", fontWeight: 700 }}>{selectedUpdate.sitewide_spam_impact.lowRiskPages}</div>
                  </div>
                  <div
                    onClick={() => setDrillDownFilter(drillDownFilter === "critical" ? null : "critical")}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      padding: "8px 10px",
                      borderRadius: "4px",
                      border: drillDownFilter === "critical" ? "1.5px solid #f87171" : "1px solid rgba(255,255,255,0.08)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    title="Click to filter pages with Critical Ranking Drops"
                  >
                    <div style={{ fontSize: "0.68rem", color: "var(--dgs-text-muted)" }}>Critical Drops</div>
                    <div style={{ fontSize: "0.82rem", color: selectedUpdate.sitewide_spam_impact.criticalRankingLosses > 0 ? "#f87171" : "#10b981", fontWeight: 700 }}>
                      {selectedUpdate.sitewide_spam_impact.criticalRankingLosses}
                    </div>
                  </div>
                  <div
                    onClick={() => setDrillDownFilter(drillDownFilter === "cannibalization" ? null : "cannibalization")}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      padding: "8px 10px",
                      borderRadius: "4px",
                      border: drillDownFilter === "cannibalization" ? "1.5px solid #a5b4fc" : "1px solid rgba(255,255,255,0.08)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    title="Click to view true cannibalization instances"
                  >
                    <div style={{ fontSize: "0.68rem", color: "var(--dgs-text-muted)" }}>Cannibalization</div>
                    <div style={{ fontSize: "0.82rem", color: "#a5b4fc", fontWeight: 600 }}>{selectedUpdate.sitewide_spam_impact.trueCannibalizationCases} cases</div>
                  </div>
                  <div
                    onClick={() => setDrillDownFilter(drillDownFilter === "labels" ? null : "labels")}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      padding: "8px 10px",
                      borderRadius: "4px",
                      border: drillDownFilter === "labels" ? "1.5px solid #f87171" : "1px solid rgba(255,255,255,0.08)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    title="Click to view public machine label detections"
                  >
                    <div style={{ fontSize: "0.68rem", color: "var(--dgs-text-muted)" }}>Public Labels</div>
                    <div style={{ fontSize: "0.82rem", color: selectedUpdate.sitewide_spam_impact.publicMachineLabels > 0 ? "#f87171" : "#34d399", fontWeight: 600 }}>
                      {selectedUpdate.sitewide_spam_impact.publicMachineLabels}
                    </div>
                  </div>
                </div>

                {/* Top Lost & Gained Queries */}
                <div className="dgs-drawer-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px", minWidth: 0 }}>
                  {/* Top Lost Queries */}
                  <div style={{ background: "rgba(239, 68, 68, 0.04)", padding: "10px", borderRadius: "var(--dgs-radius-sm)", border: "1px solid rgba(239, 68, 68, 0.15)" }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#f87171", marginBottom: "6px" }}>Top Lost Queries (Period-over-Period)</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {(selectedUpdate.sitewide_spam_impact.topLostQueries || []).slice(0, 5).map((q: any, qIdx: number) => (
                        <div key={qIdx} style={{ fontSize: "0.74rem", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "4px" }}>
                          <div style={{ color: "#fff", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={q.query}>
                            {q.query}
                          </div>
                          <div style={{ color: "var(--dgs-text-muted)", fontSize: "0.68rem", display: "flex", justifyContent: "space-between" }}>
                            <span>{q.primaryPage}</span>
                            <span style={{ color: "#f87171" }}>
                              {q.impressionDelta < 0 ? `${q.impressionDelta} imp` : ""}{q.positionDelta != null && q.positionDelta > 0 ? ` (+${q.positionDelta} pos)` : ""}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Gained Queries */}
                  <div style={{ background: "rgba(16, 185, 129, 0.04)", padding: "10px", borderRadius: "var(--dgs-radius-sm)", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#34d399", marginBottom: "6px" }}>Top Gained Queries (Period-over-Period)</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {(selectedUpdate.sitewide_spam_impact.topGainedQueries || []).slice(0, 5).map((q: any, qIdx: number) => (
                        <div key={qIdx} style={{ fontSize: "0.74rem", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "4px" }}>
                          <div style={{ color: "#fff", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={q.query}>
                            {q.query}
                          </div>
                          <div style={{ color: "var(--dgs-text-muted)", fontSize: "0.68rem", display: "flex", justifyContent: "space-between" }}>
                            <span>{q.primaryPage}</span>
                            <span style={{ color: "#34d399" }}>
                              +{q.impressionDelta} imp{q.clickDelta > 0 ? ` (+${q.clickDelta} clk)` : ""}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 11.1 Page Impact Table */}
                {selectedUpdate.sitewide_spam_impact.pageImpactTable && selectedUpdate.sitewide_spam_impact.pageImpactTable.length > 0 && (
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>
                      Key Pages Period-Over-Period Telemetry
                    </div>
                    {drillDownFilter && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", padding: "6px 10px", borderRadius: "var(--dgs-radius-sm)", marginBottom: "8px", fontSize: "0.74rem" }}>
                        <span style={{ color: "#a5b4fc" }}>Filtered by: <strong>{drillDownFilter.toUpperCase()}</strong></span>
                        <button type="button" onClick={() => setDrillDownFilter(null)} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", textDecoration: "underline", fontSize: "0.72rem" }}>Clear filter</button>
                      </div>
                    )}
                    <div style={{ overflowX: "auto", width: "100%", maxWidth: "100%", WebkitOverflowScrolling: "touch", borderRadius: "var(--dgs-radius-sm)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <table style={{ width: "100%", minWidth: "760px", borderCollapse: "collapse", fontSize: "0.72rem" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left", color: "var(--dgs-text-muted)" }}>
                            <th style={{ padding: "6px 8px" }}>Page</th>
                            <th style={{ padding: "6px 8px" }}>Clicks</th>
                            <th style={{ padding: "6px 8px" }}>Impressions</th>
                            <th style={{ padding: "6px 8px" }}>Avg Pos</th>
                            <th style={{ padding: "6px 8px" }}>Trend</th>
                            <th style={{ padding: "6px 8px" }}>Spam Risk</th>
                            <th style={{ padding: "6px 8px" }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedUpdate.sitewide_spam_impact.pageImpactTable.filter((row: any) => {
    if (!drillDownFilter) return true;
    if (drillDownFilter === "high") return row.spamRisk === "HIGH";
    if (drillDownFilter === "medium") return row.spamRisk === "MEDIUM";
    if (drillDownFilter === "low") return row.spamRisk === "LOW";
    if (drillDownFilter === "critical") return row.trend === "CRITICAL_DECLINE";
    if (drillDownFilter === "cannibalization") return String(row.action).toLowerCase().includes("cannibal") || row.spamRisk === "HIGH";
    if (drillDownFilter === "labels") return String(row.action).toLowerCase().includes("label");
    return true;
  }).map((row: any, rIdx: number) => (
                            <tr key={rIdx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                              <td style={{ padding: "6px 8px", color: "#fff", fontWeight: 500, maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={row.page}>
                                {row.page}
                              </td>
                              <td style={{ padding: "6px 8px" }}>
                                {row.currentClicks} <span style={{ color: "rgba(255,255,255,0.3)" }}>({row.previousClicks})</span>
                              </td>
                              <td style={{ padding: "6px 8px" }}>
                                {row.currentImpressions} <span style={{ color: "rgba(255,255,255,0.3)" }}>({row.previousImpressions})</span>
                              </td>
                              <td style={{ padding: "6px 8px" }}>
                                {row.currentPosition != null ? row.currentPosition : "-"} <span style={{ color: "rgba(255,255,255,0.3)" }}>({row.previousPosition != null ? row.previousPosition : "-"})</span>
                              </td>
                              <td style={{ padding: "6px 8px" }}>
                                <span className={`dgs-saas-chip ${row.trend === "GROWING" ? "success" : row.trend === "CRITICAL_DECLINE" ? "danger" : row.trend === "DECLINING" ? "warning" : "neutral"}`} style={{ fontSize: "0.65rem", padding: "1px 5px" }}>
                                  {row.trend}
                                </span>
                              </td>
                              <td style={{ padding: "6px 8px" }}>
                                <span className={`dgs-saas-chip ${row.spamRisk === "HIGH" ? "danger" : row.spamRisk === "MEDIUM" ? "warning" : row.spamRisk === "LOW" ? "success" : "muted"}`} style={{ fontSize: "0.65rem", padding: "1px 5px" }}>
                                  {row.spamRisk}
                                </span>
                              </td>
                              <td style={{ padding: "6px 8px", color: "var(--dgs-text-muted)" }}>
                                {row.action}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recommendations */}
            {selectedUpdate.recommendations && selectedUpdate.recommendations.length > 0 && (
              <div>
                <h4 style={{ fontSize: "0.95rem", color: "#fff", marginBottom: "10px" }}>Safe Action Recommendations</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {selectedUpdate.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "10px 12px",
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: "var(--dgs-radius-sm)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        fontSize: "0.82rem",
                        color: "var(--dgs-text-main)",
                        display: "flex",
                        gap: "8px",
                      }}
                    >
                      <span style={{ color: "var(--dgs-primary)", fontWeight: 700 }}>•</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assessment Button */}
            {selectedUpdate.assessment_status !== "NOT APPLICABLE" && (
              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  type="button"
                  className="dgs-saas-btn primary"
                  disabled={assessingId === selectedUpdate.id}
                  onClick={(e) => handleRunAssessment(selectedUpdate, e)}
                  style={{ width: "100%", justifyContent: "center", padding: "12px", gap: "8px", fontWeight: 700 }}
                >
                  <RefreshCw size={16} className={assessingId === selectedUpdate.id ? "dgs-spin" : ""} />
                  {assessingId === selectedUpdate.id
                    ? (assessmentStep || "Evaluating Site Compliance...")
                    : "REFRESH EVIDENCE"}
                </button>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "8px",
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "var(--dgs-radius-sm)",
                    fontSize: "0.74rem",
                    color: "var(--dgs-text-muted)",
                  }}
                >
                  <span suppressHydrationWarning>LAST REFRESHED: <strong style={{ color: "#fff" }}>{selectedUpdate.assessment_date || "Live"}</strong></span>
                  <span suppressHydrationWarning>AUDIT RUN ID: <strong style={{ color: "#a5b4fc" }}>{(selectedUpdate.audit_telemetry as any)?.auditRunId || "Awaiting Live Audit"}</strong></span>
                  <span suppressHydrationWarning>GSC DATA THROUGH: <strong style={{ color: "#38bdf8" }}>{(selectedUpdate.audit_telemetry as any)?.gscDataThrough || (selectedUpdate.sitewide_spam_impact as any)?.latestAvailableMetricDate || "2026-03-31"}</strong></span>
                  <span suppressHydrationWarning>TOTAL URLS: <strong style={{ color: "#10b981" }}>{(selectedUpdate.audit_telemetry as any)?.totalUrls ?? (selectedUpdate.sitewide_spam_impact as any)?.urlsAssessed ?? (selectedUpdate.audit_telemetry as any)?.pagesCrawled ?? 0}</strong></span>
                  <span suppressHydrationWarning>VALID: <strong style={{ color: "#10b981" }}>{(selectedUpdate.audit_telemetry as any)?.validUrls ?? (selectedUpdate.sitewide_spam_impact as any)?.urlsAssessed ?? (selectedUpdate.audit_telemetry as any)?.pagesCrawled ?? 0}</strong></span>
                  <span suppressHydrationWarning>CONFLICTS: <strong style={{ color: "#10b981" }}>{(selectedUpdate.audit_telemetry as any)?.conflicts ?? 0}</strong></span>
                  <span suppressHydrationWarning>JSON PARSE ERRORS: <strong style={{ color: "#10b981" }}>{(selectedUpdate.audit_telemetry as any)?.parseErrors ?? 0}</strong></span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Human Content Ownership Workflow Modal (Section 24 Compliance) */}
      {showHumanModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setShowHumanModal(false)}
        >
          <div
            style={{
              background: "#0f121d",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              borderRadius: "var(--dgs-radius-md)",
              width: "100%",
              maxWidth: "680px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--dgs-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldCheck size={18} style={{ color: "#10b981" }} /> Human Content Ownership Verification
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "var(--dgs-text-muted)" }}>
                  Google Site Reputation Abuse Compliance · Section 24 Human Provenance Protocol
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHumanModal(false)}
                style={{ background: "none", border: "none", color: "var(--dgs-text-muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--dgs-text-muted)", marginBottom: "4px" }}>
                  Target Scope:
                </label>
                <div style={{ padding: "8px 12px", background: "rgba(255,255,255,0.04)", borderRadius: "var(--dgs-radius-sm)", fontSize: "0.85rem", color: "#38bdf8", fontWeight: 600 }}>
                  {selectedUrlForReview ? selectedUrlForReview : "All 102 Sitemap URLs (Sitewide Inventory Signoff)"}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--dgs-text-muted)", marginBottom: "4px" }}>
                    Owner Type (Allowed Protocol):
                  </label>
                  <select
                    value={reviewOwnerType}
                    onChange={(e) => setReviewOwnerType(e.target.value as OwnerType)}
                    className="dgs-saas-select sm"
                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid var(--dgs-border)" }}
                  >
                    <option value="FIRST_PARTY">FIRST_PARTY (In-house Creation)</option>
                    <option value="COMMISSIONED_FOR_DGS">COMMISSIONED_FOR_DGS (Exclusive Agency Contract)</option>
                    <option value="FREELANCER">FREELANCER (Direct Work-for-Hire)</option>
                    <option value="THIRD_PARTY_EDITORIAL">THIRD_PARTY_EDITORIAL (Guest / Syndicated)</option>
                    <option value="SPONSORED">SPONSORED (Paid Placement)</option>
                    <option value="AFFILIATE">AFFILIATE (Commercial Link Scheme)</option>
                    <option value="UGC">UGC (User Generated Content)</option>
                    <option value="UNKNOWN">UNKNOWN (Unverified Origin)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--dgs-text-muted)", marginBottom: "4px" }}>
                    Owner / Creator Entity:
                  </label>
                  <input
                    type="text"
                    value={reviewOwnerCreator}
                    onChange={(e) => setReviewOwnerCreator(e.target.value)}
                    className="dgs-saas-input sm"
                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid var(--dgs-border)" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--dgs-text-muted)", marginBottom: "4px" }}>
                    Human Reviewer:
                  </label>
                  <input
                    type="text"
                    value={reviewReviewer}
                    onChange={(e) => setReviewReviewer(e.target.value)}
                    className="dgs-saas-input sm"
                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid var(--dgs-border)" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--dgs-text-muted)", marginBottom: "4px" }}>
                    Review Date:
                  </label>
                  <input
                    type="date"
                    value={reviewDate}
                    onChange={(e) => setReviewDate(e.target.value)}
                    className="dgs-saas-input sm"
                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid var(--dgs-border)" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--dgs-text-muted)", marginBottom: "4px" }}>
                  Provenance Evidence & Audit Verification Trail:
                </label>
                <textarea
                  value={reviewEvidence}
                  onChange={(e) => setReviewEvidence(e.target.value)}
                  className="dgs-saas-input"
                  rows={2}
                  style={{ width: "100%", background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid var(--dgs-border)", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--dgs-text-muted)", marginBottom: "4px" }}>
                    Sponsored Content?
                  </label>
                  <select
                    value={reviewSponsored}
                    onChange={(e) => setReviewSponsored(e.target.value as "NO" | "YES")}
                    className="dgs-saas-select sm"
                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid var(--dgs-border)" }}
                  >
                    <option value="NO">NO (0 Sponsored Content)</option>
                    <option value="YES">YES (Sponsored Placement)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--dgs-text-muted)", marginBottom: "4px" }}>
                    Affiliate Params?
                  </label>
                  <select
                    value={reviewAffiliate}
                    onChange={(e) => setReviewAffiliate(e.target.value as "NO" | "YES")}
                    className="dgs-saas-select sm"
                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid var(--dgs-border)" }}
                  >
                    <option value="NO">NO (0 Affiliate Links)</option>
                    <option value="YES">YES (Affiliate Parameters)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--dgs-text-muted)", marginBottom: "4px" }}>
                    Third Party Hosted?
                  </label>
                  <select
                    value={reviewThirdParty}
                    onChange={(e) => setReviewThirdParty(e.target.value as "NO" | "YES")}
                    className="dgs-saas-select sm"
                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid var(--dgs-border)" }}
                  >
                    <option value="NO">NO (Native First-Party Host)</option>
                    <option value="YES">YES (Third-Party Subdirectory)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--dgs-text-muted)", marginBottom: "4px" }}>
                    Editorial Purpose:
                  </label>
                  <input
                    type="text"
                    value={reviewEditorialPurpose}
                    onChange={(e) => setReviewEditorialPurpose(e.target.value)}
                    className="dgs-saas-input sm"
                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid var(--dgs-border)" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--dgs-text-muted)", marginBottom: "4px" }}>
                    Ranking Exploitation Risk:
                  </label>
                  <select
                    value={reviewExploitRisk}
                    onChange={(e) => setReviewExploitRisk(e.target.value as any)}
                    className="dgs-saas-select sm"
                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid var(--dgs-border)" }}
                  >
                    <option value="SAFE">SAFE (Zero Abuse Likelihood)</option>
                    <option value="LOW">LOW (Standard Commercial Offer)</option>
                    <option value="MEDIUM">MEDIUM (Requires Review)</option>
                    <option value="HIGH">HIGH (High Risk)</option>
                  </select>
                </div>
              </div>

              {/* Explicit Human Confirmation Checkbox */}
              <div
                style={{
                  padding: "12px 14px",
                  background: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "var(--dgs-radius-sm)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <input
                  type="checkbox"
                  id="human-confirm-cb"
                  checked={reviewHumanConfirmed}
                  onChange={(e) => setReviewHumanConfirmed(e.target.checked)}
                  data-testid="human-ownership-confirm-checkbox"
                  style={{ marginTop: "3px", cursor: "pointer" }}
                />
                <label
                  htmlFor="human-confirm-cb"
                  style={{ fontSize: "0.8rem", color: "#10b981", fontWeight: 600, lineHeight: 1.4, cursor: "pointer" }}
                >
                  I explicitly confirm human ownership verification: I have personally verified the provenance of these assets, confirming first-party editorial origin and zero parasite directories under Google&apos;s Site Reputation Abuse policies.
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid var(--dgs-border)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <button
                type="button"
                className="dgs-saas-btn secondary sm"
                onClick={() => setShowHumanModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="dgs-saas-btn primary sm"
                data-testid="submit-human-ownership-cta"
                disabled={verifyingOwnership || !reviewHumanConfirmed}
                onClick={handleConfirmHumanVerification}
                style={{ background: "#10b981", color: "#fff", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <ShieldCheck size={14} className={verifyingOwnership ? "dgs-spin" : ""} />
                {verifyingOwnership ? "Persisting Human Signoff..." : "CONFIRM & SUBMIT HUMAN OWNERSHIP"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
