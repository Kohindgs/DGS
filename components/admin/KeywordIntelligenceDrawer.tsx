"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  type KeywordClassification,
  type KeywordRecommendation,
  type RankingTrend,
  type KeywordActionOption,
  generateKeywordRecommendation,
  calculateRankingTrend,
} from "@/lib/seo/keyword-engine";

export type KeywordDrawerData = {
  id?: string;
  query: string;
  pageUrl: string;
  position: number | null;
  prevPosition?: number | null;
  clicks: number;
  impressions: number;
  ctr: number;
  keywordGroup?: string | null;
  isCannibalized?: boolean;
  competingPages?: Array<{
    pageUrl: string;
    clicks: number;
    impressions: number;
    position: number;
  }>;
  mobilePsi?: number | null;
  desktopPsi?: number | null;
  issuesCount?: number;
};

type Props = {
  data: KeywordDrawerData | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenPageSeo?: (url: string) => void;
  onTargetKeywordAdded?: () => void;
};

export default function KeywordIntelligenceDrawer({
  data,
  isOpen,
  onClose,
  onOpenPageSeo,
  onTargetKeywordAdded,
}: Props) {
  const [savingTarget, setSavingTarget] = useState(false);
  const [targetAdded, setTargetAdded] = useState(false);
  const [creatingDraft, setCreatingDraft] = useState<string | null>(null);
  const [createdDraftId, setCreatedDraftId] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  if (!isOpen || !data) return null;

  const safeQuery = data.query || "target topic";
  const safePageUrl = data.pageUrl || "/";

  const trend: RankingTrend = calculateRankingTrend(data.position, data.prevPosition);
  const recommendation: KeywordRecommendation = generateKeywordRecommendation({
    query: safeQuery,
    pageUrl: safePageUrl,
    position: data.position,
    prevPosition: data.prevPosition,
    clicks: data.clicks || 0,
    impressions: data.impressions || 0,
    ctr: data.ctr || 0,
    isCannibalized: Boolean(data.isCannibalized),
    competingPages: (data.competingPages || []).map((cp) => cp.pageUrl),
    mobilePsi: data.mobilePsi,
    issuesCount: data.issuesCount,
  });

  const getClassificationBadge = (cls: KeywordClassification) => {
    switch (cls) {
      case "PROTECT":
        return <span className="dgs-saas-chip success">PROTECT</span>;
      case "GROW":
        return <span className="dgs-saas-chip primary">GROW</span>;
      case "RECOVER":
        return <span className="dgs-saas-chip danger">RECOVER</span>;
      case "CANNIBALIZATION RISK":
        return <span className="dgs-saas-chip warning">CANNIBALIZATION RISK</span>;
      case "NEW OPPORTUNITY":
        return <span className="dgs-saas-chip primary">NEW OPPORTUNITY</span>;
      case "LOW SIGNAL":
        return <span className="dgs-saas-chip neutral">LOW SIGNAL</span>;
      case "NOT DETECTED":
      default:
        return <span className="dgs-saas-chip neutral">NOT DETECTED</span>;
    }
  };

  const handleAddAsTarget = async () => {
    setSavingTarget(true);
    setFeedbackError(null);
    try {
      const res = await fetch("/api/admin/seo/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          pageUrl: safePageUrl,
          keyword: safeQuery,
        }),
      });
      const resData = await res.json();
      if (resData.ok) {
        setTargetAdded(true);
        if (onTargetKeywordAdded) onTargetKeywordAdded();
      } else {
        setFeedbackError(resData.error || "Failed to add target keyword.");
      }
    } catch (err: any) {
      console.error("Failed to add target keyword:", err);
      setFeedbackError(err?.message || "Failed to add target keyword.");
    } finally {
      setSavingTarget(false);
    }
  };

  const handleCreateDraft = async (action: KeywordActionOption) => {
    setCreatingDraft(action.id);
    setFeedbackError(null);

    try {
      const res = await fetch("/api/admin/seo/change-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_type: "KEYWORD_STRATEGY",
          page_url: safePageUrl,
          keyword: safeQuery,
          change_type: action.changeType,
          risk_level: action.riskLevel,
          reason: `Strategy: ${recommendation.classification}. ${recommendation.whyThisMatters}`,
          evidence: {
            currentPosition: data.position,
            previousPosition: data.prevPosition,
            clicks: data.clicks,
            impressions: data.impressions,
            ctr: data.ctr,
            mobilePsi: data.mobilePsi,
            classification: recommendation.classification,
          },
          implementation_plan: recommendation.implementationPlan,
          proposed_state: {
            actionLabel: action.label,
            actionDescription: action.description,
            suggestedAnchors: recommendation.suggestedAnchors,
            contentGaps: recommendation.contentGaps,
          },
        }),
      });

      const resData = await res.json();
      if (resData.ok && resData.id) {
        setCreatedDraftId(resData.id);
      } else {
        setFeedbackError(resData.error || "Failed to persist change request draft.");
      }
    } catch (err: any) {
      console.error("Failed to create change request draft:", err);
      setFeedbackError(err?.message || "Network error while saving draft.");
    } finally {
      setCreatingDraft(null);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          height: "100%",
          backgroundColor: "#0d1117",
          borderLeft: "1px solid rgba(255, 255, 255, 0.12)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-12px 0 36px rgba(0,0,0,0.8)",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            background: "rgba(255, 255, 255, 0.02)",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
              {getClassificationBadge(recommendation.classification)}
              <span className="dgs-saas-chip neutral" style={{ fontSize: "0.68rem" }}>
                GSC Data
              </span>
              <span className="dgs-saas-chip neutral" style={{ fontSize: "0.68rem" }}>
                DGS Recommendation Engine
              </span>
              {data.keywordGroup && (
                <span className="dgs-saas-chip primary" style={{ fontSize: "0.68rem" }}>
                  Target: {data.keywordGroup}
                </span>
              )}
            </div>
            <h3 style={{ margin: "4px 0", color: "#fff", fontSize: "1.25rem", fontWeight: 700 }}>
              &ldquo;{safeQuery}&rdquo;
            </h3>
            <div style={{ fontSize: "0.8rem", color: "var(--dgs-text-muted)" }}>
              Ranking URL:{" "}
              <a
                href={safePageUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--dgs-primary)", textDecoration: "none" }}
              >
                {safePageUrl.replace(/^https?:\/\/[^/]+/i, "") || "/"} &nearr;
              </a>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="dgs-saas-btn secondary sm"
            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
          >
            ✕ Close
          </button>
        </div>

        {/* Feedback / Error banner */}
        {feedbackError && (
          <div
            style={{
              padding: "10px 16px",
              background: "rgba(239, 68, 68, 0.1)",
              borderBottom: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              fontSize: "0.82rem",
            }}
          >
            ⚠ {feedbackError}
          </div>
        )}

        {/* Drawer Content */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Key Metrics Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
            }}
          >
            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "14px",
              }}
            >
              <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)", textTransform: "uppercase" }}>
                GSC Avg. Position
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fff", margin: "4px 0" }}>
                {data.position != null && data.position > 0 ? Number(data.position).toFixed(1) : "—"}
              </div>
              <div style={{ fontSize: "0.74rem" }}>
                <span className={`dgs-saas-chip ${trend.badgeClass}`} style={{ fontSize: "0.68rem" }}>
                  {trend.changeText}
                </span>
              </div>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "14px",
              }}
            >
              <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)", textTransform: "uppercase" }}>
                Impressions
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fff", margin: "4px 0" }}>
                {(data.impressions || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>
                CTR: {((data.ctr || 0) * 100).toFixed(1)}%
              </div>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "14px",
              }}
            >
              <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)", textTransform: "uppercase" }}>
                Organic Clicks
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fff", margin: "4px 0" }}>
                {(data.clicks || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>
                28-day Search Console
              </div>
            </div>
          </div>

          {/* Strategic Recommendation Card */}
          <div
            style={{
              background: "rgba(0, 229, 255, 0.03)",
              border: "1px solid rgba(0, 229, 255, 0.2)",
              borderRadius: "8px",
              padding: "18px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h4 style={{ margin: 0, color: "var(--dgs-primary)", fontSize: "0.95rem" }}>
                Strategy: {recommendation.classification}
              </h4>
              <div style={{ display: "flex", gap: "6px" }}>
                <span className="dgs-saas-chip neutral" style={{ fontSize: "0.68rem" }}>
                  Risk: {recommendation.riskLevel}
                </span>
                <span className="dgs-saas-chip neutral" style={{ fontSize: "0.68rem" }}>
                  Superadmin Gate: {recommendation.riskLevel === "HIGH" || recommendation.riskLevel === "CRITICAL" ? "YES" : "NO"}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--dgs-text-muted)", fontWeight: 600 }}>
                Why This Matters
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#e2e8f0", lineHeight: 1.5 }}>
                {recommendation.whyThisMatters}
              </p>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--dgs-text-muted)", fontWeight: 600 }}>
                Recommended Actions
              </div>
              <ul style={{ margin: "6px 0 0", paddingLeft: "18px", fontSize: "0.82rem", color: "#cbd5e1", lineHeight: 1.6 }}>
                {recommendation.recommendedActions.map((act, idx) => (
                  <li key={idx}>{act}</li>
                ))}
              </ul>
            </div>

            <div>
              <div style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--dgs-text-muted)", fontWeight: 600 }}>
                Implementation Plan
              </div>
              <ol style={{ margin: "6px 0 0", paddingLeft: "18px", fontSize: "0.82rem", color: "#cbd5e1", lineHeight: 1.6 }}>
                {recommendation.implementationPlan.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          </div>

          {/* Action Options Grid (Real SEO Approval Draft Creators) */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff" }}>
                Execute Strategy &rarr; Create Approval Draft
              </div>
              <span className="dgs-saas-chip neutral" style={{ fontSize: "0.68rem" }}>
                DGS CMS Approval Workflow
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {recommendation.actionOptions.map((opt) => {
                const isThisLoading = creatingDraft === opt.id;
                return (
                  <div
                    key={opt.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "rgba(255, 255, 255, 0.02)",
                      padding: "10px 14px",
                      borderRadius: "6px",
                      gap: "12px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "#fff" }}>
                          {opt.label}
                        </span>
                        <span
                          className={`dgs-saas-chip ${
                            opt.riskLevel === "SAFE"
                              ? "success"
                              : opt.riskLevel === "MODERATE"
                              ? "primary"
                              : "warning"
                          }`}
                          style={{ fontSize: "0.65rem" }}
                        >
                          {opt.riskLevel}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
                        {opt.description}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="dgs-saas-btn primary sm"
                      onClick={() => handleCreateDraft(opt)}
                      disabled={Boolean(creatingDraft)}
                      style={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}
                    >
                      {isThisLoading ? "Saving Draft..." : `+ Draft Proposal`}
                    </button>
                  </div>
                );
              })}
            </div>

            {createdDraftId && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "10px 14px",
                  background: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "0.82rem", color: "#34d399", fontWeight: 600 }}>
                  ✓ DRAFT #{createdDraftId} Persisted in CMS
                </span>
                <Link
                  href="/admin/seo/approvals/"
                  style={{
                    color: "var(--dgs-primary)",
                    fontSize: "0.8rem",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Open in SEO Approvals &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Cannibalization Warning if applicable */}
          {data.competingPages && data.competingPages.length > 1 && (
            <div
              style={{
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <h5 style={{ margin: "0 0 8px 0", color: "#f59e0b", fontSize: "0.9rem" }}>
                ⚠ Competing DGS URLs ({data.competingPages.length} pages)
              </h5>
              <p style={{ margin: "0 0 10px 0", fontSize: "0.78rem", color: "#e2e8f0" }}>
                Google is returning multiple URLs for this query. Align internal links to point directly to the preferred target.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {data.competingPages.map((cp, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.78rem",
                      background: "rgba(0,0,0,0.2)",
                      padding: "6px 10px",
                      borderRadius: "4px",
                    }}
                  >
                    <span style={{ color: "var(--dgs-primary)" }}>{cp.pageUrl.replace(/^https?:\/\/[^/]+/i, "")}</span>
                    <span style={{ color: "var(--dgs-text-muted)" }}>
                      Pos: {cp.position ? Number(cp.position).toFixed(1) : "—"} · Clicks: {cp.clicks} · Imp: {(cp.impressions || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Internal Links & Content Gaps (Attributed: AI Recommendation) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "14px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ fontSize: "0.76rem", fontWeight: 600, color: "#fff" }}>
                  Recommended Anchor Texts
                </div>
                <span className="dgs-saas-chip neutral" style={{ fontSize: "0.62rem" }}>
                  AI Recommendation
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {recommendation.suggestedAnchors.map((anc, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      fontSize: "0.72rem",
                      color: "#94a3b8",
                    }}
                  >
                    &ldquo;{anc}&rdquo;
                  </span>
                ))}
              </div>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "14px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ fontSize: "0.76rem", fontWeight: 600, color: "#fff" }}>
                  Target Content Expansions
                </div>
                <span className="dgs-saas-chip neutral" style={{ fontSize: "0.62rem" }}>
                  AI Recommendation
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "0.74rem", color: "#94a3b8", lineHeight: 1.5 }}>
                {recommendation.contentGaps.map((gap, idx) => (
                  <li key={idx}>{gap}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Technical & Speed Context */}
          {(data.mobilePsi != null || data.issuesCount !== undefined) && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#fff" }}>
                  Ranking Page Technical Health
                </div>
                <div style={{ fontSize: "0.74rem", color: "var(--dgs-text-muted)" }}>
                  Mobile Speed: {data.mobilePsi != null ? `${data.mobilePsi}/100` : "Unmeasured"} · Audit Issues: {data.issuesCount ?? 0}
                </div>
              </div>
              {onOpenPageSeo && (
                <button
                  type="button"
                  className="dgs-saas-btn secondary sm"
                  onClick={() => onOpenPageSeo(safePageUrl)}
                  style={{ fontSize: "0.75rem" }}
                >
                  Open Page SEO &rarr;
                </button>
              )}
            </div>
          )}

          {/* Action Toolbar */}
          <div
            style={{
              paddingTop: "8px",
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <a
              href={safePageUrl}
              target="_blank"
              rel="noreferrer"
              className="dgs-saas-btn secondary sm"
              style={{ textDecoration: "none", fontSize: "0.8rem" }}
            >
              Open Live Page &nearr;
            </a>

            {onOpenPageSeo && (
              <button
                type="button"
                className="dgs-saas-btn secondary sm"
                onClick={() => onOpenPageSeo(safePageUrl)}
                style={{ fontSize: "0.8rem" }}
              >
                Inspect Page SEO
              </button>
            )}

            {!data.keywordGroup && !targetAdded && (
              <button
                type="button"
                className="dgs-saas-btn primary sm"
                onClick={handleAddAsTarget}
                disabled={savingTarget}
                style={{ fontSize: "0.8rem" }}
              >
                {savingTarget ? "Adding..." : "+ Target as Core Keyword"}
              </button>
            )}

            {targetAdded && (
              <span className="dgs-saas-chip success" style={{ fontSize: "0.75rem" }}>
                ✓ Added to Target Keywords
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
