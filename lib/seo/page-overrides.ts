export type PageSeoOverride = {
  title?: string;
  description?: string;
  ogTitle?: string;
  twitterTitle?: string;
  breadcrumbLabel?: string;
  serviceName?: string;
  serviceType?: string;
  areaServed?: string | string[];
};

const PAGE_SEO_OVERRIDES: Record<string, PageSeoOverride> = {
  "/career/": {
    description: "Explore career opportunities at D'Genius Solutions in Mumbai and join a team working across SEO, digital marketing, design, technology, content and AI-led creative production.",
  },
  "/services/performance-marketing/": {
    title: "Performance Marketing Agency in Mumbai | Google & Meta Ads | DGS",
    description: "Performance marketing agency in Mumbai for Google Ads, Meta Ads, PPC, landing page optimisation, remarketing, conversion tracking and ROI-focused campaign growth.",
  },
  "/services/ai-video-production-agency/": {
    title: "AI Video Production Agency in Mumbai | D’Genius Solutions",
    description: "AI video production agency in Mumbai creating AI video ads, product films, reels, brand videos and AI product videos for businesses. Book a free strategy call.",
    breadcrumbLabel: "AI Video Production Agency",
    serviceName: "AI Video Production Services",
    serviceType: "AI Video Production, Automotive AI Video, EdTech AI Video, FMCG AI Video, Manufacturing AI Video",
    areaServed: ["Mumbai", "Maharashtra", "India"],
  },
  "/services/seo-services-in-mumbai/": {
    title: "SEO Agency in Mumbai | Leading SEO Company & Services | DGS",
    description: "Premier SEO agency in Mumbai providing technical SEO, enterprise search optimization, AI Overviews readiness, local SEO and revenue-driven organic growth.",
    ogTitle: "SEO Agency in Mumbai | Leading SEO Company & Services | DGS",
    twitterTitle: "SEO Agency in Mumbai | Leading SEO Company & Services | DGS",
    breadcrumbLabel: "SEO Agency Mumbai",
    serviceName: "SEO Services & Organic Growth",
    serviceType: "Search Engine Optimization, Enterprise SEO, Local SEO, Technical SEO, E-Commerce SEO",
    areaServed: ["Mumbai", "Maharashtra", "India"],
  },
  "/services/website-development-amc/": {
    title: "Web Development Agency in Mumbai | Custom Web Design & AMC | DGS",
    description: "Leading web development agency in Mumbai building custom Next.js, WordPress and React websites with SEO-ready architecture, UI/UX design and AMC support.",
    ogTitle: "Web Development Agency in Mumbai | Custom Web Design & AMC | DGS",
    twitterTitle: "Web Development Agency in Mumbai | Custom Web Design & AMC | DGS",
    breadcrumbLabel: "Web Development Agency",
    serviceName: "Custom Web Development & Design",
    serviceType: "Web Development, Web Design, Next.js Development, WordPress Development, Website AMC",
    areaServed: ["Mumbai", "Maharashtra", "India"],
  },
  "/services/social-media-marketing/": {
    title: "Social Media Marketing Agency in Mumbai | Content, Ads & Growth | DGS",
  },
  "/services/branding/": {
    title: "Branding Agency in Mumbai | Brand Strategy & Identity Design | DGS",
  },
  "/services/content-creation/": {
    title: "Content Marketing Agency in Mumbai | Content Creation & SEO | DGS",
  },
  "/services/aeo-services-in-mumbai/": {
    breadcrumbLabel: "AEO Services Mumbai",
    serviceName: "Answer Engine Optimization (AEO) Services in Mumbai",
    serviceType: "Answer Engine Optimization, AI Search Optimization, Google AI Overviews Optimization",
    areaServed: ["Mumbai", "Maharashtra", "India"],
  },
  "/services/seo-service-pune/": {
    title: "SEO Agency in Pune | Leading SEO Company & Services | DGS",
    description: "Leading SEO agency in Pune for IT, SaaS, manufacturing, real estate and local businesses. Technical SEO, Google Maps, AI search visibility and qualified leads.",
    ogTitle: "SEO Agency in Pune | Leading SEO Company & Services | DGS",
    twitterTitle: "SEO Agency in Pune | Leading SEO Company & Services | DGS",
    breadcrumbLabel: "SEO Agency Pune",
    serviceName: "SEO Services in Pune",
    serviceType: "Search Engine Optimization, B2B SEO, Industrial SEO, Local SEO, Technical SEO",
    areaServed: ["Pune", "Pimpri-Chinchwad", "Maharashtra", "India"],
  },
  "/services/seo-service-in-banglore/": {
    title: "SEO Agency in Bangalore | Leading SEO Company & Services in Bengaluru | DGS",
    description: "Premier SEO agency in Bangalore (Bengaluru) for SaaS, enterprise tech, B2B and local businesses. Technical SEO, AI Overviews readiness and qualified lead growth.",
    ogTitle: "SEO Agency in Bangalore | Leading SEO Company & Services in Bengaluru | DGS",
    twitterTitle: "SEO Agency in Bangalore | Leading SEO Company & Services in Bengaluru | DGS",
    breadcrumbLabel: "SEO Agency Bangalore",
    serviceName: "SEO Services in Bangalore & Bengaluru",
    serviceType: "Search Engine Optimization, SaaS SEO, Enterprise SEO, Technical SEO, Local SEO",
    areaServed: ["Bangalore", "Bengaluru", "Karnataka", "India"],
  },
  "/services/seo-service-in-gurugram/": {
    title: "SEO Agency in Gurugram | Leading SEO Company & Services in Gurgaon | DGS",
    description: "Premier SEO agency in Gurugram (Gurgaon) and Delhi NCR for enterprise B2B, IT/ITeS, real estate and corporate brands. Technical SEO, AI search and lead growth.",
    ogTitle: "SEO Agency in Gurugram | Leading SEO Company & Services in Gurgaon | DGS",
    twitterTitle: "SEO Agency in Gurugram | Leading SEO Company & Services in Gurgaon | DGS",
    breadcrumbLabel: "SEO Agency Gurugram",
    serviceName: "SEO Services in Gurugram & Gurgaon",
    serviceType: "Search Engine Optimization, Enterprise SEO, B2B SEO, Local SEO, Technical SEO",
    areaServed: ["Gurugram", "Gurgaon", "Delhi NCR", "Haryana", "India"],
  },
  "/services/seo-services-in-hyderabad/": {
    title: "SEO Agency in Hyderabad | Leading SEO Company & Services | DGS",
    description: "Leading SEO agency in Hyderabad for IT, SaaS, pharma, life sciences, healthcare and real estate brands. Technical SEO, local discovery and qualified leads.",
    ogTitle: "SEO Agency in Hyderabad | Leading SEO Company & Services | DGS",
    twitterTitle: "SEO Agency in Hyderabad | Leading SEO Company & Services | DGS",
    breadcrumbLabel: "SEO Agency Hyderabad",
    serviceName: "SEO Services in Hyderabad",
    serviceType: "Search Engine Optimization, Enterprise SEO, SaaS SEO, Healthcare SEO, Local SEO",
    areaServed: ["Hyderabad", "Telangana", "India"],
  },
  "/services/website-development-pune-page/": {
    title: "Web Development Agency in Pune | Custom Website Design & AMC | DGS",
    description: "Leading web development agency in Pune building custom Next.js, WordPress and React websites with SEO-ready architecture, UI/UX design and ongoing AMC support.",
    ogTitle: "Web Development Agency in Pune | Custom Website Design & AMC | DGS",
    twitterTitle: "Web Development Agency in Pune | Custom Website Design & AMC | DGS",
    breadcrumbLabel: "Web Development Pune",
    serviceName: "Custom Web Development & Design in Pune",
    serviceType: "Web Development, Web Design, Next.js Development, WordPress Development, Website AMC",
    areaServed: ["Pune", "Pimpri-Chinchwad", "Maharashtra", "India"],
  },
  "/services/dubai-seo/": {
    title: "SEO Agency in Dubai | SEO Services & Local SEO UAE | DGS",
    description: "SEO services for businesses targeting Dubai and the UAE, covering technical SEO, local search, content, authority building and lead-focused organic growth.",
    ogTitle: "SEO Agency in Dubai | SEO Services & Local SEO UAE | DGS",
    twitterTitle: "SEO Agency in Dubai | SEO Services & Local SEO UAE | DGS",
    breadcrumbLabel: "SEO Dubai",
    serviceName: "SEO Services in Dubai",
    serviceType: "Search Engine Optimization, Local SEO UAE, Enterprise SEO, Technical SEO",
    areaServed: ["Dubai", "Abu Dhabi", "Sharjah", "United Arab Emirates"],
  },
  "/aeo-dubai/": {
    title: "AEO Agency in Dubai | AI Search & Google AI Overviews | DGS",
    description: "AEO services for Dubai-focused brands seeking visibility across Google AI Overviews, ChatGPT, Gemini, Perplexity, featured snippets and People Also Ask.",
    ogTitle: "AEO Agency in Dubai | AI Search & Google AI Overviews | DGS",
    twitterTitle: "AEO Agency in Dubai | AI Search & Google AI Overviews | DGS",
    breadcrumbLabel: "AEO Dubai",
    serviceName: "AEO Services in Dubai",
    serviceType: "Answer Engine Optimization, AI Search Optimization, Generative Engine Optimization",
    areaServed: ["Dubai", "Abu Dhabi", "United Arab Emirates"],
  },
  "/services/ai-production-dubai-page/": {
    title: "AI Video Production Agency in Dubai | D'Genius Solutions",
    description: "D'Genius Solutions creates AI video ads, product films, avatars, reels and brand films for Dubai and UAE brands with human-led creative direction, editing and campaign-ready delivery.",
    ogTitle: "AI Video Production Agency in Dubai | D'Genius Solutions",
    twitterTitle: "AI Video Production Agency in Dubai | D'Genius Solutions",
    breadcrumbLabel: "AI Video Production Dubai",
    serviceName: "AI Video Production Services in Dubai",
    serviceType: "AI Video Production, AI Commercials, AI Brand Films, AI Avatar Videos",
    areaServed: ["Dubai", "Abu Dhabi", "United Arab Emirates"],
  },
  "/services/": {
    title: "Digital Marketing, SEO & AI Services | D'Genius Solutions",
    description: "Explore D'Genius Solutions digital marketing, SEO, AEO, AI video production, web development, performance marketing, and branding services.",
  },
  "/our-services/": {
    title: "Our Services | Digital Marketing, SEO & AI Solutions | DGS",
    description: "Discover our full range of search, creative, technology, and performance marketing services built for business growth.",
  },
  "/australia-page/": {
    title: "Digital Marketing Agency in Australia | SEO, Ads, Web & AI | DGS",
    description: "Digital marketing services for businesses targeting Australian customers across SEO, AEO, GEO, paid media, website development, content, social and AI production.",
    ogTitle: "Digital Marketing Agency in Australia | SEO, Ads, Web & AI | DGS",
    twitterTitle: "Digital Marketing Agency in Australia | SEO, Ads, Web & AI | DGS",
    breadcrumbLabel: "Australia Digital Marketing",
    serviceName: "Digital Marketing, SEO & AI Search Services for Australia",
    serviceType: "Digital Marketing, Search Engine Optimization, Answer Engine Optimization, Web Development, AI Video Production",
    areaServed: ["Australia", "Sydney", "Melbourne", "Brisbane", "Perth"],
  },
  "/us-landing-page/": {
    title: "Digital Marketing Agency for US Businesses | SEO, AEO, Web & AI | DGS",
    description: "Digital marketing services for businesses targeting US customers across SEO, AEO, GEO, LLM SEO, paid media, websites, content, branding and social growth.",
    ogTitle: "Digital Marketing Agency for US Businesses | SEO, AEO, Web & AI | DGS",
    twitterTitle: "Digital Marketing Agency for US Businesses | SEO, AEO, Web & AI | DGS",
    breadcrumbLabel: "US Digital Marketing",
    serviceName: "Digital Marketing, SEO & AI Search Services for US Businesses",
    serviceType: "Digital Marketing, Search Engine Optimization, Answer Engine Optimization, Generative Engine Optimization, Web Development",
    areaServed: ["United States", "New York", "California", "Texas"],
  },
};

export function getPageSeoOverride(path: string): PageSeoOverride | undefined {
  return PAGE_SEO_OVERRIDES[path];
}
