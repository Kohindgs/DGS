import { getPublicRouteManifest, getManifestRoutesByCluster } from "@/lib/seo/public-route-manifest";
import { verifiedOrganization } from "@/lib/schema/entity";
import { siteConfig } from "@/lib/seo/site";

export const dynamic = "force-dynamic";

export async function GET() {
  const [routes, clusters] = await Promise.all([
    getPublicRouteManifest(),
    getManifestRoutesByCluster(),
  ]);

  const international = routes.filter((r) => r.contentType === "international" && r.includeInSitemap);
  const locations = routes.filter((r) => r.contentType === "location" && r.includeInSitemap);
  const caseStudies = routes.filter((r) => r.contentType === "case-study" && r.includeInSitemap);
  const blogs = routes.filter((r) => r.contentType === "blog" && r.includeInSitemap);
  const careers = routes.filter((r) => r.contentType === "career" && r.includeInSitemap);

  const content = `# ${verifiedOrganization.name} — Full Entity & Service Index

> Structural reference and canonical machine-readable service index for D'Genius Solutions, a full service digital marketing agency in Mumbai offering connected search, website development, social media, performance marketing, branding and AI-led creative production.

- **Official Website**: [${siteConfig.url}/](${siteConfig.url}/)
- **Corporate Entity**: ${verifiedOrganization.legalName}
- **Primary Email**: ${verifiedOrganization.email}
- **Inquiries & Phone**: ${verifiedOrganization.telephone.join(", ")}
- **Headquarters**: ${verifiedOrganization.address.streetAddress}, ${verifiedOrganization.address.addressLocality}, ${verifiedOrganization.address.addressRegion} ${verifiedOrganization.address.postalCode}, ${verifiedOrganization.address.addressCountry}

---

## Social & Entity Graph Connections

${verifiedOrganization.sameAs.map((url) => `- [${new URL(url).hostname.replace("www.", "")}](${url})`).join("\n")}

---

## Service Taxonomy & Canonical Endpoints

### 1. AI Search & Emerging Retrieval Optimization (AEO / GEO / LLM)
${clusters["ai-search"]
  .map((s) => `- **[${s.title}](${s.canonical})**\n  ${s.description || "Emerging retrieval and AI engine optimization."}`)
  .join("\n")}

### 2. AI Creative & Video Production
${clusters["creative-video"]
  .map((s) => `- **[${s.title}](${s.canonical})**\n  ${s.description || "AI-powered creative video, ads, and visual production."}`)
  .join("\n")}

### 3. Core Search Engine Optimization (SEO)
${clusters["seo"]
  .map((s) => `- **[${s.title}](${s.canonical})**\n  ${s.description || "High-intent organic search optimization and technical SEO."}`)
  .join("\n")}

### 4. Web Engineering & Maintenance
${clusters["web-dev"]
  .map((s) => `- **[${s.title}](${s.canonical})**\n  ${s.description || "Conversion-focused web development, Next.js architecture, and AMC support."}`)
  .join("\n")}

### 5. Performance Marketing & Paid Media
${clusters["performance"]
  .map((s) => `- **[${s.title}](${s.canonical})**\n  ${s.description || "Data-driven performance media, Google Ads, and conversion growth."}`)
  .join("\n")}

### 6. Branding & Creative Identity
${clusters["branding"]
  .map((s) => `- **[${s.title}](${s.canonical})**\n  ${s.description || "Strategic brand positioning, visual identity, and brand systems."}`)
  .join("\n")}

### 7. Content Marketing & Strategy
${clusters["content"]
  .map((s) => `- **[${s.title}](${s.canonical})**\n  ${s.description || "Editorial content, topical authority, and organic lead acquisition."}`)
  .join("\n")}

---

## Regional & International Delivery Desks

### Global & International Markets
${international
  .map((m) => `- **[${m.title}](${m.canonical})**\n  ${m.description || "International digital marketing capabilities."}`)
  .join("\n")}

### India Regional Desks
${locations
  .map((l) => `- **[${l.title}](${l.canonical})**\n  ${l.description || "Regional enterprise SEO and web development capabilities."}`)
  .join("\n")}

---

## Selected Work & Case Studies

- **[Client Portfolio](${siteConfig.url}/portfolio/)**
  Digital marketing case studies, SEO growth results, AI campaigns, and brand success stories.
${caseStudies
  .map((c) => `- **[${c.title}](${c.canonical})**\n  ${c.description || "Client results and implementation."}`)
  .join("\n")}

---

## Active Careers

- **[Careers Portal](${siteConfig.url}/career/)**
  Join our Mumbai digital production and growth teams.
${careers
  .map((cr) => `- **[${cr.title}](${cr.canonical})**\n  ${cr.description || "Active employment opportunity."}`)
  .join("\n")}

---

## Complete Published Insights Inventory (${blogs.length} Articles)

${blogs
  .map((b) => `- [${b.title}](${b.canonical})${b.lastModified ? ` (Last Updated: ${b.lastModified})` : ""}`)
  .join("\n")}

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
