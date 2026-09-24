"use client";

import React, { useState, useMemo } from "react";

export type Column<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: string;
};

export type TableTab = {
  id: string;
  label: string;
  count?: number;
};

export type SaaSTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  tabs?: TableTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  actions?: (item: T) => React.ReactNode;
  bulkActions?: (selectedIds: string[]) => React.ReactNode;
  toolbarExtra?: React.ReactNode;
  initialPageSize?: number;
  emptyMessage?: string;
};

export default function SaaSTable<T>({
  columns,
  data = [],
  keyExtractor,
  searchPlaceholder = "Search records...",
  searchFilter,
  tabs,
  activeTab,
  onTabChange,
  actions,
  bulkActions,
  toolbarExtra,
  initialPageSize = 10,
  emptyMessage = "No records found.",
}: SaaSTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const safeData = data || [];

  // Search filtering
  const filteredData = useMemo(() => {
    if (!search.trim()) return safeData;
    if (searchFilter) {
      return safeData.filter((item) => searchFilter(item, search.toLowerCase()));
    }
    // Default search on all string fields
    return safeData.filter((item) =>
      Object.values(item as any).some((val) =>
        String(val || "").toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [safeData, search, searchFilter]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a: any, b: any) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;
      const res = valA < valB ? -1 : 1;
      return sortOrder === "asc" ? res : -res;
    });
  }, [filteredData, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === "asc") setSortOrder("desc");
      else {
        setSortKey(null);
        setSortOrder("asc");
      }
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(paginatedData.map(keyExtractor)));
    } else {
      setSelected(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(id);
    else next.delete(id);
    setSelected(next);
  };

  return (
    <div className="dgs-table-container">
      {/* Optional Status Tabs Strip */}
      {tabs && tabs.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 14px 0", borderBottom: "1px solid var(--dgs-border)", backgroundColor: "var(--dgs-bg-surface-secondary)", overflowX: "auto" }}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange?.(tab.id)}
                style={{
                  padding: "8px 12px",
                  fontSize: "13px",
                  fontWeight: isActive ? 600 : 450,
                  color: isActive ? "var(--dgs-text-primary)" : "var(--dgs-text-muted)",
                  background: isActive ? "var(--dgs-bg-surface)" : "none",
                  border: "1px solid",
                  borderColor: isActive ? "var(--dgs-border)" : "transparent",
                  borderBottomColor: isActive ? "var(--dgs-bg-surface)" : "transparent",
                  borderRadius: "6px 6px 0 0",
                  marginBottom: "-1px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all var(--dgs-transition-fast)",
                  whiteSpace: "nowrap",
                }}
              >
                <span>{tab.label}</span>
                {typeof tab.count === "number" && (
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "1px 6px",
                      borderRadius: "9999px",
                      backgroundColor: isActive ? "var(--dgs-bg-surface-secondary)" : "rgba(0,0,0,0.04)",
                      color: isActive ? "var(--dgs-brand-blue)" : "var(--dgs-text-dim)",
                      fontWeight: 600,
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Table Controls Toolbar */}
      <div className="dgs-table-toolbar">
        <div className="dgs-table-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {toolbarExtra}

          {bulkActions && selected.size > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--dgs-text-muted)" }}>
              <span>{selected.size} selected</span>
              {bulkActions(Array.from(selected))}
            </div>
          )}
        </div>
      </div>

      {/* Responsive Table View */}
      <div className="dgs-table-responsive">
        <table className="dgs-saas-table">
          <thead>
            <tr>
              {bulkActions && (
                <th style={{ width: "40px" }}>
                  <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && paginatedData.every((item) => selected.has(keyExtractor(item)))}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  style={{
                    width: col.width,
                    cursor: col.sortable ? "pointer" : "default",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span style={{ fontSize: "10px", color: "var(--dgs-text-dim)" }}>
                        {sortKey === col.key ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th style={{ width: "100px", textAlign: "right" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (bulkActions ? 1 : 0) + (actions ? 1 : 0)} style={{ textAlign: "center", padding: "36px 16px", color: "var(--dgs-text-muted)" }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => {
                const id = keyExtractor(item);
                const isChecked = selected.has(id);
                return (
                  <tr key={id} style={{ backgroundColor: isChecked ? "var(--dgs-bg-surface-active)" : undefined }}>
                    {bulkActions && (
                      <td>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectRow(id, e.target.checked)}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key}>
                        {col.render ? col.render(item) : String((item as any)[col.key] ?? "")}
                      </td>
                    ))}
                    {actions && <td style={{ textAlign: "right" }}>{actions(item)}</td>}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid var(--dgs-border)", fontSize: "12px", color: "var(--dgs-text-muted)", flexWrap: "wrap", gap: "10px" }}>
        <div>
          Showing {sortedData.length === 0 ? 0 : (page - 1) * pageSize + 1} to{" "}
          {Math.min(page * pageSize, sortedData.length)} of {sortedData.length} entries
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="dgs-select"
              style={{ height: "28px", padding: "0 8px", fontSize: "12px" }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={10000}>All</option>
            </select>
          </label>

          <button
            type="button"
            className="dgs-saas-btn secondary sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span style={{ fontWeight: 550, color: "var(--dgs-text-primary)" }}>
            {page} / {totalPages}
          </span>
          <button
            type="button"
            className="dgs-saas-btn secondary sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
