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

let cssInjected = false;
function ensureCSS() {
  if (cssInjected || typeof document === "undefined") return;
  cssInjected = true;
  const s = document.createElement("style");
  s.id = "hw-lazy-styles";
  s.textContent = `
    .hw-lazy-section {
      /* Long duration — makes animation clearly visible */
      transition-property: opacity, transform !important;
      transition-duration: 0.9s !important;
      transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1) !important;
      transition-delay: 0s !important;
      position: relative;
    }
    .hw-lazy-section.hw-revealed {
      opacity: 1 !important;
      transform: none !important;
    }
    /* Red scan-line sweep */
    .hw-lazy-section::after {
      content: '';
      position: absolute;
      left: 0; right: 0; top: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(192,0,26,0.7), transparent);
      pointer-events: none;
      opacity: 0;
      z-index: 10;
      transition-property: top, opacity !important;
      transition-duration: 1.1s !important;
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
    }
  `;
  // Must be LAST in <head> to override everything including globals.css
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

    // Mobile / reduced-motion: reveal immediately, no animation
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isMobile || noMotion) {
      el.style.opacity = "";
      el.style.transform = "";
      return;
    }

    const doReveal = () => {
      // Remove the inline hidden styles → CSS transition kicks in
      el.style.opacity = "";
      el.style.transform = "";
      el.classList.add("hw-revealed");
      // Scan-line sweep
      setTimeout(() => {
        el.classList.add("hw-scanning");
        setTimeout(() => el.classList.remove("hw-scanning"), 1200);
      }, 200);
    };

    const schedule = () => {
      revealDelay > 0 ? setTimeout(doReveal, revealDelay) : doReveal();
    };

    const rect = el.getBoundingClientRect();

    if (rect.top < window.innerHeight + 80) {
      // Already in viewport: wait 150ms so browser paints opacity:0 first
      setTimeout(schedule, 150);
    } else {
      // Below fold: trigger on scroll
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

  // Inline styles set the hidden state in SSR HTML — guaranteed painted before JS runs
  const hidden = {
    opacity: 0 as unknown as string,
    transform: TRANSFORMS[revealDirection] ?? TRANSFORMS.up,
  };

  return (
    <div
      ref={ref}
      className={["hw-lazy-section", className].filter(Boolean).join(" ")}
      data-reveal={revealDirection}
      style={{ minHeight, position: "relative", ...hidden }}
    >
      {children}
    </div>
  );
}