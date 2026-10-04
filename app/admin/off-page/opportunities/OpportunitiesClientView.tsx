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
  Upload,
  FileSpreadsheet,
} from "lucide-react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import type { OffPageOpportunity, RegionCode, PriorityTier, OpportunityStatus } from "@/lib/off-page/types";

interface Props {
  initialOpportunities?: OffPageOpportunity[];
}

export default function OpportunitiesClientView({ initialOpportunities }: Props) {
  const [opportunities, setOpportunities] = useState<OffPageOpportunity[]>(initialOpportunities || []);
  const [loading, setLoading] = useState(!initialOpportunities);
  const [viewMode, setViewMode] = useState<"ALL" | "TODAY">("ALL");
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [discovering, setDiscovering] = useState(false);
  const [feedback, setFeedback] = useState<React.ReactNode | null>(null);

  // Status Edit Modal State
  const [editingOpp, setEditingOpp] = useState<OffPageOpportunity | null>(null);
  const [newStatus, setNewStatus] = useState<OpportunityStatus>("NEW");
  const [savingStatus, setSavingStatus] = useState(false);

  // Outreach Conversion Modal State
  const [convertingOpp, setConvertingOpp] = useState<OffPageOpportunity | null>(null);
  const [outreachSubject, setOutreachSubject] = useState("");
  const [outreachPitch, setOutreachPitch] = useState("");
  const [converting, setConverting] = useState(false);

  // Batch Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);

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
        if (json.insertedCount > 0) {
          setFeedback(`Discovery complete: ${json.insertedCount} new verified opportunities added.`);
        } else {
          setFeedback(json.message || "NO NET-NEW VERIFIED OPPORTUNITIES FOUND TODAY");
        }
        await fetchOpportunities();
      } else {
        setFeedback(`Discovery error: ${json.error || json.message || "Unknown error"}`);
      }
    } catch (err: any) {
      setFeedback(`Error running discovery: ${err.message}`);
    } finally {
      setDiscovering(false);
      setTimeout(() => setFeedback(null), 8000);
    }
  };

  const handleBatchImport = async () => {
    if (!importText.trim()) return;
    setImporting(true);
    setFeedback(null);
    try {
      let payload: any;
      if (importText.trim().startsWith("[") || importText.trim().startsWith("{")) {
        const parsed = JSON.parse(importText);
        payload = { records: Array.isArray(parsed) ? parsed : [parsed] };
      } else {
        payload = { csv_text: importText };
      }

      const res = await fetch("/api/admin/off-page/opportunities/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.ok) {
        setFeedback(`Batch import complete: ${json.imported} imported, ${json.duplicates} duplicates skipped.`);
        setShowImportModal(false);
        setImportText("");
        await fetchOpportunities();
      } else {
        setFeedback(`Import failed: ${json.error || json.errors?.join("; ")}`);
      }
    } catch (err: any) {
      setFeedback(`Import error: ${err.message}`);
    } finally {
      setImporting(false);
      setTimeout(() => setFeedback(null), 8000);
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

  const handleOpenOutreachModal = (opp: OffPageOpportunity) => {
    setConvertingOpp(opp);
    setOutreachSubject(`Resource Suggestion & Collaboration: D'Genius Solutions x ${opp.site_name}`);
    setOutreachPitch(
      `Hi ${opp.site_name} Editorial Team,\n\nI hope you are having a productive week.\n\nI came across your directory and resource guide at ${opp.domain} and appreciate your thoughtful industry curation.\n\nAt D'Genius Solutions, we produce enterprise AI video campaigns, technical SEO, and generative search optimization (GEO) for clients across India, UAE, and global markets.\n\nI wanted to suggest considering D'Genius Solutions (${opp.recommended_dgs_target_page}) for inclusion in your verified directory.\n\nCould we explore a listing or thought-leadership collaboration?\n\nBest regards,\n\nKohin Bellara\nCEO, D'Genius Solutions\nhttps://www.dgeniussolutions.com/`
    );
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
          source_module: "OPPORTUNITIES",
          source_record_id: convertingOpp.id,
          target_domain: convertingOpp.domain,
          target_url: convertingOpp.exact_submission_url || convertingOpp.domain,
          publication: convertingOpp.site_name,
          campaign_type: convertingOpp.category,
          stage: "DRAFT",
          pitch_subject: outreachSubject,
          pitch_body: outreachPitch,
          target_page: convertingOpp.recommended_dgs_target_page,
          assigned_staff: "Kohin Bellara - CEO D'Genius Solutions",
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setOpportunities((prev) =>
          prev.map((o) => (o.id === convertingOpp.id ? { ...o, status: "APPROVED" } : o))
        );
        setConvertingOpp(null);
        setFeedback(
          <span>
            Draft saved successfully.{" "}
            <a
              href="/admin/off-page/outreach?stage=DRAFT"
              style={{ color: "var(--dgs-brand-cyan)", textDecoration: "underline", fontWeight: 700 }}
            >
              View in Outreach CRM (Drafts) &rarr;
            </a>
          </span>
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConverting(false);
      setTimeout(() => setFeedback(null), 8000);
    }
  };

  // Filter opportunities for "TODAY'S NEW OPPORTUNITIES"
  const todayStr = new Date().toISOString().slice(0, 10);
  const displayedOpportunities = opportunities.filter((o) => {
    if (viewMode === "TODAY") {
      const disc = o.discovered_at ? o.discovered_at.slice(0, 10) : o.created_at ? o.created_at.slice(0, 10) : "";
      return disc === todayStr || o.status === "NEW";
    }
    return true;
  });

  const columns: Column<OffPageOpportunity>[] = [
    {
      key: "site_name",
      header: "Site & Domain",
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
                title="Open Exact Action URL"
                style={{ color: "var(--dgs-brand-cyan)", display: "inline-flex" }}
              >
                <ExternalLink size={13} />
              </a>
            )}
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>{opp.domain}</div>
        </div>
      ),
    },
    {
      key: "region",
      header: "Region",
      sortable: true,
      render: (opp) => (
        <div>
          <span
            style={{
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "0.7rem",
              fontWeight: 700,
              background:
                opp.region === "INDIA"
                  ? "rgba(245, 158, 11, 0.15)"
                  : opp.region === "UAE"
                  ? "rgba(16, 185, 129, 0.15)"
                  : opp.region === "USA"
                  ? "rgba(59, 130, 246, 0.15)"
                  : "rgba(156, 163, 175, 0.15)",
              color:
                opp.region === "INDIA"
                  ? "#fbbf24"
                  : opp.region === "UAE"
                  ? "#34d399"
                  : opp.region === "USA"
                  ? "#60a5fa"
                  : "#9ca3af",
            }}
          >
            {opp.region}
          </span>
          <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>
            {opp.country || "Global"}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Opportunity Type",
      sortable: true,
      render: (opp) => (
        <span style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.85)" }}>
          {opp.category?.replace(/_/g, " ") || "DIRECTORY"}
        </span>
      ),
    },
    {
      key: "free_status",
      header: "Cost Tier",
      render: (opp) => (
        <span
          style={{
            fontSize: "0.7rem",
            padding: "2px 6px",
            borderRadius: "4px",
            fontWeight: 700,
            background: opp.free_status === "FREE" ? "rgba(16, 185, 129, 0.15)" : "rgba(59, 130, 246, 0.15)",
            color: opp.free_status === "FREE" ? "#34d399" : "#60a5fa",
          }}
        >
          {opp.free_status || "FREE"}
        </span>
      ),
    },
    {
      key: "priority_tier",
      header: "Priority & Quality",
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
          <div>
            <span
              style={{
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: "0.7rem",
                fontWeight: 800,
                background: c.bg,
                color: c.text,
              }}
            >
              {opp.priority_tier}
            </span>
            <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>
              Auth: {opp.authority_score || 85}
            </div>
          </div>
        );
      },
    },
    {
      key: "recommended_dgs_target_page",
      header: "Target DGS Page",
      render: (opp) => (
        <span
          style={{
            fontSize: "0.72rem",
            color: "rgba(255,255,255,0.7)",
            maxWidth: "150px",
            display: "inline-block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={opp.recommended_dgs_target_page}
        >
          {opp.recommended_dgs_target_page.replace("https://www.dgeniussolutions.com", "") || "/"}
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
          OUTREACH: "#f59e0b",
          SUBMITTED: "#f472b6",
          LIVE: "#10b981",
          VERIFIED: "#34d399",
          REJECTED: "#ef4444",
          NOT_FREE: "#9ca3af",
        };
        return (
          <span
            style={{
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "0.68rem",
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
            Free Authority Opportunities Pipeline
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
            Curated 100% free submission portals, citation directories, and digital PR outlets across India, UAE, USA, and Global markets.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => setShowImportModal(true)}
            className="dgs-saas-btn secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Upload size={14} /> Import Verified Batch
          </button>

          <button
            onClick={handleRunDiscovery}
            disabled={discovering}
            className="dgs-saas-btn primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}
          >
            <RefreshCw size={14} className={discovering ? "animate-spin" : ""} />
            {discovering ? "Checking Discovery Feeds..." : "Run Daily Discovery"}
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

      {/* Main View Queue Switcher */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "8px 12px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "var(--dgs-radius-md)",
        }}
      >
        <button
          onClick={() => setViewMode("ALL")}
          className={`dgs-saas-chip ${viewMode === "ALL" ? "primary" : ""}`}
          style={{ cursor: "pointer", border: "none", fontWeight: 700 }}
        >
          ALL OPPORTUNITIES ({opportunities.length})
        </button>
        <button
          onClick={() => setViewMode("TODAY")}
          className={`dgs-saas-chip ${viewMode === "TODAY" ? "primary" : ""}`}
          style={{ cursor: "pointer", border: "none", fontWeight: 700 }}
        >
          TODAY'S NEW OPPORTUNITIES ({displayedOpportunities.length})
        </button>
      </div>

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
        {["ALL", "NEW", "QUALIFIED", "APPROVED", "OUTREACH", "SUBMITTED", "LIVE"].map((s) => (
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
          data={displayedOpportunities}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search site, domain, category, target page..."
          searchFilter={(item, q) =>
            item.site_name.toLowerCase().includes(q) ||
            item.domain.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.recommended_dgs_target_page.toLowerCase().includes(q)
          }
          actions={(item) => (
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => handleOpenOutreachModal(item)}
                className="dgs-saas-btn primary"
                style={{ fontSize: "0.72rem", padding: "4px 8px", display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                <Send size={11} /> Create Draft
              </button>
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
            </div>
          )}
          initialPageSize={12}
          emptyMessage={
            viewMode === "TODAY"
              ? "NO NET-NEW VERIFIED OPPORTUNITIES FOUND TODAY"
              : "No opportunities match your filter."
          }
        />
      </div>

      {/* Import Verified Batch Modal */}
      {showImportModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
        >
          <div
            className="dgs-saas-card"
            style={{
              width: "100%",
              maxWidth: "640px",
              padding: "24px",
              background: "#111827",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileSpreadsheet size={20} color="var(--dgs-brand-cyan)" />
                <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem" }}>Import Verified Research Batch</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", margin: "0 0 12px 0" }}>
              Paste verified CSV or JSON records. Duplicates, paid-only link schemes, and invalid URLs will be rejected automatically.
            </p>

            <textarea
              rows={10}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`site_name,domain,exact_action_url,region,country,category,free_status,target_page,verification_status,verification_date,evidence\nHubSpot Marketplace,hubspot.com,https://ecosystem.hubspot.com/marketplace/solutions,GLOBAL,Global,AGENCY_DIRECTORY,FREE,https://www.dgeniussolutions.com/,QUALIFIED,2026-10-04,Verified partner portal`}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                background: "#1f2937",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                fontSize: "0.78rem",
                fontFamily: "monospace",
                marginBottom: "16px",
              }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>
                Strict DGS Free-Only Validation Enforced
              </span>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setShowImportModal(false)} className="dgs-saas-btn secondary">
                  Cancel
                </button>
                <button onClick={handleBatchImport} disabled={importing} className="dgs-saas-btn primary">
                  {importing ? "Validating & Ingesting..." : "Ingest Verified Batch"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Opportunity Status Modal */}
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
              maxWidth: "460px",
              padding: "24px",
              background: "#111827",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem" }}>Edit Opportunity Status</h3>
              <button onClick={() => setEditingOpp(null)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", marginBottom: "6px" }}>
                Select Status for {editingOpp.site_name}:
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
                  fontSize: "0.85rem",
                }}
              >
                <option value="NEW">NEW — Newly Discovered</option>
                <option value="QUALIFIED">QUALIFIED — Vetted for Relevance</option>
                <option value="APPROVED">APPROVED — Ready for Outreach</option>
                <option value="CONTACTED">CONTACTED — Pitch Initiated</option>
                <option value="SUBMITTED">SUBMITTED — Lodged with Site</option>
                <option value="LIVE">LIVE — Active Link Confirmed</option>
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

      {/* Convert to Outreach CRM Draft Modal */}
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
              maxWidth: "620px",
              padding: "24px",
              background: "#111827",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Send size={18} color="var(--dgs-brand-cyan)" />
                <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem" }}>
                  Save Outreach Draft: {convertingOpp.site_name}
                </h3>
              </div>
              <button onClick={() => setConvertingOpp(null)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: "10px", fontSize: "0.74rem", color: "rgba(255,255,255,0.7)" }}>
              Sender: <strong style={{ color: "#fff" }}>Kohin Bellara - CEO D'Genius Solutions</strong>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "0.78rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
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
              <label style={{ display: "block", fontSize: "0.78rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Pitch Content:
              </label>
              <textarea
                rows={7}
                value={outreachPitch}
                onChange={(e) => setOutreachPitch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "0.8rem",
                  fontFamily: "monospace",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.72rem", color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>
                <ShieldCheck size={14} /> Saves to Outreach CRM Drafts for Review
              </span>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setConvertingOpp(null)} className="dgs-saas-btn secondary">
                  Cancel
                </button>
                <button onClick={handleConfirmOutreach} disabled={converting} className="dgs-saas-btn primary">
                  {converting ? "Saving Draft..." : "Save Draft to Outreach CRM"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
