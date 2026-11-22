import type { ContentBlock } from "@/lib/content/types";
import type { RouteRecord } from "@/lib/nextjs/routes";
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
  organizationSchema,
  serviceSchema,
  webPageSchema,
  websiteSchema,
} from "@/lib/schema/builders";
import {
  LOCAL_BUSINESS_ID,
  LOGO_ID,
  ORGANIZATION_ID,
  WEBSITE_ID,
  verifiedOrganization,
} from "@/lib/schema/entity";
import type { BreadcrumbItem, FaqItem } from "@/lib/schema/builders";
import { getPageSeoOverride } from "@/lib/seo/page-overrides";
import { buildVerifiedAiVideoSchemas } from "@/lib/schema/ai-video-inventory";

const VERIFIED_PAGE_FAQS: Record<string, FaqItem[]> = {
  "/us-landing-page/": [
    {
      question: "Why would a US business work with an India-based agency?",
      answer: "Working with D'Genius Solutions gives US businesses senior-level SEO, AEO, GEO, web development, and AI creative execution at a fraction of US agency retainers—with overlapping communication windows, transparent reporting, and proven international growth frameworks.",
    },
    {
      question: "How does communication work across the time zone difference?",
      answer: "We maintain dedicated US-overlap hours for strategy calls on Zoom/Google Meet, async Slack/email updates with <12-hour turnaround, and real-time dashboards so your team never waits a full day for answers.",
    },
    {
      question: "Will the content feel native to a US audience?",
      answer: "Yes. Every US campaign is researched, written, and edited specifically for American search intent, US English idioms, regulatory nuances, and local competitive benchmarks.",
    },
    {
      question: "Do we own the ad accounts, website, and content?",
      answer: "100%. You retain full administrative ownership of all Google Ads, Meta Ads, analytics properties, domains, code repositories, and creative assets from day one.",
    },
    {
      question: "What's the minimum commitment?",
      answer: "We offer flexible engagement structures tailored to project scope—from one-time website or AI video builds to 3-to-6-month growth retainers for compounding SEO and AEO results.",
    },
  ],
  "/services/performance-marketing/": [
    {
      question: "What does a performance marketing agency do?",
      answer: "A performance marketing agency plans, launches, and optimizes measurable paid media campaigns across Google Ads, Meta Ads, LinkedIn Ads, and YouTube—combining conversion tracking, landing page CRO, and creative testing to maximize ROAS and qualified pipeline.",
    },
    {
      question: "How much ad budget do I need to start performance marketing?",
      answer: "Ideal starting media budgets depend on your industry CPCs and target geography, typically beginning around ₹50,000–₹1,50,000/month in India or $1,500–$5,000/month internationally to gather statistically significant conversion data.",
    },
    {
      question: "How soon can I see results from Google Ads and Meta Ads?",
      answer: "Initial traffic and lead flow begin within 48–72 hours of campaign launch, while algorithmic learning, CPA reduction, and ROAS scaling mature over the first 30 to 60 days of structured creative and bidding tests.",
    },
    {
      question: "Do you set up GA4, GTM, and server-side conversion tracking?",
      answer: "Yes. Every performance marketing engagement includes end-to-end Google Tag Manager, GA4, Meta Pixel/Conversions API, and CRM lead-quality attribution setup before ad spend scales.",
    },
  ],
  "/services/ai-video-production-agency/": [
    {
      question: "What is an AI Video Production Agency?",
      answer: "An AI Video Production Agency combines generative AI video models, custom voice synthesis, and digital avatars with human creative direction, scriptwriting, and professional post-production to deliver broadcast-ready commercials, product films, and social reels faster and more cost-effectively than traditional shoots.",
    },
    {
      question: "How does AI video production compare to traditional video production?",
      answer: "AI video production reduces production timelines from 6–8 weeks to 7–14 days and eliminates physical location, studio, and reshoot overheads while allowing rapid multilingual localization and A/B hook testing.",
    },
    {
      question: "Will the AI videos look realistic and match our brand guidelines?",
      answer: "Yes. Our human creative directors, motion designers, and editors grade, composite, and refine every frame—integrating your exact product renders, typography, color palette, and brand tone.",
    },
    {
      question: "Can you produce AI videos in multiple Indian and international languages?",
      answer: "Absolutely. We produce lip-synced and voice-cloned versions across English, Hindi, Marathi, Tamil, Telugu, Arabic, and global languages so one master film scales across every regional market.",
    },
    {
      question: "How does a specialized AI video production agency help brands scale campaigns?",
      answer: "A specialized AI video production agency combines generative video models, voice cloning, and brand-consistent AI avatars with human creative direction and studio-grade editing. This reduces campaign turnaround from weeks to days while producing TV commercials, product films, and multilingual social reels at lower cost than physical shoots.",
    },
  ],
};

