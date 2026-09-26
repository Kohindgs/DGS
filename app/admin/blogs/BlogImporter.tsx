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
  matchedImagesCount?: number;
  matchedImages?: Array<{
    filename: string;
    url: string;
    confidence: "EXACT" | "HIGH" | "MEDIUM";
    score: number;
    reason: string;
    isFeatured: boolean;
  }>;
  lowConfidenceImages?: Array<{
    filename: string;
    url: string;
    confidence: "LOW";
    score: number;
    reason: string;
  }>;
  unmatchedImages?: Array<{
    filename: string;
    url: string;
    confidence: "UNMATCHED";
    score: number;
    reason: string;
  }>;
  images?: Array<{
    filename: string;
    url: string;
    altText: string;
    featured: boolean;
    bytes: number;
  }>;
  videos?: Array<{ filename: string; url: string; bytes: number }>;
  originalsRetained?: boolean;
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
          VP9 WebM. Originals and optimized WebP/WebM variants are preserved in persistent CMS media storage.
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
            <h3>Matched Images</h3>
            {result.matchedImages?.length ? (
              <ul>
                {result.matchedImages.map((m) => (
                  <li key={m.url}>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      marginRight: 6,
                      background: m.confidence === "EXACT" ? "rgba(34, 197, 94, 0.15)" : m.confidence === "HIGH" ? "rgba(59, 130, 246, 0.15)" : "rgba(234, 179, 8, 0.15)",
                      color: m.confidence === "EXACT" ? "#22c55e" : m.confidence === "HIGH" ? "#3b82f6" : "#eab308",
                    }}>
                      {m.confidence} MATCH ({m.score}%)
                    </span>
                    <strong>{m.isFeatured ? "Featured" : "Inline"}</strong> · {m.filename}
                    {" · "}<span style={{ color: "#9ca3af" }}>{m.reason}</span>
                  </li>
                ))}
              </ul>
            ) : result.images?.length ? (
              <ul>
                {result.images.map((image) => (
                  <li key={image.url}>
                    <strong>{image.featured ? "Featured" : "Inline"}</strong> · {image.filename}
                    {" · "}alt: {image.altText} · {Math.round(image.bytes / 1024)} KB
                  </li>
                ))}
              </ul>
            ) : <p>No matching images were uploaded.</p>}

            {result.lowConfidenceImages?.length ? (
              <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                <h4 style={{ color: "#f59e0b", margin: "0 0 8px 0" }}>⚠️ Low Confidence Media (Not Attached)</h4>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
                  {result.lowConfidenceImages.map((img) => (
                    <li key={img.filename}>
                      <strong>{img.filename}</strong>: {img.reason} (Score: {img.score}%)
                    </li>
                  ))}
                </ul>
                <p style={{ margin: "6px 0 0 0", fontSize: 12, color: "#9ca3af" }}>
                  These images were not automatically attached to prevent incorrect media assignment. You can manually assign them in the blog editor.
                </p>
              </div>
            ) : null}
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

