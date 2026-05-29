"use client";

import { useEffect, useRef, ReactNode } from "react";

// kept for API compatibility with existing page.tsx usage
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
  up:    "translateY(52px)",
  down:  "translateY(-40px)",
  left:  "translateX(64px)",
  right: "translateX(-64px)",
  fade:  "translateY(24px) scale(0.985)",
};

// CSS injected once — only handles transition timing and revealed state.
// The hidden state (opacity:0, transform) is set as INLINE STYLE on the element,
// so it is guaranteed to be painted before any JS runs.
const REVEAL_CSS = `
.hw-lazy-section {
  /* transition-duration overrides the "* { transition-duration: 0.1s !important }"
     kill rule in globals.css — class selector wins over universal selector */
  transition-property: opacity, transform !important;
  transition-duration: 0.85s !important;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1) !important;
  transition-delay: 0s !important;
  position: relative;
}
.hw-lazy-section.hw-revealed {
  opacity: 1 !important;
  transform: none !important;
}
/* scan-line sweep */
.hw-lazy-section::after {
  content: '';
  position: absolute;
  left: 0; right: 0; top: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(192,0,26,0.65), transparent);
  pointer-events: none;
  opacity: 0;
  z-index: 10;
  transition-property: top, opacity !important;
  transition-duration: 1s !important;
  transition-timing-function: cubic-bezier(0.4,0,0.2,1) !important;
  transition-delay: 0.2s !important;
}
.hw-lazy-section.hw-scanning::after {
  top: 100% !important;
  opacity: 0 !important;
}
@media (max-width: 767px) {
  .hw-lazy-section {
    opacity: 1 !important;
    transform: none !important;
    transition-duration: 0.001ms !important;
  }
  .hw-lazy-section::after { display: none !important; }
}
@media (prefers-reduced-motion: reduce) {
  .hw-lazy-section {
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
  cssInjected = true;
  const s = document.createElement("style");
  s.setAttribute("data-hw-lazy", "1");
  s.textContent = REVEAL_CSS;
  document.head.appendChild(s); // last = highest cascade priority
}

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

  useEffect(() => {
    ensureCSS();

    const el = ref.current;
    if (!el) return;

    // Mobile / reduced-motion: remove inline hidden styles immediately, no animation
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isMobile || noMotion) {
      el.style.opacity = "";
      el.style.transform = "";
      return;
    }

    const doReveal = () => {
      // Remove the inline opacity/transform that were set in the JSX style prop.
      // This triggers the CSS transition from the painted hidden state → visible.
      // We do NOT use React setState — that would cause a re-render which the
      // browser may batch with layout, skipping the transition start frame.
      el.style.opacity = "";
      el.style.transform = "";
      el.classList.add("hw-revealed");

      // scan-line sweep
      setTimeout(() => {
        el.classList.add("hw-scanning");
        setTimeout(() => el.classList.remove("hw-scanning"), 1100);
      }, 180);
    };

    const schedule = () => {
      if (revealDelay > 0) {
        setTimeout(doReveal, revealDelay);
      } else {
        doReveal();
      }
    };

    const rect = el.getBoundingClientRect();
    const inViewport = rect.top < window.innerHeight + 80;

    if (inViewport) {
      // 100ms timeout: enough for browser to commit the first paint with
      // the inline opacity:0 style, so the transition has a real start state.
      // rAF alone is not enough on fast machines (2 rAFs ≈ 2ms, sub-paint).
      setTimeout(schedule, 100);
    } else {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            schedule();
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

  // INLINE STYLE is the key: opacity:0 + transform are set directly on the element
  // in the server-rendered HTML and stay until useEffect removes them.
  // This guarantees the browser paints the hidden state before JS reveals it.
  // No React state = no re-render = browser sees a real CSS transition.
  const initialHidden = {
    opacity: 0 as unknown as string,
    transform: TRANSFORMS[revealDirection] ?? TRANSFORMS.up,
  };

  return (
    <div
      ref={ref}
      className={["hw-lazy-section", className].filter(Boolean).join(" ")}
      data-reveal={revealDirection}
      style={{ minHeight, position: "relative", ...initialHidden }}
    >
      {children}
    </div>
  );
}