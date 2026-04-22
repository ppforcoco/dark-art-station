import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ CRITICAL: Standalone output shrinks Docker image from ~2GB → ~200MB
  output: "standalone",

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
    formats: ["image/webp"],
    minimumCacheTTL: 31536000,
    deviceSizes: [390, 640, 768, 1024, 1280, 1920],
    imageSizes:  [64, 128, 256, 384, 512],
  },

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.hauntedwallpapers.com" }],
        destination: "https://hauntedwallpapers.com/:path*",
        permanent: true,
      },
      {
        source: "/free",
        destination: "/",
        permanent: true,
      },
      {
        source: "/ritual",
        destination: "/",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/ads.txt",
        headers: [
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
      {
        source: "/:path*\\.(jpg|jpeg|png|webp|avif|gif|ico|svg|woff|woff2|ttf|otf|js|css)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
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
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: "haunted-wallpapers",
  project: "javascript-nextjs",

  // ✅ Only upload source maps in CI — saves 2-5 min on local/Coolify builds
  silent: !process.env.CI,
  sourcemaps: {
    disable: !process.env.CI,
  },

  widenClientFileUpload: true,

  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});