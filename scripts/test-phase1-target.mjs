import https from "node:https";

function fetchRaw(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => resolve({ status: res.statusCode, html: d }));
    }).on("error", reject);
  });
}

async function test() {
  const urls = [
    "https://www.dgeniussolutions.com/blogs/google-september-2026-spam-update-what-website-owners-should-know/",
    "https://www.dgeniussolutions.com/blogs/google-ads-for-b2b-lead-generation-how-to-get-better-quality-leads/",
    "https://www.dgeniussolutions.com/blogs/dgs-cms-scheduled-cron-qa/",
    "https://www.dgeniussolutions.com/blogs/seo-company-in-mumbai/",
    "https://www.dgeniussolutions.com/blogs/3-3-3-rule-in-marketing/",
    "https://www.dgeniussolutions.com/blogs/aeo-in-2026/"
  ];
  for (const u of urls) {
    console.log("\n========================================================");
    console.log("URL:", u);
    const r = await fetchRaw(u);
    console.log("Status:", r.status);
    const scripts = [...r.html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    console.log("JSON-LD script tags count:", scripts.length);
    scripts.forEach((s, idx) => {
      try {
        const parsed = JSON.parse(s[1]);
        if (Array.isArray(parsed)) {
          console.log(`  Script #${idx + 1}: Top-Level Array (${parsed.length} items)`);
          console.log("    Types:", parsed.map(g => g ? g["@type"] : null));
          const art = parsed.find(g => g && (g["@type"] === "Article" || g["@type"] === "BlogPosting"));
          if (art) {
            console.log("    Found Article/BlogPosting:", JSON.stringify({
              "@type": art["@type"],
              "@id": art["@id"],
              headline: art.headline,
              datePublished: art.datePublished,
              dateModified: art.dateModified,
              author: art.author,
              publisher: art.publisher,
              mainEntityOfPage: art.mainEntityOfPage,
              image: art.image
            }, null, 2));
          }
        } else if (parsed["@graph"]) {
          console.log(`  Script #${idx + 1}: @graph (${parsed["@graph"].length} items)`);
          console.log("    Types:", parsed["@graph"].map(g => g ? g["@type"] : null));
          const art = parsed["@graph"].find(g => g && (g["@type"] === "Article" || g["@type"] === "BlogPosting"));
          if (art) {
            console.log("    Found Article/BlogPosting in @graph:", JSON.stringify({
              "@type": art["@type"],
              "@id": art["@id"],
              headline: art.headline,
              datePublished: art.datePublished,
              dateModified: art.dateModified,
              author: art.author,
              publisher: art.publisher,
              mainEntityOfPage: art.mainEntityOfPage,
              image: art.image
            }, null, 2));
          }
        } else {
          console.log(`  Script #${idx + 1}: Single Object, Type:`, parsed["@type"]);
        }
      } catch (err) {
        console.log(`  Script #${idx + 1} PARSE ERROR:`, err.message);
      }
    });

    const times = [...r.html.matchAll(/<time[^>]*datetime=["']([^"']*)["'][^>]*>([\s\S]*?)<\/time>/gi)];
    console.log("Time tags count:", times.length);
    times.forEach(t => console.log("  Time tag:", t[1], "| inner text:", t[2].trim()));

    const visibleAuthor = r.html.match(/<span[^>]*class=["'][^"']*author[^"']*["'][^>]*>([\s\S]*?)<\/span>/i) ||
                          r.html.match(/(?:by|written by)\s+([A-Za-z0-9\s'&.-]{3,40})/i);
    console.log("Visible Author byline:", visibleAuthor ? visibleAuthor[0].trim() : "NONE DETECTED");

    const visibleH1 = r.html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    console.log("Visible H1:", visibleH1 ? visibleH1[1].replace(/<[^>]+>/g, "").trim() : "NONE");
  }
}
test();
