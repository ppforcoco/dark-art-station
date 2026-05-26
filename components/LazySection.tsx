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

export default function LazySection({
  children,
  skeletonVariant = "default",
  minHeight = "400px",
  rootMargin = "200px 0px",
  className,
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  // ── KEY FIX ───────────────────────────────────────────────────────────────
  // Start as false on BOTH server and client so the initial HTML never contains
  // children — it only ever contains the skeleton placeholder.  This means:
  //   1. SSR/ISR HTML payload has NO <img> tags for below-fold sections.
  //   2. The browser pre-parser cannot find those images and won't fetch them.
  //   3. After hydration, IntersectionObserver fires when the section scrolls
  //      into view and only THEN mounts the real children + their images.
  // Without this, even though React swaps to skeleton after hydration, the SSR
  // HTML already contained <img> tags that the browser's preload scanner had
  // already queued — defeating lazy loading entirely.
  // ─────────────────────────────────────────────────────────────────────────
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // Step 1: after hydration, mark as mounted so the observer can attach.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Step 2: once mounted, watch for intersection.
  useEffect(() => {
    if (!mounted) return;
    const el = ref.current;
    if (!el) return;

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
  }, [mounted, rootMargin]);

  return (
    <>
      <style>{`
        @keyframes hw-skeleton-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>
      <div ref={ref} className={className}>
        {visible ? children : <Skeleton variant={skeletonVariant} minHeight={minHeight} />}
      </div>
    </>
  );
}