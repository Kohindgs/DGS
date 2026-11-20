import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  compress: true,
  experimental: {
    cpus: 4,
  },
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
      {
        source: "/about/",
        destination: "/about-us/",
        permanent: true,
      },
      {
        source: "/services/web-development/",
        destination: "/services/website-development-amc/",
        permanent: true,
      },
      {
        source: "/locations/digital-marketing-agency-in-mumbai/",
        destination: "/services/seo-services-in-mumbai/",
        permanent: true,
      },
      {
        source: "/services/aeo/",
        destination: "/services/aeo-services-in-mumbai/",
        permanent: true,
      },
      {
        source: "/services/llm-seo/",
        destination: "/services/llm-seo-service/",
        permanent: true,
      },
    ];
  },
  async headers() {
    const securityHeaders = [
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/services/:path*",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/blogs/:path*",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/(about-us|contact-us|portfolio|case_studies|seo-pricing|australia-page|us-landing-page|aeo-dubai)/",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/wp-mirror-css/:path*",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/wp-content/uploads/:path*",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
