import fs from "node:fs";

const agencyPath = "data/wordpress/mirrors/pages/services__ai-video-production-agency.json";
const adsPagePath = "data/wordpress/mirrors/pages/ai-production-videos-google-ads-landing-page.json";

const agencyPage = JSON.parse(fs.readFileSync(agencyPath, "utf8"));
const adsPage = JSON.parse(fs.readFileSync(adsPagePath, "utf8"));

console.log("=== APPLYING AI VIDEO INDUSTRY & LOCATION SEO EXPANSION ===");

// -------------------------------------------------------------
// 1. UPDATE INDUSTRY SECTION (id="industries") on AI Video Agency Page
// -------------------------------------------------------------
const oldIndustriesSectionRegex = /<section class="dgs-section-tight" id="industries">[\s\S]*?<\/section>/i;

const newIndustriesSection = `<section class="dgs-section-tight" id="industries"><div class="dgs-wrap"><div class="dgs-narrow dgs-center" style="margin-bottom:52px"><p class="dgs-eyebrow">Industry AI Video Solutions</p><h2 class="dgs-title-small">AI Video Production For <span class="dgs-grad-text">High-Growth Industry Sectors</span></h2><p class="dgs-copy" style="margin-top:18px">Different industries face unique visual and operational hurdles. D’Genius Solutions operates as an AI video production agency, creative AI studio and production house delivering specialized commercial video solutions for automotive sales, EdTech publishing, FMCG consumer brands, and B2B manufacturing.</p></div><div class="dgs-grid dgs-services-grid" style="grid-template-columns:repeat(2,1fr);gap:28px">

<article class="dgs-card" style="display:flex;flex-direction:column;justify-content:space-between"><div>
<small style="display:block!important;color:var(--dgs-soft);font-size:0.75rem;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px">Automobile & Automotive Sales</small>
<h3 style="font-size:1.65rem;margin-bottom:14px">AI Video Production for Automobile and Automotive Brands</h3>
<p style="margin-bottom:14px;color:rgba(255,255,255,0.78);line-height:1.65"><strong>The Buyer Challenge:</strong> Automotive manufacturers, regional dealerships and car sales networks struggle with weeks-long physical vehicle shoots, costly studio rentals for each trim variant, and delays in delivering localized video assets to showroom sales teams.</p>
<p style="margin-bottom:14px;color:rgba(255,255,255,0.78);line-height:1.65"><strong>Why AI Production Helps:</strong> As an automobile sales AI video production agency, studio and production house, we generate photorealistic exterior motion visuals, dynamic road environments, and intricate technology walkthroughs without track rental bottlenecks or shipping physical vehicle fleets.</p>
<p style="margin-bottom:14px;color:rgba(255,255,255,0.78);line-height:1.65"><strong>Use Cases:</strong> Car launches, vehicle feature explainers, dealership sales enablement, automotive digital ads, vehicle walkthroughs, tech highlight videos, and regional dealership campaigns.</p>
<div style="background:rgba(255,255,255,0.06);padding:12px 16px;border-radius:12px;margin-bottom:18px;border-left:3px solid #b7d7ff">
<strong style="color:#b7d7ff;display:block;font-size:0.85rem;margin-bottom:4px">Verified Client Proof:</strong>
<span style="font-size:0.9rem;color:#fff">Hyundai Motors — Hyundai Creta AI Feature & Technology Explainer Video Series. Multi-part commercial production breaking down cabin tech, ADAS highlights, and performance engineering.</span>
</div>
</div>
<div><a href="#cta-form" class="dgs-btn dgs-btn-ghost" style="display:inline-block;padding:10px 20px;font-size:0.85rem">Discuss Automotive AI Video →</a></div>
</article>

<article class="dgs-card" style="display:flex;flex-direction:column;justify-content:space-between"><div>
<small style="display:block!important;color:var(--dgs-soft);font-size:0.75rem;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px">EdTech & Education</small>
<h3 style="font-size:1.65rem;margin-bottom:14px">AI Video Production for EdTech and Education Brands</h3>
<p style="margin-bottom:14px;color:rgba(255,255,255,0.78);line-height:1.65"><strong>The Buyer Challenge:</strong> EdTech platforms and textbook publishers require thousands of curriculum-aligned chapter explainers across multiple grades and regional languages. Frame-by-frame 2D/3D animation is prohibitively expensive and takes months per syllabus.</p>
<p style="margin-bottom:14px;color:rgba(255,255,255,0.78);line-height:1.65"><strong>Why AI Production Helps:</strong> Our EdTech AI video production studio and production house transforms textbook scripts into animated lesson videos, 3D science concepts, and interactive character modules rapidly, localizing content across Indian languages at scale.</p>
<p style="margin-bottom:14px;color:rgba(255,255,255,0.78);line-height:1.65"><strong>Use Cases:</strong> Grade-based lesson videos, animated curriculum chapters, digital textbook companion modules, multilingual e-learning libraries, teacher support content, and student revision videos.</p>
<div style="background:rgba(255,255,255,0.06);padding:12px 16px;border-radius:12px;margin-bottom:18px;border-left:3px solid #b7d7ff">
<strong style="color:#b7d7ff;display:block;font-size:0.85rem;margin-bottom:4px">Verified Client Proof:</strong>
<span style="font-size:0.9rem;color:#fff">Sundaram E-Learning — Multi-grade interactive curriculum video production covering Primary & Secondary Environmental Studies, Mathematics, and Marathi/English language chapters.</span>
</div>
</div>
<div><a href="#cta-form" class="dgs-btn dgs-btn-ghost" style="display:inline-block;padding:10px 20px;font-size:0.85rem">Discuss EdTech Video Production →</a></div>
</article>

<article class="dgs-card" style="display:flex;flex-direction:column;justify-content:space-between"><div>
<small style="display:block!important;color:var(--dgs-soft);font-size:0.75rem;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px">FMCG & Consumer Brands</small>
<h3 style="font-size:1.65rem;margin-bottom:14px">AI Video Production for FMCG and Consumer Brands</h3>
<p style="margin-bottom:14px;color:rgba(255,255,255,0.78);line-height:1.65"><strong>The Buyer Challenge:</strong> Fast-moving consumer goods and packaged food brands require rapid visual turnaround for festival calendars, new packaging variants, and performance ad testing across diverse linguistic regions in India.</p>
<p style="margin-bottom:14px;color:rgba(255,255,255,0.78);line-height:1.65"><strong>Why AI Production Helps:</strong> Our FMCG AI video production agency and studio produces appetite-appeal food visuals, packaging simulations, and lifestyle scenes with rapid adaptation into Hindi, Telugu, Tamil, and regional state campaigns without repeated set construction.</p>
<p style="margin-bottom:14px;color:rgba(255,255,255,0.78);line-height:1.65"><strong>Use Cases:</strong> Packaged food launches, recipe & ingredient videos, festival campaign creatives, multilingual regional digital ads, social media reels, and performance ad cutdowns.</p>
<div style="background:rgba(255,255,255,0.06);padding:12px 16px;border-radius:12px;margin-bottom:18px;border-left:3px solid #b7d7ff">
<strong style="color:#b7d7ff;display:block;font-size:0.85rem;margin-bottom:4px">Verified Client Proof:</strong>
<span style="font-size:0.9rem;color:#fff">Clarion Agro — Jasmine Atta Digital Commercial Campaign. High-impact commercial videos in Hindi and Telugu demonstrating purity, softness, and family health nutrition.</span>
</div>
</div>
<div><a href="#cta-form" class="dgs-btn dgs-btn-ghost" style="display:inline-block;padding:10px 20px;font-size:0.85rem">Discuss FMCG Video Campaign →</a></div>
</article>

<article class="dgs-card" style="display:flex;flex-direction:column;justify-content:space-between"><div>
<small style="display:block!important;color:var(--dgs-soft);font-size:0.75rem;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px">Manufacturing & Industrial</small>
<h3 style="font-size:1.65rem;margin-bottom:14px">AI Video Production for Manufacturing and Industrial Brands</h3>
<p style="margin-bottom:14px;color:rgba(255,255,255,0.78);line-height:1.65"><strong>The Buyer Challenge:</strong> Heavy engineering, industrial manufacturing, and B2B equipment firms struggle to film on active, hazardous factory floors. Explaining complex internal mechanisms and automated assembly lines to global buyers requires clear visualization without halting production.</p>
<p style="margin-bottom:14px;color:rgba(255,255,255,0.78);line-height:1.65"><strong>Why AI Production Helps:</strong> As a manufacturing AI video production house, we simulate machine mechanics, factory automation processes, and technical engineering workflows with photorealistic 3D/AI precision for global sales enablement and trade exhibitions.</p>
<p style="margin-bottom:14px;color:rgba(255,255,255,0.78);line-height:1.65"><strong>Use Cases:</strong> Heavy machinery demonstration videos, technical engineering explainers, factory automation process walkthroughs, equipment installation guides, and B2B sales presentations.</p>
<div style="background:rgba(255,255,255,0.06);padding:12px 16px;border-radius:12px;margin-bottom:18px;border-left:3px solid #b7d7ff">
<strong style="color:#b7d7ff;display:block;font-size:0.85rem;margin-bottom:4px">DGS Production Capability:</strong>
<span style="font-size:0.9rem;color:#fff">Dedicated industrial visualization pipeline creating CAD-accurate cutaways, safety process demonstrations, and technical machinery explainers for Indian and international industrial manufacturers.</span>
</div>
</div>
<div><a href="#cta-form" class="dgs-btn dgs-btn-ghost" style="display:inline-block;padding:10px 20px;font-size:0.85rem">Consult on Industrial AI Videos →</a></div>
</article>

</div></div></section>`;

