import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,

  // ── Experimental: reduce JS sent to the browser ──────────────────────────
  experimental: {
    // Optimise package imports so only used icons/components are bundled
    optimizePackageImports: ["lucide-react"],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.hauntedwallpapers.com",
        port: "",
        pathname: "/**",
      },
      // ── Allow the R2 public URL used in hero images ───────────────────
      {
        protocol: "https",
        hostname: "pub-ba82ea76f3604402b8760527cc87149c.r2.dev",
        port: "",
        pathname: "/**",
      },
    ],
    // ✅ AVIF first — 40-50% smaller than WebP, supported by all modern browsers.
    // Next.js will serve AVIF to browsers that support it, WebP as fallback.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    // ── Fewer breakpoints = fewer image variants generated = faster builds
    // and less memory. 390 covers iPhone, 828 covers retina mobile,
    // 1280 covers desktop, 1920 covers large monitors.
    deviceSizes: [390, 640, 828, 1280, 1920],
    imageSizes:  [64, 128, 256, 384],
    // ── Limit concurrent image optimisations to avoid CPU spikes
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.hauntedwallpapers.com" }],
        destination: "https://hauntedwallpapers.com/:path*",
        permanent: true,
      },
      { source: "/free",   destination: "/", permanent: true },
      { source: "/ritual", destination: "/", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: "/robots.txt",
        headers: [
          { key: "Content-Type",  value: "text/plain; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
      {
        source: "/ads.txt",
        headers: [
          { key: "Content-Type",  value: "text/plain; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
      // ── Immutable cache for all static assets ─────────────────────────
      {
        source: "/:path*\\.(jpg|jpeg|png|webp|avif|gif|ico|svg|woff|woff2|ttf|otf|js|css)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // ── Security headers ──────────────────────────────────────────────
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options",        value: "SAMEORIGIN" },
          { key: "X-XSS-Protection",       value: "1; mode=block" },
          { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",     value: "camera=(), microphone=(), geolocation=()" },
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
  org:     "haunted-wallpapers",
  project: "javascript-nextjs",

  silent: !process.env.CI,
  sourcemaps: { disable: !process.env.CI },

  widenClientFileUpload: true,

  webpack: {
    automaticVercelMonitors: true,
    treeshake: { removeDebugLogging: true },
  },
});