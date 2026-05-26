import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,

  // ── PERF FIX: moved out of experimental (Next.js 15) ──
  serverExternalPackages: ["@prisma/client", "prisma"],

  experimental: {
    // optimizeCss: true  ← REMOVED: requires 'critters' package which breaks build
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-ba82ea76f3604402b8760527cc87149c.r2.dev",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1280, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ["image/webp"],
    minimumCacheTTL: 86400,
  },
};

export default nextConfig;