const APPENDED_PAGE_FAQS: Record<string, FaqItem[]> = {
  "/services/geo/": [
    {
      question: "What do Generative Engine Optimization (GEO) services include?",
      answer: "Generative Engine Optimization services include entity graph structuring, schema markup engineering, AI crawler accessibility audits, extractable answer-block copywriting, and authoritative off-site brand mention campaigns. D'Genius Solutions pairs these GEO deliverables with measurable citation tracking so your business earns consistent recommendations inside ChatGPT, Perplexity, Google AI Overviews, and Gemini.",
    },
  ],
  "/aeo-dubai/": [
    {
      question: "What results should UAE brands expect from specialized AEO services?",
      answer: "Specialized AEO services help UAE and Dubai businesses capture Google AI Overviews, Featured Snippets, People Also Ask boxes, and brand recommendations in ChatGPT and Perplexity. D'Genius Solutions combines bilingual entity optimization, transparent service-area signaling, and conversion-focused answer architecture to turn zero-click visibility into qualified regional leads.",
    },
    {
      question: "How do businesses choose the best AEO agency in Dubai?",
      answer: "Choose an AEO agency in Dubai that backs AI visibility claims with verifiable Search Console data, Schema.org JSON-LD entity architecture, clean technical Core Web Vitals, and transparent UAE service-area signaling. D'Genius Solutions pairs answer-capsule copywriting with bilingual AEO audits so Dubai brands win citations without doorway-page risk.",
    },
  ],
  "/services/ai-production-dubai-page/": [
    {
      question: "What does AI corporate video production in Dubai include?",
      answer: "AI corporate video production in Dubai includes concept scripting, brand-consistent visual storyboarding, multilingual English and Arabic AI avatars, voiceover synthesis, product compositing, and cinema-grade editing. D'Genius Solutions delivers boardroom explainers, investor films, and B2B launch assets in 7 to 14 days without expensive studio hires or location permits.",
    },
    {
      question: "How does AI video for marketing in Dubai improve paid campaign ROI?",
      answer: "AI video for marketing in Dubai lets consumer, real estate, and eCommerce brands launch high-retention ad variations, seasonal promotions, and localized Reels in days instead of weeks. Rapid creative testing lowers CPA across Meta, YouTube, and TikTok while keeping product visuals and brand guidelines consistent.",
    },
  ],
  "/services/seo-service-in-banglore/": [
    {
      question: "What sets an enterprise SEO company in Bangalore apart for SaaS and tech brands?",
      answer: "An enterprise SEO company in Bangalore must handle large JavaScript architectures, Next.js and React rendering, programmatic landing clusters, and multi-region SaaS pipelines. D'Genius Solutions combines engineering-led technical SEO, Search Console telemetry, and high-intent commercial content to convert organic impressions across Bengaluru and global markets into demo requests.",
    },
    {
      question: "How does an AI SEO agency in Bangalore improve visibility in Google AI Overviews and ChatGPT?",
      answer: "An AI SEO agency in Bangalore combines technical crawlability and Schema.org entity graphs with extractable answer blocks and off-site authority signals. We structure product, pricing, and integration pages so Google AI Overviews, ChatGPT Search, Perplexity, and Gemini accurately understand and recommend your Bengaluru brand.",
    },
  ],
  "/services/llm-seo-service/": [
    {
      question: "What do LLM SEO services include for ChatGPT, Gemini, and Perplexity?",
      answer: "LLM SEO services structure your brand entities, Schema.org JSON-LD graphs, llms.txt markdown documentation, and high-authority citation sources so ChatGPT, Google Gemini, Claude, and Perplexity accurately understand what your business sells. D'Genius Solutions pairs entity engineering with extractable proof points to turn AI recommendations into qualified inbound enquiries.",
    },
    {
      question: "Why hire a specialized LLM SEO company in India?",
      answer: "Hiring a specialized LLM SEO company in India combines senior technical schema implementation, entity disambiguation, and multi-market content strategy with measurable attribution. D'Genius Solutions helps Indian, UAE, US, and Australian brands build verified machine-readable authority that compounds alongside traditional Google SEO.",
    },
  ],
  "/services/seo-services-in-mumbai/": [
    {
      question: "What does an AI SEO agency in Mumbai do differently from traditional SEO?",
      answer: "An AI SEO agency in Mumbai combines core technical SEO, Core Web Vitals, and local search signals with Answer Engine Optimization (AEO), structured entity graphs, and extractable answer blocks so your brand ranks both in classic Google listings and inside AI Overviews, ChatGPT, and Perplexity.",
    },
    {
      question: "What is included in professional SEO services in Mumbai at D'Genius Solutions?",
      answer: "Our professional SEO services in Mumbai include full-site technical audits, direct code-level fixes across Next.js and WordPress, commercial intent keyword mapping, on-page and FAQ architecture, local Google Business Profile optimization, and transparent Search Console conversion reporting.",
    },
  ],
  "/services/seo-service-in-gurugram/": [
    {
      question: "What makes an AI SEO agency in Gurugram different from a legacy SEO vendor?",
      answer: "An AI SEO agency in Gurugram optimizes both classic Google rankings and generative answer engines like AI Overviews, ChatGPT, and Perplexity—combining Core Web Vitals engineering, JSON-LD entity graphs, and commercial B2B landing pages tailored to NCR enterprise buyers.",
    },
    {
      question: "Which industries in Gurugram and Delhi NCR benefit most from enterprise SEO services?",
      answer: "SaaS platforms, IT/ITeS consultancies, real estate developers, healthcare networks, and B2B manufacturing brands across Cyber City, Udyog Vihar, Golf Course Road, and Delhi NCR see compounding organic pipeline and lower blended CAC with structured technical and AI SEO.",
    },
  ],
  "/services/seo-services-in-hyderabad/": [
    {
      question: "Why partner with an AI SEO agency in Hyderabad for enterprise and SaaS growth?",
      answer: "An AI SEO agency in Hyderabad helps B2B SaaS, HITEC City tech firms, pharma, and healthcare organizations capture high-intent search demand across classic SERPs and AI answer engines through schema precision, topical authority hubs, and measurable Search Console attribution.",
    },
    {
      question: "How does D'Genius Solutions execute SEO services in Hyderabad without slowing internal dev teams?",
      answer: "D'Genius Solutions handles technical audits, metadata architecture, internal linking, FAQ schema, and CMS-native optimizations directly while coordinating cleanly with engineering teams when deeper Next.js or WordPress template upgrades are needed.",
    },
  ],
};

