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
  AlertCircle,
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

export default function DigitalPrClientView() {
  const [prRequests, setPrRequests] = useState<PRRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [activePR, setActivePR] = useState<PRRequest | null>(null);
  const [pitchSubject, setPitchSubject] = useState("");
  const [pitchQuote, setPitchQuote] = useState("");
  const [pitching, setPitching] = useState(false);
  const [feedback, setFeedback] = useState<React.ReactNode | null>(null);

  const fetchPrOpportunities = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/off-page/opportunities?status=ALL");
      const json = await res.json();
      if (json.ok && Array.isArray(json.opportunities)) {
        const prItems = json.opportunities
          .filter((o: any) => ["DIGITAL_PR", "EXPERT_CONTRIBUTION", "PODCAST"].includes(o.category))
          .map((o: any) => ({
            id: o.id,
            outlet: o.site_name || o.domain,
            topic: o.recommended_content || `Expert Commentary & Thought Leadership: ${o.recommended_service || "AI Video & Technical SEO"}`,
            journalist: "Editorial Desk",
            deadline: "Ongoing Curation",
            target_persona: "Kohin Bellara - CEO D'Genius Solutions",
            region: o.region || "GLOBAL",
            authority_score: o.authority_score || 85,
            free_tier: o.free_status !== "NOT_FREE",
            status: (o.status === "OUTREACH" ? "DRAFTED" : o.status === "SUBMITTED" ? "PITCHED" : "NEW") as any,
            submission_url: o.exact_submission_url || `https://${o.domain}`,
          }));
        setPrRequests(prItems);
      }
    } catch (err) {
      console.error("Failed fetching PR feeds:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrOpportunities();
  }, []);

  const handleOpenPitchModal = (pr: PRRequest) => {
    setActivePR(pr);
    setPitchSubject(`Expert Commentary: ${pr.topic} — D'Genius Solutions`);
    setPitchQuote(
      `Hi Editorial Team,\n\nI hope you are having a productive week.\n\nRegarding coverage on "${pr.topic}" at ${pr.outlet}:\n\nAt D'Genius Solutions, we focus on technical SEO, generative search optimization (GEO), and enterprise AI video production for clients across India, UAE, and global markets. In our client campaigns, combining structured entity schema with hybrid AI video workflows has created sustainable, measurable improvements in organic visibility and AI Overview citations.\n\nWe would be glad to share practical insights, methodology, or an executive quote for your upcoming stories.\n\nBest regards,\n\nKohin Bellara\nCEO, D'Genius Solutions\nhttps://www.dgeniussolutions.com/`
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
          source_module: "DIGITAL_PR",
          source_record_id: activePR.id,
          target_domain: activePR.outlet,
          target_url: activePR.submission_url,
          campaign_type: "DIGITAL_PR",
          stage: "DRAFT",
          pitch_subject: pitchSubject,
          pitch_body: pitchQuote,
          target_page: "https://www.dgeniussolutions.com/services/ai-video-production-agency/",
          assigned_staff: "Kohin Bellara - CEO D'Genius Solutions",
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setPrRequests((prev) =>
          prev.map((item) => (item.id === activePR.id ? { ...item, status: "DRAFTED" } : item))
        );
        setActivePR(null);
        setFeedback(
          <span>
            Digital PR pitch draft saved.{" "}
            <a
              href="/admin/off-page/outreach?stage=DRAFT"
              style={{ color: "var(--dgs-brand-cyan)", textDecoration: "underline", fontWeight: 700 }}
            >
              View in Outreach CRM (Drafts) &rarr;
            </a>
          </span>
        );
      } else {
        setFeedback(`Error: ${json.error}`);
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setPitching(false);
      setTimeout(() => setFeedback(null), 8000);
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
      header: "Executive Spokesperson",
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
            Digital PR & Expert Citation Radar
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
            High-authority publication queries & editorial opportunities. Pitch identity: Kohin Bellara - CEO D'Genius Solutions.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.75rem", color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>
            <ShieldCheck size={14} /> Free Journalist & Contributor Outlets
          </span>
        </div>
      </div>

      {/* Provider Truthfulness Banner (Section 31 & 41) */}
      <div
        style={{
          padding: "12px 16px",
          borderRadius: "8px",
          background: "rgba(245, 158, 11, 0.08)",
          border: "1px solid rgba(245, 158, 11, 0.25)",
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          fontSize: "0.82rem",
          color: "#fbbf24",
        }}
      >
        <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
        <div>
          <div style={{ fontWeight: 700 }}>DIGITAL PR LIVE FEED: NOT_CONFIGURED</div>
          <div style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.78rem", marginTop: "2px" }}>
            Real-time journalist query feeds require Connectively (HARO) or Qwoted API integration. Existing opportunities are authentic editorial and guest contribution portals from our verified directory. TurboVec is active for semantic asset and expertise matching.
          </div>
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

      {/* Region Filter Chips */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
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
      </div>

      {/* Main SaaS Table */}
      <div className="dgs-saas-card" style={{ padding: "16px" }}>
        <SaaSTable<PRRequest>
          columns={columns}
          data={filtered}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search outlet, topic, or journalist query..."
          searchFilter={(item, q) =>
            item.outlet.toLowerCase().includes(q) ||
            item.topic.toLowerCase().includes(q) ||
            item.journalist.toLowerCase().includes(q)
          }
          actions={(item) => (
            <button
              onClick={() => handleOpenPitchModal(item)}
              className="dgs-saas-btn primary"
              style={{ fontSize: "0.72rem", padding: "4px 8px", display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              <Send size={11} /> Create Draft
            </button>
          )}
          initialPageSize={10}
          emptyMessage="No verified current PR opportunities found. PR queries will appear here when fetched or imported."
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
                <Newspaper size={18} color="var(--dgs-brand-cyan)" />
                <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem" }}>
                  Draft PR Response: {activePR.outlet}
                </h3>
              </div>
              <button onClick={() => setActivePR(null)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>
                <X size={18} />
              </button>
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
                  fontSize: "0.85rem",
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Executive Quote & Commentary:
              </label>
              <textarea
                rows={8}
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
                <ShieldCheck size={14} /> Saves to Outreach CRM Drafts for Review
              </span>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setActivePR(null)} className="dgs-saas-btn secondary">
                  Cancel
                </button>
                <button onClick={handleQueuePR} disabled={pitching} className="dgs-saas-btn primary">
                  {pitching ? "Saving Draft..." : "Save Draft to Outreach CRM"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
