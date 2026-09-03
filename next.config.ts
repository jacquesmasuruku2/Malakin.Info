import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.malakinfo.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dd0632138e3f2df4d45a622c44fdea7c.r2.cloudflarestorage.com',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
