"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

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

/* ─── One-time CSS injected into <head> ─────────────────────────────────── */
const REVEAL_CSS = `
/* hw-lazy-section: transition-based reveal, immune to animation:none kills */

/* The transition timing — overrides the "* { transition-duration: 0.1s !important }"
   kill rule in globals.css because this selector has higher specificity */
.hw-lazy-section {
  transition-property: opacity, transform !important;
  transition-duration: 0.8s !important;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1) !important;
  transition-delay: 0s !important;
  position: relative;
  will-change: opacity, transform;
}

/* Revealed: clear the inline styles set by JS so transitions play */
.hw-lazy-section.hw-revealed {
  opacity: 1 !important;
  transform: none !important;
}

/* Scan-line sweep — purely decorative */
.hw-lazy-section::after {
  content: '';
  position: absolute;
  left: 0; right: 0; top: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(192,0,26,0.6), transparent);
  pointer-events: none;
  opacity: 0;
  z-index: 10;
  transition-property: top, opacity !important;
  transition-duration: 1s !important;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
  transition-delay: 0.15s !important;
}
.hw-lazy-section.hw-scanning::after {
  top: 100% !important;
  opacity: 0 !important;
}

/* Mobile: instant, no animation */
@media (max-width: 767px) {
  .hw-lazy-section {
    transition-duration: 0.001ms !important;
  }
  .hw-lazy-section::after { display: none !important; }
}

@media (prefers-reduced-motion: reduce) {
  .hw-lazy-section {
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
  document.head.appendChild(s);
  cssInjected = true;
}

/* Direction → initial transform value */
const TRANSFORMS: Record<string, string> = {
  up:    "translateY(52px)",
  down:  "translateY(-40px)",
  left:  "translateX(64px)",
  right: "translateX(-64px)",
  fade:  "translateY(24px) scale(0.985)",
};

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

  useEffect(() => {
    ensureCSS();

    const el = ref.current;
    if (!el) return;

    // isMobile check — instant reveal, skip animation
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isMobile || isReducedMotion) {
      // Remove inline styles immediately so content is visible
      el.style.opacity = "";
      el.style.transform = "";
      setRevealed(true);
      return;
    }

    const doReveal = () => {
      // Remove the inline opacity/transform — CSS transition takes over
      // from the current painted state (opacity:0, transform:X) to the
      // .hw-revealed state (opacity:1, transform:none)
      el.style.opacity = "";
      el.style.transform = "";
      setRevealed(true);

      // Trigger scan-line sweep
      setTimeout(() => {
        el.classList.add("hw-scanning");
        setTimeout(() => el.classList.remove("hw-scanning"), 1050);
      }, 150);
    };

    const scheduleReveal = () => {
      if (revealDelay > 0) {
        setTimeout(doReveal, revealDelay);
      } else {
        doReveal();
      }
    };

    const rect = el.getBoundingClientRect();
    const inViewport = rect.top < window.innerHeight + 80;

    if (inViewport) {
      // Small timeout — enough for the browser to paint the inline opacity:0
      // before we trigger the reveal transition. More reliable than rAF on fast machines.
      setTimeout(scheduleReveal, 60);
    } else {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            scheduleReveal();
            observer.disconnect();
          }
        },
        { rootMargin, threshold: 0.04 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const classes = [
    "hw-lazy-section",
    revealed ? "hw-revealed" : "",
    className ?? "",
  ].filter(Boolean).join(" ");

  // KEY: inline style sets the hidden state SYNCHRONOUSLY during SSR and
  // before hydration. This guarantees the browser paints opacity:0 first,
  // so when we remove these inline styles the CSS transition has a clear
  // starting point to animate from.
  const hiddenStyle = !revealed ? {
    opacity: 0,
    transform: TRANSFORMS[revealDirection] ?? TRANSFORMS.up,
  } : {};

  return (
    <div
      ref={ref}
      className={classes}
      data-reveal={revealDirection}
      style={{
        minHeight,
        position: "relative",
        ...hiddenStyle,
      }}
    >
      {children}
    </div>
  );
}