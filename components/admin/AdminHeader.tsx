"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import AdminNotificationsDropdown from "./AdminNotificationsDropdown";
import type { CmsUser } from "@/lib/cms/auth-db";
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  User,
  KeyRound,
  Shield,
  LogOut,
  ExternalLink,
  Plus,
  ChevronDown,
  SlidersHorizontal,
  FileText,
  Inbox,
  GraduationCap,
  Briefcase,
  UserPlus,
} from "lucide-react";

type Props = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
  onOpenSearch: () => void;
  currentUser?: CmsUser | null;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
  density?: "comfortable" | "compact";
  onToggleDensity?: () => void;
};

export default function AdminHeader({
  collapsed,
  onToggleCollapse,
  onOpenMobile,
  onOpenSearch,
  currentUser,
  theme = "dark",
  onToggleTheme,
  density = "comfortable",
  onToggleDensity,
}: Props) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // Build clean breadcrumbs from pathname
  const segments = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
  const breadcrumbTitle = segments.length > 0
    ? segments[0].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Overview";

  return (
    <header className="dgs-saas-header">
      {/* Left: Sidebar Toggle + Breadcrumb */}
      <div className="dgs-header-left dgs-saas-header-left">
        {/* Mobile Hamburger */}
        <button
          type="button"
          className="dgs-saas-btn secondary sm mobile-only"
          onClick={onOpenMobile}
          aria-label="Open Mobile Navigation"
          style={{ width: "34px", padding: 0 }}
        >
          <Menu size={18} strokeWidth={1.8} />
        </button>

        {/* Mobile Brand Mark */}
        <Link
          href="/admin/"
          className="mobile-only dgs-saas-header-brand"
          style={{
            alignItems: "center",
            gap: "6px",
            textDecoration: "none",
            marginLeft: "6px",
            marginRight: "6px",
          }}
          aria-label="DGS Dashboard"
        >
          <Image
            src="/images/brand/dgs-mark-compact.png"
            alt="DGS"
            width={26}
            height={26}
            className="dgs-saas-header-mark-img"
            priority
          />
        </Link>

        {/* Desktop Sidebar Accordion Button */}
        <button
          type="button"
          className="dgs-sidebar-accordion-btn desktop-only"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Open Sidebar (Cmd+B)" : "Close Sidebar (Cmd+B)"}
          title={collapsed ? "Open Sidebar (Cmd+B)" : "Close Sidebar (Cmd+B)"}
        >
          {collapsed ? <PanelLeftOpen size={18} strokeWidth={1.8} /> : <PanelLeftClose size={18} strokeWidth={1.8} />}
        </button>

        {/* Breadcrumb Navigation */}
        <nav className="dgs-breadcrumbs dgs-saas-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/admin/">Admin</Link>
          <span className="separator">/</span>
          <span className="current">{breadcrumbTitle}</span>
        </nav>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="desktop-only" style={{ flex: 1, maxWidth: "340px", margin: "0 16px" }}>
        <button
          type="button"
          className="dgs-command-trigger"
          onClick={onOpenSearch}
          aria-label="Search DGS CMS (Cmd+K)"
          style={{ width: "100%" }}
        >
          <Search size={14} strokeWidth={1.8} />
          <span>Search or type command...</span>
          <kbd className="dgs-kbd">⌘K</kbd>
        </button>
      </div>

      {/* Right: Quick Create, Toggles, Status, Notifications & Profile */}
      <div className="dgs-header-right dgs-saas-header-right">
        {/* Quick Create Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            className="dgs-saas-btn primary sm"
            onClick={() => setCreateOpen(!createOpen)}
            aria-expanded={createOpen}
            aria-label="Quick Create Menu"
          >
            <Plus size={14} strokeWidth={2.2} />
            <span className="desktop-only">Create</span>
            <ChevronDown size={12} strokeWidth={2} />
          </button>

          {createOpen && (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 65 }}
                onClick={() => setCreateOpen(false)}
                aria-hidden="true"
              />
              <div
                className="dgs-saas-profile-dropdown"
                role="menu"
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "6px",
                  width: "210px",
                  zIndex: 70,
                  backgroundColor: "var(--dgs-bg-surface)",
                  border: "1px solid var(--dgs-border)",
                  borderRadius: "var(--dgs-radius-md)",
                  boxShadow: "var(--dgs-shadow-popover)",
                  padding: "6px",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--dgs-text-dim)", textTransform: "uppercase", padding: "6px 10px 4px", letterSpacing: "0.04em" }}>
                  Quick Actions
                </div>
                <Link
                  href="/admin/leads/"
                  className="dgs-saas-dropdown-item"
                  role="menuitem"
                  onClick={() => setCreateOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", fontSize: "13px", color: "var(--dgs-text-primary)", textDecoration: "none", borderRadius: "var(--dgs-radius-sm)" }}
                >
                  <Inbox size={14} color="var(--dgs-brand-blue)" />
                  <span>New Lead Record</span>
                </Link>
                <Link
                  href="/admin/blogs/new/"
                  className="dgs-saas-dropdown-item"
                  role="menuitem"
                  onClick={() => setCreateOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", fontSize: "13px", color: "var(--dgs-text-primary)", textDecoration: "none", borderRadius: "var(--dgs-radius-sm)" }}
                >
                  <FileText size={14} color="var(--dgs-success)" />
                  <span>New Blog Post</span>
                </Link>
                <Link
                  href="/admin/assessment/"
                  className="dgs-saas-dropdown-item"
                  role="menuitem"
                  onClick={() => setCreateOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", fontSize: "13px", color: "var(--dgs-text-primary)", textDecoration: "none", borderRadius: "var(--dgs-radius-sm)" }}
                >
                  <GraduationCap size={14} color="var(--dgs-warning)" />
                  <span>New Assessment</span>
                </Link>
                <Link
                  href="/admin/careers/"
                  className="dgs-saas-dropdown-item"
                  role="menuitem"
                  onClick={() => setCreateOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", fontSize: "13px", color: "var(--dgs-text-primary)", textDecoration: "none", borderRadius: "var(--dgs-radius-sm)" }}
                >
                  <Briefcase size={14} color="var(--dgs-info)" />
                  <span>New Career Role</span>
                </Link>
                <div style={{ height: "1px", background: "var(--dgs-border-subtle)", margin: "4px 0" }} />
                <Link
                  href="/admin/users/"
                  className="dgs-saas-dropdown-item"
                  role="menuitem"
                  onClick={() => setCreateOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", fontSize: "13px", color: "var(--dgs-text-primary)", textDecoration: "none", borderRadius: "var(--dgs-radius-sm)" }}
                >
                  <UserPlus size={14} />
                  <span>Add Team Member</span>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Density Toggle (Comfortable vs Compact) */}
        {onToggleDensity && (
          <button
            type="button"
            className="dgs-saas-btn secondary sm desktop-only"
            onClick={onToggleDensity}
            title={`Density: ${density === "compact" ? "Compact" : "Comfortable"} (Click to switch)`}
            aria-label="Toggle display density"
            style={{ width: "32px", padding: 0 }}
          >
            <SlidersHorizontal size={14} strokeWidth={1.8} />
          </button>
        )}

        {/* Real Live Operational Status Pill */}
        <div
          className="dgs-saas-chip sm success desktop-only"
          title="Native Next.js Production Runtime Active"
          style={{ cursor: "default" }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--dgs-success)" }} />
          <span>Operational</span>
        </div>

        {/* Open Public Site in New Tab */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="dgs-saas-btn secondary sm desktop-only"
          title="Open Live Public Website"
          aria-label="Open Public Site"
          style={{ width: "32px", padding: 0 }}
        >
          <ExternalLink size={14} strokeWidth={1.8} />
        </Link>

        {/* Real Notifications Dropdown */}
        <AdminNotificationsDropdown />

        {/* User Profile Dropdown */}
        <div className="dgs-saas-user-dropdown-container" style={{ position: "relative" }}>
          <button
            type="button"
            className="dgs-saas-avatar-btn"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-expanded={profileOpen}
            aria-label="User Profile Menu"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <div
              className="dgs-saas-avatar"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "var(--dgs-bg-surface-secondary)",
                border: "1px solid var(--dgs-border)",
                color: "var(--dgs-text-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 650,
                fontSize: "12px",
              }}
            >
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
              <div
                className="dgs-saas-profile-dropdown"
                role="menu"
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "6px",
                  width: "240px",
                  zIndex: 70,
                  backgroundColor: "var(--dgs-bg-surface)",
                  border: "1px solid var(--dgs-border)",
                  borderRadius: "var(--dgs-radius-md)",
                  boxShadow: "var(--dgs-shadow-popover)",
                  padding: "6px",
                }}
              >
                <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--dgs-border-subtle)" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--dgs-text-primary)" }}>
                    {currentUser?.display_name || "DGS Administrator"}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--dgs-text-muted)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {currentUser?.email || "admin@dgeniussolutions.com"}
                  </div>
                </div>

                <div style={{ padding: "4px 0" }}>
                  <Link
                    href="/admin/users/"
                    className="dgs-saas-dropdown-item"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", fontSize: "13px", color: "var(--dgs-text-primary)", textDecoration: "none", borderRadius: "var(--dgs-radius-sm)" }}
                  >
                    <User size={15} strokeWidth={1.8} />
                    <span>My Profile & Users</span>
                  </Link>

                  <Link
                    href="/admin/settings/"
                    className="dgs-saas-dropdown-item"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", fontSize: "13px", color: "var(--dgs-text-primary)", textDecoration: "none", borderRadius: "var(--dgs-radius-sm)" }}
                  >
                    <KeyRound size={15} strokeWidth={1.8} />
                    <span>Account Settings</span>
                  </Link>

                  <Link
                    href="/admin/activity-log/"
                    className="dgs-saas-dropdown-item"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", fontSize: "13px", color: "var(--dgs-text-primary)", textDecoration: "none", borderRadius: "var(--dgs-radius-sm)" }}
                  >
                    <Shield size={15} strokeWidth={1.8} />
                    <span>Audit & Sessions</span>
                  </Link>
                </div>

                <div style={{ height: "1px", background: "var(--dgs-border-subtle)", margin: "4px 0" }} />

                <form action="/api/admin/logout" method="POST" style={{ margin: 0 }}>
                  <button
                    type="submit"
                    className="dgs-saas-dropdown-item"
                    role="menuitem"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 12px",
                      fontSize: "13px",
                      color: "var(--dgs-danger)",
                      background: "none",
                      border: "none",
                      width: "100%",
                      cursor: "pointer",
                      textAlign: "left",
                      borderRadius: "var(--dgs-radius-sm)",
                    }}
                  >
                    <LogOut size={15} strokeWidth={1.8} />
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
