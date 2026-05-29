"use client";

import { useEffect, useRef, useState, ReactNode, useCallback } from "react";

type SkeletonVariant = "default" | "cards" | "wotd" | "tall" | "kits";

interface LazySectionProps {
  children: ReactNode;
  skeletonVariant?: SkeletonVariant;
  minHeight?: string;
  rootMargin?: string;
  className?: string;
  /**
   * ROG-style reveal direction.
   * "up"    — content rises from below (default, like ROG product pages)
   * "down"  — content drops from above
   * "left"  — content sweeps from left
   * "right" — content sweeps from right
   * "fade"  — pure opacity fade (subtler, for WOTD / kits)
   */
  revealDirection?: "up" | "down" | "left" | "right" | "fade";
  /**
   * Delay before the reveal starts once the section enters the viewport (ms).
   * Useful for staggering multiple adjacent sections.
   */
  revealDelay?: number;
}

/* ─── Global CSS — injected once ────────────────────────────────────────── */
const REVEAL_CSS = `
/* ── ROG-style section reveal ──────────────────────────────────────────── */
.hw-lazy-section {
  /* sections start invisible — no layout shift because min-height is set */
  opacity: 0;
  will-change: opacity, transform, clip-path;
  transition:
    opacity     0.75s cubic-bezier(0.22, 1, 0.36, 1),
    transform   0.75s cubic-bezier(0.22, 1, 0.36, 1),
    clip-path   0.75s cubic-bezier(0.22, 1, 0.36, 1);
}

/* ── Directional starting states ─────────────────────────────────────── */
.hw-lazy-section[data-reveal="up"] {
  transform: translateY(48px);
  clip-path: inset(0 0 100% 0);        /* hidden from bottom */
}
.hw-lazy-section[data-reveal="down"] {
  transform: translateY(-40px);
  clip-path: inset(100% 0 0 0);
}
.hw-lazy-section[data-reveal="left"] {
  transform: translateX(60px);
  clip-path: inset(0 0 0 100%);
}
.hw-lazy-section[data-reveal="right"] {
  transform: translateX(-60px);
  clip-path: inset(0 100% 0 0);
}
.hw-lazy-section[data-reveal="fade"] {
  transform: translateY(24px) scale(0.98);
}

/* ── Revealed state — all directions ──────────────────────────────────── */
.hw-lazy-section.hw-revealed {
  opacity: 1 !important;
  transform: none !important;
  clip-path: inset(0 0 0 0) !important;
}

/* ── Child stagger — every direct child animates in sequence ─────────── */
.hw-lazy-section.hw-revealed > * {
  animation: hw-child-rise 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.hw-lazy-section.hw-revealed > *:nth-child(1)  { animation-delay: 0.05s; }
.hw-lazy-section.hw-revealed > *:nth-child(2)  { animation-delay: 0.13s; }
.hw-lazy-section.hw-revealed > *:nth-child(3)  { animation-delay: 0.21s; }
.hw-lazy-section.hw-revealed > *:nth-child(4)  { animation-delay: 0.29s; }
.hw-lazy-section.hw-revealed > *:nth-child(5)  { animation-delay: 0.37s; }
.hw-lazy-section.hw-revealed > *:nth-child(n+6){ animation-delay: 0.43s; }

@keyframes hw-child-rise {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── ROG-style scan-line sweep on reveal — decorative edge effect ──────── */
.hw-lazy-section::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(224, 0, 31, 0.07) 48%,
    rgba(224, 0, 31, 0.04) 52%,
    transparent 100%
  );
  transform: translateY(-110%);
  transition: none;
  z-index: 1;
}
.hw-lazy-section.hw-revealed::after {
  animation: hw-scan-sweep 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.05s both;
}
@keyframes hw-scan-sweep {
  0%   { transform: translateY(-110%); opacity: 0.9; }
  100% { transform: translateY(110%);  opacity: 0;   }
}

/* ── Kill all motion on mobile (matches your existing rule) ───────────── */
@media (max-width: 767px) {
  .hw-lazy-section {
    /* Still reveal, but instantly — no janky animation on phones */
    transition-duration: 0.001ms !important;
    clip-path: none !important;
    transform: none !important;
  }
  .hw-lazy-section::after { display: none; }
  .hw-lazy-section.hw-revealed > * { animation-duration: 0.001ms !important; }
}

/* ── Respect prefers-reduced-motion ─────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .hw-lazy-section,
  .hw-lazy-section.hw-revealed > * {
    transition-duration: 0.001ms !important;
    animation-duration:  0.001ms !important;
    clip-path: none !important;
    transform: none !important;
  }
  .hw-lazy-section::after { display: none; }
}
`;

let cssInjected = false;
function ensureCSS() {
  if (cssInjected || typeof document === "undefined") return;
  const s = document.createElement("style");
  s.textContent = REVEAL_CSS;
  document.head.appendChild(s);
  cssInjected = true;
}

/* ─── LazySection ────────────────────────────────────────────────────────── */

export default function LazySection({
  children,
  skeletonVariant: _skeletonVariant,   // kept for API compat, no longer used
  minHeight = "400px",
  rootMargin = "0px 0px -80px 0px",   // trigger slightly before centre of viewport
  className,
  revealDirection = "up",
  revealDelay = 0,
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  const reveal = useCallback(() => {
    if (revealDelay > 0) {
      setTimeout(() => setRevealed(true), revealDelay);
    } else {
      setRevealed(true);
    }
  }, [revealDelay]);

  useEffect(() => {
    ensureCSS();

    const el = ref.current;
    if (!el) return;

    // Fast-path: if element is already in/very near viewport, reveal without
    // waiting for the observer (prevents invisible-forever on fast navigations).
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 60) {
      reveal();
      return;
    }

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
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={ref}
      className={classes}
      data-reveal={revealDirection}
      style={{
        minHeight,
        position: "relative",   // needed for ::after scan-sweep
      }}
    >
      {children}
    </div>
  );
}