"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  LayoutDashboard,
  BarChart3,
  FileText,
  Image as ImageIcon,
  Briefcase,
  Globe,
  FileCheck2,
  Inbox,
  UserCheck,
  GraduationCap,
  Users,
  Settings,
  ArrowRight,
} from "lucide-react";

type SearchResult = {
  id: string;
  title: string;
  category: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
};

const STATIC_TARGETS: SearchResult[] = [
  { id: "1", title: "Overview Dashboard", category: "Navigation", href: "/admin/", icon: LayoutDashboard },
  { id: "2", title: "Search Console Insights", category: "Insights", href: "/admin/search-console/", icon: Search },
  { id: "3", title: "Google Analytics 4", category: "Insights", href: "/admin/analytics/", icon: BarChart3 },
  { id: "4", title: "15-Day Automated Website Audits", category: "Insights", href: "/admin/site-audits/", icon: Globe },
  { id: "5", title: "Blog Posts & Revisions", category: "Content", href: "/admin/blogs/", icon: FileText },
  { id: "6", title: "Media Library V2", category: "Content", href: "/admin/media/", icon: ImageIcon },
  { id: "7", title: "Portfolio Showcase", category: "Content", href: "/admin/portfolio/", icon: Briefcase },
  { id: "8", title: "SEO Metadata & Schema", category: "Marketing", href: "/admin/seo/", icon: Globe },
  { id: "9", title: "Native Forms Inventory", category: "Marketing", href: "/admin/forms/", icon: FileCheck2 },
  { id: "10", title: "Client Leads Inbox", category: "Marketing", href: "/admin/leads/", icon: Inbox },
  { id: "11", title: "Career Positions", category: "People", href: "/admin/careers/", icon: UserCheck },
  { id: "12", title: "AI Assessments & Tests", category: "People", href: "/admin/assessment/", icon: GraduationCap },
  { id: "13", title: "HR Pipeline & Kanban", category: "People", href: "/admin/hr-pipeline/", icon: Users },
  { id: "14", title: "Users & RBAC Roles", category: "System", href: "/admin/users/", icon: Users },
  { id: "15", title: "System Settings", category: "System", href: "/admin/settings/", icon: Settings },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AdminSearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const filtered = query.trim() === ""
    ? STATIC_TARGETS
    : STATIC_TARGETS.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
      if (isOpen && filtered.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filtered.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
        } else if (e.key === "Enter") {
          e.preventDefault();
          const target = filtered[selectedIndex];
          if (target) {
            window.location.href = target.href;
            onClose();
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, filtered, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="dgs-saas-search-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="dgs-saas-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dgs-saas-search-input-wrapper" style={{ display: "flex", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--dgs-border-subtle)", gap: "12px" }}>
          <Search size={18} strokeWidth={1.8} style={{ color: "var(--dgs-text-muted)" }} />
          <input
            ref={inputRef}
            type="text"
            className="dgs-saas-search-input"
            placeholder="Search DGS CMS modules, tools, or shortcuts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1, background: "none", border: "none", color: "var(--dgs-text-main)", fontSize: "0.95rem", outline: "none" }}
          />
          <kbd className="dgs-saas-search-kbd" style={{ fontSize: "0.72rem", background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--dgs-border)" }}>
            ESC
          </kbd>
        </div>

        <div className="dgs-saas-search-results" style={{ maxHeight: "380px", overflowY: "auto", padding: "8px" }}>
          {filtered.length === 0 ? (
            <div className="dgs-saas-search-empty" style={{ padding: "24px", textAlign: "center", color: "var(--dgs-text-muted)", fontSize: "0.88rem" }}>
              No matches found for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const IconComp = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="dgs-saas-search-result-item"
                  onClick={onClose}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    background: isSelected ? "rgba(255,255,255,0.06)" : "transparent",
                    color: "var(--dgs-text-main)",
                    transition: "background 120ms ease",
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ color: isSelected ? "var(--dgs-primary)" : "var(--dgs-text-muted)", display: "flex" }}>
                      <IconComp size={17} strokeWidth={1.8} />
                    </span>
                    <div>
                      <div style={{ fontSize: "0.88rem", fontWeight: 500 }}>{item.title}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-dim)" }}>{item.category}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: "0.78rem", color: "var(--dgs-text-dim)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span>Open</span>
                    <ArrowRight size={13} />
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
