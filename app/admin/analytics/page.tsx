import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { getGa4DashboardMetrics } from "@/lib/integrations/google";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "analytics", "view")) {
    redirect("/admin/");
  }

  type PageMetric = {
    page_path: string;
    views: number;
    sessions: number;
    engagement_rate: number;
  };

  const metrics = await getGa4DashboardMetrics(28);

  const pageColumns: Column<PageMetric>[] = [
    { key: "page_path", header: "Landing Page / Path", sortable: true },
    { key: "views", header: "Views", sortable: true, width: "120px" },
    { key: "sessions", header: "Sessions", sortable: true, width: "120px" },
    {
      key: "engagement_rate",
      header: "Engagement Rate",
      sortable: true,
      width: "160px",
      render: (r) => `${(Number(r.engagement_rate) * 100).toFixed(1)}%`,
    },
  ];


  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            Google Analytics 4 Overview
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
            Official GA4 Property Reporting &middot; User Engagement &middot; Traffic Acquisition
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/admin/integrations/" className="dgs-saas-btn secondary sm">
            Manage Property Connection
          </Link>
          <button type="button" className="dgs-saas-btn primary sm" disabled={!metrics.connected}>
            Sync Now
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dgs-saas-kpi-grid">
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Active Users (28d)</div>
          <div className="dgs-saas-kpi-value">
            {metrics.connected ? metrics.summary.activeUsers : "—"}
          </div>
          <div className="dgs-saas-kpi-delta neutral">
            {metrics.connected ? "Unique Visitors" : "Ready to connect"}
          </div>
        </div>

        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Total Sessions</div>
          <div className="dgs-saas-kpi-value">
            {metrics.connected ? metrics.summary.sessions : "—"}
          </div>
          <div className="dgs-saas-kpi-delta neutral">
            {metrics.connected ? "Traffic Sessions" : "Ready to connect"}
          </div>
        </div>

        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Engagement Rate</div>
          <div className="dgs-saas-kpi-value">
            {metrics.connected ? `${metrics.summary.engagementRate}%` : "—"}
          </div>
          <div className="dgs-saas-kpi-delta neutral">
            Engaged sessions percentage
          </div>
        </div>

        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Total Views</div>
          <div className="dgs-saas-kpi-value">
            {metrics.connected ? metrics.summary.views : "—"}
          </div>
          <div className="dgs-saas-kpi-delta neutral">
            Screen &amp; page views
          </div>
        </div>
      </div>

      {/* Pages & Breakdown Table */}
      <div className="dgs-saas-card">
        <div className="dgs-saas-card-header">
          <h3 className="dgs-saas-card-title">Top Visited Landing Pages</h3>
          <span className="dgs-saas-chip info">GA4 Traffic</span>
        </div>
        <SaaSTable<PageMetric>
          columns={pageColumns}
          data={metrics.topPages as PageMetric[]}
          keyExtractor={(p) => p.page_path}
          searchPlaceholder="Search landing pages..."
          emptyMessage="No Google Analytics data cached yet. Link your GA4 Property in Integrations to view traffic insights."
        />

      </div>
    </div>
  );
}