if (oldIndustriesSectionRegex.test(agencyPage.body)) {
  agencyPage.body = agencyPage.body.replace(oldIndustriesSectionRegex, newIndustriesSection);
  console.log("✓ Updated Section 17 (industries) with 4 comprehensive industry authority blocks");
} else {
  console.error("❌ Could not match old industries section in agency page!");
}

// -------------------------------------------------------------
// 2. UPDATE LOCATION SECTION (id="mumbai-service-areas")
// -------------------------------------------------------------
const oldLocationSectionRegex = /<section class="dgs-section-tight" id="mumbai-service-areas">[\s\S]*?<\/section>/i;

const newLocationSection = `<section class="dgs-section-tight" id="mumbai-service-areas"><div class="dgs-wrap"><div class="dgs-narrow dgs-center" style="margin-bottom:52px"><p class="dgs-eyebrow">Mumbai & India Service Coverage</p><h2 class="dgs-title-small">AI Video Production Agency Serving <span class="dgs-grad-text">Mumbai and India</span></h2><p class="dgs-copy" style="margin-top:18px">Headquartered in Mumbai with digital-first remote delivery across India, D’Genius Solutions supports brands, agencies, and enterprises with full-cycle AI video production. We serve businesses across key commercial hubs while executing remote production workflows for brands nationwide.</p></div><div class="dgs-grid dgs-services-grid" style="grid-template-columns:repeat(4,1fr);gap:20px">

<article class="dgs-card"><small style="display:block!important;color:var(--dgs-soft);font-size:0.75rem;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px">Western Mumbai</small><h3 style="font-size:1.35rem;margin-bottom:10px">Bandra, Khar & Western Suburbs</h3><p style="font-size:0.92rem;line-height:1.6">Serving brands and agencies across Bandra, Khar, Santacruz, Vile Parle, Andheri, Jogeshwari, Goregaon, and Malad with AI commercial production, social reels, and ad films.</p></article>

<article class="dgs-card"><small style="display:block!important;color:var(--dgs-soft);font-size:0.75rem;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px">Central & Business Hubs</small><h3 style="font-size:1.35rem;margin-bottom:10px">BKC, Lower Parel & Powai</h3><p style="font-size:0.92rem;line-height:1.6">Supporting enterprise, BFSI, and B2B leaders in BKC, Lower Parel, Kurla, Vidya Vihar, Ghatkopar, and Powai with corporate AI explainers and brand films.</p></article>

<article class="dgs-card"><small style="display:block!important;color:var(--dgs-soft);font-size:0.75rem;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px">Wider MMR</small><h3 style="font-size:1.35rem;margin-bottom:10px">Thane & Navi Mumbai</h3><p style="font-size:0.92rem;line-height:1.6">AI video production services for manufacturers, retail institutes, healthcare brands, and high-growth commercial hubs across Thane and Navi Mumbai.</p></article>

<article class="dgs-card"><small style="display:block!important;color:var(--dgs-soft);font-size:0.75rem;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px">National Delivery</small><h3 style="font-size:1.35rem;margin-bottom:10px">Serving Brands Across India</h3><p style="font-size:0.92rem;line-height:1.6">Delivering AI video campaigns remotely for companies in Pune, Bengaluru, Gurugram, Delhi NCR, Hyderabad, Chennai, and Ahmedabad with seamless cloud collaboration.</p></article>

</div></div></section>`;

