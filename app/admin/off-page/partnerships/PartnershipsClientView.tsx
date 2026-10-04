"use client";

import React, { useState } from "react";
import {
  Handshake,
  ExternalLink,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Users,
  Award,
  X,
} from "lucide-react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";

interface PartnershipLead {
  id: string;
  partner_name: string;
  domain: string;
  category: "AI_TECH_VENDOR" | "AGENCY_ECOSYSTEM" | "CLIENT_CASE_STUDY" | "MEDIA_PARTNER";
  region: "INDIA" | "UAE" | "USA" | "GLOBAL";
  potential_link_type: "Partner Page Listing" | "Co-Authored Case Study" | "Certified Agency Badge";
  authority_score: number;
  status: "IDENTIFIED" | "PITCHED" | "CONFIRMED" | "LIVE";
  website_url: string;
}

const SAMPLE_PARTNERSHIPS: PartnershipLead[] = [
  {
    id: "part_1",
    partner_name: "Runway ML AI Partners Ecosystem",
    domain: "runwayml.com",
    category: "AI_TECH_VENDOR",
    region: "GLOBAL",
    potential_link_type: "Certified Agency Badge",
    authority_score: 91,
    status: "IDENTIFIED",
    website_url: "https://runwayml.com",
  },
  {
    id: "part_2",
    partner_name: "ElevenLabs Enterprise Partners",
    domain: "elevenlabs.io",
    category: "AI_TECH_VENDOR",
    region: "GLOBAL",
    potential_link_type: "Partner Page Listing",
    authority_score: 89,
    status: "IDENTIFIED",
    website_url: "https://elevenlabs.io",
  },
  {
    id: "part_3",
    partner_name: "Dubai Internet City Community Directory",
    domain: "dic.ae",
    category: "AGENCY_ECOSYSTEM",
    region: "UAE",
    potential_link_type: "Partner Page Listing",
    authority_score: 83,
    status: "CONFIRMED",
    website_url: "https://dic.ae",
  },
  {
    id: "part_4",
    partner_name: "NASSCOM Startup Partner Network",
    domain: "nasscom.in",
    category: "AGENCY_ECOSYSTEM",
    region: "INDIA",
    potential_link_type: "Partner Page Listing",
    authority_score: 87,
    status: "CONFIRMED",
    website_url: "https://nasscom.in",
  },
  {
    id: "part_5",
    partner_name: "Enterprise Client Case Study: Real Estate AI Walkthroughs",
    domain: "damacproperties.com",
    category: "CLIENT_CASE_STUDY",
    region: "UAE",
    potential_link_type: "Co-Authored Case Study",
    authority_score: 85,
    status: "IDENTIFIED",
    website_url: "https://damacproperties.com",
  },
  {
    id: "part_6",
    partner_name: "Midjourney Commercial Showcase",
    domain: "midjourney.com",
    category: "AI_TECH_VENDOR",
    region: "USA",
    potential_link_type: "Certified Agency Badge",
    authority_score: 93,
    status: "IDENTIFIED",
    website_url: "https://midjourney.com",
  },
];

