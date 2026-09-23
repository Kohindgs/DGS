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
  ChevronLeft,
  ChevronRight,
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
      { title: "Overview", href: "/admin/", icon: LayoutDashboard },
    ],
  },
  {
    title: "INSIGHTS",
    items: [
      { title: "Search Console", href: "/admin/search-console/", icon: Search, badge: "GSC", badgeVariant: "primary" },
      { title: "Analytics", href: "/admin/analytics/", icon: BarChart3, badge: "GA4", badgeVariant: "info" },
      { title: "Site Health", href: "/admin/site-audits/", icon: ShieldCheck, badge: "15d", badgeVariant: "success" },
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
      { title: "SEO Manager", href: "/admin/seo/", icon: Globe },
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
    title: "ADMIN",
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
        />
      )}

      <aside
        className={`dgs-saas-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}
        aria-label="Admin Navigation"
      >
        {/* Brand Header */}
        <div className="dgs-sidebar-header dgs-saas-sidebar-brand">
          <Link href="/admin/" className="dgs-brand-lockup dgs-saas-brand-link" onClick={onCloseMobile}>
            <div className="dgs-saas-logo-icon">
              <Image
                src={collapsed ? "/images/brand/dgs-mark.webp" : "/images/brand/dgs-logo.webp"}
                alt="DGS Brand Logo"
                width={collapsed ? 28 : 116}
                height={26}
                priority
                style={{ objectFit: "contain", height: "auto" }}
              />
            </div>
            {!collapsed && (
              <span className="dgs-brand-badge">OS</span>
            )}
          </Link>
          {mobileOpen && (
            <button
              type="button"
              className="dgs-saas-sidebar-close"
              onClick={onCloseMobile}
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="dgs-sidebar-scroll dgs-saas-nav">
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
              <div key={group.title} className="dgs-nav-group">
                {!collapsed && <div className="dgs-nav-group-title dgs-saas-nav-header">{group.title}</div>}
                {collapsed && <div className="dgs-saas-nav-divider" title={group.title} />}
                <ul className="dgs-nav-list dgs-saas-nav-list">
                  {visibleItems.map((item) => {
                    const isActive = item.href === "/admin/"
                      ? pathname === "/admin" || pathname === "/admin/"
                      : pathname.startsWith(item.href);

                    const IconComponent = item.icon;

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`dgs-nav-item dgs-saas-nav-link ${isActive ? "active" : ""}`}
                          onClick={onCloseMobile}
                          title={collapsed ? item.title : undefined}
                        >
                          <span className="dgs-nav-icon dgs-saas-nav-icon">
                            <IconComponent size={17} strokeWidth={1.8} />
                          </span>
                          {!collapsed && (
                            <>
                              <span className="dgs-nav-label dgs-saas-nav-label">{item.title}</span>
                              {item.badge && (
                                <span className={`dgs-nav-badge dgs-saas-chip sm ${item.badgeVariant || "neutral"}`}>
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer with Collapse Toggle & Current User */}
        <div className="dgs-saas-sidebar-footer" style={{ padding: "12px 14px", borderTop: "1px solid var(--dgs-border)" }}>
          {onToggleCollapse && (
            <button
              type="button"
              className="dgs-saas-btn secondary sm desktop-only"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              style={{ width: "100%", justifyContent: collapsed ? "center" : "flex-start", marginBottom: "8px" }}
            >
              {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
              {!collapsed && <span>Collapse</span>}
            </button>
          )}

          {!collapsed && currentUser && (
            <div className="dgs-saas-user-mini" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
              <div className="dgs-saas-avatar-mini" style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--dgs-bg-surface-secondary)", border: "1px solid var(--dgs-border)", color: "var(--dgs-text-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 650, fontSize: "0.75rem" }}>
                {currentUser.display_name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="dgs-saas-user-info" style={{ display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
                <span className="dgs-saas-user-name" style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--dgs-text-primary)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                  {currentUser.display_name || currentUser.email}
                </span>
                <span className="dgs-saas-user-role" style={{ fontSize: "0.68rem", textTransform: "uppercase", color: "var(--dgs-text-muted)", fontWeight: 550 }}>
                  {currentUser.role}
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
