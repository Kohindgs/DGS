"use client";

import React, { useState } from "react";
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

  return (
    <div className={`dgs-saas-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      {/* Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        currentUser={currentUser}
      />

      {/* Main Column */}
      <div className="dgs-saas-wrapper">
        <AdminHeader
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          onOpenMobile={() => setMobileOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          currentUser={currentUser}
        />

        <main className="dgs-saas-main" id="admin-main-content">
          <div className="dgs-saas-content-fluid">
            {children}
          </div>
        </main>
      </div>

      {/* Global Search Dialog */}
      <AdminSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
}
