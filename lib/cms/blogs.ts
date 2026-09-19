import "server-only";
import { randomUUID } from "node:crypto";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import type { BlogOptimizationPackage } from "@/lib/cms/blog-import";
import type { StoredBlogImage } from "@/lib/cms/blog-media";

export type CmsBlogSummary = {
  id: string;
  slug: string;
  title: string;
  status: string;
  published_at: string | null;
  updated_at: string;
};

export type CmsBlogContent = {
  version: 1;
  bodyHtml: string;
  sourceHash: string;
  optimization: BlogOptimizationPackage;
  images: StoredBlogImage[];
};

export type CmsPublishedBlog = CmsBlogSummary & {
  excerpt: string | null;
  content: unknown;
};

export async function listCmsBlogs(limit = 50) {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  return (await cmsQuery<CmsBlogSummary>(`SELECT id, slug, title, status, published_at, updated_at FROM blog_posts ORDER BY updated_at DESC LIMIT ?`, [safeLimit])).rows;
}
export type CreateCmsBlogInput = {
  title: string;
  slug: string;
  excerpt?: string;
  content?: unknown[];
};

export async function createCmsBlog(input: CreateCmsBlogInput) {
  const id = randomUUID();
  await cmsExecute(
    `INSERT INTO blog_posts (id, title, slug, excerpt, content, status) VALUES (?, ?, ?, ?, ?, 'draft')`,
    [id, input.title.trim(), input.slug.trim().toLowerCase(), input.excerpt?.trim() || null, JSON.stringify(input.content || [])],
  );
  return (await cmsQuery<CmsBlogSummary>(
    `SELECT id, slug, title, status, published_at, updated_at FROM blog_posts WHERE id=? LIMIT 1`,
    [id],
  )).rows[0];
}

export async function attachImportedBlogPackage(input: {
  blogId: string;
  slug: string;
  title: string;
  content: CmsBlogContent;
}) {
  await cmsExecute(`UPDATE blog_posts SET content=?, updated_at=NOW() WHERE id=?`, [JSON.stringify([input.content]), input.blogId]);
  let featuredMediaId: string | null = null;

  for (const image of input.content.images) {
    const storageKey = `blogs/${input.slug}/${image.filename}`;
    const mediaId = randomUUID();
    await cmsExecute(
      `INSERT INTO media (id, storage_key, url, mime_type, alt_text, width, height, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'native-blog-import')
       ON DUPLICATE KEY UPDATE url=VALUES(url), mime_type=VALUES(mime_type), alt_text=VALUES(alt_text), width=VALUES(width), height=VALUES(height)`,
      [mediaId, storageKey, image.url, image.mimeType, image.altText, image.width || null, image.height || null],
    );
    const media = (await cmsQuery<{ id: string }>(`SELECT id FROM media WHERE storage_key=? LIMIT 1`, [storageKey])).rows[0];
    if (image.featured) featuredMediaId = media?.id || null;
  }

  if (featuredMediaId) {
    await cmsExecute(`UPDATE blog_posts SET featured_media_id=? WHERE id=?`, [featuredMediaId, input.blogId]);
  }

  const seo = input.content.optimization.seo;
  await cmsExecute(
    `INSERT INTO seo_metadata (id, entity_type, entity_id, title, description, canonical_url, robots_index, robots_follow, schema_json, updated_at)
     VALUES (?, 'blog_post', ?, ?, ?, ?, 0, 1, ?, NOW())
     ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), canonical_url=VALUES(canonical_url), robots_index=VALUES(robots_index), robots_follow=VALUES(robots_follow), schema_json=VALUES(schema_json), updated_at=NOW()`,
    [randomUUID(), input.blogId, seo.title, seo.description, `https://www.dgeniussolutions.com${seo.canonicalPath}`, JSON.stringify(input.content.optimization.schemas)],
  );
}

export async function getPublishedCmsBlogBySlug(slug: string) {
  return (await cmsQuery<CmsPublishedBlog>(
    `SELECT id, slug, title, excerpt, content, status, published_at, updated_at FROM blog_posts WHERE slug=? AND status='published' LIMIT 1`,
    [slug.toLowerCase()],
  )).rows[0] || null;
}