export function buildGlobalEntitySchemas(): Record<string, unknown>[] {
  return [
    organizationSchema({
      id: ORGANIZATION_ID,
      name: verifiedOrganization.name,
      url: verifiedOrganization.url,
      logoUrl: verifiedOrganization.logoUrl,
      email: verifiedOrganization.email,
      telephone: [...verifiedOrganization.telephone],
      address: verifiedOrganization.address,
      sameAs: [...verifiedOrganization.sameAs],
      knowsAbout: [...verifiedOrganization.knowsAbout],
      areaServed: [...verifiedOrganization.areaServed],
    }),
    websiteSchema({
      id: WEBSITE_ID,
      url: verifiedOrganization.url,
      name: verifiedOrganization.name,
      publisherId: ORGANIZATION_ID,
    }),
  ];
}

export function buildRouteSchemas(input: {
  route: RouteRecord;
  path: string;
  blocks: ContentBlock[];
  breadcrumbs: BreadcrumbItem[];
}): Record<string, unknown>[] {
  const { route, path, blocks, breadcrumbs } = input;
  const seoOverride = getPageSeoOverride(path);
  const pageTitle = seoOverride?.title || route.title || route.h1 || "Page";
  const pageDescription = seoOverride?.description || route.description || "";
  const schemas = [...buildGlobalEntitySchemas()];

  schemas.push(
    webPageSchema({
      name: pageTitle,
      description: pageDescription,
      path,
      organizationId: ORGANIZATION_ID,
      websiteId: WEBSITE_ID,
    }),
  );

  if (path === "/contact-us/" || path === "/services/seo-services-in-mumbai/") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": ["LocalBusiness", "ProfessionalService"],
      "@id": LOCAL_BUSINESS_ID,
      name: verifiedOrganization.name,
      url: verifiedOrganization.url,
      image: verifiedOrganization.logoUrl,
      logo: { "@type": "ImageObject", "@id": LOGO_ID, url: verifiedOrganization.logoUrl },
      email: verifiedOrganization.email,
      telephone: verifiedOrganization.telephone,
      priceRange: "$$",
      hasMap: "https://maps.google.com/?q=D'Genius+Solutions+Khar+West+Mumbai",
      geo: {
        "@type": "GeoCoordinates",
        latitude: 19.066186,
        longitude: 72.834937,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "10:00",
          closes: "19:00",
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Saturday"],
          opens: "10:00",
          closes: "15:00",
        },
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: verifiedOrganization.address.streetAddress,
        addressLocality: verifiedOrganization.address.addressLocality,
        addressRegion: verifiedOrganization.address.addressRegion,
        postalCode: verifiedOrganization.address.postalCode,
        addressCountry: verifiedOrganization.address.addressCountry,
      },
      areaServed: [...verifiedOrganization.areaServed],
      knowsAbout: [...verifiedOrganization.knowsAbout],
      sameAs: [...verifiedOrganization.sameAs],
    });
  }

  const isCaseStudyUnderServices = path === "/services/shirdi-se-sai-tak-case-study/";

  if (isCaseStudyUnderServices) {
    schemas.push(
      articleSchema({
        headline: pageTitle,
        description: pageDescription,
        path,
        datePublished: route.date || "2025-11-01",
        dateModified: route.modified || "2026-03-01",
        publisherId: ORGANIZATION_ID,
      }),
    );
  } else if (route.wordpressType === "service" || path === "/aeo-dubai/" || Boolean(seoOverride?.serviceType)) {
    const isAiVideoAgency = path === "/services/ai-video-production-agency/";
    schemas.push(
      serviceSchema({
        name: seoOverride?.serviceName || pageTitle,
        description: pageDescription,
        path,
        providerId: ORGANIZATION_ID,
        serviceType: seoOverride?.serviceType,
        areaServed: seoOverride?.areaServed,
        ...(isAiVideoAgency
          ? {
              hasOfferCatalog: {
                name: "Industry AI Video Production Services",
                itemListElement: [
                  {
                    name: "Automotive & Automobile Sales AI Video Production",
                    description: "AI video production for car launches, vehicle feature explainers, and dealership marketing campaigns.",
                  },
                  {
                    name: "EdTech & Education AI Video Production",
                    description: "Curriculum animations, chapter explainers, and multilingual e-learning video production.",
                  },
                  {
                    name: "FMCG & Consumer Brands AI Video Production",
                    description: "Packaged goods product videos, food commercials, and multilingual regional advertising.",
                  },
                  {
                    name: "Manufacturing & Industrial AI Video Production",
                    description: "Machinery explainers, technical process walkthroughs, and B2B sales presentation videos.",
                  },
                ],
              },
            }
          : {}),
      }),
    );
  }

  if (breadcrumbs.length > 0) {
    schemas.push(breadcrumbSchema(breadcrumbs));
  }

  const filterCleanFaqs = (items: FaqItem[]) =>
    items.filter(
      (item) =>
        Boolean(item.question?.trim()) &&
        Boolean(item.answer?.trim()) &&
        item.answer.trim().length > 10 &&
        !/\?\s*\+\s*/.test(item.answer),
    );

  const blockFaqs = filterCleanFaqs(extractFaqsFromBlocks(blocks));
  const routeFaqs = filterCleanFaqs(route.faqItems || []);
  const verifiedFallbackFaqs = VERIFIED_PAGE_FAQS[path] || [];
  const baseFaqs =
    verifiedFallbackFaqs.length > 0
      ? verifiedFallbackFaqs
      : routeFaqs.length >= blockFaqs.length && routeFaqs.length > 0
        ? routeFaqs
        : blockFaqs.length > 0
          ? blockFaqs
          : routeFaqs;
  const extraFaqs = APPENDED_PAGE_FAQS[path] || [];
  const existingQuestions = new Set(baseFaqs.map((f) => f.question.trim().toLowerCase()));
  const pageFaqs = [...baseFaqs, ...extraFaqs.filter((f) => !existingQuestions.has(f.question.trim().toLowerCase()))];
  const faqSchemaExcludedPaths = new Set(["/better-ceasons-case-study/"]);
  if (pageFaqs.length > 0 && !faqSchemaExcludedPaths.has(path)) {
    schemas.push(faqSchema(pageFaqs));
  }

  if (route.wordpressType === "post" && route.date) {
    schemas.push(
      articleSchema({
        headline: route.title || "",
        description: route.description || "",
        path,
        datePublished: route.date,
        dateModified: route.modified,
        publisherId: ORGANIZATION_ID,
      }),
    );
  }

  const aiVideoSchemaPaths = new Set([
    "/services/ai-video-production-agency/",
    "/portfolio/",
    "/ai-production-videos-google-ads-landing-page/",
    "/services/ai-production-dubai-page/",
  ]);

  if (aiVideoSchemaPaths.has(path)) {
    schemas.push(...buildVerifiedAiVideoSchemas(path));
  }

  return schemas;
}

