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
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");

  // Restore and persist sidebar, theme, and density preferences
  useEffect(() => {
    try {
      const savedCollapsed = localStorage.getItem("dgs_sidebar_collapsed");
      if (savedCollapsed !== null) {
        setCollapsed(savedCollapsed === "true");
      }

      const savedTheme = localStorage.getItem("dgs_theme") as "light" | "dark" | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
      } else {
        document.documentElement.setAttribute("data-theme", "light");
      }

      const savedDensity = localStorage.getItem("dgs_density") as "comfortable" | "compact" | null;
      if (savedDensity) {
        setDensity(savedDensity);
        document.documentElement.setAttribute("data-density", savedDensity);
      } else {
        document.documentElement.setAttribute("data-density", "comfortable");
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
      } catch {}
      return next;
    });
  };

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      try {
        localStorage.setItem("dgs_theme", next);
        document.documentElement.setAttribute("data-theme", next);
      } catch {}
      return next;
    });
  };

  const handleToggleDensity = () => {
    setDensity((prev) => {
      const next = prev === "comfortable" ? "compact" : "comfortable";
      try {
        localStorage.setItem("dgs_density", next);
        document.documentElement.setAttribute("data-density", next);
      } catch {}
      return next;
    });
  };

  return (
    <div
      className={`dgs-saas-layout ${collapsed ? "sidebar-collapsed" : ""}`}
      data-theme={theme}
      data-density={density}
    >
      {/* Collapsible Left Sidebar (248px expanded / 64px collapsed) */}
      <AdminSidebar
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        currentUser={currentUser}
      />

      {/* Full-Width Workspace Wrapper */}
      <div className="dgs-saas-wrapper">
        {/* Compact Header (56px) */}
        <AdminHeader
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
          onOpenMobile={() => setMobileOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          currentUser={currentUser}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          density={density}
          onToggleDensity={handleToggleDensity}
        />

        {/* Central Workspace Canvas */}
        <div className="dgs-saas-workspace dgs-neon-workspace">
          <main className="dgs-saas-center-column dgs-neon-center-column" id="admin-main-content">
            {children}
          </main>
        </div>
      </div>

      {/* Linear-style Command Palette (Cmd+K / Ctrl+K) */}
      <AdminSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
}
