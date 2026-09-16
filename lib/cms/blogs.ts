import "server-only";
import { cmsQuery } from "@/lib/cms/db";

export type CmsBlogSummary = {
  id: string;
  slug: string;
  title: string;
  status: string;
  published_at: string | null;
  updated_at: string;
};

export async function listCmsBlogs(limit = 50) {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const result = await cmsQuery<CmsBlogSummary>(
    `SELECT id, slug, title, status, published_at, updated_at
     FROM blog_posts
     ORDER BY updated_at DESC
     LIMIT $1`,
    [safeLimit],
  );
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
    [
      input.title.trim(),
      input.slug.trim().toLowerCase(),
      input.excerpt?.trim() || null,
      JSON.stringify(input.content || []),
    ],
  );
  return result.rows[0];
}
