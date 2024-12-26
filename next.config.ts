import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    unoptimized: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
