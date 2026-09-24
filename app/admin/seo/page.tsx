import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import SeoClientView, { type SeoRoute } from "./SeoClientView";

export const dynamic = "force-dynamic";

const SEO_ROUTES: SeoRoute[] = [
  { route: "/", title: "Leading Digital Marketing & Growth Agency | D'Genius Solutions", category: "Core Service", schemaType: "Organization, LocalBusiness", status: "200 OK", canonical: "Self", robots: "index, follow" },
  { route: "/services/ai-video-production-agency/", title: "AI Video Production Agency | DGS Mumbai", category: "Core Service", schemaType: "Service, VideoObject", status: "200 OK", canonical: "Self", robots: "index, follow" },
  { route: "/services/ai-production-dubai-page/", title: "AI Video Production Agency in Dubai | DGS", category: "Location Pillar", schemaType: "Service, LocalBusiness", status: "200 OK", canonical: "Self", robots: "index, follow" },
  { route: "/services/aeo-services-in-mumbai/", title: "AEO Services in Mumbai | Answer Engine Optimization", category: "Core Service", schemaType: "Service, FAQPage", status: "200 OK", canonical: "Self", robots: "index, follow" },
  { route: "/aeo-dubai/", title: "AEO Services in Dubai | Answer Engine Optimization UAE", category: "Location Pillar", schemaType: "Service, LocalBusiness", status: "200 OK", canonical: "Self", robots: "index, follow" },
  { route: "/services/seo-company-in-mumbai/", title: "SEO Company in Mumbai | Search Engine Optimization", category: "Core Service", schemaType: "Service, LocalBusiness", status: "200 OK", canonical: "Self", robots: "index, follow" },
  { route: "/seo-agency-dubai/", title: "Best SEO Agency in Dubai | Organic Search Growth", category: "Location Pillar", schemaType: "Service, LocalBusiness", status: "200 OK", canonical: "Self", robots: "index, follow" },
  { route: "/services/performance-marketing-agency/", title: "Performance Marketing Agency | High ROI Ads", category: "Core Service", schemaType: "Service", status: "200 OK", canonical: "Self", robots: "index, follow" },
  { route: "/services/website-design-development/", title: "Web Design & Development Agency | Modern UX/UI", category: "Core Service", schemaType: "Service", status: "200 OK", canonical: "Self", robots: "index, follow" },
  { route: "/blogs/", title: "Digital Marketing & AI Growth Blog | DGS Insights", category: "Editorial", schemaType: "CollectionPage, Blog", status: "200 OK", canonical: "Self", robots: "index, follow" },
  { route: "/about/", title: "About D'Genius Solutions | Digital Transformation Partners", category: "System", schemaType: "AboutPage, Organization", status: "200 OK", canonical: "Self", robots: "index, follow" },
  { route: "/contact/", title: "Contact Us | Get In Touch with D'Genius Solutions", category: "System", schemaType: "ContactPage, LocalBusiness", status: "200 OK", canonical: "Self", robots: "index, follow" },
  { route: "/careers/", title: "Careers at D'Genius Solutions | Join Our Team", category: "System", schemaType: "WebPage", status: "200 OK", canonical: "Self", robots: "index, follow" },
  { route: "/sitemap.xml", title: "Live XML Sitemap (101 verified URLs)", category: "System", schemaType: "XML Document", status: "200 OK", canonical: "Self", robots: "index, follow" },
];

export default async function AdminSeoPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  return <SeoClientView routes={SEO_ROUTES} />;
}
