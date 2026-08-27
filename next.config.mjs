import redirects from './data/seo/redirects.json' with { type: 'json' };

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.dgeniussolutions.com',
        pathname: '/wp-content/**',
      },
      {
        protocol: 'https',
        hostname: 'dgeniussolutions.com',
        pathname: '/wp-content/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return redirects;
  },
};

export default nextConfig;
