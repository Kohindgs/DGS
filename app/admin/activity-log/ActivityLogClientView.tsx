"use client";

import React, { useState } from "react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import type { CmsAuditEntry } from "@/lib/cms/auth-db";

type AuditRow = CmsAuditEntry & {
  id: string;
  created_at: string;
};

type Props = {
  initialLogs: AuditRow[];
};

export default function ActivityLogClientView({ initialLogs }: Props) {
  const [logs] = useState<AuditRow[]>(initialLogs);
  const [inspectEntry, setInspectEntry] = useState<AuditRow | null>(null);

  const columns: Column<AuditRow>[] = [
    {
      key: "created_at",
      header: "Timestamp",
      sortable: true,
      render: (log) => (
        <span style={{ fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
          {new Date(log.created_at).toLocaleString()}
        </span>
      ),
    },
    {
      key: "actor_email",
      header: "Actor",
      sortable: true,
      render: (log) => (
        <div>
          <div style={{ fontWeight: 600, color: "var(--dgs-text-primary)" }}>{log.actor_email}</div>
          <span className="dgs-saas-chip primary" style={{ fontSize: "0.65rem", padding: "1px 6px" }}>
            {log.role.toUpperCase()}
          </span>
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      sortable: true,
      render: (log) => (
        <span className="dgs-saas-chip info">
          {log.action}
        </span>
      ),
    },
    {
      key: "resource",
      header: "Resource",
      sortable: true,
      render: (log) => (
        <span style={{ fontSize: "0.85rem", color: "var(--dgs-text-main)" }}>
          {log.resource} {log.resource_id ? `(#${log.resource_id.slice(0, 8)})` : ""}
        </span>
      ),
    },
    {
      key: "summary",
      header: "Summary",
      render: (log) => (
        <span style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
          {log.summary}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (log) => (
        <span className={`dgs-saas-chip ${log.status === "failure" ? "danger" : "success"}`}>
          {(log.status || "success").toUpperCase()}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--dgs-text-primary)", margin: 0 }}>Immutable Audit Log</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
            Superadmin-only append-only activity trail. Cryptographically filtered against sensitive secrets.
          </p>
        </div>
        <span className="dgs-saas-chip primary">
          SUPERADMIN ONLY
        </span>
      </div>

      <SaaSTable
        columns={columns}
        data={logs}
        keyExtractor={(log) => log.id}
        searchPlaceholder="Filter audit events by actor, action, resource, or summary..."
        actions={(log) => (
          <button
            type="button"
            className="dgs-saas-btn secondary sm"
            onClick={() => setInspectEntry(log)}
          >
            Inspect
          </button>
        )}
      />

      {/* Inspect Event Modal */}
      {inspectEntry && (
        <div className="dgs-saas-search-overlay" onClick={() => setInspectEntry(null)}>
          <div className="dgs-saas-search-modal" onClick={(e) => e.stopPropagation()} style={{ width: "640px" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--dgs-border)" }}>
              <h3 style={{ margin: 0, color: "var(--dgs-text-primary)" }}>Audit Event Inspection</h3>
            </div>
            <div style={{ padding: "24px", overflowY: "auto", display: "grid", gap: "16px" }}>
              <div>
                <strong style={{ color: "var(--dgs-text-dim)", fontSize: "0.75rem", textTransform: "uppercase" }}>Event Details</strong>
                <div style={{ color: "var(--dgs-text-primary)", marginTop: "4px", fontSize: "0.95rem" }}>{inspectEntry.summary}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "0.85rem" }}>
                <div><strong>Timestamp:</strong> {new Date(inspectEntry.created_at).toLocaleString()}</div>
                <div><strong>Actor:</strong> {inspectEntry.actor_email} ({inspectEntry.role})</div>
                <div><strong>Action:</strong> {inspectEntry.action}</div>
                <div><strong>Resource:</strong> {inspectEntry.resource}</div>
                <div><strong>IP Address:</strong> {inspectEntry.ip_address || "N/A"}</div>
                <div><strong>Status:</strong> {inspectEntry.status || "success"}</div>
              </div>

              {inspectEntry.before_state && (
                <div>
                  <strong style={{ color: "var(--dgs-text-dim)", fontSize: "0.75rem", textTransform: "uppercase" }}>Before State</strong>
                  <pre style={{ background: "var(--dgs-bg-input)", padding: "12px", borderRadius: "6px", fontSize: "0.8rem", overflowX: "auto", color: "var(--dgs-text-muted)" }}>
                    {typeof inspectEntry.before_state === "string" ? inspectEntry.before_state : JSON.stringify(inspectEntry.before_state, null, 2)}
                  </pre>
                </div>
              )}

              {inspectEntry.after_state && (
                <div>
                  <strong style={{ color: "var(--dgs-text-dim)", fontSize: "0.75rem", textTransform: "uppercase" }}>After State</strong>
                  <pre style={{ background: "var(--dgs-bg-input)", padding: "12px", borderRadius: "6px", fontSize: "0.8rem", overflowX: "auto", color: "var(--dgs-success)" }}>
                    {typeof inspectEntry.after_state === "string" ? inspectEntry.after_state : JSON.stringify(inspectEntry.after_state, null, 2)}
                  </pre>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="dgs-saas-btn secondary"
                  onClick={() => setInspectEntry(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
