"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function KeywordsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Keywords page error boundary caught exception:", error);
  }, [error]);

  return (
    <div
      style={{
        padding: "32px",
        maxWidth: "800px",
        margin: "40px auto",
        background: "#0d1117",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        borderRadius: "var(--dgs-radius-lg, 12px)",
        boxShadow: "0 12px 36px rgba(0, 0, 0, 0.6)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.15)",
            color: "#ef4444",
            fontSize: "1.25rem",
            fontWeight: 700,
          }}
        >
          ⚠
        </span>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#fff", fontWeight: 700 }}>
            Keywords Strategy Telemetry Error
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--dgs-text-muted, #8b949e)" }}>
            An unexpected error occurred while processing Search Console query dimensions or target keyword metrics.
          </p>
        </div>
      </div>

      <div
        style={{
          background: "rgba(0, 0, 0, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "8px",
          padding: "16px",
          margin: "20px 0",
          fontSize: "0.82rem",
          color: "#f87171",
          fontFamily: "monospace",
          wordBreak: "break-word",
        }}
      >
        <strong>Error:</strong> {error?.message || "Unknown client/server rendering exception"}
        {error?.digest && (
          <div style={{ marginTop: "6px", color: "var(--dgs-text-muted, #8b949e)", fontSize: "0.74rem" }}>
            Digest: {error.digest}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "24px" }}>
        <button
          type="button"
          onClick={() => reset()}
          className="dgs-saas-btn primary"
          style={{
            background: "var(--dgs-primary, #00e5ff)",
            color: "#000",
            fontWeight: 600,
            padding: "8px 18px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          ↻ Retry Loading
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="dgs-saas-btn secondary"
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            color: "#fff",
            padding: "8px 18px",
            borderRadius: "6px",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            cursor: "pointer",
          }}
        >
          Hard Reload
        </button>
        <Link
          href="/admin/site-audits/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "8px 18px",
            borderRadius: "6px",
            background: "transparent",
            color: "var(--dgs-primary, #00e5ff)",
            textDecoration: "none",
            fontSize: "0.85rem",
          }}
        >
          &larr; Back to Site Audits
        </Link>
      </div>

      {error?.stack && process.env.NODE_ENV !== "production" && (
        <details style={{ marginTop: "24px", color: "var(--dgs-text-muted, #8b949e)", fontSize: "0.75rem" }}>
          <summary style={{ cursor: "pointer", marginBottom: "8px" }}>View Exception Stack Trace</summary>
          <pre
            style={{
              padding: "12px",
              background: "#05070a",
              borderRadius: "6px",
              overflowX: "auto",
              color: "#94a3b8",
            }}
          >
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}