export default function PartnershipsClientView() {
  const [partnerships, setPartnerships] = useState<PartnershipLead[]>(SAMPLE_PARTNERSHIPS);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [activePartner, setActivePartner] = useState<PartnershipLead | null>(null);
  const [pitchSubject, setPitchSubject] = useState("");
  const [pitchBody, setPitchBody] = useState("");
  const [queuing, setQueuing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleOpenPitch = (p: PartnershipLead) => {
    setActivePartner(p);
    setPitchSubject(`Agency Partnership & Technology Integration: D'Genius Solutions x ${p.partner_name}`);
    setPitchBody(
      `Hello ${p.partner_name} Partner Team,\n\nI am contacting you from D'Genius Solutions, an enterprise AI video production and strategic growth agency.\n\nWe actively deploy your technologies in high-velocity commercial campaigns for major clients in Mumbai, Dubai, and the US.\n\nWe'd like to explore being listed in your official partner network or co-authoring a technical case study detailing our production pipeline benchmarks.\n\nBest regards,\nPartnerships Director\nD'Genius Solutions (https://www.dgeniussolutions.com)`
    );
  };

  const handleQueuePartnership = async () => {
    if (!activePartner) return;
    setQueuing(true);
    try {
      const res = await fetch("/api/admin/off-page/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunity_id: activePartner.id,
          target_domain: activePartner.domain,
          target_url: activePartner.website_url,
          campaign_type: "PARTNERSHIP",
          stage: "INTERNAL_APPROVED",
          pitch_subject: pitchSubject,
          pitch_body: pitchBody,
          recommended_dgs_target_page: "/services/ai-video-production-agency/",
          target_anchor: "D'Genius Solutions",
          approval_status: "approved",
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setPartnerships((prev) =>
          prev.map((item) => (item.id === activePartner.id ? { ...item, status: "PITCHED" } : item))
        );
        setActivePartner(null);
        setFeedback("Partnership proposal queued into Outreach CRM.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQueuing(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const filtered = partnerships.filter((p) => {
    if (selectedCategory !== "ALL" && p.category !== selectedCategory) return false;
    if (selectedRegion !== "ALL" && p.region !== selectedRegion) return false;
    return true;
  });

  const columns: Column<PartnershipLead>[] = [
    {
      key: "partner_name",
      header: "Partner & Ecosystem",
      sortable: true,
      render: (p) => (
        <div>
          <div style={{ fontWeight: 650, color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
            {p.partner_name}
            <a
              href={p.website_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--dgs-brand-cyan)", display: "inline-flex" }}
            >
              <ExternalLink size={13} />
            </a>
          </div>
          <div style={{ fontSize: "0.74rem", color: "var(--dgs-brand-cyan)" }}>{p.domain}</div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Partnership Type",
      render: (p) => {
        const labels: Record<string, string> = {
          AI_TECH_VENDOR: "AI Tech Vendor",
          AGENCY_ECOSYSTEM: "Agency Ecosystem",
          CLIENT_CASE_STUDY: "Client Case Study",
          MEDIA_PARTNER: "Media Partner",
        };
        return (
          <span style={{ fontSize: "0.75rem", color: "#e2e8f0" }}>{labels[p.category] || p.category}</span>
        );
      },
    },
    {
      key: "region",
      header: "Region",
      render: (p) => (
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
          {p.region}
        </span>
      ),
    },
    {
      key: "potential_link_type",
      header: "Link Asset Opportunity",
      render: (p) => (
        <span style={{ fontSize: "0.76rem", color: "#34d399", fontWeight: 600 }}>
          {p.potential_link_type}
        </span>
      ),
    },
    {
      key: "authority_score",
      header: "Authority",
      sortable: true,
      render: (p) => (
        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#10b981" }}>
          {p.authority_score} DA
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            padding: "2px 6px",
            borderRadius: "4px",
            background: p.status === "CONFIRMED" ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.08)",
            color: p.status === "CONFIRMED" ? "#34d399" : "#e2e8f0",
          }}
        >
          {p.status}
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
            Strategic Agency & Technology Partnerships
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
            Earns ultra-high authority, editorial backlinks through certified technology vendor badges, enterprise client case studies, and industry trade bodies.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--dgs-brand-cyan)", display: "flex", alignItems: "center", gap: "4px" }}>
            <Award size={14} /> 100% Free Legit Authority Assets
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
        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Category:</span>
        {[
          { id: "ALL", label: "All Categories" },
          { id: "AI_TECH_VENDOR", label: "AI Tech Vendors" },
          { id: "AGENCY_ECOSYSTEM", label: "Agency Ecosystem" },
          { id: "CLIENT_CASE_STUDY", label: "Client Case Studies" },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`dgs-saas-chip ${selectedCategory === c.id ? "primary" : ""}`}
            style={{ cursor: "pointer", border: "none" }}
          >
            {c.label}
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
        <SaaSTable<PartnershipLead>
          columns={columns}
          data={filtered}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search partner name or domain..."
          searchFilter={(item, q) =>
            item.partner_name.toLowerCase().includes(q) || item.domain.toLowerCase().includes(q)
          }
          actions={(item) => (
            <button
              onClick={() => handleOpenPitch(item)}
              className="dgs-saas-btn primary"
              style={{ fontSize: "0.72rem", padding: "4px 8px" }}
            >
              Draft Proposal
            </button>
          )}
          initialPageSize={10}
          emptyMessage="No partnerships matching filters."
        />
      </div>

      {/* Proposal Modal */}
      {activePartner && (
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
                <Handshake size={18} color="var(--dgs-brand-cyan)" />
                <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem" }}>Draft Partnership Proposal</h3>
              </div>
              <button onClick={() => setActivePartner(null)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>Partner:</span>
              <div style={{ fontWeight: 650, color: "#fff" }}>{activePartner.partner_name} ({activePartner.domain})</div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Proposal Subject:
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
                Collaboration Pitch:
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
                <ShieldCheck size={14} /> Ready for executive review
              </span>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setActivePartner(null)} className="dgs-saas-btn secondary">
                  Cancel
                </button>
                <button onClick={handleQueuePartnership} disabled={queuing} className="dgs-saas-btn primary">
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
