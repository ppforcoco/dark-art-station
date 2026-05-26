"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

type SkeletonVariant = "default" | "cards" | "wotd" | "tall" | "kits";

interface LazySectionProps {
  children: ReactNode;
  skeletonVariant?: SkeletonVariant;
  minHeight?: string;
  rootMargin?: string;
  className?: string;
}

function Skeleton({ variant, minHeight }: { variant: SkeletonVariant; minHeight: string }) {
  const base: React.CSSProperties = {
    minHeight,
    background: "#07050f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  if (variant === "cards") {
    return (
      <div style={base}>
        <div style={{ display: "flex", gap: "16px", padding: "0 24px", width: "100%", maxWidth: "1200px" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              flex: 1, aspectRatio: "9/16", maxHeight: "320px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "8px",
              animation: "hw-skeleton-pulse 1.6s ease-in-out infinite",
              animationDelay: `${i * 0.15}s`,
            }} />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "wotd") {
    return (
      <div style={{ ...base, flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "clamp(160px,22vw,280px)", aspectRatio: "9/16", background: "rgba(255,255,255,0.04)", borderRadius: "16px", animation: "hw-skeleton-pulse 1.6s ease-in-out infinite" }} />
        <div style={{ width: "200px", height: "20px", background: "rgba(255,255,255,0.04)", borderRadius: "4px", animation: "hw-skeleton-pulse 1.6s ease-in-out infinite" }} />
      </div>
    );
  }

  if (variant === "tall") {
    return (
      <div style={{ ...base, minHeight: minHeight ?? "600px" }}>
        <div style={{ width: "90%", maxWidth: "1200px", height: "400px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", animation: "hw-skeleton-pulse 1.6s ease-in-out infinite" }} />
      </div>
    );
  }

  if (variant === "kits") {
    return (
      <div style={base}>
        <div style={{ display: "flex", gap: "16px", padding: "0 24px", width: "100%", maxWidth: "1200px" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              flex: 1, aspectRatio: "3/4",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "4px",
              animation: "hw-skeleton-pulse 1.6s ease-in-out infinite",
              animationDelay: `${i * 0.15}s`,
            }} />
          ))}
        </div>
      </div>
    );
  }

  // default
  return (
    <div style={{ ...base, minHeight }}>
      <div style={{ width: "60%", height: "120px", background: "rgba(255,255,255,0.04)", borderRadius: "8px", animation: "hw-skeleton-pulse 1.6s ease-in-out infinite" }} />
    </div>
  );
}

/**
 * LazySectionInner — rendered ONLY when visible.
 *
 * This is a separate component so that when visible=false, React never
 * renders `children` at all — not even as a hidden subtree. This means
 * the browser's preload scanner never sees the <img> tags inside until
 * the section actually scrolls into view.
 *
 * Previously, children were rendered with a conditional style/display, which
 * still caused the browser to find and fetch images from the SSR HTML.
 */
function LazySectionInner({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export default function LazySection({
  children,
  skeletonVariant = "default",
  minHeight = "400px",
  rootMargin = "200px 0px",
  className,
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  // ── KEY FIX ───────────────────────────────────────────────────────────────
  // `visible` starts false. The wrapper div gets a ref. After hydration,
  // IntersectionObserver fires when the section is near the viewport and
  // only THEN mounts <LazySectionInner> (which contains children + their images).
  //
  // Because children are NEVER passed to React.render() until visible=true,
  // the browser's HTML preload scanner never sees their <img> tags in the
  // initial SSR payload — lazy loading is truly deferred.
  //
  // NOTE: `page.tsx` is a Server Component. When it renders:
  //   <LazySection><SomeSection /></LazySection>
  // Next.js serialises SomeSection's JSX as a React Server Component payload
  // (RSC wire format), not raw HTML. The client bundle receives this payload
  // and LazySection decides whether to mount it. The preload scanner only sees
  // the skeleton HTML — no <img> tags from below-fold sections.
  // ─────────────────────────────────────────────────────────────────────────
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If section is already in viewport on mount (e.g. very short pages),
    // reveal immediately without waiting for a scroll event.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <>
      <style>{`
        @keyframes hw-skeleton-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>
      <div ref={ref} className={className}>
        {visible
          ? <LazySectionInner>{children}</LazySectionInner>
          : <Skeleton variant={skeletonVariant} minHeight={minHeight} />
        }
      </div>
    </>
  );
}