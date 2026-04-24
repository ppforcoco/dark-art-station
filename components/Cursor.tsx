"use client";
import { useEffect, useRef } from "react";

const DAGGER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="64" viewBox="0 0 32 64" fill="none">
  <!-- Blade -->
  <polygon points="16,0 20,44 16,50 12,44" fill="#c0001a" filter="url(#glow)"/>
  <!-- Blade edge highlight -->
  <polygon points="16,0 18,38 16,44" fill="#ff4455" opacity="0.6"/>
  <!-- Guard (crossguard) -->
  <rect x="4" y="44" width="24" height="5" rx="2" fill="#8b0010"/>
  <rect x="5" y="44.5" width="22" height="2" rx="1" fill="#c0001a" opacity="0.5"/>
  <!-- Grip -->
  <rect x="12" y="49" width="8" height="12" rx="2" fill="#6b0010"/>
  <!-- Grip wrapping lines -->
  <line x1="12" y1="52" x2="20" y2="52" stroke="#8b0010" stroke-width="1"/>
  <line x1="12" y1="55" x2="20" y2="55" stroke="#8b0010" stroke-width="1"/>
  <line x1="12" y1="58" x2="20" y2="58" stroke="#8b0010" stroke-width="1"/>
  <!-- Pommel -->
  <ellipse cx="16" cy="62" rx="5" ry="2.5" fill="#8b0010"/>
  <ellipse cx="16" cy="61.5" rx="4" ry="1.5" fill="#c0001a" opacity="0.4"/>
  <!-- Glow filter -->
  <defs>
    <filter id="glow" x="-40%" y="-10%" width="180%" height="120%">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
</svg>
`;

const DAGGER_SVG_HOVER = `
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="72" viewBox="0 0 32 64" fill="none">
  <polygon points="16,0 20,44 16,50 12,44" fill="#ff2233" filter="url(#glow2)"/>
  <polygon points="16,0 18,38 16,44" fill="#ff6677" opacity="0.7"/>
  <rect x="4" y="44" width="24" height="5" rx="2" fill="#cc0020"/>
  <rect x="5" y="44.5" width="22" height="2" rx="1" fill="#ff2233" opacity="0.5"/>
  <rect x="12" y="49" width="8" height="12" rx="2" fill="#8b0010"/>
  <line x1="12" y1="52" x2="20" y2="52" stroke="#aa0018" stroke-width="1"/>
  <line x1="12" y1="55" x2="20" y2="55" stroke="#aa0018" stroke-width="1"/>
  <line x1="12" y1="58" x2="20" y2="58" stroke="#aa0018" stroke-width="1"/>
  <ellipse cx="16" cy="62" rx="5" ry="2.5" fill="#aa0018"/>
  <ellipse cx="16" cy="61.5" rx="4" ry="1.5" fill="#ff2233" opacity="0.4"/>
  <defs>
    <filter id="glow2" x="-60%" y="-10%" width="220%" height="120%">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feColorMatrix in="blur" type="matrix"
        values="1 0 0 0 1   0 0 0 0 0   0 0 0 0 0   0 0 0 1 0" result="redBlur"/>
      <feMerge>
        <feMergeNode in="redBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
</svg>
`;

function svgToDataUrl(svg: string) {
  return `url("data:image/svg+xml;base64,${btoa(svg.trim())}")`;
}

export default function Cursor() {
  const daggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const dagger = daggerRef.current;
    if (!dagger) return;

    // cursor:none is in globals.css — no dynamic injection needed

    dagger.style.display = "block";

    let initialised = false;

    const onMove = (e: MouseEvent) => {
      if (!initialised) {
        initialised = true;
        dagger.style.transition = "none";
        dagger.style.transform = `translate(${e.clientX - 16}px, ${e.clientY}px) rotate(-45deg)`;
        dagger.style.opacity = "1";
        requestAnimationFrame(() => {
          dagger.style.transition = "";
        });
        return;
      }
      dagger.style.transform = `translate(${e.clientX - 16}px, ${e.clientY}px) rotate(-45deg)`;
    };

    const onOver = (e: MouseEvent) => {
      const isBtn = !!(e.target as Element)?.closest(
        "a,button,[data-hover],input,select,textarea,.hw2-obs-card,.cat-card,.mosaic-card,.coll-card,.product-card,.download-btn"
      );
      if (isBtn) {
        dagger.style.width  = "36px";
        dagger.style.height = "72px";
        dagger.innerHTML = DAGGER_SVG_HOVER;
        dagger.style.filter = "drop-shadow(0 0 6px rgba(255,34,51,0.9)) drop-shadow(0 0 14px rgba(192,0,26,0.5))";
        dagger.style.transform = dagger.style.transform.replace("rotate(-45deg)", "rotate(-30deg)");
      } else {
        dagger.style.width  = "32px";
        dagger.style.height = "64px";
        dagger.innerHTML = DAGGER_SVG;
        dagger.style.filter = "drop-shadow(0 0 4px rgba(192,0,26,0.7))";
      }
    };

    const onLeave = () => { dagger.style.opacity = "0"; };
    const onEnter = () => { dagger.style.opacity = "1"; };

    document.addEventListener("mousemove",  onMove,  { passive: true });
    document.addEventListener("mouseover",  onOver,  { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      document.removeEventListener("mousemove",  onMove);
      document.removeEventListener("mouseover",  onOver);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);

    };
  }, []);

  return (
    <div
      ref={daggerRef}
      dangerouslySetInnerHTML={{ __html: DAGGER_SVG }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "32px",
        height: "64px",
        pointerEvents: "none",
        zIndex: 9999,
        opacity: 0,
        display: "none",
        filter: "drop-shadow(0 0 4px rgba(192,0,26,0.7))",
        transition:
          "width 0.15s ease, height 0.15s ease, filter 0.15s, opacity 0.2s",
        willChange: "transform",
        transformOrigin: "top left",
      }}
    />
  );
}