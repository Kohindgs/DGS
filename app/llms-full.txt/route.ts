import { siteConfig } from "@/lib/seo/site";
import { verifiedOrganization } from "@/lib/schema/entity";

export function GET() {
  const body = [
    `# ${verifiedOrganization.name}`,
    "",
    `Website: ${verifiedOrganization.url}/`,
    `Email: ${verifiedOrganization.email}`,
    `Phone: ${verifiedOrganization.telephone.join(", ")}`,
    "",
    "Primary services:",
    `- SEO: ${verifiedOrganization.url}/services/seo-services-in-mumbai/`,
    `- AEO: ${verifiedOrganization.url}/services/aeo-services-in-mumbai/`,
    `- GEO: ${verifiedOrganization.url}/services/geo/`,
    `- LLM SEO: ${verifiedOrganization.url}/services/llm-seo-service/`,
    `- AI Video: ${verifiedOrganization.url}/services/ai-video-production-agency/`,
    "",
    `Sitemap: ${siteConfig.url}/sitemap.xml`,
    `Short Markdown: ${siteConfig.url}/llms.md`,
    `Full Markdown: ${siteConfig.url}/llms-full.md`,
    `Short Plaintext: ${siteConfig.url}/llms.txt`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
