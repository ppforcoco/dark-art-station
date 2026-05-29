"use client";

import { useEffect, useRef, ReactNode } from "react";

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

const TRANSFORMS: Record<string, string> = {
  up:    "translateY(56px)",
  down:  "translateY(-40px)",
  left:  "translateX(64px)",
  right: "translateX(-64px)",
  fade:  "translateY(24px) scale(0.97)",
};

// Inject styles directly into a <style> tag with !important overrides.
// We use a unique ID so we only inject once per page load.
const STYLE_ID = "hw-lazy-reveal-styles";

function ensureCSS() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;

  const s = document.createElement("style");
  s.id = STYLE_ID;
  // These rules use maximum specificity tricks to override globals.css
  // which may set animation:none or transition-duration:0.1ms on *.
  s.textContent = `
    /* ── LazySection reveal — must beat globals.css ── */
    div.hw-lazy-section {
      will-change: opacity, transform;
    }
    /* Revealed state: plain transition, no shorthand so globals can't clobber */
    div.hw-lazy-section.hw-revealed {
      transition-property: opacity, transform !important;
      transition-duration: 0.85s !important;
      transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1) !important;
      transition-delay: 0s !important;
      opacity: 1 !important;
      transform: none !important;
    }

    /* Red scan-line sweep on reveal */
    div.hw-lazy-section.hw-scanning::after {
      content: '' !important;
      display: block !important;
      position: absolute !important;
      left: 0 !important; right: 0 !important;
      top: 0 !important;
      height: 2px !important;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(192,0,26,0.65),
        transparent
      ) !important;
      pointer-events: none !important;
      z-index: 10 !important;
      animation: hw-scan 1.1s cubic-bezier(0.4,0,0.2,1) forwards !important;
    }

    @keyframes hw-scan {
      from { top: 0;    opacity: 1; }
      to   { top: 100%; opacity: 0; }
    }

    /* Mobile & reduced-motion: never hide, never animate */
    @media (max-width: 767px) {
      div.hw-lazy-section {
        opacity: 1 !important;
        transform: none !important;
      }
      div.hw-lazy-section.hw-scanning::after {
        display: none !important;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      div.hw-lazy-section {
        opacity: 1 !important;
        transform: none !important;
      }
    }
  `;
  // Append LAST so specificity beats everything loaded before it
  document.head.appendChild(s);
}

export default function LazySection({
  children,
  skeletonVariant: _unused,
  minHeight = "400px",
  rootMargin = "0px 0px -80px 0px",
  className,
  revealDirection = "up",
  revealDelay = 0,
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureCSS();

    const el = ref.current;
    if (!el) return;

    // On mobile / reduced-motion the CSS already forces visible;
    // skip all JS logic so we don't fight the cascade.
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isMobile || noMotion) return;

    function doReveal() {
      if (!el) return;
      // 1. Add .hw-revealed — this drives the CSS transition to opacity:1 / transform:none
      el.classList.add("hw-revealed");

      // 2. Scan-line: add class a frame later so the transition has started
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.classList.add("hw-scanning");
          // Remove after animation completes so ::after pseudo vanishes
          setTimeout(() => el.classList.remove("hw-scanning"), 1200);
        });
      });
    }

    function schedule() {
      if (revealDelay > 0) {
        setTimeout(doReveal, revealDelay);
      } else {
        doReveal();
      }
    }

    const rect = el.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight + 80;

    if (alreadyVisible) {
      // Already in viewport on mount — wait one paint so browser renders
      // the hidden inline styles before we transition to visible.
      setTimeout(schedule, 180);
    } else {
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            schedule();
            io.disconnect();
          }
        },
        { rootMargin, threshold: 0.05 }
      );
      io.observe(el);
      return () => io.disconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Inline hidden state painted in SSR HTML — before any JS or CSS loads.
  // We only set the "from" state here; the "to" state is driven by CSS class.
  const hiddenStyle: React.CSSProperties = {
    opacity: 0,
    transform: TRANSFORMS[revealDirection] ?? TRANSFORMS.up,
    minHeight,
    position: "relative",
  };

  return (
    <div
      ref={ref}
      className={["hw-lazy-section", className].filter(Boolean).join(" ")}
      data-reveal={revealDirection}
      style={hiddenStyle}
    >
      {children}
    </div>
  );
}