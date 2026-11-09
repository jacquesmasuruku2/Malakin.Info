import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'malakinfo.com',
        pathname: '/images/logo.png',
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
  // Désactiver l'i18n pour l'admin-panel
  i18n: undefined,
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
};

export default nextConfig;
