import { randomUUID } from "node:crypto";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import type { BlogOptimizationPackage } from "@/lib/cms/blog-import";
import { recordMediaUsage } from "@/lib/cms/media";
import { checkBlogCannibalizationRisk, type BlogCannibalizationReport } from "@/lib/seo/cannibalization";

export type StoredBlogImage = {
  filename: string;
  url: string;
  mimeType: string;
  featured: boolean;
  altText: string;
  width?: number;
  height?: number;
  bytes?: number;
};

export type StoredBlogVideo = {
  filename: string;
  url: string;
  mimeType: string;
  bytes?: number;
};

export type CmsBlogSummary = {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "review" | "scheduled" | "published";
  featured_image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  focus_keyword: string | null;
  word_count: number;
  reading_time_minutes: number;
  needs_review: boolean;
  scheduled_for: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CmsBlogContent = {
  version: 1;
  bodyHtml: string;
  sourceHash: string;
  optimization: BlogOptimizationPackage;
  images: StoredBlogImage[];
  videos?: StoredBlogVideo[];
};

export type CmsBlogDetail = CmsBlogSummary & {
  excerpt: string | null;
  content: CmsBlogContent;
};

export type CmsPublishedBlog = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: unknown;
  status: string;
  published_at: string | null;
  updated_at: string;
};

export type BlogFilterView =
  | "all"
  | "drafts"
  | "scheduled"
  | "published"
  | "needs_review"
  | "seo_issues"
  | "missing_images";

export type BlogViewCounts = {
  all: number;
  drafts: number;
  scheduled: number;
  published: number;
  needs_review: number;
  seo_issues: number;
  missing_images: number;
};

