"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

type ActivityItem = {
  id: string;
  user: string;
  time: string;
  message: string;
  avatarGradient: string;
  isHighlighted?: boolean;
};

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    user: "Googlebot",
    time: "Just now",
    message: "101/101 sitemap URLs crawled with 200 OK. 0 format errors.",
    avatarGradient: "linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)",
  },
  {
    id: "act-2",
    user: "Search Engine",
    time: "2m ago",
    message: "Google Update Compliance: All active core updates monitored.",
    avatarGradient: "linear-gradient(135deg, #9B51E0 0%, #7367F0 100%)",
  },
  {
    id: "act-3",
    user: "Inbound Lead",
    time: "14m ago",
    message: "New lead submitted via Enterprise SEO Contact form.",
    avatarGradient: "linear-gradient(135deg, #FF8008 0%, #FFC837 100%)",
  },
  {
    id: "act-4",
    user: "AI Assessment",
    time: "28m ago",
    message: "Gemini 2.5 Flash candidate test generated & assigned.",
    avatarGradient: "linear-gradient(135deg, #00F5A0 0%, #00D9F5 100%)",
  },
  {
    id: "act-5",
    user: "admin@dgeniussolutions.com",
    time: "Active now",
    message: "System operational: 0 WordPress runtime dependencies, native Next.js active.",
    avatarGradient: "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)",
    isHighlighted: true, // Matches the bright orange active card in mockup
  },
  {
    id: "act-6",
    user: "Media Studio",
    time: "1h ago",
    message: "880 media assets reconciled into native MySQL library.",
    avatarGradient: "linear-gradient(135deg, #7367F0 0%, #CE9FFC 100%)",
  },
];

type Props = {
  onOpenSearch?: () => void;
};

export default function AdminLiveActivityDrawer({ onOpenSearch }: Props) {
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [muted, setMuted] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    if (onOpenSearch) {
      onOpenSearch();
    }

    const newItem: ActivityItem = {
      id: `act-${Date.now()}`,
      user: "Superadmin",
      time: "Just now",
      message: inputVal.trim(),
      avatarGradient: "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)",
    };
    setActivities((prev) => [newItem, ...prev]);
    setInputVal("");
  };

  if (collapsed) {
    return (
      <aside
        style={{
          width: "48px",
          background: "rgba(18, 21, 30, 0.75)",
          backdropFilter: "blur(24px)",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "20px",
          cursor: "pointer",
        }}
        onClick={() => setCollapsed(false)}
        title="Expand Activity Stream"
      >
        <div style={{ color: "var(--dgs-neon-coral)", fontSize: "1.1rem" }}>⚡</div>
        <div style={{ writingMode: "vertical-rl", color: "var(--dgs-text-muted)", fontSize: "0.8rem", marginTop: "20px", letterSpacing: "1px" }}>
          LIVE SIGNALS
        </div>
      </aside>
    );
  }

  return (
    <aside className="dgs-neon-right-drawer" aria-label="Live Activity and Signals">
      {/* Header Bar */}
      <div className="dgs-drawer-header">
        <div className="dgs-drawer-signals-badge">
          <svg className="dgs-drawer-signals-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>{activities.length + 122} Signals</span>
        </div>

        <div className="dgs-drawer-header-actions">
          {/* Sound Toggle */}
          <button
            type="button"
            className="dgs-icon-btn"
            style={{ width: "32px", height: "32px" }}
            onClick={() => setMuted(!muted)}
            title={muted ? "Unmute Live Alerts" : "Mute Live Alerts"}
            aria-label="Toggle Sound"
          >
            {muted ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>

          {/* Activity Log Link */}
          <Link
            href="/admin/activity-log/"
            className="dgs-icon-btn"
            style={{ width: "32px", height: "32px" }}
            title="View Full Audit Log"
            aria-label="View Audit Log"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </Link>

          {/* Collapse Button */}
          <button
            type="button"
            className="dgs-icon-btn"
            style={{ width: "32px", height: "32px" }}
            onClick={() => setCollapsed(true)}
            title="Collapse Sidebar"
            aria-label="Collapse Sidebar"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Live Event Stream Cards */}
      <div className="dgs-drawer-feed">
        {activities.map((item) => {
          if (item.isHighlighted) {
            return (
              <div key={item.id} className="dgs-drawer-event-active">
                <div
                  className="dgs-drawer-event-avatar"
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    border: "1.5px solid rgba(255,255,255,0.4)",
                  }}
                >
                  <span style={{ fontSize: "0.85rem", fontWeight: 800 }}>⚡</span>
                </div>
                <div className="dgs-drawer-event-content">
                  <div className="dgs-drawer-event-top">
                    <span className="dgs-drawer-event-user">{item.user}</span>
                    <span className="dgs-drawer-event-time">{item.time}</span>
                  </div>
                  <p className="dgs-drawer-event-msg">{item.message}</p>
                </div>
              </div>
            );
          }

          return (
            <div key={item.id} className="dgs-drawer-event-item">
              <div
                className="dgs-drawer-event-avatar"
                style={{
                  background: item.avatarGradient,
                  boxShadow: "0 0 10px rgba(0,0,0,0.3)",
                }}
              >
                <span style={{ color: "#fff", fontSize: "0.75rem", fontWeight: 800 }}>
                  {item.user.slice(0, 1).toUpperCase()}
                </span>
              </div>
              <div className="dgs-drawer-event-content">
                <div className="dgs-drawer-event-top">
                  <span className="dgs-drawer-event-user">{item.user}</span>
                  <span className="dgs-drawer-event-time">{item.time}</span>
                </div>
                <p className="dgs-drawer-event-msg">{item.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Command / Message Bar */}
      <form className="dgs-drawer-command-bar" onSubmit={handleSend}>
        <input
          type="text"
          className="dgs-drawer-input-capsule"
          placeholder="Command or search (Cmd+K)..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          aria-label="Command search"
        />
        <button
          type="submit"
          className="dgs-drawer-send-btn"
          title="Execute Command"
          aria-label="Send"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </button>
      </form>
    </aside>
  );
}
