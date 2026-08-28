import { siteConfig } from "@/lib/seo/site";

export const ORGANIZATION_ID = `${siteConfig.url}/#organization` as const;
export const WEBSITE_ID = `${siteConfig.url}/#website` as const;

/** Verified public business facts — do not fabricate. */
export const verifiedOrganization = {
  name: "D'Genius Solutions",
  legalName: "D'Genius Solutions",
  url: siteConfig.url,
  logoUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2024/06/DGenius-Solutions-Logo.png",
  email: "business@dgeniussolutions.com",
  telephone: ["+91-99879-22901", "+91-85919-50238"],
  address: {
    streetAddress: "Unit 202, Amore Edge, Swami Vivekanand Rd, Govind Dham, Khar West",
    addressLocality: "Mumbai",
    postalCode: "400052",
    addressRegion: "Maharashtra",
    addressCountry: "IN",
  },
  /** Verify against source evidence before adding URLs. */
  sameAs: [
    "https://www.linkedin.com/company/dgenius-solutions/",
    "https://www.facebook.com/dgeniussolutions/",
    "https://www.instagram.com/dgeniussolutions/",
    "https://www.youtube.com/@dgeniussolutions",
  ],
} as const;
