/** Measured WordPress homepage tokens at 1440×900. Source: tooling/wp-exact-mirror/ */
export const WP_SHELL = {
  maxWidth: 1404,
  paddingInline: 18,
} as const;

export const WP_FONT = '"Manrope", Inter, Arial, sans-serif';

export const WP_SECTION_HEAD = {
  kicker: {
    fontSize: "11.52px",
    letterSpacing: "1.2672px",
    textTransform: "uppercase" as const,
    color: "rgba(255, 255, 255, 0.72)",
  },
  h2: {
    fontSize: "72px",
    fontWeight: 800,
    lineHeight: 1.04,
    letterSpacing: "-0.06em",
    color: "rgba(255, 255, 255, 0.96)",
  },
} as const;
