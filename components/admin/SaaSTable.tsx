"use client";

import React, { useState, useMemo } from "react";

export type Column<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: string;
};

export type SaaSTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  actions?: (item: T) => React.ReactNode;
  bulkActions?: (selectedIds: string[]) => React.ReactNode;
  initialPageSize?: number;
  emptyMessage?: string;
};

export default function SaaSTable<T>({
  columns,
  data,
  keyExtractor,
  searchPlaceholder = "Search records...",
  searchFilter,
  actions,
  bulkActions,
  initialPageSize = 10,
  emptyMessage = "No records found.",
}: SaaSTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Search filtering
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    if (searchFilter) {
      return data.filter((item) => searchFilter(item, search.toLowerCase()));
    }
    // Default search on all string fields
    return data.filter((item) =>
      Object.values(item as any).some((val) =>
        String(val || "").toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search, searchFilter]);

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
    <div className="dgs-saas-card">
      {/* Table Controls Header */}
      <div className="dgs-saas-table-toolbar">
        <div className="dgs-saas-table-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="dgs-saas-table-search-input"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {bulkActions && selected.size > 0 && (
          <div className="dgs-saas-bulk-actions">
            <span>{selected.size} selected</span>
            {bulkActions(Array.from(selected))}
          </div>
        )}
      </div>

      {/* Responsive Table Wrapper */}
      <div className="dgs-saas-table-responsive">
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
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={col.sortable ? "sortable" : undefined}
                >
                  <div className="dgs-saas-th-content">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="dgs-saas-sort-indicator">
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
                <td colSpan={columns.length + (bulkActions ? 1 : 0) + (actions ? 1 : 0)} className="dgs-saas-table-empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => {
                const id = keyExtractor(item);
                const isChecked = selected.has(id);
                return (
                  <tr key={id} className={isChecked ? "selected" : undefined}>
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
      <div className="dgs-saas-table-pagination">
        <div className="dgs-saas-pagination-info">
          Showing {sortedData.length === 0 ? 0 : (page - 1) * pageSize + 1} to{" "}
          {Math.min(page * pageSize, sortedData.length)} of {sortedData.length} entries
        </div>

        <div className="dgs-saas-pagination-controls">
          <label className="dgs-saas-pagesize-label">
            Rows:
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="dgs-saas-pagesize-select"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>

          <button
            type="button"
            className="dgs-saas-pagination-btn"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span className="dgs-saas-pagination-page">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            className="dgs-saas-pagination-btn"
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
