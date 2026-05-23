// next.config.ts
// Fixes CSS MIME type error: "Refused to apply style — MIME type ('text/plain')"
// Next.js builds CSS into /_next/static/css/ but some CDNs / reverse proxies
// serve those files with Content-Type: text/plain. Browsers block them (strict MIME).
// These headers force-correct the Content-Type on every response from Next.js itself.
// Note: if you're behind a CDN that strips/overrides headers (Cloudflare, Fastly),
// you must ALSO set the header rule there — Next.js headers only apply at origin.

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/_next/static/css/:path*",
        headers: [
          { key: "Content-Type", value: "text/css; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        source: "/_next/static/chunks/:path*",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        source: "/_next/static/media/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets.hauntedwallpapers.com" },
      { protocol: "https", hostname: "pub-ba82ea76f3604402b8760527cc87149c.r2.dev" },
    ],
  },

  compiler: {
    // Strips all console.log in production builds — silences any remaining
    // GTM/GA debug noise for real users. Keeps console.error and console.warn.
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
};

export default nextConfig;