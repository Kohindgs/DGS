export type PageSeoOverride = { title?: string; description?: string };

const PAGE_SEO_OVERRIDES: Record<string, PageSeoOverride> = {
  "/career/": {
    description: "Explore career opportunities at D'Genius Solutions in Mumbai and join a team working across SEO, digital marketing, design, technology, content and AI-led creative production.",
  },
  "/services/performance-marketing/": {
    title: "Performance Marketing Agency in Mumbai | Google & Meta Ads | DGS",
    description: "Performance marketing agency in Mumbai for Google Ads, Meta Ads, PPC, landing page optimisation, remarketing, conversion tracking and ROI-focused campaign growth.",
  },
  "/services/ai-video-production-agency/": {
    title: "Generative AI & AI Video Production Agency in Mumbai | DGS",
    description: "Generative AI and AI video production agency in Mumbai creating AI ads, brand films, product videos, generative AI visuals and campaign content for brands.",
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
  "/services/website-development-pune-page/": {
    title: "Website Development Company in Pune | Web Design & AMC | DGS",
    description: "Website development company in Pune for responsive websites, SEO-ready builds, landing pages, eCommerce development and ongoing website AMC support.",
  },
  "/services/dubai-seo/": {
    title: "SEO Agency in Dubai | SEO Services for UAE Growth | DGS",
    description: "SEO services for businesses targeting Dubai and the UAE, covering technical SEO, local search, content, authority building and lead-focused organic growth.",
  },
  "/aeo-dubai/": {
    title: "AEO Agency in Dubai | AI Search & Google AI Overviews | DGS",
    description: "AEO services for Dubai-focused brands seeking visibility across Google AI Overviews, ChatGPT, Gemini, Perplexity, featured snippets and People Also Ask.",
  },
  "/services/ai-production-dubai-page/": {
    title: "AI Video Production Agency in Dubai | Ads, Reels & Brand Films | DGS",
    description: "AI video production for Dubai-focused brands creating campaign ads, reels, product videos, social content and brand films with scalable AI-led workflows.",
  },
  "/australia-page/": {
    title: "Digital Marketing Agency in Australia | SEO, Ads, Web & AI | DGS",
    description: "Digital marketing services for businesses targeting Australian customers across SEO, AEO, GEO, paid media, website development, content, social and AI production.",
  },
  "/us-landing-page/": {
    title: "Digital Marketing Services for US Businesses | SEO, AEO & Growth | DGS",
    description: "Digital marketing services for businesses targeting US customers across SEO, AEO, GEO, LLM SEO, paid media, websites, content, branding and social growth.",
  },
};

export function getPageSeoOverride(path: string): PageSeoOverride | undefined {
  return PAGE_SEO_OVERRIDES[path];
}