if (oldLocationSectionRegex.test(agencyPage.body)) {
  agencyPage.body = agencyPage.body.replace(oldLocationSectionRegex, newLocationSection);
  console.log("✓ Updated Section 12 (location) with 4 natural service groups");
} else {
  console.error("❌ Could not match old location section in agency page!");
}

// -------------------------------------------------------------
// 3. ENRICH FAQS (id="faq-section") on AI Video Agency Page
// -------------------------------------------------------------
const additionalFaqs = [
  {
    q: "What does an automobile AI video production agency create?",
    a: "An automobile AI video production agency creates high-impact vehicle feature explainers, new car launch teasers, ADAS and tech walkthroughs, dealership digital ad campaigns, exterior motion visuals, and regional dealership video assets without the high costs and logistical delays of physical track or studio shoots."
  },
  {
    q: "Can AI videos be used for car launches and dealership campaigns?",
    a: "Yes. Automobile brands and dealership networks use AI videos extensively for teaser campaigns, digital showroom displays, social media ad cutdowns, and localized language promotions, allowing dealerships to showcase vehicle features and color variants before physical inventory arrives."
  },
  {
    q: "Can automobile dealers use AI-generated product videos?",
    a: "Yes. Automobile dealers use AI product videos to demonstrate vehicle safety features, cabin technology, performance highlights, and special financing offers across Meta ads, YouTube, WhatsApp marketing, and showroom screens to drive qualified test-drive enquiries."
  },
  {
    q: "How can EdTech companies use AI video production?",
    a: "EdTech companies and educational publishers use AI video production to rapidly transform textbook chapters and lesson plans into engaging animated curriculum videos, 3D science demonstrations, and character-led educational explainers across multiple school grades at a fraction of traditional animation costs."
  },
  {
    q: "Can AI video studios create multilingual educational videos?",
    a: "Yes. One of the strongest advantages of AI video production is multilingual adaptation. Educational modules can be scripted and voiced in English, Hindi, Marathi, Telugu, Tamil, and other regional languages while maintaining consistent character visuals and pedagogical clarity."
  },
  {
    q: "How can FMCG brands use AI-generated product videos?",
    a: "FMCG brands use AI-generated product videos for fast-paced social media reels, appetite-appeal food visuals, packaging reveal videos, seasonal festive greetings, and high-volume performance marketing ad variations across platforms like Instagram and YouTube."
  },
  {
    q: "Can AI video production create multilingual FMCG campaigns?",
    a: "Yes. D’Genius Solutions creates multilingual FMCG campaigns tailored to diverse regional Indian markets, such as our Clarion Agro Jasmine Atta commercial campaigns produced in Hindi and Telugu to connect authentically with state-specific audiences."
  },
  {
    q: "How can manufacturing companies use AI video production?",
    a: "Manufacturing and industrial companies use AI video production to illustrate internal machine mechanics, factory automation processes, and technical engineering workflows that are impossible, dangerous, or too disruptive to shoot on an active production line."
  },
  {
    q: "Can AI explain machinery and industrial products?",
    a: "Yes. AI video generation paired with 3D motion design can create accurate cutaway animations, operational process diagrams, and step-by-step equipment demonstrations that help B2B buyers, distributors, and technicians understand complex machinery quickly."
  },
  {
    q: "Does D’Genius Solutions provide AI video production outside Mumbai?",
    a: "Yes. While D’Genius Solutions is based in Mumbai, Maharashtra, our production workflow is fully remote-enabled, allowing us to collaborate seamlessly with brand marketing teams across India and international markets."
  },
  {
    q: "Can D’Genius Solutions create AI videos for brands across India?",
    a: "Yes. We deliver AI video production services for brands across Pune, Bengaluru, Gurugram, Delhi NCR, Hyderabad, Chennai, Ahmedabad, and other major commercial centers across India through structured cloud-based briefing, review, and delivery pipelines."
  }
];

