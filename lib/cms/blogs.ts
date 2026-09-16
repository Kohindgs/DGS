import "server-only";
import { cmsQuery } from "@/lib/cms/db";
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
  content: CmsBlogContent[];
};

export async function listCmsBlogs(limit = 50) {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const result = await cmsQuery<CmsBlogSummary>(
    `SELECT id, slug, title, status, published_at, updated_at
     FROM blog_posts ORDER BY updated_at DESC LIMIT $1`, [safeLimit]);
  return result.rows;
}
export type CreateCmsBlogInput = {
  title: string;
  slug: string;
  excerpt?: string;
  content?: unknown[];
};

export async function createCmsBlog(input: CreateCmsBlogInput) {
  const result = await cmsQuery<CmsBlogSummary>(
    `INSERT INTO blog_posts (title, slug, excerpt, content, status)
     VALUES ($1, $2, $3, $4::jsonb, 'draft')
     RETURNING id, slug, title, status, published_at, updated_at`,
    [input.title.trim(), input.slug.trim().toLowerCase(), input.excerpt?.trim() || null, JSON.stringify(input.content || [])],
  );
  return result.rows[0];
}

export async function attachImportedBlogPackage(input: {
  blogId: string;
  slug: string;
  title: string;
  content: CmsBlogContent;
}) {
  await cmsQuery(`UPDATE blog_posts SET content=$2::jsonb, updated_at=now() WHERE id=$1`, [input.blogId, JSON.stringify([input.content])]);
  let featuredMediaId: string | null = null;

  for (const image of input.content.images) {
    const media = await cmsQuery<{ id: string }>(
      `INSERT INTO media (storage_key, url, mime_type, alt_text, width, height, source)
       VALUES ($1,$2,$3,$4,$5,$6,'native-blog-import')
       ON CONFLICT (storage_key) DO UPDATE SET url=EXCLUDED.url, mime_type=EXCLUDED.mime_type, alt_text=EXCLUDED.alt_text, width=EXCLUDED.width, height=EXCLUDED.height
       RETURNING id`,
      [`blogs/${input.slug}/${image.filename}`, image.url, image.mimeType, image.altText, image.width || null, image.height || null],
    );
    if (image.featured) featuredMediaId = media.rows[0]?.id || null;
  }

  if (featuredMediaId) {
    await cmsQuery(`UPDATE blog_posts SET featured_media_id=$2 WHERE id=$1`, [input.blogId, featuredMediaId]);
  }
  const seo = input.content.optimization.seo;
  await cmsQuery(
    `INSERT INTO seo_metadata (entity_type, entity_id, title, description, canonical_url, robots_index, robots_follow, schema_json, updated_at)
     VALUES ('blog_post',$1,$2,$3,$4,false,true,$5::jsonb,now())
     ON CONFLICT (entity_type, entity_id) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, canonical_url=EXCLUDED.canonical_url, robots_index=EXCLUDED.robots_index, robots_follow=EXCLUDED.robots_follow, schema_json=EXCLUDED.schema_json, updated_at=now()`,
    [input.blogId, seo.title, seo.description, `https://www.dgeniussolutions.com${seo.canonicalPath}`, JSON.stringify(input.content.optimization.schemas)],
  );
}

export async function getPublishedCmsBlogBySlug(slug: string) {
  const result = await cmsQuery<CmsPublishedBlog>(
    `SELECT id, slug, title, excerpt, content, status, published_at, updated_at
     FROM blog_posts WHERE slug=$1 AND status='published' LIMIT 1`,
    [slug.toLowerCase()],
  );
  return result.rows[0] || null;
}

export async function publishCmsBlog(id: string) {
  const result = await cmsQuery<CmsBlogSummary>(
    `UPDATE blog_posts SET status='published', published_at=COALESCE(published_at, now()), updated_at=now()
     WHERE id=$1 AND status IN ('draft','review')
     RETURNING id, slug, title, status, published_at, updated_at`,
    [id],
  );
  if (result.rows[0]) {
    await cmsQuery(`UPDATE seo_metadata SET robots_index=true, updated_at=now() WHERE entity_type='blog_post' AND entity_id=$1`, [id]);
  }
  return result.rows[0] || null;
}

export async function listPublishedCmsBlogs(limit = 100) {
  const safeLimit = Math.min(Math.max(limit, 1), 200);
  const result = await cmsQuery<CmsPublishedBlog>(
    `SELECT id, slug, title, excerpt, content, status, published_at, updated_at
     FROM blog_posts WHERE status='published'
     ORDER BY published_at DESC NULLS LAST, updated_at DESC LIMIT $1`,
    [safeLimit],
  );
  return result.rows;
}

function stripHtmlText(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();
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
  const content = blog.content?.[0];
  if (!content) return null;
  const optimized = content.optimization;
  const anchored = buildCmsToc(content.bodyHtml);
  const featured = content.images.find((image) => image.featured) || content.images[0];
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
