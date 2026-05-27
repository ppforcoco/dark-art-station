"use client";
/**
 * ProgressiveGrid — renders children in batches as user scrolls.
 *
 * On mobile: shows first `initialCount` children immediately,
 * then reveals `batchSize` more each time the sentinel enters viewport.
 * On desktop: renders all children immediately (no delay).
 *
 * Usage:
 *   <ProgressiveGrid gridClassName="grid grid-cols-2 gap-3" initialCount={6} batchSize={6}>
 *     {images.map(img => <Card key={img.id} ... />)}
 *   </ProgressiveGrid>
 */

import { useCallback, useEffect, useRef, useState, Children, ReactNode } from "react";
import type { CSSProperties } from "react";

interface Props {
  children: ReactNode;
  gridClassName?: string;
  gridStyle?: CSSProperties;
  /** Cards to render immediately on mobile (default 6) */
  initialCount?: number;
  /** Cards to add per scroll batch on mobile (default 6) */
  batchSize?: number;
  /** Aspect ratio for skeleton cards e.g. "9/16" or "16/9" */
  skeletonAspect?: string;
}

function Sentinel({ onVisible }: { onVisible: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { onVisible(); obs.disconnect(); } },
      { rootMargin: "400px 0px", threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [onVisible]);
  return <div ref={ref} style={{ height: 1, gridColumn: "1 / -1", pointerEvents: "none" }} aria-hidden="true" />;
}

export default function ProgressiveGrid({
  children,
  gridClassName = "grid grid-cols-2 gap-3",
  gridStyle,
  initialCount = 6,
  batchSize = 6,
  skeletonAspect = "9/16",
}: Props) {
  const allChildren = Children.toArray(children);
  const total = allChildren.length;

  // Default to false (desktop) — SSR has no screen size, so we assume desktop.
  // The useEffect immediately corrects to true on actual mobile devices after hydration.
  // This ensures PC always renders all images on first paint without waiting for an effect.
  const [isMobile, setIsMobile] = useState(false);
  const [visibleCount, setVisibleCount] = useState(initialCount);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const h = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  const loadMore = useCallback(() => {
    setVisibleCount(c => Math.min(c + batchSize, total));
  }, [batchSize, total]);

  // SSR / desktop: render everything
  const renderCount = isMobile ? visibleCount : total;
  const visible = allChildren.slice(0, renderCount);
  const skeletonCount = isMobile ? Math.max(0, Math.min(batchSize, total - renderCount)) : 0;
  const hasMore = isMobile && renderCount < total;

  return (
    <div className={gridClassName} style={gridStyle}>
      {visible}

      {hasMore && (
        <>
          <Sentinel onVisible={loadMore} />
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div
              key={`skel-${i}`}
              style={{
                aspectRatio: skeletonAspect,
                borderRadius: 8,
                background: "#0e0d1a",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
              aria-hidden="true"
            />
          ))}
        </>
      )}
    </div>
  );
}