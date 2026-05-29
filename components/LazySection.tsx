"use client";

import { useEffect, useRef, ReactNode, CSSProperties } from "react";

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

// Initial hidden transforms — applied as inline styles so they exist from
// the very first SSR paint. No flash, no FOUC, no "appears then hides" bug.
const HIDDEN_TRANSFORMS: Record<string, string> = {
  up:    "translateY(48px)",
  down:  "translateY(-40px)",
  left:  "translateX(64px)",
  right:  "translateX(-64px)",
  fade:  "translateY(20px) scale(0.97)",
};

const STYLE_ID = "hw-lazy-reveal-styles";

function ensureCSS() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;

  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    /* ── LazySection: transition + revealed state only ── */
    /* Hidden state is set via inline styles on the element (SSR-safe).   */
    /* This block only handles the REVEALED transition and scan-line FX.  */

    div.hw-lazy-section {
      will-change: opacity, transform;
    }

    /* ── Revealed: clear inline hidden styles and transition in ── */
    div.hw-lazy-section.hw-revealed {
      opacity: 1 !important;
      transform: none !important;
      transition-property: opacity, transform !important;
      transition-duration: 0.75s !important;
      transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1) !important;
      transition-delay: 0s !important;
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

    /* ── Mobile & reduced-motion: wipe inline styles, no animation ── */
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

    if (isMobile || noMotion) {
      // Clear the inline hidden styles immediately — CSS media query also
      // handles this but clearing inline ensures no override fight.
      el.style.opacity = "";
      el.style.transform = "";
      return;
    }

    function doReveal() {
      if (!el) return;

      // Clear inline hidden styles, then add revealed class which
      // applies the transition. Order matters: clear first, add class second.
      el.style.opacity = "";
      el.style.transform = "";
      el.classList.add("hw-revealed");

      // ROG scan-line — starts a frame after reveal begins
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
    // Add a tighter margin — only consider "already visible" if truly on screen
    const alreadyVisible = rect.top < window.innerHeight - 40;

    if (alreadyVisible) {
      // Small delay so the browser has painted the hidden state before we reveal.
      // 80ms is enough for one paint; 200ms was causing a visible "flash then hide".
      setTimeout(schedule, 80);
    } else {
      let revealed = false;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            revealed = true;
            schedule();
            io.disconnect();
          }
        },
        { rootMargin, threshold: 0.05 }
      );
      io.observe(el);

      // Safety fallback: if still not revealed after 3s, force-reveal it.
      // Prevents sections staying invisible due to IO timing bugs.
      const fallback = setTimeout(() => {
        if (!revealed) {
          revealed = true;
          doReveal();
          io.disconnect();
        }
      }, 3000);

      return () => {
        io.disconnect();
        clearTimeout(fallback);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Inline hidden styles (SSR-safe) ──────────────────────────────────────
  // Set opacity:0 and the direction transform directly on the element from
  // the very first render (server + client). This means there is ZERO window
  // where the section is visible before JS hides it — the old bug where
  // ensureCSS() ran after paint and caused a flash is fully eliminated.
  const hiddenStyle: CSSProperties = {
    opacity: 0,
    transform: HIDDEN_TRANSFORMS[revealDirection] ?? "translateY(48px)",
    ...(minHeight !== "auto" ? { minHeight } : {}),
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