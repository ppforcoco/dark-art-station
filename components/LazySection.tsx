"use client";

import { useEffect, useRef, ReactNode, CSSProperties } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// LazySection — ROG/horror scroll-reveal component
//
// HOW IT WORKS (desktop):
//   1. SSR renders: opacity:0 + initial transform (hidden, no layout shift)
//   2. IntersectionObserver fires when the section enters the viewport
//   3. CSS class added → transition runs (opacity + transform)
//   4. ROG red scan-line sweeps down after reveal
//
// LCP SAFETY:
//   - Hero sections: pass revealDelay={-1} to skip all animation (instant visible)
//   - Non-hero sections: IO fires only when element is genuinely in view
//   - minHeight is REMOVED from the reveal logic — no more false "already visible"
//
// MOBILE:
//   - All animations/transitions disabled (sections render visible immediately)
//   - No JS observer overhead on touch devices
// ─────────────────────────────────────────────────────────────────────────────

type Direction = "up" | "down" | "left" | "right" | "fade";

interface LazySectionProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  // Animation direction
  revealDirection?: Direction;
  // Delay in ms before reveal plays (after IO fires). Pass -1 to skip animation entirely.
  revealDelay?: number;
  // How far outside the viewport to start watching (negative = must be inside viewport)
  // Default: "0px 0px -80px 0px" means section must be 80px inside bottom of viewport
  rootMargin?: string;
  // For layout stability — only applied as min-height, NOT used in reveal logic
  minHeight?: string;
  // Stagger children with individual delays (adds data-hw-child to each direct child)
  staggerChildren?: boolean;
  staggerDelay?: number; // ms between each child, default 80
  // Unused legacy prop (kept for compatibility)
  skeletonVariant?: string;
}

// ── Initial hidden transforms ─────────────────────────────────────────────
const HIDDEN: Record<Direction, string> = {
  up:    "translateY(56px)",
  down:  "translateY(-40px)",
  left:  "translateX(72px)",
  right: "translateX(-72px)",
  fade:  "translateY(24px) scale(0.98)",
};

// ── CSS injected once into <head> ─────────────────────────────────────────
const STYLE_ID = "hw-ls-styles-v3";

