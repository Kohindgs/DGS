"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import AdminNotificationsDropdown from "./AdminNotificationsDropdown";
import type { CmsUser } from "@/lib/cms/auth-db";
import {
  Menu,
  PanelLeft,
  Search,
  User,
  KeyRound,
  Shield,
  Moon,
  Sun,
  LogOut,
  ExternalLink,
} from "lucide-react";

type Props = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
  onOpenSearch: () => void;
  currentUser?: CmsUser | null;
};

export default function AdminHeader({
  collapsed: _collapsed,
  onToggleCollapse,
  onOpenMobile,
  onOpenSearch,
  currentUser,
}: Props) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  const toggleTheme = () => {
    const nextTheme = !isLightMode;
    setIsLightMode(nextTheme);
    if (typeof document !== "undefined") {
      if (nextTheme) {
        document.documentElement.setAttribute("data-theme", "light");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
    }
  };

  // Build clean breadcrumbs from pathname
  const segments = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
  const breadcrumbTitle = segments.length > 0
    ? segments[0].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Overview";

  return (
    <header className="dgs-saas-header">
      {/* Left: Sidebar Toggle + Breadcrumb */}
      <div className="dgs-saas-header-left">
        {/* Mobile Hamburger */}
        <button
          type="button"
          className="dgs-saas-toggle-btn mobile-only"
          onClick={onOpenMobile}
          aria-label="Open Mobile Navigation"
        >
          <Menu size={20} strokeWidth={1.8} />
        </button>

        {/* Desktop Sidebar Collapse Toggle */}
        <button
          type="button"
          className="dgs-saas-toggle-btn desktop-only"
          onClick={onToggleCollapse}
          aria-label="Toggle Sidebar"
          title="Toggle Sidebar (Cmd+B)"
        >
          <PanelLeft size={19} strokeWidth={1.8} />
        </button>

        {/* Breadcrumb Navigation */}
        <nav className="dgs-saas-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/admin/" className="dgs-saas-breadcrumb-item">
            Admin
          </Link>
          <span className="dgs-saas-breadcrumb-separator">/</span>
          <span className="dgs-saas-breadcrumb-current">{breadcrumbTitle}</span>
        </nav>
      </div>

      {/* Center: Spotlight Search Trigger */}
      <div className="dgs-saas-header-center desktop-only">
        <button
          type="button"
          className="dgs-saas-search-trigger"
          onClick={onOpenSearch}
          aria-label="Search DGS CMS (Cmd+K)"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Search size={15} strokeWidth={1.8} />
            <span>Search DGS CMS...</span>
          </div>
          <kbd className="dgs-saas-search-kbd">⌘K</kbd>
        </button>
      </div>

      {/* Right: Status Pill, Notifications & User Dropdown */}
      <div className="dgs-saas-header-right">
        {/* Real Live Operational Status Pill */}
        <div className="dgs-live-status-pill desktop-only" title="Native Next.js Production Runtime Active">
          <span className="dgs-live-dot" />
          <span>Operational</span>
        </div>

        {/* Mobile Search Button */}
        <button
          type="button"
          className="dgs-icon-btn mobile-only"
          onClick={onOpenSearch}
          aria-label="Search"
        >
          <Search size={18} strokeWidth={1.8} />
        </button>

        {/* Open Public Site in New Tab */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="dgs-saas-toggle-btn desktop-only"
          title="Open Live Public Website"
          aria-label="Open Public Site"
        >
          <ExternalLink size={18} strokeWidth={1.8} />
        </Link>

        {/* Real Notifications Dropdown */}
        <AdminNotificationsDropdown />

        {/* User Profile Dropdown */}
        <div className="dgs-saas-user-dropdown-container">
          <button
            type="button"
            className="dgs-saas-avatar-btn"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-expanded={profileOpen}
            aria-label="User Profile Menu"
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
                style={{ position: "fixed", inset: 0, zIndex: 65 }}
              />
              <div className="dgs-saas-profile-dropdown" role="menu">
                <div className="dgs-saas-dropdown-header">
                  <div className="name">{currentUser?.display_name || "DGS Administrator"}</div>
                  <div className="email">{currentUser?.email || "admin@dgeniussolutions.com"}</div>
                </div>

                <Link
                  href="/admin/users/"
                  className="dgs-saas-dropdown-item"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                >
                  <User size={16} strokeWidth={1.8} />
                  <span>My Profile & Users</span>
                </Link>

                <Link
                  href="/admin/settings/"
                  className="dgs-saas-dropdown-item"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                >
                  <KeyRound size={16} strokeWidth={1.8} />
                  <span>Change Password</span>
                </Link>

                <Link
                  href="/admin/activity-log/"
                  className="dgs-saas-dropdown-item"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                >
                  <Shield size={16} strokeWidth={1.8} />
                  <span>Audit & Sessions</span>
                </Link>

                <button
                  type="button"
                  className="dgs-saas-dropdown-item"
                  role="menuitem"
                  onClick={() => {
                    toggleTheme();
                    setProfileOpen(false);
                  }}
                >
                  {isLightMode ? <Moon size={16} strokeWidth={1.8} /> : <Sun size={16} strokeWidth={1.8} />}
                  <span>{isLightMode ? "Dark Mode" : "Light Mode"}</span>
                </button>

                <div className="dgs-saas-dropdown-divider" />

                <form action="/api/admin/logout" method="POST">
                  <button
                    type="submit"
                    className="dgs-saas-dropdown-item"
                    role="menuitem"
                    style={{ color: "var(--dgs-danger)", width: "100%" }}
                  >
                    <LogOut size={16} strokeWidth={1.8} />
                    <span>Log Out</span>
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
