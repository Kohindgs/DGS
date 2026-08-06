/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
