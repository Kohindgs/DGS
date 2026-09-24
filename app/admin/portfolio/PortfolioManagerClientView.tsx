"use client";

import React, { useState } from "react";
import Link from "next/link";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import MediaPicker, { type SelectedMedia } from "@/components/admin/MediaPicker";

export type PortfolioManagerItem = {
  id: string;
  sourceItemId: string;
  title: string;
  altText: string;
  type: string;
  sourceWidth?: number;
  sourceHeight?: number;
  thumbnailUrl: string;
  sortOrder: number;
  active: boolean;
};

type Props = {
  items: PortfolioManagerItem[];
  databaseConfigured: boolean;
};

export default function PortfolioManagerClientView({
  items: initialItems,
  databaseConfigured,
}: Props) {
  const [items, setItems] = useState<PortfolioManagerItem[]>(initialItems);
  const [editingItem, setEditingItem] = useState<PortfolioManagerItem | null>(null);
  const [titleVal, setTitleVal] = useState("");
  const [altVal, setAltVal] = useState("");
  const [orderVal, setOrderVal] = useState(0);
  const [activeVal, setActiveVal] = useState(true);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterActive, setFilterActive] = useState<string>("all");

  const openEditor = (item: PortfolioManagerItem) => {
    setEditingItem(item);
    setTitleVal(item.title);
    setAltVal(item.altText);
    setOrderVal(item.sortOrder);
    setActiveVal(item.active);
  };

  const handleMediaSelect = (media: SelectedMedia) => {
    if (media.alt_text) setAltVal(media.alt_text);
    if (media.title && !titleVal) setTitleVal(media.title);
    setMediaPickerOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || saving) return;
    setSaving(true);

    try {
      const res = await fetch("/api/admin/portfolio/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceItemId: editingItem.sourceItemId,
          title: titleVal,
          altText: altVal,
          sortOrder: orderVal,
          active: activeVal,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save portfolio item");

      // Update local state
      setItems((prev) =>
        prev.map((it) =>
          it.sourceItemId === editingItem.sourceItemId
            ? {
                ...it,
                title: titleVal,
                altText: altVal,
                sortOrder: orderVal,
                active: activeVal,
              }
            : it
        )
      );

      setEditingItem(null);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = items.filter((it) => {
    if (filterActive === "visible") return it.active;
    if (filterActive === "hidden") return !it.active;
    if (filterActive === "video") return it.type === "video";
    if (filterActive === "image") return it.type === "image";
    return true;
  });

  const columns: Column<PortfolioManagerItem>[] = [
    {
      key: "thumbnail",
      header: "Preview",
      width: "90px",
      render: (it) => (
        <div
          style={{
            width: "68px",
            height: "46px",
            background: "#101018",
            borderRadius: "4px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {it.thumbnailUrl ? (
            <img
              src={it.thumbnailUrl}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <span style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)" }}>
              {it.type === "video" ? "▶ Video" : "Img"}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "title",
      header: "Portfolio Title & Asset ID",
      sortable: true,
      render: (it) => (
        <div>
          <strong style={{ color: "#fff", fontSize: "0.88rem" }}>{it.title || it.sourceItemId}</strong>
          <div style={{ fontSize: "0.74rem", color: "var(--dgs-text-muted)", marginTop: "2px" }}>
            ID: <code>{it.sourceItemId}</code>
            {it.altText && (
              <span style={{ marginLeft: "8px", fontStyle: "italic", color: "rgba(255,255,255,0.5)" }}>
                Alt: &ldquo;{it.altText.slice(0, 45)}...&rdquo;
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Media Type",
      sortable: true,
      width: "120px",
      render: (it) => (
        <div>
          <span className={`dgs-saas-chip ${it.type === "video" ? "primary" : "neutral"}`}>
            {it.type.toUpperCase()}
          </span>
          <div style={{ fontSize: "0.72rem", color: "var(--dgs-text-muted)", marginTop: "3px" }}>
            {it.sourceWidth && it.sourceHeight ? `${it.sourceWidth}×${it.sourceHeight}` : "—"}
          </div>
        </div>
      ),
    },
    {
      key: "sortOrder",
      header: "Order",
      sortable: true,
      width: "80px",
      render: (it) => <strong>#{it.sortOrder}</strong>,
    },
    {
      key: "active",
      header: "Visibility",
      sortable: true,
      width: "110px",
      render: (it) => (
        <span className={`dgs-saas-chip ${it.active ? "success" : "neutral"}`}>
          {it.active ? "Visible" : "Hidden"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "100px",
      render: (it) => (
        <button
          type="button"
          className="dgs-saas-btn secondary sm"
          onClick={() => openEditor(it)}
          style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}
        >
          Edit Item
        </button>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            Portfolio Showcase Manager
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
            Control gallery order, metadata, and visibility with individual item drawers instead of cluttered inline forms.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span className={`dgs-saas-chip ${databaseConfigured ? "success" : "warning"}`}>
            {databaseConfigured ? "Database Configured" : "Database Not Configured"}
          </span>
          <Link href="/portfolio/" target="_blank" className="dgs-saas-btn secondary sm">
            View Live Portfolio ↗
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dgs-saas-kpi-grid">
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Total Showcase Items</div>
          <div className="dgs-saas-kpi-value">{items.length}</div>
          <div className="dgs-saas-kpi-delta positive">
            {items.filter((i) => i.type === "video").length} videos · {items.filter((i) => i.type === "image").length} images
          </div>
        </div>

        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Visible In Gallery</div>
          <div className="dgs-saas-kpi-value" style={{ color: "var(--dgs-success)" }}>
            {items.filter((i) => i.active).length}
          </div>
          <div className="dgs-saas-kpi-delta neutral">Active public items</div>
        </div>

        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Hidden From Gallery</div>
          <div className="dgs-saas-kpi-value">
            {items.filter((i) => !i.active).length}
          </div>
          <div className="dgs-saas-kpi-delta neutral">Draft / archived items</div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <span style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)" }}>Show:</span>
        {[
          { id: "all", label: `All (${items.length})` },
          { id: "visible", label: `Visible (${items.filter((i) => i.active).length})` },
          { id: "hidden", label: `Hidden (${items.filter((i) => !i.active).length})` },
          { id: "video", label: `Videos (${items.filter((i) => i.type === "video").length})` },
          { id: "image", label: `Images (${items.filter((i) => i.type === "image").length})` },
        ].map((flt) => (
          <button
            key={flt.id}
            type="button"
            onClick={() => setFilterActive(flt.id)}
            className={`dgs-saas-chip ${filterActive === flt.id ? "primary" : "neutral"}`}
            style={{ cursor: "pointer", fontSize: "0.75rem", padding: "4px 10px" }}
          >
            {flt.label}
          </button>
        ))}
      </div>

      {/* Modern SaaS Table */}
      <SaaSTable
        columns={columns}
        data={filteredItems}
        keyExtractor={(it) => it.sourceItemId}
        searchPlaceholder="Search portfolio title, asset ID, or alt text..."
      />

      {/* Slide-out Portfolio Editor Drawer */}
      {editingItem && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setEditingItem(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "600px",
              background: "#0c0c14",
              borderLeft: "1px solid rgba(255,255,255,0.12)",
              height: "100%",
              overflowY: "auto",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span className="dgs-saas-chip primary" style={{ marginBottom: "6px", display: "inline-block" }}>
                  EDIT PORTFOLIO ITEM
                </span>
                <h3 style={{ fontSize: "1.25rem", color: "#fff", margin: 0, fontWeight: 700 }}>
                  {editingItem.title || editingItem.sourceItemId}
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
                  Source ID: <code>{editingItem.sourceItemId}</code> · Type: {editingItem.type}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "none",
                  color: "#fff",
                  fontSize: "1.2rem",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  cursor: "pointer",
                }}
              >
                &times;
              </button>
            </div>

            {/* Media Preview Box */}
            <div
              style={{
                width: "100%",
                aspectRatio: "16/9",
                background: "#08080c",
                borderRadius: "var(--dgs-radius-sm)",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {editingItem.thumbnailUrl ? (
                <img
                  src={editingItem.thumbnailUrl}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                <span style={{ color: "var(--dgs-text-muted)", fontSize: "0.85rem" }}>
                  {editingItem.type === "video" ? "Video Asset" : "Image Asset"}
                </span>
              )}
            </div>

            {/* Editor Form */}
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--dgs-text-muted)", marginBottom: "6px" }}>
                  Title
                </label>
                <input
                  type="text"
                  value={titleVal}
                  onChange={(e) => setTitleVal(e.target.value)}
                  className="dgs-saas-input"
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#fff",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--dgs-text-muted)", marginBottom: "6px" }}>
                  Accessibility Alt Text
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={altVal}
                    onChange={(e) => setAltVal(e.target.value)}
                    className="dgs-saas-input"
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#fff",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      fontSize: "0.85rem",
                    }}
                  />
                  <button
                    type="button"
                    className="dgs-saas-btn secondary sm"
                    onClick={() => setMediaPickerOpen(true)}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Media Library...
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--dgs-text-muted)", marginBottom: "6px" }}>
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={orderVal}
                    onChange={(e) => setOrderVal(Number(e.target.value))}
                    className="dgs-saas-input"
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#fff",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--dgs-text-muted)", marginBottom: "6px" }}>
                    Visibility
                  </label>
                  <select
                    value={String(activeVal)}
                    onChange={(e) => setActiveVal(e.target.value === "true")}
                    className="dgs-saas-select"
                    style={{
                      width: "100%",
                      background: "#161622",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#fff",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      fontSize: "0.85rem",
                    }}
                  >
                    <option value="true">Visible</option>
                    <option value="false">Hidden</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  className="dgs-saas-btn secondary sm"
                  onClick={() => setEditingItem(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="dgs-saas-btn primary sm"
                  disabled={saving}
                >
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker modal when picking from Media Library */}
      <MediaPicker
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
