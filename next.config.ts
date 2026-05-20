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
    // FIX: avif first — 40–50% smaller than webp; massive win on slow mobile connections
    // in NG/KE/MM/IN. Chrome Android 85+ (dominant in those markets) supports avif.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    // FIX: added 320 breakpoint — very common viewport on budget Android phones
    // in emerging markets. Without it Next.js serves 390px images to 320px screens.
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
      // FIX: manifest.json given long cache with must-revalidate so PWA installs
      // are fast on repeat visits (critical for Chrome Android on slow connections)
      {
        source: "/manifest.json",
        headers: [
          { key: "Content-Type",  value: "application/manifest+json" },
          { key: "Cache-Control", value: "public, max-age=86400, must-revalidate" },
        ],
      },
      // FIX: PWA icons cached aggressively — these never change, immutable is correct
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
      {
        source: "/(iphone|android|pc|all)(.*)",
        headers: [
          // FIX: increased stale-while-revalidate from 86400 → 604800 (7 days).
          // Users on slow connections get instant cached loads on return visits.
          { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
};

export default nextConfig;