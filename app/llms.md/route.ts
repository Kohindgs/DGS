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

  // Curated key insights (top 30 from manifest)
  const curatedBlogs = blogs.slice(0, 30);

  const content = `# ${verifiedOrganization.name}

> Full service digital marketing agency in Mumbai offering connected search, website development, social media, performance marketing, branding and AI-led creative production.

- **Official Website**: [${siteConfig.url}/](${siteConfig.url}/)
- **Corporate Entity**: ${verifiedOrganization.legalName}
- **Headquarters**: ${verifiedOrganization.address.streetAddress}, ${verifiedOrganization.address.addressLocality}, ${verifiedOrganization.address.addressRegion} ${verifiedOrganization.address.postalCode}, ${verifiedOrganization.address.addressCountry}

---

## Core Services

${services
  .map((s) => `- [${s.title}](${s.canonical}): ${s.description || "Official agency service offering."}`)
  .join("\n")}

---

## Regional & International Markets

${locations
  .map((l) => `- [${l.title}](${l.canonical}): ${l.description || "Regional SEO and web development capabilities."}`)
  .join("\n")}
${international
  .map((m) => `- [${m.title}](${m.canonical}): ${m.description || "Regional digital marketing capabilities."}`)
  .join("\n")}

---

## Key Case Studies & Portfolio

- [Client Portfolio](${siteConfig.url}/portfolio/): Digital marketing case studies, SEO growth results, AI campaigns, and brand success stories.
${caseStudies
  .map((c) => `- [${c.title}](${c.canonical}): ${c.description || "Client results and implementation."}`)
  .join("\n")}

---

## Published Insights

${curatedBlogs.length
  ? curatedBlogs.map((b) => `- [${b.title}](${b.canonical})`).join("\n")
  : `- [Blog Archive](${siteConfig.url}/blogs/)`}

---

## Careers

- [Careers at D'Genius Solutions](${siteConfig.url}/career/): Join our team in Mumbai.
- [Generative AI Artist](${siteConfig.url}/career/generative-ai-artist/): Full-time AI image and video production opening.

---

## Contact Information

- **Email**: ${verifiedOrganization.email}
- **Phone**: ${verifiedOrganization.telephone.join(", ")}
- **Address**: ${verifiedOrganization.address.streetAddress}, ${verifiedOrganization.address.addressLocality}, ${verifiedOrganization.address.addressRegion} ${verifiedOrganization.address.postalCode}, ${verifiedOrganization.address.addressCountry}

---

## AI Discovery & Site Manifests

- **Full AI Document**: [${siteConfig.url}/llms-full.md](${siteConfig.url}/llms-full.md)
- **Plaintext Summary**: [${siteConfig.url}/llms.txt](${siteConfig.url}/llms.txt)
- **Plaintext Full**: [${siteConfig.url}/llms-full.txt](${siteConfig.url}/llms-full.txt)
- **XML Sitemap**: [${siteConfig.url}/sitemap.xml](${siteConfig.url}/sitemap.xml)
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
    },
  });
}
