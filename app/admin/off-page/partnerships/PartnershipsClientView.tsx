"use client";

import React, { useState, useEffect } from "react";
import {
  Handshake,
  ExternalLink,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Users,
  Award,
  Plus,
  X,
} from "lucide-react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";

interface PartnershipLead {
  id: string;
  partner_name: string;
  domain: string;
  category: "AI_TECH_VENDOR" | "AGENCY_ECOSYSTEM" | "CLIENT_CASE_STUDY" | "MEDIA_PARTNER";
  region: "INDIA" | "UAE" | "USA" | "GLOBAL";
  potential_link_type: string;
  authority_score: number;
  status: "IDENTIFIED" | "PITCHED" | "CONFIRMED" | "LIVE";
  website_url: string;
}

export default function PartnershipsClientView() {
  const [partnerships, setPartnerships] = useState<PartnershipLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [activePartner, setActivePartner] = useState<PartnershipLead | null>(null);
  const [pitchSubject, setPitchSubject] = useState("");
  const [pitchBody, setPitchBody] = useState("");
  const [queuing, setQueuing] = useState(false);
  const [feedback, setFeedback] = useState<React.ReactNode | null>(null);

  // Add Partner Lead modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newRegion, setNewRegion] = useState<"INDIA" | "UAE" | "USA" | "GLOBAL">("GLOBAL");
  const [newLinkType, setNewLinkType] = useState("Partner Directory Listing");
  const [addingLead, setAddingLead] = useState(false);

  const fetchPartnerships = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/off-page/opportunities?status=ALL");
      const json = await res.json();
      if (json.ok && Array.isArray(json.opportunities)) {
        const partnerItems = json.opportunities
          .filter((o: any) => o.category === "PARTNERSHIP" || o.category === "ASSOCIATION")
          .map((o: any) => ({
            id: o.id,
            partner_name: o.site_name || o.domain,
            domain: o.domain,
            category: "AGENCY_ECOSYSTEM" as any,
            region: o.region || "GLOBAL",
            potential_link_type: o.submission_type || "Partner Directory Listing",
            authority_score: o.authority_score || 85,
            status: (o.status === "OUTREACH" ? "PITCHED" : o.status === "LIVE" ? "LIVE" : "IDENTIFIED") as any,
            website_url: o.exact_submission_url || `https://${o.domain}`,
          }));
        setPartnerships(partnerItems);
      }
    } catch (err) {
      console.error("Failed to load partnerships:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnerships();
  }, []);

  const handleOpenPitch = (p: PartnershipLead) => {
    setActivePartner(p);
    setPitchSubject(`Agency Partnership & Technology Integration: D'Genius Solutions x ${p.partner_name}`);
    setPitchBody(
      `Hello ${p.partner_name} Partner Team,\n\nI am contacting you from D'Genius Solutions, an enterprise AI video production and strategic search agency.\n\nWe deliver technical SEO, generative search optimization (GEO), and enterprise commercial video campaigns for clients across India, UAE, and global markets.\n\nWe would welcome exploring inclusion in your official partner network or co-authoring a technical case study detailing our production workflows and client results.\n\nBest regards,\n\nKohin Bellara\nCEO, D'Genius Solutions\nhttps://www.dgeniussolutions.com/`
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
          source_module: "PARTNERSHIPS",
          source_record_id: activePartner.id,
          target_domain: activePartner.domain,
          target_url: activePartner.website_url,
          publication: activePartner.partner_name,
          campaign_type: "PARTNERSHIP",
          stage: "DRAFT",
          pitch_subject: pitchSubject,
          pitch_body: pitchBody,
          target_page: "https://www.dgeniussolutions.com/services/ai-video-production-agency/",
          assigned_staff: "Kohin Bellara - CEO D'Genius Solutions",
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setPartnerships((prev) =>
          prev.map((item) => (item.id === activePartner.id ? { ...item, status: "PITCHED" } : item))
        );
        setActivePartner(null);
        setFeedback(
          <span>
            Partnership proposal draft saved.{" "}
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
      setQueuing(false);
      setTimeout(() => setFeedback(null), 8000);
    }
  };

  const handleCreatePartnerLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerName || !newDomain) return;
    setAddingLead(true);
    try {
      const cleanDomain = newDomain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/^www\./, "");
      const res = await fetch("/api/admin/off-page/opportunities/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records: [
            {
              site_name: newPartnerName,
              domain: cleanDomain,
              exact_action_url: newUrl || `https://${cleanDomain}`,
              region: newRegion,
              category: "PARTNERSHIP",
              free_status: "FREE",
              target_page: "https://www.dgeniussolutions.com/services/ai-video-production-agency/",
              verification_status: "QUALIFIED",
              evidence: "Manually registered partner lead",
            },
          ],
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setShowAddModal(false);
        setNewPartnerName("");
        setNewDomain("");
        setNewUrl("");
        setFeedback("Partnership lead registered successfully.");
        await fetchPartnerships();
      } else {
        setFeedback(`Failed: ${json.error || json.errors?.join("; ")}`);
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setAddingLead(false);
      setTimeout(() => setFeedback(null), 6000);
    }
  };

  const filtered = partnerships.filter((p) => {
    if (selectedRegion !== "ALL" && p.region !== selectedRegion) return false;
    return true;
  });

  const columns: Column<PartnershipLead>[] = [
    {
      key: "partner_name",
      header: "Partner & Ecosystem Domain",
      sortable: true,
      render: (p) => (
        <div>
          <div style={{ fontWeight: 650, color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
            {p.partner_name}
            {p.website_url && (
              <a
                href={p.website_url}
                target="_blank"
                rel="noopener noreferrer"
                title="Open Website"
                style={{ color: "var(--dgs-brand-cyan)", display: "inline-flex" }}
              >
                <ExternalLink size={13} />
              </a>
            )}
          </div>
          <div style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>
            {p.domain}
          </div>
        </div>
      ),
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
      header: "Link Asset Type",
      render: (p) => (
        <span style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.85)" }}>
          {p.potential_link_type}
        </span>
      ),
    },
    {
      key: "authority_score",
      header: "Authority",
      sortable: true,
      render: (p) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#10b981" }}>{p.authority_score}</span>
          <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>DA</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => {
        const badgeColors: Record<string, { bg: string; color: string }> = {
          IDENTIFIED: { bg: "rgba(59,130,246,0.15)", color: "#60a5fa" },
          PITCHED: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
          CONFIRMED: { bg: "rgba(16,185,129,0.15)", color: "#34d399" },
          LIVE: { bg: "rgba(16,185,129,0.25)", color: "#10b981" },
        };
        const c = badgeColors[p.status] || { bg: "rgba(255,255,255,0.08)", color: "#fff" };
        return (
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: "4px",
              background: c.bg,
              color: c.color,
            }}
          >
            {p.status}
          </span>
        );
      },
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
            Ecosystem Partnerships & Directory Collaborations
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
            Genuine agency partner directories, software integrations, and ecosystem badges. Pitch identity: Kohin Bellara - CEO D'Genius Solutions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="dgs-saas-btn primary"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <Plus size={14} /> Add Partnership Lead
        </button>
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

      {/* Region Filter */}
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
              style={{ fontSize: "0.72rem", padding: "4px 8px", display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              <Send size={11} /> Create Draft
            </button>
          )}
          initialPageSize={10}
          emptyMessage="No active partnership leads registered yet."
        />
      </div>

      {/* Pitch Modal */}
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
                <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem" }}>
                  Draft Partnership Proposal: {activePartner.partner_name}
                </h3>
              </div>
              <button onClick={() => setActivePartner(null)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>
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
                Proposal Content:
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
                <ShieldCheck size={14} /> Saves to Outreach CRM Drafts for Review
              </span>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setActivePartner(null)} className="dgs-saas-btn secondary">
                  Cancel
                </button>
                <button onClick={handleQueuePartnership} disabled={queuing} className="dgs-saas-btn primary">
                  {queuing ? "Saving Draft..." : "Save Draft to Outreach CRM"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Partner Modal */}
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
            onSubmit={handleCreatePartnerLead}
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
              <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem" }}>Register Partnership Opportunity</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "0.78rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Partner Entity Name:
              </label>
              <input
                type="text"
                required
                value={newPartnerName}
                onChange={(e) => setNewPartnerName(e.target.value)}
                placeholder="e.g. HubSpot Ecosystem Partner"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "0.85rem",
                }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "0.78rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Partner Domain:
              </label>
              <input
                type="text"
                required
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="hubspot.com"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "0.85rem",
                }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "0.78rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Action / Listing URL:
              </label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://hubspot.com/partners"
                style={{
                  width: "100%",
                  padding: "8px 10px",
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
                Region:
              </label>
              <select
                value={newRegion}
                onChange={(e) => setNewRegion(e.target.value as any)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "0.85rem",
                }}
              >
                <option value="INDIA">INDIA</option>
                <option value="UAE">UAE</option>
                <option value="USA">USA</option>
                <option value="GLOBAL">GLOBAL</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="dgs-saas-btn secondary"
              >
                Cancel
              </button>
              <button type="submit" disabled={addingLead} className="dgs-saas-btn primary">
                {addingLead ? "Saving..." : "Register Lead"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
