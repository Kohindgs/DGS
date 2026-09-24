"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  X,
  Sliders,
  Inbox,
  AlertCircle,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { NotificationRecord, NotificationSeverity } from "@/lib/notifications/engine";

function formatRelativeTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    const now = Date.now();
    const diffMs = now - d.getTime();
    if (diffMs < 0) return "just now";
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function getSeverityBadge(severity: NotificationSeverity) {
  switch (severity) {
    case "danger":
      return {
        bg: "rgba(239, 68, 68, 0.15)",
        border: "rgba(239, 68, 68, 0.3)",
        color: "var(--dgs-danger)",
        icon: AlertCircle,
      };
    case "warning":
      return {
        bg: "rgba(245, 158, 11, 0.15)",
        border: "rgba(245, 158, 11, 0.3)",
        color: "var(--dgs-warning)",
        icon: AlertTriangle,
      };
    case "success":
      return {
        bg: "rgba(16, 185, 129, 0.15)",
        border: "rgba(16, 185, 129, 0.3)",
        color: "var(--dgs-success)",
        icon: CheckCircle2,
      };
    default:
      return {
        bg: "rgba(0, 102, 255, 0.15)",
        border: "rgba(0, 102, 255, 0.3)",
        color: "var(--dgs-brand-cyan)",
        icon: Info,
      };
  }
}

