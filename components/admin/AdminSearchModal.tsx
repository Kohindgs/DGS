"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";

type SearchResult = {
  id: string;
  title: string;
  category: string;
  href: string;
  meta?: string;
};

const STATIC_TARGETS: SearchResult[] = [
  { id: "1", title: "Overview Dashboard", category: "Navigation", href: "/admin/" },
  { id: "2", title: "Search Console Insights", category: "Insights", href: "/admin/search-console/" },
  { id: "3", title: "Google Analytics 4", category: "Insights", href: "/admin/analytics/" },
  { id: "4", title: "15-Day Automated Website Audits", category: "Insights", href: "/admin/site-audits/" },
  { id: "5", title: "Google Update Compliance", category: "Insights", href: "/admin/google-updates/" },
  { id: "6", title: "Blog Posts & Revisions", category: "Content", href: "/admin/blogs/" },
  { id: "7", title: "Media Library V2", category: "Content", href: "/admin/media/" },
  { id: "8", title: "Portfolio Showcase", category: "Content", href: "/admin/portfolio/" },
  { id: "9", title: "SEO Metadata & Schema", category: "Marketing", href: "/admin/seo/" },
  { id: "10", title: "Native Forms Inventory", category: "Marketing", href: "/admin/forms/" },
  { id: "11", title: "Client Leads Inbox", category: "Marketing", href: "/admin/leads/" },
  { id: "12", title: "Career Positions", category: "People", href: "/admin/careers/" },
  { id: "13", title: "Job Applications", category: "People", href: "/admin/applications/" },
  { id: "14", title: "AI Assessments", category: "People", href: "/admin/assessment/" },
  { id: "15", title: "HR Pipeline & Kanban", category: "People", href: "/admin/hr-pipeline/" },
  { id: "16", title: "Users & RBAC Roles", category: "System", href: "/admin/users/" },
  { id: "17", title: "Immutable Activity Log", category: "System", href: "/admin/activity-log/" },
  { id: "18", title: "Google & Gemini Integrations", category: "System", href: "/admin/integrations/" },
  { id: "19", title: "System Settings", category: "System", href: "/admin/settings/" },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AdminSearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim() === ""
    ? STATIC_TARGETS
    : STATIC_TARGETS.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="dgs-saas-search-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="dgs-saas-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dgs-saas-search-input-wrapper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="dgs-saas-search-input"
            placeholder="Type a command or search across CMS..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" className="dgs-saas-search-close" onClick={onClose}>
            ESC
          </button>
        </div>

        <div className="dgs-saas-search-results">
          {filtered.length === 0 ? (
            <div className="dgs-saas-search-empty">No results found for &quot;{query}&quot;</div>
          ) : (
            filtered.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="dgs-saas-search-result-item"
                onClick={onClose}
              >
                <div className="dgs-saas-search-item-info">
                  <span className="dgs-saas-search-item-title">{item.title}</span>
                  <span className="dgs-saas-search-item-category">{item.category}</span>
                </div>
                <span className="dgs-saas-search-item-enter">Jump →</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
