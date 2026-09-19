"use client";

import { useState } from "react";

type ImportResult = {
  blog: { id: string; slug: string; title: string; status: string };
  optimization: {
    seo: Record<string, unknown>;
    aeo: Record<string, unknown>;
    geo: Record<string, unknown>;
    llm: Record<string, unknown>;
    schemas: Record<string, unknown>[];
  };
  images: Array<{ filename: string; url: string; altText: string; featured: boolean; bytes: number }>;
  videos: Array<{ filename: string; url: string; bytes: number }>;
  originalsRetained: boolean;
};

export function BlogImporter() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("Processing Word document and optimizing media...");
    setResult(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/blogs/import", { method: "POST", body: form });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setMessage(data.message || "Import failed");
      return;
    }
    setResult(data);
    setMessage("Draft created. Review the optimization package before publishing.");
  }

  async function publish() {
    if (!result) return;
    setBusy(true);
    setMessage("Publishing...");
    const response = await fetch("/api/admin/blogs/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: result.blog.id }),
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setMessage(data.message || "Publish failed");
      return;
    }
    setResult({ ...result, blog: { ...result.blog, status: data.blog.status } });
    setMessage(`Published at /blogs/${result.blog.slug}/`);
  }

  return (
    <div className="dgs-admin-blog-importer">
      <form onSubmit={onSubmit} className="dgs-admin-upload-form">
        <label>
          Word blog (.docx)
          <input name="document" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required disabled={busy} />
        </label>
        <label>
          Blog images
          <input name="images" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" multiple disabled={busy} />
        </label>
        <label>
          Blog videos
          <input name="videos" type="file" accept=".mp4,video/mp4" multiple disabled={busy} />
        </label>
        <p className="dgs-admin-help">Use matching names: <code>blog-name.docx</code>, <code>blog-name-featured.jpg</code>, <code>blog-name-01.jpg</code>, <code>blog-name-01.mp4</code>. Images become high-quality WebP and MP4 becomes VP9 WebM. Originals are discarded after successful conversion.</p>
        <button type="submit" disabled={busy}>{busy ? "Working..." : "Create optimized draft"}</button>
      </form>

      {message ? <p className="dgs-admin-login-message">{message}</p> : null}
      {result ? (
        <section className="dgs-admin-import-result">
          <div className="dgs-admin-import-head">
            <div>
              <span className="dgs-admin-badge">{result.blog.status}</span>
              <h2>{result.blog.title}</h2>
              <p>/blogs/{result.blog.slug}/</p>
            </div>
            {result.blog.status !== "published" ? <button onClick={publish} disabled={busy}>Publish approved blog</button> : <a href={`/blogs/${result.blog.slug}/`} target="_blank" rel="noreferrer">View live blog</a>}
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
            <h3>Images</h3>
            {result.images.length ? (
              <ul>{result.images.map((image) => <li key={image.url}><strong>{image.featured ? "Featured" : "Inline"}</strong> · {image.filename} · alt: {image.altText} · {Math.round(image.bytes / 1024)} KB</li>)}</ul>
            ) : <p>No matching images were uploaded.</p>}
          </article>

          <article className="dgs-admin-import-panel">
            <h3>Videos</h3>
            {result.videos?.length ? (
              <ul>{result.videos.map((video) => <li key={video.url}>{video.filename} · {Math.round(video.bytes / 1024 / 1024 * 10) / 10} MB</li>)}</ul>
            ) : <p>No matching MP4 videos were uploaded.</p>}
          </article>
        </section>
      ) : null}
    </div>
  );
}
