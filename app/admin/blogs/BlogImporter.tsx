"use client";

import { useState } from "react";

type ImportedBlog = {
  blog: { id: string; slug: string; title: string; status: string };
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
    altText: string;
    featured: boolean;
    bytes: number;
  }>;
  videos: Array<{ filename: string; url: string; bytes: number }>;
  originalsRetained: boolean;
};

type FailedImport = {
  filename: string;
  message: string;
};

export function BlogImporter() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<ImportedBlog[]>([]);
  const [failures, setFailures] = useState<FailedImport[]>([]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("Processing Word blogs and optimizing matched media...");
    setResults([]);
    setFailures([]);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/blogs/import", {
      method: "POST",
      body: form,
    });
    const data = await response.json();
    setBusy(false);

    const imported = Array.isArray(data.results) ? data.results : [];
    const failed = Array.isArray(data.failed) ? data.failed : [];
    setResults(imported);
    setFailures(failed);

    if (!response.ok && !imported.length) {
      setMessage(data.message || "Import failed");
      return;
    }
    const count = imported.length;
    setMessage(
      failed.length
        ? `${count} draft${count === 1 ? "" : "s"} created; ${failed.length} file${failed.length === 1 ? "" : "s"} need attention.`
        : `${count} optimized draft${count === 1 ? "" : "s"} created. Review before publishing.`,
    );
  }

  async function publish(index: number) {
    const item = results[index];
    if (!item) return;

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

    setResults((current) => current.map((entry, i) =>
      i === index ? { ...entry, blog: { ...entry.blog, status: data.blog.status } } : entry
    ));
    setMessage(`Published at /blogs/${item.blog.slug}/`);
  }
  return (
    <div className="dgs-admin-blog-importer">
      <form onSubmit={onSubmit} className="dgs-admin-upload-form">
        <label>
          Word blogs (.docx)
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
          Blog images
          <input
            name="images"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            multiple
            disabled={busy}
          />
        </label>
        <label>
          Blog videos
          <input
            name="videos"
            type="file"
            accept=".mp4,video/mp4"
            multiple
            disabled={busy}
          />
        </label>
        <p className="dgs-admin-help">
          Match media to the Word filename/title. Example: <code>ai-search-seo.docx</code>,
          <code>ai-search-seo-featured.jpg</code>, <code>ai-search-seo-01.jpg</code>,
          <code>ai-search-seo-01.mp4</code>. Images become high-quality WebP and MP4 becomes
          VP9 WebM. Originals are discarded after successful conversion.
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
              <li key={failure.filename}>
                <strong>{failure.filename}</strong> · {failure.message}
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      {results.map((result, index) => (
        <section className="dgs-admin-import-result" key={result.blog.id}>
          <div className="dgs-admin-import-head">
            <div>
              <span className="dgs-admin-badge">{result.blog.status}</span>
              <h2>{result.blog.title}</h2>
              <p>/blogs/{result.blog.slug}/</p>
            </div>
            {result.blog.status !== "published" ? (
              <button onClick={() => publish(index)} disabled={busy}>
                Publish approved blog
              </button>
            ) : (
              <a href={`/blogs/${result.blog.slug}/`} target="_blank" rel="noreferrer">
                View live blog
              </a>
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
            <h3>Images</h3>
            {result.images.length ? (
              <ul>
                {result.images.map((image) => (
                  <li key={image.url}>
                    <strong>{image.featured ? "Featured" : "Inline"}</strong> · {image.filename}
                    {" · "}alt: {image.altText} · {Math.round(image.bytes / 1024)} KB
                  </li>
                ))}
              </ul>
            ) : <p>No matching images were uploaded.</p>}
          </article>

          <article className="dgs-admin-import-panel">
            <h3>Videos</h3>
            {result.videos?.length ? (
              <ul>
                {result.videos.map((video) => (
                  <li key={video.url}>
                    {video.filename} · {Math.round(video.bytes / 1024 / 1024 * 10) / 10} MB
                  </li>
                ))}
              </ul>
            ) : <p>No matching MP4 videos were uploaded.</p>}
          </article>
        </section>
      ))}
    </div>
  );
}
