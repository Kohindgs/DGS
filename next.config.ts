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
    ],
  },
  async redirects() {
    return [
      {
        source: "/services/website-design-development/",
        destination: "/services/website-development-amc/",
        permanent: true,
      },
      {
        source: "/website-design-development/",
        destination: "/services/website-development-amc/",
        permanent: true,
      },
      {
        source: "/services/seo-service-in-bangalore/",
        destination: "/services/seo-service-in-banglore/",
        permanent: true,
      },
      {
        source: "/services/seo-services-in-bangalore/",
        destination: "/services/seo-service-in-banglore/",
        permanent: true,
      },
      {
        source: "/services/seo-service-in-bengaluru/",
        destination: "/services/seo-service-in-banglore/",
        permanent: true,
      },
      {
        source: "/services/seo-services-in-bengaluru/",
        destination: "/services/seo-service-in-banglore/",
        permanent: true,
      },
      {
        source: "/services/seo-services-in-pune/",
        destination: "/services/seo-service-pune/",
        permanent: true,
      },
      {
        source: "/services/seo-service-in-pune/",
        destination: "/services/seo-service-pune/",
        permanent: true,
      },
      {
        source: "/services/seo-services-in-gurugram/",
        destination: "/services/seo-service-in-gurugram/",
        permanent: true,
      },
      {
        source: "/services/seo-service-in-gurgaon/",
        destination: "/services/seo-service-in-gurugram/",
        permanent: true,
      },
      {
        source: "/services/seo-services-in-gurgaon/",
        destination: "/services/seo-service-in-gurugram/",
        permanent: true,
      },
      {
        source: "/services/seo-service-in-hyderabad/",
        destination: "/services/seo-services-in-hyderabad/",
        permanent: true,
      },
      {
        source: "/services/website-development-pune/",
        destination: "/services/website-development-pune-page/",
        permanent: true,
      },
      {
        source: "/services/web-development-pune/",
        destination: "/services/website-development-pune-page/",
        permanent: true,
      },
      {
        source: "/services/ai-production-dubai/",
        destination: "/services/ai-production-dubai-page/",
        permanent: true,
      },
      {
        source: "/dubai-seo/",
        destination: "/services/dubai-seo/",
        permanent: true,
      },
      {
        source: "/services/seo-services-dubai/",
        destination: "/services/dubai-seo/",
        permanent: true,
      },
      {
        source: "/services/aeo-services-in-dubai/",
        destination: "/aeo-dubai/",
        permanent: true,
      },
      {
        source: "/australia/",
        destination: "/australia-page/",
        permanent: true,
      },
      {
        source: "/us/",
        destination: "/us-landing-page/",
        permanent: true,
      },
      {
        source: "/usa/",
        destination: "/us-landing-page/",
        permanent: true,
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
