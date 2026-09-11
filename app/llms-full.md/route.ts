import { verifiedOrganization } from "@/lib/schema/entity";
import { siteConfig } from "@/lib/seo/site";

export function GET() {
  const content = `# ${verifiedOrganization.name} — Full Entity & Services Index

> Complete structural reference and AI retrieval document for D'Genius Solutions, a leading digital marketing, AI search optimization (AEO/GEO/LLM SEO), web development, and AI video production agency based in Mumbai, India.

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
  Answer Engine Optimization targeted at winning direct answers in Google AI Overviews, conversational AI engines, featured snippets, and voice search systems.
- **[GEO Services (Generative Engine Optimization)](${verifiedOrganization.url}/services/geo/)**
  Multi-platform generative search visibility optimizing citation frequency and brand mention authority across ChatGPT, Perplexity, and Gemini.
- **[LLM SEO Service](${verifiedOrganization.url}/services/llm-seo-service/)**
  Large Language Model search engine optimization designed to position business facts, entities, and solutions directly inside AI model synthesis.
- **[AI Video Production Agency](${verifiedOrganization.url}/services/ai-video-production-agency/)**
  Next-generation commercial and digital video production combining cinematic workflows with generative AI tools for high-conversion brand films, ads, and social content.

### 2. Core Search Engine Optimization (SEO)
- **[SEO Services in Mumbai](${verifiedOrganization.url}/services/seo-services-in-mumbai/)**
  Comprehensive technical SEO, keyword research, on-page optimization, content architecture, and authority building for enterprise and growing businesses.

### 3. Web Engineering & Maintenance
- **[Website Development](${verifiedOrganization.url}/services/website-development-pune-page/)**
  Modern, high-performance web development utilizing clean semantic markup, fast server rendering, and responsive design.
- **[Website Maintenance & AMC](${verifiedOrganization.url}/services/website-development-amc/)**
  Annual maintenance contracts, technical support, security hardening, speed optimization, and uptime monitoring for web platforms.

---

## Selected Work & Case Studies

- **[Portfolio](${verifiedOrganization.url}/portfolio/)**
  Curated showcase of digital marketing campaigns, performance results, and brand transformations.
- **[Shirdi Se Sai Tak Case Study](${verifiedOrganization.url}/services/shirdi-se-sai-tak-case-study/)**
  Comprehensive case study detailing digital marketing strategy, visual design, and community reach.

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