function normalizeContent(value: unknown): CmsBlogContent[] {
  if (Array.isArray(value)) return value as CmsBlogContent[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as CmsBlogContent[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function stripHtmlText(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();
}

// 1. List Blogs with Filtering, View Tabs, Search, and Counts
export async function listCmsBlogsDetailed(params?: {
  view?: BlogFilterView;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  blogs: CmsBlogSummary[];
  total: number;
  page: number;
  limit: number;
  counts: BlogViewCounts;
}> {
  const view = params?.view || "all";
  const search = params?.search?.trim() || "";
  const page = Math.max(1, Number(params?.page || 1));
  const limit = Math.min(Math.max(1, Number(params?.limit || 20)), 100);
  const offset = (page - 1) * limit;

  // Compute tab counts
  const [countsRows] = await Promise.all([
    cmsQuery<{
      total_all: number;
      total_drafts: number;
      total_scheduled: number;
      total_published: number;
      total_needs_review: number;
      total_seo_issues: number;
      total_missing_images: number;
    }>(
      `SELECT
        COUNT(*) AS total_all,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS total_drafts,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) AS total_scheduled,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS total_published,
        SUM(CASE WHEN needs_review = 1 OR status = 'review' THEN 1 ELSE 0 END) AS total_needs_review,
        SUM(CASE WHEN seo_title IS NULL OR seo_description IS NULL OR LENGTH(seo_description) < 60 OR word_count < 250 THEN 1 ELSE 0 END) AS total_seo_issues,
        SUM(CASE WHEN featured_image_url IS NULL OR featured_image_url = '' THEN 1 ELSE 0 END) AS total_missing_images
      FROM blog_posts`
    ),
  ]);

  const rawCounts = countsRows.rows[0] || {
    total_all: 0,
    total_drafts: 0,
    total_scheduled: 0,
    total_published: 0,
    total_needs_review: 0,
    total_seo_issues: 0,
    total_missing_images: 0,
  };

  const counts: BlogViewCounts = {
    all: Number(rawCounts.total_all || 0),
    drafts: Number(rawCounts.total_drafts || 0),
    scheduled: Number(rawCounts.total_scheduled || 0),
    published: Number(rawCounts.total_published || 0),
    needs_review: Number(rawCounts.total_needs_review || 0),
    seo_issues: Number(rawCounts.total_seo_issues || 0),
    missing_images: Number(rawCounts.total_missing_images || 0),
  };

  // Build WHERE conditions for current query
  const whereClauses: string[] = [];
  const queryArgs: unknown[] = [];

  switch (view) {
    case "drafts":
      whereClauses.push("status = 'draft'");
      break;
    case "scheduled":
      whereClauses.push("status = 'scheduled'");
      break;
    case "published":
      whereClauses.push("status = 'published'");
      break;
    case "needs_review":
      whereClauses.push("(needs_review = 1 OR status = 'review')");
      break;
    case "seo_issues":
      whereClauses.push("(seo_title IS NULL OR seo_description IS NULL OR LENGTH(seo_description) < 60 OR word_count < 250)");
      break;
    case "missing_images":
      whereClauses.push("(featured_image_url IS NULL OR featured_image_url = '')");
      break;
    case "all":
    default:
      break;
  }

  if (search) {
    whereClauses.push("(title LIKE ? OR slug LIKE ? OR focus_keyword LIKE ?)");
    queryArgs.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // Get total matching
  const countResult = await cmsQuery<{ total: number }>(
    `SELECT COUNT(*) as total FROM blog_posts ${whereSql}`,
    queryArgs
  );
  const total = Number(countResult.rows[0]?.total || 0);

  // Get paginated list
  const listSql = `
    SELECT
      id, slug, title, status, featured_image_url, seo_title, seo_description,
      focus_keyword, word_count, reading_time_minutes, needs_review,
      scheduled_for, published_at, created_at, updated_at
    FROM blog_posts
    ${whereSql}
    ORDER BY
      CASE WHEN status = 'scheduled' AND scheduled_for IS NOT NULL THEN 0 ELSE 1 END,
      scheduled_for ASC,
      updated_at DESC
    LIMIT ? OFFSET ?
  `;

  const listArgs = [...queryArgs, limit, offset];
  const listResult = await cmsQuery<CmsBlogSummary>(listSql, listArgs);

  return {
    blogs: listResult.rows.map((row) => ({
      ...row,
      needs_review: Boolean(row.needs_review),
    })),
    total,
    page,
    limit,
    counts,
  };
}

// 2. Simple list for backwards compatibility
export async function listCmsBlogs(limit = 50) {
  const result = await listCmsBlogsDetailed({ limit });
  return result.blogs;
}

// 3. Get Single Blog By ID
export async function getCmsBlogById(id: string): Promise<CmsBlogDetail | null> {
  const [blogRows, seoRows] = await Promise.all([
    cmsQuery<CmsBlogSummary & { excerpt: string | null; content: unknown }>(
      `SELECT * FROM blog_posts WHERE id = ? LIMIT 1`,
      [id]
    ),
    cmsQuery<{
      title: string;
      description: string;
      canonical_url: string;
      robots_index: number;
      robots_follow: number;
      schema_json: unknown;
    }>(
      `SELECT title, description, canonical_url, robots_index, robots_follow, schema_json FROM seo_metadata WHERE entity_type = 'blog_post' AND entity_id = ? LIMIT 1`,
      [id]
    ),
  ]);

  const blog = blogRows.rows[0];
  if (!blog) return null;

  const contentArray = normalizeContent(blog.content);
  const content = contentArray[0] || {
    version: 1,
    bodyHtml: "",
    sourceHash: "",
    optimization: {
      seo: {
        title: blog.seo_title || blog.title,
        description: blog.seo_description || blog.excerpt || "",
        h1: blog.title,
        canonicalPath: `/blogs/${blog.slug}/`,
        focusKeyword: blog.focus_keyword || "",
        secondaryKeywords: [],
      },
      aeo: { conciseAnswer: "", questions: [] },
      geo: { entities: [], topics: [], keyFacts: [] },
      llm: { answerSummary: "", citableFacts: [], semanticHeadings: [] },
      schemas: [],
      internalLinks: [],
    },
    images: [],
  };

  // Merge seo_metadata into optimization if available
  const seo = seoRows.rows[0];
  if (seo) {
    if (seo.title) content.optimization.seo.title = seo.title;
    if (seo.description) content.optimization.seo.description = seo.description;
    if (seo.schema_json) {
      const parsed = typeof seo.schema_json === "string" ? JSON.parse(seo.schema_json) : seo.schema_json;
      if (Array.isArray(parsed)) content.optimization.schemas = parsed;
    }
  }

  return {
    ...blog,
    needs_review: Boolean(blog.needs_review),
    content,
  };
}

// 4. Create Blog Post Manually
export type CreateCmsBlogInput = {
  title: string;
  slug: string;
  excerpt?: string;
  content?: unknown[];
  featured_image_url?: string;
  seo_title?: string;
  seo_description?: string;
  focus_keyword?: string;
  word_count?: number;
  reading_time_minutes?: number;
  status?: "draft" | "review";
};

export async function createCmsBlog(input: CreateCmsBlogInput): Promise<CmsBlogSummary> {
  const id = randomUUID();
  const slug = input.slug.trim().toLowerCase();
  const title = input.title.trim();
  const excerpt = input.excerpt?.trim() || null;
  const status = input.status || "draft";
  const featuredImageUrl = input.featured_image_url?.trim() || null;
  const seoTitle = input.seo_title?.trim() || title;
  const seoDescription = input.seo_description?.trim() || excerpt;
  const focusKeyword = input.focus_keyword?.trim() || null;
  const wordCount = Number(input.word_count || 0);
  const readingTime = Number(input.reading_time_minutes || Math.max(1, Math.ceil(wordCount / 200)));

  await cmsExecute(
    `INSERT INTO blog_posts (
      id, slug, title, excerpt, content, status, featured_image_url,
      seo_title, seo_description, focus_keyword, word_count,
      reading_time_minutes, needs_review, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
    [
      id,
      slug,
      title,
      excerpt,
      JSON.stringify(input.content || []),
      status,
      featuredImageUrl,
      seoTitle,
      seoDescription,
      focusKeyword,
      wordCount,
      readingTime,
    ]
  );

  const created = await cmsQuery<CmsBlogSummary>(
    `SELECT id, slug, title, status, featured_image_url, seo_title, seo_description,
            focus_keyword, word_count, reading_time_minutes, needs_review,
            scheduled_for, published_at, created_at, updated_at
     FROM blog_posts WHERE id = ? LIMIT 1`,
    [id]
  );

  const row = created.rows[0];
  if (!row) return null as unknown as CmsBlogSummary;
  return {
    ...row,
    needs_review: Boolean(row.needs_review),
  };
}

// 5. Update Blog Post
export type UpdateCmsBlogInput = {
  title?: string;
  slug?: string;
  excerpt?: string;
  bodyHtml?: string;
  featured_image_url?: string | null;
  status?: "draft" | "review" | "scheduled" | "published";
  scheduled_for?: string | null;
  needs_review?: boolean;
  optimization?: Partial<BlogOptimizationPackage>;
  updatedBy?: string | null;
};

export async function updateCmsBlog(id: string, input: UpdateCmsBlogInput): Promise<CmsBlogDetail | null> {
  const existing = await getCmsBlogById(id);
  if (!existing) return null;

  // Snapshot current state to blog_revisions prior to update
  try {
    await createBlogRevision(id, existing, input.updatedBy || null);
  } catch (revErr) {
    console.warn("Failed to create blog revision before update:", revErr);
  }

  const title = input.title !== undefined ? input.title.trim() : existing.title;
  const slug = input.slug !== undefined ? input.slug.trim().toLowerCase() : existing.slug;
  const excerpt = input.excerpt !== undefined ? input.excerpt?.trim() || null : existing.excerpt;
  const status = input.status !== undefined ? input.status : existing.status;
  const featuredImageUrl = input.featured_image_url !== undefined ? input.featured_image_url : existing.featured_image_url;
  const scheduledFor = input.scheduled_for !== undefined ? input.scheduled_for : existing.scheduled_for;
  const needsReview = input.needs_review !== undefined ? (input.needs_review ? 1 : 0) : (existing.needs_review ? 1 : 0);

  // Update content object
  const content = { ...existing.content };
  if (input.bodyHtml !== undefined) {
    content.bodyHtml = input.bodyHtml;
  }
  if (input.optimization) {
    content.optimization = {
      ...content.optimization,
      ...input.optimization,
      seo: { ...content.optimization.seo, ...(input.optimization.seo || {}) },
      aeo: { ...content.optimization.aeo, ...(input.optimization.aeo || {}) },
      geo: { ...content.optimization.geo, ...(input.optimization.geo || {}) },
      llm: { ...content.optimization.llm, ...(input.optimization.llm || {}) },
    };
  }

  // Recalculate word count & reading time
  const plainText = stripHtmlText(content.bodyHtml || "");
  const words = plainText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const seoTitle = content.optimization.seo.title || title;
  const seoDescription = content.optimization.seo.description || excerpt || "";
  const focusKeyword = content.optimization.seo.focusKeyword || null;

  await cmsExecute(
    `UPDATE blog_posts SET
      title = ?, slug = ?, excerpt = ?, content = ?, status = ?,
      featured_image_url = ?, seo_title = ?, seo_description = ?,
      focus_keyword = ?, word_count = ?, reading_time_minutes = ?,
      needs_review = ?, scheduled_for = ?, updated_at = NOW()
     WHERE id = ?`,
    [
      title,
      slug,
      excerpt,
      JSON.stringify([content]),
      status,
      featuredImageUrl,
      seoTitle,
      seoDescription,
      focusKeyword,
      wordCount,
      readingTimeMinutes,
      needsReview,
      scheduledFor,
      id,
    ]
  );

  // Sync seo_metadata
  const canonicalUrl = `https://www.dgeniussolutions.com/blogs/${slug}/`;
  await cmsExecute(
    `INSERT INTO seo_metadata (id, entity_type, entity_id, title, description, canonical_url, robots_index, robots_follow, schema_json, updated_at)
     VALUES (?, 'blog_post', ?, ?, ?, ?, ?, 1, ?, NOW())
     ON DUPLICATE KEY UPDATE
       title = VALUES(title),
       description = VALUES(description),
       canonical_url = VALUES(canonical_url),
       robots_index = VALUES(robots_index),
       schema_json = VALUES(schema_json),
       updated_at = NOW()`,
    [
      randomUUID(),
      id,
      seoTitle,
      seoDescription,
      canonicalUrl,
      status === "published" ? 1 : 0,
      JSON.stringify(content.optimization.schemas || []),
    ]
  );

  return getCmsBlogById(id);
}

// 6. Attach Imported Blog Package & Bind with Native Media CMS
export async function attachImportedBlogPackage(input: {
  blogId: string;
  slug: string;
  title: string;
  content: CmsBlogContent;
  featuredImageUrl?: string;
  featuredMediaAssetId?: string;
}) {
  const plainText = stripHtmlText(input.content.bodyHtml || "");
  const words = plainText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const seo = input.content.optimization.seo;
  const featuredUrl = input.featuredImageUrl || input.content.images.find((i) => i.featured)?.url || null;

  await cmsExecute(
    `UPDATE blog_posts SET
      content = ?,
      featured_image_url = ?,
      seo_title = ?,
      seo_description = ?,
      focus_keyword = ?,
      word_count = ?,
      reading_time_minutes = ?,
      needs_review = 1,
      status = 'review',
      updated_at = NOW()
     WHERE id = ?`,
    [
      JSON.stringify([input.content]),
      featuredUrl,
      seo.title || input.title,
      seo.description || "",
      seo.focusKeyword || null,
      wordCount,
      readingTimeMinutes,
      input.blogId,
    ]
  );

  // Record Media Usage in native Media CMS table
  if (input.featuredMediaAssetId) {
    try {
      await recordMediaUsage({
        mediaId: input.featuredMediaAssetId,
        entityType: "blog_post",
        entityId: input.blogId,
        route: `/blogs/${input.slug}/`,
        field: "featured_image",
      });
    } catch {
      // Non-blocking if media record is already bound
    }
  }

  // Update SEO metadata
  const canonicalUrl = `https://www.dgeniussolutions.com${seo.canonicalPath || `/blogs/${input.slug}/`}`;
  await cmsExecute(
    `INSERT INTO seo_metadata (id, entity_type, entity_id, title, description, canonical_url, robots_index, robots_follow, schema_json, updated_at)
     VALUES (?, 'blog_post', ?, ?, ?, ?, 0, 1, ?, NOW())
     ON DUPLICATE KEY UPDATE
       title = VALUES(title),
       description = VALUES(description),
       canonical_url = VALUES(canonical_url),
       robots_index = VALUES(robots_index),
       robots_follow = VALUES(robots_follow),
       schema_json = VALUES(schema_json),
       updated_at = NOW()`,
    [
      randomUUID(),
      input.blogId,
      seo.title || input.title,
      seo.description || "",
      canonicalUrl,
      JSON.stringify(input.content.optimization.schemas || []),
    ]
  );
}

// 7. Delete Draft/Review Blog
export async function deleteCmsDraftBlog(id: string) {
  await cmsExecute(`DELETE FROM seo_metadata WHERE entity_type='blog_post' AND entity_id=?`, [id]);
  await cmsExecute(`DELETE FROM media_usage WHERE entity_type='blog_post' AND entity_id=?`, [id]);
  await cmsExecute(`DELETE FROM blog_posts WHERE id=? AND status IN ('draft', 'review')`, [id]);
}

// 8. Pre-flight QA Validation before Publishing
export async function validateCmsBlogForPublish(id: string): Promise<{
  ok: boolean;
  errors: string[];
  warnings: string[];
  blog: CmsBlogDetail | null;
  cannibalization?: BlogCannibalizationReport;
}> {
  const blog = await getCmsBlogById(id);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!blog) {
    return { ok: false, errors: ["Blog not found"], warnings, blog: null };
  }

  // Slug collision check against other blogs
  const duplicateRows = await cmsQuery<{ id: string; title: string }>(
    `SELECT id, title FROM blog_posts WHERE slug = ? AND id != ? LIMIT 1`,
    [blog.slug.toLowerCase(), blog.id]
  );
  if (duplicateRows.rows.length > 0) {
    errors.push(`Slug collision: The slug "${blog.slug}" is already in use by blog "${duplicateRows.rows[0].title}".`);
  }

  const plainText = stripHtmlText(blog.content?.bodyHtml || "");
  if (plainText.length < 200) {
    errors.push("Blog content body is too short (minimum 200 characters required).");
  }

  const seo = blog.content?.optimization?.seo;
  if (!seo?.title?.trim()) {
    errors.push("SEO title is missing.");
  } else if (seo.title.length > 70) {
    warnings.push(`SEO title is long (${seo.title.length} chars; recommended <= 60 chars).`);
  }

  if (!seo?.description?.trim()) {
    errors.push("Meta description is missing.");
  } else if (seo.description.length < 50) {
    errors.push("Meta description is too short (minimum 50 characters).");
  } else if (seo.description.length > 165) {
    warnings.push(`Meta description is long (${seo.description.length} chars; recommended <= 155).`);
  }

  const canonicalPath = seo?.canonicalPath || `/blogs/${blog.slug}/`;
  if (canonicalPath !== `/blogs/${blog.slug}/`) {
    errors.push(`Canonical path (/blogs/${blog.slug}/) does not match SEO canonical (${canonicalPath}).`);
  }

  const aeo = blog.content?.optimization?.aeo;
  if (!aeo?.conciseAnswer?.trim()) {
    errors.push("AEO concise answer is missing (required for AI search optimization).");
  }

  const schemaTypes = new Set(
    (blog.content?.optimization?.schemas || []).map((s) => String(s?.["@type"] || ""))
  );
  if (!schemaTypes.has("BlogPosting")) {
    errors.push("Schema.org BlogPosting structured data is missing.");
  }
  if (!schemaTypes.has("BreadcrumbList")) {
    errors.push("Schema.org BreadcrumbList structured data is missing.");
  }

  if (!blog.featured_image_url && (!blog.content?.images || blog.content.images.length === 0)) {
    warnings.push("No featured image is set for this blog.");
  }

  // Image alt text checks
  const images = blog.content?.images || [];
  for (const img of images) {
    if (!img.altText || !img.altText.trim() || img.altText.length < 5) {
      warnings.push(`Image "${img.filename}" is missing descriptive alt text.`);
    }
  }

  // Cannibalization risk evaluation against protected core pages
  const cannibalization = checkBlogCannibalizationRisk({
    slug: blog.slug,
    title: blog.title,
    focusKeyword: blog.focus_keyword || seo?.focusKeyword || null,
    secondaryKeywords: seo?.secondaryKeywords || null,
    canonicalPath,
  });

  if (cannibalization.score >= 100) {
    errors.push(`Critical routing collision: ${cannibalization.reason}`);
  } else if (cannibalization.risk === "HIGH_OVERLAP") {
    warnings.push(`[Cannibalization Risk] Blog strongly competes with core service page: ${cannibalization.reason}`);
  } else if (cannibalization.risk === "REVIEW") {
    warnings.push(`[Cannibalization Advisory] Topical overlap detected: ${cannibalization.reason}`);
  }

  if (blog.needs_review) {
    warnings.push("Blog has unreviewed AI-generated SEO changes. Verify content and clear 'Needs Review' before going live.");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    blog,
    cannibalization,
  };
}

// 9. Publish Blog Immediately
export async function publishCmsBlog(id: string) {
  const qa = await validateCmsBlogForPublish(id);
  if (!qa.ok) {
    throw new Error(`Publish failed QA checks: ${qa.errors.join("; ")}`);
  }

  await cmsExecute(
    `UPDATE blog_posts SET
      status = 'published',
      needs_review = 0,
      scheduled_for = NULL,
      published_at = COALESCE(published_at, NOW()),
      updated_at = NOW()
     WHERE id = ?`,
    [id]
  );

  // Enable indexing in seo_metadata
  await cmsExecute(
    `UPDATE seo_metadata SET robots_index = 1, updated_at = NOW() WHERE entity_type = 'blog_post' AND entity_id = ?`,
    [id]
  );

  return getCmsBlogById(id);
}

// 10. Schedule Blog for Future Publication
export async function scheduleCmsBlog(id: string, scheduledFor: string) {
  const targetDate = new Date(scheduledFor);
  if (isNaN(targetDate.getTime()) || targetDate.getTime() <= Date.now()) {
    throw new Error("Scheduled publication date must be a valid future datetime.");
  }

  const qa = await validateCmsBlogForPublish(id);
  if (!qa.ok) {
    throw new Error(`Schedule failed QA checks: ${qa.errors.join("; ")}`);
  }

  await cmsExecute(
    `UPDATE blog_posts SET
      status = 'scheduled',
      scheduled_for = ?,
      updated_at = NOW()
     WHERE id = ?`,
    [targetDate.toISOString().slice(0, 19).replace("T", " "), id]
  );

  return getCmsBlogById(id);
}

// 11. Worker to Check and Automatically Publish Due Scheduled Blogs
export async function checkAndPublishScheduledBlogs(): Promise<string[]> {
  const dueRows = await cmsQuery<{ id: string; title: string }>(
    `SELECT id, title FROM blog_posts WHERE status = 'scheduled' AND scheduled_for IS NOT NULL AND scheduled_for <= NOW()`
  );

  const publishedIds: string[] = [];
  const { logAuditEvent } = await import("@/lib/cms/auth-db");

  for (const row of dueRows.rows) {
    try {
      const qa = await validateCmsBlogForPublish(row.id);
      if (!qa.ok) {
        console.warn(`Scheduled blog QA failed for "${row.title}" (${row.id}):`, qa.errors);
        await cmsExecute(
          `UPDATE blog_posts SET status = 'review', needs_review = 1, updated_at = NOW() WHERE id = ?`,
          [row.id]
        );
        await logAuditEvent({
          actor_email: "scheduler@dgeniussolutions.com",
          role: "system",
          action: "BLOG_SCHEDULE_QA_FAILED",
          resource: "blog_post",
          resource_id: row.id,
          summary: `Scheduled publish aborted for "${row.title}". QA failed: ${qa.errors.join("; ")}`,
          after_state: { qaErrors: qa.errors, status: "review", needs_review: true },
          status: "failure",
        });
        continue;
      }

      await publishCmsBlog(row.id);
      publishedIds.push(row.id);
      console.log(`Auto-published scheduled blog: "${row.title}" (${row.id})`);

      await logAuditEvent({
        actor_email: "scheduler@dgeniussolutions.com",
        role: "system",
        action: "BLOG_PUBLISHED",
        resource: "blog_post",
        resource_id: row.id,
        summary: `Auto-published scheduled blog "${row.title}"`,
        after_state: { status: "published" },
        status: "success",
      });
    } catch (err) {
      console.error(`Failed to auto-publish scheduled blog ${row.id}:`, err);
    }
  }

  return publishedIds;
}

// 12. List Published Blogs for Public Archive & Sitemaps
export async function listPublishedCmsBlogs(limit = 100): Promise<CmsPublishedBlog[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 200);
  const result = await cmsQuery<CmsPublishedBlog>(
    `SELECT id, slug, title, excerpt, content, status, published_at, updated_at
     FROM blog_posts
     WHERE status = 'published'
     ORDER BY (published_at IS NULL), published_at DESC, updated_at DESC
     LIMIT ?`,
    [safeLimit]
  );
  return result.rows;
}

// 13. Get Single Published Blog by Slug for Public Rendering
export async function getPublishedCmsBlogBySlug(slug: string): Promise<CmsPublishedBlog | null> {
  const result = await cmsQuery<CmsPublishedBlog>(
    `SELECT id, slug, title, excerpt, content, status, published_at, updated_at
     FROM blog_posts
     WHERE slug = ? AND status = 'published'
     LIMIT 1`,
    [slug.toLowerCase()]
  );
  return result.rows[0] || null;
}

// 14. Helper to Convert CMS Blog Row to Public Post for Frontend Renderer
export function cmsBlogToPublicPost(blog: CmsPublishedBlog) {
  const content = normalizeContent(blog.content)[0];
  if (!content) return null;
  const optimized = content.optimization;
  const featured = content.images?.find((img) => img.featured) || content.images?.[0];
  const text = stripHtmlText(content.bodyHtml || "");

  // Build TOC
  const toc: Array<{ id: string; text: string; level: 2 | 3 }> = [];
  const usedIds = new Set<string>();
  const anchoredHtml = content.bodyHtml.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (full, levelRaw, attrs, inner) => {
      const headingText = stripHtmlText(String(inner));
      if (!headingText) return full;
      const existingId = String(attrs).match(/\sid=["']([^"']+)["']/i)?.[1];
      const baseId =
        existingId ||
        headingText
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") ||
        `section-${toc.length + 1}`;
      let id = baseId;
      let counter = 2;
      while (usedIds.has(id)) id = `${baseId}-${counter++}`;
      usedIds.add(id);

      toc.push({ id, text: headingText, level: Number(levelRaw) as 2 | 3 });
      const cleanAttrs = existingId ? String(attrs).replace(/\sid=["'][^"']+["']/i, "") : String(attrs);
      return `<h${levelRaw}${cleanAttrs} id="${id}">${inner}</h${levelRaw}>`;
    }
  );

  // Extract FAQs
  const faqs: Array<{ question: string; answer: string }> = [];
  for (const match of anchoredHtml.matchAll(
    /<h[23][^>]*>([\s\S]*?\?)<\/h[23]>\s*<p[^>]*>([\s\S]*?)<\/p>/gi
  )) {
    const q = stripHtmlText(match[1]);
    const a = stripHtmlText(match[2]);
    if (q && a) faqs.push({ question: q, answer: a });
  }

  return {
    path: optimized.seo.canonicalPath || `/blogs/${blog.slug}/`,
    slug: blog.slug,
    title: optimized.seo.title || blog.title,
    h1: optimized.seo.h1 || blog.title,
    description: optimized.seo.description || blog.excerpt || "",
    canonical: `https://www.dgeniussolutions.com${optimized.seo.canonicalPath || `/blogs/${blog.slug}/`}`,
    date: blog.published_at || undefined,
    modified: blog.updated_at || undefined,
    featuredImage: featured
      ? {
          src: featured.url,
          alt: featured.altText,
          width: featured.width,
          height: featured.height,
        }
      : undefined,
    readingTimeMinutes: Math.max(3, Math.ceil(text.split(/\s+/).filter(Boolean).length / 200)),
    bodyHtml: anchoredHtml,
    faqs: faqs.slice(0, 8),
    toc,
  };
}

// 15. Blog Revisions Management & Rollback
export type BlogRevision = {
  id: string;
  blog_post_id: string;
  snapshot: CmsBlogDetail;
  created_by: string | null;
  created_at: string;
};

export async function createBlogRevision(
  blogPostId: string,
  snapshot: unknown,
  createdBy?: string | null
): Promise<string> {
  const revisionId = randomUUID();
  await cmsExecute(
    `INSERT INTO blog_revisions (id, blog_post_id, snapshot, created_by, created_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [
      revisionId,
      blogPostId,
      typeof snapshot === "string" ? snapshot : JSON.stringify(snapshot),
      createdBy || null,
    ]
  );
  return revisionId;
}

export async function listBlogRevisions(blogPostId: string): Promise<BlogRevision[]> {
  const result = await cmsQuery<{
    id: string;
    blog_post_id: string;
    snapshot: unknown;
    created_by: string | null;
    created_at: string;
  }>(
    `SELECT id, blog_post_id, snapshot, created_by, created_at
     FROM blog_revisions
     WHERE blog_post_id = ?
     ORDER BY created_at DESC
     LIMIT 50`,
    [blogPostId]
  );

  return result.rows.map((r) => {
    let parsedSnapshot: CmsBlogDetail;
    try {
      parsedSnapshot = typeof r.snapshot === "string" ? JSON.parse(r.snapshot) : (r.snapshot as CmsBlogDetail);
    } catch {
      parsedSnapshot = r.snapshot as CmsBlogDetail;
    }
    return {
      id: r.id,
      blog_post_id: r.blog_post_id,
      snapshot: parsedSnapshot,
      created_by: r.created_by,
      created_at: r.created_at,
    };
  });
}

export async function getBlogRevisionById(revisionId: string): Promise<BlogRevision | null> {
  const result = await cmsQuery<{
    id: string;
    blog_post_id: string;
    snapshot: unknown;
    created_by: string | null;
    created_at: string;
  }>(
    `SELECT id, blog_post_id, snapshot, created_by, created_at
     FROM blog_revisions
     WHERE id = ?
     LIMIT 1`,
    [revisionId]
  );

  const row = result.rows[0];
  if (!row) return null;

  let parsedSnapshot: CmsBlogDetail;
  try {
    parsedSnapshot = typeof row.snapshot === "string" ? JSON.parse(row.snapshot) : (row.snapshot as CmsBlogDetail);
  } catch {
    parsedSnapshot = row.snapshot as CmsBlogDetail;
  }

  return {
    id: row.id,
    blog_post_id: row.blog_post_id,
    snapshot: parsedSnapshot,
    created_by: row.created_by,
    created_at: row.created_at,
  };
}

export async function restoreBlogRevision(
  blogPostId: string,
  revisionId: string,
  userId?: string | null
): Promise<CmsBlogDetail> {
  const current = await getCmsBlogById(blogPostId);
  if (!current) throw new Error("Blog not found");

  const targetRevision = await getBlogRevisionById(revisionId);
  if (!targetRevision || targetRevision.blog_post_id !== blogPostId) {
    throw new Error("Revision not found or does not belong to this blog");
  }

  // 1. Safety pre-restore snapshot of current state
  await createBlogRevision(blogPostId, current, userId);

  // 2. Restore state from snapshot
  const snap = targetRevision.snapshot;
  const content = snap.content;
  const seo = content?.optimization?.seo;

  await cmsExecute(
    `UPDATE blog_posts SET
      title = ?,
      slug = ?,
      excerpt = ?,
      content = ?,
      featured_image_url = ?,
      seo_title = ?,
      seo_description = ?,
      focus_keyword = ?,
      word_count = ?,
      reading_time_minutes = ?,
      status = 'review',
      needs_review = 1,
      updated_at = NOW()
     WHERE id = ?`,
    [
      snap.title,
      snap.slug,
      snap.excerpt || null,
      JSON.stringify([content]),
      snap.featured_image_url || null,
      snap.seo_title || seo?.title || snap.title,
      snap.seo_description || seo?.description || null,
      snap.focus_keyword || seo?.focusKeyword || null,
      snap.word_count || 0,
      snap.reading_time_minutes || 1,
      blogPostId,
    ]
  );

  // Sync SEO metadata
  if (seo) {
    const canonicalUrl = `https://www.dgeniussolutions.com${seo.canonicalPath || `/blogs/${snap.slug}/`}`;
    await cmsExecute(
      `INSERT INTO seo_metadata (id, entity_type, entity_id, title, description, canonical_url, robots_index, robots_follow, schema_json, updated_at)
       VALUES (?, 'blog_post', ?, ?, ?, ?, 0, 1, ?, NOW())
       ON DUPLICATE KEY UPDATE
         title = VALUES(title),
         description = VALUES(description),
         canonical_url = VALUES(canonical_url),
         robots_index = VALUES(robots_index),
         robots_follow = VALUES(robots_follow),
         schema_json = VALUES(schema_json),
         updated_at = NOW()`,
      [
        randomUUID(),
        blogPostId,
        snap.seo_title || seo.title || snap.title,
        snap.seo_description || seo.description || "",
        canonicalUrl,
        JSON.stringify(content?.optimization?.schemas || []),
      ]
    );
  }

  const { logAuditEvent } = await import("@/lib/cms/auth-db");
  await logAuditEvent({
    user_id: userId || null,
    actor_email: "admin@dgeniussolutions.com",
    role: "admin",
    action: "BLOG_REVISION_RESTORED",
    resource: "blog_post",
    resource_id: blogPostId,
    summary: `Restored blog "${snap.title}" from revision ${revisionId}`,
    before_state: { title: current.title, slug: current.slug, status: current.status },
    after_state: { title: snap.title, slug: snap.slug, status: "review", restoredRevisionId: revisionId },
    status: "success",
  });

  const restored = await getCmsBlogById(blogPostId);
  if (!restored) throw new Error("Failed to load restored blog");
  return restored;
}

