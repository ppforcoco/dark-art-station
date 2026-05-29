"use client";

import { useEffect, useRef } from "react";

if (typeof document !== "undefined") {
  const existing = document.getElementById("hw-cursor-none");
  if (!existing) {
    const s = document.createElement("style");
    s.id = "hw-cursor-none";
    s.textContent = "html { cursor: none !important; } * { cursor: none !important; }";
    const head = document.head || document.documentElement;
    head.insertBefore(s, head.firstChild);
  }
}

// Dagger SVG cursor (pointing up-left, rotated to feel natural)
const DAGGER_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='40' viewBox='0 0 28 40'>
  <!-- blade -->
  <polygon points='14,2 17,28 14,32 11,28' fill='%23d0d0d8' stroke='%23888899' stroke-width='0.5'/>
  <!-- blade edge highlight -->
  <line x1='14' y1='3' x2='11.5' y2='27' stroke='%23ffffff' stroke-width='0.7' opacity='0.6'/>
  <!-- guard -->
  <rect x='7' y='28' width='14' height='3' rx='1' fill='%23c0001a' stroke='%238b0000' stroke-width='0.5'/>
  <!-- grip -->
  <rect x='11.5' y='31' width='5' height='7' rx='1' fill='%23a0001a' stroke='%23700010' stroke-width='0.5'/>
  <!-- pommel -->
  <ellipse cx='14' cy='38.5' rx='4' ry='2' fill='%23c0001a' stroke='%238b0000' stroke-width='0.5'/>
  <!-- blood drip -->
  <ellipse cx='14' cy='2.5' rx='1.2' ry='1.8' fill='%23c0001a' opacity='0.85'/>
</svg>`;

const DAGGER_URL = `url("data:image/svg+xml,${DAGGER_SVG}") 14 2, none`;

// Hand cursor SVG for links/buttons
const HAND_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='28' viewBox='0 0 24 28'>
  <path d='M8,22 L8,10 Q8,8 10,8 Q12,8 12,10 L12,9 Q12,7 14,7 Q16,7 16,9 L16,9.5 Q16,7.5 18,7.5 Q20,7.5 20,9.5 L20,16 Q20,22 14,24 L10,24 Q8,24 7,22 Z' fill='%23f0ecff' stroke='%23c0001a' stroke-width='1'/>
  <line x1='8' y1='15' x2='4' y2='13' stroke='%23f0ecff' stroke-width='1.5' stroke-linecap='round'/>
  <!-- index finger pointing -->
  <rect x='9.5' y='3' width='3' height='8' rx='1.5' fill='%23f0ecff' stroke='%23c0001a' stroke-width='1'/>
</svg>`;

const HAND_URL = `url("data:image/svg+xml,${HAND_SVG}") 11 3, pointer`;

export default function Cursor() {
  const dotRef   = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot   = dotRef.current;
    const trail = trailRef.current;
    if (!dot || !trail) return;

    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (isCoarse) {
      dot.style.display   = "none";
      trail.style.display = "none";
      const s = document.getElementById("hw-cursor-none");
      if (s) s.remove();
      return;
    }

    let mouseX = -400, mouseY = -400;
    let trailX = -400, trailY = -400;
    let rafId: number;
    let isPointer = false;

    // Inject the dagger cursor via CSS
    let daggerStyleEl = document.getElementById("hw-dagger-cursor") as HTMLStyleElement | null;
    if (!daggerStyleEl) {
      daggerStyleEl = document.createElement("style");
      daggerStyleEl.id = "hw-dagger-cursor";
      document.head.appendChild(daggerStyleEl);
    }
    daggerStyleEl.textContent = `
      @media (pointer: fine) {
        html, body, * { cursor: ${DAGGER_URL} !important; }
        a, button, [role="button"], input[type="submit"], input[type="button"],
        input[type="reset"], select, label[for], [tabindex], summary,
        .cursor-pointer {
          cursor: ${HAND_URL} !important;
        }
      }
    `;

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const target = e.target as Element | null;
      const nowPointer = !!target?.closest(
        'a, button, [role="button"], input[type="submit"], input[type="button"], select, label, [tabindex], summary'
      );

      if (nowPointer !== isPointer) {
        isPointer = nowPointer;
        dot!.style.background = isPointer
          ? "rgba(192,0,26,0.9)"
          : "rgba(255,255,255,0.95)";
        trail!.style.borderColor = isPointer
          ? "rgba(192,0,26,0.6)"
          : "rgba(192,0,26,0.35)";
        dot!.style.opacity   = isPointer ? "0" : "1";
        trail!.style.opacity = isPointer ? "0" : "0.6";
      }

      dot!.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(${isPointer ? 1.4 : 1})`;
    }

    function tick() {
      trailX += (mouseX - trailX) * 0.1;
      trailY += (mouseY - trailY) * 0.1;
      trail!.style.transform = `translate(${trailX}px, ${trailY}px) scale(${isPointer ? 1.5 : 1})`;
      rafId = requestAnimationFrame(tick);
    }

    function onMouseLeave() {
      dot!.style.opacity   = "0";
      trail!.style.opacity = "0";
    }
    function onMouseEnter() {
      dot!.style.opacity   = "1";
      trail!.style.opacity = isPointer ? "0" : "0.6";
    }

    window.addEventListener("mousemove",    onMouseMove,  { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove",    onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      cancelAnimationFrame(rafId);
      daggerStyleEl?.remove();
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position:      "fixed",
          top:           0,
          left:          0,
          width:         "8px",
          height:        "8px",
          borderRadius:  "50%",
          background:    "rgba(255,255,255,0.95)",
          pointerEvents: "none",
          zIndex:        99999,
          marginTop:     "-4px",
          marginLeft:    "-4px",
          willChange:    "transform",
          transform:     "translate(-400px,-400px)",
          transition:    "background 0.15s, opacity 0.2s",
          boxShadow:     "0 0 6px rgba(192,0,26,0.5)",
        }}
      />
      <div
        ref={trailRef}
        aria-hidden="true"
        style={{
          position:      "fixed",
          top:           0,
          left:          0,
          width:         "28px",
          height:        "28px",
          borderRadius:  "50%",
          border:        "1.5px solid rgba(192,0,26,0.35)",
          pointerEvents: "none",
          zIndex:        99998,
          marginTop:     "-14px",
          marginLeft:    "-14px",
          willChange:    "transform",
          transform:     "translate(-400px,-400px)",
          transition:    "border-color 0.2s, opacity 0.2s",
        }}
      />
    </>
  );
}