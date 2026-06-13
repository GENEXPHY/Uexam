/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  basePath: '',
  assetPrefix: './',
};

module.exports = nextConfig;
