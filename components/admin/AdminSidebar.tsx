"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";
import type { CmsUser } from "@/lib/cms/auth-db";
import {
  LayoutDashboard,
  Search,
  BarChart3,
  ShieldCheck,
  BellRing,
  FileText,
  Image as ImageIcon,
  Briefcase,
  Globe,
  FileCheck2,
  Inbox,
  UserCheck,
  FileUser,
  GraduationCap,
  Kanban,
  Users,
  History,
  Cpu,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  badge?: string;
  badgeVariant?: "primary" | "success" | "warning" | "info";
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    title: "HOME",
    items: [
      { title: "Dashboard", href: "/admin/", icon: LayoutDashboard },
    ],
  },
  {
    title: "INSIGHTS",
    items: [
      { title: "Search Console", href: "/admin/search-console/", icon: Search, badge: "GSC", badgeVariant: "primary" },
      { title: "Analytics", href: "/admin/analytics/", icon: BarChart3, badge: "GA4", badgeVariant: "info" },
      { title: "Website Audits", href: "/admin/site-audits/", icon: ShieldCheck, badge: "15d", badgeVariant: "success" },
      { title: "Google Updates", href: "/admin/google-updates/", icon: BellRing },
    ],
  },
  {
    title: "CONTENT",
    items: [
      { title: "Blogs", href: "/admin/blogs/", icon: FileText },
      { title: "Media Library", href: "/admin/media/", icon: ImageIcon },
      { title: "Portfolio", href: "/admin/portfolio/", icon: Briefcase },
    ],
  },
  {
    title: "GROWTH",
    items: [
      { title: "SEO", href: "/admin/seo/", icon: Globe },
      { title: "Forms", href: "/admin/forms/", icon: FileCheck2 },
      { title: "Leads", href: "/admin/leads/", icon: Inbox },
    ],
  },
  {
    title: "PEOPLE",
    items: [
      { title: "Careers", href: "/admin/careers/", icon: UserCheck },
      { title: "Applications", href: "/admin/applications/", icon: FileUser },
      { title: "Assessments", href: "/admin/assessment/", icon: GraduationCap, badge: "OS", badgeVariant: "warning" },
      { title: "HR Pipeline", href: "/admin/hr-pipeline/", icon: Kanban },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { title: "Users & Access", href: "/admin/users/", icon: Users },
      { title: "Activity Log", href: "/admin/activity-log/", icon: History, badge: "Audit", badgeVariant: "primary" },
      { title: "Integrations", href: "/admin/integrations/", icon: Cpu },
      { title: "Settings", href: "/admin/settings/", icon: Settings },
    ],
  },
];

type Props = {
  collapsed: boolean;
  onToggleCollapse?: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  currentUser?: CmsUser | null;
};

export default function AdminSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  currentUser,
}: Props) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="dgs-saas-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(8px)",
            zIndex: 90,
          }}
        />
      )}

      <aside
        className={`dgs-saas-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}
        aria-label="Admin Navigation"
      >
        {/* Brand Header — Min 72px Height, Fully Visible Logo Without Clipping */}
        <div className="dgs-saas-sidebar-brand">
          <Link href="/admin/" className="dgs-saas-brand-link" onClick={onCloseMobile}>
            {collapsed ? (
              <div className="dgs-saas-logo-collapsed">
                <Image
                  src="/images/brand/dgs-mark-compact.png"
                  alt="DGS Compact Mark"
                  width={34}
                  height={34}
                  priority
                  className="dgs-saas-mark-img"
                />
              </div>
            ) : (
              <div className="dgs-saas-logo-container">
                <Image
                  src="/images/brand/dgs-logo-trimmed.png"
                  alt="D'Genius Solutions Logo"
                  width={150}
                  height={80}
                  priority
                  className="dgs-saas-logo-img"
                />
                <span className="dgs-brand-badge">OS</span>
              </div>
            )}
          </Link>
          {mobileOpen && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--dgs-text-muted)",
                cursor: "pointer",
                padding: "6px",
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="dgs-saas-nav">
          {NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter((item) => {
              if (item.href === "/admin/activity-log/" && currentUser?.role !== "superadmin") {
                return false;
              }
              if (item.href === "/admin/users/" && currentUser?.role === "manager") {
                return false;
              }
              return true;
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title} className="dgs-saas-nav-group">
                <div className="dgs-saas-nav-group-title">{group.title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  {visibleItems.map((item) => {
                    const isExact = pathname === item.href || (item.href !== "/admin/" && pathname === item.href.replace(/\/$/, ""));
                    const isChild = item.href !== "/admin/" && pathname.startsWith(item.href);
                    const isActive = isExact || isChild;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`dgs-saas-nav-item ${isActive ? "active" : ""}`}
                        onClick={onCloseMobile}
                        title={collapsed ? item.title : undefined}
                      >
                        <Icon size={17} strokeWidth={1.8} className="dgs-saas-nav-icon" />
                        <span className="dgs-saas-nav-label">{item.title}</span>
                        {!collapsed && item.badge && (
                          <span
                            className={`dgs-saas-chip ${item.badgeVariant || "primary"}`}
                            style={{ padding: "1px 6px", fontSize: "10px", height: "18px" }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="dgs-saas-sidebar-footer">
          <div className="dgs-saas-user-mini">
            <div className="dgs-saas-avatar-mini">
              {currentUser?.display_name?.charAt(0).toUpperCase() || "A"}
            </div>
            {!collapsed && (
              <div className="dgs-saas-user-meta">
                <div className="dgs-saas-user-name">
                  {currentUser?.display_name || "Administrator"}
                </div>
                <div className="dgs-saas-user-role">
                  {currentUser?.role || "SUPERADMIN"}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
