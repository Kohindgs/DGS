import { siteConfig } from "@/lib/seo/site";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { listPublishedCmsBlogs } from "@/lib/cms/blogs";
import { verifiedOrganization } from "@/lib/schema/entity";

export async function GET() {
  let cmsBlogLines: string[] = [];
  if (isCmsDatabaseConfigured()) {
    try {
      cmsBlogLines = (await listPublishedCmsBlogs(50)).map((blog) => `- ${blog.title}: ${siteConfig.url}/blogs/${blog.slug}/`);
    } catch {
      cmsBlogLines = [];
    }
  }

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
    "Published insights:",
    ...(cmsBlogLines.length ? cmsBlogLines : ["See sitemap for published blog URLs."]),
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
