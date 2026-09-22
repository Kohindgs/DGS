import assert from "node:assert/strict";
import {
  createCmsBlog,
  listCmsBlogsDetailed,
  getCmsBlogById,
  updateCmsBlog,
  validateCmsBlogForPublish,
  publishCmsBlog,
  scheduleCmsBlog,
  deleteCmsDraftBlog,
} from "../lib/cms/blogs.ts";

async function runTest() {
  console.log("==================================================");
  console.log("RUNNING BLOG CMS END-TO-END VERIFICATION ON HOSTINGER");
  console.log("==================================================");

  const testSlug = `e2e-test-blog-${Date.now()}`;
  const testTitle = "E2E Test Blog: AI Search Optimization Strategies";

  // Step 1: Create Draft Blog
  console.log("\n[Step 1] Creating Blog Draft...");
  const created = await createCmsBlog({
    title: testTitle,
    slug: testSlug,
    excerpt: "Comprehensive strategies for optimizing brand content for generative AI search engines.",
    featured_image_url: "/cms-media/thumbnails/test-thumb.webp",
    seo_title: "AI Search Optimization Strategies | D'Genius Solutions",
    seo_description: "Learn how to optimize brand content for generative AI search engines like ChatGPT, Perplexity, and Google AI Overviews with proven techniques.",
    focus_keyword: "AI search optimization",
    word_count: 350,
    reading_time_minutes: 2,
    status: "draft",
  });

  assert(created && created.id, "Failed to create draft blog");
  assert.equal(created.needs_review, true, "New blogs must be marked needs_review = true by default");
  console.log(`✓ Draft created with ID: ${created.id}`);
  console.log(`✓ needs_review: ${created.needs_review}`);

  // Step 2: Query Blogs with View Filtering
  console.log("\n[Step 2] Testing View Tabs & Counters...");
  const listData = await listCmsBlogsDetailed({ view: "needs_review", limit: 10 });
  assert(listData.counts.needs_review > 0, "Counter for needs_review should be > 0");
  const found = listData.blogs.some((b) => b.id === created.id);
  assert(found, "Newly created blog must appear in 'needs_review' view");
  console.log(`✓ Blog successfully listed in needs_review view`);
  console.log(`✓ Total counts: all=${listData.counts.all}, needs_review=${listData.counts.needs_review}, drafts=${listData.counts.drafts}`);

  // Step 3: Update Blog Content & Optimization Package
  console.log("\n[Step 3] Updating Content Body & Optimization Package...");
  const bodyHtml = `
    <h2>The Evolution of Search Engines</h2>
    <p>Search has evolved beyond ten blue links into answer engines. Investing in search engine optimization services in Mumbai ensures sustained visibility across multimodal models.</p>
    <h2>Core Pillars of AI Visibility</h2>
    <p>Organizations must focus on direct citable facts, authoritative structured data, and high-entropy knowledge graphs.</p>
  `;

  const updated = await updateCmsBlog(created.id, {
    bodyHtml,
    needs_review: false, // Editor marks as reviewed
    optimization: {
      seo: {
        title: "AI Search Optimization Strategies | DGS Guide",
        description: "Learn how to optimize brand content for generative AI search engines like ChatGPT, Perplexity, and Google AI Overviews with proven techniques.",
        h1: testTitle,
        canonicalPath: `/blogs/${testSlug}/`,
        focusKeyword: "AI search optimization",
        secondaryKeywords: ["AEO", "GEO", "LLM search"],
      },
      aeo: {
        conciseAnswer: "AI search optimization focuses on structuring content so Large Language Models and AI search engines can readily ingest, verify, and cite key answers in synthesized responses.",
        questions: ["What is AI search optimization?", "How do LLMs cite sources?"],
      },
      geo: {
        entities: ["D'Genius Solutions", "Google AI", "ChatGPT", "Perplexity"],
        topics: ["SEO", "AI Search", "AEO", "Digital Growth"],
        keyFacts: ["Zero-click searches account for over 58% of mobile queries."],
      },
      llm: {
        answerSummary: "Key guidelines for making brand content machine-ingestible.",
        citableFacts: ["Structured schema increases citation probability by 40%."],
        semanticHeadings: ["The Evolution of Search Engines", "Core Pillars of AI Visibility"],
      },
      schemas: [
        {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": testTitle,
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [],
        },
      ],
      internalLinks: [],
    },
  });

  assert(updated, "Update returned null");
  assert.equal(updated.needs_review, false, "needs_review should be false after editor approval");
  console.log(`✓ Content updated and review sign-off saved`);

  // Step 4: Run Pre-Flight QA Checklist
  console.log("\n[Step 4] Testing Pre-Flight QA Checklist...");
  const qaResult = await validateCmsBlogForPublish(created.id);
  console.log("QA Validation Status:", qaResult.ok ? "PASSED" : "FAILED");
  if (qaResult.warnings.length) console.log("QA Warnings:", qaResult.warnings);
  if (qaResult.errors.length) console.log("QA Errors:", qaResult.errors);
  assert(qaResult.ok, `QA must pass for fully formatted blog: ${qaResult.errors.join("; ")}`);
  console.log("✓ Pre-flight QA Checklist passed 100%");

  // Step 5: Test Scheduling
  console.log("\n[Step 5] Testing Scheduling Pipeline...");
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const scheduled = await scheduleCmsBlog(created.id, futureDate);
  assert.equal(scheduled.status, "scheduled", "Blog status must be 'scheduled'");
  assert.equal(
    new Date(scheduled.scheduled_for).getTime() - new Date(futureDate).getTime() < 2000,
    true,
    "scheduled_for date must match input timestamp"
  );
  console.log(`✓ Blog scheduled successfully for ${futureDate}`);

  // Step 6: Test Immediate Publishing
  console.log("\n[Step 6] Testing Publishing Pipeline...");
  const published = await publishCmsBlog(created.id);
  assert.equal(published.status, "published", "Blog status must be 'published'");
  assert(published.published_at, "published_at must be populated");
  console.log(`✓ Blog published live! published_at: ${published.published_at}`);

  // Step 7: Clean Up Test Post
  console.log("\n[Step 7] Cleaning Up Test Blog...");
  await deleteCmsDraftBlog(created.id);
  // Also delete published record for clean test teardown
  const { cmsExecute } = await import("../lib/cms/db.ts");
  await cmsExecute("DELETE FROM blog_posts WHERE id = ?", [created.id]);
  await cmsExecute("DELETE FROM seo_metadata WHERE entity_type='blog_post' AND entity_id=?", [created.id]);
  console.log("✓ Test blog cleaned up safely");

  console.log("\n==================================================");
  console.log("HOSTINGER E2E VERIFICATION COMPLETED WITH 100% PASS");
  console.log("==================================================");
}

runTest().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
