"use client";

import { useState } from "react";

type ImportItem = {
  blog: { id: string; slug: string; title: string; status: string };
  sourceFilename: string;
  optimization: {
    seo: Record<string, unknown>;
    aeo: Record<string, unknown>;
    geo: Record<string, unknown>;
    llm: Record<string, unknown>;
    schemas: Record<string, unknown>[];
  };
  images: Array<{
    filename: string;
    url: string;
    mimeType: "image/webp" | "video/webm";
    altText: string;
    featured: boolean;
    bytes: number;
  }>;
};

type ImportResponse = {
  imported: number;
  failed: number;
  results: ImportItem[];
  failures: Array<{ filename: string; message: string }>;
  message?: string;
};

export function BlogImporter() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<ImportItem[]>([]);
  const [failures, setFailures] = useState<ImportResponse["failures"]>([]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("Processing Word documents and optimizing images/videos...");
    setResults([]);
    setFailures([]);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/blogs/import", { method: "POST", body: form });
    const data = await response.json() as ImportResponse;
    setBusy(false);

    if (!response.ok && response.status !== 207) {
      setMessage(data.message || "Import failed");
      return;
    }
    setResults(data.results || []);
    setFailures(data.failures || []);
    setMessage(
      data.failed
        ? `Created ${data.imported} draft(s); ${data.failed} file(s) need attention.`
        : `Created ${data.imported} optimized draft(s). Review before publishing.`,
    );
  }

  async function publish(item: ImportItem) {
    setBusy(true);
    setMessage(`Publishing ${item.blog.title}...`);
    const response = await fetch("/api/admin/blogs/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.blog.id }),
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setMessage(data.message || "Publish failed");
      return;
    }
    setResults((current) => current.map((entry) =>
      entry.blog.id === item.blog.id
        ? { ...entry, blog: { ...entry.blog, status: data.blog.status } }
        : entry,
    ));
    setMessage(`Published at /blogs/${item.blog.slug}/`);
  }

  return (
    <div className="dgs-admin-blog-importer">
      <form onSubmit={onSubmit} className="dgs-admin-upload-form">
        <label>
          Word blogs (.docx) — bulk upload
          <input
            name="documents"
            type="file"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            multiple
            required
            disabled={busy}
          />
        </label>
        <label>
          Blog images and videos — bulk upload
          <input
            name="images"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.mp4,image/jpeg,image/png,image/webp,video/mp4"
            multiple
            disabled={busy}
          />
        </label>
        <p className="dgs-admin-help">
          Match media to each Word filename/title: <code>blog-name.docx</code>,{" "}
          <code>blog-name-featured.jpg</code>, <code>blog-name-01.png</code>,{" "}
          <code>blog-name-01.mp4</code>. Images become high-quality WebP; MP4 becomes high-quality WebM.
        </p>
        <button type="submit" disabled={busy}>
          {busy ? "Working..." : "Create optimized drafts"}
        </button>
      </form>

      {message ? <p className="dgs-admin-login-message">{message}</p> : null}

      {failures.length ? (
        <article className="dgs-admin-import-panel">
          <h3>Needs attention</h3>
          <ul>
            {failures.map((failure) => (
              <li key={failure.filename}><strong>{failure.filename}</strong> · {failure.message}</li>
            ))}
          </ul>
        </article>
      ) : null}

      {results.map((result) => (
        <section className="dgs-admin-import-result" key={result.blog.id}>
          <div className="dgs-admin-import-head">
            <div>
              <span className="dgs-admin-badge">{result.blog.status}</span>
              <h2>{result.blog.title}</h2>
              <p>{result.sourceFilename} → /blogs/{result.blog.slug}/</p>
            </div>
            {result.blog.status !== "published" ? (
              <button onClick={() => publish(result)} disabled={busy}>Publish approved blog</button>
            ) : (
              <a href={`/blogs/${result.blog.slug}/`} target="_blank" rel="noreferrer">View live blog</a>
            )}
          </div>

          <div className="dgs-admin-optimization-grid">
            <article><h3>SEO</h3><pre>{JSON.stringify(result.optimization.seo, null, 2)}</pre></article>
            <article><h3>AEO</h3><pre>{JSON.stringify(result.optimization.aeo, null, 2)}</pre></article>
            <article><h3>GEO</h3><pre>{JSON.stringify(result.optimization.geo, null, 2)}</pre></article>
            <article><h3>LLM</h3><pre>{JSON.stringify(result.optimization.llm, null, 2)}</pre></article>
          </div>

          <article className="dgs-admin-import-panel">
            <h3>Schemas</h3>
            <pre>{JSON.stringify(result.optimization.schemas, null, 2)}</pre>
          </article>

          <article className="dgs-admin-import-panel">
            <h3>Media</h3>
            {result.images.length ? (
              <ul>{result.images.map((media) => (
                <li key={media.url}>
                  <strong>{media.featured ? "Featured" : media.mimeType === "video/webm" ? "Video" : "Inline"}</strong>
                  {" · "}{media.filename} · {Math.round(media.bytes / 1024)} KB
                </li>
              ))}</ul>
            ) : <p>No matching media was uploaded.</p>}
          </article>
        </section>
      ))}
    </div>
  );
}
