const urls = [
  "https://www.dgeniussolutions.com/services/seo-services-in-mumbai/",
  "https://www.dgeniussolutions.com/services/website-development-amc/",
  "https://www.dgeniussolutions.com/services/ai-video-production-agency/",
];

async function check() {
  for (const u of urls) {
    console.log("==================================================================");
    console.log("URL:", u);
    console.log("==================================================================");
    const res = await fetch(u);
    const html = await res.text();
    const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    let count = 0;
    while ((match = regex.exec(html)) !== null) {
      count++;
      try {
        const parsed = JSON.parse(match[1]);
        const entities = Array.isArray(parsed) ? parsed : (parsed["@graph"] ? parsed["@graph"] : [parsed]);
        console.log(`[Script #${count}] Contains ${entities.length} schema entities:`);
        entities.forEach((item, idx) => {
          console.log(`  ${idx + 1}. Type: ${item["@type"]}, Name: ${item.name || item.headline || "N/A"}, ID: ${item["@id"] || "N/A"}`);
          if (item["@type"] === "FAQPage") {
            console.log(`     -> FAQ count: ${item.mainEntity ? item.mainEntity.length : 0}`);
          }
          if (item["@type"] === "Service") {
            console.log(`     -> ServiceType: ${item.serviceType || "N/A"}, areaServed: ${JSON.stringify(item.areaServed)}`);
          }
        });
      } catch (err) {
        console.log(`[Script #${count}] JSON parse error:`, err.message);
      }
    }
  }
}

check().catch(console.error);
