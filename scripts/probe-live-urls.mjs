const urls = [
  "https://www.dgeniussolutions.com/",
  "https://www.dgeniussolutions.com/services/ai-video-production-agency/",
  "https://www.dgeniussolutions.com/services/seo-services-in-mumbai/",
  "https://www.dgeniussolutions.com/services/aeo-services-in-mumbai/",
  "https://www.dgeniussolutions.com/services/geo/",
  "https://www.dgeniussolutions.com/services/llm-seo-service/",
  "https://www.dgeniussolutions.com/services/dubai-seo/",
  "https://www.dgeniussolutions.com/aeo-dubai/",
  "https://www.dgeniussolutions.com/career/generative-ai-artist/",
  "https://www.dgeniussolutions.com/blogs/dgs-cms-scheduled-cron-qa/",
  "https://www.dgeniussolutions.com/blogs/google-ads-for-b2b-lead-generation-how-to-get-better-quality-leads/",
  "https://www.dgeniussolutions.com/seo-pricing/",
  "https://www.dgeniussolutions.com/seo-executive-assessment/",
  "https://www.dgeniussolutions.com/seo-manager-assessment/",
  "https://www.dgeniussolutions.com/wp-file-download-search/",
  "https://www.dgeniussolutions.com/indriya-test/",
  "https://www.dgeniussolutions.com/motion-graphics/"
];

async function main() {
  console.log("=== PROBING LIVE PRODUCTION URLS ===");
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: "HEAD", redirect: "manual" });
      console.log(`${res.status} - ${url}`);
    } catch (e) {
      console.log(`ERR - ${url}: ${e.message}`);
    }
  }
}
main();
