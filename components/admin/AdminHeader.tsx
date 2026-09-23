"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import AdminNotificationsDropdown from "./AdminNotificationsDropdown";
import type { CmsUser } from "@/lib/cms/auth-db";


type Props = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
  onOpenSearch: () => void;
  currentUser?: CmsUser | null;
};

const BREADCRUMB_MAP: Record<string, string> = {
  admin: "Dashboard",
  "search-console": "Search Console",
  analytics: "Analytics",
  "site-audits": "Website Audits",
  "google-updates": "Google Updates",
  blogs: "Blogs",
  media: "Media Library",
  portfolio: "Portfolio",
  seo: "SEO Manager",
  forms: "Forms",
  leads: "Leads",
  careers: "Careers",
  applications: "Applications",
  assessment: "Assessments",
  "hr-pipeline": "HR Pipeline",
  users: "Users & Roles",
  "activity-log": "Activity Log",
  integrations: "Integrations",
  settings: "Settings",
};

export default function AdminHeader({
  collapsed,
  onToggleCollapse,
  onOpenMobile,
  onOpenSearch,
  currentUser,
}: Props) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);

  // Generate breadcrumb items
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((s) => s !== "admin");

  return (
    <header className="dgs-saas-header">
      <div className="dgs-saas-header-left">
        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="dgs-saas-toggle-btn mobile-only"
          onClick={onOpenMobile}
          aria-label="Open mobile menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Desktop Sidebar Collapse Toggle */}
        <button
          type="button"
          className="dgs-saas-toggle-btn desktop-only"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {collapsed ? (
              <polyline points="9 18 15 12 9 6" />
            ) : (
              <polyline points="15 18 9 12 15 6" />
            )}
          </svg>
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav className="dgs-saas-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/admin/" className="dgs-saas-breadcrumb-item">
            Dashboard
          </Link>
          {segments.map((seg, idx) => {
            const href = `/admin/${segments.slice(0, idx + 1).join("/")}/`;
            const label = BREADCRUMB_MAP[seg] || seg.replace(/-/g, " ");
            const isLast = idx === segments.length - 1;

            return (
              <React.Fragment key={href}>
                <span className="dgs-saas-breadcrumb-separator">/</span>
                {isLast ? (
                  <span className="dgs-saas-breadcrumb-current">{label}</span>
                ) : (
                  <Link href={href} className="dgs-saas-breadcrumb-item">
                    {label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="dgs-saas-header-right">
        {/* Global Search Button */}
        <button
          type="button"
          className="dgs-saas-search-trigger"
          onClick={onOpenSearch}
          aria-label="Open search dialog"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="dgs-saas-search-text">Search...</span>
          <kbd className="dgs-saas-search-kbd">⌘K</kbd>
        </button>

        {/* View Live Website Link */}
        <a
          href="https://www.dgeniussolutions.com"
          target="_blank"
          rel="noopener noreferrer"
          className="dgs-saas-icon-btn"
          title="Open live site"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>

        {/* Notifications Dropdown */}
        <AdminNotificationsDropdown />


        {/* User Profile Avatar Popover */}
        <div className="dgs-saas-user-dropdown-container">
          <button
            type="button"
            className="dgs-saas-avatar-btn"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-expanded={profileOpen}
            aria-label="User profile menu"
          >
            <div className="dgs-saas-avatar">
              {currentUser?.display_name?.charAt(0).toUpperCase() || "A"}
            </div>
          </button>

          {profileOpen && (
            <>
              <div
                className="dgs-saas-dropdown-backdrop"
                onClick={() => setProfileOpen(false)}
                aria-hidden="true"
              />
              <div className="dgs-saas-profile-dropdown">
                <div className="dgs-saas-profile-dropdown-header">
                  <p className="dgs-saas-profile-name">{currentUser?.display_name || "DGS Administrator"}</p>
                  <p className="dgs-saas-profile-email">{currentUser?.email || "admin@dgeniussolutions.com"}</p>
                  <span className="dgs-saas-profile-role-badge">
                    {currentUser?.role?.toUpperCase() || "SUPERADMIN"}
                  </span>
                </div>
                <div className="dgs-saas-profile-dropdown-divider" />
                <Link
                  href="/admin/users/"
                  className="dgs-saas-dropdown-item"
                  onClick={() => setProfileOpen(false)}
                >
                  Manage Users
                </Link>
                <Link
                  href="/admin/integrations/"
                  className="dgs-saas-dropdown-item"
                  onClick={() => setProfileOpen(false)}
                >
                  Integrations
                </Link>
                <div className="dgs-saas-profile-dropdown-divider" />
                <a
                  href="/api/admin/session?logout=1"
                  className="dgs-saas-dropdown-item logout"
                >
                  Sign Out
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
