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
  compress: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.dgeniussolutions.com" },
      { protocol: "https", hostname: "dgeniussolutions.com" },
      { protocol: "https", hostname: "s.wordpress.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/wp-mirror-css/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/wp-content/uploads/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
        ],
      },
    ];
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
