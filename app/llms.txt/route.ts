import { getPublicRouteManifest } from "@/lib/seo/public-route-manifest";
import { verifiedOrganization } from "@/lib/schema/entity";
import { siteConfig } from "@/lib/seo/site";

export const dynamic = "force-dynamic";

export async function GET() {
  const routes = await getPublicRouteManifest();

  // Filter canonical routes by content type & clusters
  const services = routes.filter((r) => r.contentType === "service" && r.includeInSitemap);
  const blogs = routes.filter((r) => r.contentType === "blog" && r.includeInSitemap);
  const caseStudies = routes.filter((r) => r.contentType === "case-study" && r.includeInSitemap);
  const international = routes.filter((r) => r.contentType === "international" && r.includeInSitemap);

  // Concise published insights (top recent 25 from manifest)
  const recentBlogs = blogs.slice(0, 25);

  const body = [
    `# ${verifiedOrganization.name}`,
    "",
    `> Full service digital marketing agency in Mumbai offering connected search, website development, social media, performance marketing, branding and AI-led creative production.`,
    "",
    `${siteConfig.url}/`,
    "",
    "## Homepage",
    "",
    `- ${siteConfig.url}/ — Full service digital marketing agency in Mumbai offering connected search, website development, social media, performance marketing, branding and AI-led creative production.`,
    "",
    "## Strategic Core Services",
    "",
    ...services.map((s) => `- ${s.canonical} — ${s.title}`),
    "",
    "## Global & Regional Markets",
    "",
    ...international.map((m) => `- ${m.canonical} — ${m.title}`),
    "",
    "## Case Studies & Portfolio",
    "",
    `- ${siteConfig.url}/portfolio/ — Client Portfolio & Case Studies`,
    ...caseStudies.map((c) => `- ${c.canonical} — ${c.title}`),
    "",
    "## Published Insights",
    "",
    ...(recentBlogs.length
      ? recentBlogs.map((b) => `- ${b.canonical} — ${b.title}`)
      : [`- ${siteConfig.url}/blogs/ — Published Insights Archive`]),
    "",
    "## Careers",
    "",
    `- ${siteConfig.url}/career/ — Careers at D'Genius Solutions`,
    `- ${siteConfig.url}/career/generative-ai-artist/ — Generative AI Artist (Active Opening)`,
    "",
    "## Contact",
    "",
    `- Email: ${verifiedOrganization.email}`,
    `- Phone: ${verifiedOrganization.telephone.join(", ")}`,
    `- Address: ${verifiedOrganization.address.streetAddress}, ${verifiedOrganization.address.addressLocality} ${verifiedOrganization.address.postalCode}`,
    "",
    "## Machine-Readable Endpoints",
    "",
    `- ${siteConfig.url}/llms.md`,
    `- ${siteConfig.url}/llms-full.txt`,
    `- ${siteConfig.url}/llms-full.md`,
    `- ${siteConfig.url}/sitemap.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=3600",
    },
  });
}
