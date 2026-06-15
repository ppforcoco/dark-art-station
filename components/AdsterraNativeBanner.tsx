// components/AdsterraNativeBanner.tsx
"use client";

/**
 * Renders an Adsterra "Native Banner" ad unit.
 *
 * This format's script injects ad creatives directly into the page that
 * loads it, and pulls assets/tracking pixels from rotating third-party
 * domains that can't be whitelisted in a strict CSP.
 *
 * To keep the main site's CSP strict, the native banner is loaded inside an
 * iframe pointing at a static page (`public/ads/native.html`) that is served
 * with its own relaxed CSP scoped to `/ads/:path*` (see next.config.ts).
 *
 * Note: native banners are typically responsive and size themselves based on
 * the ad creatives Adsterra serves, so this iframe uses a generous fixed
 * height. Adjust `height` below if the ad appears cut off or has extra empty
 * space once live.
 */
export default function AdsterraNativeBanner({ className = "" }: { className?: string }) {
  return (
    <iframe
      title="Advertisement"
      src="/ads/native.html"
      loading="lazy"
      style={{
        border: "none",
        display: "block",
        width: "100%",
        height: "300px",
      }}
      className={`ad-native-banner ${className}`}
    />
  );
}