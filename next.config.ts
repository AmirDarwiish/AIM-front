import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'aim.runasp.net', pathname: '/uploads/**', search: '' }],
    deviceSizes: [480, 768, 1024, 1440, 1920],
    imageSizes: [240, 384],
    minimumCacheTTL: 86400,
  },
  async headers() {
    return [{source:'/fonts/:path*',headers:[{key:'Cache-Control',value:'public, max-age=31536000, immutable'}]}];
  },
  typescript: {
    // The project contains Cloudflare-specific files (db/, build/) that are not used on Vercel.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
