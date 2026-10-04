"use client";

import React, { useState, useEffect } from "react";
import {
  Link2,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Plus,
  Sparkles,
  TrendingDown,
  Clock,
  X,
} from "lucide-react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import type { OffPageBacklink, BacklinkStatus, AnchorClassification } from "@/lib/off-page/types";

interface Props {
  initialBacklinks?: OffPageBacklink[];
  initialDecay?: {
    retained: number;
    decay7d: number;
    decay30d: number;
    decay90d: number;
    retentionRate: number;
  };
}

export default function BacklinksClientView({ initialBacklinks, initialDecay }: Props) {
  const [backlinks, setBacklinks] = useState<OffPageBacklink[]>(initialBacklinks || []);
  const [decay, setDecay] = useState(initialDecay);
  const [loading, setLoading] = useState(!initialBacklinks);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedAnchor, setSelectedAnchor] = useState<string>("ALL");
  const [verifyingAll, setVerifyingAll] = useState(false);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Add Backlink modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newTargetPage, setNewTargetPage] = useState("/");
  const [newAnchorText, setNewAnchorText] = useState("");
  const [newRelType, setNewRelType] = useState<"dofollow" | "nofollow" | "ugc" | "sponsored">("dofollow");
  const [newRegion, setNewRegion] = useState<"INDIA" | "UAE" | "USA" | "GLOBAL">("INDIA");
  const [addingBacklink, setAddingBacklink] = useState(false);

  const fetchBacklinks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (selectedAnchor !== "ALL") params.set("anchor", selectedAnchor);

      const res = await fetch(`/api/admin/off-page/backlinks?${params.toString()}`);
      const json = await res.json();
      if (json.ok) {
        setBacklinks(json.backlinks);
        if (json.decay) setDecay(json.decay);
      }
    } catch (err) {
      console.error("Failed to fetch backlinks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBacklinks();
  }, [selectedStatus, selectedAnchor]);

  // Penguin concentration metric
  const exactMatchCount = backlinks.filter((b) => b.anchor_classification === "EXACT_MATCH").length;
  const exactMatchPercentage = backlinks.length > 0 ? Math.round((exactMatchCount / backlinks.length) * 100) : 0;
  const isPenguinRisk = exactMatchPercentage > 20;

  const handleVerifyAll = async () => {
    setVerifyingAll(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/off-page/backlinks/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (json.ok) {
        setFeedback("Backlinks batch verified. Refreshing live telemetry...");
        await fetchBacklinks();
      } else {
        setFeedback(`Verification error: ${json.error}`);
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setVerifyingAll(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleCheckSingle = async (id: string) => {
    setCheckingId(id);
    try {
      const res = await fetch("/api/admin/off-page/backlinks/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.ok && json.result) {
        setBacklinks((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: json.result.status, last_checked_at: new Date().toISOString() } : b))
        );
      }
    } catch (err) {
      console.error("Check single failed:", err);
    } finally {
      setCheckingId(null);
    }
  };

  const handleAddBacklink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceUrl) return;
    setAddingBacklink(true);
    try {
      const res = await fetch("/api/admin/off-page/backlinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_url: newSourceUrl,
          target_url: newTargetPage,
          anchor_text: newAnchorText,
          rel_type: newRelType,
          source_region: newRegion,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setShowAddModal(false);
        setNewSourceUrl("");
        setNewAnchorText("");
        setFeedback("Backlink recorded successfully and queued for live verification.");
        await fetchBacklinks();
      } else {
        setFeedback(`Failed to record backlink: ${json.error}`);
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setAddingBacklink(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const columns: Column<OffPageBacklink>[] = [
    {
      key: "source_domain",
      header: "Source Domain & URL",
      sortable: true,
      render: (b) => (
        <div>
          <div style={{ fontWeight: 650, color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
            {b.source_domain}
            <a
              href={b.source_url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Source URL"
              style={{ color: "var(--dgs-brand-cyan)", display: "inline-flex" }}
            >
              <ExternalLink size={13} />
            </a>
          </div>
          <div
            style={{
              fontSize: "0.72rem",
              color: "rgba(255,255,255,0.45)",
              maxWidth: "240px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={b.source_url}
          >
            {b.source_url}
          </div>
        </div>
      ),
    },
    {
      key: "target_url",
      header: "Target DGS Page",
      render: (b) => (
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--dgs-brand-cyan)",
            maxWidth: "180px",
            display: "inline-block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={b.target_url}
        >
          {b.target_url}
        </span>
      ),
    },
    {
      key: "anchor_text",
      header: "Anchor Text",
      render: (b) => {
        const anchorStyles: Record<string, { bg: string; color: string }> = {
          BRANDED: { bg: "rgba(16, 185, 129, 0.15)", color: "#10b981" },
          NAKED_URL: { bg: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" },
          GENERIC: { bg: "rgba(156, 163, 175, 0.15)", color: "#9ca3af" },
          PARTIAL_MATCH: { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" },
          EXACT_MATCH: { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444" },
          OTHER: { bg: "rgba(255, 255, 255, 0.08)", color: "#fff" },
        };
        const s = anchorStyles[b.anchor_classification] || anchorStyles.OTHER;
        return (
          <div>
            <div style={{ fontSize: "0.8rem", color: "#fff", fontWeight: 550 }}>
              &ldquo;{b.anchor_text || "(empty/image)"}&rdquo;
            </div>
            <span
              style={{
                fontSize: "0.68rem",
                padding: "2px 6px",
                borderRadius: "4px",
                background: s.bg,
                color: s.color,
                fontWeight: 700,
                marginTop: "3px",
                display: "inline-block",
              }}
            >
              {b.anchor_classification}
            </span>
          </div>
        );
      },
    },
    {
      key: "link_rel",
      header: "Rel",
      render: (b) => (
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            padding: "2px 6px",
            borderRadius: "4px",
            background: b.dofollow ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.06)",
            color: b.dofollow ? "#34d399" : "rgba(255, 255, 255, 0.6)",
          }}
        >
          {b.link_rel || (b.dofollow ? "dofollow" : "nofollow")}
        </span>
      ),
    },
    {
      key: "authority_score",
      header: "Authority",
      sortable: true,
      render: (b) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>{b.authority_score}</span>
          <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>DA</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (b) => {
        const statusConfig: Record<string, { bg: string; color: string; icon: any }> = {
          LIVE: { bg: "rgba(16, 185, 129, 0.15)", color: "#10b981", icon: CheckCircle2 },
          LOST: { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444", icon: XCircle },
          REL_CHANGED: { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", icon: AlertTriangle },
          NOINDEX_SOURCE: { bg: "rgba(249, 115, 22, 0.15)", color: "#f97316", icon: AlertTriangle },
          ANCHOR_CHANGED: { bg: "rgba(168, 85, 247, 0.15)", color: "#a855f7", icon: AlertTriangle },
        };
        const cfg = statusConfig[b.status] || { bg: "rgba(255,255,255,0.1)", color: "#fff", icon: Clock };
        const Icon = cfg.icon;
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "3px 8px",
              borderRadius: "6px",
              fontSize: "0.72rem",
              fontWeight: 700,
              background: cfg.bg,
              color: cfg.color,
            }}
          >
            <Icon size={12} />
            {b.status}
          </span>
        );
      },
    },
    {
      key: "last_checked_at",
      header: "Last Verified",
      render: (b) => (
        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>
          {b.last_checked_at ? new Date(b.last_checked_at).toLocaleDateString() : "Pending"}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Top Banner & Decay Metrics */}
      <div
        className="dgs-saas-card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          padding: "16px 20px",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
            Active Backlinks & Live Health Monitor
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
            Live HTTP and DOM crawler verifies link presence, rel attributes, anchor mutations, and source page indexability directives.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => setShowAddModal(true)}
            className="dgs-saas-btn secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={14} /> Add Backlink
          </button>
          <button
            onClick={handleVerifyAll}
            disabled={verifyingAll}
            className="dgs-saas-btn primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}
          >
            <RefreshCw size={14} className={verifyingAll ? "animate-spin" : ""} />
            {verifyingAll ? "Verifying..." : "Verify Live Links"}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: "var(--dgs-radius-md)",
            background: "rgba(0, 198, 255, 0.15)",
            border: "1px solid var(--dgs-brand-cyan)",
            color: "#fff",
            fontSize: "0.84rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Sparkles size={16} color="var(--dgs-brand-cyan)" />
          {feedback}
        </div>
      )}

      {/* Decay & Retention Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
        }}
      >
        <div className="dgs-saas-card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Active Retained</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#10b981", marginTop: "4px" }}>
            {decay?.retained ?? backlinks.filter((b) => b.status === "LIVE").length}
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>Retention: {decay?.retentionRate ?? 95}%</div>
        </div>

        <div className="dgs-saas-card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>7D Link Decay</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f59e0b", marginTop: "4px" }}>
            {decay?.decay7d ?? 0}
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>Lost in last 7 days</div>
        </div>

        <div className="dgs-saas-card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>30D Link Decay</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f97316", marginTop: "4px" }}>
            {decay?.decay30d ?? 0}
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>Lost in last 30 days</div>
        </div>

        <div className="dgs-saas-card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Exact Match Ratio</div>
          <div
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              color: isPenguinRisk ? "#ef4444" : "#00c6ff",
              marginTop: "4px",
            }}
          >
            {exactMatchPercentage}%
          </div>
          <div style={{ fontSize: "0.72rem", color: isPenguinRisk ? "#f87171" : "rgba(255,255,255,0.4)" }}>
            {isPenguinRisk ? "Penguin Risk High (>20%)" : "Safe Profile (<20%)"}
          </div>
        </div>
      </div>

      {/* Penguin Warning Banner if applicable */}
      {isPenguinRisk && (
        <div
          style={{
            padding: "12px 18px",
            borderRadius: "var(--dgs-radius-md)",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid #ef4444",
            color: "#fecaca",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <AlertTriangle size={20} color="#ef4444" />
          <div>
            <strong>Penguin Anchor Alert:</strong> Exact-match anchors account for {exactMatchPercentage}% of total links.
            Google algorithm safeguards recommend keeping exact-match anchor concentration below 20%. Prioritize branded and naked URL anchors in upcoming outreach.
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
          padding: "10px 16px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "var(--dgs-radius-md)",
        }}
      >
        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Status:</span>
        {["ALL", "LIVE", "LOST", "REL_CHANGED", "NOINDEX_SOURCE", "ANCHOR_CHANGED"].map((s) => (
          <button
            key={s}
            onClick={() => setSelectedStatus(s)}
            className={`dgs-saas-chip ${selectedStatus === s ? "primary" : ""}`}
            style={{ cursor: "pointer", border: "none" }}
          >
            {s}
          </button>
        ))}

        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", fontWeight: 600, marginLeft: "14px" }}>
          Anchor Classification:
        </span>
        {["ALL", "BRANDED", "NAKED_URL", "GENERIC", "PARTIAL_MATCH", "EXACT_MATCH"].map((a) => (
          <button
            key={a}
            onClick={() => setSelectedAnchor(a)}
            className={`dgs-saas-chip ${selectedAnchor === a ? "primary" : ""}`}
            style={{ cursor: "pointer", border: "none" }}
          >
            {a}
          </button>
        ))}
      </div>

      {/* Main SaaS Table */}
      <div className="dgs-saas-card" style={{ padding: "16px" }}>
        <SaaSTable<OffPageBacklink>
          columns={columns}
          data={backlinks}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search domain, URL, anchor text..."
          searchFilter={(item, q) =>
            item.source_domain.toLowerCase().includes(q) ||
            item.source_url.toLowerCase().includes(q) ||
            (item.anchor_text || "").toLowerCase().includes(q) ||
            item.target_url.toLowerCase().includes(q)
          }
          actions={(item) => (
            <button
              onClick={() => handleCheckSingle(item.id)}
              disabled={checkingId === item.id}
              className="dgs-saas-btn secondary"
              style={{ fontSize: "0.72rem", padding: "4px 8px" }}
            >
              {checkingId === item.id ? "Checking..." : "Recheck"}
            </button>
          )}
          initialPageSize={15}
          emptyMessage="No backlinks match the selected criteria."
        />
      </div>

      {/* Add Backlink Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <form
            onSubmit={handleAddBacklink}
            className="dgs-saas-card"
            style={{
              width: "100%",
              maxWidth: "500px",
              padding: "24px",
              background: "#111827",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem" }}>Record Backlink</h3>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Source Page URL:
              </label>
              <input
                type="url"
                required
                placeholder="https://example.com/article"
                value={newSourceUrl}
                onChange={(e) => setNewSourceUrl(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "0.85rem",
                }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Target DGS Page:
              </label>
              <input
                type="text"
                required
                placeholder="/services/ai-video-production-agency/"
                value={newTargetPage}
                onChange={(e) => setNewTargetPage(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "0.85rem",
                }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Anchor Text:
              </label>
              <input
                type="text"
                placeholder="D'Genius Solutions AI Video Production"
                value={newAnchorText}
                onChange={(e) => setNewAnchorText(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "0.85rem",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                  Rel Type:
                </label>
                <select
                  value={newRelType}
                  onChange={(e) => setNewRelType(e.target.value as any)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    background: "#1f2937",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                  }}
                >
                  <option value="dofollow">dofollow</option>
                  <option value="nofollow">nofollow</option>
                  <option value="ugc">ugc</option>
                  <option value="sponsored">sponsored</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                  Region:
                </label>
                <select
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value as any)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    background: "#1f2937",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                  }}
                >
                  <option value="INDIA">INDIA</option>
                  <option value="UAE">UAE</option>
                  <option value="USA">USA</option>
                  <option value="GLOBAL">GLOBAL</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button type="button" onClick={() => setShowAddModal(false)} className="dgs-saas-btn secondary">
                Cancel
              </button>
              <button type="submit" disabled={addingBacklink} className="dgs-saas-btn primary">
                {addingBacklink ? "Recording..." : "Record Backlink"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
