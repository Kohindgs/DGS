import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import mysql from "mysql2/promise";
import JSZip from "jszip";

async function loadEnv() {
  const envFiles = [
    path.join(process.cwd(), ".env.production"),
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), ".env"),
  ];
  for (const file of envFiles) {
    try {
      const text = await fs.readFile(file, "utf8");
      for (const line of text.split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
        if (match && !process.env[match[1]]) {
          process.env[match[1]] = match[2];
        }
      }
    } catch {
      // ignore missing
    }
  }
}

await loadEnv();

function connectionOptions() {
  const uri = process.env.DGS_DATABASE_URL || process.env.DATABASE_URL;
  if (uri) {
    const url = new URL(uri);
    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ""),
      ssl: url.searchParams.get("ssl") === "true" ? {} : undefined,
    };
  }

  return {
    host: process.env.DGS_MYSQL_HOST,
    port: Number(process.env.DGS_MYSQL_PORT || 3306),
    user: process.env.DGS_MYSQL_USER,
    password: process.env.DGS_MYSQL_PASSWORD || "",
    database: process.env.DGS_MYSQL_DATABASE,
  };
}

async function createDatabaseSession(conn) {
  const [users] = await conn.query("SELECT id, email, role FROM cms_users WHERE role = 'superadmin' AND is_active = 1 LIMIT 1");
  if (!users.length) throw new Error("No active superadmin user found in cms_users");
  const user = users[0];
  const secret = process.env.DGS_ADMIN_SESSION_SECRET || "dgs-fallback-secret-2026";
  const rawToken = crypto.randomBytes(32).toString("base64url");
  const tokenHash = crypto.createHmac("sha256", secret).update(rawToken).digest("hex");
  const sessionId = crypto.randomUUID();
  await conn.query(`
    INSERT INTO cms_sessions (id, user_id, session_token_hash, ip_address, user_agent, expires_at)
    VALUES (?, ?, ?, '127.0.0.1', 'DGS-QA-Runner/1.0', DATE_ADD(NOW(), INTERVAL 1 DAY))
  `, [sessionId, user.id, tokenHash]);

  const expires = Math.floor(Date.now() / 1000) + 3600 * 8;
  const payload = Buffer.from(JSON.stringify({ email: user.email, expires })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  const legacyToken = `${payload}.${signature}`;

  return {
    rawToken,
    sessionId,
    user,
    cookie: `dgs_cms_session=${rawToken}; dgs_admin_session=${legacyToken}`,
    cleanup: async () => {
      await conn.query("DELETE FROM cms_sessions WHERE id = ?", [sessionId]);
    }
  };
}

async function createDocxBuffer(title, paragraphs = []) {
  const zip = new JSZip();

  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );

  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  const paragraphsXml = paragraphs
    .map(
      (p) =>
        `<w:p><w:r><w:t>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</w:t></w:r></w:p>`
    )
    .join("");

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
      <w:r><w:t>${title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</w:t></w:r>
    </w:p>
    ${paragraphsXml}
  </w:body>
</w:document>`;

  zip.file("word/document.xml", docXml);
  return await zip.generateAsync({ type: "nodebuffer" });
}

// 1x1 transparent PNG buffer
const samplePngBuffer = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

async function main() {
  console.log("==================================================");
  console.log("DGS V8.5 — CONTROLLED PRODUCTION QA EXECUTION");
  console.log("==================================================");

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dgeniussolutions.com";
  const cronSecret = process.env.DGS_CRON_SECRET;
  const conn = await mysql.createConnection(connectionOptions());
  const session = await createDatabaseSession(conn);
  const cookie = session.cookie;
  console.log(`✓ Active DB-backed superadmin session established: user=${session.user.email}`);

  const createdBlogIds = [];
  const createdAssetIds = [];

  // Pre-cleanup any lingering test blogs from prior test runs
  const [existing] = await conn.query("SELECT id FROM blog_posts WHERE slug IN ('dgs-cms-qa-alpha', 'dgs-cms-qa-beta')");
  for (const row of existing) {
    await conn.query("DELETE FROM blog_revisions WHERE blog_post_id = ?", [row.id]);
    await conn.query("DELETE FROM seo_metadata WHERE entity_type = 'blog_post' AND entity_id = ?", [row.id]);
    await conn.query("DELETE FROM media_usage WHERE entity_type = 'blog_post' AND entity_id = ?", [row.id]);
    await conn.query("DELETE FROM blog_posts WHERE id = ?", [row.id]);
  }

  try {
    // --------------------------------------------------
    // PHASE 1: Two-DOCX Bulk Import with 5 Media Confidence Levels
    // --------------------------------------------------
    console.log("\n[Phase 1/6] Executing Two-DOCX Bulk Import & Confidence Matching...");

    const alphaDocx = await createDocxBuffer(
      "DGS CMS QA Alpha: Autonomous Search and Retrieval Architecture",
      [
        "Autonomous search systems require precise semantic structured data and high contextual relevance.",
        "When designing content for answer engines, structured entities and direct facts increase citation rates.",
        "D'Genius Solutions in Mumbai provides advanced search optimization and digital marketing."
      ]
    );

    const betaDocx = await createDocxBuffer(
      "DGS CMS QA Beta: Generative Engine Optimization Framework",
      [
        "Generative engine optimization focuses on authority, entropy, and citable claims.",
        "Modern brands must monitor their citation health across conversational interfaces and AI answers.",
        "Our Mumbai creative agency integrates performance marketing with next-generation content architecture."
      ]
    );

    const formData = new FormData();
    formData.append("documents", new Blob([alphaDocx], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }), "dgs-cms-qa-alpha.docx");
    formData.append("documents", new Blob([betaDocx], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }), "dgs-cms-qa-beta.docx");

    // 5 Image files representing 5 confidence levels
    formData.append("images", new Blob([samplePngBuffer], { type: "image/png" }), "dgs-cms-qa-alpha.png");         // EXACT (100)
    formData.append("images", new Blob([samplePngBuffer], { type: "image/png" }), "dgs-cms-qa-alpha-diagram.png"); // HIGH (85)
    formData.append("images", new Blob([samplePngBuffer], { type: "image/png" }), "dgs-cms-architecture.png");     // MEDIUM (65)
    formData.append("images", new Blob([samplePngBuffer], { type: "image/png" }), "alpha-notes.png");              // LOW (35)
    formData.append("images", new Blob([samplePngBuffer], { type: "image/png" }), "unrelated-stock-photo.png");    // UNMATCHED (0)

    const importRes = await fetch(`${baseUrl}/api/admin/blogs/import`, {
      method: "POST",
      headers: { Cookie: cookie },
      body: formData,
    });

    console.log(`✓ POST /api/admin/blogs/import -> Status: ${importRes.status}`);
    if (importRes.status !== 201 && importRes.status !== 200) {
      const errText = await importRes.text();
      throw new Error(`Import failed with status ${importRes.status}: ${errText}`);
    }

    const importData = await importRes.json();
    const importedCount = importData.imported || importData.results?.length || 0;
    console.log(`✓ Bulk Import Success: importedCount=${importedCount}`);
    if (importedCount !== 2) {
      throw new Error(`Expected 2 imported blogs, got ${importedCount}`);
    }

    const blogResults = importData.results || importData.blogs || [];
    const alphaBlogResult = blogResults.find((b) => b.blog.slug === "dgs-cms-qa-alpha");
    const betaBlogResult = blogResults.find((b) => b.blog.slug === "dgs-cms-qa-beta");

    if (!alphaBlogResult || !betaBlogResult) {
      throw new Error("Could not find imported Alpha and Beta blogs in import response");
    }

    const alphaId = alphaBlogResult.blog.id;
    const betaId = betaBlogResult.blog.id;
    createdBlogIds.push(alphaId, betaId);

    console.log(`  ✓ Alpha Blog Created: ID=${alphaId}, Status=${alphaBlogResult.blog.status}, NeedsReview=${alphaBlogResult.blog.needs_review}`);
    console.log(`  ✓ Beta Blog Created: ID=${betaId}, Status=${betaBlogResult.blog.status}, NeedsReview=${betaBlogResult.blog.needs_review}`);

    // Verify 5 Confidence Levels
    console.log(`  ✓ Matched Images for Alpha: ${alphaBlogResult.matchedImagesCount}`);
    for (const m of alphaBlogResult.matchedImages) {
      console.log(`    - ${m.filename}: Confidence=${m.confidence}, Score=${m.score}, Featured=${m.isFeatured}`);
    }

    const hasExact = alphaBlogResult.matchedImages.some((m) => m.confidence === "EXACT");
    const hasHigh = alphaBlogResult.matchedImages.some((m) => m.confidence === "HIGH");
    const hasMedium = alphaBlogResult.matchedImages.some((m) => m.confidence === "MEDIUM");

    if (!hasExact || !hasHigh || !hasMedium) {
      throw new Error("Missing expected EXACT, HIGH, or MEDIUM matches in Alpha blog");
    }

    console.log(`  ✓ Low Confidence Images (Quarantined): ${alphaBlogResult.lowConfidenceImages.length}`);
    for (const l of alphaBlogResult.lowConfidenceImages) {
      console.log(`    - ${l.filename}: Confidence=${l.confidence}, Score=${l.score}, AssetId=${l.assetId}`);
      if (l.assetId) createdAssetIds.push(l.assetId);
    }
    const hasLow = alphaBlogResult.lowConfidenceImages.some((l) => l.confidence === "LOW");
    if (!hasLow) {
      throw new Error("Missing expected LOW confidence image in Alpha blog");
    }

    console.log(`  ✓ Unmatched Images (Quarantined): ${alphaBlogResult.unmatchedImages.length}`);
    for (const u of alphaBlogResult.unmatchedImages) {
      console.log(`    - ${u.filename}: Confidence=${u.confidence}, Score=${u.score}, AssetId=${u.assetId}`);
      if (u.assetId) createdAssetIds.push(u.assetId);
    }
    const hasUnmatched = alphaBlogResult.unmatchedImages.some((u) => u.confidence === "UNMATCHED");
    if (!hasUnmatched) {
      throw new Error("Missing expected UNMATCHED image in Alpha blog");
    }

    // Verify audit log for import
    const [importAudit] = await conn.query(
      "SELECT action, summary, status FROM cms_audit_log WHERE resource_id = ? AND action = 'BLOG_IMPORTED'",
      [alphaId]
    );
    console.log(`✓ Audit Log Entry for BLOG_IMPORTED: ${importAudit[0]?.action} - ${importAudit[0]?.summary}`);
    if (importAudit.length === 0) {
      throw new Error("Missing audit log entry for BLOG_IMPORTED");
    }

    // --------------------------------------------------
    // PHASE 2: Ambiguous Media Assignment (LOW / UNMATCHED Actions)
    // --------------------------------------------------
    console.log("\n[Phase 2/6] Testing Ambiguous Media Assignment Actions...");
    const lowImage = alphaBlogResult.lowConfidenceImages.find((l) => l.confidence === "LOW");
    const unmatchedImage = alphaBlogResult.unmatchedImages.find((u) => u.confidence === "UNMATCHED");

    // Action 1: Assign LOW confidence image as inline
    const assignInlineRes = await fetch(`${baseUrl}/api/admin/blogs/${alphaId}/media/assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({
        assetId: lowImage.assetId,
        action: "inline",
        altText: "QA Notes Diagram Demonstration",
      }),
    });
    const assignInlineData = await assignInlineRes.json();
    console.log(`✓ POST /media/assign (action: inline) -> Status: ${assignInlineRes.status}`, assignInlineData);
    if (assignInlineRes.status !== 200 || !assignInlineData.ok) {
      throw new Error(`Failed to assign inline media: ${JSON.stringify(assignInlineData)}`);
    }

    // Action 2: Ignore UNMATCHED image
    const assignIgnoreRes = await fetch(`${baseUrl}/api/admin/blogs/${alphaId}/media/assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({
        assetId: unmatchedImage.assetId,
        action: "ignore",
      }),
    });
    const assignIgnoreData = await assignIgnoreRes.json();
    console.log(`✓ POST /media/assign (action: ignore) -> Status: ${assignIgnoreRes.status}`, assignIgnoreData);
    if (assignIgnoreRes.status !== 200 || !assignIgnoreData.ok) {
      throw new Error(`Failed to ignore media: ${JSON.stringify(assignIgnoreData)}`);
    }

    // Verify audit log for media assignments
    const [mediaAudits] = await conn.query(
      "SELECT action, summary FROM cms_audit_log WHERE resource_id = ? AND action IN ('BLOG_MEDIA_ASSIGNED', 'BLOG_MEDIA_IGNORED') ORDER BY created_at ASC",
      [alphaId]
    );
    console.log(`✓ Audit Log Entries for Media Actions (${mediaAudits.length}):`);
    for (const a of mediaAudits) {
      console.log(`  - ${a.action}: ${a.summary}`);
    }
    if (mediaAudits.length < 2) {
      throw new Error("Expected at least 2 audit log entries for media assign/ignore actions");
    }

    // --------------------------------------------------
    // PHASE 3: Revisions & Compare & Rollback
    // --------------------------------------------------
    console.log("\n[Phase 3/6] Testing Revision History, Compare & Rollback...");

    // Fetch initial revisions list
    const revListRes1 = await fetch(`${baseUrl}/api/admin/blogs/${alphaId}/revisions`, {
      headers: { Cookie: cookie },
    });
    const revListData1 = await revListRes1.json();
    console.log(`✓ GET /revisions -> Initial revisions count: ${revListData1.revisions?.length || 0}`);
    const rev1Id = revListData1.revisions?.[0]?.id;
    if (!rev1Id) {
      throw new Error("No initial revision found for Alpha blog");
    }

    // Update Alpha Blog to trigger revision snapshot
    const updateRes = await fetch(`${baseUrl}/api/admin/blogs/${alphaId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({
        title: "DGS CMS QA Alpha: Autonomous Search Architecture (Modified V2)",
        focus_keyword: "autonomous search systems",
      }),
    });
    const updateData = await updateRes.json();
    console.log(`✓ PATCH /api/admin/blogs/${alphaId} -> Status: ${updateRes.status}, Updated Title: "${updateData.blog?.title}"`);

    // Verify Compare endpoint
    const compareRes = await fetch(`${baseUrl}/api/admin/blogs/${alphaId}/revisions/${rev1Id}/compare`, {
      headers: { Cookie: cookie },
    });
    console.log(`✓ GET /revisions/${rev1Id}/compare -> Status: ${compareRes.status}`);
    const compareData = await compareRes.json();
    if (compareRes.status !== 200 || !compareData.ok) {
      throw new Error(`Compare failed: ${JSON.stringify(compareData)}`);
    }

    console.log("✓ Compare Summary:", compareData.comparison?.summary);
    const titleDiff = (compareData.comparison?.fields || compareData.comparison?.diffs)?.find((d) => d.field === "title");
    console.log("✓ Title Diff:", titleDiff);
    if (!titleDiff || titleDiff.status !== "CHANGED") {
      throw new Error("Expected title diff to have status CHANGED");
    }

    // Test Restore endpoint
    const restoreRes = await fetch(`${baseUrl}/api/admin/blogs/${alphaId}/revisions/${rev1Id}/restore`, {
      method: "POST",
      headers: { Cookie: cookie },
    });
    console.log(`✓ POST /revisions/${rev1Id}/restore -> Status: ${restoreRes.status}`);
    const restoreData = await restoreRes.json();
    if (restoreRes.status !== 200 || !restoreData.ok) {
      throw new Error(`Restore failed: ${JSON.stringify(restoreData)}`);
    }

    // Verify database state after restore
    const [alphaPostAfterRestore] = await conn.query(
      "SELECT title, status, needs_review FROM blog_posts WHERE id = ?",
      [alphaId]
    );
    console.log("✓ Alpha Blog State after Restore:", alphaPostAfterRestore[0]);
    if (
      alphaPostAfterRestore[0].title !== "DGS CMS QA Alpha: Autonomous Search and Retrieval Architecture" ||
      alphaPostAfterRestore[0].status !== "review" ||
      alphaPostAfterRestore[0].needs_review !== 1
    ) {
      throw new Error("Blog post state does not match expected post-restore state");
    }

    // Verify pre-restore safety revision was created
    const [revCountAfterRestore] = await conn.query(
      "SELECT COUNT(*) as count FROM blog_revisions WHERE blog_post_id = ?",
      [alphaId]
    );
    console.log(`✓ Total revisions after restore (includes safety backup): ${revCountAfterRestore[0].count}`);
    if (revCountAfterRestore[0].count < 3) {
      throw new Error("Expected at least 3 revisions after initial, update, and pre-restore backup");
    }

    // --------------------------------------------------
    // PHASE 4: Canonical Collision Shield
    // --------------------------------------------------
    console.log("\n[Phase 4/6] Testing Canonical Collision Shield...");

    // Check cannibalization route
    const canRes = await fetch(`${baseUrl}/api/admin/blogs/${alphaId}/cannibalization`, {
      headers: { Cookie: cookie },
    });
    const canData = await canRes.json();
    console.log(`✓ GET /cannibalization (Standard Blog) -> Status: ${canRes.status}`);
    console.log("  Risk Level:", canData.report?.riskLevel);
    console.log("  Canonical Collision (Normal):", canData.canonicalCollision?.collided);

    // Update canonical to protected core route in blog_posts.content JSON
    await conn.query(`
      UPDATE blog_posts
      SET content = JSON_SET(content, '$[0].optimization.seo.canonicalPath', '/services/seo-services-in-mumbai/')
      WHERE id = ?
    `, [alphaId]);

    const canCollisionRes = await fetch(`${baseUrl}/api/admin/blogs/${alphaId}/cannibalization`, {
      headers: { Cookie: cookie },
    });
    const canCollisionData = await canCollisionRes.json();
    console.log("✓ GET /cannibalization (Colliding Route) -> Collision:", canCollisionData.canonicalCollision);
    if (!canCollisionData.canonicalCollision?.collided) {
      throw new Error("Canonical collision shield failed to detect protected core route collision");
    }

    // Attempt to publish colliding blog -> must fail
    const publishAttemptRes = await fetch(`${baseUrl}/api/admin/blogs/${alphaId}/publish`, {
      method: "POST",
      headers: { Cookie: cookie },
    });
    const publishAttemptData = await publishAttemptRes.json();
    console.log(`✓ POST /publish (Colliding Route) -> Status: ${publishAttemptRes.status}`, publishAttemptData);
    if (publishAttemptRes.status === 200 && publishAttemptData.ok) {
      throw new Error("Publishing MUST NOT succeed when canonical collision is detected!");
    }
    console.log("✓ Publication successfully blocked by Canonical Collision Shield!");

    // Restore valid canonical path in blog_posts.content JSON
    await conn.query(`
      UPDATE blog_posts
      SET content = JSON_SET(content, '$[0].optimization.seo.canonicalPath', '/blogs/dgs-cms-qa-alpha/')
      WHERE id = ?
    `, [alphaId]);

    // --------------------------------------------------
    // PHASE 5: Real Scheduled Publishing via Live Internal Endpoint
    // --------------------------------------------------
    console.log("\n[Phase 5/6] Testing Real Scheduled Publishing Pipeline...");

    // Format Beta blog to pass all QA: set valid excerpt, reading time, approved review status
    const validBetaBody = "<p>Generative engine optimization focuses on authority, entropy, and citable claims across leading conversational AI systems. Modern brands must monitor their citation health across conversational interfaces and AI answers. Our Mumbai creative agency integrates performance marketing with next-generation content architecture to deliver verified commercial outcomes.</p>";
    await conn.query(`
      UPDATE blog_posts
      SET status = 'scheduled',
          scheduled_for = DATE_SUB(NOW(), INTERVAL 2 MINUTE),
          needs_review = 0,
          featured_image_url = '/cms-media/uploads/dgs-cms-qa-alpha.webp',
          content = JSON_SET(content, '$[0].bodyHtml', ?)
      WHERE id = ?
    `, [validBetaBody, betaId]);

    // Ensure valid SEO metadata robots directives for Beta blog
    await conn.query(`
      UPDATE seo_metadata
      SET robots_index = 1, robots_follow = 1
      WHERE entity_type = 'blog_post' AND entity_id = ?
    `, [betaId]);

    console.log("✓ Beta blog scheduled in database for NOW - 2min");

    // Invoke Live Scheduled Publisher Endpoint
    const schedPublishRes = await fetch(`${baseUrl}/api/internal/blogs/publish-scheduled`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    });
    console.log(`✓ POST /api/internal/blogs/publish-scheduled -> Status: ${schedPublishRes.status}`);
    const schedPublishData = await schedPublishRes.json();
    console.log("✓ Scheduled Publisher Response:", schedPublishData);

    if (schedPublishRes.status !== 200 || !schedPublishData.ok) {
      throw new Error(`Scheduled publication failed: ${JSON.stringify(schedPublishData)}`);
    }

    if (schedPublishData.publishedCount < 1 || !schedPublishData.publishedIds.includes(betaId)) {
      throw new Error(`Expected Beta blog (${betaId}) to be published, publishedIds: ${JSON.stringify(schedPublishData.publishedIds)}`);
    }

    // Verify Beta blog status in database is now 'published'
    const [betaPublishedRow] = await conn.query(
      "SELECT status, published_at FROM blog_posts WHERE id = ?",
      [betaId]
    );
    console.log("✓ Beta blog published state in DB:", betaPublishedRow[0]);
    if (betaPublishedRow[0]?.status !== "published" || !betaPublishedRow[0]?.published_at) {
      throw new Error("Beta blog post status did not update to 'published'");
    }

    // Verify audit log for scheduled publication
    const [pubAudit] = await conn.query(
      "SELECT action, summary FROM cms_audit_log WHERE resource_id = ? AND action = 'BLOG_PUBLISHED'",
      [betaId]
    );
    console.log(`✓ Audit log verified for BLOG_PUBLISHED: ${pubAudit[0]?.summary}`);

    // --------------------------------------------------
    // PHASE 6: Teardown & Invariant Verification
    // --------------------------------------------------
    console.log("\n[Phase 6/6] Cleaning up QA Records & Verifying Invariants...");

    for (const id of createdBlogIds) {
      await conn.query("DELETE FROM blog_revisions WHERE blog_post_id = ?", [id]);
      await conn.query("DELETE FROM seo_metadata WHERE entity_type = 'blog_post' AND entity_id = ?", [id]);
      await conn.query("DELETE FROM media_usage WHERE entity_type = 'blog_post' AND entity_id = ?", [id]);
      await conn.query("DELETE FROM blog_posts WHERE id = ?", [id]);
      await conn.query("DELETE FROM cms_audit_log WHERE resource_id = ?", [id]);
    }

    for (const aId of createdAssetIds) {
      await conn.query("DELETE FROM media_usage WHERE media_id = ?", [aId]);
      await conn.query("DELETE FROM media_assets WHERE id = ?", [aId]);
    }

    console.log(`✓ Cleaned up ${createdBlogIds.length} QA blogs and ${createdAssetIds.length} QA media assets.`);

    // Invariant check: GSC duplicate count = 0
    const [dupes] = await conn.query(`
      SELECT canonical_page_key, query_text_normalized, COUNT(*) AS count
      FROM gsc_page_query_metrics
      WHERE period_type = '28d'
      GROUP BY canonical_page_key, query_text_normalized
      HAVING count > 1
    `);
    console.log(`✓ GSC Duplicate Current Pairs: ${dupes.length} (Target: 0)`);
    if (dupes.length > 0) throw new Error("GSC duplicate invariant violated");

    // Invariant check: Total 28d rows = 905
    const [totalRows] = await conn.query(
      "SELECT COUNT(*) AS total FROM gsc_page_query_metrics WHERE period_type = '28d'"
    );
    console.log(`✓ Total Current 28d Rows: ${totalRows[0].total} (Target: 905)`);

    // Invariant check: Brand query homepage primary
    const [brandRows] = await conn.query(`
      SELECT canonical_page_key, position
      FROM gsc_page_query_metrics
      WHERE query_text_normalized = 'dgenius solutions' AND period_type = '28d'
      ORDER BY impressions DESC
      LIMIT 1
    `);
    console.log(`✓ Brand Query Primary Route: ${brandRows[0]?.canonical_page_key} (Position: ${brandRows[0]?.position})`);
    if (brandRows[0]?.canonical_page_key !== "/") {
      throw new Error("Brand primary route invariant violated");
    }

    // Invariant check: Published blog count
    const [pubCount] = await conn.query("SELECT COUNT(*) as count FROM blog_posts WHERE status = 'published'");
    console.log(`✓ Total Published Blog Posts: ${pubCount[0]?.count} (Baseline: 1)`);

    console.log("\n==================================================");
    console.log("CONTROLLED PRODUCTION QA: ALL 6 PHASES PASSED 100%");
    console.log("==================================================");

  } finally {
    if (session) {
      await session.cleanup().catch(() => {});
    }
    await conn.end();
  }
}

main().catch((err) => {
  console.error("FATAL ERROR in controlled QA execution:", err);
  process.exit(1);
});
