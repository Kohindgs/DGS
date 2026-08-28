export const siteConfig = {
  name: "D'Genius Solutions",
  url: "https://www.dgeniussolutions.com",
  locale: "en_IN",
  language: "en",
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
