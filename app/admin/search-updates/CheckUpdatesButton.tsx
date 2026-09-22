"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CheckUpdatesButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  async function handleCheck() {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/search-updates/check", {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setResult(data.message || "Updates checked successfully");
        router.refresh();
      } else {
        setResult(data.message || "Failed to check updates");
      }
    } catch (err: any) {
      setResult("Connection error while checking updates");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
      {result ? (
        <span
          style={{
            fontSize: "0.82rem",
            color: result.includes("Failed") || result.includes("error") ? "#fca5a5" : "#6ee7b7",
          }}
        >
          {result}
        </span>
      ) : null}
      <button
        onClick={handleCheck}
        disabled={loading}
        style={{
          background: "linear-gradient(135deg, #7928ca 0%, #4f46e5 100%)",
          color: "#ffffff",
          border: "none",
          borderRadius: "6px",
          padding: "8px 16px",
          fontWeight: 600,
          fontSize: "0.85rem",
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.7 : 1,
          transition: "all 0.2s ease",
        }}
      >
        {loading ? "Checking Feeds..." : "Check For Updates Now"}
      </button>
    </div>
  );
}
