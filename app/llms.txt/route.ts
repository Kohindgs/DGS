import { getPublicRouteManifest } from "@/lib/seo/public-route-manifest";
import { verifiedOrganization } from "@/lib/schema/entity";
import { siteConfig } from "@/lib/seo/site";

export const dynamic = "force-dynamic";

export async function GET() {
  const routes = await getPublicRouteManifest();

  const services = routes.filter((r) => r.contentType === "service" && r.includeInSitemap && r.path !== "/services/");
  const blogs = routes.filter((r) => r.contentType === "blog" && r.includeInSitemap && r.path !== "/blogs/");
  const caseStudies = routes.filter((r) => r.contentType === "case-study" && r.includeInSitemap);
  const locations = routes.filter((r) => r.contentType === "location" && r.includeInSitemap);
  const international = routes.filter((r) => r.contentType === "international" && r.includeInSitemap);

  const recentBlogs = blogs.slice(0, 25);

  const body = [
    `# ${verifiedOrganization.name}`,
    "",
    `> Full service digital marketing agency in Mumbai offering connected search (SEO, AEO, GEO, LLM SEO), website development, social media marketing, performance marketing, branding, content creation and AI-led video production.`,
    "",
    `Official Website: ${siteConfig.url}/`,
    `Headquarters: ${verifiedOrganization.address.streetAddress}, ${verifiedOrganization.address.addressLocality}, ${verifiedOrganization.address.addressRegion} ${verifiedOrganization.address.postalCode}, ${verifiedOrganization.address.addressCountry}`,
    `Email: ${verifiedOrganization.email} | Phone: ${verifiedOrganization.telephone.join(", ")}`,
    "",
    "## Homepage & Company",
    "",
    `- [D'Genius Solutions Homepage](${siteConfig.url}/): Full service digital marketing agency in Mumbai offering connected search, website development, social media, performance marketing, branding and AI-led creative production.`,
    `- [About D'Genius Solutions](${siteConfig.url}/about-us/): Meet founders Kohin Bellara (CEO) and Sneha Bellara (COO) and explore our Mumbai digital marketing and AI studio.`,
    `- [All Digital Marketing & AI Services](${siteConfig.url}/services/): Overview of SEO, AEO, GEO, LLM SEO, web development, performance marketing, social media, branding, content creation and AI video production.`,
    `- [Contact D'Genius Solutions](${siteConfig.url}/contact-us/): Book a strategy consultation with our Khar West, Mumbai headquarters.`,
    "",
    "## Strategic Core Services",
    "",
    ...services.map(
      (s) => `- [${s.title}](${s.canonical}): ${s.description || "Official D'Genius Solutions service offering."}`,
    ),
    "",
    "## Global & Regional Markets",
    "",
    ...locations.map(
      (l) => `- [${l.title}](${l.canonical}): ${l.description || "Regional SEO and web development services."}`,
    ),
    ...international.map(
      (m) => `- [${m.title}](${m.canonical}): ${m.description || "International digital marketing and search services."}`,
    ),
    "",
    "## Case Studies & Portfolio",
    "",
    `- [Client Portfolio & Video Work](${siteConfig.url}/portfolio/): AI video production showcase, creative campaigns and digital work.`,
    `- [Client Case Studies](${siteConfig.url}/case_studies/): Verified SEO, organic traffic, and digital growth case studies.`,
    ...caseStudies
      .filter((c) => c.path !== "/portfolio/" && c.path !== "/case_studies/")
      .map((c) => `- [${c.title}](${c.canonical}): ${c.description || "Client case study and measurable growth results."}`),
    "",
    "## Published Insights",
    "",
    `- [D'Genius Insights & Blog Archive](${siteConfig.url}/blogs/): Actionable guides on SEO, AI search, AEO, GEO and digital growth.`,
    ...recentBlogs.map(
      (b) => `- [${b.title}](${b.canonical}): ${b.description || "Published SEO and digital marketing insight."}`,
    ),
    "",
    "## Careers",
    "",
    `- [Careers at D'Genius Solutions](${siteConfig.url}/career/): Open roles in Khar West, Mumbai across SEO, AI search and creative production.`,
    `- [Junior SEO Executive (SEO & AI Tools)](${siteConfig.url}/career/junior-seo-executive/): Full-time on-site role in Khar West, Mumbai covering On-Page/Off-Page/Technical SEO, AEO, GEO and LLM SEO.`,
    `- [Generative AI Artist](${siteConfig.url}/career/generative-ai-artist/): Full-time AI image and video production role in Mumbai.`,
    "",
    "## Optional",
    "",
    `- [Markdown Site Index](${siteConfig.url}/llms.md): Markdown version of the D'Genius Solutions AI discovery index.`,
    `- [Full AI Knowledge Base (Text)](${siteConfig.url}/llms-full.txt): Expanded service, location and insight reference.`,
    `- [Full AI Knowledge Base (Markdown)](${siteConfig.url}/llms-full.md): Complete Markdown reference for AI assistants.`,
    `- [XML Sitemap](${siteConfig.url}/sitemap.xml): Canonical XML sitemap of indexable URLs.`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=3600",
    },
  });
}
