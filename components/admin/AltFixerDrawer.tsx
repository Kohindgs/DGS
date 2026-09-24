"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { type MissingAltRecord } from "@/lib/seo/alt-fixer";

type Props = {
  pageUrl?: string;
  auditRunId?: string;
  reportedCount?: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
};

export default function AltFixerDrawer({
  pageUrl,
  auditRunId,
  reportedCount,
  isOpen,
  onClose,
  onUpdated,
}: Props) {
  const [items, setItems] = useState<MissingAltRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [suggestingId, setSuggestingId] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [draftingId, setDraftingId] = useState<string | null>(null);
  const [createdDrafts, setCreatedDrafts] = useState<Record<string, string>>({});
  const [filterResolved, setFilterResolved] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (pageUrl) q.set("pageUrl", pageUrl);
      if (auditRunId) q.set("auditRunId", auditRunId);
      q.set("resolved", String(filterResolved));
      const res = await fetch(`/api/admin/seo/alt-fixer?${q.toString()}`);
      const data = await res.json();
      if (data.ok) {
        setItems(data.items || []);
      }
    } catch (err) {
      console.error("Failed to load missing alt items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchItems();
    }
  }, [isOpen, pageUrl, auditRunId, filterResolved]);

  const handleSuggest = async (item: MissingAltRecord) => {
    setSuggestingId(item.id);
    try {
      const res = await fetch("/api/admin/seo/alt-fixer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "suggest",
          pageUrl: item.pageUrl,
          filename: item.filename,
          imageSrc: item.imageSrc,
          currentAlt: item.currentAlt,
          surroundingContext: item.surroundingContext,
        }),
      });
      const data = await res.json();
      if (data.ok && data.suggestion) {
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, suggestedAlt: data.suggestion } : it))
        );
        if (editingId === item.id) {
          setEditText(data.suggestion);
        }
      }
    } catch (err) {
      console.error("Suggestion error:", err);
    } finally {
      setSuggestingId(null);
    }
  };

  const handleApply = async (item: MissingAltRecord, applyToAll: boolean, customText?: string) => {
    const textToApply = customText !== undefined ? customText : item.suggestedAlt || editText;
    if (!textToApply || !textToApply.trim()) {
      alert("Please provide valid alt text before applying.");
      return;
    }

    setApplyingId(item.id);
    try {
      const res = await fetch("/api/admin/seo/alt-fixer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "apply",
          id: item.id,
          newAltText: textToApply.trim(),
          applyToAllUsages: applyToAll,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setItems((prev) => prev.filter((it) => it.id !== item.id));
        setEditingId(null);
        if (data.beforeCount !== undefined && data.afterCount !== undefined) {
          setFeedbackMsg(
            `✓ Alt text applied and verified live via re-audit. Missing alts on page: Before: ${data.beforeCount} → After: ${data.afterCount}`
          );
        } else {
          setFeedbackMsg(`✓ Alt text applied and verified live (${data.affectedUsages || 1} usage updated).`);
        }
        if (onUpdated) onUpdated();
      } else {
        alert(data.error || "Failed to apply alt text");
      }
    } catch (err: any) {
      alert(err.message || "Failed to apply alt text");
    } finally {
      setApplyingId(null);
    }
  };

  const handleCreateDraft = async (item: MissingAltRecord, customText?: string) => {
    const textToApply = customText !== undefined ? customText : item.suggestedAlt || editText;
    if (!textToApply || !textToApply.trim()) {
      alert("Please provide or generate alt text before creating a draft.");
      return;
    }

    setDraftingId(item.id);
    try {
      const res = await fetch("/api/admin/seo/change-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_type: "ALT_FIXER",
          source_id: item.id,
          page_url: item.pageUrl,
          change_type: "MISSING_ALT",
          risk_level: "SAFE",
          reason: `Accessibility & Image SEO: Image "${item.filename}" lacks descriptive alt text on ${item.pageUrl}`,
          proposed_state: {
            filename: item.filename,
            imageSrc: item.imageSrc,
            newAltText: textToApply.trim(),
          },
          implementation_plan: [
            `Insert descriptive alt text into rendered source for image ${item.filename}`,
            "Verify rendered alt attribute live",
            "Re-audit page via auditSingleUrl to confirm resolution",
          ],
        }),
      });
      const data = await res.json();
      if (data.ok && data.id) {
        setCreatedDrafts((prev) => ({ ...prev, [item.id]: data.id }));
        setFeedbackMsg(`✓ Created SEO Approval Draft #${data.id} for "${item.filename}".`);
      } else {
        alert(data.error || "Failed to create draft");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to create draft");
    } finally {
      setDraftingId(null);
    }
  };

  const handleMarkDecorative = async (item: MissingAltRecord) => {
    setApplyingId(item.id);
    try {
      const res = await fetch("/api/admin/seo/alt-fixer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "decorative",
          id: item.id,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setItems((prev) => prev.filter((it) => it.id !== item.id));
        setFeedbackMsg(`✓ Image marked as decorative (alt="") and verified.`);
        if (onUpdated) onUpdated();
      } else {
        alert(data.error || "Failed to mark as decorative");
      }
    } catch (err: any) {
      alert(err.message || "Failed to mark as decorative");
    } finally {
      setApplyingId(null);
    }
  };

  if (!isOpen) return null;

  // Invariant check: table count vs retrieved items count (Requirement D)
  const hasInconsistency =
    !filterResolved && reportedCount !== undefined && reportedCount !== items.length;

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
          maxWidth: "800px",
          height: "100%",
          backgroundColor: "#0d1117",
          borderLeft: "1px solid rgba(255, 255, 255, 0.12)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-12px 0 36px rgba(0,0,0,0.8)",
          overflowY: "auto",
          padding: "24px",
          gap: "20px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span className="dgs-saas-chip danger">Missing Alt Text Fixer</span>
              {auditRunId && (
                <span className="dgs-saas-chip neutral" style={{ fontSize: "0.68rem" }}>
                  Audit: {auditRunId.slice(0, 8)}
                </span>
              )}
            </div>
            <h3 style={{ margin: "4px 0", color: "#fff", fontSize: "1.25rem", fontWeight: 700 }}>
              {pageUrl ? `Missing Alts on: ${pageUrl}` : "Site-Wide Missing Alt Fixer"}
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
              Context-aware AI descriptions written directly to rendered sources, verified live, and re-audited.
            </p>
          </div>
          <button
            type="button"
            className="dgs-saas-btn secondary sm"
            onClick={onClose}
            style={{ fontSize: "1rem", lineHeight: 1 }}
          >
            &times;
          </button>
        </div>

        {/* Filter bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className={`dgs-saas-btn sm ${!filterResolved ? "primary" : "secondary"}`}
              onClick={() => setFilterResolved(false)}
            >
              Unresolved ({items.length})
            </button>
            <button
              type="button"
              className={`dgs-saas-btn sm ${filterResolved ? "primary" : "secondary"}`}
              onClick={() => setFilterResolved(true)}
            >
              Resolved History
            </button>
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)" }}>
            WCAG 2.2 Compliant · Human Approval Required
          </span>
        </div>

        {/* Invariant Warning Banner (Requirement D) */}
        {hasInconsistency && (
          <div
            style={{
              padding: "12px 16px",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              borderRadius: "var(--dgs-radius-md, 8px)",
              color: "#f87171",
              fontSize: "0.82rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div>
              <strong>DATA INCONSISTENCY:</strong> Site Audit table reports <strong>{reportedCount} Missing</strong>, but <strong>{items.length} records</strong> are retrieved from this audit.
            </div>
            <button
              type="button"
              className="dgs-saas-btn sm danger"
              onClick={fetchItems}
              style={{ whiteSpace: "nowrap" }}
            >
              ↻ Re-sync Evidence
            </button>
          </div>
        )}

        {feedbackMsg && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "var(--dgs-radius-sm)",
              color: "var(--dgs-success)",
              fontSize: "0.82rem",
            }}
          >
            {feedbackMsg}
          </div>
        )}

        {loading ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--dgs-text-muted)" }}>
            Loading images for audit...
          </div>
        ) : items.length === 0 ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              background: "rgba(255,255,255,0.02)",
              borderRadius: "var(--dgs-radius-md)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "10px" }}>✓</div>
            <h4 style={{ color: "#fff", margin: "0 0 6px" }}>All Images Have Valid Alt Text</h4>
            <p style={{ fontSize: "0.84rem", color: "var(--dgs-text-muted)", margin: 0 }}>
              No missing or unverified alt attributes detected for this scope.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {items.map((item) => {
              const isEditing = editingId === item.id;
              const isSuggesting = suggestingId === item.id;
              const isApplying = applyingId === item.id;
              const isDrafting = draftingId === item.id;
              const draftId = createdDrafts[item.id];

              return (
                <article
                  key={item.id}
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: "var(--dgs-radius-md)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                    {/* Thumbnail Preview with Fallback */}
                    <div
                      style={{
                        width: "90px",
                        height: "70px",
                        borderRadius: "var(--dgs-radius-sm)",
                        overflow: "hidden",
                        background: "#12121c",
                        border: "1px solid rgba(255,255,255,0.1)",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={item.imageSrc}
                        alt={item.currentAlt || item.filename}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong
                          style={{
                            fontSize: "0.88rem",
                            color: "#fff",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={item.filename}
                        >
                          {item.filename}
                        </strong>
                        <span
                          className={`dgs-saas-chip ${
                            item.altStatus === "ALT_FIXED"
                              ? "success"
                              : item.altStatus === "EMPTY_ALT_DECORATIVE"
                              ? "neutral"
                              : item.altStatus === "EMPTY_ALT_NEEDS_REVIEW"
                              ? "warning"
                              : "danger"
                          }`}
                          style={{ fontSize: "0.68rem" }}
                        >
                          {item.altStatus === "ALT_FIXED"
                            ? "ALT FIXED"
                            : item.altStatus === "EMPTY_ALT_DECORATIVE"
                            ? 'DECORATIVE (alt="")'
                            : item.altStatus === "EMPTY_ALT_NEEDS_REVIEW"
                            ? "EMPTY ALT"
                            : "MISSING ALT"}
                        </span>
                      </div>

                      <div style={{ fontSize: "0.76rem", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
                        Page: <code>{item.pageUrl}</code>
                      </div>

                      <div style={{ fontSize: "0.76rem", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
                        Source: <strong style={{ color: "#fff" }}>{item.sourceType || "MIRRORED PAGE HTML"}</strong>
                      </div>

                      {item.recommendation && (
                        <div style={{ fontSize: "0.76rem", color: "#fcd34d", marginTop: "4px" }}>
                          💡 {item.recommendation}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Suggestion & Editing Box */}
                  <div
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "6px",
                      padding: "12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--dgs-text-muted)", fontWeight: 600 }}>
                        {item.suggestedAlt ? "Contextual AI Suggestion" : "Actionable Alt Text"}
                      </span>
                      {!isEditing && (
                        <button
                          type="button"
                          className="dgs-saas-btn sm secondary"
                          onClick={() => {
                            setEditingId(item.id);
                            setEditText(item.suggestedAlt || item.currentAlt || "");
                          }}
                          style={{ padding: "2px 8px", fontSize: "0.72rem" }}
                        >
                          ✎ Custom Edit
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={2}
                          style={{
                            width: "100%",
                            background: "#080a0f",
                            border: "1px solid var(--dgs-primary)",
                            color: "#fff",
                            padding: "8px",
                            borderRadius: "4px",
                            fontSize: "0.82rem",
                          }}
                          placeholder="Enter descriptive alt text..."
                        />
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            type="button"
                            className="dgs-saas-btn sm primary"
                            onClick={() => handleApply(item, false, editText)}
                            disabled={isApplying}
                          >
                            {isApplying ? "Applying..." : "Approve & Apply Live"}
                          </button>
                          <button
                            type="button"
                            className="dgs-saas-btn sm secondary"
                            onClick={() => handleCreateDraft(item, editText)}
                            disabled={isDrafting}
                          >
                            {isDrafting ? "Drafting..." : "Create Approval Draft"}
                          </button>
                          <button
                            type="button"
                            className="dgs-saas-btn sm secondary"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: "0.85rem", color: item.suggestedAlt ? "#fff" : "var(--dgs-text-muted)" }}>
                        {item.suggestedAlt ? (
                          <span>&ldquo;{item.suggestedAlt}&rdquo;</span>
                        ) : (
                          <em>No suggestion generated yet. Click &ldquo;Generate AI Suggestion&rdquo; below.</em>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  {!isEditing && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {!item.suggestedAlt && (
                          <button
                            type="button"
                            className="dgs-saas-btn sm secondary"
                            onClick={() => handleSuggest(item)}
                            disabled={isSuggesting}
                          >
                            {isSuggesting ? "Generating..." : "⚡ Generate AI Suggestion"}
                          </button>
                        )}
                        {item.suggestedAlt && (
                          <>
                            <button
                              type="button"
                              className="dgs-saas-btn sm primary"
                              onClick={() => handleApply(item, false)}
                              disabled={isApplying}
                            >
                              {isApplying ? "Verifying..." : "Approve & Apply Live"}
                            </button>
                            <button
                              type="button"
                              className="dgs-saas-btn sm secondary"
                              onClick={() => handleCreateDraft(item)}
                              disabled={isDrafting}
                            >
                              {isDrafting ? "Drafting..." : "Create Approval Draft"}
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          className="dgs-saas-btn sm secondary"
                          onClick={() => handleMarkDecorative(item)}
                          disabled={isApplying}
                          title="Mark image with alt='' for decorative presentation per WCAG"
                        >
                          Mark Decorative (alt=&quot;&quot;)
                        </button>
                      </div>

                      {draftId && (
                        <Link
                          href="/admin/seo/approvals/"
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--dgs-primary)",
                            textDecoration: "none",
                            fontWeight: 600,
                          }}
                        >
                          ✓ Draft #{draftId} &rarr;
                        </Link>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
