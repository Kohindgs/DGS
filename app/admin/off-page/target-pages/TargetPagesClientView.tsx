"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Target,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  Award,
  Link2,
  Users,
  Compass,
} from "lucide-react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import type { OffPageTargetPage } from "@/lib/off-page/types";

interface Props {
  initialPages?: OffPageTargetPage[];
}

export default function TargetPagesClientView({ initialPages }: Props) {
  const [pages, setPages] = useState<OffPageTargetPage[]>(initialPages || []);
  const [loading, setLoading] = useState(!initialPages);

  const fetchTargetPages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/off-page/target-pages");
      const json = await res.json();
      if (json.ok) {
        setPages(json.pages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargetPages();
  }, []);

  const columns: Column<OffPageTargetPage>[] = [
    {
      key: "page_title",
      header: "Strategic Service Page",
      sortable: true,
      render: (p) => (
        <div>
          <div style={{ fontWeight: 650, color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
            {p.page_title}
            <a
              href={`https://www.dgeniussolutions.com${p.page_url}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Public Page"
              style={{ color: "var(--dgs-brand-cyan)", display: "inline-flex" }}
            >
              <ExternalLink size={13} />
            </a>
          </div>
          <div style={{ fontSize: "0.74rem", color: "var(--dgs-brand-cyan)" }}>{p.page_url}</div>
        </div>
      ),
    },
    {
      key: "priority_tier",
      header: "Priority Tier",
      sortable: true,
      render: (p) => {
        const isP0 = p.priority_tier === "P0";
        return (
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "0.72rem",
              fontWeight: 800,
              background: isP0 ? "rgba(236,72,153,0.2)" : "rgba(59,130,246,0.2)",
              color: isP0 ? "#f472b6" : "#60a5fa",
            }}
          >
            {p.priority_tier}
          </span>
        );
      },
    },
    {
      key: "live_backlinks",
      header: "Backlink Progress",
      sortable: true,
      render: (p) => {
        const live = p.live_backlinks || 0;
        const goal = p.target_backlinks_goal || 50;
        const pct = Math.min(100, Math.round((live / goal) * 100));
        return (
          <div style={{ width: "140px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#fff", marginBottom: "4px" }}>
              <span>{live} / {goal} links</span>
              <span style={{ color: pct >= 80 ? "#10b981" : "#00c6ff" }}>{pct}%</span>
            </div>
            <div style={{ width: "100%", height: "5px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: pct >= 80 ? "#10b981" : "var(--dgs-brand-cyan)",
                  borderRadius: "3px",
                }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "referring_domains",
      header: "Ref Domains",
      sortable: true,
      render: (p) => (
        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
          {p.referring_domains || 0}
        </span>
      ),
    },
    {
      key: "opportunity_count",
      header: "Available Opps",
      sortable: true,
      render: (p) => (
        <span style={{ fontSize: "0.8rem", color: "var(--dgs-brand-cyan)", fontWeight: 650 }}>
          {p.opportunity_count || 0} Queued
        </span>
      ),
    },
    {
      key: "referral_traffic",
      header: "30D Referral Impact",
      render: (p) => (
        <div>
          <div style={{ fontSize: "0.78rem", color: "#fff", fontWeight: 600 }}>
            {p.referral_sessions_30d || 0} Sessions
          </div>
          <div style={{ fontSize: "0.7rem", color: "#10b981", fontWeight: 600 }}>
            {p.referral_leads_30d || 0} Leads Won
          </div>
        </div>
      ),
    },
    {
      key: "primary_focus",
      header: "Target Anchor Focus",
      render: (p) => (
        <span style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.7)" }}>
          {p.primary_focus || "D'Genius Solutions"}
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
            Target Pages & Strategic Authority Distribution
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
            Monitors backlink progress, authority gap closing, and referral lead generation across core commercial pages.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link
            href="/admin/off-page/opportunities"
            className="dgs-saas-btn primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Compass size={14} /> View Opportunities Queue
          </Link>
        </div>
      </div>

      {/* Main SaaS Table */}
      <div className="dgs-saas-card" style={{ padding: "16px" }}>
        <SaaSTable<OffPageTargetPage>
          columns={columns}
          data={pages}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search page title or URL..."
          searchFilter={(item, q) =>
            item.page_title.toLowerCase().includes(q) || item.page_url.toLowerCase().includes(q)
          }
          initialPageSize={10}
          emptyMessage="No target pages configured."
        />
      </div>
    </div>
  );
}