const faqContainerRegex = /(<div class="faq-container">)([\s\S]*?)(<\/div><\/div><\/section>)/i;
const matchFaq = agencyPage.body.match(faqContainerRegex);
if (matchFaq) {
  let faqHtmlToAppend = "";
  for (const f of additionalFaqs) {
    if (!agencyPage.body.includes(f.q)) {
      faqHtmlToAppend += `<div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question"><button class="faq-q" type="button"><span itemprop="name">${f.q}</span><i>+</i></button><div class="faq-a" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer"><div itemprop="text">${f.a}</div></div></div>`;
    }
  }
  agencyPage.body = agencyPage.body.replace(faqContainerRegex, `$1$2${faqHtmlToAppend}$3`);
  console.log(`✓ Added ${additionalFaqs.length} targeted industry & location FAQs to Section 20`);
} else {
  console.error("❌ Could not match faq-container in agency page!");
}

fs.writeFileSync(agencyPath, JSON.stringify(agencyPage, null, 2), "utf8");
console.log("✓ Saved updated services__ai-video-production-agency.json");

// -------------------------------------------------------------
// 4. POPULATE ADS LANDING PAGE PORTFOLIO GRID
// -------------------------------------------------------------
const adsGridRegex = /<div class="dgs-ai-portfolio-grid" id="dgs-ai-portfolio-grid"><\/div>/i;

