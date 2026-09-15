import { verifiedOrganization } from "@/lib/schema/entity";
import { siteConfig } from "@/lib/seo/site";

export function GET() {
  const content = `# ${verifiedOrganization.name} — Full Entity & Services Index

> Structural reference and machine-readable service index for D'Genius Solutions, a full service digital marketing agency in Mumbai offering connected search, website development, social media, performance marketing, branding and AI-led creative production.

- **Official Website**: ${verifiedOrganization.url}/
- **Corporate Entity**: ${verifiedOrganization.legalName}
- **Primary Email**: ${verifiedOrganization.email}
- **Inquiries & Phone**: ${verifiedOrganization.telephone.join(", ")}
- **Headquarters**: ${verifiedOrganization.address.streetAddress}, ${verifiedOrganization.address.addressLocality}, ${verifiedOrganization.address.addressRegion} ${verifiedOrganization.address.postalCode}, ${verifiedOrganization.address.addressCountry}

---

## Social & Entity Graph Connections

${verifiedOrganization.sameAs.map((url) => `- [${new URL(url).hostname.replace("www.", "")}](${url})`).join("\n")}

---

## Service Taxonomy & Canonical Endpoints

### 1. AI Search & Emerging Retrieval Optimization
- **[AEO Services in Mumbai](${verifiedOrganization.url}/services/aeo-services-in-mumbai/)**
  AEO services in Mumbai to improve visibility in Google AI Overviews, AI Mode, featured snippets, voice search, and AI search platforms.
- **[GEO Services (Generative Engine Optimization)](${verifiedOrganization.url}/services/geo/)**
  GEO services in Mumbai to improve visibility in AI Overviews, ChatGPT, and generative search results.
- **[LLM SEO Service](${verifiedOrganization.url}/services/llm-seo-service/)**
  LLM SEO services in Mumbai to improve visibility in ChatGPT, Gemini, AI Overviews and Perplexity.
- **[AI Video Production Agency](${verifiedOrganization.url}/services/ai-video-production-agency/)**
  AI video production agency in Mumbai creating AI video ads, product films, reels, brand videos and AI product videos for businesses.

### 2. Core Search Engine Optimization (SEO)
- **[SEO Services in Mumbai](${verifiedOrganization.url}/services/seo-services-in-mumbai/)**
  SEO agency in Mumbai offering technical SEO, local SEO, content optimisation, authority building and AI-search readiness.

### 3. Web Engineering & Maintenance
- **[Website Development](${verifiedOrganization.url}/services/website-development-pune-page/)**
  Website development delivering responsive, conversion-focused and SEO-friendly websites.
- **[Website Maintenance & AMC](${verifiedOrganization.url}/services/website-development-amc/)**
  Website development in Mumbai using WordPress, Next.js, React, PHP and HTML, with redesign, migration and AMC support.

---

## Selected Work & Case Studies

- **[Portfolio](${verifiedOrganization.url}/portfolio/)**
  Digital marketing case studies, SEO growth results, AI campaigns, and brand success stories.
- **[Shirdi Se Sai Tak Case Study](${verifiedOrganization.url}/services/shirdi-se-sai-tak-case-study/)**
  Mythological AI avatar case study for Shirdi Se Sai Tak devotional storytelling.

---

## Machine-Readable Manifests & Endpoints

- **XML Sitemap**: [${siteConfig.url}/sitemap.xml](${siteConfig.url}/sitemap.xml)
- **Short Markdown**: [${siteConfig.url}/llms.md](${siteConfig.url}/llms.md)
- **Short Plaintext**: [${siteConfig.url}/llms.txt](${siteConfig.url}/llms.txt)
- **Full Plaintext**: [${siteConfig.url}/llms-full.txt](${siteConfig.url}/llms-full.txt)
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
    },
  });
}
