import type { NextConfig } from "next";
import redirectRegistry from "./data/migration/redirects.approved.json";

type ApprovedRedirect = {
  source: string;
  destination: string;
  statusCode?: 301 | 308;
};

const approvedRedirects = redirectRegistry.redirects as ApprovedRedirect[];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.dgeniussolutions.com" },
      { protocol: "https", hostname: "dgeniussolutions.com" },
    ],
  },
  async redirects() {
    return approvedRedirects.map((redirect) => ({
      source: redirect.source,
      destination: redirect.destination,
      statusCode: redirect.statusCode ?? 301,
    }));
  },
};

export default nextConfig;
