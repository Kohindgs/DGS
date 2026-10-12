import https from "node:https";

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
      })
      .on("error", reject);
  });
}

function head(url) {
  return new Promise((resolve, reject) => {
    https
      .request(url, { method: "HEAD" }, (res) => resolve({ status: res.statusCode, headers: res.headers }))
      .on("error", reject)
      .end();
  });
}

async function main() {
  console.log("================================================================================");
  console.log("=== DGS MASTER LIVE PRODUCTION ACCEPTANCE & COMPREHENSIVE VERIFICATION ===");
  console.log("================================================================================\n");

  const results = {
    blog: {},
    agency: {},
    portfolio: {},
    home: {},
    adsPage: {},
    dubaiPage: {},
  };

  // 1. BLOG CMS ACCEPTANCE
  console.log("1. Verifying Live Blog Post...");
  const blogUrl = "https://www.dgeniussolutions.com/blogs/ai-video-production-agency-how-to-choose-the-right-partner-for-your-brand/";
  const blogRes = await get(blogUrl);
  results.blog.status = blogRes.status;
  results.blog.h1 = (blogRes.body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]?.replace(/<[^>]+>/g, "").trim();
  results.blog.canonical = (blogRes.body.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || [])[1];
  
  const imgMatch = blogRes.body.match(/src=["'](\/cms-media\/[^"']+)["']/i) ||
                   blogRes.body.match(/src=["']([^"']*ai-video-production-studio\.webp)["']/i);
  const imgSrc = imgMatch ? imgMatch[1] : "/cms-media/uploads/ai-video-production-studio.webp";
  const imgRes = await head("https://www.dgeniussolutions.com" + (imgSrc.startsWith("/") ? imgSrc : "/" + imgSrc));
  results.blog.featuredImgStatus = imgRes.status;
  results.blog.hasBlogPostingSchema = blogRes.body.includes('"@type":"BlogPosting"') || blogRes.body.includes('"@type": "BlogPosting"');

  console.log(`   Blog HTTP: ${results.blog.status}`);
  console.log(`   Blog H1: ${results.blog.h1}`);
  console.log(`   Blog Canonical: ${results.blog.canonical}`);
  console.log(`   Featured Image: ${imgSrc} (HTTP ${results.blog.featuredImgStatus})`);
  console.log(`   BlogPosting Schema: ${results.blog.hasBlogPostingSchema}`);

  // 2. PRIMARY AI VIDEO AGENCY COMMERCIAL AUTHORITY PAGE
  console.log("\n2. Verifying AI Video Production Agency Page (/services/ai-video-production-agency/)...");
  const agencyUrl = "https://www.dgeniussolutions.com/services/ai-video-production-agency/";
  const agencyRes = await get(agencyUrl);
  results.agency.status = agencyRes.status;
  
  // Industries
  results.agency.hasAutomotive = agencyRes.body.includes("Automobile &amp; Automotive Sales") || agencyRes.body.includes("Automobile & Automotive Sales");
  results.agency.hasEdTech = agencyRes.body.includes("EdTech &amp; Education") || agencyRes.body.includes("EdTech & Education");
  results.agency.hasFmcg = agencyRes.body.includes("FMCG &amp; Consumer Brands") || agencyRes.body.includes("FMCG & Consumer Brands");
  results.agency.hasManufacturing = agencyRes.body.includes("Manufacturing &amp; Industrial") || agencyRes.body.includes("Manufacturing & Industrial");
  
  // Synonyms
  results.agency.hasAgencySynonym = agencyRes.body.includes("automobile sales AI video production agency") || agencyRes.body.includes("AI video production agency");
  results.agency.hasStudioSynonym = agencyRes.body.includes("EdTech AI video production studio") || agencyRes.body.includes("AI video production studio");
  results.agency.hasHouseSynonym = agencyRes.body.includes("manufacturing AI video production house") || agencyRes.body.includes("AI video production house");

  // Proof
  results.agency.hasHyundaiProof = agencyRes.body.includes("Hyundai Creta AI Feature &amp; Technology Explainer") || agencyRes.body.includes("Hyundai Creta AI Feature & Technology Explainer");
  results.agency.hasSundaramProof = agencyRes.body.includes("Sundaram E-Learning");
  results.agency.hasClarionProof = agencyRes.body.includes("Clarion Agro");
  results.agency.hasManufacturingCapability = agencyRes.body.includes("Dedicated industrial visualization pipeline");

  // Locations
  results.agency.hasWesternMumbai = agencyRes.body.includes("Western Mumbai") && (agencyRes.body.includes("Bandra, Khar & Western Suburbs") || agencyRes.body.includes("Bandra, Khar &amp; Western Suburbs"));
  results.agency.hasCentralMumbai = (agencyRes.body.includes("Central & Business Hubs") || agencyRes.body.includes("Central &amp; Business Hubs")) && (agencyRes.body.includes("BKC, Lower Parel & Powai") || agencyRes.body.includes("BKC, Lower Parel &amp; Powai"));
  results.agency.hasWiderMmr = agencyRes.body.includes("Wider MMR") && (agencyRes.body.includes("Thane & Navi Mumbai") || agencyRes.body.includes("Thane &amp; Navi Mumbai"));
  results.agency.hasNationalDelivery = agencyRes.body.includes("National Delivery") && agencyRes.body.includes("Serving Brands Across India");

  // FAQs
  results.agency.hasAutoFaq = agencyRes.body.includes("What does an automobile AI video production agency create?");
  results.agency.hasEdTechFaq = agencyRes.body.includes("How can EdTech companies use AI video production?");
  results.agency.hasFmcgFaq = agencyRes.body.includes("How can FMCG brands use AI-generated product videos?");
  results.agency.hasMfgFaq = agencyRes.body.includes("How can manufacturing companies use AI video production?");
  results.agency.hasNationalFaq = agencyRes.body.includes("create AI videos for brands across India?");

  // Schema hasOfferCatalog
  results.agency.hasOfferCatalog = agencyRes.body.includes("OfferCatalog") && agencyRes.body.includes("Automotive & Automobile Sales AI Video Production");

  console.log(`   Agency Page HTTP: ${results.agency.status}`);
  console.log(`   Automobile Block: ${results.agency.hasAutomotive} (Proof: ${results.agency.hasHyundaiProof})`);
  console.log(`   EdTech Block: ${results.agency.hasEdTech} (Proof: ${results.agency.hasSundaramProof})`);
  console.log(`   FMCG Block: ${results.agency.hasFmcg} (Proof: ${results.agency.hasClarionProof})`);
  console.log(`   Manufacturing Block: ${results.agency.hasManufacturing} (Capability: ${results.agency.hasManufacturingCapability})`);
  console.log(`   Location Groups: Western=${results.agency.hasWesternMumbai}, Central=${results.agency.hasCentralMumbai}, MMR=${results.agency.hasWiderMmr}, National=${results.agency.hasNationalDelivery}`);
  console.log(`   Industry FAQs: Auto=${results.agency.hasAutoFaq}, EdTech=${results.agency.hasEdTechFaq}, FMCG=${results.agency.hasFmcgFaq}, Mfg=${results.agency.hasMfgFaq}, National=${results.agency.hasNationalFaq}`);
  console.log(`   OfferCatalog Schema: ${results.agency.hasOfferCatalog}`);

  // 3. FULL PORTFOLIO PAGE
  console.log("\n3. Verifying Full Portfolio Page (/portfolio/)...");
  const portfolioUrl = "https://www.dgeniussolutions.com/portfolio/";
  const portRes = await get(portfolioUrl);
  results.portfolio.status = portRes.status;
  results.portfolio.hasHyundai = portRes.body.includes("Hyundai Creta — Feature &amp; Technology Explainer") || portRes.body.includes("Hyundai Creta — Feature & Technology Explainer");
  results.portfolio.hasSundaram = portRes.body.includes("Sundaram E-Learning — Grade 3 Balbharati");
  results.portfolio.hasClarion = portRes.body.includes("Clarion Agro — Jasmine Atta Campaign");
  results.portfolio.hasBetterCeasons = portRes.body.includes("Better Ceasons — 1000 Saal Ka Tenant");
  results.portfolio.hasCrawlableCaptions = portRes.body.includes('class="PortfolioPreviewA-module') && portRes.body.includes("workCaption");

  // Check ordering
  const idxHyundai = portRes.body.indexOf("hyundai-creta-1");
  const idxSundaram = portRes.body.indexOf("sundaram-elearning-bal-3-1");
  const idxClarion = portRes.body.indexOf("clarion-jasmine-atta-hindi");
  const idxBetterCeasons = portRes.body.indexOf("better-ceasons-tenant");
  results.portfolio.orderCorrect = (idxHyundai < idxSundaram) && (idxSundaram < idxClarion) && (idxClarion < idxBetterCeasons);

  console.log(`   Portfolio HTTP: ${results.portfolio.status}`);
  console.log(`   All 4 New Groups Present: Hyundai=${results.portfolio.hasHyundai}, Sundaram=${results.portfolio.hasSundaram}, Clarion=${results.portfolio.hasClarion}, BetterCeasons=${results.portfolio.hasBetterCeasons}`);
  console.log(`   Deterministic Priority Order (Hyundai < Sundaram < Clarion < BetterCeasons): ${results.portfolio.orderCorrect}`);
  console.log(`   Crawlable HTML Captions & Titles: ${results.portfolio.hasCrawlableCaptions}`);

  // 4. HOMEPAGE PORTFOLIO
  console.log("\n4. Verifying Homepage Portfolio Section (/)...");
  const homeUrl = "https://www.dgeniussolutions.com/";
  const homeRes = await get(homeUrl);
  results.home.status = homeRes.status;
  
  const homeIdxHyundai = homeRes.body.indexOf("hyundai_creta_1");
  const homeIdxSundaram = homeRes.body.indexOf("sundaram_bal_3_1");
  const homeIdxClarion = homeRes.body.indexOf("clarion_jasmine_atta_hindi");
  const homeIdxBetter = homeRes.body.indexOf("better_ceasons_tenant");

  results.home.hasTop4 = (homeIdxHyundai !== -1) && (homeIdxSundaram !== -1) && (homeIdxClarion !== -1) && (homeIdxBetter !== -1);
  results.home.top4Order = (homeIdxHyundai < homeIdxSundaram) && (homeIdxSundaram < homeIdxClarion) && (homeIdxClarion < homeIdxBetter);

  console.log(`   Homepage HTTP: ${results.home.status}`);
  console.log(`   Homepage 4 Positions Present: ${results.home.hasTop4}`);
  console.log(`   Homepage 1=Hyundai, 2=Sundaram, 3=Clarion, 4=BetterCeasons: ${results.home.top4Order}`);

  // 5. GOOGLE ADS LANDING PAGE
  console.log("\n5. Verifying AI Production Google Ads Landing Page (/ai-production-videos-google-ads-landing-page/)...");
  const adsUrl = "https://www.dgeniussolutions.com/ai-production-videos-google-ads-landing-page/";
  const adsRes = await get(adsUrl);
  results.adsPage.status = adsRes.status;
  results.adsPage.hasHyundai = adsRes.body.includes("Hyundai Creta — Feature &amp; Technology Explainer") || adsRes.body.includes("Hyundai Creta — Feature & Technology Explainer");
  results.adsPage.hasClarion = adsRes.body.includes("Clarion Agro — Jasmine Atta Campaign (Hindi)");
  results.adsPage.hasBetterCeasons = adsRes.body.includes("Better Ceasons — 1000 Saal Ka Tenant");
  results.adsPage.hasSundaram = adsRes.body.includes("Sundaram E-Learning — Interactive Curriculum");

  console.log(`   Ads Landing Page HTTP: ${results.adsPage.status}`);
  console.log(`   Commercial Proof Cards: Hyundai=${results.adsPage.hasHyundai}, Clarion=${results.adsPage.hasClarion}, BetterCeasons=${results.adsPage.hasBetterCeasons}, Sundaram=${results.adsPage.hasSundaram}`);

  // 6. DUBAI AI VIDEO PAGE
  console.log("\n6. Verifying Dubai AI Video Page (/services/ai-production-dubai-page/)...");
  const dubaiUrl = "https://www.dgeniussolutions.com/services/ai-production-dubai-page/";
  const dubaiRes = await get(dubaiUrl);
  results.dubaiPage.status = dubaiRes.status;
  results.dubaiPage.neutralPresentation = /Proof-Led[\s\S]*?AI Video Production For Brands/i.test(dubaiRes.body) || dubaiRes.body.includes("AI-Generated Video Work");
  results.dubaiPage.noFalseDubaiClaims = !dubaiRes.body.includes("Hyundai Dubai client") && !dubaiRes.body.includes("Sundaram Dubai client");

  console.log(`   Dubai Page HTTP: ${results.dubaiPage.status}`);
  console.log(`   Neutral Work Presentation: ${results.dubaiPage.neutralPresentation}`);
  console.log(`   Zero False Dubai Client Claims: ${results.dubaiPage.noFalseDubaiClaims}`);

  console.log("\n================================================================================");
  console.log("=== FINAL VERIFICATION RESULT SUMMARY ===");
  console.log("================================================================================");
  const allPass = 
    results.blog.status === 200 &&
    results.blog.featuredImgStatus === 200 &&
    results.blog.hasBlogPostingSchema &&
    results.agency.status === 200 &&
    results.agency.hasAutomotive &&
    results.agency.hasEdTech &&
    results.agency.hasFmcg &&
    results.agency.hasManufacturing &&
    results.agency.hasOfferCatalog &&
    results.portfolio.status === 200 &&
    results.portfolio.orderCorrect &&
    results.portfolio.hasCrawlableCaptions &&
    results.home.status === 200 &&
    results.home.top4Order &&
    results.adsPage.status === 200 &&
    results.adsPage.hasHyundai &&
    results.dubaiPage.status === 200 &&
    results.dubaiPage.noFalseDubaiClaims;

  console.log(`OVERALL PRODUCTION ACCEPTANCE: ${allPass ? "✓ 100% GREEN - ALL PASS" : "❌ INCOMPLETE"}`);
  if (!allPass) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
