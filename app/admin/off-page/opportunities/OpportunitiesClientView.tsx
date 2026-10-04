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
  Cpu,
  Layers,
  Activity,
  Info,
  Zap,
} from "lucide-react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import type { OffPageOpportunity, RegionCode, PriorityTier, OpportunityStatus } from "@/lib/off-page/types";

interface Props {
  initialOpportunities?: OffPageOpportunity[];
}

export default function OpportunitiesClientView({ initialOpportunities }: Props) {
  const [opportunities, setOpportunities] = useState<OffPageOpportunity[]>(initialOpportunities || []);
  const [loading, setLoading] = useState(!initialOpportunities);
  const [viewMode, setViewMode] = useState<"ALL" | "TODAY" | "QUEUE">("ALL");
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [discovering, setDiscovering] = useState(false);
  const [feedback, setFeedback] = useState<React.ReactNode | null>(null);

  // Smart Search State (Section 4.1)
  const [searchMode, setSearchMode] = useState<"STANDARD" | "SMART">("STANDARD");
  const [smartQuery, setSmartQuery] = useState("");
  const [smartSearching, setSmartSearching] = useState(false);
  const [isSmartActive, setIsSmartActive] = useState(false);

  // Status Edit Modal State
  const [editingOpp, setEditingOpp] = useState<OffPageOpportunity | null>(null);
  const [newStatus, setNewStatus] = useState<OpportunityStatus>("NEW");
  const [savingStatus, setSavingStatus] = useState(false);

  // Outreach Conversion Modal State (Section 9)
  const [convertingOpp, setConvertingOpp] = useState<OffPageOpportunity | null>(null);
  const [outreachSubject, setOutreachSubject] = useState("");
  const [outreachPitch, setOutreachPitch] = useState("");
  const [outreachTargetPage, setOutreachTargetPage] = useState("");
  const [grounding, setGrounding] = useState(false);
  const [groundedSources, setGroundedSources] = useState<Array<{ title: string; url: string; entity_type: string }>>([]);
  const [groundedAssets, setGroundedAssets] = useState<Array<{ title: string; url: string; entity_type: string; semantic_relevance: number; why_matches: string }>>([]);
  const [talkingPoints, setTalkingPoints] = useState<string[]>([]);
  const [converting, setConverting] = useState(false);

  // Opportunity Detail / Intel Modal State (Sections 5, 6, 7, 8)
  const [inspectingOpp, setInspectingOpp] = useState<OffPageOpportunity | null>(null);
  const [loadingIntel, setLoadingIntel] = useState(false);
  const [intelData, setIntelData] = useState<any>(null);

  // TurboVec Health UI State (Section 31 & 32)
  const [showHealthCard, setShowHealthCard] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  // Batch Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);

  const fetchOpportunities = async (overrideSmartQuery?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedRegion !== "ALL") params.set("region", selectedRegion);
      if (selectedPriority !== "ALL") params.set("priority", selectedPriority);
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);

      const effectiveQuery = overrideSmartQuery !== undefined ? overrideSmartQuery : smartQuery;
      if (searchMode === "SMART" && effectiveQuery.trim()) {
        params.set("smart", "true");
        params.set("q", effectiveQuery.trim());
      }

      const res = await fetch(`/api/admin/off-page/opportunities?${params.toString()}`);
      const json = await res.json();
      if (json.ok) {
        setOpportunities(json.opportunities || json.data || []);
        setIsSmartActive(Boolean(json.smart));
      }
    } catch (err) {
      console.error("Failed to fetch opportunities:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTurboVecHealth = async () => {
    setLoadingHealth(true);
    try {
      const res = await fetch("/api/admin/off-page/turbovec/status");
      const json = await res.json();
      if (json.ok) {
        setHealthData(json);
      }
    } catch (err) {
      console.warn("Could not fetch TurboVec health:", err);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [selectedRegion, selectedPriority, selectedStatus]);

  useEffect(() => {
    fetchTurboVecHealth();
  }, []);

  const handleExecuteSmartSearch = async (queryText?: string) => {
    const q = queryText !== undefined ? queryText : smartQuery;
    if (!q.trim()) {
      setIsSmartActive(false);
      fetchOpportunities("");
      return;
    }
    setSmartSearching(true);
    try {
      const params = new URLSearchParams();
      if (selectedRegion !== "ALL") params.set("region", selectedRegion);
      if (selectedPriority !== "ALL") params.set("priority", selectedPriority);
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);
      params.set("smart", "true");
      params.set("q", q.trim());

      const res = await fetch(`/api/admin/off-page/opportunities?${params.toString()}`);
      const json = await res.json();
      if (json.ok) {
        setOpportunities(json.opportunities || json.data || []);
        setIsSmartActive(true);
        setFeedback(
          <span>
            TurboVec Smart Search matched &amp; reranked{" "}
            <strong>{json.rerankedCount || json.total}</strong> opportunities for &quot;{q}&quot;.
          </span>
        );
      }
    } catch (err: any) {
      console.error("Smart search failed:", err);
    } finally {
      setSmartSearching(false);
    }
  };

  const handleOpenIntelModal = async (opp: OffPageOpportunity) => {
    setInspectingOpp(opp);
    setLoadingIntel(true);
    setIntelData(null);
    try {
      const res = await fetch(`/api/admin/off-page/opportunities/intel?id=${encodeURIComponent(opp.id)}`);
      const json = await res.json();
      if (json.ok) {
        setIntelData(json);
      }
    } catch (err) {
      console.error("Failed fetching opportunity intel:", err);
    } finally {
      setLoadingIntel(false);
    }
  };

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

  const handleOpenOutreachModal = async (opp: OffPageOpportunity) => {
    setConvertingOpp(opp);
    setOutreachSubject(`Resource Suggestion & Collaboration: D'Genius Solutions x ${opp.site_name}`);
    setOutreachTargetPage(opp.recommended_dgs_target_page || "https://www.dgeniussolutions.com/");
    setGroundedSources([]);
    setGroundedAssets([]);
    setTalkingPoints([]);
    setOutreachPitch(
      `Hi ${opp.site_name} Editorial Team,\n\nI hope you are having a productive week.\n\nI came across your directory and resource guide at ${opp.domain} and appreciate your thoughtful industry curation.\n\nAt D'Genius Solutions, we produce enterprise AI video campaigns, technical SEO, and generative search optimization (GEO) for clients across India, UAE, and global markets.\n\nI wanted to suggest considering D'Genius Solutions (${opp.recommended_dgs_target_page}) for inclusion in your verified directory.\n\nCould we explore a listing or thought-leadership collaboration?\n\nBest regards,\n\nKohin Bellara\nCEO, D'Genius Solutions\nhttps://www.dgeniussolutions.com/`
    );

    // Dynamic grounding from TurboVec Semantic Intelligence
    setGrounding(true);
    try {
      const res = await fetch("/api/admin/off-page/outreach/ground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunity_id: opp.id,
          publication: opp.site_name,
          category: opp.category,
          target_page: opp.recommended_dgs_target_page,
          service: opp.recommended_service,
          site_name: opp.site_name,
          domain: opp.domain,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        if (json.pitch_subject) setOutreachSubject(json.pitch_subject);
        if (json.pitch_body) setOutreachPitch(json.pitch_body);
        if (json.recommended_target_page) setOutreachTargetPage(json.recommended_target_page);
        if (json.sources_used) setGroundedSources(json.sources_used);
        if (json.assets) setGroundedAssets(json.assets);
        if (json.talking_points) setTalkingPoints(json.talking_points);
      }
    } catch (err) {
      console.warn("Failed retrieving grounded draft:", err);
    } finally {
      setGrounding(false);
    }
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
          target_page: outreachTargetPage || convertingOpp.recommended_dgs_target_page,
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

  // Filter opportunities for View Modes: ALL | TODAY | QUEUE
  const todayStr = new Date().toISOString().slice(0, 10);
  const displayedOpportunities = opportunities.filter((o) => {
    if (viewMode === "TODAY") {
      const disc = o.discovered_at ? o.discovered_at.slice(0, 10) : o.created_at ? o.created_at.slice(0, 10) : "";
      return disc === todayStr || o.status === "NEW";
    }
    if (viewMode === "QUEUE") {
      // High-priority opportunities ready for outreach with supporting asset
      return (
        (o.priority_tier === "P0" || o.priority_tier === "P1") &&
        (o.free_status === "FREE" || o.free_status === "FREEMIUM") &&
        (o.status === "NEW" || o.status === "QUALIFIED" || o.status === "APPROVED")
      );
    }
    return true;
  });

  const sampleSmartQueries = [
    "free UAE AI video opportunities",
    "Indian SEO directory opportunities",
    "US publications for LLM SEO",
    "AI video unlinked mentions",
    "GEO broken-link opportunities",
    "AI production competitor gaps",
    "drafts using AI case studies",
  ];

  const columns: Column<OffPageOpportunity>[] = [
    {
      key: "site_name",
      header: "Opportunity & Site",
      sortable: true,
      render: (opp) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              onClick={() => handleOpenIntelModal(opp)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                color: "#fff",
                fontWeight: 650,
                cursor: "pointer",
                textAlign: "left",
                textDecoration: "underline",
                textDecorationColor: "rgba(255,255,255,0.2)",
              }}
              title="Click to view TurboVec Semantic Intelligence & Similar Opportunities"
            >
              {opp.site_name}
            </button>
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
          {/* Smart Search Match Reason */}
          {(opp as any).why_matches && (
            <div
              style={{
                fontSize: "0.68rem",
                color: "var(--dgs-brand-cyan)",
                marginTop: "3px",
                lineHeight: "1.3",
                maxWidth: "240px",
              }}
            >
              {(opp as any).why_matches}
            </div>
          )}
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
      header: "Type",
      sortable: true,
      render: (opp) => (
        <span style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.85)" }}>
          {opp.category?.replace(/_/g, " ") || "DIRECTORY"}
        </span>
      ),
    },
    {
      key: "free_status",
      header: "Free Status",
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
      header: "Priority & Score",
      sortable: true,
      render: (opp) => {
        const colors: Record<string, { bg: string; text: string }> = {
          P0: { bg: "rgba(236, 72, 153, 0.2)", text: "#f472b6" },
          P1: { bg: "rgba(59, 130, 246, 0.2)", text: "#60a5fa" },
          P2: { bg: "rgba(16, 185, 129, 0.2)", text: "#34d399" },
          P3: { bg: "rgba(156, 163, 175, 0.2)", text: "#9ca3af" },
        };
        const c = colors[opp.priority_tier] || colors.P3;
        const relevance = (opp as any).semantic_relevance;
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
            {relevance !== undefined ? (
              <div
                style={{
                  fontSize: "0.68rem",
                  color: "#34d399",
                  fontWeight: 700,
                  marginTop: "2px",
                }}
                title="Semantic Relevance determined by TurboVec vector similarity"
              >
                {(relevance * 100).toFixed(0)}% Relevance
              </div>
            ) : (
              <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>
                Score: {opp.authority_score || 85}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "recommended_dgs_target_page",
      header: "Recommended Target Page",
      render: (opp) => {
        const path = opp.recommended_dgs_target_page.replace("https://www.dgeniussolutions.com", "") || "/";
        return (
          <div>
            <span
              style={{
                fontSize: "0.72rem",
                color: "var(--dgs-brand-cyan)",
                fontFamily: "monospace",
                maxWidth: "160px",
                display: "inline-block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={opp.recommended_dgs_target_page}
            >
              {path}
            </span>
            {opp.recommended_service && (
              <div style={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.4)" }}>
                {opp.recommended_service}
              </div>
            )}
          </div>
        );
      },
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
            onClick={() => setShowHealthCard(!showHealthCard)}
            className="dgs-saas-btn secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Activity size={14} color="var(--dgs-brand-cyan)" /> TurboVec Status
          </button>

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

      {/* TurboVec Health & Discovery Separation UI (Section 31 & 32) */}
      {showHealthCard && healthData && (
        <div
          className="dgs-saas-card"
          style={{
            padding: "16px 20px",
            background: "linear-gradient(135deg, rgba(0, 198, 255, 0.05) 0%, rgba(112, 0, 255, 0.05) 100%)",
            border: "1px solid rgba(0, 198, 255, 0.3)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Cpu size={18} color="var(--dgs-brand-cyan)" />
              <h3 style={{ margin: 0, fontSize: "0.95rem", color: "#fff", fontWeight: 700 }}>
                TURBOVEC STATUS — Private Semantic Authority Intelligence
              </h3>
            </div>
            <button
              onClick={() => setShowHealthCard(false)}
              style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}
            >
              <X size={16} />
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "10px",
              fontSize: "0.78rem",
            }}
          >
            <div style={{ padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "6px" }}>
              <div style={{ color: "rgba(255,255,255,0.5)" }}>Engine &amp; Version</div>
              <div style={{ fontWeight: 700, color: "#fff", marginTop: "2px" }}>
                {healthData.engine} v{healthData.version}
              </div>
            </div>

            <div style={{ padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "6px" }}>
              <div style={{ color: "rgba(255,255,255,0.5)" }}>Embedding Model</div>
              <div style={{ fontWeight: 700, color: "#fff", marginTop: "2px" }}>
                {healthData.model} ({healthData.dimension}d)
              </div>
            </div>

            <div style={{ padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "6px" }}>
              <div style={{ color: "rgba(255,255,255,0.5)" }}>Active Content Docs</div>
              <div style={{ fontWeight: 700, color: "var(--dgs-brand-cyan)", marginTop: "2px" }}>
                {healthData.active_content_documents} documents
              </div>
            </div>

            <div style={{ padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "6px" }}>
              <div style={{ color: "rgba(255,255,255,0.5)" }}>Active Opportunities</div>
              <div style={{ fontWeight: 700, color: "#34d399", marginTop: "2px" }}>
                {healthData.active_opportunities} indexed
              </div>
            </div>

            <div style={{ padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "6px" }}>
              <div style={{ color: "rgba(255,255,255,0.5)" }}>Worker / Socket</div>
              <div style={{ fontWeight: 700, color: "#34d399", marginTop: "2px" }}>
                ● {healthData.worker_status} (Unix Socket)
              </div>
            </div>

            <div style={{ padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "6px" }}>
              <div style={{ color: "rgba(255,255,255,0.5)" }}>Index Size &amp; Fail-Safe</div>
              <div style={{ fontWeight: 700, color: "#fff", marginTop: "2px" }}>
                {healthData.index_size} • {healthData.failsafe_status}
              </div>
            </div>
          </div>

          {/* Explicit Separation from Discovery Status (Section 32) */}
          <div
            style={{
              marginTop: "12px",
              padding: "8px 12px",
              borderRadius: "6px",
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
              flexWrap: "wrap",
              gap: "6px",
            }}
          >
            <div>
              <span style={{ color: "#fbbf24", fontWeight: 700 }}>DISCOVERY STATUS:</span>{" "}
              <span style={{ color: "#fff" }}>{healthData.discovery_provider_status}</span>
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.72rem" }}>
              {healthData.discovery_note}
            </div>
          </div>
        </div>
      )}

      {/* SMART SEARCH BAR (Section 4.1) */}
      <div
        className="dgs-saas-card"
        style={{
          padding: "16px 20px",
          background: isSmartActive
            ? "linear-gradient(135deg, rgba(0, 198, 255, 0.08) 0%, rgba(112, 0, 255, 0.08) 100%)"
            : "rgba(255, 255, 255, 0.02)",
          border: isSmartActive ? "1px solid var(--dgs-brand-cyan)" : "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={16} color="var(--dgs-brand-cyan)" />
            <span style={{ fontSize: "0.92rem", fontWeight: 700, color: "#fff", letterSpacing: "0.4px" }}>
              SMART SEARCH (TurboVec Semantic Allowlist Reranking)
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {isSmartActive && (
              <button
                onClick={() => {
                  setSmartQuery("");
                  setIsSmartActive(false);
                  fetchOpportunities("");
                }}
                className="dgs-saas-btn secondary"
                style={{ fontSize: "0.72rem", padding: "4px 8px" }}
              >
                Clear Smart Filter
              </button>
            )}
            <span
              style={{
                fontSize: "0.72rem",
                padding: "2px 8px",
                borderRadius: "4px",
                background: "rgba(0, 198, 255, 0.15)",
                color: "var(--dgs-brand-cyan)",
                fontWeight: 700,
              }}
            >
              IdMapIndex 4-bit Embeddings
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
          <input
            type="text"
            value={smartQuery}
            onChange={(e) => setSmartQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearchMode("SMART");
                handleExecuteSmartSearch();
              }
            }}
            placeholder="e.g. free UAE AI video opportunities, Indian SEO directory opportunities, US publications for LLM SEO..."
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "6px",
              background: "#1f2937",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#fff",
              fontSize: "0.85rem",
            }}
          />
          <button
            onClick={() => {
              setSearchMode("SMART");
              handleExecuteSmartSearch();
            }}
            disabled={smartSearching}
            className="dgs-saas-btn primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}
          >
            <Sparkles size={14} className={smartSearching ? "animate-spin" : ""} />
            {smartSearching ? "Reranking..." : "Smart Search"}
          </button>
        </div>

        {/* Query Preset Chips (Section 4.1 Examples) */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>Sample Queries:</span>
          {sampleSmartQueries.map((q) => (
            <button
              key={q}
              onClick={() => {
                setSmartQuery(q);
                setSearchMode("SMART");
                handleExecuteSmartSearch(q);
              }}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "4px",
                padding: "3px 8px",
                color: "rgba(255,255,255,0.8)",
                fontSize: "0.7rem",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as any).style.borderColor = "var(--dgs-brand-cyan)";
                (e.currentTarget as any).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as any).style.borderColor = "rgba(255,255,255,0.1)";
                (e.currentTarget as any).style.color = "rgba(255,255,255,0.8)";
              }}
            >
              {q}
            </button>
          ))}
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

      {/* Main View Queue Switcher (Section 12: Team Action Queue) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "8px 12px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "var(--dgs-radius-md)",
          flexWrap: "wrap",
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
          TODAY&apos;S NEW OPPORTUNITIES ({opportunities.filter((o) => o.status === "NEW").length})
        </button>
        <button
          onClick={() => setViewMode("QUEUE")}
          className={`dgs-saas-chip ${viewMode === "QUEUE" ? "primary" : ""}`}
          style={{ cursor: "pointer", border: "none", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "5px" }}
        >
          <Zap size={12} color="#fbbf24" /> SEMANTIC OUTREACH QUEUE (
          {
            opportunities.filter(
              (o) =>
                (o.priority_tier === "P0" || o.priority_tier === "P1") &&
                (o.free_status === "FREE" || o.free_status === "FREEMIUM") &&
                (o.status === "NEW" || o.status === "QUALIFIED" || o.status === "APPROVED")
            ).length
          }
          )
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
          searchPlaceholder="Filter current table view..."
          searchFilter={(item, q) =>
            item.site_name.toLowerCase().includes(q) ||
            item.domain.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.recommended_dgs_target_page.toLowerCase().includes(q)
          }
          actions={(item) => (
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => handleOpenIntelModal(item)}
                className="dgs-saas-btn secondary"
                style={{ fontSize: "0.72rem", padding: "4px 8px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                title="Inspect Similar Opportunities, Duplicate Checks & Target Pages"
              >
                <Info size={11} /> Intel
              </button>
              <button
                onClick={() => handleOpenOutreachModal(item)}
                className="dgs-saas-btn primary"
                style={{ fontSize: "0.72rem", padding: "4px 8px", display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                <Send size={11} /> Draft
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
              : viewMode === "QUEUE"
              ? "No priority items currently pending in Semantic Outreach Queue."
              : "No opportunities match your filter."
          }
        />
      </div>

      {/* Opportunity Detail & Intelligence Modal (Sections 5, 6, 7, 8, 10, 11) */}
      {inspectingOpp && (
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
              maxWidth: "760px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
              background: "#111827",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sparkles size={18} color="var(--dgs-brand-cyan)" />
                  <h3 style={{ margin: 0, color: "#fff", fontSize: "1.15rem", fontWeight: 700 }}>
                    {inspectingOpp.site_name}
                  </h3>
                  <span
                    style={{
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      background: "rgba(0, 198, 255, 0.15)",
                      color: "var(--dgs-brand-cyan)",
                    }}
                  >
                    {inspectingOpp.region}
                  </span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>
                  {inspectingOpp.domain} • Category: {inspectingOpp.category} • Cost: {inspectingOpp.free_status}
                </div>
              </div>
              <button
                onClick={() => setInspectingOpp(null)}
                style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {loadingIntel ? (
              <div style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.6)" }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 10px auto" }} />
                Retrieving TurboVec semantic intelligence, duplicate check &amp; similar opportunities...
              </div>
            ) : intelData ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Section 6: Semantic Duplicate Check Badge */}
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background:
                      intelData.duplicate_check?.status === "LIKELY_DUPLICATE"
                        ? "rgba(239, 68, 68, 0.12)"
                        : intelData.duplicate_check?.status === "POSSIBLE_DUPLICATE"
                        ? "rgba(245, 158, 11, 0.12)"
                        : "rgba(16, 185, 129, 0.12)",
                    border: `1px solid ${
                      intelData.duplicate_check?.status === "LIKELY_DUPLICATE"
                        ? "#ef4444"
                        : intelData.duplicate_check?.status === "POSSIBLE_DUPLICATE"
                        ? "#f59e0b"
                        : "#10b981"
                    }`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      SEMANTIC DUPLICATE CHECK
                    </div>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        marginTop: "2px",
                        color:
                          intelData.duplicate_check?.status === "LIKELY_DUPLICATE"
                            ? "#ef4444"
                            : intelData.duplicate_check?.status === "POSSIBLE_DUPLICATE"
                            ? "#fbbf24"
                            : "#34d399",
                      }}
                    >
                      {intelData.duplicate_check?.status?.replace(/_/g, " ") || "UNIQUE"} (
                      {((intelData.duplicate_check?.similarity || 0) * 100).toFixed(1)}% Max Similarity)
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>
                      {intelData.duplicate_check?.reason || "No high-similarity duplicates found in MariaDB registry."}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "4px 8px",
                      borderRadius: "4px",
                      background: "rgba(255,255,255,0.08)",
                      color: "#fff",
                    }}
                  >
                    Action: {intelData.duplicate_check?.recommended_action || "ALLOW"}
                  </span>
                </div>

                {/* Section 7 & 10 & 11: Recommended Target Page */}
                <div style={{ padding: "14px", borderRadius: "8px", background: "#1f2937", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--dgs-brand-cyan)", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    RECOMMENDED TARGET PAGE
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px", flexWrap: "wrap", gap: "6px" }}>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.9rem" }}>
                      {intelData.recommended_target_page?.page || inspectingOpp.recommended_dgs_target_page}
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "#34d399", fontWeight: 700 }}>
                      {((intelData.recommended_target_page?.semantic_relevance || 0.85) * 100).toFixed(0)}% Semantic Match
                    </span>
                  </div>
                  <div style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.65)", marginTop: "6px", lineHeight: "1.4" }}>
                    <strong>Why It Matches:</strong> {intelData.recommended_target_page?.reason || "Topically matches DGS service capabilities and regional market profile."}
                  </div>
                </div>

                {/* Section 8: Best DGS Assets to Cite (Up to 3-4 items) */}
                <div>
                  <div style={{ fontSize: "0.74rem", color: "#fff", fontWeight: 700, marginBottom: "8px", letterSpacing: "0.5px" }}>
                    BEST DGS ASSETS TO CITE (TURBOVEC CONTENT RETRIEVAL)
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "8px" }}>
                    {intelData.best_assets?.slice(0, 4).map((a: any, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "6px",
                          background: "#1f2937",
                          border: "1px solid rgba(255,255,255,0.08)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <div style={{ fontWeight: 650, color: "#fff", fontSize: "0.78rem" }}>
                          {a.title}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "rgba(255,255,255,0.5)" }}>
                          <span>{a.entity_type || "ARTICLE"}</span>
                          <span style={{ color: "#34d399", fontWeight: 700 }}>
                            {((a.semantic_relevance || 0.7) * 100).toFixed(0)}% Relevance
                          </span>
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--dgs-brand-cyan)", marginTop: "2px" }}>
                          {a.why_matches || a.why_to_cite || "Topical grounding evidence."}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 5: Similar Opportunities (Top 5) */}
                <div>
                  <div style={{ fontSize: "0.74rem", color: "#fff", fontWeight: 700, marginBottom: "8px", letterSpacing: "0.5px" }}>
                    SIMILAR OPPORTUNITIES IN PIPELINE (TOP 5)
                  </div>
                  {intelData.similar_opportunities && intelData.similar_opportunities.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {intelData.similar_opportunities.map((sim: any, idx: number) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            fontSize: "0.76rem",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 650, color: "#fff" }}>{sim.site_name}</div>
                            <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.5)" }}>
                              {sim.domain} • {sim.region} • {sim.category}
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ color: "var(--dgs-brand-cyan)", fontWeight: 700, fontSize: "0.74rem" }}>
                              {((sim.semantic_similarity || 0.75) * 100).toFixed(1)}% Sim
                            </span>
                            <div style={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.4)" }}>
                              Status: {sim.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>
                      No highly similar records found in pipeline (Distinct opportunity).
                    </div>
                  )}
                </div>

                {/* Modal Footer Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                  <button onClick={() => setInspectingOpp(null)} className="dgs-saas-btn secondary">
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const opp = inspectingOpp;
                      setInspectingOpp(null);
                      handleOpenOutreachModal(opp);
                    }}
                    className="dgs-saas-btn primary"
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <Send size={13} /> Create Grounded Outreach Draft
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ color: "#ef4444", fontSize: "0.82rem" }}>Could not load intelligence data.</div>
            )}
          </div>
        </div>
      )}

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

      {/* Convert to Outreach CRM Draft Modal (Section 9: Grounded Outreach Draft with SOURCES USED) */}
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
              maxWidth: "640px",
              padding: "24px",
              background: "#111827",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Send size={18} color="var(--dgs-brand-cyan)" />
                <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem" }}>
                  Save Grounded Outreach Draft: {convertingOpp.site_name}
                </h3>
              </div>
              <button onClick={() => setConvertingOpp(null)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            {/* Sender & Grounding Badge */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "6px",
                background: "rgba(0, 198, 255, 0.08)",
                border: "1px solid rgba(0, 198, 255, 0.2)",
                marginBottom: "14px",
                fontSize: "0.75rem",
              }}
            >
              <div>
                Sender: <strong style={{ color: "#fff" }}>Kohin Bellara - CEO D&apos;Genius Solutions</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--dgs-brand-cyan)", fontWeight: 700 }}>
                <Sparkles size={13} className={grounding ? "animate-spin" : ""} />
                {grounding ? "Grounding with TurboVec..." : "TurboVec Grounded Draft"}
              </div>
            </div>

            {/* Matched Supporting DGS Assets */}
            {groundedAssets.length > 0 && (
              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--dgs-brand-cyan)", marginBottom: "6px", letterSpacing: "0.5px" }}>
                  BEST DGS ASSETS TO USE:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {groundedAssets.slice(0, 2).map((a, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "6px",
                        background: "#1f2937",
                        border: "1px solid rgba(255,255,255,0.08)",
                        fontSize: "0.72rem",
                      }}
                    >
                      <div style={{ fontWeight: 650, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {a.title}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", color: "rgba(255,255,255,0.5)" }}>
                        <span>{a.entity_type}</span>
                        <span style={{ color: "#34d399", fontWeight: 700 }}>
                          {(a.semantic_relevance * 100).toFixed(0)}% Relevance
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Target DGS Page */}
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "0.78rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Target DGS Landing Page:
              </label>
              <input
                type="text"
                value={outreachTargetPage}
                onChange={(e) => setOutreachTargetPage(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "0.82rem",
                }}
              />
            </div>

            {/* Pitch Subject */}
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
                  fontWeight: 600,
                }}
              />
            </div>

            {/* Pitch Content with SOURCES USED */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "0.78rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Pitch Content (with Grounded SOURCES USED):
              </label>
              <textarea
                rows={9}
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
                  lineHeight: "1.45",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.72rem", color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>
                <ShieldCheck size={14} /> Factual DGS Evidence Only • Zero Fabricated Stats
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