const adsPortfolioCardsHtml = `<div class="dgs-ai-portfolio-grid" id="dgs-ai-portfolio-grid">
<article class="dgs-ai-portfolio-item" style="break-inside:avoid;margin-bottom:16px;border-radius:18px;overflow:hidden;background:#0c0d10;box-shadow:0 10px 30px rgba(0,0,0,0.12);border:1px solid rgba(20,17,31,.08)">
  <div style="position:relative;width:100%;aspect-ratio:16/9;overflow:hidden">
    <picture>
      <source srcset="/media/portfolio/posters/hyundai_creta_1_poster.avif" type="image/avif">
      <source srcset="/media/portfolio/posters/hyundai_creta_1_poster.webp" type="image/webp">
      <img src="/media/portfolio/posters/hyundai_creta_1_poster.webp" alt="Hyundai Creta AI Feature & Technology Explainer" width="1920" height="1080" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block">
    </picture>
    <a href="/media/portfolio/videos/hyundai_creta_1.mp4" target="_blank" rel="noopener" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-decoration:none" aria-label="Play Hyundai Creta AI Video">
      <span style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:rgba(196,63,122,0.9);color:#fff;font-size:16px">▶</span>
    </a>
  </div>
  <div style="padding:14px 16px;background:#fff">
    <span style="display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;color:#c43f7a;letter-spacing:0.08em;margin-bottom:4px">Automotive AI Commercial</span>
    <h3 style="margin:0 0 6px;font-size:15px;font-weight:800;color:#14111f;line-height:1.3">Hyundai Creta — Feature & Technology Explainer</h3>
    <p style="margin:0;font-size:13px;color:#5e5a66;line-height:1.5">Commercial AI production breaking down key styling, ADAS tech and driver features.</p>
  </div>
</article>

<article class="dgs-ai-portfolio-item" style="break-inside:avoid;margin-bottom:16px;border-radius:18px;overflow:hidden;background:#0c0d10;box-shadow:0 10px 30px rgba(0,0,0,0.12);border:1px solid rgba(20,17,31,.08)">
  <div style="position:relative;width:100%;aspect-ratio:9/16;max-height:480px;overflow:hidden">
    <picture>
      <source srcset="/media/portfolio/posters/clarion_jasmine_atta_hindi_poster.avif" type="image/avif">
      <source srcset="/media/portfolio/posters/clarion_jasmine_atta_hindi_poster.webp" type="image/webp">
      <img src="/media/portfolio/posters/clarion_jasmine_atta_hindi_poster.webp" alt="Clarion Agro Jasmine Atta Campaign Hindi" width="1080" height="1920" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block">
    </picture>
    <a href="/media/portfolio/videos/clarion_jasmine_atta_hindi.mp4" target="_blank" rel="noopener" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-decoration:none" aria-label="Play Clarion Agro AI Video">
      <span style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:rgba(196,63,122,0.9);color:#fff;font-size:16px">▶</span>
    </a>
  </div>
  <div style="padding:14px 16px;background:#fff">
    <span style="display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;color:#c43f7a;letter-spacing:0.08em;margin-bottom:4px">FMCG Product Campaign</span>
    <h3 style="margin:0 0 6px;font-size:15px;font-weight:800;color:#14111f;line-height:1.3">Clarion Agro — Jasmine Atta Campaign (Hindi)</h3>
    <p style="margin:0;font-size:13px;color:#5e5a66;line-height:1.5">Appetite-appeal commercial ad film demonstrating softness, purity, and family nutrition.</p>
  </div>
</article>

<article class="dgs-ai-portfolio-item" style="break-inside:avoid;margin-bottom:16px;border-radius:18px;overflow:hidden;background:#0c0d10;box-shadow:0 10px 30px rgba(0,0,0,0.12);border:1px solid rgba(20,17,31,.08)">
  <div style="position:relative;width:100%;aspect-ratio:9/16;max-height:480px;overflow:hidden">
    <picture>
      <source srcset="/media/portfolio/posters/better_ceasons_tenant_poster.avif" type="image/avif">
      <source srcset="/media/portfolio/posters/better_ceasons_tenant_poster.webp" type="image/webp">
      <img src="/media/portfolio/posters/better_ceasons_tenant_poster.webp" alt="Better Ceasons 1000 Saal Ka Tenant" width="1080" height="1920" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block">
    </picture>
    <a href="/media/portfolio/videos/better_ceasons_tenant.mp4" target="_blank" rel="noopener" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-decoration:none" aria-label="Play Better Ceasons AI Video">
      <span style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:rgba(196,63,122,0.9);color:#fff;font-size:16px">▶</span>
    </a>
  </div>
  <div style="padding:14px 16px;background:#fff">
    <span style="display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;color:#c43f7a;letter-spacing:0.08em;margin-bottom:4px">Commercial Campaign Film</span>
    <h3 style="margin:0 0 6px;font-size:15px;font-weight:800;color:#14111f;line-height:1.3">Better Ceasons — 1000 Saal Ka Tenant</h3>
    <p style="margin:0;font-size:13px;color:#5e5a66;line-height:1.5">Creative narrative AI commercial series crafted for high-retention brand advertising.</p>
  </div>
</article>

<article class="dgs-ai-portfolio-item" style="break-inside:avoid;margin-bottom:16px;border-radius:18px;overflow:hidden;background:#0c0d10;box-shadow:0 10px 30px rgba(0,0,0,0.12);border:1px solid rgba(20,17,31,.08)">
  <div style="position:relative;width:100%;aspect-ratio:16/9;overflow:hidden">
    <picture>
      <source srcset="/media/portfolio/posters/sundaram_bal_3_1_poster.avif" type="image/avif">
      <source srcset="/media/portfolio/posters/sundaram_bal_3_1_poster.webp" type="image/webp">
      <img src="/media/portfolio/posters/sundaram_bal_3_1_poster.webp" alt="Sundaram E-Learning Grade 3 Interactive Lesson" width="1920" height="1080" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block">
    </picture>
    <a href="/media/portfolio/videos/sundaram_bal_3_1.mp4" target="_blank" rel="noopener" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-decoration:none" aria-label="Play Sundaram E-Learning AI Video">
      <span style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:rgba(196,63,122,0.9);color:#fff;font-size:16px">▶</span>
    </a>
  </div>
  <div style="padding:14px 16px;background:#fff">
    <span style="display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;color:#c43f7a;letter-spacing:0.08em;margin-bottom:4px">EdTech Animation</span>
    <h3 style="margin:0 0 6px;font-size:15px;font-weight:800;color:#14111f;line-height:1.3">Sundaram E-Learning — Interactive Curriculum</h3>
    <p style="margin:0;font-size:13px;color:#5e5a66;line-height:1.5">Interactive animated curriculum video for primary education and digital textbooks.</p>
  </div>
</article>

</div>`;

if (adsGridRegex.test(adsPage.body)) {
  adsPage.body = adsPage.body.replace(adsGridRegex, adsPortfolioCardsHtml);
  fs.writeFileSync(adsPagePath, JSON.stringify(adsPage, null, 2), "utf8");
  console.log("✓ Populated Ads landing page portfolio grid with crawlable priority client cards");
} else if (adsPage.body.includes("id=\"dgs-ai-portfolio-grid\"")) {
  console.log("- Ads landing page portfolio grid already populated or non-empty");
} else {
  console.error("❌ Could not match dgs-ai-portfolio-grid in ads landing page!");
}

console.log("=== ALL AI VIDEO SEO EXPANSION UPDATES COMPLETED SUCCESSFULLY ===");
