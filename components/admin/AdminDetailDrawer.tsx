"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
};

export default function AdminDetailDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "520px",
}: DrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="dgs-drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <aside
        className="dgs-detail-drawer open"
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="dgs-drawer-header">
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: "var(--dgs-text-primary)" }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ fontSize: 12, color: "var(--dgs-text-muted)", margin: "2px 0 0" }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            className="dgs-saas-btn secondary sm"
            onClick={onClose}
            aria-label="Close drawer"
            style={{ width: 28, height: 28, padding: 0 }}
          >
            <X size={15} />
          </button>
        </div>
        <div className="dgs-drawer-body">{children}</div>
        {footer && <div className="dgs-drawer-footer">{footer}</div>}
      </aside>
    </>
  );
}
