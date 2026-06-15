// components/AdsterraBanner.tsx
"use client";

interface AdsterraBannerProps {
  /** The Adsterra "key" for this ad zone (from your Adsterra dashboard) */
  adKey: string;
  width: number;
  height: number;
  className?: string;
}

/**
 * Renders an Adsterra "Banner" ad unit (the `atOptions` + invoke.js snippets
 * from highperformanceformat.com).
 *
 * Adsterra's ad creatives are served from rotating, unpredictable third-party
 * domains (e.g. randomly-named "kettle..." / "fizzy..." domains) that change
 * frequently and cannot be whitelisted individually in a strict CSP.
 *
 * To keep the main site's CSP strict while still allowing Adsterra to work,
 * each banner is loaded via `src` (not `srcDoc`) pointing at a static page in
 * `public/ads/banner.html`, which is served with its own relaxed CSP (see
 * next.config.ts -> headers() -> source: "/ads/:path*"). This isolates all
 * Adsterra script execution, framing, and tracking requests to that one path,
 * without weakening the CSP for the rest of the site.
 */
export default function AdsterraBanner({ adKey, width, height, className = "" }: AdsterraBannerProps) {
  const src = `/ads/banner.html?key=${encodeURIComponent(adKey)}&width=${width}&height=${height}`;

  return (
    <iframe
      title="Advertisement"
      src={src}
      width={width}
      height={height}
      scrolling="no"
      loading="lazy"
      style={{
        border: "none",
        overflow: "hidden",
        display: "block",
        maxWidth: "100%",
        width: `${width}px`,
        height: `${height}px`,
      }}
      className={className}
    />
  );
}