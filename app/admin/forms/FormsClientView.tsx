"use client";

import React from "react";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import type { FormDefinition } from "@/lib/forms/types";
import { ArrowRight } from "lucide-react";

type Props = {
  forms: FormDefinition[];
};

export default function FormsClientView({ forms }: Props) {
  const columns: Column<FormDefinition>[] = [
    {
      key: "title",
      header: "Form Title & Key",
      sortable: true,
      render: (f: FormDefinition) => (
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
      width: "90px",
      render: (f: FormDefinition) => (
        <span style={{ fontFamily: "var(--dgs-font-mono)", fontSize: "12px", color: "var(--dgs-text-dim)" }}>
          #{f.fluentFormId}
        </span>
      ),
    },
    {
      key: "fields",
      header: "Visible Fields",
      width: "120px",
      render: (f: FormDefinition) => (
        <span style={{ fontSize: "12px", color: "var(--dgs-text-secondary)" }}>
          {f.fields.filter((field) => !field.hidden).length} fields
        </span>
      ),
    },
    {
      key: "sourceRoutes",
      header: "Associated Routes",
      render: (f: FormDefinition) => {
        const routes: string[] = f.sourceRoutes || [];
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {routes.slice(0, 3).map((r: string) => (
              <code key={r} style={{ fontSize: "11px", background: "var(--dgs-bg-surface-secondary)", padding: "1px 5px", borderRadius: "4px" }}>
                {r}
              </code>
            ))}
            {routes.length > 3 && (
              <span style={{ fontSize: "11px", color: "var(--dgs-text-dim)" }}>
                +{routes.length - 3} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "activationEnabled",
      header: "Status",
      width: "120px",
      render: (f: FormDefinition) => (
        <span className={`dgs-saas-chip sm ${f.activationEnabled ? "success" : "neutral"}`}>
          {f.activationEnabled ? "Verified" : "Disabled"}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <PageHeader
        title="Native Forms Registry"
        subtitle={`Verified form definitions, route mappings and migration state (${forms.length} verified forms).`}
        actions={
          <Link href="/admin/leads/" className="dgs-saas-btn secondary sm">
            <span>View Leads Inbox</span>
            <ArrowRight size={12} />
          </Link>
        }
      />

      <SaaSTable<FormDefinition>
        columns={columns}
        data={forms}
        keyExtractor={(f: FormDefinition) => f.key}
        searchPlaceholder="Search forms by title, key, or route..."
        searchFilter={(f: FormDefinition, q: string) =>
          f.title.toLowerCase().includes(q) ||
          f.key.toLowerCase().includes(q) ||
          (f.sourceRoutes || []).some((r: string) => r.toLowerCase().includes(q))
        }
      />
    </div>
  );
}
