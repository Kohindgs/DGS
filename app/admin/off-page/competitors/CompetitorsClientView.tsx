"use client";

import React, { useState, useEffect } from "react";
import {
  GitCompare,
  Plus,
  ExternalLink,
  Send,
  Sparkles,
  TrendingUp,
  Target,
  ShieldCheck,
  X,
} from "lucide-react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";

interface CompetitorDomain {
  id: string;
  competitor_name: string;
  domain: string;
  region: "INDIA" | "UAE" | "USA" | "GLOBAL";
  primary_niche: string;
  authority_score?: number;
  estimated_referring_domains: number;
  status: string;
  created_at: string;
}

interface CompetitorGap {
  id: string;
  competitor_domain: string;
  source_domain: string;
  source_url: string;
  target_page_type: string;
  region: "INDIA" | "UAE" | "USA" | "GLOBAL";
  relevance_score: number;
  quality_score: number;
  difficulty_score: number;
  status: string;
}

interface Props {
  initialCompetitors?: CompetitorDomain[];
  initialGaps?: CompetitorGap[];
}

export default function CompetitorsClientView({ initialCompetitors, initialGaps }: Props) {
  const [competitors, setCompetitors] = useState<CompetitorDomain[]>(initialCompetitors || []);
  const [gaps, setGaps] = useState<CompetitorGap[]>(initialGaps || []);
  const [loading, setLoading] = useState(!initialCompetitors);
  const [activeTab, setActiveTab] = useState<"gaps" | "benchmarking">("gaps");
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Add Competitor modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [compName, setCompName] = useState("");
  const [compDomain, setCompDomain] = useState("");
  const [compRegion, setCompRegion] = useState<"INDIA" | "UAE" | "USA" | "GLOBAL">("INDIA");
  const [compNiche, setCompNiche] = useState("AI Video & Performance Agency");
  const [compRefDomains, setCompRefDomains] = useState(150);
  const [adding, setAdding] = useState(false);

  // Outreach Modal for Gap
  const [activeGap, setActiveGap] = useState<CompetitorGap | null>(null);
  const [pitchSubject, setPitchSubject] = useState("");
  const [pitchBody, setPitchBody] = useState("");
  const [queuing, setQueuing] = useState(false);

  const fetchCompetitorData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedRegion !== "ALL") params.set("region", selectedRegion);
      const res = await fetch(`/api/admin/off-page/competitors?${params.toString()}`);
      const json = await res.json();
      if (json.ok) {
        setCompetitors(json.competitors);
        setGaps(json.gaps);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitorData();
  }, [selectedRegion]);

  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName || !compDomain) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/off-page/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitor_name: compName,
          domain: compDomain,
          region: compRegion,
          primary_niche: compNiche,
          estimated_referring_domains: compRefDomains,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setShowAddModal(false);
        setCompName("");
        setCompDomain("");
        setFeedback("Competitor added to off-page monitoring engine.");
        await fetchCompetitorData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleOpenGapOutreach = (gap: CompetitorGap) => {
    setActiveGap(gap);
    setPitchSubject(`Agency Feature / Alternative Provider: D'Genius Solutions (${gap.source_domain})`);
    setPitchBody(
      `Hello ${gap.source_domain} Team,\n\nWe noticed your recent agency coverage featuring ${gap.competitor_domain}.\n\nAt D'Genius Solutions, we provide enterprise AI video production, SEO, and performance marketing across Mumbai, Dubai, and the US.\n\nWe'd love to provide our latest benchmark report on enterprise AI production workflows to be considered alongside existing industry features.\n\nBest regards,\nD'Genius Solutions Team`
    );
  };

  const handleQueueGap = async () => {
    if (!activeGap) return;
    setQueuing(true);
    try {
      const res = await fetch("/api/admin/off-page/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunity_id: activeGap.id,
          target_domain: activeGap.source_domain,
          target_url: activeGap.source_url,
          campaign_type: "COMPETITOR_GAP",
          stage: "INTERNAL_APPROVED",
          pitch_subject: pitchSubject,
          pitch_body: pitchBody,
          recommended_dgs_target_page:
            activeGap.target_page_type === "HOMEPAGE"
              ? "/"
              : "/services/ai-video-production-agency/",
          target_anchor: "D'Genius Solutions",
          approval_status: "approved",
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setActiveGap(null);
        setFeedback("Competitor gap successfully queued in Outreach CRM.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQueuing(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Gap Columns
  const gapColumns: Column<CompetitorGap>[] = [
    {
      key: "source_domain",
      header: "Referring Opportunity Domain",
      sortable: true,
      render: (g) => (
        <div>
          <div style={{ fontWeight: 650, color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
            {g.source_domain}
            <a
              href={g.source_url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Source URL"
              style={{ color: "var(--dgs-brand-cyan)", display: "inline-flex" }}
            >
              <ExternalLink size={13} />
            </a>
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)" }}>{g.source_url}</div>
        </div>
      ),
    },
    {
      key: "competitor_domain",
      header: "Competitor With Link",
      sortable: true,
      render: (g) => (
        <span style={{ fontSize: "0.8rem", color: "#f59e0b", fontWeight: 600 }}>
          {g.competitor_domain}
        </span>
      ),
    },
    {
      key: "region",
      header: "Region",
      render: (g) => (
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
          {g.region}
        </span>
      ),
    },
    {
      key: "quality_score",
      header: "Quality Score",
      sortable: true,
      render: (g) => {
        const score = g.quality_score;
        const color = score >= 80 ? "#10b981" : score >= 60 ? "#00c6ff" : "#f59e0b";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color }}>{score}</span>
            <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>Diff: {g.difficulty_score}/100</span>
          </div>
        );
      },
    },
    {
      key: "target_page_type",
      header: "DGS Target",
      render: (g) => (
        <span style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.7)" }}>
          {g.target_page_type === "HOMEPAGE" ? "Homepage" : "AI Video Production"}
        </span>
      ),
    },
  ];

  // Competitor Columns
  const compColumns: Column<CompetitorDomain>[] = [
    {
      key: "competitor_name",
      header: "Competitor Agency",
      sortable: true,
      render: (c) => (
        <div>
          <div style={{ fontWeight: 650, color: "#fff" }}>{c.competitor_name}</div>
          <div style={{ fontSize: "0.74rem", color: "var(--dgs-brand-cyan)" }}>{c.domain}</div>
        </div>
      ),
    },
    {
      key: "region",
      header: "Market Region",
      render: (c) => (
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
          {c.region}
        </span>
      ),
    },
    {
      key: "primary_niche",
      header: "Primary Focus",
      render: (c) => <span style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.8)" }}>{c.primary_niche}</span>,
    },
    {
      key: "estimated_referring_domains",
      header: "Est. Referring Domains",
      sortable: true,
      render: (c) => (
        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
          {c.estimated_referring_domains}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (c) => (
        <span
          style={{
            fontSize: "0.68rem",
            fontWeight: 700,
            padding: "2px 6px",
            borderRadius: "4px",
            background: "rgba(16, 185, 129, 0.15)",
            color: "#10b981",
          }}
        >
          {c.status}
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
            Competitor Authority Gap Analysis
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
            Monitors top agency competitors in India, UAE, and the USA to pinpoint referring domain gaps and reclaim market share.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => setShowAddModal(true)}
            className="dgs-saas-btn primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={14} /> Add Competitor
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

      {/* Sub-Tabs: Gaps vs Competitors */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setActiveTab("gaps")}
            className={`dgs-saas-btn ${activeTab === "gaps" ? "primary" : "secondary"}`}
            style={{ fontSize: "0.8rem", padding: "6px 14px" }}
          >
            Backlink Gap Opportunities ({gaps.length})
          </button>
          <button
            onClick={() => setActiveTab("benchmarking")}
            className={`dgs-saas-btn ${activeTab === "benchmarking" ? "primary" : "secondary"}`}
            style={{ fontSize: "0.8rem", padding: "6px 14px" }}
          >
            Monitored Competitors ({competitors.length})
          </button>
        </div>

        {/* Region Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)" }}>Region:</span>
          {["ALL", "INDIA", "UAE", "USA"].map((r) => (
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
      </div>

      {/* Main Table */}
      <div className="dgs-saas-card" style={{ padding: "16px" }}>
        {activeTab === "gaps" ? (
          <SaaSTable<CompetitorGap>
            columns={gapColumns}
            data={gaps}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search referring domain or competitor..."
            searchFilter={(item, q) =>
              item.source_domain.toLowerCase().includes(q) ||
              item.competitor_domain.toLowerCase().includes(q) ||
              item.source_url.toLowerCase().includes(q)
            }
            actions={(item) => (
              <button
                onClick={() => handleOpenGapOutreach(item)}
                className="dgs-saas-btn primary"
                style={{ fontSize: "0.72rem", padding: "4px 8px" }}
              >
                Queue Pitch
              </button>
            )}
            initialPageSize={12}
            emptyMessage="No competitor backlink gaps discovered for this filter."
          />
        ) : (
          <SaaSTable<CompetitorDomain>
            columns={compColumns}
            data={competitors}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search competitor agency or domain..."
            searchFilter={(item, q) =>
              item.competitor_name.toLowerCase().includes(q) ||
              item.domain.toLowerCase().includes(q)
            }
            initialPageSize={12}
            emptyMessage="No monitored competitors found."
          />
        )}
      </div>

      {/* Add Competitor Modal */}
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
            onSubmit={handleAddCompetitor}
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
              <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem" }}>Add Monitored Competitor</h3>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Agency / Brand Name:
              </label>
              <input
                type="text"
                required
                placeholder="Schbang / Seven Media"
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Domain:
              </label>
              <input
                type="text"
                required
                placeholder="schbang.com"
                value={compDomain}
                onChange={(e) => setCompDomain(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                  Primary Region:
                </label>
                <select
                  value={compRegion}
                  onChange={(e) => setCompRegion(e.target.value as any)}
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

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                  Est. Referring Domains:
                </label>
                <input
                  type="number"
                  value={compRefDomains}
                  onChange={(e) => setCompRefDomains(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    background: "#1f2937",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button type="button" onClick={() => setShowAddModal(false)} className="dgs-saas-btn secondary">
                Cancel
              </button>
              <button type="submit" disabled={adding} className="dgs-saas-btn primary">
                {adding ? "Adding..." : "Add Competitor"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Gap Outreach Modal */}
      {activeGap && (
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
              maxWidth: "580px",
              padding: "24px",
              background: "#111827",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Send size={18} color="var(--dgs-brand-cyan)" />
                <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem" }}>Queue Competitor Gap Outreach</h3>
              </div>
              <button onClick={() => setActiveGap(null)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>Target Source:</span>
              <div style={{ fontWeight: 650, color: "#fff" }}>{activeGap.source_domain} ({activeGap.source_url})</div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Pitch Subject:
              </label>
              <input
                type="text"
                value={pitchSubject}
                onChange={(e) => setPitchSubject(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Pitch Body:
              </label>
              <textarea
                rows={6}
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
                <ShieldCheck size={14} /> Safe human approval flow enforced
              </span>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setActiveGap(null)} className="dgs-saas-btn secondary">
                  Cancel
                </button>
                <button onClick={handleQueueGap} disabled={queuing} className="dgs-saas-btn primary">
                  {queuing ? "Queuing..." : "Queue in Outreach CRM"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
