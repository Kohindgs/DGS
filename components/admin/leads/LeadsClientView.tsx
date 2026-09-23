"use client";

import React, { useState, useMemo } from "react";
import SaaSTable, { Column, TableTab } from "@/components/admin/SaaSTable";
import PageHeader from "@/components/admin/PageHeader";
import AdminDetailDrawer from "@/components/admin/AdminDetailDrawer";
import type { CmsLead } from "@/lib/cms/leads";
import {
  Inbox,
  Mail,
  Phone,
  Calendar,
  Globe,
  FileText,
  Download,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

type Props = {
  initialLeads: CmsLead[];
};

function parsePayloadObj(value: unknown): Record<string, any> {
  if (!value) return {};
  if (typeof value === "object") return value as Record<string, any>;
  try {
    return JSON.parse(String(value));
  } catch {
    return {};
  }
}

export default function LeadsClientView({ initialLeads }: Props) {
  const [leads, setLeads] = useState<CmsLead[]>(initialLeads);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<CmsLead | null>(null);
  const [updating, setUpdating] = useState(false);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: leads.length,
      new: 0,
      contacted: 0,
      qualified: 0,
      won: 0,
      lost: 0,
    };
    leads.forEach((l) => {
      const s = (l.status || "new").toLowerCase();
      if (counts[s] !== undefined) {
        counts[s]++;
      }
    });
    return counts;
  }, [leads]);

  const tabs: TableTab[] = [
    { id: "all", label: "All Leads", count: tabCounts.all },
    { id: "new", label: "New", count: tabCounts.new },
    { id: "contacted", label: "Contacted", count: tabCounts.contacted },
    { id: "qualified", label: "Qualified", count: tabCounts.qualified },
    { id: "won", label: "Won", count: tabCounts.won },
    { id: "lost", label: "Lost", count: tabCounts.lost },
  ];

  // Filtered by active tab
  const tabFilteredLeads = useMemo(() => {
    if (activeTab === "all") return leads;
    return leads.filter((l) => (l.status || "new").toLowerCase() === activeTab);
  }, [leads, activeTab]);

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    setUpdating(true);
    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        throw new Error("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      // Revert if error
      setLeads(initialLeads);
    } finally {
      setUpdating(false);
    }
  };

  const columns: Column<CmsLead>[] = [
    {
      key: "name",
      header: "Contact",
      sortable: true,
      render: (lead) => {
        const p = parsePayloadObj(lead.payload);
        return (
          <div
            onClick={() => setSelectedLead(lead)}
            style={{ cursor: "pointer" }}
          >
            <div style={{ fontWeight: 600, color: "var(--dgs-text-primary)" }}>
              {lead.name || p.fullName || "Unnamed Contact"}
            </div>
            <div style={{ fontSize: "12px", color: "var(--dgs-text-muted)", display: "flex", alignItems: "center", gap: "10px", marginTop: "2px" }}>
              {lead.email && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                  <Mail size={11} /> {lead.email}
                </span>
              )}
              {lead.phone && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                  <Phone size={11} /> {lead.phone}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "source",
      header: "Source / Form",
      sortable: true,
      render: (lead) => {
        const p = parsePayloadObj(lead.payload);
        const isCareer = lead.source_form_key === "career-application";
        return (
          <div>
            {isCareer ? (
              <span className="dgs-saas-chip sm primary">
                {p.position || "Career Application"}
              </span>
            ) : (
              <span className="dgs-saas-chip sm neutral">
                {lead.source_form_key || "enquiry-form"}
              </span>
            )}
            <div style={{ fontSize: "11px", color: "var(--dgs-text-dim)", marginTop: "2px" }}>
              {lead.source_route || "/"}
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      width: "120px",
      render: (lead) => {
        const s = (lead.status || "new").toLowerCase();
        let chipClass = "neutral";
        if (s === "new") chipClass = "primary";
        else if (s === "contacted") chipClass = "warning";
        else if (s === "qualified") chipClass = "info";
        else if (s === "won") chipClass = "success";
        else if (s === "lost" || s === "spam") chipClass = "danger";

        return (
          <span className={`dgs-saas-chip sm ${chipClass}`} style={{ textTransform: "capitalize" }}>
            {s}
          </span>
        );
      },
    },
    {
      key: "created_at",
      header: "Date",
      sortable: true,
      width: "110px",
      render: (lead) => (
        <span style={{ fontSize: "12px", color: "var(--dgs-text-muted)", whiteSpace: "nowrap" }}>
          {new Date(lead.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
  ];

  const selectedPayload = selectedLead ? parsePayloadObj(selectedLead.payload) : {};
  const isSelectedCareer = selectedLead?.source_form_key === "career-application";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <PageHeader
        title="Client Leads & Submissions"
        subtitle={`Review and manage ${leads.length} customer inquiries, consultations, and form submissions.`}
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="dgs-saas-chip sm neutral">
              {leads.length} Total Submissions
            </span>
          </div>
        }
      />

      <SaaSTable<CmsLead>
        columns={columns}
        data={tabFilteredLeads}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search leads by name, email, phone, or route..."
        searchFilter={(item, query) => {
          const p = parsePayloadObj(item.payload);
          return (
            (item.name || "").toLowerCase().includes(query) ||
            (item.email || "").toLowerCase().includes(query) ||
            (item.phone || "").toLowerCase().includes(query) ||
            (item.source_route || "").toLowerCase().includes(query) ||
            (item.source_form_key || "").toLowerCase().includes(query) ||
            (p.position || "").toLowerCase().includes(query)
          );
        }}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id)}
        actions={(lead) => (
          <button
            type="button"
            className="dgs-saas-btn secondary sm"
            onClick={() => setSelectedLead(lead)}
            style={{ height: "28px", fontSize: "12px" }}
          >
            Inspect
          </button>
        )}
        emptyMessage={`No leads found under status "${activeTab}".`}
      />

      {/* Slide-Out Detail Drawer for Selected Lead */}
      <AdminDetailDrawer
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        title={selectedLead?.name || "Lead Details"}
        subtitle={selectedLead?.email || "Submission Overview"}
        footer={
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <div style={{ fontSize: "11px", color: "var(--dgs-text-dim)" }}>
              ID: {selectedLead?.id?.slice(0, 8)}
            </div>
            <button
              type="button"
              className="dgs-saas-btn secondary sm"
              onClick={() => setSelectedLead(null)}
            >
              Close Drawer
            </button>
          </div>
        }
      >
        {selectedLead && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Status Progression Strip */}
            <div style={{ padding: "14px", backgroundColor: "var(--dgs-bg-surface-secondary)", borderRadius: "var(--dgs-radius-md)", border: "1px solid var(--dgs-border)" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--dgs-text-dim)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
                Lead Pipeline Stage
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {["new", "contacted", "qualified", "won", "lost"].map((st) => {
                  const isCurrent = (selectedLead.status || "new").toLowerCase() === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      disabled={updating}
                      onClick={() => handleUpdateStatus(selectedLead.id, st)}
                      className={`dgs-saas-btn sm ${isCurrent ? "primary" : "secondary"}`}
                      style={{ textTransform: "capitalize", flex: "1 1 auto", fontSize: "12px", height: "30px" }}
                    >
                      {isCurrent && <CheckCircle2 size={12} strokeWidth={2.5} />}
                      <span>{st}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact Details Card */}
            <div style={{ padding: "16px", backgroundColor: "var(--dgs-bg-surface)", borderRadius: "var(--dgs-radius-md)", border: "1px solid var(--dgs-border)" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--dgs-text-primary)", marginBottom: "12px" }}>
                Contact Information
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                {selectedLead.email && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--dgs-text-muted)" }}>Email:</span>
                    <a
                      href={`mailto:${selectedLead.email}`}
                      style={{ color: "var(--dgs-brand-blue)", textDecoration: "none", fontWeight: 500 }}
                    >
                      {selectedLead.email}
                    </a>
                  </div>
                )}

                {selectedLead.phone && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--dgs-text-muted)" }}>Phone:</span>
                    <a
                      href={`tel:${selectedLead.phone}`}
                      style={{ color: "var(--dgs-brand-blue)", textDecoration: "none", fontWeight: 500 }}
                    >
                      {selectedLead.phone}
                    </a>
                  </div>
                )}

                {selectedLead.source_route && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--dgs-text-muted)" }}>Source URL:</span>
                    <span style={{ fontFamily: "var(--dgs-font-mono)", fontSize: "12px", color: "var(--dgs-text-primary)" }}>
                      {selectedLead.source_route}
                    </span>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--dgs-text-muted)" }}>Form Key:</span>
                  <code style={{ fontSize: "12px", background: "var(--dgs-bg-surface-secondary)", padding: "2px 6px", borderRadius: "4px" }}>
                    {selectedLead.source_form_key || "generic"}
                  </code>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--dgs-text-muted)" }}>Received:</span>
                  <span style={{ color: "var(--dgs-text-dim)", fontSize: "12px" }}>
                    {new Date(selectedLead.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Documents & Portfolios (If Career Application) */}
            {isSelectedCareer && (selectedPayload.resume || selectedPayload.portfolio || selectedPayload.portfolioUrl) && (
              <div style={{ padding: "16px", backgroundColor: "var(--dgs-bg-surface)", borderRadius: "var(--dgs-radius-md)", border: "1px solid var(--dgs-border)" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--dgs-text-primary)", marginBottom: "12px" }}>
                  Candidate Attachments
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {selectedPayload.resume && (
                    <a
                      href={`/api/admin/leads/${selectedLead.id}/resume`}
                      className="dgs-saas-btn secondary sm"
                      style={{ justifyContent: "flex-start" }}
                    >
                      <Download size={13} />
                      <span>Download Resume / CV ({selectedPayload.resume.originalName || "File"})</span>
                    </a>
                  )}

                  {selectedPayload.portfolio && (
                    <a
                      href={`/api/admin/leads/${selectedLead.id}/portfolio`}
                      className="dgs-saas-btn secondary sm"
                      style={{ justifyContent: "flex-start" }}
                    >
                      <Download size={13} />
                      <span>Download Portfolio PDF ({selectedPayload.portfolio.originalName || "PDF"})</span>
                    </a>
                  )}

                  {selectedPayload.portfolioUrl && (
                    <a
                      href={selectedPayload.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dgs-saas-btn secondary sm"
                      style={{ justifyContent: "flex-start" }}
                    >
                      <ExternalLink size={13} />
                      <span>Open External Portfolio Link ↗</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Submission Form Payload */}
            <div style={{ padding: "16px", backgroundColor: "var(--dgs-bg-surface)", borderRadius: "var(--dgs-radius-md)", border: "1px solid var(--dgs-border)" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--dgs-text-primary)", marginBottom: "12px" }}>
                Submission Payload &amp; Answers
              </div>

              {Object.keys(selectedPayload).length === 0 ? (
                <div style={{ fontSize: "12px", color: "var(--dgs-text-muted)" }}>
                  No extra submission fields.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {Object.entries(selectedPayload).map(([key, val]) => {
                    if (key === "resume" || key === "portfolio") return null;
                    return (
                      <div
                        key={key}
                        style={{
                          padding: "8px 12px",
                          backgroundColor: "var(--dgs-bg-surface-secondary)",
                          borderRadius: "var(--dgs-radius-sm)",
                          border: "1px solid var(--dgs-border-subtle)",
                        }}
                      >
                        <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--dgs-text-dim)", textTransform: "capitalize" }}>
                          {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
                        </div>
                        <div style={{ fontSize: "13px", color: "var(--dgs-text-primary)", marginTop: "2px", wordBreak: "break-word" }}>
                          {typeof val === "object" ? JSON.stringify(val) : String(val || "—")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </AdminDetailDrawer>
    </div>
  );
}
