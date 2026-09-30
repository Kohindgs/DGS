import fs from "node:fs";

function decodeEntities(str) {
  if (!str) return "";
  return str
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, "...")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

const rawPosts = JSON.parse(fs.readFileSync("data/wordpress/raw/posts.json", "utf8"));
const registryFile = "data/migration/nextjs-route-registry.generated.json";
const registry = JSON.parse(fs.readFileSync(registryFile, "utf8"));

const targets = [
  {
    path: "/blogs/aeo-in-2026/",
    slug: "aeo-in-2026",
    wpId: 65303,
    title: "AEO in 2026 How to Rank on ChatGPT and Perplexity - D'Genius Solutions",
    h1: "AEO in 2026 How to Rank on ChatGPT and Perplexity",
    description: "AEO in 2026 is becoming an important part of search marketing as people increasingly use ChatGPT, Perplexity and other AI-powered platforms to research companies.",
    mirrorFile: "data/wordpress/mirrors/pages/blogs__aeo-in-2026.json"
  },
  {
    path: "/blogs/google-ads-ai-max-2026/",
    slug: "google-ads-ai-max-2026",
    wpId: 65297,
    title: "Google Ads AI Max 2026 What Advertisers Need to Know Before the September Changes - D'Genius Solutions",
    h1: "Google Ads AI Max 2026 What Advertisers Need to Know Before the September Changes",
    description: "Google Ads AI Max 2026 is changing how advertisers manage Search campaigns, targeting, advertising assets and landing pages.",
    mirrorFile: "data/wordpress/mirrors/pages/blogs__google-ads-ai-max-2026.json"
  },
  {
    path: "/blogs/google-august-2026-spam-update/",
    slug: "google-august-2026-spam-update",
    wpId: 65289,
    title: "Google August 2026 Spam Update What Businesses Need to Know About SEO Rankings - D'Genius Solutions",
    h1: "Google August 2026 Spam Update What Businesses Need to Know About SEO Rankings",
    description: "The Google August 2026 spam update has put website quality back under the spotlight. Learn what businesses need to know about SEO rankings.",
    mirrorFile: "data/wordpress/mirrors/pages/blogs__google-august-2026-spam-update.json"
  },
  {
    path: "/blogs/seo-company-in-mumbai/",
    slug: "seo-company-in-mumbai",
    wpId: 65293,
    title: "7 Proven Tips to Hire an SEO Agency in Mumbai - D'Genius Solutions",
    h1: "7 Proven Tips to Hire an SEO Agency in Mumbai",
    description: "Choosing the right SEO Company in Mumbai can directly affect your website visibility, lead generation and long-term digital growth. Here are 7 proven tips.",
    mirrorFile: "data/wordpress/mirrors/pages/blogs__seo-company-in-mumbai.json"
  }
];

for (const t of targets) {
  const p = rawPosts.find(x => x.id === t.wpId);
  const mirror = JSON.parse(fs.readFileSync(t.mirrorFile, "utf8"));
  const hMatches = [...mirror.body.matchAll(/<(h[1-6])[^>]*>(.*?)<\/\1>/gi)];
  const headings = hMatches.map(m => ({
    level: m[1].toLowerCase(),
    text: decodeEntities(m[2].replace(/<[^>]+>/g, "").trim())
  }));

  // Extract FAQs if present
  const faqItems = [];
  const faqSectionStart = mirror.body.indexOf("<h2>FAQs</h2>") !== -1 ? mirror.body.indexOf("<h2>FAQs</h2>") : mirror.body.indexOf("<h2>Frequently Asked Questions</h2>");
  if (faqSectionStart !== -1) {
    const faqBody = mirror.body.slice(faqSectionStart);
    const qMatches = [...faqBody.matchAll(/<h3[^>]*>(.*?)<\/h3>\s*<p[^>]*>(.*?)<\/p>/gi)];
    for (const qm of qMatches) {
      faqItems.push({
        question: decodeEntities(qm[1].replace(/<[^>]+>/g, "").trim()),
        answer: decodeEntities(qm[2].replace(/<[^>]+>/g, "").trim())
      });
    }
  }

  const record = {
    path: t.path,
    wordpressId: t.wpId,
    wordpressType: "post",
    slug: t.slug,
    status: 200,
    title: t.title,
    description: t.description,
    h1: t.h1,
    canonical: `https://www.dgeniussolutions.com${t.path}`,
    canonicalMismatch: false,
    desiredCanonicalPath: null,
    robots: "follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large",
    indexable: true,
    includeInSitemap: true,
    protected: false,
    protectedLabel: null,
    proposedAction: "KEEP_SAME_URL",
    date: p?.date || "2026-09-01T00:00:00",
    modified: p?.modified || "2026-09-01T00:00:00",
    headings,
    faqItems
  };

  const existingIdx = registry.routes.findIndex(r => r.path === t.path);
  if (existingIdx !== -1) {
    registry.routes[existingIdx] = record;
    console.log(`Updated existing route: ${t.path}`);
  } else {
    registry.routes.push(record);
    console.log(`Added new route: ${t.path}`);
  }
}

fs.writeFileSync(registryFile, JSON.stringify(registry, null, 2), "utf8");
console.log(`✓ Saved ${registryFile}. Total routes: ${registry.routes.length}`);