export default function AdminNotificationsDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : data.notifications.filter((n: any) => !n.is_read).length);
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  }, []);

  // Initial fetch and 45s background polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleOpenToggle = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) {
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch {}
  };

  const handleMarkSingleRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "read" }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const handleDismiss = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "dismiss" }),
      });
      const wasUnread = notifications.find((n) => n.id === id)?.is_read === 0;
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {}
  };

  const handleItemClick = async (n: NotificationRecord) => {
    if (!n.is_read) {
      fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: n.id, action: "read" }),
      }).catch(() => {});
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, is_read: 1 } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setOpen(false);
    const dest = n.resource_url || n.link || "/admin/";
    router.push(dest);
  };

  const displayedNotifications = tab === "unread"
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  return (
    <div style={{ position: "relative" }}>
      {/* Trigger Button with Lucide Bell & Numeric Badge */}
      <button
        type="button"
        className="dgs-saas-icon-btn"
        onClick={handleOpenToggle}
        aria-label={`Notifications (${unreadCount} unread)`}
        title={`Notifications (${unreadCount} unread)`}
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "36px",
          height: "36px",
          borderRadius: "var(--dgs-radius-sm)",
          background: open ? "rgba(255, 255, 255, 0.08)" : "transparent",
          border: "1px solid",
          borderColor: open ? "var(--dgs-border)" : "transparent",
          color: open ? "#fff" : "var(--dgs-text-secondary)",
          cursor: "pointer",
          transition: "all var(--dgs-transition-fast)",
        }}
      >
        <Bell size={18} strokeWidth={1.8} />

        {/* Real Numeric Unread Badge (Hidden when count is 0) */}
        {unreadCount > 0 && (
          <span
            className="dgs-saas-badge-counter"
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              minWidth: "18px",
              height: "18px",
              padding: "0 5px",
              borderRadius: "9999px",
              backgroundColor: "var(--dgs-danger)",
              color: "#FFFFFF",
              fontSize: "10.5px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 10px rgba(239, 68, 68, 0.6)",
              lineHeight: 1,
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="dgs-saas-dropdown-backdrop"
            onClick={() => setOpen(false)}
            aria-hidden="true"
            style={{ position: "fixed", inset: 0, zIndex: 75 }}
          />

          {/* 420px Liquid Glass Dropdown Center */}
          <div
            className="dgs-saas-profile-dropdown"
            role="dialog"
            aria-label="Notifications Center"
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: "420px",
              maxWidth: "calc(100vw - 28px)",
              maxHeight: "560px",
              backgroundColor: "rgba(14, 17, 26, 0.88)",
              backdropFilter: "blur(32px) saturate(160%)",
              WebkitBackdropFilter: "blur(32px) saturate(160%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "var(--dgs-radius-lg)",
              boxShadow: "0 24px 70px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
              padding: 0,
              zIndex: 80,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 20px 12px",
                borderBottom: "1px solid var(--dgs-border-subtle)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontWeight: 650, color: "#fff", fontSize: "14px" }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span
                    className="dgs-saas-chip sm danger"
                    style={{ fontSize: "11px", padding: "1px 6px", fontWeight: 700 }}
                  >
                    {unreadCount} unread
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--dgs-brand-cyan)",
                    fontSize: "12px",
                    fontWeight: 550,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "4px 8px",
                    borderRadius: "4px",
                  }}
                >
                  <CheckCheck size={13} />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderBottom: "1px solid var(--dgs-border-subtle)",
                backgroundColor: "rgba(0, 0, 0, 0.15)",
              }}
            >
              <button
                type="button"
                onClick={() => setTab("all")}
                style={{
                  background: tab === "all" ? "rgba(255, 255, 255, 0.08)" : "transparent",
                  border: "1px solid",
                  borderColor: tab === "all" ? "var(--dgs-border)" : "transparent",
                  color: tab === "all" ? "#fff" : "var(--dgs-text-muted)",
                  padding: "4px 10px",
                  borderRadius: "var(--dgs-radius-sm)",
                  fontSize: "12px",
                  fontWeight: tab === "all" ? 600 : 450,
                  cursor: "pointer",
                }}
              >
                All ({notifications.length})
              </button>

              <button
                type="button"
                onClick={() => setTab("unread")}
                style={{
                  background: tab === "unread" ? "rgba(255, 255, 255, 0.08)" : "transparent",
                  border: "1px solid",
                  borderColor: tab === "unread" ? "var(--dgs-border)" : "transparent",
                  color: tab === "unread" ? "#fff" : "var(--dgs-text-muted)",
                  padding: "4px 10px",
                  borderRadius: "var(--dgs-radius-sm)",
                  fontSize: "12px",
                  fontWeight: tab === "unread" ? 600 : 450,
                  cursor: "pointer",
                }}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Notification List Scroll Area */}
            <div
              style={{
                flex: 1,
                maxHeight: "380px",
                overflowY: "auto",
                overscrollBehavior: "contain",
              }}
            >
              {displayedNotifications.length === 0 ? (
                <div
                  style={{
                    padding: "48px 24px",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.04)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--dgs-text-dim)",
                    }}
                  >
                    <Inbox size={22} />
                  </div>
                  <div style={{ color: "var(--dgs-text-primary)", fontSize: "13.5px", fontWeight: 600 }}>
                    {tab === "unread" ? "No unread notifications" : "All caught up"}
                  </div>
                  <div style={{ color: "var(--dgs-text-muted)", fontSize: "12px", maxWidth: "260px" }}>
                    Real notifications from inquiries, applications, and system monitors will arrive here.
                  </div>
                </div>
              ) : (
                displayedNotifications.map((n) => {
                  const badge = getSeverityBadge(n.severity);
                  const Icon = badge.icon;
                  const isUnread = !n.is_read;

                  return (
                    <div
                      key={n.id}
                      onClick={() => handleItemClick(n)}
                      style={{
                        display: "flex",
                        gap: "12px",
                        padding: "12px 18px",
                        cursor: "pointer",
                        borderBottom: "1px solid var(--dgs-border-subtle)",
                        background: isUnread ? "rgba(0, 102, 255, 0.04)" : "transparent",
                        transition: "background var(--dgs-transition-fast)",
                      }}
                    >
                      {/* Severity Icon */}
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "8px",
                          background: badge.bg,
                          border: `1px solid ${badge.border}`,
                          color: badge.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        <Icon size={15} />
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px" }}>
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: isUnread ? 650 : 500,
                              color: isUnread ? "#FFFFFF" : "var(--dgs-text-primary)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {n.title}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              color: "var(--dgs-text-dim)",
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                            }}
                          >
                            {formatRelativeTime(n.created_at)}
                          </span>
                        </div>

                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--dgs-text-muted)",
                            marginTop: "3px",
                            lineHeight: 1.4,
                            wordBreak: "break-word",
                          }}
                        >
                          {n.message}
                        </div>

                        {/* Inline Actions (Read & Dismiss) */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginTop: "8px",
                            fontSize: "11px",
                          }}
                        >
                          {isUnread && (
                            <button
                              type="button"
                              onClick={(e) => handleMarkSingleRead(e, n.id)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "var(--dgs-brand-cyan)",
                                padding: 0,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                              }}
                            >
                              <Check size={11} />
                              <span>Mark read</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleDismiss(e, n.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--dgs-text-dim)",
                              padding: 0,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                          >
                            <X size={11} />
                            <span>Dismiss</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer with Settings Link */}
            <div
              style={{
                padding: "10px 18px",
                borderTop: "1px solid var(--dgs-border-subtle)",
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "11px", color: "var(--dgs-text-dim)" }}>
                Auto-polled every 45s
              </span>
              <Link
                href="/admin/settings/"
                onClick={() => setOpen(false)}
                style={{
                  fontSize: "11.5px",
                  color: "var(--dgs-brand-cyan)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Sliders size={12} />
                <span>Notification Settings</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
