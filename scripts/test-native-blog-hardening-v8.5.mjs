import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  evaluateMediaMatch,
  imageMatchesSlug,
} from "../lib/cms/blog-import.ts";

import {
  DGS_PROTECTED_CORE_PAGES,
  checkBlogCannibalizationRisk,
} from "../lib/seo/cannibalization.ts";

const ROOT_DIR = process.cwd();

test("1. evaluateMediaMatch provides confidence-scored media matching", () => {
  // EXACT match
  const exact = evaluateMediaMatch("ai-search-optimization-trends.jpg", "ai-search-optimization-trends");
  assert.equal(exact.matched, true);
  assert.equal(exact.confidence, "EXACT");
  assert.equal(exact.score, 100);

  // EXACT match with role suffix
  const exactFeatured = evaluateMediaMatch("ai-search-optimization-trends-featured.webp", "ai-search-optimization-trends");
  assert.equal(exactFeatured.matched, true);
  assert.equal(exactFeatured.confidence, "EXACT");
  assert.equal(exactFeatured.score, 95);
  assert.equal(exactFeatured.isFeaturedCandidate, true);

  // HIGH match: stem prefix alignment
  const highPrefix = evaluateMediaMatch("ai-search-optimization-trends-2026-guide.png", "ai-search-optimization-trends");
  assert.equal(highPrefix.matched, true);
  assert.equal(highPrefix.confidence, "HIGH");
  assert.ok(highPrefix.score >= 80);

  // MEDIUM match: moderate token overlap with title
  const medium = evaluateMediaMatch(
    "generative-search-landscape.jpg",
    "the-evolution-of-generative-search-in-digital-marketing",
    "The Evolution of Generative Search in Modern Digital Marketing"
  );
  assert.equal(medium.matched, true);
  assert.equal(medium.confidence, "MEDIUM");
  assert.ok(medium.score >= 60);

  // LOW match: only single generic token matches
  const low = evaluateMediaMatch("office-search-meeting.jpg", "ai-search-optimization-trends");
  assert.equal(low.matched, false);
  assert.equal(low.confidence, "LOW");
  assert.ok(low.score <= 40);

  // UNMATCHED: completely unrelated
  const unmatched = evaluateMediaMatch("mumbai-skyline-photo.jpg", "ai-search-optimization-trends");
  assert.equal(unmatched.matched, false);
  assert.equal(unmatched.confidence, "UNMATCHED");
  assert.equal(unmatched.score, 0);
});


test("2. imageMatchesSlug preserves backward compatibility with boolean return", () => {
  assert.equal(imageMatchesSlug("ai-search-trends.jpg", "ai-search-trends"), true);
  assert.equal(imageMatchesSlug("ai-search-trends-hero.jpg", "ai-search-trends"), true);
  assert.equal(imageMatchesSlug("completely-unrelated-file.png", "ai-search-trends"), false);
});

test("3. Protected core pages catalog defines all 8 core strategic routes", () => {
  assert.ok(Array.isArray(DGS_PROTECTED_CORE_PAGES));
  assert.equal(DGS_PROTECTED_CORE_PAGES.length, 8);

  const urls = DGS_PROTECTED_CORE_PAGES.map((p) => p.pageUrl);
  assert.ok(urls.includes("/"), "Must protect Home");
  assert.ok(urls.includes("/services/seo-services-in-mumbai/"), "Must protect SEO Services in Mumbai");
  assert.ok(urls.includes("/services/ai-video-production-agency/"), "Must protect AI Video Production Agency");
  assert.ok(urls.includes("/services/performance-marketing/"), "Must protect Performance Marketing");
  assert.ok(urls.includes("/services/aeo-services-in-mumbai/"), "Must protect AEO Services in Mumbai");
  assert.ok(urls.includes("/services/geo/"), "Must protect GEO Services in Mumbai");
  assert.ok(urls.includes("/services/llm-seo-service/"), "Must protect LLM SEO Services");
  assert.ok(urls.includes("/aeo-dubai"), "Must protect AEO Dubai");
});

test("4. checkBlogCannibalizationRisk flags direct core route collisions with score 100", () => {
  const directCollision = checkBlogCannibalizationRisk({
    slug: "seo-services-in-mumbai",
    title: "SEO Services in Mumbai",
    canonicalPath: "/services/seo-services-in-mumbai/",
  });

  assert.equal(directCollision.risk, "HIGH_OVERLAP");
  assert.equal(directCollision.score, 100);
  assert.ok(directCollision.conflictingPages.length > 0);
  assert.ok(directCollision.conflictingPages[0].reason.includes("Direct canonical path collision"));
});

test("5. checkBlogCannibalizationRisk flags commercial keyword target on core pages", () => {
  const commercialCollision = checkBlogCannibalizationRisk({
    slug: "best-seo-agency-mumbai-guide",
    title: "Best SEO Services in Mumbai for 2026",
    focusKeyword: "seo services in mumbai",
  });

  assert.equal(commercialCollision.risk, "HIGH_OVERLAP");
  assert.ok(commercialCollision.score >= 75);
  assert.ok(commercialCollision.recommendations.length > 0);
});

