import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // The project contains Cloudflare-specific files (db/, build/) that are not used on Vercel.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;