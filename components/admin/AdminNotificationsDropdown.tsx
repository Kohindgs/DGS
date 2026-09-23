"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  is_read: number | boolean;
  created_at: string;
};

export default function AdminNotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (data.notifications) setNotifications(data.notifications);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch {}
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        className="dgs-saas-icon-btn"
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotifications();
        }}
        aria-label="Notifications"
        style={{ position: "relative" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--dgs-danger)",
              boxShadow: "0 0 8px rgba(234, 84, 85, 0.8)",
            }}
          />
        )}
      </button>

      {open && (
        <>
          <div
            className="dgs-saas-dropdown-backdrop"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className="dgs-saas-profile-dropdown"
            style={{ width: "340px", right: 0, padding: 0 }}
          >
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid var(--dgs-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.92rem" }}>
                Notifications {unreadCount > 0 && `(${unreadCount})`}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--dgs-primary)",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div style={{ maxHeight: "320px", overflowY: "auto", padding: "8px 0" }}>
              {notifications.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--dgs-text-muted)", fontSize: "0.85rem" }}>
                  No notifications
                </div>
              ) : (
                notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.link || "/admin/"}
                    onClick={() => setOpen(false)}
                    style={{
                      display: "block",
                      padding: "10px 18px",
                      textDecoration: "none",
                      borderBottom: "1px solid var(--dgs-border-subtle)",
                      background: n.is_read ? "transparent" : "rgba(115, 103, 240, 0.05)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: "0.85rem", color: "#fff" }}>{n.title}</strong>
                      {!n.is_read && (
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: "var(--dgs-primary)",
                          }}
                        />
                      )}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
                      {n.message}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
