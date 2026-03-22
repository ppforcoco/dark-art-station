import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compress responses
  compress: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.hauntedwallpapers.com",
        port: "",
        pathname: "/**",
      },
    ],
    // WebP only — AVIF encoding is CPU-intensive and stalls the image optimizer
    // under load (24 concurrent conversions on a grid page kills response times).
    // WebP is ~30% smaller than JPEG with near-zero encoding overhead.
    formats: ["image/webp"],
    minimumCacheTTL: 31536000, // 1 year
    deviceSizes: [390, 640, 768, 1024, 1280, 1920],
    imageSizes:  [64, 128, 256, 384, 512],
  },

  async headers() {
    return [
      {
        // Long cache for static assets
        source: "/:path*\\.(jpg|jpeg|png|webp|avif|gif|ico|svg|woff|woff2|ttf|otf|js|css)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Security headers on all pages
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "X-Frame-Options",           value: "SAMEORIGIN" },
          { key: "X-XSS-Protection",          value: "1; mode=block" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // API routes — no caching
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;