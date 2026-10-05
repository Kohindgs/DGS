"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Share2,
  Compass,
  Link2,
  Award,
  GitCompare,
  Megaphone,
  Newspaper,
  MapPin,
  Handshake,
  Mail,
  RefreshCw,
  Target,
  BellRing,
  FileText,
  Settings,
  ShieldAlert,
} from "lucide-react";

const OFF_PAGE_TABS = [
  { href: "/admin/off-page", label: "Dashboard", icon: Share2 },
  { href: "/admin/off-page/action-center", label: "Action Center", icon: Target, badge: "Daily" },
  { href: "/admin/off-page/mismatches", label: "Mismatches", icon: ShieldAlert, badge: "Audit" },
  { href: "/admin/off-page/opportunities", label: "Opportunities", icon: Compass, badge: "Free" },
  { href: "/admin/off-page/backlinks", label: "Backlinks", icon: Link2 },
  { href: "/admin/off-page/authority", label: "Authority Engine", icon: Award },
  { href: "/admin/off-page/competitors", label: "Competitor Gap", icon: GitCompare },
  { href: "/admin/off-page/mentions", label: "Brand Mentions", icon: Megaphone },
  { href: "/admin/off-page/digital-pr", label: "Digital PR", icon: Newspaper },
  { href: "/admin/off-page/citations", label: "Citations & NAP", icon: MapPin },
  { href: "/admin/off-page/partnerships", label: "Partnerships", icon: Handshake },
  { href: "/admin/off-page/outreach", label: "Outreach CRM", icon: Mail },
  { href: "/admin/off-page/reclamation", label: "Link Reclamation", icon: RefreshCw },
  { href: "/admin/off-page/target-pages", label: "Target Pages", icon: Target },
  { href: "/admin/off-page/monitoring", label: "Monitoring", icon: BellRing },
  { href: "/admin/off-page/reports", label: "Reports", icon: FileText, badge: "PDF" },
  { href: "/admin/off-page/settings", label: "Settings", icon: Settings },
];

export default function OffPageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isTabActive = (href: string) => {
    if (href === "/admin/off-page") {
      return pathname === "/admin/off-page" || pathname === "/admin/off-page/";
    }
    return pathname.startsWith(href);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Off-Page Subnavigation Header */}
      <div
        className="dgs-saas-card"
        style={{
          padding: "16px 20px",
          background: "rgba(17, 24, 39, 0.7)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "var(--dgs-radius-lg)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
                OFF-PAGE SEO AUTHORITY ENGINE
              </h1>
              <span className="dgs-saas-chip primary" style={{ fontSize: "0.72rem", fontWeight: 700 }}>
                V8.12
              </span>
              <span className="dgs-saas-chip success" style={{ fontSize: "0.72rem", fontWeight: 600 }}>
                100% FREE TIER VETTED
              </span>
            </div>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.84rem", color: "rgba(255, 255, 255, 0.6)" }}>
              Backlink Monitoring • Free Opportunity Discovery • Outreach CRM • AEO / GEO / LLM Authority • Monthly Reports
            </p>
          </div>
        </div>

        {/* Scrollable Sub-tabs Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            overflowX: "auto",
            paddingBottom: "4px",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            paddingTop: "12px",
          }}
        >
          {OFF_PAGE_TABS.map((tab) => {
            const active = isTabActive(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "6px 13px",
                  borderRadius: "var(--dgs-radius-pill)",
                  fontSize: "0.8rem",
                  fontWeight: active ? 650 : 500,
                  color: active ? "#fff" : "rgba(255, 255, 255, 0.65)",
                  background: active ? "var(--dgs-gradient-primary)" : "rgba(255, 255, 255, 0.04)",
                  border: active ? "1px solid rgba(0, 198, 255, 0.4)" : "1px solid rgba(255, 255, 255, 0.06)",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    style={{
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      padding: "1px 5px",
                      borderRadius: "6px",
                      background: active ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 198, 255, 0.2)",
                      color: active ? "#fff" : "var(--dgs-brand-cyan)",
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content View */}
      {children}
    </div>
  );
}
