"use client";

import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminSearchModal from "./AdminSearchModal";
import AdminLiveActivityDrawer from "./AdminLiveActivityDrawer";
import type { CmsUser } from "@/lib/cms/auth-db";

type Props = {
  children: React.ReactNode;
  currentUser?: CmsUser | null;
};

export default function AdminShell({ children, currentUser }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className={`dgs-saas-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      {/* Liquid Ambient Neon Glow Backdrop (Multi-layered blurred orbs) */}
      <div className="dgs-ambient-backdrop" aria-hidden="true">
        <div className="dgs-ambient-orb dgs-orb-magenta" />
        <div className="dgs-ambient-orb dgs-orb-purple" />
        <div className="dgs-ambient-orb dgs-orb-cyan" />
        <div className="dgs-ambient-orb dgs-orb-orange" />
      </div>

      {/* Collapsible / Responsive Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        currentUser={currentUser}
      />

      {/* Full-Width Workspace Wrapper */}
      <div className="dgs-saas-wrapper">
        {/* Sleek Dark Neon Glass Header */}
        <AdminHeader
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          onOpenMobile={() => setMobileOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          currentUser={currentUser}
        />

        {/* Central Workspace + Right Activity Drawer */}
        <div className="dgs-neon-workspace">
          <main className="dgs-neon-center-column" id="admin-main-content">
            {children}
          </main>

          {/* Right Live Intelligence Drawer (Matching Reference Mockup) */}
          <AdminLiveActivityDrawer onOpenSearch={() => setSearchOpen(true)} />
        </div>
      </div>

      {/* Global Cmd+K Search Command Palette */}
      <AdminSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
}
