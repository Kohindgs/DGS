import { verifiedOrganization } from "@/lib/schema/entity";
import { siteConfig } from "@/lib/seo/site";

export function GET() {
  const content = `# ${verifiedOrganization.name}

> Full-service digital marketing agency in Mumbai specializing in SEO, AEO, GEO, LLM SEO, AI search optimization, and AI-led creative production.

Website: ${verifiedOrganization.url}/

## Core Services

- [SEO Services in Mumbai](${verifiedOrganization.url}/services/seo-services-in-mumbai/): Technical SEO, local search, link building, and organic search growth strategies.
- [AEO Services in Mumbai](${verifiedOrganization.url}/services/aeo-services-in-mumbai/): Answer Engine Optimization for Google AI Overviews, AI Mode, featured snippets, and voice search.
- [GEO Services](${verifiedOrganization.url}/services/geo/): Generative Engine Optimization to maximize citation and brand visibility across AI search platforms.
- [LLM SEO Services](${verifiedOrganization.url}/services/llm-seo-service/): Optimization for Large Language Model search systems including ChatGPT, Gemini, and Perplexity.
- [AI Video Production Agency](${verifiedOrganization.url}/services/ai-video-production-agency/): AI-powered video commercials, brand films, product reels, and social campaigns.

## Key Case Studies & Portfolio

- [Client Portfolio](${verifiedOrganization.url}/portfolio/): Real digital marketing case studies, organic growth campaigns, and client success stories.
- [Shirdi Se Sai Tak Case Study](${verifiedOrganization.url}/services/shirdi-se-sai-tak-case-study/): Multi-channel brand growth, visual identity, and performance marketing case study.

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