export async function publishCmsBlog(id: string) {
  await cmsExecute(
    `UPDATE blog_posts SET status='published', published_at=COALESCE(published_at, NOW()), updated_at=NOW() WHERE id=? AND status IN ('draft','review')`,
    [id],
  );
  const blog = (await cmsQuery<CmsBlogSummary>(
    `SELECT id, slug, title, status, published_at, updated_at FROM blog_posts WHERE id=? AND status='published' LIMIT 1`,
    [id],
  )).rows[0] || null;
  if (blog) await cmsExecute(`UPDATE seo_metadata SET robots_index=1, updated_at=NOW() WHERE entity_type='blog_post' AND entity_id=?`, [id]);
  return blog;
}

export async function listPublishedCmsBlogs(limit = 100) {
  const safeLimit = Math.min(Math.max(limit, 1), 200);
  return (await cmsQuery<CmsPublishedBlog>(
    `SELECT id, slug, title, excerpt, content, status, published_at, updated_at
     FROM blog_posts WHERE status='published'
     ORDER BY (published_at IS NULL), published_at DESC, updated_at DESC LIMIT ?`,
    [safeLimit],
  )).rows;
}

function stripHtmlText(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeContent(value: unknown): CmsBlogContent[] {
  if (Array.isArray(value)) return value as CmsBlogContent[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed as CmsBlogContent[] : [];
    } catch {
      return [];
    }
  }
  return [];
}

function buildCmsToc(html: string) {
  const toc: Array<{ id: string; text: string; level: 2 | 3 }> = [];
  const used = new Set<string>();
  const output = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (full, levelRaw, attrs, inner) => {
    const text = stripHtmlText(String(inner));
    if (!text) return full;
    const existing = String(attrs).match(/\sid=["']([^"']+)["']/i)?.[1];
    const base = existing || text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `section-${toc.length + 1}`;
    let id = base; let n = 2; while (used.has(id)) id = `${base}-${n++}`; used.add(id);
    toc.push({ id, text, level: Number(levelRaw) as 2 | 3 });
    const cleanAttrs = existing ? String(attrs).replace(/\sid=["'][^"']+["']/i, "") : String(attrs);
    return `<h${levelRaw}${cleanAttrs} id="${id}">${inner}</h${levelRaw}>`;
  });
  return { html: output, toc };
}

function extractCmsFaqs(html: string) {
  const faqs: Array<{ question: string; answer: string }> = [];
  for (const match of html.matchAll(/<h[23][^>]*>([\s\S]*?\?)<\/h[23]>\s*<p[^>]*>([\s\S]*?)<\/p>/gi)) {
    const question = stripHtmlText(match[1]);
    const answer = stripHtmlText(match[2]);
    if (question && answer) faqs.push({ question, answer });
  }
  return faqs.slice(0, 8);
}

export function cmsBlogToPublicPost(blog: CmsPublishedBlog) {
  const content = normalizeContent(blog.content)[0];
  if (!content) return null;
  const optimized = content.optimization;
  const anchored = buildCmsToc(content.bodyHtml);
  const featured = content.images.find((image) => image.featured && image.mimeType === "image/webp") || content.images.find((image) => image.mimeType === "image/webp");
  const text = stripHtmlText(anchored.html);
  return {
    path: optimized.seo.canonicalPath,
    slug: blog.slug,
    title: optimized.seo.title || blog.title,
    h1: optimized.seo.h1 || blog.title,
    description: optimized.seo.description || blog.excerpt || "",
    canonical: `https://www.dgeniussolutions.com${optimized.seo.canonicalPath}`,
    date: blog.published_at || undefined,
    modified: blog.updated_at || undefined,
    featuredImage: featured ? { src: featured.url, alt: featured.altText, width: featured.width, height: featured.height } : undefined,
    readingTimeMinutes: Math.max(3, Math.ceil(text.split(/\s+/).filter(Boolean).length / 200)),
    bodyHtml: anchored.html,
    faqs: extractCmsFaqs(anchored.html),
    toc: anchored.toc,
  };
}
