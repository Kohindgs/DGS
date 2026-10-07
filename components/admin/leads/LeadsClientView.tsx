"use client";

import React, { useState, useMemo } from "react";
import SaaSTable, { Column, TableTab } from "@/components/admin/SaaSTable";
import PageHeader from "@/components/admin/PageHeader";
import AdminDetailDrawer from "@/components/admin/AdminDetailDrawer";
import type { CmsLead } from "@/lib/cms/leads";
import { normalizeLead, NormalizedLead } from "@/lib/cms/lead-normalizer";
import {
  Mail,
  Phone,
  Building2,
  Globe,
  Download,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Info,
} from "lucide-react";

type Props = {
  initialLeads: CmsLead[];
};

const PIPELINE_STAGES = [
  { id: "new", label: "New", step: 1 },
  { id: "contacted", label: "Contacted", step: 2 },
  { id: "qualified", label: "Qualified", step: 3 },
  { id: "won", label: "Won", step: 4 },
];

export default function LeadsClientView({ initialLeads }: Props) {
  const [leads, setLeads] = useState<CmsLead[]>(initialLeads);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Normalize leads once per update
  const normalizedLeadsMap = useMemo(() => {
    const map = new Map<string, NormalizedLead>();
    for (const l of leads) {
      map.set(l.id, normalizeLead(l));
    }
    return map;
  }, [leads]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: leads.length,
      new: 0,
      contacted: 0,
      qualified: 0,
      won: 0,
      lost: 0,
      spam: 0,
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
    { id: "spam", label: "Spam", count: tabCounts.spam },
  ];

  // Filtered by active tab
  const tabFilteredLeads = useMemo(() => {
    if (activeTab === "all") return leads;
    return leads.filter((l) => (l.status || "new").toLowerCase() === activeTab);
  }, [leads, activeTab]);

  // Currently selected lead
  const selectedLead = useMemo(() => {
    if (!selectedLeadId) return null;
    return leads.find((l) => l.id === selectedLeadId) || null;
  }, [leads, selectedLeadId]);

  const normalizedSelectedLead = useMemo(() => {
    if (!selectedLead) return null;
    return normalizedLeadsMap.get(selectedLead.id) || normalizeLead(selectedLead);
  }, [selectedLead, normalizedLeadsMap]);

  const handleCopy = (text: string, key: string) => {
    if (!text || text === "—") return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    if (updating) return;
    setUpdating(true);
    setUpdateMessage(null);

    // Save previous status in case we need to roll back this specific lead
    const targetLead = leads.find((l) => l.id === leadId);
    const prevStatus = targetLead?.status || "new";

    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );

    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update lead status");
      }

      const formattedLabel = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
      setUpdateMessage({
        text: `Lead stage updated to ${formattedLabel}`,
        type: "success",
      });
      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (err: any) {
      console.error("Status update error:", err);
      // Revert only this specific lead's status
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: prevStatus } : l))
      );
      setUpdateMessage({
        text: err.message || "Failed to update lead status. Please try again.",
        type: "error",
      });
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
        const norm = normalizedLeadsMap.get(lead.id) || normalizeLead(lead);
        return (
          <div
            onClick={() => setSelectedLeadId(lead.id)}
            style={{ cursor: "pointer" }}
          >
            <div style={{ fontWeight: 600, color: "var(--dgs-text-primary)", fontSize: "13px" }}>
              {norm.fullName}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--dgs-text-muted)",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "8px",
                marginTop: "3px",
              }}
            >
              {norm.email && norm.email !== "—" && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                  <Mail size={11} style={{ opacity: 0.7 }} /> {norm.email}
                </span>
              )}
              {norm.phone && norm.phone !== "—" && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                  <Phone size={11} style={{ opacity: 0.7 }} /> {norm.phone}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "company",
      header: "Company",
      sortable: true,
      width: "160px",
      render: (lead) => {
        const norm = normalizedLeadsMap.get(lead.id) || normalizeLead(lead);
        return (
          <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--dgs-text-primary)" }}>
            {norm.company && norm.company !== "—" ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <Building2 size={13} style={{ color: "var(--dgs-text-dim)" }} />
                <span>{norm.company}</span>
              </span>
            ) : (
              <span style={{ color: "var(--dgs-text-dim)" }}>—</span>
            )}
          </div>
        );
      },
    },
    {
      key: "service",
      header: "Enquiry / Service",
      sortable: true,
      render: (lead) => {
        const norm = normalizedLeadsMap.get(lead.id) || normalizeLead(lead);
        return (
          <div>
            <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--dgs-text-primary)" }}>
              {norm.serviceInterest}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
              <span className="dgs-saas-chip sm neutral" style={{ fontSize: "10px", padding: "1px 6px" }}>
                {norm.formTitle}
              </span>
              {norm.isCareer && (
                <span className="dgs-saas-chip sm primary" style={{ fontSize: "10px", padding: "1px 6px" }}>
                  Career
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "source",
      header: "Source",
      sortable: true,
      render: (lead) => {
        const norm = normalizedLeadsMap.get(lead.id) || normalizeLead(lead);
        return (
          <div>
            <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--dgs-text-primary)" }}>
              {norm.sourcePageTitle}
            </div>
            <div
              style={{
                fontFamily: "var(--dgs-font-mono)",
                fontSize: "11px",
                color: "var(--dgs-text-dim)",
                marginTop: "2px",
              }}
            >
              {norm.route}
            </div>
            {norm.acquisitionSource && norm.acquisitionSource !== "—" && (
              <div style={{ marginTop: "3px" }}>
                <span
                  style={{
                    fontSize: "10px",
                    color: "var(--dgs-brand-blue)",
                    backgroundColor: "rgba(0, 102, 255, 0.08)",
                    padding: "1px 6px",
                    borderRadius: "4px",
                    display: "inline-block",
                  }}
                >
                  Via {norm.acquisitionSource}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Stage",
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
          <span className={`dgs-saas-chip sm ${chipClass}`} style={{ textTransform: "uppercase", fontSize: "10px", fontWeight: 700, letterSpacing: "0.04em" }}>
            {s}
          </span>
        );
      },
    },
    {
      key: "created_at",
      header: "Received",
      sortable: true,
      width: "160px",
      render: (lead) => {
        const norm = normalizedLeadsMap.get(lead.id) || normalizeLead(lead);
        const parts = norm.receivedAtIST.split("·");
        const datePart = parts[0]?.trim() || norm.receivedAtIST;
        const timePart = parts[1]?.trim() || "";

        return (
          <div suppressHydrationWarning style={{ whiteSpace: "nowrap" }}>
            <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--dgs-text-primary)" }}>
              {datePart}
            </div>
            {timePart && (
              <div style={{ fontSize: "11px", color: "var(--dgs-text-dim)", marginTop: "1px" }}>
                {timePart}
              </div>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <PageHeader
        title="Client Leads & Submissions"
        subtitle={`Review, qualify, and manage ${leads.length} customer inquiries, consultations, and form submissions.`}
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="dgs-saas-chip sm neutral">
              {tabCounts.all} Total Submissions
            </span>
            <span className="dgs-saas-chip sm primary">
              {tabCounts.new} Active Inquiries
            </span>
          </div>
        }
      />

      <SaaSTable<CmsLead>
        columns={columns}
        data={tabFilteredLeads}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search by name, company, service, source, email, phone, or route..."
        searchFilter={(item, query) => {
          const q = query.toLowerCase().trim();
          if (!q) return true;
          const norm = normalizedLeadsMap.get(item.id) || normalizeLead(item);

          return (
            norm.fullName.toLowerCase().includes(q) ||
            norm.company.toLowerCase().includes(q) ||
            norm.email.toLowerCase().includes(q) ||
            norm.phone.toLowerCase().includes(q) ||
            norm.serviceInterest.toLowerCase().includes(q) ||
            norm.formTitle.toLowerCase().includes(q) ||
            norm.acquisitionSource.toLowerCase().includes(q) ||
            norm.pageContext.toLowerCase().includes(q) ||
            norm.route.toLowerCase().includes(q) ||
            norm.sourcePageTitle.toLowerCase().includes(q)
          );
        }}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id)}
        actions={(lead) => (
          <button
            type="button"
            className="dgs-saas-btn secondary sm"
            onClick={() => {
              setSelectedLeadId(lead.id);
              setShowTechnicalDetails(false);
              setUpdateMessage(null);
            }}
            style={{ height: "28px", fontSize: "12px" }}
          >
            Inspect
          </button>
        )}
        emptyMessage={`No leads found under status "${activeTab}".`}
      />

      {/* CRM-Style Lead Detail Drawer */}
      <AdminDetailDrawer
        isOpen={Boolean(selectedLead && normalizedSelectedLead)}
        onClose={() => {
          setSelectedLeadId(null);
          setUpdateMessage(null);
        }}
        title={normalizedSelectedLead?.fullName || "Lead Details"}
        subtitle={
          normalizedSelectedLead
            ? `${normalizedSelectedLead.company !== "—" ? `${normalizedSelectedLead.company} · ` : ""}${normalizedSelectedLead.serviceInterest}`
            : "Submission Overview"
        }
        footer={
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <div style={{ fontSize: "11px", color: "var(--dgs-text-dim)" }}>
              Lead ID: {selectedLead?.id}
            </div>
            <button
              type="button"
              className="dgs-saas-btn secondary sm"
              onClick={() => setSelectedLeadId(null)}
            >
              Close Drawer
            </button>
          </div>
        }
      >
        {normalizedSelectedLead && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Header Stage Badge & Feedback Toast */}
            {updateMessage && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--dgs-radius-sm)",
                  fontSize: "12px",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor:
                    updateMessage.type === "success"
                      ? "rgba(16, 185, 129, 0.12)"
                      : "rgba(239, 68, 68, 0.12)",
                  color:
                    updateMessage.type === "success"
                      ? "rgb(16, 185, 129)"
                      : "rgb(239, 68, 68)",
                  border: `1px solid ${
                    updateMessage.type === "success"
                      ? "rgba(16, 185, 129, 0.3)"
                      : "rgba(239, 68, 68, 0.3)"
                  }`,
                }}
              >
                {updateMessage.type === "success" ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                <span>{updateMessage.text}</span>
              </div>
            )}

            {/* 1. Lead Pipeline Progression Stepper */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "var(--dgs-bg-surface)",
                borderRadius: "var(--dgs-radius-md)",
                border: "1px solid var(--dgs-border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--dgs-text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Lead Pipeline Stage
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    className={`dgs-saas-chip sm ${
                      normalizedSelectedLead.status === "won"
                        ? "success"
                        : normalizedSelectedLead.status === "lost" || normalizedSelectedLead.status === "spam"
                        ? "danger"
                        : "primary"
                    }`}
                    style={{ textTransform: "uppercase", fontSize: "10px", fontWeight: 700 }}
                  >
                    Current: {normalizedSelectedLead.status}
                  </span>
                </div>
              </div>

              {/* Stepper Progression */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "6px",
                  marginBottom: "10px",
                }}
              >
                {PIPELINE_STAGES.map((st) => {
                  const isCurrent = normalizedSelectedLead.status === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      disabled={updating}
                      onClick={() => handleUpdateStatus(normalizedSelectedLead.leadId, st.id)}
                      className={`dgs-saas-btn sm ${isCurrent ? "primary" : "secondary"}`}
                      style={{
                        height: "36px",
                        fontSize: "12px",
                        fontWeight: isCurrent ? 600 : 500,
                        position: "relative",
                        justifyContent: "center",
                        backgroundColor: isCurrent ? "var(--dgs-brand-blue)" : "var(--dgs-bg-surface-secondary)",
                      }}
                    >
                      {isCurrent ? <CheckCircle2 size={13} /> : <span style={{ opacity: 0.6 }}>{st.step}.</span>}
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Separate Dispositions: Lost & Spam */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "8px",
                  paddingTop: "10px",
                  borderTop: "1px solid var(--dgs-border-subtle)",
                }}
              >
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleUpdateStatus(normalizedSelectedLead.leadId, "lost")}
                  className={`dgs-saas-btn sm ${normalizedSelectedLead.status === "lost" ? "danger" : "secondary"}`}
                  style={{ height: "28px", fontSize: "11px" }}
                >
                  <XCircle size={12} />
                  <span>Mark as Lost</span>
                </button>

                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleUpdateStatus(normalizedSelectedLead.leadId, "spam")}
                  className={`dgs-saas-btn sm ${normalizedSelectedLead.status === "spam" ? "danger" : "secondary"}`}
                  style={{ height: "28px", fontSize: "11px" }}
                >
                  <ShieldAlert size={12} />
                  <span>Mark as Spam</span>
                </button>
              </div>
            </div>

            {/* 2. Contact Card */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "var(--dgs-bg-surface)",
                borderRadius: "var(--dgs-radius-md)",
                border: "1px solid var(--dgs-border)",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--dgs-text-primary)", marginBottom: "14px" }}>
                Contact Information
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                {/* Full Name */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "var(--dgs-text-muted)" }}>Full Name:</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--dgs-text-primary)" }}>
                      {normalizedSelectedLead.fullName}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(normalizedSelectedLead.fullName, "name")}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--dgs-text-dim)" }}
                      title="Copy Name"
                    >
                      {copiedKey === "name" ? <Check size={12} style={{ color: "var(--dgs-success)" }} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {/* Company */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "var(--dgs-text-muted)" }}>Company / Brand:</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--dgs-text-primary)" }}>
                      {normalizedSelectedLead.company}
                    </span>
                    {normalizedSelectedLead.company !== "—" && (
                      <button
                        type="button"
                        onClick={() => handleCopy(normalizedSelectedLead.company, "company")}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--dgs-text-dim)" }}
                        title="Copy Company"
                      >
                        {copiedKey === "company" ? <Check size={12} style={{ color: "var(--dgs-success)" }} /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "var(--dgs-text-muted)" }}>Email:</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {normalizedSelectedLead.email !== "—" ? (
                      <a
                        href={`mailto:${normalizedSelectedLead.email}`}
                        style={{ color: "var(--dgs-brand-blue)", textDecoration: "none", fontWeight: 500, fontSize: "13px" }}
                      >
                        {normalizedSelectedLead.email}
                      </a>
                    ) : (
                      <span style={{ color: "var(--dgs-text-dim)", fontSize: "13px" }}>—</span>
                    )}
                    {normalizedSelectedLead.email !== "—" && (
                      <button
                        type="button"
                        onClick={() => handleCopy(normalizedSelectedLead.email, "email")}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--dgs-text-dim)" }}
                        title="Copy Email"
                      >
                        {copiedKey === "email" ? <Check size={12} style={{ color: "var(--dgs-success)" }} /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "var(--dgs-text-muted)" }}>Phone / Mobile:</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {normalizedSelectedLead.phone !== "—" ? (
                      <a
                        href={`tel:${normalizedSelectedLead.phone}`}
                        style={{ color: "var(--dgs-brand-blue)", textDecoration: "none", fontWeight: 500, fontSize: "13px" }}
                      >
                        {normalizedSelectedLead.phone}
                      </a>
                    ) : (
                      <span style={{ color: "var(--dgs-text-dim)", fontSize: "13px" }}>—</span>
                    )}
                    {normalizedSelectedLead.phone !== "—" && (
                      <button
                        type="button"
                        onClick={() => handleCopy(normalizedSelectedLead.phone, "phone")}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--dgs-text-dim)" }}
                        title="Copy Phone"
                      >
                        {copiedKey === "phone" ? <Check size={12} style={{ color: "var(--dgs-success)" }} /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Career Candidate Details & Attachments (If Career Application) */}
            {normalizedSelectedLead.isCareer && normalizedSelectedLead.careerData && (
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "var(--dgs-bg-surface)",
                  borderRadius: "var(--dgs-radius-md)",
                  border: "1px solid var(--dgs-border)",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--dgs-text-primary)", marginBottom: "12px" }}>
                  Candidate Profile &amp; Attachments
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                  {normalizedSelectedLead.careerData.position && (
                    <div style={{ padding: "8px 10px", backgroundColor: "var(--dgs-bg-surface-secondary)", borderRadius: "var(--dgs-radius-sm)" }}>
                      <div style={{ fontSize: "10px", color: "var(--dgs-text-dim)", textTransform: "uppercase" }}>Position</div>
                      <div style={{ fontSize: "12px", fontWeight: 600, marginTop: "2px" }}>{normalizedSelectedLead.careerData.position}</div>
                    </div>
                  )}

                  {normalizedSelectedLead.careerData.location && (
                    <div style={{ padding: "8px 10px", backgroundColor: "var(--dgs-bg-surface-secondary)", borderRadius: "var(--dgs-radius-sm)" }}>
                      <div style={{ fontSize: "10px", color: "var(--dgs-text-dim)", textTransform: "uppercase" }}>Location</div>
                      <div style={{ fontSize: "12px", fontWeight: 500, marginTop: "2px" }}>{normalizedSelectedLead.careerData.location}</div>
                    </div>
                  )}

                  {normalizedSelectedLead.careerData.experience && (
                    <div style={{ padding: "8px 10px", backgroundColor: "var(--dgs-bg-surface-secondary)", borderRadius: "var(--dgs-radius-sm)" }}>
                      <div style={{ fontSize: "10px", color: "var(--dgs-text-dim)", textTransform: "uppercase" }}>Experience</div>
                      <div style={{ fontSize: "12px", fontWeight: 500, marginTop: "2px" }}>{normalizedSelectedLead.careerData.experience}</div>
                    </div>
                  )}

                  {normalizedSelectedLead.careerData.noticePeriod && (
                    <div style={{ padding: "8px 10px", backgroundColor: "var(--dgs-bg-surface-secondary)", borderRadius: "var(--dgs-radius-sm)" }}>
                      <div style={{ fontSize: "10px", color: "var(--dgs-text-dim)", textTransform: "uppercase" }}>Notice Period</div>
                      <div style={{ fontSize: "12px", fontWeight: 500, marginTop: "2px" }}>{normalizedSelectedLead.careerData.noticePeriod}</div>
                    </div>
                  )}

                  {normalizedSelectedLead.careerData.currentSalary && (
                    <div style={{ padding: "8px 10px", backgroundColor: "var(--dgs-bg-surface-secondary)", borderRadius: "var(--dgs-radius-sm)" }}>
                      <div style={{ fontSize: "10px", color: "var(--dgs-text-dim)", textTransform: "uppercase" }}>Current Compensation</div>
                      <div style={{ fontSize: "12px", fontWeight: 500, marginTop: "2px" }}>{normalizedSelectedLead.careerData.currentSalary}</div>
                    </div>
                  )}

                  {normalizedSelectedLead.careerData.expectedSalary && (
                    <div style={{ padding: "8px 10px", backgroundColor: "var(--dgs-bg-surface-secondary)", borderRadius: "var(--dgs-radius-sm)" }}>
                      <div style={{ fontSize: "10px", color: "var(--dgs-text-dim)", textTransform: "uppercase" }}>Expected Compensation</div>
                      <div style={{ fontSize: "12px", fontWeight: 500, marginTop: "2px" }}>{normalizedSelectedLead.careerData.expectedSalary}</div>
                    </div>
                  )}
                </div>

                {/* Attachments Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {normalizedSelectedLead.careerData.resume && (
                    <a
                      href={`/api/admin/leads/${normalizedSelectedLead.leadId}/resume`}
                      className="dgs-saas-btn secondary sm"
                      style={{ justifyContent: "flex-start" }}
                    >
                      <Download size={13} />
                      <span>Download Resume / CV ({normalizedSelectedLead.careerData.resume.originalName || "PDF"})</span>
                    </a>
                  )}

                  {normalizedSelectedLead.careerData.portfolio && (
                    <a
                      href={`/api/admin/leads/${normalizedSelectedLead.leadId}/portfolio`}
                      className="dgs-saas-btn secondary sm"
                      style={{ justifyContent: "flex-start" }}
                    >
                      <Download size={13} />
                      <span>Download Portfolio PDF ({normalizedSelectedLead.careerData.portfolio.originalName || "PDF"})</span>
                    </a>
                  )}

                  {normalizedSelectedLead.careerData.portfolioUrl && (
                    <a
                      href={normalizedSelectedLead.careerData.portfolioUrl}
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

            {/* 4. Enquiry Details Card */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "var(--dgs-bg-surface)",
                borderRadius: "var(--dgs-radius-md)",
                border: "1px solid var(--dgs-border)",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--dgs-text-primary)", marginBottom: "14px" }}>
                Enquiry Details
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* Core Enquiry Answers */}
                <div
                  style={{
                    padding: "10px 12px",
                    backgroundColor: "var(--dgs-bg-surface-secondary)",
                    borderRadius: "var(--dgs-radius-sm)",
                    border: "1px solid var(--dgs-border-subtle)",
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--dgs-text-dim)" }}>
                    Interested In / Service Requirement
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--dgs-text-primary)", marginTop: "2px" }}>
                    {normalizedSelectedLead.serviceInterest}
                  </div>
                </div>

                {normalizedSelectedLead.acquisitionSource && normalizedSelectedLead.acquisitionSource !== "—" && (
                  <div
                    style={{
                      padding: "10px 12px",
                      backgroundColor: "var(--dgs-bg-surface-secondary)",
                      borderRadius: "var(--dgs-radius-sm)",
                      border: "1px solid var(--dgs-border-subtle)",
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--dgs-text-dim)" }}>
                      How Did You Find Us?
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--dgs-text-primary)", marginTop: "2px" }}>
                      {normalizedSelectedLead.acquisitionSource}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    padding: "10px 12px",
                    backgroundColor: "var(--dgs-bg-surface-secondary)",
                    borderRadius: "var(--dgs-radius-sm)",
                    border: "1px solid var(--dgs-border-subtle)",
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--dgs-text-dim)" }}>
                    Form Identity
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--dgs-text-primary)" }}>
                      {normalizedSelectedLead.formTitle}
                    </span>
                    {normalizedSelectedLead.formId && (
                      <span className="dgs-saas-chip sm neutral" style={{ fontSize: "10px", padding: "1px 5px" }}>
                        ID: {normalizedSelectedLead.formId}
                      </span>
                    )}
                  </div>
                </div>

                {normalizedSelectedLead.pageContext && (
                  <div
                    style={{
                      padding: "10px 12px",
                      backgroundColor: "var(--dgs-bg-surface-secondary)",
                      borderRadius: "var(--dgs-radius-sm)",
                      border: "1px solid var(--dgs-border-subtle)",
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--dgs-text-dim)" }}>
                      Page Context
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--dgs-text-primary)", marginTop: "2px" }}>
                      {normalizedSelectedLead.pageContext}
                    </div>
                  </div>
                )}

                {/* Additional Normalized Answers */}
                {normalizedSelectedLead.answers.map((ans) => {
                  // Omit fields already shown in core block
                  if (ans.key === "dropdown" || ans.key === "dropdown_1" || ans.key === "hidden") return null;

                  return (
                    <div
                      key={ans.key}
                      style={{
                        padding: "10px 12px",
                        backgroundColor: "var(--dgs-bg-surface-secondary)",
                        borderRadius: "var(--dgs-radius-sm)",
                        border: "1px solid var(--dgs-border-subtle)",
                      }}
                    >
                      <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--dgs-text-dim)" }}>
                        {ans.label}
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--dgs-text-primary)", marginTop: "2px", wordBreak: "break-word" }}>
                        {String(ans.value)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Source Page & Attribution Card */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "var(--dgs-bg-surface)",
                borderRadius: "var(--dgs-radius-md)",
                border: "1px solid var(--dgs-border)",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--dgs-text-primary)", marginBottom: "14px" }}>
                Source &amp; Attribution
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
                {/* Source Page */}
                <div>
                  <div style={{ fontSize: "11px", color: "var(--dgs-text-muted)", marginBottom: "2px" }}>Source Page:</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--dgs-text-primary)" }}>
                        {normalizedSelectedLead.sourcePageTitle}
                      </div>
                      <div style={{ fontFamily: "var(--dgs-font-mono)", fontSize: "12px", color: "var(--dgs-text-dim)" }}>
                        {normalizedSelectedLead.route}
                      </div>
                    </div>
                    {normalizedSelectedLead.pageUrl && (
                      <a
                        href={normalizedSelectedLead.pageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dgs-saas-btn secondary sm"
                        style={{ fontSize: "11px", height: "26px", padding: "0 8px" }}
                      >
                        <span>Open Page</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Received Date/Time in IST */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid var(--dgs-border-subtle)" }}>
                  <span style={{ fontSize: "12px", color: "var(--dgs-text-muted)" }}>Received Date/Time:</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--dgs-text-primary)" }} suppressHydrationWarning>
                    {normalizedSelectedLead.receivedAtIST}
                  </span>
                </div>

                {/* UTM Campaign Attribution */}
                <div style={{ paddingTop: "8px", borderTop: "1px solid var(--dgs-border-subtle)" }}>
                  <div style={{ fontSize: "11px", color: "var(--dgs-text-muted)", marginBottom: "6px" }}>
                    Campaign Attribution (UTM):
                  </div>
                  {normalizedSelectedLead.hasUtm ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "12px" }}>
                      {normalizedSelectedLead.utm.source && (
                        <div>
                          <span style={{ color: "var(--dgs-text-dim)" }}>Source:</span>{" "}
                          <span style={{ fontWeight: 500 }}>{normalizedSelectedLead.utm.source}</span>
                        </div>
                      )}
                      {normalizedSelectedLead.utm.medium && (
                        <div>
                          <span style={{ color: "var(--dgs-text-dim)" }}>Medium:</span>{" "}
                          <span style={{ fontWeight: 500 }}>{normalizedSelectedLead.utm.medium}</span>
                        </div>
                      )}
                      {normalizedSelectedLead.utm.campaign && (
                        <div>
                          <span style={{ color: "var(--dgs-text-dim)" }}>Campaign:</span>{" "}
                          <span style={{ fontWeight: 500 }}>{normalizedSelectedLead.utm.campaign}</span>
                        </div>
                      )}
                      {normalizedSelectedLead.utm.term && (
                        <div>
                          <span style={{ color: "var(--dgs-text-dim)" }}>Term:</span>{" "}
                          <span style={{ fontWeight: 500 }}>{normalizedSelectedLead.utm.term}</span>
                        </div>
                      )}
                      {normalizedSelectedLead.utm.content && (
                        <div>
                          <span style={{ color: "var(--dgs-text-dim)" }}>Content:</span>{" "}
                          <span style={{ fontWeight: 500 }}>{normalizedSelectedLead.utm.content}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: "12px", color: "var(--dgs-text-dim)", fontStyle: "italic" }}>
                      No UTM parameters captured
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 6. Technical Details (Collapsed by default) */}
            <div
              style={{
                border: "1px solid var(--dgs-border)",
                borderRadius: "var(--dgs-radius-md)",
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "var(--dgs-bg-surface)",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--dgs-text-primary)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                <span>Technical Details &amp; Raw Payload</span>
                {showTechnicalDetails ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {showTechnicalDetails && (
                <div
                  style={{
                    padding: "16px",
                    backgroundColor: "var(--dgs-bg-surface-secondary)",
                    borderTop: "1px solid var(--dgs-border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px", fontSize: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--dgs-text-muted)" }}>Lead ID:</span>
                      <code style={{ fontSize: "11px" }}>{normalizedSelectedLead.leadId}</code>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--dgs-text-muted)" }}>Form Key:</span>
                      <code style={{ fontSize: "11px" }}>{normalizedSelectedLead.formKey}</code>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--dgs-text-muted)" }}>Form ID:</span>
                      <code style={{ fontSize: "11px" }}>{normalizedSelectedLead.formId ?? "—"}</code>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--dgs-text-muted)" }}>Raw Route:</span>
                      <code style={{ fontSize: "11px" }}>{normalizedSelectedLead.route}</code>
                    </div>
                  </div>

                  {/* Raw JSON Preformatted */}
                  <div style={{ marginTop: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--dgs-text-dim)" }}>
                        RAW SUBMISSION JSON
                      </span>
                      <button
                        type="button"
                        className="dgs-saas-btn secondary sm"
                        onClick={() => handleCopy(JSON.stringify(normalizedSelectedLead.rawPayload, null, 2), "rawJson")}
                        style={{ height: "24px", fontSize: "10px", padding: "0 6px" }}
                      >
                        {copiedKey === "rawJson" ? <Check size={11} style={{ color: "var(--dgs-success)" }} /> : <Copy size={11} />}
                        <span>{copiedKey === "rawJson" ? "Copied" : "Copy JSON"}</span>
                      </button>
                    </div>

                    <pre
                      style={{
                        margin: 0,
                        padding: "12px",
                        backgroundColor: "#0d1117",
                        color: "#c9d1d9",
                        borderRadius: "var(--dgs-radius-sm)",
                        fontSize: "11px",
                        fontFamily: "var(--dgs-font-mono)",
                        overflowX: "auto",
                        maxHeight: "260px",
                        lineHeight: 1.4,
                      }}
                    >
                      {JSON.stringify(normalizedSelectedLead.rawPayload, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </AdminDetailDrawer>
    </div>
  );
}
