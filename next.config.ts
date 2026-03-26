import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true, // ✅ Skip TypeScript type errors during build
  },
};

export default nextConfig;
