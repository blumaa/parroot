import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mond-design-system/theme"],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all HTTPS domains for CMS flexibility
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
