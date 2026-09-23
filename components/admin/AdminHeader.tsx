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

export default function AdminHeader({
  collapsed,
  onToggleCollapse,
  onOpenMobile,
  onOpenSearch,
  currentUser,
}: Props) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/admin/" && (pathname === "/admin" || pathname === "/admin/")) return true;
    return pathname.startsWith(path);
  };

  return (
    <header className="dgs-neon-header">
      {/* Left: Brand + Channel Links */}
      <div className="dgs-neon-brand">
        <button
          type="button"
          className="dgs-icon-btn mobile-only"
          onClick={onOpenMobile}
          aria-label="Open Navigation Menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <Link href="/admin/" className="dgs-neon-logo">
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              background: "var(--dgs-gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 900,
              fontSize: "1rem",
              boxShadow: "0 0 14px rgba(255, 65, 108, 0.45)",
            }}
          >
            D
          </div>
          <span style={{ fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            D’GENIUS
          </span>
        </Link>

        {/* Channels/Live Indicators (Matching social icons in reference) */}
        <div className="dgs-neon-social-icons desktop-only">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="dgs-neon-social-icon"
            title="Open Live Website"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </Link>

          <Link
            href="/admin/site-audits/"
            className="dgs-neon-social-icon"
            title="100% Valid W3C Sitemap"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </Link>

          <button
            type="button"
            className="dgs-neon-social-icon"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            onClick={onOpenSearch}
            title="Search CMS (Cmd+K)"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
      </div>

      {/* Center: Interactive Nav Tabs (Matching center tabs in reference) */}
      <nav className="dgs-header-nav-tabs desktop-only" aria-label="Quick Switcher">
        <Link
          href="/admin/"
          className={`dgs-header-tab ${isActive("/admin/") ? "active" : ""}`}
        >
          <span>⚡</span>
          <span>Overview</span>
        </Link>

        <Link
          href="/admin/search-console/"
          className={`dgs-header-tab ${isActive("/admin/search-console/") ? "active" : ""}`}
        >
          <span>🔥</span>
          <span>Search Console</span>
        </Link>

        <Link
          href="/admin/analytics/"
          className={`dgs-header-tab ${isActive("/admin/analytics/") ? "active" : ""}`}
        >
          <span>📊</span>
          <span>Analytics</span>
        </Link>

        <Link
          href="/admin/site-audits/"
          className={`dgs-header-tab ${isActive("/admin/site-audits/") ? "active" : ""}`}
        >
          <span>🛡️</span>
          <span>Audits</span>
        </Link>

        <Link
          href="/admin/assessment/"
          className={`dgs-header-tab ${isActive("/admin/assessment/") || isActive("/admin/hr-pipeline/") ? "active" : ""}`}
        >
          <span>🤖</span>
          <span>Talent OS</span>
        </Link>
      </nav>

      {/* Right: Actions, User Profile & Quick Plus Button */}
      <div className="dgs-header-actions">
        {/* Notifications Dropdown */}
        <AdminNotificationsDropdown />

        {/* Global Search Button */}
        <button
          type="button"
          className="dgs-icon-btn"
          onClick={onOpenSearch}
          title="Search CMS (Cmd+K)"
          aria-label="Search"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        {/* User Profile Capsule (Reference Style) */}
        <div style={{ position: "relative" }}>
          <div
            className="dgs-user-profile-capsule"
            onClick={() => setProfileOpen(!profileOpen)}
            style={{ cursor: "pointer" }}
            role="button"
            tabIndex={0}
          >
            <div className="dgs-user-avatar-glow">
              {currentUser?.display_name?.slice(0, 1) || "A"}
            </div>
            <div className="dgs-user-info-text desktop-only">
              <span className="dgs-user-name">
                {currentUser?.display_name || "Superadmin"}
              </span>
              <span className="dgs-user-meta">
                <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "var(--dgs-neon-emerald)" }} />
                100% Healthy
              </span>
            </div>
          </div>

          {/* Profile Menu Dropdown */}
          {profileOpen && (
            <div
              className="dgs-saas-card"
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "10px",
                width: "240px",
                padding: "8px",
                zIndex: 100,
                boxShadow: "0 10px 40px rgba(0,0,0,0.7)",
                backdropFilter: "blur(28px)",
                borderRadius: "18px",
              }}
            >
              <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--dgs-border-subtle)" }}>
                <strong style={{ display: "block", color: "#fff", fontSize: "0.9rem" }}>
                  {currentUser?.display_name || "DGS Superadmin"}
                </strong>
                <span style={{ fontSize: "0.75rem", color: "var(--dgs-text-muted)" }}>
                  {currentUser?.email || "admin@dgeniussolutions.com"}
                </span>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: "6px",
                    fontSize: "0.68rem",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    background: "rgba(115, 103, 240, 0.2)",
                    color: "var(--dgs-primary)",
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  {currentUser?.role || "superadmin"}
                </span>
              </div>

              <div style={{ padding: "6px 0" }}>
                <Link
                  href="/admin/users/"
                  className="dgs-saas-dropdown-item"
                  style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "var(--dgs-text-main)", fontSize: "0.85rem", borderRadius: "8px" }}
                  onClick={() => setProfileOpen(false)}
                >
                  <span>👥</span> Team &amp; Access
                </Link>
                <Link
                  href="/admin/activity-log/"
                  className="dgs-saas-dropdown-item"
                  style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "var(--dgs-text-main)", fontSize: "0.85rem", borderRadius: "8px" }}
                  onClick={() => setProfileOpen(false)}
                >
                  <span>📋</span> Audit Activity Log
                </Link>
                <Link
                  href="/admin/integrations/"
                  className="dgs-saas-dropdown-item"
                  style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "var(--dgs-text-main)", fontSize: "0.85rem", borderRadius: "8px" }}
                  onClick={() => setProfileOpen(false)}
                >
                  <span>🔌</span> API &amp; Integrations
                </Link>
              </div>

              <div style={{ borderTop: "1px solid var(--dgs-border-subtle)", padding: "6px 0 0" }}>
                <Link
                  href="/api/admin/session?logout=1"
                  className="dgs-saas-dropdown-item danger"
                  style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "var(--dgs-danger)", fontSize: "0.85rem", borderRadius: "8px" }}
                >
                  <span>🚪</span> Sign Out
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* DGS Gradient Quick Action Button (+) */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            className="dgs-neon-action-plus"
            onClick={() => setQuickCreateOpen(!quickCreateOpen)}
            title="Quick Action"
            aria-label="Quick Action"
          >
            +
          </button>

          {/* Quick Action Popover */}
          {quickCreateOpen && (
            <div
              className="dgs-saas-card"
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "12px",
                width: "220px",
                padding: "8px",
                zIndex: 100,
                boxShadow: "0 10px 40px rgba(0,0,0,0.7)",
                backdropFilter: "blur(28px)",
                borderRadius: "18px",
              }}
            >
              <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--dgs-border-subtle)", fontSize: "0.75rem", fontWeight: 700, color: "var(--dgs-text-dim)", textTransform: "uppercase" }}>
                Quick Create
              </div>
              <div style={{ padding: "6px 0" }}>
                <Link
                  href="/admin/blogs/"
                  className="dgs-saas-dropdown-item"
                  style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "var(--dgs-text-main)", fontSize: "0.85rem", borderRadius: "8px" }}
                  onClick={() => setQuickCreateOpen(false)}
                >
                  <span>✍️</span> New Blog Post
                </Link>
                <Link
                  href="/admin/media/"
                  className="dgs-saas-dropdown-item"
                  style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "var(--dgs-text-main)", fontSize: "0.85rem", borderRadius: "8px" }}
                  onClick={() => setQuickCreateOpen(false)}
                >
                  <span>🖼️</span> Upload Media
                </Link>
                <Link
                  href="/admin/assessment/"
                  className="dgs-saas-dropdown-item"
                  style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "var(--dgs-text-main)", fontSize: "0.85rem", borderRadius: "8px" }}
                  onClick={() => setQuickCreateOpen(false)}
                >
                  <span>🤖</span> AI Candidate Assessment
                </Link>
                <Link
                  href="/admin/site-audits/"
                  className="dgs-saas-dropdown-item"
                  style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "var(--dgs-text-main)", fontSize: "0.85rem", borderRadius: "8px" }}
                  onClick={() => setQuickCreateOpen(false)}
                >
                  <span>🚀</span> Trigger 15d Audit
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
