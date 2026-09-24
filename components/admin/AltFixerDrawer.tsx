"use client";

import React, { useState, useEffect } from "react";
import { type MissingAltRecord } from "@/lib/seo/alt-fixer";

type Props = {
  pageUrl?: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
};

export default function AltFixerDrawer({ pageUrl, isOpen, onClose, onUpdated }: Props) {
  const [items, setItems] = useState<MissingAltRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [suggestingId, setSuggestingId] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [filterResolved, setFilterResolved] = useState<boolean>(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (pageUrl) q.set("pageUrl", pageUrl);
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
  }, [isOpen, pageUrl, filterResolved]);

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
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      console.error("Mark decorative error:", err);
    } finally {
      setApplyingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
        zIndex: 10000,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "740px",
          background: "#0c0c14",
          borderLeft: "1px solid rgba(255,255,255,0.12)",
          height: "100%",
          overflowY: "auto",
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <span className="dgs-saas-chip primary" style={{ marginBottom: "6px", display: "inline-block" }}>
              ACCESSIBILITY &amp; IMAGE SEO
            </span>
            <h3 style={{ fontSize: "1.3rem", color: "#fff", margin: 0, fontWeight: 700 }}>
              Missing Alt Text Fixer
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
              {pageUrl ? `Auditing page: ${pageUrl}` : "Reviewing missing and unverified image alt tags site-wide."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
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

        {/* Filter bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                            item.altStatus === "MISSING_ALT_ATTRIBUTE" ? "danger" : "warning"
                          }`}
                          style={{ fontSize: "0.68rem" }}
                        >
                          {item.altStatus === "MISSING_ALT_ATTRIBUTE" ? "Missing Alt Tag" : "Empty Alt"}
                        </span>
                      </div>

                      <div style={{ fontSize: "0.76rem", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
                        Page: <code>{item.pageUrl}</code>
                      </div>

                      <div style={{ fontSize: "0.76rem", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
                        Usage: Used on <strong>{item.usageCount || 1}</strong> location(s)
                      </div>
                    </div>
                  </div>

                  {/* Alt Text Controls */}
                  {isEditing ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label style={{ fontSize: "0.76rem", color: "var(--dgs-text-muted)" }}>
                        Enter Custom Alt Description:
                      </label>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={2}
                        className="dgs-saas-input"
                        placeholder="Accurate, non-keyword-stuffed description of what this image conveys..."
                        style={{
                          width: "100%",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          color: "#fff",
                          padding: "8px 10px",
                          borderRadius: "4px",
                          fontSize: "0.82rem",
                        }}
                      />
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          className="dgs-saas-btn primary sm"
                          disabled={isApplying}
                          onClick={() => handleApply(item, false, editText)}
                        >
                          {isApplying ? "Saving..." : "Save Alt"}
                        </button>
                        <button
                          type="button"
                          className="dgs-saas-btn secondary sm"
                          disabled={isApplying}
                          onClick={() => handleApply(item, true, editText)}
                        >
                          Save To All ({item.usageCount || 1})
                        </button>
                        <button
                          type="button"
                          className="dgs-saas-btn secondary sm"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {item.suggestedAlt ? (
                        <div
                          style={{
                            padding: "10px 12px",
                            background: "rgba(99, 102, 241, 0.08)",
                            borderRadius: "var(--dgs-radius-sm)",
                            border: "1px solid rgba(99, 102, 241, 0.2)",
                            marginBottom: "10px",
                          }}
                        >
                          <div style={{ fontSize: "0.72rem", color: "var(--dgs-primary)", fontWeight: 700, textTransform: "uppercase" }}>
                            AI / Contextual Suggestion:
                          </div>
                          <div style={{ fontSize: "0.84rem", color: "#fff", marginTop: "3px", fontStyle: "italic" }}>
                            &ldquo;{item.suggestedAlt}&rdquo;
                          </div>
                        </div>
                      ) : null}

                      {/* Action buttons */}
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                        {item.suggestedAlt ? (
                          <>
                            <button
                              type="button"
                              className="dgs-saas-btn primary sm"
                              disabled={isApplying}
                              onClick={() => handleApply(item, false)}
                            >
                              Apply
                            </button>
                            <button
                              type="button"
                              className="dgs-saas-btn secondary sm"
                              disabled={isApplying}
                              onClick={() => handleApply(item, true)}
                            >
                              Apply All ({item.usageCount || 1})
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="dgs-saas-btn primary sm"
                            disabled={isSuggesting}
                            onClick={() => handleSuggest(item)}
                          >
                            {isSuggesting ? "Generating..." : "Generate AI Suggestion"}
                          </button>
                        )}

                        <button
                          type="button"
                          className="dgs-saas-btn secondary sm"
                          onClick={() => {
                            setEditingId(item.id);
                            setEditText(item.suggestedAlt || item.currentAlt || "");
                          }}
                        >
                          Edit Alt
                        </button>

                        <button
                          type="button"
                          className="dgs-saas-btn secondary sm"
                          disabled={isApplying}
                          onClick={() => handleMarkDecorative(item)}
                          title="Valid WCAG decorative image (alt='')"
                        >
                          Mark Decorative
                        </button>
                      </div>
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
