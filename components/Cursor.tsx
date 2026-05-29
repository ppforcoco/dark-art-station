"use client";

import { useEffect, useRef } from "react";

// ── Step 1: Hide native cursor at module-eval time ───────────────────────────
// This runs when the JS chunk is first parsed — before React renders anything.
// It's the earliest possible JS execution point short of an inline <script> tag.
//
// BUT: if this component is inside a lazy-loaded chunk, the module may load
// after the first paint. The GUARANTEED fix is to also add this to globals.css:
//
//   html, body, * { cursor: none !important; }
//
// Keep BOTH — the CSS covers the gap before this JS chunk loads.
if (typeof document !== "undefined") {
  const existing = document.getElementById("hw-cursor-none");
  if (!existing) {
    const s = document.createElement("style");
    s.id = "hw-cursor-none";
    // Target html so it inherits to everything immediately
    s.textContent = "html { cursor: none !important; } * { cursor: none !important; }";
    // Insert as FIRST child of <head> so it's parsed immediately
    // (later stylesheets can't override an inline !important)
    const head = document.head || document.documentElement;
    head.insertBefore(s, head.firstChild);
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Cursor() {
  const dotRef   = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot   = dotRef.current;
    const trail = trailRef.current;
    if (!dot || !trail) return;

    // Touch / coarse devices: remove custom cursor, restore native
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

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Detect hoverable targets
      const target = e.target as Element | null;
      const nowPointer = !!target?.closest(
        'a, button, [role="button"], input, select, textarea, label, [tabindex]'
      );

      if (nowPointer !== isPointer) {
        isPointer = nowPointer;
        // Scale dot slightly on interactive elements
        dot.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(${isPointer ? 1.4 : 1})`;
        dot.style.background = isPointer
          ? "rgba(192,0,26,0.9)"
          : "rgba(255,255,255,0.95)";
        trail.style.borderColor = isPointer
          ? "rgba(192,0,26,0.6)"
          : "rgba(192,0,26,0.35)";
        trail.style.transform = `translate(${trailX}px, ${trailY}px) scale(${isPointer ? 1.5 : 1})`;
      } else {
        dot.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(${isPointer ? 1.4 : 1})`;
      }
    }

    function tick() {
      trailX += (mouseX - trailX) * 0.1;
      trailY += (mouseY - trailY) * 0.1;
      trail.style.transform = `translate(${trailX}px, ${trailY}px) scale(${isPointer ? 1.5 : 1})`;
      rafId = requestAnimationFrame(tick);
    }

    function onMouseLeave() {
      dot.style.opacity   = "0";
      trail.style.opacity = "0";
    }
    function onMouseEnter() {
      dot.style.opacity   = "1";
      trail.style.opacity = "1";
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
    };
  }, []);

  return (
    <>
      {/* Main dot — snaps to mouse instantly */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position:         "fixed",
          top:              0,
          left:             0,
          width:            "8px",
          height:           "8px",
          borderRadius:     "50%",
          background:       "rgba(255,255,255,0.95)",
          pointerEvents:    "none",
          zIndex:           99999,
          marginTop:        "-4px",
          marginLeft:       "-4px",
          willChange:       "transform",
          transform:        "translate(-400px,-400px)",
          transition:       "background 0.15s, transform 0.05s",
          boxShadow:        "0 0 6px rgba(192,0,26,0.5)",
        }}
      />

      {/* Trailing ring — lerps behind the dot */}
      <div
        ref={trailRef}
        aria-hidden="true"
        style={{
          position:         "fixed",
          top:              0,
          left:             0,
          width:            "28px",
          height:           "28px",
          borderRadius:     "50%",
          border:           "1.5px solid rgba(192,0,26,0.35)",
          pointerEvents:    "none",
          zIndex:           99998,
          marginTop:        "-14px",
          marginLeft:       "-14px",
          willChange:       "transform",
          transform:        "translate(-400px,-400px)",
          transition:       "border-color 0.2s, transform 0.05s, opacity 0.2s",
        }}
      />
    </>
  );
}