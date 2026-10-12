import { getPublicRouteManifest } from "@/lib/seo/public-route-manifest";
import { verifiedOrganization } from "@/lib/schema/entity";
import { siteConfig } from "@/lib/seo/site";

export const dynamic = "force-dynamic";

export async function GET() {
  const routes = await getPublicRouteManifest();

  const services = routes.filter((r) => r.contentType === "service" && r.includeInSitemap);
  const locations = routes.filter((r) => r.contentType === "location" && r.includeInSitemap);
  const international = routes.filter((r) => r.contentType === "international" && r.includeInSitemap);
  const caseStudies = routes.filter((r) => r.contentType === "case-study" && r.includeInSitemap);
  const blogs = routes.filter((r) => r.contentType === "blog" && r.includeInSitemap);
  const careers = routes.filter((r) => r.contentType === "career" && r.includeInSitemap);

  const body = [
    `# ${verifiedOrganization.name} — Full Entity & Service Index (Plaintext)`,
    "",
    `Website: ${siteConfig.url}/`,
    `Legal Name: ${verifiedOrganization.legalName}`,
    `Email: ${verifiedOrganization.email}`,
    `Phone: ${verifiedOrganization.telephone.join(", ")}`,
    `Headquarters: ${verifiedOrganization.address.streetAddress}, ${verifiedOrganization.address.addressLocality} ${verifiedOrganization.address.postalCode}`,
    "",
    "## Core Services:",
    ...services.map((s) => `- ${s.title}: ${s.canonical}`),
    "",
    "## Regional Location Desks:",
    ...locations.map((l) => `- ${l.title}: ${l.canonical}`),
    "",
    "## International Desks & Markets:",
    ...international.map((m) => `- ${m.title}: ${m.canonical}`),
    "",
    "## Case Studies & Portfolio:",
    `- Client Portfolio: ${siteConfig.url}/portfolio/`,
    ...caseStudies.map((c) => `- ${c.title}: ${c.canonical}`),
    "",
    "## Active Careers:",
    `- Careers Portal: ${siteConfig.url}/career/`,
    ...careers.map((c) => `- ${c.title}: ${c.canonical}`),
    "",
    "## Complete Published Insights Inventory:",
    ...blogs.map((b) => `- ${b.title}: ${b.canonical}`),
    "",
    "## Machine-Readable Manifests:",
    `XML Sitemap: ${siteConfig.url}/sitemap.xml`,
    `Short Markdown: ${siteConfig.url}/llms.md`,
    `Short Plaintext: ${siteConfig.url}/llms.txt`,
    `Full Markdown: ${siteConfig.url}/llms-full.md`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=3600",
    },
  });
}
