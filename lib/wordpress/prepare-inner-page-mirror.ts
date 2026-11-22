import { rewriteWpUrls } from "@/lib/wp-exact/rewrite-wp-urls";
import { applyLocationSeoContent } from "@/lib/seo/location-seo-content";
import { applyInternationalPageContent } from "@/lib/seo/international-page-content";
import { buildServicesHubHtml } from "@/lib/seo/services-hub-content";
import { applyApprovedLinkCorrectionsToHtml } from "./apply-mirror-link-corrections";
import {
  markElementorBackgroundsReady,
  replaceEnviraWrapWithNativeMount,
  stripCapturedFooters,
  unwrapMirrorLazyMedia,
} from "./native-inner-fixes";
import type { InnerPageMirrorContent } from "./inner-mirror-types";
import { normalizeBrandName } from "@/lib/brand";

export type PreparedInnerPageMirror = InnerPageMirrorContent & {
  articleHtml: string;
  combinedStyles: string;
};

function stripLeadingCloseTags(html: string): string {
  return html.replace(/^(?:\s*<\/(?:div|header|section|main|span|nav|aside)>)+/i, "").trim();
}

function stripEmbeddedDocumentWrapper(html: string): string {
  let out = html;
  if (/<(?:!doctype|html|head)\b/i.test(out)) {
    out = out
      .replace(/<!DOCTYPE\b[^>]*>[\s\S]*?<body\b[^>]*>/gi, "")
      .replace(/<\/body>\s*<\/html>/gi, "");
  }
  return out;
}

