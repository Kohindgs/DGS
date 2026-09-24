"use client";

import React, { useState } from "react";
import {
  type KeywordClassification,
  type KeywordRecommendation,
  type RankingTrend,
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
  const [fixDraftCreated, setFixDraftCreated] = useState(false);

  if (!isOpen || !data) return null;

  const trend: RankingTrend = calculateRankingTrend(data.position, data.prevPosition);
  const recommendation: KeywordRecommendation = generateKeywordRecommendation({
    query: data.query,
    pageUrl: data.pageUrl,
    position: data.position,
    prevPosition: data.prevPosition,
    clicks: data.clicks,
    impressions: data.impressions,
    ctr: data.ctr,
    isCannibalized: data.isCannibalized,
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
    try {
      const res = await fetch("/api/admin/seo/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          pageUrl: data.pageUrl,
          keyword: data.query,
        }),
      });
      const resData = await res.json();
      if (resData.ok) {
        setTargetAdded(true);
        if (onTargetKeywordAdded) onTargetKeywordAdded();
      }
    } catch (err) {
      console.error("Failed to add target keyword:", err);
    } finally {
      setSavingTarget(false);
    }
  };

  const handleCreateFixDraft = () => {
    setFixDraftCreated(true);
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
          maxWidth: "680px",
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
              &ldquo;{data.query}&rdquo;
            </h3>
            <div style={{ fontSize: "0.8rem", color: "var(--dgs-text-muted)" }}>
              Ranking URL:{" "}
              <a
                href={data.pageUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--dgs-primary)", textDecoration: "none" }}
              >
                {data.pageUrl.replace(/^https?:\/\/[^/]+/i, "") || "/"} &nearr;
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
                {data.position != null && data.position > 0 ? data.position.toFixed(1) : "—"}
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
                {data.impressions.toLocaleString()}
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
                {data.clicks.toLocaleString()}
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
                  Auto-Apply: NO
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
                      Pos: {cp.position?.toFixed(1)} · Clicks: {cp.clicks} · Imp: {cp.impressions.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Internal Links & Content Gaps */}
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
              <div style={{ fontSize: "0.76rem", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>
                Recommended Anchor Texts
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
              <div style={{ fontSize: "0.76rem", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>
                Target Content Expansions
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
                  onClick={() => onOpenPageSeo(data.pageUrl)}
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
              href={data.pageUrl}
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
                onClick={() => onOpenPageSeo(data.pageUrl)}
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

            {!fixDraftCreated ? (
              <button
                type="button"
                className="dgs-saas-btn secondary sm"
                onClick={handleCreateFixDraft}
                style={{ fontSize: "0.8rem" }}
              >
                Create Fix Draft
              </button>
            ) : (
              <span className="dgs-saas-chip primary" style={{ fontSize: "0.75rem" }}>
                ✓ Fix Draft Logged
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