test("6. checkBlogCannibalizationRisk passes SAFE for non-competing informational blog posts", () => {
  const safeBlog = checkBlogCannibalizationRisk({
    slug: "future-of-multimodal-vector-search-embeddings",
    title: "Understanding Multimodal Vector Embeddings in Information Retrieval",
    focusKeyword: "multimodal vector search embeddings",
    secondaryKeywords: ["dense retrieval", "approximate nearest neighbor", "cross encoder reranking"],
  });

  assert.equal(safeBlog.risk, "SAFE");
  assert.ok(safeBlog.score < 40);
  assert.equal(safeBlog.conflictingPages.length, 0);
});

test("7. Blog Revisions table exists in schema.sql", () => {
  const schemaPath = path.join(ROOT_DIR, "db", "schema.sql");
  const schemaContent = fs.readFileSync(schemaPath, "utf-8");
  assert.ok(schemaContent.includes("CREATE TABLE IF NOT EXISTS blog_revisions"));
  assert.ok(schemaContent.includes("blog_post_id CHAR(36) NOT NULL"));
  assert.ok(schemaContent.includes("snapshot JSON NOT NULL"));
});

test("8. Blog Revisions management functions are exported from lib/cms/blogs.ts", () => {
  const blogsTs = fs.readFileSync(path.join(ROOT_DIR, "lib", "cms", "blogs.ts"), "utf-8");
  assert.ok(blogsTs.includes("export async function createBlogRevision"), "createBlogRevision must be exported");
  assert.ok(blogsTs.includes("export async function listBlogRevisions"), "listBlogRevisions must be exported");
  assert.ok(blogsTs.includes("export async function getBlogRevisionById"), "getBlogRevisionById must be exported");
  assert.ok(blogsTs.includes("export async function restoreBlogRevision"), "restoreBlogRevision must be exported");
});

test("9. restoreBlogRevision creates safety backup snapshot before restoring", () => {
  const blogsTs = fs.readFileSync(path.join(ROOT_DIR, "lib", "cms", "blogs.ts"), "utf-8");
  assert.ok(
    blogsTs.includes("createBlogRevision(blogPostId, current, userId)"),
    "restoreBlogRevision must capture safety snapshot before overwriting"
  );
  assert.ok(
    blogsTs.includes("BLOG_REVISION_RESTORED"),
    "restoreBlogRevision must log BLOG_REVISION_RESTORED audit event"
  );
});

test("10. updateCmsBlog snapshots revision prior to applying changes", () => {
  const blogsTs = fs.readFileSync(path.join(ROOT_DIR, "lib", "cms", "blogs.ts"), "utf-8");
  assert.ok(
    blogsTs.includes("await createBlogRevision(id, existing, input.updatedBy || null)"),
    "updateCmsBlog must create revision before modifying"
  );
});

test("11. validateCmsBlogForPublish checks slug collisions, alt text, and cannibalization", () => {
  const blogsTs = fs.readFileSync(path.join(ROOT_DIR, "lib", "cms", "blogs.ts"), "utf-8");
  assert.ok(blogsTs.includes("Slug collision:"), "Must check for duplicate slugs");
  assert.ok(blogsTs.includes("is missing descriptive alt text"), "Must check for missing alt text");
  assert.ok(blogsTs.includes("checkBlogCannibalizationRisk"), "Must run cannibalization check");
  assert.ok(blogsTs.includes("cannibalization,"), "Must return cannibalization report in QA result");
});

test("12. checkAndPublishScheduledBlogs validates QA before publishing and logs failure to review", () => {
  const blogsTs = fs.readFileSync(path.join(ROOT_DIR, "lib", "cms", "blogs.ts"), "utf-8");
  assert.ok(blogsTs.includes("const qa = await validateCmsBlogForPublish(row.id)"), "Must run pre-publish QA on scheduled blogs");
  assert.ok(blogsTs.includes("BLOG_SCHEDULE_QA_FAILED"), "Must log audit failure if QA fails");
  assert.ok(blogsTs.includes("status = 'review', needs_review = 1"), "Must revert failing scheduled blog to review");
  assert.ok(blogsTs.includes("BLOG_PUBLISHED"), "Must log BLOG_PUBLISHED on successful publication");
});

test("13. Internal scheduled publisher endpoint enforces strict DGS_CRON_SECRET Bearer auth", () => {
  const routePath = path.join(ROOT_DIR, "app", "api", "internal", "blogs", "publish-scheduled", "route.ts");
  assert.ok(fs.existsSync(routePath), "Internal scheduled publish route must exist");
  const content = fs.readFileSync(routePath, "utf-8");
  assert.ok(content.includes("DGS_CRON_SECRET"), "Must check DGS_CRON_SECRET");
  assert.ok(content.includes("Bearer "), "Must verify Bearer token");
  assert.ok(content.includes("status: 401"), "Must return 401 for invalid auth");
  assert.ok(content.includes("status: 405"), "Must return 405 on GET request");
  assert.ok(content.includes("checkAndPublishScheduledBlogs"), "Must invoke scheduled publish worker");
});

