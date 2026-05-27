import type { NextConfig } from "next";

// ─── Trusted Origins (keep in sync with CSP connect-src) ───────────────────
const R2_CDN   = "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev";
const ASSETS   = "https://assets.hauntedwallpapers.com";

// ─── Content Security Policy ────────────────────────────────────────────────
const CSP = [
  `default-src 'self'`,
  // Umami script loads from cloud.umami.is
  // Cloudflare Insights loads from static.cloudflareinsights.com
  `script-src 'self' 'unsafe-inline' https://cloud.umami.is https://static.cloudflareinsights.com`,
  `script-src-elem 'self' 'unsafe-inline' https://cloud.umami.is https://static.cloudflareinsights.com`,
  `style-src 'self' 'unsafe-inline'`,
  `font-src 'self' data:`,
  `img-src 'self' data: blob: ${R2_CDN} ${ASSETS}`,
  // Umami sends analytics data to api-gateway.umami.dev (different from cloud.umami.is)
  // Cloudflare Insights sends beacon to cloudflareinsights.com
  `connect-src 'self' ${R2_CDN} ${ASSETS} https://cloud.umami.is https://api-gateway.umami.dev https://cloudflareinsights.com`,
  `media-src 'self' ${R2_CDN} ${ASSETS}`,
  `frame-src 'self'`,
  `frame-ancestors 'none'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `upgrade-insecure-requests`,
].join("; ");

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: CSP,
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "no-referrer-when-downgrade",
  },
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "interest-cohort=()",
      "payment=()",
      "usb=()",
    ].join(", "),
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin-allow-popups",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "cross-origin",
  },
];

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  output: "standalone",
  compress: true,
  serverExternalPackages: ["@prisma/client"],

  experimental: {
    // Prevents Next.js from injecting <link rel="preload"> for CSS chunks.
    // Those preloads were firing but not consumed within the load event → console warnings.
    optimizeCss: false,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/_next/static/css/:path*",
        headers: [
          // Add X-Preload-Suppress to hint browser to skip preload for these CSS chunks
          // This combined with Link header removal stops the "preloaded not used" warnings
          { key: "Content-Type",           value: "text/css; charset=utf-8" },
          { key: "Cache-Control",          value: "public, max-age=31536000, immutable" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        source: "/_next/static/chunks/:path*",
        headers: [
          { key: "Content-Type",           value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control",          value: "public, max-age=31536000, immutable" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        source: "/_next/static/media/:path*",
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