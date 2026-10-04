"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  ExternalLink,
  Send,
  Sparkles,
  Zap,
  Globe,
  Bot,
  BrainCircuit,
  Search,
  CheckCircle2,
  X,
  ShieldCheck,
} from "lucide-react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import type { OffPageAuthorityOpportunity, AuthorityOpportunityType, RegionCode, PriorityTier } from "@/lib/off-page/types";

interface Props {
  initialOpportunities?: OffPageAuthorityOpportunity[];
}

export default function AuthorityClientView({ initialOpportunities }: Props) {
  const [opportunities, setOpportunities] = useState<OffPageAuthorityOpportunity[]>(initialOpportunities || []);
  const [loading, setLoading] = useState(!initialOpportunities);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Pitch Modal State
  const [activeModalOpp, setActiveModalOpp] = useState<OffPageAuthorityOpportunity | null>(null);
  const [subject, setSubject] = useState("");
  const [pitchBody, setPitchBody] = useState("");
  const [converting, setConverting] = useState(false);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType !== "ALL") params.set("type", selectedType);
      if (selectedRegion !== "ALL") params.set("region", selectedRegion);
      if (selectedTier !== "ALL") params.set("tier", selectedTier);

      const res = await fetch(`/api/admin/off-page/authority?${params.toString()}`);
      const json = await res.json();
      if (json.ok) {
        setOpportunities(json.opportunities);
      }
    } catch (err) {
      console.error("Failed to fetch authority opportunities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [selectedType, selectedRegion, selectedTier]);

  const handleOpenPitchModal = (opp: OffPageAuthorityOpportunity) => {
    setActiveModalOpp(opp);
    setSubject(`Editorial Collaboration / Resource Update: D'Genius Solutions & ${opp.source_name}`);
    setPitchBody(
      `Hello ${opp.source_name} Editorial Team,\n\nI am contacting you regarding your featured coverage on "${opp.title}".\n\nAt D'Genius Solutions, we produce enterprise AI video production and strategic growth campaigns across Mumbai, Dubai, and New York. We noticed an opportunity to expand your guide with our proprietary performance data and verified client case studies.\n\nTarget Resource: ${opp.target_page}\n\nCould we contribute an authoritative quote or case study for your readers?\n\nSincerely,\nEditorial Director\nD'Genius Solutions`
    );
  };

  const handleQueueOutreach = async () => {
    if (!activeModalOpp) return;
    setConverting(true);
    try {
      const res = await fetch("/api/admin/off-page/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunity_id: activeModalOpp.id,
          target_domain: activeModalOpp.source_name,
          target_url: activeModalOpp.source_url,
          campaign_type: activeModalOpp.type,
          stage: "INTERNAL_APPROVED",
          pitch_subject: subject,
          pitch_body: pitchBody,
          recommended_dgs_target_page: activeModalOpp.target_page,
          target_anchor: "D'Genius Solutions",
          approval_status: "approved",
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setActiveModalOpp(null);
        setFeedback(`Authority opportunity queued into Outreach CRM.`);
      }
    } catch (err) {
      console.error("Queue outreach error:", err);
    } finally {
      setConverting(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const columns: Column<OffPageAuthorityOpportunity>[] = [
    {
      key: "title",
      header: "Opportunity & Source",
      sortable: true,
      render: (opp) => (
        <div>
          <div style={{ fontWeight: 650, color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
            {opp.title}
            <a
              href={opp.source_url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Source URL"
              style={{ color: "var(--dgs-brand-cyan)", display: "inline-flex" }}
            >
              <ExternalLink size={13} />
            </a>
          </div>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>
            {opp.description}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--dgs-brand-cyan)", marginTop: "3px" }}>
            Source: {opp.source_name}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Vector Type",
      sortable: true,
      render: (opp) => {
        const typeLabels: Record<string, string> = {
          COMPETITOR_GAP: "Competitor Gap",
          UNLINKED_MENTION_RECLAIM: "Unlinked Mention",
          DIGITAL_PR: "Digital PR",
          BROKEN_LINK: "Broken Link",
          PARTNERSHIP: "Partnership",
          CLIENT_PARTNERSHIP: "Client Co-Marketing",
          EXPERT_QUOTE: "Expert Quote",
          PODCAST: "Podcast Interview",
        };
        return (
          <span
            style={{
              padding: "3px 8px",
              borderRadius: "6px",
              fontSize: "0.72rem",
              fontWeight: 700,
              background: "rgba(0, 198, 255, 0.12)",
              color: "var(--dgs-brand-cyan)",
              border: "1px solid rgba(0, 198, 255, 0.3)",
              whiteSpace: "nowrap",
            }}
          >
            {typeLabels[opp.type] || opp.type}
          </span>
        );
      },
    },
    {
      key: "region",
      header: "Region",
      render: (opp) => (
        <span
          style={{
            padding: "2px 7px",
            borderRadius: "4px",
            fontSize: "0.7rem",
            fontWeight: 700,
            background: "rgba(255,255,255,0.06)",
            color: "#e2e8f0",
          }}
        >
          {opp.region}
        </span>
      ),
    },
    {
      key: "signals",
      header: "Authority Signals",
      render: (opp) => (
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          {opp.signals.seo && (
            <span title="SEO Authority Boost" style={{ color: "#34d399" }}>
              <Search size={14} />
            </span>
          )}
          {opp.signals.aeo && (
            <span title="AEO Answer Engine Authority" style={{ color: "#60a5fa" }}>
              <Bot size={14} />
            </span>
          )}
          {opp.signals.geo && (
            <span title="GEO Generative Engine Visibility" style={{ color: "#c084fc" }}>
              <Sparkles size={14} />
            </span>
          )}
          {opp.signals.llm && (
            <span title="LLM Entity Grounding" style={{ color: "#f472b6" }}>
              <BrainCircuit size={14} />
            </span>
          )}
        </div>
      ),
    },
    {
      key: "authority_score",
      header: "Score",
      sortable: true,
      render: (opp) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>{opp.authority_score}</span>
          <span
            style={{
              padding: "2px 5px",
              borderRadius: "4px",
              fontSize: "0.68rem",
              fontWeight: 800,
              background: opp.priority_tier === "P0" ? "rgba(236,72,153,0.2)" : "rgba(59,130,246,0.2)",
              color: opp.priority_tier === "P0" ? "#f472b6" : "#60a5fa",
            }}
          >
            {opp.priority_tier}
          </span>
        </div>
      ),
    },
    {
      key: "target_page",
      header: "Target DGS URL",
      render: (opp) => (
        <span
          style={{
            fontSize: "0.72rem",
            color: "rgba(255,255,255,0.7)",
            maxWidth: "160px",
            display: "inline-block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={opp.target_page}
        >
          {opp.target_page.replace("https://www.dgeniussolutions.com", "") || "/"}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Top Banner */}
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
            Authority Engine: Multi-Vector Opportunity Discovery
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
            Synthesizes high-impact vectors (AEO answer engines, GEO generative citations, competitor gaps, unlinked brand mentions, and thought leadership).
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.75rem", color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>
            <Zap size={14} /> 4 Authority Dimensions Active (SEO, AEO, GEO, LLM)
          </span>
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
        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Vector Type:</span>
        {[
          { id: "ALL", label: "All Vectors" },
          { id: "COMPETITOR_GAP", label: "Competitor Gaps" },
          { id: "UNLINKED_MENTION_RECLAIM", label: "Brand Mentions" },
          { id: "DIGITAL_PR", label: "Digital PR" },
          { id: "PARTNERSHIP", label: "Partnerships" },
          { id: "BROKEN_LINK", label: "Broken Links" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedType(t.id)}
            className={`dgs-saas-chip ${selectedType === t.id ? "primary" : ""}`}
            style={{ cursor: "pointer", border: "none" }}
          >
            {t.label}
          </button>
        ))}

        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", fontWeight: 600, marginLeft: "14px" }}>
          Region:
        </span>
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
      </div>

      {/* Main SaaS Table */}
      <div className="dgs-saas-card" style={{ padding: "16px" }}>
        <SaaSTable<OffPageAuthorityOpportunity>
          columns={columns}
          data={opportunities}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search title, description, source..."
          searchFilter={(item, q) =>
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.source_name.toLowerCase().includes(q)
          }
          actions={(item) => (
            <button
              onClick={() => handleOpenPitchModal(item)}
              className="dgs-saas-btn primary"
              style={{ fontSize: "0.72rem", padding: "4px 8px" }}
            >
              Draft Pitch
            </button>
          )}
          initialPageSize={15}
          emptyMessage="No detected authority opportunities matching filters."
        />
      </div>

      {/* Pitch Modal */}
      {activeModalOpp && (
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
                <Sparkles size={18} color="var(--dgs-brand-cyan)" />
                <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem" }}>Draft Authority Pitch</h3>
              </div>
              <button onClick={() => setActiveModalOpp(null)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>Target Domain:</span>
              <div style={{ fontWeight: 650, color: "#fff" }}>{activeModalOpp.source_name} ({activeModalOpp.source_url})</div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Pitch Subject:
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
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
                rows={7}
                value={pitchBody}
                onChange={(e) => setPitchBody(e.target.value)}
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
                <ShieldCheck size={14} /> Stored in CRM with approval safeguards
              </span>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setActiveModalOpp(null)} className="dgs-saas-btn secondary">
                  Cancel
                </button>
                <button onClick={handleQueueOutreach} disabled={converting} className="dgs-saas-btn primary">
                  {converting ? "Queuing..." : "Queue in Outreach CRM"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