function blockText(block: ContentBlock): string {
  if (block.type === "heading") return block.text.trim();
  if (block.type === "paragraph") return block.content.map((span) => span.text).join("").trim();
  return "";
}

function cleanFaqQuestion(text: string): string {
  return text.replace(/\s*\+\s*$/, "").trim();
}

function isFaqHeading(text: string): boolean {
  const normalized = text.replace(/\s+/g, " ").trim();
  return (
    /^(?:frequently asked questions|common questions)$/i.test(normalized) ||
    /\bfaqs?$/i.test(normalized) ||
    /\bstraight answers\b/i.test(normalized) ||
    /\bquestions\b[\s\S]*\b(?:ask|choosing)\b/i.test(normalized) ||
    /^everything about ai video production$/i.test(normalized)
  );
}

function extractFaqsFromBlocks(blocks: ContentBlock[]) {
  const typed = blocks
    .filter((b): b is Extract<ContentBlock, { type: "faq" }> => b.type === "faq")
    .flatMap((b) => (b.items || []).map((item) => ({
      question: item.question.trim(),
      answer: (item.answer || [{ text: "" }]).map((span) => span.text).join("").trim(),
    })));
  if (typed.length > 0) return typed;

  const start = blocks.findIndex((b) => b.type === "heading" && isFaqHeading(b.text));
  if (start < 0) return [];
  const section = blocks.slice(start + 1);
  const stop = section.findIndex((b) => b.type === "heading" && !isFaqHeading(b.text));
  const scoped = stop >= 0 ? section.slice(0, stop) : section;
  const out: Array<{ question: string; answer: string }> = [];

  for (let i = 0; i < scoped.length; i += 1) {
    const block = scoped[i];
    if (block.type !== "paragraph") continue;
    const text = blockText(block).replace(/\s+/g, " ");
    const inline = text.match(/^(.+?\?)\s*\+\s*(.+)$/);
    if (inline) {
      out.push({ question: cleanFaqQuestion(inline[1]), answer: inline[2].trim() });
      continue;
    }
    if (!/\?\s*\+?$/.test(text)) continue;
    const question = cleanFaqQuestion(text);

    let nextIdx = i + 1;
    let nextBlock = scoped[nextIdx];
    if (nextBlock && nextBlock.type === "paragraph" && /^[\+\-\s]+$/.test(blockText(nextBlock))) {
      nextIdx += 1;
      nextBlock = scoped[nextIdx];
    }

    const answer = nextBlock?.type === "paragraph" ? blockText(nextBlock).replace(/\s+/g, " ") : "";
    if (question && answer) {
      out.push({ question, answer });
      i = nextIdx;
    }
  }
  return out;
}
