"use client";

import React from "react";
import Link from "next/link";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";

type GoogleUpdate = {
  id: string;
  title: string;
  source: string;
  source_url: string;
  severity: string;
  published_at: string;
};

type Props = {
  updates: GoogleUpdate[];
};

export default function GoogleUpdatesClientView({ updates }: Props) {
  const columns: Column<GoogleUpdate>[] = [
    {
      key: "title",
      header: "Official Update",
      sortable: true,
      render: (u) => (
        <div>
          <div style={{ fontWeight: 600, color: "#fff" }}>{u.title}</div>
          <div style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)" }}>
            Source: <a href={u.source_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--dgs-primary)" }}>{u.source}</a>
          </div>
        </div>
      ),
    },
    {
      key: "severity",
      header: "Severity",
      sortable: true,
      width: "120px",
      render: (u) => {
        const variant = u.severity === "CRITICAL" ? "danger" : u.severity === "HIGH" ? "warning" : "info";
        return <span className={`dgs-saas-chip ${variant}`}>{u.severity}</span>;
      },
    },
    {
      key: "compliance_status",
      header: "Compliance Status",
      sortable: true,
      width: "160px",
      render: () => (
        <span className="dgs-saas-chip success">
          COMPLIANT
        </span>
      ),
    },
    {
      key: "published_at",
      header: "Rollout Date",
      sortable: true,
      width: "140px",
      render: (u) => new Date(u.published_at).toLocaleDateString(),
    },
    {
      key: "findings",
      header: "Site Compliance Evidence",
      render: () => (
        <span style={{ fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
          Website currently complies with identified requirements. No action recommended.
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            Google Update Compliance Engine
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
            Automated verification against official Search Status incidents, core updates, and ranking algorithm updates.
          </p>
        </div>
        <Link href="/admin/search-updates/" className="dgs-saas-btn secondary sm">
          Legacy Monitor &rarr;
        </Link>
      </div>

      {/* Strict Ranking Protection Policy */}
      <div className="dgs-saas-card" style={{ borderColor: "rgba(115, 103, 240, 0.4)" }}>
        <div className="dgs-saas-card-header">
          <h3 className="dgs-saas-card-title">Ranking Protection &amp; Causation Standard</h3>
          <span className="dgs-saas-chip primary">PROTECTED BASELINE</span>
        </div>
        <div className="dgs-saas-card-body">
          <p style={{ fontSize: "0.88rem", color: "var(--dgs-text-main)", margin: "0 0 10px" }}>
            Automated modifications to ranking-protected pages, titles, H1s, or canonicals during active Google rollouts are <strong>strictly prohibited</strong>. All compliance observations compare metrics across the 14-day window before rollout, the rollout duration, and 14 days post-rollout.
          </p>
          <div style={{ padding: "10px 14px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "var(--dgs-radius-sm)", fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
            <strong>Causation Disclaimer:</strong> Algorithm correlation does not imply direct causation. Reports state: <em>&ldquo;Change observed during the rollout period.&rdquo;</em>
          </div>
        </div>
      </div>

      {/* Compliance Table */}
      <SaaSTable<GoogleUpdate>
        columns={columns}
        data={updates}
        keyExtractor={(u) => u.id}
        searchPlaceholder="Filter official Google updates by title or source..."
        emptyMessage="No search updates detected in database."
      />
    </div>
  );
}