test("14. Admin scheduled publisher endpoint exists and requires admin session", () => {
  const routePath = path.join(ROOT_DIR, "app", "api", "admin", "blogs", "publish-scheduled", "route.ts");
  assert.ok(fs.existsSync(routePath), "Admin scheduled publish route must exist");
  const content = fs.readFileSync(routePath, "utf-8");
  assert.ok(content.includes("hasAdminSession"), "Must require admin session");
  assert.ok(content.includes("checkAndPublishScheduledBlogs"), "Must invoke scheduled publish worker");
});

test("15. Dedicated GitHub Actions workflow file exists and schedules publish checks every 30 minutes", () => {
  const workflowPath = path.join(ROOT_DIR, ".github", "workflows", "scheduled-blog-publisher.yml");
  assert.ok(fs.existsSync(workflowPath), "Workflow file must exist");
  const content = fs.readFileSync(workflowPath, "utf-8");
  assert.ok(content.includes("cron: '*/30 * * * *'"), "Must run every 30 minutes");
  assert.ok(content.includes("secrets.DGS_CRON_SECRET"), "Must use DGS_CRON_SECRET");
  assert.ok(content.includes("/api/internal/blogs/publish-scheduled"), "Must call publish-scheduled endpoint");
  assert.ok(content.includes('HTTP_STATUS" != "200"'), "Must fail if HTTP status is not 200");
});

test("16. Revisions API routes exist (list and restore)", () => {
  const listRoute = path.join(ROOT_DIR, "app", "api", "admin", "blogs", "[id]", "revisions", "route.ts");
  const restoreRoute = path.join(ROOT_DIR, "app", "api", "admin", "blogs", "[id]", "revisions", "[revisionId]", "restore", "route.ts");
  assert.ok(fs.existsSync(listRoute), "Revisions listing route must exist");
  assert.ok(fs.existsSync(restoreRoute), "Revision restore route must exist");

  const listContent = fs.readFileSync(listRoute, "utf-8");
  assert.ok(listContent.includes("listBlogRevisions"), "Must call listBlogRevisions");

  const restoreContent = fs.readFileSync(restoreRoute, "utf-8");
  assert.ok(restoreContent.includes("restoreBlogRevision"), "Must call restoreBlogRevision");
});

test("17. Cannibalization API route exists", () => {
  const routePath = path.join(ROOT_DIR, "app", "api", "admin", "blogs", "[id]", "cannibalization", "route.ts");
  assert.ok(fs.existsSync(routePath), "Cannibalization check route must exist");
  const content = fs.readFileSync(routePath, "utf-8");
  assert.ok(content.includes("checkBlogCannibalizationRisk"), "Must call checkBlogCannibalizationRisk");
});

test("18. Audit logging is wired across all Blog CMS actions", () => {
  const importRoute = fs.readFileSync(path.join(ROOT_DIR, "app", "api", "admin", "blogs", "import", "route.ts"), "utf-8");
  const idRoute = fs.readFileSync(path.join(ROOT_DIR, "app", "api", "admin", "blogs", "[id]", "route.ts"), "utf-8");
  const publishRoute = fs.readFileSync(path.join(ROOT_DIR, "app", "api", "admin", "blogs", "[id]", "publish", "route.ts"), "utf-8");
  const scheduleRoute = fs.readFileSync(path.join(ROOT_DIR, "app", "api", "admin", "blogs", "[id]", "schedule", "route.ts"), "utf-8");

  assert.ok(importRoute.includes("BLOG_IMPORTED"), "Import route must log BLOG_IMPORTED");
  assert.ok(idRoute.includes("BLOG_UPDATED"), "ID route PATCH must log BLOG_UPDATED");
  assert.ok(idRoute.includes("BLOG_DELETED"), "ID route DELETE must log BLOG_DELETED");
  assert.ok(publishRoute.includes("BLOG_PUBLISHED"), "Publish route must log BLOG_PUBLISHED");
  assert.ok(scheduleRoute.includes("BLOG_SCHEDULED"), "Schedule route must log BLOG_SCHEDULED");
});

test("19. BlogImporter retains originals copy and renders confidence badges", () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, "app", "admin", "blogs", "BlogImporter.tsx"), "utf-8");
  assert.ok(
    content.includes("Originals and optimized WebP/WebM variants are preserved in persistent CMS media storage"),
    "BlogImporter copy must reflect that originals and variants are preserved"
  );
  assert.ok(content.includes("MATCH"), "Must render match confidence badge");
  assert.ok(content.includes("Low Confidence Media"), "Must render low confidence warnings");
});

test("20. BlogsManagerView provides Tab 7 Revisions & Rollback and Cannibalization card", () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, "app", "admin", "blogs", "BlogsManagerView.tsx"), "utf-8");
  assert.ok(content.includes("7. Revisions & Rollback"), "Must include Tab 7 button");
  assert.ok(content.includes("Core Page Cannibalization Shield"), "Must include Cannibalization Shield card in SEO tab");
  assert.ok(content.includes("handleRestoreRevision"), "Must include revision restore handler");
  assert.ok(content.includes("fetchRevisions"), "Must include revision fetch handler");
});
