import type { NextConfig } from "next";

// ─── Trusted Origins (keep in sync with CSP connect-src) ───────────────────
const R2_CDN       = "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev";
const ASSETS       = "https://assets.hauntedwallpapers.com";
const GTM          = "https://www.googletagmanager.com";
const GA           = "https://www.google-analytics.com";
const GSTATIC      = "https://www.gstatic.com";
const CF_BEACON    = "https://static.cloudflareinsights.com";
const CF_INSIGHTS  = "https://cloudflareinsights.com";

// ─── Content Security Policy ────────────────────────────────────────────────
const CSP = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' ${GTM} ${GA} ${CF_BEACON}`,
  `script-src-elem 'self' 'unsafe-inline' ${GTM} ${GA} ${CF_BEACON}`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' https://fonts.gstatic.com`,
  `img-src 'self' data: blob: ${R2_CDN} ${ASSETS} ${GA} https://www.google.com`,
  `connect-src 'self' ${R2_CDN} ${ASSETS} ${GTM} ${GA} ${GSTATIC} ${CF_BEACON} ${CF_INSIGHTS}`,
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
  // ── Trusted Types ─────────────────────────────────────────────────────────
  // 'goog#html' is REQUIRED by GTM/gtag. It is hard-coded in the GTM bundle
  // and must match the policy registered in layout.tsx's beforeInteractive
  // consent-and-tt-init script. Without it, GTM's innerHTML script injections
  // are blocked and gtag('config') aborts during validation.
  {
    key: "Require-Trusted-Types-For",
    value: "'script'",
  },
  {
    key: "Trusted-Types",
    // Added: goog#html  ← GTM/gtag policy (matches layout.tsx createPolicy call)
    value: "hw-svg dompurify default goog#html 'allow-duplicates'",
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
    value: "strict-origin-when-cross-origin",
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
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "cross-origin",
  },
];

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  output: "standalone",

  experimental: {
    // ── CSS chunk coalescing ────────────────────────────────────────────────
    // Next.js App Router splits CSS into per-route chunks and emits a
    // <link rel="preload" as="style"> for every chunk it knows about at build
    // time — including chunks that aren't used on the current page. This
    // produces the repeated browser warning:
    //   "preloaded using link preload but not used within a few seconds"
    //
    // Setting cssChunking: 'loose' tells Next.js to merge small CSS chunks
    // rather than creating a separate file per layout/page segment, which
    // dramatically reduces the number of preload hints and eliminates the
    // spurious warnings for chunks that aren't consumed on every route.
    cssChunking: "loose",
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // ── Static assets — long-lived cache + MIME enforcement ───────────
      {
        source: "/_next/static/css/:path*",
        headers: [
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
      // ── PWA manifest ─────────────────────────────────────────────────────
      // Next.js serves app/manifest.ts at /manifest.webmanifest.
      // Short cache so icon changes propagate quickly; still cached by CDN.
      {
        source: "/manifest.webmanifest",
        headers: [
          { key: "Content-Type",  value: "application/manifest+json" },
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400" },
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
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
};

export default nextConfig;