"use client";

import React, { useState, useEffect } from "react";
import {
  BellRing,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Sparkles,
  Info,
  ShieldCheck,
  Check,
} from "lucide-react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import type { OffPageAlert } from "@/lib/off-page/types";

interface AutomationRun {
  id: string;
  run_type: string;
  status: "SUCCESS" | "FAILED" | "RUNNING";
  started_at: string;
  completed_at: string | null;
  items_processed: number;
  details: string | null;
}

interface Props {
  initialAlerts?: OffPageAlert[];
  initialRuns?: AutomationRun[];
}

export default function MonitoringClientView({ initialAlerts, initialRuns }: Props) {
  const [alerts, setAlerts] = useState<OffPageAlert[]>(initialAlerts || []);
  const [runs, setRuns] = useState<AutomationRun[]>(initialRuns || []);
  const [loading, setLoading] = useState(!initialAlerts);
  const [activeTab, setActiveTab] = useState<"alerts" | "runs">("alerts");
  const [runningManual, setRunningManual] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/off-page/alerts");
      const json = await res.json();
      if (json.ok) {
        setAlerts(json.alerts);
        setRuns(json.automationRuns);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/admin/off-page/alerts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
      setFeedback("All alerts marked as read.");
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleTriggerManual = async () => {
    setRunningManual(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/off-page/backlinks/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (json.ok) {
        setFeedback("Live monitor audit complete. All alert streams updated.");
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRunningManual(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const alertColumns: Column<OffPageAlert>[] = [
    {
      key: "title",
      header: "Alert Title & Event",
      sortable: true,
      render: (a) => (
        <div>
          <div style={{ fontWeight: 650, color: "#fff" }}>{a.title}</div>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginTop: "2px" }}>
            {a.message}
          </div>
          {a.entity_id && (
            <div style={{ fontSize: "0.7rem", color: "var(--dgs-brand-cyan)", marginTop: "3px" }}>
              {a.entity_type || "Entity"}: {a.entity_id}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "severity",
      header: "Severity",
      sortable: true,
      render: (a) => {
        const sevConfig: Record<string, { bg: string; color: string; icon: any }> = {
          CRITICAL: { bg: "rgba(239, 68, 68, 0.2)", color: "#ef4444", icon: AlertTriangle },
          WARNING: { bg: "rgba(245, 158, 11, 0.2)", color: "#f59e0b", icon: AlertTriangle },
          INFO: { bg: "rgba(59, 130, 246, 0.2)", color: "#60a5fa", icon: Info },
        };
        const cfg = sevConfig[a.severity] || sevConfig.INFO;
        const Icon = cfg.icon;
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "3px 8px",
              borderRadius: "6px",
              fontSize: "0.72rem",
              fontWeight: 800,
              background: cfg.bg,
              color: cfg.color,
            }}
          >
            <Icon size={12} />
            {a.severity}
          </span>
        );
      },
    },
    {
      key: "is_read",
      header: "Status",
      render: (a) => (
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            padding: "2px 6px",
            borderRadius: "4px",
            background: a.is_read ? "rgba(255,255,255,0.06)" : "rgba(16,185,129,0.15)",
            color: a.is_read ? "rgba(255,255,255,0.4)" : "#34d399",
          }}
        >
          {a.is_read ? "Read" : "Unread"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Timestamp",
      render: (a) => (
        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>
          {a.created_at ? new Date(a.created_at).toLocaleString() : "Just now"}
        </span>
      ),
    },
  ];

  const runColumns: Column<AutomationRun>[] = [
    {
      key: "run_type",
      header: "Automation Process",
      sortable: true,
      render: (r) => (
        <span style={{ fontWeight: 650, color: "#fff", fontSize: "0.82rem" }}>
          {r.run_type.replace(/_/g, " ").toUpperCase()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Execution Status",
      render: (r) => {
        const isSuccess = r.status === "SUCCESS";
        return (
          <span
            style={{
              padding: "2px 7px",
              borderRadius: "4px",
              fontSize: "0.7rem",
              fontWeight: 800,
              background: isSuccess ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
              color: isSuccess ? "#34d399" : "#ef4444",
            }}
          >
            {r.status}
          </span>
        );
      },
    },
    {
      key: "items_processed",
      header: "Items Processed",
      render: (r) => <span style={{ fontSize: "0.82rem", color: "#fff" }}>{r.items_processed} items</span>,
    },
    {
      key: "started_at",
      header: "Run Time",
      render: (r) => (
        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>
          {new Date(r.started_at).toLocaleString()}
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
            Real-Time Off-Page Monitoring & Automation Health
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
            Telemetry logs for daily free opportunity sweeps, live backlink health checks, and scheduled authority reports.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={handleMarkAllRead}
            className="dgs-saas-btn secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Check size={14} /> Mark Read
          </button>
          <button
            onClick={handleTriggerManual}
            disabled={runningManual}
            className="dgs-saas-btn primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <RefreshCw size={14} className={runningManual ? "animate-spin" : ""} />
            {runningManual ? "Auditing..." : "Trigger Live Check"}
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

      {/* Sub Tabs */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => setActiveTab("alerts")}
          className={`dgs-saas-btn ${activeTab === "alerts" ? "primary" : "secondary"}`}
          style={{ fontSize: "0.8rem", padding: "6px 14px" }}
        >
          Security & Link Alerts ({alerts.filter((a) => !a.is_read).length} Unread)
        </button>
        <button
          onClick={() => setActiveTab("runs")}
          className={`dgs-saas-btn ${activeTab === "runs" ? "primary" : "secondary"}`}
          style={{ fontSize: "0.8rem", padding: "6px 14px" }}
        >
          Automation Audit History ({runs.length})
        </button>
      </div>

      {/* Main SaaS Table */}
      <div className="dgs-saas-card" style={{ padding: "16px" }}>
        {activeTab === "alerts" ? (
          <SaaSTable<OffPageAlert>
            columns={alertColumns}
            data={alerts}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search alert text or source..."
            searchFilter={(item, q) =>
              item.title.toLowerCase().includes(q) || item.message.toLowerCase().includes(q)
            }
            initialPageSize={12}
            emptyMessage="Zero alerts! System healthy and all monitored backlinks verified."
          />
        ) : (
          <SaaSTable<AutomationRun>
            columns={runColumns}
            data={runs}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search automation runs..."
            searchFilter={(item, q) => item.run_type.toLowerCase().includes(q)}
            initialPageSize={12}
            emptyMessage="No automation runs logged yet."
          />
        )}
      </div>
    </div>
  );
}
