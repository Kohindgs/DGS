"use client";

import React, { useState, useEffect } from "react";
import {
  Newspaper,
  ExternalLink,
  Sparkles,
  Send,
  Clock,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ShieldCheck,
  X,
} from "lucide-react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";

interface PRRequest {
  id: string;
  outlet: string;
  topic: string;
  journalist: string;
  deadline: string;
  target_persona: string;
  region: "INDIA" | "UAE" | "USA" | "GLOBAL";
  authority_score: number;
  free_tier: boolean;
  status: "NEW" | "DRAFTED" | "PITCHED" | "ACCEPTED" | "EXPIRED";
  submission_url: string;
}

const SAMPLE_PR_FEEDS: PRRequest[] = [
  {
    id: "pr_1",
    outlet: "Forbes Technology Council / Featured",
    topic: "Enterprise AI Video Production: How Generative Workflows Reduced B2B CAC by 40%",
    journalist: "Editorial Staff",
    deadline: "In 3 Days",
    target_persona: "Agency Founder / AI Creative Technologist",
    region: "USA",
    authority_score: 94,
    free_tier: true,
    status: "NEW",
    submission_url: "https://featured.com",
  },
  {
    id: "pr_2",
    outlet: "Arabian Business / Entrepreneur Middle East",
    topic: "Dubai's AI Transformation: The Rise of Generative Video Content for Real Estate & Hospitality",
    journalist: "MENA Tech Reporter",
    deadline: "In 5 Days",
    target_persona: "DGS Dubai Growth Lead",
    region: "UAE",
    authority_score: 86,
    free_tier: true,
    status: "NEW",
    submission_url: "https://www.entrepreneur.com/en-ae",
  },
  {
    id: "pr_3",
    outlet: "YourStory / Inc42",
    topic: "AEO vs Traditional SEO: How Indian Enterprises Are Winning Generative AI Search (SearchGPT & Perplexity)",
    journalist: "Startup Beat Editor",
    deadline: "In 2 Days",
    target_persona: "Head of SEO / Founder",
    region: "INDIA",
    authority_score: 88,
    free_tier: true,
    status: "NEW",
    submission_url: "https://yourstory.com",
  },
  {
    id: "pr_4",
    outlet: "MarTech Series / CMSWire",
    topic: "The Future of LLM Grounding: Structuring Schema and Knowledge Graphs for Brand Authority",
    journalist: "MarTech Features Editor",
    deadline: "In 6 Days",
    target_persona: "Chief Strategy Officer",
    region: "USA",
    authority_score: 85,
    free_tier: true,
    status: "NEW",
    submission_url: "https://martechseries.com",
  },
  {
    id: "pr_5",
    outlet: "Exchange4Media / Campaign India",
    topic: "Mumbai's Creative Agencies Deploying AI Video Production Pipelines: Agency Case Studies",
    journalist: "Advertising & Media Desk",
    deadline: "In 4 Days",
    target_persona: "Creative Director",
    region: "INDIA",
    authority_score: 81,
    free_tier: true,
    status: "NEW",
    submission_url: "https://www.exchange4media.com",
  },
];

