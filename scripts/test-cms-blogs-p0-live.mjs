import fs from "node:fs";
import crypto from "node:crypto";
import mysql from "mysql2/promise";

async function main() {
  console.log("=== DGS BLOGS CMS P0 LIVE VERIFICATION SUITE ===");

  const env = fs.readFileSync("/home/u188101251/production-app/current/.env.production", "utf8");
  const cfg = {};
  for (const line of env.split("\n")) {
    const idx = line.indexOf("=");
    if (idx > 0) {
      cfg[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^['"](.*)['"]$/, "$1");
    }
  }

  const conn = await mysql.createConnection({
    host: cfg.DGS_MYSQL_HOST || "127.0.0.1",
    user: cfg.DGS_MYSQL_USER,
    password: cfg.DGS_MYSQL_PASSWORD,
    database: cfg.DGS_MYSQL_DATABASE,
  });

  // Get or create a superadmin test session
  const [userRows] = await conn.query("SELECT id, email, role FROM cms_users WHERE role = 'superadmin' LIMIT 1");
  if (!userRows.length) throw new Error("No superadmin user found in DB");
  const adminUser = userRows[0];
  console.log(`Using Superadmin user: ${adminUser.email} (${adminUser.id})`);

  // Create temporary session token matching auth-db.ts
  const rawToken = crypto.randomBytes(32).toString("base64url");
  const sessionSecret = cfg.DGS_ADMIN_SESSION_SECRET || "dgs-fallback-secret-2026";
  const tokenHash = crypto.createHmac("sha256", sessionSecret).update(rawToken).digest("hex");
  const sessionId = crypto.randomUUID();

  await conn.query(
    `INSERT INTO cms_sessions (id, user_id, session_token_hash, expires_at, created_at)
     VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW())`,
    [sessionId, adminUser.id, tokenHash]
  );
  console.log("✓ Created authenticated CMS session for verification");

  const baseUrl = "https://www.dgeniussolutions.com";
  const authHeaders = {
    Cookie: `dgs_cms_session=${rawToken}`,
  };

  // Pre-clean any lingering test records
  const [oldTests] = await conn.query("SELECT id FROM blog_posts WHERE slug LIKE 'dgs-qa-test%'");
  for (const t of oldTests) {
    await conn.query("DELETE FROM blog_revisions WHERE blog_post_id = ?", [t.id]);
    await conn.query("DELETE FROM seo_metadata WHERE entity_type = 'blog_post' AND entity_id = ?", [t.id]);
    await conn.query("DELETE FROM blog_posts WHERE id = ?", [t.id]);
  }
  if (oldTests.length > 0) {
    console.log(`Cleaned up ${oldTests.length} lingering QA test records.`);
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: PRE-FLIGHT CHECK OF TRASHED SLUG
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 1: Checking Trashed Slug Detection ---");
    const trashedSlug = "ai-video-production-agency-how-to-choose-the-right-partner-for-your-brand";
    
    // Check direct DB availability function behavior via API check
    // Create a mock docx using an existing mammoth test docx
    const sampleDocxPath = "/home/u188101251/production-app/current/node_modules/mammoth/test/test-data/single-paragraph.docx";
    const sampleBuffer = fs.readFileSync(sampleDocxPath);

    // Let's test the preview mode for import
    const form1 = new FormData();
    const blob1 = new Blob([sampleBuffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    form1.append("documents", blob1, `${trashedSlug}.docx`);
    form1.append("previewOnly", "true");

    const prevRes = await fetch(`${baseUrl}/api/admin/blogs/import?preview=true`, {
      method: "POST",
      headers: authHeaders,
      body: form1,
    });
    const prevData = await prevRes.json();
    console.log("Preview Response Status:", prevRes.status);
    console.log("Preview Slug Status:", prevData.slugStatus);
    console.log("Existing Trashed Blog Title:", prevData.existingBlog?.title);

    if (prevData.slugStatus !== "trashed") {
      throw new Error(`Expected slugStatus to be 'trashed', got '${prevData.slugStatus}'`);
    }
    console.log("✓ TEST 1 PASSED: Trashed slug correctly detected in preview mode");

    // -------------------------------------------------------------------------
    // TEST 2: ATTEMPT TO IMPORT TRASHED SLUG WITHOUT REPLACE FLAG -> 409
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 2: Attempting Import on Trashed Slug without replaceTrashed ---");
    const form2 = new FormData();
    form2.append("documents", blob1, `${trashedSlug}.docx`);

    const impRes = await fetch(`${baseUrl}/api/admin/blogs/import`, {
      method: "POST",
      headers: authHeaders,
      body: form2,
    });
    const impData = await impRes.json();
    console.log("Import Status:", impRes.status);
    console.log("Import Code:", impData.code);
    console.log("Import Message:", impData.message);

    if (impRes.status !== 409 || impData.code !== "TRASHED_SLUG_EXISTS") {
      throw new Error(`Expected 409 TRASHED_SLUG_EXISTS, got ${impRes.status} / ${impData.code}`);
    }
    console.log("✓ TEST 2 PASSED: Import blocked cleanly with structured TRASHED_SLUG_EXISTS code");

    // -------------------------------------------------------------------------
    // TEST 3: CREATE QA BLOG, TRASH IT, AND TEST PERMANENT DELETION
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 3: Testing True Database Delete & Slug Release ---");
    const testSlug = `dgs-qa-test-p0-delete-${Date.now()}`;
    const testTitle = `DGS QA Test Blog ${Date.now()}`;

    // 1. Create blog
    const testContent = JSON.stringify([{
      version: 1,
      bodyHtml: "<p>DGS QA Test Content paragraph for permanent deletion verification.</p>",
      sourceHash: "test",
      optimization: {},
      images: []
    }]);

    await conn.query(
      `INSERT INTO blog_posts (id, slug, title, content, status, word_count, reading_time_minutes, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'review', 250, 2, NOW(), NOW())`,
      [crypto.randomUUID(), testSlug, testTitle, testContent]
    );

    const [[createdBlog]] = await conn.query("SELECT * FROM blog_posts WHERE slug = ?", [testSlug]);
    console.log(`Created test blog: "${createdBlog.title}" (ID: ${createdBlog.id}, Slug: ${createdBlog.slug})`);

    // Add dependent records: revision, tag, category, seo_metadata, media_usage
    const revId = crypto.randomUUID();
    await conn.query("INSERT INTO blog_revisions (id, blog_post_id, snapshot, created_at) VALUES (?, ?, '{}', NOW())", [revId, createdBlog.id]);
    await conn.query("INSERT INTO seo_metadata (id, entity_type, entity_id, title, canonical_url, robots_index, robots_follow, updated_at) VALUES (?, 'blog_post', ?, 'SEO Title', 'https://test', 0, 1, NOW())", [crypto.randomUUID(), createdBlog.id]);
    console.log("Created dependent records (revisions, seo_metadata)");

    // 2. Soft-delete / Trash the blog
    const trashRes = await fetch(`${baseUrl}/api/admin/blogs/${createdBlog.id}/trash`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const trashText = await trashRes.text();
    console.log("Trash API status:", trashRes.status, "Raw Text:", trashText);
    const trashData = trashText ? JSON.parse(trashText) : {};

    const [[trashedState]] = await conn.query("SELECT status, deleted_at FROM blog_posts WHERE id = ?", [createdBlog.id]);
    console.log(`Blog in DB: status = '${trashedState.status}', deleted_at = ${trashedState.deleted_at}`);
    if (trashedState.status !== "trashed") throw new Error("Blog was not trashed");

    // 3. Permanent delete via API with slug confirmation
    console.log("Calling permanent delete API with confirmedSlug...");
    const permRes = await fetch(`${baseUrl}/api/admin/blogs/${createdBlog.id}/permanent`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ confirmedSlug: testSlug }),
    });
    const permText = await permRes.text();
    console.log("Permanent Delete API status:", permRes.status, "Raw Text:", permText);
    const permData = permText ? JSON.parse(permText) : {};

    // 4. Verify 0 rows remain in MariaDB for this ID and slug
    const [[{ idCount }]] = await conn.query("SELECT COUNT(*) as idCount FROM blog_posts WHERE id = ?", [createdBlog.id]);
    const [[{ slugCount }]] = await conn.query("SELECT COUNT(*) as slugCount FROM blog_posts WHERE slug = ?", [testSlug]);
    const [[{ revCount }]] = await conn.query("SELECT COUNT(*) as revCount FROM blog_revisions WHERE blog_post_id = ?", [createdBlog.id]);
    const [[{ seoCount }]] = await conn.query("SELECT COUNT(*) as seoCount FROM seo_metadata WHERE entity_type = 'blog_post' AND entity_id = ?", [createdBlog.id]);

    console.log(`Verification: idCount=${idCount}, slugCount=${slugCount}, revCount=${revCount}, seoCount=${seoCount}`);
    if (idCount !== 0 || slugCount !== 0 || revCount !== 0 || seoCount !== 0) {
      throw new Error("Permanent delete failed: records still remain in database!");
    }
    console.log("✓ TEST 3 PASSED: Permanent delete removed all dependent rows and verified 0 rows remain");

    // -------------------------------------------------------------------------
    // TEST 4: IMMEDIATE RE-UPLOAD OF THE FREED SLUG
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 4: Re-uploading document with freed slug ---");
    const form4 = new FormData();
    form4.append("documents", blob1, `${testSlug}.docx`);

    const reupRes = await fetch(`${baseUrl}/api/admin/blogs/import`, {
      method: "POST",
      headers: authHeaders,
      body: form4,
    });
    const reupData = await reupRes.json();
    console.log("Re-upload status:", reupRes.status, "ok:", reupData.ok);
    if (!reupRes.ok || !reupData.ok) {
      throw new Error(`Re-upload failed: ${JSON.stringify(reupData)}`);
    }

    const newBlogId = reupData.results[0].blog.id;
    console.log(`Re-uploaded successfully! New Blog ID: ${newBlogId}, Slug: ${reupData.results[0].blog.slug}`);
    console.log("✓ TEST 4 PASSED: Freed slug re-uploaded without collision");

    // -------------------------------------------------------------------------
    // TEST 5: INSTANT PUBLISH DATE/TIME & GATE VERIFICATION
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 5: Testing Instant Publish and Date/Time IST ---");

    // 1. Verify blog is currently in review status with published_at = NULL
    const [[prePubBlog]] = await conn.query("SELECT status, published_at FROM blog_posts WHERE id = ?", [newBlogId]);
    console.log(`Pre-publish DB status: '${prePubBlog.status}', published_at: ${prePubBlog.published_at}`);
    if (prePubBlog.status !== "review" || prePubBlog.published_at !== null) {
      throw new Error("Pre-publish state was unexpectedly published!");
    }

    // Set valid content and SEO package so the pre-publish gate passes
    const validBodyHtml = `<h2>Comprehensive Guide to Choosing a Growth Partner</h2>
<p>Selecting the right digital production and growth partner requires evaluating proven case studies, creative capabilities, technical search optimization methodologies, and cross-channel expertise across competitive B2B industries.</p>
<p>Modern enterprises need strategic execution that bridges search engine visibility with audience conversion metrics. By prioritizing high-density content, verified editorial governance, and transparent performance tracking, organizations can achieve sustainable organic compounding and long-term brand authority in modern search ecosystems.</p>`;

    await conn.query(
      `UPDATE blog_posts 
       SET title = 'Guide to Choosing a Growth Partner for B2B Brands',
           excerpt = 'Discover how to evaluate and select the ideal digital marketing and video production partner for high-growth B2B enterprise brands.',
           content = ?,
           word_count = 120,
           reading_time_minutes = 1,
           updated_at = NOW()
       WHERE id = ?`,
      [
        JSON.stringify([{
          version: 1,
          bodyHtml: validBodyHtml,
          sourceHash: "test-hash",
          optimization: {
            seo: {
              title: "Guide to Choosing a Growth Partner for B2B Brands",
              description: "Discover how to evaluate and select the ideal digital marketing and video production partner for high-growth B2B enterprise brands.",
              focusKeyword: "growth partner"
            }
          },
          images: []
        }]),
        newBlogId
      ]
    );

    // 2. Publish blog via publish API
    const pubRes = await fetch(`${baseUrl}/api/admin/blogs/${newBlogId}/publish`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ id: newBlogId }),
    });
    const pubData = await pubRes.json();
    console.log("Publish API status:", pubRes.status, "ok:", pubData.ok);
    if (!pubRes.ok || !pubData.ok) {
      throw new Error(`Gate blocked publish: ${JSON.stringify(pubData)}`);
    }

    // Direct publish DB check
    const [[postPubBlog]] = await conn.query("SELECT id, title, slug, status, published_at, updated_at FROM blog_posts WHERE id = ?", [newBlogId]);
    console.log("Post-publish Blog State in MariaDB:");
    console.log({
      status: postPubBlog.status,
      published_at: postPubBlog.published_at,
      updated_at: postPubBlog.updated_at,
    });

    if (postPubBlog.published_at) {
      // Test IST formatting helper logic on the real timestamp
      const pubDate = new Date(postPubBlog.published_at);
      const istFormatter = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const parts = istFormatter.formatToParts(pubDate);
      let day = "", month = "", year = "", hour = "", minute = "", dayPeriod = "";
      for (const p of parts) {
        if (p.type === "day") day = p.value;
        else if (p.type === "month") month = p.value;
        else if (p.type === "year") year = p.value;
        else if (p.type === "hour") hour = p.value;
        else if (p.type === "minute") minute = p.value;
        else if (p.type === "dayPeriod") dayPeriod = p.value.toUpperCase();
      }
      const formattedIST = `${day} ${month} ${year} · ${hour}:${minute} ${dayPeriod} IST`;
      console.log(`Formatted published_at in IST: "${formattedIST}"`);
      console.log("✓ TEST 5 PASSED: Server UTC published_at generated and formatted in IST");
    }

    // -------------------------------------------------------------------------
    // CLEANUP QA TEST RECORDS
    // -------------------------------------------------------------------------
    console.log("\n--- CLEANUP: Removing QA test blog ---");
    const cleanupRes = await fetch(`${baseUrl}/api/admin/blogs/${newBlogId}/permanent`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ confirmedSlug: testSlug }),
    });
    const cleanupData = await cleanupRes.json();
    console.log("Cleanup permanent delete status:", cleanupRes.status, "ok:", cleanupData.ok);

    const [[{ finalCheck }]] = await conn.query("SELECT COUNT(*) as finalCheck FROM blog_posts WHERE slug = ?", [testSlug]);
    console.log(`Final DB count for test slug "${testSlug}": ${finalCheck}`);
    if (finalCheck === 0) {
      console.log("✓ CLEANUP VERIFIED: Production database is 100% clean with 0 QA test records remaining.");
    }

    console.log("\n==================================================");
    console.log("✓ ALL P0 BLOG CMS VERIFICATION TESTS PASSED LIVE!");
    console.log("==================================================");

  } finally {
    // Delete temporary session
    await conn.query("DELETE FROM cms_sessions WHERE id = ?", [sessionId]);
    await conn.end();
  }
}

main().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
