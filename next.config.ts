import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.dgeniussolutions.com" },
      { protocol: "https", hostname: "dgeniussolutions.com" },
      { protocol: "https", hostname: "s.wordpress.com" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/wp-content/uploads/:path*.mp4",
        destination: "https://www.dgeniussolutions.com/wp-content/uploads/:path*.mp4",
      },
      {
        source: "/wp-content/uploads/:path*.webm",
        destination: "https://www.dgeniussolutions.com/wp-content/uploads/:path*.webm",
      },
    ];
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
};

export default nextConfig;