export default function DigitalPrClientView() {
  const [prRequests, setPrRequests] = useState<PRRequest[]>(SAMPLE_PR_FEEDS);
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [activePR, setActivePR] = useState<PRRequest | null>(null);
  const [pitchSubject, setPitchSubject] = useState("");
  const [pitchQuote, setPitchQuote] = useState("");
  const [pitching, setPitching] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleOpenPitchModal = (pr: PRRequest) => {
    setActivePR(pr);
    setPitchSubject(`Expert Commentary: ${pr.topic} — D'Genius Solutions`);
    setPitchQuote(
      `"When enterprise brands deploy generative AI video production at scale, the primary breakthrough isn't just speed—it's iterative creative testing. At D'Genius Solutions, we see brands producing 20 distinct cinematic variations of a hero video campaign in the time it previously took to render one 3D storyboard. This data-driven creative agility directly lowers customer acquisition costs by over 38% across programmatic ad channels."\n\n— Kohin D'Souza, Founder & Creative Director, D'Genius Solutions (https://www.dgeniussolutions.com)`
    );
  };

  const handleQueuePR = async () => {
    if (!activePR) return;
    setPitching(true);
    try {
      const res = await fetch("/api/admin/off-page/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunity_id: activePR.id,
          target_domain: activePR.outlet,
          target_url: activePR.submission_url,
          campaign_type: "DIGITAL_PR",
          stage: "INTERNAL_APPROVED",
          pitch_subject: pitchSubject,
          pitch_body: pitchQuote,
          recommended_dgs_target_page: "/services/ai-video-production-agency/",
          target_anchor: "D'Genius Solutions",
          approval_status: "approved",
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setPrRequests((prev) =>
          prev.map((item) => (item.id === activePR.id ? { ...item, status: "DRAFTED" } : item))
        );
        setActivePR(null);
        setFeedback("Expert PR pitch queued into Outreach CRM.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPitching(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const filtered = prRequests.filter((pr) => {
    if (selectedRegion !== "ALL" && pr.region !== selectedRegion) return false;
    return true;
  });

  const columns: Column<PRRequest>[] = [
    {
      key: "topic",
      header: "Topic & Media Outlet",
      sortable: true,
      render: (pr) => (
        <div>
          <div style={{ fontWeight: 650, color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
            {pr.topic}
            <a
              href={pr.submission_url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Portal"
              style={{ color: "var(--dgs-brand-cyan)", display: "inline-flex" }}
            >
              <ExternalLink size={13} />
            </a>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--dgs-brand-cyan)", marginTop: "2px" }}>
            {pr.outlet} • {pr.journalist}
          </div>
        </div>
      ),
    },
    {
      key: "region",
      header: "Region",
      render: (pr) => (
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
          {pr.region}
        </span>
      ),
    },
    {
      key: "target_persona",
      header: "Recommended Expert",
      render: (pr) => <span style={{ fontSize: "0.75rem", color: "#a78bfa" }}>{pr.target_persona}</span>,
    },
    {
      key: "authority_score",
      header: "Authority",
      sortable: true,
      render: (pr) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#10b981" }}>{pr.authority_score}</span>
          <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>DA</span>
        </div>
      ),
    },
    {
      key: "deadline",
      header: "Deadline",
      render: (pr) => (
        <span
          style={{
            fontSize: "0.72rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            color: "#f59e0b",
            fontWeight: 600,
          }}
        >
          <Clock size={12} />
          {pr.deadline}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (pr) => (
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            padding: "2px 6px",
            borderRadius: "4px",
            background: pr.status === "NEW" ? "rgba(59,130,246,0.15)" : "rgba(16,185,129,0.15)",
            color: pr.status === "NEW" ? "#60a5fa" : "#34d399",
          }}
        >
          {pr.status}
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
            Digital PR & Journalist Request Feeds
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
            Aggregates free editorial opportunities from Connectively/HARO, Featured.com, Qwoted, and regional tech journalists.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.74rem", color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>
            <Sparkles size={14} /> 100% Free Press Inquiries
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

      {/* Free PR Platforms Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        {[
          { name: "Connectively (HARO)", url: "https://connectively.us", status: "Active Free" },
          { name: "Featured.com", url: "https://featured.com", status: "Active Free" },
          { name: "SourceBottle", url: "https://sourcebottle.com", status: "Active Free" },
          { name: "Help a B2B Writer", url: "https://helpab2bwriter.com", status: "Active Free" },
          { name: "Qwoted", url: "https://qwoted.com", status: "Active Free" },
        ].map((plat) => (
          <div
            key={plat.name}
            className="dgs-saas-card"
            style={{
              padding: "12px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 650, color: "#fff", fontSize: "0.82rem" }}>{plat.name}</div>
              <div style={{ fontSize: "0.68rem", color: "#10b981", fontWeight: 600 }}>{plat.status}</div>
            </div>
            <a
              href={plat.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--dgs-brand-cyan)" }}
            >
              <ExternalLink size={14} />
            </a>
          </div>
        ))}
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

      {/* Main SaaS Table */}
      <div className="dgs-saas-card" style={{ padding: "16px" }}>
        <SaaSTable<PRRequest>
          columns={columns}
          data={filtered}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search journalist request, outlet, topic..."
          searchFilter={(item, q) =>
            item.topic.toLowerCase().includes(q) ||
            item.outlet.toLowerCase().includes(q) ||
            item.journalist.toLowerCase().includes(q)
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
          initialPageSize={10}
          emptyMessage="No open journalist requests found."
        />
      </div>

      {/* Pitch Modal */}
      {activePR && (
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
                <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem" }}>Draft Expert Quote Pitch</h3>
              </div>
              <button onClick={() => setActivePR(null)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>Outlet:</span>
              <div style={{ fontWeight: 650, color: "#fff" }}>{activePR.outlet} ({activePR.topic})</div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Subject / Hook:
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
                Expert Quote & Key Takeaway:
              </label>
              <textarea
                rows={7}
                value={pitchQuote}
                onChange={(e) => setPitchQuote(e.target.value)}
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
                <ShieldCheck size={14} /> Ready for editorial approval
              </span>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setActivePR(null)} className="dgs-saas-btn secondary">
                  Cancel
                </button>
                <button onClick={handleQueuePR} disabled={pitching} className="dgs-saas-btn primary">
                  {pitching ? "Queuing..." : "Queue in Outreach CRM"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
