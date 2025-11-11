import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mond-design-system/theme"],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};

export default nextConfig;
