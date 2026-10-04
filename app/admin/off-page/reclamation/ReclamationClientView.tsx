"use client";

import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import type { OffPageBacklink } from "@/lib/off-page/types";

interface Props {
  initialLinks?: OffPageBacklink[];
}

export default function ReclamationClientView({ initialLinks }: Props) {
  const [links, setLinks] = useState<OffPageBacklink[]>(initialLinks || []);
  const [loading, setLoading] = useState(!initialLinks);
  const [selectedIssue, setSelectedIssue] = useState<string>("ALL");
  const [activeLink, setActiveLink] = useState<OffPageBacklink | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [reclaiming, setReclaiming] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchReclamationCandidates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/off-page/backlinks?status=ALL`);
      const json = await res.json();
      if (json.ok) {
        const reclaimCandidates = (json.backlinks as OffPageBacklink[]).filter(
          (b) =>
            b.status === "LOST" ||
            b.status === "BROKEN" ||
            b.status === "REDIRECTED" ||
            b.status === "RECLAIM" ||
            b.status === "REMOVED"
        );
        setLinks(reclaimCandidates);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReclamationCandidates();
  }, []);

  const handleOpenReclaimModal = (l: OffPageBacklink) => {
    setActiveLink(l);
    setSubject(`Link Update / Restoring Reference for D'Genius Solutions (${l.source_domain})`);
    setBody(
      `Hello ${l.source_domain} Webmaster / Editorial Team,\n\nWe noticed that a previously active reference to our work on "${l.source_url}" appears to have been altered or broken.\n\nOur canonical service documentation remains active at: ${l.target_url}\n\nCould your team kindly restore the link to ensure your readers have unbroken access to the referenced benchmarks?\n\nThank you for your time!\n\nD'Genius Solutions Digital Team`
    );
  };

  const handleQueueReclaim = async () => {
    if (!activeLink) return;
    setReclaiming(true);
    try {
      const res = await fetch("/api/admin/off-page/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunity_id: activeLink.id,
          target_domain: activeLink.source_domain,
          target_url: activeLink.source_url,
          campaign_type: "LOST_LINK_RECLAIM",
          stage: "INTERNAL_APPROVED",
          pitch_subject: subject,
          pitch_body: body,
          recommended_dgs_target_page: activeLink.target_url,
          target_anchor: activeLink.anchor_text || "D'Genius Solutions",
          approval_status: "approved",
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setActiveLink(null);
        setFeedback("Reclamation pitch queued into Outreach CRM.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReclaiming(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const filtered = links.filter((l) => {
    if (selectedIssue !== "ALL" && l.status !== selectedIssue) return false;
    return true;
  });

  const columns: Column<OffPageBacklink>[] = [
    {
      key: "source_domain",
      header: "Source Domain & Affected URL",
      sortable: true,
      render: (l) => (
        <div>
          <div style={{ fontWeight: 650, color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
            {l.source_domain}
            <a
              href={l.source_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--dgs-brand-cyan)", display: "inline-flex" }}
            >
              <ExternalLink size={13} />
            </a>
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)" }}>{l.source_url}</div>
        </div>
      ),
    },
    {
      key: "target_url",
      header: "DGS Target Page",
      render: (l) => (
        <span style={{ fontSize: "0.74rem", color: "var(--dgs-brand-cyan)" }}>
          {l.target_url}
        </span>
      ),
    },
    {
      key: "status",
      header: "Reclamation Issue",
      sortable: true,
      render: (l) => {
        const issueConfig: Record<string, { label: string; color: string }> = {
          LOST: { label: "404 or Link Removed", color: "#ef4444" },
          BROKEN: { label: "Broken / 404 Target", color: "#f87171" },
          REDIRECTED: { label: "Redirected Target", color: "#f59e0b" },
          RECLAIM: { label: "Needs Reclamation", color: "#f97316" },
          REMOVED: { label: "Delisted / Removed", color: "#a855f7" },
        };
        const c = issueConfig[l.status] || { label: l.status, color: "#fff" };
        return (
          <span
            style={{
              padding: "3px 8px",
              borderRadius: "6px",
              fontSize: "0.72rem",
              fontWeight: 700,
              background: "rgba(255,255,255,0.06)",
              color: c.color,
              border: `1px solid ${c.color}`,
            }}
          >
            {c.label}
          </span>
        );
      },
    },
    {
      key: "authority_score",
      header: "Authority Score",
      sortable: true,
      render: (l) => (
        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
          {l.authority_score} DA
        </span>
      ),
    },
    {
      key: "last_checked_at",
      header: "Detected At",
      render: (l) => (
        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>
          {l.last_checked_at ? new Date(l.last_checked_at).toLocaleDateString() : "Recent"}
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
            Link Reclamation & Broken Link Recovery
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
            Automatically detects link drop-offs, rel attribute downgrades, source page noindex directives, and changed URLs to reclaim hard-earned equity.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.75rem", color: "#f59e0b", display: "flex", alignItems: "center", gap: "4px" }}>
            <AlertTriangle size={14} /> High-ROI Fast Authority Recovery
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
          gap: "8px",
          flexWrap: "wrap",
          padding: "10px 16px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "var(--dgs-radius-md)",
        }}
      >
        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Filter Issue:</span>
        {[
          { id: "ALL", label: "All Issues" },
          { id: "LOST", label: "Lost / 404 Links" },
          { id: "BROKEN", label: "Broken Links" },
          { id: "REDIRECTED", label: "Redirected Links" },
          { id: "RECLAIM", label: "Needs Reclamation" },
        ].map((i) => (
          <button
            key={i.id}
            onClick={() => setSelectedIssue(i.id)}
            className={`dgs-saas-chip ${selectedIssue === i.id ? "primary" : ""}`}
            style={{ cursor: "pointer", border: "none" }}
          >
            {i.label}
          </button>
        ))}
      </div>

      {/* Main SaaS Table */}
      <div className="dgs-saas-card" style={{ padding: "16px" }}>
        <SaaSTable<OffPageBacklink>
          columns={columns}
          data={filtered}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search domain, URL, target page..."
          searchFilter={(item, q) =>
            item.source_domain.toLowerCase().includes(q) ||
            item.source_url.toLowerCase().includes(q) ||
            item.target_url.toLowerCase().includes(q)
          }
          actions={(item) => (
            <button
              onClick={() => handleOpenReclaimModal(item)}
              className="dgs-saas-btn primary"
              style={{ fontSize: "0.72rem", padding: "4px 8px" }}
            >
              Reclaim Link
            </button>
          )}
          initialPageSize={12}
          emptyMessage="No links requiring reclamation at this time. All backlinks healthy!"
        />
      </div>

      {/* Reclaim Modal */}
      {activeLink && (
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
                <RefreshCw size={18} color="var(--dgs-brand-cyan)" />
                <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem" }}>Draft Reclamation Pitch</h3>
              </div>
              <button onClick={() => setActiveLink(null)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>Target Source:</span>
              <div style={{ fontWeight: 650, color: "#fff" }}>{activeLink.source_domain} ({activeLink.source_url})</div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Subject:
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
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                Reclamation Pitch Content:
              </label>
              <textarea
                rows={7}
                value={body}
                onChange={(e) => setBody(e.target.value)}
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
                <ShieldCheck size={14} /> Will be queued in Outreach CRM
              </span>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setActiveLink(null)} className="dgs-saas-btn secondary">
                  Cancel
                </button>
                <button onClick={handleQueueReclaim} disabled={reclaiming} className="dgs-saas-btn primary">
                  {reclaiming ? "Queuing..." : "Queue in Outreach CRM"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
