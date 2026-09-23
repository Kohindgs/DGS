"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import type { CmsUser } from "@/lib/cms/auth-db";

type NavItem = {
  title: string;
  href: string;
  badge?: string;
  badgeVariant?: "primary" | "success" | "warning" | "info";
  permissionResource?: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    title: "DASHBOARD",
    items: [
      { title: "Overview", href: "/admin/" },
    ],
  },
  {
    title: "INSIGHTS",
    items: [
      { title: "Search Console", href: "/admin/search-console/", badge: "GSC", badgeVariant: "primary" },
      { title: "Analytics", href: "/admin/analytics/", badge: "GA4", badgeVariant: "info" },
      { title: "Website Audits", href: "/admin/site-audits/", badge: "15d", badgeVariant: "success" },
      { title: "Google Updates", href: "/admin/google-updates/" },
    ],
  },
  {
    title: "CONTENT",
    items: [
      { title: "Blogs", href: "/admin/blogs/" },
      { title: "Media Library", href: "/admin/media/" },
      { title: "Portfolio", href: "/admin/portfolio/" },
    ],
  },
  {
    title: "MARKETING",
    items: [
      { title: "SEO Manager", href: "/admin/seo/" },
      { title: "Forms", href: "/admin/forms/" },
      { title: "Leads", href: "/admin/leads/" },
    ],
  },
  {
    title: "PEOPLE",
    items: [
      { title: "Careers", href: "/admin/careers/" },
      { title: "Applications", href: "/admin/applications/" },
      { title: "Assessments", href: "/admin/assessment/", badge: "AI", badgeVariant: "warning" },
      { title: "HR Pipeline", href: "/admin/hr-pipeline/" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { title: "Users & Roles", href: "/admin/users/" },
      { title: "Activity Log", href: "/admin/activity-log/", badge: "Super", badgeVariant: "primary" },
      { title: "Integrations", href: "/admin/integrations/" },
      { title: "Settings", href: "/admin/settings/" },
    ],
  },
];

type Props = {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  currentUser?: CmsUser | null;
};

export default function AdminSidebar({ collapsed, mobileOpen, onCloseMobile, currentUser }: Props) {
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
        <div className="dgs-saas-sidebar-brand">
          <Link href="/admin/" className="dgs-saas-brand-link" onClick={onCloseMobile}>
            <div className="dgs-saas-logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#7367F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="#7367F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="#7367F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {!collapsed && (
              <div className="dgs-saas-brand-text">
                <span className="dgs-saas-brand-title">DGS CMS</span>
                <span className="dgs-saas-brand-subtitle">Operations OS</span>
              </div>
            )}
          </Link>
          {mobileOpen && (
            <button
              type="button"
              className="dgs-saas-sidebar-close"
              onClick={onCloseMobile}
              aria-label="Close navigation"
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="dgs-saas-nav">
          {NAV_GROUPS.map((group) => {
            // Filter out superadmin only items if current user is not superadmin
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
                {!collapsed && <div className="dgs-saas-nav-header">{group.title}</div>}
                {collapsed && <div className="dgs-saas-nav-divider" title={group.title} />}
                <ul className="dgs-saas-nav-list">
                  {visibleItems.map((item) => {
                    const isActive = item.href === "/admin/"
                      ? pathname === "/admin" || pathname === "/admin/"
                      : pathname.startsWith(item.href);

                    return (
                      <li key={item.href} className="dgs-saas-nav-item">
                        <Link
                          href={item.href}
                          className={`dgs-saas-nav-link ${isActive ? "active" : ""}`}
                          onClick={onCloseMobile}
                          title={collapsed ? item.title : undefined}
                        >
                          <span className="dgs-saas-nav-bullet" aria-hidden="true" />
                          {!collapsed && (
                            <>
                              <span className="dgs-saas-nav-label">{item.title}</span>
                              {item.badge && (
                                <span className={`dgs-saas-nav-badge ${item.badgeVariant || "primary"}`}>
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

        {/* User Card at Bottom */}
        {!collapsed && currentUser && (
          <div className="dgs-saas-sidebar-footer">
            <div className="dgs-saas-user-mini">
              <div className="dgs-saas-avatar-mini">
                {currentUser.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="dgs-saas-user-info">
                <span className="dgs-saas-user-name">{currentUser.display_name}</span>
                <span className="dgs-saas-user-role">{currentUser.role.toUpperCase()}</span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
