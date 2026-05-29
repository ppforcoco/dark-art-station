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
  up:    "translateY(48px)",
  down:  "translateY(-40px)",
  left:  "translateX(64px)",
  right: "translateX(-64px)",
  fade:  "translateY(20px) scale(0.97)",
};

const STYLE_ID = "hw-lazy-reveal-styles";

function ensureCSS() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;

  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    /* ── LazySection: hidden state via CSS class (NOT inline style) ── */
    /* This way .hw-revealed can override it without specificity issues  */

    div.hw-lazy-section {
      opacity: 0;
      will-change: opacity, transform;
    }

    /* Each direction's hidden transform */
    div.hw-lazy-section[data-reveal="up"]    { transform: translateY(48px); }
    div.hw-lazy-section[data-reveal="down"]  { transform: translateY(-40px); }
    div.hw-lazy-section[data-reveal="left"]  { transform: translateX(64px); }
    div.hw-lazy-section[data-reveal="right"] { transform: translateX(-64px); }
    div.hw-lazy-section[data-reveal="fade"]  { transform: translateY(20px) scale(0.97); }

    /* ── Revealed state ── */
    div.hw-lazy-section.hw-revealed {
      opacity: 1 !important;
      transform: none !important;
      transition-property: opacity, transform !important;
      transition-duration: 0.75s !important;
      transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1) !important;
      transition-delay: 0s !important;
    }

    /* ── ROG-style: clip wipe from left on reveal ── */
    div.hw-lazy-section.hw-rog-wipe {
      clip-path: inset(0 100% 0 0) !important;
      transition: none !important;
    }
    div.hw-lazy-section.hw-rog-wipe.hw-revealed {
      clip-path: inset(0 0% 0 0) !important;
      transition-property: opacity, transform, clip-path !important;
      transition-duration: 0.7s !important;
      transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1) !important;
    }

    /* ── ROG red scan-line sweep ── */
    div.hw-lazy-section { position: relative; overflow: hidden; }

    div.hw-lazy-section.hw-scanning::after {
      content: '' !important;
      display: block !important;
      position: absolute !important;
      left: -10% !important;
      right: -10% !important;
      top: 0 !important;
      height: 1.5px !important;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(192,0,26,0) 10%,
        rgba(192,0,26,0.9) 40%,
        rgba(255,30,60,1) 50%,
        rgba(192,0,26,0.9) 60%,
        rgba(192,0,26,0) 90%,
        transparent 100%
      ) !important;
      box-shadow: 0 0 8px 1px rgba(192,0,26,0.6), 0 0 20px 4px rgba(192,0,26,0.2) !important;
      pointer-events: none !important;
      z-index: 100 !important;
      animation: hw-rog-scan 0.85s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;
    }

    /* Second horizontal glitch bar */
    div.hw-lazy-section.hw-scanning::before {
      content: '' !important;
      display: block !important;
      position: absolute !important;
      left: 0 !important;
      right: 0 !important;
      top: 0 !important;
      height: 100% !important;
      background: linear-gradient(
        180deg,
        rgba(192,0,26,0.04) 0%,
        transparent 30%
      ) !important;
      pointer-events: none !important;
      z-index: 99 !important;
      animation: hw-rog-flash 0.85s ease-out forwards !important;
    }

    @keyframes hw-rog-scan {
      0%   { top: -2px; opacity: 1; }
      85%  { opacity: 1; }
      100% { top: 100%;  opacity: 0; }
    }

    @keyframes hw-rog-flash {
      0%   { opacity: 1; }
      100% { opacity: 0; }
    }

    /* ── Corner bracket accent (ROG-style) ── */
    div.hw-lazy-section.hw-revealed.hw-brackets::after {
      display: none !important; /* reset the scan-line pseudo when brackets active */
    }

    /* ── Mobile & reduced-motion: always visible, no animation ── */
    @media (max-width: 767px) {
      div.hw-lazy-section {
        opacity: 1 !important;
        transform: none !important;
        clip-path: none !important;
      }
      div.hw-lazy-section.hw-scanning::after,
      div.hw-lazy-section.hw-scanning::before {
        display: none !important;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      div.hw-lazy-section {
        opacity: 1 !important;
        transform: none !important;
        clip-path: none !important;
        transition: none !important;
      }
    }
  `;
  // Append last so it beats everything loaded before it
  document.head.appendChild(s);
}

export default function LazySection({
  children,
  skeletonVariant: _unused,
  minHeight = "auto",
  rootMargin = "0px 0px -60px 0px",
  className,
  revealDirection = "up",
  revealDelay = 0,
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureCSS();

    const el = ref.current;
    if (!el) return;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isMobile || noMotion) return;

    function doReveal() {
      if (!el) return;

      // 1. Transition to visible
      el.classList.add("hw-revealed");

      // 2. ROG scan-line — starts a frame after reveal begins
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.classList.add("hw-scanning");
          setTimeout(() => el?.classList.remove("hw-scanning"), 950);
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
      // Already in viewport on mount — delay one paint cycle so the
      // hidden CSS class is applied before we flip to revealed
      setTimeout(schedule, 200);
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

  return (
    <div
      ref={ref}
      className={["hw-lazy-section", className].filter(Boolean).join(" ")}
      data-reveal={revealDirection}
      // ✅ FIX: NO inline opacity/transform styles here.
      // Hidden state is driven purely by CSS class rules above,
      // so .hw-revealed can override them without specificity conflicts.
      style={{ minHeight: minHeight !== "auto" ? minHeight : undefined }}
    >
      {children}
    </div>
  );
}