function normalizeSemanticH1(path: string, html: string): string {
  let output = html;
  output = output.replace(
    /<h1\b([^>]*class=["'][^"']*\bdgs-hero-title\b[^"']*["'][^>]*)>\s*<span\b[^>]*class=["']dgs-sr["'][^>]*>([\s\S]*?)<\/span>([\s\S]*?)<\/h1>/gi,
    '<div$1><h1 class="dgs-sr">$2</h1>$3</div>',
  );
  if (path === "/career/") {
    output = output.replace(/Join Our<br\s*\/?>\s*<span/gi, "Join Our<br> <span");
  }
  if (path === "/services/") {
    output = output.replace(/<h1([^>]*)>(?:Archives:\s*)?<span>Services<\/span><\/h1>/i, '<h1$1>Digital Marketing, SEO & AI Services</h1>');
  }
  if (path === "/services/ai-production-dubai-page/") {
    output = output.replace(/In Dubai For Ads, Reels & Brand Films/g, "in Dubai for Ads, Reels & Brand Films");
  }
  return output;
}

function applyServiceSearchCorrections(path: string, html: string): string {
  let output = html;
  if (path === "/services/performance-marketing/") {
    output = output.replace(
      /Performance Marketing for\s*(<span\b[^>]*class=["'][^"']*\bdgs-gradient\b[^"']*["']>\s*Qualified Leads, Sales & ROI\s*<\/span>)/i,
      "Performance Marketing Agency in Mumbai for $1",
    );
    output = output.replace(/Performance Marketing for Qualified Leads, Sales & ROI/g, "Performance Marketing Agency in Mumbai for Qualified Leads, Sales & ROI");
    output = output.replace(/Talk To Our SEO Team/g, "Talk To Our Performance Marketing Team");
  }
  if (path === "/services/social-media-marketing/") {
    output = output.replace(
      /Transform Your Social Media Into a\s*<span class=["']smm-gradient-text["']>Strategic Revenue Channel<\/span>/i,
      'Social Media Marketing Agency in Mumbai for\n<span class="smm-gradient-text">Content, Ads & Growth</span>',
    );
    output = output.replace(/Transform Your Social Media Into a Strategic Revenue Channel/g, "Social Media Marketing Agency in Mumbai for Content, Ads & Growth");
  }
  if (path === "/services/branding/") {
    output = output.replace(
      /<span class=["']bp-t-line["']>TRANSFORM YOUR<\/span>\s*<span class=["']bp-t-line["']>BRAND IDENTITY INTO<\/span>\s*<span class=["']bp-t-line bp-t-grad["']>MARKET DOMINANCE<\/span>/i,
      '<span class="bp-t-line">BRANDING AGENCY IN MUMBAI FOR</span>\n<span class="bp-t-line">BRAND STRATEGY, IDENTITY</span>\n<span class="bp-t-line bp-t-grad">& DESIGN</span>',
    );
    output = output.replace(/TRANSFORM YOUR BRAND IDENTITY INTO MARKET DOMINANCE/g, "BRANDING AGENCY IN MUMBAI FOR BRAND STRATEGY, IDENTITY & DESIGN");
  }
  if (path === "/services/content-creation/") {
    output = output.replace(
      /<span class=["']line["']>Content that<\/span>\s*<span class=["']line["']><span class=["']gradient-word["']>transforms<\/span><\/span>\s*<span class=["']line["']>brands<\/span>/i,
      '<span class="line">Content Marketing Agency</span>\n<span class="line"><span class="gradient-word">in Mumbai</span></span>\n<span class="line">for SEO, Social & Brand Content</span>',
    );
    output = output.replace(/Content that transforms brands/g, "Content Marketing Agency in Mumbai for SEO, Social & Brand Content");
  }
  if (path === "/services/seo-service-pune/") {
    output = output.replace(/SEO Agency in Pune for Rankings, Qualified Traffic and Leads —\s*/g, "SEO Agency in Pune for Rankings, Qualified Traffic and Leads");
  }
  if (path === "/services/seo-service-in-banglore/") {
    output = output.replace(/SEO Agency in Bangalore for Rankings, Qualified Traffic and Leads —\s*/g, "SEO Agency in Bangalore (Bengaluru) for Rankings, Qualified Traffic and Leads");
  }
  if (path === "/services/seo-service-in-gurugram/") {
    output = output.replace(/SEO Agency in Gurugram for Rankings, Qualified Traffic and Leads —\s*/g, "SEO Agency in Gurugram (Gurgaon) for Rankings, Qualified Traffic and Leads");
  }
  if (path === "/services/seo-services-in-hyderabad/") {
    output = output.replace(/SEO Agency in Hyderabad for Rankings, Qualified Traffic and Leads —\s*/g, "SEO Agency in Hyderabad for Rankings, Qualified Traffic and Leads");
  }
  if (path === "/services/website-development-pune-page/") {
    output = output.replace(/Talk To Our SEO Team/g, "Talk To Our Website Development Team");
  }
  if (path === "/services/ai-video-production-agency/") {
    output = output.replace(
      '<h3><a href="/services/performance-marketing/">Performance Marketing</a></h3>',
      '<h3><a href="/services/performance-marketing/">Google Ads Services</a></h3>',
    );
    // Eyebrow is already clean in the mirror: "AI Video Production Services In Mumbai | Generative AI Studio"
    const clusterSection = `
<section class="dgs-section-tight" id="mumbai-ai-video-services-cluster">
<div class="dgs-wrap">
<div class="dgs-narrow dgs-center" style="margin-bottom:52px">
<p class="dgs-eyebrow">Specialized AI Video Formats</p>
<div class="dgs-title-small" style="font-size:clamp(1.5rem, 3vw, 2.25rem);font-weight:700;line-height:1.25;margin-bottom:0.5rem;">AI Video Production For <span class="dgs-grad-text">Avatars, Festivals, Commercials & OTT</span></div>
<p class="dgs-copy" style="margin-top:18px">Expand your brand reach with specialized AI video production formats designed for modern digital campaigns, broadcast channels and streaming audiences across Mumbai and India. Our creative team combines human direction with generative AI tools to produce broadcast-grade video assets at scale.</p>
</div>
<div class="dgs-grid dgs-services-grid">
<article class="dgs-card">
<small>Format</small>
<div class="dgs-card-title" style="font-size:1.25rem;font-weight:700;margin:0.5rem 0 0.75rem 0;line-height:1.3;">AI Avatar Videos</div>
<p>We create photorealistic AI avatar videos and digital spokesperson content for brand messaging, corporate explainers, multilingual communication and digital training. AI avatars enable rapid production of consistent, studio-quality presenter videos without the logistical friction of studio shoots or recurring talent scheduling.</p>
</article>
<article class="dgs-card">
<small>Format</small>
<div class="dgs-card-title" style="font-size:1.25rem;font-weight:700;margin:0.5rem 0 0.75rem 0;line-height:1.3;">AI Festival Videos</div>
<p>Our AI festival videos help brands celebrate cultural milestones with high-impact visual storytelling. From Diwali, Navratri and Eid to New Year and Independence Day campaigns, we produce timely, topical AI video greetings, product teasers and emotional narrative films tailored for social media engagement and festive promotions.</p>
</article>
<article class="dgs-card">
<small>Format</small>
<div class="dgs-card-title" style="font-size:1.25rem;font-weight:700;margin:0.5rem 0 0.75rem 0;line-height:1.3;">AI TV Commercials</div>
<p>D'Genius Solutions delivers high-concept AI TV commercials and broadcast-ready commercial spots combining generative video aesthetics with cinematic storytelling, scripting, voiceover, sound design and precise color grading. We help consumer brands, fintech startups and enterprise clients produce TVC-quality ad films faster and at a fraction of traditional production overhead.</p>
</article>
<article class="dgs-card">
<small>Format</small>
<div class="dgs-card-title" style="font-size:1.25rem;font-weight:700;margin:0.5rem 0 0.75rem 0;line-height:1.3;">AI OTT Video Series</div>
<p>We produce episodic AI OTT video series, branded web episodes, narrative shorts and fictionalized digital stories for streaming platforms, YouTube and digital channels. Our creative team blends human narrative development, character consistency, dynamic world-building and AI-assisted animation to bring episodic IP and entertainment concepts to life.</p>
</article>
<article class="dgs-card">
<small>Format</small>
<div class="dgs-card-title" style="font-size:1.25rem;font-weight:700;margin:0.5rem 0 0.75rem 0;line-height:1.3;">AI OTT Video Ads</div>
<p>Drive measurable performance with high-retention AI OTT video ads crafted for streaming platforms, connected TV (CTV) and video-on-demand apps. We design attention-grabbing video creatives, interactive ad hooks and high-impact visual storytelling engineered to maximize viewer completion rates, brand recall and downstream conversions across Indian and global audiences.</p>
</article>
</div>
</div>
</section>`;
    output = output.replace(
      'monthly brand calendars.</p></article></div></div></section>',
      'monthly brand calendars.</p></article></div></div></section>' + clusterSection,
    );
  }
  return output;
}

function lazyBelowFold(html: string): string {
  let count = 0;
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    count += 1;
    if (count <= 2) {
      return tag
        .replace(/\bloading=["']lazy["']/i, 'loading="eager"')
        .replace(/<img/i, count === 1 ? '<img fetchpriority="high"' : "<img");
    }
    if (!/\bloading=/i.test(tag)) {
      return tag.replace(/<img/i, '<img loading="lazy"');
    }
    return tag;
  });
}

function stripReviewStructuredData(html: string): string {
  let output = html;
  output = output.replace(/\s*itemscope\s+itemtype=["']https?:\/\/schema\.org\/Review["']/gi, "");
  output = output.replace(/\s*itemtype=["']https?:\/\/schema\.org\/Review["']\s*itemscope/gi, "");
  output = output.replace(/\s*itemtype=["']https?:\/\/schema\.org\/Review["']/gi, "");
  output = output.replace(/\s*itemprop=["']reviewBody["']/gi, "");
  output = output.replace(/\s*itemprop=["']itemReviewed["']/gi, "");
  output = output.replace(/\s*itemprop=["']reviewRating["']/gi, "");
  output = output.replace(/\s*itemprop=["']author["']/gi, "");
  return output;
}

function stripLegacyMirrorMicrodata(html: string): string {
  return html
    .replace(/\s*\bitemscope\b(?:=["'][^"']*["'])?/gi, "")
    .replace(/\s*\bitemtype=["']https?:\/\/schema\.org\/[^"']*["']/gi, "")
    .replace(/\s*\bitemprop=["'][^"']*["']/gi, "");
}

function remediateMirrorImageAlts(path: string, html: string): string {
  let output = html;

  // 1. Decorative data:image/svg+xml with empty or missing alt -> ensure aria-hidden="true" and alt=""
  output = output.replace(/<img\b([^>]*src=["']data:image\/svg\+xml[^"']*["'][^>]*)>/gi, (match) => {
    let tag = match;
    if (!tag.includes('aria-hidden="true"')) {
      tag = tag.replace(/<img\b/i, '<img aria-hidden="true"');
    }
    if (!/alt=["']/i.test(tag)) {
      tag = tag.replace(/<img\b/i, '<img alt=""');
    }
    return tag;
  });

  // 2. Services cards: Replace 71-service-projects-placeholder.webp alt="" with card title
  if (path === "/services/" || path === "/our-services/") {
    output = output.replace(/<article\b[\s\S]*?<\/article>/gi, (card) => {
      if (!card.includes("71-service-projects-placeholder.webp")) return card;
      const titleMatch =
        card.match(/<(?:h\d|a)\b[^>]*class=["'][^"']*(?:entry-title|cmsmasters-blog__post-title)[^"']*["'][^>]*>([\s\S]*?)<\/(?:h\d|a)>/i) ||
        card.match(/<(?:h\d|a)\b[^>]*>([\s\S]*?)<\/(?:h\d|a)>/i);
      const rawTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "Service";
      const cleanTitle = rawTitle.replace(/\s+/g, " ");
      return card.replace(
        /(<img\b[^>]*src=["'][^"']*71-service-projects-placeholder\.webp["'][^>]*\balt=)["'][^"']*["']/gi,
        `$1"${cleanTitle} - D'Genius Solutions"`
      );
    });
  }

  // 3. Envira gallery images with empty alt -> extract data-title or title
  output = output.replace(/<img\b([^>]*class=["'][^"']*envira-gallery-image[^"']*["'][^>]*)>/gi, (tag) => {
    const altMatch = tag.match(/alt=["']([^"']*)["']/i);
    if (altMatch && altMatch[1].trim() !== "") return tag;

    const titleMatch = tag.match(/(?:data-title|title)=["']([^"']+)["']/i);
    let title = titleMatch ? titleMatch[1].replace(/[_\-]+/g, " ").replace(/\s*\(\d+\)/g, "").replace(/\.[a-z0-9]+$/i, "").trim() : "";
    if (!title || /^SS\s*\d+/i.test(title)) {
      title = "Creative Portfolio Showcase";
    }
    const cleanAlt = `${title} - D'Genius Solutions Creative Showcase`;

    if (altMatch) {
      return tag.replace(/alt=["'][^"']*["']/i, `alt="${cleanAlt}"`);
    } else {
      return tag.replace(/<img\b/i, `<img alt="${cleanAlt}"`);
    }
  });

  // 4. Client partner logos on /seo-pricing/ (img65.jpg etc.)
  if (path === "/seo-pricing/") {
    output = output.replace(/<img\b([^>]*src=["'][^"']*img\d+\.(?:jpg|png|webp)["'][^>]*\balt=)["'][^"']*["']/gi, (tag, prefix) => {
      return `${prefix}"Client Partner Brand - D'Genius Solutions"`;
    });
  }

  // 5. Ensure all <img> elements have explicit width and height attributes to prevent CLS
  output = output.replace(/<img\b([^>]*)>/gi, (match, attrs) => {
    if (/\bwidth=/i.test(attrs) && /\bheight=/i.test(attrs)) return match;
    const isLogoOrIcon = /logo|icon|badge|chip|avatar|svg/i.test(attrs);
    const w = isLogoOrIcon ? "160" : "800";
    const h = isLogoOrIcon ? "60" : "500";
    let next = match;
    if (!/\bwidth=/i.test(attrs)) next = next.replace(/<img\b/i, `<img width="${w}"`);
    if (!/\bheight=/i.test(attrs)) next = next.replace(/<img\b/i, `<img height="${h}"`);
    return next;
  });

  // 6. Ensure any empty overlay <a> links have an accessible aria-label
  output = output.replace(
    /<a\b([^>]*href=["']([^"']+)["'][^>]*)>\s*<\/a>/gi,
    (match, attrs, href) => {
      if (/\baria-label=/i.test(attrs)) return match;
      const cleanLabel =
        href === "#" || href.startsWith("#")
          ? "Explore section"
          : `Explore ${href.replace(/^\/+|\/+$/g, "").replace(/[-/]+/g, " ") || "D'Genius Solutions"}`;
      return `<a${attrs} aria-label="${cleanLabel}"></a>`;
    },
  );

  // 7. Remove aria-hidden="true" from case-study drawers/modals so ROI proof is indexable by search and AI crawlers
  output = output.replace(
    /(<(?:div|aside|section)\b[^>]*(?:id=["'][^"']*(?:modal|drawer|worldgrad|weavings)[^"']*["']|class=["'][^"']*(?:cs-drawer|cs-modal|dgs-modal)[^"']*["'])[^>]*?)\s+aria-hidden=["']true["']/gi,
    "$1",
  );

  return output;
}

function appendSemanticAuthoritySections(path: string, html: string): string {
  if (path === "/services/" || path === "/our-services/") {
    return html;
  }

  const linkStyle = "color:#38bdf8;text-decoration:underline;font-weight:600;";
  const cardStyle =
    "max-width:1180px;margin:48px auto;padding:32px 28px;border-radius:22px;background:linear-gradient(145deg,rgba(15,20,32,0.92),rgba(8,11,18,0.96));border:1px solid rgba(255,255,255,0.12);color:#f8fafc;box-shadow:0 20px 50px rgba(0,0,0,0.45);";

  if (path === "/about-us/") {
    const aboutAuthoritySection = `
<section aria-label="Founder credentials and core expertise" style="${cardStyle}">
  <h2 style="font-size:clamp(1.4rem,2.4vw,2rem);font-weight:700;margin:0 0 14px;color:#ffffff;">Founder Credentials, Career Highlights &amp; Core Capabilities</h2>
  <p style="font-size:1rem;line-height:1.7;margin:0 0 18px;color:rgba(241,245,249,0.88);">
    Led by Founder &amp; CEO <strong>Kohin Bellara</strong> (13+ years in digital marketing, enterprise search, and AI-driven growth), D'Genius Solutions combines in-house full-stack engineering with measurable search and creative execution from our headquarters in Khar West, Mumbai.
  </p>
  <ul style="margin:0 0 22px;padding-left:20px;line-height:1.75;font-size:0.98rem;color:rgba(241,245,249,0.86);">
    <li><strong>75+ Brands Scaled Globally:</strong> Proven organic and paid growth across India, the UAE (Dubai), the United States, and Australia, including enterprise and high-growth leaders such as <em>TheWorldGrad</em> (6x organic traffic), <em>Weavings Manpower</em> (17.4K search clicks), <em>Pidilite</em>, <em>Cello</em>, <em>Bajaj</em>, and <em>HumanXT</em>.</li>
    <li><strong>Full-Funnel Search &amp; AI Visibility:</strong> Integrated execution across <a href="/services/seo-services-in-mumbai/" style="${linkStyle}">SEO Services in Mumbai</a>, <a href="/services/aeo-services-in-mumbai/" style="${linkStyle}">Answer Engine Optimization (AEO)</a>, <a href="/services/geo/" style="${linkStyle}">Generative Engine Optimization (GEO)</a>, and <a href="/services/llm-seo-service/" style="${linkStyle}">LLM SEO</a>.</li>
    <li><strong>Engineering, Creative &amp; Paid Media Under One Roof:</strong> Direct deployment across <a href="/services/website-development-amc/" style="${linkStyle}">Custom Website Development &amp; AMC</a>, <a href="/services/ai-video-production-agency/" style="${linkStyle}">AI Video Production Agency in Mumbai</a>, <a href="/services/performance-marketing/" style="${linkStyle}">Performance Marketing (Google &amp; Meta Ads)</a>, <a href="/services/social-media-marketing/" style="${linkStyle}">Social Media Marketing</a>, <a href="/services/branding/" style="${linkStyle}">Brand Strategy &amp; Identity Design</a>, and <a href="/services/content-creation/" style="${linkStyle}">SEO Content Creation</a>.</li>
  </ul>
  <p style="margin:0;font-size:0.95rem;color:rgba(241,245,249,0.88);">
    Explore our <a href="/services/" style="${linkStyle}">Complete Digital Marketing &amp; AI Services Hub</a> or review our <a href="/case_studies/" style="${linkStyle}">Verified Client Case Studies</a>.
  </p>
</section>`;
    return html + aboutAuthoritySection;
  }

  const isServiceOrMarketPage =
    (path.startsWith("/services/") && path !== "/services/shirdi-se-sai-tak-case-study/") ||
    path === "/aeo-dubai/" ||
    path === "/australia-page/" ||
    path === "/us-landing-page/";

  if (isServiceOrMarketPage) {
    const EXACT_QUERY_CAPSULES: Record<string, { heading: string; answer: string }> = {
      "/aeo-dubai/": {
        heading: "Answer Engine Optimization (AEO) & GEO Services in Dubai, UAE",
        answer:
          "Looking for the best Answer Engine Optimization (AEO) agency in Dubai and the UAE? D'Genius Solutions engineers direct brand citations, structured entity schemas, and bilingual answer capsules so UAE enterprises, real estate developers, hospitality groups, and eCommerce brands rank inside Google AI Overviews, ChatGPT, Perplexity, and Google Gemini.",
      },
      "/services/ai-production-dubai-page/": {
        heading: "AI Corporate Video Production & AI E-Commerce Product Videos in Dubai, UAE",
        answer:
          "As a specialized AI video production agency and studio in Dubai and Abu Dhabi, D'Genius Solutions delivers AI corporate video production, AI eCommerce product videos, AI promotional videos, TV commercials, and Arabic/English AI avatar videos—combining generative video technology with human creative direction for 3x faster campaign turnaround.",
      },
      "/services/dubai-seo/": {
        heading: "Technical, Local & AI Search SEO Agency in Downtown Dubai, Business Bay & JLT",
        answer:
          "D'Genius Solutions is a full-funnel SEO company serving businesses across Downtown Dubai, JLT (Jumeirah Lakes Towers), Business Bay, DIFC, Dubai Marina, and Abu Dhabi. We combine technical Core Web Vitals engineering, Google Maps pack optimization, and AI Overview readiness to drive qualified B2B and consumer leads across the UAE.",
      },
      "/services/geo/": {
        heading: "Generative Engine Optimization (GEO) Services for Enterprise & D2C Brands in Mumbai & India",
        answer:
          "Our Generative Engine Optimization (GEO) services help B2B, SaaS, and D2C brands across Mumbai, India, and global markets earn verifiable brand mentions and source citations inside Google AI Overviews, AI Mode, ChatGPT Search, Perplexity, and Gemini through entity graph seeding, passage citability, and third-party authority corroboration.",
      },
      "/services/llm-seo-service/": {
        heading: "LLM SEO Company in India & Gemini / ChatGPT Search Optimization Services",
        answer:
          "As a dedicated LLM SEO agency in Mumbai and India, D'Genius Solutions optimizes your brand's knowledge graph, Schema.org JSON-LD architecture, llms.txt documentation, and authoritative web citations so Large Language Models (ChatGPT, Google Gemini, Claude, and Perplexity) accurately understand, trust, and recommend your business.",
      },
      "/services/aeo-services-in-mumbai/": {
        heading: "Answer Engine Optimization (AEO) Agency in Mumbai with Real Case Studies",
        answer:
          "D'Genius Solutions is a premier Answer Engine Optimization (AEO) agency in Khar West, Mumbai backed by verified client case studies—including 6x organic traffic growth for TheWorldGrad and 17.4K+ high-intent clicks for Weavings Manpower. We structure your service pages and FAQs to capture Featured Snippets, People Also Ask, and Google AI Overviews.",
      },
      "/services/ai-video-production-agency/": {
        heading: "AI Video Production Agency in Mumbai — Studio Output Without Physical Shoot Delays",
        answer:
          "D'Genius Solutions is a specialized AI video production agency in Khar West, Mumbai producing AI commercials, product films, luxury jewellery reels, pharma/IT explainers, AI avatars, and broadcast TVCs in 7 to 14 days—combining generative video direction with cinema-grade editing and multilingual voiceovers.",
      },
    };

    const capsule = EXACT_QUERY_CAPSULES[path];
    const capsuleHtml = capsule
      ? `<div style="margin:0 0 22px;padding:18px 20px;border-radius:14px;background:rgba(56,189,248,0.08);border-left:4px solid #38bdf8;">
  <h3 style="font-size:1.1rem;font-weight:700;margin:0 0 8px;color:#ffffff;">${capsule.heading}</h3>
  <p style="font-size:0.95rem;line-height:1.65;margin:0;color:rgba(241,245,249,0.92);">${capsule.answer}</p>
</div>`
      : "";

    const serviceHubBlock = `
<section aria-label="Verified client outcomes and related services" style="${cardStyle}">
  ${capsuleHtml}
  <h2 style="font-size:clamp(1.35rem,2.2vw,1.85rem);font-weight:700;margin:0 0 12px;color:#ffffff;">Verified Client Outcomes &amp; Integrated Growth Capabilities</h2>
  <p style="font-size:0.98rem;line-height:1.65;margin:0 0 18px;color:rgba(241,245,249,0.88);">
    Every D'Genius Solutions engagement is backed by verifiable Search Console, analytics, and revenue outcomes delivered by our Mumbai engineering, search, and creative teams:
  </p>
  <ul style="margin:0 0 20px;padding-left:20px;line-height:1.7;font-size:0.95rem;color:rgba(241,245,249,0.86);">
    <li><strong>TheWorldGrad (Study Abroad EdTech):</strong> Scaled organic search traffic by <strong>6x</strong> and captured #1 rankings across high-intent international education keywords through technical SEO, topic clusters, and AEO.</li>
    <li><strong>Weavings Manpower (Enterprise B2B Staffing):</strong> Generated <strong>17,400+ high-intent organic clicks</strong> and 1.19M+ impressions by restructuring commercial staffing service pages and B2B location architecture.</li>
    <li><strong>Shirdi Sai Cultural &amp; Brand Film (<a href="/services/shirdi-se-sai-tak-case-study/" style="${linkStyle}">Read Case Study</a>):</strong> Delivered 400K+ organic reach through AI-assisted narrative production and multi-platform distribution.</li>
    <li><strong>Better Ceasons (<a href="/better-ceasons-case-study/" style="${linkStyle}">Read Case Study</a>):</strong> Full-stack brand positioning, custom web experience, and digital growth execution.</li>
  </ul>
  <p style="margin:0 0 10px;font-size:0.94rem;line-height:1.7;color:rgba(241,245,249,0.88);">
    <strong>Connected Services:</strong>
    <a href="/services/" style="${linkStyle}margin-left:6px;">All Services</a> •
    <a href="/services/seo-services-in-mumbai/" style="${linkStyle}margin-left:6px;">SEO Agency Mumbai</a> •
    <a href="/services/aeo-services-in-mumbai/" style="${linkStyle}margin-left:6px;">AEO Services Mumbai</a> •
    <a href="/services/geo/" style="${linkStyle}margin-left:6px;">Generative Engine Optimization (GEO)</a> •
    <a href="/services/llm-seo-service/" style="${linkStyle}margin-left:6px;">LLM SEO Services</a> •
    <a href="/services/website-development-amc/" style="${linkStyle}margin-left:6px;">Website Development &amp; AMC</a> •
    <a href="/services/ai-video-production-agency/" style="${linkStyle}margin-left:6px;">AI Video Production Agency in Mumbai</a> •
    <a href="/services/performance-marketing/" style="${linkStyle}margin-left:6px;">Performance Marketing</a> •
    <a href="/services/social-media-marketing/" style="${linkStyle}margin-left:6px;">Social Media Marketing</a> •
    <a href="/services/branding/" style="${linkStyle}margin-left:6px;">Branding</a> •
    <a href="/services/content-creation/" style="${linkStyle}margin-left:6px;">Content Marketing</a> •
    <a href="/case_studies/" style="${linkStyle}margin-left:6px;">All Case Studies</a>
  </p>
  <p style="margin:0;font-size:0.92rem;line-height:1.7;color:rgba(226,232,240,0.84);">
    <strong>Regional &amp; Global Markets:</strong>
    <a href="/services/seo-service-pune/" style="${linkStyle}margin-left:6px;">SEO Pune</a> •
    <a href="/services/website-development-pune-page/" style="${linkStyle}margin-left:6px;">Web Development Pune</a> •
    <a href="/services/seo-service-in-banglore/" style="${linkStyle}margin-left:6px;">SEO Bangalore</a> •
    <a href="/services/seo-service-in-gurugram/" style="${linkStyle}margin-left:6px;">SEO Gurugram</a> •
    <a href="/services/seo-services-in-hyderabad/" style="${linkStyle}margin-left:6px;">SEO Hyderabad</a> •
    <a href="/services/dubai-seo/" style="${linkStyle}margin-left:6px;">SEO Agency Dubai</a> •
    <a href="/aeo-dubai/" style="${linkStyle}margin-left:6px;">AEO Agency Dubai</a> •
    <a href="/services/ai-production-dubai-page/" style="${linkStyle}margin-left:6px;">AI Video Production Dubai</a> •
    <a href="/us-landing-page/" style="${linkStyle}margin-left:6px;">US Growth Pod</a> •
    <a href="/australia-page/" style="${linkStyle}margin-left:6px;">Australia Growth Pod</a>
  </p>
</section>`;
    return html + serviceHubBlock;
  }

  return html;
}

export function prepareInnerPageMirror(
  content: InnerPageMirrorContent,
  wordpressId: number,
): PreparedInnerPageMirror {
  if (content.path === "/services/" || content.path === "/our-services/") {
    const hubHtml = normalizeBrandName(buildServicesHubHtml());
    return {
      ...content,
      cssFiles: [],
      articleHtml: `<article data-migration-content data-wordpress-id="${wordpressId}">${hubHtml}</article>`,
      combinedStyles: "",
      fontLinks: content.fontLinks?.map((tag) => rewriteWpUrls(tag)),
    };
  }
  let body = stripLegacyMirrorMicrodata(
    stripReviewStructuredData(
      markElementorBackgroundsReady(
        unwrapMirrorLazyMedia(stripCapturedFooters(stripEmbeddedDocumentWrapper(stripLeadingCloseTags(content.body || "")))),
      ),
    ),
  );
  if (content.path === "/portfolio/") {
    body = replaceEnviraWrapWithNativeMount(body);
  }
  body = body.replace(
    /(?:https:\/\/(?:www\.)?dgeniussolutions\.com)?\/wp-content\/uploads\/2026\/07\/Weavings-Home-page-\.png(?:\?[^"'\s>]*)?/g,
    "/images/case-studies/weavings-home-page-64820.png",
  );
  // DGS Quick Win 3: Eliminate broken external HumanXT dependencies
  body = body
    .replace(
      /https?:\/\/humanxt\.com\/wp-content\/uploads\/(?:2024\/05|2025\/08)\/h4-logo\.png/g,
      "https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Humanxt-1-300x300.png",
    )
    .replace(
      /<link\b[^>]*href=["']https?:\/\/humanxt\.com\/fonts\/fira-sans\.css["'][^>]*>/gi,
      "",
    )
    .replace(
      /https:\/\/s\.wordpress\.com\/mshots\/v1\/https%3A%2F%2Fhumanxt\.com%2F\?w=1600/g,
      "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Humanxt-scaled.webp",
    )
    .replace(
      /<iframe\b[^>]*\b(?:humanxt\.com)[^>]*><\/iframe>/gi,
      '<img loading="lazy" class="live-preview-image e-lazyloaded" src="https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Humanxt-scaled.webp" alt="HumanXT website preview by D\'Genius Solutions" width="1600" height="1000" loading="lazy" decoding="async" referrerpolicy="no-referrer" />',
    );
  body = applyServiceSearchCorrections(content.path, normalizeSemanticH1(content.path, body));
  body = applyInternationalPageContent(content.path, body);
  body = applyLocationSeoContent(content.path, body);
  body = remediateMirrorImageAlts(
    content.path,
    applyApprovedLinkCorrectionsToHtml(
      content.path,
      lazyBelowFold(rewriteWpUrls(body)),
    ),
  );
  // DGS Quick Win 6, 8 & 9: Ensure continuous marquee ticker logos are loaded eagerly so CSS transform animations do not block them
  body = body.replace(
    /(<(?:div|span|li)\b[^>]*class=["'][^"']*\b(?:smm-news-strip-logo|dgs-nc|nc|dgs-press-chip)\b[^"']*["'][^>]*>\s*<img\b[^>]*?)\bloading=["']lazy["']/gi,
    '$1loading="eager"',
  );
  body = body.replace(
    /(<(?:div|span|li)\b[^>]*class=["'][^"']*\b(?:smm-news-strip-logo|dgs-nc|nc|dgs-press-chip)\b[^"']*["'][^>]*>\s*<img\b[^>]*?)\bfetchpriority=["']low["']/gi,
    '$1',
  );
  body = normalizeBrandName(appendSemanticAuthoritySections(content.path, body));
  const styles = rewriteWpUrls(content.styles || "");
  const fontLinks = content.fontLinks?.map((tag) => rewriteWpUrls(tag));
  const articleHtml = `<article data-migration-content data-wordpress-id="${wordpressId}">${body}</article>`;
  return {
    ...content,
    articleHtml,
    combinedStyles: styles,
    fontLinks,
  };
}
