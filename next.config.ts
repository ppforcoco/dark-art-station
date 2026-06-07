import type { NextConfig } from "next";

// ─── Trusted Origins ─────────────────────────────────────────────────────────
const R2_CDN = "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev";
const ASSETS = "https://assets.hauntedwallpapers.com";

// ─── Content Security Policy ─────────────────────────────────────────────────
const CSP = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' https://cloud.umami.is https://static.cloudflareinsights.com https://pagead2.googlesyndication.com https://partner.googleadservices.com https://adservice.google.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://fundingchoicesmessages.google.com`,
  `script-src-elem 'self' 'unsafe-inline' https://cloud.umami.is https://static.cloudflareinsights.com https://pagead2.googlesyndication.com https://partner.googleadservices.com https://adservice.google.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://fundingchoicesmessages.google.com`,
  // No Google Fonts — app uses system fonts only (Arial/system-ui)
  `style-src 'self' 'unsafe-inline'`,
  `style-src-elem 'self' 'unsafe-inline'`,
  // No gstatic — no web fonts loaded
  `font-src 'self' data:`,
  `img-src 'self' data: blob: ${R2_CDN} ${ASSETS} https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.google.com https://www.gstatic.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google`,
  // Added https://csi.gstatic.com to fix Google Ads CSP console error
  `connect-src 'self' ${R2_CDN} ${ASSETS} https://cloud.umami.is https://gateway.umami.is https://api-gateway.umami.dev https://cloudflareinsights.com https://api.anthropic.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://adservice.google.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://fundingchoicesmessages.google.com https://csi.gstatic.com`,
  `media-src 'self' ${R2_CDN} ${ASSETS}`,
  `frame-src 'self' blob: https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://ep2.adtrafficquality.google https://www.google.com https://fundingchoicesmessages.google.com`,
  `worker-src 'self' blob:`,
  `frame-ancestors 'none'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `upgrade-insecure-requests`,
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer-when-downgrade" },
  {
    key: "Permissions-Policy",
    value: ["camera=()", "microphone=()", "geolocation=()", "interest-cohort=()", "payment=()", "usb=()"].join(", "),
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
];

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  output: "standalone",
  compress: true,
  serverExternalPackages: ["@prisma/client"],

  experimental: {},

  async redirects() {
    return [
      { source: "/shop", destination: "/collections", permanent: true },
      { source: "/shop?filter=free", destination: "/collections", permanent: true },
      { source: "/shop?category=:cat", destination: "/collections", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // Long-lived cache for hashed static assets
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/image",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
          { key: "Vary", value: "Accept" },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets.hauntedwallpapers.com" },
      { protocol: "https", hostname: "pub-ba82ea76f3604402b8760527cc87149c.r2.dev" },
    ],
    minimumCacheTTL: 2592000,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 828, 1080, 1920],
    imageSizes: [44, 48, 96, 256, 480],
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
};

export default nextConfig;