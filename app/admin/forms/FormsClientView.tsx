"use client";

import React, { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import type { FormHealthMetric, FormHealthProbeResult } from "@/lib/forms/health-probe";
import { ArrowRight, Send, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from "lucide-react";

type Props = {
  healthReport: FormHealthProbeResult;
};

export default function FormsClientView({ healthReport }: Props) {
  const [testingId, setTestingId] = useState<number | null>(null);
  const [testResults, setTestResults] = useState<
    Record<number, { ok: boolean; message: string; leadId?: string | number }>
  >({});

  const handleTestSubmit = async (metric: FormHealthMetric) => {
    setTestingId(metric.fluentFormId);
    try {
      const res = await fetch("/api/admin/forms/test-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fluentFormId: metric.fluentFormId }),
      });
      const data = await res.json();
      setTestResults((prev) => ({
        ...prev,
        [metric.fluentFormId]: {
          ok: data.ok,
          message: data.ok
            ? `Verified! Lead #${data.leadId || "saved"}`
            : data.message || "Failed",
          leadId: data.leadId,
        },
      }));
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [metric.fluentFormId]: { ok: false, message: "Network error" },
      }));
    } finally {
      setTestingId(null);
    }
  };

  const columns: Column<FormHealthMetric>[] = [
    {
      key: "title",
      header: "Form Title & Key",
      sortable: true,
      render: (f: FormHealthMetric) => (
        <div>
          <div style={{ fontWeight: 600, color: "var(--dgs-text-primary)", fontSize: "13px" }}>
            {f.title}
          </div>
          <code style={{ fontSize: "11px", color: "var(--dgs-text-muted)" }}>
            {f.key}
          </code>
        </div>
      ),
    },
    {
      key: "fluentFormId",
      header: "Form ID",
      sortable: true,
      width: "80px",
      render: (f: FormHealthMetric) => (
        <span style={{ fontFamily: "var(--dgs-font-mono)", fontSize: "12px", color: "var(--dgs-text-dim)" }}>
          #{f.fluentFormId}
        </span>
      ),
    },
    {
      key: "status",
      header: "Health Status",
      sortable: true,
      width: "120px",
      render: (f: FormHealthMetric) => {
        let chipClass = "success";
        let icon = <CheckCircle2 size={12} style={{ marginRight: 4 }} />;
        if (f.status === "DEGRADED") {
          chipClass = "warning";
          icon = <AlertTriangle size={12} style={{ marginRight: 4 }} />;
        } else if (f.status === "FAILED") {
          chipClass = "danger";
          icon = <XCircle size={12} style={{ marginRight: 4 }} />;
        }

        return (
          <span
            className={`dgs-saas-chip sm ${chipClass}`}
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            {icon}
            {f.status}
          </span>
        );
      },
    },
    {
      key: "submissions",
      header: "24h / 7d / Total",
      width: "130px",
      render: (f: FormHealthMetric) => (
        <span style={{ fontSize: "12px", fontFamily: "var(--dgs-font-mono)" }}>
          <b style={{ color: f.submissions24h > 0 ? "var(--dgs-accent)" : "inherit" }}>
            {f.submissions24h}
          </b>{" "}
          / {f.submissions7d} / {f.totalSubmissions}
        </span>
      ),
    },
    {
      key: "sourceRoutes",
      header: "Associated Routes",
      render: (f: FormHealthMetric) => {
        const routes: string[] = f.sourceRoutes || [];
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {routes.slice(0, 2).map((r: string) => (
              <code
                key={r}
                style={{
                  fontSize: "11px",
                  background: "var(--dgs-bg-surface-secondary)",
                  padding: "1px 5px",
                  borderRadius: "4px",
                }}
              >
                {r}
              </code>
            ))}
            {routes.length > 2 && (
              <span style={{ fontSize: "11px", color: "var(--dgs-text-dim)" }}>
                +{routes.length - 2} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "notificationDestination",
      header: "Routing",
      width: "140px",
      render: (f: FormHealthMetric) => (
        <div style={{ fontSize: "11px", color: "var(--dgs-text-secondary)" }}>
          <div>{f.notificationDestination}</div>
          <code style={{ fontSize: "10px", color: "var(--dgs-text-muted)" }}>
            {f.analyticsEvent}
          </code>
        </div>
      ),
    },
    {
      key: "actions",
      header: "QA Probe",
      width: "170px",
      render: (f: FormHealthMetric) => {
        const isTesting = testingId === f.fluentFormId;
        const testResult = testResults[f.fluentFormId];

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <button
              type="button"
              className="dgs-saas-btn secondary sm"
              style={{
                fontSize: "11px",
                padding: "3px 8px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
              disabled={isTesting}
              onClick={() => handleTestSubmit(f)}
            >
              {isTesting ? (
                <>
                  <RefreshCw size={11} className="dgs-spin" />
                  <span>Testing…</span>
                </>
              ) : (
                <>
                  <Send size={11} />
                  <span>Send Test</span>
                </>
              )}
            </button>
            {testResult && (
              <span
                style={{
                  fontSize: "10px",
                  color: testResult.ok ? "#10b981" : "#ef4444",
                  fontWeight: 500,
                }}
              >
                {testResult.message}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <PageHeader
        title="Native Forms & Lead Delivery QA Dashboard"
        subtitle={`System-wide health audit and synthetic delivery verification across ${healthReport.totalForms} approved forms.`}
        actions={
          <div style={{ display: "flex", gap: "10px" }}>
            <Link href="/admin/leads/" className="dgs-saas-btn secondary sm">
              <span>View Leads Inbox</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        <div className="dgs-saas-card" style={{ padding: "14px" }}>
          <div style={{ fontSize: "11px", color: "var(--dgs-text-muted)" }}>TOTAL FORMS</div>
          <div style={{ fontSize: "22px", fontWeight: 700, marginTop: "4px" }}>
            {healthReport.totalForms}
          </div>
          <div style={{ fontSize: "11px", color: "#10b981", marginTop: "2px" }}>
            {healthReport.healthyCount} Healthy
          </div>
        </div>

        <div className="dgs-saas-card" style={{ padding: "14px" }}>
          <div style={{ fontSize: "11px", color: "var(--dgs-text-muted)" }}>DATABASE SYNC</div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              marginTop: "8px",
              color: healthReport.dbConfigured ? "#10b981" : "#ef4444",
            }}
          >
            {healthReport.dbConfigured ? "Connected (MySQL)" : "Disconnected"}
          </div>
          <div style={{ fontSize: "11px", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
            leads & form_submissions
          </div>
        </div>

        <div className="dgs-saas-card" style={{ padding: "14px" }}>
          <div style={{ fontSize: "11px", color: "var(--dgs-text-muted)" }}>SMTP NOTIFICATIONS</div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              marginTop: "8px",
              color: healthReport.smtpConfigured ? "#10b981" : "#f59e0b",
            }}
          >
            {healthReport.smtpConfigured ? "Configured" : "Fallback / Log Only"}
          </div>
          <div style={{ fontSize: "11px", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
            business@ & hr@
          </div>
        </div>

        <div className="dgs-saas-card" style={{ padding: "14px" }}>
          <div style={{ fontSize: "11px", color: "var(--dgs-text-muted)" }}>OVERALL STATE</div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              marginTop: "6px",
              color:
                healthReport.overallStatus === "HEALTHY"
                  ? "#10b981"
                  : healthReport.overallStatus === "DEGRADED"
                    ? "#f59e0b"
                    : "#ef4444",
            }}
          >
            {healthReport.overallStatus}
          </div>
          <div style={{ fontSize: "11px", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
            {new Date(healthReport.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>

      <SaaSTable<FormHealthMetric>
        columns={columns}
        data={healthReport.forms}
        keyExtractor={(f: FormHealthMetric) => f.key}
        searchPlaceholder="Search forms by title, key, or route..."
        searchFilter={(f: FormHealthMetric, q: string) =>
          f.title.toLowerCase().includes(q) ||
          f.key.toLowerCase().includes(q) ||
          (f.sourceRoutes || []).some((r: string) => r.toLowerCase().includes(q))
        }
      />
    </div>
  );
}
