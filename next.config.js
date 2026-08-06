/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Hostinger shared Node plans have low process/thread limits.
  // Keep static generation workers minimal to avoid build aborts.
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
};

module.exports = nextConfig;
