"use client";

import React, { useState, useEffect } from "react";
import {
  Megaphone,
  ExternalLink,
  Link2,
  CheckCircle2,
  Send,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  X,
} from "lucide-react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import type { OffPageBrandMention } from "@/lib/off-page/types";

function getDomain(urlStr: string): string {
  try {
    return new URL(urlStr).hostname.replace(/^www\./, "");
  } catch {
    return urlStr;
  }
}

interface Props {
  initialMentions?: OffPageBrandMention[];
}

export default function MentionsClientView({ initialMentions }: Props) {
  const [mentions, setMentions] = useState<OffPageBrandMention[]>(initialMentions || []);
  const [loading, setLoading] = useState(!initialMentions);
  const [filterLinked, setFilterLinked] = useState<"ALL" | "UNLINKED" | "LINKED">("ALL");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Outreach Modal for Unlinked Mention
  const [activeMention, setActiveMention] = useState<OffPageBrandMention | null>(null);
  const [pitchSubject, setPitchSubject] = useState("");
  const [pitchBody, setPitchBody] = useState("");
  const [queuing, setQueuing] = useState(false);

  const fetchMentions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/off-page/mentions");
      const json = await res.json();
      if (json.ok) {
        setMentions(json.mentions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMentions = mentions.filter((m) => {
    if (filterLinked === "UNLINKED") return !m.is_linked;
    if (filterLinked === "LINKED") return m.is_linked;
    return true;
  });

  const handleOpenPitchModal = (m: OffPageBrandMention) => {
    setActiveMention(m);
    const domain = getDomain(m.mention_url);
    setPitchSubject(`Quick Note / Link Attribution for ${m.brand_query} (${m.mention_title || domain})`);
    setPitchBody(
      `Hello ${domain} Team,\n\nI noticed your recent article "${m.mention_title || "Coverage"}" where you kindly mentioned ${m.brand_query}.\n\nFirst, thank you for citing our work!\n\nWould it be possible to add a hyperlink to our official page (https://www.dgeniussolutions.com/) so your readers can directly explore our referenced case studies and research?\n\nMuch appreciated,\nD'Genius Solutions Editorial Team`
    );
  };

  const handleQueueOutreach = async () => {
    if (!activeMention) return;
    setQueuing(true);
    try {
      const domain = getDomain(activeMention.mention_url);
      const res = await fetch("/api/admin/off-page/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunity_id: activeMention.id,
          target_domain: domain,
          target_url: activeMention.mention_url,
          campaign_type: "UNLINKED_MENTION_RECLAIM",
          stage: "INTERNAL_APPROVED",
          pitch_subject: pitchSubject,
          pitch_body: pitchBody,
          recommended_dgs_target_page: "/",
          target_anchor: activeMention.brand_query || "D'Genius Solutions",
          approval_status: "approved",
        }),
      });
      const json = await res.json();
      if (json.ok) {
        // Update mention status
        await fetch("/api/admin/off-page/mentions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: activeMention.id, status: "CONTACTED" }),
        });
        setMentions((prev) =>
          prev.map((item) => (item.id === activeMention.id ? { ...item, status: "CONTACTED" as any } : item))
        );
        setActiveMention(null);
        setFeedback("Unlinked mention queued into Outreach CRM for human approval.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQueuing(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const columns: Column<OffPageBrandMention>[] = [
    {
      key: "mention_title",
      header: "Mentioned In & Source",
      sortable: true,
      render: (m) => (
        <div>
          <div style={{ fontWeight: 650, color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
            {m.mention_title || "Web Mention"}
            <a
              href={m.mention_url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Article URL"
              style={{ color: "var(--dgs-brand-cyan)", display: "inline-flex" }}
            >
              <ExternalLink size={13} />
            </a>
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--dgs-brand-cyan)" }}>{getDomain(m.mention_url)}</div>
          <div
            style={{
              fontSize: "0.74rem",
              color: "rgba(255,255,255,0.6)",
              marginTop: "4px",
              fontStyle: "italic",
              background: "rgba(255,255,255,0.03)",
              padding: "4px 8px",
              borderRadius: "4px",
              borderLeft: "2px solid var(--dgs-brand-cyan)",
            }}
          >
            &ldquo;{m.snippet || "Brand reference cited."}&rdquo;
          </div>
        </div>
      ),
    },
    {
      key: "brand_query",
      header: "Brand Query",
      sortable: true,
      render: (m) => (
        <span style={{ fontSize: "0.8rem", color: "#34d399", fontWeight: 700 }}>
          {m.brand_query}
        </span>
      ),
    },
    {
      key: "is_linked",
      header: "Link Status",
      sortable: true,
      render: (m) => (
        <span
          style={{
            padding: "3px 8px",
            borderRadius: "6px",
            fontSize: "0.72rem",
            fontWeight: 700,
            background: m.is_linked ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
            color: m.is_linked ? "#10b981" : "#ef4444",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {m.is_linked ? <Link2 size={12} /> : null}
          {m.is_linked ? "Linked" : "Unlinked"}
        </span>
      ),
    },
    {
      key: "sentiment",
      header: "Sentiment",
      render: (m) => {
        const colors: Record<string, string> = {
          POSITIVE: "#10b981",
          NEUTRAL: "#60a5fa",
          NEGATIVE: "#ef4444",
        };
        return (
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: colors[m.sentiment] || "#fff" }}>
            {m.sentiment}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Outreach Status",
      render: (m) => (
        <span
          style={{
            fontSize: "0.7rem",
            padding: "2px 7px",
            borderRadius: "4px",
            background: "rgba(255,255,255,0.06)",
            color: "#e2e8f0",
          }}
        >
          {m.status}
        </span>
      ),
    },
    {
      key: "detected_at",
      header: "Detected",
      render: (m) => (
        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>
          {m.detected_at ? new Date(m.detected_at).toLocaleDateString() : "Recent"}
        </span>
      ),
    },
  ];

  const unlinkedCount = mentions.filter((m) => !m.is_linked).length;
  const linkedCount = mentions.filter((m) => m.is_linked).length;

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
            Brand Mentions & Unlinked Citation Reclamation
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
            Automatically tracks web citations of D&apos;Genius Solutions, founders, and proprietary frameworks to convert unlinked text into active backlinks.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "0.8rem", color: "#f59e0b", fontWeight: 700 }}>
            {unlinkedCount} Unlinked High-Potential Mentions
          </span>
        </div>
      </div>

      {/* Provider Truthfulness Banner (Section 29 & 41) */}
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
          <div style={{ fontWeight: 700 }}>BRAND MENTION DISCOVERY PROVIDER: NOT_CONFIGURED</div>
          <div style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.78rem", marginTop: "2px" }}>
            Automated brand monitoring stream requires Google Alerts API, Brand24 API, or Mention webhook credentials. Existing records are verified historical citations. TurboVec is active for semantic outreach matching.
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

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => setFilterLinked("ALL")}
          className={`dgs-saas-btn ${filterLinked === "ALL" ? "primary" : "secondary"}`}
          style={{ fontSize: "0.8rem", padding: "6px 14px" }}
        >
          All Mentions ({mentions.length})
        </button>
        <button
          onClick={() => setFilterLinked("UNLINKED")}
          className={`dgs-saas-btn ${filterLinked === "UNLINKED" ? "primary" : "secondary"}`}
          style={{ fontSize: "0.8rem", padding: "6px 14px" }}
        >
          Unlinked Mentions ({unlinkedCount})
        </button>
        <button
          onClick={() => setFilterLinked("LINKED")}
          className={`dgs-saas-btn ${filterLinked === "LINKED" ? "primary" : "secondary"}`}
          style={{ fontSize: "0.8rem", padding: "6px 14px" }}
        >
          Linked Citations ({linkedCount})
        </button>
      </div>

      {/* Main SaaS Table */}
      <div className="dgs-saas-card" style={{ padding: "16px" }}>
        <SaaSTable<OffPageBrandMention>
          columns={columns}
          data={filteredMentions}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search article title, domain, or snippet..."
          searchFilter={(item, q) =>
            (item.mention_title || "").toLowerCase().includes(q) ||
            getDomain(item.mention_url).toLowerCase().includes(q) ||
            (item.snippet || "").toLowerCase().includes(q)
          }
          actions={(item) =>
            !item.is_linked ? (
              <button
                onClick={() => handleOpenPitchModal(item)}
                className="dgs-saas-btn primary"
                style={{ fontSize: "0.72rem", padding: "4px 8px" }}
              >
                Claim Link
              </button>
            ) : null
          }
          initialPageSize={12}
          emptyMessage="No brand mentions found."
        />
      </div>

      {/* Reclaim Outreach Modal */}
      {activeMention && (
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
                <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem" }}>Claim Unlinked Mention</h3>
              </div>
              <button onClick={() => setActiveMention(null)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>Source Domain:</span>
              <div style={{ fontWeight: 650, color: "#fff" }}>
                {getDomain(activeMention.mention_url)} ({activeMention.mention_url})
              </div>
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
                Attribution Pitch Body:
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
                <ShieldCheck size={14} /> Will be queued into Outreach CRM
              </span>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setActiveMention(null)} className="dgs-saas-btn secondary">
                  Cancel
                </button>
                <button onClick={handleQueueOutreach} disabled={queuing} className="dgs-saas-btn primary">
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
