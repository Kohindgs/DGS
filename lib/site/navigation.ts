import { verifiedOrganization } from "@/lib/schema/entity";

export const TOP_LEVEL_NAV = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us/" },
  { label: "Our Services", href: "/services/" },
  { label: "Portfolio", href: "/portfolio/" },
  { label: "Case Studies", href: "/case_studies/" },
  { label: "Blogs", href: "/blogs/" },
  { label: "Careers", href: "/career/" },
  { label: "Contact Us", href: "/contact-us/" },
] as const;

export const SERVICE_NAV = [
  { label: "AI Video Production", href: "/services/ai-video-production-agency/" },
  { label: "SEO", href: "/services/seo-services-in-mumbai/" },
  { label: "AEO", href: "/services/aeo-services-in-mumbai/" },
  { label: "GEO", href: "/services/geo/" },
  { label: "LLM SEO", href: "/services/llm-seo-service/" },
  { label: "Social Media", href: "/services/social-media-marketing/" },
  { label: "Performance Marketing", href: "/services/performance-marketing/" },
  { label: "Website Dev", href: "/services/website-development-amc/" },
  { label: "Branding", href: "/services/branding/" },
  { label: "Content Creation", href: "/services/content-creation/" },
] as const;

export const FOOTER_QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us/" },
  { label: "Blogs", href: "/blogs/" },
  { label: "Career", href: "/career/" },
  { label: "Portfolio", href: "/portfolio/" },
  { label: "Contact", href: "/contact-us/" },
] as const;

export const FOOTER_SERVICES = [
  { label: "SEO Services", href: "/services/seo-services-in-mumbai/" },
  { label: "Website Development", href: "/services/website-development-amc/" },
  { label: "Social Media Marketing", href: "/services/social-media-marketing/" },
  { label: "Performance Marketing", href: "/services/performance-marketing/" },
  { label: "AI Video Production", href: "/services/ai-video-production-agency/" },
  { label: "Content Creation", href: "/services/content-creation/" },
  { label: "Branding", href: "/services/branding/" },
  { label: "AEO Services", href: "/services/aeo-services-in-mumbai/" },
  { label: "GEO Services", href: "/services/geo/" },
  { label: "LLM SEO Services", href: "/services/llm-seo-service/" },
] as const;

export const REACH_US = {
  phones: ["+91 99879 22901", "+91 85919 50238"],
  email: verifiedOrganization.email,
  addressLines: [
    "The Digital Lab",
    "Unit 202, Amore Edge,",
    "Swami Vivekanand Rd,",
    "Khar West,",
    "Mumbai 400052",
  ],
} as const;

export const FOOTER_CONTACT_LINES = [
  "The Digital Lab",
  "Unit 202, Amore Edge,",
  "Swami Vivekanand Rd,",
  "Govind Dham,",
  "Khar West,",
  "Mumbai 400052",
] as const;

export const SOCIAL_LINKS = [
  { label: "LinkedIn", href: verifiedOrganization.sameAs[0] },
  { label: "Instagram", href: verifiedOrganization.sameAs[2] },
  { label: "Facebook", href: verifiedOrganization.sameAs[1] },
  { label: "YouTube", href: verifiedOrganization.sameAs[3] },
  { label: "Pinterest", href: verifiedOrganization.sameAs[4] },
] as const;

export const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy-policy/" },
  { label: "Sitemap", href: "/sitemap/" },
] as const;
