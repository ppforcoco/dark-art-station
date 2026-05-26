import type { NextConfig } from "next";

// ─── Trusted Origins (keep in sync with CSP connect-src) ───────────────────
const R2_CDN   = "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev";
const ASSETS   = "https://assets.hauntedwallpapers.com";
const GTM      = "https://www.googletagmanager.com";
const GA       = "https://www.google-analytics.com";
const GSTATIC  = "https://www.gstatic.com";
const CF_BEACON    = "https://static.cloudflareinsights.com";  // Cloudflare Web Analytics
const CF_INSIGHTS  = "https://cloudflareinsights.com";         // Cloudflare beacon endpoint

// ─── Content Security Policy ────────────────────────────────────────────────
//
// Rules:
//  • script-src  — 'self' + GTM/GA + 'unsafe-inline' (required by Next.js
//    inline scripts & GA consent snippet; remove once nonce strategy is added)
//  • style-src   — 'self' + 'unsafe-inline' (CSS-in-JS / style attrs used by
//    the theme and Header component)
//  • img-src     — self, data URIs (SVG cursors), R2 CDN, GA pixel
//  • connect-src — self + analytics endpoints + R2 CDN
//  • font-src    — Google Fonts CDN (Space Mono, Cinzel, Cormorant)
//  • frame-src   — 'self' (AdminHtmlBlock sandboxed iframe)
//  • object-src  — 'none'  ← blocks Flash / plugin abuse
//  • base-uri    — 'self'  ← prevents base-tag hijacking
//  • form-action — 'self'  ← prevents open redirect via form submit
//  • upgrade-insecure-requests — forces HTTP→HTTPS sub-resource loads
//
const CSP = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' ${GTM} ${GA} ${CF_BEACON}`,
  // Explicit script-src-elem so browsers don't fall back to script-src warning
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
  // ── Strict Transport Security (HSTS) ─────────────────────────────────────
  // 2-year max-age, include subdomains, preload-eligible
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // ── Content Security Policy ───────────────────────────────────────────────
  {
    key: "Content-Security-Policy",
    value: CSP,
  },
  // ── Trusted Types ─────────────────────────────────────────────────────────
  // Defines the 'hw-svg' policy used by Cursor.tsx for innerHTML SVG writes.
  // 'allow-duplicates' lets React's own internal policy also register.
  {
    key: "Require-Trusted-Types-For",
    value: "'script'",
  },
  {
    key: "Trusted-Types",
    value: "hw-svg dompurify default 'allow-duplicates'",
  },
  // ── Clickjacking / framing ────────────────────────────────────────────────
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // ── MIME sniffing ─────────────────────────────────────────────────────────
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // ── Referrer ─────────────────────────────────────────────────────────────
  {
    key: "Referrer-Policy",
    value: "no-referrer-when-downgrade",
  },
  // ── Permissions / Feature Policy ─────────────────────────────────────────
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "interest-cohort=()",   // opt out of FLoC/Topics API
      "payment=()",
      "usb=()",
    ].join(", "),
  },
  // ── Cross-Origin policies ─────────────────────────────────────────────────
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "cross-origin",   // allow R2/CDN images to load cross-origin
  },
];

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  output: "standalone",
  // ── PERF FIX: enable gzip/brotli compression for the Node.js server ──
  compress: true,
  // ── PERF FIX: experimental optimizations ──
  experimental: {
    // Optimize CSS — reduces render-blocking stylesheet size
    optimizeCss: true,
    // Optimize server-side packages (reduces cold start time)
    serverComponentsExternalPackages: ["@prisma/client"],
  },

  async headers() {
    return [
      // ── Apply security headers to every route ─────────────────────────
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // ── Static assets — long-lived cache + content type enforcement ───
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
      // ── Next.js image optimization — cache aggressively ───────────────
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
    // Cache optimized images for 30 days on the CDN / browser
    minimumCacheTTL: 2592000,
    // AVIF first — 50% smaller than WebP, dramatically reduces image payload
    formats: ["image/avif", "image/webp"],
    // ── PERF FIX: tighter device sizes — removes unnecessary breakpoints
    // that generate extra image variants. Mobile-first for iPhone pages.
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