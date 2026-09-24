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
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");

  // Restore and persist sidebar and density preferences (Theme is strictly dark)
  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", "dark");

      const savedCollapsed = localStorage.getItem("dgs_sidebar_collapsed");
      if (savedCollapsed !== null) {
        setCollapsed(savedCollapsed === "true");
      }

      const savedDensity = localStorage.getItem("dgs_density") as "comfortable" | "compact" | null;
      if (savedDensity) {
        setDensity(savedDensity);
        document.documentElement.setAttribute("data-density", savedDensity);
      } else {
        document.documentElement.setAttribute("data-density", "comfortable");
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
          e.preventDefault();
          setCollapsed((prev) => {
            const next = !prev;
            try {
              localStorage.setItem("dgs_sidebar_collapsed", String(next));
            } catch {}
            return next;
          });
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
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
      data-theme="dark"
      data-density={density}
    >
      {/* 2026 Ambient DGS Brand Light Backdrop */}
      <div className="dgs-ambient-canvas" aria-hidden="true">
        <div className="dgs-ambient-glow-tl" />
        <div className="dgs-ambient-glow-tr" />
        <div className="dgs-ambient-glow-b" />
      </div>

      {/* Floating Glass Sidebar (256px expanded / 70px collapsed) */}
      <AdminSidebar
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        currentUser={currentUser}
      />

      {/* Center Workspace Wrapper (Expands Immediately when sidebar closes) */}
      <div className="dgs-saas-wrapper">
        {/* Floating Top Command Bar (60px) */}
        <AdminHeader
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
          onOpenMobile={() => setMobileOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          currentUser={currentUser}
          theme="dark"
          density={density}
          onToggleDensity={handleToggleDensity}
        />

        {/* Edge-to-Edge Content Area */}
        <main className="dgs-saas-main">
          {children}
        </main>
      </div>

      {/* Raycast-Inspired Dark Liquid Glass Command Palette (Cmd+K) */}
      <AdminSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
}
