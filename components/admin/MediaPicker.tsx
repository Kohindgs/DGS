"use client";

import { useState, useEffect, useRef } from "react";
import type { MediaAsset } from "@/lib/cms/media";

export interface SelectedMedia {
  id: string;
  public_url: string;
  alt_text?: string;
  title?: string;
  width?: number;
  height?: number;
  media_type?: string;
}

export interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: SelectedMedia) => void;
  mediaType?: "all" | "image" | "video";
  title?: string;
}

export default function MediaPicker({
  isOpen,
  onClose,
  onSelect,
  mediaType = "image",
  title = "Select Media",
}: MediaPickerProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  // Upload tab state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "30",
        type: mediaType === "all" ? "all" : mediaType,
        search,
      });
      const res = await fetch(`/api/admin/media?${params.toString()}`);
      const data = await res.json();
      if (data.ok) {
        setAssets(data.assets || []);
      }
    } catch (err) {
      console.error("Failed to load picker assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === "library") {
      fetchAssets();
    }
  }, [isOpen, activeTab, mediaType]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAssets();
  };

  const handleConfirmSelect = () => {
    if (!selectedAsset) return;
    onSelect({
      id: selectedAsset.id,
      public_url: selectedAsset.public_url,
      alt_text: selectedAsset.alt_text || undefined,
      title: selectedAsset.title || selectedAsset.filename,
      width: selectedAsset.width || undefined,
      height: selectedAsset.height || undefined,
      media_type: selectedAsset.media_type,
    });
    onClose();
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "portfolio");

    try {
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.ok && data.uploaded?.length) {
        const item = data.uploaded[0];
        onSelect({
          id: item.id,
          public_url: item.public_url,
          alt_text: item.alt_text || undefined,
          title: item.title || item.filename,
          width: item.width || undefined,
          height: item.height || undefined,
          media_type: item.media_type,
        });
        onClose();
      } else if (data.duplicates?.length) {
        const item = data.duplicates[0].existingAsset;
        onSelect({
          id: item.id,
          public_url: item.public_url,
          alt_text: item.alt_text || undefined,
          title: item.title || item.filename,
          width: item.width || undefined,
          height: item.height || undefined,
          media_type: item.media_type,
        });
        onClose();
      } else {
        setUploadError(data.errors?.[0]?.error || "Upload failed");
      }
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dgs-media-modal-backdrop" onClick={onClose}>
      <div className="dgs-media-modal large" onClick={(e) => e.stopPropagation()}>
        <div className="dgs-media-modal-head">
          <h2>{title}</h2>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div className="dgs-media-view-toggle">
              <button
                type="button"
                className={activeTab === "library" ? "active" : ""}
                onClick={() => setActiveTab("library")}
              >
                Media Library
              </button>
              <button
                type="button"
                className={activeTab === "upload" ? "active" : ""}
                onClick={() => setActiveTab("upload")}
              >
                Upload New
              </button>
            </div>
            <button type="button" className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="dgs-media-modal-body" style={{ minHeight: 380 }}>
          {activeTab === "library" ? (
            <>
              <form onSubmit={handleSearchSubmit} className="dgs-media-search" style={{ marginBottom: 12 }}>
                <input
                  type="search"
                  placeholder="Search media library..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit">Search</button>
              </form>

              {loading ? (
                <div className="dgs-media-loading">Loading library assets…</div>
              ) : assets.length === 0 ? (
                <div className="dgs-media-empty">
                  <p>No media found. Switch to the &quot;Upload New&quot; tab to add an asset.</p>
                </div>
              ) : (
                <div className="dgs-media-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                  {assets.map((asset) => {
                    const isSelected = selectedAsset?.id === asset.id;
                    const isImage = asset.media_type === "image";

                    return (
                      <div
                        key={asset.id}
                        className={`dgs-media-card ${isSelected ? "selected" : ""}`}
                        style={{
                          cursor: "pointer",
                          border: isSelected ? "2px solid #a900ff" : "1px solid rgba(255,255,255,.08)",
                          boxShadow: isSelected ? "0 0 16px rgba(169,0,255,.5)" : "none",
                        }}
                        onClick={() => setSelectedAsset(asset)}
                      >
                        <div className="dgs-media-card-preview" style={{ aspectRatio: "1/1" }}>
                          {isImage ? (
                            <img src={asset.public_url} alt="" loading="lazy" />
                          ) : (
                            <div className="dgs-media-video-thumb">
                              {asset.poster_url ? <img src={asset.poster_url} alt="" /> : <span className="dgs-media-video-icon small">▶</span>}
                            </div>
                          )}
                          <span className="dgs-media-badge format">{asset.extension.toUpperCase()}</span>
                        </div>
                        <div style={{ padding: 8, fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {asset.title || asset.filename}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {uploadError && <div className="dgs-media-alert danger">{uploadError}</div>}

              <div
                className="dgs-media-dropzone"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                  }}
                />
                <p className="drop-title">
                  {uploading ? "Processing & Converting to WebP…" : "Click to select a file to upload"}
                </p>
                <p className="drop-hint">
                  The file will be automatically optimised, converted to WebP/WebM, and selected immediately.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="dgs-media-modal-foot">
          <button type="button" className="dgs-media-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          {activeTab === "library" && (
            <button
              type="button"
              className="dgs-media-btn-primary"
              disabled={!selectedAsset}
              onClick={handleConfirmSelect}
            >
              Select Asset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
