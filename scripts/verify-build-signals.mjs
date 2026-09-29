import fs from "node:fs/promises";

async function test() {
  const pages = [
    { p: ".next/server/app/services/ai-production-dubai-page.html", name: "AI Video Dubai" },
    { p: ".next/server/app/services/dubai-seo.html", name: "Dubai SEO" },
    { p: ".next/server/app/services.html", name: "Services Hub" },
    { p: ".next/server/app/our-services.html", name: "Our Services Hub" },
    { p: ".next/server/app/aeo-dubai.html", name: "AEO Dubai" },
    { p: ".next/server/app/services/ai-video-production-agency.html", name: "AI Video Mumbai" },
    { p: ".next/server/app/services/website-development-pune-page.html", name: "Pune Web Dev" },
  ];

  for (const page of pages) {
    try {
      const html = await fs.readFile(page.p, "utf8");
      const titleM = html.match(/<title>([^<]+)<\/title>/i);
      const h1M = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const ogTitleM = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
      const twTitleM = html.match(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i);
      const descM = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
      console.log(`\n=== ${page.name} ===`);
      console.log("Title:    ", titleM ? titleM[1] : "N/A");
      console.log("H1:       ", h1M ? h1M[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "N/A");
      console.log("OG Title: ", ogTitleM ? ogTitleM[1] : "N/A");
      console.log("TW Title: ", twTitleM ? twTitleM[1] : "N/A");
      console.log("Desc:     ", descM ? descM[1] : "N/A");

      // Check Schema
      const jsonLdM = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
      if (jsonLdM) {
        for (const block of jsonLdM) {
          const jsonText = block.replace(/<\/?script[^>]*>/gi, "");
          try {
            const parsed = JSON.parse(jsonText);
            const items = Array.isArray(parsed) ? parsed : [parsed];
            for (const item of items) {
              if (item["@type"] === "Service") {
                console.log("Schema Service:", item.name, "| serviceType:", item.serviceType, "| areaServed:", item.areaServed);
              }
              if (item["@type"] === "BreadcrumbList") {
                const crumbs = item.itemListElement.map((c) => c.name);
                console.log("Schema Breadcrumb:", crumbs.join(" > "));
              }
            }
          } catch {}
        }
      }

      // Check for forbidden labels in this page
      const forbidden = ["Internal Link", "Target Keyword", "AI Overview Answer", "SEO Notes", "India SEO", "Archives:"];
      const found = forbidden.filter((f) => html.includes(f));
      if (found.length > 0) {
        console.log("WARNING - Found forbidden labels:", found);
      } else {
        console.log("✓ Zero forbidden labels found");
      }

      // Check Mumbai localities on Dubai pages
      if (page.name.includes("Dubai") || page.name.includes("AEO")) {
        const mumbaiLocs = ["Andheri", "Worli", "Fort", "Churchgate", "Colaba"];
        const foundMumbai = mumbaiLocs.filter((m) => new RegExp(`\\b${m}\\b`, "i").test(html));
        if (foundMumbai.length > 0) {
          console.log("WARNING - Found Mumbai localities:", foundMumbai);
        } else {
          console.log("✓ Zero Mumbai localities found");
        }
      }
    } catch (e) {
      console.log("Error reading", page.p, e.message);
    }
  }
}

test();
