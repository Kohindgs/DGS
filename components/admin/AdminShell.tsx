"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminSearchModal from "./AdminSearchModal";
import type { CmsUser } from "@/lib/cms/auth-db";

type Props = {
  children: React.ReactNode;
  currentUser?: CmsUser | null;
};

export default function AdminShell({ children, currentUser }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Restore and persist sidebar state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dgs_sidebar_collapsed");
      if (saved !== null) {
        setCollapsed(saved === "true");
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("dgs_sidebar_collapsed", String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  return (
    <div className={`dgs-saas-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      {/* Subtle Ambient DGS Haze (Faint 5-8% opacity - Restrained Enterprise Backdrop) */}
      <div className="dgs-ambient-backdrop" aria-hidden="true">
        <div className="dgs-ambient-orb dgs-orb-magenta" />
        <div className="dgs-ambient-orb dgs-orb-purple" />
      </div>

      {/* Collapsible Left Sidebar (260px expanded / 72px collapsed) */}
      <AdminSidebar
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        currentUser={currentUser}
      />

      {/* Full-Width Workspace Wrapper */}
      <div className="dgs-saas-wrapper">
        {/* Apple Translucent Glass Header (64px) */}
        <AdminHeader
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
          onOpenMobile={() => setMobileOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          currentUser={currentUser}
        />

        {/* Central Workspace Canvas (Spacious macOS Layout) */}
        <div className="dgs-neon-workspace">
          <main className="dgs-neon-center-column" id="admin-main-content">
            {children}
          </main>
        </div>
      </div>

      {/* Spotlight-Inspired Global Search (Cmd+K / Ctrl+K) */}
      <AdminSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
}
