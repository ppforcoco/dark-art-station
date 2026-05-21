import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,

  // ── Experimental: reduce JS sent to the browser ──────────────────────────
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.hauntedwallpapers.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-ba82ea76f3604402b8760527cc87149c.r2.dev",
        port: "",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    deviceSizes: [320, 390, 640, 828, 1280, 1920],
    imageSizes:  [64, 128, 256, 384],
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
      { source: "/terms",  destination: "/privacy", permanent: true },
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
      {
        source: "/manifest.json",
        headers: [
          { key: "Content-Type",  value: "application/manifest+json" },
          { key: "Cache-Control", value: "public, max-age=86400, must-revalidate" },
        ],
      },
      {
        source: "/:path*(icon-192|icon-512|apple-touch-icon).png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:path*\\.(jpg|jpeg|png|webp|avif|gif|ico|svg|woff|woff2|ttf|otf|js|css)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // ── Security + noai headers on every page ─────────────────────────────
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "X-Frame-Options",           value: "SAMEORIGIN" },
          { key: "X-XSS-Protection",          value: "1; mode=block" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-Robots-Tag",              value: "noai, noimageai" },
          // ── HSTS: tell browsers to always use HTTPS ──────────────────────
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          // ── COOP: required for Best Practices score ───────────────────────
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          // ── CSP: blocks XSS, allows GA/GTM/R2/AdSense ────────────────────
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://partner.googleadservices.com https://tpc.googlesyndication.com https://fundingchoicesmessages.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev https://assets.hauntedwallpapers.com https://www.google-analytics.com https://www.googletagmanager.com https://pagead2.googlesyndication.com",
              "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://pagead2.googlesyndication.com",
              "frame-src https://www.googletagmanager.com https://td.doubleclick.net https://fundingchoicesmessages.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
      {
        source: "/(iphone|android|pc|all)(.*)",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=604800" },
          // LCP hint: preconnect to R2 CDN
          { key: "Link", value: "<https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev>; rel=preconnect" },
        ],
      },
      {
        source: "/shop/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/obsessions(.*)",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
};

export default nextConfig;