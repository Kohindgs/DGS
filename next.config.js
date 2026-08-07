/** @type {import('next').NextConfig} */
const WP_ORIGIN = process.env.WP_ORIGIN || 'https://www.dgeniussolutions.com';

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    cpus: 1,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.dgeniussolutions.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dgeniussolutions.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' },
          { key: 'CDN-Cache-Control', value: 'no-store' },
          { key: 'X-DGS-Build', value: 'wp-mirror-2026-08-07b' },
        ],
      },
    ];
  },
  async rewrites() {
    // CSS url(/wp-content/...) resolves against the demo origin — proxy to WP
    // so Envira icon fonts, Smush assets, etc. load correctly.
    return [
      {
        source: '/wp-content/:path*',
        destination: `${WP_ORIGIN}/wp-content/:path*`,
      },
      {
        source: '/wp-includes/:path*',
        destination: `${WP_ORIGIN}/wp-includes/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      { source: '/new-home-page', destination: '/', permanent: true },
      { source: '/new-home-page/', destination: '/', permanent: true },
      { source: '/home', destination: '/', permanent: true },
      { source: '/home/', destination: '/', permanent: true },
      {
        source: '/services/generative-ai',
        destination: '/services/ai-video-production-agency',
        permanent: true,
      },
      {
        source: '/services/generative-ai/',
        destination: '/services/ai-video-production-agency',
        permanent: true,
      },
      {
        source: '/blogs/services/website-development-amc',
        destination: '/services/website-development-amc',
        permanent: true,
      },
      {
        source: '/blogs/services/seo-services-mumbai',
        destination: '/services/seo-services-in-mumbai',
        permanent: true,
      },
      {
        source: '/services/seo-services-mumbai',
        destination: '/services/seo-services-in-mumbai',
        permanent: true,
      },
      {
        source: '/blogs/services/social-media-marketing',
        destination: '/services/social-media-marketing',
        permanent: true,
      },
      {
        source: '/blogs/services/llm-seo-service',
        destination: '/services/llm-seo-service',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
