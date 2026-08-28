/** Measured WordPress homepage tokens at 1440×900 (scroll 0). Source: live WP capture. */
export const WP_HERO_TOKENS = {
  sectionPadding: "115.2px 0 82px",
  h1: {
    fontFamily: '"Manrope", Inter, Arial, sans-serif',
    fontSize: "74.88px",
    fontWeight: 800,
    lineHeight: "77.8752px",
    letterSpacing: "-4.4928px",
    color: "rgba(255, 255, 255, 0.96)",
    maxWidth: "820px",
  },
  lead: {
    fontSize: "16.704px",
    lineHeight: "28.7309px",
    color: "rgba(255, 255, 255, 0.74)",
    marginTop: "36px",
  },
  eyebrow: {
    fontSize: "13px",
    fontWeight: 800,
    letterSpacing: "0.455px",
    textTransform: "uppercase" as const,
    color: "rgba(255, 255, 255, 0.72)",
  },
  ctaPrimary: {
    background: "rgb(253, 92, 98)",
    color: "rgb(255, 255, 255)",
    padding: "15px 22px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 800,
    letterSpacing: "0.455px",
  },
  ctaSecondary: {
    background: "rgba(255, 255, 255, 0.055)",
    color: "rgb(255, 255, 255)",
    padding: "15px 22px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 800,
    letterSpacing: "0.455px",
  },
  image: {
    width: 500,
    height: 500,
  },
} as const;

export const WP_BACKGROUND_TOKENS = {
  base: "#020202",
  gridSize: "72px",
  gridLine: "rgba(255, 255, 255, 0.04)",
  vignette:
    "radial-gradient(circle at 52% 45%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.06) 48%, rgba(0, 0, 0, 0.54) 100%)",
} as const;

export const WP_SECTION_ORDER = [
  "hero",
  "rail",
  "proof",
  "capabilities",
  "portfolio",
  "caseStudies",
  "creativeGallery",
  "testimonials",
  "searchAuthority",
  "industries",
  "whyDgs",
  "faq",
  "finalCta",
] as const;
