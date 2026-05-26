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
        <div style={{ display: "flex", gap: "12px", padding: "0 16px", width: "100%", maxWidth: "1200px" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ flex: 1, aspectRatio: "9/16", maxHeight: "280px", background: "rgba(255,255,255,0.04)", borderRadius: "8px" }} />
          ))}
        </div>
      </div>
    );
  }
  if (variant === "wotd") {
    return (
      <div style={{ ...base, flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "clamp(100px,22vw,200px)", aspectRatio: "9/16", background: "rgba(255,255,255,0.04)", borderRadius: "16px" }} />
        <div style={{ width: "160px", height: "18px", background: "rgba(255,255,255,0.04)", borderRadius: "4px" }} />
      </div>
    );
  }
  if (variant === "tall") {
    return (
      <div style={{ ...base, minHeight: minHeight ?? "600px" }}>
        <div style={{ width: "90%", maxWidth: "1200px", height: "300px", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }} />
      </div>
    );
  }
  if (variant === "kits") {
    return (
      <div style={base}>
        <div style={{ display: "flex", gap: "12px", padding: "0 16px", width: "100%", maxWidth: "1200px" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ flex: 1, aspectRatio: "3/4", background: "rgba(255,255,255,0.04)", borderRadius: "4px" }} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div style={{ ...base, minHeight }}>
      <div style={{ width: "60%", height: "80px", background: "rgba(255,255,255,0.04)", borderRadius: "8px" }} />
    </div>
  );
}

export default function LazySection({
  children,
  skeletonVariant = "default",
  minHeight = "400px",
  rootMargin = "100px 0px",
  className,
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // ── STRICT: only mount when IntersectionObserver fires ──────────────────
    // Do NOT check getBoundingClientRect() at mount — that immediately mounts
    // all sections within 200px of fold, defeating the whole purpose.
    // IntersectionObserver with rootMargin handles "just below viewport" correctly.
    // ─────────────────────────────────────────────────────────────────────────
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      // rootMargin: start loading when section is 150px below the viewport edge.
      // This gives enough lead time for images to load before user sees them.
      { rootMargin: "150px 0px", threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  // Run once on mount only — rootMargin is intentionally not a dependency
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className={className} style={{ minHeight: visible ? undefined : minHeight }}>
      {visible ? children : <Skeleton variant={skeletonVariant} minHeight={minHeight} />}
    </div>
  );
}