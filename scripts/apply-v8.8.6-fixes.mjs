import fs from "node:fs/promises";
import path from "node:path";

async function run() {
  console.log("Applying V8.8.6 fixes...");

  // 1. services__ai-production-dubai-page.json
  {
    const p = "data/wordpress/mirrors/pages/services__ai-production-dubai-page.json";
    let content = await fs.readFile(p, "utf8");
    content = content.replace(
      '<article class=\\"dgs-card\\"><small>Internal Link</small><h3><a href=\\"/services/dubai-seo/\\">SEO Services In Dubai</a></h3>',
      '<article class=\\"dgs-card\\"><small>Search Growth</small><h3><a href=\\"/services/dubai-seo/\\">SEO Services In Dubai</a></h3>'
    );
    content = content.replace(
      '<article class=\\"dgs-card\\"><small>Internal Link</small><h3><a href=\\"/aeo-dubai/\\">AEO Services In Dubai</a></h3>',
      '<article class=\\"dgs-card\\"><small>AI Visibility</small><h3><a href=\\"/aeo-dubai/\\">AEO Services In Dubai</a></h3>'
    );
    content = content.replace(
      '<article class=\\"dgs-card\\"><small>Internal Link</small><h3><a href=\\"/blogs/optimize-for-ai-overviews/\\">Optimize For AI Overviews</a></h3>',
      '<article class=\\"dgs-card\\"><small>AI Search</small><h3><a href=\\"/blogs/optimize-for-ai-overviews/\\">Optimize For AI Overviews</a></h3>'
    );
    content = content.replace(
      '<article class=\\"dgs-card\\"><small>Internal Link</small><h3><a href=\\"/services/performance-marketing/\\">Google Ads Services</a></h3>',
      '<article class=\\"dgs-card\\"><small>Paid Performance</small><h3><a href=\\"/services/performance-marketing/\\">Google Ads Services</a></h3>'
    );
    content = content.replace(
      '<article class=\\"dgs-card\\"><small>Internal Link</small><h3><a href=\\"/services/website-development/\\">Website Development Company In Dubai</a></h3>',
      '<article class=\\"dgs-card\\"><small>Web Platform</small><h3><a href=\\"/services/website-development/\\">Website Development Company In Dubai</a></h3>'
    );
    content = content.replace(
      '<article class=\\"dgs-card\\"><small>Internal Link</small><h3><a href=\\"/blogs/future-of-seo/\\">Future Of SEO</a></h3>',
      '<article class=\\"dgs-card\\"><small>Search Trends</small><h3><a href=\\"/blogs/future-of-seo/\\">Future Of SEO</a></h3>'
    );
    await fs.writeFile(p, content, "utf8");
    console.log("✓ Updated services__ai-production-dubai-page.json (cleaned 6 editorial labels)");
  }

  // 2. services__dubai-seo.json
  {
    const p = "data/wordpress/mirrors/pages/services__dubai-seo.json";
    let content = await fs.readFile(p, "utf8");
    content = content.replace(
      "Business Bay, DIFC, Andheri, Sharjah, and Abu Dhabi discovery.",
      "Business Bay, DIFC, Downtown Dubai, Sharjah, and Abu Dhabi discovery."
    );
    content = content.replace(
      "Dubai, Business Bay, DIFC, Andheri, Sharjah, and Abu Dhabi searches.",
      "Dubai, Business Bay, DIFC, Downtown Dubai, Sharjah, and Abu Dhabi searches."
    );
    content = content.replace(
      "targeting Downtown Dubai and Worli searches.",
      "targeting Downtown Dubai and Business Bay searches."
    );
    content = content.replace(
      "targeting Dubai Marina, Fort, Churchgate, and Colaba.",
      "targeting Dubai Marina, DIFC, JLT, and Business Bay."
    );
    content = content.replace(
      "D'Genius Solutions provides SEO services in Dubai for businesses improve Google rankings",
      "D'Genius Solutions provides SEO services in Dubai for businesses that want to improve Google rankings"
    );
    content = content.replace(
      'scalable <a href=\\"/services/ai-production-dubai-page/\\" style=\\"color:#00F2FE;text-decoration:underline;\\">AI video production in Dubai</a>',
      'scalable <a href=\\"/services/ai-production-dubai-page/\\" style=\\"color:#00F2FE;text-decoration:underline;\\">Dubai AI video production</a>'
    );
    await fs.writeFile(p, content, "utf8");
    console.log("✓ Updated services__dubai-seo.json (removed Mumbai localities, fixed grammar, varied anchor)");
  }

  // 3. aeo-dubai.json
  {
    const p = "data/wordpress/mirrors/pages/aeo-dubai.json";
    let content = await fs.readFile(p, "utf8");
    content = content.replace(
      '<a href=\\"/services/ai-production-dubai-page/\\" class=\\"dgs-inline-link\\">AI video production in Dubai</a>, <a href=\\"/services/geo/\\"',
      '<a href=\\"/services/ai-production-dubai-page/\\" class=\\"dgs-inline-link\\">AI-generated video production for UAE campaigns</a>, <a href=\\"/services/geo/\\"'
    );
    await fs.writeFile(p, content, "utf8");
    console.log("✓ Updated aeo-dubai.json (varied anchor for AI Video Dubai)");
  }

  // 4. services__ai-video-production-agency.json
  {
    const p = "data/wordpress/mirrors/pages/services__ai-video-production-agency.json";
    let content = await fs.readFile(p, "utf8");
    const targetCard = '<article class=\\"dgs-card\\"><h3><a href=\\"/blogs/future-of-seo/\\">Future Of SEO</a></h3><p>Connect AI video, search visibility, brand authority and content strategy with the future of digital growth.</p></article>';
    const dubaiCard = '<article class=\\"dgs-card\\"><small>Regional Delivery</small><h3><a href=\\"/services/ai-production-dubai-page/\\">AI Video Services for Dubai Brands</a></h3><p>Produce localized AI video ads, product reels and brand films tailored for Dubai and UAE business campaigns.</p></article>' + targetCard;
    if (content.includes(targetCard) && !content.includes("ai-production-dubai-page")) {
      content = content.replace(targetCard, dubaiCard);
      await fs.writeFile(p, content, "utf8");
      console.log("✓ Updated services__ai-video-production-agency.json (added contextual link to Dubai AI Video)");
    } else {
      console.log("- services__ai-video-production-agency.json already has link or pattern skipped");
    }
  }

  // 5. services.json and our-services.json
  for (const filename of ["services.json", "our-services.json"]) {
    const p = path.join("data/wordpress/mirrors/pages", filename);
    let content = await fs.readFile(p, "utf8");
    content = content.replaceAll(
      '<a href=\\"/services/ai-production-dubai-page/\\">AI Production Dubai page</a>',
      '<a href=\\"/services/ai-production-dubai-page/\\">AI Video Production Agency in Dubai</a>'
    );
    content = content.replaceAll(
      '<a href=\\"/services/website-development-pune-page/\\">Website Development Pune Page</a>',
      '<a href=\\"/services/website-development-pune-page/\\">Website Development Company in Pune</a>'
    );
    content = content.replaceAll(
      "Archives: <span>Services</span>",
      "Digital Marketing, SEO & AI Services"
    );
    content = content.replaceAll(
      "· India SEO / Local / AI Search",
      "· India | SEO / Local / AI Search"
    );
    await fs.writeFile(p, content, "utf8");
    console.log(`✓ Updated ${filename} (fixed card titles, archive title, separator)`);
  }

  // 6. services__social-media-marketing.json
  {
    const p = "data/wordpress/mirrors/pages/services__social-media-marketing.json";
    let content = await fs.readFile(p, "utf8");
    content = content.replace(
      "Elite Agency - Limited Client Availability",
      "Elite Social Growth Agency"
    );
    content = content.replace(
      /<p class=\\"smm-urgency-note\\">Only 2 spots remaining for <span id=\\"current-month-year\\"><\/span><\/p>/,
      '<p class=\\"smm-urgency-note\\">Strategic onboarding for growth-focused brands</p>'
    );
    content = content.replace(
      "<span>60-Day Results Guarantee</span>",
      "<span>Data-Backed Growth Framework</span>"
    );
    // Remove Debug script comments
    content = content.replaceAll("// Debug:Check if elements exist console.log('Timeline:',timeline);console.log('Lin", "");
    content = content.replaceAll("// Debug:Show current progress if (percentage>0 && percentage < 100){console.log('", "");
    await fs.writeFile(p, content, "utf8");
    console.log("✓ Updated services__social-media-marketing.json (cleaned unsubstantiated claims and debug script)");
  }

  // 7. services__llm-seo-service.json
  {
    const p = "data/wordpress/mirrors/pages/services__llm-seo-service.json";
    let content = await fs.readFile(p, "utf8");
    const firstIdx = content.indexOf("What Are LLM SEO Services?");
    if (firstIdx !== -1) {
      const secondIdx = content.indexOf("What Are LLM SEO Services?", firstIdx + 25);
      if (secondIdx !== -1) {
        content =
          content.slice(0, secondIdx) +
          "Why Brands Need LLM SEO in the Age of AI Search" +
          content.slice(secondIdx + "What Are LLM SEO Services?".length);
        await fs.writeFile(p, content, "utf8");
        console.log("✓ Updated services__llm-seo-service.json (resolved duplicate H2)");
      }
    }
  }

  // 8. services__branding.json
  {
    const p = "data/wordpress/mirrors/pages/services__branding.json";
    let content = await fs.readFile(p, "utf8");
    content = content.replace(
      '<h3 class=\\"bp-cost-card-title\\">10-20% Annual Growth Drain</h3>',
      '<h3 class=\\"bp-cost-card-title\\">Compounding Growth Drain</h3>'
    );
    await fs.writeFile(p, content, "utf8");
    console.log("✓ Updated services__branding.json (replaced unverified percentage heading)");
  }

  // 9. nextjs-route-registry.generated.json
  {
    const p = "data/migration/nextjs-route-registry.generated.json";
    const reg = JSON.parse(await fs.readFile(p, "utf8"));
    for (const r of reg.routes) {
      if (r.path === "/services/ai-production-dubai-page/") {
        r.title = "AI Video Production Agency in Dubai | AI Video Services | DGS";
        r.description = "D'Genius Solutions creates AI video ads, product films, avatars, reels and brand films for Dubai and UAE brands with human-led creative direction, editing and campaign-ready delivery.";
      }
      if (r.path === "/services/website-development-pune-page/") {
        r.title = "Website Development Company in Pune | Web Design & AMC | DGS";
      }
      if (r.path === "/services/dubai-seo/") {
        r.title = "SEO Agency in Dubai | SEO Services & Local SEO UAE | DGS";
      }
      if (r.path === "/services/") {
        r.title = "Digital Marketing, SEO & AI Services | D'Genius Solutions";
      }
      if (r.headings) {
        for (const h of r.headings) {
          if (h.text === "AI Production Dubai page") {
            h.text = "AI Video Production Agency in Dubai";
          }
          if (h.text === "Website Development Pune Page") {
            h.text = "Website Development Company in Pune";
          }
        }
      }
    }
    await fs.writeFile(p, JSON.stringify(reg, null, 2), "utf8");
    console.log("✓ Updated nextjs-route-registry.generated.json");
  }

  console.log("All V8.8.6 fixes successfully applied!");
}

run().catch(console.error);
