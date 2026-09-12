import { verifiedOrganization } from "@/lib/schema/entity";
import { siteConfig } from "@/lib/seo/site";

export function GET() {
  const content = `# ${verifiedOrganization.name}

> Full service digital marketing agency in Mumbai offering connected search, website development, social media, performance marketing, branding and AI-led creative production.

Website: ${verifiedOrganization.url}/

## Core Services

- [SEO Services in Mumbai](${verifiedOrganization.url}/services/seo-services-in-mumbai/): SEO agency in Mumbai offering technical SEO, local SEO, content optimisation, authority building and AI-search readiness.
- [AEO Services in Mumbai](${verifiedOrganization.url}/services/aeo-services-in-mumbai/): AEO services in Mumbai to improve visibility in Google AI Overviews, AI Mode, featured snippets, voice search, and AI search platforms.
- [GEO Services](${verifiedOrganization.url}/services/geo/): GEO services in Mumbai to improve visibility in AI Overviews, ChatGPT, and generative search results.
- [LLM SEO Services](${verifiedOrganization.url}/services/llm-seo-service/): LLM SEO services in Mumbai to improve visibility in ChatGPT, Gemini, AI Overviews and Perplexity.
- [AI Video Production Agency](${verifiedOrganization.url}/services/ai-video-production-agency/): AI video production agency in Mumbai creating AI video ads, product films, reels, brand videos and AI product videos for businesses.

## Key Case Studies & Portfolio

- [Client Portfolio](${verifiedOrganization.url}/portfolio/): Digital marketing case studies, SEO growth results, AI campaigns, and brand success stories.
- [Shirdi Se Sai Tak Case Study](${verifiedOrganization.url}/services/shirdi-se-sai-tak-case-study/): Mythological AI avatar case study for Shirdi Se Sai Tak devotional storytelling.

## Contact Information

- **Email**: ${verifiedOrganization.email}
- **Phone**: ${verifiedOrganization.telephone.join(", ")}
- **Address**: ${verifiedOrganization.address.streetAddress}, ${verifiedOrganization.address.addressLocality}, ${verifiedOrganization.address.addressRegion} ${verifiedOrganization.address.postalCode}, ${verifiedOrganization.address.addressCountry}

## AI Discovery & Site Manifests

- **Full AI Document**: ${siteConfig.url}/llms-full.md
- **Plaintext Summary**: ${siteConfig.url}/llms.txt
- **Plaintext Full**: ${siteConfig.url}/llms-full.txt
- **XML Sitemap**: ${siteConfig.url}/sitemap.xml
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
    },
  });
}
