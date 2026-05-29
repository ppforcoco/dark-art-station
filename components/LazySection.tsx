"use client";

import { useEffect, useRef, useState, ReactNode, useCallback } from "react";

type SkeletonVariant = "default" | "cards" | "wotd" | "tall" | "kits";

interface LazySectionProps {
  children: ReactNode;
  skeletonVariant?: SkeletonVariant;
  minHeight?: string;
  rootMargin?: string;
  className?: string;
  revealDirection?: "up" | "down" | "left" | "right" | "fade";
  revealDelay?: number;
}

/* ─── Global CSS — injected once ────────────────────────────────────────── */
const REVEAL_CSS = `
/* ── ROG-style section reveal — TRANSITION BASED (immune to animation:none kill) ── */

.hw-lazy-section {
  opacity: 0;
  will-change: opacity, transform;
  transition-property: opacity, transform;
  transition-duration: 0.75s;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: 0s;
}

/* ── Directional starting states ── */
.hw-lazy-section[data-reveal="up"]    { transform: translateY(48px); }
.hw-lazy-section[data-reveal="down"]  { transform: translateY(-40px); }
.hw-lazy-section[data-reveal="left"]  { transform: translateX(60px); }
.hw-lazy-section[data-reveal="right"] { transform: translateX(-60px); }
.hw-lazy-section[data-reveal="fade"]  { transform: translateY(20px) scale(0.99); }

/* ── Revealed state ── */
.hw-lazy-section.hw-revealed {
  opacity: 1 !important;
  transform: none !important;
}

/* ── CRITICAL: override the globals.css "* { transition-duration: 0.1s !important }" kill rule ── */
.hw-lazy-section,
.hw-lazy-section[data-reveal="up"],
.hw-lazy-section[data-reveal="down"],
.hw-lazy-section[data-reveal="left"],
.hw-lazy-section[data-reveal="right"],
.hw-lazy-section[data-reveal="fade"] {
  transition-duration: 0.75s !important;
}

/* ── Scan-line sweep on reveal ── */
.hw-lazy-section { position: relative; }
.hw-lazy-section::after {
  content: '';
  position: absolute;
  left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(192,0,26,0.5), transparent);
  top: 0;
  pointer-events: none;
  opacity: 0;
  z-index: 10;
  transition-property: top, opacity;
  transition-duration: 0.9s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.1s;
}
.hw-lazy-section.hw-scanning::after {
  top: 100% !important;
  opacity: 0 !important;
  transition-duration: 0.9s !important;
}

/* ── Mobile: instant, no effect ── */
@media (max-width: 767px) {
  .hw-lazy-section,
  .hw-lazy-section[data-reveal="up"],
  .hw-lazy-section[data-reveal="down"],
  .hw-lazy-section[data-reveal="left"],
  .hw-lazy-section[data-reveal="right"],
  .hw-lazy-section[data-reveal="fade"] {
    opacity: 1 !important;
    transform: none !important;
    transition-duration: 0.001ms !important;
  }
  .hw-lazy-section::after { display: none !important; }
}

/* ── Reduced motion: instant ── */
@media (prefers-reduced-motion: reduce) {
  .hw-lazy-section,
  .hw-lazy-section[data-reveal="up"],
  .hw-lazy-section[data-reveal="down"],
  .hw-lazy-section[data-reveal="left"],
  .hw-lazy-section[data-reveal="right"],
  .hw-lazy-section[data-reveal="fade"] {
    opacity: 1 !important;
    transform: none !important;
    transition-duration: 0.001ms !important;
  }
  .hw-lazy-section::after { display: none !important; }
}
`;

let cssInjected = false;
function ensureCSS() {
  if (cssInjected || typeof document === "undefined") return;
  const s = document.createElement("style");
  s.setAttribute("data-hw-lazy", "1");
  s.textContent = REVEAL_CSS;
  // Append LAST so it beats globals.css specificity
  document.head.appendChild(s);
  cssInjected = true;
}

/* ─── LazySection ────────────────────────────────────────────────────────── */
export default function LazySection({
  children,
  skeletonVariant: _unused,
  minHeight = "400px",
  rootMargin = "0px 0px -60px 0px",
  className,
  revealDirection = "up",
  revealDelay = 0,
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  const reveal = useCallback(() => {
    const doReveal = () => {
      setRevealed(true);
      // Trigger scan-line sweep
      const el = ref.current;
      if (!el) return;
      setTimeout(() => {
        el.classList.add("hw-scanning");
        setTimeout(() => el.classList.remove("hw-scanning"), 950);
      }, 120);
    };
    if (revealDelay > 0) {
      setTimeout(doReveal, revealDelay);
    } else {
      doReveal();
    }
  }, [revealDelay]);

  useEffect(() => {
    ensureCSS();

    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const inViewport = rect.top < window.innerHeight + 80;

    if (inViewport) {
      // THE KEY FIX: double-rAF ensures the browser paints opacity:0 FIRST,
      // then on the next frame we add hw-revealed and the transition plays.
      // Without this, React adds the class before the first paint and the
      // transition never fires — element just snaps to visible instantly.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          reveal();
        });
      });
      return;
    }

    // Below the fold: use IntersectionObserver
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.04 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, reveal]);

  const classes = [
    "hw-lazy-section",
    revealed ? "hw-revealed" : "",
    className ?? "",
  ].filter(Boolean).join(" ");

  return (
    <div
      ref={ref}
      className={classes}
      data-reveal={revealDirection}
      style={{ minHeight, position: "relative" }}
    >
      {children}
    </div>
  );
}