"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import MediaPicker, { type SelectedMedia } from "@/components/admin/MediaPicker";
import type {
  CmsBlogSummary,
  CmsBlogDetail,
  BlogFilterView,
  BlogViewCounts,
  CreateCmsBlogInput,
  UpdateCmsBlogInput,
} from "@/lib/cms/blogs";
import { imageMatchesSlug } from "@/lib/cms/blog-import";

interface BlogsManagerViewProps {
  initialData: {
    blogs: CmsBlogSummary[];
    total: number;
    page: number;
    limit: number;
    counts: BlogViewCounts;
  };
}

export function BlogsManagerView({ initialData }: BlogsManagerViewProps) {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<"list" | "import" | "new" | "edit">("list");
  const [filterView, setFilterView] = useState<BlogFilterView>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(initialData.page || 1);
  const [blogs, setBlogs] = useState<CmsBlogSummary[]>(initialData.blogs || []);
  const [total, setTotal] = useState(initialData.total || 0);
  const [counts, setCounts] = useState<BlogViewCounts>(
    initialData.counts || {
      all: 0,
      drafts: 0,
      scheduled: 0,
      published: 0,
      needs_review: 0,
      seo_issues: 0,
      missing_images: 0,
    }
  );
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  // Edit & Detail state
  const [editingBlog, setEditingBlog] = useState<CmsBlogDetail | null>(null);
  const [editQa, setEditQa] = useState<{ ok: boolean; errors: string[]; warnings: string[]; cannibalization?: any } | null>(null);
  const [editTab, setEditTab] = useState<"content" | "seo" | "aeo" | "geo" | "schema" | "links" | "revisions">("content");
  const [saving, setSaving] = useState(false);

  // Revisions & Rollback state
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<any | null>(null);
  const [restoringRevisionId, setRestoringRevisionId] = useState<string | null>(null);
  const [revisionViewMode, setRevisionViewMode] = useState<"preview" | "compare">("compare");

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<CmsBlogSummary | null>(null);

  // Media Picker state
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"featured" | "inline">("featured");

  // Bulk Import state
  const [importDocs, setImportDocs] = useState<File[]>([]);
  const [importImages, setImportImages] = useState<File[]>([]);
  const [importBusy, setImportBusy] = useState(false);
  const [importResults, setImportResults] = useState<Array<Record<string, unknown>>>([]);
  const [importFailures, setImportFailures] = useState<Array<{ filename: string; message: string }>>([]);
  const docxInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // New Blog form state
  const [newBlogForm, setNewBlogForm] = useState<CreateCmsBlogInput>({
    title: "",
    slug: "",
    excerpt: "",
    featured_image_url: "",
    seo_title: "",
    seo_description: "",
    focus_keyword: "",
  });

  // Fetch blogs when filter, search, or page changes
  const fetchBlogs = async (targetView = filterView, targetSearch = search, targetPage = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        view: targetView,
        search: targetSearch,
        page: String(targetPage),
        limit: "20",
      });
      const res = await fetch(`/api/admin/blogs?${params.toString()}`);
      const data = await res.json();
      if (data.ok) {
        setBlogs(data.blogs);
        setTotal(data.total);
        setCounts(data.counts);
      }
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
      setNotice({ type: "error", message: "Failed to load blogs" });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (view: BlogFilterView) => {
    setFilterView(view);
    setPage(1);
    setActiveTab("list");
    fetchBlogs(view, search, 1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBlogs(filterView, search, 1);
  };

  // Open Edit Mode
  const startEditing = async (blogId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blogs/${blogId}`);
      const data = await res.json();
      if (data.ok && data.blog) {
        setEditingBlog(data.blog);
        setEditQa(data.qa || null);
        setActiveTab("edit");
        setEditTab("content");
        fetchRevisions(blogId);
      } else {
        setNotice({ type: "error", message: data.message || "Failed to load blog" });
      }
    } catch (err) {
      console.error("Failed to load blog detail:", err);
      setNotice({ type: "error", message: "Failed to load blog detail" });
    } finally {
      setLoading(false);
    }
  };

  const fetchRevisions = async (blogId: string) => {
    setLoadingRevisions(true);
    try {
      const res = await fetch(`/api/admin/blogs/${blogId}/revisions`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.revisions)) {
        setRevisions(data.revisions);
        if (data.revisions.length > 0) {
          setSelectedRevision(data.revisions[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch blog revisions:", err);
    } finally {
      setLoadingRevisions(false);
    }
  };

  const handleRestoreRevision = async (blogId: string, revisionId: string) => {
    if (!window.confirm("Restore this revision? The current blog content will be backed up into a new revision first, and the blog will be placed into Review status for verification.")) {
      return;
    }
    setRestoringRevisionId(revisionId);
    try {
      const res = await fetch(`/api/admin/blogs/${blogId}/revisions/${revisionId}/restore`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.ok && data.blog) {
        setEditingBlog(data.blog);
        setNotice({ type: "success", message: data.message || "Revision restored successfully!" });
        await fetchRevisions(blogId);
        const checkRes = await fetch(`/api/admin/blogs/${blogId}`);
        const checkData = await checkRes.json();
        if (checkData.ok) {
          setEditQa(checkData.qa || null);
        }
      } else {
        setNotice({ type: "error", message: data.message || "Failed to restore revision" });
      }
    } catch (err) {
      console.error("Failed to restore revision:", err);
      setNotice({ type: "error", message: "Failed to restore revision" });
    } finally {
      setRestoringRevisionId(null);
    }
  };

  // Save changes to editing blog
  const handleSaveEdit = async (publishImmediate = false, scheduleTime?: string) => {
    if (!editingBlog) return;
    setSaving(true);
    setNotice(null);

    const payload: UpdateCmsBlogInput = {
      title: editingBlog.title,
      slug: editingBlog.slug,
      excerpt: editingBlog.excerpt || "",
      bodyHtml: editingBlog.content?.bodyHtml || "",
      featured_image_url: editingBlog.featured_image_url || null,
      needs_review: editingBlog.needs_review,
      optimization: editingBlog.content?.optimization,
    };

    if (scheduleTime) {
      payload.status = "scheduled";
      payload.scheduled_for = scheduleTime;
    } else if (publishImmediate) {
      payload.status = "published";
    }

    try {
      const res = await fetch(`/api/admin/blogs/${editingBlog.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setNotice({ type: "error", message: data.message || "Save failed" });
        setSaving(false);
        return;
      }

      setEditingBlog(data.blog);
      setEditQa(data.qa || null);

      if (publishImmediate) {
        // Trigger publish endpoint
        const pubRes = await fetch(`/api/admin/blogs/${editingBlog.id}/publish`, {
          method: "POST",
        });
        const pubData = await pubRes.json();
        if (pubRes.ok && pubData.ok) {
          setEditingBlog(pubData.blog);
          setNotice({ type: "success", message: `Published live at /blogs/${pubData.blog.slug}/` });
        } else {
          setNotice({ type: "error", message: pubData.message || "Publish QA failed" });
        }
      } else if (scheduleTime) {
        setNotice({
          type: "success",
          message: `Scheduled for publication at ${new Date(scheduleTime).toLocaleString()}`,
        });
      } else {
        setNotice({ type: "success", message: "Changes saved successfully" });
      }

      fetchBlogs();
    } catch (err) {
      console.error("Failed to save blog:", err);
      setNotice({ type: "error", message: "Failed to save blog" });
    } finally {
      setSaving(false);
    }
  };

  // Delete draft blog
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/blogs/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setNotice({ type: "success", message: "Draft deleted" });
        setDeleteTarget(null);
        fetchBlogs();
      } else {
        setNotice({ type: "error", message: data.message || "Delete failed" });
      }
    } catch (err) {
      console.error("Failed to delete draft:", err);
      setNotice({ type: "error", message: "Delete failed" });
    }
  };

  // Quick publish from list
  const handleQuickPublish = async (blog: CmsBlogSummary) => {
    if (blog.needs_review) {
      const confirmReview = window.confirm(
        `"${blog.title}" has unreviewed AI-generated SEO changes.\n\nAre you sure you have reviewed and approved all headings, content, and schema?`
      );
      if (!confirmReview) return;
    }

    try {
      const res = await fetch(`/api/admin/blogs/${blog.id}/publish`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.ok) {
        setNotice({ type: "success", message: `Published live at /blogs/${blog.slug}/` });
        fetchBlogs();
      } else {
        setNotice({ type: "error", message: data.message || "Publish QA failed" });
      }
    } catch (err) {
      console.error("Quick publish failed:", err);
      setNotice({ type: "error", message: "Publish failed" });
    }
  };

  // Handle media selection from MediaPicker
  const handleMediaSelected = (media: SelectedMedia) => {
    setShowMediaPicker(false);
    if (!editingBlog) return;

    if (mediaPickerTarget === "featured") {
      setEditingBlog({
        ...editingBlog,
        featured_image_url: media.public_url,
      });
      setNotice({ type: "info", message: "Featured image selected from Media CMS" });
    } else if (mediaPickerTarget === "inline") {
      const imgHtml = `\n<figure class="dgs-blog-inline-image"><img src="${media.public_url}" alt="${(media.alt_text || editingBlog.title).replace(/"/g, "&quot;")}" width="${media.width || 1200}" height="${media.height || 675}" loading="lazy" decoding="async" /></figure>\n`;
      setEditingBlog({
        ...editingBlog,
        content: {
          ...editingBlog.content,
          bodyHtml: (editingBlog.content?.bodyHtml || "") + imgHtml,
        },
      });
      setNotice({ type: "info", message: "Inline image inserted from Media CMS" });
    }
  };

  // Bulk Import Handlers
  const handleDocxDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.name.toLowerCase().endsWith(".docx"));
    setImportDocs((prev) => [...prev, ...files]);
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      /\.(jpe?g|png|webp|gif)$/i.test(f.name)
    );
    setImportImages((prev) => [...prev, ...files]);
  };

  const handleBulkImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importDocs.length) {
      setNotice({ type: "error", message: "Please select at least one Word (.docx) file" });
      return;
    }

    setImportBusy(true);
    setNotice({ type: "info", message: "Uploading Word documents and processing images via Media CMS..." });
    setImportResults([]);
    setImportFailures([]);

    const formData = new FormData();
    for (const doc of importDocs) formData.append("documents", doc);
    for (const img of importImages) formData.append("images", img);

    try {
      const res = await fetch("/api/admin/blogs/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setImportBusy(false);

      const imported = Array.isArray(data.results) ? data.results : [];
      const failed = Array.isArray(data.failed) ? data.failed : [];
      setImportResults(imported);
      setImportFailures(failed);

      if (imported.length > 0) {
        setNotice({
          type: "success",
          message: `${imported.length} blog draft${imported.length === 1 ? "" : "s"} created. Human review is required before publishing.`,
        });
        setImportDocs([]);
        setImportImages([]);
        fetchBlogs();
      } else {
        setNotice({ type: "error", message: data.message || "Import failed" });
      }
    } catch (err) {
      console.error("Bulk import failed:", err);
      setNotice({ type: "error", message: "Bulk import failed" });
      setImportBusy(false);
    }
  };

  // Helper for status badge
  const renderStatusBadge = (status: string, needsReview: boolean) => {
    switch (status) {
      case "published":
        return <span className="dgs-badge dgs-badge-green">Published</span>;
      case "scheduled":
        return <span className="dgs-badge dgs-badge-blue">Scheduled</span>;
      case "review":
        return <span className="dgs-badge dgs-badge-amber">Needs Review</span>;
      case "draft":
      default:
        return needsReview ? (
          <span className="dgs-badge dgs-badge-amber">Draft (Needs Review)</span>
        ) : (
          <span className="dgs-badge dgs-badge-gray">Draft</span>
        );
    }
  };

  return (
    <div className="dgs-admin-blogs-manager">
      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelected}
        mediaType="image"
        title={mediaPickerTarget === "featured" ? "Choose Featured Image" : "Insert Inline Image"}
      />

      {/* Page Header */}
      <PageHeader
        title="Blogs & Editorial Content"
        subtitle="Manage search-authoritative articles, native schema, SEO metadata, and publication pipelines."
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              className={`dgs-saas-btn sm ${activeTab === "import" ? "primary" : "secondary"}`}
              onClick={() => setActiveTab("import")}
            >
              Bulk Import (.docx)
            </button>
            <button
              type="button"
              className={`dgs-saas-btn sm ${activeTab === "new" ? "primary" : "secondary"}`}
              onClick={() => setActiveTab("new")}
            >
              + New Blog Post
            </button>
          </div>
        }
      />

      {/* Notice Banner */}
      {notice && (
        <div className={`dgs-admin-notice ${notice.type}`}>
          <p>{notice.message}</p>
          <button type="button" onClick={() => setNotice(null)} className="dgs-notice-close">
            ×
          </button>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="dgs-admin-toolbar">
        <div className="dgs-admin-nav-tabs">
          <button
            type="button"
            className={`dgs-nav-tab ${activeTab === "list" ? "active" : ""}`}
            onClick={() => setActiveTab("list")}
          >
            Blog List ({counts.all})
          </button>
          <button
            type="button"
            className={`dgs-nav-tab ${activeTab === "import" ? "active" : ""}`}
            onClick={() => setActiveTab("import")}
          >
            Bulk Import (.docx)
          </button>
          <button
            type="button"
            className={`dgs-nav-tab ${activeTab === "new" ? "active" : ""}`}
            onClick={() => setActiveTab("new")}
          >
            + New Blog
          </button>
          {editingBlog && (
            <button
              type="button"
              className={`dgs-nav-tab ${activeTab === "edit" ? "active" : ""}`}
              onClick={() => setActiveTab("edit")}
            >
              Editing: {editingBlog.title.slice(0, 24)}...
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: BLOG LIST WITH FILTER TABS                                        */}
      {/* ========================================================================= */}
      {activeTab === "list" && (
        <div className="dgs-admin-blogs-list-view">
          {/* Sub-Filter Tabs */}
          <div className="dgs-filter-pills">
            <button
              type="button"
              className={`dgs-filter-pill ${filterView === "all" ? "active" : ""}`}
              onClick={() => handleTabChange("all")}
            >
              All ({counts.all})
            </button>
            <button
              type="button"
              className={`dgs-filter-pill ${filterView === "drafts" ? "active" : ""}`}
              onClick={() => handleTabChange("drafts")}
            >
              Drafts ({counts.drafts})
            </button>
            <button
              type="button"
              className={`dgs-filter-pill ${filterView === "needs_review" ? "active" : ""}`}
              onClick={() => handleTabChange("needs_review")}
            >
              Needs Review ({counts.needs_review})
            </button>
            <button
              type="button"
              className={`dgs-filter-pill ${filterView === "scheduled" ? "active" : ""}`}
              onClick={() => handleTabChange("scheduled")}
            >
              Scheduled ({counts.scheduled})
            </button>
            <button
              type="button"
              className={`dgs-filter-pill ${filterView === "published" ? "active" : ""}`}
              onClick={() => handleTabChange("published")}
            >
              Published ({counts.published})
            </button>
            <button
              type="button"
              className={`dgs-filter-pill ${filterView === "seo_issues" ? "active" : ""}`}
              onClick={() => handleTabChange("seo_issues")}
            >
              SEO Issues ({counts.seo_issues})
            </button>
            <button
              type="button"
              className={`dgs-filter-pill ${filterView === "missing_images" ? "active" : ""}`}
              onClick={() => handleTabChange("missing_images")}
            >
              Missing Images ({counts.missing_images})
            </button>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="dgs-search-bar">
            <input
              type="text"
              placeholder="Search blogs by title, slug, or focus keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="dgs-clear-search"
                onClick={() => {
                  setSearch("");
                  fetchBlogs(filterView, "", 1);
                }}
              >
                Clear
              </button>
            )}
            <button type="submit" className="dgs-btn-search">
              Search
            </button>
          </form>

          {/* Blog Table */}
          {loading ? (
            <div className="dgs-loading-box">Loading blogs...</div>
          ) : blogs.length === 0 ? (
            <div className="dgs-empty-state">
              <p>No blogs found in this view.</p>
              {filterView !== "all" ? (
                <button
                  type="button"
                  className="dgs-btn-secondary"
                  onClick={() => handleTabChange("all")}
                >
                  View All Blogs
                </button>
              ) : (
                <button
                  type="button"
                  className="dgs-btn-primary"
                  onClick={() => setActiveTab("import")}
                >
                  Bulk Import Word Blogs (.docx)
                </button>
              )}
            </div>
          ) : (
            <div className="dgs-table-wrapper">
              <table className="dgs-table">
                <thead>
                  <tr>
                    <th style={{ width: "70px" }}>Image</th>
                    <th>Title & URL</th>
                    <th>Status</th>
                    <th>SEO & AI Health</th>
                    <th>Metrics</th>
                    <th>Date</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((b) => (
                    <tr key={b.id}>
                      {/* Image Thumbnail */}
                      <td>
                        {b.featured_image_url ? (
                          <img
                            src={b.featured_image_url}
                            alt={b.title}
                            className="dgs-table-thumb"
                          />
                        ) : (
                          <div className="dgs-table-thumb-missing" title="No featured image set">
                            No Img
                          </div>
                        )}
                      </td>

                      {/* Title & Slug */}
                      <td>
                        <strong className="dgs-blog-title">{b.title}</strong>
                        <div className="dgs-blog-slug-meta">
                          {b.status === "published" ? (
                            <a
                              href={`/blogs/${b.slug}/`}
                              target="_blank"
                              rel="noreferrer"
                              className="dgs-live-link"
                            >
                              /blogs/{b.slug}/ ↗
                            </a>
                          ) : (
                            <span className="dgs-draft-slug">/blogs/{b.slug}/</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td>{renderStatusBadge(b.status, b.needs_review)}</td>

                      {/* SEO Health */}
                      <td>
                        <div className="dgs-seo-health-pills">
                          {b.seo_title && b.seo_description && b.seo_description.length >= 60 ? (
                            <span className="dgs-health-pill good" title="SEO metadata complete">
                              SEO Good
                            </span>
                          ) : (
                            <span className="dgs-health-pill warn" title="Missing or short SEO meta">
                              SEO Warning
                            </span>
                          )}
                          {!b.featured_image_url && (
                            <span className="dgs-health-pill red" title="No featured image">
                              Missing Image
                            </span>
                          )}
                          {b.needs_review && (
                            <span className="dgs-health-pill alert" title="AI changes unreviewed">
                              Needs Sign-off
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Metrics */}
                      <td>
                        <span className="dgs-meta-text">
                          {b.word_count || 0} words · {b.reading_time_minutes || 1} min read
                        </span>
                      </td>

                      {/* Date */}
                      <td>
                        <span className="dgs-meta-text">
                          {b.status === "scheduled" && b.scheduled_for ? (
                            <span className="dgs-sched-time">
                              📅 {new Date(b.scheduled_for).toLocaleDateString()}
                            </span>
                          ) : b.published_at ? (
                            new Date(b.published_at).toLocaleDateString()
                          ) : (
                            new Date(b.updated_at).toLocaleDateString()
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "right" }}>
                        <div className="dgs-action-group">
                          <button
                            type="button"
                            className="dgs-btn-edit"
                            onClick={() => startEditing(b.id)}
                          >
                            Edit
                          </button>
                          {b.status !== "published" && (
                            <button
                              type="button"
                              className="dgs-btn-publish"
                              onClick={() => handleQuickPublish(b)}
                            >
                              Publish
                            </button>
                          )}
                          {b.status !== "published" && (
                            <button
                              type="button"
                              className="dgs-btn-delete"
                              onClick={() => setDeleteTarget(b)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {total > 20 && (
                <div className="dgs-pagination">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => {
                      const p = page - 1;
                      setPage(p);
                      fetchBlogs(filterView, search, p);
                    }}
                  >
                    Previous
                  </button>
                  <span>
                    Page {page} of {Math.ceil(total / 20)} ({total} total)
                  </span>
                  <button
                    type="button"
                    disabled={page >= Math.ceil(total / 20)}
                    onClick={() => {
                      const p = page + 1;
                      setPage(p);
                      fetchBlogs(filterView, search, p);
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: BULK IMPORT (.DOCX + IMAGES)                                      */}
      {/* ========================================================================= */}
      {activeTab === "import" && (
        <div className="dgs-admin-bulk-import-view">
          <div className="dgs-import-header">
            <h2>Bulk Word-to-Web Blog Importer</h2>
            <p>
              Upload multiple Word files (<code>.docx</code>) and their accompanying images in bulk.
              Images are automatically optimized via native Media CMS (Sharp WebP + thumbnails),
              matched to each blog by filename/title, and parsed into clean semantic HTML with full
              SEO, AEO, GEO, and LLM SEO packages.
            </p>
          </div>

          <form onSubmit={handleBulkImportSubmit} className="dgs-bulk-import-form">
            <div className="dgs-import-grid">
              {/* Docx Dropzone */}
              <div
                className="dgs-dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDocxDrop}
                onClick={() => docxInputRef.current?.click()}
              >
                <input
                  ref={docxInputRef}
                  type="file"
                  multiple
                  accept=".docx"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setImportDocs((prev) => [...prev, ...files]);
                  }}
                />
                <span className="dgs-dropzone-icon">📄</span>
                <strong>1. Select or Drop Word Documents (.docx)</strong>
                <p>Upload up to 30 Word files at once</p>
                <div className="dgs-file-count-badge">{importDocs.length} files selected</div>
              </div>

              {/* Image Dropzone */}
              <div
                className="dgs-dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleImageDrop}
                onClick={() => imageInputRef.current?.click()}
              >
                <input
                  ref={imageInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setImportImages((prev) => [...prev, ...files]);
                  }}
                />
                <span className="dgs-dropzone-icon">🖼️</span>
                <strong>2. Select or Drop Supporting Images</strong>
                <p>JPG, PNG, WebP — automatically ingested into Media CMS</p>
                <div className="dgs-file-count-badge">{importImages.length} images selected</div>
              </div>
            </div>

            {/* Live Matching Matrix Preview */}
            {importDocs.length > 0 && (
              <div className="dgs-matching-preview">
                <h3>Live Image Matching Preview</h3>
                <div className="dgs-matching-list">
                  {importDocs.map((doc, idx) => {
                    const stem = doc.name.replace(/\.docx$/i, "");
                    const matched = importImages.filter((img) => imageMatchesSlug(img.name, stem));
                    return (
                      <div key={idx} className="dgs-matching-row">
                        <div className="dgs-doc-name">
                          📄 <strong>{doc.name}</strong>
                          <span className="dgs-doc-size">({(doc.size / 1024).toFixed(0)} KB)</span>
                        </div>
                        <div className="dgs-matched-images">
                          {matched.length > 0 ? (
                            matched.map((img, i) => (
                              <span key={i} className="dgs-matched-tag">
                                🖼️ {img.name}{" "}
                                {/-(featured|hero|cover)/i.test(img.name) ? "(Featured)" : ""}
                              </span>
                            ))
                          ) : (
                            <span className="dgs-no-match">No matched image found</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="dgs-import-actions">
              <button
                type="submit"
                className="dgs-btn-primary dgs-btn-large"
                disabled={importBusy || importDocs.length === 0}
              >
                {importBusy
                  ? "Processing Word Documents & Optimizing Media..."
                  : `Import & Generate ${importDocs.length} Blog Draft${importDocs.length === 1 ? "" : "s"}`}
              </button>
              {(importDocs.length > 0 || importImages.length > 0) && (
                <button
                  type="button"
                  className="dgs-btn-secondary"
                  onClick={() => {
                    setImportDocs([]);
                    setImportImages([]);
                  }}
                >
                  Clear Selection
                </button>
              )}
            </div>
          </form>

          {/* Import Results Card */}
          {importResults.length > 0 && (
            <div className="dgs-import-results-card">
              <h3>Import Results: {importResults.length} Drafts Created</h3>
              <p className="dgs-review-warning-box">
                ⚠️ <strong>Human Review Policy</strong>: All imported blogs have been generated with
                SEO, AEO, GEO, and LLM search optimizations in <em>Needs Review</em> status. Review
                and verify each draft before publishing.
              </p>
              <div className="dgs-results-grid">
                {importResults.map((r, i) => {
                  const b = r.blog as Record<string, unknown>;
                  return (
                    <div key={i} className="dgs-result-item">
                      <h4>{String(b.title)}</h4>
                      <p className="dgs-meta-text">Slug: /blogs/{String(b.slug)}/</p>
                      <p className="dgs-meta-text">
                        Matched Media: {String(r.matchedImagesCount)} image(s)
                      </p>
                      <button
                        type="button"
                        className="dgs-btn-edit"
                        onClick={() => startEditing(String(b.id))}
                      >
                        Review & Edit Draft →
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {importFailures.length > 0 && (
            <div className="dgs-import-failures-card">
              <h3>Issues Detected ({importFailures.length})</h3>
              <ul>
                {importFailures.map((f, i) => (
                  <li key={i}>
                    <strong>{f.filename}</strong>: {f.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: NEW BLOG (MANUAL CREATION)                                        */}
      {/* ========================================================================= */}
      {activeTab === "new" && (
        <div className="dgs-admin-new-blog-view">
          <h2>Create New Blog Post</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              try {
                const res = await fetch("/api/admin/blogs", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(newBlogForm),
                });
                const data = await res.json();
                setSaving(false);
                if (res.ok && data.ok) {
                  setNotice({ type: "success", message: "Blog draft created" });
                  setNewBlogForm({
                    title: "",
                    slug: "",
                    excerpt: "",
                    featured_image_url: "",
                    seo_title: "",
                    seo_description: "",
                    focus_keyword: "",
                  });
                  startEditing(data.blog.id);
                } else {
                  setNotice({ type: "error", message: data.message || "Failed to create blog" });
                }
              } catch (err) {
                console.error("Create blog failed:", err);
                setSaving(false);
                setNotice({ type: "error", message: "Failed to create blog" });
              }
            }}
            className="dgs-new-blog-form"
          >
            <div className="dgs-form-row">
              <label>
                Blog Title *
                <input
                  type="text"
                  required
                  value={newBlogForm.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const autoSlug = title
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, "")
                      .slice(0, 100);
                    setNewBlogForm((prev) => ({
                      ...prev,
                      title,
                      slug: prev.slug || autoSlug,
                      seo_title: prev.seo_title || title,
                    }));
                  }}
                  placeholder="e.g. 7 Proven SEO Tactics for Zero-Click AI Search"
                />
              </label>
            </div>

            <div className="dgs-form-row">
              <label>
                URL Slug *
                <input
                  type="text"
                  required
                  value={newBlogForm.slug}
                  onChange={(e) =>
                    setNewBlogForm((prev) => ({
                      ...prev,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                    }))
                  }
                  placeholder="e.g. 7-proven-seo-tactics-zero-click"
                />
                <small>URL: https://www.dgeniussolutions.com/blogs/{newBlogForm.slug || "[slug]"}/</small>
              </label>
            </div>

            <div className="dgs-form-row">
              <label>
                Excerpt (Meta Summary)
                <textarea
                  rows={3}
                  value={newBlogForm.excerpt}
                  onChange={(e) =>
                    setNewBlogForm((prev) => ({
                      ...prev,
                      excerpt: e.target.value,
                      seo_description: prev.seo_description || e.target.value,
                    }))
                  }
                  placeholder="Short introductory summary for archive cards..."
                />
              </label>
            </div>

            <div className="dgs-form-row">
              <label>Featured Image</label>
              <div className="dgs-featured-image-picker-row">
                {newBlogForm.featured_image_url ? (
                  <div className="dgs-featured-preview">
                    <img src={newBlogForm.featured_image_url} alt="Featured preview" />
                    <button
                      type="button"
                      onClick={() =>
                        setNewBlogForm((prev) => ({ ...prev, featured_image_url: "" }))
                      }
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="dgs-btn-secondary"
                    onClick={() => {
                      setMediaPickerTarget("featured");
                      setShowMediaPicker(true);
                    }}
                  >
                    Select Featured Image from Media CMS
                  </button>
                )}
              </div>
            </div>

            <div className="dgs-form-actions">
              <button type="submit" className="dgs-btn-primary" disabled={saving}>
                {saving ? "Creating..." : "Create Draft Blog"}
              </button>
              <button
                type="button"
                className="dgs-btn-secondary"
                onClick={() => setActiveTab("list")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: EDIT BLOG (HUMAN REVIEW & FULL OPTIMIZATION SUITE)                 */}
      {/* ========================================================================= */}
      {activeTab === "edit" && editingBlog && (
        <div className="dgs-admin-edit-blog-view">
          {/* Header & Status Bar */}
          <div className="dgs-edit-header">
            <div>
              <p className="dgs-admin-kicker">
                Editing Blog · {editingBlog.status.toUpperCase()}
              </p>
              <h2>{editingBlog.title}</h2>
              <p className="dgs-meta-text">
                URL: <code>/blogs/{editingBlog.slug}/</code> · Word Count: {editingBlog.word_count || 0} ·{" "}
                {editingBlog.reading_time_minutes || 1} min read
              </p>
            </div>
            <div className="dgs-edit-actions-top">
              <button
                type="button"
                className="dgs-btn-secondary"
                onClick={() => setActiveTab("list")}
              >
                ← Back to List
              </button>
              <button
                type="button"
                className="dgs-btn-primary"
                disabled={saving}
                onClick={() => handleSaveEdit(false)}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Review Notice Banner if Needs Review */}
          {editingBlog.needs_review && (
            <div className="dgs-review-alert-banner">
              <div>
                <strong>⚠️ Human Review Required</strong>
                <p>
                  This blog contains AI-assisted SEO, AEO, and GEO optimizations. Review the
                  content, answer summaries, and schema below, then check &quot;Reviewed by Editor&quot;
                  before publishing.
                </p>
              </div>
              <label className="dgs-checkbox-label">
                <input
                  type="checkbox"
                  checked={!editingBlog.needs_review}
                  onChange={(e) =>
                    setEditingBlog({ ...editingBlog, needs_review: !e.target.checked })
                  }
                />
                Reviewed & Approved by Editor
              </label>
            </div>
          )}

          {/* QA Pre-Flight Checklist Bar */}
          {editQa && (
            <div className={`dgs-qa-preflight-box ${editQa.ok ? "passed" : "attention"}`}>
              <div className="dgs-qa-header">
                <strong>Pre-flight Publish Checklist</strong>
                <span className={`dgs-badge ${editQa.ok ? "dgs-badge-green" : "dgs-badge-amber"}`}>
                  {editQa.ok ? "QA Passed (Ready to Publish)" : "Action Items Remaining"}
                </span>
              </div>
              {editQa.errors.length > 0 && (
                <ul className="dgs-qa-errors">
                  {editQa.errors.map((err, i) => (
                    <li key={i}>❌ {err}</li>
                  ))}
                </ul>
              )}
              {editQa.warnings.length > 0 && (
                <ul className="dgs-qa-warnings">
                  {editQa.warnings.map((warn, i) => (
                    <li key={i}>⚠️ {warn}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Edit Tabs */}
          <div className="dgs-edit-section-tabs">
            <button
              type="button"
              className={`dgs-section-tab ${editTab === "content" ? "active" : ""}`}
              onClick={() => setEditTab("content")}
            >
              1. Content & Media
            </button>
            <button
              type="button"
              className={`dgs-section-tab ${editTab === "seo" ? "active" : ""}`}
              onClick={() => setEditTab("seo")}
            >
              2. SEO & Google SERP
            </button>
            <button
              type="button"
              className={`dgs-section-tab ${editTab === "aeo" ? "active" : ""}`}
              onClick={() => setEditTab("aeo")}
            >
              3. AEO (Answer Engine)
            </button>
            <button
              type="button"
              className={`dgs-section-tab ${editTab === "geo" ? "active" : ""}`}
              onClick={() => setEditTab("geo")}
            >
              4. GEO & LLM SEO
            </button>
            <button
              type="button"
              className={`dgs-section-tab ${editTab === "schema" ? "active" : ""}`}
              onClick={() => setEditTab("schema")}
            >
              5. Schema (Structured Data)
            </button>
            <button
              type="button"
              className={`dgs-section-tab ${editTab === "links" ? "active" : ""}`}
              onClick={() => setEditTab("links")}
            >
              6. Internal Links
            </button>
            <button
              type="button"
              className={`dgs-section-tab ${editTab === "revisions" ? "active" : ""}`}
              onClick={() => {
                setEditTab("revisions");
                if (editingBlog?.id) fetchRevisions(editingBlog.id);
              }}
            >
              7. Revisions & Rollback ({revisions.length})
            </button>
          </div>


          {/* TAB 1: CONTENT & MEDIA */}
          {editTab === "content" && (
            <div className="dgs-tab-panel">
              <div className="dgs-form-row">
                <label>
                  Article Title
                  <input
                    type="text"
                    value={editingBlog.title}
                    onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                  />
                </label>
              </div>

              <div className="dgs-form-row">
                <label>
                  URL Slug
                  <input
                    type="text"
                    value={editingBlog.slug}
                    onChange={(e) =>
                      setEditingBlog({
                        ...editingBlog,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                      })
                    }
                  />
                </label>
              </div>

              <div className="dgs-form-row">
                <label>Featured Image (Media CMS)</label>
                <div className="dgs-featured-image-card">
                  {editingBlog.featured_image_url ? (
                    <div className="dgs-featured-box">
                      <img src={editingBlog.featured_image_url} alt="Featured" />
                      <div className="dgs-featured-controls">
                        <button
                          type="button"
                          className="dgs-btn-secondary"
                          onClick={() => {
                            setMediaPickerTarget("featured");
                            setShowMediaPicker(true);
                          }}
                        >
                          Change from Media CMS
                        </button>
                        <button
                          type="button"
                          className="dgs-btn-delete"
                          onClick={() =>
                            setEditingBlog({ ...editingBlog, featured_image_url: null })
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="dgs-btn-secondary"
                      onClick={() => {
                        setMediaPickerTarget("featured");
                        setShowMediaPicker(true);
                      }}
                    >
                      + Choose Featured Image from Media CMS
                    </button>
                  )}
                </div>
              </div>

              <div className="dgs-form-row">
                <div className="dgs-editor-header-bar">
                  <label>HTML Content Body</label>
                  <button
                    type="button"
                    className="dgs-btn-secondary dgs-btn-small"
                    onClick={() => {
                      setMediaPickerTarget("inline");
                      setShowMediaPicker(true);
                    }}
                  >
                    + Insert Image from Media CMS
                  </button>
                </div>
                <textarea
                  rows={18}
                  className="dgs-code-editor"
                  value={editingBlog.content?.bodyHtml || ""}
                  onChange={(e) =>
                    setEditingBlog({
                      ...editingBlog,
                      content: {
                        ...editingBlog.content,
                        bodyHtml: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="dgs-form-row">
                <label>Excerpt / Summary</label>
                <textarea
                  rows={3}
                  value={editingBlog.excerpt || ""}
                  onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* TAB 2: SEO & SERP PREVIEW */}
          {editTab === "seo" && (
            <div className="dgs-tab-panel">
              {/* Google SERP Simulator */}
              <div className="dgs-serp-simulator">
                <h4>Google Search Result Preview</h4>
                <div className="dgs-serp-card">
                  <div className="dgs-serp-url">
                    https://www.dgeniussolutions.com › blogs › {editingBlog.slug}
                  </div>
                  <div className="dgs-serp-title">
                    {editingBlog.content?.optimization?.seo?.title || editingBlog.title}
                  </div>
                  <div className="dgs-serp-desc">
                    {editingBlog.content?.optimization?.seo?.description ||
                      editingBlog.excerpt ||
                      "No meta description set."}
                  </div>
                </div>
              </div>

              {/* Core Page Cannibalization Shield */}
              <div style={{
                marginBottom: 20,
                padding: 16,
                borderRadius: 8,
                background: editQa?.cannibalization?.risk === "HIGH_OVERLAP"
                  ? "rgba(239, 68, 68, 0.08)"
                  : editQa?.cannibalization?.risk === "REVIEW"
                  ? "rgba(245, 158, 11, 0.08)"
                  : "rgba(34, 197, 94, 0.08)",
                border: `1px solid ${
                  editQa?.cannibalization?.risk === "HIGH_OVERLAP"
                    ? "rgba(239, 68, 68, 0.3)"
                    : editQa?.cannibalization?.risk === "REVIEW"
                    ? "rgba(245, 158, 11, 0.3)"
                    : "rgba(34, 197, 94, 0.3)"
                }`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <h4 style={{ margin: 0, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
                    🛡️ Core Page Cannibalization Shield
                  </h4>
                  <span style={{
                    padding: "3px 8px",
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 700,
                    background: editQa?.cannibalization?.risk === "HIGH_OVERLAP" ? "#ef4444" : editQa?.cannibalization?.risk === "REVIEW" ? "#f59e0b" : "#22c55e",
                    color: "#fff",
                  }}>
                    {editQa?.cannibalization?.risk || "SAFE"} ({editQa?.cannibalization?.score || 0}% RISK)
                  </span>
                </div>
                <p style={{ margin: "0 0 10px 0", fontSize: 13 }}>
                  {editQa?.cannibalization?.reason || "No commercial keyword cannibalization detected with protected core service pages."}
                </p>

                {editQa?.cannibalization?.conflictingPages && editQa.cannibalization.conflictingPages.length > 0 && (
                  <div style={{ marginBottom: 10, background: "rgba(0,0,0,0.2)", padding: 10, borderRadius: 6 }}>
                    <strong style={{ fontSize: 12, textTransform: "uppercase", color: "#9ca3af" }}>Protected Core Page Overlaps:</strong>
                    <ul style={{ margin: "6px 0 0 0", paddingLeft: 18, fontSize: 13 }}>
                      {editQa.cannibalization.conflictingPages.map((cp: any, idx: number) => (
                        <li key={idx} style={{ marginBottom: 4 }}>
                          <strong>{cp.pageTitle}</strong> (<code>{cp.pageUrl}</code>)
                          <div style={{ fontSize: 12, color: "#d1d5db" }}>{cp.reason}</div>
                          {cp.matchedTerms?.length > 0 && (
                            <div style={{ fontSize: 11, color: "#9ca3af" }}>Matches: {cp.matchedTerms.join(", ")}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {editQa?.cannibalization?.recommendations && editQa.cannibalization.recommendations.length > 0 && (
                  <div style={{ fontSize: 12 }}>
                    <strong style={{ color: "#9ca3af" }}>Guidance:</strong>
                    <ul style={{ margin: "4px 0 0 0", paddingLeft: 18 }}>
                      {editQa.cannibalization.recommendations.map((rec: string, idx: number) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>


              <div className="dgs-form-row">
                <label>
                  SEO Title (Capped at 60 characters for SERP display)
                  <span className="dgs-char-counter">
                    {(editingBlog.content?.optimization?.seo?.title || "").length} / 60
                  </span>
                  <input
                    type="text"
                    value={editingBlog.content?.optimization?.seo?.title || ""}
                    onChange={(e) =>
                      setEditingBlog({
                        ...editingBlog,
                        content: {
                          ...editingBlog.content,
                          optimization: {
                            ...editingBlog.content.optimization,
                            seo: {
                              ...editingBlog.content.optimization.seo,
                              title: e.target.value,
                            },
                          },
                        },
                      })
                    }
                  />
                </label>
              </div>

              <div className="dgs-form-row">
                <label>
                  Meta Description (Recommended: 140–155 characters)
                  <span className="dgs-char-counter">
                    {(editingBlog.content?.optimization?.seo?.description || "").length} / 155
                  </span>
                  <textarea
                    rows={3}
                    value={editingBlog.content?.optimization?.seo?.description || ""}
                    onChange={(e) =>
                      setEditingBlog({
                        ...editingBlog,
                        content: {
                          ...editingBlog.content,
                          optimization: {
                            ...editingBlog.content.optimization,
                            seo: {
                              ...editingBlog.content.optimization.seo,
                              description: e.target.value,
                            },
                          },
                        },
                      })
                    }
                  />
                </label>
              </div>

              <div className="dgs-form-row">
                <label>
                  Primary H1 Heading
                  <input
                    type="text"
                    value={editingBlog.content?.optimization?.seo?.h1 || editingBlog.title}
                    onChange={(e) =>
                      setEditingBlog({
                        ...editingBlog,
                        content: {
                          ...editingBlog.content,
                          optimization: {
                            ...editingBlog.content.optimization,
                            seo: {
                              ...editingBlog.content.optimization.seo,
                              h1: e.target.value,
                            },
                          },
                        },
                      })
                    }
                  />
                </label>
              </div>

              <div className="dgs-form-row">
                <label>
                  Focus Keyword
                  <input
                    type="text"
                    value={editingBlog.content?.optimization?.seo?.focusKeyword || ""}
                    onChange={(e) =>
                      setEditingBlog({
                        ...editingBlog,
                        content: {
                          ...editingBlog.content,
                          optimization: {
                            ...editingBlog.content.optimization,
                            seo: {
                              ...editingBlog.content.optimization.seo,
                              focusKeyword: e.target.value,
                            },
                          },
                        },
                      })
                    }
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: AEO (ANSWER ENGINE OPTIMIZATION) */}
          {editTab === "aeo" && (
            <div className="dgs-tab-panel">
              <div className="dgs-info-callout">
                <strong>What is Answer Engine Optimization (AEO)?</strong>
                <p>
                  AEO prepares concise, high-authority direct answers (40–60 words) that Google AI
                  Overviews, ChatGPT Search, and Perplexity synthesize when answering search queries.
                </p>
              </div>

              <div className="dgs-form-row">
                <label>
                  Concise Direct Answer (Direct Synthesis Block)
                  <textarea
                    rows={4}
                    value={editingBlog.content?.optimization?.aeo?.conciseAnswer || ""}
                    onChange={(e) =>
                      setEditingBlog({
                        ...editingBlog,
                        content: {
                          ...editingBlog.content,
                          optimization: {
                            ...editingBlog.content.optimization,
                            aeo: {
                              ...editingBlog.content.optimization.aeo,
                              conciseAnswer: e.target.value,
                            },
                          },
                        },
                      })
                    }
                  />
                </label>
              </div>

              <div className="dgs-form-row">
                <label>Answerable Questions Extracted from Headings</label>
                <div className="dgs-tag-list">
                  {(editingBlog.content?.optimization?.aeo?.questions || []).map((q, i) => (
                    <div key={i} className="dgs-question-chip">
                      ❓ {q}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GEO & LLM SEO */}
          {editTab === "geo" && (
            <div className="dgs-tab-panel">
              <div className="dgs-form-row">
                <label>Recognized Named Entities (Brands, Platforms, Technologies)</label>
                <div className="dgs-tag-cloud">
                  {(editingBlog.content?.optimization?.geo?.entities || []).map((ent, i) => (
                    <span key={i} className="dgs-entity-pill">
                      🏷️ {ent}
                    </span>
                  ))}
                </div>
              </div>

              <div className="dgs-form-row">
                <label>Topical Concepts & Core Keywords</label>
                <div className="dgs-tag-cloud">
                  {(editingBlog.content?.optimization?.geo?.topics || []).map((top, i) => (
                    <span key={i} className="dgs-topic-pill">
                      📌 {top}
                    </span>
                  ))}
                </div>
              </div>

              <div className="dgs-form-row">
                <label>Citable Facts & Verifiable Claims</label>
                <ul className="dgs-fact-list">
                  {(editingBlog.content?.optimization?.llm?.citableFacts || []).map((fact, i) => (
                    <li key={i}>📊 {fact}</li>
                  ))}
                </ul>
              </div>

              <div className="dgs-form-row">
                <label>LLM Semantic Headings Outline</label>
                <ul className="dgs-outline-list">
                  {(editingBlog.content?.optimization?.llm?.semanticHeadings || []).map((h, i) => (
                    <li key={i}>🔖 {h}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 5: SCHEMA (STRUCTURED DATA) */}
          {editTab === "schema" && (
            <div className="dgs-tab-panel">
              <div className="dgs-info-callout">
                <strong>Active JSON-LD Schemas</strong>
                <p>
                  Includes Schema.org <code>BlogPosting</code>, <code>BreadcrumbList</code>, and{" "}
                  <code>FAQPage</code> (if FAQs exist). These are automatically output in the head of
                  the blog page.
                </p>
              </div>
              <textarea
                rows={16}
                readOnly
                className="dgs-code-editor"
                value={JSON.stringify(editingBlog.content?.optimization?.schemas || [], null, 2)}
              />
            </div>
          )}

          {/* TAB 6: INTERNAL LINKS */}
          {editTab === "links" && (
            <div className="dgs-tab-panel">
              <h3>Internal Linking Opportunities to DGS Core Services</h3>
              <p>
                Strengthen site architecture and contextual authority by linking relevant terms to
                authoritative service pages.
              </p>
              <div className="dgs-internal-links-list">
                {(editingBlog.content?.optimization?.internalLinks || []).length === 0 ? (
                  <p className="dgs-meta-text">
                    No automatic service keyword matches detected in body text.
                  </p>
                ) : (
                  (editingBlog.content?.optimization?.internalLinks || []).map((link, i) => (
                    <div key={i} className="dgs-internal-link-card">
                      <div>
                        <strong>{link.title}</strong>
                        <p className="dgs-meta-text">Target URL: {link.url}</p>
                        <p className="dgs-meta-text">
                          Matched Anchor: <code>&quot;{link.anchorText}&quot;</code>
                        </p>
                      </div>
                      <button
                        type="button"
                        className="dgs-btn-secondary dgs-btn-small"
                        onClick={() => {
                          const anchor = link.anchorText;
                          const replacement = `<a href="${link.url}" title="${link.title}">${anchor}</a>`;
                          const currentHtml = editingBlog.content?.bodyHtml || "";
                          if (currentHtml.includes(anchor) && !currentHtml.includes(link.url)) {
                            setEditingBlog({
                              ...editingBlog,
                              content: {
                                ...editingBlog.content,
                                bodyHtml: currentHtml.replace(anchor, replacement),
                              },
                            });
                            setNotice({
                              type: "success",
                              message: `Linked "${anchor}" to ${link.url}`,
                            });
                          } else {
                            setNotice({
                              type: "info",
                              message: "Anchor already linked or not found in HTML",
                            });
                          }
                        }}
                      >
                        Apply Link
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 7: REVISIONS & ROLLBACK */}
          {editTab === "revisions" && (
            <div className="dgs-tab-panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0 }}>Version History & Rollback</h3>
                  <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#9ca3af" }}>
                    Automated snapshots are captured before every edit and publish action. You can inspect previous versions and restore at any time.
                  </p>
                </div>
                <button
                  type="button"
                  className="dgs-btn-secondary dgs-btn-small"
                  onClick={() => fetchRevisions(editingBlog.id)}
                  disabled={loadingRevisions}
                >
                  {loadingRevisions ? "Refreshing..." : "↻ Refresh History"}
                </button>
              </div>

              {loadingRevisions ? (
                <p>Loading version history...</p>
              ) : revisions.length === 0 ? (
                <p className="dgs-meta-text">No prior revisions recorded for this blog yet. Edits will generate automatic snapshots.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
                  {/* Revisions list */}
                  <div style={{ borderRight: "1px solid #374151", paddingRight: 16 }}>
                    <h4 style={{ margin: "0 0 10px 0", fontSize: 13, textTransform: "uppercase", color: "#9ca3af" }}>
                      Snapshots ({revisions.length})
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "500px", overflowY: "auto" }}>
                      {revisions.map((rev) => (
                        <div
                          key={rev.id}
                          onClick={() => setSelectedRevision(rev)}
                          style={{
                            padding: 10,
                            borderRadius: 6,
                            cursor: "pointer",
                            background: selectedRevision?.id === rev.id ? "rgba(59, 130, 246, 0.15)" : "rgba(255, 255, 255, 0.03)",
                            border: `1px solid ${selectedRevision?.id === rev.id ? "#3b82f6" : "#374151"}`,
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <strong style={{ fontSize: 13 }}>{new Date(rev.created_at).toLocaleString()}</strong>
                            <span className="dgs-admin-badge" style={{ fontSize: 10 }}>{rev.snapshot?.status || "draft"}</span>
                          </div>
                          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
                            Title: {rev.snapshot?.title?.slice(0, 32)}...
                          </div>
                          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                            Words: {rev.snapshot?.word_count || 0} · Author: {rev.created_by ? "User" : "System / Auto"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selected Revision Inspector */}
                  <div>
                    {selectedRevision ? (
                      <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: 16, borderRadius: 8, border: "1px solid #374151" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                          <div>
                            <h4 style={{ margin: 0, fontSize: 16 }}>{selectedRevision.snapshot?.title}</h4>
                            <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#9ca3af" }}>
                              Snapshot created on {new Date(selectedRevision.created_at).toLocaleString()} · Author: {selectedRevision.created_by ? "User" : "System / Auto"}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="dgs-btn-primary dgs-btn-small"
                            onClick={() => handleRestoreRevision(editingBlog.id, selectedRevision.id)}
                            disabled={restoringRevisionId === selectedRevision.id}
                            style={{ background: "#f59e0b", color: "#000", fontWeight: 700 }}
                          >
                            {restoringRevisionId === selectedRevision.id ? "Restoring..." : "↺ Restore this Revision"}
                          </button>
                        </div>

                        {/* Mode Toggle: Compare vs Snapshot Preview */}
                        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                          <button
                            type="button"
                            onClick={() => setRevisionViewMode("compare")}
                            style={{
                              padding: "6px 14px",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                              background: revisionViewMode === "compare" ? "#3b82f6" : "rgba(255, 255, 255, 0.05)",
                              color: revisionViewMode === "compare" ? "#fff" : "#9ca3af",
                              border: `1px solid ${revisionViewMode === "compare" ? "#3b82f6" : "#374151"}`,
                            }}
                          >
                            ⇄ Compare vs Current Version
                          </button>
                          <button
                            type="button"
                            onClick={() => setRevisionViewMode("preview")}
                            style={{
                              padding: "6px 14px",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                              background: revisionViewMode === "preview" ? "#3b82f6" : "rgba(255, 255, 255, 0.05)",
                              color: revisionViewMode === "preview" ? "#fff" : "#9ca3af",
                              border: `1px solid ${revisionViewMode === "preview" ? "#3b82f6" : "#374151"}`,
                            }}
                          >
                            👁 Snapshot Details
                          </button>
                        </div>

                        {revisionViewMode === "compare" ? (
                          (() => {
                            const cur = editingBlog;
                            const rev = selectedRevision.snapshot || {};
                            const curOpt = cur.content?.optimization;
                            const revOpt = rev.content?.optimization;
                            const curSeo = curOpt?.seo;
                            const revSeo = revOpt?.seo;

                            const getDiff = (label: string, cVal: any, rVal: any) => {
                              const c = cVal == null || cVal === "" ? null : String(cVal).trim();
                              const r = rVal == null || rVal === "" ? null : String(rVal).trim();
                              let status: "ADDED" | "REMOVED" | "CHANGED" | "UNCHANGED";
                              if (r === null && c !== null) status = "ADDED";
                              else if (r !== null && c === null) status = "REMOVED";
                              else if (r === c) status = "UNCHANGED";
                              else status = "CHANGED";
                              return { label, current: c, revision: r, status };
                            };

                            const curSchemas = (curOpt?.schemas || []).map((s: any) => s?.["@type"]).filter(Boolean).sort().join(", ");
                            const revSchemas = (revOpt?.schemas || []).map((s: any) => s?.["@type"]).filter(Boolean).sort().join(", ");

                            const diffs = [
                              getDiff("Title", cur.title, rev.title),
                              getDiff("URL Slug", cur.slug, rev.slug),
                              getDiff("Status", cur.status, rev.status),
                              getDiff("Excerpt", cur.excerpt, rev.excerpt),
                              getDiff("Featured Image", cur.featured_image_url, rev.featured_image_url),
                              getDiff("SEO Title", cur.seo_title || curSeo?.title, rev.seo_title || revSeo?.title),
                              getDiff("Meta Description", cur.seo_description || curSeo?.description, rev.seo_description || revSeo?.description),
                              getDiff("Focus Keyword", cur.focus_keyword || curSeo?.focusKeyword, rev.focus_keyword || revSeo?.focusKeyword),
                              getDiff("Canonical Path", curSeo?.canonicalPath || `/blogs/${cur.slug}/`, revSeo?.canonicalPath || (rev.slug ? `/blogs/${rev.slug}/` : null)),
                              getDiff("Word Count", cur.word_count, rev.word_count),
                              getDiff("Reading Time (min)", cur.reading_time_minutes, rev.reading_time_minutes),
                              getDiff("Structured Schemas", curSchemas || null, revSchemas || null),
                              getDiff("Body Content Length", `${cur.content?.bodyHtml?.length || 0} chars`, `${rev.content?.bodyHtml?.length || 0} chars`),
                            ];

                            const changedCount = diffs.filter((d) => d.status === "CHANGED").length;
                            const addedCount = diffs.filter((d) => d.status === "ADDED").length;
                            const removedCount = diffs.filter((d) => d.status === "REMOVED").length;
                            const unchangedCount = diffs.filter((d) => d.status === "UNCHANGED").length;

                            return (
                              <div>
                                {/* Summary Badge Chips */}
                                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>
                                    {changedCount} CHANGED
                                  </span>
                                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(34, 197, 94, 0.15)", color: "#22c55e" }}>
                                    {addedCount} ADDED
                                  </span>
                                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>
                                    {removedCount} REMOVED
                                  </span>
                                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(156, 163, 175, 0.1)", color: "#9ca3af" }}>
                                    {unchangedCount} UNCHANGED
                                  </span>
                                </div>

                                {/* Comparison Table */}
                                <div style={{ overflowX: "auto", marginBottom: 16 }}>
                                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                    <thead>
                                      <tr style={{ borderBottom: "1px solid #374151", color: "#9ca3af", textAlign: "left" }}>
                                        <th style={{ padding: "6px 8px" }}>Field</th>
                                        <th style={{ padding: "6px 8px" }}>Status</th>
                                        <th style={{ padding: "6px 8px" }}>Current Version</th>
                                        <th style={{ padding: "6px 8px" }}>Revision Snapshot</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {diffs.map((d) => (
                                        <tr key={d.label} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                          <td style={{ padding: "6px 8px", fontWeight: 600 }}>{d.label}</td>
                                          <td style={{ padding: "6px 8px" }}>
                                            <span style={{
                                              display: "inline-block",
                                              padding: "1px 6px",
                                              borderRadius: 4,
                                              fontSize: 10,
                                              fontWeight: 700,
                                              background: d.status === "CHANGED" ? "rgba(245, 158, 11, 0.15)" : d.status === "ADDED" ? "rgba(34, 197, 94, 0.15)" : d.status === "REMOVED" ? "rgba(239, 68, 68, 0.15)" : "rgba(156, 163, 175, 0.1)",
                                              color: d.status === "CHANGED" ? "#f59e0b" : d.status === "ADDED" ? "#22c55e" : d.status === "REMOVED" ? "#ef4444" : "#9ca3af",
                                            }}>
                                              {d.status}
                                            </span>
                                          </td>
                                          <td style={{ padding: "6px 8px", color: d.status === "CHANGED" ? "#60a5fa" : "#e5e7eb", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {d.current || <em style={{ color: "#6b7280" }}>Empty</em>}
                                          </td>
                                          <td style={{ padding: "6px 8px", color: d.status === "CHANGED" ? "#f59e0b" : "#9ca3af", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {d.revision || <em style={{ color: "#6b7280" }}>Empty</em>}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>

                                {/* Side-by-side Body Preview */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                  <div>
                                    <strong style={{ fontSize: 12, color: "#60a5fa" }}>Current Version Body:</strong>
                                    <div
                                      style={{
                                        marginTop: 4,
                                        padding: 10,
                                        borderRadius: 6,
                                        background: "rgba(0,0,0,0.3)",
                                        maxHeight: "200px",
                                        overflowY: "auto",
                                        fontSize: 11,
                                        lineHeight: 1.4,
                                        border: "1px solid rgba(59, 130, 246, 0.2)",
                                      }}
                                      dangerouslySetInnerHTML={{ __html: cur.content?.bodyHtml || "<em>Empty body</em>" }}
                                    />
                                  </div>
                                  <div>
                                    <strong style={{ fontSize: 12, color: "#f59e0b" }}>Revision Snapshot Body:</strong>
                                    <div
                                      style={{
                                        marginTop: 4,
                                        padding: 10,
                                        borderRadius: 6,
                                        background: "rgba(0,0,0,0.3)",
                                        maxHeight: "200px",
                                        overflowY: "auto",
                                        fontSize: 11,
                                        lineHeight: 1.4,
                                        border: "1px solid rgba(245, 158, 11, 0.2)",
                                      }}
                                      dangerouslySetInnerHTML={{ __html: rev.content?.bodyHtml || "<em>Empty body</em>" }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12, fontSize: 13 }}>
                              <div><strong>Slug:</strong> <code>{selectedRevision.snapshot?.slug}</code></div>
                              <div><strong>Status at snapshot:</strong> <span className="dgs-admin-badge">{selectedRevision.snapshot?.status}</span></div>
                              <div><strong>Word count:</strong> {selectedRevision.snapshot?.word_count}</div>
                              <div><strong>Reading time:</strong> {selectedRevision.snapshot?.reading_time_minutes} min</div>
                              <div><strong>SEO Title:</strong> {selectedRevision.snapshot?.seo_title || "None"}</div>
                              <div><strong>Focus Keyword:</strong> {selectedRevision.snapshot?.focus_keyword || "None"}</div>
                            </div>

                            <div style={{ marginBottom: 12 }}>
                              <strong style={{ fontSize: 13 }}>Excerpt:</strong>
                              <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#d1d5db", fontStyle: "italic" }}>
                                {selectedRevision.snapshot?.excerpt || "No excerpt recorded"}
                              </p>
                            </div>

                            <div>
                              <strong style={{ fontSize: 13 }}>Body Preview:</strong>
                              <div
                                style={{
                                  marginTop: 6,
                                  padding: 12,
                                  borderRadius: 6,
                                  background: "rgba(0,0,0,0.3)",
                                  maxHeight: "220px",
                                  overflowY: "auto",
                                  fontSize: 12,
                                  lineHeight: 1.5,
                                }}
                                dangerouslySetInnerHTML={{ __html: selectedRevision.snapshot?.content?.bodyHtml || "<em>Empty body</em>" }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="dgs-meta-text">Select a revision from the list to preview details and restore.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}


          {/* Bottom Action Footer with Schedule & Publish */}
          <div className="dgs-edit-footer">
            <div className="dgs-schedule-controls">
              <label>
                Schedule Publication (Optional)
                <input
                  type="datetime-local"
                  defaultValue={
                    editingBlog.scheduled_for
                      ? new Date(editingBlog.scheduled_for).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value ? new Date(e.target.value).toISOString() : null;
                    setEditingBlog({ ...editingBlog, scheduled_for: val });
                  }}
                />
              </label>
              {editingBlog.scheduled_for && (
                <button
                  type="button"
                  className="dgs-btn-blue"
                  disabled={saving}
                  onClick={() => handleSaveEdit(false, editingBlog.scheduled_for || undefined)}
                >
                  Confirm Schedule
                </button>
              )}
            </div>

            <div className="dgs-publish-controls">
              <button
                type="button"
                className="dgs-btn-secondary"
                disabled={saving}
                onClick={() => handleSaveEdit(false)}
              >
                Save Draft
              </button>
              <button
                type="button"
                className="dgs-btn-primary dgs-btn-large"
                disabled={saving}
                onClick={() => {
                  if (editingBlog.needs_review) {
                    const confirmReview = window.confirm(
                      "This blog still has 'Needs Review' active. Confirm that you have reviewed all AI-generated SEO, AEO, and Schema optimizations before publishing?"
                    );
                    if (!confirmReview) return;
                  }
                  handleSaveEdit(true);
                }}
              >
                {saving ? "Publishing..." : "Publish Live Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL                                                 */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <div className="dgs-modal-backdrop">
          <div className="dgs-modal-dialog">
            <h3>Delete Draft Blog?</h3>
            <p>
              Are you sure you want to delete <strong>&quot;{deleteTarget.title}&quot;</strong>? This
              action will remove the draft from the database.
            </p>
            <div className="dgs-modal-actions">
              <button
                type="button"
                className="dgs-btn-secondary"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="dgs-btn-delete"
                onClick={handleConfirmDelete}
              >
                Yes, Delete Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
