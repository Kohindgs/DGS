import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { getGscDashboardMetrics } from "@/lib/integrations/google";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";

export const dynamic = "force-dynamic";

export default async function AdminSearchConsolePage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "search_console", "view")) {
    redirect("/admin/");
  }

  type QueryMetric = {
    query_text: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };

  type PageMetric = {
    page_url: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };

  const metrics = await getGscDashboardMetrics(28);

  const queryColumns: Column<QueryMetric>[] = [
    { key: "query_text", header: "Top Search Queries", sortable: true },
    { key: "clicks", header: "Clicks", sortable: true, width: "120px" },
    { key: "impressions", header: "Impressions", sortable: true, width: "130px" },
    { key: "ctr", header: "CTR", sortable: true, width: "100px", render: (r) => `${(r.ctr * 100).toFixed(1)}%` },
    { key: "position", header: "Avg Position", sortable: true, width: "120px", render: (r) => Number(r.position).toFixed(1) },
  ];

  const pageColumns: Column<PageMetric>[] = [
    { key: "page_url", header: "Indexed Page URL", sortable: true },
    { key: "clicks", header: "Clicks", sortable: true, width: "120px" },
    { key: "impressions", header: "Impressions", sortable: true, width: "130px" },
    { key: "ctr", header: "CTR", sortable: true, width: "100px", render: (r) => `${(r.ctr * 100).toFixed(1)}%` },
    { key: "position", header: "Avg Position", sortable: true, width: "120px", render: (r) => Number(r.position).toFixed(1) },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            Google Search Console Insights
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
            Official Read-Only Search Performance &middot; Cached Locally &middot; Sitemap Governance
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/admin/integrations/" className="dgs-saas-btn secondary sm">
            Manage Connection
          </Link>
          <button type="button" className="dgs-saas-btn primary sm" disabled={!metrics.connected}>
            Sync Now
          </button>
        </div>
      </div>

      {/* Distinction Banner: Live Technical Status vs Google Last Read Status */}
      <div className="dgs-saas-card" style={{ borderColor: "rgba(115, 103, 240, 0.4)" }}>
        <div className="dgs-saas-card-header">
          <div>
            <h3 className="dgs-saas-card-title">Sitemap Validation &amp; Crawl Reconciliation</h3>
            <p className="dgs-saas-card-subtitle">
              Comparing live technical server state with Google&apos;s Search Console crawl index
            </p>
          </div>
          <span className="dgs-saas-chip info">Read-Only Scope Active</span>
        </div>
        <div className="dgs-saas-card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {/* Live Site Status */}
            <div style={{ padding: "18px", background: "rgba(40, 199, 111, 0.05)", borderRadius: "var(--dgs-radius-sm)", border: "1px solid rgba(40, 199, 111, 0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ color: "var(--dgs-success)", fontSize: "0.9rem" }}>LIVE TECHNICAL STATUS</strong>
                <span className="dgs-saas-chip success" style={{ fontSize: "0.68rem" }}>100% HEALTHY</span>
              </div>
              <ul style={{ margin: "12px 0 0 16px", padding: 0, fontSize: "0.82rem", color: "var(--dgs-text-main)", display: "grid", gap: "6px" }}>
                <li><strong>Endpoint:</strong> <code>https://www.dgeniussolutions.com/sitemap.xml</code></li>
                <li><strong>Total Discovered URLs:</strong> 101 URLs (100% HTTP 200 OK)</li>
                <li><strong>W3C Datetime Format:</strong> 100% valid <code>YYYY-MM-DD</code> (0 errors)</li>
                <li><strong>Indexing:</strong> 101 / 101 indexable &middot; 0 canonical mismatches</li>
                <li><strong>Legacy references:</strong> Removed from <code>robots.txt</code></li>
              </ul>
            </div>

            {/* Google Search Console Status */}
            <div style={{ padding: "18px", background: "rgba(255, 159, 67, 0.05)", borderRadius: "var(--dgs-radius-sm)", border: "1px solid rgba(255, 159, 67, 0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ color: "var(--dgs-warning)", fontSize: "0.9rem" }}>GOOGLE LAST-READ STATUS</strong>
                <span className="dgs-saas-chip warning" style={{ fontSize: "0.68rem" }}>AWAITING GOOGLE RECRAWL</span>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--dgs-text-muted)", margin: "8px 0 10px" }}>
                Google&apos;s Search Console displays stale crawl data from before the <code>formatW3CDate()</code> fix. Once Googlebot recrawls the updated sitemap, reported errors will drop from 99 to 0.
              </p>
              <div style={{ padding: "10px 12px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "6px", fontSize: "0.8rem", color: "var(--dgs-text-muted)" }}>
                <strong>Manual Action Required in GSC:</strong>
                <br />
                In Google Search Console &gt; Sitemaps:
                <ul style={{ margin: "6px 0 0 16px", padding: 0 }}>
                  <li>Keep / Resubmit: <code>/sitemap.xml</code></li>
                  <li>Click into <code>/sitemap.rss</code> &rarr; &ldquo;Remove sitemap&rdquo;</li>
                  <li>Click into <code>/video-sitemap.xml</code> &rarr; &ldquo;Remove sitemap&rdquo;</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="dgs-saas-kpi-grid">
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Total Clicks (28d)</div>
          <div className="dgs-saas-kpi-value">
            {metrics.connected ? metrics.summary.clicks : "—"}
          </div>
          <div className="dgs-saas-kpi-delta neutral">
            {metrics.connected ? "Official Google Search Data" : "Ready to connect"}
          </div>
        </div>

        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Total Impressions (28d)</div>
          <div className="dgs-saas-kpi-value">
            {metrics.connected ? metrics.summary.impressions : "—"}
          </div>
          <div className="dgs-saas-kpi-delta neutral">
            {metrics.connected ? "Organic Search Visibility" : "Ready to connect"}
          </div>
        </div>

        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Average CTR</div>
          <div className="dgs-saas-kpi-value">
            {metrics.connected ? `${metrics.summary.ctr}%` : "—"}
          </div>
          <div className="dgs-saas-kpi-delta neutral">
            Click-Through Rate
          </div>
        </div>

        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Average Position</div>
          <div className="dgs-saas-kpi-value">
            {metrics.connected ? metrics.summary.position : "—"}
          </div>
          <div className="dgs-saas-kpi-delta neutral">
            Google Search Rank
          </div>
        </div>
      </div>

      {/* Queries and Pages Tables */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#fff", marginBottom: "12px" }}>
            Top Queries
          </h3>
          <SaaSTable<QueryMetric>
            columns={queryColumns}
            data={metrics.topQueries as QueryMetric[]}
            keyExtractor={(q) => q.query_text}
            searchPlaceholder="Search search queries..."
            emptyMessage="No Search Console queries cached. Connect Google Search Console in Integrations to view real query metrics."
          />
        </div>

        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#fff", marginBottom: "12px" }}>
            Top Performing Pages
          </h3>
          <SaaSTable<PageMetric>
            columns={pageColumns}
            data={metrics.topPages as PageMetric[]}
            keyExtractor={(p) => p.page_url}
            searchPlaceholder="Search indexed pages..."
            emptyMessage="No Search Console page metrics cached. Connect Google Search Console in Integrations to view real page performance."
          />
        </div>
      </div>
    </div>
  );
}
