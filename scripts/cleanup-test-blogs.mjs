import { cmsExecute, cmsQuery } from "../lib/cms/db.ts";

async function cleanup() {
  await cmsExecute("DELETE FROM blog_posts WHERE slug LIKE ?", ["e2e-test-blog-%"]);
  await cmsExecute("DELETE FROM seo_metadata WHERE canonical_url LIKE ?", ["%/e2e-test-blog-%"]);
  const res = await cmsQuery("SELECT COUNT(*) as count FROM blog_posts");
  console.log("Remaining blog posts in production DB:", res.rows[0].count);
}

cleanup().catch(console.error);
