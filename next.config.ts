import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['mongoose', 'bcryptjs'],
  experimental: {
    ppr: false,
  },
};

export default nextConfig;