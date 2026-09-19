import { verifiedOrganization } from "@/lib/schema/entity";
import { siteConfig } from "@/lib/seo/site";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { listPublishedCmsBlogs } from "@/lib/cms/blogs";

export async function GET() {
  let cmsBlogLines: string[] = [];
  if (isCmsDatabaseConfigured()) {
    try {
      cmsBlogLines = (await listPublishedCmsBlogs(25)).map(
        (blog) => `- ${blog.title}: ${siteConfig.url}/blogs/${blog.slug}/`,
      );
    } catch {
      cmsBlogLines = [];
    }
  }

  const body = [
    `# ${verifiedOrganization.name}`,
    "",
    "> Full service digital marketing agency in Mumbai offering connected search, website development, social media, performance marketing, branding and AI-led creative production.",
    "",
    `${verifiedOrganization.url}/`,
    "",
    "## Homepage",
    "",
    `- ${verifiedOrganization.url}/ — Full service digital marketing agency in Mumbai offering connected search, website development, social media, performance marketing, branding and AI-led creative production.`,    "",
    "## Services",
    "",
    `- ${verifiedOrganization.url}/services/seo-services-in-mumbai/`,
    `- ${verifiedOrganization.url}/services/aeo-services-in-mumbai/`,
    `- ${verifiedOrganization.url}/services/geo/`,
    `- ${verifiedOrganization.url}/services/llm-seo-service/`,
    `- ${verifiedOrganization.url}/services/ai-video-production-agency/`,
    "",
    "## Published Insights",
    "",
    ...(cmsBlogLines.length ? cmsBlogLines : [`- ${verifiedOrganization.url}/blogs/`]),
    "",
    "## Contact",
    "",
    `- Email: ${verifiedOrganization.email}`,
    `- Phone: ${verifiedOrganization.telephone.join(", ")}`,
    `- Address: ${verifiedOrganization.address.streetAddress}, ${verifiedOrganization.address.addressLocality} ${verifiedOrganization.address.postalCode}`,
    "",
    "## Machine-readable indexes",
    "",
    `- ${verifiedOrganization.url}/sitemap.xml`,
    `- ${verifiedOrganization.url}/llms-full.txt`,
    `- ${verifiedOrganization.url}/llms.md`,
    `- ${verifiedOrganization.url}/llms-full.md`,
    "",
  ].join("\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=3600",
    },
  });
}
