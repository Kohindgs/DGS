"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import type { OffPageOpportunity, RegionCode, PriorityTier, OpportunityStatus } from "@/lib/off-page/types";

interface Props {
  initialOpportunities?: OffPageOpportunity[];
}

export default function OpportunitiesClientView({ initialOpportunities }: Props) {
  const [opportunities, setOpportunities] = useState<OffPageOpportunity[]>(initialOpportunities || []);
  const [loading, setLoading] = useState(!initialOpportunities);
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [discovering, setDiscovering] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Status Edit Modal State
  const [editingOpp, setEditingOpp] = useState<OffPageOpportunity | null>(null);
  const [newStatus, setNewStatus] = useState<OpportunityStatus>("NEW");
  const [savingStatus, setSavingStatus] = useState(false);

  // Outreach Conversion Modal State
  const [convertingOpp, setConvertingOpp] = useState<OffPageOpportunity | null>(null);
  const [outreachSubject, setOutreachSubject] = useState("");
  const [outreachPitch, setOutreachPitch] = useState("");
  const [converting, setConverting] = useState(false);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedRegion !== "ALL") params.set("region", selectedRegion);
      if (selectedPriority !== "ALL") params.set("priority", selectedPriority);
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);

      const res = await fetch(`/api/admin/off-page/opportunities?${params.toString()}`);
      const json = await res.json();
      if (json.ok) {
        setOpportunities(json.opportunities || json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch opportunities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [selectedRegion, selectedPriority, selectedStatus]);

  const handleRunDiscovery = async () => {
    setDiscovering(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/off-page/opportunities/discover", { method: "POST" });
      const json = await res.json();
      if (json.ok) {
        setFeedback(`Discovery complete: ${json.insertedCount} new opportunities discovered.`);
        await fetchOpportunities();
      } else {
        setFeedback(`Discovery failed: ${json.error || "Unknown error"}`);
      }
    } catch (err: any) {
      setFeedback(`Error running discovery: ${err.message}`);
    } finally {
      setDiscovering(false);
      setTimeout(() => setFeedback(null), 6000);
    }
  };

  const handleUpdateStatus = async () => {
    if (!editingOpp) return;
    setSavingStatus(true);
    try {
      const res = await fetch("/api/admin/off-page/opportunities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingOpp.id, status: newStatus }),
      });
      const json = await res.json();
      if (json.ok) {
        setOpportunities((prev) =>
          prev.map((o) => (o.id === editingOpp.id ? { ...o, status: newStatus } : o))
        );
        setEditingOpp(null);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleOpenOutreachModal = async (opp: OffPageOpportunity) => {
    setConvertingOpp(opp);
    setOutreachSubject(`Strategic Partnership & Agency Feature: D'Genius Solutions x ${opp.site_name}`);
    setOutreachPitch(`Hi ${opp.site_name} Editorial Team,\n\nI lead digital growth at D'Genius Solutions (DGS), an AI video production and strategic growth agency operating across Mumbai, Dubai, and New York.\n\nWe noticed your publication/directory covers innovative digital agency practices and would love to provide our verified insights on enterprise AI video production and generative engine optimization (GEO).\n\nCould we explore a listing or thought-leadership collaboration?\n\nBest regards,\nD'Genius Solutions Editorial Team`);
  };

  const handleConfirmOutreach = async () => {
    if (!convertingOpp) return;
    setConverting(true);
    try {
      const res = await fetch("/api/admin/off-page/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunity_id: convertingOpp.id,
          target_domain: convertingOpp.domain,
          target_url: convertingOpp.exact_submission_url || convertingOpp.domain,
          campaign_type: convertingOpp.category,
          stage: "INTERNAL_APPROVED",
          pitch_subject: outreachSubject,
          pitch_body: outreachPitch,
          recommended_dgs_target_page: convertingOpp.recommended_dgs_target_page,
          target_anchor: convertingOpp.recommended_anchor_strategy || "D'Genius Solutions",
          approval_status: "approved",
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setOpportunities((prev) =>
          prev.map((o) => (o.id === convertingOpp.id ? { ...o, status: "APPROVED" } : o))
        );
        setConvertingOpp(null);
        setFeedback(`Opportunity successfully queued in Outreach CRM.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConverting(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // SaaSTable Columns definition
  const columns: Column<OffPageOpportunity>[] = [
    {
      key: "site_name",
      header: "Platform & Domain",
      sortable: true,
      render: (opp) => (
        <div>
          <div style={{ fontWeight: 650, color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
            {opp.site_name}
            {opp.exact_submission_url && (
              <a
                href={opp.exact_submission_url}
                target="_blank"
                rel="noopener noreferrer"
                title="Open Direct Submission URL"
                style={{ color: "var(--dgs-brand-cyan)", display: "inline-flex" }}
              >
                <ExternalLink size={13} />
              </a>
            )}
          </div>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>{opp.domain}</div>
        </div>
      ),
    },
    {
      key: "region",
      header: "Region",
      sortable: true,
      render: (opp) => {
        const badgeColors: Record<string, string> = {
          INDIA: "rgba(255, 153, 0, 0.15)",
          UAE: "rgba(0, 180, 216, 0.15)",
          USA: "rgba(67, 97, 238, 0.15)",
          GLOBAL: "rgba(114, 9, 183, 0.15)",
        };
        const textColors: Record<string, string> = {
          INDIA: "#ffb703",
          UAE: "#00b4d8",
          USA: "#7096ff",
          GLOBAL: "#c77dff",
        };
        return (
          <span
            style={{
              padding: "3px 8px",
              borderRadius: "6px",
              fontSize: "0.72rem",
              fontWeight: 700,
              background: badgeColors[opp.region] || "rgba(255,255,255,0.08)",
              color: textColors[opp.region] || "#fff",
            }}
          >
            {opp.region}
          </span>
        );
      },
    },
    {
      key: "category",
      header: "Category & Tier",
      sortable: true,
      render: (opp) => (
        <div>
          <div style={{ fontSize: "0.8rem", color: "#e2e8f0", fontWeight: 500 }}>{opp.category}</div>
          <div style={{ fontSize: "0.7rem", color: "#10b981", fontWeight: 600 }}>
            {opp.free_status || "100% Free Tier"}
          </div>
        </div>
      ),
    },
    {
      key: "authority_score",
      header: "Authority",
      sortable: true,
      render: (opp) => {
        const score = opp.authority_score;
        const color = score >= 80 ? "#10b981" : score >= 60 ? "#00c6ff" : score >= 40 ? "#f59e0b" : "#ef4444";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.04)",
                border: `2px solid ${color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {score}
            </div>
            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>
              DA {opp.authority_score || score}
            </div>
          </div>
        );
      },
    },
    {
      key: "priority_tier",
      header: "Priority",
      sortable: true,
      render: (opp) => {
        const colors: Record<string, { bg: string; text: string }> = {
          P0: { bg: "rgba(236, 72, 153, 0.2)", text: "#f472b6" },
          P1: { bg: "rgba(59, 130, 246, 0.2)", text: "#60a5fa" },
          P2: { bg: "rgba(16, 185, 129, 0.2)", text: "#34d399" },
          P3: { bg: "rgba(156, 163, 175, 0.2)", text: "#9ca3af" },
        };
        const c = colors[opp.priority_tier] || colors.P3;
        return (
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "0.72rem",
              fontWeight: 800,
              background: c.bg,
              color: c.text,
            }}
          >
            {opp.priority_tier}
          </span>
        );
      },
    },
    {
      key: "recommended_dgs_target_page",
      header: "Target Page",
      render: (opp) => (
        <span
          style={{
            fontSize: "0.74rem",
            color: "rgba(255,255,255,0.7)",
            maxWidth: "180px",
            display: "inline-block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={opp.recommended_dgs_target_page}
        >
          {opp.recommended_dgs_target_page || "/"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (opp) => {
        const statusColors: Record<string, string> = {
          NEW: "#60a5fa",
          QUALIFIED: "#a78bfa",
          APPROVED: "#34d399",
          CONTACTED: "#f59e0b",
          SUBMITTED: "#f472b6",
          LIVE: "#10b981",
          REJECTED: "#ef4444",
          NOT_FREE: "#9ca3af",
        };
        return (
          <span
            style={{
              padding: "3px 8px",
              borderRadius: "6px",
              fontSize: "0.7rem",
              fontWeight: 700,
              background: "rgba(255,255,255,0.06)",
              color: statusColors[opp.status] || "#fff",
              border: `1px solid ${statusColors[opp.status] || "rgba(255,255,255,0.2)"}`,
            }}
          >
            {opp.status}
          </span>
        );
      },
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Top Banner & Actions */}
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
            Free Authority Opportunities Inventory
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
            Showing 100% human-vetted free submission portals, citation directories, digital PR platforms, and editorial guest opportunities.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={handleRunDiscovery}
            disabled={discovering}
            className="dgs-saas-btn primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}
          >
            <RefreshCw size={14} className={discovering ? "animate-spin" : ""} />
            {discovering ? "Discovering Opportunities..." : "Run Daily Discovery"}
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

      {/* Filter Tabs & Toolbar */}
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
        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Region:</span>
        {["ALL", "INDIA", "UAE", "USA", "GLOBAL"].map((r) => (
          <button
            key={r}
            onClick={() => setSelectedRegion(r)}
            className={`dgs-saas-chip ${selectedRegion === r ? "primary" : ""}`}
            style={{ cursor: "pointer", border: "none" }}
          >
            {r}
          </button>
        ))}

        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", fontWeight: 600, marginLeft: "14px" }}>
          Priority:
        </span>
        {["ALL", "P0", "P1", "P2", "P3"].map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPriority(p)}
            className={`dgs-saas-chip ${selectedPriority === p ? "primary" : ""}`}
            style={{ cursor: "pointer", border: "none" }}
          >
            {p}
          </button>
        ))}

        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", fontWeight: 600, marginLeft: "14px" }}>
          Status:
        </span>
        {["ALL", "NEW", "APPROVED", "SUBMITTED", "LIVE"].map((s) => (
          <button
            key={s}
            onClick={() => setSelectedStatus(s)}
            className={`dgs-saas-chip ${selectedStatus === s ? "primary" : ""}`}
            style={{ cursor: "pointer", border: "none" }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Main SaaS Table */}
      <div className="dgs-saas-card" style={{ padding: "16px" }}>
        <SaaSTable<OffPageOpportunity>
          columns={columns}
          data={opportunities}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search site name, domain, category..."
          searchFilter={(item, q) =>
            item.site_name.toLowerCase().includes(q) ||
            item.domain.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            (item.recommended_service || "").toLowerCase().includes(q)
          }
          actions={(item) => (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                onClick={() => {
                  setEditingOpp(item);
                  setNewStatus(item.status);
                }}
                className="dgs-saas-btn secondary"
                style={{ fontSize: "0.72rem", padding: "4px 8px" }}
              >
                Status
              </button>
              <button
                onClick={() => handleOpenOutreachModal(item)}
                className="dgs-saas-btn primary"
                style={{ fontSize: "0.72rem", padding: "4px 8px" }}
              >
                Outreach
              </button>
            </div>
          )}
          initialPageSize={15}
          emptyMessage="No matching free opportunities found."
        />
      </div>

      {/* Edit Status Modal */}
      {editingOpp && (
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
          <div
            className="dgs-saas-card"
            style={{
              width: "100%",
              maxWidth: "480px",
              padding: "24px",
              background: "#111827",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem" }}>Update Opportunity Status</h3>
              <button onClick={() => setEditingOpp(null)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>Platform:</div>
              <div style={{ fontWeight: 650, color: "#fff", fontSize: "1rem" }}>{editingOpp.site_name} ({editingOpp.domain})</div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "0.82rem", color: "rgba(255,255,255,0.8)", marginBottom: "8px" }}>
                Select Status:
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OpportunityStatus)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                }}
              >
                <option value="NEW">NEW — Uncontacted / Fresh</option>
                <option value="QUALIFIED">QUALIFIED — Vetted for Relevance</option>
                <option value="APPROVED">APPROVED — Ready for Outreach</option>
                <option value="CONTACTED">CONTACTED — Pitch Sent</option>
                <option value="SUBMITTED">SUBMITTED — Form/Listing Lodged</option>
                <option value="LIVE">LIVE — Active Verified Backlink</option>
                <option value="REJECTED">REJECTED — Irrelevant / Poor Quality</option>
                <option value="NOT_FREE">NOT_FREE — Requires Payment (Excluded)</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setEditingOpp(null)} className="dgs-saas-btn secondary">
                Cancel
              </button>
              <button onClick={handleUpdateStatus} disabled={savingStatus} className="dgs-saas-btn primary">
                {savingStatus ? "Saving..." : "Save Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Outreach CRM Modal */}
      {convertingOpp && (
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
          <div
            className="dgs-saas-card"
            style={{
              width: "100%",
              maxWidth: "600px",
              padding: "24px",
              background: "#111827",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Send size={18} color="var(--dgs-brand-cyan)" />
                <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem" }}>Queue in Outreach CRM</h3>
              </div>
              <button onClick={() => setConvertingOpp(null)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>Platform:</span>
                <div style={{ fontWeight: 600, color: "#fff" }}>{convertingOpp.site_name}</div>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>Target DGS Page:</span>
                <div style={{ fontWeight: 600, color: "var(--dgs-brand-cyan)", fontSize: "0.8rem" }}>
                  {convertingOpp.recommended_dgs_target_page}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Pitch Subject:
              </label>
              <input
                type="text"
                value={outreachSubject}
                onChange={(e) => setOutreachSubject(e.target.value)}
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

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Pitch Content:
              </label>
              <textarea
                rows={6}
                value={outreachPitch}
                onChange={(e) => setOutreachPitch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "0.82rem",
                  fontFamily: "monospace",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>
                <ShieldCheck size={14} /> Requires human approval before sending
              </span>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setConvertingOpp(null)} className="dgs-saas-btn secondary">
                  Cancel
                </button>
                <button onClick={handleConfirmOutreach} disabled={converting} className="dgs-saas-btn primary">
                  {converting ? "Queuing..." : "Confirm & Queue"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
