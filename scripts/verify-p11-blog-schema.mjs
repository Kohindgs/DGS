import https from "node:https";

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

async function checkSchema(url) {
  console.log(`\nChecking Schema for: ${url}`);
  const html = await fetchHtml(url);

  // Extract all application/ld+json blocks
  const schemaMatches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  console.log(`Found ${schemaMatches.length} JSON-LD blocks`);

  let blogPostingFound = false;
  let parsedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < schemaMatches.length; i++) {
    const raw = schemaMatches[i][1];
    try {
      const parsed = JSON.parse(raw);
      parsedCount++;

      // Check if this is or contains BlogPosting
      let postSchema = null;
      if (parsed["@type"] === "BlogPosting" || parsed["@type"] === "Article") {
        postSchema = parsed;
      } else if (Array.isArray(parsed["@graph"])) {
        postSchema = parsed["@graph"].find(item => item["@type"] === "BlogPosting" || item["@type"] === "Article");
      }

      if (postSchema) {
        blogPostingFound = true;
        console.log(`✓ BlogPosting schema found in block ${i + 1}:`);
        console.log(`  @type: ${postSchema["@type"]}`);
        console.log(`  headline: ${postSchema.headline}`);
        console.log(`  datePublished: ${postSchema.datePublished}`);
        console.log(`  dateModified: ${postSchema.dateModified}`);
        console.log(`  author: ${JSON.stringify(postSchema.author)}`);
        console.log(`  publisher: ${JSON.stringify(postSchema.publisher)}`);
        console.log(`  image: ${JSON.stringify(postSchema.image)}`);
      }
    } catch (err) {
      errorCount++;
      console.error(`✗ JSON parse error in block ${i + 1}:`, err.message);
    }
  }

  return { blogPostingFound, parsedCount, errorCount };
}

async function run() {
  const urls = [
    "https://www.dgeniussolutions.com/blogs/google-ads-for-b2b-lead-generation-how-to-get-better-quality-leads/",
    "https://www.dgeniussolutions.com/blogs/google-september-2026-spam-update-what-website-owners-should-know/"
  ];

  for (const u of urls) {
    const res = await checkSchema(u);
    console.log(`Summary for ${u}:`);
    console.log(`  BlogPosting schema found: ${res.blogPostingFound ? "YES" : "NO"}`);
    console.log(`  Schemas parsed cleanly: ${res.parsedCount}`);
    console.log(`  Schema parse errors: ${res.errorCount}`);
  }
}

run().catch(console.error);
