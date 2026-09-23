"use client";

import { useState, useEffect, useRef } from "react";
import PageHeader from "@/components/admin/PageHeader";
import { Plus } from "lucide-react";
import type { MediaAsset, MediaStats, MediaUsage } from "@/lib/cms/media";

interface MediaLibraryViewProps {
  initialAssets: MediaAsset[];
  initialTotal: number;
  initialStats: MediaStats | null;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function MediaLibraryView({
  initialAssets,
  initialTotal,
  initialStats,
}: MediaLibraryViewProps) {
  const [assets, setAssets] = useState<MediaAsset[]>(initialAssets);
  const [stats, setStats] = useState<MediaStats | null>(initialStats);
  const [total, setTotal] = useState<number>(initialTotal);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState<boolean>(false);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [formatFilter, setFormatFilter] = useState<string>("all");
  const [usageFilter, setUsageFilter] = useState<string>("all");
  const [altFilter, setAltFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortFilter, setSortFilter] = useState<string>("recent");
  const [page, setPage] = useState<number>(1);

  // Modals & Drawers
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null);
  const [replacingAsset, setReplacingAsset] = useState<MediaAsset | null>(null);
  const [viewingUsagesAsset, setViewingUsagesAsset] = useState<MediaAsset | null>(null);
  const [assetUsages, setAssetUsages] = useState<MediaUsage[]>([]);
  const [deleteCandidate, setDeleteCandidate] = useState<MediaAsset | null>(null);
  const [deleteError, setDeleteError] = useState<{ message: string; usages?: MediaUsage[] } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "24",
        type: typeFilter,
        format: formatFilter,
        usage: usageFilter,
        alt: altFilter,
        category: categoryFilter,
        sort: sortFilter,
        search,
      });

      const res = await fetch(`/api/admin/media?${params.toString()}`);
      const data = await res.json();
      if (data.ok) {
        setAssets(data.assets);
        setTotal(data.total);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [typeFilter, formatFilter, usageFilter, altFilter, categoryFilter, sortFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAssets();
  };

  const handleCopyUrl = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    showToast("Media URL copied to clipboard!");
  };

  const handleOpenUsages = async (asset: MediaAsset) => {
    setViewingUsagesAsset(asset);
    try {
      const res = await fetch(`/api/admin/media/${asset.id}/usage`);
      const data = await res.json();
      if (data.ok) {
        setAssetUsages(data.usages || []);
      }
    } catch {
      setAssetUsages([]);
    }
  };

  const handleDeleteClick = async (asset: MediaAsset) => {
    setDeleteCandidate(asset);
    setDeleteError(null);
    if ((asset.usage_count ?? 0) > 0) {
      try {
        const res = await fetch(`/api/admin/media/${asset.id}/usage`);
        const data = await res.json();
        setDeleteError({
          message: `Cannot permanently delete — this asset is currently used in ${asset.usage_count} location${(asset.usage_count ?? 0) > 1 ? "s" : ""}.`,
          usages: data.usages || [],
        });
      } catch {
        setDeleteError({
          message: `Cannot permanently delete — this asset is currently used in ${asset.usage_count} location(s).`,
        });
      }
    }
  };

  const confirmDelete = async (forcePermanent: boolean) => {
    if (!deleteCandidate) return;
    try {
      const res = await fetch(`/api/admin/media/${deleteCandidate.id}?permanent=${forcePermanent}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.ok) {
        showToast(forcePermanent ? "Asset permanently deleted." : "Asset moved to archive.");
        setDeleteCandidate(null);
        setDeleteError(null);
        fetchAssets();
      } else {
        setDeleteError({
          message: data.error || "Delete failed",
          usages: data.usages,
        });
      }
    } catch (err) {
      setDeleteError({ message: (err as Error).message });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {toastMessage && (
        <div className="dgs-media-toast" role="status">
          {toastMessage}
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Media Library & Digital Assets"
        subtitle="WebP-reconciled media assets, automated compression telemetry, and usage references."
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              className="dgs-saas-btn secondary sm"
              onClick={() => setShowImportModal(true)}
            >
              Import WordPress Media
            </button>
            <button
              type="button"
              className="dgs-saas-btn primary sm"
              onClick={() => setShowUploadModal(true)}
            >
              <Plus size={14} />
              <span>Upload Media</span>
            </button>
          </div>
        }
      />

      {stats && (
        <div className="dgs-saas-kpi-grid">
          <div className="dgs-saas-kpi-card">
            <div className="dgs-saas-kpi-title">Total Media Assets</div>
            <div className="dgs-saas-kpi-value">{stats.totalAssets}</div>
            <div className="dgs-saas-kpi-delta positive">{stats.totalImages} images · {stats.totalVideos} videos</div>
          </div>
          <div className="dgs-saas-kpi-card">
            <div className="dgs-saas-kpi-title">Optimised Storage</div>
            <div className="dgs-saas-kpi-value">{formatBytes(stats.totalCurrentBytes)}</div>
            <div className="dgs-saas-kpi-delta neutral">from {formatBytes(stats.totalOriginalBytes)}</div>
          </div>
          <div className="dgs-saas-kpi-card">
            <div className="dgs-saas-kpi-title">Storage Savings</div>
            <div className="dgs-saas-kpi-value">{stats.savingsPercentage}%</div>
            <div className="dgs-saas-kpi-delta positive">{formatBytes(stats.totalSavingsBytes)} saved</div>
          </div>
          <div className="dgs-saas-kpi-card">
            <div className="dgs-saas-kpi-title">Missing Alt Text</div>
            <div className="dgs-saas-kpi-value" style={{ color: stats.missingAltCount > 0 ? "var(--dgs-warning)" : "var(--dgs-success)" }}>
              {stats.missingAltCount}
            </div>
            <div className="dgs-saas-kpi-delta neutral">images needing accessibility alt</div>
          </div>
        </div>
      )}

      <section className="dgs-media-toolbar">
        <form onSubmit={handleSearchSubmit} className="dgs-media-search">
          <input
            type="search"
            placeholder="Search filename, title, alt text, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <div className="dgs-media-filters">
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
            <option value="all">All Media</option>
            <option value="image">Images Only</option>
            <option value="video">Videos Only</option>
          </select>

          <select value={formatFilter} onChange={(e) => { setFormatFilter(e.target.value); setPage(1); }}>
            <option value="all">All Formats</option>
            <option value="webp">WebP</option>
            <option value="webm">WebM</option>
            <option value="jpg">JPEG</option>
            <option value="png">PNG</option>
            <option value="mp4">MP4</option>
            <option value="gif">GIF</option>
          </select>

          <select value={usageFilter} onChange={(e) => { setUsageFilter(e.target.value); setPage(1); }}>
            <option value="all">All Usage</option>
            <option value="used">Used on Site</option>
            <option value="unused">Unused (0 references)</option>
          </select>

          <select value={altFilter} onChange={(e) => { setAltFilter(e.target.value); setPage(1); }}>
            <option value="all">Alt Text: All</option>
            <option value="missing">Missing Alt Text</option>
            <option value="has_alt">Has Alt Text</option>
            <option value="decorative">Decorative</option>
          </select>

          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
            <option value="all">All Categories</option>
            <option value="portfolio">Portfolio</option>
            <option value="blog">Blog</option>
            <option value="service">Service Page</option>
            <option value="general">General</option>
          </select>

          <select value={sortFilter} onChange={(e) => setSortFilter(e.target.value)}>
            <option value="recent">Recently Uploaded</option>
            <option value="oldest">Oldest First</option>
            <option value="largest">Largest File Size</option>
            <option value="savings">Highest Savings</option>
          </select>
        </div>

        <div className="dgs-media-actions">
          <div className="dgs-media-view-toggle">
            <button
              type="button"
              className={viewMode === "grid" ? "active" : ""}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              ⊞ Grid
            </button>
            <button
              type="button"
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
              title="List View"
            >
              ☰ List
            </button>
          </div>

          <button
            type="button"
            className="dgs-media-btn-primary"
            onClick={() => setShowUploadModal(true)}
          >
            + Upload Media
          </button>

          <button
            type="button"
            className="dgs-media-btn-secondary"
            onClick={() => setShowImportModal(true)}
          >
            Import WordPress Media
          </button>
        </div>
      </section>

      {loading ? (
        <div className="dgs-media-loading">Loading Media Library...</div>
      ) : assets.length === 0 ? (
        <div className="dgs-media-empty">
          <h3>No media assets found</h3>
          <p>Try adjusting your search query or filters, or upload new images/videos.</p>
          <button
            type="button"
            className="dgs-media-btn-primary"
            onClick={() => setShowUploadModal(true)}
          >
            Upload your first asset
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="dgs-media-grid">
          {assets.map((asset) => {
            const savings =
              asset.original_file_size > asset.file_size
                ? Math.round(((asset.original_file_size - asset.file_size) / asset.original_file_size) * 100)
                : 0;

            const isImage = asset.media_type === "image";
            const previewUrl =
              asset.poster_url ||
              (isImage
                ? `/cms-media/thumbnails/${encodeURIComponent(asset.filename.replace(/\.[^.]+$/, ".webp"))}`
                : "");

            const hasMissingAlt =
              isImage && (!asset.alt_text || !asset.alt_text.trim()) && !asset.is_decorative;

            return (
              <article className="dgs-media-card" key={asset.id}>
                <div className="dgs-media-card-preview">
                  {isImage ? (
                    <img
                      src={previewUrl || asset.public_url}
                      alt={asset.alt_text || asset.title || asset.filename}
                      loading="lazy"
                    />
                  ) : (
                    <div className="dgs-media-video-thumb">
                      {asset.poster_url ? (
                        <img src={asset.poster_url} alt={asset.title || asset.filename} />
                      ) : (
                        <div className="dgs-media-video-icon">▶</div>
                      )}
                      {asset.duration_seconds && (
                        <span className="dgs-media-video-duration">
                          {Math.floor(asset.duration_seconds / 60)}:
                          {String(Math.floor(asset.duration_seconds % 60)).padStart(2, "0")}
                        </span>
                      )}
                    </div>
                  )}

                  <span className="dgs-media-badge format">{asset.extension.toUpperCase()}</span>
                  {savings > 0 && <span className="dgs-media-badge savings">-{savings}%</span>}
                </div>

                <div className="dgs-media-card-info">
                  <h4 title={asset.original_filename || asset.filename}>
                    {asset.title || asset.filename}
                  </h4>
                  <p className="dgs-media-meta">
                    {asset.width && asset.height ? `${asset.width}×${asset.height} · ` : ""}
                    {formatBytes(asset.file_size)}
                  </p>

                  <div className="dgs-media-pill-row">
                    {hasMissingAlt ? (
                      <span className="dgs-media-status-pill warn">Missing Alt</span>
                    ) : asset.is_decorative ? (
                      <span className="dgs-media-status-pill neutral">Decorative</span>
                    ) : (
                      <span className="dgs-media-status-pill success">Alt Set</span>
                    )}

                    <span
                      className={`dgs-media-status-pill ${(asset.usage_count ?? 0) > 0 ? "active" : "muted"}`}
                      onClick={() => handleOpenUsages(asset)}
                      title="Click to view usage locations"
                    >
                      Used on {asset.usage_count ?? 0}
                    </span>
                  </div>
                </div>

                <div className="dgs-media-card-actions">
                  <button type="button" onClick={() => handleCopyUrl(asset.public_url)} title="Copy URL">
                    Copy URL
                  </button>
                  <button type="button" onClick={() => setEditingAsset(asset)} title="Edit Metadata">
                    Edit
                  </button>
                  <button type="button" onClick={() => setReplacingAsset(asset)} title="Replace Asset">
                    Replace
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => handleDeleteClick(asset)}
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="dgs-admin-table-wrap">
          <table className="dgs-admin-table dgs-media-table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Filename</th>
                <th>Type</th>
                <th>Format</th>
                <th>Dimensions</th>
                <th>Original</th>
                <th>Optimised</th>
                <th>Savings</th>
                <th>Alt Text</th>
                <th>Usages</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => {
                const savings =
                  asset.original_file_size > asset.file_size
                    ? Math.round(((asset.original_file_size - asset.file_size) / asset.original_file_size) * 100)
                    : 0;
                const hasMissingAlt =
                  asset.media_type === "image" &&
                  (!asset.alt_text || !asset.alt_text.trim()) &&
                  !asset.is_decorative;

                return (
                  <tr key={asset.id}>
                    <td>
                      <div className="dgs-media-table-thumb">
                        {asset.media_type === "image" ? (
                          <img src={asset.public_url} alt="" />
                        ) : asset.poster_url ? (
                          <img src={asset.poster_url} alt="" />
                        ) : (
                          <span className="dgs-media-video-icon small">▶</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <strong>{asset.title || asset.filename}</strong>
                      <div className="dgs-media-subtext">{asset.original_filename}</div>
                    </td>
                    <td>{asset.media_type}</td>
                    <td>
                      <span className="dgs-admin-state">{asset.extension.toUpperCase()}</span>
                    </td>
                    <td>
                      {asset.width && asset.height
                        ? `${asset.width}×${asset.height}`
                        : asset.duration_seconds
                        ? `${asset.duration_seconds}s`
                        : "—"}
                    </td>
                    <td>{formatBytes(asset.original_file_size)}</td>
                    <td>{formatBytes(asset.file_size)}</td>
                    <td>{savings > 0 ? `-${savings}%` : "—"}</td>
                    <td>
                      {hasMissingAlt ? (
                        <span className="dgs-media-status-pill warn">Missing</span>
                      ) : asset.is_decorative ? (
                        <span className="dgs-media-status-pill neutral">Decorative</span>
                      ) : (
                        <span className="dgs-media-status-pill success" title={asset.alt_text || ""}>
                          Valid
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="dgs-media-link-btn"
                        onClick={() => handleOpenUsages(asset)}
                      >
                        {asset.usage_count ?? 0} pages
                      </button>
                    </td>
                    <td>{asset.created_at ? new Date(asset.created_at).toLocaleDateString() : "—"}</td>
                    <td>
                      <div className="dgs-admin-inline-form">
                        <button type="button" onClick={() => handleCopyUrl(asset.public_url)}>
                          Copy
                        </button>
                        <button type="button" onClick={() => setEditingAsset(asset)}>
                          Edit
                        </button>
                        <button type="button" onClick={() => setReplacingAsset(asset)}>
                          Replace
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => handleDeleteClick(asset)}
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {total > 24 && (
        <div className="dgs-media-pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {Math.ceil(total / 24)} ({total} total assets)
          </span>
          <button disabled={page >= Math.ceil(total / 24)} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </div>
      )}

      {showUploadModal && (
        <BulkUploadModal
          onClose={() => {
            setShowUploadModal(false);
            fetchAssets();
          }}
          onSuccess={() => {
            showToast("Upload completed successfully!");
            fetchAssets();
          }}
        />
      )}

      {showImportModal && (
        <ImportMediaModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            showToast("Media imported successfully!");
            setShowImportModal(false);
            fetchAssets();
          }}
        />
      )}

      {editingAsset && (
        <EditMetadataModal
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
          onSaved={() => {
            showToast("Metadata updated.");
            setEditingAsset(null);
            fetchAssets();
          }}
        />
      )}

      {replacingAsset && (
        <ReplaceMediaModal
          asset={replacingAsset}
          onClose={() => setReplacingAsset(null)}
          onSuccess={() => {
            showToast("Media replaced successfully! Usages preserved.");
            setReplacingAsset(null);
            fetchAssets();
          }}
        />
      )}

      {viewingUsagesAsset && (
        <ViewUsagesModal
          asset={viewingUsagesAsset}
          usages={assetUsages}
          onClose={() => setViewingUsagesAsset(null)}
        />
      )}

      {deleteCandidate && (
        <SafeDeleteDialog
          asset={deleteCandidate}
          error={deleteError}
          onCancel={() => {
            setDeleteCandidate(null);
            setDeleteError(null);
          }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

function BulkUploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [fileProgress, setFileProgress] = useState<
    Record<string, { status: "pending" | "uploading" | "ready" | "failed" | "duplicate"; message?: string; savings?: number }>
  >({});
  const [category, setCategory] = useState("general");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const array = Array.from(files);
    setSelectedFiles((prev) => [...prev, ...array]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const startUpload = async () => {
    if (!selectedFiles.length) return;
    setUploading(true);

    for (const file of selectedFiles) {
      setFileProgress((prev) => ({
        ...prev,
        [file.name]: { status: "uploading" },
      }));

      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      try {
        const res = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (res.status === 409 && data.duplicates?.length) {
          setFileProgress((prev) => ({
            ...prev,
            [file.name]: { status: "duplicate", message: "File already exists in library" },
          }));
        } else if (data.ok && data.uploaded?.length) {
          const uploadedItem = data.uploaded[0];
          const savings =
            uploadedItem.original_file_size > uploadedItem.file_size
              ? Math.round(((uploadedItem.original_file_size - uploadedItem.file_size) / uploadedItem.original_file_size) * 100)
              : 0;
          setFileProgress((prev) => ({
            ...prev,
            [file.name]: { status: "ready", savings },
          }));
        } else {
          setFileProgress((prev) => ({
            ...prev,
            [file.name]: { status: "failed", message: data.errors?.[0]?.error || "Upload failed" },
          }));
        }
      } catch (err) {
        setFileProgress((prev) => ({
          ...prev,
          [file.name]: { status: "failed", message: (err as Error).message },
        }));
      }
    }

    setUploading(false);
    onSuccess();
  };

  return (
    <div className="dgs-media-modal-backdrop" onClick={onClose}>
      <div className="dgs-media-modal large" onClick={(e) => e.stopPropagation()}>
        <div className="dgs-media-modal-head">
          <h2>Bulk Media Upload</h2>
          <button type="button" className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="dgs-media-modal-body">
          <div
            className={`dgs-media-dropzone ${dragActive ? "active" : ""}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
              style={{ display: "none" }}
              onChange={(e) => handleFiles(e.target.files)}
            />
            <p className="drop-title">Drag & drop files here, or click to browse</p>
            <p className="drop-hint">
              Supports JPEG/PNG (converted to visually lossless WebP), MP4 (WebM converted), GIF, WebM.
              Up to 25MB for images, 250MB for video.
            </p>
          </div>

          <div className="dgs-media-upload-options">
            <label>
              Category for batch:
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="general">General</option>
                <option value="portfolio">Portfolio</option>
                <option value="blog">Blog</option>
                <option value="service">Service Page</option>
              </select>
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className="dgs-media-file-list">
              <h4>Selected Files ({selectedFiles.length})</h4>
              {selectedFiles.map((file) => {
                const prog = fileProgress[file.name];
                return (
                  <div className="dgs-media-upload-row" key={file.name}>
                    <span className="filename">{file.name}</span>
                    <span className="filesize">{formatBytes(file.size)}</span>
                    <span className={`status ${prog?.status || "pending"}`}>
                      {prog?.status === "uploading" && "Optimising…"}
                      {prog?.status === "ready" && `Ready (-${prog.savings}% size)`}
                      {prog?.status === "duplicate" && "Duplicate (Skipped)"}
                      {prog?.status === "failed" && `Error: ${prog.message}`}
                      {!prog && "Queued"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="dgs-media-modal-foot">
          <button type="button" className="dgs-media-btn-secondary" onClick={onClose} disabled={uploading}>
            Cancel
          </button>
          <button
            type="button"
            className="dgs-media-btn-primary"
            onClick={startUpload}
            disabled={uploading || selectedFiles.length === 0}
          >
            {uploading ? "Processing & Converting…" : `Start Upload (${selectedFiles.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}

function ImportMediaModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [altText, setAltText] = useState("");
  const [isDecorative, setIsDecorative] = useState(false);
  const [category, setCategory] = useState("general");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/media/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          title: title.trim() || undefined,
          altText: altText.trim() || undefined,
          isDecorative,
          category,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        onSuccess();
      } else {
        setError(data.error || "Import failed");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dgs-media-modal-backdrop" onClick={onClose}>
      <div className="dgs-media-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dgs-media-modal-head">
          <h2>Import Existing WordPress Media</h2>
          <button type="button" className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleImport}>
          <div className="dgs-media-modal-body">
            <p className="dgs-admin-help">
              Import an asset from an existing WordPress URL without altering existing page references.
              The importer will safely copy the file, generate an optimised WebP/WebM derivative, and assign a permanent native URL.
            </p>

            {error && <div className="dgs-media-alert danger">{error}</div>}

            <label className="dgs-media-label">
              WordPress Media URL:
              <input
                type="url"
                required
                placeholder="https://www.dgeniussolutions.com/wp-content/uploads/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </label>

            <label className="dgs-media-label">
              Asset Title (optional):
              <input
                type="text"
                placeholder="Descriptive title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>

            <label className="dgs-media-label">
              Alt Text:
              <input
                type="text"
                disabled={isDecorative}
                placeholder="Required for accessibility"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
              />
            </label>

            <label className="dgs-media-checkbox">
              <input
                type="checkbox"
                checked={isDecorative}
                onChange={(e) => setIsDecorative(e.target.checked)}
              />
              Mark as decorative image (alt=&quot;&quot;)
            </label>

            <label className="dgs-media-label">
              Category:
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="general">General</option>
                <option value="portfolio">Portfolio</option>
                <option value="blog">Blog</option>
                <option value="service">Service Page</option>
              </select>
            </label>
          </div>

          <div className="dgs-media-modal-foot">
            <button type="button" className="dgs-media-btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="dgs-media-btn-primary" disabled={loading || !url.trim()}>
              {loading ? "Importing & Optimising…" : "Import Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditMetadataModal({
  asset,
  onClose,
  onSaved,
}: {
  asset: MediaAsset;
  onClose: () => void;
  onSaved: (asset: MediaAsset) => void;
}) {
  const [altText, setAltText] = useState(asset.alt_text || "");
  const [isDecorative, setIsDecorative] = useState(Boolean(asset.is_decorative));
  const [title, setTitle] = useState(asset.title || "");
  const [caption, setCaption] = useState(asset.caption || "");
  const [description, setDescription] = useState(asset.description || "");
  const [category, setCategory] = useState<any>(asset.category || "general");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/media/${asset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          altText: isDecorative ? "" : altText.trim(),
          isDecorative,
          title: title.trim(),
          caption: caption.trim(),
          description: description.trim(),
          category,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        onSaved(data.asset);
      } else {
        setError(data.error || "Failed to save metadata");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleSuggestAlt = () => {
    if (title.trim()) {
      setAltText(`${title.trim()} for D'Genius Solutions`);
    } else {
      const cleanStem = asset.original_filename
        .replace(/\.[^.]+$/, "")
        .replace(/[-_]+/g, " ")
        .replace(/\b(image|img|pic|photo|\d+)\b/gi, "")
        .trim();
      setAltText(cleanStem ? `${cleanStem} visual` : "Creative asset");
    }
  };

  return (
    <div className="dgs-media-modal-backdrop" onClick={onClose}>
      <div className="dgs-media-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dgs-media-modal-head">
          <h2>Edit Asset Metadata</h2>
          <button type="button" className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSave}>
          <div className="dgs-media-modal-body">
            {error && <div className="dgs-media-alert danger">{error}</div>}

            <div className="dgs-media-meta-summary">
              <span className="item"><strong>File:</strong> {asset.filename}</span>
              <span className="item"><strong>Type:</strong> {asset.media_type} ({asset.extension})</span>
              <span className="item"><strong>Size:</strong> {formatBytes(asset.file_size)}</span>
              {asset.width && asset.height && (
                <span className="item"><strong>Dimensions:</strong> {asset.width}×{asset.height}</span>
              )}
            </div>

            {asset.media_type === "image" && (
              <div className="dgs-media-field-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="dgs-media-label">Alt Text (Accessibility & SEO):</label>
                  <button
                    type="button"
                    className="dgs-media-btn-text"
                    onClick={handleSuggestAlt}
                    disabled={isDecorative}
                  >
                    ✨ Suggest Alt Text
                  </button>
                </div>
                <input
                  type="text"
                  disabled={isDecorative}
                  placeholder="Describe the image content..."
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                />
                <label className="dgs-media-checkbox">
                  <input
                    type="checkbox"
                    checked={isDecorative}
                    onChange={(e) => setIsDecorative(e.target.checked)}
                  />
                  Mark as decorative image (alt=&quot;&quot;)
                </label>
              </div>
            )}

            <label className="dgs-media-label">
              Title:
              <input
                type="text"
                placeholder="Asset title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>

            <label className="dgs-media-label">
              Caption:
              <input
                type="text"
                placeholder="Caption for display"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </label>

            <label className="dgs-media-label">
              Description / Internal Notes:
              <textarea
                rows={3}
                placeholder="Internal context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>

            <label className="dgs-media-label">
              Category:
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="general">General</option>
                <option value="portfolio">Portfolio</option>
                <option value="blog">Blog</option>
                <option value="service">Service Page</option>
              </select>
            </label>
          </div>

          <div className="dgs-media-modal-foot">
            <button type="button" className="dgs-media-btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="dgs-media-btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Metadata"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReplaceMediaModal({
  asset,
  onClose,
  onSuccess,
}: {
  asset: MediaAsset;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [replacing, setReplacing] = useState(false);
  const [error, setError] = useState("");

  const handleReplace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setReplacing(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/admin/media/${asset.id}/replace`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.ok) {
        onSuccess();
      } else {
        setError(data.error || "Replacement failed");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setReplacing(false);
    }
  };

  return (
    <div className="dgs-media-modal-backdrop" onClick={onClose}>
      <div className="dgs-media-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dgs-media-modal-head">
          <h2>Replace Media Asset</h2>
          <button type="button" className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleReplace}>
          <div className="dgs-media-modal-body">
            <div className="dgs-media-alert info">
              <strong>Non-destructive Replacement:</strong> Replacing this asset will update the underlying file and regenerate derivatives with cache-busting. All existing page references and usage placements will be preserved without breaking.
            </div>

            {error && <div className="dgs-media-alert danger">{error}</div>}

            <div className="dgs-media-replace-current">
              <h4>Current Asset:</h4>
              <p><strong>Filename:</strong> {asset.filename}</p>
              <p><strong>Dimensions:</strong> {asset.width && asset.height ? `${asset.width}×${asset.height}` : "—"}</p>
              <p><strong>Size:</strong> {formatBytes(asset.file_size)}</p>
            </div>

            <label className="dgs-media-label">
              Select Replacement File:
              <input
                type="file"
                required
                accept={asset.media_type === "image" ? "image/jpeg,image/png,image/webp,image/gif" : "video/mp4,video/webm"}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          <div className="dgs-media-modal-foot">
            <button type="button" className="dgs-media-btn-secondary" onClick={onClose} disabled={replacing}>
              Cancel
            </button>
            <button type="submit" className="dgs-media-btn-primary" disabled={replacing || !file}>
              {replacing ? "Processing Replacement…" : "Confirm Replacement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewUsagesModal({
  asset,
  usages,
  onClose,
}: {
  asset: MediaAsset;
  usages: MediaUsage[];
  onClose: () => void;
}) {
  return (
    <div className="dgs-media-modal-backdrop" onClick={onClose}>
      <div className="dgs-media-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dgs-media-modal-head">
          <h2>Usage Locations</h2>
          <button type="button" className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="dgs-media-modal-body">
          <p>
            <strong>{asset.title || asset.filename}</strong> is currently referenced in{" "}
            <strong>{usages.length}</strong> location{usages.length === 1 ? "" : "s"}:
          </p>

          {usages.length === 0 ? (
            <p className="dgs-admin-help">This asset is not currently tracked on any public page.</p>
          ) : (
            <div className="dgs-media-usage-list">
              {usages.map((u) => (
                <div className="dgs-media-usage-row" key={u.id}>
                  <div>
                    <a href={u.route} target="_blank" rel="noreferrer" className="route-link">
                      {u.route} ↗
                    </a>
                    <div className="subtext">
                      Entity: {u.entity_type} · Field: {u.field}
                    </div>
                  </div>
                  <span className="dgs-admin-state live">Active</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dgs-media-modal-foot">
          <button type="button" className="dgs-media-btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function SafeDeleteDialog({
  asset,
  error,
  onCancel,
  onConfirm,
}: {
  asset: MediaAsset;
  error: { message: string; usages?: MediaUsage[] } | null;
  onCancel: () => void;
  onConfirm: (permanent: boolean) => void;
}) {
  const isUsed = (asset.usage_count ?? 0) > 0 || Boolean(error?.usages?.length);

  return (
    <div className="dgs-media-modal-backdrop" onClick={onCancel}>
      <div className="dgs-media-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dgs-media-modal-head">
          <h2 style={{ color: "#ff4d4f" }}>Delete Asset Protection</h2>
          <button type="button" className="close-btn" onClick={onCancel}>×</button>
        </div>

        <div className="dgs-media-modal-body">
          {isUsed ? (
            <div>
              <div className="dgs-media-alert danger">
                <strong>Cannot Delete Active Asset:</strong>
                <p>{error?.message || `This media asset is currently in use across ${asset.usage_count} page(s).`}</p>
              </div>

              {error?.usages && error.usages.length > 0 && (
                <div className="dgs-media-usage-list" style={{ marginTop: 14 }}>
                  <h4>Active Placements:</h4>
                  {error.usages.map((u) => (
                    <div className="dgs-media-usage-row" key={u.id}>
                      <a href={u.route} target="_blank" rel="noreferrer" className="route-link">
                        {u.route} ↗
                      </a>
                      <span className="subtext">{u.entity_type}</span>
                    </div>
                  ))}
                </div>
              )}

              <p className="dgs-admin-help" style={{ marginTop: 16 }}>
                To safely delete this asset, first remove or replace its usages on the pages listed above.
              </p>
            </div>
          ) : (
            <div>
              <p>
                Are you sure you want to delete <strong>{asset.title || asset.filename}</strong>?
              </p>
              <p className="dgs-admin-help">
                This asset has 0 active references. You can move it to the archive or permanently remove it.
              </p>
            </div>
          )}
        </div>

        <div className="dgs-media-modal-foot">
          <button type="button" className="dgs-media-btn-secondary" onClick={onCancel}>
            {isUsed ? "Back" : "Cancel"}
          </button>
          {!isUsed && (
            <>
              <button
                type="button"
                className="dgs-media-btn-secondary"
                onClick={() => onConfirm(false)}
              >
                Archive (Soft Delete)
              </button>
              <button
                type="button"
                className="dgs-media-btn-danger"
                onClick={() => onConfirm(true)}
              >
                Permanent Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
