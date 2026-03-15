import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // ── MOBILE PERFORMANCE NOTE ────────────────────────────────────
    // unoptimized: true disables Next/Image srcset generation entirely.
    // All <Image> components load at their original full resolution on
    // every device — including mobile. The `sizes` props in page.tsx
    // and elsewhere have NO effect while this flag is true.
    //
    // Options:
    //   A) Remove this flag → Next.js generates srcset, serves
    //      device-appropriate sizes. Best for mobile performance.
    //      May incur Vercel image optimization costs.
    //
    //   B) Keep this flag → Add width/height variants to your R2
    //      CDN (e.g. via Cloudflare Images or R2 Transform) and
    //      build a custom loader that appends size params.
    //
    //   C) Keep as-is → acceptable if R2 images are already small
    //      (<200KB) and CDN edge caching is fast enough.
    // ──────────────────────────────────────────────────────────────
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.hauntedwallpapers.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;