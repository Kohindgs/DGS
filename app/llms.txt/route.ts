import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { listPublishedCmsBlogs } from "@/lib/cms/blogs";
import { verifiedOrganization } from "@/lib/schema/entity";

export const dynamic = "force-dynamic";

export async function GET() {
  let blogLines: string[] = [];
  if (isCmsDatabaseConfigured()) {
    try {
      blogLines = (await listPublishedCmsBlogs(20)).map(
        (blog) => `- ${verifiedOrganization.url}/blogs/${blog.slug}/ — ${blog.title}`,
      );
    } catch {
      blogLines = [];
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
    `- ${verifiedOrganization.url}/ — Full service digital marketing agency in Mumbai offering connected search, website development, social media, performance marketing, branding and AI-led creative production.`,
    "",
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
    ...(blogLines.length ? blogLines : ["- See sitemap.xml for published blog URLs."]),
    "",
    "## Contact",
    "",
    `- Email: ${verifiedOrganization.email}`,
    `- Phone: ${verifiedOrganization.telephone.join(", ")}`,
    `- Address: ${verifiedOrganization.address.streetAddress}, ${verifiedOrganization.address.addressLocality} ${verifiedOrganization.address.postalCode}`,
    "",
    "## Optional",
    "",
    `- ${verifiedOrganization.url}/llms-full.txt`,
    `- ${verifiedOrganization.url}/llms.md`,
    `- ${verifiedOrganization.url}/llms-full.md`,
    `- ${verifiedOrganization.url}/sitemap.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=3600",
    },
  });
}
