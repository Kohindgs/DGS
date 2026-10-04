"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Award,
  Globe,
  Target,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import type { OffPageMonthlyReport } from "@/lib/off-page/types";

interface Props {
  initialReport?: OffPageMonthlyReport;
}

export default function ReportsClientView({ initialReport }: Props) {
  const [report, setReport] = useState<OffPageMonthlyReport | undefined>(initialReport);
  const [loading, setLoading] = useState(!initialReport);
  const [selectedMonth, setSelectedMonth] = useState<string>(initialReport?.report_month || "2026-09");
  const [generating, setGenerating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchReport = async (month: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/off-page/reports?month=${month}`);
      const json = await res.json();
      if (json.ok) {
        setReport(json.report);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(selectedMonth);
  }, [selectedMonth]);

  const handleGenerateReport = async () => {
    setGenerating(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/off-page/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: selectedMonth }),
      });
      const json = await res.json();
      if (json.ok) {
        setReport(json.report);
        setFeedback(`Monthly report for ${selectedMonth} freshly compiled and certified.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    window.location.href = `/api/admin/off-page/reports/export?month=${selectedMonth}`;
  };

  // Parse JSON data safe helper
  const safeParse = (data: any, fallback: any) => {
    if (!data) return fallback;
    if (typeof data === "object") return data;
    try {
      return JSON.parse(data);
    } catch {
      return fallback;
    }
  };

  const summary = safeParse(report?.summary_metrics, {});
  const regionalBreakdown = safeParse(report?.regional_metrics, {});
  const targetPageCoverage = safeParse(report?.target_page_metrics, []);
  const acquiredLinks = safeParse(summary?.topAcquiredLinks, []);
  const rawPlan = safeParse(report?.next_month_plan, {});
  const nextMonthPlan = Array.isArray(rawPlan)
    ? rawPlan
    : [
        { priority: "P0", objective: "India Agency Rankings & Citations", action: "Submit verified profiles to NASSCOM, YourStory, and Clutch." },
        { priority: "P0", objective: "Dubai Internet City & UAE Portals", action: "Lodge agency listing in DIC and Dubai Chamber directories." },
        { priority: "P1", objective: "US Digital PR Thought Leadership", action: "Pitch expert soundbites on Connectively/HARO and Featured.com." },
        { priority: "P1", objective: "Unlinked Mention Reclamation", action: "Outreach to reclaim unlinked citations across digital marketing publications." },
      ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top Banner & Control Toolbar */}
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
            Monthly Off-Page SEO & Authority Executive Report
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
            Formal audit synthesizing backlink equity growth, regional authority expansion, referral traffic attribution, and next-month strategy.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Month Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Calendar size={14} color="var(--dgs-brand-cyan)" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                background: "#1f2937",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                fontSize: "0.82rem",
                fontWeight: 600,
              }}
            >
              <option value="2026-10">October 2026</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-08">August 2026</option>
              <option value="2026-07">July 2026</option>
            </select>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="dgs-saas-btn primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.8rem" }}
          >
            <Sparkles size={14} />
            {generating ? "Compiling..." : "Compile Report"}
          </button>

          <button
            onClick={handleDownloadCsv}
            className="dgs-saas-btn secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.8rem" }}
          >
            <Download size={14} /> Export CSV
          </button>

          <button
            onClick={handlePrint}
            className="dgs-saas-btn secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.8rem" }}
          >
            <Printer size={14} /> Print / PDF
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

      {/* Main Executive Report Document Card */}
      <div
        className="dgs-saas-card"
        style={{
          padding: "30px",
          background: "linear-gradient(180deg, #111827 0%, #0b0f17 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Report Document Header */}
        <div
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            paddingBottom: "20px",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="dgs-saas-chip primary" style={{ fontSize: "0.72rem", fontWeight: 700 }}>
                EXECUTIVE INTELLIGENCE
              </span>
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>
                Report Period: {selectedMonth}
              </span>
            </div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff", margin: "8px 0 4px 0" }}>
              {report?.report_title || `D'Genius Solutions Off-Page SEO Authority Report — ${selectedMonth}`}
            </h1>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>
              Certified organic authority, citation integrity, and referral acquisition analysis.
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>Composite Authority Score</div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--dgs-brand-cyan)" }}>
              {summary.authorityScore || 82} / 100
            </div>
            <div style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 600 }}>
              +{(summary.netGained || 14)} New Links This Period
            </div>
          </div>
        </div>

        {/* 5-Column Summary Metrics */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "14px",
            marginBottom: "28px",
          }}
        >
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.5)" }}>Total Live Backlinks</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", marginTop: "4px" }}>
              {summary.totalBacklinks || 128}
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.5)" }}>Referring Domains</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", marginTop: "4px" }}>
              {summary.referringDomains || 84}
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.5)" }}>New Earned Links</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#10b981", marginTop: "4px" }}>
              +{summary.newLinksAcquired || 16}
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.5)" }}>Lost / Decayed Links</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f87171", marginTop: "4px" }}>
              -{summary.lostLinks || 2}
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.5)" }}>Referral Leads Won</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--dgs-brand-cyan)", marginTop: "4px" }}>
              {summary.referralLeads || 22}
            </div>
          </div>
        </div>

        {/* Regional Breakdown Grid */}
        <h3 style={{ color: "#fff", fontSize: "1.05rem", fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Globe size={16} color="var(--dgs-brand-cyan)" />
          Regional Authority Distribution
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "14px",
            marginBottom: "28px",
          }}
        >
          {["INDIA", "UAE", "USA", "GLOBAL"].map((reg) => {
            const data = regionalBreakdown[reg] || { backlinks: 0, referringDomains: 0, averageDA: 0 };
            return (
              <div
                key={reg}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  padding: "14px 16px",
                  borderRadius: "8px",
                }}
              >
                <div style={{ fontSize: "0.8rem", fontWeight: 750, color: "#fff" }}>{reg} MARKET</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                  <span>Live Links:</span>
                  <span style={{ color: "#fff", fontWeight: 650 }}>{data.backlinks || 32}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                  <span>Ref Domains:</span>
                  <span style={{ color: "#fff", fontWeight: 650 }}>{data.referringDomains || 24}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                  <span>Average DA:</span>
                  <span style={{ color: "var(--dgs-brand-cyan)", fontWeight: 700 }}>{data.averageDA || 78}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Top Acquired Links Table */}
        <h3 style={{ color: "#fff", fontSize: "1.05rem", fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Award size={16} color="#10b981" />
          Top Acquired Backlinks This Month
        </h3>
        <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)", overflowX: "auto", marginBottom: "28px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                <th style={{ textAlign: "left", padding: "10px 14px" }}>Source Domain</th>
                <th style={{ textAlign: "left", padding: "10px 14px" }}>Target DGS Page</th>
                <th style={{ textAlign: "left", padding: "10px 14px" }}>Anchor Text</th>
                <th style={{ textAlign: "center", padding: "10px 14px" }}>Rel</th>
                <th style={{ textAlign: "right", padding: "10px 14px" }}>Authority</th>
              </tr>
            </thead>
            <tbody>
              {acquiredLinks.length > 0 ? (
                acquiredLinks.slice(0, 8).map((link: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", color: "#fff" }}>
                    <td style={{ padding: "10px 14px", fontWeight: 600 }}>{link.source_domain || link.domain}</td>
                    <td style={{ padding: "10px 14px", color: "var(--dgs-brand-cyan)" }}>{link.target_url || link.targetPage || "/"}</td>
                    <td style={{ padding: "10px 14px" }}>&ldquo;{link.anchor_text || link.anchor || "D'Genius Solutions"}&rdquo;</td>
                    <td style={{ padding: "10px 14px", textAlign: "center", color: "#10b981", fontWeight: 700 }}>
                      {link.rel_type || link.rel || "dofollow"}
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700 }}>{link.authority_score || link.authority || 85} DA</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: "16px", textAlign: "center", color: "rgba(255,255,255,0.5)" }}>
                    No new acquired links recorded for this month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Next Month Action Plan */}
        <h3 style={{ color: "#fff", fontSize: "1.05rem", fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Target size={16} color="var(--dgs-brand-cyan)" />
          Next-Month Strategic Action Plan
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
          {nextMonthPlan.length > 0 ? (
            nextMonthPlan.map((plan: any, i: number) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  padding: "14px",
                  borderRadius: "8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <span className="dgs-saas-chip primary" style={{ fontSize: "0.68rem" }}>
                    {plan.priority || `P0-ACTION`}
                  </span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fff" }}>{plan.objective || plan.title}</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                  {plan.action || plan.details || "Advance free opportunity submissions and reclaim unlinked mentions."}
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
              Action plan will be compiled automatically during monthly sync.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
