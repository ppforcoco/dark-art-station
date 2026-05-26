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

/* ── Shimmer — injected once into <head> ─────────────────────────────────── */
const SHIMMER_CSS = `
@keyframes hw-shimmer {
  0%   { background-position: -800px 0; }
  100% { background-position:  800px 0; }
}
.hw-sk {
  background: #0c0a18;
  background-image: linear-gradient(
    90deg,
    #0c0a18 0px,
    rgba(255,255,255,0.04) 200px,
    #0c0a18 400px
  );
  background-size: 800px 100%;
  animation: hw-shimmer 1.8s linear infinite;
  border-radius: 6px;
}
`;

let shimmerInjected = false;
function ensureShimmer() {
  if (shimmerInjected || typeof document === "undefined") return;
  const s = document.createElement("style");
  s.textContent = SHIMMER_CSS;
  document.head.appendChild(s);
  shimmerInjected = true;
}

/* ── Skeletons ───────────────────────────────────────────────────────────── */

function Skeleton({ variant, minHeight }: { variant: SkeletonVariant; minHeight: string }) {
  useEffect(() => { ensureShimmer(); }, []);

  const wrap: React.CSSProperties = {
    minHeight,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#07050f",
    overflow: "hidden",
    padding: "0 clamp(16px,5vw,72px)",
    boxSizing: "border-box" as const,
  };

  if (variant === "cards") return (
    <div style={wrap}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, width: "100%", maxWidth: 1200 }}>
        {[0,1,2].map(i => (
          <div key={i} className="hw-sk" style={{ aspectRatio: "9/16", maxHeight: 300, width: "100%" }} />
        ))}
      </div>
    </div>
  );

  if (variant === "wotd") return (
    <div style={{ ...wrap, flexDirection: "column", gap: 16 }}>
      <div className="hw-sk" style={{ width: "clamp(100px,22vw,200px)", aspectRatio: "9/16", borderRadius: 16 }} />
      <div className="hw-sk" style={{ width: 160, height: 18 }} />
    </div>
  );

  if (variant === "tall") return (
    <div style={wrap}>
      <div className="hw-sk" style={{ width: "100%", maxWidth: 1200, height: 320 }} />
    </div>
  );

  if (variant === "kits") return (
    <div style={wrap}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, width: "100%", maxWidth: 1200 }}>
        {[0,1,2].map(i => (
          <div key={i} className="hw-sk" style={{ aspectRatio: "3/4", width: "100%" }} />
        ))}
      </div>
    </div>
  );

  return (
    <div style={wrap}>
      <div className="hw-sk" style={{ width: "60%", height: 80 }} />
    </div>
  );
}

/* ── LazySection ─────────────────────────────────────────────────────────── */

export default function LazySection({
  children,
  skeletonVariant = "default",
  minHeight = "400px",
  rootMargin = "400px 0px",   // start loading 400px before it enters viewport
  className,
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Start as false — ALWAYS show skeleton first, let observer decide when to swap
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Do NOT do a getBoundingClientRect fast-path here.
    // That was the bug — it made every section within 400px of fold
    // mount immediately, which defeats progressive loading entirely.
    // Let the IntersectionObserver handle everything, including near-fold sections.
    // The 400px rootMargin gives enough lead time.

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        // Use the passed rootMargin prop — don't hardcode it
        rootMargin,
        threshold: 0,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  // rootMargin is a static prop, intentionally not a dep
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      // Keep minHeight on the wrapper at ALL times so the page has
      // the correct scroll height and the observer fires at the right moment.
      // Without this, sections collapse and everything loads at once.
      style={{ minHeight }}
    >
      {visible ? children : <Skeleton variant={skeletonVariant} minHeight={minHeight} />}
    </div>
  );
}