function injectCSS() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    /* ── LazySection base ── */
    .hw-ls {
      will-change: opacity, transform;
      position: relative;
    }

    /* ── Revealed state — transition fires here ── */
    .hw-ls.hw-ls--on {
      opacity: 1 !important;
      transform: none !important;
      transition:
        opacity  0.72s cubic-bezier(0.16, 1, 0.3, 1),
        transform 0.72s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }

    /* ── ROG scan-line ── */
    .hw-ls.hw-ls--scan::after {
      content: '';
      display: block;
      position: absolute;
      left: -5%; right: -5%;
      top: -2px;
      height: 2px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(192,0,26,0) 8%,
        rgba(192,0,26,0.95) 38%,
        rgba(255,20,55,1) 50%,
        rgba(192,0,26,0.95) 62%,
        rgba(192,0,26,0) 92%,
        transparent 100%
      );
      box-shadow:
        0 0 10px 2px rgba(192,0,26,0.7),
        0 0 28px 6px rgba(192,0,26,0.25);
      pointer-events: none;
      z-index: 9999;
      animation: hw-ls-scan 0.9s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    .hw-ls.hw-ls--scan::before {
      content: '';
      display: block;
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(192,0,26,0.055) 0%, transparent 35%);
      pointer-events: none;
      z-index: 9998;
      animation: hw-ls-flash 0.9s ease-out forwards;
    }
    @keyframes hw-ls-scan {
      0%   { top: -2px;   opacity: 1; }
      88%  { opacity: 0.9; }
      100% { top: 102%;   opacity: 0; }
    }
    @keyframes hw-ls-flash {
      0%   { opacity: 1; }
      100% { opacity: 0; }
    }

    /* ── Staggered children ── */
    .hw-ls [data-hw-child] {
      opacity: 0;
      transform: translateY(32px);
      transition:
        opacity  0.55s cubic-bezier(0.16, 1, 0.3, 1),
        transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
      transition-delay: var(--hw-child-delay, 0ms);
    }
    .hw-ls.hw-ls--on [data-hw-child] {
      opacity: 1 !important;
      transform: none !important;
    }

    /* ── Mobile: everything instantly visible, no JS needed ── */
    @media (max-width: 767px) {
      .hw-ls {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
      }
      .hw-ls [data-hw-child] {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
      }
      .hw-ls.hw-ls--scan::after,
      .hw-ls.hw-ls--scan::before {
        display: none !important;
      }
    }

    /* ── Reduced motion: no animation anywhere ── */
    @media (prefers-reduced-motion: reduce) {
      .hw-ls {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
      }
      .hw-ls [data-hw-child] {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
      }
    }
  `;
  document.head.appendChild(s);
}

// ── Component ─────────────────────────────────────────────────────────────
export default function LazySection({
  children,
  className,
  style,
  revealDirection = "up",
  revealDelay = 0,
  rootMargin = "0px 0px -80px 0px",
  minHeight,
  staggerChildren = false,
  staggerDelay = 80,
  skeletonVariant: _unused,
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    injectCSS();

    const el = ref.current;
    if (!el) return;

    // ── Mobile / reduced motion: reveal immediately, no observer ──
    const isMobile  = window.matchMedia("(max-width: 767px)").matches;
    const noMotion  = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isMobile || noMotion || revealDelay === -1) {
      el.style.opacity   = "";
      el.style.transform = "";
      return;
    }

    // ── Stagger direct children if requested ──
    if (staggerChildren) {
      const kids = Array.from(el.querySelectorAll<HTMLElement>(":scope > *"));
      kids.forEach((kid, i) => {
        kid.setAttribute("data-hw-child", String(i));
        kid.style.setProperty("--hw-child-delay", `${i * staggerDelay}ms`);
      });
    }

    // ── Reveal function ──
    let revealed = false;
    function doReveal() {
      if (!el || revealed) return;
      revealed = true;

      // If delay requested, wait before adding class
      const run = () => {
        if (!el) return;
        // Clear inline hidden styles FIRST so transition has clean slate
        el.style.opacity   = "";
        el.style.transform = "";
        // Force a reflow so the transition sees the change
        void el.offsetHeight;
        // Add revealed class — CSS transition fires
        el.classList.add("hw-ls--on");

        // ROG scan-line: two rAFs after reveal starts
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el?.classList.add("hw-ls--scan");
            setTimeout(() => el?.classList.remove("hw-ls--scan"), 1000);
          });
        });
      };

      if (revealDelay > 0) {
        setTimeout(run, revealDelay);
      } else {
        run();
      }
    }

    // ── IntersectionObserver ──
    // KEY FIX: We do NOT check "alreadyVisible" here.
    // If a section is already in view on load, that's FINE — it should be visible.
    // Only sections BELOW the fold should animate in.
    // The rootMargin "-80px bottom" means the section must be 80px inside viewport.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          doReveal();
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0 }
    );
    io.observe(el);

    // Safety: if section never intersects (e.g. display:none parent), reveal after 4s
    const fallback = setTimeout(() => {
      if (!revealed) doReveal();
    }, 4000);

    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── SSR hidden state (inline — highest specificity, zero flash) ──
  // Only applied if JS will be running (skipped for -1 delay via the class)
  const hiddenStyle: CSSProperties = revealDelay === -1 ? {} : {
    opacity: 0,
    transform: HIDDEN[revealDirection],
    ...(minHeight ? { minHeight } : {}),
    ...style,
  };

  return (
    <div
      ref={ref}
      className={["hw-ls", className].filter(Boolean).join(" ")}
      data-reveal={revealDirection}
      style={revealDelay === -1 ? style : hiddenStyle}
    >
      {children}
    </div>
  );
}